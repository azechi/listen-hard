import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import '@lit-labs/virtualizer';
import './app-player';
import type { Segment } from './app';
import { AppPlayerElement } from './app-player';

declare global {
  interface HTMLElementTagNameMap {
    'app-element': AppElement
  }
}

@customElement('app-element')
export class AppElement extends LitElement {

  private _audioSrc?: Blob;
  set audioSrc(src: Blob | undefined){
    this._audioSrc = src;
  }

  @property({attribute:false})
  segments: Segment[] = []

  @query("app-player", false)
  player!: AppPlayerElement | null

  render() {
    return html`
      <div>
        <a href="file.html">FILE</a>
      </div>

      <app-player .src=${this._audioSrc}></app-player>

      <lit-virtualizer
        scroller
        style="height: 70svh;"
        .items=${this.segments}
        .renderItem=${([item_index, type, startMs, durationMs]: Segment, index: number): TemplateResult =>
        // lit-virtualizerのイベントハンドラーのthisはlit-virtualizerなので、buttonのhostプロパティにapp-elementを設定している
        html`
            <div style="margin:0.5em;">
              <div>
                <button .index=${index} .startMs=${startMs} .durationMs=${durationMs} .host=${this} @click=${this.playback}>▶</button>
                <span>${item_index} ${`${type}`}</span>
                <span>${startMs}  ${durationMs}</span>
              </div>
            </div>
          `}
      ></lit-virtualizer>
    `
  }


  private playback(e: Event){
    // lit-virtualizerから呼ばれるイベントハンドラーのthisはlit-virtualizerです
    const {host, startMs, durationMs} = e.target as any;
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
  `
}
