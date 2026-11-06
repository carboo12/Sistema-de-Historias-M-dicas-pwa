export type Role = 'admin' | 'medico' | 'enfermeria' | 'recepcion' | 'facturacion' | 'solo_lectura';

export interface User {
  id: string;
  clinicId: string;
  clinicName: string;
  timezone: string;
  currency: string;
  username: string;
  email: string | null;
  fullName: string;
  role: Role;
  professionalId: string | null;
  mustChangePassword: boolean;
}

export interface Patient {
  id: string;
  recordNumber: string;
  documentType: string | null;
  documentNumber: string | null;
  documentVerified: boolean;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  birthDate: string | null;
  ageOverride: number | null;
  sex: 'M' | 'F' | 'X' | 'U';
  maritalStatus: string;
  bloodType: string | null;
  nationality: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  mobile: string | null;
  email: string | null;
  occupation: string | null;
  isPrivate: boolean;
  photoUrl: string | null;
  allergiesNotes: string | null;
  currentDiagnosisSummary: string | null;
  isSuspended: boolean;
  suspensionReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  consultationCount?: number;
  lastVisitAt?: string | null;
  nextAppointmentAt?: string | null;
}

export interface PatientHistoryItem {
  id: string;
  category: string;
  description: string;
  details: Record<string, unknown>;
  onset_date: string | null;
  is_active: boolean;
  recorded_at: string;
}

export interface ConsultationSummary {
  id: string;
  consulted_at: string;
  status: 'borrador' | 'firmada' | 'anulada';
  reason: string | null;
  current_illness?: string | null;
  treatment_plan?: string | null;
  signed_at: string | null;
  updated_at?: string;
  professional_name: string;
  patient_name?: string;
  record_number?: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string | null;
  recordNumber: string;
  birthDate: string | null;
  sex: string;
  allergiesNotes: string | null;
  professionalId: string;
  professionalName: string;
  appointmentId: string | null;
  specialtyId: string | null;
  consultationType: string;
  consultedAt: string;
  nextVisitAt: string | null;
  reason: string | null;
  currentIllness: string | null;
  physicalExam: string | null;
  functionalExam: string | null;
  studies: string | null;
  evolutionText: string | null;
  studiesText: string | null;
  prescriptionText: string | null;
  diagnosisNotes: string | null;
  treatmentPlan: string | null;
  evolution: string | null;
  plan: string | null;
  notes: string | null;
  prescriptionItems?: {
    medication: string;
    presentation: string;
    dose: string;
    frequency: string;
    route?: string;
    duration: string;
    quantity: string;
    instructions: string;
  }[];
  vitals: Record<string, string>;
  status: 'borrador' | 'firmada' | 'anulada';
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientRecord: string;
  patientPhone: string | null;
  professionalId: string;
  professionalName: string;
  specialtyName: string | null;
  officeName: string | null;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  reason: string | null;
  status:
    | 'programada'
    | 'confirmada'
    | 'en_espera'
    | 'atendida'
    | 'cancelada'
    | 'no_asistio'
    | 'reprogramada';
  notes: string | null;
  consultationId: string | null;
}

export interface AgendaResponse {
  date: string;
  timezone: string;
  appointments: Appointment[];
  stats: {
    total: number;
    scheduled: number;
    waiting: number;
    attended: number;
    cancelled: number;
  };
}

export interface Professional {
  id: string;
  full_name: string;
  license_number: string | null;
  default_office_id: string | null;
  specialties: { id: string; name: string }[];
}

export interface Office {
  id: string;
  code: string;
  name: string;
  location: string | null;
}

export interface Specialty {
  id: string;
  code: string;
  name: string;
}

export interface ConsultationReason {
  id: string;
  code: string;
  name: string;
}

export interface Catalogs {
  professionals: Professional[];
  offices: Office[];
  specialties: Specialty[];
  reasons: ConsultationReason[];
  documentTypes: { code: string; name: string }[];
}

export interface PatientDetail {
  patient: Patient;
  history: PatientHistoryItem[];
  consultations: ConsultationSummary[];
  appointments: {
    id: string;
    starts_at: string;
    ends_at: string;
    status: string;
    reason: string | null;
    professional_name: string;
  }[];
}

export interface Summary {
  patients: number;
  drafts: number;
  signed: number;
  upcomingAppointments: number;
}

export interface ReportsDataset {
  consultations: {
    id: string;
    consultedAt: string;
    reason: string | null;
    patientName: string;
    recordNumber: string;
    sex: string;
    birthDate: string | null;
    professionalName: string;
  }[];
  patients: { id: string; createdAt: string; sex: string; birthDate: string | null }[];
}

export interface PatientStudy {
  id: string;
  patientId: string;
  consultationId: string | null;
  studyType: string;
  studyName: string;
  performedAt: string;
  resultSummary: string | null;
  resultText: string | null;
  fileUrl: string;
  previewUrl: string | null;
  fileName: string;
  mimeType: string;
  professionalName: string;
}
