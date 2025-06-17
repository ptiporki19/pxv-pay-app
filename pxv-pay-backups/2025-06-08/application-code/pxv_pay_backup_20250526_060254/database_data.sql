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
	('00000000-0000-0000-0000-000000000000', '5929443d-d17e-4165-909f-c471dc9670f4', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-26 11:30:41.644442+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dcb27d4d-802e-4715-9404-393b33875a64', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account"}', '2025-05-26 11:30:41.850881+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ccd573b7-b849-476d-8099-782574b5f933', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-26 11:33:40.513396+00', ''),
	('00000000-0000-0000-0000-000000000000', '6c6c5a1e-6bed-4ee8-8391-c22a77fab5be', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account"}', '2025-05-26 11:37:46.034561+00', ''),
	('00000000-0000-0000-0000-000000000000', '2f230c03-f7ae-4476-9c6e-e86dc84359a8', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-26 11:37:50.765539+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f6d185b2-a096-4e91-a8df-884b4b1147c0', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account"}', '2025-05-26 11:49:29.53379+00', ''),
	('00000000-0000-0000-0000-000000000000', '9ba74f5b-24d2-4768-879b-e93d37d787d7', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-26 12:15:35.926838+00', ''),
	('00000000-0000-0000-0000-000000000000', '71ed380f-cad2-4e83-a9c0-ef53b832ce0d', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account"}', '2025-05-26 12:15:50.646477+00', ''),
	('00000000-0000-0000-0000-000000000000', '17092091-5d8c-426e-b4e8-eee6a5378534', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-26 12:17:10.548338+00', ''),
	('00000000-0000-0000-0000-000000000000', '689ac8c5-d9f2-4ff8-9640-ab645c614342', '{"action":"user_signedup","actor_id":"3f91696c-5c1a-457b-a66f-95e6c970c48d","actor_name":"Test User","actor_username":"test1748262458032@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-05-26 12:27:38.155004+00', ''),
	('00000000-0000-0000-0000-000000000000', '12565ca1-14c8-4714-b010-a1f77166efc2', '{"action":"login","actor_id":"3f91696c-5c1a-457b-a66f-95e6c970c48d","actor_name":"Test User","actor_username":"test1748262458032@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-26 12:27:38.1585+00', ''),
	('00000000-0000-0000-0000-000000000000', '33b66e1b-d994-47b8-bd7c-6182c8564726', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account"}', '2025-05-26 12:28:49.493614+00', ''),
	('00000000-0000-0000-0000-000000000000', '24aa1d5d-0d42-48d9-af2b-700b30edb609', '{"action":"user_signedup","actor_id":"f26c5956-06ab-405b-ab36-ed83a68dfd6d","actor_name":"bobi soldier","actor_username":"afriglobalimports@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-05-26 12:29:00.869508+00', ''),
	('00000000-0000-0000-0000-000000000000', '1b11330a-24d0-4d13-90b1-2e412ac961bf', '{"action":"login","actor_id":"f26c5956-06ab-405b-ab36-ed83a68dfd6d","actor_name":"bobi soldier","actor_username":"afriglobalimports@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-26 12:29:00.870835+00', ''),
	('00000000-0000-0000-0000-000000000000', '3578c65c-65f4-426f-b5da-a672499483af', '{"action":"logout","actor_id":"f26c5956-06ab-405b-ab36-ed83a68dfd6d","actor_name":"bobi soldier","actor_username":"afriglobalimports@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-26 12:29:01.140899+00', ''),
	('00000000-0000-0000-0000-000000000000', '6ea811e5-2fc4-44ad-bd90-aab0a0f3d359', '{"action":"user_signedup","actor_id":"3054451d-1401-4bfe-bef4-73719edcba54","actor_name":"Test User","actor_username":"test1748262612941@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-05-26 12:30:13.070445+00', ''),
	('00000000-0000-0000-0000-000000000000', '7d2f36e7-6816-4307-8090-cc9c821d66d6', '{"action":"login","actor_id":"3054451d-1401-4bfe-bef4-73719edcba54","actor_name":"Test User","actor_username":"test1748262612941@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-26 12:30:13.073061+00', ''),
	('00000000-0000-0000-0000-000000000000', '0ec905ac-cce9-4b17-9ac8-856bfa43fa7a', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-26 12:30:26.429692+00', ''),
	('00000000-0000-0000-0000-000000000000', '513560f4-a927-4ec5-a0a7-1c2ee6cca8de', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account"}', '2025-05-26 12:30:26.467112+00', ''),
	('00000000-0000-0000-0000-000000000000', '5d99e35d-3053-4d4e-a952-0203972c9e93', '{"action":"user_repeated_signup","actor_id":"f26c5956-06ab-405b-ab36-ed83a68dfd6d","actor_name":"bobi soldier","actor_username":"afriglobalimports@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-05-26 12:51:45.427429+00', ''),
	('00000000-0000-0000-0000-000000000000', '3e78dc92-241d-4b8d-b4b7-9304b2e2cebe', '{"action":"user_signedup","actor_id":"76b08cc1-84da-4546-8f17-bbfa4479514d","actor_name":"bobi soldier","actor_username":"bazord@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-05-26 12:52:02.048239+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f71e2ab4-97b6-4716-a343-298cb947f2c2', '{"action":"login","actor_id":"76b08cc1-84da-4546-8f17-bbfa4479514d","actor_name":"bobi soldier","actor_username":"bazord@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-26 12:52:02.050042+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b7ced558-f351-4c88-9581-d34abe6d9b72', '{"action":"logout","actor_id":"76b08cc1-84da-4546-8f17-bbfa4479514d","actor_name":"bobi soldier","actor_username":"bazord@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-26 12:52:02.218331+00', ''),
	('00000000-0000-0000-0000-000000000000', '8ea4f597-0a33-4afc-bbf0-4a5e3de20345', '{"action":"login","actor_id":"76b08cc1-84da-4546-8f17-bbfa4479514d","actor_name":"bobi soldier","actor_username":"bazord@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-26 12:52:09.195277+00', ''),
	('00000000-0000-0000-0000-000000000000', '495e62d2-ab27-41c3-ac01-892caa6b52ab', '{"action":"logout","actor_id":"76b08cc1-84da-4546-8f17-bbfa4479514d","actor_name":"bobi soldier","actor_username":"bazord@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-26 12:52:16.187222+00', ''),
	('00000000-0000-0000-0000-000000000000', '89baf873-72c0-4a79-ae5e-b4b3a1db993a', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-26 12:52:23.904573+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '76b08cc1-84da-4546-8f17-bbfa4479514d', 'authenticated', 'authenticated', 'bazord@gmail.com', '$2a$10$EjVE6sJe20cWNulJz4jY9.igjjXIJ6lwlbRbuZXRioBhe.SbVEuTq', '2025-05-26 12:52:02.048503+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-05-26 12:52:09.195998+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "76b08cc1-84da-4546-8f17-bbfa4479514d", "role": "registered_user", "email": "bazord@gmail.com", "full_name": "bobi soldier", "email_verified": true, "phone_verified": false}', NULL, '2025-05-26 12:52:02.032317+00', '2025-05-26 12:52:09.199134+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'admin@pxvpay.com', '$2a$06$SIcW56rghdWejdt1f9hbVOPRNFlGVhUcVvFes2ssjUkGODbgLr/VS', '2025-05-26 11:16:24.065443+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-05-26 12:52:23.906449+00', NULL, NULL, NULL, '2025-05-26 11:16:24.065443+00', '2025-05-26 12:52:23.908427+00', '', NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3f91696c-5c1a-457b-a66f-95e6c970c48d', 'authenticated', 'authenticated', 'test1748262458032@example.com', '$2a$10$c3IO7wh0Y/bJvjJZMd0tH.VzRoVKA17YuESDDWi/N4T44HDb0RL3K', '2025-05-26 12:27:38.155379+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-05-26 12:27:38.158728+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "3f91696c-5c1a-457b-a66f-95e6c970c48d", "role": "registered_user", "email": "test1748262458032@example.com", "full_name": "Test User", "email_verified": true, "phone_verified": false}', NULL, '2025-05-26 12:27:38.132477+00', '2025-05-26 12:27:38.16245+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3054451d-1401-4bfe-bef4-73719edcba54', 'authenticated', 'authenticated', 'test1748262612941@example.com', '$2a$10$S5piX7ldCSrmRR8AqGHGBugyonCaf.oXL704RVQBDV./pVJEMM8nK', '2025-05-26 12:30:13.070887+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-05-26 12:30:13.073691+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "3054451d-1401-4bfe-bef4-73719edcba54", "role": "registered_user", "email": "test1748262612941@example.com", "full_name": "Test User", "email_verified": true, "phone_verified": false}', NULL, '2025-05-26 12:30:13.047784+00', '2025-05-26 12:30:13.079167+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f26c5956-06ab-405b-ab36-ed83a68dfd6d', 'authenticated', 'authenticated', 'afriglobalimports@gmail.com', '$2a$10$M6VqBGQPwGv3.nsmF0wYsONyUykpMwybtKGo8Scefzw10n6VibJPS', '2025-05-26 12:29:00.869744+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-05-26 12:29:00.87135+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "f26c5956-06ab-405b-ab36-ed83a68dfd6d", "role": "registered_user", "email": "afriglobalimports@gmail.com", "full_name": "bobi soldier", "email_verified": true, "phone_verified": false}', NULL, '2025-05-26 12:29:00.856394+00', '2025-05-26 12:29:00.875391+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('3f91696c-5c1a-457b-a66f-95e6c970c48d', '3f91696c-5c1a-457b-a66f-95e6c970c48d', '{"sub": "3f91696c-5c1a-457b-a66f-95e6c970c48d", "role": "registered_user", "email": "test1748262458032@example.com", "full_name": "Test User", "email_verified": false, "phone_verified": false}', 'email', '2025-05-26 12:27:38.152323+00', '2025-05-26 12:27:38.15235+00', '2025-05-26 12:27:38.15235+00', '658bee4c-5f68-42f5-8210-7807542d660c'),
	('f26c5956-06ab-405b-ab36-ed83a68dfd6d', 'f26c5956-06ab-405b-ab36-ed83a68dfd6d', '{"sub": "f26c5956-06ab-405b-ab36-ed83a68dfd6d", "role": "registered_user", "email": "afriglobalimports@gmail.com", "full_name": "bobi soldier", "email_verified": false, "phone_verified": false}', 'email', '2025-05-26 12:29:00.868339+00', '2025-05-26 12:29:00.868369+00', '2025-05-26 12:29:00.868369+00', '17ceba2b-669d-4bb7-9695-69d52d1d9b14'),
	('3054451d-1401-4bfe-bef4-73719edcba54', '3054451d-1401-4bfe-bef4-73719edcba54', '{"sub": "3054451d-1401-4bfe-bef4-73719edcba54", "role": "registered_user", "email": "test1748262612941@example.com", "full_name": "Test User", "email_verified": false, "phone_verified": false}', 'email', '2025-05-26 12:30:13.068693+00', '2025-05-26 12:30:13.068726+00', '2025-05-26 12:30:13.068726+00', 'fe9189a7-f55c-4781-8658-fe8b7cc6e991'),
	('76b08cc1-84da-4546-8f17-bbfa4479514d', '76b08cc1-84da-4546-8f17-bbfa4479514d', '{"sub": "76b08cc1-84da-4546-8f17-bbfa4479514d", "role": "registered_user", "email": "bazord@gmail.com", "full_name": "bobi soldier", "email_verified": false, "phone_verified": false}', 'email', '2025-05-26 12:52:02.046686+00', '2025-05-26 12:52:02.046711+00', '2025-05-26 12:52:02.046711+00', '470fa4b0-9cef-47e6-87d0-e5f1654eb4c7');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('ffad4d3f-202f-4892-9f61-ab529c5d9bc2', '3f91696c-5c1a-457b-a66f-95e6c970c48d', '2025-05-26 12:27:38.15893+00', '2025-05-26 12:27:38.15893+00', NULL, 'aal1', NULL, NULL, 'node', '192.168.65.1', NULL),
	('c987de7e-90a4-4770-8d9b-86e57c99994e', '3054451d-1401-4bfe-bef4-73719edcba54', '2025-05-26 12:30:13.07377+00', '2025-05-26 12:30:13.07377+00', NULL, 'aal1', NULL, NULL, 'node', '192.168.65.1', NULL),
	('8f2f5cab-336c-4c79-9c72-60e827d04c19', '00000000-0000-0000-0000-000000000001', '2025-05-26 12:52:23.906509+00', '2025-05-26 12:52:23.906509+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36', '192.168.65.1', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('ffad4d3f-202f-4892-9f61-ab529c5d9bc2', '2025-05-26 12:27:38.162608+00', '2025-05-26 12:27:38.162608+00', 'password', '11c3080b-0aa8-4428-9d7a-a5be6e18ebae'),
	('c987de7e-90a4-4770-8d9b-86e57c99994e', '2025-05-26 12:30:13.079533+00', '2025-05-26 12:30:13.079533+00', 'password', '220b9827-60e7-4f4d-ab8a-95d38450a1ae'),
	('8f2f5cab-336c-4c79-9c72-60e827d04c19', '2025-05-26 12:52:23.908611+00', '2025-05-26 12:52:23.908611+00', 'password', '175e67b2-2c0c-4999-bd12-22f80bfb904f');


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
	('00000000-0000-0000-0000-000000000000', 6, '2ttlcd443eq6', '3f91696c-5c1a-457b-a66f-95e6c970c48d', false, '2025-05-26 12:27:38.159762+00', '2025-05-26 12:27:38.159762+00', NULL, 'ffad4d3f-202f-4892-9f61-ab529c5d9bc2'),
	('00000000-0000-0000-0000-000000000000', 8, 'fzobku4elzfl', '3054451d-1401-4bfe-bef4-73719edcba54', false, '2025-05-26 12:30:13.074621+00', '2025-05-26 12:30:13.074621+00', NULL, 'c987de7e-90a4-4770-8d9b-86e57c99994e'),
	('00000000-0000-0000-0000-000000000000', 12, 'y7rajzm6kxs4', '00000000-0000-0000-0000-000000000001', false, '2025-05-26 12:52:23.907498+00', '2025-05-26 12:52:23.907498+00', NULL, '8f2f5cab-336c-4c79-9c72-60e827d04c19');


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
	('00000000-0000-0000-0000-000000000001', 'admin@pxvpay.com', '2025-05-26 11:18:01.749595+00', 'super_admin', true),
	('3f91696c-5c1a-457b-a66f-95e6c970c48d', 'test1748262458032@example.com', '2025-05-26 12:27:38.132091+00', 'registered_user', true),
	('f26c5956-06ab-405b-ab36-ed83a68dfd6d', 'afriglobalimports@gmail.com', '2025-05-26 12:29:00.855385+00', 'registered_user', true),
	('3054451d-1401-4bfe-bef4-73719edcba54', 'test1748262612941@example.com', '2025-05-26 12:30:13.046113+00', 'registered_user', true),
	('76b08cc1-84da-4546-8f17-bbfa4479514d', 'bazord@gmail.com', '2025-05-26 12:52:02.031896+00', 'registered_user', true);


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: checkout_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."checkout_links" ("id", "merchant_id", "slug", "link_name", "active_country_codes", "is_active", "logo_url", "checkout_page_heading", "payment_review_message", "created_at", "updated_at", "title", "amount", "currency", "status") VALUES
	('314b2790-5897-4102-a53d-a0dc6e619d3e', '00000000-0000-0000-0000-000000000001', 'payment-1748260111778', 'lien-mali', '{}', true, NULL, 'Complete Your Checkout', 'Thank you for your payment', '2025-05-26 11:48:31.803508+00', '2025-05-26 11:48:31.803508+00', 'Payment', 94.00, 'USD', 'active');


--
-- Data for Name: content_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: currencies; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."currencies" ("id", "name", "code", "symbol", "status", "created_at", "updated_at", "user_id") VALUES
	('ebf1a17e-0278-4dbf-945f-2ff581d7c3e2', 'US Dollar', 'USD', '$', 'active', '2025-05-26 11:40:30.217093+00', '2025-05-26 11:40:30.217093+00', '00000000-0000-0000-0000-000000000001');


--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."countries" ("id", "name", "code", "status", "created_at", "updated_at", "user_id", "currency_id") VALUES
	('f024c772-9a35-45cf-a058-31c5834d8cb9', 'Mobile Money', 'USA', 'active', '2025-05-26 11:42:41.405794+00', '2025-05-26 11:42:41.405794+00', '00000000-0000-0000-0000-000000000001', 'ebf1a17e-0278-4dbf-945f-2ff581d7c3e2');


--
-- Data for Name: merchant_checkout_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: merchants; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."notifications" ("id", "user_id", "title", "message", "type", "is_read", "data", "created_at") VALUES
	('52485881-4d10-4c9b-bb63-b34dcf8674f2', '00000000-0000-0000-0000-000000000001', 'Welcome to PXV Pay!', 'Your account has been created successfully. Start by exploring your dashboard.', 'info', false, NULL, '2025-05-26 11:16:24.065443+00'),
	('87648c42-804c-4dd2-8c76-c6fa47c58cdd', '00000000-0000-0000-0000-000000000001', 'Welcome to PXV Pay!', 'Your account has been created successfully. Start by exploring your dashboard.', 'info', false, NULL, '2025-05-26 11:16:52.539882+00'),
	('414adca9-7356-4d90-97e7-5ca93eb6a739', '00000000-0000-0000-0000-000000000001', 'Welcome to PXV Pay!', 'Your account has been created successfully. Start by exploring your dashboard.', 'info', false, NULL, '2025-05-26 11:18:01.749595+00'),
	('722aa8fa-0966-4549-a40a-a1e0a730c732', '3f91696c-5c1a-457b-a66f-95e6c970c48d', 'Welcome to PXV Pay!', 'Your account has been created successfully. Start by exploring your dashboard.', 'info', false, NULL, '2025-05-26 12:27:38.132091+00'),
	('8aac426b-7436-4999-9aa9-7ce51f42bdba', 'f26c5956-06ab-405b-ab36-ed83a68dfd6d', 'Welcome to PXV Pay!', 'Your account has been created successfully. Start by exploring your dashboard.', 'info', false, NULL, '2025-05-26 12:29:00.855385+00'),
	('032022f8-c845-418f-9ff9-57a874c1958d', '3054451d-1401-4bfe-bef4-73719edcba54', 'Welcome to PXV Pay!', 'Your account has been created successfully. Start by exploring your dashboard.', 'info', false, NULL, '2025-05-26 12:30:13.046113+00'),
	('5606babc-1604-4bb3-a7e4-7ed3e878a904', '76b08cc1-84da-4546-8f17-bbfa4479514d', 'Welcome to PXV Pay!', 'Your account has been created successfully. Start by exploring your dashboard.', 'info', false, NULL, '2025-05-26 12:52:02.031896+00');


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."payment_methods" ("id", "name", "type", "countries", "status", "icon", "created_at", "updated_at", "instructions", "url", "user_id", "instructions_for_checkout", "display_order", "custom_fields") VALUES
	('00784eb2-d016-476d-b6a0-8891b2347a93', 'Mobile Money', 'manual', '{USA}', 'active', NULL, '2025-05-26 11:45:58.983683+00', '2025-05-26 11:45:58.983683+00', 'jdi', NULL, '00000000-0000-0000-0000-000000000001', NULL, 0, '[{"id": "field_1748259949542", "type": "text", "label": "MoMo", "value": "", "required": true, "placeholder": "674348394"}]');


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
-- Data for Name: user_limits; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_limits" ("id", "user_id", "user_role", "max_checkout_links", "current_checkout_links", "max_monthly_payments", "current_monthly_payments", "max_storage_mb", "current_storage_mb", "can_use_analytics", "can_use_webhooks", "can_customize_branding", "can_export_data", "created_at", "updated_at") VALUES
	('c83427bb-21e0-4496-ae03-8b8a3937ffe1', '00000000-0000-0000-0000-000000000001', 'registered_user', NULL, 1, NULL, 0, NULL, 0, true, true, true, true, '2025-05-26 11:16:24.065443+00', '2025-05-26 11:48:31.803508+00'),
	('89186d0a-eb71-4b34-9d6a-81256c58407c', '3f91696c-5c1a-457b-a66f-95e6c970c48d', 'registered_user', NULL, 0, NULL, 0, NULL, 0, true, true, true, true, '2025-05-26 12:27:38.132091+00', '2025-05-26 12:27:38.132091+00'),
	('2ebb6055-52f0-426a-af1a-bfa655b35b7d', 'f26c5956-06ab-405b-ab36-ed83a68dfd6d', 'registered_user', NULL, 0, NULL, 0, NULL, 0, true, true, true, true, '2025-05-26 12:29:00.855385+00', '2025-05-26 12:29:00.855385+00'),
	('f3e3696f-059c-46cc-845a-72dfd606e9c4', '3054451d-1401-4bfe-bef4-73719edcba54', 'registered_user', NULL, 0, NULL, 0, NULL, 0, true, true, true, true, '2025-05-26 12:30:13.046113+00', '2025-05-26 12:30:13.046113+00'),
	('d2c6bd58-ea42-4873-8c55-1509c886ec9b', '76b08cc1-84da-4546-8f17-bbfa4479514d', 'registered_user', NULL, 0, NULL, 0, NULL, 0, true, true, true, true, '2025-05-26 12:52:02.031896+00', '2025-05-26 12:52:02.031896+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id") VALUES
	('payment-proofs', 'payment-proofs', NULL, '2025-05-26 11:16:18.769245+00', '2025-05-26 11:16:18.769245+00', false, false, 10485760, '{image/*}', NULL),
	('merchant-logos', 'merchant-logos', NULL, '2025-05-26 11:16:18.786805+00', '2025-05-26 11:16:18.786805+00', true, false, 10485760, '{image/*}', NULL),
	('payment-method-icons', 'payment-method-icons', NULL, '2025-05-26 11:16:18.793597+00', '2025-05-26 11:16:18.793597+00', true, false, 10485760, '{image/*}', NULL),
	('user-avatars', 'user-avatars', NULL, '2025-05-26 11:16:18.797789+00', '2025-05-26 11:16:18.797789+00', true, false, 10485760, '{image/*}', NULL),
	('blog-images', 'blog-images', NULL, '2025-05-26 11:16:18.801134+00', '2025-05-26 11:16:18.801134+00', true, false, 10485760, '{image/*}', NULL);


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

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 12, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
