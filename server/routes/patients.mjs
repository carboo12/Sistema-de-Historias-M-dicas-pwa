import { many, one, transaction } from '../db.mjs';
import { HttpError, audit, text, requiredText, uuid } from '../lib.mjs';

const DOCUMENT_TYPES = ['cedula', 'pasaporte', 'ruc', 'nit', 'ssn', 'sin_documento', 'otro'];
const SEX_VALUES = ['M', 'F', 'X', 'U'];
const MARITAL_VALUES = ['soltero', 'casado', 'union_libre', 'divorciado', 'viudo', 'otro', 'desconocido'];

function validDateOnly(value, field) {
  if (value === null || value === undefined || value === '') return null;
  const clean = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean) || Number.isNaN(new Date(`${clean}T00:00:00Z`).getTime())) {
    throw new HttpError(400, 'validation_error', `${field} inválida`);
  }
  return clean;
}

function generatedRecordNumber() {
  return `PAC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
}

function mapPatient(row) {
  return {
    id: row.id,
    recordNumber: row.record_number,
    documentType: row.document_type,
    documentNumber: row.document_number,
    documentVerified: row.document_verified,
    fullName: row.full_name,
    firstName: row.first_name,
    lastName: row.last_name,
    birthDate: row.birth_date,
    sex: row.sex,
    maritalStatus: row.marital_status,
    bloodType: row.blood_type,
    nationality: row.nationality,
    birthPlace: row.birth_place,
    address: row.address,
    city: row.city,
    state: row.state,
    country: row.country,
    phone: row.phone,
    mobile: row.mobile,
    email: row.email,
    occupation: row.occupation,
    isPrivate: row.is_private,
    photoUrl: row.photo_url,
    allergiesNotes: row.allergies_notes,
    currentDiagnosisSummary: row.current_diagnosis_summary,
    isSuspended: row.is_suspended,
    suspensionReason: row.suspension_reason,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    consultationCount: row.consultation_count ?? undefined,
    lastVisitAt: row.last_visit_at ?? undefined,
    nextAppointmentAt: row.next_appointment_at ?? undefined
  };
}

export async function patientRoutes(app) {
  app.get('/api/patients', { preHandler: [app.authenticate] }, async (request) => {
    const q = text(request.query?.q, 120);
    const limit = Math.min(Math.max(Number(request.query?.limit) || 25, 1), 100);
    const offset = Math.max(Number(request.query?.offset) || 0, 0);
    const clinicId = request.user.clinicId;

    const rows = await many(
      `select
         p.*,
         (select count(*) from public.consultations c
           where c.patient_id = p.id and c.clinic_id = p.clinic_id and c.deleted_at is null)::int as consultation_count,
         (select max(c.consulted_at) from public.consultations c
           where c.patient_id = p.id and c.clinic_id = p.clinic_id and c.deleted_at is null) as last_visit_at,
         (select a.starts_at from public.appointments a
           where a.patient_id = p.id and a.clinic_id = p.clinic_id
             and a.status in ('programada', 'confirmada', 'en_espera')
             and a.starts_at >= now()
           order by a.starts_at limit 1) as next_appointment_at
       from public.patients p
       where p.clinic_id = $1
         and p.deleted_at is null
         and (
           $2::text is null
           or p.search_text like '%' || lower(public.immutable_unaccent($2)) || '%'
           or p.document_number ilike '%' || $2 || '%'
         )
       order by p.updated_at desc
       limit $3 offset $4`,
      [clinicId, q, limit, offset]
    );

    const total = await one(
      `select count(*)::int as total
       from public.patients p
       where p.clinic_id = $1
         and p.deleted_at is null
         and (
           $2::text is null
           or p.search_text like '%' || lower(public.immutable_unaccent($2)) || '%'
           or p.document_number ilike '%' || $2 || '%'
         )`,
      [clinicId, q]
    );

    return { patients: rows.map(mapPatient), total: total.total, limit, offset };
  });

  app.get('/api/patients/:id', { preHandler: [app.authenticate] }, async (request) => {
    const id = uuid(request.params.id, 'paciente');
    const clinicId = request.user.clinicId;

    const patient = await one(
      `select p.* from public.patients p
       where p.id = $1 and p.clinic_id = $2 and p.deleted_at is null`,
      [id, clinicId]
    );
    if (!patient) throw new HttpError(404, 'not_found', 'Paciente no encontrado');

    const history = await many(
      `select id, category, description, details, onset_date, is_active, recorded_at
       from public.patient_history
       where patient_id = $1
       order by recorded_at desc`,
      [id]
    );

    const consultations = await many(
      `select
         c.id, c.consulted_at, c.status, c.reason, c.current_illness,
         c.treatment_plan, c.signed_at,
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
       join public.professionals pr on pr.id = c.professional_id
       left join public.consultation_diagnoses d on d.consultation_id = c.id
       where c.patient_id = $1 and c.clinic_id = $2 and c.deleted_at is null
       group by c.id, pr.full_name
       order by c.consulted_at desc
       limit 12`,
      [id, clinicId]
    );

    const appointments = await many(
      `select a.id, a.starts_at, a.ends_at, a.status, a.reason,
              pr.full_name as professional_name
       from public.appointments a
       join public.professionals pr on pr.id = a.professional_id
       where a.patient_id = $1 and a.clinic_id = $2
         and a.status in ('programada', 'confirmada', 'en_espera')
         and a.starts_at >= now()
       order by a.starts_at
       limit 5`,
      [id, clinicId]
    );

    return {
      patient: mapPatient(patient),
      history,
      consultations,
      appointments
    };
  });

  app.post(
    '/api/patients',
    { preHandler: [app.authenticate, requireClinicalOrReception] },
    async (request, reply) => {
      const body = request.body ?? {};
      const fullName = requiredText(body.fullName, 'Nombre completo', 240);
      const documentType = DOCUMENT_TYPES.includes(body.documentType) ? body.documentType : 'cedula';
      const documentNumber = text(body.documentNumber, 60);
      const sex = SEX_VALUES.includes(body.sex) ? body.sex : 'U';
      const maritalStatus = MARITAL_VALUES.includes(body.maritalStatus) ? body.maritalStatus : 'desconocido';
      const birthDate = validDateOnly(body.birthDate, 'Fecha de nacimiento');
      const recordNumber = text(body.recordNumber, 40) ?? generatedRecordNumber();
      const hasDocument = Boolean(documentNumber);
      const finalDocumentType = hasDocument ? documentType : 'sin_documento';

      const result = await transaction(async (client) => {
        const inserted = await client.query(
          `insert into public.patients (
             clinic_id, record_number, document_type, document_number, document_verified,
             full_name, first_name, last_name, birth_date, sex, marital_status,
             phone, mobile, email, address, city, state, country, nationality,
             occupation, allergies_notes, notes, is_private, created_by
           ) values (
             $1, $2, $3, $4, $5,
             $6, $7, $8, $9, $10, $11,
             $12, $13, $14, $15, $16, $17, $18, $19,
             $20, $21, $22, $23, $24
           ) returning *`,
          [
            request.user.clinicId,
            recordNumber,
            finalDocumentType,
            documentNumber,
            Boolean(body.documentVerified) && hasDocument,
            fullName,
            text(body.firstName, 120),
            text(body.lastName, 120),
            birthDate,
            sex,
            maritalStatus,
            text(body.phone, 40),
            text(body.mobile, 40),
            text(body.email, 200),
            text(body.address, 400),
            text(body.city, 120),
            text(body.state, 120),
            text(body.country, 120),
            text(body.nationality, 120),
            text(body.occupation, 160),
            text(body.allergiesNotes, 2000),
            text(body.notes, 2000),
            body.isPrivate !== false,
            request.user.sub
          ]
        );
        await audit(client, request, 'create', 'patient', inserted.rows[0].id, null, {
          recordNumber,
          fullName
        });
        return inserted.rows[0];
      });

      return reply.code(201).send({ patient: mapPatient(result) });
    }
  );

  app.patch(
    '/api/patients/:id',
    { preHandler: [app.authenticate, requireClinicalOrReception] },
    async (request) => {
      const id = uuid(request.params.id, 'paciente');
      const body = request.body ?? {};
      const clinicId = request.user.clinicId;

      const before = await one(
        'select * from public.patients where id = $1 and clinic_id = $2 and deleted_at is null',
        [id, clinicId]
      );
      if (!before) throw new HttpError(404, 'not_found', 'Paciente no encontrado');

      const fields = [];
      const values = [];
      const add = (column, value) => {
        values.push(value);
        fields.push(`${column} = $${values.length}`);
      };

      if (body.fullName !== undefined) add('full_name', requiredText(body.fullName, 'Nombre completo', 240));
      if (body.firstName !== undefined) add('first_name', text(body.firstName, 120));
      if (body.lastName !== undefined) add('last_name', text(body.lastName, 120));
      if (body.documentType !== undefined) {
        if (!DOCUMENT_TYPES.includes(body.documentType)) {
          throw new HttpError(400, 'validation_error', 'Tipo de documento inválido');
        }
        add('document_type', body.documentType);
      }
      if (body.documentNumber !== undefined) add('document_number', text(body.documentNumber, 60));
      if (body.documentVerified !== undefined) add('document_verified', Boolean(body.documentVerified));
      if (body.birthDate !== undefined) add('birth_date', validDateOnly(body.birthDate, 'Fecha de nacimiento'));
      if (body.sex !== undefined) {
        if (!SEX_VALUES.includes(body.sex)) throw new HttpError(400, 'validation_error', 'Sexo inválido');
        add('sex', body.sex);
      }
      if (body.maritalStatus !== undefined) {
        if (!MARITAL_VALUES.includes(body.maritalStatus)) {
          throw new HttpError(400, 'validation_error', 'Estado civil inválido');
        }
        add('marital_status', body.maritalStatus);
      }

      const simpleFields = [
        ['bloodType', 'blood_type', 20],
        ['nationality', 'nationality', 120],
        ['birthPlace', 'birth_place', 160],
        ['address', 'address', 400],
        ['city', 'city', 120],
        ['state', 'state', 120],
        ['country', 'country', 120],
        ['phone', 'phone', 40],
        ['mobile', 'mobile', 40],
        ['email', 'email', 200],
        ['occupation', 'occupation', 160],
        ['allergiesNotes', 'allergies_notes', 2000],
        ['currentDiagnosisSummary', 'current_diagnosis_summary', 2000],
        ['suspensionReason', 'suspension_reason', 1000],
        ['notes', 'notes', 2000]
      ];
      for (const [key, column, max] of simpleFields) {
        if (body[key] !== undefined) add(column, text(body[key], max));
      }
      if (body.isPrivate !== undefined) add('is_private', Boolean(body.isPrivate));
      if (body.isSuspended !== undefined) add('is_suspended', Boolean(body.isSuspended));

      if (fields.length === 0) return { patient: mapPatient(before) };

      values.push(id, clinicId);
      const updated = await transaction(async (client) => {
        const result = await client.query(
          `update public.patients set ${fields.join(', ')}, updated_at = now()
           where id = $${values.length - 1} and clinic_id = $${values.length}
           returning *`,
          values
        );
        await audit(client, request, 'update', 'patient', id, mapPatient(before), mapPatient(result.rows[0]));
        return result.rows[0];
      });

      return { patient: mapPatient(updated) };
    }
  );
}

async function requireClinicalOrReception(request) {
  if (!['admin', 'medico', 'recepcion', 'enfermeria'].includes(request.user?.role)) {
    throw new HttpError(403, 'forbidden', 'No tienes permiso para gestionar pacientes');
  }
}
