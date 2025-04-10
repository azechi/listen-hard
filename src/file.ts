
//console.log(`window.isSecureContext = ${window.isSecureContext}`)

{
    const el = document.getElementById("drop_zone")!;
    el.addEventListener("drop", async e => {
      e.preventDefault();
  
      const file = e.dataTransfer!.files.item(0)!;
  
  
      const root = await navigator.storage.getDirectory();
      const handle = await root.getFileHandle("file1", { create: true });
      const ws = await handle.createWritable();
      await ws.write(file);
      await ws.close();
  
    });
  
    el.addEventListener("dragover", e => e.preventDefault());
  }
  {
    const el = document.getElementById("drop_zone2")!;
    el.addEventListener("drop", async e => {
      e.preventDefault();
  
      const file = e.dataTransfer!.files.item(0)!;
  
  
      const root = await navigator.storage.getDirectory();
      const handle = await root.getFileHandle("file2", { create: true });
      const ws = await handle.createWritable();
      await ws.write(file);
      await ws.close();
  
    });
  
    el.addEventListener("dragover", e => e.preventDefault());
  }

  
const root = await navigator.storage.getDirectory();
export const AUDIO_BLOB = await root.getFileHandle("file1").then(x => x.getFile()) as Blob;

const _AUDIO_INDEX_FILE = await root.getFileHandle("file2").then(x => x.getFile());
const reader = new FileReader();
reader.readAsText(_AUDIO_INDEX_FILE);
await new Promise((resolve) => reader.onload = resolve);
const s = reader.result! as string;

const chunks = s
  .split("\r\n")
  .slice(0, -1)
  .map(line => {
    const [start, end] = line.split(",").map(Number);
    return [start, end - start];
  });

export function index_range_to_interval(range_start: number , range_end?: number){
  const [start, _] = chunks[range_start];
  const [end_start, end_duration] = chunks[range_end??range_start];
  const duration = end_start - start + end_duration;
  return [start, duration] as const;
};