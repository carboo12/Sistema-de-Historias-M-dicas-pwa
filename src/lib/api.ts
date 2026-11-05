import type {
  AgendaResponse,
  Appointment,
  Catalogs,
  Cie10Code,
  Consultation,
  ConsultationSummary,
  Diagnosis,
  Patient,
  PatientDetail,
  ReportsDataset,
  Summary,
  User
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  status: number;
  code: string;
  payload: unknown;

  constructor(message: string, status: number, code = 'error', payload: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include'
  });

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = (data as { error?: { message?: string; code?: string } }).error;
    throw new ApiError(
      error?.message ?? 'No se pudo completar la solicitud',
      response.status,
      error?.code ?? 'error',
      data
    );
  }

  return data as T;
}

function queryString(params: Record<string, string | number | null | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') search.set(key, String(value));
  }
  const value = search.toString();
  return value ? `?${value}` : '';
}

export const api = {
  auth: {
    login: (identifier: string, password: string) =>
      request<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      }),
    me: () => request<{ user: User }>('/api/auth/me'),
    logout: () => request<void>('/api/auth/logout', { method: 'POST' })
  },
  patients: {
    list: (q = '', limit = 25, offset = 0) =>
      request<{ patients: Patient[]; total: number; limit: number; offset: number }>(
        `/api/patients${queryString({ q, limit, offset })}`
      ),
    get: (id: string) => request<PatientDetail>(`/api/patients/${id}`),
    create: (payload: Record<string, unknown>) =>
      request<{ patient: Patient }>('/api/patients', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    update: (id: string, payload: Record<string, unknown>) =>
      request<{ patient: Patient }>(`/api/patients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }),
    delete: (id: string) => request<void>(`/api/patients/${id}`, { method: 'DELETE' })
  },
  agenda: {
    get: (date: string) => request<AgendaResponse>(`/api/agenda${queryString({ date })}`),
    appointments: (patientId?: string) =>
      request<{ appointments: Appointment[] }>(`/api/appointments${queryString({ patientId })}`),
    create: (payload: Record<string, unknown>) =>
      request<{ appointment: Appointment }>('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    updateStatus: (id: string, status: string) =>
      request<{ appointment: Pick<Appointment, 'id' | 'status' | 'startsAt' | 'endsAt'> }>(
        `/api/appointments/${id}/status`,
        { method: 'PATCH', body: JSON.stringify({ status }) }
      ),
    update: (id: string, payload: Record<string, unknown>) => request<{ appointment: Appointment }>(`/api/appointments/${id}`, {
      method: 'PATCH', body: JSON.stringify(payload)
    })
  },
  consultations: {
    list: (patientId?: string) =>
      request<{ consultations: ConsultationSummary[] }>(
        `/api/consultations${queryString({ patientId })}`
      ),
    get: (id: string) =>
      request<{
        consultation: Consultation;
        diagnoses: Diagnosis[];
        canSign: boolean;
        signBlockers: { reason: boolean; diagnosis: boolean };
      }>(`/api/consultations/${id}`),
    create: (payload: Record<string, unknown>) =>
      request<{ consultation: Consultation }>('/api/consultations', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    update: (id: string, payload: Record<string, unknown>) =>
      request<{ consultation: Consultation }>(`/api/consultations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }),
    delete: (id: string) => request<void>(`/api/consultations/${id}`, { method: 'DELETE' }),
    sign: (id: string) =>
      request<{ consultation: Consultation; signedAt: string }>(`/api/consultations/${id}/sign`, {
        method: 'POST'
      }),
    addDiagnosis: (id: string, payload: { code: string; type?: string; notes?: string }) =>
      request<{ diagnosis: Diagnosis }>(`/api/consultations/${id}/diagnoses`, {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    deleteDiagnosis: (id: string, diagnosisId: string) =>
      request<void>(`/api/consultations/${id}/diagnoses/${diagnosisId}`, { method: 'DELETE' }),
    updateDiagnosis: (id: string, diagnosisId: string, payload: { description: string; type: string; notes?: string | null }) =>
      request<void>(`/api/consultations/${id}/diagnoses/${diagnosisId}`, { method: 'PATCH', body: JSON.stringify(payload) })
  },
  cie10: {
    search: (q: string) => request<{ codes: Cie10Code[] }>(`/api/cie10${queryString({ q })}`)
  },
  catalogs: () => request<Catalogs>('/api/catalogs'),
  reports: {
    get: (from: string, to: string) => request<ReportsDataset>(`/api/reports${queryString({ from, to })}`)
  },
  summary: () => request<Summary>('/api/summary')
};
