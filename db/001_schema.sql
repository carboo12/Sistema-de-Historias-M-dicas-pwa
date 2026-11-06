begin;

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists unaccent;
create extension if not exists btree_gist;

create schema if not exists legacy;

create or replace function public.immutable_unaccent(p_text text)
returns text
language sql
immutable
parallel safe
as $$
  select public.unaccent('public.unaccent'::regdictionary, p_text);
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  legal_name text,
  tax_id text,
  address text,
  phone text,
  email text,
  website text,
  timezone text not null default 'America/Managua',
  currency char(3) not null default 'NIO',
  logo_url text,
  settings jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  username text not null,
  email text,
  password_hash text not null default '!',
  full_name text not null,
  role text not null default 'solo_lectura'
    check (role in ('admin', 'medico', 'enfermeria', 'recepcion', 'facturacion', 'solo_lectura')),
  permissions jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  must_change_password boolean not null default true,
  mfa_secret text,
  mfa_enabled boolean not null default false,
  last_login_at timestamptz,
  failed_login_attempts integer not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, username)
);

create unique index users_email_uq
  on public.users (clinic_id, lower(email))
  where email is not null and btrim(email) <> '';

create table public.specialties (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  code text not null,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, code)
);

create table public.offices (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  code text not null,
  name text not null,
  location text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, code)
);

create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  user_id uuid unique references public.users(id) on delete set null,
  employee_code text,
  full_name text not null,
  document_number text,
  license_number text,
  ministry_number text,
  phone text,
  mobile text,
  email text,
  photo_url text,
  signature_url text,
  default_office_id uuid references public.offices(id) on delete set null,
  is_active boolean not null default true,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, employee_code)
);

create index professionals_name_trgm_idx
  on public.professionals using gin (lower(full_name) gin_trgm_ops);

create table public.professional_specialties (
  professional_id uuid not null references public.professionals(id) on delete cascade,
  specialty_id uuid not null references public.specialties(id) on delete restrict,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (professional_id, specialty_id)
);

create table public.history_types (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  code text not null,
  name text not null,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, code)
);

create table public.consultation_reasons (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  code text not null,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, code)
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  code text,
  name text not null,
  company_type text not null default 'otro'
    check (company_type in ('empleador', 'aseguradora', 'farmacia', 'proveedor', 'laboratorio', 'otro')),
  tax_id text,
  address text,
  phone text,
  email text,
  contact_name text,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, code)
);

create table public.document_types (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  code text not null,
  name text not null,
  template text,
  next_number bigint not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, code)
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  record_number text not null,
  document_type text
    check (document_type is null or document_type in ('cedula', 'pasaporte', 'ruc', 'nit', 'ssn', 'sin_documento', 'otro')),
  document_number text,
  document_verified boolean not null default false,
  full_name text not null,
  first_name text,
  last_name text,
  birth_date date,
  age_override smallint check (age_override between 0 and 150),
  birth_date_estimated boolean not null default false,
  deceased boolean not null default false,
  death_date date,
  sex text not null default 'U' check (sex in ('M', 'F', 'X', 'U')),
  marital_status text not null default 'desconocido'
    check (marital_status in ('soltero', 'casado', 'union_libre', 'divorciado', 'viudo', 'otro', 'desconocido')),
  blood_type text,
  nationality text,
  birth_place text,
  address text,
  city text,
  state text,
  country text,
  phone text,
  mobile text,
  email text,
  occupation text,
  employer_id uuid references public.companies(id) on delete set null,
  insurer_id uuid references public.companies(id) on delete set null,
  insurance_policy text,
  is_private boolean not null default true,
  photo_url text,
  allergies_notes text,
  current_diagnosis_summary text,
  guardian_name text,
  guardian_document text,
  guardian_address text,
  guardian_phone text,
  guardian_email text,
  religion text,
  is_suspended boolean not null default false,
  suspension_reason text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  search_text text generated always as (
    lower(public.immutable_unaccent(
      coalesce(full_name, '') || ' ' ||
      coalesce(document_number, '') || ' ' ||
      coalesce(record_number, '')
    ))
  ) stored,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (clinic_id, record_number),
  check (btrim(record_number) <> ''),
  check (document_number is null or btrim(document_number) <> ''),
  check ((not document_verified) or (document_number is not null and btrim(document_number) <> ''))
);

