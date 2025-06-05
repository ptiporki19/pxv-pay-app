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
	('00000000-0000-0000-0000-000000000000', '87ee2e69-69d4-47fd-ba08-a3b7a2d08719', '{"action":"user_signedup","actor_id":"13ade00b-13de-4556-884c-9b1e532dcb03","actor_name":"youpi our","actor_username":"afriglobalimports@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-06-04 11:22:12.55586+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c0e5039e-ab7f-4a42-9ea4-75e0c0f8b19d', '{"action":"login","actor_id":"13ade00b-13de-4556-884c-9b1e532dcb03","actor_name":"youpi our","actor_username":"afriglobalimports@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 11:22:12.566872+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c871af68-63e8-4549-a2c1-2938779ba898', '{"action":"logout","actor_id":"13ade00b-13de-4556-884c-9b1e532dcb03","actor_name":"youpi our","actor_username":"afriglobalimports@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-06-04 11:22:12.961306+00', ''),
	('00000000-0000-0000-0000-000000000000', '98c0126d-ee42-4bb2-bfa2-c5622c60f8d5', '{"action":"login","actor_id":"13ade00b-13de-4556-884c-9b1e532dcb03","actor_name":"youpi our","actor_username":"afriglobalimports@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 11:22:17.029156+00', ''),
	('00000000-0000-0000-0000-000000000000', '328ddffc-a03a-40f1-8b55-45a8feb2e2e9', '{"action":"token_refreshed","actor_id":"13ade00b-13de-4556-884c-9b1e532dcb03","actor_name":"youpi our","actor_username":"afriglobalimports@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-06-04 12:35:02.098203+00', ''),
	('00000000-0000-0000-0000-000000000000', '0fd20076-8f54-4e38-acfe-a09df7a33640', '{"action":"token_revoked","actor_id":"13ade00b-13de-4556-884c-9b1e532dcb03","actor_name":"youpi our","actor_username":"afriglobalimports@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-06-04 12:35:02.102343+00', ''),
	('00000000-0000-0000-0000-000000000000', '90032268-ac06-4b8f-8afe-fbffda16e512', '{"action":"logout","actor_id":"13ade00b-13de-4556-884c-9b1e532dcb03","actor_name":"youpi our","actor_username":"afriglobalimports@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-06-04 12:35:17.469183+00', ''),
	('00000000-0000-0000-0000-000000000000', '008512c6-d729-47d8-946a-7d9e2b145b0d', '{"action":"login","actor_id":"13ade00b-13de-4556-884c-9b1e532dcb03","actor_name":"youpi our","actor_username":"afriglobalimports@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 12:35:21.993818+00', ''),
	('00000000-0000-0000-0000-000000000000', '031dc02d-c268-469e-979c-80ff79a375da', '{"action":"logout","actor_id":"13ade00b-13de-4556-884c-9b1e532dcb03","actor_name":"youpi our","actor_username":"afriglobalimports@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-06-04 13:06:29.829413+00', ''),
	('00000000-0000-0000-0000-000000000000', '57892c5b-24a4-464d-a68a-2d2d94dbf4ff', '{"action":"login","actor_id":"13ade00b-13de-4556-884c-9b1e532dcb03","actor_name":"youpi our","actor_username":"afriglobalimports@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 13:06:33.791305+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ab8c2c13-2b3f-4e38-909e-49274c830a0d', '{"action":"logout","actor_id":"13ade00b-13de-4556-884c-9b1e532dcb03","actor_name":"youpi our","actor_username":"afriglobalimports@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-06-04 13:39:59.991949+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b70c62f8-a84d-479c-bf2d-cbd86088df30', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 13:40:04.690851+00', ''),
	('00000000-0000-0000-0000-000000000000', '7bf0e604-fece-4a27-b0ef-e9c7d0ed1933', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"admin@pxvpay.com","actor_via_sso":false,"log_type":"account"}', '2025-06-04 14:22:58.894092+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c7710e9d-fd4b-40c9-a2cc-461dfc9cd0cb', '{"action":"login","actor_id":"13ade00b-13de-4556-884c-9b1e532dcb03","actor_name":"youpi our","actor_username":"afriglobalimports@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 14:23:03.526824+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'admin@pxvpay.com', '$2a$06$yEL6TMziZSvGAPHRqaqf2.qaxIx1yxzgVxeUQoYbE/BuwxFth23JS', '2025-06-04 11:18:53.370471+00', NULL, '', NULL, '', '2025-06-04 11:18:53.370471+00', '', '', NULL, '2025-06-04 13:40:04.691976+00', '{"provider": "email", "providers": ["email"]}', '{"role": "super_admin"}', NULL, '2025-06-04 11:18:53.370471+00', '2025-06-04 13:40:04.699236+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '13ade00b-13de-4556-884c-9b1e532dcb03', 'authenticated', 'authenticated', 'afriglobalimports@gmail.com', '$2a$10$vsbOx/c.LrrhfW0SwOvHK.tJKIdKgOJAr5s7iESDNKhazDzJbqD1S', '2025-06-04 11:22:12.557916+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-06-04 14:23:03.527718+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "13ade00b-13de-4556-884c-9b1e532dcb03", "role": "registered_user", "email": "afriglobalimports@gmail.com", "full_name": "youpi our", "email_verified": true, "phone_verified": false}', NULL, '2025-06-04 11:22:12.532733+00', '2025-06-04 14:23:03.537216+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('13ade00b-13de-4556-884c-9b1e532dcb03', '13ade00b-13de-4556-884c-9b1e532dcb03', '{"sub": "13ade00b-13de-4556-884c-9b1e532dcb03", "role": "registered_user", "email": "afriglobalimports@gmail.com", "full_name": "youpi our", "email_verified": false, "phone_verified": false}', 'email', '2025-06-04 11:22:12.553082+00', '2025-06-04 11:22:12.553306+00', '2025-06-04 11:22:12.553306+00', '51d376dd-55bf-4711-8114-3132498c059e');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('7e5d9f89-2ed4-4024-a2b6-35735c8698b3', '13ade00b-13de-4556-884c-9b1e532dcb03', '2025-06-04 14:23:03.527824+00', '2025-06-04 14:23:03.527824+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '192.168.65.1', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('7e5d9f89-2ed4-4024-a2b6-35735c8698b3', '2025-06-04 14:23:03.537721+00', '2025-06-04 14:23:03.537721+00', 'password', '84c22917-e0e9-458a-a4f6-2c24550876ac');


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
	('00000000-0000-0000-0000-000000000000', 7, 'kecsf5hzmkvr', '13ade00b-13de-4556-884c-9b1e532dcb03', false, '2025-06-04 14:23:03.530472+00', '2025-06-04 14:23:03.530472+00', NULL, '7e5d9f89-2ed4-4024-a2b6-35735c8698b3');


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

INSERT INTO "public"."audit_logs" ("id", "user_id", "action", "entity_type", "entity_id", "old_data", "new_data", "created_at") VALUES
	('02232356-fbaa-4e8b-a676-f5e2d45e53a2', NULL, 'INSERT', 'merchants', '00000000-0000-0000-0000-000000000001', NULL, '{"id": "00000000-0000-0000-0000-000000000001", "name": "Demo Merchant", "status": "active", "website": null, "logo_url": null, "owner_id": "00000000-0000-0000-0000-000000000001", "created_at": "2025-06-04T13:00:09.073+00:00", "updated_at": "2025-06-04T13:00:09.114+00:00", "description": "Default demo merchant for testing"}', '2025-06-04 13:00:09.158009+00'),
	('cd2c67de-de2c-4d99-8c3a-89610d9db101', NULL, 'INSERT', 'merchants', '13ade00b-13de-4556-884c-9b1e532dcb03', NULL, '{"id": "13ade00b-13de-4556-884c-9b1e532dcb03", "name": "Merchant 13ade00b", "status": "active", "website": null, "logo_url": null, "owner_id": "13ade00b-13de-4556-884c-9b1e532dcb03", "created_at": "2025-06-04T13:00:09.185+00:00", "updated_at": "2025-06-04T13:00:09.185+00:00", "description": "Auto-created merchant"}', '2025-06-04 13:00:09.192309+00'),
	('6076d828-4f09-41f5-b467-db5bda9d4cb2', NULL, 'INSERT', 'payments', '99999999-9999-9999-9999-999999999999', NULL, '{"id": "99999999-9999-9999-9999-999999999999", "amount": 50.00, "status": "pending_verification", "country": "US", "user_id": null, "currency": "USD", "metadata": null, "created_at": "2025-06-04T13:00:09.271544+00:00", "updated_at": "2025-06-04T13:00:09.271544+00:00", "description": null, "merchant_id": "00000000-0000-0000-0000-000000000001", "verified_by": null, "customer_name": "Test Customer", "customer_email": "test@example.com", "payment_method": "Test Method", "checkout_link_id": "74665f2e-e0d7-47b6-beba-72ebc4b8f2fe", "payment_proof_url": "https://example.com/proof.jpg", "verification_date": null, "status_update_notes": null}', '2025-06-04 13:00:09.271544+00'),
	('5e5e9391-235b-42ef-97f3-0e5291a9a1e6', NULL, 'DELETE', 'payments', '99999999-9999-9999-9999-999999999999', '{"id": "99999999-9999-9999-9999-999999999999", "amount": 50.00, "status": "pending_verification", "country": "US", "user_id": null, "currency": "USD", "metadata": null, "created_at": "2025-06-04T13:00:09.271544+00:00", "updated_at": "2025-06-04T13:00:09.271544+00:00", "description": null, "merchant_id": "00000000-0000-0000-0000-000000000001", "verified_by": null, "customer_name": "Test Customer", "customer_email": "test@example.com", "payment_method": "Test Method", "checkout_link_id": "74665f2e-e0d7-47b6-beba-72ebc4b8f2fe", "payment_proof_url": "https://example.com/proof.jpg", "verification_date": null, "status_update_notes": null}', NULL, '2025-06-04 13:00:09.28195+00'),
	('9c3338c9-bd78-4a69-9616-9bff421f77be', NULL, 'INSERT', 'payments', '4335a6a5-dc2e-4b83-83fd-106c7d3f02c2', NULL, '{"id": "4335a6a5-dc2e-4b83-83fd-106c7d3f02c2", "amount": 50.00, "status": "pending_verification", "country": "US", "user_id": null, "currency": "USD", "metadata": null, "created_at": "2025-06-04T13:00:50.338+00:00", "updated_at": "2025-06-04T13:00:50.340201+00:00", "description": null, "merchant_id": "00000000-0000-0000-0000-000000000001", "verified_by": null, "customer_name": "Test Customer", "customer_email": "test@example.com", "payment_method": "Bank Transfer", "checkout_link_id": "74665f2e-e0d7-47b6-beba-72ebc4b8f2fe", "payment_proof_url": "http://127.0.0.1:54321/storage/v1/object/public/payment-proofs/00000000-0000-0000-0000-000000000001/9c48d29c-fa4a-4ccf-a114-49fdffe40cad.png", "verification_date": null, "status_update_notes": null}', '2025-06-04 13:00:50.340201+00'),
	('fdd45c56-5a26-41e1-8f30-e5a9d9d1c367', NULL, 'DELETE', 'payments', '4335a6a5-dc2e-4b83-83fd-106c7d3f02c2', '{"id": "4335a6a5-dc2e-4b83-83fd-106c7d3f02c2", "amount": 50.00, "status": "pending_verification", "country": "US", "user_id": null, "currency": "USD", "metadata": null, "created_at": "2025-06-04T13:00:50.338+00:00", "updated_at": "2025-06-04T13:00:50.340201+00:00", "description": null, "merchant_id": "00000000-0000-0000-0000-000000000001", "verified_by": null, "customer_name": "Test Customer", "customer_email": "test@example.com", "payment_method": "Bank Transfer", "checkout_link_id": "74665f2e-e0d7-47b6-beba-72ebc4b8f2fe", "payment_proof_url": "http://127.0.0.1:54321/storage/v1/object/public/payment-proofs/00000000-0000-0000-0000-000000000001/9c48d29c-fa4a-4ccf-a114-49fdffe40cad.png", "verification_date": null, "status_update_notes": null}', NULL, '2025-06-04 13:00:50.382058+00'),
	('0061771c-3813-47a9-8e6f-7b4aaab891d0', NULL, 'INSERT', 'payments', 'eeac4219-1e0e-49dc-b1c3-8b2622775814', NULL, '{"id": "eeac4219-1e0e-49dc-b1c3-8b2622775814", "amount": 10000.00, "status": "pending_verification", "country": "CY", "user_id": null, "currency": "USD", "metadata": null, "created_at": "2025-06-04T13:06:09.105+00:00", "updated_at": "2025-06-04T13:06:09.109987+00:00", "description": null, "merchant_id": "13ade00b-13de-4556-884c-9b1e532dcb03", "verified_by": null, "customer_name": "hggh", "customer_email": "afriglobalImports@gmail.com", "payment_method": "Klarna", "checkout_link_id": "57df9831-b587-49f3-af9f-535301d7b90d", "payment_proof_url": "http://127.0.0.1:54321/storage/v1/object/public/payment-proofs/13ade00b-13de-4556-884c-9b1e532dcb03/958602a0-6d6f-4061-9755-5477adf088b7.jpg", "verification_date": null, "status_update_notes": null}', '2025-06-04 13:06:09.109987+00'),
	('f5594766-ef49-4258-a417-99a92310398d', NULL, 'INSERT', 'payments', 'd7d2b31a-5a41-447c-acd2-50a778f98153', NULL, '{"id": "d7d2b31a-5a41-447c-acd2-50a778f98153", "amount": 75.50, "status": "pending_verification", "country": "US", "user_id": null, "currency": "USD", "metadata": null, "created_at": "2025-06-04T13:13:04.295+00:00", "updated_at": "2025-06-04T13:13:04.299798+00:00", "description": null, "merchant_id": "00000000-0000-0000-0000-000000000001", "verified_by": null, "customer_name": "Test Customer - Image Upload", "customer_email": "test@example.com", "payment_method": "Bank Transfer", "checkout_link_id": "74665f2e-e0d7-47b6-beba-72ebc4b8f2fe", "payment_proof_url": "http://127.0.0.1:54321/storage/v1/object/public/payment-proofs/00000000-0000-0000-0000-000000000001/da7a8af9-7ab3-4cdb-9deb-b4ddb904b93e.png", "verification_date": null, "status_update_notes": null}', '2025-06-04 13:13:04.299798+00'),
	('f2979ac9-6894-4da4-85f9-3d43745a40f9', NULL, 'INSERT', 'payments', 'a906b21f-6046-4893-8db8-7c44afe293bc', NULL, '{"id": "a906b21f-6046-4893-8db8-7c44afe293bc", "amount": 150.00, "status": "pending_verification", "country": "US", "user_id": null, "currency": "USD", "metadata": null, "created_at": "2025-06-04T13:13:27.51+00:00", "updated_at": "2025-06-04T13:13:27.512788+00:00", "description": null, "merchant_id": "00000000-0000-0000-0000-000000000001", "verified_by": null, "customer_name": "Test Customer - PDF Upload", "customer_email": "test-pdf@example.com", "payment_method": "PayPal", "checkout_link_id": "74665f2e-e0d7-47b6-beba-72ebc4b8f2fe", "payment_proof_url": "http://127.0.0.1:54321/storage/v1/object/public/payment-proofs/00000000-0000-0000-0000-000000000001/06c2ad33-7ec6-47b8-adb1-360bf03ec9f7.pdf", "verification_date": null, "status_update_notes": null}', '2025-06-04 13:13:27.512788+00'),
	('5b25e16d-626c-49c2-9316-393f470c8144', NULL, 'INSERT', 'payments', '591c80b8-7072-40f2-befc-312073435260', NULL, '{"id": "591c80b8-7072-40f2-befc-312073435260", "amount": 10000.00, "status": "pending_verification", "country": "CY", "user_id": null, "currency": "USD", "metadata": null, "created_at": "2025-06-04T13:13:33.243+00:00", "updated_at": "2025-06-04T13:13:33.251021+00:00", "description": null, "merchant_id": "13ade00b-13de-4556-884c-9b1e532dcb03", "verified_by": null, "customer_name": "hggh", "customer_email": "afriglobalImports@gmail.com", "payment_method": "Klarna", "checkout_link_id": "57df9831-b587-49f3-af9f-535301d7b90d", "payment_proof_url": "http://127.0.0.1:54321/storage/v1/object/public/payment-proofs/13ade00b-13de-4556-884c-9b1e532dcb03/1c1ad0b2-aee6-478f-95e5-f2e548147ed4.jpg", "verification_date": null, "status_update_notes": null}', '2025-06-04 13:13:33.251021+00'),
	('c221e7d4-f83b-4b52-8730-e3ab32cb8023', '13ade00b-13de-4556-884c-9b1e532dcb03', 'UPDATE', 'payments', 'eeac4219-1e0e-49dc-b1c3-8b2622775814', '{"id": "eeac4219-1e0e-49dc-b1c3-8b2622775814", "amount": 10000.00, "status": "pending_verification", "country": "CY", "user_id": null, "currency": "USD", "metadata": null, "created_at": "2025-06-04T13:06:09.105+00:00", "updated_at": "2025-06-04T13:06:09.109987+00:00", "description": null, "merchant_id": "13ade00b-13de-4556-884c-9b1e532dcb03", "verified_by": null, "customer_name": "hggh", "customer_email": "afriglobalImports@gmail.com", "payment_method": "Klarna", "checkout_link_id": "57df9831-b587-49f3-af9f-535301d7b90d", "payment_proof_url": "http://127.0.0.1:54321/storage/v1/object/public/payment-proofs/13ade00b-13de-4556-884c-9b1e532dcb03/958602a0-6d6f-4061-9755-5477adf088b7.jpg", "verification_date": null, "status_update_notes": null}', '{"id": "eeac4219-1e0e-49dc-b1c3-8b2622775814", "amount": 10000.00, "status": "completed", "country": "CY", "user_id": null, "currency": "USD", "metadata": null, "created_at": "2025-06-04T13:06:09.105+00:00", "updated_at": "2025-06-04T13:24:48.15513+00:00", "description": null, "merchant_id": "13ade00b-13de-4556-884c-9b1e532dcb03", "verified_by": null, "customer_name": "hggh", "customer_email": "afriglobalImports@gmail.com", "payment_method": "Klarna", "checkout_link_id": "57df9831-b587-49f3-af9f-535301d7b90d", "payment_proof_url": "http://127.0.0.1:54321/storage/v1/object/public/payment-proofs/13ade00b-13de-4556-884c-9b1e532dcb03/958602a0-6d6f-4061-9755-5477adf088b7.jpg", "verification_date": null, "status_update_notes": null}', '2025-06-04 13:24:48.15513+00'),
	('ed480a2e-6c06-487e-a904-9c45d0c004c5', NULL, 'INSERT', 'payments', '7d0789c5-635b-430b-8fed-45f6ea053793', NULL, '{"id": "7d0789c5-635b-430b-8fed-45f6ea053793", "amount": 10000.00, "status": "pending_verification", "country": "CY", "user_id": null, "currency": "USD", "metadata": null, "created_at": "2025-06-04T13:25:28.134+00:00", "updated_at": "2025-06-04T13:25:28.136693+00:00", "description": null, "merchant_id": "13ade00b-13de-4556-884c-9b1e532dcb03", "verified_by": null, "customer_name": "frr", "customer_email": "afriglobalImports@gmail.com", "payment_method": "Klarna", "checkout_link_id": "57df9831-b587-49f3-af9f-535301d7b90d", "payment_proof_url": "http://127.0.0.1:54321/storage/v1/object/public/payment-proofs/13ade00b-13de-4556-884c-9b1e532dcb03/294ffa4f-793c-48a9-a9fb-68c342ef2490.jpg", "verification_date": null, "status_update_notes": null}', '2025-06-04 13:25:28.136693+00'),
	('9f25ee19-2ff0-4276-9e3a-08dec28a616c', '13ade00b-13de-4556-884c-9b1e532dcb03', 'UPDATE', 'payments', '7d0789c5-635b-430b-8fed-45f6ea053793', '{"id": "7d0789c5-635b-430b-8fed-45f6ea053793", "amount": 10000.00, "status": "pending_verification", "country": "CY", "user_id": null, "currency": "USD", "metadata": null, "created_at": "2025-06-04T13:25:28.134+00:00", "updated_at": "2025-06-04T13:25:28.136693+00:00", "description": null, "merchant_id": "13ade00b-13de-4556-884c-9b1e532dcb03", "verified_by": null, "customer_name": "frr", "customer_email": "afriglobalImports@gmail.com", "payment_method": "Klarna", "checkout_link_id": "57df9831-b587-49f3-af9f-535301d7b90d", "payment_proof_url": "http://127.0.0.1:54321/storage/v1/object/public/payment-proofs/13ade00b-13de-4556-884c-9b1e532dcb03/294ffa4f-793c-48a9-a9fb-68c342ef2490.jpg", "verification_date": null, "status_update_notes": null}', '{"id": "7d0789c5-635b-430b-8fed-45f6ea053793", "amount": 10000.00, "status": "completed", "country": "CY", "user_id": null, "currency": "USD", "metadata": null, "created_at": "2025-06-04T13:25:28.134+00:00", "updated_at": "2025-06-04T13:25:47.384748+00:00", "description": null, "merchant_id": "13ade00b-13de-4556-884c-9b1e532dcb03", "verified_by": null, "customer_name": "frr", "customer_email": "afriglobalImports@gmail.com", "payment_method": "Klarna", "checkout_link_id": "57df9831-b587-49f3-af9f-535301d7b90d", "payment_proof_url": "http://127.0.0.1:54321/storage/v1/object/public/payment-proofs/13ade00b-13de-4556-884c-9b1e532dcb03/294ffa4f-793c-48a9-a9fb-68c342ef2490.jpg", "verification_date": null, "status_update_notes": null}', '2025-06-04 13:25:47.384748+00');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "email", "created_at", "role", "active") VALUES
	('00000000-0000-0000-0000-000000000001', 'admin@pxvpay.com', '2025-06-04 11:18:53.370471+00', 'super_admin', true),
	('13ade00b-13de-4556-884c-9b1e532dcb03', 'afriglobalImports@gmail.com', '2025-06-04 11:22:12.589+00', 'registered_user', true);


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."blog_posts" ("id", "title", "slug", "content", "excerpt", "featured_image", "published", "author_id", "created_at", "updated_at", "published_at", "meta_title", "meta_description", "tags") VALUES
	('d54ee8f9-2278-4faa-9246-4a8cc68f89f4', 'Test Blog Post with Featured Image - 1749044281134', 'test-blog-image-1749044281134', '
        <h2>Test Blog Post with Featured Image</h2>
        <p>This blog post was created to test the end-to-end functionality of blog image uploads.</p>
        <p>The featured image should be visible on:</p>
        <ul>
          <li>Landing page blog section</li>
          <li>Blog listing page</li>
          <li>This individual blog post page</li>
        </ul>
        <p>If you can see the featured image in all these locations, the functionality is working correctly!</p>
      ', 'This is a test blog post to verify that uploaded featured images display correctly on the landing page and throughout the application.', 'http://127.0.0.1:54321/storage/v1/object/public/blog-images/blog-posts/blog-featured-1749044281134.jpg', true, '00000000-0000-0000-0000-000000000001', '2025-06-04 13:38:01.302+00', '2025-06-04 13:38:01.354924+00', '2025-06-04 13:38:01.294+00', 'Test Blog Post with Featured Image - 1749044281134', 'Testing blog image upload functionality end-to-end', '{test,image-upload,featured-image}'),
	('aa3c0779-2999-460a-b617-597fb1a52b02', 'hew blog', 'hew-blog', '<h1><strong><em>Conférence de l’OMD- AOC à Kinshasa : </em></strong></h1><h1><strong><em>Le Vice-Président Amadou KONATÉ présente son bilan devant ses pairs</em></strong></h1><h1><strong><em>Kinshasa, capitale de la République Démocratique du Congo, accueille depuis lundi 26 mai 2025 les travaux préparatoires de la 30e réunion des Directeurs et Commissaires Généraux des Douanes de la région Afrique de l’Ouest et du Centre (AOC) de l’Organisation Mondiale des Douanes (OMD).</em></strong></h1><p>Ce rendez-vous stratégique, qui réunit les administrations douanières de 24 pays membres, avec comme thème central « pour une douane qui concrétise ses engagements en matière d’efficacité, de sécurité et de prospérité », a débuté par la réunion du Comité des Experts, présidée par l’Inspecteur Général Amadou KONATÉ, Vice-Président de la région AOC de l’OMD présent à Kinshasa depuis lundi.</p><p>Cette réunion des experts douaniers, qui se tient sur trois jours, constitue le socle technique sur lequel reposera la Conférence des Directeurs et Commissaires Généraux des Douanes, prévue les jeudi 29 et vendredi 30 mai 2025, toujours à Kinshasa. À cette occasion, le patron de la région douanière présentera son bilan annuel en tant que Vice-Président de la région AOC, dressant un état des lieux des actions entreprises au cours de l’année écoulée et des défis à venir pour l’espace douanier régional.</p><p>Vers une gouvernance douanière plus intégrée et efficace</p><p>Le Comité des Experts, instance dotée d’une haute compétence technique, se réunit deux fois par an afin d’analyser, d’harmoniser et de proposer des réformes en matière de procédures douanières, de facilitation des échanges, de lutte contre la fraude et de digitalisation des services.</p><p>Cette 30e session fait suite à la 29e réunion tenue à Niamey en novembre 2024, dont les recommandations et résolutions sont au cœur des débats actuels à Kinshasa. Les propositions issues des discussions des experts seront soumises à validation ou amendement par la Conférence des DGD en fin de semaine.</p><p>Dans son discours d’ouverture, le Vice Président a salué la qualité des travaux engagés à Niamey, tout en soulignant la nécessité de renforcer la coopération inter-administrations douanières, d’accélérer la modernisation des systèmes douaniers et de maintenir la lutte contre les trafics illicites comme priorité régionale.</p><p>Il n’a pas manqué d’engager les experts à travailler en particulier sur l’examen et l’adoption du Guide régional et du Manuel de procédures budgétaires et financières, documents cadres de la région, des propositions concrètes pour l’amélioration des contributions des pays membres et à trouver des solutions alternatives au financement des activités de la région ainsi que l’appropriation et la mise en cohérence du Plan Stratégique régional avec les Plans stratégiques internes. </p><p>Un leadership reconnu</p><p><strong><em>Depuis sa prise de fonction en tant que Vice-Président de la région AOC de l’OMD, l’Insp. Gal KONATÉ s’est illustré par un leadership fédérateur, en initiant plusieurs réformes et chantiers de coordination entre les administrations nationales. Sous son impulsion, des avancées notables ont été enregistrées, notamment en matière de renforcement des capacités, d’échange de données douanières et de standardisation des pratiques dans l’espace AOC.</em></strong></p><p>La réunion de Kinshasa apparaît ainsi comme une étape décisive pour l’avenir de la coopération douanière régionale, à un moment où les enjeux liés à la sécurité des frontières, à la facilitation du commerce et à la mobilisation des recettes douanières sont plus que jamais d’actualité.</p><p>Les regards sont désormais tournés vers la Conférence des Directeurs Généraux de ce jeudi 29 mai, où les grandes orientations douanières régionales seront entérinées, avec l’ambition d’asseoir une intégration plus profonde des économies régionales à travers des douanes modernes, performantes et interconnectées.</p><p>CCOM-CAB-OMD-AOC</p>', 'Plans stratégiques internes. 
Un leadership reconnu', 'http://127.0.0.1:54321/storage/v1/object/public/blog-images/blog-posts/0c3dbfc3-d04b-421c-aff4-94f74390ff6e.jpg', true, '00000000-0000-0000-0000-000000000001', '2025-06-04 13:55:04.2276+00', '2025-06-04 13:55:11.867503+00', '2025-06-04 13:55:11.867503+00', '', '', '{}'),
	('83df493f-2026-4e86-a275-cb5ab3b2d5c7', 'blog', 'blog', '<p>Error: Permission denied. Please use the URL input below instead.</p><p>    at handleImageUpload (webpack-internal:///(app-pages-browser)/./src/app/(admin)/blog-management/new/BlogPostForm.tsx:130:27)</p>', 'ygyg', 'http://127.0.0.1:54321/storage/v1/object/public/blog-images/blog-posts/6e2eac44-4086-4f2d-b436-3b5db859d352.jpg', true, '00000000-0000-0000-0000-000000000001', '2025-06-04 14:04:33.030889+00', '2025-06-04 14:04:47.804187+00', '2025-06-04 14:04:47.804187+00', '', '', '{}');


--
-- Data for Name: product_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product_templates" ("id", "user_id", "product_key", "name", "description", "short_description", "price", "currency", "pricing_type", "min_price", "max_price", "category", "tags", "featured_image", "gallery_images", "content_blocks", "features", "specifications", "seo_title", "seo_description", "is_active", "is_featured", "created_at", "updated_at") VALUES
	('9ad8999f-85b5-4856-806d-42baa5675e6e', '13ade00b-13de-4556-884c-9b1e532dcb03', 'bufferlo', 'Bufferlo', '<p> Automatisez et déployez vos messages à grande échelle avec Getyn MessageBot !</p><p>Envie de ne plus jongler entre les messages sur WhatsApp, Telegram et SMS ?</p><p> Avec Getyn MessageBot, vous pouvez :</p><p>Lancer des campagnes de diffusion sur WhatsApp et Telegram</p><p> Envoyer des messages en masse instantanément</p><p> Créer des chatbots et des workflows intelligents</p><p> Gérer toutes vos conversations dans une boîte de réception unifiée</p><p> Lancer des campagnes de marketing SMS ciblées</p><p> Parfait pour les marketeurs, les entreprises et les agences qui cherchent à booster leur engagement et leurs conversions !</p><p> Commencez à automatiser vos communications dès maintenant avec Getyn MessageBot !</p>', NULL, NULL, 'USD', 'fixed', NULL, NULL, 'digital', NULL, 'http://127.0.0.1:54321/storage/v1/object/public/product-images/13ade00b-13de-4556-884c-9b1e532dcb03/1749040711184-5hxhoajtaom.jpg', NULL, '[]', NULL, '{}', NULL, NULL, true, false, '2025-06-04 12:39:07.842354+00', '2025-06-04 12:39:07.842354+00');


--
-- Data for Name: checkout_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."checkout_links" ("id", "merchant_id", "slug", "link_name", "active_country_codes", "is_active", "logo_url", "checkout_page_heading", "payment_review_message", "created_at", "updated_at", "title", "amount", "currency", "status", "amount_type", "min_amount", "max_amount", "checkout_type", "product_name", "product_description", "product_image_url", "product_template_id", "custom_price") VALUES
	('74665f2e-e0d7-47b6-beba-72ebc4b8f2fe', '00000000-0000-0000-0000-000000000001', 'simple-payment', 'Simple Payment Link', '{US,GB,DE}', true, NULL, 'Complete Your Payment', 'Thank you! Your payment is being reviewed and you will receive confirmation shortly.', '2025-06-04 11:18:53.423711+00', '2025-06-04 11:18:53.423711+00', 'Simple Payment', 0.00, 'USD', 'draft', 'flexible', 10.00, 1000.00, 'simple', NULL, NULL, NULL, NULL, NULL),
	('daad94ab-e309-4fbf-8b64-25dc4a22bab7', '00000000-0000-0000-0000-000000000001', 'premium-course', 'Premium Course Link', '{US,GB}', true, NULL, 'Purchase Premium Course', 'Welcome to the Premium Course! You will receive access details via email once payment is confirmed.', '2025-06-04 11:18:53.423711+00', '2025-06-04 11:18:53.423711+00', 'Premium Course', 99.99, 'USD', 'draft', 'fixed', NULL, NULL, 'product', 'Premium Web Development Course', 'Complete full-stack web development course with React, Node.js, and database design. Includes 50+ hours of video content, projects, and lifetime access.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop', NULL, NULL),
	('3d1b3730-3329-420e-915d-8190930ddb7e', '13ade00b-13de-4556-884c-9b1e532dcb03', 'good-1749036314261', 'good', '{DE}', true, NULL, 'Complete Your Payment', 'Thank you for your payment. We will review and confirm within 24 hours.', '2025-06-04 11:25:14.276545+00', '2025-06-04 11:25:14.276545+00', 'good', 0.00, 'EUR', 'active', 'flexible', 10000.00, 70000000.00, 'simple', NULL, NULL, NULL, NULL, NULL),
	('57df9831-b587-49f3-af9f-535301d7b90d', '13ade00b-13de-4556-884c-9b1e532dcb03', 'hoo-1749041075147', 'hoo', '{CY}', true, NULL, 'Complete Your Payment', 'Thank you for your payment. We will review and confirm within 24 hours.', '2025-06-04 12:44:35.177309+00', '2025-06-04 12:44:35.177309+00', 'hoo', 0.00, 'EUR', 'active', 'fixed', NULL, NULL, 'product', NULL, NULL, NULL, '9ad8999f-85b5-4856-806d-42baa5675e6e', 10000.00);


--
-- Data for Name: content_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."content_templates" ("id", "user_id", "template_key", "title", "content", "content_type", "category", "language", "variables", "metadata", "is_active", "version", "created_at", "updated_at") VALUES
	('0b982f2f-86a6-4097-bd13-1942427d7573', '00000000-0000-0000-0000-000000000001', 'welcome_message', 'Welcome Message', 'Welcome to our secure payment portal. Please complete your payment safely.', 'text', 'checkout', 'en', '{}', '{}', true, 1, '2025-06-04 11:18:53.49465+00', '2025-06-04 11:18:53.49465+00'),
	('401127f4-afae-478a-ba68-a22de4b2ff21', '00000000-0000-0000-0000-000000000001', 'payment_instructions', 'Payment Instructions', 'Please follow the instructions below to complete your payment.', 'text', 'checkout', 'en', '{}', '{}', true, 1, '2025-06-04 11:18:53.49465+00', '2025-06-04 11:18:53.49465+00'),
	('fb8e3eaf-1efc-4b20-b661-147f73e71cf9', '00000000-0000-0000-0000-000000000001', 'success_message', 'Success Message', 'Your payment has been processed successfully. Thank you!', 'text', 'checkout', 'en', '{}', '{}', true, 1, '2025-06-04 11:18:53.49465+00', '2025-06-04 11:18:53.49465+00'),
	('9ca4dfec-cef8-458a-80b6-66b85b2e3143', '00000000-0000-0000-0000-000000000001', 'footer_text', 'Footer Text', 'Secure payments powered by PXV Pay', 'text', 'general', 'en', '{}', '{}', true, 1, '2025-06-04 11:18:53.49465+00', '2025-06-04 11:18:53.49465+00'),
	('3263714a-b287-4f07-99e8-1d1e8820978d', '00000000-0000-0000-0000-000000000001', 'support_contact', 'Support Contact', 'For support, please contact us.', 'text', 'general', 'en', '{}', '{}', true, 1, '2025-06-04 11:18:53.49465+00', '2025-06-04 11:18:53.49465+00');


--
-- Data for Name: currencies; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."currencies" ("id", "name", "code", "symbol", "status", "created_at", "updated_at", "user_id") VALUES
	('3e72832e-09c9-4df2-b4cf-5130222307f7', 'US Dollar', 'USD', '$', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('509c813e-2b28-4306-a9b0-ec94898fd74b', 'Euro', 'EUR', '€', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('f6c7d431-f784-46c6-a014-c35a2710018c', 'British Pound', 'GBP', '£', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('fa1466d0-33cd-4235-8afc-754e66890063', 'Japanese Yen', 'JPY', '¥', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('36a44885-5b13-469f-b9d0-d4a4c1da689e', 'Chinese Yuan', 'CNY', '¥', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('1cc65b77-be84-4595-80de-f5742f6c9b97', 'Canadian Dollar', 'CAD', 'C$', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('0175a84e-9c31-41fe-9110-1ff35b70a6a7', 'Australian Dollar', 'AUD', 'A$', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('c0bc941e-bee4-480a-9501-13098aedbed0', 'Swiss Franc', 'CHF', 'CHF', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('269252dd-aee2-4274-80bd-cfb250d16250', 'Swedish Krona', 'SEK', 'kr', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('d037d496-9471-4b96-896e-0ae0f3845fac', 'Norwegian Krone', 'NOK', 'kr', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('13a3ead3-94a2-4683-bf8d-7011de5deb2a', 'Danish Krone', 'DKK', 'kr', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('37fff521-66cf-47bb-a809-f562d1905075', 'Indian Rupee', 'INR', '₹', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('be1ad0fc-ce11-413d-bc68-a4e204653c26', 'Singapore Dollar', 'SGD', 'S$', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('62c22a39-07f8-4876-8b78-5aab450fb124', 'Hong Kong Dollar', 'HKD', 'HK$', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('e440a3ab-8c40-40fa-a89c-278297113304', 'South Korean Won', 'KRW', '₩', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('c22b1f4d-b904-461e-bf06-755fe834c255', 'Thai Baht', 'THB', '฿', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('c29ba640-eae0-4bc0-b122-c9930a1c28a9', 'Malaysian Ringgit', 'MYR', 'RM', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('b6d56d02-c503-4843-acdf-bfa267a4995c', 'Indonesian Rupiah', 'IDR', 'Rp', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('f346eea3-3642-4894-9b38-af644c2cc97e', 'Philippine Peso', 'PHP', '₱', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('fa4c0eb5-1984-4312-b9cc-674b138a95ca', 'Vietnamese Dong', 'VND', '₫', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('974d3ac4-368f-4a5e-a4eb-bf38e8b75d5c', 'Pakistani Rupee', 'PKR', '₨', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('28aa2cd2-6855-41d9-a178-7bb3cae04b60', 'Bangladeshi Taka', 'BDT', '৳', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('5286968e-ebfd-4ff9-9189-d1f65fec5105', 'Sri Lankan Rupee', 'LKR', 'Rs', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('c1303f91-4c44-4185-980b-7285e101d8d6', 'Nepalese Rupee', 'NPR', 'Rs', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('367828a1-5c4f-4de7-a5ad-0aae274f9513', 'UAE Dirham', 'AED', 'د.إ', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('78bfbbe9-cc0b-469a-821f-4228b90f4471', 'Saudi Riyal', 'SAR', '﷼', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('17ccb051-4538-49f4-a930-d124d003c79d', 'Qatari Riyal', 'QAR', '﷼', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('cc3191bb-6ede-4530-8d2c-1cf0c99521f3', 'Kuwaiti Dinar', 'KWD', 'د.ك', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('b5a0247e-10b8-4e97-a874-8f264460e59a', 'Bahraini Dinar', 'BHD', '.د.ب', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('d37ffafd-0a55-4192-9d01-ac04dd5362d3', 'Omani Rial', 'OMR', '﷼', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('05d8cdb5-df39-4c83-84d0-087c2640fd3d', 'Israeli Shekel', 'ILS', '₪', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('b3997633-ae67-4f05-9858-f87a8610dc30', 'Turkish Lira', 'TRY', '₺', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('be618412-f038-4c92-9684-915ae96e59e4', 'Iranian Rial', 'IRR', '﷼', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('208ddb0b-6ba5-47b2-bbd1-f8071c3368be', 'Lebanese Pound', 'LBP', 'ل.ل', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('c51751e9-9fbf-440e-882a-3e98187980bb', 'Jordanian Dinar', 'JOD', 'د.ا', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('5e245324-9c43-47bc-86dd-f7ed1fb1f4d6', 'South African Rand', 'ZAR', 'R', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('e0c0d1f8-9658-41ee-9d5b-60f341d49bc6', 'Nigerian Naira', 'NGN', '₦', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('7044edb6-aa27-408e-ace6-3b9cda9253d4', 'Kenyan Shilling', 'KES', 'KSh', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('35b1db00-b603-4069-b9f3-8712a26f742a', 'Ghanaian Cedi', 'GHS', 'GH₵', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('94e755ec-9243-42c7-a35f-b9b6a918ab5a', 'Egyptian Pound', 'EGP', 'E£', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('e87c8422-8084-476e-a18e-5d383d85254a', 'Moroccan Dirham', 'MAD', 'د.م.', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('439f2238-f647-4d65-a457-2903567efa5e', 'Tunisian Dinar', 'TND', 'د.ت', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('6cf25462-f3e5-4448-830f-bdd065329259', 'Algerian Dinar', 'DZD', 'د.ج', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('3597cda9-7b8b-423c-8a57-ca61633985f4', 'Ethiopian Birr', 'ETB', 'Br', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('7495e3f4-07d4-45da-86c9-6b93a2a1c77f', 'Ugandan Shilling', 'UGX', 'USh', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('34126e4b-6f2c-48fb-bb22-160f0435ab39', 'Tanzanian Shilling', 'TZS', 'TSh', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('a9824abf-3c2c-4754-bfdb-8c83ff58adc8', 'Rwandan Franc', 'RWF', 'RF', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('03d6aaef-a24c-4d1d-93e7-e617255d8de9', 'Zambian Kwacha', 'ZMW', 'ZK', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('4272569a-96e1-4344-89cb-0ba72342483b', 'Botswana Pula', 'BWP', 'P', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('6316ab65-0939-4676-ad9b-3117c347f062', 'Mexican Peso', 'MXN', '$', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('02c1c7f6-fe75-425b-a60a-5514b4bb7d1c', 'Brazilian Real', 'BRL', 'R$', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('e27e7671-7919-4f6b-9cf7-acf4d20a0da1', 'Argentine Peso', 'ARS', '$', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('b8922a8f-ffeb-409a-9b8e-a5bfe169a8a2', 'Chilean Peso', 'CLP', '$', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('bb499885-5b17-4b5b-a894-849528f5a4d2', 'Colombian Peso', 'COP', '$', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('b59b9049-d5f4-4910-a881-83066dc92246', 'Peruvian Sol', 'PEN', 'S/', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('98d2bc42-e7f7-4354-96aa-e19a73e7117b', 'Uruguayan Peso', 'UYU', '$U', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('4db167c6-a70e-4dd1-8cfb-8f5316b78c2c', 'Paraguayan Guarani', 'PYG', '₲', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('47e75bc3-cb19-4749-bbe2-3a1d50107ea4', 'Venezuelan Bolívar', 'VES', 'Bs', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('62a87b6f-5b5b-4c6c-afc3-8a04d8836b93', 'Costa Rican Colón', 'CRC', '₡', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('dc9d860d-c46f-4c92-8dd2-c8aa36cf8966', 'Guatemalan Quetzal', 'GTQ', 'Q', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('4a4b0575-4202-417f-a28f-7157aa2f5696', 'Panamanian Balboa', 'PAB', 'B/.', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('3e223451-46ff-4f90-8444-65e7931147c1', 'Jamaican Dollar', 'JMD', 'J$', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('0009c517-381a-4407-8df4-97577be47300', 'Dominican Peso', 'DOP', 'RD$', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('a927eb16-3156-4d2d-bf94-939df129a982', 'Ecuadorian Sucre', 'ECS', 'S/.', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('2a935aa0-7f8d-49ea-bdaa-857be6edb122', 'Polish Zloty', 'PLN', 'zł', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('cae2681c-48d3-4d23-8610-35fb127fada0', 'Czech Koruna', 'CZK', 'Kč', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('ea15881c-54d8-43f1-aeaf-9367d84f9e0f', 'Hungarian Forint', 'HUF', 'Ft', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('e1542121-7d73-4cad-a717-e3a81ac33ee6', 'Romanian Leu', 'RON', 'lei', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('03cc1d9e-a0bf-4bd1-867e-0ea0f7903574', 'Bulgarian Lev', 'BGN', 'лв', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('7ba1bf1e-d004-45ee-8ef3-01d85702738d', 'Croatian Kuna', 'HRK', 'kn', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('021b4395-6dad-42bd-a8dc-195f600a9903', 'Serbian Dinar', 'RSD', 'дин', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('737a18aa-a8e0-41b3-9ca2-b465dd74be3c', 'Ukrainian Hryvnia', 'UAH', '₴', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('7b1b0fde-ba74-4241-9984-63e187ab79e1', 'Russian Ruble', 'RUB', '₽', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('d4cd4e3d-b317-4f8a-8fd5-b97805969db9', 'Icelandic Krona', 'ISK', 'kr', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('51c12393-a7ed-4c93-ac32-39a36deddd62', 'New Zealand Dollar', 'NZD', 'NZ$', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('e79484d5-d0ce-4128-bc9f-1d80b55e3abe', 'Fijian Dollar', 'FJD', 'FJ$', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('a7ed6a0e-e619-4de4-a92e-849d6be5e70d', 'Papua New Guinea Kina', 'PGK', 'K', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('2e9760b8-cb90-490f-ac57-4c5b201aead7', 'Brunei Dollar', 'BND', 'B$', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('cce64657-9cdb-4ef7-84f9-0c801002bca6', 'Cambodian Riel', 'KHR', '៛', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('8563a78a-1fa8-4970-a221-3bbfba457bef', 'Laotian Kip', 'LAK', '₭', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('b0f3e174-37ea-41cd-8f4b-c2a96dabd7dc', 'Myanmar Kyat', 'MMK', 'K', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('f7288ebf-a782-4154-9cc5-1b4cf6a9f078', 'Mongolian Tugrik', 'MNT', '₮', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('dc39af0b-bbe1-48d8-bacf-f28d7deefa80', 'Maldivian Rufiyaa', 'MVR', 'Rf', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('87526bcd-86d7-43c0-8e95-0843523a9863', 'Afghan Afghani', 'AFN', '؋', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('a1373968-8aec-44bb-9e8e-db83e356e978', 'Kazakhstan Tenge', 'KZT', '₸', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('14a12ead-48e2-4846-ac26-3f3d224bb66f', 'Uzbekistan Som', 'UZS', 'сўм', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('9968e6b0-7ed1-4d37-8f99-039f438541ff', 'Georgian Lari', 'GEL', '₾', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL),
	('076ef49d-615b-4c84-ab22-1522176b74a5', 'Azerbaijani Manat', 'AZN', '₼', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL);


--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."countries" ("id", "name", "code", "status", "created_at", "updated_at", "user_id", "currency_code", "currency_id") VALUES
	('b98ccbae-f006-49d8-ab6e-8fe6874a026d', 'Afghanistan', 'AF', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'AFN', NULL),
	('4b283d76-0f5e-4b7b-a1fb-d771c39d9402', 'Albania', 'AL', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('1afcee90-7224-4aa9-b30d-cb23432972c8', 'Algeria', 'DZ', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'DZD', NULL),
	('cc7f7e87-96d5-4efa-9a68-143efd34d983', 'Argentina', 'AR', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'ARS', NULL),
	('cb19e210-528c-44fd-a187-4c66b7cf8f46', 'Australia', 'AU', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'AUD', NULL),
	('6449a5ef-abd7-4480-8119-8ec14892c418', 'Austria', 'AT', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('ac0eb36d-ea30-4d83-b5b1-2357d2b9d43a', 'Bangladesh', 'BD', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'BDT', NULL),
	('321c4f46-ab01-48f8-921f-a69fc557b965', 'Belgium', 'BE', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('b56355f1-fd4c-4208-a8c3-92777032299f', 'Brazil', 'BR', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'BRL', NULL),
	('3215839a-2f54-4db8-bfd2-8c219dcbda33', 'Canada', 'CA', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'CAD', NULL),
	('c8303726-012a-4fe7-a67a-b4c9759b6922', 'China', 'CN', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'CNY', NULL),
	('5b1f65c2-9600-4904-af49-ce4ca242d046', 'Colombia', 'CO', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'COP', NULL),
	('bef6d30e-b2ec-468b-ad5e-a92e67273b11', 'Denmark', 'DK', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'DKK', NULL),
	('fd42359c-5be4-4575-8673-0b59a911f564', 'Egypt', 'EG', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EGP', NULL),
	('e78de8b4-9cad-4637-88d5-d03f452f2127', 'Finland', 'FI', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('16307a95-eaf3-416c-b407-0089c1eca414', 'France', 'FR', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('dfc192e9-a6d3-4ea4-8fc6-43238e7e62f5', 'Ghana', 'GH', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'GHS', NULL),
	('318faff6-7a70-4416-a1fd-0c70ab74503b', 'Greece', 'GR', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('a5bc8ed0-18b1-4689-94e5-c44dee39d12f', 'Hong Kong', 'HK', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'HKD', NULL),
	('4e927982-86f2-4cdc-a847-4f774ce6af6e', 'India', 'IN', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'INR', NULL),
	('8753cf0e-14b9-4a8b-95b9-4d754c39625f', 'Indonesia', 'ID', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'IDR', NULL),
	('1b803e3b-d6fd-4b74-8971-7b52b7cda5f1', 'Ireland', 'IE', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('3daaf034-bbd1-4b89-924a-4652b10f0f76', 'Israel', 'IL', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'ILS', NULL),
	('331e7968-af8d-4b8d-9bc0-732153a23855', 'Italy', 'IT', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('e03ab1cb-ff9d-4d31-a594-a58d99ad3f60', 'Japan', 'JP', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'JPY', NULL),
	('b59d4aeb-93e6-4634-a20f-081e6392af33', 'Kenya', 'KE', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'KES', NULL),
	('0ce17acb-ea8d-499d-994d-7ce45dcb7f0d', 'Malaysia', 'MY', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'MYR', NULL),
	('dab930dc-2879-425c-bbeb-a8a63367152b', 'Mexico', 'MX', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'MXN', NULL),
	('e884b64e-51ea-4b8f-8ae1-edc685fb924f', 'Netherlands', 'NL', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('ef02969d-f491-4392-a407-07adeff2ed03', 'New Zealand', 'NZ', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'NZD', NULL),
	('416eea31-bea9-4465-b618-f7d5e8a038d6', 'Norway', 'NO', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'NOK', NULL),
	('bb90d6c0-976f-4fcb-92db-e6685cd07efc', 'Pakistan', 'PK', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'PKR', NULL),
	('d8d3fd99-2951-47ba-bf66-5f3f0fdd0153', 'Philippines', 'PH', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'PHP', NULL),
	('241f0d9b-9461-4b46-8652-86a7c0434cad', 'Poland', 'PL', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'PLN', NULL),
	('671cfb2c-923b-4e06-9ec6-067c7f4fe5f3', 'Portugal', 'PT', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('64fd8c83-0c14-4a32-8023-7a2d3ba335f9', 'Russia', 'RU', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'RUB', NULL),
	('fddcb7c7-7b43-4787-87c2-9e930f331d78', 'Saudi Arabia', 'SA', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'SAR', NULL),
	('8fe085b6-9176-4435-a5a5-77d5b14a4d25', 'Singapore', 'SG', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'SGD', NULL),
	('9a20ba6d-889c-4ab1-8715-98f3da197a37', 'South Africa', 'ZA', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'ZAR', NULL),
	('dea4f3cf-2072-4440-a802-0f3b10cf4013', 'South Korea', 'KR', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'KRW', NULL),
	('5d77be1a-5cfd-4754-a424-055da98ff91f', 'Spain', 'ES', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('7c0a292f-16e7-420e-84cd-898dd276b34f', 'Sweden', 'SE', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'SEK', NULL),
	('d5b1a357-a2b8-450b-b2fd-ee6f9533f588', 'Switzerland', 'CH', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'CHF', NULL),
	('9d6cf4c4-29d5-42b9-a465-b2ce061fa219', 'Thailand', 'TH', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'THB', NULL),
	('7f435d87-e461-4188-9ae4-ad58a42a8e94', 'Turkey', 'TR', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'TRY', NULL),
	('43ad5b15-400c-4c2b-96a3-459b02db483e', 'United Arab Emirates', 'AE', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'AED', NULL),
	('17eff57a-cf5b-4ce3-8e4e-f86183fbf208', 'Vietnam', 'VN', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'VND', NULL),
	('4f985a9e-09bf-483b-89ee-c3f3195e9c60', 'Angola', 'AO', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'USD', NULL),
	('cf2309a6-a867-4b62-b884-ddc18acbe711', 'Botswana', 'BW', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'BWP', NULL),
	('87cae6ac-8d61-4b75-aa24-f56213e45d25', 'Cameroon', 'CM', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('5dc1da87-97bf-43ea-ad69-2ecb30542927', 'Democratic Republic of Congo', 'CD', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'USD', NULL),
	('40e69fc2-7061-4a8d-aa4c-f8dc19d23e5d', 'Ethiopia', 'ET', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'ETB', NULL),
	('64781fc3-3a2c-4837-bb3b-f2da0ff43247', 'Ivory Coast', 'CI', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('0f597291-a910-4bb9-9ab7-b05d03c2b50e', 'Madagascar', 'MG', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'USD', NULL),
	('9752113c-f607-4611-ae02-3e909b764666', 'Morocco', 'MA', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'MAD', NULL),
	('05759c2c-f5ed-4153-927b-5beb3efd573e', 'Mozambique', 'MZ', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'USD', NULL),
	('abb48b3d-4e71-44ae-af3d-96b57aea6540', 'Rwanda', 'RW', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'RWF', NULL),
	('a7961565-c996-4ca3-b791-d0514af9c9e3', 'Senegal', 'SN', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('6913ee50-4ee1-431f-bdcf-5f294bd01277', 'Tanzania', 'TZ', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'TZS', NULL),
	('f34ad064-3194-4849-9420-3cd294be75ce', 'Tunisia', 'TN', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'TND', NULL),
	('dc309bdd-5b24-4c24-961c-b58e5f71de41', 'Uganda', 'UG', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'UGX', NULL),
	('b84ce9de-b73f-4e4a-bdbf-a6bcdb3fe68a', 'Zambia', 'ZM', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'ZMW', NULL),
	('46cf785c-c210-41a4-add1-2dd8be7739f6', 'Zimbabwe', 'ZW', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'USD', NULL),
	('cb6c7bbe-8f42-4bc8-810c-8b7086656bc1', 'Cambodia', 'KH', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'KHR', NULL),
	('ffc5d406-8467-4aa4-88d4-eb8d20ffe302', 'Iran', 'IR', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'IRR', NULL),
	('ff84d2cf-275d-4fb6-a778-b0f225014918', 'Iraq', 'IQ', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'USD', NULL),
	('3f57c4b7-1859-46c6-8685-2ac119064ac5', 'Jordan', 'JO', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'JOD', NULL),
	('edba06f6-efb2-4d36-ae76-b92cb3099097', 'Kazakhstan', 'KZ', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'KZT', NULL),
	('79b5c211-18de-4a8d-867d-1a447b495058', 'Kuwait', 'KW', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'KWD', NULL),
	('da9c0cb6-e46e-404f-b688-67ad573e8701', 'Lebanon', 'LB', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'LBP', NULL),
	('eddcb7d5-412b-4587-b463-67a32e5527c0', 'Myanmar', 'MM', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'MMK', NULL),
	('8e7e6301-7093-4438-9ab3-caddc869e332', 'Nepal', 'NP', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'NPR', NULL),
	('25e5f597-594e-43f7-92cc-4c643e9a427f', 'Oman', 'OM', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'OMR', NULL),
	('ef754215-fff2-4fd8-8d2c-19588e8d75ff', 'Qatar', 'QA', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'QAR', NULL),
	('d3436d2b-388c-4435-acbf-9516d6677709', 'Sri Lanka', 'LK', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'LKR', NULL),
	('ced5c8dd-7bec-469b-90aa-737fe3532e0c', 'Syria', 'SY', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'USD', NULL),
	('3ce93264-2066-4739-a81c-161b94740dc1', 'Taiwan', 'TW', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'USD', NULL),
	('97912856-56e8-41e8-b315-9926343d6ce3', 'Uzbekistan', 'UZ', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'UZS', NULL),
	('b50d24f4-17af-4a80-a9c0-c24331da9448', 'Yemen', 'YE', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'USD', NULL),
	('3c776274-9a2f-478f-9031-5158529eef73', 'Bulgaria', 'BG', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'BGN', NULL),
	('a5aaaf32-db63-48b6-bd43-b56d7d81f5ab', 'United States', 'US', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.55807+00', NULL, 'USD', '3e72832e-09c9-4df2-b4cf-5130222307f7'),
	('22c38010-55fb-4251-aec1-20f77c11a7ff', 'United Kingdom', 'GB', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.55807+00', NULL, 'GBP', 'f6c7d431-f784-46c6-a014-c35a2710018c'),
	('01f3dbad-f48f-4b9a-aa70-d167c8b031e3', 'Nigeria', 'NG', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.55807+00', NULL, 'NGN', 'e0c0d1f8-9658-41ee-9d5b-60f341d49bc6'),
	('801ad309-c2f7-4251-bb7e-21be9a7c69b2', 'Germany', 'DE', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.55807+00', NULL, 'EUR', '509c813e-2b28-4306-a9b0-ec94898fd74b'),
	('160de123-15a4-461b-958b-770c00b8f351', 'Croatia', 'HR', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('43a7f33e-1a85-4b22-900f-dd7c74ebf7eb', 'Czech Republic', 'CZ', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'CZK', NULL),
	('79ba11a8-efe7-4b5d-9636-9ebb9a90fab3', 'Estonia', 'EE', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('d2bb528e-c4b6-4ef3-9d9a-dc8b2fe34b57', 'Hungary', 'HU', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'HUF', NULL),
	('cead845b-40f1-42c7-8fc3-ba6594c9a006', 'Iceland', 'IS', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'ISK', NULL),
	('cffd1305-f586-42bb-b33e-28d9d3e04a2b', 'Latvia', 'LV', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('2c5a52c1-507d-43b9-8132-02ca5a1fa5c1', 'Lithuania', 'LT', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('5cd04e0d-1568-45d4-86ae-0b156a3dad0b', 'Luxembourg', 'LU', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('d1d79c33-08bc-41bd-9ff6-34cef7f9e48f', 'Malta', 'MT', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('41e6470e-2094-47c4-8921-8d09a63f3670', 'Romania', 'RO', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'RON', NULL),
	('81250b53-3928-4dc3-a992-421c92826c77', 'Serbia', 'RS', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'RSD', NULL),
	('c2a8aeff-066a-40ad-8370-a90f16b0830e', 'Slovakia', 'SK', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('8ab766f5-eb42-4825-9031-616388b54eb9', 'Slovenia', 'SI', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('6958cfa1-b835-46f6-ad8d-e33994d8e1ca', 'Ukraine', 'UA', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'UAH', NULL),
	('c404fcef-251a-4e37-bda4-5c20dcdc2d10', 'Chile', 'CL', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'CLP', NULL),
	('070c220b-4c33-4f91-a65e-088f35e7ea21', 'Costa Rica', 'CR', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'CRC', NULL),
	('33b74bdd-2084-4dbe-8189-0013baea7b1a', 'Cuba', 'CU', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'USD', NULL),
	('9a2432ab-8374-4368-aed7-9fa1b8627bb4', 'Dominican Republic', 'DO', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'DOP', NULL),
	('12540f5b-47e1-42b9-b037-474351023dc0', 'Ecuador', 'EC', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'USD', NULL),
	('14491eb9-59db-4251-a586-1a214b585d42', 'Guatemala', 'GT', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'GTQ', NULL),
	('41780539-135f-4683-a1b2-26101b24ccb4', 'Haiti', 'HT', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'USD', NULL),
	('6147c4f5-43b1-43eb-a59e-9ce281320f16', 'Honduras', 'HN', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'USD', NULL),
	('b96b959a-fc51-49d2-b527-452676a3a0ff', 'Jamaica', 'JM', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'JMD', NULL),
	('ea7438fb-2abb-4bb0-9007-d86934aedd92', 'Nicaragua', 'NI', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'USD', NULL),
	('bf970c61-de25-4888-9d91-952b32a9ac3f', 'Panama', 'PA', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'PAB', NULL),
	('603cf35a-6343-4785-a9a0-24a49c2325a4', 'Paraguay', 'PY', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'PYG', NULL),
	('2c63c4d8-be77-4b19-9d6a-cea161d8716e', 'Peru', 'PE', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'PEN', NULL),
	('690c6d27-8089-41d2-847d-a78934220bdb', 'Uruguay', 'UY', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'UYU', NULL),
	('9638fbe2-e380-47d1-ac2c-2e4f8502527b', 'Venezuela', 'VE', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'VES', NULL),
	('42874f0f-bd6d-41dd-b57d-d0d7b99ec6f2', 'Fiji', 'FJ', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'FJD', NULL),
	('426a3cf2-ff18-477e-9f5a-d21056542d23', 'Papua New Guinea', 'PG', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'PGK', NULL),
	('f45d88b9-7918-4a1d-8783-b412c3466544', 'Bahrain', 'BH', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'BHD', NULL),
	('c638e437-a842-400a-b8dc-3288d3ab33ce', 'Brunei', 'BN', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'BND', NULL),
	('2683432b-a395-4757-8ddb-e06a412e30b4', 'Cyprus', 'CY', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('f63b5cec-ae51-4fa3-9e7c-effb467f9491', 'Georgia', 'GE', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'GEL', NULL),
	('d72269b1-b168-49d5-b9f0-0fef2c647e71', 'Laos', 'LA', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'LAK', NULL),
	('b521fb57-5a24-4e50-97c9-30bdb366373c', 'Maldives', 'MV', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'MVR', NULL),
	('21ce0afa-43d5-46b2-a019-b4531a3ccc8d', 'Mongolia', 'MN', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'MNT', NULL),
	('4fc44592-32a9-431c-8157-e5d606f6d665', 'Montenegro', 'ME', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL),
	('a57aac97-cddf-4a9d-8e86-d9b08c7131ff', 'North Macedonia', 'MK', 'active', '2025-06-04 11:18:53.443724+00', '2025-06-04 11:18:53.443724+00', NULL, 'EUR', NULL);


--
-- Data for Name: merchant_checkout_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: merchants; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."merchants" ("id", "name", "description", "website", "status", "owner_id", "logo_url", "created_at", "updated_at") VALUES
	('00000000-0000-0000-0000-000000000001', 'Demo Merchant', 'Default demo merchant for testing', NULL, 'active', '00000000-0000-0000-0000-000000000001', NULL, '2025-06-04 13:00:09.073+00', '2025-06-04 13:00:09.114+00'),
	('13ade00b-13de-4556-884c-9b1e532dcb03', 'Merchant 13ade00b', 'Auto-created merchant', NULL, 'active', '13ade00b-13de-4556-884c-9b1e532dcb03', NULL, '2025-06-04 13:00:09.185+00', '2025-06-04 13:00:09.185+00');


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."notifications" ("id", "user_id", "title", "message", "type", "is_read", "data", "created_at") VALUES
	('2d47e4ee-b307-4e24-a94c-7ed02915467e', '13ade00b-13de-4556-884c-9b1e532dcb03', 'Welcome to PXV Pay!', 'Your account has been created successfully. Start by exploring your dashboard.', 'info', false, NULL, '2025-06-04 11:22:12.658176+00'),
	('da83f059-40c0-40a7-83f2-cd6a30660e06', '00000000-0000-0000-0000-000000000001', 'New Payment Received', 'Payment of 50 USD from Test Customer requires verification', 'success', false, '{"amount": 50, "currency": "USD", "payment_id": "4335a6a5-dc2e-4b83-83fd-106c7d3f02c2", "customer_name": "Test Customer", "checkout_link_id": "74665f2e-e0d7-47b6-beba-72ebc4b8f2fe"}', '2025-06-04 13:00:50.351449+00'),
	('2a4aabe6-60f9-4b24-866b-10460fe5433d', '00000000-0000-0000-0000-000000000001', 'New Payment Submitted', 'Payment verification needed: 50 USD from Test Customer', 'info', false, '{"amount": 50, "currency": "USD", "payment_id": "4335a6a5-dc2e-4b83-83fd-106c7d3f02c2", "merchant_id": "00000000-0000-0000-0000-000000000001", "customer_name": "Test Customer"}', '2025-06-04 13:00:50.366896+00'),
	('c574595f-d276-43b2-ade8-6ddaa39277bc', '00000000-0000-0000-0000-000000000001', 'New Payment Submitted', 'Payment verification needed: 10000 USD from hggh', 'info', false, '{"amount": 10000, "currency": "USD", "payment_id": "eeac4219-1e0e-49dc-b1c3-8b2622775814", "merchant_id": "13ade00b-13de-4556-884c-9b1e532dcb03", "customer_name": "hggh"}', '2025-06-04 13:06:09.183+00'),
	('0555cb1b-7280-41a4-a379-c78440361c77', '13ade00b-13de-4556-884c-9b1e532dcb03', 'New Payment Received', 'Payment of 10000 USD from hggh requires verification', 'success', true, '{"amount": 10000, "currency": "USD", "payment_id": "eeac4219-1e0e-49dc-b1c3-8b2622775814", "customer_name": "hggh", "checkout_link_id": "57df9831-b587-49f3-af9f-535301d7b90d"}', '2025-06-04 13:06:09.148464+00'),
	('87629153-3bd8-4479-af46-76ebaa69b19f', '00000000-0000-0000-0000-000000000001', 'New Payment Received', 'Payment of 75.5 USD from Test Customer - Image Upload requires verification', 'success', false, '{"amount": 75.5, "currency": "USD", "payment_id": "d7d2b31a-5a41-447c-acd2-50a778f98153", "customer_name": "Test Customer - Image Upload", "checkout_link_id": "74665f2e-e0d7-47b6-beba-72ebc4b8f2fe"}', '2025-06-04 13:13:04.316419+00'),
	('dd35d9f4-e43c-4f64-9c8f-3ab25d279fa1', '00000000-0000-0000-0000-000000000001', 'New Payment Submitted', 'Payment verification needed: 75.5 USD from Test Customer - Image Upload', 'info', false, '{"amount": 75.5, "currency": "USD", "payment_id": "d7d2b31a-5a41-447c-acd2-50a778f98153", "merchant_id": "00000000-0000-0000-0000-000000000001", "customer_name": "Test Customer - Image Upload"}', '2025-06-04 13:13:04.333933+00'),
	('424e0337-df53-4b42-9f00-508bdfc309fc', '00000000-0000-0000-0000-000000000001', 'New Payment Received', 'Payment of 150 USD from Test Customer - PDF Upload requires verification', 'success', false, '{"amount": 150, "currency": "USD", "payment_id": "a906b21f-6046-4893-8db8-7c44afe293bc", "customer_name": "Test Customer - PDF Upload", "checkout_link_id": "74665f2e-e0d7-47b6-beba-72ebc4b8f2fe"}', '2025-06-04 13:13:27.524553+00'),
	('21a67216-7061-4231-90c4-82f1365bf528', '00000000-0000-0000-0000-000000000001', 'New Payment Submitted', 'Payment verification needed: 150 USD from Test Customer - PDF Upload', 'info', false, '{"amount": 150, "currency": "USD", "payment_id": "a906b21f-6046-4893-8db8-7c44afe293bc", "merchant_id": "00000000-0000-0000-0000-000000000001", "customer_name": "Test Customer - PDF Upload"}', '2025-06-04 13:13:27.534923+00'),
	('b2696c89-6930-4d64-924d-5f8f8de344d8', '00000000-0000-0000-0000-000000000001', 'New Payment Submitted', 'Payment verification needed: 10000 USD from hggh', 'info', false, '{"amount": 10000, "currency": "USD", "payment_id": "591c80b8-7072-40f2-befc-312073435260", "merchant_id": "13ade00b-13de-4556-884c-9b1e532dcb03", "customer_name": "hggh"}', '2025-06-04 13:13:33.292065+00'),
	('6eab7c04-95fa-4cca-85a0-34404d95da16', '13ade00b-13de-4556-884c-9b1e532dcb03', 'New Payment Received', 'Payment of 10000 USD from hggh requires verification', 'success', true, '{"amount": 10000, "currency": "USD", "payment_id": "591c80b8-7072-40f2-befc-312073435260", "customer_name": "hggh", "checkout_link_id": "57df9831-b587-49f3-af9f-535301d7b90d"}', '2025-06-04 13:13:33.271221+00'),
	('66e2cd30-e4e5-45da-9850-d0f6999d5f25', NULL, 'Payment Completed', 'Your payment of 10000.00 USD has been completed.', 'success', false, '{"amount": 10000.00, "status": "completed", "currency": "USD", "payment_id": "eeac4219-1e0e-49dc-b1c3-8b2622775814"}', '2025-06-04 13:24:48.15513+00'),
	('10cc83c8-2c25-40db-98a7-5dc1ef02517d', '13ade00b-13de-4556-884c-9b1e532dcb03', 'New Payment Received', 'Payment of 10000 USD from frr requires verification', 'success', false, '{"amount": 10000, "currency": "USD", "payment_id": "7d0789c5-635b-430b-8fed-45f6ea053793", "customer_name": "frr", "checkout_link_id": "57df9831-b587-49f3-af9f-535301d7b90d"}', '2025-06-04 13:25:28.148599+00'),
	('7910a81f-8d6d-4d75-b56e-f0de9c02fc09', '00000000-0000-0000-0000-000000000001', 'New Payment Submitted', 'Payment verification needed: 10000 USD from frr', 'info', false, '{"amount": 10000, "currency": "USD", "payment_id": "7d0789c5-635b-430b-8fed-45f6ea053793", "merchant_id": "13ade00b-13de-4556-884c-9b1e532dcb03", "customer_name": "frr"}', '2025-06-04 13:25:28.163694+00'),
	('ce2d2fb4-b90a-4120-8a68-2d1f3d2b821e', NULL, 'Payment Completed', 'Your payment of 10000.00 USD has been completed.', 'success', false, '{"amount": 10000.00, "status": "completed", "currency": "USD", "payment_id": "7d0789c5-635b-430b-8fed-45f6ea053793"}', '2025-06-04 13:25:47.384748+00');


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."payment_methods" ("id", "name", "type", "countries", "status", "icon", "created_at", "updated_at", "instructions", "url", "user_id", "instructions_for_checkout", "display_order", "description", "custom_fields", "country_specific_details") VALUES
	('db725819-8c65-4cfd-a12b-3278c5ebadf1', 'Bank Transfer', 'bank_transfer', '{US,GB,DE}', 'active', NULL, '2025-06-04 11:18:53.423711+00', '2025-06-04 11:18:53.423711+00', NULL, NULL, '00000000-0000-0000-0000-000000000001', 'Please transfer the exact amount to our bank account:

Bank: Test Bank
Account: 123456789
Routing: 987654321

Include your payment ID in the reference.', 1, 'Direct bank transfer payment', '[]', '{}'),
	('98fedee2-95a7-49f2-8ef1-4f9064eed505', 'PayPal', 'digital_wallet', '{US,GB,DE}', 'active', NULL, '2025-06-04 11:18:53.423711+00', '2025-06-04 11:18:53.423711+00', NULL, NULL, '00000000-0000-0000-0000-000000000001', 'Send payment to: payments@testmerchant.com

Make sure to include your payment ID in the notes.', 2, 'PayPal payment', '[]', '{}'),
	('8525bf14-a823-43ef-9cac-419a34891d80', 'Bitcoin', 'cryptocurrency', '{US,GB,DE}', 'active', NULL, '2025-06-04 11:18:53.423711+00', '2025-06-04 11:18:53.423711+00', NULL, NULL, '00000000-0000-0000-0000-000000000001', 'Send Bitcoin to:

Address: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa

Minimum confirmations: 3
Include payment ID in transaction memo.', 3, 'Bitcoin payment', '[]', '{}'),
	('00f94005-c5ca-4890-b853-bb64644bcb6a', 'Airtel', 'manual', '{DE}', 'active', NULL, '2025-06-04 11:23:15.61325+00', '2025-06-04 11:23:15.61325+00', '', NULL, '13ade00b-13de-4556-884c-9b1e532dcb03', '', 0, 'good', '[]', '{"DE": {"url": null, "instructions": "1243", "custom_fields": [{"id": "field_1749036154212_7pvmb0g4h", "type": "text", "label": "airtel", "value": "54545", "required": false, "placeholder": ""}], "additional_info": ""}}'),
	('6e91885d-0fc6-4c8f-936f-c813b7ec02a2', 'Mobile Money', 'payment-link', '{DE}', 'active', NULL, '2025-06-04 11:24:21.230642+00', '2025-06-04 11:24:21.230642+00', '', 'https://www.google.com/search?q=Services+des+Douanes+du+Burkina+Faso&oq=Services+des+Douanes+du+Burkina+Faso&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIHCAEQIRiPAjIHCAIQIRiPAtIBBzY1NmowajSoAgCwAgE&sourceid=chrome&ie=UTF-8', '13ade00b-13de-4556-884c-9b1e532dcb03', '', 0, 'him', '[]', '{"DE": {"url": "https://www.google.com/search?q=Services+des+Douanes+du+Burkina+Faso&oq=Services+des+Douanes+du+Burkina+Faso&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIHCAEQIRiPAjIHCAIQIRiPAtIBBzY1NmowajSoAgCwAgE&sourceid=chrome&ie=UTF-8", "instructions": "", "custom_fields": [], "additional_info": ""}}'),
	('1da614a3-8f0d-49de-b57e-8027e57a1ddf', 'Klarna', 'manual', '{CY}', 'active', NULL, '2025-06-04 11:40:11.730337+00', '2025-06-04 11:40:11.730337+00', '', NULL, '13ade00b-13de-4556-884c-9b1e532dcb03', '', 0, 'home', '[]', '{"CY": {"url": null, "instructions": "", "custom_fields": [{"id": "field_1749037160774_lorjxcvqr", "type": "text", "label": "BTC - Adresse", "value": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", "required": false, "placeholder": ""}], "additional_info": ""}}'),
	('0fc2cc3e-ad39-42a2-accf-e82b6694b14b', 'Test Bank Transfer', 'manual', '{US,UK}', 'active', NULL, '2025-06-04 12:04:38.851729+00', '2025-06-04 12:04:38.851729+00', NULL, NULL, '00000000-0000-0000-0000-000000000001', 'General instructions for bank transfer', 0, 'Test bank transfer method', '[]', '{"UK": {"instructions": "UK-specific bank transfer instructions:\n\nBank: Test Bank UK\nSort Code: 12-34-56\nAccount: 87654321\n\nPlease include your payment reference.", "custom_fields": [{"id": "1", "type": "text", "label": "Sort Code", "value": "12-34-56", "required": true}, {"id": "2", "type": "text", "label": "Account Number", "value": "87654321", "required": true}, {"id": "3", "type": "text", "label": "Bank Name", "value": "Test Bank UK", "required": false}], "additional_info": "Faster payments available - typically instant."}, "US": {"instructions": "US-specific bank transfer instructions:\n\nBank: Test Bank USA\nAccount: 123456789\nRouting: 987654321\n\nInclude payment reference in transfer memo.", "custom_fields": [{"id": "1", "type": "text", "label": "Account Number", "value": "123456789", "required": true}, {"id": "2", "type": "text", "label": "Routing Number", "value": "987654321", "required": true}, {"id": "3", "type": "text", "label": "Bank Name", "value": "Test Bank USA", "required": false}], "additional_info": "Transfers usually take 1-2 business days to process."}}'),
	('f71d0b74-e8df-41bc-81f0-7f50cb88df01', 'Test Bank Transfer', 'manual', '{US,UK}', 'active', NULL, '2025-06-04 12:04:57.372018+00', '2025-06-04 12:04:57.372018+00', NULL, NULL, '00000000-0000-0000-0000-000000000001', 'General instructions for bank transfer', 0, 'Test bank transfer method', '[]', '{"UK": {"instructions": "UK-specific bank transfer instructions:\n\nBank: Test Bank UK\nSort Code: 12-34-56\nAccount: 87654321\n\nPlease include your payment reference.", "custom_fields": [{"id": "1", "type": "text", "label": "Sort Code", "value": "12-34-56", "required": true}, {"id": "2", "type": "text", "label": "Account Number", "value": "87654321", "required": true}, {"id": "3", "type": "text", "label": "Bank Name", "value": "Test Bank UK", "required": false}], "additional_info": "Faster payments available - typically instant."}, "US": {"instructions": "US-specific bank transfer instructions:\n\nBank: Test Bank USA\nAccount: 123456789\nRouting: 987654321\n\nInclude payment reference in transfer memo.", "custom_fields": [{"id": "1", "type": "text", "label": "Account Number", "value": "123456789", "required": true}, {"id": "2", "type": "text", "label": "Routing Number", "value": "987654321", "required": true}, {"id": "3", "type": "text", "label": "Bank Name", "value": "Test Bank USA", "required": false}], "additional_info": "Transfers usually take 1-2 business days to process."}}');


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."payments" ("id", "user_id", "merchant_id", "amount", "currency", "payment_method", "status", "country", "description", "metadata", "created_at", "updated_at", "customer_name", "customer_email", "payment_proof_url", "checkout_link_id", "status_update_notes", "verification_date", "verified_by") VALUES
	('d7d2b31a-5a41-447c-acd2-50a778f98153', NULL, '00000000-0000-0000-0000-000000000001', 75.50, 'USD', 'Bank Transfer', 'pending_verification', 'US', NULL, NULL, '2025-06-04 13:13:04.295+00', '2025-06-04 13:13:04.299798+00', 'Test Customer - Image Upload', 'test@example.com', 'http://127.0.0.1:54321/storage/v1/object/public/payment-proofs/00000000-0000-0000-0000-000000000001/da7a8af9-7ab3-4cdb-9deb-b4ddb904b93e.png', '74665f2e-e0d7-47b6-beba-72ebc4b8f2fe', NULL, NULL, NULL),
	('a906b21f-6046-4893-8db8-7c44afe293bc', NULL, '00000000-0000-0000-0000-000000000001', 150.00, 'USD', 'PayPal', 'pending_verification', 'US', NULL, NULL, '2025-06-04 13:13:27.51+00', '2025-06-04 13:13:27.512788+00', 'Test Customer - PDF Upload', 'test-pdf@example.com', 'http://127.0.0.1:54321/storage/v1/object/public/payment-proofs/00000000-0000-0000-0000-000000000001/06c2ad33-7ec6-47b8-adb1-360bf03ec9f7.pdf', '74665f2e-e0d7-47b6-beba-72ebc4b8f2fe', NULL, NULL, NULL),
	('591c80b8-7072-40f2-befc-312073435260', NULL, '13ade00b-13de-4556-884c-9b1e532dcb03', 10000.00, 'USD', 'Klarna', 'pending_verification', 'CY', NULL, NULL, '2025-06-04 13:13:33.243+00', '2025-06-04 13:13:33.251021+00', 'hggh', 'afriglobalImports@gmail.com', 'http://127.0.0.1:54321/storage/v1/object/public/payment-proofs/13ade00b-13de-4556-884c-9b1e532dcb03/1c1ad0b2-aee6-478f-95e5-f2e548147ed4.jpg', '57df9831-b587-49f3-af9f-535301d7b90d', NULL, NULL, NULL),
	('eeac4219-1e0e-49dc-b1c3-8b2622775814', NULL, '13ade00b-13de-4556-884c-9b1e532dcb03', 10000.00, 'USD', 'Klarna', 'completed', 'CY', NULL, NULL, '2025-06-04 13:06:09.105+00', '2025-06-04 13:24:48.15513+00', 'hggh', 'afriglobalImports@gmail.com', 'http://127.0.0.1:54321/storage/v1/object/public/payment-proofs/13ade00b-13de-4556-884c-9b1e532dcb03/958602a0-6d6f-4061-9755-5477adf088b7.jpg', '57df9831-b587-49f3-af9f-535301d7b90d', NULL, NULL, NULL),
	('7d0789c5-635b-430b-8fed-45f6ea053793', NULL, '13ade00b-13de-4556-884c-9b1e532dcb03', 10000.00, 'USD', 'Klarna', 'completed', 'CY', NULL, NULL, '2025-06-04 13:25:28.134+00', '2025-06-04 13:25:47.384748+00', 'frr', 'afriglobalImports@gmail.com', 'http://127.0.0.1:54321/storage/v1/object/public/payment-proofs/13ade00b-13de-4556-884c-9b1e532dcb03/294ffa4f-793c-48a9-a9fb-68c342ef2490.jpg', '57df9831-b587-49f3-af9f-535301d7b90d', NULL, NULL, NULL);


--
-- Data for Name: themes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."themes" ("id", "user_id", "name", "primary_color", "secondary_color", "accent_color", "background_color", "text_color", "border_color", "success_color", "warning_color", "error_color", "font_family", "border_radius", "logo_url", "favicon_url", "custom_css", "is_active", "created_at", "updated_at") VALUES
	('a39383dc-e091-4921-b44a-a8c9147d2998', '00000000-0000-0000-0000-000000000001', 'Default Theme', '#3b82f6', '#64748b', '#06b6d4', '#ffffff', '#0f172a', '#e2e8f0', '#22c55e', '#f59e0b', '#ef4444', 'Inter', 'medium', NULL, NULL, NULL, true, '2025-06-04 11:18:53.49465+00', '2025-06-04 11:18:53.49465+00');


--
-- Data for Name: theme_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_limits; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_limits" ("id", "user_id", "user_role", "max_checkout_links", "current_checkout_links", "max_monthly_payments", "current_monthly_payments", "max_storage_mb", "current_storage_mb", "can_use_analytics", "can_use_webhooks", "can_customize_branding", "can_export_data", "created_at", "updated_at") VALUES
	('7bba0015-d9e1-41ba-ba38-61dd81e18d27', '00000000-0000-0000-0000-000000000001', 'registered_user', NULL, 2, NULL, 0, NULL, 0, true, true, true, true, '2025-06-04 11:18:53.370471+00', '2025-06-04 11:20:12.215632+00'),
	('feaf6f94-02c1-4ef3-aa59-13f777ece823', '13ade00b-13de-4556-884c-9b1e532dcb03', 'registered_user', 5, 2, 100, 0, 100, 0, true, true, true, true, '2025-06-04 11:22:12.531372+00', '2025-06-04 12:44:35.177309+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id") VALUES
	('product-images', 'product-images', NULL, '2025-06-04 11:18:53.21475+00', '2025-06-04 11:18:53.21475+00', true, false, 52428800, '{image/jpeg,image/png,image/gif,image/webp}', NULL),
	('payment-method-icons', 'payment-method-icons', NULL, '2025-06-04 11:18:53.370471+00', '2025-06-04 11:18:53.370471+00', true, false, 5242880, '{image/jpeg,image/png,image/gif,image/webp,image/svg+xml}', NULL),
	('user-avatars', 'user-avatars', NULL, '2025-06-04 11:18:53.370471+00', '2025-06-04 11:18:53.370471+00', true, false, 5242880, '{image/jpeg,image/png,image/gif,image/webp}', NULL),
	('checkout-assets', 'checkout-assets', NULL, '2025-06-04 11:18:53.370471+00', '2025-06-04 11:18:53.370471+00', true, false, 10485760, '{image/jpeg,image/png,image/gif,image/webp,image/svg+xml}', NULL),
	('theme-assets', 'theme-assets', NULL, '2025-06-04 11:18:53.370471+00', '2025-06-04 11:18:53.370471+00', true, false, 10485760, '{image/jpeg,image/png,image/gif,image/webp,image/svg+xml,text/css}', NULL),
	('payment-proofs', 'payment-proofs', NULL, '2025-06-04 11:18:53.423711+00', '2025-06-04 11:18:53.423711+00', true, false, 10485760, '{image/jpeg,image/png,image/gif,application/pdf}', NULL),
	('blog-images', 'blog-images', NULL, '2025-06-04 13:33:11.659585+00', '2025-06-04 13:33:11.659585+00', true, false, 5242880, '{image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/bmp}', NULL);


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "level") VALUES
	('9881729f-8381-40cd-bbe7-ed2d54bc28d4', 'product-images', '13ade00b-13de-4556-884c-9b1e532dcb03/1749040711184-5hxhoajtaom.jpg', '13ade00b-13de-4556-884c-9b1e532dcb03', '2025-06-04 12:38:31.765231+00', '2025-06-04 12:38:31.765231+00', '2025-06-04 12:38:31.765231+00', '{"eTag": "\"8a5c79c92d1c838fafba3d29331c6f2c\"", "size": 3641842, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-06-04T12:38:31.585Z", "contentLength": 3641842, "httpStatusCode": 200}', '50aab811-1404-4986-a15e-589b6b92da6e', '13ade00b-13de-4556-884c-9b1e532dcb03', '{}', 2),
	('9224715a-35a2-48b8-8e53-9d9a3eb653da', 'payment-proofs', '13ade00b-13de-4556-884c-9b1e532dcb03/03f2d4d3-5429-41ff-856d-4894e04f55d3.jpg', NULL, '2025-06-04 12:45:29.407148+00', '2025-06-04 12:45:29.407148+00', '2025-06-04 12:45:29.407148+00', '{"eTag": "\"8a5c79c92d1c838fafba3d29331c6f2c\"", "size": 3641842, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-06-04T12:45:29.369Z", "contentLength": 3641842, "httpStatusCode": 200}', 'e1d02f28-12b4-4cbb-bdff-d15b904dd96b', NULL, '{}', 2),
	('22f1bf5a-8abf-4c93-810b-65b0289bed42', 'payment-proofs', '13ade00b-13de-4556-884c-9b1e532dcb03/c4dd7ac5-13bc-4b2f-ad72-e04057f497cc.jpg', NULL, '2025-06-04 12:45:32.391429+00', '2025-06-04 12:45:32.391429+00', '2025-06-04 12:45:32.391429+00', '{"eTag": "\"8a5c79c92d1c838fafba3d29331c6f2c\"", "size": 3641842, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-06-04T12:45:32.345Z", "contentLength": 3641842, "httpStatusCode": 200}', '978a508a-f326-4bec-ac4e-4b7bbf0e2c62', NULL, '{}', 2),
	('1e1ff864-1663-4deb-ace8-5ea77cfff61f', 'payment-proofs', '13ade00b-13de-4556-884c-9b1e532dcb03/958602a0-6d6f-4061-9755-5477adf088b7.jpg', NULL, '2025-06-04 13:06:09.022739+00', '2025-06-04 13:06:09.022739+00', '2025-06-04 13:06:09.022739+00', '{"eTag": "\"8a5c79c92d1c838fafba3d29331c6f2c\"", "size": 3641842, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-06-04T13:06:08.978Z", "contentLength": 3641842, "httpStatusCode": 200}', '2cf97d62-0008-4688-aaa2-0f4d927f6030', NULL, '{}', 2),
	('ab0ed803-932c-4375-a2dc-07686099c9d1', 'payment-proofs', '00000000-0000-0000-0000-000000000001/da7a8af9-7ab3-4cdb-9deb-b4ddb904b93e.png', NULL, '2025-06-04 13:13:04.282256+00', '2025-06-04 13:13:04.282256+00', '2025-06-04 13:13:04.282256+00', '{"eTag": "\"b357a19c87624c7c4d131aeeb4ae677f\"", "size": 70, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-04T13:13:04.268Z", "contentLength": 70, "httpStatusCode": 200}', '44340217-d5f7-4fc3-93af-aea0dcafd182', NULL, '{}', 2),
	('60a225c4-ef6d-4cdd-9316-7e13d22b85d8', 'payment-proofs', '00000000-0000-0000-0000-000000000001/06c2ad33-7ec6-47b8-adb1-360bf03ec9f7.pdf', NULL, '2025-06-04 13:13:27.495216+00', '2025-06-04 13:13:27.495216+00', '2025-06-04 13:13:27.495216+00', '{"eTag": "\"a7471024a98fd63bc6421a111a9891fc\"", "size": 80, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-04T13:13:27.487Z", "contentLength": 80, "httpStatusCode": 200}', '0cf43aa6-1892-464c-9a5c-f4c01883a8a6', NULL, '{}', 2),
	('c8d46e2e-2bfd-4c3a-9cd9-4465de802120', 'payment-proofs', '13ade00b-13de-4556-884c-9b1e532dcb03/1c1ad0b2-aee6-478f-95e5-f2e548147ed4.jpg', NULL, '2025-06-04 13:13:33.116185+00', '2025-06-04 13:13:33.116185+00', '2025-06-04 13:13:33.116185+00', '{"eTag": "\"8a5c79c92d1c838fafba3d29331c6f2c\"", "size": 3641842, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-06-04T13:13:33.084Z", "contentLength": 3641842, "httpStatusCode": 200}', '90475dc6-7a9f-4df2-99ca-fe590fafa35f', NULL, '{}', 2),
	('48b72c80-8330-4a6e-bb2d-f19831e12f8d', 'payment-proofs', '13ade00b-13de-4556-884c-9b1e532dcb03/294ffa4f-793c-48a9-a9fb-68c342ef2490.jpg', NULL, '2025-06-04 13:25:28.119319+00', '2025-06-04 13:25:28.119319+00', '2025-06-04 13:25:28.119319+00', '{"eTag": "\"69d048cd51c7f15ae414c111433876bb\"", "size": 76818, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-06-04T13:25:28.115Z", "contentLength": 76818, "httpStatusCode": 200}', '8b4180db-6882-40b4-a799-437d170e630a', NULL, '{}', 2),
	('a1f78a17-b8b6-4b39-abc8-caf4529e3a0e', 'blog-images', 'blog-posts/blog-featured-1749044116997.png', NULL, '2025-06-04 13:35:17.071759+00', '2025-06-04 13:35:17.071759+00', '2025-06-04 13:35:17.071759+00', '{"eTag": "\"b357a19c87624c7c4d131aeeb4ae677f\"", "size": 70, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-04T13:35:17.064Z", "contentLength": 70, "httpStatusCode": 200}', '2611ed49-b473-4efc-9ea9-6d26007861ac', NULL, '{}', 2),
	('771534e1-a97c-47b5-afd3-67c6df0626d5', 'blog-images', 'blog-posts/blog-featured-1749044116997.jpg', NULL, '2025-06-04 13:35:17.103803+00', '2025-06-04 13:35:17.103803+00', '2025-06-04 13:35:17.103803+00', '{"eTag": "\"4f8e3a0974b116618a8d80139080d05e\"", "size": 283, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-06-04T13:35:17.099Z", "contentLength": 283, "httpStatusCode": 200}', 'fe2f6025-9981-41db-a4fe-8f9e7cb8f6f0', NULL, '{}', 2),
	('a42eab6c-f7c3-4573-96c9-f403b44484c0', 'blog-images', 'blog-posts/blog-featured-1749044281134.png', NULL, '2025-06-04 13:38:01.213106+00', '2025-06-04 13:38:01.213106+00', '2025-06-04 13:38:01.213106+00', '{"eTag": "\"b357a19c87624c7c4d131aeeb4ae677f\"", "size": 70, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-04T13:38:01.208Z", "contentLength": 70, "httpStatusCode": 200}', '60afe665-66d9-4dc8-9ad7-94dc4f1be051', NULL, '{}', 2),
	('8a229a30-3663-4c92-950b-a4d2bbd2d181', 'blog-images', 'blog-posts/blog-featured-1749044281134.jpg', NULL, '2025-06-04 13:38:01.236448+00', '2025-06-04 13:38:01.236448+00', '2025-06-04 13:38:01.236448+00', '{"eTag": "\"4f8e3a0974b116618a8d80139080d05e\"", "size": 283, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-06-04T13:38:01.234Z", "contentLength": 283, "httpStatusCode": 200}', 'dd72a64b-14bb-4a5b-8d46-b7ee67cf8cd0', NULL, '{}', 2),
	('0dd43291-4dee-4a18-aef2-732745c9d318', 'blog-images', 'blog-posts/0c3dbfc3-d04b-421c-aff4-94f74390ff6e.jpg', NULL, '2025-06-04 13:55:00.780626+00', '2025-06-04 13:55:00.780626+00', '2025-06-04 13:55:00.780626+00', '{"eTag": "\"8a5c79c92d1c838fafba3d29331c6f2c\"", "size": 3641842, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-06-04T13:55:00.719Z", "contentLength": 3641842, "httpStatusCode": 200}', '0bce2b66-3f6d-4ed3-ac57-da46fdc3c3c1', NULL, '{}', 2),
	('76006c0e-0f31-48c6-b579-ef5605af831c', 'blog-images', 'blog-posts/6e2eac44-4086-4f2d-b436-3b5db859d352.jpg', NULL, '2025-06-04 14:02:29.443187+00', '2025-06-04 14:02:29.443187+00', '2025-06-04 14:02:29.443187+00', '{"eTag": "\"6ff090f2356be7e5e013b94912a59edc\"", "size": 122535, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-06-04T14:02:29.424Z", "contentLength": 122535, "httpStatusCode": 200}', '3827f24a-1bf8-43ad-a1d9-b62cd745c838', NULL, '{}', 2);


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."prefixes" ("bucket_id", "name", "created_at", "updated_at") VALUES
	('product-images', '13ade00b-13de-4556-884c-9b1e532dcb03', '2025-06-04 12:38:31.765231+00', '2025-06-04 12:38:31.765231+00'),
	('payment-proofs', '13ade00b-13de-4556-884c-9b1e532dcb03', '2025-06-04 12:45:29.407148+00', '2025-06-04 12:45:29.407148+00'),
	('payment-proofs', '00000000-0000-0000-0000-000000000001', '2025-06-04 13:13:04.282256+00', '2025-06-04 13:13:04.282256+00'),
	('blog-images', 'blog-posts', '2025-06-04 13:35:17.071759+00', '2025-06-04 13:35:17.071759+00');


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

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 7, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
