import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { ApiError } from '../lib/data';
import { useFirebaseBackend } from '../services/firebase/client';
import { Button, Input } from '../components/ui';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState(useFirebaseBackend ? '' : 'demo@clinica.local');
  const [password, setPassword] = useState(useFirebaseBackend ? '' : 'Demo1234!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? '/agenda';

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifier.trim(), password);
      navigate(from, { replace: true });
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-teal-950 px-12 py-10 text-white lg:flex lg:flex-col">
        <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '26px 26px' }} />

        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo-orthospine.png" alt="ORTHO SPINE CENTER" className="h-14 w-auto rounded-md bg-white object-contain p-1.5" />
          <div>
            <p className="font-display text-xl font-medium leading-none tracking-tight">Historias Médicas</p>
            <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.2em] text-teal-300/70">Clinical workspace</p>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-xl py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1.5 text-[11px] font-bold text-teal-200">
            <Sparkles className="h-3.5 w-3.5" />
            Diseñado para consultas reales
          </span>
          <h1 className="mt-6 font-display text-5xl font-medium leading-[1.08] tracking-tight text-white xl:text-6xl">
            La historia clínica que acompaña tu consulta.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-teal-100/60">
            Pacientes, agenda y consultas en un solo lugar. Rápido en el consultorio, seguro fuera de él.
          </p>

          <div className="mt-10 grid max-w-lg grid-cols-2 gap-3">
            {[
              ['4.652', 'pacientes'],
              ['11.493', 'consultas'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur">
                <p className="font-display text-2xl font-medium text-white">{value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-teal-200/50">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-[11px] text-teal-100/35">
          <ShieldCheck className="h-4 w-4" />
          Datos clínicos cifrados, auditoría y control de acceso por clínica.
        </div>
      </section>

      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="flex items-center gap-3 lg:hidden">
          <img src="/logo-orthospine.png" alt="ORTHO SPINE CENTER" className="h-12 w-auto rounded-md bg-white object-contain p-1" />
          <div>
            <p className="font-display text-xl font-medium tracking-tight text-ink">Historias Médicas</p>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-teal-700/60">Clinical workspace</p>
          </div>
        </div>

        <div className="my-auto w-full max-w-[420px] self-center py-10">
          <div className="mb-8">
            <p className="eyebrow mb-2">Bienvenido de nuevo</p>
            <h2 className="font-display text-4xl font-medium tracking-tight text-ink">Entra a tu clínica</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/50">
              Usa tu usuario o correo institucional para continuar.
            </p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <label className="block">
              <span className="label">{useFirebaseBackend ? 'Correo electrónico' : 'Usuario o correo'}</span>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
                <Input
                  className="pl-10"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  autoComplete="username"
                  placeholder={useFirebaseBackend ? 'tu@correo.com' : 'demo@clinica.local'}
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="label">Contraseña</span>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
                <Input
                  className="pl-10 pr-11"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="focus-ring absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink/40 hover:bg-ink/5 hover:text-ink"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : null}

            <Button type="submit" size="lg" loading={loading} className="w-full" icon={<ArrowRight className="h-4 w-4" />}>
              Entrar
            </Button>
          </form>

          {!useFirebaseBackend ? (
            <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
              <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-teal-800">Acceso de demostración</p>
                <p className="mt-1 text-sm leading-relaxed text-teal-900/65">
                  <span className="font-bold">demo@clinica.local</span>
                  <span className="mx-1.5 text-teal-900/30">/</span>
                  <span className="font-bold">Demo1234!</span>
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs font-bold text-teal-800 underline decoration-teal-300 underline-offset-2 hover:text-teal-950"
                  onClick={() => {
                    setIdentifier('demo@clinica.local');
                    setPassword('Demo1234!');
                  }}
                >
                  Usar estas credenciales
                </button>
              </div>
            </div>
          </div>

          ) : null}

          <p className="mt-8 text-center text-[11px] leading-relaxed text-ink/35">
            Al continuar aceptas las políticas de privacidad y el tratamiento seguro de datos clínicos.
          </p>
        </div>
      </section>
    </div>
  );
}
