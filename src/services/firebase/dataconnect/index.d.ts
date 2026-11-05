import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddDiagnosisData {
  consultationDiagnosis_insert: ConsultationDiagnosis_Key;
}

export interface AddDiagnosisVariables {
  clinicId: UUIDString;
  patientId: UUIDString;
  consultationId: UUIDString;
  professionalId?: UUIDString | null;
  cie10Code?: string | null;
  diagnosisText: string;
  diagnosisType: string;
  notes?: string | null;
}

export interface Appointment_Key {
  id: UUIDString;
  __typename?: 'Appointment_Key';
}

export interface Cie10Code_Key {
  code: string;
  __typename?: 'Cie10Code_Key';
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

export interface CountPatientsData {
  patients: ({
    _count: number;
  })[];
}

export interface CountPatientsVariables {
  q: string;
}

export interface CreateAppointmentData {
  appointment_insert: Appointment_Key;
}

export interface CreateAppointmentVariables {
  clinicId: UUIDString;
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
  consultation_insert: Consultation_Key;
}

export interface CreateConsultationVariables {
  clinicId: UUIDString;
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
  patient_insert: Patient_Key;
}

export interface CreatePatientVariables {
  clinicId: UUIDString;
  recordNumber: string;
  documentType: string;
  documentNumber?: string | null;
  documentVerified: boolean;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  birthDate?: DateString | null;
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

export interface DeleteDiagnosisData {
  consultationDiagnosis_delete?: ConsultationDiagnosis_Key | null;
}

export interface DeleteDiagnosisVariables {
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
      recordNumber: string;
      birthDate?: DateString | null;
      sex: string;
      allergiesNotes?: string | null;
    };
    professional: {
      fullName: string;
    };
    consultationDiagnoses_on_consultation: ({
      id: UUIDString;
      cie10Code?: string | null;
      diagnosisText: string;
      diagnosisType: string;
      notes?: string | null;
      diagnosedAt: TimestampString;
    } & ConsultationDiagnosis_Key)[];
  } & Consultation_Key)[];
}

export interface GetConsultationVariables {
  id: UUIDString;
}

export interface GetPatientData {
  patients: ({
    id: UUIDString;
    recordNumber: string;
    documentType: string;
    documentNumber?: string | null;
    documentVerified: boolean;
    fullName: string;
    firstName?: string | null;
    lastName?: string | null;
    birthDate?: DateString | null;
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
      consultationDiagnoses_on_consultation: ({
        id: UUIDString;
        cie10Code?: string | null;
        diagnosisText: string;
        diagnosisType: string;
      } & ConsultationDiagnosis_Key)[];
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
    consultationDiagnoses_on_consultation: ({
      id: UUIDString;
      cie10Code?: string | null;
      diagnosisText: string;
      diagnosisType: string;
    } & ConsultationDiagnosis_Key)[];
  } & Consultation_Key)[];
}

export interface ListPatientsData {
  patients: ({
    id: UUIDString;
    recordNumber: string;
    documentType: string;
    documentNumber?: string | null;
    documentVerified: boolean;
    fullName: string;
    firstName?: string | null;
    lastName?: string | null;
    birthDate?: DateString | null;
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

export interface SearchCie10Data {
  cie10Codes: ({
    code: string;
    description: string;
    chapter?: string | null;
    category?: string | null;
  } & Cie10Code_Key)[];
}

export interface SearchCie10Variables {
  q: string;
}

export interface SignConsultationData {
  consultation_update?: Consultation_Key | null;
}

export interface SignConsultationVariables {
  id: UUIDString;
}

export interface Specialty_Key {
  id: UUIDString;
  __typename?: 'Specialty_Key';
}

export interface UpdateAppointmentStatusData {
  appointment_update?: Appointment_Key | null;
}

export interface UpdateAppointmentStatusVariables {
  id: UUIDString;
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
  documentType: string;
  documentNumber?: string | null;
  documentVerified: boolean;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  birthDate?: DateString | null;
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

interface AddDiagnosisRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddDiagnosisVariables): MutationRef<AddDiagnosisData, AddDiagnosisVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddDiagnosisVariables): MutationRef<AddDiagnosisData, AddDiagnosisVariables>;
  operationName: string;
}
export const addDiagnosisRef: AddDiagnosisRef;

export function addDiagnosis(vars: AddDiagnosisVariables): MutationPromise<AddDiagnosisData, AddDiagnosisVariables>;
export function addDiagnosis(dc: DataConnect, vars: AddDiagnosisVariables): MutationPromise<AddDiagnosisData, AddDiagnosisVariables>;

interface DeleteDiagnosisRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteDiagnosisVariables): MutationRef<DeleteDiagnosisData, DeleteDiagnosisVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteDiagnosisVariables): MutationRef<DeleteDiagnosisData, DeleteDiagnosisVariables>;
  operationName: string;
}
export const deleteDiagnosisRef: DeleteDiagnosisRef;

export function deleteDiagnosis(vars: DeleteDiagnosisVariables): MutationPromise<DeleteDiagnosisData, DeleteDiagnosisVariables>;
export function deleteDiagnosis(dc: DataConnect, vars: DeleteDiagnosisVariables): MutationPromise<DeleteDiagnosisData, DeleteDiagnosisVariables>;

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

interface SearchCie10Ref {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SearchCie10Variables): QueryRef<SearchCie10Data, SearchCie10Variables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SearchCie10Variables): QueryRef<SearchCie10Data, SearchCie10Variables>;
  operationName: string;
}
export const searchCie10Ref: SearchCie10Ref;

export function searchCie10(vars: SearchCie10Variables, options?: ExecuteQueryOptions): QueryPromise<SearchCie10Data, SearchCie10Variables>;
export function searchCie10(dc: DataConnect, vars: SearchCie10Variables, options?: ExecuteQueryOptions): QueryPromise<SearchCie10Data, SearchCie10Variables>;

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

