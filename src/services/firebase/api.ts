import {
  countPatients,
  clinicReports,
  createPatientStudy,
  createAppointment,
  createConsultation,
  createPatient,
  deletePatient,
  getCatalogs,
  getConsultation,
  getPatient,
  getSession,
  listAgenda,
  listConsultations,
  listPatients,
  listPatientStudies,
  signConsultation,
  updateAppointmentStatus,
  updateAppointment,
  updateConsultation,
  updatePatient,
  deleteConsultation,
} from '@historias/dataconnect';
import { ApiError } from '../../lib/api';
import type {
  AgendaResponse,
  Appointment,
  Catalogs,
  Consultation,
  ConsultationSummary,
  Patient,
  PatientDetail,
  Summary,
  ReportsDataset,
  PatientStudy
} from '../../types';
import { getFirebaseSession, signInWithFirebase, signOutFromFirebase } from './auth';
import { requireFirebase } from './client';
import { removeStudyAssets, uploadStudyAssets } from './study-storage';
import { normalizePatientSearch } from '../../lib/format';

function dc() {
  return requireFirebase().dataConnect;
}

function iso(value: string | null | undefined) {
  return value ?? null;
}

function normalizeUuid(value: unknown): string | null {
  const raw = String(value ?? '').trim().replace(/^\{(.+)\}$/, '$1');
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)) {
    return raw.toLowerCase();
  }
  if (/^[0-9a-f]{32}$/i.test(raw)) {
    const compact = raw.toLowerCase();
    return `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20)}`;
  }
  return null;
}

async function sessionContext() {
  const { data } = await getSession(dc());
  const user = data.users[0];
  if (!user) throw new ApiError('Sesión clínica no encontrada', 401, 'anonymous');
  return {
    userId: user.id,
    clinicId: user.clinic.id,
    professionalId: user.professional_on_user?.id ?? null
  };
}

function makeRecordNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `HC-${stamp}-${suffix}`;
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || null,
    lastName: parts.slice(1).join(' ') || null
  };
}

function mapPatient(record: Record<string, any>): Patient {
  const next = record.appointments_on_patient?.[0]?.startsAt ?? null;
  return {
    id: record.id,
    recordNumber: record.recordNumber,
    documentType: record.documentType,
    documentNumber: record.documentNumber ?? null,
    documentVerified: record.documentVerified,
    fullName: record.fullName,
    firstName: record.firstName ?? null,
    lastName: record.lastName ?? null,
    birthDate: record.birthDate ?? null,
    ageOverride: record.ageOverride ?? null,
    sex: record.sex as Patient['sex'],
    maritalStatus: record.maritalStatus,
    bloodType: record.bloodType ?? null,
    nationality: record.nationality ?? null,
    address: record.address ?? null,
    city: record.city ?? null,
    state: record.state ?? null,
    country: record.country ?? null,
    phone: record.phone ?? null,
    mobile: record.mobile ?? null,
    email: record.email ?? null,
    occupation: record.occupation ?? null,
    isPrivate: record.isPrivate,
    photoUrl: record.photoUrl ?? null,
    allergiesNotes: record.allergiesNotes ?? null,
    currentDiagnosisSummary: record.currentDiagnosisSummary ?? null,
    isSuspended: record.isSuspended,
    suspensionReason: record.suspensionReason ?? null,
    notes: record.notes ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    lastVisitAt: record.consultations_on_patient?.[0]?.consultedAt ?? null,
    nextAppointmentAt: next
  };
}

function mapConsultationSummary(record: Record<string, any>): ConsultationSummary {
  return {
    id: record.id,
    consulted_at: record.consultedAt,
    status: record.status,
    reason: record.reason ?? null,
    current_illness: record.currentIllness ?? null,
    treatment_plan: record.treatmentPlan ?? null,
    signed_at: iso(record.signedAt),
    updated_at: record.updatedAt,
    professional_name: record.professional?.fullName ?? '',
    patient_name: record.patient?.fullName,
    record_number: record.patient?.recordNumber,
  };
}

