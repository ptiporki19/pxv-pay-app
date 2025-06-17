

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."user_role" AS ENUM (
    'super_admin',
    'registered_user',
    'subscriber',
    'free_user'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."audit_log_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  old_data jsonb;
  new_data jsonb;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    old_data = to_jsonb(OLD);
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, old_data);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    old_data = to_jsonb(OLD);
    new_data = to_jsonb(NEW);
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_data, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, old_data, new_data);
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    new_data = to_jsonb(NEW);
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, new_data);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."audit_log_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_create_checkout_link"("user_id_param" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_limits_rec user_limits%ROWTYPE;
BEGIN
  SELECT * INTO user_limits_rec 
  FROM user_limits 
  WHERE user_id = user_id_param;
  
  -- If no limits record exists, allow (shouldn't happen but safe fallback)
  IF NOT FOUND THEN
    RETURN true;
  END IF;
  
  -- If max_checkout_links is NULL, unlimited (MVP behavior)
  IF user_limits_rec.max_checkout_links IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if under limit
  RETURN user_limits_rec.current_checkout_links < user_limits_rec.max_checkout_links;
END;
$$;


ALTER FUNCTION "public"."can_create_checkout_link"("user_id_param" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."can_create_checkout_link"("user_id_param" "uuid") IS 'Check if user can create new checkout link based on their limits';



CREATE OR REPLACE FUNCTION "public"."create_payment_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notifications (user_id, title, message, type, data)
    VALUES (
      NEW.user_id,
      CASE 
        WHEN NEW.status = 'completed' THEN 'Payment Completed'
        WHEN NEW.status = 'failed' THEN 'Payment Failed'
        WHEN NEW.status = 'refunded' THEN 'Payment Refunded'
        ELSE 'Payment Status Updated'
      END,
      CASE 
        WHEN NEW.status = 'completed' THEN 'Your payment of ' || NEW.amount || ' ' || NEW.currency || ' has been completed.'
        WHEN NEW.status = 'failed' THEN 'Your payment of ' || NEW.amount || ' ' || NEW.currency || ' has failed.'
        WHEN NEW.status = 'refunded' THEN 'Your payment of ' || NEW.amount || ' ' || NEW.currency || ' has been refunded.'
        ELSE 'Your payment status has been updated to ' || NEW.status || '.'
      END,
      CASE 
        WHEN NEW.status = 'completed' THEN 'success'
        WHEN NEW.status = 'failed' THEN 'error'
        WHEN NEW.status = 'refunded' THEN 'info'
        ELSE 'info'
      END,
      jsonb_build_object('payment_id', NEW.id, 'amount', NEW.amount, 'currency', NEW.currency, 'status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_payment_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_welcome_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, created_at)
  VALUES (
    NEW.id,
    'Welcome to PXV Pay!',
    'Your account has been created successfully. Start by exploring your dashboard.',
    'info',
    NOW()
  );
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_welcome_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'registered_user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."initialize_user_limits"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$ BEGIN INSERT INTO public.user_limits (user_id, user_role, max_checkout_links, max_monthly_payments, max_storage_mb, can_use_analytics, can_use_webhooks, can_customize_branding, can_export_data) VALUES (NEW.id, 'registered_user', NULL, NULL, NULL, true, true, true, true) ON CONFLICT (user_id) DO NOTHING; RETURN NEW; END; $$;


ALTER FUNCTION "public"."initialize_user_limits"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_blog_posts_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    
    -- Set published_at when published status changes to true
    IF NEW.published = true AND OLD.published = false THEN
        NEW.published_at = now();
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_blog_posts_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_checkout_links_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment count
    UPDATE user_limits 
    SET current_checkout_links = current_checkout_links + 1,
        updated_at = NOW()
    WHERE user_id = NEW.merchant_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement count
    UPDATE user_limits 
    SET current_checkout_links = GREATEST(current_checkout_links - 1, 0),
        updated_at = NOW()
    WHERE user_id = OLD.merchant_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_checkout_links_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_checkout_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_checkout_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_theme_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_theme_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid",
    "old_data" "jsonb",
    "new_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blog_posts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "content" "text" NOT NULL,
    "excerpt" "text",
    "featured_image" "text",
    "published" boolean DEFAULT false NOT NULL,
    "author_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "published_at" timestamp with time zone,
    "meta_title" "text",
    "meta_description" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL
);


ALTER TABLE "public"."blog_posts" OWNER TO "postgres";


COMMENT ON TABLE "public"."blog_posts" IS 'Stores blog posts and website content';



COMMENT ON COLUMN "public"."blog_posts"."slug" IS 'URL-friendly identifier for the blog post';



COMMENT ON COLUMN "public"."blog_posts"."published" IS 'Whether the blog post is visible to the public';



COMMENT ON COLUMN "public"."blog_posts"."tags" IS 'Array of tags for categorization';



CREATE TABLE IF NOT EXISTS "public"."checkout_links" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "merchant_id" "uuid" NOT NULL,
    "slug" "text" NOT NULL,
    "link_name" "text" NOT NULL,
    "active_country_codes" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "logo_url" "text",
    "checkout_page_heading" "text",
    "payment_review_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" DEFAULT ''::"text" NOT NULL,
    "amount" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    CONSTRAINT "checkout_links_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'expired'::"text", 'draft'::"text"])))
);


ALTER TABLE "public"."checkout_links" OWNER TO "postgres";


COMMENT ON TABLE "public"."checkout_links" IS 'Merchant-specific checkout links with customization options';



COMMENT ON COLUMN "public"."checkout_links"."slug" IS 'Unique URL slug for the checkout link (auto-generated for MVP)';



COMMENT ON COLUMN "public"."checkout_links"."active_country_codes" IS 'Array of country codes enabled for this checkout link';



COMMENT ON COLUMN "public"."checkout_links"."logo_url" IS 'Override logo URL for this specific checkout link';



COMMENT ON COLUMN "public"."checkout_links"."title" IS 'Display title for the checkout link';



COMMENT ON COLUMN "public"."checkout_links"."amount" IS 'Fixed amount for this checkout link in the specified currency';



COMMENT ON COLUMN "public"."checkout_links"."currency" IS 'Currency code (USD, EUR, etc.)';



COMMENT ON COLUMN "public"."checkout_links"."status" IS 'Current status of the checkout link (active, inactive, expired, draft)';



CREATE TABLE IF NOT EXISTS "public"."content_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "template_key" "text" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "content_type" "text" DEFAULT 'text'::"text",
    "category" "text" DEFAULT 'general'::"text",
    "language" "text" DEFAULT 'en'::"text",
    "variables" "jsonb" DEFAULT '{}'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "version" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."content_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."countries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "status" "text" DEFAULT 'inactive'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "currency_id" "uuid"
);


ALTER TABLE "public"."countries" OWNER TO "postgres";


COMMENT ON TABLE "public"."countries" IS 'Countries table - global code constraint removed to allow multi-tenancy';



CREATE TABLE IF NOT EXISTS "public"."currencies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "symbol" "text" NOT NULL,
    "status" "text" DEFAULT 'inactive'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid"
);


ALTER TABLE "public"."currencies" OWNER TO "postgres";


COMMENT ON TABLE "public"."currencies" IS 'Currencies table - global code constraint removed to allow multi-tenancy';



CREATE TABLE IF NOT EXISTS "public"."merchant_checkout_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "merchant_id" "uuid" NOT NULL,
    "default_logo_url" "text",
    "default_checkout_page_heading" "text" DEFAULT 'Complete Your Payment'::"text",
    "default_manual_payment_instructions" "text" DEFAULT 'Please follow the payment instructions below and upload your proof of payment.'::"text",
    "default_payment_review_message" "text" DEFAULT 'Thank you for your payment! Your transaction is under review and you will receive an email notification once it has been processed.'::"text",
    "payment_approved_email_subject" "text" DEFAULT 'Payment Approved - Transaction Confirmed'::"text",
    "payment_approved_email_body" "text" DEFAULT 'Your payment has been approved and processed successfully. Thank you for your business!'::"text",
    "payment_rejected_email_subject" "text" DEFAULT 'Payment Rejected - Action Required'::"text",
    "payment_rejected_email_body" "text" DEFAULT 'Unfortunately, your payment could not be verified. Please contact us for assistance.'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."merchant_checkout_settings" OWNER TO "postgres";


COMMENT ON TABLE "public"."merchant_checkout_settings" IS 'Default checkout customization settings per merchant';



COMMENT ON COLUMN "public"."merchant_checkout_settings"."default_logo_url" IS 'Default logo URL used across all merchant checkout links';



CREATE TABLE IF NOT EXISTS "public"."merchants" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "website" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "owner_id" "uuid",
    "logo_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."merchants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "type" "text" DEFAULT 'info'::"text" NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_methods" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "countries" "text"[] NOT NULL,
    "status" "text" DEFAULT 'inactive'::"text" NOT NULL,
    "icon" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "instructions" "text",
    "url" "text",
    "user_id" "uuid",
    "instructions_for_checkout" "text",
    "display_order" integer DEFAULT 0,
    "custom_fields" "jsonb" DEFAULT '[]'::"jsonb",
    CONSTRAINT "payment_methods_url_required_for_links" CHECK (((("type" = 'payment-link'::"text") AND ("url" IS NOT NULL)) OR ("type" <> 'payment-link'::"text")))
);


