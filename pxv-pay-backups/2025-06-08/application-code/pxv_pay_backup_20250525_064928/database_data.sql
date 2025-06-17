SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

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

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '1b33cb76-ef59-4fed-9a96-05975d633302', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin@pxvpay.com","user_id":"91f17bac-f046-4f18-ab83-4461f7d7dd45","user_phone":""}}', '2025-05-25 13:34:43.567215+00', ''),
	('00000000-0000-0000-0000-000000000000', '05f34102-aa50-42d9-ab29-bb6abb61f845', '{"action":"login","actor_id":"91f17bac-f046-4f18-ab83-4461f7d7dd45","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-25 13:35:34.105075+00', ''),
	('00000000-0000-0000-0000-000000000000', '06166486-a645-489c-be0e-63566d0322cb', '{"action":"logout","actor_id":"91f17bac-f046-4f18-ab83-4461f7d7dd45","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account"}', '2025-05-25 13:35:34.208425+00', ''),
	('00000000-0000-0000-0000-000000000000', '12557ec0-8250-4fbd-ac70-81766eb3cb13', '{"action":"login","actor_id":"91f17bac-f046-4f18-ab83-4461f7d7dd45","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-25 13:37:16.226024+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '91f17bac-f046-4f18-ab83-4461f7d7dd45', 'authenticated', 'authenticated', 'admin@pxvpay.com', '$2a$10$INInyhsbbgbrFJ.Jaq9qCeQ9EXSve0Eh9RS/EsyvryNNr338942/u', '2025-05-25 13:34:43.572952+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-05-25 13:37:16.228666+00', '{"provider": "email", "providers": ["email"]}', '{"role": "super_admin", "email_verified": true}', NULL, '2025-05-25 13:34:43.520968+00', '2025-05-25 13:37:16.23973+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('91f17bac-f046-4f18-ab83-4461f7d7dd45', '91f17bac-f046-4f18-ab83-4461f7d7dd45', '{"sub": "91f17bac-f046-4f18-ab83-4461f7d7dd45", "email": "admin@pxvpay.com", "email_verified": false, "phone_verified": false}', 'email', '2025-05-25 13:34:43.564753+00', '2025-05-25 13:34:43.565471+00', '2025-05-25 13:34:43.565471+00', '5df8caa4-34e9-4caa-9a5f-c1350b921e29');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('e15dc40f-7d9b-440f-b8d0-0e7a91a9f58b', '91f17bac-f046-4f18-ab83-4461f7d7dd45', '2025-05-25 13:37:16.229209+00', '2025-05-25 13:37:16.229209+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36', '192.168.65.1', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('e15dc40f-7d9b-440f-b8d0-0e7a91a9f58b', '2025-05-25 13:37:16.242353+00', '2025-05-25 13:37:16.242353+00', 'password', '714eb197-5033-4254-b041-a2ca3e4aa809');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 2, 'aeu7d7z4mylk', '91f17bac-f046-4f18-ab83-4461f7d7dd45', false, '2025-05-25 13:37:16.2341+00', '2025-05-25 13:37:16.2341+00', NULL, 'e15dc40f-7d9b-440f-b8d0-0e7a91a9f58b');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "email", "created_at", "role", "active") VALUES
	('91f17bac-f046-4f18-ab83-4461f7d7dd45', 'admin@pxvpay.com', '2025-05-25 13:34:43.517254+00', 'super_admin', true);


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: content_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: currencies; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."currencies" ("id", "name", "code", "symbol", "status", "created_at", "updated_at", "user_id") VALUES
	('b92dd12f-8997-4728-ac8e-2487cd5648b8', 'US Dollar', 'USD', '$', 'inactive', '2025-05-25 13:35:34.220115+00', '2025-05-25 13:35:34.220115+00', NULL),
	('3578015f-3279-4e01-b1e8-460438e6b028', 'Euro', 'EUR', '€', 'inactive', '2025-05-25 13:35:34.220115+00', '2025-05-25 13:35:34.220115+00', NULL),
	('5f57d03c-356c-4627-b9af-fa3bb3af764f', 'British Pound', 'GBP', '£', 'inactive', '2025-05-25 13:35:34.220115+00', '2025-05-25 13:35:34.220115+00', NULL),
	('3f179a93-71bd-4913-981a-f3c99146f479', 'Nigerian Naira', 'NGN', '₦', 'inactive', '2025-05-25 13:35:34.220115+00', '2025-05-25 13:35:34.220115+00', NULL);