function mapConsultation(record: Record<string, any>): Consultation {
  const storedNotes = String(record.notes ?? '');
  const rxMarker = '__HM_RX_V1__';
  let notes = storedNotes || null;
  let prescriptionItems: Consultation['prescriptionItems'] = [];
  let hasStructuredPrescriptionPayload = false;
  if (storedNotes.startsWith(rxMarker)) {
    try {
      const structured = JSON.parse(storedNotes.slice(rxMarker.length)) as {
        notes?: string | null;
        prescriptionItems?: Consultation['prescriptionItems'];
      };
      notes = structured.notes ?? null;
      prescriptionItems = structured.prescriptionItems ?? [];
      hasStructuredPrescriptionPayload = Array.isArray(structured.prescriptionItems);
    } catch {
      // Malformed/older notes remain visible as plain text.
    }
  }
  if (!hasStructuredPrescriptionPayload) {
    prescriptionItems = (record.prescriptions_on_consultation ?? []).flatMap((prescription: Record<string, any>) =>
      (prescription.prescriptionItems_on_prescription ?? []).map((item: Record<string, any>) => ({
        medication: item.medicationName ?? '',
        presentation: item.presentation ?? '',
        dose: item.dose ?? '',
        frequency: item.frequency ?? '',
        route: item.route ?? '',
        duration: item.duration ?? '',
        quantity: item.quantity == null ? '' : String(item.quantity),
        instructions: item.instructions ?? ''
      }))
    );
  }
  return {
    id: record.id,
    patientId: record.patientId,
    patientName: record.patient.fullName,
    patientEmail: record.patient.email ?? null,
    recordNumber: record.patient.recordNumber,
    birthDate: record.patient.birthDate ?? null,
    sex: record.patient.sex,
    allergiesNotes: record.patient.allergiesNotes ?? null,
    professionalId: record.professionalId,
    professionalName: record.professional.fullName,
    appointmentId: record.appointmentId ?? null,
    specialtyId: record.specialtyId ?? null,
    consultationType: record.consultationType,
    consultedAt: record.consultedAt,
    nextVisitAt: record.nextVisitAt ?? null,
    reason: record.reason ?? null,
    currentIllness: record.currentIllness ?? null,
    physicalExam: record.physicalExam ?? null,
    functionalExam: record.functionalExam ?? null,
    studies: record.studies ?? null,
    evolutionText: record.evolutionText ?? [record.reason, record.currentIllness, record.physicalExam, record.functionalExam, record.diagnosisNotes, record.treatmentPlan, record.evolution, record.plan].filter(Boolean).join('\n\n'),
    studiesText: record.studiesText ?? record.studies ?? null,
    prescriptionText: record.prescriptionText ?? ((prescriptionItems ?? []).length ? (prescriptionItems ?? []).map((item) => [item.medication, item.presentation, item.dose, item.frequency, item.route, item.duration, item.quantity, item.instructions].filter(Boolean).join(' · ')).join('\n') : [record.plan, record.treatmentPlan].filter(Boolean).join('\n\n')),
    diagnosisNotes: record.diagnosisNotes ?? null,
    treatmentPlan: record.treatmentPlan ?? null,
    evolution: record.evolution ?? null,
    plan: record.plan ?? null,
    notes,
    prescriptionItems,
    vitals: (record.vitals ?? {}) as Record<string, string>,
    status: record.status,
    signedAt: iso(record.signedAt),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

function mapAppointment(record: Record<string, any>): Appointment {
  return {
    id: record.id,
    patientId: record.patientId,
    patientName: record.patient?.fullName ?? '',
    patientRecord: record.patient?.recordNumber ?? '',
    patientPhone: record.patient?.phone ?? null,
    professionalId: record.professionalId,
    professionalName: record.professional?.fullName ?? '',
    specialtyName: record.specialty?.name ?? null,
    officeName: record.office?.name ?? null,
    startsAt: record.startsAt,
    endsAt: record.endsAt,
    durationMinutes: record.durationMinutes,
    reason: record.reason ?? null,
    status: record.status,
    notes: record.notes ?? null,
    consultationId: record.consultation_on_appointment?.id ?? null
  };
}

function dayBounds(date: string) {
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

async function fetchPatientDetail(id: string): Promise<PatientDetail> {
  const { data } = await getPatient(dc(), { id });
  const record = data.patients[0];
  if (!record) throw new ApiError('No encontramos al paciente', 404, 'not_found');

  return {
    patient: mapPatient(record),
    history: record.patientHistories_on_patient.map((item) => ({
      id: item.id,
      category: item.category,
      description: item.description,
      details: (item.details ?? {}) as Record<string, unknown>,
      onset_date: item.onsetDate ?? null,
      is_active: item.isActive,
      recorded_at: item.recordedAt
    })),
    consultations: record.consultations_on_patient.map(mapConsultationSummary),
    appointments: record.appointments_on_patient.map((appointment) => ({
      id: appointment.id,
      starts_at: appointment.startsAt,
      ends_at: appointment.endsAt,
      status: appointment.status,
      reason: appointment.reason ?? null,
      professional_name: appointment.professional.fullName
    }))
  };
}

async function fetchConsultation(id: string) {
  const { data } = await getConsultation(dc(), { id });
  const record = data.consultations[0];
  if (!record) throw new ApiError('No encontramos la consulta', 404, 'not_found');
  return record;
}

export const firebaseApi = {
  auth: {
    login: (identifier: string, password: string) =>
      signInWithFirebase(identifier, password).then((user) => ({ user })),
    me: () => getFirebaseSession().then((user) => ({ user })),
    logout: () => signOutFromFirebase()
  },
  patients: {
    async list(q = '', limit = 25, offset = 0) {
      const normalizedQuery = normalizePatientSearch(q);
      const [{ data }, count] = await Promise.all([
        listPatients(dc(), { q: normalizedQuery, limit, offset }),
        countPatients(dc(), { q: normalizedQuery })
      ]);
      return {
        patients: data.patients.map(mapPatient),
        total: count.data.patients[0]?._count ?? data.patients.length,
        limit,
        offset
      };
    },
    get: fetchPatientDetail,
    async create(payload: Record<string, unknown>) {
      const { userId, clinicId } = await sessionContext();
      const fullName = String(payload.fullName ?? '').trim();
      const parts = splitName(fullName);
      const created = await createPatient(dc(), {
        createdById: userId,
        clinicId,
        recordNumber: String(payload.recordNumber ?? makeRecordNumber()),
        documentType: payload.documentType == null || !String(payload.documentType).trim() ? null : String(payload.documentType),
        documentNumber: payload.documentNumber == null || !String(payload.documentNumber).trim() ? null : String(payload.documentNumber).trim(),
        documentVerified: Boolean(payload.documentVerified ?? false) && Boolean(String(payload.documentNumber ?? '').trim()),
        fullName,
        firstName: (payload.firstName as string | null) ?? parts.firstName,
        lastName: (payload.lastName as string | null) ?? parts.lastName,
        birthDate: (payload.birthDate as string | null) ?? null,
        ageOverride: payload.ageOverride == null ? null : Number(payload.ageOverride),
        birthDateEstimated: Boolean(payload.birthDateEstimated ?? false),
        sex: String(payload.sex ?? 'U'),
        maritalStatus: String(payload.maritalStatus ?? 'desconocido'),
        bloodType: (payload.bloodType as string | null) ?? null,
        nationality: (payload.nationality as string | null) ?? null,
        birthPlace: (payload.birthPlace as string | null) ?? null,
        address: (payload.address as string | null) ?? null,
        city: (payload.city as string | null) ?? null,
        state: (payload.state as string | null) ?? null,
        country: (payload.country as string | null) ?? null,
        phone: (payload.phone as string | null) ?? null,
        mobile: (payload.mobile as string | null) ?? null,
        email: (payload.email as string | null) ?? null,
        occupation: (payload.occupation as string | null) ?? null,
        isPrivate: Boolean(payload.isPrivate ?? true),
        allergiesNotes: (payload.allergiesNotes as string | null) ?? null,
        currentDiagnosisSummary: (payload.currentDiagnosisSummary as string | null) ?? null,
        notes: (payload.notes as string | null) ?? null,
        isSuspended: Boolean(payload.isSuspended ?? false),
        suspensionReason: (payload.suspensionReason as string | null) ?? null
      });
      const detail = await fetchPatientDetail(created.data.patient_insert.id);
      return { patient: detail.patient };
    },
    async update(id: string, payload: Record<string, unknown>) {
      const detail = await fetchPatientDetail(id);
      const current = detail.patient;
      const fullName = String(payload.fullName ?? current.fullName).trim();
      const parts = splitName(fullName);
      const nextDocumentNumber = payload.documentNumber === undefined
        ? current.documentNumber
        : (payload.documentNumber == null || !String(payload.documentNumber).trim() ? null : String(payload.documentNumber).trim());
      await updatePatient(dc(), {
        id,
        documentType: payload.documentType === undefined ? current.documentType : (payload.documentType == null || !String(payload.documentType).trim() ? null : String(payload.documentType)),
        documentNumber: nextDocumentNumber,
        documentVerified: Boolean(payload.documentVerified ?? current.documentVerified) && Boolean(nextDocumentNumber),
        fullName,
        firstName: (payload.firstName as string | null) ?? current.firstName ?? parts.firstName,
        lastName: (payload.lastName as string | null) ?? current.lastName ?? parts.lastName,
        birthDate: (payload.birthDate as string | null) ?? current.birthDate,
        ageOverride: payload.ageOverride === undefined ? current.ageOverride : (payload.ageOverride == null ? null : Number(payload.ageOverride)),
        birthDateEstimated: Boolean(payload.birthDateEstimated ?? false),
        sex: String(payload.sex ?? current.sex),
        maritalStatus: String(payload.maritalStatus ?? current.maritalStatus),
        bloodType: (payload.bloodType as string | null) ?? current.bloodType,
        nationality: (payload.nationality as string | null) ?? current.nationality,
        birthPlace: (payload.birthPlace as string | null) ?? null,
        address: (payload.address as string | null) ?? current.address,
        city: (payload.city as string | null) ?? current.city,
        state: (payload.state as string | null) ?? current.state,
        country: (payload.country as string | null) ?? current.country,
        phone: (payload.phone as string | null) ?? current.phone,
        mobile: (payload.mobile as string | null) ?? current.mobile,
        email: (payload.email as string | null) ?? current.email,
        occupation: (payload.occupation as string | null) ?? current.occupation,
        isPrivate: Boolean(payload.isPrivate ?? current.isPrivate),
        allergiesNotes: (payload.allergiesNotes as string | null) ?? current.allergiesNotes,
        currentDiagnosisSummary:
          (payload.currentDiagnosisSummary as string | null) ?? current.currentDiagnosisSummary,
        notes: (payload.notes as string | null) ?? current.notes,
        isSuspended: Boolean(payload.isSuspended ?? current.isSuspended),
        suspensionReason: (payload.suspensionReason as string | null) ?? current.suspensionReason
      });
      const updated = await fetchPatientDetail(id);
      return { patient: updated.patient };
    },
    async delete(id: string) {
      await deletePatient(dc(), { id });
      return { id };
    }
  },
  agenda: {
    async get(date: string): Promise<AgendaResponse> {
      const { data } = await listAgenda(dc(), dayBounds(date));
      const appointments = data.appointments.map(mapAppointment);
      return {
        date,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        appointments,
        stats: {
          total: appointments.length,
          scheduled: appointments.filter((item) =>
            ['programada', 'confirmada', 'reprogramada'].includes(item.status)
          ).length,
          waiting: appointments.filter((item) => item.status === 'en_espera').length,
          attended: appointments.filter((item) => item.status === 'atendida').length,
          cancelled: appointments.filter((item) =>
            ['cancelada', 'no_asistio'].includes(item.status)
          ).length
        }
      };
    },
    async appointments(patientId?: string) {
      if (!patientId) return { appointments: [] as Appointment[] };
      const detail = await fetchPatientDetail(patientId);
      return {
        appointments: detail.appointments.map((appointment) => ({
          id: appointment.id,
          patientId,
          patientName: detail.patient.fullName,
          patientRecord: detail.patient.recordNumber,
          patientPhone: detail.patient.phone,
          professionalId: '',
          professionalName: appointment.professional_name,
          specialtyName: null,
          officeName: null,
          startsAt: appointment.starts_at,
          endsAt: appointment.ends_at,
          durationMinutes: 30,
          reason: appointment.reason,
          status: appointment.status as Appointment['status'],
          notes: null,
          consultationId: null
        }))
      };
    },
    async create(payload: Record<string, unknown>) {
      const { userId, clinicId, professionalId: sessionProfessionalId } = await sessionContext();
      const startsAt = String(payload.startsAt);
      const durationMinutes = Number(payload.durationMinutes ?? 30);
      const endsAt = new Date(new Date(startsAt).getTime() + durationMinutes * 60_000).toISOString();
      const professionalId = String(payload.professionalId ?? sessionProfessionalId ?? '');
      if (!professionalId) throw new ApiError('Selecciona un profesional', 400, 'professional_required');

      const created = await createAppointment(dc(), {
        createdById: userId,
        clinicId,
        patientId: String(payload.patientId),
        professionalId,
        specialtyId: (payload.specialtyId as string | null) ?? null,
        officeId: (payload.officeId as string | null) ?? null,
        startsAt,
        endsAt,
        durationMinutes,
        reason: (payload.reason as string | null) ?? null,
        notes: (payload.notes as string | null) ?? null,
        status: String(payload.status ?? 'programada'),
        source: String(payload.source ?? 'web')
      });

      return {
        appointment: {
          id: created.data.appointment_insert.id,
          patientId: String(payload.patientId),
          patientName: '',
          patientRecord: '',
          patientPhone: null,
          professionalId,
          professionalName: '',
          specialtyName: null,
          officeName: null,
          startsAt,
          endsAt,
          durationMinutes,
          reason: (payload.reason as string | null) ?? null,
          status: String(payload.status ?? 'programada') as Appointment['status'],
          notes: (payload.notes as string | null) ?? null,
          consultationId: null
        }
      };
    },
    async updateStatus(id: string, status: string) {
      await updateAppointmentStatus(dc(), { id, status });
      return { appointment: { id, status } as Pick<Appointment, 'id' | 'status' | 'startsAt' | 'endsAt'> };
    },
    async update(id: string, payload: Record<string, unknown>) {
      const startsAt = String(payload.startsAt);
      const durationMinutes = Number(payload.durationMinutes ?? 30);
      const endsAt = new Date(new Date(startsAt).getTime() + durationMinutes * 60_000).toISOString();
      await updateAppointment(dc(), {
        id,
        startsAt,
        endsAt,
        durationMinutes,
        reason: (payload.reason as string | null) ?? null,
        notes: (payload.notes as string | null) ?? null,
        status: String(payload.status ?? 'programada')
      });
      return { appointment: { id, startsAt, endsAt, durationMinutes, ...payload } };
    }
  },
  consultations: {
    async list(patientId?: string) {
      if (patientId) {
        const detail = await fetchPatientDetail(patientId);
        return { consultations: detail.consultations };
      }
      const { data } = await listConsultations(dc());
      return { consultations: data.consultations.map(mapConsultationSummary) };
    },
    async get(id: string) {
      const record = await fetchConsultation(id);
      return {
        consultation: mapConsultation(record),
      };
    },
    async create(payload: Record<string, unknown>) {
      const context = await sessionContext();
      const clinicId = normalizeUuid(context.clinicId);
      const patientId = normalizeUuid(payload.patientId);
      if (!clinicId) throw new ApiError('La clínica de la sesión tiene un identificador inválido', 400, 'invalid_clinic_id');
      if (!patientId) throw new ApiError('El expediente no tiene un identificador de paciente válido', 400, 'invalid_patient_id');

      const { data } = await getCatalogs(dc());
      const professionals = data.users[0]?.clinic.professionals_on_clinic ?? [];
      const professionalsById = new Map(
        professionals.flatMap((professional) => {
          const id = normalizeUuid(professional.id);
          return id ? [[id, professional] as const] : [];
        })
      );
      const principal = professionals.find((professional) => /administrador\s+principal/i.test(professional.fullName))
        ?? professionals.find((professional) => /principal|administrador/i.test(professional.fullName));
      const candidates = [
        normalizeUuid(payload.professionalId),
        normalizeUuid(context.professionalId),
        normalizeUuid(principal?.id),
        ...professionals.map((professional) => normalizeUuid(professional.id))
      ];
      const professionalId = candidates.find((id): id is string => Boolean(id && professionalsById.has(id))) ?? null;
      if (!professionalId) {
        console.error('No se puede crear consulta: la clínica no tiene profesionales activos asignados.', {
          clinicId,
          userProfessionalId: context.professionalId
        });
        throw new ApiError('No hay un profesional activo asignado a esta clínica', 400, 'professional_required');
      }

      const variables = {
        createdById: context.userId,
        clinicId,
        patientId,
        professionalId,
        appointmentId: (payload.appointmentId as string | null) ?? null,
        specialtyId: (payload.specialtyId as string | null) ?? null,
        consultationType: String(payload.consultationType ?? 'consulta'),
        consultedAt: String(payload.consultedAt ?? new Date().toISOString()),
        reason: (payload.reason as string | null) ?? null,
        notes: (payload.notes as string | null) ?? null,
        status: String(payload.status ?? 'borrador'),
        source: String(payload.source ?? 'web')
      };
      let created;
      try {
        created = await createConsultation(dc(), variables);
      } catch (cause) {
        console.error('Data Connect CreateConsultation falló', { variables, cause });
        throw cause;
      }

      return {
        consultation: {
          id: created.data.consultation_insert.id,
          patientId,
          status: 'borrador'
        } as Consultation
      };
    },
    async update(id: string, payload: Record<string, unknown>) {
      const notes = payload.prescriptionItems
        ? `__HM_RX_V1__${JSON.stringify({ notes: payload.notes ?? null, prescriptionItems: payload.prescriptionItems })}`
        : (payload.notes as string | null) ?? null;
      await updateConsultation(dc(), {
        id,
        nextVisitAt: (payload.nextVisitAt as string | null) ?? null,
        reason: (payload.reason as string | null) ?? null,
        currentIllness: (payload.currentIllness as string | null) ?? null,
        physicalExam: (payload.physicalExam as string | null) ?? null,
        functionalExam: (payload.functionalExam as string | null) ?? null,
        studies: (payload.studies as string | null) ?? null,
        evolutionText: (payload.evolutionText as string | null) ?? null,
        studiesText: (payload.studiesText as string | null) ?? null,
        prescriptionText: (payload.prescriptionText as string | null) ?? null,
        diagnosisNotes: (payload.diagnosisNotes as string | null) ?? null,
        treatmentPlan: (payload.treatmentPlan as string | null) ?? null,
        evolution: (payload.evolution as string | null) ?? null,
        plan: (payload.plan as string | null) ?? null,
        notes,
        vitals: payload.vitals ?? {}
      });
      const record = await fetchConsultation(id);
      return { consultation: mapConsultation(record) };
    },
    async delete(id: string) {
      await deleteConsultation(dc(), { id });
      return { id };
    },
    async sign(id: string) {
      const { userId } = await sessionContext();
      await signConsultation(dc(), { id, signedById: userId });
      const record = await fetchConsultation(id);
      return {
        consultation: mapConsultation(record),
        signedAt: record.signedAt ?? new Date().toISOString()
      };
    },
  },
  studies: {
    async list(patientId: string): Promise<{ studies: PatientStudy[] }> {
      const { data } = await listPatientStudies(dc(), { patientId, limit: 1000, offset: 0 });
      const studies = data.patientStudies.flatMap((record) => {
        const metadata = (record.metadata ?? {}) as Record<string, unknown>;
        const fileUrl = typeof metadata.fileUrl === 'string' ? metadata.fileUrl : '';
        if (!fileUrl) return [];
        return [{
          id: record.id,
          patientId,
          consultationId: record.consultation?.id ?? null,
          studyType: record.studyType,
          studyName: record.studyName,
          performedAt: record.performedAt ?? '',
          resultSummary: record.resultSummary ?? null,
          resultText: record.resultText ?? null,
          fileUrl,
          previewUrl: typeof metadata.previewUrl === 'string' ? metadata.previewUrl : null,
          fileName: typeof metadata.fileName === 'string' ? metadata.fileName : record.studyName,
          mimeType: typeof metadata.mimeType === 'string' ? metadata.mimeType : 'application/octet-stream',
          professionalName: record.professional?.fullName ?? ''
        }];
      });
      return { studies };
    },
    async create(input: { patientId: string; studyName: string; studyType: string; performedAt: string; note: string; file: File }) {
      const { clinicId, professionalId } = await sessionContext();
      const assets = await uploadStudyAssets({ patientId: input.patientId, clinicId, file: input.file });
      try {
        const { data } = await createPatientStudy(dc(), {
          clinicId,
          patientId: input.patientId,
          professionalId,
          studyType: input.studyType,
          studyName: input.studyName,
          performedAt: new Date(`${input.performedAt}T12:00:00`).toISOString(),
          resultSummary: input.note || null,
          resultText: input.note || null,
          metadata: {
            fileUrl: assets.fileUrl,
            previewUrl: assets.previewUrl,
            storagePath: assets.filePath,
            previewPath: assets.previewPath,
            fileName: assets.fileName,
            mimeType: assets.mimeType,
            fileSize: assets.fileSize
          }
        });
        return { id: data.patientStudy_insert.id, ...assets };
      } catch (error) {
        await removeStudyAssets([assets.filePath, assets.previewPath]);
        throw error;
      }
    }
  },
  reports: {
    async get(from: string, to: string): Promise<ReportsDataset> {
      const limit = 250;
      const consultations: ReportsDataset['consultations'] = [];
      const patients: ReportsDataset['patients'] = [];
      for (let offset = 0; ; offset += limit) {
        const fromTimestamp = `${from.slice(0, 10)}T00:00:00.000Z`;
        const toTimestamp = `${to.slice(0, 10)}T23:59:59.999Z`;
        const { data } = await clinicReports(dc(), { from: fromTimestamp, to: toTimestamp, limit, offset });
        consultations.push(...data.consultations.map((record) => ({
          id: record.id,
          consultedAt: record.consultedAt,
          reason: record.reason ?? null,
          patientName: record.patient.fullName,
          recordNumber: record.patient.recordNumber,
          sex: record.patient.sex,
          birthDate: record.patient.birthDate ?? null,
          professionalName: record.professional.fullName
        })));
        patients.push(...data.patients.map((patient) => ({
          id: patient.id,
          createdAt: patient.createdAt,
          sex: patient.sex,
          birthDate: patient.birthDate ?? null
        })));
        if (data.consultations.length < limit && data.patients.length < limit) break;
      }
      return { consultations, patients };
    }
  },
  async catalogs(): Promise<Catalogs> {
    const { data } = await getCatalogs(dc());
    const clinic = data.users[0]?.clinic;
    return {
      professionals: (clinic?.professionals_on_clinic ?? []).map((professional) => ({
        id: professional.id,
        full_name: professional.fullName,
        license_number: professional.licenseNumber ?? null,
        default_office_id: professional.defaultOfficeId ?? null,
        specialties: []
      })),
      offices: (clinic?.offices_on_clinic ?? []).map((office) => ({
        id: office.id,
        code: office.code,
        name: office.name,
        location: office.location ?? null
      })),
      specialties: (clinic?.specialties_on_clinic ?? []).map((specialty) => ({
        id: specialty.id,
        code: specialty.code,
        name: specialty.name
      })),
      reasons: (clinic?.consultationReasons_on_clinic ?? []).map((reason) => ({
        id: reason.id,
        code: reason.code,
        name: reason.name
      })),
      documentTypes: [
        { code: 'cedula', name: 'Cédula' },
        { code: 'pasaporte', name: 'Pasaporte' },
        { code: 'ruc', name: 'RUC' },
        { code: 'nit', name: 'NIT' },
        { code: 'ssn', name: 'SSN' },
        { code: 'sin_documento', name: 'Sin documento' }
      ]
    };
  },
  async summary(): Promise<Summary> {
    const today = new Date().toISOString().slice(0, 10);
    const [patients, consultations, agenda] = await Promise.all([
      this.patients.list('', 1, 0),
      this.consultations.list(),
      this.agenda.get(today)
    ]);
    return {
      patients: patients.total,
      drafts: consultations.consultations.filter((item) => item.status === 'borrador').length,
      signed: consultations.consultations.filter((item) => item.status === 'firmada').length,
      upcomingAppointments: agenda.stats.scheduled
    };
  }
};
