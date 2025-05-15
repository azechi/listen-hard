import './app-file';

// type=moduleなscriptはDOMContentLoadedの直前のタイミング(DOMツリーは構築されている)で実行される
// async=trueだったら、スクリプトがダウンロードされ次第ページのパースをブロックして実行される

const el = document.createElement('app-file');
await el.checkFileExists();
document.body.appendChild(el);