ALTER TABLE "public"."payment_methods" OWNER TO "postgres";


COMMENT ON TABLE "public"."payment_methods" IS 'Stores payment methods configuration';



COMMENT ON COLUMN "public"."payment_methods"."type" IS 'Payment method type: bank, mobile, crypto, payment-link';



COMMENT ON COLUMN "public"."payment_methods"."instructions_for_checkout" IS 'Special instructions displayed during checkout';



COMMENT ON COLUMN "public"."payment_methods"."display_order" IS 'Order in which payment methods appear in checkout';



COMMENT ON COLUMN "public"."payment_methods"."custom_fields" IS 'JSONB array of custom fields for manual payment methods';



CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "merchant_id" "uuid",
    "amount" numeric(10,2) NOT NULL,
    "currency" "text" NOT NULL,
    "payment_method" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "country" "text",
    "description" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "customer_name" "text",
    "customer_email" "text",
    "payment_proof_url" "text",
    "checkout_link_id" "uuid",
    "status_update_notes" "text",
    "verification_date" timestamp with time zone,
    "verified_by" "uuid"
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


COMMENT ON COLUMN "public"."payments"."customer_name" IS 'Customer name from checkout form';



COMMENT ON COLUMN "public"."payments"."customer_email" IS 'Customer email for notifications';



