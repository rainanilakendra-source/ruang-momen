--
-- PostgreSQL database dump
--

\restrict mk3FqwwBAXzyEYorHx5TJyPQzDBYJERQNbThhZV8wPR0ETjeT7I5V8QzRigsyUH

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: EventType; Type: TYPE; Schema: public; Owner: ruang_momen_app
--

CREATE TYPE public."EventType" AS ENUM (
    'WEDDING',
    'BIRTHDAY',
    'GATHERING',
    'GRADUATION',
    'REUNION',
    'CORPORATE',
    'OTHER'
);


ALTER TYPE public."EventType" OWNER TO ruang_momen_app;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: ruang_momen_app
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO ruang_momen_app;

--
-- Name: events; Type: TABLE; Schema: public; Owner: ruang_momen_app
--

CREATE TABLE public.events (
    id text NOT NULL,
    owner_id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    type public."EventType" NOT NULL,
    event_date date NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    cover_storage_key text,
    guest_gallery_enabled boolean DEFAULT false NOT NULL,
    guest_upload_enabled boolean DEFAULT true NOT NULL,
    upload_ends_at timestamp(3) without time zone,
    upload_starts_at timestamp(3) without time zone,
    guest_download_enabled boolean DEFAULT false NOT NULL,
    plan_id text NOT NULL
);


ALTER TABLE public.events OWNER TO ruang_momen_app;

--
-- Name: features; Type: TABLE; Schema: public; Owner: ruang_momen_app
--

