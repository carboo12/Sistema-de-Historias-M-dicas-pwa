begin;

with cfg as (
  select data
  from legacy.raw_rows
  where table_name = 'config'
  order by id
  limit 1
)
insert into public.clinics (
  code, name, legal_name, tax_id, address, phone, email, website,
  timezone, currency, settings
)
select
  'principal',
  coalesce(legacy.clean_text(cfg.data->>'nomfiscal1'), 'ClÃ­nica Principal'),
  legacy.clean_text(cfg.data->>'nomfiscal2'),
  coalesce(legacy.clean_text(cfg.data->>'nrofiscal1'), legacy.clean_text(cfg.data->>'nrofiscal2')),
  legacy.clean_text(cfg.data->>'direccion'),
  legacy.clean_text(cfg.data->>'telefonos'),
  nullif(lower(legacy.clean_text(cfg.data->>'email')), ''),
  legacy.clean_text(cfg.data->>'website'),
  'America/Managua',
  legacy.currency_code(cfg.data->>'monnacsimb'),
  jsonb_build_object(
    'labels', jsonb_build_object(
      'patient', cfg.data->>'paciente',
      'patients', cfg.data->>'pacientes',
      'doctor', cfg.data->>'medico',
      'doctors', cfg.data->>'medicos',
      'consultation', cfg.data->>'consulta',
      'consultations', cfg.data->>'consultas',
      'diagnosis', cfg.data->>'diagnostico',
      'diagnoses', cfg.data->>'diagnosticos',
      'prescription', cfg.data->>'recipe',
      'prescriptions', cfg.data->>'recipes',
      'evolution', cfg.data->>'evolucion',
      'physical_exam', cfg.data->>'exfisico',
      'history', cfg.data->>'historia',
      'histories', cfg.data->>'historias',
      'image', cfg.data->>'imagen',
      'images', cfg.data->>'imagenes',
      'vaccine', cfg.data->>'vacuna',
      'vaccines', cfg.data->>'vacunas'
    ),
    'legacy_config_imported', true
  )
from cfg
on conflict (code) do update set
  name = excluded.name,
  legal_name = excluded.legal_name,
  tax_id = excluded.tax_id,
  address = excluded.address,
  phone = excluded.phone,
  email = excluded.email,
  website = excluded.website,
  currency = excluded.currency,
  settings = public.clinics.settings || excluded.settings,
  updated_at = now();

insert into public.specialties (clinic_id, code, name)
select c.id, legacy.norm_code(r.data->>'codigo'), legacy.clean_text(r.data->>'nombre')
from legacy.raw_rows r
cross join (select id from public.clinics where code = 'principal') c
where r.table_name = 'especial'
  and legacy.norm_code(r.data->>'codigo') is not null
  and legacy.clean_text(r.data->>'nombre') is not null
on conflict (clinic_id, code) do update set
  name = excluded.name,
  is_active = true,
  updated_at = now();

insert into public.offices (clinic_id, code, name)
select c.id, legacy.norm_code(r.data->>'codigo'), legacy.clean_text(r.data->>'nombre')
from legacy.raw_rows r
cross join (select id from public.clinics where code = 'principal') c
where r.table_name = 'consultorios'
  and legacy.norm_code(r.data->>'codigo') is not null
  and legacy.clean_text(r.data->>'nombre') is not null
on conflict (clinic_id, code) do update set
  name = excluded.name,
  is_active = true,
  updated_at = now();

insert into public.history_types (clinic_id, code, name)
select c.id, legacy.norm_code(r.data->>'codigo'), legacy.clean_text(r.data->>'nombre')
from legacy.raw_rows r
cross join (select id from public.clinics where code = 'principal') c
where r.table_name = 'tipohis'
  and legacy.norm_code(r.data->>'codigo') is not null
  and legacy.clean_text(r.data->>'nombre') is not null
on conflict (clinic_id, code) do update set
  name = excluded.name,
  is_active = true,
  updated_at = now();

insert into public.consultation_reasons (clinic_id, code, name)
select c.id, legacy.norm_code(r.data->>'codigo'), legacy.clean_text(r.data->>'nombre')
from legacy.raw_rows r
cross join (select id from public.clinics where code = 'principal') c
where r.table_name = 'motivoconsultas'
  and legacy.norm_code(r.data->>'codigo') is not null
  and legacy.clean_text(r.data->>'nombre') is not null
on conflict (clinic_id, code) do update set
  name = excluded.name,
  is_active = true,
  updated_at = now();

insert into public.document_types (clinic_id, code, name, template, next_number)
select
  c.id,
  legacy.norm_code(r.data->>'codigo'),
  legacy.clean_text(r.data->>'nombre'),
  legacy.clean_clinical(r.data->>'detalles'),
  greatest(coalesce(legacy.safe_numeric(r.data->>'consecutivo'), 1), 1)::bigint
from legacy.raw_rows r
cross join (select id from public.clinics where code = 'principal') c
where r.table_name = 'tipodocu'
  and legacy.norm_code(r.data->>'codigo') is not null
  and legacy.clean_text(r.data->>'nombre') is not null
on conflict (clinic_id, code) do update set
  name = excluded.name,
  template = excluded.template,
  next_number = greatest(public.document_types.next_number, excluded.next_number),
  is_active = true,
  updated_at = now();

insert into public.companies (clinic_id, code, name, company_type, tax_id, address, phone, email, contact_name)
select
  c.id,
  legacy.norm_code(r.data->>'codigo'),
  legacy.clean_text(r.data->>'nombre'),
  'otro',
  coalesce(legacy.clean_text(r.data->>'rif'), legacy.clean_text(r.data->>'nit')),
  legacy.clean_text(r.data->>'direccion'),
  legacy.clean_text(r.data->>'telefonos'),
  nullif(lower(legacy.clean_text(r.data->>'email')), ''),
  legacy.clean_text(r.data->>'representa')
from legacy.raw_rows r
cross join (select id from public.clinics where code = 'principal') c
where r.table_name = 'empresas'
  and legacy.clean_text(r.data->>'nombre') is not null
  and legacy.norm_code(r.data->>'codigo') is not null
on conflict (clinic_id, code) do update set
  name = excluded.name,
  tax_id = excluded.tax_id,
  address = excluded.address,
  phone = excluded.phone,
  email = excluded.email,
  updated_at = now();

insert into public.companies (clinic_id, code, name, company_type, tax_id, address, phone)
select
  c.id,
  legacy.norm_code(r.data->>'codigo'),
  legacy.clean_text(r.data->>'nombre'),
  'farmacia',
  coalesce(legacy.clean_text(r.data->>'rif'), legacy.clean_text(r.data->>'nit')),
  legacy.clean_text(r.data->>'direccion'),
  legacy.clean_text(r.data->>'telefonos')