COMMENT ON COLUMN "public"."payments"."payment_proof_url" IS 'URL to uploaded payment proof file';



COMMENT ON COLUMN "public"."payments"."checkout_link_id" IS 'Reference to the checkout link used for this payment';



COMMENT ON COLUMN "public"."payments"."status_update_notes" IS 'Notes added when payment status is updated';



COMMENT ON COLUMN "public"."payments"."verification_date" IS 'Date when payment was verified by merchant';



COMMENT ON COLUMN "public"."payments"."verified_by" IS 'User ID of who verified the payment';



CREATE TABLE IF NOT EXISTS "public"."theme_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "theme_id" "uuid",
    "setting_key" "text" NOT NULL,
    "setting_value" "text",
    "setting_type" "text" DEFAULT 'string'::"text",
    "description" "text",
    "is_advanced" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."theme_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."themes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "primary_color" "text" DEFAULT '#3b82f6'::"text",
    "secondary_color" "text" DEFAULT '#64748b'::"text",
    "accent_color" "text" DEFAULT '#06b6d4'::"text",
    "background_color" "text" DEFAULT '#ffffff'::"text",
    "text_color" "text" DEFAULT '#0f172a'::"text",
    "border_color" "text" DEFAULT '#e2e8f0'::"text",
    "success_color" "text" DEFAULT '#22c55e'::"text",
    "warning_color" "text" DEFAULT '#f59e0b'::"text",
    "error_color" "text" DEFAULT '#ef4444'::"text",
    "font_family" "text" DEFAULT 'Inter'::"text",
    "border_radius" "text" DEFAULT 'medium'::"text",
    "logo_url" "text",
    "favicon_url" "text",
    "custom_css" "text",
    "is_active" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."themes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_limits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "user_role" "text" DEFAULT 'registered_user'::"text" NOT NULL,
    "max_checkout_links" integer,
    "current_checkout_links" integer DEFAULT 0,
    "max_monthly_payments" integer,
    "current_monthly_payments" integer DEFAULT 0,
    "max_storage_mb" integer,
    "current_storage_mb" integer DEFAULT 0,
    "can_use_analytics" boolean DEFAULT true,
    "can_use_webhooks" boolean DEFAULT true,
    "can_customize_branding" boolean DEFAULT true,
    "can_export_data" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_limits_user_role_check" CHECK (("user_role" = ANY (ARRAY['super_admin'::"text", 'registered_user'::"text", 'subscriber'::"text", 'free_user'::"text"])))
);


