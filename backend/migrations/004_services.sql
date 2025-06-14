CREATE TABLE IF NOT EXISTS public.services (
    id integer NOT NULL DEFAULT nextval('services_id_seq'::regclass),
    master_id integer,
    title character varying(100) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    price numeric(10,2) NOT NULL,
    duration interval NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    
    CONSTRAINT services_pkey PRIMARY KEY (id),
    
    CONSTRAINT services_master_id_fkey FOREIGN KEY (master_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.services OWNER TO postgres;

GRANT ALL ON TABLE public.services TO nail_user;
GRANT ALL ON TABLE public.services TO postgres;