from legacy.raw_rows r
cross join (select id from public.clinics where code = 'principal') c
where r.table_name = 'farmacias'
  and legacy.clean_text(r.data->>'nombre') is not null
  and legacy.norm_code(r.data->>'codigo') is not null
on conflict (clinic_id, code) do update set
  name = excluded.name,
  company_type = 'farmacia',
  tax_id = excluded.tax_id,
  address = excluded.address,
  phone = excluded.phone,
  updated_at = now();

insert into public.cie10_codes (code, description)
select
  legacy.norm_code(r.data->>'codigo'),
  legacy.clean_text(r.data->>'descriptor')
from legacy.raw_rows r
where r.table_name = 'diagoms'
  and legacy.norm_code(r.data->>'codigo') is not null
  and legacy.clean_text(r.data->>'descriptor') is not null
on conflict (code) do update set
  description = excluded.description,
  updated_at = now();

insert into public.medications (
  clinic_id, source_code, commercial_name, generic_name, indications, dose,
  posology, composition, contraindications, side_effects, properties,
  presentation, route, laboratory, metadata
)
select
  c.id,
  legacy.norm_code(r.data->>'codigo'),
  legacy.clean_text(r.data->>'nombrec'),
  legacy.clean_text(r.data->>'nombreg'),
  legacy.clean_clinical(r.data->>'indica'),
  legacy.clean_clinical(r.data->>'dosis'),
  legacy.clean_clinical(r.data->>'posologia'),
  legacy.clean_clinical(r.data->>'composic'),
  legacy.clean_clinical(r.data->>'contrain'),
  legacy.clean_clinical(r.data->>'efecsec'),
  legacy.clean_clinical(r.data->>'propiedad'),
  legacy.clean_clinical(r.data->>'presenta'),
  legacy.clean_text(r.data->>'via'),
  legacy.clean_text(r.data->>'laboratori'),
  jsonb_build_object('legacy_type', r.data->>'tipifica', 'legacy_row_id', r.id)
from legacy.raw_rows r
cross join (select id from public.clinics where code = 'principal') c
where r.table_name = 'vademecun'
  and legacy.norm_code(r.data->>'codigo') is not null
  and legacy.clean_text(r.data->>'nombrec') is not null
on conflict (source_code) do update set
  commercial_name = excluded.commercial_name,
  generic_name = excluded.generic_name,
  indications = excluded.indications,
  dose = excluded.dose,
  posology = excluded.posology,
  composition = excluded.composition,
  contraindications = excluded.contraindications,
  side_effects = excluded.side_effects,
  properties = excluded.properties,
  presentation = excluded.presentation,
  route = excluded.route,
  laboratory = excluded.laboratory,
  is_active = true,
  updated_at = now();

insert into public.anamnesis_items (
  clinic_id, specialty_id, item_code, item_type, prompt, default_answer, sort_order, metadata
)
select
  c.id,
  s.id,
  legacy.anamnesis_code(r.data->>'tipo', r.data->>'codigo', r.data->>'idline'),
  case btrim(coalesce(r.data->>'tipo', ''))
    when '1' then 'pregunta'
    when '2' then 'examen_fisico'
    when '3' then 'otro'
    else 'pregunta'
  end,
  legacy.clean_text(r.data->>'descrip'),
  legacy.clean_text(r.data->>'respuesta'),
  (coalesce(legacy.safe_numeric(r.data->>'tipo'), 0) * 1000 + coalesce(legacy.safe_numeric(r.data->>'idline'), 0))::integer,
  jsonb_build_object('legacy_specialty', r.data->>'codigo', 'legacy_type', r.data->>'tipo')
from legacy.raw_rows r
cross join (select id from public.clinics where code = 'principal') c
left join public.specialties s
  on s.clinic_id = c.id
 and s.code = legacy.norm_code(r.data->>'codigo')
where r.table_name = 'anamex'
  and legacy.clean_text(r.data->>'descrip') is not null
  and legacy.anamnesis_code(r.data->>'tipo', r.data->>'codigo', r.data->>'idline') is not null
on conflict (clinic_id, item_code) do update set
  specialty_id = excluded.specialty_id,
  item_type = excluded.item_type,
  prompt = excluded.prompt,
  default_answer = excluded.default_answer,
  sort_order = excluded.sort_order,
  metadata = excluded.metadata,
  is_active = true,
  updated_at = now();

insert into public.diagnostic_studies (clinic_id, study_type, code, name, category, source_table)
select c.id, v.study_type, v.code, v.name, v.category, v.source_table
from (
  select 'laboratorio' as study_type,
         nullif(concat_ws('.', legacy.norm_code(data->>'codigo'), legacy.norm_code(data->>'idline')), '') as code,
         legacy.clean_text(data->>'descrip') as name, 'laboratorio' as category, 'examen' as source_table
  from legacy.raw_rows where table_name = 'examen'
  union all
  select 'cardiologia', legacy.norm_code(data->>'codigo'), legacy.clean_text(data->>'nombre'), 'cardiologia', 'examencardio'
  from legacy.raw_rows where table_name = 'examencardio'
  union all
  select 'imagenologia', legacy.norm_code(data->>'codigo'), legacy.clean_text(data->>'nombre'), 'imagenologia', 'examenradio'
  from legacy.raw_rows where table_name = 'examenradio'
  union all
  select 'otro', legacy.norm_code(data->>'codigo'), legacy.clean_text(data->>'nombre'), 'otro', 'tipoexam'
  from legacy.raw_rows where table_name = 'tipoexam'
  union all
  select 'cardiologia', nullif(concat_ws('.', legacy.norm_code(data->>'codigo'), legacy.norm_code(data->>'idline')), ''), legacy.clean_text(data->>'descrip'), 'cardiologia', 'examencardiodet'
  from legacy.raw_rows where table_name = 'examencardiodet'
  union all
  select 'imagenologia', nullif(concat_ws('.', legacy.norm_code(data->>'codigo'), legacy.norm_code(data->>'idline')), ''), legacy.clean_text(data->>'descrip'), 'imagenologia', 'examenradiodet'
  from legacy.raw_rows where table_name = 'examenradiodet'
) v
cross join (select id from public.clinics where code = 'principal') c
where v.code is not null
  and v.name is not null
on conflict (clinic_id, study_type, code) do update set
  name = excluded.name,
  category = excluded.category,
  source_table = excluded.source_table,
  is_active = true,
  updated_at = now();

