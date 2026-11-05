import { useEffect, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  HeartPulse,
  Lock,
  Plus,
  Printer,
  Save,
  Search,
  ShieldCheck,
  Stethoscope,
  Trash2,
  X
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import {
  Avatar,
  Badge,
  Button,
  ErrorState,
  Field,
  Input,
  Modal,
  Select,
  SkeletonRows,
  Spinner,
  Textarea
} from '../components/ui';
import { api, ApiError } from '../lib/data';
import {
  ageFromBirthDate,
  consultationStatusLabel,
  formatDate,
  formatDateTime,
  sexLabel,
  statusBadgeClass
} from '../lib/format';
import type { Consultation } from '../types';

interface ConsultationForm {
  reason: string;
  currentIllness: string;
  physicalExam: string;
  functionalExam: string;
  studies: string;
  diagnosisNotes: string;
  treatmentPlan: string;
  evolution: string;
  plan: string;
  notes: string;
  vitals: Record<string, string>;
}

interface PrescriptionItem {
  medication: string;
  presentation: string;
  dose: string;
  frequency: string;
  duration: string;
  quantity: string;
  instructions: string;
}

const emptyPrescriptionItem = (): PrescriptionItem => ({ medication: '', presentation: '', dose: '', frequency: '', duration: '', quantity: '', instructions: '' });

const vitalFields = [
  { key: 'pa', label: 'PA', placeholder: '120/80', unit: 'mmHg' },
  { key: 'fc', label: 'FC', placeholder: '72', unit: 'lpm' },
  { key: 'fr', label: 'FR', placeholder: '16', unit: 'rpm' },
  { key: 'temp', label: 'Temp.', placeholder: '36.5', unit: '°C' },
  { key: 'spo2', label: 'SpO₂', placeholder: '98', unit: '%' },
  { key: 'peso', label: 'Peso', placeholder: '70', unit: 'kg' },
  { key: 'talla', label: 'Talla', placeholder: '170', unit: 'cm' },
  { key: 'glucosa', label: 'Glucosa', placeholder: '110', unit: 'mg/dL' }
];

const diagnosisTypes = [
  { value: 'principal', label: 'Principal' },
  { value: 'secundario', label: 'Secundario' },
  { value: 'presuntivo', label: 'Presuntivo' },
  { value: 'diferencial', label: 'Diferencial' }
];

function toForm(consultation: Consultation): ConsultationForm {
  return {
    reason: consultation.reason ?? '',
    currentIllness: consultation.currentIllness ?? '',
    physicalExam: consultation.physicalExam ?? '',
    functionalExam: consultation.functionalExam ?? '',
    studies: consultation.studies ?? '',
    diagnosisNotes: consultation.diagnosisNotes ?? '',
    treatmentPlan: consultation.treatmentPlan ?? '',
    evolution: consultation.evolution ?? '',
    plan: consultation.plan ?? '',
    notes: consultation.notes ?? '',
    vitals: Object.fromEntries(
      Object.entries(consultation.vitals ?? {}).map(([key, value]) => [key, String(value ?? '')])
    )
  };
}

function toDateInput(value: string | null) {
  return value ? value.slice(0, 10) : '';
}

export function ConsultationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const timezone = user?.timezone ?? 'America/Managua';

  const [form, setForm] = useState<ConsultationForm | null>(null);
  const [nextVisitAt, setNextVisitAt] = useState('');
  const [savedSnapshot, setSavedSnapshot] = useState('');
  const [savedNextVisit, setSavedNextVisit] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [justSigned, setJustSigned] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signOpen, setSignOpen] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);
  const [dxQuery, setDxQuery] = useState('');
  const [dxType, setDxType] = useState('principal');
  const [dxError, setDxError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'evolution' | 'studies' | 'prescription'>('evolution');
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([emptyPrescriptionItem()]);

  const detail = useQuery({
    queryKey: ['consultation', id],
    queryFn: () => api.consultations.get(id as string),
    enabled: Boolean(id)
  });

  const cie = useQuery({
    queryKey: ['cie10', dxQuery],
    queryFn: () => api.cie10.search(dxQuery.trim()),
    enabled: !justSigned && dxQuery.trim().length >= 2
  });

  useEffect(() => {
    if (!detail.data || initialized) return;
    const nextForm = toForm(detail.data.consultation);
    const nextDate = toDateInput(detail.data.consultation.nextVisitAt);
    setForm(nextForm);
    setNextVisitAt(nextDate);
    setSavedSnapshot(JSON.stringify(nextForm));
    setSavedNextVisit(nextDate);
    setInitialized(true);
  }, [detail.data, initialized]);

  const currentDiagnoses = detail.data?.diagnoses ?? [];
  const hasPrincipal = currentDiagnoses.some((diagnosis) => diagnosis.type === 'principal');
  const existingCodes = new Set(currentDiagnoses.map((diagnosis) => diagnosis.code));
  const isDirty = form !== null && (JSON.stringify(form) !== savedSnapshot || nextVisitAt !== savedNextVisit);

  const buildPayload = () => ({
    ...(form ?? {}),
    nextVisitAt: nextVisitAt ? `${nextVisitAt}T12:00:00.000Z` : null
  });

  const saveMutation = useMutation({
    mutationFn: () => api.consultations.update(id as string, buildPayload()),
    onSuccess: () => {
      setSavedSnapshot(JSON.stringify(form));
      setSavedNextVisit(nextVisitAt);
      setSaveMessage('Guardado');
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['consultation', id] });
      void queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
    onError: (cause) => setError(cause instanceof ApiError ? cause.message : 'No se pudo guardar la consulta')
  });

  const signMutation = useMutation({
    mutationFn: async () => {
      if (isDirty) await api.consultations.update(id as string, buildPayload());
      return api.consultations.sign(id as string);
    },
    onSuccess: () => {
      setJustSigned(true);
      setSignOpen(false);
      setSignError(null);
      setSaveMessage('Consulta firmada');
      void queryClient.invalidateQueries({ queryKey: ['consultation', id] });
      void queryClient.invalidateQueries({ queryKey: ['consultations'] });
      void queryClient.invalidateQueries({ queryKey: ['patient'] });
      void queryClient.invalidateQueries({ queryKey: ['agenda'] });
    },
    onError: (cause) => setSignError(cause instanceof ApiError ? cause.message : 'No se pudo firmar la consulta')
  });

  const addDiagnosis = useMutation({
    mutationFn: (code: string) =>
      api.consultations.addDiagnosis(id as string, {
        code,
        type: dxType === 'principal' && hasPrincipal ? 'secundario' : dxType
      }),
    onSuccess: () => {
      setDxQuery('');
      setDxError(null);
      void queryClient.invalidateQueries({ queryKey: ['consultation', id] });
    },
    onError: (cause) => setDxError(cause instanceof ApiError ? cause.message : 'No se pudo agregar el diagnóstico')
  });

  const deleteDiagnosis = useMutation({
    mutationFn: (diagnosisId: string) => api.consultations.deleteDiagnosis(id as string, diagnosisId),
    onSuccess: () => {
      setDxError(null);
      void queryClient.invalidateQueries({ queryKey: ['consultation', id] });
    },
    onError: (cause) => setDxError(cause instanceof ApiError ? cause.message : 'No se pudo quitar el diagnóstico')
  });

  if (detail.isLoading || (!detail.isError && !initialized)) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-5 w-28" />
        <div className="skeleton h-24 w-full rounded-3xl" />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SkeletonRows rows={5} />
          <SkeletonRows rows={3} />
        </div>
      </div>
    );
  }

  if (detail.isError || !detail.data || !form) {
    return (
      <ErrorState
        message={detail.error instanceof Error ? detail.error.message : 'No encontramos la consulta'}
        onRetry={() => void detail.refetch()}
      />
    );
  }

  const { consultation, diagnoses } = detail.data;
  const readOnly = justSigned || consultation.status !== 'borrador';
  const age = ageFromBirthDate(consultation.birthDate);
  const localCanSign = !readOnly && Boolean(form.reason.trim()) && diagnoses.length > 0;

  function update<K extends keyof ConsultationForm>(key: K, value: ConsultationForm[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setSaveMessage(null);
    setError(null);
  }

  function updateVital(key: string, value: string) {
    setForm((current) =>
      current ? { ...current, vitals: { ...current.vitals, [key]: value } } : current
    );
    setSaveMessage(null);
  }

  function requestSign() {
    setSignError(null);
    if (!form || !form.reason.trim()) {
      setError('Agrega el motivo de consulta antes de firmar');
      return;
    }
    if (diagnoses.length === 0) {
      setError('Agrega al menos un diagnóstico CIE-10 antes de firmar');
      return;
    }
    setSignOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/consultas')}
          className="focus-ring inline-flex items-center gap-2 rounded-lg text-xs font-bold text-ink/45 transition hover:text-teal-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a consultas
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => { setActiveSection('prescription'); window.setTimeout(() => window.print(), 50); }} icon={<Printer className="h-4 w-4" />}>Imprimir receta</Button>
          {!readOnly ? (
            isDirty ? (
              <Badge className="badge-amber" dot>
                Sin guardar
              </Badge>
            ) : (
              <Badge className="badge-teal" dot>
                {saveMessage || 'Guardado'}
              </Badge>
            )
          ) : null}
          <Button variant="secondary" onClick={() => window.print()} icon={<Printer className="h-4 w-4" />}>
            Imprimir
          </Button>
          {!readOnly ? (
            <>
              <Button
                variant="secondary"
                icon={saveMessage === 'Guardado' && !isDirty ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                loading={saveMutation.isPending}
                disabled={!isDirty}
                onClick={() => saveMutation.mutate()}
              >
                Guardar
              </Button>
              <Button
                icon={<ClipboardCheck className="h-4 w-4" />}
                disabled={!localCanSign}
                onClick={requestSign}
              >
                Firmar consulta
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {readOnly ? (
        <div className="flex items-start gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-teal-900">
          <Lock className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-extrabold">Consulta firmada e inmutable</p>
            <p className="mt-0.5 text-xs">
              Firmada {consultation.signedAt ? formatDateTime(consultation.signedAt, timezone) : ''} por{' '}
              {consultation.professionalName}. Para corregir, crea una nueva evolución.
            </p>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="no-print rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow mb-1.5">
            Consulta clínica · {formatDate(consultation.consultedAt, timezone, { weekday: 'long' })}
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              {consultation.patientName}
            </h1>
            <Badge className={statusBadgeClass(readOnly ? 'firmada' : consultation.status)} dot>
              {readOnly ? 'Firmada' : consultationStatusLabel(consultation.status)}
            </Badge>
          </div>
          <p className="mt-1.5 text-sm text-ink/55">
            {consultation.recordNumber} · {consultation.professionalName} ·{' '}
            {formatDate(consultation.consultedAt, timezone, { weekday: 'long' })}
          </p>
        </div>
      </header>

      <nav className="no-print flex flex-wrap gap-2 rounded-2xl border border-line/70 bg-white p-2" aria-label="Secciones de consulta">
        {([['evolution', 'Evolución / Nota médica'], ['studies', 'Estudios clínicos'], ['prescription', 'Receta de medicamentos']] as const).map(([key, label]) => (
          <button key={key} type="button" onClick={() => setActiveSection(key)} className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${activeSection === key ? 'bg-teal-700 text-white' : 'text-ink/55 hover:bg-canvas'}`}>{label}</button>
        ))}
      </nav>

      {activeSection === 'prescription' ? (
        <section className="prescription-print card p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div><p className="text-xs font-extrabold uppercase tracking-widest text-teal-700">Récipe médico</p><h2 className="mt-1 text-xl font-extrabold">{consultation.professionalName}</h2><p className="text-xs text-ink/55">{consultation.patientName} · {consultation.recordNumber}</p></div>
            <Button className="no-print" variant="secondary" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Imprimir receta</Button>
          </div>
          <p className="mb-4 text-xs text-ink/50">Fecha: {formatDate(consultation.consultedAt, timezone)}{consultation.specialtyId ? ` · Especialidad registrada` : ''}</p>
          <div className="space-y-3">
            {prescriptionItems.map((item, index) => <div key={index} className="grid gap-3 rounded-xl border border-line/70 p-4 sm:grid-cols-2">
              <Field label={`Medicamento ${index + 1}`}><Input value={item.medication} readOnly={readOnly} placeholder="Nombre del medicamento" onChange={e => setPrescriptionItems(rows => rows.map((row, i) => i === index ? {...row, medication: e.target.value} : row))} /></Field>
              <Field label="Presentación"><Input value={item.presentation} readOnly={readOnly} placeholder="Tabletas, solución…" onChange={e => setPrescriptionItems(rows => rows.map((row, i) => i === index ? {...row, presentation: e.target.value} : row))} /></Field>
              <Field label="Dosis"><Input value={item.dose} readOnly={readOnly} placeholder="Dosis" onChange={e => setPrescriptionItems(rows => rows.map((row, i) => i === index ? {...row, dose: e.target.value} : row))} /></Field>
              <Field label="Frecuencia y vía"><Input value={item.frequency} readOnly={readOnly} placeholder="Cada 8 horas · vía oral" onChange={e => setPrescriptionItems(rows => rows.map((row, i) => i === index ? {...row, frequency: e.target.value} : row))} /></Field>
              <Field label="Duración"><Input value={item.duration} readOnly={readOnly} placeholder="Ej. 7 días" onChange={e => setPrescriptionItems(rows => rows.map((row, i) => i === index ? {...row, duration: e.target.value} : row))} /></Field>
              <Field label="Cantidad"><Input value={item.quantity} readOnly={readOnly} placeholder="Cantidad" onChange={e => setPrescriptionItems(rows => rows.map((row, i) => i === index ? {...row, quantity: e.target.value} : row))} /></Field>
              <div className="sm:col-span-2"><Field label="Indicaciones"><Textarea value={item.instructions} readOnly={readOnly} placeholder="Indicaciones para el paciente" onChange={e => setPrescriptionItems(rows => rows.map((row, i) => i === index ? {...row, instructions: e.target.value} : row))} /></Field></div>
            </div>)}
          </div>
          {!readOnly && <Button className="no-print mt-4" variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={() => setPrescriptionItems(rows => [...rows, emptyPrescriptionItem()])}>Agregar medicamento</Button>}
          <div className="mt-12 grid grid-cols-2 gap-12 text-center text-xs"><div className="border-t border-ink/40 pt-2">Firma y sello del médico<br/>{consultation.professionalName}</div><div className="border-t border-ink/40 pt-2">Paciente<br/>{consultation.patientName}</div></div>
        </section>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_370px]">
        <div className={`space-y-5 ${activeSection === 'prescription' ? 'hidden' : ''}`}>
          {activeSection === 'evolution' ? <>
          <section className="card p-5 sm:p-6">
            <SectionHeading
              icon={<Stethoscope className="h-4 w-4" />}
              title="Motivo y enfermedad actual"
              description="El relato que explica la consulta de hoy."
            />
            <div className="mt-5 space-y-4">
              <Field label="Motivo de consulta" required>
                <Input
                  value={form.reason}
                  onChange={(event) => update('reason', event.target.value)}
                  readOnly={readOnly}
                  placeholder="Ej. Dolor torácico de dos días de evolución"
                  maxLength={500}
                />
              </Field>
              <Field label="Enfermedad actual">
                <Textarea
                  value={form.currentIllness}
                  onChange={(event) => update('currentIllness', event.target.value)}
                  readOnly={readOnly}
                  placeholder="Inicio, curso, síntomas asociados, tratamientos previos…"
                  className="min-h-32"
                  maxLength={6000}
                />
              </Field>
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <SectionHeading icon={<HeartPulse className="h-4 w-4" />} title="Signos vitales" description="Registra los valores medidos durante la atención." />
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{vitalFields.map(vital => <label key={vital.key} className="rounded-xl border border-line/70 bg-canvas/40 p-3"><span className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.1em] text-ink/35">{vital.label}<span>{vital.unit}</span></span><input value={form.vitals[vital.key] ?? ''} onChange={event => updateVital(vital.key, event.target.value)} readOnly={readOnly} placeholder={vital.placeholder} className="mt-1 w-full border-0 bg-transparent p-0 text-lg font-extrabold text-ink outline-none" /></label>)}</div>
          </section>
          <section className="card p-5 sm:p-6">
            <SectionHeading
              icon={<FileText className="h-4 w-4" />}
              title="Examen clínico"
              description="Hallazgos físicos y funcionales relevantes."
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Examen físico">
                <Textarea
                  value={form.physicalExam}
                  onChange={(event) => update('physicalExam', event.target.value)}
                  readOnly={readOnly}
                  placeholder="Hallazgos por sistemas…"
                  className="min-h-36"
                  maxLength={6000}
                />
              </Field>
              <Field label="Examen funcional">
                <Textarea
                  value={form.functionalExam}
                  onChange={(event) => update('functionalExam', event.target.value)}
                  readOnly={readOnly}
                  placeholder="Movilidad, estado mental, dolor…"
                  className="min-h-36"
                  maxLength={4000}
                />
              </Field>
            </div>
          </section>

          </> : null}

          {activeSection === 'studies' ? <section className="card p-5 sm:p-6">
            <SectionHeading
              icon={<Search className="h-4 w-4" />}
              title="Estudios y análisis"
              description="Resultados disponibles y notas para el diagnóstico."
            />
            <div className="mt-5 space-y-4">
              <Field label="Estudios complementarios">
                <Textarea
                  value={form.studies}
                  onChange={(event) => update('studies', event.target.value)}
                  readOnly={readOnly}
                  placeholder="Laboratorios, imágenes, electrocardiograma…"
                  className="min-h-24"
                  maxLength={4000}
                />
              </Field>
              <Field label="Notas de diagnóstico">
                <Textarea
                  value={form.diagnosisNotes}
                  onChange={(event) => update('diagnosisNotes', event.target.value)}
                  readOnly={readOnly}
                  placeholder="Razonamiento clínico y diagnósticos diferenciales…"
                  className="min-h-24"
                  maxLength={4000}
                />
              </Field>
            </div>
          </section> : null}

          {activeSection === 'evolution' ? <>
          <section className="card p-5 sm:p-6">
            <SectionHeading
              icon={<ClipboardCheck className="h-4 w-4" />}
              title="Plan y evolución"
              description="Tratamiento, indicaciones y seguimiento."
            />
            <div className="mt-5 space-y-4">
              <Field label="Plan de tratamiento">
                <Textarea
                  value={form.treatmentPlan}
                  onChange={(event) => update('treatmentPlan', event.target.value)}
                  readOnly={readOnly}
                  placeholder="Medicamentos, dosis, indicaciones no farmacológicas…"
                  className="min-h-36"
                  maxLength={6000}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Evolución">
                  <Textarea
                    value={form.evolution}
                    onChange={(event) => update('evolution', event.target.value)}
                    readOnly={readOnly}
                    placeholder="Respuesta al tratamiento y cambios…"
                    className="min-h-28"
                    maxLength={6000}
                  />
                </Field>
                <Field label="Plan / seguimiento">
                  <Textarea
                    value={form.plan}
                    onChange={(event) => update('plan', event.target.value)}
                    readOnly={readOnly}
                    placeholder="Próximos pasos y signos de alarma…"
                    className="min-h-28"
                    maxLength={4000}
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Próxima visita">
                  <Input
                    type="date"
                    value={nextVisitAt}
                    onChange={(event) => {
                      setNextVisitAt(event.target.value);
                      setSaveMessage(null);
                    }}
                    readOnly={readOnly}
                  />
                </Field>
                <Field label="Notas internas" hint="No se muestran en la impresión clínica.">
                  <Input
                    value={form.notes}
                    onChange={(event) => update('notes', event.target.value)}
                    readOnly={readOnly}
                    placeholder="Recordatorios administrativos…"
                    maxLength={3000}
                  />
                </Field>
              </div>
            </div>
          </section>
          </> : null}
        </div>

        <aside className="no-print space-y-4 xl:sticky xl:top-24 xl:self-start">
          <section className="card p-5">
            <div className="flex items-center gap-3">
              <Avatar name={consultation.patientName} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-ink">{consultation.patientName}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-ink/40">{consultation.recordNumber}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-ink/40">
                  {age !== null ? `${age} años` : 'Edad no registrada'} · {sexLabel(consultation.sex)}
                </p>
              </div>
            </div>
            {consultation.allergiesNotes ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em]">Alergias</p>
                  <p className="mt-0.5 text-xs font-bold">{consultation.allergiesNotes}</p>
                </div>
              </div>
            ) : null}
            <Button
              variant="secondary"
              className="mt-4 w-full"
              icon={<FileText className="h-4 w-4" />}
              onClick={() => navigate(`/pacientes/${consultation.patientId}`)}
            >
              Ver expediente
            </Button>
          </section>

          <section className="card overflow-hidden">
            <div className="border-b border-line/70 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-ink/45">Diagnósticos</h2>
                  <p className="mt-1 text-[11px] font-semibold text-ink/40">CIE-10 · {diagnoses.length} registrados</p>
                </div>
                <Badge className="badge-slate">{diagnoses.length}</Badge>
              </div>
            </div>

            <div className="space-y-2.5 p-4">
              {diagnoses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line px-3 py-6 text-center">
                  <Search className="mx-auto h-5 w-5 text-ink/20" />
                  <p className="mt-2 text-xs font-bold text-ink/45">Sin diagnósticos</p>
                  <p className="mt-0.5 text-[10px] text-ink/35">Busca por código o descripción.</p>
                </div>
              ) : (
                diagnoses.map((diagnosis) => (
                  <div key={diagnosis.id} className="rounded-xl border border-line/70 bg-canvas/40 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-teal-800 ring-1 ring-inset ring-line">
                            {diagnosis.code}
                          </span>
                          <Badge className={diagnosis.type === 'principal' ? 'badge-teal' : 'badge-slate'}>
                            {diagnosis.type}
                          </Badge>
                        </div>
                        <p className="mt-1.5 text-xs font-bold leading-snug text-ink/70">{diagnosis.description}</p>
                      </div>
                      {!readOnly ? (
                        <button
                          type="button"
                          onClick={() => deleteDiagnosis.mutate(diagnosis.id)}
                          disabled={deleteDiagnosis.isPending && deleteDiagnosis.variables === diagnosis.id}
                          className="focus-ring shrink-0 rounded-lg p-1.5 text-ink/25 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          aria-label={`Quitar ${diagnosis.code}`}
                        >
                          {deleteDiagnosis.isPending && deleteDiagnosis.variables === diagnosis.id ? (
                            <Spinner className="h-3.5 w-3.5" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}

              {!readOnly ? (
                <div className="pt-1">
                  <div className="flex gap-2">
                    <Select
                      value={dxType}
                      onChange={(event) => setDxType(event.target.value)}
                      className="h-9 w-32 py-1 text-xs"
                    >
                      {diagnosisTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/30" />
                      <Input
                        value={dxQuery}
                        onChange={(event) => setDxQuery(event.target.value)}
                        placeholder="Buscar CIE-10…"
                        className="h-9 py-1 pl-8 pr-8 text-xs"
                      />
                      {dxQuery ? (
                        <button
                          type="button"
                          onClick={() => setDxQuery('')}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink/30 hover:text-ink"
                          aria-label="Limpiar búsqueda"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {dxQuery.trim().length >= 2 ? (
                    <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-line bg-white shadow-sm">
                      {cie.isLoading ? (
                        <div className="flex items-center justify-center gap-2 px-3 py-4 text-xs font-semibold text-ink/40">
                          <Spinner className="h-4 w-4" /> Buscando…
                        </div>
                      ) : cie.data?.codes.length ? (
                        cie.data.codes.map((code) => {
                          const added = existingCodes.has(code.code);
                          return (
                            <button
                              key={code.code}
                              type="button"
                              disabled={added || addDiagnosis.isPending}
                              onClick={() => addDiagnosis.mutate(code.code)}
                              className="flex w-full items-start gap-2 border-b border-line/50 px-3 py-2.5 text-left transition last:border-0 hover:bg-teal-50/50 disabled:opacity-45"
                            >
                              <span className="mt-0.5 rounded bg-canvas px-1.5 py-0.5 text-[10px] font-extrabold text-ink/60">
                                {code.code}
                              </span>
                              <span className="min-w-0 flex-1 text-[11px] font-semibold leading-snug text-ink/65">
                                {code.description}
                              </span>
                              {added ? (
                                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                              ) : (
                                <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/30" />
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <p className="px-3 py-4 text-center text-xs text-ink/40">Sin coincidencias en CIE-10.</p>
                      )}
                    </div>
                  ) : null}
                  {dxError ? <p className="mt-2 text-[11px] font-semibold text-red-600">{dxError}</p> : null}
                </div>
              ) : null}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-700" />
              <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-ink/45">
                {readOnly ? 'Firma clínica' : 'Cierre de consulta'}
              </h2>
            </div>

            {readOnly ? (
              <div className="mt-4 rounded-xl bg-teal-50 p-4">
                <div className="flex items-center gap-2 text-teal-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <p className="text-xs font-extrabold">Consulta firmada</p>
                </div>
                <p className="mt-1.5 text-[11px] font-semibold text-teal-800/60">
                  {consultation.signedAt ? formatDateTime(consultation.signedAt, timezone) : ''}
                </p>
              </div>
            ) : (
              <>
                <ul className="mt-4 space-y-2 text-[11px] font-semibold">
                  <li className={form.reason.trim() ? 'flex items-center gap-2 text-teal-700' : 'flex items-center gap-2 text-ink/40'}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Motivo de consulta
                  </li>
                  <li className={diagnoses.length ? 'flex items-center gap-2 text-teal-700' : 'flex items-center gap-2 text-ink/40'}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Al menos un diagnóstico
                  </li>
                  <li className="flex items-center gap-2 text-ink/40">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Guardado automático al firmar
                  </li>
                </ul>
                <Button
                  className="mt-4 w-full"
                  icon={<ClipboardCheck className="h-4 w-4" />}
                  disabled={!localCanSign}
                  onClick={requestSign}
                >
                  Firmar consulta
                </Button>
                <p className="mt-2 text-center text-[10px] leading-relaxed text-ink/35">
                  Al firmar, la nota queda inmutable y la cita se marca como atendida.
                </p>
              </>
            )}
          </section>
        </aside>
      </div>

      <Modal
        open={signOpen}
        onClose={() => setSignOpen(false)}
        title="Firmar consulta"
        description="La nota quedará inmutable y la cita asociada se marcará como atendida."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSignOpen(false)}>
              Cancelar
            </Button>
            <Button
              loading={signMutation.isPending}
              icon={<CheckCircle2 className="h-4 w-4" />}
              onClick={() => signMutation.mutate()}
            >
              Firmar ahora
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-line/70 bg-canvas/50 p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/35">Paciente</p>
            <p className="mt-1 text-sm font-extrabold text-ink">{consultation.patientName}</p>
            <p className="mt-1 text-xs font-semibold text-ink/45">{form.reason || 'Sin motivo registrado'}</p>
          </div>
          <div className="rounded-xl border border-line/70 p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/35">Diagnósticos</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {diagnoses.map((diagnosis) => (
                <Badge key={diagnosis.id} className="badge-teal">
                  {diagnosis.code}
                </Badge>
              ))}
            </div>
          </div>
          {isDirty ? (
            <p className="text-xs font-semibold text-amber-700">
              Se guardarán los cambios pendientes antes de firmar.
            </p>
          ) : null}
          {signError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {signError}
            </p>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  description
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-line/60 pb-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
        {icon}
      </span>
      <div>
        <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-ink/45">{title}</h2>
        <p className="mt-0.5 text-xs text-ink/40">{description}</p>
      </div>
    </div>
  );
}




