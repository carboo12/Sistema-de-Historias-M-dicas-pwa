import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileSpreadsheet, Printer, Users } from 'lucide-react';
import { api } from '../lib/api';
import type { ReportsDataset } from '../types';
import { Button, Field, Input, PageHeader, Select, Spinner } from '../components/ui';
import { ApiError } from '../lib/api';

const today = new Date();
const datePart = (date: Date) => date.toISOString().slice(0, 10);
const monthStart = datePart(new Date(today.getFullYear(), today.getMonth(), 1));
const todayPart = datePart(today);
const formatDate = (value: string) => new Date(value).toLocaleDateString('es-NI', { dateStyle: 'medium' });

function csvCell(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function downloadCsv(filename: string, rows: unknown[][]) {
  const csv = '\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function ageAt(birthDate: string | null, now = new Date()) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

function sexLabel(sex: string) {
  return ({ M: 'Masculino', F: 'Femenino', X: 'Otro', U: 'Sin especificar' } as Record<string, string>)[sex] ?? sex;
}

export function ReportsPage() {
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(todayPart);
  const [doctor, setDoctor] = useState('');
  const [reason, setReason] = useState('');
  const query = useQuery({
    queryKey: ['reports', from, to],
    queryFn: () => api.reports.get(from, to),
    enabled: Boolean(from && to && from <= to)
  });
  const dataset: ReportsDataset = query.data ?? { consultations: [], patients: [] };
  const unauthorized = query.error instanceof ApiError && query.error.status === 401;
  const isEmpty = !query.isLoading && (!query.isError || unauthorized)
    && dataset.consultations.length === 0 && dataset.patients.length === 0;
  const doctors = useMemo(() => [...new Set(dataset.consultations.map((row) => row.professionalName).filter(Boolean))].sort(), [dataset.consultations]);
  const consultations = useMemo(() => dataset.consultations.filter((row) =>
    (!doctor || row.professionalName === doctor) && (!reason || row.reason?.toLocaleLowerCase().includes(reason.toLocaleLowerCase()))
  ), [dataset.consultations, doctor, reason]);
  const demographics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const patient of dataset.patients) {
      const label = sexLabel(patient.sex);
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [dataset.patients]);
  const ageBands = useMemo(() => {
    const bands = new Map([['0–17', 0], ['18–39', 0], ['40–59', 0], ['60+', 0], ['Sin fecha de nacimiento', 0]]);
    for (const patient of dataset.patients) {
      const age = ageAt(patient.birthDate);
      const label = age === null ? 'Sin fecha de nacimiento' : age < 18 ? '0–17' : age < 40 ? '18–39' : age < 60 ? '40–59' : '60+';
      bands.set(label, (bands.get(label) ?? 0) + 1);
    }
    return [...bands.entries()];
  }, [dataset.patients]);
  const print = () => window.print();

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <PageHeader eyebrow="Indicadores clínicos" title="Reportes" description="Consulta la actividad y las altas de pacientes en el periodo seleccionado." actions={<Button variant="secondary" icon={<Printer className="h-4 w-4" />} onClick={print}>Imprimir / guardar PDF</Button>} />

      <section className="no-print card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Desde"><Input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} /></Field>
        <Field label="Hasta"><Input type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} /></Field>
        <Field label="Médico"><Select value={doctor} onChange={(event) => setDoctor(event.target.value)}><option value="">Todos los médicos</option>{doctors.map((name) => <option key={name} value={name}>{name}</option>)}</Select></Field>
        <Field label="Motivo de consulta"><Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Filtrar por texto…" /></Field>
      </section>

      {query.isLoading ? <div className="card flex items-center justify-center gap-3 p-12 text-sm text-ink/55"><Spinner />Cargando reportes…</div> : null}
      {query.isError && !unauthorized ? <div className="card p-6 text-sm text-ink/60"><p>No se pudieron cargar los reportes en este momento.</p><Button className="mt-3" size="sm" variant="secondary" onClick={() => void query.refetch()}>Reintentar</Button></div> : null}
      {isEmpty ? <section className="card p-8 text-center"><h2 className="font-bold text-ink">No hay datos estadísticos para este período</h2><p className="mt-1 text-sm text-ink/50">Prueba con otro rango de fechas para consultar la actividad de la clínica.</p><Button className="no-print mt-4" variant="secondary" onClick={() => { setFrom(monthStart); setTo(todayPart); }}>Usar el período actual</Button></section> : null}
      {query.data && !isEmpty ? <>
        {consultations.length === 0 && dataset.patients.length === 0 ? <section className="card p-8 text-center"><h2 className="font-bold text-ink">No hay datos estadísticos para este período</h2><p className="mt-1 text-sm text-ink/50">Prueba con otro rango de fechas o ajusta los filtros.</p><Button className="no-print mt-4" variant="secondary" onClick={() => { setFrom(monthStart); setTo(todayPart); setDoctor(''); setReason(''); }}>Cambiar período y filtros</Button></section> : null}
        <section className="grid gap-4 sm:grid-cols-2">
          <Metric icon={<FileSpreadsheet className="h-5 w-5" />} label="Consultas en el periodo" value={consultations.length} note="Con filtros aplicados" />
          <Metric icon={<Users className="h-5 w-5" />} label="Pacientes nuevos" value={dataset.patients.length} note="Altas durante el periodo" />
        </section>

        <section className="card overflow-hidden">
          <ReportHeading title="Reporte de consultas" description={`${formatDate(from)} al ${formatDate(to)} · ${consultations.length} registros`} onExport={() => downloadCsv('consultas.csv', [['Fecha', 'Paciente', 'Expediente', 'Médico', 'Motivo'], ...consultations.map((row) => [formatDate(row.consultedAt), row.patientName, row.recordNumber, row.professionalName, row.reason])])} />
          <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-canvas/70 text-[11px] uppercase tracking-wide text-ink/45"><tr>{['Fecha', 'Paciente', 'Médico', 'Motivo'].map((label) => <th key={label} className="px-5 py-3 font-bold">{label}</th>)}</tr></thead><tbody className="divide-y divide-line/60">{consultations.map((row) => <tr key={row.id} className="text-ink/75"><td className="px-5 py-3">{formatDate(row.consultedAt)}</td><td className="px-5 py-3"><span className="font-semibold text-ink">{row.patientName}</span><span className="block text-xs text-ink/45">{row.recordNumber}</span></td><td className="px-5 py-3">{row.professionalName}</td><td className="px-5 py-3">{row.reason || '—'}</td></tr>)}</tbody></table>{consultations.length === 0 ? <p className="p-8 text-center text-sm text-ink/45">No hay consultas con esos filtros.</p> : null}</div>
        </section>

        <section className="grid">
          <div className="card overflow-hidden">
            <ReportHeading title="Altas y datos demográficos" description={`${dataset.patients.length} pacientes registrados en el periodo.`} onExport={() => downloadCsv('pacientes-nuevos.csv', [['Fecha de alta', 'Sexo', 'Edad al día de hoy'], ...dataset.patients.map((patient) => [formatDate(patient.createdAt), sexLabel(patient.sex), ageAt(patient.birthDate) ?? 'Sin dato'])])} />
            <div className="grid gap-6 p-5 sm:grid-cols-2"><div><h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink/45">Por sexo</h3>{demographics.map(([label, count]) => <div key={label} className="flex justify-between border-b border-line/60 py-2 text-sm"><span>{label}</span><b>{count}</b></div>)}{!demographics.length ? <p className="text-sm text-ink/45">Sin registros.</p> : null}</div><div><h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink/45">Por grupo de edad</h3>{ageBands.filter(([, count]) => count > 0).map(([label, count]) => <div key={label} className="flex justify-between border-b border-line/60 py-2 text-sm"><span>{label} años</span><b>{count}</b></div>)}{!dataset.patients.length ? <p className="text-sm text-ink/45">Sin registros.</p> : null}</div></div>
          </div>
        </section>
      </> : null}
    </div>
  );
}

function Metric({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: number; note: string }) {
  return <article className="card flex items-center gap-4 p-5"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">{icon}</span><div><p className="text-xs font-semibold text-ink/50">{label}</p><p className="font-display text-3xl font-medium text-ink">{value}</p><p className="text-[11px] text-ink/40">{note}</p></div></article>;
}

function ReportHeading({ title, description, onExport }: { title: string; description: string; onExport: () => void }) {
  return <header className="flex flex-col gap-3 border-b border-line/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-ink">{title}</h2><p className="mt-0.5 text-xs text-ink/45">{description}</p></div><Button className="no-print shrink-0" size="sm" variant="secondary" icon={<Download className="h-4 w-4" />} onClick={onExport}>Exportar CSV / Excel</Button></header>;
}