CREATE TABLE public.features (
    id text NOT NULL,
    name text NOT NULL,
    key text NOT NULL,
    description text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.features OWNER TO ruang_momen_app;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: ruang_momen_app
--

CREATE TABLE public.orders (
    id text NOT NULL,
    order_number text NOT NULL,
    user_id text NOT NULL,
    plan_id text NOT NULL,
    amount integer NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    payment_method_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO ruang_momen_app;

--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: ruang_momen_app
--

CREATE TABLE public.payment_methods (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    mode text NOT NULL,
    description text,
    bank_name text,
    account_name text,
    account_number text,
    qr_image_url text,
    provider text,
    instructions text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payment_methods OWNER TO ruang_momen_app;

--
-- Name: payment_proofs; Type: TABLE; Schema: public; Owner: ruang_momen_app
--

CREATE TABLE public.payment_proofs (
    id text NOT NULL,
    order_id text NOT NULL,
    file_url text NOT NULL,
    note text,
    uploaded_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.payment_proofs OWNER TO ruang_momen_app;

--
-- Name: photos; Type: TABLE; Schema: public; Owner: ruang_momen_app
--

CREATE TABLE public.photos (
    id text NOT NULL,
    event_id text NOT NULL,
    storage_key text NOT NULL,
    original_name text NOT NULL,
    mime_type text NOT NULL,
    size_bytes integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    source text,
    guest_name text,
    client_upload_id text
);


ALTER TABLE public.photos OWNER TO ruang_momen_app;

--
-- Name: plan_features; Type: TABLE; Schema: public; Owner: ruang_momen_app
--

CREATE TABLE public.plan_features (
    id text NOT NULL,
    plan_id text NOT NULL,
    feature_id text NOT NULL
);


ALTER TABLE public.plan_features OWNER TO ruang_momen_app;

--
-- Name: plan_limits; Type: TABLE; Schema: public; Owner: ruang_momen_app
--

CREATE TABLE public.plan_limits (
    id text NOT NULL,
    plan_id text NOT NULL,
    max_photos integer NOT NULL,
    max_storage_bytes bigint NOT NULL,
    max_active_days integer NOT NULL
);


ALTER TABLE public.plan_limits OWNER TO ruang_momen_app;

--
-- Name: plans; Type: TABLE; Schema: public; Owner: ruang_momen_app
--

CREATE TABLE public.plans (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    duration_days integer DEFAULT 0 NOT NULL,
    max_guests integer DEFAULT 0 NOT NULL,
    max_photos integer DEFAULT 0 NOT NULL,
    price integer DEFAULT 0 NOT NULL,
    slug text NOT NULL,
    storage_limit_mb integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.plans OWNER TO ruang_momen_app;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: ruang_momen_app
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    token_hash text NOT NULL,
    user_id text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sessions OWNER TO ruang_momen_app;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: ruang_momen_app
--

CREATE TABLE public.subscriptions (
    id text NOT NULL,
    user_id text NOT NULL,
    plan_id text NOT NULL,
    order_id text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    started_at timestamp(3) without time zone NOT NULL,
    expired_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO ruang_momen_app;

--
-- Name: users; Type: TABLE; Schema: public; Owner: ruang_momen_app
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text,
    image_url text,
    email_verified_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    role text DEFAULT 'USER'::text NOT NULL
);


ALTER TABLE public.users OWNER TO ruang_momen_app;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: ruang_momen_app
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
b2fe919e-e824-45ac-b0ad-46645734caef	e710c8f1a5d34ea006a5b0c74d75cab7865fe9cc22fccdfb1521946c9ff89750	2026-08-21 18:57:58.246522+07	20260821200000_add_payment_methods	\N	\N	2026-08-21 18:57:58.191281+07	1
b8a054f0-37e8-4151-b6e5-c71d0bada10b	a2f99b9998299667af7db58a68b0d9254c506b87eda20c7e57a74fafd8ab58a7	2026-08-21 10:09:35.246654+07	20260821030935_init_user	\N	\N	2026-08-21 10:09:35.222719+07	1
f6bb0fda-e2fc-43bd-8cfa-d1a1b82d0837	dfd7adcc8fba42b8594b6636e1336acc3ade6f32a548daf45a8a43ecc3b9980b	2026-08-21 11:02:27.207848+07	20260821040227_add_sessions	\N	\N	2026-08-21 11:02:27.157352+07	1
67c8e540-c255-4cf8-a828-7a84b04108a6	641033b2168985710b0eda720d843ceb2310f2b8bf33461e9679cd5fc5e2ce3b	2026-08-21 11:31:01.331337+07	20260821043101_add_events	\N	\N	2026-08-21 11:31:01.289164+07	1
603b0318-4113-4a23-a874-2d1025a061ef	04af82d26b7996ffc6a64934d758c6430a1e51b5a2bd1e944588115cbfd6e4fb	\N	20260821170000_add_plan_engine	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260821170000_add_plan_engine\n\nDatabase error code: 42P07\n\nDatabase error:\nERROR: relasi « plans » sudah ada\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P07), message: "relasi « plans » sudah ada", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("heap.c"), line: Some(1196), routine: Some("heap_create_with_catalog") }\n\n	2026-08-21 17:48:16.445239+07	2026-08-21 17:47:15.675473+07	0
8cf48c42-c529-4943-ba0a-816da2da0a0e	9270367c79015ddb558e8eca6213320f3cb5e45548d419e0f6ce92f489accc99	2026-08-21 12:34:35.119932+07	20260821053435_add_photos	\N	\N	2026-08-21 12:34:35.05087+07	1
9b383c92-aa37-4d4c-950d-e54638939fc2	04af82d26b7996ffc6a64934d758c6430a1e51b5a2bd1e944588115cbfd6e4fb	2026-08-21 17:48:16.44812+07	20260821170000_add_plan_engine		\N	2026-08-21 17:48:16.44812+07	0
5ac284b4-4468-467d-9a93-d724d00ee03d	95cee9a693750cbd2591fdc6d03ae61a534632342e375a656ad10941f3033dca	2026-08-21 15:37:36.621605+07	20260821083736_add_photo_source	\N	\N	2026-08-21 15:37:36.607695+07	1
9d5ffb51-1df7-4136-9b0f-4069132d3f56	f48b2902d131808f296839f6d373d237e2f111a0d729f475b44360d203d63f72	2026-08-21 17:46:17.1751+07	20260821104418_add_plan_engine	\N	2026-08-21 18:16:40.408859+07	2026-08-21 17:46:17.111053+07	1
b06d4b6d-7705-4fc9-99b6-e53c52a2b0f7	c5ec08ca8cd2f3fbb5a84e11144b387a5fc567f5d6c85c5d9144cbb32edfb27f	2026-08-21 16:06:01.47477+07	20260821090601_add_photo_guest_name	\N	\N	2026-08-21 16:06:01.463418+07	1
526e1982-84e5-43e1-9de5-5117418b8272	dfd91d584eab3d905e946bb01c3b2711e7b94a1e5e8edbf6915a1ac007cfe00b	2026-08-21 16:22:41.445799+07	20260821162216_add_photo_client_upload_id	\N	\N	2026-08-21 16:22:41.425351+07	1
7c5548d1-a988-4993-bd3b-562c48f62726	45f4c877cdef1d060e18f1185cc1255c021b0ae307326ac057ed3d93e1701ae9	2026-08-21 16:36:54.406769+07	20260821093654_add_event_settings	\N	\N	2026-08-21 16:36:54.388804+07	1
0929be9a-089f-4743-aa6c-468f22dfd1d0	8d6d08761a8c86630ad38f0e7380fcc7a970396176e8699c39bef247971a2b4f	2026-08-21 18:16:50.724188+07	20260821111650_add_user_role	\N	\N	2026-08-21 18:16:50.710204+07	1
1e4933e9-54ee-44ae-8912-c3e96a38883a	6554f92eb26c8afea0df0b9b8be1972a879cb3eaf301c04b6444f3a9d5d53e0c	2026-08-21 17:14:59.054247+07	20260821101459_add_guest_download_permission	\N	\N	2026-08-21 17:14:59.042981+07	1
37ab99c7-6a7b-49b4-bad8-5542f159ae89	e3475eadd0e389482faa9ac86bc825c0ecd7693cba9d4f99beec4f361f57ad74	\N	20260821104418_add_plan_engine	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260821104418_add_plan_engine\n\nDatabase error code: 23502\n\nDatabase error:\nERROR: column "plan_id" of relation "events" contains null values\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E23502), message: "column \\"plan_id\\" of relation \\"events\\" contains null values", detail: None, hint: None, position: None, where_: None, schema: Some("public"), table: Some("events"), column: Some("plan_id"), datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(6470), routine: Some("ATRewriteTable") }\n\n	2026-08-21 17:46:13.725491+07	2026-08-21 17:44:51.016598+07	0
57cfdc9a-6c5f-4df7-ac94-b55aaf6040eb	214a27ec4bb55a28aaf50197c9c337bf054f1adc2bf3b1be0d6723b121da817a	2026-08-21 19:06:50.352926+07	20260821210000_add_orders	\N	\N	2026-08-21 19:06:50.225147+07	1
80d422ee-57c6-4490-b337-24801d15c09a	c8bc3bd13df672c4d80415544b766f20fc1f1cd8471a91be9ebab6bce0646ae4	2026-08-21 18:37:21.413631+07	20260821180000_add_plan_manager	\N	\N	2026-08-21 18:37:21.376352+07	1
aa9e6a6d-56f3-402b-bf65-4a734cbac56b	8d7cc35ebe9dcff6f25e20e12b479affc9c1e9519b9008e52096421a1a12ade7	2026-08-21 18:48:08.86947+07	20260821190000_add_feature_manager	\N	\N	2026-08-21 18:48:08.784518+07	1
61bd7011-80af-4812-8e31-f8d129467770	ada70ff50c5b533f3454eb6baa97960fdf66c0750edd27a40eee0fe6032059f2	2026-08-21 19:52:01.887098+07	20260821220000_add_subscriptions	\N	\N	2026-08-21 19:52:01.821235+07	1
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: ruang_momen_app
--

COPY public.events (id, owner_id, name, slug, type, event_date, created_at, updated_at, cover_storage_key, guest_gallery_enabled, guest_upload_enabled, upload_ends_at, upload_starts_at, guest_download_enabled, plan_id) FROM stdin;
cmt2ghvia0001ogab0ctnta8m	cmt2ez50m000114ab9qtdvq36	Pernikahan Nadia & Raka	pernikahan-nadia-raka-6583aa	WEDDING	2026-12-20	2026-08-21 04:35:38.05	2026-08-21 04:35:38.05	\N	f	t	\N	\N	f	plan_basic
cmt2gi0ww0003ogabobgp5pse	cmt2ez6mj000214abu9wyehz0	Wisuda Mobile Test	wisuda-mobile-test-839674	GRADUATION	2026-12-21	2026-08-21 04:35:45.056	2026-08-21 04:35:45.056	\N	f	t	\N	\N	f	plan_basic
cmt2s0khz000294abs7vs586s	cmt2f2i7q000514abia6brl2m	nabil dan raka	nabil-dan-raka-469e88	WEDDING	2026-08-25	2026-08-21 09:58:06.023	2026-08-21 10:04:15.956	events/cmt2s0khz000294abs7vs586s/cover/237d9d97-aa2e-4e48-a86a-5ea9192f9759.png	f	t	\N	\N	f	plan_basic
cmt2h1xil0006ogabhrdk7hcl	cmt2f2i7q000514abia6brl2m	haji	haji-7bc5c4	BIRTHDAY	2026-08-27	2026-08-21 04:51:13.773	2026-08-21 10:32:27.784	\N	t	t	2026-08-26 10:06:00	2026-08-21 10:06:00	f	plan_basic
\.


--
-- Data for Name: features; Type: TABLE DATA; Schema: public; Owner: ruang_momen_app
--

COPY public.features (id, name, key, description, active, created_at, updated_at) FROM stdin;
feature_advanced_qr	Advanced Qr	advanced_qr	\N	t	2026-08-21 18:48:08.826	2026-08-21 18:48:08.826
feature_remove_branding	Remove Branding	remove_branding	\N	t	2026-08-21 18:48:08.826	2026-08-21 18:48:08.826
feature_reaction	Reaction	reaction	\N	t	2026-08-21 18:48:08.826	2026-08-21 18:48:08.826
feature_qr_source	Qr Source	qr_source	\N	t	2026-08-21 18:48:08.826	2026-08-21 18:48:08.826
feature_guest_upload	Guest Upload	guest_upload	Allow guests to upload moments.	t	2026-08-21 18:48:08.826	2026-08-21 19:02:34.173
feature_camera_mode	Camera Mode	camera_mode	Capture moments directly from the camera.	t	2026-08-21 18:48:15.814	2026-08-21 19:02:34.173
feature_gallery	Gallery	gallery	Allow access to the guest gallery.	t	2026-08-21 18:48:08.826	2026-08-21 19:02:34.173
feature_download_original	Download Original	download_original	Allow original-file downloads.	t	2026-08-21 18:48:08.826	2026-08-21 19:02:34.173
feature_zip_export	ZIP Export	zip_export	Export multiple moments as a ZIP archive.	t	2026-08-21 18:48:08.826	2026-08-21 19:02:34.173
feature_watermark	Watermark	watermark	Apply a watermark to shared moments.	t	2026-08-21 18:48:15.814	2026-08-21 19:02:34.173
feature_analytics	Analytics	analytics	Show event and gallery analytics.	t	2026-08-21 18:48:08.826	2026-08-21 19:02:34.173
feature_custom_branding	Custom Branding	custom_branding	Customize the event branding.	t	2026-08-21 18:48:08.826	2026-08-21 19:02:34.173
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: ruang_momen_app
--

COPY public.orders (id, order_number, user_id, plan_id, amount, status, payment_method_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: ruang_momen_app
--

COPY public.payment_methods (id, name, type, mode, description, bank_name, account_name, account_number, qr_image_url, provider, instructions, active, created_at, updated_at) FROM stdin;
payment_method_bank_transfer	Transfer Bank	BANK_TRANSFER	STATIC	\N	\N	\N	\N	\N	\N	\N	t	2026-08-21 18:58:06.162	2026-08-21 18:58:06.162
payment_method_qris	QRIS	QRIS	STATIC	\N	\N	\N	\N	\N	\N	\N	t	2026-08-21 18:58:06.162	2026-08-21 18:58:06.162
\.


--
-- Data for Name: payment_proofs; Type: TABLE DATA; Schema: public; Owner: ruang_momen_app
--

COPY public.payment_proofs (id, order_id, file_url, note, uploaded_at) FROM stdin;
\.


--
-- Data for Name: photos; Type: TABLE DATA; Schema: public; Owner: ruang_momen_app
--

COPY public.photos (id, event_id, storage_key, original_name, mime_type, size_bytes, created_at, source, guest_name, client_upload_id) FROM stdin;
\.


--
-- Data for Name: plan_features; Type: TABLE DATA; Schema: public; Owner: ruang_momen_app
--

COPY public.plan_features (id, plan_id, feature_id) FROM stdin;
feature_basic_guest_upload	plan_basic	feature_guest_upload
feature_basic_plus_guest_upload	plan_basic_plus	feature_guest_upload
feature_standard_guest_upload	plan_standard	feature_guest_upload
feature_standard_guest_gallery	plan_standard	feature_gallery
feature_standard_guest_download	plan_standard	feature_download_original
feature_standard_qr_source	plan_standard	feature_qr_source
feature_standard_reaction	plan_standard	feature_reaction
feature_standard_custom_theme	plan_standard	feature_custom_branding
feature_standard_plus_guest_upload	plan_standard_plus	feature_guest_upload
feature_standard_plus_guest_gallery	plan_standard_plus	feature_gallery
feature_standard_plus_guest_download	plan_standard_plus	feature_download_original
feature_standard_plus_qr_source	plan_standard_plus	feature_qr_source
feature_standard_plus_reaction	plan_standard_plus	feature_reaction
feature_standard_plus_custom_theme	plan_standard_plus	feature_custom_branding
feature_premium_guest_upload	plan_premium	feature_guest_upload
feature_premium_guest_gallery	plan_premium	feature_gallery
feature_premium_guest_download	plan_premium	feature_download_original
feature_premium_qr_source	plan_premium	feature_qr_source
feature_premium_reaction	plan_premium	feature_reaction
feature_premium_custom_theme	plan_premium	feature_custom_branding
feature_premium_remove_branding	plan_premium	feature_remove_branding
feature_premium_zip_export	plan_premium	feature_zip_export
feature_premium_analytics	plan_premium	feature_analytics
feature_premium_advanced_qr	plan_premium	feature_advanced_qr
feature_premium_plus_guest_upload	plan_premium_plus	feature_guest_upload
feature_premium_plus_guest_gallery	plan_premium_plus	feature_gallery
feature_premium_plus_guest_download	plan_premium_plus	feature_download_original
feature_premium_plus_qr_source	plan_premium_plus	feature_qr_source
feature_premium_plus_reaction	plan_premium_plus	feature_reaction
feature_premium_plus_custom_theme	plan_premium_plus	feature_custom_branding
feature_premium_plus_remove_branding	plan_premium_plus	feature_remove_branding
feature_premium_plus_zip_export	plan_premium_plus	feature_zip_export
feature_premium_plus_analytics	plan_premium_plus	feature_analytics
feature_premium_plus_advanced_qr	plan_premium_plus	feature_advanced_qr
plan_feature_standard_camera_mode	plan_standard	feature_camera_mode
plan_feature_standard_plus_camera_mode	plan_standard_plus	feature_camera_mode
plan_feature_premium_camera_mode	plan_premium	feature_camera_mode
plan_feature_premium_watermark	plan_premium	feature_watermark
plan_feature_premium_plus_camera_mode	plan_premium_plus	feature_camera_mode
plan_feature_premium_plus_watermark	plan_premium_plus	feature_watermark
\.


--
-- Data for Name: plan_limits; Type: TABLE DATA; Schema: public; Owner: ruang_momen_app
--

COPY public.plan_limits (id, plan_id, max_photos, max_storage_bytes, max_active_days) FROM stdin;
limit_basic_plus	plan_basic_plus	750	5368709120	7
limit_standard_plus	plan_standard_plus	3000	21474836480	30
limit_premium_plus	plan_premium_plus	12000	107374182400	90
limit_basic	plan_basic	500	1073741824	30
limit_standard	plan_standard	5000	10737418240	30
limit_premium	plan_premium	20000	53687091200	30
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: ruang_momen_app
--

COPY public.plans (id, code, name, description, is_active, created_at, updated_at, duration_days, max_guests, max_photos, price, slug, storage_limit_mb) FROM stdin;
plan_standard	STANDARD	Standard	\N	t	2026-08-21 17:48:20.061	2026-08-21 19:02:34.173	30	300	5000	99000	standard	10240
plan_premium	PREMIUM	Premium	\N	t	2026-08-21 17:48:20.061	2026-08-21 19:02:34.173	30	1000	20000	199000	premium	51200
plan_basic_plus	BASIC_PLUS	Basic Plus	\N	t	2026-08-21 17:48:20.061	2026-08-21 19:02:34.173	0	0	0	0	basic-plus	0
plan_standard_plus	STANDARD_PLUS	Standard Plus	\N	t	2026-08-21 17:48:20.061	2026-08-21 19:02:34.173	0	0	0	0	standard-plus	0
plan_premium_plus	PREMIUM_PLUS	Premium Plus	\N	t	2026-08-21 17:48:20.061	2026-08-21 19:02:34.173	0	0	0	0	premium-plus	0
plan_basic	BASIC	Basic	Default Ruang Momen plan	t	2026-08-21 17:46:17.145	2026-08-21 19:02:34.173	30	50	500	49000	basic	1024
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: ruang_momen_app
--

COPY public.sessions (id, token_hash, user_id, expires_at, created_at) FROM stdin;
cmt2fgzl80000asabc1h6noaa	299442aafb76803300b27649ee162c9bf5cbd4a7d227135402e1858ecb04f445	cmt2ez50m000114ab9qtdvq36	2026-08-28 04:06:57.053	2026-08-21 04:06:57.068
cmt2fhk210001asabr634y3md	ec30c1308df28d55902a9ba3a311c31b9a96c604caac0bab2aeffd56d66f3c83	cmt2ez50m000114ab9qtdvq36	2026-08-28 04:07:23.592	2026-08-21 04:07:23.593
cmt2ghuh60000ogab2i5h0s30	da2074786f215225abf8ce7357a543dcd6549f9935fd288cd0dd26a3bf0217b2	cmt2ez50m000114ab9qtdvq36	2026-08-28 04:35:36.693	2026-08-21 04:35:36.715
cmt2gi0b60002ogab0nbpv0pk	f58bcf2bb8f7dbffc36ed0e2172aa45a2c95d54bf2477f832d2632c56f1f37de	cmt2ez6mj000214abu9wyehz0	2026-08-28 04:35:44.272	2026-08-21 04:35:44.275
cmt2gi9rb0004ogabrffkna90	74ccae37537be127a67bbf321c544425228223c304f3f56887a53869d70a5aff	cmt2ez6mj000214abu9wyehz0	2026-08-28 04:35:56.518	2026-08-21 04:35:56.52
cmt2h1ah00005ogabgmai8wdk	60e997950fd0da7e4bded0e938a7b88cebd2b0af1d3f1ce7c12d7a28ef470483	cmt2f2i7q000514abia6brl2m	2026-08-28 04:50:43.907	2026-08-21 04:50:43.908
cmt2hq4hx00002kabl6pmirel	7d95976f3a1445de2a2915c39cb248649b1aff7edb9af2a98c46de470875d930	cmt2ez50m000114ab9qtdvq36	2026-08-28 05:10:02.543	2026-08-21 05:10:02.566
cmt2hq9m000012kabchv6xoqb	751a9822d903955a4f12ae56294fe0d3afa18f70b8a41f1c9b389a75e1bf9d7c	cmt2ez6mj000214abu9wyehz0	2026-08-28 05:10:09.189	2026-08-21 05:10:09.192
cmt2jo2r100036gab1irsizcx	91b1d6503d8566d958d2690960c57010a404e224e315a3da3d186dfa38aa02bc	cmt2f2i7q000514abia6brl2m	2026-08-28 06:04:26.22	2026-08-21 06:04:26.221
cmt2kvjib0008xkaba2akyudb	7c78ddbf5e5b9685a0c78ca85df055f3a6c15a8728cfa0a75228f1ae28ca3d7e	cmt2f2i7q000514abia6brl2m	2026-08-28 06:38:14.127	2026-08-21 06:38:14.148
cmt2nlq3e0002fgab2lqrvxjo	770ceddb1253a091927cef8b54bbf9424f471c8200801577011cea34d9e8e0b6	cmt2f2i7q000514abia6brl2m	2026-08-28 07:54:34.949	2026-08-21 07:54:34.97
cmt2npzys000094abk1bypy92	9ddea2ea9cb9d0c9dfe3c6fa4b7e523f2aef6d284791a816a3e9f8b4b3f2a696	cmt2f2i7q000514abia6brl2m	2026-08-28 07:57:54.362	2026-08-21 07:57:54.388
cmt2rztk9000194abd4eu72ma	cdfc5a11e49607902e7a3d4b7532fa953b7908df3d1411635c1bf101e71cf31d	cmt2f2i7q000514abia6brl2m	2026-08-28 09:57:31.111	2026-08-21 09:57:31.113
cmt2u69v90000zcabr4x1xxj7	c97c2339f8460294c9ff8185c29da97a9821f721e1c533956632f674e9d1fb2f	cmt2f2i7q000514abia6brl2m	2026-08-28 10:58:31.385	2026-08-21 10:58:31.413
cmt2x02be0000jwabm9n1vq0b	2430e4456035f07385e4c49ce1b20d60490ab988d323fd42d9c53b60491c7735	cmt2f2i7q000514abia6brl2m	2026-08-28 12:17:40.494	2026-08-21 12:17:40.539
cmt308vdp0000vcabaeqv4chq	083feb395c7cba54ba901ab84be0fa1d468ed305007fba4d626bcb83d092d639	cmt2f2i7q000514abia6brl2m	2026-08-28 13:48:30.253	2026-08-21 13:48:30.301
cmt30av920001vcab5apncnxt	4c5e1109b93c5e1209124955ebc407e6ef54f6d8a3bf9b5e8a0edf829e713854	cmt2f2i7q000514abia6brl2m	2026-08-28 13:50:03.444	2026-08-21 13:50:03.447
cmt30iuly000004abz1gk9vmg	a0af68917108c735b8882f4af198dedd3c66391ae5a8e51079b7665d94b32086	cmt2f2i7q000514abia6brl2m	2026-08-28 13:56:15.84	2026-08-21 13:56:15.863
cmt329kia000104abuwzires3	52a599b4946aad8d909e940d06f54263733afc5145fe3d8704ec07ecace17f94	cmt2f2i7q000514abia6brl2m	2026-08-28 14:45:02.092	2026-08-21 14:45:02.098
cmt329xkh000204ab288szrpq	e9cd1884a12cf4d5aefcb14a29ba9f17bc1ecc8a2bf42049236ea7b719cccfd5	cmt2f2i7q000514abia6brl2m	2026-08-28 14:45:19.023	2026-08-21 14:45:19.025
cmt32enu6000304ab3ybadnb6	120b346fb0d07a69aad729af61b18f2e2f46f8a4a2d5e1a961e06f93716449e7	cmt2f2i7q000514abia6brl2m	2026-08-28 14:48:59.694	2026-08-21 14:48:59.695
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: ruang_momen_app
--

COPY public.subscriptions (id, user_id, plan_id, order_id, status, started_at, expired_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ruang_momen_app
--

COPY public.users (id, name, email, password_hash, image_url, email_verified_at, created_at, updated_at, role) FROM stdin;
cmt2ejndx000014ab9wvfvep6	rm test	rm@ruangmoment.test	scrypt$131072$8$1$Km0zmfoWblFcQgfjK6PC0Q$iBoxnxbryL7o1YxJVYROtqaqHpRAtzoEACdcAzFvHb3ZdM5jUSCofAdp8cdoDe5SssZCOAvoa4Xh3GAN8CNCmA	\N	\N	2026-08-21 03:41:01.605	2026-08-21 03:41:01.605	USER
cmt2ez50m000114ab9qtdvq36	User Test	test1@example.test	scrypt$131072$8$1$hh3NYv8cYhQehKWpU-P5ng$spysbdwCP4hgS1CnEgmpwP2J9u-a2Z2HblmGu0wHTZRX1IV1ZWcKOYNjW3jpQg_4e5LwHvgLx4hphV4fAb1a_Q	\N	\N	2026-08-21 03:53:04.295	2026-08-21 03:53:04.295	USER
cmt2ez6mj000214abu9wyehz0	User Test	test2@example.test	scrypt$131072$8$1$m36RZczzgshDBbP9QwYvtg$RYlpg24yUtRwuJmhoYc9rikOaZ19WaWqjpajzIrtMVj1L-FbuyoN3n412TS5al6yi8Q1soucXq4tnEkSoEALSw	\N	\N	2026-08-21 03:53:06.379	2026-08-21 03:53:06.379	USER
cmt2ezmhm000414abaqcqo8ff	Rapid Test	test3@example.test	scrypt$131072$8$1$-FqM76VzlD3BTIztYu8Gyw$d0Bq5RIN0VoYYT6UAdTR8KkEm_d5y8aZXlLMLG4Rj7Mtk38RGml9-43Tkz2KMkabQHI5YArCiSJGieZXkD5ddQ	\N	\N	2026-08-21 03:53:26.938	2026-08-21 03:53:26.938	USER
cmt2f2i7q000514abia6brl2m	haji	haji@test.com	scrypt$131072$8$1$aVgNtOmkcca43FC9j29Zfw$q03u0lW48c2erMLkBkCrWQv8J5dxbq9ZsY3fKa4It26ZRvnVaNPJwvZt3a62gPZfhfZXL1lM-Duz6DGM6SAtFg	\N	\N	2026-08-21 03:55:41.366	2026-08-21 03:55:41.366	USER
cmt2f6mhe000614abm4ec8ixp	ak	ak@test.com	scrypt$131072$8$1$sXsf2Ff1_yJ0-NoymQk2VQ$erL8wehcux8KcswFqHscLiP_b9oZGcdpCctZyhjbqgZLO4_NNnDQpxxJ6eblEHbqAcRn7Z_xhRRg3kxR2FzODw	\N	\N	2026-08-21 03:58:53.523	2026-08-21 03:58:53.523	USER
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: features features_pkey; Type: CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.features
    ADD CONSTRAINT features_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: payment_proofs payment_proofs_pkey; Type: CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.payment_proofs
    ADD CONSTRAINT payment_proofs_pkey PRIMARY KEY (id);


--
-- Name: photos photos_pkey; Type: CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_pkey PRIMARY KEY (id);


--
-- Name: plan_features plan_features_pkey; Type: CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.plan_features
    ADD CONSTRAINT plan_features_pkey PRIMARY KEY (id);


--
-- Name: plan_limits plan_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.plan_limits
    ADD CONSTRAINT plan_limits_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: events_event_date_idx; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE INDEX events_event_date_idx ON public.events USING btree (event_date);


--
-- Name: events_owner_id_idx; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE INDEX events_owner_id_idx ON public.events USING btree (owner_id);


--
-- Name: events_plan_id_idx; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE INDEX events_plan_id_idx ON public.events USING btree (plan_id);


--
-- Name: events_slug_key; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE UNIQUE INDEX events_slug_key ON public.events USING btree (slug);


--
-- Name: features_key_key; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE UNIQUE INDEX features_key_key ON public.features USING btree (key);


--
-- Name: orders_order_number_key; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number);


--
-- Name: orders_payment_method_id_idx; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE INDEX orders_payment_method_id_idx ON public.orders USING btree (payment_method_id);


--
-- Name: orders_plan_id_idx; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE INDEX orders_plan_id_idx ON public.orders USING btree (plan_id);


--
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- Name: orders_user_id_idx; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE INDEX orders_user_id_idx ON public.orders USING btree (user_id);


--
-- Name: payment_methods_active_idx; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE INDEX payment_methods_active_idx ON public.payment_methods USING btree (active);


--
-- Name: payment_proofs_order_id_key; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE UNIQUE INDEX payment_proofs_order_id_key ON public.payment_proofs USING btree (order_id);


--
-- Name: photos_client_upload_id_key; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE UNIQUE INDEX photos_client_upload_id_key ON public.photos USING btree (client_upload_id);


--
-- Name: photos_event_id_idx; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE INDEX photos_event_id_idx ON public.photos USING btree (event_id);


--
-- Name: photos_storage_key_key; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE UNIQUE INDEX photos_storage_key_key ON public.photos USING btree (storage_key);


--
-- Name: plan_features_feature_id_idx; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE INDEX plan_features_feature_id_idx ON public.plan_features USING btree (feature_id);


--
-- Name: plan_features_plan_id_feature_id_key; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE UNIQUE INDEX plan_features_plan_id_feature_id_key ON public.plan_features USING btree (plan_id, feature_id);


--
-- Name: plan_limits_plan_id_key; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE UNIQUE INDEX plan_limits_plan_id_key ON public.plan_limits USING btree (plan_id);


--
-- Name: plans_code_key; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE UNIQUE INDEX plans_code_key ON public.plans USING btree (code);


--
-- Name: plans_slug_key; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE UNIQUE INDEX plans_slug_key ON public.plans USING btree (slug);


--
-- Name: sessions_expires_at_idx; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE INDEX sessions_expires_at_idx ON public.sessions USING btree (expires_at);


--
-- Name: sessions_token_hash_key; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE UNIQUE INDEX sessions_token_hash_key ON public.sessions USING btree (token_hash);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE INDEX sessions_user_id_idx ON public.sessions USING btree (user_id);


--
-- Name: subscriptions_order_id_key; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE UNIQUE INDEX subscriptions_order_id_key ON public.subscriptions USING btree (order_id);


--
-- Name: subscriptions_plan_id_idx; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE INDEX subscriptions_plan_id_idx ON public.subscriptions USING btree (plan_id);


--
-- Name: subscriptions_user_id_status_expired_at_idx; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE INDEX subscriptions_user_id_status_expired_at_idx ON public.subscriptions USING btree (user_id, status, expired_at);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: ruang_momen_app
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: events events_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: events events_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payment_proofs payment_proofs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.payment_proofs
    ADD CONSTRAINT payment_proofs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: photos photos_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: plan_features plan_features_feature_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.plan_features
    ADD CONSTRAINT plan_features_feature_id_fkey FOREIGN KEY (feature_id) REFERENCES public.features(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: plan_features plan_features_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.plan_features
    ADD CONSTRAINT plan_features_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: plan_limits plan_limits_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.plan_limits
    ADD CONSTRAINT plan_limits_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: subscriptions subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ruang_momen_app
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict mk3FqwwBAXzyEYorHx5TJyPQzDBYJERQNbThhZV8wPR0ETjeT7I5V8QzRigsyUH

