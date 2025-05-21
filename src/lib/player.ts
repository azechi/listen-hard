export class Player extends EventTarget{

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

  playback(startMs = 0, durationMs = 2147483647, playbackRate = 1.0) {
    const delay = Math.min((durationMs + 800) * 1 / playbackRate, 2147483647); // setTimeout delay max is 2147483647(int32.MAX).

    const audio = this.audio;
    audio.playbackRate = playbackRate;
    audio.currentTime = (startMs / 1000); 

    //console.log(start, audio.currentTime, audio.playbackRate, duration, delay);

    clearTimeout(this.token);
    this.token = setTimeout(() => {
      this.dispatchEvent(new CustomEvent('playback-complete'));
      audio.pause();
      clearTimeout(this.token);
    }, delay);

    this.dispatchEvent(new CustomEvent('playback-start', {detail: {startMs, durationMs, playbackRate}}));
    audio.play();
  }
}
