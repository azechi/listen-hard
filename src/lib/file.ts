
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

export async function saveFile(file: File, name: string) {

  // safariでのOPFSの書き込みはworkerでcreateSyncAccessHandleを使う必要がある
  // さらに、safariはReadbleStreamはTransferableではない
  if (FileSystemFileHandle.prototype.createWritable === undefined) {
    const w = new Worker(new URL('./file.worker.ts', import.meta.url), { type: 'module' });
    const { port1, port2 } = new MessageChannel();
    w.postMessage([name, port2], [port2]);

    file.stream().pipeTo(new WritableStream({
      write(chunk) {
        port1.postMessage(chunk, [chunk.buffer]);
      },
      close() {
        port1.postMessage('EOF');
      }
    }));

    return;
  }

  const root = await navigator.storage.getDirectory();
  const hndl = await root.getFileHandle(name, { create: true });
  const ws = await hndl.createWritable();
  await ws.write(file).finally(() => ws.close());
}


/** Requires transient activation, otherwise a NotAllowedError will be thrown. */
export function pickFile() {
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

    // iOS 15.8.4ではtype=fileのshowPickerは無い
    //el.showPicker();
    el.click();
  });
}