ALTER TABLE "public"."user_limits" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_limits" IS 'User limits and restrictions system - inactive for MVP, ready for post-MVP activation';



COMMENT ON COLUMN "public"."user_limits"."max_checkout_links" IS 'Maximum checkout links allowed (NULL = unlimited, used in MVP)';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "role" "public"."user_role" DEFAULT 'registered_user'::"public"."user_role" NOT NULL,
    "active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'RLS disabled to fix infinite recursion - application handles security at API level';



CREATE OR REPLACE VIEW "public"."user_limits_summary" AS
 SELECT "ul"."id",
    "ul"."user_id",
    "ul"."user_role",
    "ul"."max_checkout_links",
    "ul"."current_checkout_links",
    "ul"."max_monthly_payments",
    "ul"."current_monthly_payments",
    "ul"."max_storage_mb",
    "ul"."current_storage_mb",
    "ul"."can_use_analytics",
    "ul"."can_use_webhooks",
    "ul"."can_customize_branding",
    "ul"."can_export_data",
    "ul"."created_at",
    "ul"."updated_at",
    "u"."email",
    "u"."role" AS "actual_user_role",
        CASE
            WHEN ("ul"."max_checkout_links" IS NULL) THEN 'Unlimited'::"text"
            ELSE (("ul"."current_checkout_links" || '/'::"text") || "ul"."max_checkout_links")
        END AS "checkout_links_usage",
        CASE
            WHEN ("ul"."max_checkout_links" IS NULL) THEN true
            ELSE ("ul"."current_checkout_links" < "ul"."max_checkout_links")
        END AS "can_create_more_links"
   FROM ("public"."user_limits" "ul"
     JOIN "public"."users" "u" ON (("u"."id" = "ul"."user_id")));


ALTER TABLE "public"."user_limits_summary" OWNER TO "postgres";


ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."checkout_links"
    ADD CONSTRAINT "checkout_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."checkout_links"
    ADD CONSTRAINT "checkout_links_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."content_templates"
    ADD CONSTRAINT "content_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_templates"
    ADD CONSTRAINT "content_templates_user_id_template_key_key" UNIQUE ("user_id", "template_key");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."currencies"
    ADD CONSTRAINT "currencies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."merchant_checkout_settings"
    ADD CONSTRAINT "merchant_checkout_settings_merchant_id_key" UNIQUE ("merchant_id");



ALTER TABLE ONLY "public"."merchant_checkout_settings"
    ADD CONSTRAINT "merchant_checkout_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."merchants"
    ADD CONSTRAINT "merchants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."theme_settings"
    ADD CONSTRAINT "theme_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."theme_settings"
    ADD CONSTRAINT "theme_settings_user_id_theme_id_setting_key_key" UNIQUE ("user_id", "theme_id", "setting_key");



ALTER TABLE ONLY "public"."themes"
    ADD CONSTRAINT "themes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."themes"
    ADD CONSTRAINT "themes_user_id_name_key" UNIQUE ("user_id", "name");



ALTER TABLE ONLY "public"."user_limits"
    ADD CONSTRAINT "user_limits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_limits"
    ADD CONSTRAINT "user_limits_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "checkout_links_is_active_idx" ON "public"."checkout_links" USING "btree" ("is_active");



