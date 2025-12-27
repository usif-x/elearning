const CACHE_NAME = "dahheha-medical-v1";
const OFFLINE_URL = "/offline";

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  "/offline",
  "/",
  "/favicon.ico",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
];

// Install event - cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Try to cache assets, but don't fail if some aren't available
      await Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`Failed to cache ${url}:`, err);
          })
        )
      );
    })()
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Enable navigation preload if supported
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }

      // Clean up old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })()
  );
  // Tell the active service worker to take control immediately
  self.clients.claim();
});

// Fetch event - network first, fallback to cache, then offline page
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip chrome extension requests
  if (event.request.url.startsWith("chrome-extension://")) {
    return;
  }

  // Handle navigation requests (page loads)
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // Try navigation preload first
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          // Try network
          const networkResponse = await fetch(event.request);

          // Cache successful responses
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
          }

          return networkResponse;
        } catch (error) {
          // Network failed, try cache
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // Show offline page
          const offlineResponse = await caches.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }

          // Fallback response if offline page isn't cached
          return new Response(
            `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>لا يوجد اتصال</title>
                <style>
                  body {
                    font-family: system-ui, -apple-system, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-align: center;
                    padding: 20px;
                  }
                  .container {
                    max-width: 500px;
                  }
                  h1 {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                  }
                  p {
                    font-size: 1.2rem;
                    margin-bottom: 2rem;
                  }
                  button {
                    background: white;
                    color: #667eea;
                    border: none;
                    padding: 12px 32px;
                    font-size: 1rem;
                    font-weight: bold;
                    border-radius: 8px;
                    cursor: pointer;
                  }
                  button:hover {
                    opacity: 0.9;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>⚠️ لا يوجد اتصال بالإنترنت</h1>
                  <p>يرجى التحقق من اتصالك والمحاولة مرة أخرى</p>
                  <button onclick="window.location.reload()">إعادة المحاولة</button>
                </div>
              </body>
            </html>
            `,
            {
              headers: { "Content-Type": "text/html; charset=utf-8" },
            }
          );
        }
      })()
    );
    return;
  }

  // Handle other requests (assets, API calls, etc.)
  event.respondWith(
    (async () => {
      try {
        // Try network first
        const networkResponse = await fetch(event.request);

        // Cache successful responses for same-origin requests
        if (
          networkResponse.ok &&
          event.request.url.startsWith(self.location.origin)
        ) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }

        return networkResponse;
      } catch (error) {
        // Network failed, try cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Return a fallback for images
        if (event.request.destination === "image") {
          return new Response(
            '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#e5e7eb"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="sans-serif" font-size="14">Image Unavailable</text></svg>',
            { headers: { "Content-Type": "image/svg+xml" } }
          );
        }

        throw error;
      }
    })()
  );
});

// Listen for messages from the client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
