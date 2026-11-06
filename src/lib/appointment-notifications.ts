import type { Appointment } from '../types';

const notifiedKey = 'orthospine:appointment-notifications';
const reminderLeadMs = 15 * 60_000;

function readNotified(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(notifiedKey) ?? '[]') as string[]); }
  catch { return new Set(); }
}

function saveNotified(ids: Set<string>) {
  localStorage.setItem(notifiedKey, JSON.stringify([...ids].slice(-200)));
}

export async function requestAppointmentNotifications() {
  if (!('Notification' in window)) return 'unsupported' as const;
  const permission = await Notification.requestPermission();
  return permission;
}

export async function notifyUpcomingAppointments(appointments: Appointment[]) {
  if (!('Notification' in window) || Notification.permission !== 'granted' || !('serviceWorker' in navigator)) return;
  const now = Date.now();
  const notified = readNotified();
  for (const appointment of appointments) {
    if (!['programada', 'confirmada'].includes(appointment.status)) continue;
    const startsAt = new Date(appointment.startsAt).getTime();
    const notificationKey = `${appointment.id}:${appointment.startsAt}`;
    if (startsAt <= now || startsAt - now > reminderLeadMs || notified.has(notificationKey)) continue;
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification('Cita próxima · ORTHO SPINE CENTER', {
      body: `${appointment.patientName} · ${new Intl.DateTimeFormat('es-NI', { hour: '2-digit', minute: '2-digit' }).format(new Date(appointment.startsAt))}`,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: notificationKey,
      data: { url: `/pacientes/${appointment.patientId}` }
    });
    notified.add(notificationKey);
  }
  saveNotified(notified);
}

export function installAppointmentNotificationClickHandler() {
  if (!('serviceWorker' in navigator)) return;
  void navigator.serviceWorker.ready.then((registration) => {
    // Workbox's generated worker owns notificationclick; this listener is retained for custom workers.
    registration.active?.postMessage({ type: 'APPOINTMENT_NOTIFICATIONS_READY' });
  });
}