CREATE INDEX "checkout_links_merchant_id_idx" ON "public"."checkout_links" USING "btree" ("merchant_id");



CREATE INDEX "checkout_links_slug_idx" ON "public"."checkout_links" USING "btree" ("slug");



CREATE INDEX "content_templates_user_category_idx" ON "public"."content_templates" USING "btree" ("user_id", "category");



CREATE INDEX "content_templates_user_id_idx" ON "public"."content_templates" USING "btree" ("user_id");



CREATE INDEX "content_templates_user_key_idx" ON "public"."content_templates" USING "btree" ("user_id", "template_key");



CREATE INDEX "countries_code_idx" ON "public"."countries" USING "btree" ("code");



CREATE INDEX "countries_currency_id_idx" ON "public"."countries" USING "btree" ("currency_id");



CREATE INDEX "countries_user_id_idx" ON "public"."countries" USING "btree" ("user_id");



CREATE INDEX "currencies_code_idx" ON "public"."currencies" USING "btree" ("code");



CREATE INDEX "currencies_user_id_idx" ON "public"."currencies" USING "btree" ("user_id");



CREATE INDEX "idx_blog_posts_author" ON "public"."blog_posts" USING "btree" ("author_id");



CREATE INDEX "idx_blog_posts_published" ON "public"."blog_posts" USING "btree" ("published", "published_at" DESC);



CREATE INDEX "idx_blog_posts_slug" ON "public"."blog_posts" USING "btree" ("slug");



CREATE INDEX "idx_checkout_links_merchant_status" ON "public"."checkout_links" USING "btree" ("merchant_id", "status");



CREATE INDEX "idx_checkout_links_status" ON "public"."checkout_links" USING "btree" ("status");



CREATE INDEX "idx_user_limits_role" ON "public"."user_limits" USING "btree" ("user_role");



CREATE INDEX "idx_user_limits_user_id" ON "public"."user_limits" USING "btree" ("user_id");



CREATE INDEX "merchant_checkout_settings_merchant_id_idx" ON "public"."merchant_checkout_settings" USING "btree" ("merchant_id");



CREATE INDEX "payment_methods_display_order_idx" ON "public"."payment_methods" USING "btree" ("display_order");



CREATE INDEX "payment_methods_type_idx" ON "public"."payment_methods" USING "btree" ("type");



CREATE INDEX "payment_methods_user_id_idx" ON "public"."payment_methods" USING "btree" ("user_id");



CREATE INDEX "payments_checkout_link_id_idx" ON "public"."payments" USING "btree" ("checkout_link_id");



CREATE INDEX "payments_customer_email_idx" ON "public"."payments" USING "btree" ("customer_email");



CREATE INDEX "payments_verification_date_idx" ON "public"."payments" USING "btree" ("verification_date");



CREATE INDEX "theme_settings_theme_id_idx" ON "public"."theme_settings" USING "btree" ("theme_id");



CREATE INDEX "theme_settings_user_id_idx" ON "public"."theme_settings" USING "btree" ("user_id");



CREATE INDEX "themes_user_active_idx" ON "public"."themes" USING "btree" ("user_id", "is_active");



CREATE INDEX "themes_user_id_idx" ON "public"."themes" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "blog_posts_updated_at_trigger" BEFORE UPDATE ON "public"."blog_posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_blog_posts_updated_at"();



CREATE OR REPLACE TRIGGER "checkout_links_update_timestamp" BEFORE UPDATE ON "public"."checkout_links" FOR EACH ROW EXECUTE FUNCTION "public"."update_checkout_timestamp"();



CREATE OR REPLACE TRIGGER "countries_update_timestamp" BEFORE UPDATE ON "public"."countries" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "create_welcome_notification_trigger" AFTER INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."create_welcome_notification"();



CREATE OR REPLACE TRIGGER "currencies_update_timestamp" BEFORE UPDATE ON "public"."currencies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "merchant_checkout_settings_update_timestamp" BEFORE UPDATE ON "public"."merchant_checkout_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_checkout_timestamp"();



