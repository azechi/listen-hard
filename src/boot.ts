

// type=moduleなscriptはDOMContentLoadedの直前のタイミング(DOMツリーは構築されている)で実行される
// type=moduleはdefer=trueと同じタイミングで実行される
// asyncはDOMツリーの構築を待たずにリソースが到着したらページロードをブロックして実行される
console.debug("boot.ts", document.readyState);

navigator.serviceWorker.register("./sw.js", { type: 'module' }) // scopeは指定していないので、sw.jsのあるフォルダになる。末尾のスラッシュ付き
    .then(reg => {
        // もしキャッシュがあればリクエストされない、ただしキャッシュが有効なのは最大で24時間まで(chromeの場合)
        reg.update() // 戻り値は呼び出したのと同じServiceWorkerRegistrationのPromiseか
    });

navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
});

const app = await import('./app');
const [audio, segments, _] = await Promise.all([app.getAudioSrc(), app.getSegments(), await import('./app-element')]);

if (document.readyState == "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        console.debug("DOMContentLoaded EventListener", document.readyState)
        start();
    }, { once: true });
} else {
    start();
}

function start() {
    const el = document.createElement('app-element');
    el.audioSrc = audio;
    el.segments = segments ?? [];
    document.body.appendChild(el);
}
