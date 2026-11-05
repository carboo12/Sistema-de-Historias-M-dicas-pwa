import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronRight,
  ClipboardPlus,
  FileText,
  PenLine,
  Search,
  Stethoscope,
  X
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  SkeletonRows
} from '../components/ui';
import { api } from '../lib/data';
import {
  consultationStatusLabel,
  formatDate,
  formatTime,
  statusBadgeClass
} from '../lib/format';

type StatusFilter = 'todas' | 'borrador' | 'firmada';

const filters: { value: StatusFilter; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'borrador', label: 'Borradores' },
  { value: 'firmada', label: 'Firmadas' }
];

export function ConsultationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const timezone = user?.timezone ?? 'America/Managua';
  const [status, setStatus] = useState<StatusFilter>('todas');
  const [q, setQ] = useState('');

  const consultations = useQuery({
    queryKey: ['consultations'],
    queryFn: () => api.consultations.list()
  });

  const all = consultations.data?.consultations ?? [];
  const drafts = all.filter((consultation) => consultation.status === 'borrador').length;
  const signed = all.filter((consultation) => consultation.status === 'firmada').length;
  const needle = q.trim().toLowerCase();

  const filtered = all
    .filter((consultation) => (status === 'todas' ? true : consultation.status === status))
    .filter((consultation) => {
      if (!needle) return true;
      return [consultation.patient_name, consultation.record_number, consultation.reason, consultation.professional_name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    })
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'borrador' ? -1 : 1;
      return new Date(b.consulted_at).getTime() - new Date(a.consulted_at).getTime();
    });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Bandeja clínica"
        title="Consultas"
        description="Retoma borradores y revisa las atenciones firmadas más recientes."
        actions={
          <Button icon={<ClipboardPlus className="h-4 w-4" />} onClick={() => navigate('/consultas/nueva')}>
            Nueva consulta
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <SummaryTile label="Total" value={all.length} icon={<FileText className="h-4 w-4" />} tone="slate" />
        <SummaryTile label="Borradores" value={drafts} icon={<PenLine className="h-4 w-4" />} tone="amber" />
        <SummaryTile label="Firmadas" value={signed} icon={<CheckCircle2 className="h-4 w-4" />} tone="teal" />
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1 rounded-xl bg-canvas p-1">
            {filters.map((filter) => {
              const count =
                filter.value === 'todas' ? all.length : filter.value === 'borrador' ? drafts : signed;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatus(filter.value)}
                  className={`focus-ring rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    status === filter.value
                      ? 'bg-white text-teal-800 shadow-sm ring-1 ring-black/[0.04]'
                      : 'text-ink/45 hover:text-ink/70'
                  }`}
                >
                  {filter.label}
                  <span className="ml-1.5 text-[10px] text-ink/30">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
            <Input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              className="pl-10 pr-10"
              placeholder="Buscar por paciente, historia o motivo…"
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ('')}
                className="focus-ring absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink/35 hover:bg-ink/5 hover:text-ink"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {consultations.isLoading ? (
        <SkeletonRows rows={7} />
      ) : consultations.isError ? (
        <ErrorState
          message={consultations.error instanceof Error ? consultations.error.message : 'Error al cargar consultas'}
          onRetry={() => void consultations.refetch()}
        />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Stethoscope className="h-7 w-7" />}
            title={needle || status !== 'todas' ? 'Sin consultas en esta vista' : 'Aún no hay consultas'}
            description={
              needle || status !== 'todas'
                ? 'Cambia el filtro o busca otro término.'
                : 'Abre la primera consulta desde la agenda o desde el expediente de un paciente.'
            }
            action={
              <Button icon={<ClipboardPlus className="h-4 w-4" />} onClick={() => navigate('/consultas/nueva')}>
                Nueva consulta
              </Button>
            }
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="table-wrap border-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Motivo</th>
                  <th>Profesional</th>
                  <th>Diagnóstico</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th aria-label="Abrir" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((consultation) => (
                  <tr
                    key={consultation.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/consultas/${consultation.id}`)}
                  >
                    <td>
                      <p className="font-bold text-ink">{consultation.patient_name}</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-ink/40">{consultation.record_number}</p>
                    </td>
                    <td className="max-w-[240px]">
                      <p className="truncate text-xs font-semibold text-ink/65">
                        {consultation.reason || 'Sin motivo registrado'}
                      </p>
                    </td>
                    <td className="text-xs font-semibold text-ink/55">{consultation.professional_name}</td>
                    <td>
                      {consultation.diagnoses.length ? (
                        <div className="flex max-w-[220px] flex-wrap gap-1">
                          {consultation.diagnoses.slice(0, 2).map((diagnosis) => (
                            <span
                              key={diagnosis.id}
                              className="rounded-md bg-canvas px-1.5 py-1 text-[10px] font-bold text-ink/55 ring-1 ring-inset ring-line"
                            >
                              {diagnosis.code}
                            </span>
                          ))}
                          {consultation.diagnoses.length > 2 ? (
                            <span className="px-1 py-1 text-[10px] font-bold text-ink/30">
                              +{consultation.diagnoses.length - 2}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-ink/30">Sin diagnóstico</span>
                      )}
                    </td>
                    <td>
                      <p className="text-xs font-semibold text-ink/55">{formatDate(consultation.consulted_at, timezone)}</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-ink/35">
                        {formatTime(consultation.consulted_at, timezone)}
                      </p>
                    </td>
                    <td>
                      <Badge className={statusBadgeClass(consultation.status)} dot>
                        {consultationStatusLabel(consultation.status)}
                      </Badge>
                    </td>
                    <td>
                      <ChevronRight className="h-4 w-4 text-ink/25" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-line/60 bg-canvas/40 px-5 py-3 text-[11px] font-semibold text-ink/35">
            Mostrando las últimas {all.length} consultas registradas.
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  icon,
  tone
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone: 'slate' | 'amber' | 'teal';
}) {
  const tones = {
    slate: 'bg-white text-ink/50 ring-line',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    teal: 'bg-teal-50 text-teal-700 ring-teal-100'
  };
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${tones[tone]}`}>
        {icon}
      </span>
      <div>
        <p className="text-xl font-extrabold leading-none text-ink">{value}</p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-ink/35">{label}</p>
      </div>
    </div>
  );
}
