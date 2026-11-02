begin;

insert into public.clinics (code, name, timezone, currency, settings)
values ('principal', 'Clínica Demo', 'America/Managua', 'NIO', '{"demo": true}'::jsonb)
on conflict (code) do nothing;

insert into public.users (
  clinic_id, username, email, password_hash, full_name, role,
  permissions, is_active, must_change_password
)
select
  c.id,
  'demo',
  'demo@clinica.local',
  crypt('Demo1234!', gen_salt('bf')),
  'Dra. Valentina Ríos',
  'medico',
  '{"demo": true}'::jsonb,
  true,
  false
from public.clinics c
where c.code = 'principal'
on conflict (clinic_id, username) do update
set
  password_hash = excluded.password_hash,
  email = excluded.email,
  full_name = excluded.full_name,
  role = excluded.role,
  permissions = excluded.permissions,
  is_active = true,
  must_change_password = false,
  updated_at = now();

insert into public.professionals (
  clinic_id, user_id, employee_code, full_name, document_number,
  license_number, ministry_number, phone, email, is_active, metadata
)
select
  c.id,
  u.id,
  'DEMO',
  'Dra. Valentina Ríos',
  'DEMO-0001',
  'MP-12345',
  'MINSA-12345',
  '+505 8888 0000',
  'demo@clinica.local',
  true,
  '{"demo": true}'::jsonb
from public.clinics c
join public.users u on u.clinic_id = c.id and u.username = 'demo'
where c.code = 'principal'
on conflict (clinic_id, employee_code) do update
set
  user_id = excluded.user_id,
  full_name = excluded.full_name,
  is_active = true,
  updated_at = now();

insert into public.patients (
  clinic_id, record_number, document_type, document_number, document_verified,
  full_name, first_name, last_name, birth_date, sex, phone, mobile, email,
  address, allergies_notes, notes, created_by
)
select
  c.id,
  v.record_number,
  'cedula',
  v.document_number,
  true,
  v.full_name,
  v.first_name,
  v.last_name,
  v.birth_date,
  v.sex,
  v.phone,
  v.mobile,
  v.email,
  v.address,
  v.allergies_notes,
  'Paciente de demostración',
  u.id
from public.clinics c
join public.users u on u.clinic_id = c.id and u.username = 'demo'
cross join (
  values
    ('DEMO-0001', '001-120488-0001A', 'María Fernanda López', 'María Fernanda', 'López', date '1988-04-12', 'F', '+505 8888 1001', '+505 7777 1001', 'maria.lopez@example.com', 'Managua, Bolonia', 'Penicilina', null),
    ('DEMO-0002', '001-030975-0002B', 'Carlos Alberto Méndez', 'Carlos Alberto', 'Méndez', date '1975-09-03', 'M', '+505 8888 1002', '+505 7777 1002', 'carlos.mendez@example.com', 'Masaya, Centro', null, null),
    ('DEMO-0003', '001-211192-0003C', 'Ana Lucía Torres', 'Ana Lucía', 'Torres', date '1992-11-21', 'F', '+505 8888 1003', '+505 7777 1003', 'ana.torres@example.com', 'Granada, Xalteva', 'Sulfonamidas', null),
    ('DEMO-0004', '001-170264-0004D', 'José Ramón Castillo', 'José Ramón', 'Castillo', date '1964-02-17', 'M', '+505 8888 1004', '+505 7777 1004', 'jose.castillo@example.com', 'León, Sutiava', null, null),
    ('DEMO-0005', '001-300601-0005E', 'Sofía Isabel Ramírez', 'Sofía Isabel', 'Ramírez', date '2001-06-30', 'F', '+505 8888 1005', '+505 7777 1005', 'sofia.ramirez@example.com', 'Managua, Altamira', null, null),
    ('DEMO-0006', '001-081283-0006F', 'Luis Enrique Herrera', 'Luis Enrique', 'Herrera', date '1983-12-08', 'M', '+505 8888 1006', '+505 7777 1006', 'luis.herrera@example.com', 'Estelí, Centro', 'AINE', null),
    ('DEMO-0007', '001-150396-0007G', 'Camila Andrea Rojas', 'Camila Andrea', 'Rojas', date '1996-03-15', 'F', '+505 8888 1007', '+505 7777 1007', 'camila.rojas@example.com', 'Managua, Los Robles', null, null),
    ('DEMO-0008', '001-220758-0008H', 'Pedro Antonio Salazar', 'Pedro Antonio', 'Salazar', date '1958-07-22', 'M', '+505 8888 1008', '+505 7777 1008', 'pedro.salazar@example.com', 'Rivas, Centro', null, null)
) as v(record_number, document_number, full_name, first_name, last_name, birth_date, sex, phone, mobile, email, address, allergies_notes, unused)
where c.code = 'principal'
on conflict (clinic_id, record_number) do nothing;

