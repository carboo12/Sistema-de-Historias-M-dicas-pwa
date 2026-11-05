import { useEffect, useMemo, useState } from 'react';
import { Check, Printer, Save, Settings, Stethoscope } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/data';
import { useAuth } from '../auth/AuthProvider';
import { Button, Field, Input, Select } from '../components/ui';

const STORAGE_KEY = 'historias-medicas:clinic-preferences:v1';

interface ClinicPreferences {
  clinicName: string;
  doctorName: string;
  specialty: string;
  paperSize: 'letter' | 'a4';
  showClinicName: boolean;
  showDoctorName: boolean;
}

function readPreferences(): Partial<ClinicPreferences> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<ClinicPreferences>;
  } catch {
    return {};
  }
}

export function SettingsPage() {
  const { user } = useAuth();
  const catalogsQuery = useQuery({ queryKey: ['catalogs'], queryFn: () => api.catalogs() });
  const catalogSpecialties = useMemo(
    () => catalogsQuery.data?.specialties.map((item) => item.name) ?? [],
    [catalogsQuery.data]
  );
  const saved = useMemo(() => readPreferences(), []);
  const [preferences, setPreferences] = useState<ClinicPreferences>({
    clinicName: saved.clinicName ?? user?.clinicName ?? '',
    doctorName: saved.doctorName ?? user?.fullName ?? '',
    specialty: saved.specialty ?? '',
    paperSize: saved.paperSize ?? 'letter',
    showClinicName: saved.showClinicName ?? true,
    showDoctorName: saved.showDoctorName ?? true
  });
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (!preferences.specialty && catalogSpecialties.length) {
      setPreferences((current) => ({ ...current, specialty: catalogSpecialties[0] }));
    }
  }, [catalogSpecialties, preferences.specialty]);

  const update = <K extends keyof ClinicPreferences>(key: K, value: ClinicPreferences[K]) => {
    setSavedNotice(false);
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    setSavedNotice(true);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
          <Settings className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-teal-700/60">Preferencias</p>
          <h2 className="mt-1 font-display text-3xl font-medium tracking-tight text-ink">Configuración</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/55">
            Personaliza los datos que identifican la clínica y el formato de impresión de recetas.
          </p>
        </div>
      </div>

      <form onSubmit={save} className="space-y-5">
        <section className="card p-5 sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <Stethoscope className="h-5 w-5 text-teal-700" />
            <div>
              <h3 className="font-bold text-ink">Datos de la clínica</h3>
              <p className="mt-0.5 text-xs text-ink/45">Se usan como referencia en esta instalación.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre de la clínica">
              <Input value={preferences.clinicName} onChange={(event) => update('clinicName', event.target.value)} placeholder="Nombre de la clínica" />
            </Field>
            <Field label="Médico principal">
              <Input value={preferences.doctorName} onChange={(event) => update('doctorName', event.target.value)} placeholder="Nombre del profesional" />
            </Field>
            <Field label="Especialidad" hint={catalogSpecialties.length ? 'Opciones tomadas del catálogo de la clínica.' : 'Puedes escribir la especialidad principal.'}>
              {catalogSpecialties.length ? (
                <Select value={preferences.specialty} onChange={(event) => update('specialty', event.target.value)}>
                  <option value="">Seleccionar especialidad</option>
                  {catalogSpecialties.map((specialty) => <option key={specialty} value={specialty}>{specialty}</option>)}
                  {!catalogSpecialties.includes(preferences.specialty) && preferences.specialty ? <option value={preferences.specialty}>{preferences.specialty}</option> : null}
                </Select>
              ) : (
                <Input value={preferences.specialty} onChange={(event) => update('specialty', event.target.value)} placeholder="Ej. Medicina general" />
              )}
            </Field>
          </div>
        </section>

        <section className="card p-5 sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <Printer className="h-5 w-5 text-teal-700" />
            <div>
              <h3 className="font-bold text-ink">Impresión de recetas</h3>
              <p className="mt-0.5 text-xs text-ink/45">Define el papel y los datos que quieres incluir al imprimir.</p>
            </div>
          </div>
          <div className="max-w-sm">
            <Field label="Tamaño del papel">
              <Select value={preferences.paperSize} onChange={(event) => update('paperSize', event.target.value as ClinicPreferences['paperSize'])}>
                <option value="letter">Carta</option>
                <option value="a4">A4</option>
              </Select>
            </Field>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line/70 p-4">
              <input className="mt-1 accent-teal-700" type="checkbox" checked={preferences.showClinicName} onChange={(event) => update('showClinicName', event.target.checked)} />
              <span><span className="block text-sm font-semibold text-ink">Mostrar nombre de la clínica</span><span className="mt-1 block text-xs text-ink/45">Identifica el origen de la receta impresa.</span></span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line/70 p-4">
              <input className="mt-1 accent-teal-700" type="checkbox" checked={preferences.showDoctorName} onChange={(event) => update('showDoctorName', event.target.checked)} />
              <span><span className="block text-sm font-semibold text-ink">Mostrar médico principal</span><span className="mt-1 block text-xs text-ink/45">Incluye el profesional en el encabezado.</span></span>
            </label>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" icon={<Save className="h-4 w-4" />}>Guardar preferencias</Button>
          {savedNotice ? <span role="status" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800"><Check className="h-4 w-4" />Preferencias guardadas en este dispositivo</span> : null}
        </div>
      </form>
    </div>
  );
}