CREATE OR REPLACE TRIGGER "merchants_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."merchants" FOR EACH ROW EXECUTE FUNCTION "public"."audit_log_changes"();



CREATE OR REPLACE TRIGGER "merchants_update_timestamp" BEFORE UPDATE ON "public"."merchants" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "payment_methods_update_timestamp" BEFORE UPDATE ON "public"."payment_methods" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "payment_status_changed" AFTER UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."create_payment_notification"();



CREATE OR REPLACE TRIGGER "payments_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."audit_log_changes"();



CREATE OR REPLACE TRIGGER "payments_update_timestamp" BEFORE UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "update_checkout_links_count_trigger" AFTER INSERT OR DELETE ON "public"."checkout_links" FOR EACH ROW EXECUTE FUNCTION "public"."update_checkout_links_count"();



CREATE OR REPLACE TRIGGER "update_content_templates_updated_at" BEFORE UPDATE ON "public"."content_templates" FOR EACH ROW EXECUTE FUNCTION "public"."update_theme_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_theme_settings_updated_at" BEFORE UPDATE ON "public"."theme_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_theme_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_themes_updated_at" BEFORE UPDATE ON "public"."themes" FOR EACH ROW EXECUTE FUNCTION "public"."update_theme_updated_at_column"();



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."checkout_links"
    ADD CONSTRAINT "checkout_links_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."content_templates"
    ADD CONSTRAINT "content_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."currencies"
    ADD CONSTRAINT "currencies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."merchant_checkout_settings"
    ADD CONSTRAINT "merchant_checkout_settings_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."merchants"
    ADD CONSTRAINT "merchants_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_checkout_link_id_fkey" FOREIGN KEY ("checkout_link_id") REFERENCES "public"."checkout_links"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."theme_settings"
    ADD CONSTRAINT "theme_settings_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."theme_settings"
    ADD CONSTRAINT "theme_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."themes"
    ADD CONSTRAINT "themes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_limits"
    ADD CONSTRAINT "user_limits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Authors can create blog posts" ON "public"."blog_posts" FOR INSERT TO "authenticated" WITH CHECK (("author_id" = "auth"."uid"()));



CREATE POLICY "Authors can update own blog posts" ON "public"."blog_posts" FOR UPDATE TO "authenticated" USING (("author_id" = "auth"."uid"())) WITH CHECK (("author_id" = "auth"."uid"()));



CREATE POLICY "Authors can view own blog posts" ON "public"."blog_posts" FOR SELECT TO "authenticated" USING (("author_id" = "auth"."uid"()));



CREATE POLICY "Enable delete access for users to their own notifications" ON "public"."notifications" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable insert access for authenticated users" ON "public"."notifications" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable read access for users to their own notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable update access for users to their own notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Everyone can view merchants" ON "public"."merchants" FOR SELECT USING (true);



CREATE POLICY "Merchants can create their own checkout links" ON "public"."checkout_links" FOR INSERT WITH CHECK (("auth"."uid"() = "merchant_id"));



CREATE POLICY "Merchants can delete their own checkout links" ON "public"."checkout_links" FOR DELETE USING (("auth"."uid"() = "merchant_id"));



CREATE POLICY "Merchants can manage their own checkout settings" ON "public"."merchant_checkout_settings" USING (("auth"."uid"() = "merchant_id"));



CREATE POLICY "Merchants can update their own checkout links" ON "public"."checkout_links" FOR UPDATE USING (("auth"."uid"() = "merchant_id"));



CREATE POLICY "Merchants can view their own checkout links" ON "public"."checkout_links" FOR SELECT USING (("auth"."uid"() = "merchant_id"));



CREATE POLICY "Public can create payments" ON "public"."payments" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public can read active checkout links" ON "public"."checkout_links" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public can read active payment methods" ON "public"."payment_methods" FOR SELECT USING (("status" = 'active'::"text"));



CREATE POLICY "Public can read countries" ON "public"."countries" FOR SELECT USING (true);



CREATE POLICY "Public can read currencies" ON "public"."currencies" FOR SELECT USING (true);



