/// <reference lib="webworker" />

export type { };
declare const self: ServiceWorkerGlobalScope;

self.addEventListener("install", event =>{
    event.waitUntil(self.caches.open("1").then(cache =>{
        return cache.add("index.html");
    }));
});

self.addEventListener("fetch", event => {
    const req = event.request;
    if (req.mode != "navigate" || req.url != self.registration.scope) {
        return;
    }

    event.respondWith((async () => {
        const res = (await self.caches.match("index.html"))!;
        return new Response(res.body, {
            ...res,
            headers: new Headers([
                ...[...res.headers],
                ["Cross-Origin-Embedder-Policy", "require-corp"],
                ["Cross-Origin-Opener-Policy", "same-origin"],])
        })
    })());
});