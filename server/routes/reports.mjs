import { many } from '../db.mjs';
import { HttpError } from '../lib.mjs';

function dateRange(query) {
  const from = String(query?.from ?? '');
  const to = String(query?.to ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to) {
    throw new HttpError(400, 'validation_error', 'Indica un rango de fechas válido');
  }
  return [from, to];
}

export async function reportRoutes(app) {
  app.get('/api/reports', { preHandler: [app.authenticate] }, async (request) => {
    const [from, to] = dateRange(request.query);
    const clinicId = request.user.clinicId;
    const consultations = await many(
      `select c.id, c.consulted_at, c.reason, p.full_name as patient_name, p.record_number,
              p.sex, p.birth_date, pr.full_name as professional_name,
              coalesce(json_agg(json_build_object('code', d.cie10_code, 'description', d.diagnosis_text, 'type', d.diagnosis_type))
                filter (where d.id is not null), '[]'::json) as diagnoses
       from public.consultations c
       join public.patients p on p.id = c.patient_id
       join public.professionals pr on pr.id = c.professional_id
       left join public.consultation_diagnoses d on d.consultation_id = c.id
       where c.clinic_id = $1 and c.deleted_at is null
         and c.consulted_at >= $2::date and c.consulted_at < ($3::date + interval '1 day')
       group by c.id, p.full_name, p.record_number, p.sex, p.birth_date, pr.full_name
       order by c.consulted_at desc`,
      [clinicId, from, to]
    );
    const patients = await many(
      `select id, created_at, sex, birth_date
       from public.patients
       where clinic_id = $1 and deleted_at is null
         and created_at >= $2::date and created_at < ($3::date + interval '1 day')
       order by created_at desc`,
      [clinicId, from, to]
    );
    return {
      consultations: consultations.map((row) => ({
        id: row.id,
        consultedAt: row.consulted_at,
        reason: row.reason,
        patientName: row.patient_name,
        recordNumber: row.record_number,
        sex: row.sex,
        birthDate: row.birth_date,
        professionalName: row.professional_name,
        diagnoses: row.diagnoses
      })),
      patients: patients.map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        sex: row.sex,
        birthDate: row.birth_date
      }))
    };
  });
}
