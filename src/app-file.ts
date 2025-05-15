import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import * as app from './app.ts';

declare global {
  interface HTMLElementTagNameMap {
    'app-file': AppFileElement
  }
}

@customElement('app-file')
export class AppFileElement extends LitElement {

  @state()
  audioFileExists = false;

  @state()
  segmentsFileExits = false;

  constructor() {
    super();
  }

  async checkFileExists() {
    this.audioFileExists = (await app.getFile("audio") != null);
    this.segmentsFileExits = (await app.getFile("csv") != null);
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
          await app.deleteFile("audio");
          await this.checkFileExists();
        }}>削除</button>`
        : html`<button @click=${async () => {
          await app.importFile("audio");
          await this.checkFileExists();
        }}>登録</button>`}
          </div>
        </div>
        <div>
          <div>
            <span style="display:inline-block;width:6em;">区間CSV</span>
            ${this.segmentsFileExits
        ? html`<button @click=${async () => {
          await app.deleteFile("csv");
          await this.checkFileExists();
        }}>削除</button><button @click=${app.downloadSegmentsCSV}>ダウンロード</button>`
        : html`<button @click=${async () => {
          await app.importFile("csv");
          await this.checkFileExists();
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