insert into public.procedures (clinic_id, code, name, description)
select c.id, legacy.norm_code(r.data->>'codprocoms'), legacy.clean_text(r.data->>'nomprocoms'), legacy.clean_clinical(r.data->>'notas')
from legacy.raw_rows r
cross join (select id from public.clinics where code = 'principal') c
where r.table_name = 'procoms'
  and legacy.norm_code(r.data->>'codprocoms') is not null
  and legacy.clean_text(r.data->>'nomprocoms') is not null
on conflict (clinic_id, code) do update set
  name = excluded.name,
  description = excluded.description,
  is_active = true,
  updated_at = now();

insert into public.fee_schedule (clinic_id, procedure_code, description, amount_cents, currency)
select c.id, legacy.norm_code(r.data->>'codigo'), legacy.clean_text(r.data->>'descrip'), 0, c.currency
from legacy.raw_rows r
cross join (select id, currency from public.clinics where code = 'principal') c
where r.table_name = 'baremo'
  and legacy.norm_code(r.data->>'codigo') is not null
  and legacy.clean_text(r.data->>'descrip') is not null
on conflict (clinic_id, procedure_code, (coalesce(company_id, '00000000-0000-0000-0000-000000000000'::uuid))) do update set
  description = excluded.description,
  is_active = true,
  updated_at = now();

insert into public.users (clinic_id, username, email, password_hash, full_name, role, must_change_password, is_active)
select
  c.id,
  lower(legacy.clean_text(r.data->>'username')),
  nullif(lower(legacy.clean_text(r.data->>'email')), ''),
  '!',
  legacy.clean_text(r.data->>'username'),
  case when coalesce(legacy.safe_numeric(r.data->>'uperfsuper'), 0) = 1 then 'admin' else 'medico' end,
  true,
  true
from legacy.raw_rows r
cross join (select id from public.clinics where code = 'principal') c
where r.table_name = 'usuarios'
  and legacy.clean_text(r.data->>'username') is not null
on conflict (clinic_id, username) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role,
  is_active = true,
  updated_at = now();

insert into public.professionals (
  clinic_id, user_id, employee_code, full_name, document_number, license_number,
  ministry_number, phone, mobile, email, default_office_id, is_active, metadata
)
select
  c.id,
  u.id,
  legacy.norm_code(r.data->>'codigo'),
  legacy.clean_text(r.data->>'nombre'),
  legacy.norm_document(r.data->>'cedula'),
  legacy.clean_text(r.data->>'colegio'),
  legacy.clean_text(r.data->>'ministerio'),
  legacy.clean_text(r.data->>'telefonos'),
  legacy.clean_text(r.data->>'telefono_movil'),
  nullif(lower(legacy.clean_text(r.data->>'email')), ''),
  o.id,
  coalesce(legacy.safe_numeric(r.data->>'suspendido'), 0) = 0,
  jsonb_build_object(
    'legacy_type', r.data->>'tipo',
    'legacy_specialties', jsonb_build_array(r.data->>'especial', r.data->>'especial1', r.data->>'especial2', r.data->>'especial3', r.data->>'especial4'),
    'legacy_row_id', r.id
  )
from legacy.raw_rows r
cross join (select id from public.clinics where code = 'principal') c
left join public.users u
  on u.clinic_id = c.id
 and lower(u.full_name) = lower(legacy.clean_text(r.data->>'nombre'))
left join public.offices o
  on o.clinic_id = c.id
 and o.code = legacy.norm_code(r.data->>'consultori')
where r.table_name = 'listvend'
  and legacy.clean_text(r.data->>'nombre') is not null
  and legacy.norm_code(r.data->>'codigo') is not null
on conflict (clinic_id, employee_code) do update set
  user_id = excluded.user_id,
  full_name = excluded.full_name,
  document_number = excluded.document_number,
  license_number = excluded.license_number,
  ministry_number = excluded.ministry_number,
  phone = excluded.phone,
  mobile = excluded.mobile,
  email = excluded.email,
  default_office_id = excluded.default_office_id,
  is_active = excluded.is_active,
  metadata = excluded.metadata,
  updated_at = now();

insert into public.professional_specialties (professional_id, specialty_id, is_primary)
select p.id, s.id, bool_or(v.is_primary)
from legacy.raw_rows r
cross join (select id from public.clinics where code = 'principal') c
join public.professionals p
  on p.clinic_id = c.id
 and p.employee_code = legacy.norm_code(r.data->>'codigo')
join public.specialties s
  on s.clinic_id = c.id
cross join lateral (
  values
    (r.data->>'especial', true),
    (r.data->>'especial1', false),
    (r.data->>'especial2', false),
    (r.data->>'especial3', false),
    (r.data->>'especial4', false)
) as v(code, is_primary)
where r.table_name = 'listvend'
  and s.code = legacy.norm_code(v.code)
group by p.id, s.id
on conflict (professional_id, specialty_id) do update set
  is_primary = public.professional_specialties.is_primary or excluded.is_primary;

with codes as (
  select distinct legacy.norm_code(data->>'medico') as code
  from legacy.raw_rows
  where table_name in ('consulta', 'consultamv', 'citas', 'recipes', 'diag_hist', 'examlab', 'examrx', 'examcardio', 'examencardio')
    and legacy.norm_code(data->>'medico') is not null
)
insert into public.professionals (clinic_id, employee_code, full_name, is_active, metadata)
select c.id, codes.code, 'Profesional legado ' || codes.code, false, jsonb_build_object('legacy_stub', true)
from codes
cross join (select id from public.clinics where code = 'principal') c
where not exists (
  select 1
  from public.professionals p
  where p.clinic_id = c.id
    and p.employee_code = codes.code
)
on conflict (clinic_id, employee_code) do nothing;

insert into public.professionals (clinic_id, employee_code, full_name, is_active, metadata)
select c.id, 'SIN_MEDICO', 'Profesional no registrado', false,
       jsonb_build_object('legacy_stub', true, 'reason', 'empty_doctor')
from (select id from public.clinics where code = 'principal') c
on conflict (clinic_id, employee_code) do nothing;

with codes as (
  select
    legacy.norm_code(data->>'historia') as code,
    max(legacy.clean_text(data->>'paciente')) filter (where legacy.clean_text(data->>'paciente') is not null) as patient_name
  from legacy.raw_rows
  where table_name in ('citas', 'consulta', 'consultamv', 'recipes', 'diag_hist', 'examlab', 'examrx', 'examcardio', 'imagenes', 'imgenmov', 'imgotros', 'pac_cuest')
  group by 1
)
insert into public.patients (clinic_id, record_number, document_type, full_name, metadata, created_at)
select
  c.id,
  codes.code,
  'sin_documento',
  coalesce(codes.patient_name, 'Paciente legado ' || codes.code),
  jsonb_build_object('legacy_orphan', true),
  now()
