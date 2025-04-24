export class Player extends EventTarget{

  private readonly audio = new Audio();
  private token?: number;

  constructor() {
    super();    
  }

  setSource(src: string) {
    this.audio.src = src;
    this.audio.load();
  }

  get currentTime() {
    return this.audio.currentTime;
  }

  playback(start = 0, duration?: number, playbackRate = 1.0) {
    const delay = Math.min(((duration ?? 2147483647) + 300) * 1 / playbackRate, 2147483647); // setTimeout delay max is 2147483647(int32.MAX).

    const audio = this.audio;
    audio.playbackRate = playbackRate;
    audio.currentTime = (start / 1000); // - 0.2;

    //console.log(start, audio.currentTime, audio.playbackRate, duration, delay);

    clearTimeout(this.token);
    this.token = setTimeout(() => {
      this.dispatchEvent(new CustomEvent('playback-complete'));
      audio.pause();
      clearTimeout(this.token);
    }, delay);

    this.dispatchEvent(new CustomEvent('playback-start'));
    audio.play();
  }
}
