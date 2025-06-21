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
	('00000000-0000-0000-0000-000000000000', 'c8412e60-2dd1-47a9-87eb-0bf85ab58cfc', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin@pxvpay.com","user_id":"23f2b73b-289d-41a8-b52b-d8742533287d","user_phone":""}}', '2025-05-24 22:55:07.866829+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eb8e15f3-31fa-4c8b-9d7e-3bcc3d2c0d19', '{"action":"login","actor_id":"23f2b73b-289d-41a8-b52b-d8742533287d","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-24 22:55:57.066639+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ba2c347a-f6ac-46a0-9f53-d9b32ad1c3d8', '{"action":"login","actor_id":"23f2b73b-289d-41a8-b52b-d8742533287d","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-24 22:57:43.853666+00', ''),
	('00000000-0000-0000-0000-000000000000', '655d6cc1-87dc-4ded-95b2-84214a6d1291', '{"action":"login","actor_id":"23f2b73b-289d-41a8-b52b-d8742533287d","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-24 22:58:35.545732+00', ''),
	('00000000-0000-0000-0000-000000000000', '1626afb3-6648-4224-afb2-3a2e1ef5384b', '{"action":"login","actor_id":"23f2b73b-289d-41a8-b52b-d8742533287d","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-24 23:20:48.201997+00', ''),
	('00000000-0000-0000-0000-000000000000', '8b14cd1b-90e1-48f2-97ad-d2a512e2fc81', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"testuser1748128886937@example.com","user_id":"36d3d25d-7fb4-4edf-969c-cb0ad0b45be0","user_phone":""}}', '2025-05-24 23:21:27.070909+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '23f2b73b-289d-41a8-b52b-d8742533287d', 'authenticated', 'authenticated', 'admin@pxvpay.com', '$2a$10$lJj5EWLhzpELgbSetWXHJuXChnD9/.1Ro7nUad9BNnC3WQHEX9Rde', '2025-05-24 22:55:07.874999+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-05-24 23:20:48.21059+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-05-24 22:55:07.71649+00', '2025-05-24 23:20:48.232037+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '36d3d25d-7fb4-4edf-969c-cb0ad0b45be0', 'authenticated', 'authenticated', 'testuser1748128886937@example.com', '$2a$10$S5vvJEESIBqXv1PsAeJ/3OPhfSBQWmDkK9yrwkvi5OcTD2ujZzDW6', '2025-05-24 23:21:27.072134+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-05-24 23:21:27.052619+00', '2025-05-24 23:21:27.072764+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('23f2b73b-289d-41a8-b52b-d8742533287d', '23f2b73b-289d-41a8-b52b-d8742533287d', '{"sub": "23f2b73b-289d-41a8-b52b-d8742533287d", "email": "admin@pxvpay.com", "email_verified": false, "phone_verified": false}', 'email', '2025-05-24 22:55:07.855823+00', '2025-05-24 22:55:07.855925+00', '2025-05-24 22:55:07.855925+00', '01fb4395-8aae-4c58-95f2-27c2d16931c5'),
	('36d3d25d-7fb4-4edf-969c-cb0ad0b45be0', '36d3d25d-7fb4-4edf-969c-cb0ad0b45be0', '{"sub": "36d3d25d-7fb4-4edf-969c-cb0ad0b45be0", "email": "testuser1748128886937@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-05-24 23:21:27.069008+00', '2025-05-24 23:21:27.069231+00', '2025-05-24 23:21:27.069231+00', '2726dac1-5894-4d86-8e1e-9f21c8bd47bf');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('2bbe503a-81f6-4d7c-816d-b18c00688f63', '23f2b73b-289d-41a8-b52b-d8742533287d', '2025-05-24 22:55:57.079889+00', '2025-05-24 22:55:57.079889+00', NULL, 'aal1', NULL, NULL, 'node', '192.168.65.1', NULL),
	('16b27cbe-79db-47ef-b0bc-4c4f2cfef38c', '23f2b73b-289d-41a8-b52b-d8742533287d', '2025-05-24 22:57:43.880313+00', '2025-05-24 22:57:43.880313+00', NULL, 'aal1', NULL, NULL, 'node', '192.168.65.1', NULL),
	('512a698b-d35e-4458-acaa-eaa1b55005bf', '23f2b73b-289d-41a8-b52b-d8742533287d', '2025-05-24 22:58:35.550784+00', '2025-05-24 22:58:35.550784+00', NULL, 'aal1', NULL, NULL, 'node', '192.168.65.1', NULL),
	('94980853-3464-43ca-b003-2bb312f99aac', '23f2b73b-289d-41a8-b52b-d8742533287d', '2025-05-24 23:20:48.212549+00', '2025-05-24 23:20:48.212549+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36', '192.168.65.1', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('2bbe503a-81f6-4d7c-816d-b18c00688f63', '2025-05-24 22:55:57.172693+00', '2025-05-24 22:55:57.172693+00', 'password', '7da4add5-2c18-4183-a48f-facf24a2e699'),
	('16b27cbe-79db-47ef-b0bc-4c4f2cfef38c', '2025-05-24 22:57:43.917407+00', '2025-05-24 22:57:43.917407+00', 'password', 'beb7925b-1925-4bad-9257-0cfddfdcace3'),
	('512a698b-d35e-4458-acaa-eaa1b55005bf', '2025-05-24 22:58:35.557958+00', '2025-05-24 22:58:35.557958+00', 'password', 'df1d922e-be49-49b5-8a09-bce7b3fd8d72'),
	('94980853-3464-43ca-b003-2bb312f99aac', '2025-05-24 23:20:48.233712+00', '2025-05-24 23:20:48.233712+00', 'password', 'ac36650d-5403-4718-879a-7bf1baa32df4');


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
	('00000000-0000-0000-0000-000000000000', 1, 'qyipxxdfqf57', '23f2b73b-289d-41a8-b52b-d8742533287d', false, '2025-05-24 22:55:57.094811+00', '2025-05-24 22:55:57.094811+00', NULL, '2bbe503a-81f6-4d7c-816d-b18c00688f63'),
	('00000000-0000-0000-0000-000000000000', 2, 'tms7pxve4mfp', '23f2b73b-289d-41a8-b52b-d8742533287d', false, '2025-05-24 22:57:43.888723+00', '2025-05-24 22:57:43.888723+00', NULL, '16b27cbe-79db-47ef-b0bc-4c4f2cfef38c'),
	('00000000-0000-0000-0000-000000000000', 3, 'ze3smb7p62ig', '23f2b73b-289d-41a8-b52b-d8742533287d', false, '2025-05-24 22:58:35.554784+00', '2025-05-24 22:58:35.554784+00', NULL, '512a698b-d35e-4458-acaa-eaa1b55005bf'),
	('00000000-0000-0000-0000-000000000000', 4, 'ezsdzxfofl32', '23f2b73b-289d-41a8-b52b-d8742533287d', false, '2025-05-24 23:20:48.222307+00', '2025-05-24 23:20:48.222307+00', NULL, '94980853-3464-43ca-b003-2bb312f99aac');


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
	('23f2b73b-289d-41a8-b52b-d8742533287d', 'admin@pxvpay.com', '2025-05-24 22:55:07.710227+00', 'super_admin', true),
	('36d3d25d-7fb4-4edf-969c-cb0ad0b45be0', 'testuser1748128886937@example.com', '2025-05-24 23:21:27.051959+00', 'registered_user', true);


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: content_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: currencies; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: merchants; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."notifications" ("id", "user_id", "title", "message", "type", "is_read", "data", "created_at") VALUES
	('d5cdd848-9679-4c0d-b139-d9b4f6d0ab55', '23f2b73b-289d-41a8-b52b-d8742533287d', 'Welcome to PXV Pay!', 'Your account has been created successfully. Start by exploring your dashboard.', 'info', false, NULL, '2025-05-24 22:55:07.710227+00'),
	('601fecdc-433a-4714-97eb-375777f9c198', '36d3d25d-7fb4-4edf-969c-cb0ad0b45be0', 'Welcome to PXV Pay!', 'Your account has been created successfully. Start by exploring your dashboard.', 'info', false, NULL, '2025-05-24 23:21:27.051959+00');


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--



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
	('payment-proofs', 'payment-proofs', NULL, '2025-05-24 22:54:47.803498+00', '2025-05-24 22:54:47.803498+00', false, false, 5242880, '{image/jpeg,image/png,image/webp,application/pdf}', NULL),
	('merchant-logos', 'merchant-logos', NULL, '2025-05-24 22:54:48.145757+00', '2025-05-24 22:54:48.145757+00', true, false, 2097152, '{image/jpeg,image/png,image/webp,image/svg+xml}', NULL),
	('payment-method-icons', 'payment-method-icons', NULL, '2025-05-24 22:54:48.162196+00', '2025-05-24 22:54:48.162196+00', true, false, 1048576, '{image/jpeg,image/png,image/webp,image/svg+xml}', NULL),
	('user-avatars', 'user-avatars', NULL, '2025-05-24 22:54:48.181167+00', '2025-05-24 22:54:48.181167+00', false, false, 2097152, '{image/jpeg,image/png,image/webp}', NULL),
	('blog-images', 'blog-images', NULL, '2025-05-24 22:54:48.196684+00', '2025-05-24 22:54:48.196684+00', true, false, 5242880, '{image/jpeg,image/png,image/webp}', NULL);


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

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 4, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
