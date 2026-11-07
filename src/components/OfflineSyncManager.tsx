import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { syncOfflineConsultations } from '../lib/offline-consultation-sync';

export function OfflineSyncManager() {
  const { user, status } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const syncing = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || !user?.id) return;
    const sync = async (port?: MessagePort) => {
      if (syncing.current) {
        port?.postMessage({ ok: true });
        return;
      }
      if (!navigator.onLine) {
        if (!navigator.onLine) port?.postMessage({ ok: false, message: 'Sin conexión' });
        return;
      }
      syncing.current = true;
      try {
        const completed = await syncOfflineConsultations(user.id);
        if (completed.length) {
          void Promise.all([
            queryClient.invalidateQueries({ queryKey: ['consultation'] }),
            queryClient.invalidateQueries({ queryKey: ['consultations'] }),
            queryClient.invalidateQueries({ queryKey: ['patient'] }),
            queryClient.invalidateQueries({ queryKey: ['agenda'] })
          ]);
          for (const item of completed) {
            if (location.pathname === `/consultas/${item.fromId}` && item.fromId !== item.toId) {
              navigate(`/consultas/${item.toId}`, { replace: true });
            }
          }
          window.dispatchEvent(new CustomEvent('offline-consultations-synced', { detail: { completed } }));
        }
        port?.postMessage({ ok: true });
      } catch (cause) {
        port?.postMessage({ ok: false, message: cause instanceof Error ? cause.message : 'No se pudo sincronizar.' });
      } finally {
        syncing.current = false;
      }
    };
    const onOnline = () => { void sync(); };
    const onWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_OFFLINE_CONSULTATIONS') void sync(event.ports[0]);
    };
    window.addEventListener('online', onOnline);
    navigator.serviceWorker?.addEventListener('message', onWorkerMessage);
    if (navigator.onLine) void sync();
    return () => {
      window.removeEventListener('online', onOnline);
      navigator.serviceWorker?.removeEventListener('message', onWorkerMessage);
    };
  }, [location.pathname, navigate, queryClient, status, user?.id]);

  return null;
}
