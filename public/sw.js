import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache static resources
precacheAndRoute(self.__WB_MANIFEST);

// Cache CDN resources
registerRoute(
  ({url}) => url.origin === 'https://cdnjs.cloudflare.com' ||
             url.origin === 'https://cdn.jsdelivr.net',
  new CacheFirst({
    cacheName: 'cdn-cache',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        maxEntries: 50,
      }),
    ],
  })
);

// Network first for API calls
registerRoute(
  ({request}) => request.destination === 'script' ||
                 request.destination === 'style',
  new NetworkFirst({
    cacheName: 'dynamic-resources',
  })
);