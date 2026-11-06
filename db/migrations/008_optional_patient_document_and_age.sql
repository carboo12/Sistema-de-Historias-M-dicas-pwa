-- Allow patient records without identity documents and persist a manually
-- entered age when a reliable birth date is unavailable.
alter table public.patients
  alter column document_type drop not null,
  alter column document_type drop default;

alter table public.patients
  drop constraint if exists patients_document_type_check;

alter table public.patients
  add constraint patients_document_type_check
  check (document_type is null or document_type in ('cedula', 'pasaporte', 'ruc', 'nit', 'ssn', 'sin_documento', 'otro'));

alter table public.patients
  add column if not exists age_override smallint;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'patients_age_override_check'
      and conrelid = 'public.patients'::regclass
  ) then
    alter table public.patients
      add constraint patients_age_override_check
      check (age_override between 0 and 150);
  end if;
end $$;
