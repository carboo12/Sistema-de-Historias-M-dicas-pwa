import { many, one, transaction } from '../db.mjs';
import { HttpError, audit, isoDate, positiveInt, text, uuid } from '../lib.mjs';

const APPOINTMENT_STATUSES = [
  'programada',
  'confirmada',
  'en_espera',
  'atendida',
  'cancelada',
  'no_asistio',
  'reprogramada'
];

function localDate(timezone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function validDate(value, fallback) {
  if (!value) return fallback;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    throw new HttpError(400, 'validation_error', 'Fecha inválida');
  }
  return String(value);
}

function mapAppointment(row) {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    patientRecord: row.record_number,
    patientPhone: row.patient_phone,
    professionalId: row.professional_id,
    professionalName: row.professional_name,
    specialtyName: row.specialty_name,
    officeName: row.office_name,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    durationMinutes: row.duration_minutes,
    reason: row.reason,
    status: row.status,
    notes: row.notes,
    consultationId: row.consultation_id ?? null
  };
}

export async function agendaRoutes(app) {
  app.get('/api/agenda', { preHandler: [app.authenticate] }, async (request) => {
    const timezone = request.user.timezone || 'America/Managua';
    const requestedMonth = /^\d{4}-\d{2}$/.test(String(request.query?.month ?? ''))
      ? String(request.query.month)
      : null;
    const date = requestedMonth
      ? validDate(`${requestedMonth}-01`, localDate(timezone))
      : validDate(request.query?.date, localDate(timezone));
    const endDate = requestedMonth
      ? new Date(Date.UTC(Number(requestedMonth.slice(0, 4)), Number(requestedMonth.slice(5, 7)), 1)).toISOString().slice(0, 10)
      : new Date(Date.parse(`${date}T00:00:00Z`) + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const rows = await many(
      `select
         a.*,
         p.full_name as patient_name, p.record_number, p.phone as patient_phone,
         pr.full_name as professional_name,
         s.name as specialty_name,
         o.name as office_name,
         c.id as consultation_id
       from public.appointments a
       join public.patients p on p.id = a.patient_id
       join public.professionals pr on pr.id = a.professional_id
       left join public.specialties s on s.id = a.specialty_id
       left join public.offices o on o.id = a.office_id
       left join public.consultations c on c.appointment_id = a.id and c.deleted_at is null
       where a.clinic_id = $1
         and a.starts_at >= ($2::date::timestamp at time zone $3)
         and a.starts_at < ($4::date::timestamp at time zone $3)
       order by a.starts_at`,
      [request.user.clinicId, date, timezone, endDate]
    );

    const appointments = rows.map(mapAppointment);
    const stats = {
      total: appointments.length,
      scheduled: appointments.filter((item) => ['programada', 'confirmada'].includes(item.status)).length,
      waiting: appointments.filter((item) => item.status === 'en_espera').length,
      attended: appointments.filter((item) => item.status === 'atendida').length,
      cancelled: appointments.filter((item) => ['cancelada', 'no_asistio'].includes(item.status)).length
    };

    return { date, month: requestedMonth, timezone, appointments, stats };
  });

  app.get('/api/appointments', { preHandler: [app.authenticate] }, async (request) => {
    const patientId = request.query?.patientId;
    if (patientId) uuid(patientId, 'paciente');

    const rows = await many(
      `select
         a.*,
         p.full_name as patient_name, p.record_number, p.phone as patient_phone,
         pr.full_name as professional_name,
         s.name as specialty_name,
         o.name as office_name
       from public.appointments a
       join public.patients p on p.id = a.patient_id
       join public.professionals pr on pr.id = a.professional_id
       left join public.specialties s on s.id = a.specialty_id
       left join public.offices o on o.id = a.office_id
       where a.clinic_id = $1
         and ($2::uuid is null or a.patient_id = $2)
       order by a.starts_at desc
       limit 40`,
      [request.user.clinicId, patientId ?? null]
    );

    return { appointments: rows.map(mapAppointment) };
  });

  app.post(
    '/api/appointments',
    { preHandler: [app.authenticate, requireAgendaAccess] },
    async (request, reply) => {
      const body = request.body ?? {};
      const patientId = uuid(body.patientId, 'paciente');
      const startsAt = isoDate(body.startsAt, 'fecha de inicio');
      const durationMinutes = positiveInt(body.durationMinutes, 'duración', 30);
      const endsAt = new Date(new Date(startsAt).getTime() + durationMinutes * 60_000).toISOString();

      const patient = await one(
        'select id, full_name from public.patients where id = $1 and clinic_id = $2 and deleted_at is null',
        [patientId, request.user.clinicId]
      );
      if (!patient) throw new HttpError(404, 'not_found', 'Paciente no encontrado');

      let professionalId = body.professionalId;
      if (professionalId) uuid(professionalId, 'profesional');
      if (!professionalId && request.user.professionalId) professionalId = request.user.professionalId;
      if (!professionalId) {
        const professional = await one(
          `select id from public.professionals
           where clinic_id = $1 and is_active
           order by full_name limit 1`,
          [request.user.clinicId]
        );
        professionalId = professional?.id;
      }
      if (!professionalId) throw new HttpError(400, 'validation_error', 'No hay profesionales disponibles');

      const professional = await one(
        'select id, full_name from public.professionals where id = $1 and clinic_id = $2 and is_active',
        [professionalId, request.user.clinicId]
      );
      if (!professional) throw new HttpError(404, 'not_found', 'Profesional no encontrado');

      try {
        const result = await transaction(async (client) => {
          const inserted = await client.query(
            `insert into public.appointments (
               clinic_id, patient_id, professional_id, specialty_id, office_id,
               starts_at, ends_at, duration_minutes, reason, status, notes, source, created_by
             ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'programada', $10, 'web', $11)
             returning *`,
            [
              request.user.clinicId,
              patientId,
              professionalId,
              body.specialtyId ? uuid(body.specialtyId, 'especialidad') : null,
              body.officeId ? uuid(body.officeId, 'consultorio') : null,
              startsAt,
              endsAt,
              durationMinutes,
              text(body.reason, 500),
              text(body.notes, 2000),
              request.user.sub
            ]
          );
          await audit(client, request, 'create', 'appointment', inserted.rows[0].id, null, {
            patientId,
            professionalId,
            startsAt,
            endsAt
          });
          return inserted.rows[0];
        });

        return reply.code(201).send({
          appointment: {
            id: result.id,
            patientId,
            patientName: patient.full_name,
            professionalId,
            professionalName: professional.full_name,
            startsAt: result.starts_at,
            endsAt: result.ends_at,
            durationMinutes,
            reason: result.reason,
            status: result.status
          }
        });
      } catch (error) {
        if (error.code === '23P01') {
          throw new HttpError(409, 'appointment_overlap', 'El profesional ya tiene una cita en ese horario');
        }
        throw error;
      }
    }
  );

  app.patch(
    '/api/appointments/:id',
    { preHandler: [app.authenticate, requireAgendaAccess] },
    async (request) => {
      const id = uuid(request.params.id, 'cita');
      const body = request.body ?? {};
      const startsAt = isoDate(body.startsAt, 'fecha de cita');
      const duration = positiveInt(body.durationMinutes, 'duración', 30);
      const endsAt = new Date(new Date(startsAt).getTime() + duration * 60_000).toISOString();
      const status = body.status ?? 'programada';
      if (!APPOINTMENT_STATUSES.includes(status)) throw new HttpError(400, 'validation_error', 'Estado de cita inválido');
      const before = await one('select * from public.appointments where id = $1 and clinic_id = $2', [id, request.user.clinicId]);
      if (!before) throw new HttpError(404, 'not_found', 'Cita no encontrada');
      try {
        const updated = await transaction(async (client) => {
          const result = await client.query(
            `update public.appointments set starts_at=$3,ends_at=$4,duration_minutes=$5,reason=$6,notes=$7,status=$8,updated_at=now()
             where id=$1 and clinic_id=$2 returning *`,
            [id, request.user.clinicId, startsAt, endsAt, duration, text(body.reason, 500), text(body.notes, 2000), status]
          );
          await audit(client, request, 'update', 'appointment', id, before, result.rows[0]);
          return result.rows[0];
        });
        return { appointment: { id: updated.id, startsAt: updated.starts_at, endsAt: updated.ends_at, durationMinutes: updated.duration_minutes, status: updated.status, reason: updated.reason, notes: updated.notes } };
      } catch (error) {
        if (error.code === '23P01') throw new HttpError(409, 'appointment_overlap', 'El profesional ya tiene una cita en ese horario');
        throw error;
      }
    }
  );

  app.patch(
    '/api/appointments/:id/status',
    { preHandler: [app.authenticate, requireAgendaAccess] },
    async (request) => {
      const id = uuid(request.params.id, 'cita');
      const status = request.body?.status;
      if (!APPOINTMENT_STATUSES.includes(status)) {
        throw new HttpError(400, 'validation_error', 'Estado de cita inválido');
      }

      const before = await one(
        'select * from public.appointments where id = $1 and clinic_id = $2',
        [id, request.user.clinicId]
      );
      if (!before) throw new HttpError(404, 'not_found', 'Cita no encontrada');

      const result = await transaction(async (client) => {
        const updated = await client.query(
          `update public.appointments
           set status = $3, updated_at = now()
           where id = $1 and clinic_id = $2
           returning *`,
          [id, request.user.clinicId, status]
        );
        await audit(client, request, 'status', 'appointment', id, { status: before.status }, { status });
        return updated.rows[0];
      });

      return {
        appointment: {
          id: result.id,
          status: result.status,
          startsAt: result.starts_at,
          endsAt: result.ends_at
        }
      };
    }
  );
}

async function requireAgendaAccess(request) {
  if (!['admin', 'medico', 'recepcion', 'enfermeria'].includes(request.user?.role)) {
    throw new HttpError(403, 'forbidden', 'No tienes permiso para gestionar la agenda');
  }
}
