begin;

create or replace view public.v_patient_summary as
select
  p.id,
  p.clinic_id,
  p.record_number,
  p.full_name,
  p.sex,
  p.birth_date,
  case
    when p.birth_date is null then null
    else extract(year from age(current_date, p.birth_date))::integer
  end as age_years,
  p.document_type,
  p.document_number,
  p.phone,
  p.mobile,
  p.email,
  p.is_private,
  p.is_suspended,
  p.deleted_at,
  coalesce(c.consultation_count, 0) as consultation_count,
  c.last_consultation_at,
  a.next_appointment_at
from public.patients p
left join (
  select
    patient_id,
    count(*)::bigint as consultation_count,
    max(consulted_at) as last_consultation_at
  from public.consultations
  where deleted_at is null
  group by patient_id
) c on c.patient_id = p.id
left join (
  select
    patient_id,
    min(starts_at) as next_appointment_at
  from public.appointments
  where starts_at >= now()
    and status in ('programada', 'confirmada', 'en_espera')
  group by patient_id
) a on a.patient_id = p.id;

create or replace view public.v_today_agenda as
select
  a.id,
  a.clinic_id,
  a.starts_at,
  a.ends_at,
  a.status,
  a.reason,
  a.patient_id,
  p.record_number,
  p.full_name as patient_name,
  p.phone as patient_phone,
  p.mobile as patient_mobile,
  a.professional_id,
  pr.full_name as professional_name,
  a.specialty_id,
  s.name as specialty_name,
  a.office_id,
  o.name as office_name
from public.appointments a
join public.clinics c on c.id = a.clinic_id
join public.patients p on p.id = a.patient_id
join public.professionals pr on pr.id = a.professional_id
left join public.specialties s on s.id = a.specialty_id
left join public.offices o on o.id = a.office_id
where (a.starts_at at time zone c.timezone)::date = (now() at time zone c.timezone)::date
  and a.status in ('programada', 'confirmada', 'en_espera', 'atendida');

create or replace view public.v_upcoming_appointments as
select
  a.id,
  a.clinic_id,
  a.starts_at,
  a.ends_at,
  a.status,
  a.reason,
  a.patient_id,
  p.record_number,
  p.full_name as patient_name,
  p.phone as patient_phone,
  p.mobile as patient_mobile,
  a.professional_id,
  pr.full_name as professional_name,
  s.name as specialty_name
from public.appointments a
join public.patients p on p.id = a.patient_id
join public.professionals pr on pr.id = a.professional_id
left join public.specialties s on s.id = a.specialty_id
where a.starts_at >= now()
  and a.status in ('programada', 'confirmada', 'en_espera');

create or replace view public.v_consultation_summary as
select
  c.id,
  c.clinic_id,
  c.patient_id,
  p.record_number,
  p.full_name as patient_name,
  c.professional_id,
  pr.full_name as professional_name,
  c.consultation_type,
  c.consulted_at,
  c.next_visit_at,
  c.status,
  c.signed_at,
  count(d.id)::bigint as diagnosis_count
from public.consultations c
join public.patients p on p.id = c.patient_id
join public.professionals pr on pr.id = c.professional_id
left join public.consultation_diagnoses d on d.consultation_id = c.id
where c.deleted_at is null
group by
  c.id, c.clinic_id, c.patient_id, p.record_number, p.full_name,
  c.professional_id, pr.full_name, c.consultation_type, c.consulted_at,
  c.next_visit_at, c.status, c.signed_at;

create or replace view public.v_patient_diagnoses as
select
  d.id,
  d.clinic_id,
  d.patient_id,
  p.record_number,
  p.full_name as patient_name,
  d.consultation_id,
  d.cie10_code,
  ci.description as cie10_description,
  d.diagnosis_text,
  d.diagnosis_type,
  d.diagnosed_at,
  d.professional_id,
  pr.full_name as professional_name
from public.consultation_diagnoses d
join public.patients p on p.id = d.patient_id
left join public.cie10_codes ci on ci.code = d.cie10_code
left join public.professionals pr on pr.id = d.professional_id;

create or replace view public.v_patient_medications as
select
  i.id,
  rx.clinic_id,
  rx.patient_id,
  p.record_number,
  p.full_name as patient_name,
  rx.id as prescription_id,
  rx.prescription_number,
  rx.issued_at,
  i.medication_id,
  i.medication_name,
  i.presentation,
  i.dose,
  i.frequency,
  i.route,
  i.duration,
  i.quantity,
  i.instructions,
  rx.professional_id,
  pr.full_name as professional_name
from public.prescription_items i
join public.prescriptions rx on rx.id = i.prescription_id
join public.patients p on p.id = rx.patient_id
left join public.professionals pr on pr.id = rx.professional_id;

create or replace view public.v_data_quality_summary as
select
  issue_type,
  count(*)::bigint as issue_count,
  max(created_at) as last_detected_at
from public.data_quality_issues
where not resolved
group by issue_type
order by issue_count desc;

create or replace view public.v_duplicate_patients as
select
  p.clinic_id,
  p.document_number,
  count(*)::bigint as patient_count,
  jsonb_agg(
    jsonb_build_object(
      'patient_id', p.id,
      'record_number', p.record_number,
      'full_name', p.full_name,
      'birth_date', p.birth_date
    )
    order by p.record_number
  ) as patients
from public.patients p
where p.document_number is not null
  and p.deleted_at is null
group by p.clinic_id, p.document_number
having count(*) > 1;

create or replace view public.v_legacy_row_counts as
select
  table_name,
  count(*)::bigint as row_count
from legacy.raw_rows
group by table_name
order by table_name;

commit;
