CREATE SEQUENCE IF NOT EXISTS work_slots_id_seq;
CREATE TABLE IF NOT EXISTS public.work_slots (
    id integer NOT NULL DEFAULT nextval('work_slots_id_seq'::regclass),
    master_id integer,
    date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    
    CONSTRAINT work_slots_pkey PRIMARY KEY (id),
    
    CONSTRAINT work_slots_master_id_date_key UNIQUE (master_id, date),
    
    CONSTRAINT work_slots_master_id_fkey FOREIGN KEY (master_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.work_slots OWNER TO postgres;

GRANT ALL ON TABLE public.work_slots TO nail_user;

GRANT ALL ON TABLE public.work_slots TO postgres;

GRANT ALL PRIVILEGES ON SEQUENCE work_slots_id_seq TO nail_user;
GRANT ALL PRIVILEGES ON SEQUENCE work_slots_id_seq TO postgres;