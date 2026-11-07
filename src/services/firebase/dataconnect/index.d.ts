import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Appointment_Key {
  id: UUIDString;
  __typename?: 'Appointment_Key';
}

export interface Cie10Code_Key {
  code: string;
  __typename?: 'Cie10Code_Key';
}

export interface ClinicReportsData {
  consultations: ({
    id: UUIDString;
    consultedAt: TimestampString;
    reason?: string | null;
    professional: {
      fullName: string;
    };
    patient: {
      fullName: string;
      recordNumber: string;
      sex: string;
      birthDate?: DateString | null;
    };
  } & Consultation_Key)[];
  patients: ({
    id: UUIDString;
    createdAt: TimestampString;
    sex: string;
    birthDate?: DateString | null;
  } & Patient_Key)[];
}

export interface ClinicReportsVariables {
  from: TimestampString;
  to: TimestampString;
  limit: number;
  offset: number;
}

export interface Clinic_Key {
  id: UUIDString;
  __typename?: 'Clinic_Key';
}

export interface ConsultationDiagnosis_Key {
  id: UUIDString;
  __typename?: 'ConsultationDiagnosis_Key';
}

export interface ConsultationReason_Key {
  id: UUIDString;
  __typename?: 'ConsultationReason_Key';
}

export interface Consultation_Key {
  id: UUIDString;
  __typename?: 'Consultation_Key';
}

export interface CountPatientsByTermsData {
  patients: ({
    _count: number;
  })[];
}

export interface CountPatientsByTermsVariables {
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  q6?: string;
}

export interface CountPatientsData {
  patients: ({
    _count: number;
  })[];
}

export interface CountPatientsVariables {
  q: string;
}

export interface CreateAppointmentData {
  user_update?: User_Key | null;
  appointment_insert: Appointment_Key;
}

export interface CreateAppointmentVariables {
  clinicId: UUIDString;
  createdById: UUIDString;
  patientId: UUIDString;
  professionalId: UUIDString;
  specialtyId?: UUIDString | null;
  officeId?: UUIDString | null;
  startsAt: TimestampString;
  endsAt: TimestampString;
  durationMinutes: number;
  reason?: string | null;
  notes?: string | null;
  status: string;
  source: string;
}

export interface CreateConsultationData {
  user_update?: User_Key | null;
  consultation_insert: Consultation_Key;
}

export interface CreateConsultationVariables {
  clinicId: UUIDString;
  createdById: UUIDString;
  patientId: UUIDString;
  professionalId: UUIDString;
  appointmentId?: UUIDString | null;
  specialtyId?: UUIDString | null;
  consultationType: string;
  consultedAt: TimestampString;
  reason?: string | null;
  notes?: string | null;
  status: string;
  source: string;
}

export interface CreatePatientData {
  user_update?: User_Key | null;
  patient_insert: Patient_Key;
}

export interface CreatePatientStudyData {
  patient_update?: Patient_Key | null;
  patientStudy_insert: PatientStudy_Key;
}

export interface CreatePatientStudyVariables {
  clinicId: UUIDString;
  patientId: UUIDString;
  professionalId?: UUIDString | null;
  studyType: string;
  studyName: string;
  performedAt: TimestampString;
  resultSummary?: string | null;
  resultText?: string | null;
  metadata: unknown;
}

export interface CreatePatientVariables {
  clinicId: UUIDString;
  createdById: UUIDString;
  recordNumber: string;
  documentType?: string | null;
  documentNumber?: string | null;
  documentVerified: boolean;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  birthDate?: DateString | null;
  ageOverride?: number | null;
  birthDateEstimated: boolean;
  sex: string;
  maritalStatus: string;
  bloodType?: string | null;
  nationality?: string | null;
  birthPlace?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  occupation?: string | null;
  isPrivate: boolean;
  allergiesNotes?: string | null;
  currentDiagnosisSummary?: string | null;
  notes?: string | null;
  isSuspended: boolean;
  suspensionReason?: string | null;
}

export interface DeleteConsultationData {
  consultation_update?: Consultation_Key | null;
}

export interface DeleteConsultationVariables {
  id: UUIDString;
}

export interface DeleteConsultationWithClinicContextData {
  user_update?: User_Key | null;
  consultation_update?: Consultation_Key | null;
}

export interface DeleteConsultationWithClinicContextVariables {
  id: UUIDString;
  clinicId: UUIDString;
}

export interface DeletePatientData {
  patient_update?: Patient_Key | null;
}

export interface DeletePatientVariables {
  id: UUIDString;
}

