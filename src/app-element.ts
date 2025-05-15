import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import '@lit-labs/virtualizer';
import './app-player';
import type { Segment } from './app';
import { AppPlayerElement } from './app-player';
import { LitVirtualizer } from '@lit-labs/virtualizer';

declare global {
  interface HTMLElementTagNameMap {
    'app-element': AppElement
  }
}

@customElement('app-element')
export class AppElement extends LitElement {

  private _audioSrc?: Blob;
  set audioSrc(src: Blob | undefined) {
    this._audioSrc = src;
  }

  @property({ attribute: false })
  segments: Segment[] = []

  @query("app-player", false)
  player!: AppPlayerElement | null

  @query("lit-virtualizer", false)
  list!: LitVirtualizer | null

  render() {
    return html`
      <div>
        <a href="file.html">FILE</a>
      </div>

      <app-player .src=${this._audioSrc}></app-player>

      <button @click=${this.randomPlayback}>🎲</button>

      <lit-virtualizer
        scroller
        style="height: 70svh;"
        .items=${this.segments.flatMap((_, idx, ar) => idx % 3 ? [] : [ar.slice(idx, idx + 3)])}
        .renderItem=${(segments: Segment[], index: number): TemplateResult =>
        // lit-virtualizerのイベントハンドラーのthisはlit-virtualizerなので、buttonのhostプロパティにapp-elementを設定している
        html`
        <div style="margin:0.5em;">
          <span style="display:inline-block;width:6em;text-align:center;">${segments[0][0]}</span>
          ${segments.map(([item_number, type, startMs, durationMs]) =>
          html`
          <button id=${`btn-${item_number}-${type}`} .index=${index} .startMs=${startMs} .durationMs=${durationMs} .host=${this} @click=${this.playback}>${type}▶</button>
          `)}
        </div>
        `}
      ></lit-virtualizer>
    `
  }

  async randomPlayback2(){
    const num = this.getRandomIntInclusive(1900, 1900);
    this.list?.scrollToIndex(num - 1 - 2, 'start');
    await this.updateComplete;

    const btn = this.shadowRoot!.getElementById(`btn-${num}-e`)!;
    btn.focus();
    btn.click();
  } 

  async randomPlayback(){
    const num = this.getRandomIntInclusive(1, 1900);
    this.list?.scrollToIndex(num - 1 - 2, 'start');
    await this.updateComplete;

    const btn = this.shadowRoot!.getElementById(`btn-${num}-e`)!;
    btn.focus();
    btn.click();
  }

  // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  private getRandomIntInclusive(min: number, max: number) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // 上限を含み、下限も含む
  }

  private playback(e: Event) {
    // lit-virtualizerから呼ばれるイベントハンドラーのthisはlit-virtualizerです
    const { host, startMs, durationMs } = e.target as any;
    host.player!.playback(startMs, durationMs);
  }

  static styles = css`
    :host {
      display: block;
      max-width: 1280px;
      margin: 0 auto;
      padding: 1rem;
      background-color: rgba(200,200,200, 0.4);
    }

    button:focus {
      color: red;
    }
  `
}
