const CACHE_NAME = 'kas-peleton-v1';
const ASSETS = [
    './',
    'index.html',
    'video.html',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/icon?family=Material+Icons+Round'
];

// Install Service Worker & Cache UI Assets
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activate & Clear Old Cache
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Cache-First Strategy with Network Fallback for UI Shell
self.addEventListener('fetch', (e) => {
    if (e.request.url.includes('script.google.com')) {
        return; // Biarkan request database Google Apps Script dihandle oleh logic localStorage di index.html
    }
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                fetch(e.request).then((networkResponse) => {
                    if (networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
                    }
                }).catch(() => {/* Network offline fallback silently */ });
                return cachedResponse;
            }
            return fetch(e.request);
        })
    );
});