export interface GetCatalogsData {
  users: ({
    clinic: {
      professionals_on_clinic: ({
        id: UUIDString;
        fullName: string;
        licenseNumber?: string | null;
        defaultOfficeId?: UUIDString | null;
      } & Professional_Key)[];
      offices_on_clinic: ({
        id: UUIDString;
        code: string;
        name: string;
        location?: string | null;
      } & Office_Key)[];
      specialties_on_clinic: ({
        id: UUIDString;
        code: string;
        name: string;
      } & Specialty_Key)[];
      consultationReasons_on_clinic: ({
        id: UUIDString;
        code: string;
        name: string;
      } & ConsultationReason_Key)[];
    };
  })[];
}

export interface GetConsultationData {
  consultations: ({
    id: UUIDString;
    clinicId: UUIDString;
    patientId: UUIDString;
    professionalId: UUIDString;
    appointmentId?: UUIDString | null;
    specialtyId?: UUIDString | null;
    consultationType: string;
    consultedAt: TimestampString;
    nextVisitAt?: TimestampString | null;
    reason?: string | null;
    currentIllness?: string | null;
    physicalExam?: string | null;
    functionalExam?: string | null;
    studies?: string | null;
    evolutionText?: string | null;
    studiesText?: string | null;
    prescriptionText?: string | null;
    diagnosisNotes?: string | null;
    treatmentPlan?: string | null;
    evolution?: string | null;
    plan?: string | null;
    notes?: string | null;
    vitals: unknown;
    status: string;
    signedAt?: TimestampString | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    patient: {
      fullName: string;
      email?: string | null;
      recordNumber: string;
      birthDate?: DateString | null;
      sex: string;
      allergiesNotes?: string | null;
    };
    professional: {
      fullName: string;
    };
    prescriptions_on_consultation: ({
      legacyId?: string | null;
      prescriptionItems_on_prescription: ({
        medicationName: string;
        presentation?: string | null;
        dose?: string | null;
        frequency?: string | null;
        duration?: string | null;
        quantity?: number | null;
        instructions?: string | null;
        sortOrder: number;
      })[];
    })[];
  } & Consultation_Key)[];
}

export interface GetConsultationVariables {
  id: UUIDString;
}

export interface GetPatientData {
  patients: ({
    id: UUIDString;
    recordNumber: string;
    documentType?: string | null;
    documentNumber?: string | null;
    documentVerified: boolean;
    fullName: string;
    firstName?: string | null;
    lastName?: string | null;
    birthDate?: DateString | null;
    ageOverride?: number | null;
    birthDateEstimated: boolean;
    deceased: boolean;
    deathDate?: DateString | null;
    sex: string;
    maritalStatus: string;
    bloodType?: string | null;
    nationality?: string | null;
    birthPlace?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    phone?: string | null;
    mobile?: string | null;
    email?: string | null;
    occupation?: string | null;
    isPrivate: boolean;
    photoUrl?: string | null;
    allergiesNotes?: string | null;
    currentDiagnosisSummary?: string | null;
    guardianName?: string | null;
    guardianPhone?: string | null;
    religion?: string | null;
    isSuspended: boolean;
    suspensionReason?: string | null;
    notes?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    patientHistories_on_patient: ({
      id: UUIDString;
      category: string;
      description: string;
      details: unknown;
      onsetDate?: DateString | null;
      isActive: boolean;
      recordedAt: TimestampString;
    } & PatientHistory_Key)[];
    consultations_on_patient: ({
      id: UUIDString;
      consultedAt: TimestampString;
      status: string;
      reason?: string | null;
      currentIllness?: string | null;
      treatmentPlan?: string | null;
      signedAt?: TimestampString | null;
      updatedAt: TimestampString;
      professional: {
        fullName: string;
      };
    } & Consultation_Key)[];
    appointments_on_patient: ({
      id: UUIDString;
      startsAt: TimestampString;
      endsAt: TimestampString;
      status: string;
      reason?: string | null;
      professional: {
        fullName: string;
      };
    } & Appointment_Key)[];
  } & Patient_Key)[];
}

export interface GetPatientVariables {
  id: UUIDString;
}

export interface GetSessionData {
  users: ({
    id: UUIDString;
    firebaseUid?: string | null;
    username: string;
    email?: string | null;
    fullName: string;
    role: string;
    mustChangePassword: boolean;
    isActive: boolean;
    clinic: {
      id: UUIDString;
      code: string;
      name: string;
      timezone: string;
      currency: string;
    } & Clinic_Key;
    professional_on_user?: {
      id: UUIDString;
      fullName: string;
      licenseNumber?: string | null;
    } & Professional_Key;
  } & User_Key)[];
}

export interface LinkCurrentUserData {
  user_update?: User_Key | null;
}

