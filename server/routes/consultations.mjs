import { many, one, query, transaction } from '../db.mjs';
import { HttpError, audit, isoDate, jsonObject, requiredText, text, uuid } from '../lib.mjs';

const CONSULTATION_TYPES = ['consulta', 'evolucion', 'interconsulta', 'procedimiento', 'otro'];

function mapConsultation(row) {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    patientEmail: row.patient_email ?? null,
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
    evolutionText: row.evolution_text ?? null,
    studiesText: row.studies_text ?? null,
    prescriptionText: row.prescription_text ?? null,
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

function normalizePrescriptionItems(value) {
  if (!Array.isArray(value)) return null;
  if (value.length > 100) throw new HttpError(400, 'validation_error', 'Una receta no puede tener más de 100 medicamentos');
  return value.filter((item) => item && typeof item === 'object').map((item, index) => {
    const medication = text(item.medication, 240);
    const presentation = text(item.presentation, 240);
    const dose = text(item.dose, 240);
    const frequency = text(item.frequency, 240);
    const route = text(item.route, 120);
    const duration = text(item.duration, 160);
    const quantityText = text(item.quantity, 40);
    const quantity = quantityText === null ? null : Number(quantityText);
    const instructions = text(item.instructions, 2000);
    const hasDetails = [presentation, dose, frequency, route, duration, quantityText, instructions].some(Boolean);
    if (!medication && hasDetails) {
      throw new HttpError(400, 'validation_error', `Indica el nombre del medicamento ${index + 1}`);
    }
    if (quantity !== null && (!Number.isFinite(quantity) || quantity < 0)) {
      throw new HttpError(400, 'validation_error', `La cantidad del medicamento ${index + 1} no es válida`);
    }
    return { medication, presentation, dose, frequency, route, duration, quantity, instructions };
  }).filter((item) => item.medication);
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
       c.*, p.full_name as patient_name, p.email as patient_email, p.record_number, p.birth_date, p.sex, p.allergies_notes,
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
         pr.full_name as professional_name
       from public.consultations c
       join public.patients p on p.id = c.patient_id
       join public.professionals pr on pr.id = c.professional_id
       where c.clinic_id = $1
         and c.deleted_at is null
         and ($2::uuid is null or c.patient_id = $2)
       order by c.consulted_at desc
       limit 60`,
      [request.user.clinicId, patientId ?? null]
    );

    return { consultations: rows };
  });

  app.get('/api/consultations/:id', { preHandler: [app.authenticate] }, async (request) => {
    const id = uuid(request.params.id, 'consulta');
    const consultation = await loadConsultation(request, id);
    const prescriptionItems = await many(
      `select pi.medication_name, pi.presentation, pi.dose, pi.frequency, pi.route,
              pi.duration, pi.quantity, pi.instructions
       from public.prescriptions rx
       join public.prescription_items pi on pi.prescription_id = rx.id
       where rx.consultation_id = $1 and rx.clinic_id = $2 and rx.status <> 'anulada'
       order by rx.issued_at desc, pi.sort_order asc, pi.created_at asc`,
      [id, request.user.clinicId]
    );

    return {
      consultation: {
        ...mapConsultation(consultation),
        prescriptionItems: prescriptionItems.map((item) => ({
          medication: item.medication_name,
          presentation: item.presentation ?? '',
          dose: item.dose ?? '',
          frequency: item.frequency ?? '',
          route: item.route ?? '',
          duration: item.duration ?? '',
          quantity: item.quantity == null ? '' : String(item.quantity),
          instructions: item.instructions ?? ''
        }))
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
      const body = request.body ?? {};
      const historicalEdit = body.allowHistoricalEdit === true;
      if (before.status !== 'borrador' && !historicalEdit) {
        throw new HttpError(409, 'consultation_signed', 'Una consulta firmada no se puede editar');
      }

      const prescriptionItems = body.prescriptionItems === undefined
        ? null
        : normalizePrescriptionItems(body.prescriptionItems);
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
        ['evolutionText', 'evolution_text', 16000],
        ['studiesText', 'studies_text', 12000],
        ['prescriptionText', 'prescription_text', 12000],
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

      if (fields.length === 0 && prescriptionItems === null) return { consultation: mapConsultation(before) };

      values.push(id, request.user.clinicId);
      const result = await transaction(async (client) => {
        const updated = fields.length > 0
          ? await client.query(
              `update public.consultations
               set ${fields.join(', ')}, updated_at = now()
               where id = $${values.length - 1} and clinic_id = $${values.length}
               returning *`,
              values
            )
          : { rows: [before] };
        if (prescriptionItems !== null) {
          const legacyId = `pwa-consultation:${id}`;
          const existingPrescription = await client.query(
            `select id from public.prescriptions
             where clinic_id = $1 and consultation_id = $2 and legacy_id = $3
             limit 1`,
            [request.user.clinicId, id, legacyId]
          );
          if (prescriptionItems.length === 0) {
            if (existingPrescription.rows[0]) {
              await client.query(
                `update public.prescriptions set status = 'anulada', updated_at = now()
                 where id = $1`,
                [existingPrescription.rows[0].id]
              );
            }
          } else {
            let prescriptionId = existingPrescription.rows[0]?.id;
            if (prescriptionId) {
              await client.query(
                `update public.prescriptions
                 set status = 'borrador', issued_at = $1, professional_id = $2, updated_at = now()
                 where id = $3`,
                [updated.rows[0].consulted_at, updated.rows[0].professional_id, prescriptionId]
              );
              await client.query('delete from public.prescription_items where prescription_id = $1', [prescriptionId]);
            } else {
              const insertedPrescription = await client.query(
                `insert into public.prescriptions (
                   clinic_id, patient_id, consultation_id, professional_id, prescription_number,
                   issued_at, status, legacy_id
                 ) values ($1, $2, $3, $4, $5, $6, 'borrador', $7)
                 returning id`,
                [request.user.clinicId, updated.rows[0].patient_id, id, updated.rows[0].professional_id,
                  `RX-${id}`, updated.rows[0].consulted_at, legacyId]
              );
              prescriptionId = insertedPrescription.rows[0].id;
            }
            for (const [sortOrder, item] of prescriptionItems.entries()) {
              await client.query(
                `insert into public.prescription_items (
                   prescription_id, medication_name, presentation, dose, frequency, route,
                   duration, quantity, instructions, sort_order, legacy_id
                 ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [prescriptionId, item.medication, item.presentation, item.dose, item.frequency, item.route,
                  item.duration, item.quantity, item.instructions, sortOrder, `pwa:${sortOrder}`]
              );
            }
          }
        }
        await audit(client, request, 'update', 'consultation', id, null, {
          status: updated.rows[0].status,
          prescriptionItems: prescriptionItems?.length
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
          `select c.*, p.full_name as patient_name, p.email as patient_email, p.record_number, p.birth_date, p.sex, p.allergies_notes,
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

}

async function requireClinician(request) {
  if (!['admin', 'medico'].includes(request.user?.role)) {
    throw new HttpError(403, 'forbidden', 'Solo un médico puede gestionar consultas');
  }
}