create unique index patients_verified_document_uq
  on public.patients (clinic_id, document_type, document_number)
  where document_verified and document_number is not null;

create index patients_document_idx
  on public.patients (clinic_id, document_number);

create index patients_search_trgm_idx
  on public.patients using gin (search_text gin_trgm_ops);

create index patients_name_idx
  on public.patients (clinic_id, lower(full_name));

create index patients_active_idx
  on public.patients (clinic_id, deleted_at, is_suspended);

create table public.patient_history (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  category text not null
    check (category in ('patologico', 'quirurgico', 'familiar', 'gineco_obstetrico', 'alergia', 'habito', 'vacuna', 'medicamento', 'otro')),
  description text not null,
  details jsonb not null default '{}'::jsonb,
  onset_date date,
  is_active boolean not null default true,
  recorded_at timestamptz not null default now(),
  recorded_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index patient_history_dedupe_uq
  on public.patient_history (patient_id, category, md5(description));

create index patient_history_patient_idx
  on public.patient_history (patient_id, category, recorded_at desc);

create table public.patient_coverages (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  policy_number text,
  coverage_type text not null default 'seguro'
    check (coverage_type in ('seguro', 'empleador', 'particular', 'convenio', 'otro')),
  is_primary boolean not null default true,
  valid_from date,
  valid_to date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (valid_to is null or valid_from is null or valid_to >= valid_from)
);

create index patient_coverages_patient_idx
  on public.patient_coverages (patient_id, is_primary);

create table public.cie10_codes (
  code text primary key,
  description text not null,
  chapter text,
  category text,
  is_billable boolean not null default true,
  search_text text generated always as (
    lower(public.immutable_unaccent(coalesce(code, '') || ' ' || coalesce(description, '')))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (btrim(code) <> ''),
  check (btrim(description) <> '')
);

create index cie10_search_trgm_idx
  on public.cie10_codes using gin (search_text gin_trgm_ops);

create index cie10_category_idx
  on public.cie10_codes (category);

create table public.medications (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete restrict,
  source_code text unique,
  commercial_name text not null,
  generic_name text,
  indications text,
  dose text,
  posology text,
  composition text,
  contraindications text,
  side_effects text,
  properties text,
  presentation text,
  route text,
  category text,
  laboratory text,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  search_text text generated always as (
    lower(public.immutable_unaccent(
      coalesce(commercial_name, '') || ' ' || coalesce(generic_name, '') || ' ' || coalesce(composition, '')
    ))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index medications_search_trgm_idx
  on public.medications using gin (search_text gin_trgm_ops);

create index medications_active_idx
  on public.medications (is_active, commercial_name);

create table public.anamnesis_items (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  specialty_id uuid references public.specialties(id) on delete cascade,
  item_code text not null,
  item_type text not null default 'pregunta'
    check (item_type in ('pregunta', 'seccion', 'examen_fisico', 'otro')),
  prompt text not null,
  default_answer text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, item_code)
);

create index anamnesis_items_specialty_idx
  on public.anamnesis_items (clinic_id, specialty_id, sort_order);

create table public.diagnostic_studies (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  study_type text not null
    check (study_type in ('laboratorio', 'imagenologia', 'cardiologia', 'otro')),
  code text,
  name text not null,
  category text,
  source_table text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, study_type, code)
);

create index diagnostic_studies_name_trgm_idx
  on public.diagnostic_studies using gin (lower(name) gin_trgm_ops);

create table public.procedures (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  code text not null,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, code)
);

create table public.fee_schedule (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  company_id uuid references public.companies(id) on delete cascade,
  procedure_code text not null,
  description text not null,
  amount_cents bigint not null default 0 check (amount_cents >= 0),
  currency char(3) not null default 'NIO',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index fee_schedule_uq
  on public.fee_schedule (
    clinic_id,
    procedure_code,
    coalesce(company_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  professional_id uuid not null references public.professionals(id) on delete restrict,
  specialty_id uuid references public.specialties(id) on delete set null,
  office_id uuid references public.offices(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  duration_minutes integer not null default 30 check (duration_minutes > 0),
  reason text,
  status text not null default 'programada'
    check (status in ('programada', 'confirmada', 'en_espera', 'atendida', 'cancelada', 'no_asistio', 'reprogramada')),
  notes text,
  source text not null default 'web',
  legacy_id text,
  legacy_status text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, legacy_id),
  check (ends_at > starts_at),
  exclude using gist (
    professional_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('programada', 'confirmada', 'en_espera'))
);

create index appointments_professional_idx
  on public.appointments (professional_id, starts_at);

create index appointments_patient_idx
  on public.appointments (patient_id, starts_at desc);

create index appointments_clinic_idx
  on public.appointments (clinic_id, starts_at);

create index appointments_status_idx
  on public.appointments (clinic_id, status, starts_at);

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  professional_id uuid not null references public.professionals(id) on delete restrict,
  appointment_id uuid unique references public.appointments(id) on delete set null,
  specialty_id uuid references public.specialties(id) on delete set null,
  history_type_id uuid references public.history_types(id) on delete set null,
  consultation_type text not null default 'consulta'
    check (consultation_type in ('consulta', 'evolucion', 'interconsulta', 'procedimiento', 'otro')),
  consulted_at timestamptz not null,
  next_visit_at timestamptz,
  reason text,
  current_illness text,
  physical_exam text,
  functional_exam text,
  studies text,
  evolution_text text,
  studies_text text,
  prescription_text text,
  diagnosis_notes text,
  treatment_plan text,
  evolution text,
  plan text,
  notes text,
  vitals jsonb not null default '{}'::jsonb,
  status text not null default 'borrador'
    check (status in ('borrador', 'firmada', 'anulada')),
  signed_at timestamptz,
  signed_by uuid references public.users(id) on delete set null,
  source text not null default 'web',
  legacy_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (clinic_id, legacy_id),
  check ((status <> 'firmada') or (signed_at is not null))
);

create index consultations_patient_idx
  on public.consultations (patient_id, consulted_at desc);

create index consultations_professional_idx
  on public.consultations (professional_id, consulted_at desc);

create index consultations_clinic_idx
  on public.consultations (clinic_id, consulted_at desc);

create table public.consultation_diagnoses (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  consultation_id uuid references public.consultations(id) on delete cascade,
  professional_id uuid references public.professionals(id) on delete set null,
  code_system text not null default 'CIE10',
  cie10_code text references public.cie10_codes(code) on update cascade on delete restrict,
  diagnosis_text text not null,
  diagnosis_type text not null default 'principal'
    check (diagnosis_type in ('principal', 'secundario', 'presuntivo', 'diferencial', 'otro')),
  notes text,
  diagnosed_at timestamptz not null default now(),
  legacy_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, legacy_id)
);

create index consultation_diagnoses_patient_idx
  on public.consultation_diagnoses (patient_id, diagnosed_at desc);

create index consultation_diagnoses_code_idx
  on public.consultation_diagnoses (cie10_code);

create index consultation_diagnoses_consultation_idx
  on public.consultation_diagnoses (consultation_id);

create table public.consultation_procedures (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  consultation_id uuid references public.consultations(id) on delete cascade,
  professional_id uuid references public.professionals(id) on delete set null,
  procedure_id uuid references public.procedures(id) on delete set null,
  procedure_name text not null,
  notes text,
  performed_at timestamptz not null default now(),
  legacy_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, legacy_id)
);