insert into public.cie10_codes (code, description, chapter, category)
values
  ('J00', 'Rinofaringitis aguda (resfriado común)', 'Enfermedades del aparato respiratorio', 'J00-J06'),
  ('I10', 'Hipertensión esencial (primaria)', 'Enfermedades del aparato circulatorio', 'I10-I15'),
  ('E11.9', 'Diabetes mellitus tipo 2 sin complicaciones', 'Enfermedades endocrinas, nutricionales y metabólicas', 'E10-E14'),
  ('M54.5', 'Lumbago no especificado', 'Enfermedades del sistema osteomuscular', 'M50-M54'),
  ('R50.9', 'Fiebre no especificada', 'Síntomas y signos generales', 'R50-R69'),
  ('K29.7', 'Gastritis no especificada', 'Enfermedades del aparato digestivo', 'K20-K31'),
  ('G43.9', 'Migraña no especificada', 'Enfermedades del sistema nervioso', 'G40-G47'),
  ('J45.9', 'Asma no especificada', 'Enfermedades del aparato respiratorio', 'J40-J47'),
  ('N39.0', 'Infección de vías urinarias, sitio no especificado', 'Enfermedades del aparato genitourinario', 'N30-N39'),
  ('F41.9', 'Trastorno de ansiedad no especificado', 'Trastornos mentales y del comportamiento', 'F40-F48')
on conflict (code) do nothing;

insert into public.appointments (
  clinic_id, patient_id, professional_id, starts_at, ends_at,
  duration_minutes, reason, status, source, created_by
)
select
  c.id,
  p.id,
  pr.id,
  ((date_trunc('day', now() at time zone c.timezone) + v.slot_offset) at time zone c.timezone),
  ((date_trunc('day', now() at time zone c.timezone) + v.slot_offset + interval '30 minutes') at time zone c.timezone),
  30,
  v.reason,
  'programada',
  'demo',
  u.id
from public.clinics c
join public.users u on u.clinic_id = c.id and u.username = 'demo'
join public.professionals pr on pr.clinic_id = c.id and pr.employee_code = 'DEMO'
join (
  values
    ('DEMO-0001', interval '9 hours', 'Control de hipertensión'),
    ('DEMO-0002', interval '9 hours 30 minutes', 'Dolor lumbar'),
    ('DEMO-0003', interval '10 hours', 'Cefalea recurrente'),
    ('DEMO-0004', interval '10 hours 30 minutes', 'Control de diabetes'),
    ('DEMO-0005', interval '11 hours', 'Consulta general'),
    ('DEMO-0006', interval '11 hours 30 minutes', 'Control de asma'),
    ('DEMO-0007', interval '12 hours', 'Infección urinaria'),
    ('DEMO-0008', interval '12 hours 30 minutes', 'Control de presión arterial')
) as v(record_number, slot_offset, reason) on true
join public.patients p on p.clinic_id = c.id and p.record_number = v.record_number
where c.code = 'principal'
  and not exists (
    select 1
    from public.appointments a
    where a.clinic_id = c.id
      and a.professional_id = pr.id
      and a.starts_at = ((date_trunc('day', now() at time zone c.timezone) + v.slot_offset) at time zone c.timezone)
  );

insert into public.consultations (
  clinic_id, patient_id, professional_id, consultation_type, consulted_at,
  reason, current_illness, physical_exam, treatment_plan, status, source,
  created_by, legacy_id
)
select
  c.id,
  p.id,
  pr.id,
  'consulta',
  now() - interval '2 hours',
  'Control de hipertensión arterial',
  'Paciente refiere cefalea leve ocasional, sin dolor torácico ni disnea. Refiere adherencia parcial al tratamiento.',
  'PA 138/86 mmHg, FC 78 lpm, T 36.6 °C, SatO2 98%. Consciente, orientada, afebril. Ruidos cardíacos rítmicos sin soplos. Pulmones clear.',
  'Continuar losartán 50 mg cada 24 horas. Dieta hiposódica. Control en 30 días. Signos de alarma explicados.',
  'borrador',
  'demo',
  u.id,
  'demo-consult-1'
from public.clinics c
join public.users u on u.clinic_id = c.id and u.username = 'demo'
join public.professionals pr on pr.clinic_id = c.id and pr.employee_code = 'DEMO'
join public.patients p on p.clinic_id = c.id and p.record_number = 'DEMO-0001'
where c.code = 'principal'
  and not exists (
    select 1 from public.consultations x
    where x.clinic_id = c.id and x.legacy_id = 'demo-consult-1'
  );

insert into public.consultation_diagnoses (
  clinic_id, patient_id, consultation_id, professional_id,
  code_system, cie10_code, diagnosis_text, diagnosis_type, legacy_id
)
select
  c.id,
  x.patient_id,
  x.id,
  x.professional_id,
  'CIE10',
  'I10',
  'Hipertensión esencial (primaria)',
  'principal',
  'demo-diag-1'
from public.consultations x
join public.clinics c on c.id = x.clinic_id
where c.code = 'principal'
  and x.legacy_id = 'demo-consult-1'
  and not exists (
    select 1 from public.consultation_diagnoses d
    where d.clinic_id = c.id and d.legacy_id = 'demo-diag-1'
  );

commit;