export interface ListAgendaData {
  appointments: ({
    id: UUIDString;
    patientId: UUIDString;
    professionalId: UUIDString;
    startsAt: TimestampString;
    endsAt: TimestampString;
    durationMinutes: number;
    reason?: string | null;
    status: string;
    notes?: string | null;
    patient: {
      fullName: string;
      email?: string | null;
      recordNumber: string;
      phone?: string | null;
    };
    professional: {
      fullName: string;
    };
    specialty?: {
      name: string;
    };
    office?: {
      name: string;
    };
    consultation_on_appointment?: {
      id: UUIDString;
    } & Consultation_Key;
  } & Appointment_Key)[];
}

export interface ListAgendaVariables {
  start: TimestampString;
  end: TimestampString;
}

export interface ListConsultationsData {
  consultations: ({
    id: UUIDString;
    consultedAt: TimestampString;
    status: string;
    reason?: string | null;
    currentIllness?: string | null;
    treatmentPlan?: string | null;
    signedAt?: TimestampString | null;
    updatedAt: TimestampString;
    patient: {
      fullName: string;
      recordNumber: string;
    };
    professional: {
      fullName: string;
    };
  } & Consultation_Key)[];
}

export interface ListPatientStudiesData {
  patientStudies: ({
    id: UUIDString;
    studyType: string;
    studyName: string;
    performedAt?: TimestampString | null;
    resultSummary?: string | null;
    resultText?: string | null;
    metadata: unknown;
    consultation?: {
      id: UUIDString;
    } & Consultation_Key;
    professional?: {
      fullName: string;
    };
  } & PatientStudy_Key)[];
}

export interface ListPatientStudiesVariables {
  patientId: UUIDString;
  limit: number;
  offset: number;
}

export interface ListPatientsByTermsData {
  patients: ({
    id: UUIDString;
    recordNumber: string;
    documentType?: string | null;
    documentNumber?: string | null;
    documentVerified: boolean;
    fullName: string;
    firstName?: string | null;
    lastName?: string | null;
    birthDate?: DateString | null;
    ageOverride?: number | null;
    birthDateEstimated: boolean;
    deceased: boolean;
    sex: string;
    maritalStatus: string;
    bloodType?: string | null;
    nationality?: string | null;
    birthPlace?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    phone?: string | null;
    mobile?: string | null;
    email?: string | null;
    occupation?: string | null;
    isPrivate: boolean;
    photoUrl?: string | null;
    allergiesNotes?: string | null;
    currentDiagnosisSummary?: string | null;
    isSuspended: boolean;
    suspensionReason?: string | null;
    notes?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    appointments_on_patient: ({
      startsAt: TimestampString;
    })[];
  } & Patient_Key)[];
}

export interface ListPatientsByTermsVariables {
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  q6?: string;
  limit: number;
  offset: number;
}

export interface ListPatientsData {
  patients: ({
    id: UUIDString;
    recordNumber: string;
    documentType?: string | null;
    documentNumber?: string | null;
    documentVerified: boolean;
    fullName: string;
    firstName?: string | null;
    lastName?: string | null;
    birthDate?: DateString | null;
    ageOverride?: number | null;
    birthDateEstimated: boolean;
    deceased: boolean;
    sex: string;
    maritalStatus: string;
    bloodType?: string | null;
    nationality?: string | null;
    birthPlace?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    phone?: string | null;
    mobile?: string | null;
    email?: string | null;
    occupation?: string | null;
    isPrivate: boolean;
    photoUrl?: string | null;
    allergiesNotes?: string | null;
    currentDiagnosisSummary?: string | null;
    isSuspended: boolean;
    suspensionReason?: string | null;
    notes?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    appointments_on_patient: ({
      startsAt: TimestampString;
    })[];
  } & Patient_Key)[];
}

export interface ListPatientsVariables {
  q: string;
  limit: number;
  offset: number;
}

export interface Office_Key {
  id: UUIDString;
  __typename?: 'Office_Key';
}

export interface PatientAnamnesisAnswer_Key {
  id: UUIDString;
  __typename?: 'PatientAnamnesisAnswer_Key';
}

export interface PatientHistory_Key {
  id: UUIDString;
  __typename?: 'PatientHistory_Key';
}

export interface PatientStudy_Key {
  id: UUIDString;
  __typename?: 'PatientStudy_Key';
}

export interface Patient_Key {
  id: UUIDString;
  __typename?: 'Patient_Key';
}

export interface PrescriptionItem_Key {
  id: UUIDString;
  __typename?: 'PrescriptionItem_Key';
}

export interface Prescription_Key {
  id: UUIDString;
  __typename?: 'Prescription_Key';
}

export interface Professional_Key {
  id: UUIDString;
  __typename?: 'Professional_Key';
}

