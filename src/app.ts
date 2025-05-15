
export type type = "e" | "j" | "x";
export type Segment = [index: number, type: type,  start: number, duration: number];

export function getSegments  () {
  return new Promise<Segment[] | undefined>(resolve => {
    const conn = window.indexedDB.open("db", 1);
    conn.onupgradeneeded = e => {
        const db = (<IDBOpenDBRequest>e.target).result;
        db.createObjectStore("segments");
    }

    conn.onsuccess = e => {
        const db = (<IDBOpenDBRequest>e.target).result;
        const tr = db.transaction("segments");
        const tbl = tr.objectStore("segments");
        tbl.get("value").onsuccess = e => {
            const val = (<IDBRequest>e.target).result;
            resolve(val);
        }
    }
});
}

/** Requires transient activation, otherwise a NotAllowedError will be thrown. */
export async function downloadSegmentsCSV() {

  const data = (await getSegments())??[];

  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["startAt,duration,type,content\r\n", data.map(x => x.join(",")).join('\r\n')], { type: "text/csv" }));
  a.download = "audio_segments.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function getFile(name: string) {
  return navigator.storage.getDirectory()
    .then(dir => dir.getFileHandle(name))
    .then(hndl => hndl.getFile())
    .catch(
      (e) => {
        if (e.name === 'NotFoundError') {
          return undefined
        }
        throw e;
      });
}

export async function deleteFile(name: string) {
  const root = await navigator.storage.getDirectory();
  await root.removeEntry(name);
}

/** Requires transient activation, otherwise a NotAllowedError will be thrown. */
export async function importFile(name: string) {
  const file = await pickFile();

  if (file != null) {
    await saveFile(file, name);
  }
}















async function saveFile(file: File, name: string) {

  // iso safariはworkerを使う必要があるまだ実装していない

  const root = await navigator.storage.getDirectory();
  const hndl = await root.getFileHandle(name, { create: true });
  const ws = await hndl.createWritable();
  await ws.write(file).finally(() => ws.close());
}


/** Requires transient activation, otherwise a NotAllowedError will be thrown. */
function pickFile() {
  return ('showOpenFilePicker' in window)
    ? pickFile_showOpenFilePicker()
    : pickFile_inputElementPicker()
    ;
}

/** Requires transient activation, otherwise a NotAllowedError will be thrown. */
async function pickFile_showOpenFilePicker() {
  try {
    const [handle,] = await showOpenFilePicker();
    return await handle.getFile();
  } catch (e: any) {
    if (e.name !== "AbortError") {
      throw e;
    }
    return undefined;
  }
}

/** Requires transient activation, otherwise a NotAllowedError will be thrown. */
function pickFile_inputElementPicker() {

  // ピッカーをキャンセルしたときにはpromiseはsettledされない
  // けれど、promieseはelementからのみ参照してるから、
  // elementがスコープから外れたらpromiseも参照するものがいなくなる

  // showPickerは実行をブロックしない
  // Pickerが表示されている間はelementが生存しているから、Promiseも生きてる
  // picker.cancel -> element 死 -> promise 死
  // picker.ok -> element.dispatchEvent(change) -> resolve
  // たぶんそういう理屈でこのpromise, elementはリークしない

  // ちなみに、pickerのキャンセルでは'cancel'イベントが発火する
  // cancelイベントでresolveしてもいいかもしれない
  // 今回は上記の理屈(resolveしなくてもいい)を採用してcancelイベントでのresolveをしないことにした
  return new Promise<File | undefined>((resolve) => {

    const el = document.createElement("input");
    el.type = "file";

    el.addEventListener('change', () => {
      if (el.files!.length == 0) {
        return;
      }
      const file = el.files!.item(0)!;
      resolve(file);
    })

    el.showPicker();
  });
}

