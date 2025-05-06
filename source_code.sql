--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-05-04 13:21:03

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 157026)
-- Name: Blog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Blog" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    "imageUrl" text,
    published boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public."Blog" OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 156989)
-- Name: Store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Store" (
    id text NOT NULL,
    "businessName" text NOT NULL,
    category text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    "zipCode" text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    website text,
    "closingDate" timestamp(3) without time zone,
    "discountPercentage" integer,
    "inventoryDescription" text NOT NULL,
    "ownerName" text NOT NULL,
    "contactPreference" text NOT NULL,
    "storeImageUrl" text,
    "verificationDocUrl" text,
    latitude double precision,
    longitude double precision,
    "isApproved" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "openingDate" timestamp(3) without time zone,
    "specialOffers" text,
    "storeType" text,
    "reasonForClosing" text
);


ALTER TABLE public."Store" OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 157156)
-- Name: StoreImage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreImage" (
    id text NOT NULL,
    url text NOT NULL,
    "storeId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StoreImage" OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 157219)
-- Name: StoreStatusLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreStatusLog" (
    id text NOT NULL,
    store_id text NOT NULL,
    old_status boolean,
    new_status boolean,
    changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    changed_by text
);


ALTER TABLE public."StoreStatusLog" OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 157013)
-- Name: StoreTip; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreTip" (
    id text NOT NULL,
    "storeName" text NOT NULL,
    category text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    "zipCode" text NOT NULL,
    "submitterEmail" text NOT NULL,
    "storeImageUrl" text,
    latitude double precision,
    longitude double precision,
    status text DEFAULT 'pending'::text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "discountPercentage" integer,
    "storeType" text DEFAULT 'closing'::text NOT NULL
);


ALTER TABLE public."StoreTip" OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 157164)
-- Name: StoreTipImage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreTipImage" (
    id text NOT NULL,
    url text NOT NULL,
    "storeTipId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StoreTipImage" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 156998)
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    password text,
    image text,
    role text DEFAULT 'user'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "resetPasswordExpires" timestamp(3) without time zone,
    "resetPasswordToken" text,
    "verificationToken" text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 156980)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 4814 (class 2606 OID 157034)
-- Name: Blog Blog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Blog"
    ADD CONSTRAINT "Blog_pkey" PRIMARY KEY (id);


--
-- TOC entry 4818 (class 2606 OID 157163)
-- Name: StoreImage StoreImage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreImage"
    ADD CONSTRAINT "StoreImage_pkey" PRIMARY KEY (id);


--
-- TOC entry 4824 (class 2606 OID 157226)
-- Name: StoreStatusLog StoreStatusLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreStatusLog"
    ADD CONSTRAINT "StoreStatusLog_pkey" PRIMARY KEY (id);


--
-- TOC entry 4821 (class 2606 OID 157171)
-- Name: StoreTipImage StoreTipImage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreTipImage"
    ADD CONSTRAINT "StoreTipImage_pkey" PRIMARY KEY (id);


--
-- TOC entry 4812 (class 2606 OID 157021)
-- Name: StoreTip StoreTip_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreTip"
    ADD CONSTRAINT "StoreTip_pkey" PRIMARY KEY (id);


--
-- TOC entry 4806 (class 2606 OID 156997)
-- Name: Store Store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Store"
    ADD CONSTRAINT "Store_pkey" PRIMARY KEY (id);


--
-- TOC entry 4810 (class 2606 OID 157006)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 4801 (class 2606 OID 156988)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4815 (class 1259 OID 157036)
-- Name: Blog_published_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Blog_published_idx" ON public."Blog" USING btree (published);


--
-- TOC entry 4816 (class 1259 OID 157035)
-- Name: Blog_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Blog_slug_key" ON public."Blog" USING btree (slug);


--
-- TOC entry 4819 (class 1259 OID 157172)
-- Name: StoreImage_storeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StoreImage_storeId_idx" ON public."StoreImage" USING btree ("storeId");


--
-- TOC entry 4822 (class 1259 OID 157173)
-- Name: StoreTipImage_storeTipId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StoreTipImage_storeTipId_idx" ON public."StoreTipImage" USING btree ("storeTipId");