export interface SaveConsultationWithClinicContextData {
  user_update?: User_Key | null;
  consultation_update?: Consultation_Key | null;
}

export interface SaveConsultationWithClinicContextVariables {
  id: UUIDString;
  clinicId: UUIDString;
  status: string;
  nextVisitAt?: TimestampString | null;
  reason?: string | null;
  currentIllness?: string | null;
  physicalExam?: string | null;
  functionalExam?: string | null;
  studies?: string | null;
  evolutionText?: string | null;
  studiesText?: string | null;
  prescriptionText?: string | null;
  diagnosisNotes?: string | null;
  treatmentPlan?: string | null;
  evolution?: string | null;
  plan?: string | null;
  notes?: string | null;
  vitals: unknown;
}

export interface SignConsultationData {
  user_update?: User_Key | null;
  consultation_update?: Consultation_Key | null;
}

export interface SignConsultationVariables {
  id: UUIDString;
  signedById: UUIDString;
}

export interface SignConsultationWithClinicContextData {
  user_update?: User_Key | null;
  consultation_update?: Consultation_Key | null;
  appointment_update?: Appointment_Key | null;
}

export interface SignConsultationWithClinicContextVariables {
  id: UUIDString;
  clinicId: UUIDString;
  signedById: UUIDString;
  appointmentId?: UUIDString | null;
  skipAppointmentUpdate: boolean;
  nextVisitAt?: TimestampString | null;
  reason?: string | null;
  currentIllness?: string | null;
  physicalExam?: string | null;
  functionalExam?: string | null;
  studies?: string | null;
  evolutionText?: string | null;
  studiesText?: string | null;
  prescriptionText?: string | null;
  diagnosisNotes?: string | null;
  treatmentPlan?: string | null;
  evolution?: string | null;
  plan?: string | null;
  notes?: string | null;
  vitals: unknown;
}

export interface Specialty_Key {
  id: UUIDString;
  __typename?: 'Specialty_Key';
}

export interface UpdateAppointmentData {
  appointment_update?: Appointment_Key | null;
}

export interface UpdateAppointmentStatusData {
  appointment_update?: Appointment_Key | null;
}

export interface UpdateAppointmentStatusVariables {
  id: UUIDString;
  status: string;
}

export interface UpdateAppointmentVariables {
  id: UUIDString;
  startsAt: TimestampString;
  endsAt: TimestampString;
  durationMinutes: number;
  reason?: string | null;
  notes?: string | null;
  status: string;
}

export interface UpdateConsultationData {
  consultation_update?: Consultation_Key | null;
}

export interface UpdateConsultationVariables {
  id: UUIDString;
  nextVisitAt?: TimestampString | null;
  reason?: string | null;
  currentIllness?: string | null;
  physicalExam?: string | null;
  functionalExam?: string | null;
  studies?: string | null;
  evolutionText?: string | null;
  studiesText?: string | null;
  prescriptionText?: string | null;
  diagnosisNotes?: string | null;
  treatmentPlan?: string | null;
  evolution?: string | null;
  plan?: string | null;
  notes?: string | null;
  vitals: unknown;
}

export interface UpdateConsultationWithClinicContextData {
  user_update?: User_Key | null;
  consultation_update?: Consultation_Key | null;
}

export interface UpdateConsultationWithClinicContextVariables {
  id: UUIDString;
  clinicId: UUIDString;
  nextVisitAt?: TimestampString | null;
  reason?: string | null;
  currentIllness?: string | null;
  physicalExam?: string | null;
  functionalExam?: string | null;
  studies?: string | null;
  evolutionText?: string | null;
  studiesText?: string | null;
  prescriptionText?: string | null;
  diagnosisNotes?: string | null;
  treatmentPlan?: string | null;
  evolution?: string | null;
  plan?: string | null;
  notes?: string | null;
  vitals: unknown;
}

export interface UpdatePatientData {
  patient_update?: Patient_Key | null;
}

export interface UpdatePatientVariables {
  id: UUIDString;
  documentType?: string | null;
  documentNumber?: string | null;
  documentVerified: boolean;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  birthDate?: DateString | null;
  ageOverride?: number | null;
  birthDateEstimated: boolean;
  sex: string;
  maritalStatus: string;
  bloodType?: string | null;
  nationality?: string | null;
  birthPlace?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  occupation?: string | null;
  isPrivate: boolean;
  allergiesNotes?: string | null;
  currentDiagnosisSummary?: string | null;
  notes?: string | null;
  isSuspended: boolean;
  suspensionReason?: string | null;
}

export interface UpdatePatientWithClinicContextData {
  user_update?: User_Key | null;
  patient_update?: Patient_Key | null;
}

