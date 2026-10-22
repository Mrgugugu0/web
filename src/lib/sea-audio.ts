export type SeaSample = {
  sub: number;
  bass: number;
  mid: number;
  high: number;
  bpm: number;
  beat: number;
};

export class SeaAudio {
  readonly audio: HTMLAudioElement;
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gain: GainNode | null = null;
  private freq: Uint8Array<ArrayBuffer> | null = null;
  private env = { sub: 0, bass: 0, mid: 0, high: 0 };
  private avgBass = 0.16;
  private lastBeat = 0;
  private intervals: number[] = [];
  private beat = 0;
  private clock = 0;
  bpm = 0;
  volume = 0.86;
  failed = false;

  constructor(src: string) {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    audio.loop = true;
    audio.src = src;
    audio.addEventListener("error", () => {
      this.failed = true;
    });
    this.audio = audio;
  }

  async resume() {
    if (!this.ctx) {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.78;
      const gain = ctx.createGain();
      gain.gain.value = this.volume;
      const source = ctx.createMediaElementSource(this.audio);
      source.connect(analyser);
      analyser.connect(gain);
      gain.connect(ctx.destination);
      this.ctx = ctx;
      this.analyser = analyser;
      this.gain = gain;
      this.freq = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  setVolume(value: number) {
    this.volume = value;
    if (this.gain) this.gain.gain.value = value;
  }

  loadTrack(url: string) {
    const wasPlaying = !this.audio.paused;
    this.failed = false;
    this.audio.src = url;
    this.resetMeter();
    if (wasPlaying) void this.audio.play();
  }

  seek(time: number) {
    if (!Number.isFinite(time)) return;
    const dur = this.audio.duration;
    const next = Number.isFinite(dur) ? Math.min(Math.max(0, time), Math.max(0, dur - 0.05)) : Math.max(0, time);
    this.audio.currentTime = next;
  }

  sample(dt: number): SeaSample {
    this.beat *= Math.exp(-3.5 * Math.max(0, dt));
    if (this.analyser && this.freq && this.ctx) {
      this.analyser.getByteFrequencyData(this.freq);
      const nyq = this.ctx.sampleRate / 2;
      const n = this.analyser.frequencyBinCount;
      const band = (lo: number, hi: number) => {
        let a = Math.max(0, Math.floor((lo / nyq) * n));
        let b = Math.min(n, Math.ceil((hi / nyq) * n));
        if (b <= a) b = Math.min(n, a + 1);
        let sum = 0;
        for (let i = a; i < b; i++) sum += this.freq![i] ?? 0;
        return sum / Math.max(1, b - a) / 255;
      };
      const raw = {
        sub: band(20, 70),
        bass: band(70, 180),
        mid: band(180, 2200),
        high: band(2200, 12000),
      };
      const follow = (prev: number, value: number) =>
        value > prev ? prev + (value - prev) * 0.5 : prev + (value - prev) * 0.14;
      this.env.sub = follow(this.env.sub, raw.sub);
      this.env.bass = follow(this.env.bass, raw.bass);
      this.env.mid = follow(this.env.mid, raw.mid);
      this.env.high = follow(this.env.high, raw.high);
      this.avgBass = this.avgBass * 0.985 + raw.bass * 0.015;
      this.clock += dt;
      const gap = this.clock - this.lastBeat;
      if (raw.bass > 0.2 && raw.bass > this.avgBass * 1.42 && gap > 0.28) {
        if (this.lastBeat > 0 && gap < 1.6) {
          this.intervals.push(gap);
          if (this.intervals.length > 14) this.intervals.shift();
          const sorted = [...this.intervals].sort((x, y) => x - y);
          const med = sorted[Math.floor(sorted.length / 2)] ?? gap;
          let bpm = 60 / med;
          while (bpm < 74) bpm *= 2;
          while (bpm > 176) bpm /= 2;
          this.bpm = this.bpm === 0 ? bpm : this.bpm * 0.65 + bpm * 0.35;
        }
        this.lastBeat = this.clock;
        this.beat = 1;
      }
    }
    return { ...this.env, bpm: this.bpm, beat: this.beat };
  }

  private resetMeter() {
    this.env = { sub: 0, bass: 0, mid: 0, high: 0 };
    this.intervals = [];
    this.bpm = 0;
    this.lastBeat = 0;
    this.beat = 0;
    this.avgBass = 0.16;
  }

  destroy() {
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
    void this.ctx?.close();
    this.ctx = null;
  }
}
