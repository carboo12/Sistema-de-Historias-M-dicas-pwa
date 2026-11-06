import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ChartNoAxesCombined,
  CircleHelp,
  ClipboardPlus,
  FileText,
  LogOut,
  Plus,
  Settings,
  Users,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useOnline } from '../lib/hooks';
import { notifyUpcomingAppointments, requestAppointmentNotifications } from '../lib/appointment-notifications';
import { api } from '../lib/api';
import { cn } from '../lib/format';
import { Avatar, Button } from './ui';
import { useEffect, useState } from 'react';

const primaryNavigation = [
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/pacientes', label: 'Pacientes', icon: Users },
  { to: '/consultas', label: 'Consultas', icon: FileText },
  { to: '/reportes', label: 'Reportes', icon: ChartNoAxesCombined }
];

const secondaryNavigation = [
  { to: '/configuracion', label: 'Configuración', icon: Settings },
  { to: '/ayuda', label: 'Ayuda', icon: CircleHelp }
];

function sectionTitle(pathname: string) {
  if (pathname.startsWith('/pacientes/')) return 'Expediente clínico';
  if (pathname.startsWith('/pacientes')) return 'Pacientes';
  if (pathname.startsWith('/consultas/')) return 'Consulta médica';
  if (pathname.startsWith('/consultas')) return 'Consultas';
  if (pathname.startsWith('/reportes')) return 'Reportes';
  if (pathname.startsWith('/agenda')) return 'Agenda';
  if (pathname.startsWith('/configuracion')) return 'Configuración';
  if (pathname.startsWith('/ayuda')) return 'Ayuda y soporte';
  return 'Historias Médicas';
}

export function AppShell() {
  const { user, logout } = useAuth();
  const online = useOnline();
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  useEffect(() => {
    if (notificationPermission !== 'granted') return;
    let active = true;
    const checkAppointments = async () => {
      try {
        const today = new Intl.DateTimeFormat('en-CA', { timeZone: user?.timezone ?? 'America/Managua', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
        const agenda = await api.agenda.get(today);
        if (active) await notifyUpcomingAppointments(agenda.appointments);
      } catch { /* Reminders should never interrupt normal navigation. */ }
    };
    void checkAppointments();
    const timer = window.setInterval(() => void checkAppointments(), 60_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [notificationPermission, user?.timezone]);

  async function enableAppointmentNotifications() {
    const permission = await requestAppointmentNotifications();
    setNotificationPermission(permission);
  }

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
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
              </NavLink>
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
            {notificationPermission === 'default' ? <Button size="sm" variant="secondary" className="hidden sm:inline-flex" onClick={() => void enableAppointmentNotifications()}>Activar avisos</Button> : null}
            {notificationPermission === 'default' ? <button type="button" aria-label="Activar notificaciones de citas" title="Activar avisos de citas" className="rounded-lg px-2 py-1 text-xs font-bold text-teal-800 hover:bg-teal-50 sm:hidden" onClick={() => void enableAppointmentNotifications()}>Avisos</button> : null}
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

      {notificationPermission === 'denied' ? <div className="no-print px-4 pt-3 text-center text-xs text-ink/45">Los avisos de citas están bloqueados en el navegador. Puedes habilitarlos desde la configuración del sitio.</div> : null}

      {!online ? (
        <div className="no-print bg-amber-500/10 px-4 py-2 text-center text-xs font-semibold text-amber-900 sm:hidden">
          Sin conexión. Puedes seguir redactando; guarda al recuperar la red.
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-[1480px] px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
        <Outlet />
      </main>

      <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-surface/95 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-around">
          {[...primaryNavigation, ...secondaryNavigation].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn('mobile-nav-link', isActive && 'mobile-nav-link-active')}
            >
              <item.icon className="h-5 w-5" />
              <span className="max-w-[4.5rem] truncate">{item.label}</span>
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
    <div className={cn('flex items-center px-1', compact ? 'h-12' : 'h-14')}>
      <img
        src="/logo-orthospine.png"
        alt="ORTHO SPINE CENTER"
        className={cn('max-w-full object-contain', compact ? 'h-10' : 'h-12')}
      />
    </div>
  );
}