from codes
cross join (select id from public.clinics where code = 'principal') c
where codes.code is not null
  and not legacy.is_pseudo_history(codes.code)
  and not exists (
    select 1
    from public.patients p
    where p.clinic_id = c.id
      and p.record_number = codes.code
  )
  and not exists (
    select 1
    from legacy.raw_rows rp
    where rp.table_name = 'pacientes'
      and legacy.clean_text(rp.data->>'historia') = codes.code
  )
on conflict (clinic_id, record_number) do nothing;

with src as (
  select
    r.id,
    r.data,
    legacy.clean_text(r.data->>'historia') as record_number,
    legacy.clean_text(r.data->>'nombre') as full_name,
    legacy.clean_text(r.data->>'cedula') as cedula,
    legacy.safe_date(r.data->>'fec_nac') as birth_date,
    legacy.safe_date(r.data->>'fec_his') as record_date
  from legacy.raw_rows r
  where r.table_name = 'pacientes'
), dedup as (
  select
    src.*,
    row_number() over (
      partition by src.record_number
      order by src.record_date desc nulls last, src.id desc
    ) as rn
  from src
  where src.record_number is not null
    and not legacy.is_pseudo_history(src.record_number)
)
insert into public.patients (
  clinic_id, record_number, document_type, document_number, document_verified,
  full_name, birth_date, birth_date_estimated, deceased, death_date, sex,
  marital_status, blood_type, nationality, birth_place, address, city, state,
  country, phone, mobile, email, occupation, employer_id, insurer_id,
  insurance_policy, is_private, photo_url, allergies_notes,
  current_diagnosis_summary, guardian_name, guardian_document, guardian_address,
  guardian_phone, guardian_email, religion, is_suspended, suspension_reason,
  notes, metadata, created_at, updated_at
)
select
  c.id,
  d.record_number,
  case when legacy.norm_document(d.cedula) is null then 'sin_documento' else 'cedula' end,
  legacy.norm_document(d.cedula),
  false,
  coalesce(d.full_name, 'Paciente legado ' || d.record_number),
  d.birth_date,
  false,
  coalesce(legacy.safe_numeric(d.data->>'fallecido'), 0) = 1,
  null,
  legacy.map_sex(d.data->>'sexo'),
  legacy.map_marital_status(d.data->>'edocivil'),
  nullif(legacy.clean_text(d.data->>'sangre'), '?'),
  legacy.map_country(d.data->>'pais'),
  legacy.clean_text(d.data->>'lugarnac'),
  legacy.clean_text(d.data->>'dirhab'),
  null,
  null,
  legacy.map_country(d.data->>'pais'),
  legacy.clean_text(d.data->>'telfhab'),
  null,
  nullif(lower(legacy.clean_text(d.data->>'email')), ''),
  legacy.clean_text(d.data->>'profesion'),
  null,
  null,
  legacy.clean_text(d.data->>'poliza'),
  coalesce(legacy.safe_numeric(d.data->>'particular'), 0) = 1,
  null,
  nullif(legacy.clean_text(d.data->>'alergicoa'), '?'),
  legacy.clean_text(d.data->>'diag'),
  legacy.clean_text(d.data->>'represen'),
  legacy.norm_document(d.data->>'cedrepresentante'),
  legacy.clean_text(d.data->>'dirrepresentante'),
  legacy.clean_text(d.data->>'telfrepresentante'),
  nullif(lower(legacy.clean_text(d.data->>'emailrepresentante')), ''),
  legacy.clean_text(d.data->>'religion'),
  coalesce(legacy.safe_numeric(d.data->>'suspendido'), 0) = 1,
  legacy.clean_text(d.data->>'motivosuspend'),
  legacy.clean_clinical(d.data->>'nota'),
  jsonb_build_object(
    'legacy_row_id', d.id,
    'legacy_history', d.record_number,
    'legacy_sexo', d.data->>'sexo',
    'legacy_edocivil', d.data->>'edocivil',
    'legacy_edad', d.data->>'edad',
    'legacy_seguro', d.data->>'seguro',
    'legacy_poliza', d.data->>'poliza',
    'legacy_particular', d.data->>'particular',
    'legacy_codigoe', d.data->>'codigoe',
    'legacy_rutafoto', d.data->>'rutafoto',
    'legacy_referencia', d.data->>'referencia',
    'legacy_refiere', d.data->>'refiere'
  ),
  coalesce(legacy.to_timestamptz(d.record_date, null, c.timezone), now()),
  now()
from dedup d
cross join (select id, timezone from public.clinics where code = 'principal') c
where d.rn = 1
on conflict (clinic_id, record_number) do nothing;

insert into public.patient_history (patient_id, category, description, details, recorded_at)
select
  p.id,
  v.category,
  v.description,
  v.details,
  p.created_at
from public.patients p
join legacy.raw_rows r
  on r.table_name = 'pacientes'
 and p.record_number = legacy.clean_text(r.data->>'historia')
cross join lateral (
  values
    ('alergia', legacy.clean_text(r.data->>'alergicoa'), jsonb_build_object('source', 'pacientes.alergicoa')),
    ('habito', legacy.clean_clinical(r.data->>'habitos'), jsonb_build_object('source', 'pacientes.habitos')),
    ('vacuna', legacy.clean_clinical(r.data->>'vacunas'), jsonb_build_object('source', 'pacientes.vacunas'))
) as v(category, description, details)
where v.description is not null
  and v.description <> '?'
on conflict (patient_id, category, (md5(description))) do nothing;

insert into public.patient_coverages (patient_id, company_id, policy_number, coverage_type, is_primary, notes)
select
  p.id,
  null,
  coalesce(legacy.clean_text(r.data->>'poliza'), legacy.clean_text(r.data->>'seguro')),
  case when coalesce(legacy.safe_numeric(r.data->>'particular'), 0) = 1 then 'particular' else 'seguro' end,
  true,
  null
from public.patients p
join legacy.raw_rows r
  on r.table_name = 'pacientes'
 and p.record_number = legacy.clean_text(r.data->>'historia')
where (legacy.clean_text(r.data->>'seguro') is not null or legacy.clean_text(r.data->>'poliza') is not null)
  and not exists (
    select 1
    from public.patient_coverages pc
    where pc.patient_id = p.id
      and coalesce(pc.policy_number, '') = coalesce(legacy.clean_text(r.data->>'poliza'), legacy.clean_text(r.data->>'seguro'), '')
  );

