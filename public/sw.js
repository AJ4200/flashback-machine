const VERSION = "retronet-v1";
const SHELL_CACHE = `${VERSION}:shell`;
const GAME_CACHE = `${VERSION}:games`;
const RUNTIME_CACHE = `${VERSION}:runtime`;

const SHELL_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/icons/retronet-192.png",
  "/icons/retronet-512.png",
  "/icons/retronet-maskable-512.png",
  "/games/flashlist.json",
  "/ruffle/ruffle.js",
  "/ruffle/core.ruffle.8700c6b0144208de9d1b.js",
  "/ruffle/core.ruffle.99037c3e46986c91597b.js",
  "/ruffle/2ff4ebe4b64161970b9a.wasm",
  "/ruffle/a92f6442b0f55013a937.wasm",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![SHELL_CACHE, GAME_CACHE, RUNTIME_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  const urls = event.data?.type === "CACHE_URLS" ? event.data.urls : null;

  if (!Array.isArray(urls)) {
    return;
  }

  event.waitUntil(
    caches.open(RUNTIME_CACHE).then((cache) =>
      Promise.all(
        urls.map((url) =>
          cache.add(url).catch(() => {
            return undefined;
          }),
        ),
      ),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, SHELL_CACHE, "/"));
    return;
  }

  if (url.pathname.startsWith("/games/")) {
    event.respondWith(cacheFirst(request, GAME_CACHE));
    return;
  }

  if (url.pathname.startsWith("/ruffle/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/_next/")) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    cache.put(request, response.clone());
  }

  return response;
}

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    if (fallbackUrl) {
      const fallback = await cache.match(fallbackUrl);

      if (fallback) {
        return fallback;
      }
    }

    throw new Error("RetroNet is offline and this asset was not cached.");
  }
}
