

export const appInit = (async function appInit() {

  const audio = await getAudioSource();
  const csv = await getCSVFile()

  // return new Promise<{audio:string, csv:string}>(resolve => {
  //   setTimeout(()=> resolve({audio, csv}), 2000)
  // });
  return { audio, csv };
})();

async function getAudioSource() {
  const file = await getFile("audio");
  if (file == null) {
    return undefined;
  }
  return URL.createObjectURL(file)
}

async function getCSVFile() {
  const file = await getFile("csv");
  if (file == null) {
    return undefined;
  }

  const reader = new FileReader();
  const {promise, resolve} = Promise.withResolvers();
  reader.onload = resolve;
  reader.readAsText(file);
  await promise;
  return reader.result as string;
}

/** Requires transient activation, otherwise a NotAllowedError will be thrown. */
export async function importAudioSource() {

  const file = await pickFile();

  if (file != null) {
    await saveFile(file, "audio");
  }

  return getAudioSource();
}

export async function deleteAudioSource(url: string) {
  URL.revokeObjectURL(url)

  const root = await navigator.storage.getDirectory();
  await root.removeEntry("audio");
}

export async function deleteCSVFile() {
  const root = await navigator.storage.getDirectory();
  await root.removeEntry("csv");
}

/** Requires transient activation, otherwise a NotAllowedError will be thrown. */
export async function importCSVFile() {

  {
    const file = await pickFile();

    if (file != null) {
      await saveFile(file, "csv");
    }
  }

  return getCSVFile();
  
}

async function getFile(name: string) {
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