with src as (
  select
    r.id,
    r.data,
    legacy.clean_text(r.data->>'historia') as historia,
    legacy.clean_text(r.data->>'medico') as medico_code,
    legacy.clean_text(r.data->>'especial') as especial_code,
    legacy.safe_date(r.data->>'fechacita') as appt_date,
    legacy.safe_time(r.data->>'horacita') as appt_time,
    legacy.map_appointment_status(r.data->>'statuscons') as appt_status,
    legacy.to_timestamptz(
      legacy.safe_date(r.data->>'fechacita'),
      legacy.safe_time(r.data->>'horacita'),
      (select timezone from public.clinics where code = 'principal')
    ) as starts_at
  from legacy.raw_rows r
  where r.table_name = 'citas'
)
insert into public.appointments (
  clinic_id, patient_id, professional_id, specialty_id, office_id,
  starts_at, ends_at, duration_minutes, reason, status, notes, source,
  legacy_id, legacy_status, metadata, created_at, updated_at
)
select
  c.id,
  p.id,
  pr.id,
  sp.id,
  o.id,
  s.starts_at,
  s.starts_at + interval '30 minutes',
  30,
  legacy.clean_text(s.data->>'motivo'),
  case
    when s.appt_status in ('programada', 'confirmada', 'en_espera') and s.starts_at <= now() then 'atendida'
    else s.appt_status
  end,
  legacy.clean_clinical(s.data->>'comentario'),
  'legacy',
  legacy.hash_key(
    s.historia, s.data->>'fechacita', s.data->>'horacita', s.medico_code,
    s.especial_code, s.data->>'motivo', s.data->>'proxcita', s.data->>'proxhora'
  ),
  s.data->>'statuscons',
  jsonb_build_object(
    'legacy_row_id', s.id,
    'legacy_ci', false,
    'time_missing', s.appt_time is null,
    'legacy_compromiso', s.data->>'comentario'
  ),
  s.starts_at,
  now()
from src s
cross join (select id from public.clinics where code = 'principal') c
join public.patients p
  on p.clinic_id = c.id
 and p.record_number = s.historia
join public.professionals pr
  on pr.clinic_id = c.id
 and pr.employee_code = coalesce(legacy.norm_code(s.medico_code), 'SIN_MEDICO')
left join public.specialties sp
  on sp.clinic_id = c.id
 and sp.code = legacy.norm_code(s.especial_code)
left join public.offices o
  on o.clinic_id = c.id
 and o.code = legacy.norm_code(s.data->>'consultori')
where s.appt_date is not null
  and coalesce(legacy.norm_code(s.especial_code), '') <> 'CI'
  and not legacy.is_pseudo_history(s.historia)
on conflict (clinic_id, legacy_id) do nothing;

with src as (
  select
    r.id,
    r.data,
    legacy.clean_text(r.data->>'historia') as historia,
    legacy.clean_text(r.data->>'medico') as medico_code,
    legacy.safe_date(r.data->>'fecha') as consultation_date,
    legacy.safe_time(r.data->>'hora') as consultation_time,
    legacy.to_timestamptz(
      legacy.safe_date(r.data->>'fecha'),
      legacy.safe_time(r.data->>'hora'),
      (select timezone from public.clinics where code = 'principal')
    ) as consulted_at,
    legacy.map_consultation_status(r.data->>'statuscons') as consultation_status
  from legacy.raw_rows r
  where r.table_name = 'consulta'
)
insert into public.consultations (
  clinic_id, patient_id, professional_id, specialty_id, history_type_id,
  consultation_type, consulted_at, next_visit_at, reason, current_illness,
  physical_exam, functional_exam, studies, diagnosis_notes, treatment_plan,
  evolution, plan, notes, vitals, status, signed_at, signed_by, source,
  legacy_id, metadata, created_at, updated_at
)
select
  c.id,
  p.id,
  pr.id,
  null,
  ht.id,
  'consulta',
  s.consulted_at,
  case
    when legacy.safe_date(s.data->>'proxcita') > s.consultation_date
      then legacy.to_timestamptz(legacy.safe_date(s.data->>'proxcita'), null, c.timezone)
    else null
  end,
  legacy.clean_text(s.data->>'motivo'),
  legacy.clean_clinical(s.data->>'enfermac'),
  legacy.clean_clinical(s.data->>'exfisico'),
  null,
  legacy.clean_clinical(s.data->>'estudios'),
  legacy.clean_clinical(s.data->>'concdiag'),
  legacy.clean_clinical(s.data->>'tratamient'),
  null,
  null,
  null,
  '{}'::jsonb,
  s.consultation_status,
  case when s.consultation_status = 'firmada' then s.consulted_at else null end,
  null,
  'consulta',
  legacy.hash_key(
    s.historia, s.data->>'fecha', s.data->>'hora', s.medico_code,
    s.data->>'pid', s.data->>'motivo', s.data->>'enfermac',
    s.data->>'exfisico', s.data->>'estudios', s.data->>'concdiag', s.data->>'tratamient'
  ),
  jsonb_build_object(
    'legacy_row_id', s.id,
    'time_missing', s.consultation_time is null,
    'legacy_tipohis', s.data->>'tipohis',
    'legacy_pid', s.data->>'pid',
    'legacy_proxcita', s.data->>'proxcita'
  ),
  s.consulted_at,
  now()
from src s
cross join (select id, timezone from public.clinics where code = 'principal') c
join public.patients p
  on p.clinic_id = c.id
 and p.record_number = s.historia
join public.professionals pr
  on pr.clinic_id = c.id
 and pr.employee_code = coalesce(legacy.norm_code(s.medico_code), 'SIN_MEDICO')
left join public.history_types ht
  on ht.clinic_id = c.id
 and ht.code = legacy.norm_code(s.data->>'tipohis')
where s.consultation_date is not null
  and not legacy.is_pseudo_history(s.historia)
on conflict (clinic_id, legacy_id) do nothing;

