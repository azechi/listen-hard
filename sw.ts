/// <reference lib="webworker" />
/// <reference types="vite/client" />

export type { };
declare const self: ServiceWorkerGlobalScope;

self.addEventListener("install", event =>{
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event =>{
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {

    const req = event.request;
    if (req.mode != "navigate") {
        return;
    }

    // http, httpsのpathnameは決して空文字列にはならない (file://も)
    // https://developer.mozilla.org/ja/docs/Web/API/URL/pathname
    const path = new URL(req.url).pathname;
    if (["/", "/index", "/index.html"].includes(path)) {
        event.respondWith((async () => {
            const res = await fetch(req);
            return new Response(res.body, {
                ...res,
                headers: new Headers([
                    ...[...res.headers],
                    ["Cross-Origin-Embedder-Policy", "require-corp"],
                    ["Cross-Origin-Opener-Policy", "same-origin"],])
            })
        })());
    }
});
