/**
 * Service worker — samo za push notifikacije.
 *
 * Namerno ne kešira ništa. Angular-ov ngsw bi preuzeo i keširanje, pa bi
 * aplikacija na početnom ekranu telefona umela da ostane na staroj verziji
 * dok se keš ne osveži. Ovako nove verzije i dalje stižu čim se app otvori,
 * a push radi jer za njega service worker mora da postoji.
 */

self.addEventListener('install', () => {
  // Novi worker preuzima odmah, bez čekanja da se zatvore svi tabovi.
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('push', (e) => {
  let p = {};
  try {
    p = e.data ? e.data.json() : {};
  } catch {
    // Ako sadržaj nije JSON, bolje prikazati nešto nego ništa.
    p = { title: 'Dnevnik trudnoće', body: e.data ? e.data.text() : '' };
  }

  const naslov = p.title || 'Dnevnik trudnoće';
  e.waitUntil(
    self.registration.showNotification(naslov, {
      body: p.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      // Isti tag znači da nova notifikacija zameni staru umesto da se gomilaju.
      tag: p.tag || 'dnevnik',
      data: { putanja: p.putanja || '/home' },
      requireInteraction: false,
    }),
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const putanja = (e.notification.data && e.notification.data.putanja) || '/home';

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((prozori) => {
      // Ako je aplikacija već otvorena, ne otvara se novi prozor nego se
      // postojeći izvuče u prvi plan i odvede na pravo mesto.
      for (const p of prozori) {
        if ('focus' in p) {
          p.navigate(putanja).catch(() => {});
          return p.focus();
        }
      }
      return self.clients.openWindow(putanja);
    }),
  );
});
