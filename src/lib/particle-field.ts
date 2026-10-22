export type FieldUniforms = {
  time: number;
  sub: number;
  bass: number;
  mid: number;
  high: number;
  flow: number;
  tension: number;
  texture: number;
  elastic: number;
  beat: number;
  pointerX: number;
  pointerY: number;
  pointerActive: number;
  ripple: number;
};

const VERT = `
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

const FRAG = `
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

function compile(gl: WebGLRenderingContext, type: number, source: string) {
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

export class ParticleField {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private buffer: WebGLBuffer;
  private loc: Record<string, WebGLUniformLocation | null> = {};
  private count = 0;
  private cols = -1;
  private thick = -1;
  private maxPoint = 64;
  private dpr = 1;
  private aspect = 1;

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
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

    const names = [
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
      "uPass",
    ];
    for (const name of names) this.loc[name] = gl.getUniformLocation(program, name);

    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("无法创建粒子缓冲");
    this.buffer = buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);

    const range = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array | null;
    this.maxPoint = range && range.length > 1 ? range[1]! : 64;
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    this.setDensity(0.58);
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

  setDensity(density: number) {
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
    for (let layer = 0; layer < layers; layer++) {
      for (let row = 0; row < thick; row++) {
        for (let col = 0; col < cols; col++) {
          data[i++] = (col / (cols - 1)) * 2 - 1;
          data[i++] = row / (thick - 1);
          data[i++] = layer;
          data[i++] = Math.random();
        }
      }
    }
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    this.count = count;
  }

  render(u: FieldUniforms) {
    const gl = this.gl;
    this.resize();
    gl.useProgram(this.program);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const set = (name: string, value: number) => {
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
}