export interface UpdatePatientWithClinicContextVariables {
  id: UUIDString;
  clinicId: UUIDString;
  documentType?: string | null;
  documentNumber?: string | null;
  documentVerified: boolean;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  birthDate?: DateString | null;
  ageOverride?: number | null;
  birthDateEstimated: boolean;
  sex: string;
  maritalStatus: string;
  bloodType?: string | null;
  nationality?: string | null;
  birthPlace?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  occupation?: string | null;
  isPrivate: boolean;
  allergiesNotes?: string | null;
  currentDiagnosisSummary?: string | null;
  notes?: string | null;
  isSuspended: boolean;
  suspensionReason?: string | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface LinkCurrentUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<LinkCurrentUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<LinkCurrentUserData, undefined>;
  operationName: string;
}
export const linkCurrentUserRef: LinkCurrentUserRef;

export function linkCurrentUser(): MutationPromise<LinkCurrentUserData, undefined>;
export function linkCurrentUser(dc: DataConnect): MutationPromise<LinkCurrentUserData, undefined>;

interface CreatePatientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePatientVariables): MutationRef<CreatePatientData, CreatePatientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePatientVariables): MutationRef<CreatePatientData, CreatePatientVariables>;
  operationName: string;
}
export const createPatientRef: CreatePatientRef;

export function createPatient(vars: CreatePatientVariables): MutationPromise<CreatePatientData, CreatePatientVariables>;
export function createPatient(dc: DataConnect, vars: CreatePatientVariables): MutationPromise<CreatePatientData, CreatePatientVariables>;

interface UpdatePatientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePatientVariables): MutationRef<UpdatePatientData, UpdatePatientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdatePatientVariables): MutationRef<UpdatePatientData, UpdatePatientVariables>;
  operationName: string;
}
export const updatePatientRef: UpdatePatientRef;

export function updatePatient(vars: UpdatePatientVariables): MutationPromise<UpdatePatientData, UpdatePatientVariables>;
export function updatePatient(dc: DataConnect, vars: UpdatePatientVariables): MutationPromise<UpdatePatientData, UpdatePatientVariables>;

interface UpdatePatientWithClinicContextRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePatientWithClinicContextVariables): MutationRef<UpdatePatientWithClinicContextData, UpdatePatientWithClinicContextVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdatePatientWithClinicContextVariables): MutationRef<UpdatePatientWithClinicContextData, UpdatePatientWithClinicContextVariables>;
  operationName: string;
}
export const updatePatientWithClinicContextRef: UpdatePatientWithClinicContextRef;

export function updatePatientWithClinicContext(vars: UpdatePatientWithClinicContextVariables): MutationPromise<UpdatePatientWithClinicContextData, UpdatePatientWithClinicContextVariables>;
export function updatePatientWithClinicContext(dc: DataConnect, vars: UpdatePatientWithClinicContextVariables): MutationPromise<UpdatePatientWithClinicContextData, UpdatePatientWithClinicContextVariables>;

interface DeletePatientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeletePatientVariables): MutationRef<DeletePatientData, DeletePatientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeletePatientVariables): MutationRef<DeletePatientData, DeletePatientVariables>;
  operationName: string;
}
export const deletePatientRef: DeletePatientRef;

export function deletePatient(vars: DeletePatientVariables): MutationPromise<DeletePatientData, DeletePatientVariables>;
export function deletePatient(dc: DataConnect, vars: DeletePatientVariables): MutationPromise<DeletePatientData, DeletePatientVariables>;

interface CreateAppointmentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAppointmentVariables): MutationRef<CreateAppointmentData, CreateAppointmentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAppointmentVariables): MutationRef<CreateAppointmentData, CreateAppointmentVariables>;
  operationName: string;
}
export const createAppointmentRef: CreateAppointmentRef;

export function createAppointment(vars: CreateAppointmentVariables): MutationPromise<CreateAppointmentData, CreateAppointmentVariables>;
export function createAppointment(dc: DataConnect, vars: CreateAppointmentVariables): MutationPromise<CreateAppointmentData, CreateAppointmentVariables>;

interface UpdateAppointmentStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAppointmentStatusVariables): MutationRef<UpdateAppointmentStatusData, UpdateAppointmentStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateAppointmentStatusVariables): MutationRef<UpdateAppointmentStatusData, UpdateAppointmentStatusVariables>;
  operationName: string;
}
export const updateAppointmentStatusRef: UpdateAppointmentStatusRef;

export function updateAppointmentStatus(vars: UpdateAppointmentStatusVariables): MutationPromise<UpdateAppointmentStatusData, UpdateAppointmentStatusVariables>;
export function updateAppointmentStatus(dc: DataConnect, vars: UpdateAppointmentStatusVariables): MutationPromise<UpdateAppointmentStatusData, UpdateAppointmentStatusVariables>;

