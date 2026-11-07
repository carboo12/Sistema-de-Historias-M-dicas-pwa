import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardPlus,
  FileText,
  ShieldCheck,
  Stethoscope,
  UserRound
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { PatientPicker } from '../components/PatientPicker';
import {
  Avatar,
  Button,
  Field,
  Input,
  PageHeader,
  Select,
  Spinner,
  Textarea
} from '../components/ui';
import { api, ApiError } from '../lib/data';
import { cacheOfflinePatientDetail, createOfflineConsultation, getOfflinePatientDetail, isNetworkUnavailable, registerOfflineConsultationSync, saveOfflineConsultation } from '../lib/offline-consultations';
import {
  ageFromBirthDate,
  currentTimeInput,
  dateTimeToIso,
  patientDocument,
  todayInTimeZone
} from '../lib/format';
import type { Patient } from '../types';

export function NewConsultationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get('paciente');
  const timezone = user?.timezone ?? 'America/Managua';
  const [patient, setPatient] = useState<Patient | null>(null);
  const [professionalId, setProfessionalId] = useState(user?.professionalId ?? '');
  const [reason, setReason] = useState('');
  const [consultationType, setConsultationType] = useState('consulta');
  const [date, setDate] = useState(todayInTimeZone(timezone));
  const [time, setTime] = useState(currentTimeInput());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const patientQuery = useQuery({
    queryKey: ['patient', initialPatientId],
    queryFn: async () => {
      try {
        const response = await api.patients.get(initialPatientId as string);
        if (user?.id) void cacheOfflinePatientDetail(user.id, response).catch(() => undefined);
        return response;
      } catch (cause) {
        if (user?.id && isNetworkUnavailable(cause)) {
          const cached = await getOfflinePatientDetail(user.id, initialPatientId as string);
          if (cached) return cached;
        }
        throw cause;
      }
    },
    enabled: Boolean(initialPatientId)
  });

  const catalogs = useQuery({ queryKey: ['catalogs'], queryFn: api.catalogs });

  useEffect(() => {
    if (patientQuery.data?.patient) setPatient(patientQuery.data.patient);
  }, [patientQuery.data]);

  useEffect(() => {
    if (!professionalId && catalogs.data?.professionals.length) {
      setProfessionalId(user?.professionalId ?? catalogs.data.professionals[0].id);
    }
  }, [professionalId, catalogs.data, user?.professionalId]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        patientId: patient?.id,
        professionalId: professionalId || undefined,
        consultationType,
        consultedAt: dateTimeToIso(date, time),
        reason,
        notes
      };
      try {
        return await api.consultations.create(payload);
      } catch (cause) {
        if (!isNetworkUnavailable(cause) || !patient || !user) throw cause;
        const local = createOfflineConsultation(patient, user, payload);
        await saveOfflineConsultation(user.id, local, { pending: true });
        await registerOfflineConsultationSync();
        return { consultation: local, offlineCreated: true as const };
      }
    },
    onSuccess: (response) => navigate(`/consultas/${response.consultation.id}`),
    onError: (cause) => setError(cause instanceof ApiError ? cause.message : 'No se pudo iniciar la consulta')
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!patient) {
      setError('Selecciona un paciente para comenzar');
      return;
    }
    if (!reason.trim()) {
      setError('Escribe el motivo de consulta');
      return;
    }
    mutation.mutate();
  }

  const age = patient ? ageFromBirthDate(patient.birthDate) : null;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="focus-ring inline-flex items-center gap-2 rounded-lg text-xs font-bold text-ink/45 transition hover:text-teal-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <PageHeader
        eyebrow="Nueva atención"
        title="Abrir consulta"
        description="La consulta se crea como borrador. Podrás completar la nota clínica, las órdenes de estudio y la receta antes de firmarla."
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <form id="new-consultation" className="card space-y-5 p-5 sm:p-6" onSubmit={onSubmit}>
          <div className="flex items-center gap-3 border-b border-line/60 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
              <ClipboardPlus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-ink/45">Datos de la atención</h2>
              <p className="mt-0.5 text-sm text-ink/50">Paciente, profesional y motivo principal.</p>
            </div>
          </div>

          <Field label="Paciente" required>
            <PatientPicker value={patient} onChange={setPatient} autoFocus={!initialPatientId} />
          </Field>

          {patientQuery.isLoading && initialPatientId ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-ink/40">
              <Spinner className="h-4 w-4" /> Cargando paciente…
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Profesional">
              <Select value={professionalId} onChange={(event) => setProfessionalId(event.target.value)}>
                <option value="">Asignar automáticamente</option>
                {catalogs.data?.professionals.map((professional) => (
                  <option key={professional.id} value={professional.id}>
                    {professional.full_name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tipo de atención">
              <Select value={consultationType} onChange={(event) => setConsultationType(event.target.value)}>
                <option value="consulta">Consulta</option>
                <option value="evolucion">Evolución</option>
                <option value="interconsulta">Interconsulta</option>
                <option value="procedimiento">Procedimiento</option>
                <option value="otro">Otro</option>
              </Select>
            </Field>
          </div>

          <Field label="Motivo de consulta" required hint="Este campo es obligatorio para poder firmar.">
            <Input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Ej. Control de hipertensión arterial"
              maxLength={500}
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fecha">
              <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
            </Field>
            <Field label="Hora">
              <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
            </Field>
          </div>

          <Field label="Notas iniciales" hint="Opcional. Puedes continuar en el editor de la consulta.">
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Información breve para iniciar la atención…"
              className="min-h-24"
              maxLength={3000}
            />
          </Field>

          <div className="flex flex-col-reverse gap-2 border-t border-line/60 pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={mutation.isPending}
              disabled={Boolean(initialPatientId) && patientQuery.isLoading}
              icon={<Stethoscope className="h-4 w-4" />}
            >
              Abrir consulta
            </Button>
          </div>
        </form>

        <aside className="space-y-4">
          {patient ? (
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <Avatar name={patient.fullName} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-ink">{patient.fullName}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-ink/40">
                    {patient.recordNumber} · {patientDocument(patient)}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-ink/40">
                    {age !== null ? `${age} años` : 'Edad no registrada'}
                  </p>
                </div>
              </div>
              {patient.allergiesNotes ? (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em]">Alergias</p>
                    <p className="mt-0.5 text-xs font-bold">{patient.allergiesNotes}</p>
                  </div>
                </div>
              ) : null}
              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => navigate(`/pacientes/${patient.id}`)}
                icon={<UserRound className="h-4 w-4" />}
              >
                Ver expediente
              </Button>
            </div>
          ) : (
            <div className="card p-5">
              <div className="empty-illustration">
                <UserRound className="h-7 w-7" />
              </div>
              <p className="mt-4 text-sm font-extrabold text-ink">Selecciona un paciente</p>
              <p className="mt-1 text-xs leading-relaxed text-ink/45">
                Verás aquí su edad, documento y alergias antes de comenzar.
              </p>
            </div>
          )}

          <div className="card p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-700" />
              <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-ink/45">Flujo de consulta</h2>
            </div>
            <ul className="mt-4 space-y-3 text-xs text-ink/55">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                <span>La consulta se guarda como borrador editable.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                <span>Firma para inmovilizar la nota y cerrar la cita.</span>
              </li>
            </ul>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-canvas px-3 py-2.5 text-[11px] font-semibold text-ink/45">
              <FileText className="h-3.5 w-3.5" />
              Todo queda en la historia del paciente.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
