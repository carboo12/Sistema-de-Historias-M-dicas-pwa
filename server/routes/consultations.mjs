import { many, one, query, transaction } from '../db.mjs';
import { HttpError, audit, isoDate, jsonObject, requiredText, text, uuid } from '../lib.mjs';

const DIAGNOSIS_TYPES = ['principal', 'secundario', 'presuntivo', 'diferencial', 'otro'];
const CONSULTATION_TYPES = ['consulta', 'evolucion', 'interconsulta', 'procedimiento', 'otro'];

function mapConsultation(row) {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    recordNumber: row.record_number,
    birthDate: row.birth_date,
    sex: row.sex,
    allergiesNotes: row.allergies_notes,
    professionalId: row.professional_id,
    professionalName: row.professional_name,
    appointmentId: row.appointment_id,
    specialtyId: row.specialty_id,
    consultationType: row.consultation_type,
    consultedAt: row.consulted_at,
    nextVisitAt: row.next_visit_at,
    reason: row.reason,
    currentIllness: row.current_illness,
    physicalExam: row.physical_exam,
    functionalExam: row.functional_exam,
    studies: row.studies,
    diagnosisNotes: row.diagnosis_notes,
    treatmentPlan: row.treatment_plan,
    evolution: row.evolution,
    plan: row.plan,
    notes: row.notes,
    vitals: row.vitals,
    status: row.status,
    signedAt: row.signed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function currentProfessional(request) {
  if (request.user.professionalId) return request.user.professionalId;
  const professional = await one(
    `select id from public.professionals
     where clinic_id = $1 and is_active
     order by full_name limit 1`,
    [request.user.clinicId]
  );
  if (!professional) throw new HttpError(400, 'validation_error', 'No hay profesionales disponibles');
  return professional.id;
}

async function loadConsultation(request, id, client = null) {
  const runner = client ?? { query };
  const result = await runner.query(
    `select
       c.*, p.full_name as patient_name, p.record_number, p.birth_date, p.sex, p.allergies_notes,
       pr.full_name as professional_name
     from public.consultations c
     join public.patients p on p.id = c.patient_id
     join public.professionals pr on pr.id = c.professional_id
     where c.id = $1 and c.clinic_id = $2 and c.deleted_at is null`,
    [id, request.user.clinicId]
  );
  const row = result.rows[0];
  if (!row) throw new HttpError(404, 'not_found', 'Consulta no encontrada');
  return row;
}

export async function consultationRoutes(app) {
  app.get('/api/consultations', { preHandler: [app.authenticate] }, async (request) => {
    const patientId = request.query?.patientId;
    if (patientId) uuid(patientId, 'paciente');

    const rows = await many(
      `select
         c.id, c.consulted_at, c.status, c.reason, c.current_illness,
         c.treatment_plan, c.signed_at, c.updated_at,
         p.full_name as patient_name, p.record_number,
         pr.full_name as professional_name,
         coalesce(
           jsonb_agg(
             jsonb_build_object(
               'id', d.id,
               'code', d.cie10_code,
               'description', d.diagnosis_text,
               'type', d.diagnosis_type
             )
           ) filter (where d.id is not null),
           '[]'::jsonb
         ) as diagnoses
       from public.consultations c
       join public.patients p on p.id = c.patient_id
       join public.professionals pr on pr.id = c.professional_id
       left join public.consultation_diagnoses d on d.consultation_id = c.id
       where c.clinic_id = $1
         and c.deleted_at is null
         and ($2::uuid is null or c.patient_id = $2)
       group by c.id, p.full_name, p.record_number, pr.full_name
       order by c.consulted_at desc
       limit 60`,
      [request.user.clinicId, patientId ?? null]
    );

    return { consultations: rows };
  });

  app.get('/api/consultations/:id', { preHandler: [app.authenticate] }, async (request) => {
    const id = uuid(request.params.id, 'consulta');
    const consultation = await loadConsultation(request, id);
    const diagnoses = await many(
      `select id, cie10_code as code, diagnosis_text as description,
              diagnosis_type as type, notes, diagnosed_at
       from public.consultation_diagnoses
       where consultation_id = $1
       order by diagnosis_type, diagnosed_at`,
      [id]
    );

    const canSign =
      consultation.status === 'borrador' &&
      Boolean(consultation.reason && consultation.reason.trim()) &&
      diagnoses.length > 0;

    return {
      consultation: mapConsultation(consultation),
      diagnoses,
      canSign,
      signBlockers: {
        reason: !consultation.reason || !consultation.reason.trim(),
        diagnosis: diagnoses.length === 0
      }
    };
  });

  app.post(
    '/api/consultations',
    { preHandler: [app.authenticate, requireClinician] },
    async (request, reply) => {
      const body = request.body ?? {};
      const patientId = uuid(body.patientId, 'paciente');
      const patient = await one(
        'select id, full_name from public.patients where id = $1 and clinic_id = $2 and deleted_at is null',
        [patientId, request.user.clinicId]
      );
      if (!patient) throw new HttpError(404, 'not_found', 'Paciente no encontrado');

      const professionalId = body.professionalId
        ? uuid(body.professionalId, 'profesional')
        : await currentProfessional(request);

      const professional = await one(
        'select id from public.professionals where id = $1 and clinic_id = $2 and is_active',
        [professionalId, request.user.clinicId]
      );
      if (!professional) {
        throw new HttpError(400, 'invalid_professional', 'El profesional no pertenece a esta clínica');
      }

      let appointmentId = null;
      if (body.appointmentId) {
        appointmentId = uuid(body.appointmentId, 'cita');
        const appointment = await one(
          `select id, patient_id, professional_id from public.appointments
           where id = $1 and clinic_id = $2`,
          [appointmentId, request.user.clinicId]
        );
        if (!appointment) throw new HttpError(404, 'not_found', 'Cita no encontrada');
        if (appointment.patient_id !== patientId) {
          throw new HttpError(400, 'validation_error', 'La cita no pertenece al paciente');
        }
        if (appointment.professional_id !== professionalId) {
          throw new HttpError(400, 'validation_error', 'La cita pertenece a otro profesional');
        }
        const existing = await one(
          'select id from public.consultations where appointment_id = $1 and deleted_at is null',
          [appointmentId]
        );
        if (existing) {
          return reply.code(409).send({
            error: {
              code: 'consultation_exists',
              message: 'La cita ya tiene una consulta asociada',
              consultationId: existing.id
            }
          });
        }
      }

      const consultationType = CONSULTATION_TYPES.includes(body.consultationType)
        ? body.consultationType
        : 'consulta';
      const consultedAt = body.consultedAt ? isoDate(body.consultedAt, 'fecha de consulta') : new Date().toISOString();

      const result = await transaction(async (client) => {
        const inserted = await client.query(
          `insert into public.consultations (
             clinic_id, patient_id, professional_id, appointment_id, specialty_id,
             consultation_type, consulted_at, reason, status, source, created_by
           ) values ($1, $2, $3, $4, $5, $6, $7, $8, 'borrador', 'web', $9)
           returning *`,
          [
            request.user.clinicId,
            patientId,
            professionalId,
            appointmentId,
            body.specialtyId ? uuid(body.specialtyId, 'especialidad') : null,
            consultationType,
            consultedAt,
            text(body.reason, 500),
            request.user.sub
          ]
        );
        await audit(client, request, 'create', 'consultation', inserted.rows[0].id, null, {
          patientId,
          professionalId,
          appointmentId
        });
        return inserted.rows[0];
      });

      return reply.code(201).send({ consultation: mapConsultation(result) });
    }
  );

  app.patch(
    '/api/consultations/:id',
    { preHandler: [app.authenticate, requireClinician] },
    async (request) => {
      const id = uuid(request.params.id, 'consulta');
      const before = await loadConsultation(request, id);
      if (before.status !== 'borrador') {
        throw new HttpError(409, 'consultation_signed', 'Una consulta firmada no se puede editar');
      }

      const body = request.body ?? {};
      const fields = [];
      const values = [];
      const add = (column, value) => {
        values.push(value);
        fields.push(`${column} = $${values.length}`);
      };

      const textFields = [
        ['reason', 'reason', 500],
        ['currentIllness', 'current_illness', 6000],
        ['physicalExam', 'physical_exam', 6000],
        ['functionalExam', 'functional_exam', 4000],
        ['studies', 'studies', 4000],
        ['diagnosisNotes', 'diagnosis_notes', 4000],
        ['treatmentPlan', 'treatment_plan', 6000],
        ['evolution', 'evolution', 6000],
        ['plan', 'plan', 4000],
        ['notes', 'notes', 3000]
      ];
      for (const [key, column, max] of textFields) {
        if (body[key] !== undefined) add(column, text(body[key], max));
      }
      if (body.vitals !== undefined) add('vitals', jsonObject(body.vitals));
      if (body.nextVisitAt !== undefined) {
        add('next_visit_at', body.nextVisitAt ? isoDate(body.nextVisitAt, 'próxima visita') : null);
      }

      if (fields.length === 0) return { consultation: mapConsultation(before) };

      values.push(id, request.user.clinicId);
      const result = await transaction(async (client) => {
        const updated = await client.query(
          `update public.consultations
           set ${fields.join(', ')}, updated_at = now()
           where id = $${values.length - 1} and clinic_id = $${values.length}
           returning *`,
          values
        );
        await audit(client, request, 'update', 'consultation', id, null, {
          status: updated.rows[0].status
        });
        return updated.rows[0];
      });

      return { consultation: mapConsultation(result) };
    }
  );

  app.delete(
    '/api/consultations/:id',
    { preHandler: [app.authenticate, requireClinician] },
    async (request, reply) => {
      const id = uuid(request.params.id, 'consulta');
      const consultation = await loadConsultation(request, id);
      if (consultation.status !== 'borrador') throw new HttpError(409, 'consultation_signed', 'Solo se pueden archivar consultas en borrador');
      await transaction(async (client) => {
        await client.query('update public.consultations set deleted_at=now(),updated_at=now() where id=$1 and clinic_id=$2', [id, request.user.clinicId]);
        await audit(client, request, 'archive', 'consultation', id, { status: consultation.status }, { deletedAt: new Date().toISOString() });
      });
      return reply.code(204).send();
    }
  );

  app.post(
    '/api/consultations/:id/sign',
    { preHandler: [app.authenticate, requireClinician] },
    async (request) => {
      const id = uuid(request.params.id, 'consulta');

      const result = await transaction(async (client) => {
        const locked = await client.query(
          `select c.*, p.full_name as patient_name, p.record_number, p.birth_date, p.sex, p.allergies_notes,
                  pr.full_name as professional_name
           from public.consultations c
           join public.patients p on p.id = c.patient_id
           join public.professionals pr on pr.id = c.professional_id
           where c.id = $1 and c.clinic_id = $2 and c.deleted_at is null
           for update`,
          [id, request.user.clinicId]
        );
        const consultation = locked.rows[0];
        if (!consultation) throw new HttpError(404, 'not_found', 'Consulta no encontrada');
        if (consultation.status !== 'borrador') {
          throw new HttpError(409, 'already_signed', 'La consulta ya fue firmada');
        }
        if (!consultation.reason || !consultation.reason.trim()) {
          throw new HttpError(422, 'missing_reason', 'Agrega el motivo de consulta antes de firmar');
        }

        const diagnoses = await client.query(
          'select id from public.consultation_diagnoses where consultation_id = $1 limit 1',
          [id]
        );
        if (diagnoses.rowCount === 0) {
          throw new HttpError(422, 'missing_diagnosis', 'Agrega al menos un diagnóstico CIE-10 antes de firmar');
        }

        const updated = await client.query(
          `update public.consultations
           set status = 'firmada', signed_at = now(), signed_by = $3, updated_at = now()
           where id = $1 and clinic_id = $2
           returning *`,
          [id, request.user.clinicId, request.user.sub]
        );

        if (consultation.appointment_id) {
          await client.query(
            `update public.appointments
             set status = 'atendida', updated_at = now()
             where id = $1 and clinic_id = $2`,
            [consultation.appointment_id, request.user.clinicId]
          );
        }

        await audit(client, request, 'sign', 'consultation', id, { status: 'borrador' }, {
          status: 'firmada'
        });

        return { ...consultation, ...updated.rows[0] };
      });

      return { consultation: mapConsultation(result), signedAt: result.signed_at };
    }
  );

  app.post(
    '/api/consultations/:id/diagnoses',
    { preHandler: [app.authenticate, requireClinician] },
    async (request, reply) => {
      const id = uuid(request.params.id, 'consulta');
      const consultation = await loadConsultation(request, id);
      if (consultation.status !== 'borrador') {
        throw new HttpError(409, 'consultation_signed', 'No se pueden agregar diagnósticos a una consulta firmada');
      }

      const code = requiredText(request.body?.code, 'Código CIE-10', 20).toUpperCase();
      const cie = await one(
        'select code, description from public.cie10_codes where code = $1',
        [code]
      );
      if (!cie) throw new HttpError(400, 'invalid_cie10', 'El código CIE-10 no existe en el catálogo');

      const type = DIAGNOSIS_TYPES.includes(request.body?.type) ? request.body.type : 'principal';
      const duplicate = await one(
        `select id from public.consultation_diagnoses
         where consultation_id = $1 and cie10_code = $2`,
        [id, code]
      );
      if (duplicate) throw new HttpError(409, 'duplicate_diagnosis', 'Ese diagnóstico ya está agregado');

      const result = await transaction(async (client) => {
        const inserted = await client.query(
          `insert into public.consultation_diagnoses (
             clinic_id, patient_id, consultation_id, professional_id,
             code_system, cie10_code, diagnosis_text, diagnosis_type, notes
           ) values ($1, $2, $3, $4, 'CIE10', $5, $6, $7, $8)
           returning *`,
          [
            request.user.clinicId,
            consultation.patient_id,
            id,
            consultation.professional_id,
            code,
            cie.description,
            type,
            text(request.body?.notes, 1000)
          ]
        );
        await audit(client, request, 'create', 'diagnosis', inserted.rows[0].id, null, {
          consultationId: id,
          code,
          type
        });
        return inserted.rows[0];
      });

      return reply.code(201).send({
        diagnosis: {
          id: result.id,
          code: result.cie10_code,
          description: result.diagnosis_text,
          type: result.diagnosis_type,
          notes: result.notes,
          diagnosedAt: result.diagnosed_at
        }
      });
    }
  );

  app.delete(
    '/api/consultations/:id/diagnoses/:diagnosisId',
    { preHandler: [app.authenticate, requireClinician] },
    async (request, reply) => {
      const id = uuid(request.params.id, 'consulta');
      const diagnosisId = uuid(request.params.diagnosisId, 'diagnóstico');
      const consultation = await loadConsultation(request, id);
      if (consultation.status !== 'borrador') {
        throw new HttpError(409, 'consultation_signed', 'No se pueden quitar diagnósticos de una consulta firmada');
      }

      const result = await transaction(async (client) => {
        const deleted = await client.query(
          `delete from public.consultation_diagnoses
           where id = $1 and consultation_id = $2 and clinic_id = $3
           returning id`,
          [diagnosisId, id, request.user.clinicId]
        );
        if (deleted.rowCount === 0) throw new HttpError(404, 'not_found', 'Diagnóstico no encontrado');
        await audit(client, request, 'delete', 'diagnosis', diagnosisId, null, { consultationId: id });
        return deleted.rows[0];
      });

      return reply.code(204).send(result);
    }
  );

  app.patch(
    '/api/consultations/:id/diagnoses/:diagnosisId',
    { preHandler: [app.authenticate, requireClinician] },
    async (request) => {
      const id = uuid(request.params.id, 'consulta');
      const diagnosisId = uuid(request.params.diagnosisId, 'diagnóstico');
      const consultation = await loadConsultation(request, id);
      if (consultation.status !== 'borrador') throw new HttpError(409, 'consultation_signed', 'No se pueden editar diagnósticos de una consulta firmada');
      const type = DIAGNOSIS_TYPES.includes(request.body?.type) ? request.body.type : 'secundario';
      const description = requiredText(request.body?.description, 'Descripción', 500);
      const result = await transaction(async (client) => {
        const updated = await client.query('update public.consultation_diagnoses set diagnosis_text=$1,diagnosis_type=$2,notes=$3,updated_at=now() where id=$4 and consultation_id=$5 and clinic_id=$6 returning *', [description,type,text(request.body?.notes,1000),diagnosisId,id,request.user.clinicId]);
        if (!updated.rowCount) throw new HttpError(404, 'not_found', 'Diagnóstico no encontrado');
        await audit(client, request, 'update', 'diagnosis', diagnosisId, null, updated.rows[0]);
        return updated.rows[0];
      });
      return { diagnosis: { id: result.id, code: result.cie10_code, description: result.diagnosis_text, type: result.diagnosis_type, notes: result.notes } };
    }
  );

  app.get('/api/cie10', { preHandler: [app.authenticate] }, async (request) => {
    const q = text(request.query?.q, 100);
    const rows = await many(
      `select code, description, chapter, category
       from public.cie10_codes
       where $1::text is null
          or search_text like '%' || lower(public.immutable_unaccent($1)) || '%'
       order by
         case when lower(code) = lower($1) then 0 else 1 end,
         code
       limit 20`,
      [q]
    );
    return { codes: rows };
  });
}

async function requireClinician(request) {
  if (!['admin', 'medico'].includes(request.user?.role)) {
    throw new HttpError(403, 'forbidden', 'Solo un médico puede gestionar consultas');
  }
}