interface UpdateAppointmentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAppointmentVariables): MutationRef<UpdateAppointmentData, UpdateAppointmentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateAppointmentVariables): MutationRef<UpdateAppointmentData, UpdateAppointmentVariables>;
  operationName: string;
}
export const updateAppointmentRef: UpdateAppointmentRef;

export function updateAppointment(vars: UpdateAppointmentVariables): MutationPromise<UpdateAppointmentData, UpdateAppointmentVariables>;
export function updateAppointment(dc: DataConnect, vars: UpdateAppointmentVariables): MutationPromise<UpdateAppointmentData, UpdateAppointmentVariables>;

interface CreateConsultationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateConsultationVariables): MutationRef<CreateConsultationData, CreateConsultationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateConsultationVariables): MutationRef<CreateConsultationData, CreateConsultationVariables>;
  operationName: string;
}
export const createConsultationRef: CreateConsultationRef;

export function createConsultation(vars: CreateConsultationVariables): MutationPromise<CreateConsultationData, CreateConsultationVariables>;
export function createConsultation(dc: DataConnect, vars: CreateConsultationVariables): MutationPromise<CreateConsultationData, CreateConsultationVariables>;

interface UpdateConsultationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateConsultationVariables): MutationRef<UpdateConsultationData, UpdateConsultationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateConsultationVariables): MutationRef<UpdateConsultationData, UpdateConsultationVariables>;
  operationName: string;
}
export const updateConsultationRef: UpdateConsultationRef;

export function updateConsultation(vars: UpdateConsultationVariables): MutationPromise<UpdateConsultationData, UpdateConsultationVariables>;
export function updateConsultation(dc: DataConnect, vars: UpdateConsultationVariables): MutationPromise<UpdateConsultationData, UpdateConsultationVariables>;

interface UpdateConsultationWithClinicContextRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateConsultationWithClinicContextVariables): MutationRef<UpdateConsultationWithClinicContextData, UpdateConsultationWithClinicContextVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateConsultationWithClinicContextVariables): MutationRef<UpdateConsultationWithClinicContextData, UpdateConsultationWithClinicContextVariables>;
  operationName: string;
}
export const updateConsultationWithClinicContextRef: UpdateConsultationWithClinicContextRef;

export function updateConsultationWithClinicContext(vars: UpdateConsultationWithClinicContextVariables): MutationPromise<UpdateConsultationWithClinicContextData, UpdateConsultationWithClinicContextVariables>;
export function updateConsultationWithClinicContext(dc: DataConnect, vars: UpdateConsultationWithClinicContextVariables): MutationPromise<UpdateConsultationWithClinicContextData, UpdateConsultationWithClinicContextVariables>;

interface SaveConsultationWithClinicContextRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SaveConsultationWithClinicContextVariables): MutationRef<SaveConsultationWithClinicContextData, SaveConsultationWithClinicContextVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SaveConsultationWithClinicContextVariables): MutationRef<SaveConsultationWithClinicContextData, SaveConsultationWithClinicContextVariables>;
  operationName: string;
}
export const saveConsultationWithClinicContextRef: SaveConsultationWithClinicContextRef;

export function saveConsultationWithClinicContext(vars: SaveConsultationWithClinicContextVariables): MutationPromise<SaveConsultationWithClinicContextData, SaveConsultationWithClinicContextVariables>;
export function saveConsultationWithClinicContext(dc: DataConnect, vars: SaveConsultationWithClinicContextVariables): MutationPromise<SaveConsultationWithClinicContextData, SaveConsultationWithClinicContextVariables>;

interface SignConsultationWithClinicContextRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SignConsultationWithClinicContextVariables): MutationRef<SignConsultationWithClinicContextData, SignConsultationWithClinicContextVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SignConsultationWithClinicContextVariables): MutationRef<SignConsultationWithClinicContextData, SignConsultationWithClinicContextVariables>;
  operationName: string;
}
export const signConsultationWithClinicContextRef: SignConsultationWithClinicContextRef;

export function signConsultationWithClinicContext(vars: SignConsultationWithClinicContextVariables): MutationPromise<SignConsultationWithClinicContextData, SignConsultationWithClinicContextVariables>;
export function signConsultationWithClinicContext(dc: DataConnect, vars: SignConsultationWithClinicContextVariables): MutationPromise<SignConsultationWithClinicContextData, SignConsultationWithClinicContextVariables>;

