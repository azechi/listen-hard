import { LitElement, TemplateResult, css, html } from 'lit'
import { customElement, query, state } from 'lit/decorators.js'
import { when} from 'lit/directives/when.js';


import { appInit, deleteAudioSource, deleteCSVFile, importAudioSource, importCSVFile } from './app'

import { Player } from './player'

import '@lit-labs/virtualizer';

type Segment = [start: number, duration: number];

declare global {
  interface HTMLElementTagNameMap {
    'app-element': AppElement
  }
}

@customElement('app-element')
export class AppElement extends LitElement {

  @state()
  audioSrc: string = ''

  @state()
  csv?: string

  @state()
  playbackRate = 1.5

  @state()
  selectedSegment: [start: number, duration?: number] = [0, undefined]

  private segments: Segment[] = []
  private player = new Player()

  @state()
  playing = false

  @query("#playingDisplay", true)
  playingDisplay!: HTMLSpanElement | null 

  constructor() {
    super();
    this.player.addEventListener('playback-complete', () => {
      this.playing = false;
    });
    this.player.addEventListener('playback-start', () => {
      this.playing = true;
      const step = () => {
        if (this.playing) {
          this.playingDisplay!.innerText = this.player.currentTime.toFixed(2);
        }
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });

    appInit.then((app) => {
      this.audioSrc = app.audio ?? '';
      this.csv = app.csv;

      this.player.setSource(this.audioSrc);

      this.segments = this.csv!
        .split("\r\n")
        .slice(1, -1)
        .map(line => line.split(",").map(Number)) as Segment[];
    });
  }

  render() {
    return html`
      <div>
        <div>
          <span style="display:inline-block;width:6em;">音源</span>
          ${when(this.audioSrc,
      () => html`<button @click=${async () => { await deleteAudioSource(this.audioSrc!); this.audioSrc = ''; }}>削除</button>`,
      () => html`<button @click=${async () => this.audioSrc = await importAudioSource() ?? ''}>登録</button>`)}
        </div>
        <div>
          <span style="display:inline-block;width:6em;">区間データ</span>
          ${when(this.csv,
        () => html`<button @click=${async () => { await deleteCSVFile(); this.csv = undefined; }}>削除</button>`,
        () => html`<button @click=${async () => { this.csv = await importCSVFile() }}>登録</button>`)}
        </div>
      </div>

      <div style=${'color:' + (this.playing ? 'red' : 'green')}>
        <span>${(this.selectedSegment[0] / 1000).toFixed(2)}</span>
        <span>${((this.selectedSegment[1] ?? 0) / 1000).toFixed(2)}</span>
        <span id="playingDisplay"></span>
      </div>

      <div>
        <span id="playbackRate_value" style="display:inline-block;width:2em;text-align: center;">${this.playbackRate}</span>
        <input type="range" @input=${(e: Event) => this.playbackRate = Number((e.currentTarget as HTMLInputElement).value)} min="0.1" max="3.0" value=${this.playbackRate} step="0.1" />
      </div>
      
      <lit-virtualizer
        scroller
        .items=${this.segments}
        .renderItem=${([start, duration]: Segment, index: number): TemplateResult =>
        html`
            <div style="margin:0.5em;">
              <button .index=${index} @click=${(e: unknown) => this.selectSegment(e)}>${index}  ${start}  ${duration}</button>
            </div>
          `}
      ></lit-virtualizer>
    `
  }

  selectSegment(e: any) {
    const idx = e.currentTarget.index;
    this.selectedSegment = this.segments[idx];
    this.player.playback(...this.selectedSegment, this.playbackRate);
  }

  static styles = css`
    :host {
      display: block;
      max-width: 1280px;
      margin: 0 auto;
      padding: 1rem;
      background-color: rgba(200,200,200, 0.4);
    }
  `
}