create table public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  consultation_id uuid references public.consultations(id) on delete set null,
  professional_id uuid not null references public.professionals(id) on delete restrict,
  prescription_number text not null,
  issued_at timestamptz not null default now(),
  status text not null default 'emitida'
    check (status in ('borrador', 'emitida', 'dispensada', 'anulada')),
  notes text,
  legacy_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, prescription_number),
  unique (clinic_id, legacy_id)
);

create index prescriptions_patient_idx
  on public.prescriptions (patient_id, issued_at desc);

create table public.prescription_items (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid not null references public.prescriptions(id) on delete cascade,
  medication_id uuid references public.medications(id) on delete set null,
  medication_name text not null,
  presentation text,
  dose text,
  frequency text,
  route text,
  duration text,
  quantity numeric(12,3) check (quantity is null or quantity >= 0),
  instructions text,
  sort_order integer not null default 0,
  legacy_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (prescription_id, legacy_id)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  document_type_id uuid not null references public.document_types(id) on delete restrict,
  professional_id uuid references public.professionals(id) on delete set null,
  document_number text,
  issued_at timestamptz not null default now(),
  content text,
  status text not null default 'emitido'
    check (status in ('borrador', 'emitido', 'anulado')),
  file_url text,
  legacy_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, legacy_id)
);

