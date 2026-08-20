const CACHE_NAME = "imla-cache-v3";
const ARQUIVOS_ESSENCIAIS = ["/icons/icon-192.png", "/icons/icon-512.png", "/icons/icon-maskable-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS_ESSENCIAIS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(chaves.filter((c) => c !== CACHE_NAME).map((c) => caches.delete(c)))
      )
  );
  self.clients.claim();
});

// Nunca cacheia rotas autenticadas/dinâmicas (/painel/*) nem o feed público —
// dados de alunos, padrinhos e novidades precisam sempre vir direto do servidor.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.pathname.startsWith("/painel") || url.pathname.startsWith("/rede-social")) return;

  // Páginas HTML (navegação): sempre busca a versão mais nova primeiro.
  // Só usa o cache se o usuário estiver offline. Isso evita o app instalado
  // ficar preso numa versão antiga depois de um novo deploy.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Demais arquivos estáticos (JS/CSS com hash, ícones): cache-first é seguro,
  // porque o nome do arquivo muda a cada versão nova.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      });
    })
  );
});
