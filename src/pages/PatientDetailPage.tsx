import { useState, type FormEvent, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarPlus,
  Cake,
  ChevronRight,
  ClipboardPlus,
  Clock3,
  FileText,
  HeartPulse,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Printer,
  ShieldAlert,
  Stethoscope,
  Trash2,
  UserRound
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { AppointmentDialog } from '../components/AppointmentDialog';
import { PatientFormDialog } from '../components/PatientFormDialog';
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  Input,
  Modal,
  PageHeader,
  Select,
  SkeletonRows
} from '../components/ui';
import { api, ApiError } from '../lib/data';
import {
  buildEvolutionEmailBody,
  buildMailtoUrl,
  buildPrescriptionEmailBody
} from '../lib/clinical-email';
import { openPrescriptionPrintWindow, renderPrescriptionPrint } from '../lib/prescription-print';
import type { ConsultationSummary } from '../types';
import {
  ageFromBirthDate,
  consultationStatusLabel,
  formatDate,
  formatDateOnly,
  formatDateTime,
  formatTime,
  patientDocument,
  sexLabel,
  statusBadgeClass
} from '../lib/format';

const historyLabels: Record<string, string> = {
  patologico: 'Patológico',
  quirurgico: 'Quirúrgico',
  familiar: 'Familiar',
  gineco_obstetrico: 'Gineco-obstétrico',
  alergia: 'Alergia',
  habito: 'Hábito',
  vacuna: 'Vacuna',
  medicamento: 'Medicamento',
  otro: 'Otro'
};

