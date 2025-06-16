CREATE SEQUENCE IF NOT EXISTS bookings_id_seq;
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE IF NOT EXISTS public.bookings (
    id integer NOT NULL DEFAULT nextval('bookings_id_seq'::regclass),
    client_id integer,
    service_id integer,
    work_slot_id integer,
    status character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'pending'::character varying,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    start_time time without time zone NOT NULL,
    duration interval NOT NULL,
    service_duration interval NOT NULL,
    date timestamp without time zone NOT NULL,
    
    CONSTRAINT bookings_pkey PRIMARY KEY (id),
    
    CONSTRAINT bookings_client_id_fkey FOREIGN KEY (client_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    
    CONSTRAINT bookings_service_id_fkey FOREIGN KEY (service_id)
        REFERENCES public.services (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    
    CONSTRAINT bookings_work_slot_id_fkey FOREIGN KEY (work_slot_id)
        REFERENCES public.work_slots (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    
    CONSTRAINT bookings_status_check CHECK (
        status::text = ANY (ARRAY['pending'::character varying, 'confirmed'::character varying, 'canceled'::character varying]::text[])
    ),
    
    CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (
        client_id WITH =,
        date WITH =,
        tsrange(date + start_time::interval, date + start_time::interval + duration) WITH &&
    )
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.bookings OWNER TO postgres;

REVOKE ALL ON TABLE public.bookings FROM nail_user;

GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE public.bookings TO nail_user;

GRANT ALL ON TABLE public.bookings TO postgres;

GRANT ALL PRIVILEGES ON SEQUENCE bookings_id_seq TO nail_user;
GRANT ALL PRIVILEGES ON SEQUENCE bookings_id_seq TO postgres;
