export class Player extends EventTarget{

  // setTimeout delay max is 2147483647(int32.MAX).
  static INT32_MAX = 2147483647;

  private readonly audio = new Audio();
  private token?: number;

  constructor() {
    super();    
  }

  setSource(src: Blob = new Blob()) {
    if (this.audio.src) {
      URL.revokeObjectURL(this.audio.src);
    }
    this.audio.src = URL.createObjectURL(src);
    this.audio.load();
  }

  get currentTime() {
    return this.audio.currentTime;
  }

  playback(startMs = 0, durationMs = Player.INT32_MAX, playbackRate = 1.0) {
    const audio = this.audio;
    audio.playbackRate = playbackRate;
    audio.currentTime = (startMs / 1000); 

    clearTimeout(this.token);
    this.token = setTimeout(() => {
      this.dispatchEvent(new CustomEvent('playback-complete'));
      audio.pause();
      clearTimeout(this.token);
    }, durationMs);

    this.dispatchEvent(new CustomEvent('playback-start', {detail: {startMs, durationMs, playbackRate}}));
    audio.play();
  }
}
