import { LitElement, css, html, PropertyValues } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'

import { Player } from './lib/player';

declare global {
  interface HTMLElementTagNameMap {
    'app-player': AppPlayerElement
  }
}

@customElement('app-player')
export class AppPlayerElement extends LitElement {

  @property({ attribute: false })
  src?: Blob

  private player = new Player()

  @state()
  playbackRate = 1.5
  @state()
  playing = false
  @state()
  startMs = 0
  @state()
  durationMs = 0

  @query("#playing-display", true)
  playingDisplay!: HTMLSpanElement | null

  playback(startMs = 0, durationMs = 2147483647) {
    this.player.playback(startMs, durationMs, this.playbackRate);
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    if (changedProperties.has('src')) {
      this.player.setSource(this.src);
    }
  }

  constructor() {
    super();
    this.player.addEventListener('playback-complete', () => {
      this.playing = false;
    });
    this.player.addEventListener('playback-start', ({ detail: { startMs, durationMs, playbackRate } }: any) => {
      this.playing = true;
      [this.startMs, this.durationMs, this.playbackRate] = [startMs, durationMs, playbackRate];
      const step = () => {
        if (this.playing) {
          this.playingDisplay!.innerText = this.player.currentTime.toFixed(2);
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    });
  }

  render() {
    return html`
      <div style=${'color:' + (this.playing ? 'red' : 'green')}>
        <span>${(this.startMs / 1000).toFixed(2)}</span>
        <span>${((this.durationMs ?? 0) / 1000).toFixed(2)}</span>
        <span id="playing-display"></span>
      </div>

      <div>
        <span style="display:inline-block;width:2em;text-align: center;">${this.playbackRate}</span>
        <input type="range" @input=${(e: Event) => this.playbackRate = Number((e.currentTarget as HTMLInputElement).value)} min="0.1" max="3.0" value=${this.playbackRate} step="0.1" />
      </div>
    `
  }

  static styles = css`
  `
}
