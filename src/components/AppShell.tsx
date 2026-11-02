import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CircleHelp,
  ClipboardPlus,
  FileText,
  HeartPulse,
  LogOut,
  Plus,
  Settings,
  Stethoscope,
  Users,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useOnline } from '../lib/hooks';
import { cn } from '../lib/format';
import { Avatar, Button } from './ui';

const primaryNavigation = [
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/pacientes', label: 'Pacientes', icon: Users },
  { to: '/consultas', label: 'Consultas', icon: FileText }
];

const secondaryNavigation = [
  { label: 'Configuración', icon: Settings, soon: true },
  { label: 'Ayuda', icon: CircleHelp, soon: true }
];

function sectionTitle(pathname: string) {
  if (pathname.startsWith('/pacientes/')) return 'Expediente clínico';
  if (pathname.startsWith('/pacientes')) return 'Pacientes';
  if (pathname.startsWith('/consultas/')) return 'Consulta médica';
  if (pathname.startsWith('/consultas')) return 'Consultas';
  if (pathname.startsWith('/agenda')) return 'Agenda';
  return 'Historias Médicas';
}

export function AppShell() {
  const { user, logout } = useAuth();
  const online = useOnline();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen lg:pl-[264px]">
      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col bg-teal-950 px-4 py-5 text-white lg:flex">
        <Brand />
        <div className="mt-8">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/35">Espacio clínico</p>
          <nav className="mt-2 space-y-1">
            {primaryNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-7">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/35">Sistema</p>
          <nav className="mt-2 space-y-1">
            {secondaryNavigation.map((item) => (
              <button
                key={item.label}
                type="button"
                disabled
                className="nav-link w-full cursor-not-allowed opacity-45"
                title="Disponible en la siguiente fase"
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
                <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[9px] uppercase tracking-wider">
                  Pronto
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <Avatar name={user?.fullName ?? 'Usuario'} size="sm" className="bg-white/15 text-white ring-white/10" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{user?.fullName}</p>
              <p className="truncate text-[11px] capitalize text-white/45">{user?.role}</p>
            </div>
            <button
              type="button"
              onClick={() => void logout().then(() => navigate('/login'))}
              className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <header className="no-print sticky top-0 z-30 border-b border-line/60 bg-canvas/85 backdrop-blur-xl lg:bg-canvas/70">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-10">
          <div className="lg:hidden">
            <Brand compact />
          </div>
          <div className="hidden min-w-0 lg:block">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-ink/35">
              {user?.clinicName ?? 'Clínica'}
            </p>
            <h1 className="truncate text-sm font-bold text-ink">{sectionTitle(location.pathname)}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {!online ? (
              <span className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800 ring-1 ring-inset ring-amber-200 sm:inline-flex">
                <WifiOff className="h-3 w-3" />
                Sin conexión
              </span>
            ) : null}
            <Button
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/consultas/nueva')}
              className="hidden sm:inline-flex"
            >
              Nueva consulta
            </Button>
            <div className="lg:hidden">
              <Avatar name={user?.fullName ?? 'Usuario'} size="sm" />
            </div>
          </div>
        </div>
      </header>

      {!online ? (
        <div className="no-print bg-amber-500/10 px-4 py-2 text-center text-xs font-semibold text-amber-900 sm:hidden">
          Sin conexión. Puedes seguir redactando; guarda al recuperar la red.
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-[1480px] px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
        <Outlet />
      </main>

      <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-surface/95 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {primaryNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn('mobile-nav-link', isActive && 'mobile-nav-link-active')}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/consultas/nueva" className="mobile-nav-link">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm">
              <ClipboardPlus className="h-5 w-5" />
            </span>
            Nueva
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <span
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-2xl ring-1 ring-inset',
          compact
            ? 'bg-teal-50 text-teal-700 ring-teal-100'
            : 'bg-teal-400/15 text-teal-300 ring-teal-300/20'
        )}
      >
        <HeartPulse className="h-5 w-5" />
      </span>
      <div>
        <p
          className={cn(
            'font-display text-lg font-medium leading-none tracking-tight',
            compact ? 'text-ink' : 'text-white'
          )}
        >
          Historias
        </p>
        <p
          className={cn(
            'mt-0.5 text-[9px] font-extrabold uppercase tracking-[0.18em]',
            compact ? 'text-teal-700/60' : 'text-teal-300/70'
          )}
        >
          Médicas PWA
        </p>
      </div>
      {!compact ? <Stethoscope className="ml-auto h-4 w-4 text-white/20" /> : null}
    </div>
  );
}
