-- Keep the denormalized Data Connect search field populated on Cloud SQL.
-- The local schema may define this column as GENERATED ALWAYS; the Cloud SQL
-- instance currently has it as a normal nullable column, so only install the
-- triggers and backfill for that schema variant.
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;

CREATE OR REPLACE FUNCTION public.immutable_unaccent(p_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT public.unaccent('public.unaccent'::regdictionary, p_text);
$$;

DO $$
DECLARE
  generated_state text;
BEGIN
  SELECT is_generated
    INTO generated_state
    FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name = 'patients'
     AND column_name = 'search_text';

  IF generated_state = 'NEVER' THEN
    EXECUTE $function$
      CREATE OR REPLACE FUNCTION public.sync_patient_search_text()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $body$
      BEGIN
        NEW.search_text := lower(public.immutable_unaccent(
          concat_ws(' ', NEW.full_name, NEW.document_number, NEW.record_number)
        ));
        RETURN NEW;
      END;
      $body$
    $function$;

    EXECUTE 'DROP TRIGGER IF EXISTS patients_search_text_insert ON public.patients';
    EXECUTE 'DROP TRIGGER IF EXISTS patients_search_text_update ON public.patients';
    EXECUTE $trigger$
      CREATE TRIGGER patients_search_text_insert
      BEFORE INSERT ON public.patients
      FOR EACH ROW EXECUTE FUNCTION public.sync_patient_search_text()
    $trigger$;
    EXECUTE $trigger$
      CREATE TRIGGER patients_search_text_update
      BEFORE UPDATE OF full_name, document_number, record_number ON public.patients
      FOR EACH ROW EXECUTE FUNCTION public.sync_patient_search_text()
    $trigger$;

    UPDATE public.patients
       SET search_text = lower(public.immutable_unaccent(
         concat_ws(' ', full_name, document_number, record_number)
       ))
     WHERE search_text IS DISTINCT FROM lower(public.immutable_unaccent(
       concat_ws(' ', full_name, document_number, record_number)
     ));
  END IF;
END;
$$;
