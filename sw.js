/*
 * Service worker : garde une copie de l'horloge dans le navigateur pour qu'elle
 * fonctionne sans internet une fois chargée (GitHub Pages / https uniquement).
 * Changer VERSION à chaque mise à jour des fichiers.
 */
var VERSION = 'horloge-v5';
var FICHIERS = [
  './', 'index.html', 'style.css?v=5', 'app.js?v=5', 'config-exemple.js?v=5', 'manifest.webmanifest',
  'icones/icone-192.png', 'icones/icone-512.png',
  'images/maison.svg', 'images/accueil.svg', 'images/rassemblement.svg', 'images/ateliers.svg',
  'images/collation.svg', 'images/recreation.svg', 'images/gym.svg', 'images/diner.svg',
  'images/calme.svg', 'images/musique.svg', 'images/bibliotheque.svg', 'images/peinture.svg',
  'images/sortie.svg', 'images/aurevoir.svg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FICHIERS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (cles) {
    return Promise.all(cles.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  // Page : d'abord internet (pour recevoir les mises à jour), sinon la copie gardée
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(function (r) {
      var copie = r.clone(); caches.open(VERSION).then(function (c) { c.put(e.request, copie); }); return r;
    }).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match('index.html'); }); }));
    return;
  }
  // Autres fichiers : la copie gardée d'abord, sinon internet
  e.respondWith(caches.match(e.request).then(function (r) {
    return r || fetch(e.request).then(function (rep) {
      if (rep.ok && new URL(e.request.url).origin === location.origin) {
        var copie = rep.clone(); caches.open(VERSION).then(function (c) { c.put(e.request, copie); });
      }
      return rep;
    });
  }));
});