create unique index documents_number_uq
  on public.documents (clinic_id, document_type_id, document_number)
  where document_number is not null;

create index documents_patient_idx
  on public.documents (patient_id, issued_at desc);

create table public.patient_studies (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  consultation_id uuid references public.consultations(id) on delete set null,
  study_id uuid references public.diagnostic_studies(id) on delete set null,
  document_id uuid references public.documents(id) on delete set null,
  professional_id uuid references public.professionals(id) on delete set null,
  study_type text not null
    check (study_type in ('laboratorio', 'imagenologia', 'cardiologia', 'otro')),
  study_name text not null,
  ordered_at timestamptz,
  performed_at timestamptz,
  status text not null default 'completado'
    check (status in ('solicitado', 'en_proceso', 'completado', 'cancelado')),
  result_summary text,
  result_text text,
  legacy_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, legacy_id)
);

create index patient_studies_patient_idx
  on public.patient_studies (patient_id, performed_at desc);

create table public.clinical_images (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  consultation_id uuid references public.consultations(id) on delete set null,
  professional_id uuid references public.professionals(id) on delete set null,
  category text not null default 'otro'
    check (category in ('foto_paciente', 'radiologia', 'tomografia', 'laboratorio', 'documento', 'otro')),
  title text,
  notes text,
  storage_key text,
  legacy_path text,
  taken_at timestamptz,
  uploaded_by uuid references public.users(id) on delete set null,
  legacy_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, legacy_id)
);

create index clinical_images_patient_idx
  on public.clinical_images (patient_id, taken_at desc);

create table public.medical_orders (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  consultation_id uuid references public.consultations(id) on delete set null,
  professional_id uuid references public.professionals(id) on delete set null,
  document_number text,
  ordered_at timestamptz not null default now(),
  clinic_name text,
  recipient_name text,
  recipient_document text,
  relationship text,
  attention text,
  notes text,
  status text not null default 'emitida'
    check (status in ('borrador', 'emitida', 'anulada')),
  legacy_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, legacy_id)
);

create table public.patient_anamnesis_answers (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  consultation_id uuid references public.consultations(id) on delete set null,
  item_id uuid references public.anamnesis_items(id) on delete set null,
  specialty_code text,
  item_code text,
  prompt_snapshot text,
  answer text,
  details text,
  recorded_at timestamptz not null default now(),
  source text not null default 'web',
  legacy_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, legacy_id)
);

create index patient_anamnesis_patient_idx
  on public.patient_anamnesis_answers (patient_id, recorded_at desc);

create table public.report_definitions (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  code text not null,
  name text not null,
  description text,
  category text,
  parameters jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, code)
);

create table public.audit_log (
  id bigserial primary key,
  clinic_id uuid references public.clinics(id) on delete restrict,
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index audit_log_created_brin_idx
  on public.audit_log using brin (created_at);

create index audit_log_entity_idx
  on public.audit_log (entity, entity_id, created_at desc);

create index audit_log_user_idx
  on public.audit_log (user_id, created_at desc);

create table public.data_quality_issues (
  id bigserial primary key,
  batch_id uuid,
  source_table text not null,
  legacy_ref text,
  issue_type text not null,
  details jsonb not null default '{}'::jsonb,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index data_quality_issues_type_idx
  on public.data_quality_issues (issue_type, resolved, created_at desc);

do $$
declare
  t text;
begin
  foreach t in array array[
    'clinics', 'users', 'specialties', 'offices', 'professionals', 'history_types',
    'consultation_reasons', 'companies', 'document_types', 'patients', 'patient_history',
    'patient_coverages', 'cie10_codes', 'medications', 'anamnesis_items',
    'diagnostic_studies', 'procedures', 'fee_schedule', 'appointments', 'consultations',
    'consultation_diagnoses', 'consultation_procedures', 'prescriptions',
    'prescription_items', 'documents', 'patient_studies', 'clinical_images',
    'medical_orders', 'patient_anamnesis_answers', 'report_definitions'
  ]
  loop
    execute format('drop trigger if exists %I on public.%I', 'trg_' || t || '_updated_at', t);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      'trg_' || t || '_updated_at',
      t
    );
  end loop;
end;
$$;

commit;
