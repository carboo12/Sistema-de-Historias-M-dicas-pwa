import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Search,
  UserPlus,
  Users,
  X,
  Pencil,
  Trash2
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { PatientFormDialog } from '../components/PatientFormDialog';
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  IconButton,
  Input,
  Modal,
  PageHeader,
  SkeletonRows
} from '../components/ui';
import { api } from '../lib/data';
import {
  ageFromBirthDate,
  formatDate,
  patientDocument,
  sexLabel,
  statusBadgeClass
} from '../lib/format';

const PAGE_SIZE = 15;

export function PatientsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const timezone = user?.timezone ?? 'America/Managua';
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<import('../types').Patient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<import('../types').Patient | null>(null);
  const queryClient = useQueryClient();

  const patients = useQuery({
    queryKey: ['patients', q, page],
    queryFn: () => api.patients.list(q, PAGE_SIZE, page * PAGE_SIZE)
  });

  const total = patients.data?.total ?? 0;
  const pages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const rows = patients.data?.patients ?? [];
  const archivePatient = useMutation({
    mutationFn: (patientId: string) => api.patients.delete(patientId),
    onMutate: async (patientId) => {
      await queryClient.cancelQueries({ queryKey: ['patients'] });
      const previous = queryClient.getQueriesData<{ patients: import('../types').Patient[]; total: number }>({ queryKey: ['patients'] });
      for (const [queryKey, value] of previous) {
        if (!value) continue;
        queryClient.setQueryData(queryKey, {
          ...value,
          patients: value.patients.filter((patient) => patient.id !== patientId),
          total: Math.max(value.total - (value.patients.some((patient) => patient.id === patientId) ? 1 : 0), 0)
        });
      }
      return { previous };
    },
    onError: (_cause, _patientId, context) => {
      for (const [queryKey, value] of context?.previous ?? []) queryClient.setQueryData(queryKey, value);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['patients'] });
      setDeleteTarget(null);
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Directorio clínico"
        title="Pacientes"
        description="Encuentra una historia en segundos, revisa antecedentes y abre la siguiente consulta."
        actions={
          <Button icon={<UserPlus className="h-4 w-4" />} onClick={() => setDialogOpen(true)}>
            Nuevo paciente
          </Button>
        }
      />

      <div className="card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
            <Input
              value={q}
              onChange={(event) => {
                setQ(event.target.value);
                setPage(0);
              }}
              className="pl-10 pr-10"
              placeholder="Buscar por nombre, apellido, cédula o número de historia…"
              autoComplete="off"
            />
            {q ? (
              <button
                type="button"
                onClick={() => {
                  setQ('');
                  setPage(0);
                }}
                className="focus-ring absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink/35 hover:bg-ink/5 hover:text-ink"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-ink/45">
            <Users className="h-4 w-4 text-teal-700" />
            {total.toLocaleString('es-NI')} pacientes registrados
          </div>
        </div>
      </div>

      {patients.isLoading ? (
        <SkeletonRows rows={7} />
      ) : patients.isError ? (
        <ErrorState
          message={patients.error instanceof Error ? patients.error.message : 'Error al cargar pacientes'}
          onRetry={() => void patients.refetch()}
        />
      ) : rows.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Users className="h-7 w-7" />}
            title={q ? 'No encontramos coincidencias' : 'Aún no hay pacientes'}
            description={
              q
                ? 'Prueba con otro nombre, documento o número de historia.'
                : 'Crea la primera ficha para comenzar a construir la historia clínica.'
            }
            action={
              q ? (
                <Button variant="secondary" onClick={() => setQ('')}>
                  Limpiar búsqueda
                </Button>
              ) : (
                <Button icon={<UserPlus className="h-4 w-4" />} onClick={() => setDialogOpen(true)}>
                  Crear paciente
                </Button>
              )
            }
          />
        </div>
      ) : (
        <>
          <div className="card hidden overflow-hidden lg:block">
            <div className="table-wrap border-0">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Documento</th>
                    <th>Edad / sexo</th>
                    <th>Contacto</th>
                    <th>Última visita</th>
                    <th>Próxima cita</th>
                    <th aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((patient) => {
                    const age = ageFromBirthDate(patient.birthDate);
                    return (
                      <tr
                        key={patient.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/pacientes/${patient.id}`)}
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar name={patient.fullName} size="sm" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate font-bold text-ink">{patient.fullName}</p>
                                {patient.isSuspended ? (
                                  <Badge className={statusBadgeClass('cancelada')}>Suspendido</Badge>
                                ) : null}
                              </div>
                              <p className="text-[11px] font-semibold text-ink/40">{patient.recordNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-xs font-semibold text-ink/55">{patientDocument(patient)}</td>
                        <td className="text-xs font-semibold text-ink/55">
                          {age !== null ? `${age} años` : '—'} · {sexLabel(patient.sex)}
                        </td>
                        <td>
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/55">
                            <Phone className="h-3.5 w-3.5 text-ink/30" />
                            {patient.mobile || patient.phone || '—'}
                          </span>
                        </td>
                        <td className="text-xs font-semibold text-ink/55">
                          {patient.lastVisitAt ? formatDate(patient.lastVisitAt, timezone) : 'Sin consultas'}
                        </td>
                        <td className="text-xs font-semibold text-ink/55">
                          {patient.nextAppointmentAt
                            ? formatDate(patient.nextAppointmentAt, timezone, { month: 'short', day: '2-digit' })
                            : '—'}
                        </td>
                        <td>
                          <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
                            <IconButton label={`Editar ${patient.fullName}`} onClick={() => setEditingPatient(patient)}><Pencil className="h-4 w-4" /></IconButton>
                            <IconButton label={`Archivar ${patient.fullName}`} onClick={() => setDeleteTarget(patient)}><Trash2 className="h-4 w-4 text-red-600" /></IconButton>
                            <ChevronRight className="h-4 w-4 text-ink/25" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 lg:hidden">
            {rows.map((patient) => {
              const age = ageFromBirthDate(patient.birthDate);
              return (
                <article key={patient.id} className="card-flat p-4">
                  <div className="flex items-start gap-3">
                    <Link to={`/pacientes/${patient.id}`} className="flex min-w-0 flex-1 items-start gap-3">
                    <Avatar name={patient.fullName} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-extrabold text-ink">{patient.fullName}</p>
                          <p className="mt-0.5 text-[11px] font-semibold text-ink/40">
                            {patient.recordNumber} · {patientDocument(patient)}
                          </p>
                        </div>
                        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-ink/25" />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <Badge className="badge-slate">
                          {age !== null ? `${age} años` : 'Edad no registrada'}
                        </Badge>
                        <Badge className="badge-slate">{sexLabel(patient.sex)}</Badge>
                        {patient.isSuspended ? <Badge className="badge-red">Suspendido</Badge> : null}
                      </div>
                      <p className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink/45">
                        <Phone className="h-3.5 w-3.5" />
                        {patient.mobile || patient.phone || 'Sin teléfono'}
                      </p>
                    </div>
                    </Link>
                    <div className="flex shrink-0 flex-col gap-1">
                      <IconButton label={`Editar ${patient.fullName}`} onClick={() => setEditingPatient(patient)}><Pencil className="h-4 w-4" /></IconButton>
                      <IconButton label={`Archivar ${patient.fullName}`} onClick={() => setDeleteTarget(patient)}><Trash2 className="h-4 w-4 text-red-600" /></IconButton>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-line/70 bg-white px-4 py-3">
            <p className="text-xs font-semibold text-ink/45">
              Página {page + 1} de {pages} · {total.toLocaleString('es-NI')} resultados
            </p>
            <div className="flex items-center gap-1">
              <IconButton label="Página anterior" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </IconButton>
              <IconButton
                label="Página siguiente"
                disabled={page + 1 >= pages}
                onClick={() => setPage((value) => value + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </IconButton>
            </div>
          </div>
        </>
      )}

      <PatientFormDialog
        open={dialogOpen || Boolean(editingPatient)}
        patient={editingPatient}
        onClose={() => { setDialogOpen(false); setEditingPatient(null); }}
        onCreated={(patient) => { setEditingPatient(null); if (dialogOpen) navigate(`/pacientes/${patient.id}`); }}
      />
      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Eliminar paciente del directorio" description="El expediente se dará de baja y sus relaciones clínicas se conservarán en el historial." footer={<><Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancelar</Button><Button variant="danger" loading={archivePatient.isPending} onClick={() => deleteTarget && archivePatient.mutate(deleteTarget.id)}>Confirmar eliminación</Button></>}>
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">¿Confirmas retirar a {deleteTarget?.fullName} del directorio activo? Su historial médico se conservará.</p>
        {archivePatient.isError ? <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{archivePatient.error instanceof Error ? archivePatient.error.message : 'No se pudo eliminar el paciente. Intenta de nuevo.'}</p> : null}
      </Modal>
    </div>
  );
}

