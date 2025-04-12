/// <reference lib="webworker" />
/// <reference types="vite/client" />

export type { };
declare const self: ServiceWorkerGlobalScope;

self.addEventListener("fetch", event => {

    if (import.meta.env.MODE == "development"){
        return;
    }

    const req = event.request;
    if (req.mode != "navigate" || req.url != self.registration.scope) {
        return;
    }

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
});