interface DeleteConsultationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteConsultationVariables): MutationRef<DeleteConsultationData, DeleteConsultationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteConsultationVariables): MutationRef<DeleteConsultationData, DeleteConsultationVariables>;
  operationName: string;
}
export const deleteConsultationRef: DeleteConsultationRef;

export function deleteConsultation(vars: DeleteConsultationVariables): MutationPromise<DeleteConsultationData, DeleteConsultationVariables>;
export function deleteConsultation(dc: DataConnect, vars: DeleteConsultationVariables): MutationPromise<DeleteConsultationData, DeleteConsultationVariables>;

interface DeleteConsultationWithClinicContextRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteConsultationWithClinicContextVariables): MutationRef<DeleteConsultationWithClinicContextData, DeleteConsultationWithClinicContextVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteConsultationWithClinicContextVariables): MutationRef<DeleteConsultationWithClinicContextData, DeleteConsultationWithClinicContextVariables>;
  operationName: string;
}
export const deleteConsultationWithClinicContextRef: DeleteConsultationWithClinicContextRef;

export function deleteConsultationWithClinicContext(vars: DeleteConsultationWithClinicContextVariables): MutationPromise<DeleteConsultationWithClinicContextData, DeleteConsultationWithClinicContextVariables>;
export function deleteConsultationWithClinicContext(dc: DataConnect, vars: DeleteConsultationWithClinicContextVariables): MutationPromise<DeleteConsultationWithClinicContextData, DeleteConsultationWithClinicContextVariables>;

interface SignConsultationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SignConsultationVariables): MutationRef<SignConsultationData, SignConsultationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SignConsultationVariables): MutationRef<SignConsultationData, SignConsultationVariables>;
  operationName: string;
}
export const signConsultationRef: SignConsultationRef;

export function signConsultation(vars: SignConsultationVariables): MutationPromise<SignConsultationData, SignConsultationVariables>;
export function signConsultation(dc: DataConnect, vars: SignConsultationVariables): MutationPromise<SignConsultationData, SignConsultationVariables>;

interface CreatePatientStudyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePatientStudyVariables): MutationRef<CreatePatientStudyData, CreatePatientStudyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePatientStudyVariables): MutationRef<CreatePatientStudyData, CreatePatientStudyVariables>;
  operationName: string;
}
export const createPatientStudyRef: CreatePatientStudyRef;

export function createPatientStudy(vars: CreatePatientStudyVariables): MutationPromise<CreatePatientStudyData, CreatePatientStudyVariables>;
export function createPatientStudy(dc: DataConnect, vars: CreatePatientStudyVariables): MutationPromise<CreatePatientStudyData, CreatePatientStudyVariables>;

interface GetSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetSessionData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetSessionData, undefined>;
  operationName: string;
}
export const getSessionRef: GetSessionRef;

export function getSession(options?: ExecuteQueryOptions): QueryPromise<GetSessionData, undefined>;
export function getSession(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetSessionData, undefined>;

interface ListPatientsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPatientsVariables): QueryRef<ListPatientsData, ListPatientsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListPatientsVariables): QueryRef<ListPatientsData, ListPatientsVariables>;
  operationName: string;
}
export const listPatientsRef: ListPatientsRef;

export function listPatients(vars: ListPatientsVariables, options?: ExecuteQueryOptions): QueryPromise<ListPatientsData, ListPatientsVariables>;
export function listPatients(dc: DataConnect, vars: ListPatientsVariables, options?: ExecuteQueryOptions): QueryPromise<ListPatientsData, ListPatientsVariables>;

interface CountPatientsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CountPatientsVariables): QueryRef<CountPatientsData, CountPatientsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CountPatientsVariables): QueryRef<CountPatientsData, CountPatientsVariables>;
  operationName: string;
}
export const countPatientsRef: CountPatientsRef;

export function countPatients(vars: CountPatientsVariables, options?: ExecuteQueryOptions): QueryPromise<CountPatientsData, CountPatientsVariables>;
export function countPatients(dc: DataConnect, vars: CountPatientsVariables, options?: ExecuteQueryOptions): QueryPromise<CountPatientsData, CountPatientsVariables>;

interface ListPatientsByTermsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPatientsByTermsVariables): QueryRef<ListPatientsByTermsData, ListPatientsByTermsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListPatientsByTermsVariables): QueryRef<ListPatientsByTermsData, ListPatientsByTermsVariables>;
  operationName: string;
}
export const listPatientsByTermsRef: ListPatientsByTermsRef;

export function listPatientsByTerms(vars: ListPatientsByTermsVariables, options?: ExecuteQueryOptions): QueryPromise<ListPatientsByTermsData, ListPatientsByTermsVariables>;
export function listPatientsByTerms(dc: DataConnect, vars: ListPatientsByTermsVariables, options?: ExecuteQueryOptions): QueryPromise<ListPatientsByTermsData, ListPatientsByTermsVariables>;