export function PatientDetailPage() {
  const { id: routePatientId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const timezone = user?.timezone ?? 'America/Managua';
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);
  const [emailTarget, setEmailTarget] = useState<ConsultationSummary | null>(null);
  const [emailKind, setEmailKind] = useState<'evolution' | 'prescription'>('prescription');
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const detail = useQuery({
    queryKey: ['patient', routePatientId],
    queryFn: () => api.patients.get(routePatientId as string),
    enabled: Boolean(routePatientId)
  });

  const startConsultation = useMutation({
    mutationFn: (patientId: string) =>
      api.consultations.create({
        patientId,
        reason: 'Consulta de seguimiento'
      }),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['patient', routePatientId] });
      navigate(`/consultas/${response.consultation.id}`);
    },
    onError: (cause) => {
      console.error('No se pudo abrir una consulta desde el expediente', {
        patientId: routePatientId,
        clinicId: user?.clinicId,
        professionalId: user?.professionalId,
        cause
      });
      setError(cause instanceof ApiError ? cause.message : 'No se pudo abrir la consulta');
    }
  });

  const deletePatient = useMutation({
    mutationFn: (id: string) => api.patients.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['patients'] });
      navigate('/pacientes');
    },
    onError: (cause) => setError(cause instanceof ApiError ? cause.message : 'No se pudo eliminar el paciente')
  });

  if (detail.isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-5 w-28" />
        <div className="skeleton h-48 w-full rounded-3xl" />
        <SkeletonRows rows={4} />
      </div>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <ErrorState
        message={detail.error instanceof Error ? detail.error.message : 'No encontramos al paciente'}
        onRetry={() => void detail.refetch()}
      />
    );
  }

  const { patient, history, consultations, appointments } = detail.data;
  // Use the canonical UUID returned by Data Connect, not a potentially stale route value.
  const patientId = patient.id;
  const age = patient.ageOverride ?? ageFromBirthDate(patient.birthDate);
  const draft = consultations.find((consultation) => consultation.status === 'borrador');

  function openConsultation() {
    setError(null);
    if (draft) {
      navigate(`/consultas/${draft.id}`);
      return;
    }
    startConsultation.mutate(patientId);
  }

  async function printHistoryPrescription(consultation: ConsultationSummary) {
    setError(null);
    const target = openPrescriptionPrintWindow();
    if (!target) {
      setError('Permite las ventanas emergentes para imprimir la receta.');
      return;
    }
    target.document.write('<p style="font-family:Arial,sans-serif;padding:24px;color:#334155">Generando receta…</p>');
    setPrintingId(consultation.id);
    try {
      const { consultation: detail } = await api.consultations.get(consultation.id);
      const legacyText = [detail.plan, detail.treatmentPlan, detail.evolution]
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value))
        .filter((value, index, values) => values.indexOf(value) === index)
        .join('\n\n');
      renderPrescriptionPrint(target, {
        clinicName: user?.clinicName ?? 'Clínica',
        patientName: detail.patientName,
        recordNumber: detail.recordNumber,
        consultedAt: detail.consultedAt,
        professionalName: detail.professionalName,
        items: [],
        legacyText: detail.prescriptionText || legacyText,
        patientDocument: patientDocument(patient),
        patientBirthDate: detail.birthDate,
        nextVisitAt: detail.nextVisitAt,
        timezone
      });
    } catch (cause) {
      target.close();
      setError(cause instanceof ApiError ? cause.message : 'No se pudo generar la receta');
    } finally {
      setPrintingId(null);
    }
  }

  function openHistoryEmail(consultation: ConsultationSummary, kind: 'evolution' | 'prescription' = 'prescription') {
    setEmailTarget(consultation);
    setEmailKind(kind);
    setEmailRecipient(patient.email ?? '');
    setEmailError(null);
  }

  async function sendHistoryEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!emailTarget || !emailRecipient.trim()) return;
    setEmailSending(true);
    setEmailError(null);
    try {
      const { consultation: detail } = await api.consultations.get(emailTarget.id);
      const subject = emailKind === 'prescription'
        ? `Receta médica · ${detail.patientName}`
        : `Nota médica · ${detail.patientName}`;
      const body = emailKind === 'prescription'
        ? buildPrescriptionEmailBody({
          clinicName: user?.clinicName ?? 'Clínica',
          consultation: detail,
          timezone
        })
        : buildEvolutionEmailBody({
          clinicName: user?.clinicName ?? 'Clínica',
          consultation: detail,
          timezone
        });
      window.location.href = buildMailtoUrl({ to: emailRecipient, subject, body });
      setEmailTarget(null);
    } catch (cause) {
      setEmailError(cause instanceof ApiError ? cause.message : 'No se pudo preparar el correo');
    } finally {
      setEmailSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/pacientes')}
        className="focus-ring inline-flex items-center gap-2 rounded-lg text-xs font-bold text-ink/45 transition hover:text-teal-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a pacientes
      </button>

      <PageHeader
        eyebrow={patient.recordNumber}
        title={patient.fullName}
        description="Expediente clínico, antecedentes y evolución en una sola vista."
        actions={
          <>
            <Button variant="secondary" icon={<Pencil className="h-4 w-4" />} onClick={() => setEditOpen(true)}>Editar</Button>
            <Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleteOpen(true)}>Eliminar</Button>
            <Button
              variant="secondary"
              icon={<CalendarPlus className="h-4 w-4" />}
              onClick={() => setAppointmentOpen(true)}
            >
              Agendar cita
            </Button>
            <Button
              loading={startConsultation.isPending}
              icon={draft ? <FileText className="h-4 w-4" /> : <ClipboardPlus className="h-4 w-4" />}
              onClick={openConsultation}
            >
              {draft ? 'Continuar borrador' : 'Nueva consulta'}
            </Button>
          </>
        }
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      {patient.isSuspended ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-extrabold">Paciente suspendido</p>
            <p className="mt-0.5 text-xs">{patient.suspensionReason || 'Revisa el motivo antes de continuar.'}</p>
          </div>
        </div>
      ) : null}

      <section className="card overflow-hidden">
        <div className="flex flex-col gap-5 bg-gradient-to-br from-teal-950 via-teal-900 to-teal-800 p-5 text-white sm:flex-row sm:items-center sm:p-7">
          <Avatar
            name={patient.fullName}
            size="xl"
            className="bg-white/10 text-white ring-white/15"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-3xl font-medium tracking-tight">{patient.fullName}</h2>
              <Badge className="border border-white/15 bg-white/10 text-white">
                {patient.recordNumber}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-teal-100/65">
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5" />
                {sexLabel(patient.sex)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Cake className="h-3.5 w-3.5" />
                {age !== null ? `${age} años` : 'Edad no registrada'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {patient.mobile || patient.phone || 'Sin teléfono'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                {patientDocument(patient)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:w-48">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
              <p className="text-2xl font-extrabold leading-none">{patient.consultationCount ?? consultations.length}</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-teal-200/50">Consultas</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
              <p className="text-2xl font-extrabold leading-none">{history.length}</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-teal-200/50">Antecedentes</p>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-line/60 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCell icon={<Cake className="h-4 w-4" />} label="Nacimiento" value={formatDateOnly(patient.birthDate)} />
          <InfoCell icon={<Phone className="h-4 w-4" />} label="Teléfono" value={patient.mobile || patient.phone || '—'} />
          <InfoCell icon={<Mail className="h-4 w-4" />} label="Correo" value={patient.email || '—'} />
          <InfoCell icon={<MapPin className="h-4 w-4" />} label="Ciudad" value={patient.city || patient.address || '—'} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line/70 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-ink/45">Historia clínica</h2>
                <p className="mt-1 text-sm text-ink/55">{consultations.length} atenciones · historial completo</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/consultas')}>
                Ver todas
              </Button>
            </div>

            {consultations.length === 0 ? (
              <EmptyState
                icon={<HeartPulse className="h-7 w-7" />}
                title="La historia comienza aquí"
                description="Abre una consulta para registrar la evolución, las órdenes de estudios y la receta."
                action={
                  <Button icon={<ClipboardPlus className="h-4 w-4" />} onClick={openConsultation}>
                    Nueva consulta
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-line/60">
                {consultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="group flex items-start gap-2 px-3 py-2 transition hover:bg-teal-50/35 sm:px-4"
                  >
                    <button
                      type="button"
                      onClick={() => navigate(`/consultas/${consultation.id}`)}
                      className="flex min-w-0 flex-1 items-start gap-4 rounded-xl px-2 py-2 text-left focus-ring"
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
                        <Stethoscope className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-extrabold text-ink">
                            {consultation.reason || 'Consulta médica'}
                          </p>
                          <Badge className={statusBadgeClass(consultation.status)} dot>
                            {consultationStatusLabel(consultation.status)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-[11px] font-semibold text-ink/40">
                          {formatDateTime(consultation.consulted_at, timezone)} · {consultation.professional_name}
                        </p>
                        <p className="mt-2 text-[10px] font-semibold text-ink/30">
                          Usa los botones para imprimir la receta o enviarla por correo.
                        </p>
                      </div>
                      <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-ink/20 transition group-hover:text-teal-700" />
                    </button>
                    <div className="flex shrink-0 flex-col gap-1 pt-1">
                      <IconButton
                          label={printingId === consultation.id ? 'Generando receta…' : 'Imprimir sólo receta'}
                        disabled={printingId === consultation.id}
                        onClick={() => void printHistoryPrescription(consultation)}
                      >
                        <Printer className={`h-4 w-4 ${printingId === consultation.id ? 'animate-pulse' : ''}`} />
                      </IconButton>
                      <IconButton
                        label="Enviar por correo"
                        onClick={() => openHistoryEmail(consultation, 'prescription')}
                      >
                        <Mail className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Temporalmente oculto; se conserva el componente y su integración para reactivarlos. */}

          <section className="card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-ink/45">Antecedentes</h2>
                <p className="mt-1 text-sm text-ink/55">Información relevante para la atención</p>
              </div>
              <Badge className="badge-slate">{history.length}</Badge>
            </div>
            {history.length === 0 ? (
              <p className="mt-5 rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink/40">
                Sin antecedentes registrados en la migración.
              </p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {history.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-line/70 bg-canvas/60 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <Badge className="badge-teal">{historyLabels[item.category] ?? item.category}</Badge>
                      <span className="text-[10px] font-semibold text-ink/35">
                        {formatDate(item.recorded_at, timezone)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-ink/75">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card p-5">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-ink/45">Datos del paciente</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <DetailRow label="Documento" value={patientDocument(patient)} />
              <DetailRow label="Estado civil" value={patient.maritalStatus} />
              <DetailRow label="Ocupación" value={patient.occupation || '—'} />
              <DetailRow label="Dirección" value={patient.address || '—'} />
              <DetailRow label="Nacionalidad" value={patient.nationality || '—'} />
              <DetailRow label="Tipo de sangre" value={patient.bloodType || '—'} />
            </dl>
          </section>

          <section className={patient.allergiesNotes ? 'card border-amber-200 bg-amber-50/50 p-5' : 'card p-5'}>
            <div className="flex items-center gap-2">
              <AlertTriangle className={patient.allergiesNotes ? 'h-4 w-4 text-amber-600' : 'h-4 w-4 text-ink/30'} />
              <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-ink/45">Alergias</h2>
            </div>
            <p className={patient.allergiesNotes ? 'mt-3 text-sm font-bold leading-relaxed text-amber-900' : 'mt-3 text-sm text-ink/40'}>
              {patient.allergiesNotes || 'Sin alergias registradas.'}
            </p>
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-ink/45">Enfermedades / antecedentes</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/70">{patient.currentDiagnosisSummary || 'Sin enfermedades o antecedentes registrados.'}</p>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-ink/45">Próximas citas</h2>
              <CalendarPlus className="h-4 w-4 text-teal-700" />
            </div>
            {appointments.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-line px-3 py-6 text-center text-xs text-ink/40">
                Sin citas futuras.
              </p>
            ) : (
              <div className="mt-4 space-y-2.5">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-xl border border-line/70 p-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-ink">
                      <Clock3 className="h-3.5 w-3.5 text-teal-700" />
                      {formatDate(appointment.starts_at, timezone, { weekday: 'short' })} ·{' '}
                      {formatTime(appointment.starts_at, timezone)}
                    </div>
                    <p className="mt-1 text-[11px] text-ink/50">{appointment.reason || 'Consulta médica'}</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-ink/35">{appointment.professional_name}</p>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="secondary"
              className="mt-4 w-full"
              icon={<CalendarPlus className="h-4 w-4" />}
              onClick={() => setAppointmentOpen(true)}
            >
              Agendar cita
            </Button>
          </section>
        </aside>
      </div>

      <AppointmentDialog
        open={appointmentOpen}
        onClose={() => setAppointmentOpen(false)}
        defaultPatient={patient}
        onCreated={() => void queryClient.invalidateQueries({ queryKey: ['patient', routePatientId] })}
      />
      <PatientFormDialog open={editOpen} onClose={() => setEditOpen(false)} patient={patient} onCreated={() => void queryClient.invalidateQueries({ queryKey: ['patient', routePatientId] })} />
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Eliminar paciente del directorio"
        description="El expediente se dará de baja y sus relaciones clínicas se conservarán en el historial."
        footer={<><Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancelar</Button><Button variant="danger" loading={deletePatient.isPending} onClick={() => deletePatient.mutate(patient.id)}>Confirmar eliminación</Button></>}
      >
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">¿Confirmas retirar a {patient.fullName} del directorio activo? Su historial médico se conservará.</p>
      </Modal>
      <Modal
        open={Boolean(emailTarget)}
        onClose={() => { setEmailTarget(null); setEmailError(null); }}
        title={emailKind === 'prescription' ? 'Enviar receta por correo' : 'Enviar evolución por correo'}
        description="Revisa el destinatario y el contenido en tu aplicación de correo antes de enviarlo."
        footer={null}
      >
        <form className="space-y-4" onSubmit={sendHistoryEmail}>
          <Field label="Contenido">
            <Select value={emailKind} onChange={(event) => setEmailKind(event.target.value as 'evolution' | 'prescription')}>
              <option value="prescription">Receta de medicamentos</option>
              <option value="evolution">Evolución / nota médica</option>
            </Select>
          </Field>
          <Field label="Destinatario" required>
            <Input
              type="email"
              required
              value={emailRecipient}
              onChange={(event) => setEmailRecipient(event.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </Field>
          <p className="text-xs text-ink/50">
            {patient.email
              ? 'El correo registrado del paciente se usa por defecto; puedes modificarlo antes de enviar.'
              : 'El paciente no tiene correo registrado. Escribe el destinatario antes de continuar.'}
          </p>
          <p className="text-xs text-ink/50">Se abrirá la aplicación de correo configurada en este dispositivo.</p>
          {emailError ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{emailError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEmailTarget(null)}>Cancelar</Button>
            <Button type="submit" loading={emailSending} icon={<Mail className="h-4 w-4" />}>Preparar correo</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function InfoCell({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="bg-surface p-4">
      <div className="flex items-center gap-2 text-ink/35">
        {icon}
        <span className="text-[10px] font-extrabold uppercase tracking-[0.12em]">{label}</span>
      </div>
      <p className="mt-2 truncate text-sm font-bold text-ink/75">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line/50 pb-2.5 last:border-0 last:pb-0">
      <dt className="text-xs font-semibold text-ink/40">{label}</dt>
      <dd className="max-w-[190px] text-right text-xs font-bold text-ink/75">{value}</dd>
    </div>
  );
}
