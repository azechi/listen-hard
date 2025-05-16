import * as db from './lib/db.ts';
import * as file from './lib/file.ts';

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
  // TODO
}

export function importSegmentsCSV() {
  // TODO
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

export function getAudioSrc() {
  return file.getFile(AUDIOFILENAME);
}

export function deleteAudioSrc() {
  return file.deleteFile(AUDIOFILENAME);
}

/** Requires transient activation, otherwise a NotAllowedError will be thrown. */
export function importAudioSrc() {
  return file.importFile(AUDIOFILENAME);
}
