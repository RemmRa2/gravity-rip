const CACHE_NAME = 'gravity-rip-cache-v4';
const APP_SHELL = [
    './',
    './index.html',
    './script.js',
    './style.css',
    './sws.js',
    './sw.js'
];

// Cache the app shell only after every required file is available.
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

// Remove caches from older versions, then take control of open pages.
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Keep external requests, non-GET requests, and browser-only schemes untouched.
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    if (
        event.request.method !== 'GET' ||
        requestUrl.origin !== self.location.origin ||
        !['http:', 'https:'].includes(requestUrl.protocol)
    ) {
        return;
    }

    event.respondWith((async () => {
        const cachedResponse = await caches.match(event.request);

        // Prefer the network for navigations so normal reloads receive updates.
        if (event.request.mode === 'navigate') {
            try {
                return await fetch(event.request);
            } catch {
                return cachedResponse || caches.match('./index.html');
            }
        }

        // App assets can be served from cache and refreshed in the background.
        if (cachedResponse) {
            event.waitUntil(
                fetch(event.request)
                    .then((response) => {
                        if (response.ok) {
                            return caches.open(CACHE_NAME)
                                .then((cache) => cache.put(event.request, response));
                        }
                    })
                    .catch(() => undefined)
            );
            return cachedResponse;
        }

        try {
            const response = await fetch(event.request);
            if (response.ok) {
                const cache = await caches.open(CACHE_NAME);
                await cache.put(event.request, response.clone());
            }
            return response;
        } catch (error) {
            // Preserve the normal network error for uncached resources.
            throw error;
        }
    })());
});