with src as (
  select
    r.id,
    r.data,
    legacy.clean_text(r.data->>'historia') as historia,
    legacy.clean_text(r.data->>'medico') as medico_code,
    legacy.clean_text(r.data->>'especial') as especial_code,
    legacy.safe_date(r.data->>'fecha') as consultation_date,
    legacy.safe_time(r.data->>'hora') as consultation_time,
    legacy.to_timestamptz(
      legacy.safe_date(r.data->>'fecha'),
      legacy.safe_time(r.data->>'hora'),
      (select timezone from public.clinics where code = 'principal')
    ) as consulted_at,
    legacy.map_consultation_status(r.data->>'statuscons') as consultation_status
  from legacy.raw_rows r
  where r.table_name = 'consultamv'
)
insert into public.consultations (
  clinic_id, patient_id, professional_id, specialty_id, history_type_id,
  consultation_type, consulted_at, next_visit_at, reason, current_illness,
  physical_exam, functional_exam, studies, diagnosis_notes, treatment_plan,
  evolution, plan, notes, vitals, status, signed_at, signed_by, source,
  legacy_id, metadata, created_at, updated_at
)
select
  c.id,
  p.id,
  pr.id,
  sp.id,
  null,
  'evolucion',
  s.consulted_at,
  case
    when legacy.safe_date(s.data->>'proxcita') > s.consultation_date
      then legacy.to_timestamptz(legacy.safe_date(s.data->>'proxcita'), null, c.timezone)
    else null
  end,
  legacy.clean_text(s.data->>'motivo'),
  legacy.clean_clinical(s.data->>'enfermedad'),
  legacy.clean_clinical(s.data->>'examfisico'),
  null,
  legacy.clean_clinical(s.data->>'estudios'),
  null,
  legacy.clean_clinical(s.data->>'tratamient'),
  legacy.clean_clinical(s.data->>'motevoluc'),
  null,
  null,
  '{}'::jsonb,
  s.consultation_status,
  case when s.consultation_status = 'firmada' then s.consulted_at else null end,
  null,
  'consultamv',
  legacy.hash_key(
    s.historia, s.data->>'fecha', s.data->>'hora', s.medico_code,
    s.especial_code, s.data->>'pid', s.data->>'motivo',
    s.data->>'motevoluc', s.data->>'enfermedad', s.data->>'examfisico',
    s.data->>'estudios', s.data->>'tratamient'
  ),
  jsonb_build_object(
    'legacy_row_id', s.id,
    'time_missing', s.consultation_time is null,
    'legacy_pid', s.data->>'pid',
    'legacy_proxcita', s.data->>'proxcita'
  ),
  s.consulted_at,
  now()
from src s
cross join (select id, timezone from public.clinics where code = 'principal') c
join public.patients p
  on p.clinic_id = c.id
 and p.record_number = s.historia
join public.professionals pr
  on pr.clinic_id = c.id
 and pr.employee_code = coalesce(legacy.norm_code(s.medico_code), 'SIN_MEDICO')
left join public.specialties sp
  on sp.clinic_id = c.id
 and sp.code = legacy.norm_code(s.especial_code)
where s.consultation_date is not null
  and not legacy.is_pseudo_history(s.historia)
on conflict (clinic_id, legacy_id) do nothing;

with candidates as (
  select
    c.id as consultation_id,
    a.id as appointment_id,
    row_number() over (partition by c.id order by a.starts_at) as rn_consultation,
    row_number() over (partition by a.id order by c.consulted_at) as rn_appointment
  from public.consultations c
  join public.appointments a
    on a.patient_id = c.patient_id
   and a.professional_id = c.professional_id
   and (a.starts_at at time zone 'America/Managua')::date = (c.consulted_at at time zone 'America/Managua')::date
  where c.appointment_id is null
    and a.status = 'atendida'
), picked as (
  select consultation_id, appointment_id
  from candidates
  where rn_consultation = 1
    and rn_appointment = 1
)
update public.consultations c
set appointment_id = picked.appointment_id,
    updated_at = now()
from picked
where c.id = picked.consultation_id;

insert into public.consultation_diagnoses (
  clinic_id, patient_id, consultation_id, professional_id, cie10_code,
  diagnosis_text, diagnosis_type, notes, diagnosed_at, legacy_id
)
select
  c.id,
  p.id,
  nearest.id,
  pr.id,
  ci.code,
  coalesce(legacy.clean_text(r.data->>'descrip'), legacy.norm_code(r.data->>'codigo')),
  'principal',
  legacy.clean_clinical(r.data->>'notas'),
  coalesce(legacy.to_timestamptz(legacy.safe_date(r.data->>'fecha'), null, c.timezone), now()),
  legacy.hash_key(
    legacy.clean_text(r.data->>'historia'), r.data->>'codigo',
    r.data->>'descrip', r.data->>'fecha', r.data->>'notas', r.data->>'medico'
  )
from legacy.raw_rows r
cross join (select id, timezone from public.clinics where code = 'principal') c
join public.patients p
  on p.clinic_id = c.id
 and p.record_number = legacy.clean_text(r.data->>'historia')
join public.professionals pr
  on pr.clinic_id = c.id
 and pr.employee_code = coalesce(legacy.norm_code(r.data->>'medico'), 'SIN_MEDICO')
left join public.cie10_codes ci
  on ci.code = legacy.norm_code(r.data->>'codigo')
left join lateral (
  select c2.id
  from public.consultations c2
  where c2.patient_id = p.id
    and (c2.consulted_at at time zone c.timezone)::date = legacy.safe_date(r.data->>'fecha')
  order by c2.consulted_at
  limit 1
) nearest on true
where r.table_name = 'diag_hist'
  and legacy.clean_text(r.data->>'historia') is not null
  and not legacy.is_pseudo_history(r.data->>'historia')
  and coalesce(legacy.clean_text(r.data->>'descrip'), legacy.norm_code(r.data->>'codigo')) is not null
on conflict (clinic_id, legacy_id) do nothing;

with src as (
  select
    r.id,
    r.data,
    legacy.clean_text(r.data->>'historia') as historia,
    legacy.clean_text(r.data->>'medico') as medico_code,
    legacy.clean_text(r.data->>'nrorecipe') as recipe_number,
    legacy.safe_date(r.data->>'fecha') as issue_date,
    legacy.to_timestamptz(
      legacy.safe_date(r.data->>'fecha'),
      null,
      (select timezone from public.clinics where code = 'principal')
    ) as issued_at
  from legacy.raw_rows r
  where r.table_name = 'recipes'
), grouped as (
  select
    historia,
    medico_code,
    recipe_number,
    issue_date,
    issued_at,
    legacy.hash_key(historia, recipe_number, issue_date::text, medico_code) as legacy_id
  from src
  where historia is not null
    and not legacy.is_pseudo_history(historia)
  group by historia, medico_code, recipe_number, issue_date, issued_at
)
insert into public.prescriptions (
  clinic_id, patient_id, professional_id, prescription_number, issued_at,
  status, notes, legacy_id
)
select
  c.id,
  p.id,
  pr.id,
  coalesce(g.recipe_number, 'LEG-' || substr(g.legacy_id, 1, 10)),
  coalesce(g.issued_at, now()),
  'emitida',
  null,
  g.legacy_id
from grouped g
cross join (select id from public.clinics where code = 'principal') c
join public.patients p
  on p.clinic_id = c.id
 and p.record_number = g.historia