CREATE POLICY "Public can read merchant checkout settings" ON "public"."merchant_checkout_settings" FOR SELECT USING (true);



CREATE POLICY "Public can view published blog posts" ON "public"."blog_posts" FOR SELECT TO "authenticated", "anon" USING (("published" = true));



CREATE POLICY "Super admins can manage all blog posts" ON "public"."blog_posts" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'super_admin'::"public"."user_role")))));



CREATE POLICY "Super admins can update all limits" ON "public"."user_limits" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'super_admin'::"public"."user_role")))));



CREATE POLICY "Super admins can view all limits" ON "public"."user_limits" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'super_admin'::"public"."user_role")))));



CREATE POLICY "System can create audit logs" ON "public"."audit_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can create notifications" ON "public"."notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert limits" ON "public"."user_limits" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can create their own countries" ON "public"."countries" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own currencies" ON "public"."currencies" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own payment methods" ON "public"."payment_methods" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own payments" ON "public"."payments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own countries" ON "public"."countries" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own currencies" ON "public"."currencies" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own payment methods" ON "public"."payment_methods" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert payments" ON "public"."payments" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Users can update their own countries" ON "public"."countries" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own currencies" ON "public"."currencies" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own payment methods" ON "public"."payment_methods" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own limits" ON "public"."user_limits" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view payments" ON "public"."payments" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view their own countries" ON "public"."countries" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own currencies" ON "public"."currencies" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own payment methods" ON "public"."payment_methods" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own payments" ON "public"."payments" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "admin_payment_methods_policy" ON "public"."payment_methods" TO "authenticated" USING (true);



ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blog_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."checkout_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_templates" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "content_templates_delete_own" ON "public"."content_templates" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "content_templates_insert_own" ON "public"."content_templates" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "content_templates_select_own" ON "public"."content_templates" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "content_templates_update_own" ON "public"."content_templates" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."countries" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "countries_delete_own" ON "public"."countries" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "countries_insert_own" ON "public"."countries" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "countries_select_own" ON "public"."countries" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "countries_update_own" ON "public"."countries" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."currencies" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "currencies_delete_own" ON "public"."currencies" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "currencies_insert_own" ON "public"."currencies" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "currencies_select_own" ON "public"."currencies" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "currencies_update_own" ON "public"."currencies" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."merchant_checkout_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."merchants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notifications_insert_all" ON "public"."notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "notifications_select_own" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "notifications_update_own" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."payment_methods" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "payment_methods_delete_own" ON "public"."payment_methods" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "payment_methods_insert_own" ON "public"."payment_methods" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "payment_methods_select_own" ON "public"."payment_methods" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "payment_methods_update_own" ON "public"."payment_methods" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "payments_insert_own" ON "public"."payments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "payments_select_all" ON "public"."payments" FOR SELECT USING (true);



CREATE POLICY "payments_update_all" ON "public"."payments" FOR UPDATE USING (true);



CREATE POLICY "super_admin_manage_all_countries" ON "public"."countries" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'super_admin'::"public"."user_role")))));



CREATE POLICY "super_admin_manage_all_currencies" ON "public"."currencies" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'super_admin'::"public"."user_role")))));



CREATE POLICY "super_admin_manage_all_payment_methods" ON "public"."payment_methods" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'super_admin'::"public"."user_role")))));



CREATE POLICY "super_admin_manage_all_payments" ON "public"."payments" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'super_admin'::"public"."user_role")))));



CREATE POLICY "super_admin_view_all_countries" ON "public"."countries" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'super_admin'::"public"."user_role")))));



CREATE POLICY "super_admin_view_all_currencies" ON "public"."currencies" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'super_admin'::"public"."user_role")))));



CREATE POLICY "super_admin_view_all_payment_methods" ON "public"."payment_methods" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'super_admin'::"public"."user_role")))));



CREATE POLICY "super_admin_view_all_payments" ON "public"."payments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'super_admin'::"public"."user_role")))));



COMMENT ON POLICY "super_admin_view_all_payments" ON "public"."payments" IS 'Allows super admins to view all payments for user management';