interface CountPatientsByTermsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: CountPatientsByTermsVariables): QueryRef<CountPatientsByTermsData, CountPatientsByTermsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: CountPatientsByTermsVariables): QueryRef<CountPatientsByTermsData, CountPatientsByTermsVariables>;
  operationName: string;
}
export const countPatientsByTermsRef: CountPatientsByTermsRef;

export function countPatientsByTerms(vars?: CountPatientsByTermsVariables, options?: ExecuteQueryOptions): QueryPromise<CountPatientsByTermsData, CountPatientsByTermsVariables>;
export function countPatientsByTerms(dc: DataConnect, vars?: CountPatientsByTermsVariables, options?: ExecuteQueryOptions): QueryPromise<CountPatientsByTermsData, CountPatientsByTermsVariables>;

interface GetPatientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPatientVariables): QueryRef<GetPatientData, GetPatientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetPatientVariables): QueryRef<GetPatientData, GetPatientVariables>;
  operationName: string;
}
export const getPatientRef: GetPatientRef;

export function getPatient(vars: GetPatientVariables, options?: ExecuteQueryOptions): QueryPromise<GetPatientData, GetPatientVariables>;
export function getPatient(dc: DataConnect, vars: GetPatientVariables, options?: ExecuteQueryOptions): QueryPromise<GetPatientData, GetPatientVariables>;

interface ListAgendaRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAgendaVariables): QueryRef<ListAgendaData, ListAgendaVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListAgendaVariables): QueryRef<ListAgendaData, ListAgendaVariables>;
  operationName: string;
}
export const listAgendaRef: ListAgendaRef;

export function listAgenda(vars: ListAgendaVariables, options?: ExecuteQueryOptions): QueryPromise<ListAgendaData, ListAgendaVariables>;
export function listAgenda(dc: DataConnect, vars: ListAgendaVariables, options?: ExecuteQueryOptions): QueryPromise<ListAgendaData, ListAgendaVariables>;

interface ListConsultationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListConsultationsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListConsultationsData, undefined>;
  operationName: string;
}
export const listConsultationsRef: ListConsultationsRef;

export function listConsultations(options?: ExecuteQueryOptions): QueryPromise<ListConsultationsData, undefined>;
export function listConsultations(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListConsultationsData, undefined>;

interface GetConsultationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetConsultationVariables): QueryRef<GetConsultationData, GetConsultationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetConsultationVariables): QueryRef<GetConsultationData, GetConsultationVariables>;
  operationName: string;
}
export const getConsultationRef: GetConsultationRef;

export function getConsultation(vars: GetConsultationVariables, options?: ExecuteQueryOptions): QueryPromise<GetConsultationData, GetConsultationVariables>;
export function getConsultation(dc: DataConnect, vars: GetConsultationVariables, options?: ExecuteQueryOptions): QueryPromise<GetConsultationData, GetConsultationVariables>;

interface ListPatientStudiesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPatientStudiesVariables): QueryRef<ListPatientStudiesData, ListPatientStudiesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListPatientStudiesVariables): QueryRef<ListPatientStudiesData, ListPatientStudiesVariables>;
  operationName: string;
}
export const listPatientStudiesRef: ListPatientStudiesRef;

export function listPatientStudies(vars: ListPatientStudiesVariables, options?: ExecuteQueryOptions): QueryPromise<ListPatientStudiesData, ListPatientStudiesVariables>;
export function listPatientStudies(dc: DataConnect, vars: ListPatientStudiesVariables, options?: ExecuteQueryOptions): QueryPromise<ListPatientStudiesData, ListPatientStudiesVariables>;

interface GetCatalogsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCatalogsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetCatalogsData, undefined>;
  operationName: string;
}
export const getCatalogsRef: GetCatalogsRef;

export function getCatalogs(options?: ExecuteQueryOptions): QueryPromise<GetCatalogsData, undefined>;
export function getCatalogs(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCatalogsData, undefined>;

interface ClinicReportsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ClinicReportsVariables): QueryRef<ClinicReportsData, ClinicReportsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ClinicReportsVariables): QueryRef<ClinicReportsData, ClinicReportsVariables>;
  operationName: string;
}
export const clinicReportsRef: ClinicReportsRef;

export function clinicReports(vars: ClinicReportsVariables, options?: ExecuteQueryOptions): QueryPromise<ClinicReportsData, ClinicReportsVariables>;
export function clinicReports(dc: DataConnect, vars: ClinicReportsVariables, options?: ExecuteQueryOptions): QueryPromise<ClinicReportsData, ClinicReportsVariables>;