join public.professionals pr
  on pr.clinic_id = c.id
 and pr.employee_code = coalesce(legacy.norm_code(g.medico_code), 'SIN_MEDICO')
on conflict (clinic_id, legacy_id) do nothing;

insert into public.prescription_items (
  prescription_id, medication_id, medication_name, presentation, dose,
  frequency, route, duration, quantity, instructions, sort_order, legacy_id
)
select
  rx.id,
  m.id,
  coalesce(legacy.clean_text(r.data->>'nombre'), 'Medicamento sin nombre'),
  legacy.clean_text(r.data->>'present'),
  null,
  null,
  null,
  null,
  legacy.safe_numeric(r.data->>'cantidad'),
  legacy.clean_clinical(r.data->>'indicacion'),
  r.row_number,
  legacy.hash_key(
    legacy.clean_text(r.data->>'historia'), r.data->>'nrorecipe',
    r.data->>'fecha', r.data->>'medico', r.data->>'codigomed',
    r.data->>'nombre', r.data->>'cantidad', r.row_number::text
  )
from legacy.raw_rows r
cross join (select id from public.clinics where code = 'principal') c
join public.prescriptions rx
  on rx.clinic_id = c.id
 and rx.legacy_id = legacy.hash_key(
   legacy.clean_text(r.data->>'historia'),
   legacy.clean_text(r.data->>'nrorecipe'),
   legacy.safe_date(r.data->>'fecha')::text,
   legacy.clean_text(r.data->>'medico')
 )
left join public.medications m
  on m.source_code = legacy.norm_code(r.data->>'codigomed')
where r.table_name = 'recipes'
  and legacy.clean_text(r.data->>'historia') is not null
  and not legacy.is_pseudo_history(r.data->>'historia')
on conflict (prescription_id, legacy_id) do nothing;

insert into public.patient_studies (
  clinic_id, patient_id, study_id, professional_id, study_type, study_name,
  performed_at, status, result_summary, result_text, legacy_id, metadata
)
select
  c.id,
  p.id,
  ds.id,
  pr.id,
  r.study_type,
  coalesce(legacy.clean_text(r.data->>'descrip'), 'Estudio sin nombre'),
  legacy.to_timestamptz(legacy.safe_date(r.data->>'fecha'), null, c.timezone),
  'completado',
  null,
  null,
  legacy.hash_key(r.table_name, legacy.clean_text(r.data->>'historia'), r.data->>'documento', r.data->>'fecha', r.data->>'codigo', r.data->>'descrip', r.data->>'medico'),
  jsonb_build_object('legacy_document', r.data->>'documento', 'legacy_code', r.data->>'codigo', 'legacy_table', r.table_name, 'legacy_row_id', r.id)
from (
  select 'laboratorio' as study_type, * from legacy.raw_rows where table_name = 'examlab'
  union all
  select 'imagenologia', * from legacy.raw_rows where table_name = 'examrx'
  union all
  select 'cardiologia', * from legacy.raw_rows where table_name = 'examcardio'
) r
cross join (select id, timezone from public.clinics where code = 'principal') c
join public.patients p
  on p.clinic_id = c.id
 and p.record_number = legacy.clean_text(r.data->>'historia')
join public.professionals pr
  on pr.clinic_id = c.id
 and pr.employee_code = coalesce(legacy.norm_code(r.data->>'medico'), 'SIN_MEDICO')
left join lateral (
  select ds.id
  from public.diagnostic_studies ds
  where ds.clinic_id = c.id
    and ds.study_type = r.study_type
    and (
      ds.code = legacy.norm_code(r.data->>'codigo')
      or ds.name = legacy.clean_text(r.data->>'descrip')
    )
  order by (ds.name = legacy.clean_text(r.data->>'descrip')) desc, ds.code
  limit 1
) ds on true
where legacy.clean_text(r.data->>'historia') is not null
  and not legacy.is_pseudo_history(r.data->>'historia')
on conflict (clinic_id, legacy_id) do nothing;

insert into public.clinical_images (
  clinic_id, patient_id, professional_id, category, title, notes,
  legacy_path, taken_at, legacy_id, metadata
)
select
  c.id,
  p.id,
  pr.id,
  'otro',
  legacy.clean_text(r.data->>'titulo'),
  legacy.clean_clinical(r.data->>'notas'),
  coalesce(legacy.clean_text(r.data->>'rutafoto'), legacy.clean_text(r.data->>'rutaimg')),
  coalesce(legacy.to_timestamptz(legacy.safe_date(r.data->>'fecha'), legacy.safe_time(r.data->>'hora'), c.timezone), now()),
  legacy.hash_key(r.source_table, legacy.clean_text(r.data->>'historia'), r.data->>'fecha', r.data->>'hora', coalesce(r.data->>'rutafoto', r.data->>'rutaimg'), r.data->>'titulo'),
  jsonb_build_object('legacy_table', r.source_table, 'legacy_row_id', r.id, 'legacy_pid', r.data->>'pid')
from (
  select 'imagenes' as source_table, * from legacy.raw_rows where table_name = 'imagenes'
  union all
  select 'imgenmov', * from legacy.raw_rows where table_name = 'imgenmov'
  union all
  select 'imgotros', * from legacy.raw_rows where table_name = 'imgotros'
) r
cross join (select id, timezone from public.clinics where code = 'principal') c
join public.patients p
  on p.clinic_id = c.id
 and p.record_number = legacy.clean_text(r.data->>'historia')
left join public.professionals pr
  on pr.clinic_id = c.id
 and pr.employee_code = legacy.norm_code(r.data->>'medico')
where legacy.clean_text(r.data->>'historia') is not null
  and not legacy.is_pseudo_history(r.data->>'historia')
  and (legacy.clean_text(r.data->>'rutafoto') is not null or legacy.clean_text(r.data->>'rutaimg') is not null)
on conflict (clinic_id, legacy_id) do nothing;

insert into public.clinical_images (
  clinic_id, patient_id, category, title, legacy_path, taken_at, legacy_id, metadata
)
select
  p.clinic_id,
  p.id,
  'foto_paciente',
  'FotografÃ­a del paciente',
  legacy.clean_text(r.data->>'rutafoto'),
  p.created_at,
  legacy.hash_key('pacientes_foto', p.record_number, r.data->>'rutafoto'),
  jsonb_build_object('legacy_table', 'pacientes', 'legacy_row_id', r.id)
from public.patients p
join legacy.raw_rows r
  on r.table_name = 'pacientes'
 and p.record_number = legacy.clean_text(r.data->>'historia')
where legacy.clean_text(r.data->>'rutafoto') is not null
on conflict (clinic_id, legacy_id) do nothing;

