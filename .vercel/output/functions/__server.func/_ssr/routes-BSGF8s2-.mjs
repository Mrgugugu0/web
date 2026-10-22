import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Minimize2, i as Pause, o as Maximize2, r as Play, s as AudioLines, t as Upload } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BSGF8s2-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var VERT = `
attribute vec4 aP;
uniform float uTime;
uniform float uSub;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uFlow;
uniform float uTension;
uniform float uTexture;
uniform float uElastic;
uniform float uBeat;
uniform vec2 uPointer;
uniform float uActive;
uniform float uRipple;
uniform float uAspect;
uniform float uDpr;
uniform float uMaxPoint;
uniform float uPass;

varying float vAlpha;
varying float vHot;

void main() {
  float x0 = aP.x;
  float thick = aP.y;
  float layer = aP.z;
  float seed = aP.w;

  float flow = mix(0.32, 2.15, uFlow);
  float tight = mix(0.72, 2.05, uTension);
  float tex = mix(0.2, 1.0, uTexture);
  float t = uTime;

  float x = x0 + (seed - 0.5) * 0.012;
  float lp = layer * 1.17;

  float swell = sin(x * 1.05 * tight - t * flow * 0.38) * (0.05 + uSub * 0.22);
  float amp =
      sin(x * 1.85 * tight + t * flow * 0.88 + lp) * (0.16 + uBass * 0.78 + uSub * 0.2)
    + sin(x * 3.7 * tight - t * flow * 1.15 + lp * 0.85) * (0.07 + uMid * 0.46)
    + sin(x * (6.2 + tex * 6.5) + t * flow * 1.65 + seed * 5.0 + lp) * (0.025 + uHigh * 0.2) * tex
    + swell;

  float ribbon = (layer - 2.0) * mix(0.072, 0.028, uTension);
  float body = (thick - 0.5) * (0.02 + tex * 0.016);
  float y = ribbon + amp + body;

  float px = uPointer.x / 0.82 - (uAspect > 1.2 ? 0.1 : 0.0) / 0.82;
  float dx = x - px;
  float dy = uPointer.y - 0.04;
  float wake = exp(-dx * dx * 5.2 - dy * dy * 2.4) * uActive;
  y += wake * sin(dx * 14.0 - t * 6.5 + layer) * (0.07 + uRipple * 0.48);

  float ring = sin(x * 7.4 * tight - t * (7.0 + flow * 3.0) + lp + thick * 2.0);
  y += ring * uBeat * (0.04 + uElastic * 0.4) * (0.65 + 0.35 * sin(layer));

  y += sin(t * 0.37 + layer) * 0.01;
  y = clamp(y, -0.78, 0.78);

  float yScale = uAspect < 1.05 ? 1.55 : min(uAspect, 1.35);
  float shift = uAspect > 1.2 ? 0.1 : 0.0;
  gl_Position = vec4(x * 0.82 + shift, y * yScale + 0.02, 0.0, 1.0);

  float crest = smoothstep(0.02, 0.34, abs(amp));
  float fade = smoothstep(1.05, 0.2, abs(x0));
  fade = pow(fade, 1.15);

  float size = (2.35 + thick * 1.8 + crest * 2.1 + wake) * uDpr;
  size *= mix(1.0, 2.15, uPass);
  gl_PointSize = clamp(size, 1.0, uMaxPoint);

  float alpha = fade * (0.42 + crest * 0.34);
  alpha *= mix(1.0, 0.12, uPass);
  vAlpha = alpha;
  vHot = clamp(crest * 0.8 + uHigh * 0.4 + wake + uBeat * uElastic, 0.0, 1.0);
}
`;
var FRAG = `
precision mediump float;
varying float vAlpha;
varying float vHot;

void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(p, p);
  if (r2 > 1.0) discard;
  float core = exp(-r2 * 2.55);
  vec3 mauve = vec3(0.847, 0.533, 0.867);
  vec3 hot = vec3(0.965, 0.78, 0.98);
  vec3 col = mix(mauve * 0.78, mauve, 0.55 + vHot * 0.45);
  col = mix(col, hot, smoothstep(0.8, 1.0, vHot) * 0.55 * core);
  gl_FragColor = vec4(col, core * vAlpha);
}
`;
function compile(gl, type, source) {
	const shader = gl.createShader(type);
	if (!shader) throw new Error("无法创建着色器");
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader) || "着色器编译失败";
		gl.deleteShader(shader);
		throw new Error(log);
	}
	return shader;
}
var ParticleField = class {
	canvas;
	gl;
	program;
	buffer;
	loc = {};
	count = 0;
	cols = -1;
	thick = -1;
	maxPoint = 64;
	dpr = 1;
	aspect = 1;
	constructor(canvas) {
		this.canvas = canvas;
		const gl = canvas.getContext("webgl", {
			alpha: false,
			antialias: false,
			depth: false,
			stencil: false,
			powerPreference: "high-performance"
		});
		if (!gl) throw new Error("当前环境无法开启粒子海");
		this.gl = gl;
		const vs = compile(gl, gl.VERTEX_SHADER, VERT);
		const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
		const program = gl.createProgram();
		if (!program) throw new Error("无法创建粒子程序");
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.bindAttribLocation(program, 0, "aP");
		gl.linkProgram(program);
		gl.deleteShader(vs);
		gl.deleteShader(fs);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			const log = gl.getProgramInfoLog(program) || "程序链接失败";
			throw new Error(log);
		}
		this.program = program;
		for (const name of [
			"uTime",
			"uSub",
			"uBass",
			"uMid",
			"uHigh",
			"uFlow",
			"uTension",
			"uTexture",
			"uElastic",
			"uBeat",
			"uPointer",
			"uActive",
			"uRipple",
			"uAspect",
			"uDpr",
			"uMaxPoint",
			"uPass"
		]) this.loc[name] = gl.getUniformLocation(program, name);
		const buffer = gl.createBuffer();
		if (!buffer) throw new Error("无法创建粒子缓冲");
		this.buffer = buffer;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
		const range = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
		this.maxPoint = range && range.length > 1 ? range[1] : 64;
		gl.clearColor(0, 0, 0, 1);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		this.setDensity(.58);
		this.resize();
	}
	resize() {
		const w = this.canvas.clientWidth;
		const h = this.canvas.clientHeight;
		if (w < 2 || h < 2) return;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const pw = Math.round(w * dpr);
		const ph = Math.round(h * dpr);
		if (this.canvas.width !== pw || this.canvas.height !== ph) {
			this.canvas.width = pw;
			this.canvas.height = ph;
		}
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		this.dpr = dpr;
		this.aspect = w / h;
	}
	setDensity(density) {
		const d = Math.min(1, Math.max(0, density));
		const cols = 180 + Math.round(d * 180);
		const thick = 4 + Math.round(d * 4);
		if (cols === this.cols && thick === this.thick) return;
		this.cols = cols;
		this.thick = thick;
		const layers = 5;
		const count = cols * thick * layers;
		const data = new Float32Array(count * 4);
		let i = 0;
		for (let layer = 0; layer < layers; layer++) for (let row = 0; row < thick; row++) for (let col = 0; col < cols; col++) {
			data[i++] = col / (cols - 1) * 2 - 1;
			data[i++] = row / (thick - 1);
			data[i++] = layer;
			data[i++] = Math.random();
		}
		const gl = this.gl;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
		this.count = count;
	}
	render(u) {
		const gl = this.gl;
		this.resize();
		gl.useProgram(this.program);
		gl.clear(gl.COLOR_BUFFER_BIT);
		const set = (name, value) => {
			const loc = this.loc[name];
			if (loc) gl.uniform1f(loc, value);
		};
		set("uTime", u.time);
		set("uSub", u.sub);
		set("uBass", u.bass);
		set("uMid", u.mid);
		set("uHigh", u.high);
		set("uFlow", u.flow);
		set("uTension", u.tension);
		set("uTexture", u.texture);
		set("uElastic", u.elastic);
		set("uBeat", u.beat);
		set("uActive", u.pointerActive);
		set("uRipple", u.ripple);
		set("uAspect", this.aspect);
		set("uDpr", this.dpr);
		set("uMaxPoint", this.maxPoint);
		const pointer = this.loc.uPointer;
		if (pointer) gl.uniform2f(pointer, u.pointerX, u.pointerY);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		const pass = this.loc.uPass;
		if (pass) gl.uniform1f(pass, 1);
		gl.drawArrays(gl.POINTS, 0, this.count);
		if (pass) gl.uniform1f(pass, 0);
		gl.drawArrays(gl.POINTS, 0, this.count);
	}
	destroy() {
		const gl = this.gl;
		gl.deleteBuffer(this.buffer);
		gl.deleteProgram(this.program);
	}
};
var SeaAudio = class {
	audio;
	ctx = null;
	analyser = null;
	gain = null;
	freq = null;
	env = {
		sub: 0,
		bass: 0,
		mid: 0,
		high: 0
	};
	avgBass = .16;
	lastBeat = 0;
	intervals = [];
	beat = 0;
	clock = 0;
	bpm = 0;
	volume = .86;
	failed = false;
	constructor(src) {
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
			analyser.smoothingTimeConstant = .78;
			const gain = ctx.createGain();
			gain.gain.value = this.volume;
			ctx.createMediaElementSource(this.audio).connect(analyser);
			analyser.connect(gain);
			gain.connect(ctx.destination);
			this.ctx = ctx;
			this.analyser = analyser;
			this.gain = gain;
			this.freq = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
		}
		if (this.ctx.state === "suspended") await this.ctx.resume();
	}
	setVolume(value) {
		this.volume = value;
		if (this.gain) this.gain.gain.value = value;
	}
	loadTrack(url) {
		const wasPlaying = !this.audio.paused;
		this.failed = false;
		this.audio.src = url;
		this.resetMeter();
		if (wasPlaying) this.audio.play();
	}
	seek(time) {
		if (!Number.isFinite(time)) return;
		const dur = this.audio.duration;
		const next = Number.isFinite(dur) ? Math.min(Math.max(0, time), Math.max(0, dur - .05)) : Math.max(0, time);
		this.audio.currentTime = next;
	}
	sample(dt) {
		this.beat *= Math.exp(-3.5 * Math.max(0, dt));
		if (this.analyser && this.freq && this.ctx) {
			this.analyser.getByteFrequencyData(this.freq);
			const nyq = this.ctx.sampleRate / 2;
			const n = this.analyser.frequencyBinCount;
			const band = (lo, hi) => {
				let a = Math.max(0, Math.floor(lo / nyq * n));
				let b = Math.min(n, Math.ceil(hi / nyq * n));
				if (b <= a) b = Math.min(n, a + 1);
				let sum = 0;
				for (let i = a; i < b; i++) sum += this.freq[i] ?? 0;
				return sum / Math.max(1, b - a) / 255;
			};
			const raw = {
				sub: band(20, 70),
				bass: band(70, 180),
				mid: band(180, 2200),
				high: band(2200, 12e3)
			};
			const follow = (prev, value) => value > prev ? prev + (value - prev) * .5 : prev + (value - prev) * .14;
			this.env.sub = follow(this.env.sub, raw.sub);
			this.env.bass = follow(this.env.bass, raw.bass);
			this.env.mid = follow(this.env.mid, raw.mid);
			this.env.high = follow(this.env.high, raw.high);
			this.avgBass = this.avgBass * .985 + raw.bass * .015;
			this.clock += dt;
			const gap = this.clock - this.lastBeat;
			if (raw.bass > .2 && raw.bass > this.avgBass * 1.42 && gap > .28) {
				if (this.lastBeat > 0 && gap < 1.6) {
					this.intervals.push(gap);
					if (this.intervals.length > 14) this.intervals.shift();
					const sorted = [...this.intervals].sort((x, y) => x - y);
					let bpm = 60 / (sorted[Math.floor(sorted.length / 2)] ?? gap);
					while (bpm < 74) bpm *= 2;
					while (bpm > 176) bpm /= 2;
					this.bpm = this.bpm === 0 ? bpm : this.bpm * .65 + bpm * .35;
				}
				this.lastBeat = this.clock;
				this.beat = 1;
			}
		}
		return {
			...this.env,
			bpm: this.bpm,
			beat: this.beat
		};
	}
	resetMeter() {
		this.env = {
			sub: 0,
			bass: 0,
			mid: 0,
			high: 0
		};
		this.intervals = [];
		this.bpm = 0;
		this.lastBeat = 0;
		this.beat = 0;
		this.avgBass = .16;
	}
	destroy() {
		this.audio.pause();
		this.audio.removeAttribute("src");
		this.audio.load();
		this.ctx?.close();
		this.ctx = null;
	}
};
var TRACK_URL = "/audio/track.mp3";
var TRACK_NAME = "酣眠被子 - 长风破浪";
var INITIAL_LIVE = {
	sub: 0,
	bass: 0,
	mid: 0,
	high: 0,
	bpm: 0,
	current: 0,
	duration: 0,
	playing: false,
	beat: 0
};
function fmt(time) {
	if (!Number.isFinite(time) || time < 0) return "00:00";
	const s = Math.floor(time);
	const m = Math.floor(s / 60);
	return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
function Control({ label, value, onChange }) {
	const shown = Math.round(value * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "sea-row",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sea-row-label",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "sea-meter",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "sea-meter-fill",
					style: { transform: `scaleX(${value})` }
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "sea-range",
					type: "range",
					min: 0,
					max: 100,
					value: shown,
					"aria-label": label,
					onChange: (event) => onChange(Number(event.target.value) / 100)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sea-row-val",
				children: shown
			})
		]
	});
}
function Meter({ label, value }) {
	const clamped = Math.min(1, Math.max(0, value));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "sea-row",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sea-row-label",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sea-meter",
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "sea-meter-fill",
					style: { transform: `scaleX(${clamped})` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sea-row-val",
				children: Math.round(clamped * 100)
			})
		]
	});
}
function SeaStage() {
	const canvasRef = (0, import_react.useRef)(null);
	const audioRef = (0, import_react.useRef)(null);
	const objectUrl = (0, import_react.useRef)(null);
	const seeking = (0, import_react.useRef)(false);
	const pointer = (0, import_react.useRef)({
		x: 0,
		y: .2,
		active: 0,
		ripple: 0
	});
	const hotTimer = (0, import_react.useRef)(null);
	const startedRef = (0, import_react.useRef)(false);
	const [flow, setFlow] = (0, import_react.useState)(.48);
	const [tension, setTension] = (0, import_react.useState)(.36);
	const [texture, setTexture] = (0, import_react.useState)(.46);
	const [density, setDensity] = (0, import_react.useState)(.62);
	const [volume, setVolume] = (0, import_react.useState)(.86);
	const [elastic, setElastic] = (0, import_react.useState)(false);
	const [watch, setWatch] = (0, import_react.useState)(false);
	const [hot, setHot] = (0, import_react.useState)(false);
	const [panel, setPanel] = (0, import_react.useState)(false);
	const [started, setStarted] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)(TRACK_NAME);
	const [gpuError, setGpuError] = (0, import_react.useState)("");
	const [audioError, setAudioError] = (0, import_react.useState)("");
	const [live, setLive] = (0, import_react.useState)(INITIAL_LIVE);
	const ui = (0, import_react.useRef)({
		flow,
		tension,
		texture,
		density,
		volume,
		elastic
	});
	ui.current = {
		flow,
		tension,
		texture,
		density,
		volume,
		elastic
	};
	startedRef.current = started;
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		let field;
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
		const frame = (now) => {
			if (!alive) return;
			const dt = Math.min(.05, (now - last) / 1e3);
			last = now;
			sim += dt * (reduced ? .22 : 1);
			pointer.current.ripple *= Math.exp(-1.7 * dt);
			if (pointer.current.active < .98) pointer.current.active *= Math.exp(-1.4 * dt);
			const playing = !audio.audio.paused && !audio.audio.ended;
			const sample = audio.sample(playing ? dt : 0);
			const drive = playing ? 1 : 0;
			const idleSub = .16 + .07 * Math.sin(sim * .65);
			const idleBass = .28 + .12 * Math.sin(sim * .5);
			const idleMid = .16 + .08 * Math.sin(sim * .83);
			const idleHigh = .1 + .06 * Math.sin(sim * 1.27);
			const mix = (real, idle) => real * drive + idle * (1 - drive);
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
				ripple: pointer.current.ripple
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
					beat: playing ? sample.beat : 0
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
	(0, import_react.useEffect)(() => {
		return () => {
			if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			const target = event.target;
			if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
			if (event.code === "Space") {
				event.preventDefault();
				toggle();
			} else if (event.key === "f" || event.key === "F") toggleWatch();
			else if (event.key === "b" || event.key === "B") setElastic((value) => !value);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	});
	(0, import_react.useEffect)(() => {
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
		} catch {}
	}
	function pointFrom(event) {
		const rect = event.currentTarget.getBoundingClientRect();
		pointer.current.x = (event.clientX - rect.left) / rect.width * 2 - 1;
		pointer.current.y = -((event.clientY - rect.top) / rect.height * 2 - 1);
		pointer.current.active = 1;
	}
	function onFile(event) {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file || !audioRef.current) return;
		if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
		const url = URL.createObjectURL(file);
		objectUrl.current = url;
		audioRef.current.loadTrack(url);
		setName(file.name.replace(/\.[^.]+$/, ""));
		setAudioError("");
		play();
	}
	const bpmLabel = live.bpm > 0 ? live.bpm.toFixed(1) : "——";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: `sea-app${watch ? " is-watch" : ""}${hot ? " is-hot" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "sea-canvas",
				"aria-label": "声波粒子海",
				onPointerDown: (event) => {
					event.currentTarget.setPointerCapture(event.pointerId);
					pointFrom(event);
					pointer.current.ripple = 1;
					poke();
					if (!startedRef.current) play();
				},
				onPointerMove: (event) => {
					if (event.pointerType === "mouse" || event.buttons > 0) pointFrom(event);
					if (watch) poke();
				},
				onPointerUp: () => {
					pointer.current.active = .65;
				},
				onPointerLeave: () => {
					pointer.current.active = 0;
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "sea-vignette" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sea-beat",
				style: { opacity: live.beat * .55 }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sea-chrome",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "sea-brand",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sea-brand-mark" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "粒子海" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `sea-panel-toggle${panel ? " is-on" : ""}`,
						"aria-expanded": panel,
						onClick: () => setPanel((open) => !open),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudioLines, {}), "状态"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: `sea-hud${panel ? " is-open" : ""}`,
						"aria-label": "音频状态",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "sea-import",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { size: 15 }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "sea-import-title",
										children: "导入音频"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "sea-import-sub",
										children: "MP3 / WAV / FLAC"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										hidden: true,
										type: "file",
										accept: "audio/*,.mp3,.wav,.flac,.m4a,.ogg",
										onChange: onFile
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sea-bpm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sea-bpm-num",
									children: bpmLabel
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sea-bpm-unit",
									children: "BPM"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "sea-block",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "sea-kicker",
										children: "ENERGY"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Control, {
										label: "FLOW",
										value: flow,
										onChange: setFlow
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Control, {
										label: "TENSION",
										value: tension,
										onChange: setTension
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "sea-block",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "sea-kicker",
										children: "FREQUENCY"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
										label: "SUB",
										value: live.sub
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
										label: "BASS",
										value: live.bass
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
										label: "MID",
										value: live.mid
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
										label: "HIGH",
										value: live.high
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "sea-block",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "sea-kicker",
										children: "CHARACTER"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Control, {
										label: "DENSITY",
										value: density,
										onChange: setDensity
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Control, {
										label: "TEXTURE",
										value: texture,
										onChange: setTexture
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Control, {
										label: "VOLUME",
										value: volume,
										onChange: setVolume
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sea-track",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "sea-play",
									onClick: () => void toggle(),
									"aria-label": live.playing ? "暂停" : "播放",
									children: live.playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "is-play" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "sea-track-meta",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "sea-filename",
											title: name,
											children: name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "sea-time",
											children: [
												fmt(live.current),
												" / ",
												fmt(live.duration)
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "sea-meter",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "sea-meter-fill",
												style: { transform: `scaleX(${live.duration > 0 ? live.current / live.duration : 0})` }
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												className: "sea-range",
												type: "range",
												min: 0,
												max: Math.max(live.duration, .01),
												step: .01,
												value: Math.min(live.current, Math.max(live.duration, .01)),
												"aria-label": "播放进度",
												onPointerDown: () => {
													seeking.current = true;
												},
												onPointerUp: () => {
													seeking.current = false;
												},
												onChange: (event) => {
													const time = Number(event.target.value);
													seeking.current = true;
													audioRef.current?.seek(time);
													setLive((prev) => ({
														...prev,
														current: time
													}));
												}
											})]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "sea-hint",
								children: "划过海面激起涟漪。空格播放，B 弹跳，F 全屏观看。"
							}),
							audioError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "sea-hint",
								children: audioError
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sea-dock",
						children: [
							!started ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "sea-cta",
								onClick: () => void play(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "is-play" }), "播放长风破浪"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "sea-pop",
								onClick: () => void toggle(),
								"aria-label": live.playing ? "暂停" : "播放",
								children: live.playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "is-play" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: `sea-pop${elastic ? " is-on" : ""}`,
								"aria-pressed": elastic,
								onClick: () => setElastic((value) => !value),
								children: "弹"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: `sea-pill${watch ? " is-on" : ""}`,
								onClick: () => void toggleWatch(),
								children: [watch ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, {}), watch ? "返回" : "全屏观看"]
							})
						]
					})
				]
			}),
			gpuError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sea-error",
				children: gpuError
			}) : null
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeaStage, {});
}
//#endregion
export { Home as component };
