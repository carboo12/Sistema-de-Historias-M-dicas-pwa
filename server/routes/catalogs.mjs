import { many } from '../db.mjs';

export async function catalogRoutes(app) {
  app.get('/api/catalogs', { preHandler: [app.authenticate] }, async (request) => {
    const clinicId = request.user.clinicId;

    const [professionals, offices, specialties, reasons] = await Promise.all([
      many(
        `select p.id, p.full_name, p.license_number, p.default_office_id,
                coalesce(
                  jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name))
                  filter (where s.id is not null),
                  '[]'::jsonb
                ) as specialties
         from public.professionals p
         left join public.professional_specialties ps on ps.professional_id = p.id
         left join public.specialties s on s.id = ps.specialty_id
         where p.clinic_id = $1 and p.is_active
         group by p.id
         order by p.full_name`,
        [clinicId]
      ),
      many(
        `select id, code, name, location
         from public.offices
         where clinic_id = $1 and is_active
         order by name`,
        [clinicId]
      ),
      many(
        `select id, code, name
         from public.specialties
         where clinic_id = $1 and is_active
         order by name`,
        [clinicId]
      ),
      many(
        `select id, code, name
         from public.consultation_reasons
         where clinic_id = $1 and is_active
         order by name`,
        [clinicId]
      )
    ]);

    return {
      professionals,
      offices,
      specialties,
      reasons,
      documentTypes: [
        { code: 'cedula', name: 'Cédula' },
        { code: 'pasaporte', name: 'Pasaporte' },
        { code: 'ruc', name: 'RUC' },
        { code: 'nit', name: 'NIT' },
        { code: 'ssn', name: 'SSN' },
        { code: 'sin_documento', name: 'Sin documento' },
        { code: 'otro', name: 'Otro' }
      ]
    };
  });

  app.get('/api/summary', { preHandler: [app.authenticate] }, async (request) => {
    const [patients, drafts, signed, upcoming] = await Promise.all([
      many(
        `select count(*)::int as total from public.patients
         where clinic_id = $1 and deleted_at is null`,
        [request.user.clinicId]
      ),
      many(
        `select count(*)::int as total from public.consultations
         where clinic_id = $1 and status = 'borrador' and deleted_at is null`,
        [request.user.clinicId]
      ),
      many(
        `select count(*)::int as total from public.consultations
         where clinic_id = $1 and status = 'firmada' and deleted_at is null`,
        [request.user.clinicId]
      ),
      many(
        `select count(*)::int as total from public.appointments
         where clinic_id = $1 and status in ('programada', 'confirmada', 'en_espera')
           and starts_at >= now()`,
        [request.user.clinicId]
      )
    ]);

    return {
      patients: patients[0].total,
      drafts: drafts[0].total,
      signed: signed[0].total,
      upcomingAppointments: upcoming[0].total
    };
  });
}
