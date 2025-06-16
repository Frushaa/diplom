CREATE SEQUENCE IF NOT EXISTS notifications_id_seq;
CREATE TABLE IF NOT EXISTS public.notifications (
    id integer NOT NULL DEFAULT nextval('notifications_id_seq'::regclass),
    user_id integer,
    message text COLLATE pg_catalog."default" NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    booking_id integer,
    type character varying(20) COLLATE pg_catalog."default",
    
    CONSTRAINT notifications_pkey PRIMARY KEY (id),
    
    CONSTRAINT notifications_booking_id_fkey FOREIGN KEY (booking_id)
        REFERENCES public.bookings (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    
    CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    
    CONSTRAINT notifications_type_check CHECK (
        type::text = ANY (ARRAY['client'::character varying, 'master'::character varying]::text[])
    )
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.notifications OWNER TO postgres;

REVOKE ALL ON TABLE public.notifications FROM nail_user;
GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE public.notifications TO nail_user;
GRANT ALL ON TABLE public.notifications TO postgres;

GRANT ALL PRIVILEGES ON SEQUENCE notifications_id_seq TO nail_user;
GRANT ALL PRIVILEGES ON SEQUENCE notifications_id_seq TO postgres;