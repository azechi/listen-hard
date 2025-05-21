import * as db from './lib/db.ts';
import * as fs from './lib/file.ts';

export type type = "e" | "j" | "x";
export type Segment = [index: number, type: type, start: number, duration: number];

const database: db.Database = {
  name: 'db',
  version: 1,
  init: e => {
    const db = (e.target as IDBOpenDBRequest).result;
    db.createObjectStore('segments');
  },
}

export function getSegments() {
  return db.get<Segment[] | undefined>(database, 'segments', 'value');
}

export function deleteSegments() {
  db.remove(database, 'segments', 'value');
}

/** Requires transient activation, otherwise a NotAllowedError will be thrown. */
export async function importSegmentsCSV() {
  const file = await fs.pickFile();

  if (file == null) {
    return;
  }

  const reader = new FileReader();
  await new Promise(resolve => {
    reader.onload = resolve;
    reader.readAsText(file, 'utf-8');
  });

  const text = reader.result! as string;
  const segments = text.split('\r\n').slice(1).map(l => [...l.split(',').map((v,i)=> i == 1? JSON.parse(v): Number(v))])
  
  await db.put(database, 'segments', segments, 'value');
}

/** Requires transient activation, otherwise a NotAllowedError will be thrown. */
export async function downloadSegmentsCSV() {

  const data = (await getSegments()) ?? [];

  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["index,type,start,duration\r\n", data.map(([index, type, start, duration]) => `${index},"${type}",${start},${duration}`).join('\r\n')], { type: "text/csv" }));
  a.download = "audio_segments.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

// file
const AUDIOFILENAME = 'audio';

export async function getAudioSrc() {
  // TODO とりあえず mp3で決め打ち
  // iOSではBlobにmimetypeが無いとaudioの再生ができない
  const file = await fs.getFile(AUDIOFILENAME);
  return file != null? new Blob([file], {type:'audio/mpeg'}): file;
}

export function deleteAudioSrc() {
  return fs.deleteFile(AUDIOFILENAME);
}

/** Requires transient activation, otherwise a NotAllowedError will be thrown. */
export async function importAudioSrc() {
  const file = await fs.pickFile();

  if (file != null) {
    await fs.saveFile(file, AUDIOFILENAME);
  }
}