insert into public.patient_anamnesis_answers (
  clinic_id, patient_id, consultation_id, item_id, specialty_code, item_code,
  prompt_snapshot, answer, details, recorded_at, source, legacy_id
)
select
  c.id,
  p.id,
  nearest.id,
  ai.id,
  legacy.norm_code(r.data->>'codigo'),
  legacy.anamnesis_code(r.data->>'tipo', r.data->>'codigo', r.data->>'idline'),
  legacy.clean_text(r.data->>'descrip'),
  legacy.clean_text(r.data->>'respuesta'),
  legacy.clean_clinical(r.data->>'detalles'),
  coalesce(legacy.to_timestamptz(legacy.safe_date(r.data->>'fecha'), null, c.timezone), now()),
  'pac_cuest',
  legacy.hash_key(
    legacy.clean_text(r.data->>'historia'), r.data->>'fecha', r.data->>'codigo',
    r.data->>'tipo', r.data->>'idline', r.data->>'descrip',
    r.data->>'respuesta', r.data->>'detalles'
  )
from legacy.raw_rows r
cross join (select id, timezone from public.clinics where code = 'principal') c
join public.patients p
  on p.clinic_id = c.id
 and p.record_number = legacy.clean_text(r.data->>'historia')
left join public.anamnesis_items ai
  on ai.clinic_id = c.id
 and ai.item_code = legacy.anamnesis_code(r.data->>'tipo', r.data->>'codigo', r.data->>'idline')
left join lateral (
  select c2.id
  from public.consultations c2
  where c2.patient_id = p.id
    and (c2.consulted_at at time zone c.timezone)::date = legacy.safe_date(r.data->>'fecha')
  order by c2.consulted_at
  limit 1
) nearest on true
where r.table_name = 'pac_cuest'
  and legacy.clean_text(r.data->>'historia') is not null
  and not legacy.is_pseudo_history(r.data->>'historia')
  and (legacy.clean_text(r.data->>'respuesta') is not null or legacy.clean_clinical(r.data->>'detalles') is not null)
on conflict (clinic_id, legacy_id) do nothing;

insert into public.report_definitions (clinic_id, code, name, description, category, parameters)
select
  c.id,
  coalesce(legacy.norm_code(r.data->>'tipo') || ':' || legacy.norm_code(r.data->>'namereport'), legacy.norm_code(r.data->>'namereport'), 'REPORTE-' || r.id::text),
  coalesce(legacy.clean_text(r.data->>'titulo'), 'Reporte'),
  legacy.clean_clinical(r.data->>'descrip'),
  legacy.norm_code(r.data->>'tipo'),
  jsonb_build_object('legacy_condition', r.data->>'condicion', 'legacy_condition_type', r.data->>'tipocond')
from legacy.raw_rows r
cross join (select id from public.clinics where code = 'principal') c
where r.table_name = 'reportes'
  and legacy.clean_text(r.data->>'titulo') is not null
on conflict (clinic_id, code) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  parameters = excluded.parameters,
  is_active = true,
  updated_at = now();

insert into public.data_quality_issues (source_table, legacy_ref, issue_type, details)
select
  'pacientes',
  legacy.clean_text(data->>'historia'),
  'missing_document',
  jsonb_build_object('name', data->>'nombre', 'legacy_row_id', id)
from legacy.raw_rows
where table_name = 'pacientes'
  and legacy.norm_document(data->>'cedula') is null;

insert into public.data_quality_issues (source_table, legacy_ref, issue_type, details)
select
  'pacientes',
  legacy.clean_text(data->>'historia'),
  'unknown_sex',
  jsonb_build_object('legacy_sexo', data->>'sexo', 'legacy_row_id', id)
from legacy.raw_rows
where table_name = 'pacientes'
  and legacy.map_sex(data->>'sexo') = 'U';

insert into public.data_quality_issues (source_table, legacy_ref, issue_type, details)
select
  'pacientes',
  legacy.clean_text(data->>'historia'),
  'zero_or_invalid_birth_date',
  jsonb_build_object('legacy_fec_nac', data->>'fec_nac', 'legacy_row_id', id)
from legacy.raw_rows
where table_name = 'pacientes'
  and legacy.safe_date(data->>'fec_nac') is null;

insert into public.data_quality_issues (source_table, legacy_ref, issue_type, details)
select
  'citas',
  legacy.clean_text(data->>'historia'),
  'ci_marker_excluded',
  jsonb_build_object('legacy_fechacita', data->>'fechacita', 'legacy_proxcita', data->>'proxcita', 'legacy_row_id', id)
from legacy.raw_rows
where table_name = 'citas'
  and legacy.norm_code(data->>'especial') = 'CI';

insert into public.data_quality_issues (source_table, legacy_ref, issue_type, details)
select
  'citas',
  legacy.clean_text(data->>'historia'),
  'appointment_missing_time',
  jsonb_build_object('legacy_horacita', data->>'horacita', 'legacy_row_id', id)
from legacy.raw_rows
where table_name = 'citas'
  and legacy.safe_date(data->>'fechacita') is not null
  and legacy.safe_time(data->>'horacita') is null;

insert into public.data_quality_issues (source_table, legacy_ref, issue_type, details)
select
  'recetas',
  legacy.clean_text(data->>'historia'),
  'orphan_prescription_patient',
  jsonb_build_object('legacy_row_id', id)
from legacy.raw_rows r
where table_name = 'recipes'
  and legacy.clean_text(data->>'historia') is not null
  and not legacy.is_pseudo_history(data->>'historia')
  and not exists (
    select 1 from public.patients p where p.record_number = legacy.clean_text(r.data->>'historia')
  );

insert into public.data_quality_issues (source_table, legacy_ref, issue_type, details)
select
  'diag_hist',
  legacy.clean_text(data->>'historia'),
  'diagnosis_code_not_in_cie10',
  jsonb_build_object('legacy_code', data->>'codigo', 'description', data->>'descrip', 'legacy_row_id', id)
from legacy.raw_rows r
where table_name = 'diag_hist'
  and legacy.norm_code(data->>'codigo') is not null
  and not exists (
    select 1 from public.cie10_codes c where c.code = legacy.norm_code(r.data->>'codigo')
  );

insert into public.data_quality_issues (source_table, legacy_ref, issue_type, details)
select
  'pacientes',
  legacy.norm_document(data->>'cedula'),
  'duplicate_document',
  jsonb_build_object('count', count(*), 'histories', jsonb_agg(data->>'historia'))
from legacy.raw_rows
where table_name = 'pacientes'
  and legacy.norm_document(data->>'cedula') is not null
group by legacy.norm_document(data->>'cedula')
having count(*) > 1;

commit;


