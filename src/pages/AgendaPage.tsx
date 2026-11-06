import { useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Sparkles,
  Stethoscope,
  UserRound,
  XCircle,
  Pencil,
  Trash2
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { AppointmentDialog } from '../components/AppointmentDialog';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  IconButton,
  Modal,
  PageHeader,
  SkeletonRows
} from '../components/ui';
import { api, ApiError } from '../lib/data';
import {
  appointmentStatusLabel,
  cn,
  formatLongDate,
  formatTime,
  shiftDate,
  statusBadgeClass,
  todayInTimeZone
} from '../lib/format';
import type { Appointment } from '../types';

export function AgendaPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const timezone = user?.timezone ?? 'America/Managua';
  const [date, setDate] = useState(() => todayInTimeZone(timezone));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const agenda = useQuery({
    queryKey: ['agenda', date],
    queryFn: () => api.agenda.get(date)
  });

  const startConsultation = useMutation({
    mutationFn: (appointment: Appointment) =>
      api.consultations.create({
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        professionalId: appointment.professionalId,
        reason: appointment.reason ?? undefined
      }),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['agenda'] });
      navigate(`/consultas/${response.consultation.id}`);
    },
    onError: (cause) => {
      if (cause instanceof ApiError && cause.code === 'consultation_exists') {
        const existingId = (cause.payload as { error?: { consultationId?: string } })?.error?.consultationId;
        if (existingId) {
          navigate(`/consultas/${existingId}`);
          return;
        }
      }
      setActionError(cause instanceof ApiError ? cause.message : 'No se pudo iniciar la consulta');
    }
  });

  const cancelAppointment = useMutation({
    mutationFn: (appointment: Appointment) => api.agenda.updateStatus(appointment.id, 'cancelada'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['agenda'] });
      setCancelTarget(null);
    },
    onError: (cause) => setActionError(cause instanceof ApiError ? cause.message : 'No se pudo cancelar la cita')
  });

  const stats = agenda.data?.stats;
  const appointments = agenda.data?.appointments ?? [];
  const attendedPercent = stats?.total ? Math.round((stats.attended / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Hoy en la clínica"
        title="Agenda"
        description="Organiza el día, recibe a tus pacientes y abre la consulta en un clic."
        actions={
          <>
            <div className="flex items-center gap-1 rounded-xl border border-line bg-white p-1 shadow-sm">
              <IconButton label="Día anterior" onClick={() => setDate(shiftDate(date, -1))}>
                <ChevronLeft className="h-4 w-4" />
              </IconButton>
              <button
                type="button"
                onClick={() => setDate(todayInTimeZone(timezone))}
                className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-teal-800 transition hover:bg-teal-50"
              >
                Hoy
              </button>
              <IconButton label="Día siguiente" onClick={() => setDate(shiftDate(date, 1))}>
                <ChevronRight className="h-4 w-4" />
              </IconButton>
            </div>
            <Button icon={<CalendarPlus className="h-4 w-4" />} onClick={() => setDialogOpen(true)}>
              Nueva cita
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-ink/55">
          <CalendarDays className="h-4 w-4 text-teal-700" />
          <span className="font-semibold capitalize text-ink">{formatLongDate(date, timezone)}</span>
        </div>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-ink/65 sm:w-auto"
          aria-label="Seleccionar fecha"
        />
      </div>

      {actionError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {actionError}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Citas del día"
          value={stats?.total ?? 0}
          icon={<CalendarDays className="h-5 w-5" />}
          tone="teal"
        />
        <StatCard
          label="En espera"
          value={stats?.waiting ?? 0}
          icon={<Clock3 className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label="Atendidas"
          value={stats?.attended ?? 0}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="blue"
        />
        <StatCard
          label="Canceladas"
          value={stats?.cancelled ?? 0}
          icon={<XCircle className="h-5 w-5" />}
          tone="slate"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line/70 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-ink/45">Horario del día</h2>
              <p className="mt-1 text-sm text-ink/55">
                {appointments.length ? `${appointments.length} citas programadas` : 'Sin citas para esta fecha'}
              </p>
            </div>
            <Badge className="badge-teal" dot>
              {timezone.replace('_', ' ')}
            </Badge>
          </div>

          {agenda.isLoading ? (
            <div className="p-4">
              <SkeletonRows rows={5} />
            </div>
          ) : agenda.isError ? (
            <div className="p-4">
              <ErrorState
                message={agenda.error instanceof Error ? agenda.error.message : 'Error al cargar la agenda'}
                onRetry={() => void agenda.refetch()}
              />
            </div>
          ) : appointments.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="h-7 w-7" />}
              title="La agenda está libre"
              description="Agenda una cita para comenzar el día o elige otra fecha en el calendario."
              action={
                <Button icon={<CalendarPlus className="h-4 w-4" />} onClick={() => setDialogOpen(true)}>
                  Agendar cita
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-line/60">
              {appointments.map((appointment) => (
                <article
                  key={appointment.id}
                  className="group flex flex-col gap-4 px-5 py-4 transition hover:bg-teal-50/35 sm:flex-row sm:items-center sm:px-6"
                >
                  <div className="flex w-24 shrink-0 flex-col">
                    <p className="text-lg font-extrabold tabular-nums text-ink">
                      {formatTime(appointment.startsAt, timezone)}
                    </p>
                    <p className="text-[11px] font-semibold text-ink/40">{appointment.durationMinutes} min</p>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-extrabold text-ink">{appointment.patientName}</h3>
                      <Badge className={statusBadgeClass(appointment.status)} dot>
                        {appointmentStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-ink/55">
                      {appointment.reason || 'Consulta médica'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-ink/40">
                      <span className="inline-flex items-center gap-1.5">
                        <Stethoscope className="h-3.5 w-3.5" />
                        {appointment.professionalName}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <UserRound className="h-3.5 w-3.5" />
                        {appointment.patientRecord}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                    {!['cancelada', 'atendida', 'no_asistio'].includes(appointment.status) ? <>
                      <IconButton label="Editar cita" onClick={() => setEditingAppointment(appointment)}><Pencil className="h-4 w-4" /></IconButton>
                      <IconButton label="Cancelar cita" onClick={() => setCancelTarget(appointment)}><Trash2 className="h-4 w-4 text-red-600" /></IconButton>
                    </> : null}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/pacientes/${appointment.patientId}`)}
                    >
                      Ficha
                    </Button>
                    {appointment.consultationId ? (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/consultas/${appointment.consultationId}`)}
                        icon={<ArrowRight className="h-3.5 w-3.5" />}
                      >
                        Ver consulta
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        loading={
                          startConsultation.isPending &&
                          startConsultation.variables?.id === appointment.id
                        }
                        disabled={['cancelada', 'no_asistio', 'reprogramada'].includes(appointment.status)}
                        onClick={() => startConsultation.mutate(appointment)}
                        icon={<Activity className="h-3.5 w-3.5" />}
                      >
                        Atender
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-ink/45">Estado del día</h2>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="font-display text-4xl font-medium text-ink">{attendedPercent}%</p>
                <p className="mt-1 text-xs font-semibold text-ink/45">de la agenda completada</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-[6px] border-teal-100 text-xs font-extrabold text-teal-800">
                {stats?.attended ?? 0}/{stats?.total ?? 0}
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-line/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-400 transition-all duration-500"
                style={{ width: `${attendedPercent}%` }}
              />
            </div>
            <dl className="mt-5 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink/50">Programadas</dt>
                <dd className="font-bold text-ink">{stats?.scheduled ?? 0}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink/50">En espera</dt>
                <dd className="font-bold text-amber-700">{stats?.waiting ?? 0}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink/50">Atendidas</dt>
                <dd className="font-bold text-teal-700">{stats?.attended ?? 0}</dd>
              </div>
            </dl>
            <Button
              variant="secondary"
              className="mt-5 w-full"
              icon={<CalendarPlus className="h-4 w-4" />}
              onClick={() => setDialogOpen(true)}
            >
              Agregar cita
            </Button>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-teal-950 p-5 text-white shadow-soft">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-teal-400/10" />
            <div className="relative">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-teal-200">
                <Stethoscope className="h-4 w-4" />
              </span>
              <h3 className="mt-4 font-display text-xl font-medium leading-tight">Una historia, todo el contexto.</h3>
              <p className="mt-2 text-xs leading-relaxed text-teal-100/55">
                Abre la ficha antes de recibir al paciente. Alergias, antecedentes y consultas previas estarán a la vista.
              </p>
              <button
                type="button"
                onClick={() => navigate('/pacientes')}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-teal-200 hover:text-white"
              >
                Ir a pacientes <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </aside>
      </div>

      <AppointmentDialog
        open={dialogOpen || Boolean(editingAppointment)}
        onClose={() => { setDialogOpen(false); setEditingAppointment(null); }}
        defaultDate={date}
        appointment={editingAppointment}
        onCreated={() => setActionError(null)}
      />
      <Modal open={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} title="Cancelar cita" description="La cita quedará en el historial como cancelada; no se borrarán sus datos." footer={<><Button variant="secondary" onClick={() => setCancelTarget(null)}>Volver</Button><Button variant="danger" loading={cancelAppointment.isPending} onClick={() => cancelTarget && cancelAppointment.mutate(cancelTarget)}>Cancelar cita</Button></>}>
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">¿Estás seguro de cancelar la cita de {cancelTarget?.patientName}?</p>
      </Modal>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone: 'teal' | 'amber' | 'blue' | 'slate';
}) {
  const tones = {
    teal: 'bg-teal-50 text-teal-700 ring-teal-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    blue: 'bg-sky-50 text-sky-700 ring-sky-100',
    slate: 'bg-slate-100 text-slate-600 ring-slate-200'
  };
  return (
    <div className="stat-card">
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset', tones[tone])}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold leading-none tabular-nums text-ink">{value}</p>
        <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-[0.1em] text-ink/40">{label}</p>
      </div>
    </div>
  );
}
