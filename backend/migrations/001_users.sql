CREATE TABLE IF NOT EXISTS public.users (
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    username character varying(50) COLLATE pg_catalog."default" NOT NULL,
    email character varying(100) COLLATE pg_catalog."default" NOT NULL,
    password_hash character varying(100) COLLATE pg_catalog."default" NOT NULL,
    role character varying(10) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    phone character varying(20) COLLATE pg_catalog."default",
    
    CONSTRAINT users_pkey PRIMARY KEY (id),
    
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username),
    
    CONSTRAINT users_role_check CHECK (
        role::text = ANY (ARRAY['master'::character varying, 'client'::character varying]::text[])
    )
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users OWNER TO postgres;

GRANT ALL ON TABLE public.users TO nail_user;
GRANT ALL ON TABLE public.users TO postgres;