--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."countries" ("id", "name", "code", "status", "created_at", "updated_at", "user_id", "currency_id") VALUES
	('f09571bb-04ec-413a-b60e-d8f0bbdaa83a', 'United States', 'US', 'inactive', '2025-05-25 13:35:34.235787+00', '2025-05-25 13:38:56.656738+00', NULL, 'b92dd12f-8997-4728-ac8e-2487cd5648b8'),
	('001f174e-1671-462b-8297-bc84944af7fe', 'United Kingdom', 'GB', 'inactive', '2025-05-25 13:35:34.235787+00', '2025-05-25 13:38:56.656738+00', NULL, '5f57d03c-356c-4627-b9af-fa3bb3af764f'),
	('a917f7b5-62cd-43fe-a89a-5019dee62017', 'Nigeria', 'NG', 'inactive', '2025-05-25 13:35:34.235787+00', '2025-05-25 13:38:56.656738+00', NULL, '3f179a93-71bd-4913-981a-f3c99146f479'),
	('d94204ce-e4bf-4275-87ff-1e5467d32fe8', 'Germany', 'DE', 'inactive', '2025-05-25 13:35:34.235787+00', '2025-05-25 13:38:56.656738+00', NULL, '3578015f-3279-4e01-b1e8-460438e6b028');


--
-- Data for Name: merchants; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."notifications" ("id", "user_id", "title", "message", "type", "is_read", "data", "created_at") VALUES
	('9d5c7854-621b-4f4a-a7cd-a0c7a89c6c3f', '91f17bac-f046-4f18-ab83-4461f7d7dd45', 'Welcome to PXV Pay!', 'Your account has been created successfully. Start by exploring your dashboard.', 'info', false, NULL, '2025-05-25 13:34:43.517254+00');


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."payment_methods" ("id", "name", "type", "countries", "status", "icon", "created_at", "updated_at", "instructions", "url", "user_id", "custom_fields") VALUES
	('e0533e90-384f-461a-8b52-7ae1498aa0a2', 'Bank Transfer', 'bank', '{US,GB}', 'active', NULL, '2025-05-25 13:35:34.250795+00', '2025-05-25 13:35:34.250795+00', NULL, NULL, NULL, '[]'),
	('a44f6d51-ef8d-4c0a-8400-4a5535807737', 'Mobile Money', 'mobile', '{NG}', 'active', NULL, '2025-05-25 13:35:34.250795+00', '2025-05-25 13:35:34.250795+00', NULL, NULL, NULL, '[]'),
	('2a6b91fb-6d46-4427-9bc1-471005231853', 'Credit Card', 'card', '{US,GB,DE}', 'active', NULL, '2025-05-25 13:35:34.250795+00', '2025-05-25 13:35:34.250795+00', NULL, NULL, NULL, '[]');


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: themes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: theme_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id") VALUES
	('payment-proofs', 'payment-proofs', NULL, '2025-05-25 13:36:08.376429+00', '2025-05-25 13:36:08.376429+00', false, false, 5242880, '{image/*}', NULL),
	('merchant-logos', 'merchant-logos', NULL, '2025-05-25 13:36:08.599078+00', '2025-05-25 13:36:08.599078+00', true, false, 5242880, '{image/*}', NULL),
	('payment-method-icons', 'payment-method-icons', NULL, '2025-05-25 13:36:08.620087+00', '2025-05-25 13:36:08.620087+00', true, false, 5242880, '{image/*}', NULL),
	('user-avatars', 'user-avatars', NULL, '2025-05-25 13:36:08.659397+00', '2025-05-25 13:36:08.659397+00', true, false, 5242880, '{image/*}', NULL),
	('blog-images', 'blog-images', NULL, '2025-05-25 13:36:08.694447+00', '2025-05-25 13:36:08.694447+00', true, false, 5242880, '{image/*}', NULL);


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 2, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
