import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import * as app from './app.ts';

declare global {
  interface HTMLElementTagNameMap {
    'app-file': AppFileElement
  }
}

const initialState = await Promise.all([app.getAudioSrc(), app.getSegments()]);

@customElement('app-file')
export class AppFileElement extends LitElement {

  @state()
  audioFileExists = false;

  @state()
  segmentsDataExists = false;

  constructor() {
    super();

    this.audioFileExists = initialState[0] != null;
    this.segmentsDataExists = initialState[1] != null;
  }

  private async checkResourceExists() {
    this.audioFileExists = (await app.getAudioSrc() != null);
    this.segmentsDataExists = (await app.getSegments() != null);
  }

  render() {
    console.log("render", this.audioFileExists)
    return html`
      <div>
        <span>ここでファイルの登録をしてね</span>
        <div>
          <div>
            <span style="display:inline-block;width:6em;">音源</span>
            ${this.audioFileExists
        ? html`<button @click=${async () => {
          await app.deleteAudioSrc();
          await this.checkResourceExists();
        }}>削除</button>`
        : html`<button @click=${async () => {
          await app.importAudioSrc();
          await this.checkResourceExists();
        }}>登録</button>`}
          </div>
        </div>
        <div>
          <div>
            <span style="display:inline-block;width:6em;">区間CSV</span>
            ${this.segmentsDataExists
        ? html`<button @click=${async () => {
          await app.deleteSegments();
          await this.checkResourceExists();
        }}>削除</button><button @click=${app.downloadSegmentsCSV}>ダウンロード</button>`
        : html`<button @click=${async () => {
          await app.importSegmentsCSV();
          await this.checkResourceExists();
        }}>登録</button>`}
          </div>
        </div>
      </div>
    `;
  }

  static styles = css`
      :host {
        display: block;
        max-width: 80svw;
        margin: 0 auto;
        padding: 1rem;
        background-color: rgba(100,100,100, 0.4);
      }

      div {
        margin-top: 1rem;  
      }
    `

}
