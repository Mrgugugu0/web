import { useEffect, useRef, useState } from "react";
import { AudioLines, Maximize2, Minimize2, Pause, Play, Upload } from "lucide-react";
import { ParticleField } from "@/lib/particle-field";
import { SeaAudio } from "@/lib/sea-audio";

type Live = {
  sub: number;
  bass: number;
  mid: number;
  high: number;
  bpm: number;
  current: number;
  duration: number;
  playing: boolean;
  beat: number;
};

const TRACK_URL = "/audio/track.mp3";
const TRACK_NAME = "酣眠被子 - 长风破浪";

const INITIAL_LIVE: Live = {
  sub: 0,
  bass: 0,
  mid: 0,
  high: 0,
  bpm: 0,
  current: 0,
  duration: 0,
  playing: false,
  beat: 0,
};

function fmt(time: number) {
  if (!Number.isFinite(time) || time < 0) return "00:00";
  const s = Math.floor(time);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function Control({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const shown = Math.round(value * 100);
  return (
    <label className="sea-row">
      <span className="sea-row-label">{label}</span>
      <span className="sea-meter">
        <span className="sea-meter-fill" style={{ transform: `scaleX(${value})` }} />
        <input
          className="sea-range"
          type="range"
          min={0}
          max={100}
          value={shown}
          aria-label={label}
          onChange={(event) => onChange(Number(event.target.value) / 100)}
        />
      </span>
      <span className="sea-row-val">{shown}</span>
    </label>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <div className="sea-row">
      <span className="sea-row-label">{label}</span>
      <span className="sea-meter" aria-hidden>
        <span className="sea-meter-fill" style={{ transform: `scaleX(${clamped})` }} />
      </span>
      <span className="sea-row-val">{Math.round(clamped * 100)}</span>
    </div>
  );
}

export function SeaStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<SeaAudio | null>(null);
  const objectUrl = useRef<string | null>(null);
  const seeking = useRef(false);
  const pointer = useRef({ x: 0, y: 0.2, active: 0, ripple: 0 });
  const hotTimer = useRef<number | null>(null);
  const startedRef = useRef(false);

  const [flow, setFlow] = useState(0.48);
  const [tension, setTension] = useState(0.36);
  const [texture, setTexture] = useState(0.46);
  const [density, setDensity] = useState(0.62);
  const [volume, setVolume] = useState(0.86);
  const [elastic, setElastic] = useState(false);
  const [watch, setWatch] = useState(false);
  const [hot, setHot] = useState(false);
  const [panel, setPanel] = useState(false);
  const [started, setStarted] = useState(false);
  const [name, setName] = useState(TRACK_NAME);
  const [gpuError, setGpuError] = useState("");
  const [audioError, setAudioError] = useState("");
  const [live, setLive] = useState<Live>(INITIAL_LIVE);

  const ui = useRef({ flow, tension, texture, density, volume, elastic });
  ui.current = { flow, tension, texture, density, volume, elastic };
  startedRef.current = started;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let field: ParticleField;
    try {
      field = new ParticleField(canvas);
    } catch (error) {
      setGpuError(error instanceof Error ? error.message : "粒子海无法启动");
      return;
    }
    const audio = new SeaAudio(TRACK_URL);
    audioRef.current = audio;
    let alive = true;
    let raf = 0;
    let last = performance.now();
    let lastUi = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let sim = 0;

    const frame = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      sim += dt * (reduced ? 0.22 : 1);
      pointer.current.ripple *= Math.exp(-1.7 * dt);
      if (pointer.current.active < 0.98) pointer.current.active *= Math.exp(-1.4 * dt);
      const playing = !audio.audio.paused && !audio.audio.ended;
      const sample = audio.sample(playing ? dt : 0);
      const drive = playing ? 1 : 0;
      const idleSub = 0.16 + 0.07 * Math.sin(sim * 0.65);
      const idleBass = 0.28 + 0.12 * Math.sin(sim * 0.5);
      const idleMid = 0.16 + 0.08 * Math.sin(sim * 0.83);
      const idleHigh = 0.1 + 0.06 * Math.sin(sim * 1.27);
      const mix = (real: number, idle: number) => real * drive + idle * (1 - drive);
      audio.setVolume(ui.current.volume);
      field.setDensity(ui.current.density);
      field.render({
        time: sim,
        sub: mix(sample.sub, idleSub),
        bass: mix(sample.bass, idleBass),
        mid: mix(sample.mid, idleMid),
        high: mix(sample.high, idleHigh),
        flow: ui.current.flow,
        tension: ui.current.tension,
        texture: ui.current.texture,
        elastic: ui.current.elastic ? 1 : 0,
        beat: playing ? sample.beat : 0,
        pointerX: pointer.current.x,
        pointerY: pointer.current.y,
        pointerActive: pointer.current.active,
        ripple: pointer.current.ripple,
      });
      if (now - lastUi > 90) {
        lastUi = now;
        if (audio.failed && alive) setAudioError("这段音频没有加载成功");
        const duration = Number.isFinite(audio.audio.duration) ? audio.audio.duration : 0;
        setLive({
          sub: mix(sample.sub, idleSub),
          bass: mix(sample.bass, idleBass),
          mid: mix(sample.mid, idleMid),
          high: mix(sample.high, idleHigh),
          bpm: sample.bpm,
          current: audio.audio.currentTime || 0,
          duration,
          playing,
          beat: playing ? sample.beat : 0,
        });
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      field.destroy();
      audio.destroy();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      if (event.code === "Space") {
        event.preventDefault();
        void toggle();
      } else if (event.key === "f" || event.key === "F") {
        void toggleWatch();
      } else if (event.key === "b" || event.key === "B") {
        setElastic((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    const sync = () => {
      if (!document.fullscreenElement) setWatch(false);
    };
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  function poke() {
    setHot(true);
    if (hotTimer.current) window.clearTimeout(hotTimer.current);
    hotTimer.current = window.setTimeout(() => setHot(false), 2400);
  }

  async function play() {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.resume();
      await audio.audio.play();
      setStarted(true);
      setAudioError("");
    } catch {
      setAudioError("浏览器拦住了自动播放，再点一次播放");
    }
  }

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.audio.paused) await play();
    else audio.audio.pause();
  }

  async function toggleWatch() {
    const next = !watch;
    setWatch(next);
    poke();
    try {
      if (next) await document.documentElement.requestFullscreen();
      else if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      /* Embedded preview often blocks fullscreen; hiding the chrome still works. */
    }
  }

  function pointFrom(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.current.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    pointer.current.active = 1;
  }

  function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !audioRef.current) return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    const url = URL.createObjectURL(file);
    objectUrl.current = url;
    audioRef.current.loadTrack(url);
    setName(file.name.replace(/\.[^.]+$/, ""));
    setAudioError("");
    void play();
  }

  const bpmLabel = live.bpm > 0 ? live.bpm.toFixed(1) : "——";

  return (
    <main className={`sea-app${watch ? " is-watch" : ""}${hot ? " is-hot" : ""}`}>
      <canvas
        ref={canvasRef}
        className="sea-canvas"
        aria-label="声波粒子海"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          pointFrom(event);
          pointer.current.ripple = 1;
          poke();
          if (!startedRef.current) void play();
        }}
        onPointerMove={(event) => {
          if (event.pointerType === "mouse" || event.buttons > 0) pointFrom(event);
          if (watch) poke();
        }}
        onPointerUp={() => {
          pointer.current.active = 0.65;
        }}
        onPointerLeave={() => {
          pointer.current.active = 0;
        }}
      />
      <div className="sea-vignette" />
      <div className="sea-beat" style={{ opacity: live.beat * 0.55 }} />

      <div className="sea-chrome">
        <header className="sea-brand">
          <span className="sea-brand-mark" />
          <span>粒子海</span>
        </header>

        <button
          type="button"
          className={`sea-panel-toggle${panel ? " is-on" : ""}`}
          aria-expanded={panel}
          onClick={() => setPanel((open) => !open)}
        >
          <AudioLines />
          状态
        </button>

        <aside className={`sea-hud${panel ? " is-open" : ""}`} aria-label="音频状态">
          <label className="sea-import">
            <Upload size={15} />
            <span className="sea-import-title">导入音频</span>
            <span className="sea-import-sub">MP3 / WAV / FLAC</span>
            <input hidden type="file" accept="audio/*,.mp3,.wav,.flac,.m4a,.ogg" onChange={onFile} />
          </label>

          <div className="sea-bpm">
            <span className="sea-bpm-num">{bpmLabel}</span>
            <span className="sea-bpm-unit">BPM</span>
          </div>

          <section className="sea-block">
            <h2 className="sea-kicker">ENERGY</h2>
            <Control label="FLOW" value={flow} onChange={setFlow} />
            <Control label="TENSION" value={tension} onChange={setTension} />
          </section>

          <section className="sea-block">
            <h2 className="sea-kicker">FREQUENCY</h2>
            <Meter label="SUB" value={live.sub} />
            <Meter label="BASS" value={live.bass} />
            <Meter label="MID" value={live.mid} />
            <Meter label="HIGH" value={live.high} />
          </section>

          <section className="sea-block">
            <h2 className="sea-kicker">CHARACTER</h2>
            <Control label="DENSITY" value={density} onChange={setDensity} />
            <Control label="TEXTURE" value={texture} onChange={setTexture} />
            <Control label="VOLUME" value={volume} onChange={setVolume} />
          </section>

          <div className="sea-track">
            <button
              type="button"
              className="sea-play"
              onClick={() => void toggle()}
              aria-label={live.playing ? "暂停" : "播放"}
            >
              {live.playing ? <Pause /> : <Play className="is-play" />}
            </button>
            <div className="sea-track-meta">
              <div className="sea-filename" title={name}>
                {name}
              </div>
              <div className="sea-time">
                {fmt(live.current)} / {fmt(live.duration)}
              </div>
              <span className="sea-meter">
                <span
                  className="sea-meter-fill"
                  style={{
                    transform: `scaleX(${live.duration > 0 ? live.current / live.duration : 0})`,
                  }}
                />
                <input
                  className="sea-range"
                  type="range"
                  min={0}
                  max={Math.max(live.duration, 0.01)}
                  step={0.01}
                  value={Math.min(live.current, Math.max(live.duration, 0.01))}
                  aria-label="播放进度"
                  onPointerDown={() => {
                    seeking.current = true;
                  }}
                  onPointerUp={() => {
                    seeking.current = false;
                  }}
                  onChange={(event) => {
                    const time = Number(event.target.value);
                    seeking.current = true;
                    audioRef.current?.seek(time);
                    setLive((prev) => ({ ...prev, current: time }));
                  }}
                />
              </span>
            </div>
          </div>
          <p className="sea-hint">划过海面激起涟漪。空格播放，B 弹跳，F 全屏观看。</p>
          {audioError ? <p className="sea-hint">{audioError}</p> : null}
        </aside>

        <div className="sea-dock">
          {!started ? (
            <button type="button" className="sea-cta" onClick={() => void play()}>
              <Play className="is-play" />
              播放长风破浪
            </button>
          ) : (
            <button
              type="button"
              className="sea-pop"
              onClick={() => void toggle()}
              aria-label={live.playing ? "暂停" : "播放"}
            >
              {live.playing ? <Pause /> : <Play className="is-play" />}
            </button>
          )}
          <button
            type="button"
            className={`sea-pop${elastic ? " is-on" : ""}`}
            aria-pressed={elastic}
            onClick={() => setElastic((value) => !value)}
          >
            弹
          </button>
          <button type="button" className={`sea-pill${watch ? " is-on" : ""}`} onClick={() => void toggleWatch()}>
            {watch ? <Minimize2 /> : <Maximize2 />}
            {watch ? "返回" : "全屏观看"}
          </button>
        </div>
      </div>

      {gpuError ? <p className="sea-error">{gpuError}</p> : null}
    </main>
  );
}
