import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Mail,
  Lock,
  Printer,
  Save,
  Search,
  ShieldCheck,
  Stethoscope,
  Trash2
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
  SkeletonRows,
  Textarea
} from '../components/ui';
import { api, ApiError } from '../lib/data';
import {
  buildEvolutionEmailBody,
  buildMailtoUrl,
  buildPrescriptionEmailBody
} from '../lib/clinical-email';
import { openClinicalPrintWindow, openPrescriptionPrintWindow, renderClinicalTextPrint, renderPrescriptionPrint } from '../lib/prescription-print';
import { printConsultation } from '../lib/consultation-print';
import { getOfflineConsultation, isNetworkUnavailable, registerOfflineConsultationSync, saveOfflineConsultation } from '../lib/offline-consultations';
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
  evolutionText: string;
  studiesText: string;
  prescriptionText: string;
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

function toForm(consultation: Consultation): ConsultationForm {
  return {
    reason: consultation.reason ?? '',
    evolutionText: consultation.evolutionText ?? [consultation.reason, consultation.currentIllness, consultation.physicalExam, consultation.functionalExam, consultation.diagnosisNotes, consultation.treatmentPlan, consultation.evolution, consultation.plan].filter(Boolean).join('\n\n'),
    studiesText: consultation.studiesText ?? consultation.studies ?? '',
    prescriptionText: consultation.prescriptionText ?? consultation.prescriptionItems?.map((item) => [item.medication, item.presentation, item.dose, item.frequency, item.route, item.duration, item.quantity, item.instructions].filter(Boolean).join(' · ')).filter(Boolean).join('\n') ?? [consultation.plan, consultation.treatmentPlan].filter(Boolean).join('\n\n'),
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
  const location = useLocation();
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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingHistorical, setEditingHistorical] = useState(() => Boolean((location.state as { startInEdit?: boolean } | null)?.startInEdit));
  const [activeSection, setActiveSection] = useState<'evolution' | 'studies' | 'prescription'>('evolution');
  const [emailDialog, setEmailDialog] = useState<'evolution' | 'prescription' | null>(null);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const detail = useQuery({
    queryKey: ['consultation', id],
    queryFn: async () => {
      const ownerId = user?.id;
      if (id?.startsWith('local-')) {
        const consultation = ownerId ? await getOfflineConsultation(ownerId, id) : null;
        if (!consultation) throw new Error('No encontramos el borrador guardado en este dispositivo.');
        return { consultation, offlineCopy: true };
      }
      if (typeof navigator !== 'undefined' && !navigator.onLine && ownerId) {
        const consultation = await getOfflineConsultation(ownerId, id as string);
        if (consultation) return { consultation, offlineCopy: true };
      }
      try {
        const response = await api.consultations.get(id as string);
        if (ownerId) void saveOfflineConsultation(ownerId, response.consultation, { pending: false }).catch(() => undefined);
        return { ...response, offlineCopy: false };
      } catch (cause) {
        if (ownerId && isNetworkUnavailable(cause)) {
          const consultation = await getOfflineConsultation(ownerId, id as string);
          if (consultation) return { consultation, offlineCopy: true };
        }
        throw cause;
      }
    },
    enabled: Boolean(id)
  });

  useEffect(() => {
    setInitialized(false);
    setForm(null);
    setNextVisitAt('');
    setSavedSnapshot('');
    setSavedNextVisit('');
  }, [id]);

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

  const isDirty = form !== null && (JSON.stringify(form) !== savedSnapshot || nextVisitAt !== savedNextVisit);

  useEffect(() => {
    if (navigator.onLine || !isDirty || !form || !detail.data || !user?.id) return;
    const timeout = window.setTimeout(() => {
      const consultation = {
        ...detail.data!.consultation,
        ...form,
        nextVisitAt: nextVisitAt ? `${nextVisitAt}T12:00:00.000Z` : null,
        updatedAt: new Date().toISOString()
      } as Consultation;
      void saveOfflineConsultation(user.id, consultation, { pending: true })
        .then(() => {
          void registerOfflineConsultationSync();
          queryClient.setQueryData(['consultation', id], { consultation, offlineCopy: true });
          setSaveMessage('Guardado en este dispositivo · pendiente de sincronización');
          setError(null);
        })
        .catch(() => setError('No se pudo guardar la copia local. Mantén esta pantalla abierta e inténtalo de nuevo.'));
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [detail.data, form, id, isDirty, nextVisitAt, queryClient, user?.id]);

  useEffect(() => {
    const onSynced = (event: Event) => {
      const completed = (event as CustomEvent<{ completed: Array<{ fromId: string; toId: string }> }>).detail?.completed ?? [];
      if (completed.some((item) => item.fromId === id || item.toId === id)) setSaveMessage('Sincronizado con la base de datos');
    };
    window.addEventListener('offline-consultations-synced', onSynced);
    return () => {
      window.removeEventListener('offline-consultations-synced', onSynced);
    };
  }, [id]);

  const buildPayload = () => ({
    ...(form ?? {}),
    nextVisitAt: nextVisitAt ? `${nextVisitAt}T12:00:00.000Z` : null,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const current = detail.data?.consultation;
      if (!current) throw new Error('La consulta aún no está disponible para guardar.');
      const saveLocally = async () => {
        if (!user?.id) throw new Error('No se encontró la sesión para proteger el borrador local.');
        const updated = { ...current, ...buildPayload(), updatedAt: new Date().toISOString() } as Consultation;
        await saveOfflineConsultation(user.id, updated, { pending: true });
        await registerOfflineConsultationSync();
        return { consultation: updated, offlineSaved: true as const };
      };
      if (id?.startsWith('local-') || !navigator.onLine) return saveLocally();
      try {
        return { ...(await api.consultations.update(id as string, buildPayload())), offlineSaved: false as const };
      } catch (cause) {
        if (isNetworkUnavailable(cause)) return saveLocally();
        throw cause;
      }
    },
    onSuccess: (response) => {
      const freshForm = toForm(response.consultation);
      const freshDate = toDateInput(response.consultation.nextVisitAt);
      setForm(freshForm);
      setNextVisitAt(freshDate);
      setSavedSnapshot(JSON.stringify(freshForm));
      setSavedNextVisit(freshDate);
      setEditingHistorical(false);
      setSaveMessage(response.offlineSaved ? 'Guardado en este dispositivo · pendiente de sincronización' : 'Guardado');
      setError(null);
      if (response.offlineSaved) {
        queryClient.setQueryData(['consultation', id], { consultation: response.consultation, offlineCopy: true });
      } else {
        if (user?.id) void saveOfflineConsultation(user.id, response.consultation, { pending: false }).catch(() => undefined);
        void queryClient.invalidateQueries({ queryKey: ['consultation', id] });
        void queryClient.invalidateQueries({ queryKey: ['consultations'] });
      }
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
      setSaveMessage('Consulta completada');
      void queryClient.invalidateQueries({ queryKey: ['consultation', id] });
      void queryClient.invalidateQueries({ queryKey: ['consultations'] });
      void queryClient.invalidateQueries({ queryKey: ['patient'] });
      void queryClient.invalidateQueries({ queryKey: ['agenda'] });
    },
    onError: (cause) => setSignError(cause instanceof ApiError ? cause.message : 'No se pudo firmar la consulta')
  });

  const deleteConsultation = useMutation({
    mutationFn: () => api.consultations.delete(id as string),
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['consultations'] }),
        queryClient.invalidateQueries({ queryKey: ['patient'] })
      ]);
      navigate(`/pacientes/${consultation.patientId}`);
    },
    onError: (cause) => setError(cause instanceof ApiError ? cause.message : 'No se pudo eliminar la consulta')
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

  const { consultation } = detail.data;
  const offlineCopy = detail.data.offlineCopy;
  const renderedForm = form;
  const readOnly = !editingHistorical && (justSigned || consultation.status !== 'borrador');
  const age = ageFromBirthDate(consultation.birthDate);
  const localCanSign = consultation.status === 'borrador' && !justSigned && Boolean(renderedForm.evolutionText.trim());

  function update<K extends keyof ConsultationForm>(key: K, value: ConsultationForm[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setSaveMessage(null);
    setError(null);
  }

  function requestSign() {
    setSignError(null);
    if (!navigator.onLine) {
      setError('La firma requiere conexión. Guarda el borrador local y se sincronizará al volver internet.');
      return;
    }
    if (!form || !renderedForm.evolutionText.trim()) {
      setError('Agrega la evolución o nota médica antes de firmar');
      return;
    }
    setSignOpen(true);
  }

  function printPrescription() {
    const target = openPrescriptionPrintWindow();
    if (!target) { setError('Permite las ventanas emergentes para imprimir la receta.'); return; }
    renderPrescriptionPrint(target, {
      clinicName: user?.clinicName ?? 'Clínica', patientName: consultation.patientName,
      recordNumber: consultation.recordNumber, consultedAt: consultation.consultedAt,
      professionalName: consultation.professionalName,
      items: [],
      legacyText: form?.prescriptionText ?? '',
      patientBirthDate: consultation.birthDate,
      nextVisitAt,
      timezone
    });
  }

  function printStudies() {
    const target = openClinicalPrintWindow();
    if (!target) { setError('Permite las ventanas emergentes para imprimir los estudios.'); return; }
    renderClinicalTextPrint(target, {
      patientName: consultation.patientName,
      consultedAt: consultation.consultedAt,
      nextVisitAt,
      timezone,
      sectionTitle: 'Estudios clínicos',
      content: renderedForm.studiesText
    });
  }

  function printFullConsultation() {
    const opened = printConsultation({ clinicName: user?.clinicName ?? 'Clínica', patientName: consultation.patientName, recordNumber: consultation.recordNumber, professionalName: consultation.professionalName, consultedAt: consultation.consultedAt, nextVisitAt, timezone, evolutionText: renderedForm.evolutionText, studiesText: renderedForm.studiesText, prescriptionText: renderedForm.prescriptionText });
    if (!opened) setError('Permite las ventanas emergentes para imprimir la consulta.');
  }

  function openEmailDraft(kind: 'evolution' | 'prescription') {
    setEmailRecipient(consultation.patientEmail ?? '');
    setEmailError(null);
    setEmailDialog(kind);
  }

  async function sendEmailDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const currentForm = form;
    if (!emailDialog || !emailRecipient.trim() || !currentForm) return;
    if (isDirty) {
      try { await saveMutation.mutateAsync(); }
      catch { setEmailError('No se pudieron guardar los cambios. Corrígelos antes de preparar el correo.'); return; }
    }
    const emailConsultation = {
      ...consultation,
      reason: currentForm.reason,
      currentIllness: currentForm.currentIllness,
      physicalExam: currentForm.physicalExam,
      functionalExam: currentForm.functionalExam,
      studies: currentForm.studies,
      diagnosisNotes: currentForm.diagnosisNotes,
      treatmentPlan: currentForm.treatmentPlan,
      evolution: currentForm.evolution,
      plan: currentForm.plan,
      notes: currentForm.notes,
      vitals: currentForm.vitals,
      nextVisitAt: nextVisitAt ? `${nextVisitAt}T12:00:00.000Z` : null
    };
    const subject = emailDialog === 'prescription'
      ? `Receta médica · ${consultation.patientName}`
      : `Nota médica · ${consultation.patientName}`;
    const body = emailDialog === 'prescription'
      ? buildPrescriptionEmailBody({
        clinicName: user?.clinicName ?? 'Clínica',
        consultation: emailConsultation,
        items: [],
        legacyText: currentForm.prescriptionText,
        timezone
      })
      : buildEvolutionEmailBody({
        clinicName: user?.clinicName ?? 'Clínica',
        consultation: emailConsultation,
        timezone
      });
    window.location.href = buildMailtoUrl({ to: emailRecipient, subject, body });
    setEmailDialog(null);
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(`/pacientes/${consultation.patientId}`)}
          className="focus-ring inline-flex items-center gap-2 rounded-lg text-xs font-bold text-ink/45 transition hover:text-teal-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al expediente
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={printPrescription} icon={<Printer className="h-4 w-4" />}>Imprimir receta</Button>
          <Button variant="secondary" onClick={printStudies} icon={<Printer className="h-4 w-4" />}>Imprimir estudios</Button>
          <Button variant="secondary" onClick={printFullConsultation} icon={<Printer className="h-4 w-4" />}>Imprimir consulta completa</Button>
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
          {readOnly ? <Button variant="secondary" onClick={() => { setEditingHistorical(true); setError(null); }} icon={<Save className="h-4 w-4" />}>Editar consulta</Button> : null}
          {editingHistorical ? <Button variant="ghost" onClick={() => { const original = toForm(consultation); const originalDate = toDateInput(consultation.nextVisitAt); setForm(original); setNextVisitAt(originalDate); setSavedSnapshot(JSON.stringify(original)); setSavedNextVisit(originalDate); setEditingHistorical(false); setError(null); }}>Cancelar edición</Button> : null}
          <Button variant="danger" onClick={() => setDeleteOpen(true)} icon={<Trash2 className="h-4 w-4" />}>Eliminar consulta</Button>
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
            <p className="text-sm font-extrabold">Consulta completada e inmutable</p>
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

      {offlineCopy || saveMessage?.includes('pendiente de sincronización') ? (
        <div className="no-print rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
          <p className="font-bold">Modo sin conexión</p>
          <p className="mt-1 text-xs leading-relaxed">Los cambios se guardan cifrados en este dispositivo y se enviarán a la base de datos cuando vuelva la conexión. Mantén tu sesión abierta hasta ver “Sincronizado con la base de datos”.</p>
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
            <Badge className={statusBadgeClass(consultation.status)} dot>
              {consultationStatusLabel(consultation.status)}
            </Badge>
          </div>
          <p className="mt-1.5 text-sm text-ink/55">
            {consultation.recordNumber} · {consultation.professionalName} ·{' '}
            {formatDate(consultation.consultedAt, timezone, { weekday: 'long' })}
          </p>
        </div>
      </header>

      <nav className={`${readOnly ? 'hidden ' : ''}no-print flex flex-wrap gap-2 rounded-2xl border border-line/70 bg-white p-2`} aria-label="Secciones de consulta">
        {([['evolution', 'Evolución / Nota médica'], ['studies', 'Estudios clínicos'], ['prescription', 'Receta de medicamentos']] as const).map(([key, label]) => (
          <button key={key} type="button" onClick={() => setActiveSection(key)} className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${activeSection === key ? 'bg-teal-700 text-white' : 'text-ink/55 hover:bg-canvas'}`}>{label}</button>
        ))}
      </nav>

      {readOnly ? (
        <section className="clinical-sheet space-y-5">
          {[['Evolución / Nota médica', renderedForm.evolutionText], ['Estudios clínicos', renderedForm.studiesText], ['Receta de medicamentos', renderedForm.prescriptionText]].map(([title, value]) => (
            <article key={title} className="card p-5 sm:p-7"><h2 className="text-sm font-extrabold uppercase tracking-widest text-teal-800">{title}</h2><p className="mt-4 min-h-12 whitespace-pre-wrap text-sm leading-7 text-ink/80">{value || 'Sin información registrada.'}</p></article>
          ))}
        </section>
      ) : null}

      {!readOnly && activeSection === 'prescription' ? (
        <section className="prescription-print card p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div><p className="text-xs font-extrabold uppercase tracking-widest text-teal-700">Récipe médico</p><h2 className="mt-1 text-xl font-extrabold">{consultation.professionalName}</h2><p className="text-xs text-ink/55">{consultation.patientName} · {consultation.recordNumber}</p></div>
            <div className="no-print flex gap-2"><Button variant="secondary" icon={<Mail className="h-4 w-4" />} onClick={() => openEmailDraft('prescription')}>Enviar receta por correo</Button><Button variant="secondary" icon={<Printer className="h-4 w-4" />} onClick={printPrescription}>Imprimir receta</Button></div>
          </div>
          <p className="mb-4 text-xs text-ink/50">Fecha: {formatDate(consultation.consultedAt, timezone)}{consultation.specialtyId ? ` · Especialidad registrada` : ''}</p>
          <Field label="Receta de medicamentos" hint="Medicamentos, dosis e indicaciones para el paciente."><Textarea value={renderedForm.prescriptionText} onChange={(event) => update('prescriptionText', event.target.value)} readOnly={readOnly} placeholder="Escribe aquí la receta completa…" className="min-h-72" maxLength={12000} /></Field>
          {!readOnly ? <div className="no-print mt-4 flex justify-end"><Button icon={<Save className="h-4 w-4" />} loading={saveMutation.isPending} disabled={!isDirty} onClick={() => saveMutation.mutate()}>Guardar receta</Button></div> : null}          <div className="mt-12 grid grid-cols-2 gap-12 text-center text-xs"><div className="border-t border-ink/40 pt-2">Firma y sello del médico<br/>{consultation.professionalName}</div><div className="border-t border-ink/40 pt-2">Paciente<br/>{consultation.patientName}</div></div>
        </section>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_370px]">
        <div className={`space-y-5 ${readOnly || activeSection === 'prescription' ? 'hidden' : ''}`}>
          {activeSection === 'evolution' ? <section className="card p-5 sm:p-6"><SectionHeading icon={<Stethoscope className="h-4 w-4" />} title="Evolución / Nota médica" description="Escribe libremente el detalle clínico y la evolución del paciente." /><Field label="Nota médica" required><Textarea value={renderedForm.evolutionText} onChange={(event) => update('evolutionText', event.target.value)} readOnly={readOnly} placeholder="Describe la atención y evolución clínica…" className="mt-4 min-h-80" maxLength={16000} /></Field></section> : null}

          {activeSection === 'studies' ? <section className="card p-5 sm:p-6"><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><SectionHeading icon={<Search className="h-4 w-4" />} title="Estudios clínicos" description="Escribe las órdenes de exámenes y estudios." /><Button className="no-print" variant="secondary" icon={<Printer className="h-4 w-4" />} onClick={printStudies}>Imprimir sólo estudios</Button></div><Field label="Órdenes de estudios"><Textarea value={renderedForm.studiesText} onChange={(event) => update('studiesText', event.target.value)} readOnly={readOnly} placeholder="Anota los exámenes y estudios solicitados…" className="mt-4 min-h-80" maxLength={12000} /></Field></section> : null}

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

          <section className="card p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-700" />
              <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-ink/45">
                {readOnly ? 'Firma clínica' : 'Cierre de consulta'}
              </h2>
            </div>

            {consultation.status !== 'borrador' || justSigned ? (
              <div className="mt-4 rounded-xl bg-teal-50 p-4">
                <div className="flex items-center gap-2 text-teal-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <p className="text-xs font-extrabold">Consulta completada</p>
                </div>
                <p className="mt-1.5 text-[11px] font-semibold text-teal-800/60">
                  {consultation.signedAt ? formatDateTime(consultation.signedAt, timezone) : ''}
                </p>
              </div>
            ) : (
              <>
                <ul className="mt-4 space-y-2 text-[11px] font-semibold">
                  <li className={renderedForm.reason.trim() ? 'flex items-center gap-2 text-teal-700' : 'flex items-center gap-2 text-ink/40'}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Motivo de consulta
                  </li>
                  <li className="flex items-center gap-2 text-ink/40">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Guardado automático al firmar
                  </li>
                </ul>
                <Button
                  className="mt-4 w-full"
                  icon={<ClipboardCheck className="h-4 w-4" />}
                  disabled={!localCanSign || !navigator.onLine}
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
            <p className="mt-1 text-xs font-semibold text-ink/45">{renderedForm.reason || 'Sin motivo registrado'}</p>
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
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Eliminar consulta" description="La consulta y su información clínica dejarán de aparecer en el historial del paciente." footer={<><Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancelar</Button><Button variant="danger" loading={deleteConsultation.isPending} onClick={() => deleteConsultation.mutate()}>Eliminar definitivamente</Button></>}>
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">¿Deseas eliminar esta consulta definitivamente?</p>
      </Modal>
      <Modal open={emailDialog !== null} onClose={() => setEmailDialog(null)} title={emailDialog === 'prescription' ? 'Enviar receta por correo' : 'Enviar evolución por correo'} description="Revisa el destinatario y el contenido en tu aplicación de correo antes de enviarlo." footer={null}>
        <form className="space-y-4" onSubmit={sendEmailDraft}>
          <Field label="Destinatario" required><Input type="email" required value={emailRecipient} onChange={(event) => setEmailRecipient(event.target.value)} placeholder="correo@ejemplo.com" /></Field>
          <p className="text-xs text-ink/50">Se abrirá la aplicación de correo configurada en este dispositivo. La PWA no envía correos automáticamente.</p>
          {emailError ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{emailError}</p> : null}
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setEmailDialog(null)}>Cancelar</Button><Button type="submit" loading={saveMutation.isPending} icon={<Mail className="h-4 w-4" />}>Preparar correo</Button></div>
        </form>
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




