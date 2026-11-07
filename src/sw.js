import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { createHandlerBoundToURL } from 'workbox-precaching';

self.skipWaiting();
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html'), {
  denylist: [/^\/api\//, /^\/assets\//]
}));

self.addEventListener('sync', (event) => {
  if (event.tag !== 'sync-offline-consultations') return;
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const client = clients.find((entry) => entry.visibilityState === 'visible') ?? clients[0];
    if (!client) throw new Error('Abre ORTHO SPINE CENTER para completar la sincronización pendiente.');

    const channel = new MessageChannel();
    const acknowledged = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('La sincronización sigue pendiente.')), 25_000);
      channel.port1.onmessage = (message) => {
        clearTimeout(timeout);
        if (message.data?.ok) resolve();
        else reject(new Error(message.data?.message ?? 'No se pudo sincronizar.'));
      };
    });
    client.postMessage({ type: 'SYNC_OFFLINE_CONSULTATIONS' }, [channel.port2]);
    await acknowledged;
  })());
});