ALTER TABLE "public"."theme_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "theme_settings_delete_own" ON "public"."theme_settings" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "theme_settings_insert_own" ON "public"."theme_settings" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "theme_settings_select_own" ON "public"."theme_settings" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "theme_settings_update_own" ON "public"."theme_settings" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."themes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "themes_delete_own" ON "public"."themes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "themes_insert_own" ON "public"."themes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "themes_select_own" ON "public"."themes" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "themes_update_own" ON "public"."themes" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."user_limits" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_insert_policy" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "users_select_policy" ON "public"."users" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "id") OR ("auth"."email"() = ANY (ARRAY['admin@pxvpay.com'::"text", 'dev-admin@pxvpay.com'::"text", 'superadmin@pxvpay.com'::"text"]))));



CREATE POLICY "users_update_policy" ON "public"."users" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "id") OR ("auth"."email"() = ANY (ARRAY['admin@pxvpay.com'::"text", 'dev-admin@pxvpay.com'::"text", 'superadmin@pxvpay.com'::"text"])))) WITH CHECK ((("auth"."uid"() = "id") OR ("auth"."email"() = ANY (ARRAY['admin@pxvpay.com'::"text", 'dev-admin@pxvpay.com'::"text", 'superadmin@pxvpay.com'::"text"]))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."audit_logs";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."checkout_links";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."countries";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."currencies";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."merchant_checkout_settings";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."merchants";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notifications";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."payment_methods";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."payments";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

















































































































































































GRANT ALL ON FUNCTION "public"."audit_log_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."audit_log_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_log_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."can_create_checkout_link"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_create_checkout_link"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_create_checkout_link"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_payment_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_payment_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_payment_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_welcome_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_welcome_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_welcome_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."initialize_user_limits"() TO "anon";
GRANT ALL ON FUNCTION "public"."initialize_user_limits"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."initialize_user_limits"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_blog_posts_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_blog_posts_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_blog_posts_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_checkout_links_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_checkout_links_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_checkout_links_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_checkout_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_checkout_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_checkout_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_theme_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_theme_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_theme_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."blog_posts" TO "anon";
GRANT ALL ON TABLE "public"."blog_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_posts" TO "service_role";



GRANT ALL ON TABLE "public"."checkout_links" TO "anon";
GRANT ALL ON TABLE "public"."checkout_links" TO "authenticated";
GRANT ALL ON TABLE "public"."checkout_links" TO "service_role";



GRANT ALL ON TABLE "public"."content_templates" TO "anon";
GRANT ALL ON TABLE "public"."content_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."content_templates" TO "service_role";



GRANT ALL ON TABLE "public"."countries" TO "anon";
GRANT ALL ON TABLE "public"."countries" TO "authenticated";
GRANT ALL ON TABLE "public"."countries" TO "service_role";



GRANT ALL ON TABLE "public"."currencies" TO "anon";
GRANT ALL ON TABLE "public"."currencies" TO "authenticated";
GRANT ALL ON TABLE "public"."currencies" TO "service_role";



GRANT ALL ON TABLE "public"."merchant_checkout_settings" TO "anon";
GRANT ALL ON TABLE "public"."merchant_checkout_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."merchant_checkout_settings" TO "service_role";



GRANT ALL ON TABLE "public"."merchants" TO "anon";
GRANT ALL ON TABLE "public"."merchants" TO "authenticated";
GRANT ALL ON TABLE "public"."merchants" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."payment_methods" TO "anon";
GRANT ALL ON TABLE "public"."payment_methods" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_methods" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."theme_settings" TO "anon";
GRANT ALL ON TABLE "public"."theme_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."theme_settings" TO "service_role";



GRANT ALL ON TABLE "public"."themes" TO "anon";
GRANT ALL ON TABLE "public"."themes" TO "authenticated";
GRANT ALL ON TABLE "public"."themes" TO "service_role";



GRANT ALL ON TABLE "public"."user_limits" TO "anon";
GRANT ALL ON TABLE "public"."user_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."user_limits" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."user_limits_summary" TO "anon";
GRANT ALL ON TABLE "public"."user_limits_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."user_limits_summary" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
