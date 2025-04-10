import "./style.css";
import { AUDIO_BLOB, index_range_to_interval } from "./file";
/* */

let playback: (start: number, duration: number) => void;
{

  let playbackRate = 1.0;

  const span = document.getElementById("span")!;
  const el_audio = new Audio();
  el_audio.src = URL.createObjectURL(AUDIO_BLOB);

  let token: number | undefined = undefined;

  function play(start: number, duration: number) {
    el_audio.playbackRate = playbackRate;

    span.innerText = `${start}, ${duration}`;
    el_audio.currentTime = (start / 1000) - 0.2;
    clearTimeout(token);
    token = setTimeout(() => {
      el_audio.pause();
      span.style.background = "red";
      clearTimeout(token);
    }, ((duration + 300) * 1 / playbackRate));
    el_audio.play();
    span.style.background = "blue";
  };

  playback = play;

  const el_playbackRate = document.getElementById("playbackRate") as HTMLInputElement;
  const el_playbackRate_value = document.getElementById("playbackRate_value")!;
  el_playbackRate.addEventListener("input", e => {
    const val = (e.currentTarget as HTMLInputElement).value;
    playbackRate = Number(el_playbackRate_value.textContent = val)
  });
  el_playbackRate.dispatchEvent(new Event("input"));

}





function intervalFromIndexes(value: string) {
  const iter = value.split(",").map(Number)[Symbol.iterator]();
  const first = iter.next();
  const second = iter.next();
  return [first.value, second.value ?? first.value] as [number, number];
}

/* ***************************** */
function initialData() {
  let data = Array(1900);
  for (let i = 0; i < 1900; i++) {
    data[i] = {
      "word_number": i + 1,
      "en": {
        "description": "",
        "audio_index": [],
        "startAt": 0,
        "duration": 0,
      },
      "ja": {
        "description": "",
        "audio_index": [],
        "startAt": 0,
        "duration": 0,
      },
      "ex": {
        "description": "",
        "audio_index": [],
        "startAt": 0,
        "duration": 0
      },

      get ["0"]() {
        return this.en;
      },
      get ["1"]() {
        return this.ja;
      },
      get ["2"]() {
        return this.ex;
      },
    }
  }
  return data;
}

const data = (JSON.parse(localStorage.getItem("items")!) as any[]) ?? initialData();

document.getElementById("save")?.addEventListener("click", () => {
  localStorage.setItem("items", JSON.stringify(data));
});

const table = document.getElementById("table") as HTMLTableElement;


{
  function onClick({ currentTarget }: Event) {
    playback(...index_range_to_interval(...intervalFromIndexes((currentTarget as any).value)));
  };

  const tmpl = document.getElementById("table_row") as HTMLTemplateElement;
  for (let item of data) {
    const fragment = tmpl.content.cloneNode(true) as DocumentFragment;
    const row = fragment.querySelector("tr")!;
    const num = item.word_number;
    row.id = `row_${num}`
    row.dataset.number = `${num}`;
    row.querySelector("th")!.textContent = `No. ${num}`;
    row.querySelectorAll("button").forEach(el => {
      el.onclick = onClick;
    });
    table.appendChild(fragment);
    renderRow(item);
  }
  table.removeChild(tmpl);
}

function renderRow(item: any) {
  const num = item.word_number;
  const row = document.getElementById(`row_${num}`)!;

  row.querySelectorAll("td").forEach((td, idx) => {
    const data = item[idx];
    td.childNodes[0].textContent = data.description;
    const button = td.childNodes[1] as HTMLButtonElement;
    button.value = data.audio_index.toString();
    button.textContent = data.audio_index.toString();
  })

}

/* audio player */
const audio_chunk = document.getElementById("audio_chunks") as HTMLInputElement;

{
  const btn_playback = document.getElementById("playback") as HTMLButtonElement;
  btn_playback.onclick = () => {
    playback(...index_range_to_interval(...intervalFromIndexes(audio_chunk.value)));
  };

  const btn_playbackNext = document.getElementById("playbackNext") as HTMLButtonElement;
  btn_playbackNext.onclick = () => {
    const [_, value] = intervalFromIndexes(audio_chunk.value);
    playback(...index_range_to_interval(value + 1));
  };

  const btn_append = document.getElementById("append") as HTMLButtonElement;
  btn_append.onclick = () => {
    const [first, second] = intervalFromIndexes(audio_chunk.value);
    audio_chunk.value = [first, second + 1].toString();
  };

  const btn_skip = document.getElementById("skip") as HTMLButtonElement;
  btn_skip.onclick = () => {
    const [_, value] = intervalFromIndexes(audio_chunk.value);
    audio_chunk.value = (value + 2).toString();
  }

}


/**** FORM *****/
const word_form = document.getElementById("word") as HTMLFormElement;

document.getElementById("submit")!.onclick = () => {
  const form = new FormData(word_form);

  const item = data[Number(form.get("number")) - 1]
  const part = item[Number(form.get("part"))];
  part.description = form.get("text");
  part.audio_index = form.get("audio_chunks")?.toString();

  renderRow(item);
};

const item_select = (word_form.elements["item_select" as any] as HTMLFieldSetElement)
item_select.onchange = () => {
  const form = new FormData(word_form);
  const num = Number(form.get("number"));
  const part = Number(form.get("part"));


  // load data
  const item = data[num - 1][part];
  (word_form.elements["text" as any] as HTMLTextAreaElement).value = item.description;
  (word_form.elements["audio_chunks" as any] as HTMLInputElement).value = item.audio_index.toString();

  // select table row
  for (let tr of table.getElementsByTagName("tr")) {
    tr.style.background = "";
  }
  const tr = document.getElementById(`row_${num}`)!;
  tr.style.background = "red";
  [...Array(2)].reduce<Element>((el, _) => el.previousElementSibling ?? el, tr).scrollIntoView({ behavior: "smooth" });

};

item_select.dispatchEvent(new Event("change"));

document.getElementById("pprev")!.addEventListener("click", () => {
  const el = word_form.elements["number" as any] as HTMLInputElement;
  el.value = (Number(el.value) - 1).toString();
  item_select.dispatchEvent(new Event("change"));
});

document.getElementById("nnext")!.addEventListener("click", () => {
  const el = word_form.elements["number" as any] as HTMLInputElement;
  el.value = (Number(el.value) + 1).toString();
  item_select.dispatchEvent(new Event("change"));
});

document.getElementById("next")!.addEventListener("click", () => {
  /* typescript 5.6.2 DOM HTMLFormControlsCollectionの型定義で、
     []アクセスだと戻り値の型をRadioNodeListにできない
     なので等価のnamedItemメソッド呼び出しで記述している */
  const gp = word_form.elements.namedItem("part") as RadioNodeList;
  gp.value = ((Number(gp.value) + 1) % 3).toString();
  item_select.dispatchEvent(new Event("change"));
});

document.getElementById("prev")!.addEventListener("click", () => {
  /* typescript 5.6.2 DOM HTMLFormControlsCollectionの型定義で、
     []アクセスだと戻り値の型をRadioNodeListにできない
     なので等価のnamedItemメソッド呼び出しで記述している */
  const gp = word_form.elements.namedItem("part") as RadioNodeList;
  gp.value = ((Number(gp.value) + 3 - 1) % 3).toString();
  item_select.dispatchEvent(new Event("change"));
});
