import { LitElement, css, html } from 'lit'
import { customElement, state, query } from 'lit/decorators.js'
import { until } from 'lit/directives/until.js';

import { appInit, deleteAudioSource, deleteCSVFile, importAudioSource, importCSVFile } from './app'
import { when } from 'lit/directives/when.js';
import { map } from 'lit/directives/map.js';

import {Player} from './player'


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
  selectedSegment: [start: number, duration?: number] = [0, undefined];

  private chunks: [number, number][] = [[0, 1000], [1000, 1000], [2000, 1000], [3000, 1000], [4000, 1000], [5000, 1000], [6000, 1000], [7000, 1000], [8000, 1000], [9000, 1000], [10000, 1000]];

  private player = new Player()

  @state()
  playing = false;

  constructor() {
    super();
    this.player.addEventListener('playback-complete', () => {
      this.playing = false;
    });
    this.player.addEventListener('playback-start', () => {
      this.playing = true;
    });
    appInit.then((app) => {
      this.audioSrc = app.audio ?? '';
      this.csv = app.csv;
      this.player.setSource(this.audioSrc);
    });
  }

  render() {
    return until(
      appInit.then(
        () => html`
          <div style='color:${this.playing ? 'red' : 'black'};'>
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

            <div>
              <span id="playbackRate_value" style="display:inline-block;width:2em;text-align: center;">${this.playbackRate}</span>
              <input type="range" @input=${(e: Event) => this.playbackRate = Number((e.currentTarget as HTMLInputElement).value)} min="0.1" max="3.0" value=${this.playbackRate} step="0.1" />
            </div>
          </div>
          <div>
            <span>${this.selectedSegment[0]}</span>
            <span>${this.selectedSegment[1]}</span>
          </div>
          
          <div>
            ${map(this.chunks, ([start,], idx) => html`<button style="display:block;margin: 6px;" @click=${this.selectChunk} .idx=${idx}>${start}</button>`)}
          </div>
        `),
      html`<span>Loading...</span>`)
  }

  selectChunk(e: any) {
    const idx = e.currentTarget.idx;
    this.selectedSegment = this.chunks[idx];
    
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


