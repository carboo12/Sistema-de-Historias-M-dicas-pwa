export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function normalizePatientSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('es');
}

export function ageFromBirthDate(value: string | null) {
  if (!value) return null;
  const birth = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

export function todayInTimeZone(timeZone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

export function formatDate(value: string | null | undefined, timeZone: string, options?: Intl.DateTimeFormatOptions) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('es-NI', {
    timeZone,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options
  }).format(date);
}

export function formatDateOnly(value: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!value) return '—';
  const clean = value.slice(0, 10);
  const date = new Date(`${clean}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('es-NI', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options
  }).format(date);
}

export function formatTime(value: string | null | undefined, timeZone: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('es-NI', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

export function formatDateTime(value: string | null | undefined, timeZone: string) {
  if (!value) return '—';
  return `${formatDate(value, timeZone)} · ${formatTime(value, timeZone)}`;
}

export function formatLongDate(value: string | null | undefined, timeZone: string) {
  if (!value?.trim()) return 'Fecha no especificada';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no especificada';
  try {
    return new Intl.DateTimeFormat('es-NI', {
      timeZone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return 'Fecha no especificada';
  }
}

export function sexLabel(value: string) {
  return { M: 'Masculino', F: 'Femenino', X: 'Otro', U: 'Sin especificar' }[value] ?? 'Sin especificar';
}

export function patientDocument(patient: { documentType: string | null; documentNumber: string | null }) {
  if (!patient.documentNumber) return 'Sin documento';
  return `${patient.documentType?.toUpperCase() ?? 'DOCUMENTO'} ${patient.documentNumber}`;
}

export function appointmentStatusLabel(status: string) {
  return (
    {
      programada: 'Programada',
      confirmada: 'Confirmada',
      en_espera: 'En espera',
      atendida: 'Atendida',
      cancelada: 'Cancelada',
      no_asistio: 'No asistió',
      reprogramada: 'Reprogramada'
    }[status] ?? status
  );
}

export function consultationStatusLabel(status: string) {
  return { borrador: 'Borrador', firmada: 'Completada', completada: 'Completada', completed: 'Completada', anulada: 'Anulada' }[status] ?? status;
}

export function statusBadgeClass(status: string) {
  if (['atendida', 'firmada', 'completada', 'completed'].includes(status)) return 'badge-teal';
  if (['programada', 'confirmada'].includes(status)) return 'badge-blue';
  if (['en_espera', 'borrador'].includes(status)) return 'badge-amber';
  if (['cancelada', 'no_asistio', 'anulada'].includes(status)) return 'badge-red';
  return 'badge-slate';
}

export function shiftDate(date: string, days: number) {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
}

export function currentTimeInput() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function dateTimeToIso(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export function truncate(value: string | null | undefined, max = 80) {
  if (!value) return '';
  return value.length > max ? `${value.slice(0, max).trim()}…` : value;
}
