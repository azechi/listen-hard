import * as app from './app';


// type=moduleなscriptはDOMContentLoadedの直前のタイミング(DOMツリーは構築されている)で実行される
// type=moduleはdefer=trueと同じタイミングで実行される
// asyncはDOMツリーの構築を待たずにリソースが到着したらページロードをブロックして実行される
console.info("boot.ts", document.readyState);

const [audio, segments, _] = await Promise.all([app.getFile('audio'), app.getSegments(), await import('./app-element')]);


if (audio == null || segments == null) {
    document.location = "file.html";
}

if (document.readyState == "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        console.info("DOMContentLoaded EventListener", document.readyState)
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
