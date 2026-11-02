begin;

drop table if exists public.migration_validation;

create table public.migration_validation (
  check_name text primary key,
  expected bigint,
  actual bigint,
  status text not null,
  details jsonb not null default '{}'::jsonb
);

insert into public.migration_validation (check_name, expected, actual, status, details)
select
  'legacy_rows',
  (select count(*) from legacy.raw_rows),
  (select count(*) from legacy.raw_rows),
  'info',
  jsonb_build_object(
    'tables', (select count(distinct table_name) from legacy.raw_rows),
    'batch_status', (select status from legacy.import_batches order by started_at desc limit 1)
  );

insert into public.migration_validation (check_name, expected, actual, status, details)
select
  'clinics',
  1,
  count(*),
  case when count(*) = 1 then 'ok' else 'review' end,
  jsonb_build_object('codes', jsonb_agg(code))
from public.clinics;

insert into public.migration_validation (check_name, expected, actual, status, details)
select
  'patients_duplicate_record_number',
  0,
  count(*),
  case when count(*) = 0 then 'ok' else 'review' end,
  jsonb_build_object('groups', coalesce(jsonb_agg(record_number), '[]'::jsonb))
from (
  select record_number
  from public.patients
  group by record_number
  having count(*) > 1
) d;

insert into public.migration_validation (check_name, expected, actual, status, details)
select
  'appointments_imported',
  (select count(*) from legacy.raw_rows
   where table_name = 'citas'
     and legacy.norm_code(data->>'especial') <> 'CI'
     and legacy.safe_date(data->>'fechacita') is not null
     and not legacy.is_pseudo_history(data->>'historia')),
  (select count(*) from public.appointments),
  case
    when (select count(*) from public.appointments) = (
      select count(*) from legacy.raw_rows
      where table_name = 'citas'
        and legacy.norm_code(data->>'especial') <> 'CI'
        and legacy.safe_date(data->>'fechacita') is not null
        and not legacy.is_pseudo_history(data->>'historia')
    ) then 'ok' else 'review'
  end,
  '{}'::jsonb;

insert into public.migration_validation (check_name, expected, actual, status, details)
select
  'appointments_orphans',
  0,
  count(*),
  case when count(*) = 0 then 'ok' else 'review' end,
  jsonb_build_object('appointment_ids', coalesce(jsonb_agg(id), '[]'::jsonb))
from public.appointments a
where not exists (select 1 from public.patients p where p.id = a.patient_id)
   or not exists (select 1 from public.professionals pr where pr.id = a.professional_id);

with s as (
  select
    'consulta' as source,
    data,
    legacy.hash_key(
      legacy.clean_text(data->>'historia'), data->>'fecha', data->>'hora',
      legacy.clean_text(data->>'medico'), data->>'pid', data->>'motivo',
      data->>'enfermac', data->>'exfisico', data->>'estudios',
      data->>'concdiag', data->>'tratamient'
    ) as legacy_id
  from legacy.raw_rows
  where table_name = 'consulta'
  union all
  select
    'consultamv',
    data,
    legacy.hash_key(
      legacy.clean_text(data->>'historia'), data->>'fecha', data->>'hora',
      legacy.clean_text(data->>'medico'), legacy.clean_text(data->>'especial'),
      data->>'pid', data->>'motivo', data->>'motevoluc', data->>'enfermedad',
      data->>'examfisico', data->>'estudios', data->>'tratamient'
    )
  from legacy.raw_rows
  where table_name = 'consultamv'
), expected as (
  select count(distinct legacy_id)::bigint as n
  from s
  where legacy.safe_date(data->>'fecha') is not null
    and not legacy.is_pseudo_history(data->>'historia')
)
insert into public.migration_validation (check_name, expected, actual, status, details)
select
  'consultations_imported',
  e.n,
  (select count(*) from public.consultations),
  case when (select count(*) from public.consultations) = e.n then 'ok' else 'review' end,
  '{}'::jsonb
from expected e;

insert into public.migration_validation (check_name, expected, actual, status, details)
select
  'consultations_orphans',
  0,
  count(*),
  case when count(*) = 0 then 'ok' else 'review' end,
  jsonb_build_object('consultation_ids', coalesce(jsonb_agg(id), '[]'::jsonb))
from public.consultations c
where not exists (select 1 from public.patients p where p.id = c.patient_id)
   or not exists (select 1 from public.professionals pr where pr.id = c.professional_id);

insert into public.migration_validation (check_name, expected, actual, status, details)
select
  'consultations_signed_without_timestamp',
  0,
  count(*),
  case when count(*) = 0 then 'ok' else 'review' end,
  '{}'::jsonb
from public.consultations
where status = 'firmada' and signed_at is null;