--
-- TOC entry 4802 (class 1259 OID 157025)
-- Name: Store_city_state_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Store_city_state_idx" ON public."Store" USING btree (city, state);


--
-- TOC entry 4803 (class 1259 OID 157023)
-- Name: Store_isApproved_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Store_isApproved_createdAt_idx" ON public."Store" USING btree ("isApproved", "createdAt");


--
-- TOC entry 4804 (class 1259 OID 157024)
-- Name: Store_isFeatured_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Store_isFeatured_idx" ON public."Store" USING btree ("isFeatured");


--
-- TOC entry 4807 (class 1259 OID 157043)
-- Name: Store_storeType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Store_storeType_idx" ON public."Store" USING btree ("storeType");


--
-- TOC entry 4808 (class 1259 OID 157007)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 4830 (class 2620 OID 157233)
-- Name: Store store_status_change_log; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER store_status_change_log AFTER UPDATE ON public."Store" FOR EACH ROW WHEN ((old."isApproved" IS DISTINCT FROM new."isApproved")) EXECUTE FUNCTION public.log_store_status_change();


--
-- TOC entry 4834 (class 2620 OID 157216)
-- Name: Blog update_blog_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_blog_timestamp BEFORE UPDATE ON public."Blog" FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- TOC entry 4831 (class 2620 OID 157215)
-- Name: Store update_store_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_store_timestamp BEFORE UPDATE ON public."Store" FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- TOC entry 4833 (class 2620 OID 157218)
-- Name: StoreTip update_storetip_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_storetip_timestamp BEFORE UPDATE ON public."StoreTip" FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- TOC entry 4832 (class 2620 OID 157217)
-- Name: User update_user_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_timestamp BEFORE UPDATE ON public."User" FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- TOC entry 4826 (class 2606 OID 157037)
-- Name: Blog Blog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Blog"
    ADD CONSTRAINT "Blog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4827 (class 2606 OID 157174)
-- Name: StoreImage StoreImage_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreImage"
    ADD CONSTRAINT "StoreImage_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4829 (class 2606 OID 157227)
-- Name: StoreStatusLog StoreStatusLog_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreStatusLog"
    ADD CONSTRAINT "StoreStatusLog_store_id_fkey" FOREIGN KEY (store_id) REFERENCES public."Store"(id);


--
-- TOC entry 4828 (class 2606 OID 157179)
-- Name: StoreTipImage StoreTipImage_storeTipId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreTipImage"
    ADD CONSTRAINT "StoreTipImage_storeTipId_fkey" FOREIGN KEY ("storeTipId") REFERENCES public."StoreTip"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4825 (class 2606 OID 157008)
-- Name: Store Store_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Store"
    ADD CONSTRAINT "Store_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4987 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE "Blog"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public."Blog" TO raeean;


--
-- TOC entry 4988 (class 0 OID 0)
-- Dependencies: 219
-- Name: TABLE "Store"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public."Store" TO raeean;


--
-- TOC entry 4989 (class 0 OID 0)
-- Dependencies: 223
-- Name: TABLE "StoreImage"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public."StoreImage" TO raeean;


--
-- TOC entry 4990 (class 0 OID 0)
-- Dependencies: 227
-- Name: TABLE "StoreStatusLog"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public."StoreStatusLog" TO raeean;


--
-- TOC entry 4991 (class 0 OID 0)
-- Dependencies: 221
-- Name: TABLE "StoreTip"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public."StoreTip" TO raeean;


--
-- TOC entry 4992 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE "StoreTipImage"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public."StoreTipImage" TO raeean;


--
-- TOC entry 4993 (class 0 OID 0)
-- Dependencies: 220
-- Name: TABLE "User"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public."User" TO raeean;


--
-- TOC entry 4994 (class 0 OID 0)
-- Dependencies: 218
-- Name: TABLE _prisma_migrations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public._prisma_migrations TO raeean;


-- Completed on 2025-05-04 13:21:03

--
-- PostgreSQL database dump complete
--