insert into public.migration_validation (check_name, expected, actual, status, details)
select
  'anamnesis_answers_imported',
  (select count(*) from legacy.raw_rows
   where table_name = 'pac_cuest'
     and legacy.clean_text(data->>'historia') is not null
     and not legacy.is_pseudo_history(data->>'historia')
     and (legacy.clean_text(data->>'respuesta') is not null or legacy.clean_clinical(data->>'detalles') is not null)
     and exists (select 1 from public.patients p where p.record_number = legacy.clean_text(data->>'historia'))),
  (select count(*) from public.patient_anamnesis_answers),
  case
    when (select count(*) from public.patient_anamnesis_answers) = (
      select count(*) from legacy.raw_rows
      where table_name = 'pac_cuest'
        and legacy.clean_text(data->>'historia') is not null
        and not legacy.is_pseudo_history(data->>'historia')
        and (legacy.clean_text(data->>'respuesta') is not null or legacy.clean_clinical(data->>'detalles') is not null)
        and exists (select 1 from public.patients p where p.record_number = legacy.clean_text(data->>'historia'))
    ) then 'ok' else 'review'
  end,
  '{}'::jsonb;

insert into public.migration_validation (check_name, expected, actual, status, details)
select
  'clinical_images_imported',
  (select count(*) from legacy.raw_rows
   where table_name in ('imagenes', 'imgenmov', 'imgotros')
     and legacy.clean_text(data->>'historia') is not null
     and not legacy.is_pseudo_history(data->>'historia')
     and coalesce(legacy.clean_text(data->>'rutafoto'), legacy.clean_text(data->>'rutaimg')) is not null
     and exists (select 1 from public.patients p where p.record_number = legacy.clean_text(data->>'historia'))),
  (select count(*) from public.clinical_images),
  case
    when (select count(*) from public.clinical_images) = (
      select count(*) from legacy.raw_rows
      where table_name in ('imagenes', 'imgenmov', 'imgotros')
        and legacy.clean_text(data->>'historia') is not null
        and not legacy.is_pseudo_history(data->>'historia')
        and coalesce(legacy.clean_text(data->>'rutafoto'), legacy.clean_text(data->>'rutaimg')) is not null
        and exists (select 1 from public.patients p where p.record_number = legacy.clean_text(data->>'historia'))
    ) then 'ok' else 'review'
  end,
  '{}'::jsonb;

insert into public.migration_validation (check_name, expected, actual, status, details)
select
  'diagnoses_imported',
  (select count(*) from legacy.raw_rows
   where table_name = 'diag_hist'
     and legacy.clean_text(data->>'historia') is not null
     and not legacy.is_pseudo_history(data->>'historia')
     and coalesce(legacy.clean_text(data->>'descrip'), legacy.norm_code(data->>'codigo')) is not null
     and exists (select 1 from public.patients p where p.record_number = legacy.clean_text(data->>'historia'))),
  (select count(*) from public.consultation_diagnoses),
  case
    when (select count(*) from public.consultation_diagnoses) = (
      select count(*) from legacy.raw_rows
      where table_name = 'diag_hist'
        and legacy.clean_text(data->>'historia') is not null
        and not legacy.is_pseudo_history(data->>'historia')
        and coalesce(legacy.clean_text(data->>'descrip'), legacy.norm_code(data->>'codigo')) is not null
        and exists (select 1 from public.patients p where p.record_number = legacy.clean_text(data->>'historia'))
    ) then 'ok' else 'review'
  end,
  '{}'::jsonb;

insert into public.migration_validation (check_name, expected, actual, status, details)
select
  'prescriptions_imported',
  (select count(*) from legacy.raw_rows
   where table_name = 'recipes'
     and legacy.clean_text(data->>'historia') is not null
     and not legacy.is_pseudo_history(data->>'historia')
     and exists (select 1 from public.patients p where p.record_number = legacy.clean_text(data->>'historia'))),
  (select count(*) from public.prescriptions),
  case
    when (select count(*) from public.prescriptions) = (
      select count(*) from legacy.raw_rows
      where table_name = 'recipes'
        and legacy.clean_text(data->>'historia') is not null
        and not legacy.is_pseudo_history(data->>'historia')
        and exists (select 1 from public.patients p where p.record_number = legacy.clean_text(data->>'historia'))
    ) then 'ok' else 'review'
  end,
  '{}'::jsonb;

insert into public.migration_validation (check_name, expected, actual, status, details)
select
  'data_quality_unknown_sex',
  null,
  count(*),
  'info',
  '{}'::jsonb
from public.data_quality_issues
where issue_type = 'unknown_sex';

insert into public.migration_validation (check_name, expected, actual, status, details)
select
  'data_quality_ci_marker',
  null,
  count(*),
  'info',
  '{}'::jsonb
from public.data_quality_issues
where issue_type = 'ci_marker_excluded';

insert into public.migration_validation (check_name, expected, actual, status, details)
select
  'data_quality_missing_document',
  null,
  count(*),
  'info',
  '{}'::jsonb
from public.data_quality_issues
where issue_type = 'missing_document';

insert into public.migration_validation (check_name, expected, actual, status, details)
select
  'data_quality_duplicate_document',
  null,
  count(*),
  'info',
  '{}'::jsonb
from public.data_quality_issues
where issue_type = 'duplicate_document';

insert into public.migration_validation (check_name, expected, actual, status, details)
select
  'data_quality_zero_birth_date',
  null,
  count(*),
  'info',
  '{}'::jsonb
from public.data_quality_issues
where issue_type = 'zero_or_invalid_birth_date';

commit;

select
  check_name,
  expected,
  actual,
  status,
  details
from public.migration_validation
order by
  case status when 'review' then 0 when 'info' then 1 else 2 end,
  check_name;
