import{i as e,n as t,r as n,t as r}from"./index-DcfAzG64.js";var i=r(`audio-lines`,[[`path`,{d:`M2 10v3`,key:`1fnikh`}],[`path`,{d:`M6 6v11`,key:`11sgs0`}],[`path`,{d:`M10 3v18`,key:`yhl04a`}],[`path`,{d:`M14 8v7`,key:`3a1oy3`}],[`path`,{d:`M18 5v13`,key:`123xd1`}],[`path`,{d:`M22 10v3`,key:`154ddg`}]]),a=r(`maximize-2`,[[`polyline`,{points:`15 3 21 3 21 9`,key:`mznyad`}],[`polyline`,{points:`9 21 3 21 3 15`,key:`1avn1i`}],[`line`,{x1:`21`,x2:`14`,y1:`3`,y2:`10`,key:`ota7mn`}],[`line`,{x1:`3`,x2:`10`,y1:`21`,y2:`14`,key:`1atl0r`}]]),o=r(`minimize-2`,[[`polyline`,{points:`4 14 10 14 10 20`,key:`11kfnr`}],[`polyline`,{points:`20 10 14 10 14 4`,key:`rlmsce`}],[`line`,{x1:`14`,x2:`21`,y1:`10`,y2:`3`,key:`o5lafz`}],[`line`,{x1:`3`,x2:`10`,y1:`21`,y2:`14`,key:`1atl0r`}]]),s=r(`pause`,[[`rect`,{x:`14`,y:`4`,width:`4`,height:`16`,rx:`1`,key:`zuxfzm`}],[`rect`,{x:`6`,y:`4`,width:`4`,height:`16`,rx:`1`,key:`1okwgv`}]]),c=r(`play`,[[`polygon`,{points:`6 3 20 12 6 21 6 3`,key:`1oa8hb`}]]),l=r(`upload`,[[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}],[`polyline`,{points:`17 8 12 3 7 8`,key:`t8dd8p`}],[`line`,{x1:`12`,x2:`12`,y1:`3`,y2:`15`,key:`widbto`}]]),u=e(n(),1),d=`
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
`,f=`
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
`;function p(e,t,n){let r=e.createShader(t);if(!r)throw Error(`无法创建着色器`);if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){let t=e.getShaderInfoLog(r)||`着色器编译失败`;throw e.deleteShader(r),Error(t)}return r}var m=class{canvas;gl;program;buffer;loc={};count=0;cols=-1;thick=-1;maxPoint=64;dpr=1;aspect=1;constructor(e){this.canvas=e;let t=e.getContext(`webgl`,{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:`high-performance`});if(!t)throw Error(`当前环境无法开启粒子海`);this.gl=t;let n=p(t,t.VERTEX_SHADER,d),r=p(t,t.FRAGMENT_SHADER,f),i=t.createProgram();if(!i)throw Error(`无法创建粒子程序`);if(t.attachShader(i,n),t.attachShader(i,r),t.bindAttribLocation(i,0,`aP`),t.linkProgram(i),t.deleteShader(n),t.deleteShader(r),!t.getProgramParameter(i,t.LINK_STATUS)){let e=t.getProgramInfoLog(i)||`程序链接失败`;throw Error(e)}this.program=i;for(let e of[`uTime`,`uSub`,`uBass`,`uMid`,`uHigh`,`uFlow`,`uTension`,`uTexture`,`uElastic`,`uBeat`,`uPointer`,`uActive`,`uRipple`,`uAspect`,`uDpr`,`uMaxPoint`,`uPass`])this.loc[e]=t.getUniformLocation(i,e);let a=t.createBuffer();if(!a)throw Error(`无法创建粒子缓冲`);this.buffer=a,t.bindBuffer(t.ARRAY_BUFFER,a),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,4,t.FLOAT,!1,0,0);let o=t.getParameter(t.ALIASED_POINT_SIZE_RANGE);this.maxPoint=o&&o.length>1?o[1]:64,t.clearColor(0,0,0,1),t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE),this.setDensity(.58),this.resize()}resize(){let e=this.canvas.clientWidth,t=this.canvas.clientHeight;if(e<2||t<2)return;let n=Math.min(window.devicePixelRatio||1,2),r=Math.round(e*n),i=Math.round(t*n);(this.canvas.width!==r||this.canvas.height!==i)&&(this.canvas.width=r,this.canvas.height=i),this.gl.viewport(0,0,this.canvas.width,this.canvas.height),this.dpr=n,this.aspect=e/t}setDensity(e){let t=Math.min(1,Math.max(0,e)),n=180+Math.round(t*180),r=4+Math.round(t*4);if(n===this.cols&&r===this.thick)return;this.cols=n,this.thick=r;let i=n*r*5,a=new Float32Array(i*4),o=0;for(let e=0;e<5;e++)for(let t=0;t<r;t++)for(let i=0;i<n;i++)a[o++]=i/(n-1)*2-1,a[o++]=t/(r-1),a[o++]=e,a[o++]=Math.random();let s=this.gl;s.bindBuffer(s.ARRAY_BUFFER,this.buffer),s.bufferData(s.ARRAY_BUFFER,a,s.STATIC_DRAW),this.count=i}render(e){let t=this.gl;this.resize(),t.useProgram(this.program),t.clear(t.COLOR_BUFFER_BIT);let n=(e,n)=>{let r=this.loc[e];r&&t.uniform1f(r,n)};n(`uTime`,e.time),n(`uSub`,e.sub),n(`uBass`,e.bass),n(`uMid`,e.mid),n(`uHigh`,e.high),n(`uFlow`,e.flow),n(`uTension`,e.tension),n(`uTexture`,e.texture),n(`uElastic`,e.elastic),n(`uBeat`,e.beat),n(`uActive`,e.pointerActive),n(`uRipple`,e.ripple),n(`uAspect`,this.aspect),n(`uDpr`,this.dpr),n(`uMaxPoint`,this.maxPoint);let r=this.loc.uPointer;r&&t.uniform2f(r,e.pointerX,e.pointerY),t.bindBuffer(t.ARRAY_BUFFER,this.buffer);let i=this.loc.uPass;i&&t.uniform1f(i,1),t.drawArrays(t.POINTS,0,this.count),i&&t.uniform1f(i,0),t.drawArrays(t.POINTS,0,this.count)}destroy(){let e=this.gl;e.deleteBuffer(this.buffer),e.deleteProgram(this.program)}},h=class{audio;ctx=null;analyser=null;gain=null;freq=null;env={sub:0,bass:0,mid:0,high:0};avgBass=.16;lastBeat=0;intervals=[];beat=0;clock=0;bpm=0;volume=.86;failed=!1;constructor(e){let t=new Audio;t.crossOrigin=`anonymous`,t.preload=`auto`,t.loop=!0,t.src=e,t.addEventListener(`error`,()=>{this.failed=!0}),this.audio=t}async resume(){if(!this.ctx){let e=new AudioContext,t=e.createAnalyser();t.fftSize=2048,t.smoothingTimeConstant=.78;let n=e.createGain();n.gain.value=this.volume,e.createMediaElementSource(this.audio).connect(t),t.connect(n),n.connect(e.destination),this.ctx=e,this.analyser=t,this.gain=n,this.freq=new Uint8Array(new ArrayBuffer(t.frequencyBinCount))}this.ctx.state===`suspended`&&await this.ctx.resume()}setVolume(e){this.volume=e,this.gain&&(this.gain.gain.value=e)}loadTrack(e){let t=!this.audio.paused;this.failed=!1,this.audio.src=e,this.resetMeter(),t&&this.audio.play()}seek(e){if(!Number.isFinite(e))return;let t=this.audio.duration,n=Number.isFinite(t)?Math.min(Math.max(0,e),Math.max(0,t-.05)):Math.max(0,e);this.audio.currentTime=n}sample(e){if(this.beat*=Math.exp(-3.5*Math.max(0,e)),this.analyser&&this.freq&&this.ctx){this.analyser.getByteFrequencyData(this.freq);let t=this.ctx.sampleRate/2,n=this.analyser.frequencyBinCount,r=(e,r)=>{let i=Math.max(0,Math.floor(e/t*n)),a=Math.min(n,Math.ceil(r/t*n));a<=i&&(a=Math.min(n,i+1));let o=0;for(let e=i;e<a;e++)o+=this.freq[e]??0;return o/Math.max(1,a-i)/255},i={sub:r(20,70),bass:r(70,180),mid:r(180,2200),high:r(2200,12e3)},a=(e,t)=>t>e?e+(t-e)*.5:e+(t-e)*.14;this.env.sub=a(this.env.sub,i.sub),this.env.bass=a(this.env.bass,i.bass),this.env.mid=a(this.env.mid,i.mid),this.env.high=a(this.env.high,i.high),this.avgBass=this.avgBass*.985+i.bass*.015,this.clock+=e;let o=this.clock-this.lastBeat;if(i.bass>.2&&i.bass>this.avgBass*1.42&&o>.28){if(this.lastBeat>0&&o<1.6){this.intervals.push(o),this.intervals.length>14&&this.intervals.shift();let e=[...this.intervals].sort((e,t)=>e-t),t=60/(e[Math.floor(e.length/2)]??o);for(;t<74;)t*=2;for(;t>176;)t/=2;this.bpm=this.bpm===0?t:this.bpm*.65+t*.35}this.lastBeat=this.clock,this.beat=1}}return{...this.env,bpm:this.bpm,beat:this.beat}}resetMeter(){this.env={sub:0,bass:0,mid:0,high:0},this.intervals=[],this.bpm=0,this.lastBeat=0,this.beat=0,this.avgBass=.16}destroy(){this.audio.pause(),this.audio.removeAttribute(`src`),this.audio.load(),this.ctx?.close(),this.ctx=null}},g=t(),_=`/audio/track.mp3`,v=`酣眠被子 - 长风破浪`,y={sub:0,bass:0,mid:0,high:0,bpm:0,current:0,duration:0,playing:!1,beat:0};function b(e){if(!Number.isFinite(e)||e<0)return`00:00`;let t=Math.floor(e),n=Math.floor(t/60);return`${String(n).padStart(2,`0`)}:${String(t%60).padStart(2,`0`)}`}function x({label:e,value:t,onChange:n}){let r=Math.round(t*100);return(0,g.jsxs)(`label`,{className:`sea-row`,children:[(0,g.jsx)(`span`,{className:`sea-row-label`,children:e}),(0,g.jsxs)(`span`,{className:`sea-meter`,children:[(0,g.jsx)(`span`,{className:`sea-meter-fill`,style:{transform:`scaleX(${t})`}}),(0,g.jsx)(`input`,{className:`sea-range`,type:`range`,min:0,max:100,value:r,"aria-label":e,onChange:e=>n(Number(e.target.value)/100)})]}),(0,g.jsx)(`span`,{className:`sea-row-val`,children:r})]})}function S({label:e,value:t}){let n=Math.min(1,Math.max(0,t));return(0,g.jsxs)(`div`,{className:`sea-row`,children:[(0,g.jsx)(`span`,{className:`sea-row-label`,children:e}),(0,g.jsx)(`span`,{className:`sea-meter`,"aria-hidden":!0,children:(0,g.jsx)(`span`,{className:`sea-meter-fill`,style:{transform:`scaleX(${n})`}})}),(0,g.jsx)(`span`,{className:`sea-row-val`,children:Math.round(n*100)})]})}function C(){let e=(0,u.useRef)(null),t=(0,u.useRef)(null),n=(0,u.useRef)(null),r=(0,u.useRef)(!1),d=(0,u.useRef)({x:0,y:.2,active:0,ripple:0}),f=(0,u.useRef)(null),p=(0,u.useRef)(!1),[C,w]=(0,u.useState)(.48),[T,E]=(0,u.useState)(.36),[D,ee]=(0,u.useState)(.46),[O,te]=(0,u.useState)(.62),[k,ne]=(0,u.useState)(.86),[A,j]=(0,u.useState)(!1),[M,N]=(0,u.useState)(!1),[P,F]=(0,u.useState)(!1),[I,L]=(0,u.useState)(!1),[R,z]=(0,u.useState)(!1),[B,V]=(0,u.useState)(v),[H,U]=(0,u.useState)(``),[W,G]=(0,u.useState)(``),[K,q]=(0,u.useState)(y),J=(0,u.useRef)({flow:C,tension:T,texture:D,density:O,volume:k,elastic:A});J.current={flow:C,tension:T,texture:D,density:O,volume:k,elastic:A},p.current=R,(0,u.useEffect)(()=>{let n=e.current;if(!n)return;let r;try{r=new m(n)}catch(e){U(e instanceof Error?e.message:`粒子海无法启动`);return}let i=new h(_);t.current=i;let a=!0,o=0,s=performance.now(),c=0,l=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,u=0,f=e=>{if(!a)return;let t=Math.min(.05,(e-s)/1e3);s=e,u+=t*(l?.22:1),d.current.ripple*=Math.exp(-1.7*t),d.current.active<.98&&(d.current.active*=Math.exp(-1.4*t));let n=!i.audio.paused&&!i.audio.ended,p=i.sample(n?t:0),m=+!!n,h=.16+.07*Math.sin(u*.65),g=.28+.12*Math.sin(u*.5),_=.16+.08*Math.sin(u*.83),v=.1+.06*Math.sin(u*1.27),y=(e,t)=>e*m+t*(1-m);if(i.setVolume(J.current.volume),r.setDensity(J.current.density),r.render({time:u,sub:y(p.sub,h),bass:y(p.bass,g),mid:y(p.mid,_),high:y(p.high,v),flow:J.current.flow,tension:J.current.tension,texture:J.current.texture,elastic:+!!J.current.elastic,beat:n?p.beat:0,pointerX:d.current.x,pointerY:d.current.y,pointerActive:d.current.active,ripple:d.current.ripple}),e-c>90){c=e,i.failed&&a&&G(`这段音频没有加载成功`);let t=Number.isFinite(i.audio.duration)?i.audio.duration:0;q({sub:y(p.sub,h),bass:y(p.bass,g),mid:y(p.mid,_),high:y(p.high,v),bpm:p.bpm,current:i.audio.currentTime||0,duration:t,playing:n,beat:n?p.beat:0})}o=requestAnimationFrame(f)};return o=requestAnimationFrame(f),()=>{a=!1,cancelAnimationFrame(o),r.destroy(),i.destroy(),t.current=null}},[]),(0,u.useEffect)(()=>()=>{n.current&&URL.revokeObjectURL(n.current)},[]),(0,u.useEffect)(()=>{let e=e=>{let t=e.target;t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement||(e.code===`Space`?(e.preventDefault(),Z()):e.key===`f`||e.key===`F`?Q():(e.key===`b`||e.key===`B`)&&j(e=>!e))};return window.addEventListener(`keydown`,e),()=>window.removeEventListener(`keydown`,e)}),(0,u.useEffect)(()=>{let e=()=>{document.fullscreenElement||N(!1)};return document.addEventListener(`fullscreenchange`,e),()=>document.removeEventListener(`fullscreenchange`,e)},[]);function Y(){F(!0),f.current&&window.clearTimeout(f.current),f.current=window.setTimeout(()=>F(!1),2400)}async function X(){let e=t.current;if(e)try{await e.resume(),await e.audio.play(),z(!0),G(``)}catch{G(`浏览器拦住了自动播放，再点一次播放`)}}async function Z(){let e=t.current;e&&(e.audio.paused?await X():e.audio.pause())}async function Q(){let e=!M;N(e),Y();try{e?await document.documentElement.requestFullscreen():document.fullscreenElement&&await document.exitFullscreen()}catch{}}function $(e){let t=e.currentTarget.getBoundingClientRect();d.current.x=(e.clientX-t.left)/t.width*2-1,d.current.y=-((e.clientY-t.top)/t.height*2-1),d.current.active=1}function re(e){let r=e.target.files?.[0];if(e.target.value=``,!r||!t.current)return;n.current&&URL.revokeObjectURL(n.current);let i=URL.createObjectURL(r);n.current=i,t.current.loadTrack(i),V(r.name.replace(/\.[^.]+$/,``)),G(``),X()}let ie=K.bpm>0?K.bpm.toFixed(1):`——`;return(0,g.jsxs)(`main`,{className:`sea-app${M?` is-watch`:``}${P?` is-hot`:``}`,children:[(0,g.jsx)(`canvas`,{ref:e,className:`sea-canvas`,"aria-label":`声波粒子海`,onPointerDown:e=>{e.currentTarget.setPointerCapture(e.pointerId),$(e),d.current.ripple=1,Y(),p.current||X()},onPointerMove:e=>{(e.pointerType===`mouse`||e.buttons>0)&&$(e),M&&Y()},onPointerUp:()=>{d.current.active=.65},onPointerLeave:()=>{d.current.active=0}}),(0,g.jsx)(`div`,{className:`sea-vignette`}),(0,g.jsx)(`div`,{className:`sea-beat`,style:{opacity:K.beat*.55}}),(0,g.jsxs)(`div`,{className:`sea-chrome`,children:[(0,g.jsxs)(`header`,{className:`sea-brand`,children:[(0,g.jsx)(`span`,{className:`sea-brand-mark`}),(0,g.jsx)(`span`,{children:`粒子海`})]}),(0,g.jsxs)(`button`,{type:`button`,className:`sea-panel-toggle${I?` is-on`:``}`,"aria-expanded":I,onClick:()=>L(e=>!e),children:[(0,g.jsx)(i,{}),`状态`]}),(0,g.jsxs)(`aside`,{className:`sea-hud${I?` is-open`:``}`,"aria-label":`音频状态`,children:[(0,g.jsxs)(`label`,{className:`sea-import`,children:[(0,g.jsx)(l,{size:15}),(0,g.jsx)(`span`,{className:`sea-import-title`,children:`导入音频`}),(0,g.jsx)(`span`,{className:`sea-import-sub`,children:`MP3 / WAV / FLAC`}),(0,g.jsx)(`input`,{hidden:!0,type:`file`,accept:`audio/*,.mp3,.wav,.flac,.m4a,.ogg`,onChange:re})]}),(0,g.jsxs)(`div`,{className:`sea-bpm`,children:[(0,g.jsx)(`span`,{className:`sea-bpm-num`,children:ie}),(0,g.jsx)(`span`,{className:`sea-bpm-unit`,children:`BPM`})]}),(0,g.jsxs)(`section`,{className:`sea-block`,children:[(0,g.jsx)(`h2`,{className:`sea-kicker`,children:`ENERGY`}),(0,g.jsx)(x,{label:`FLOW`,value:C,onChange:w}),(0,g.jsx)(x,{label:`TENSION`,value:T,onChange:E})]}),(0,g.jsxs)(`section`,{className:`sea-block`,children:[(0,g.jsx)(`h2`,{className:`sea-kicker`,children:`FREQUENCY`}),(0,g.jsx)(S,{label:`SUB`,value:K.sub}),(0,g.jsx)(S,{label:`BASS`,value:K.bass}),(0,g.jsx)(S,{label:`MID`,value:K.mid}),(0,g.jsx)(S,{label:`HIGH`,value:K.high})]}),(0,g.jsxs)(`section`,{className:`sea-block`,children:[(0,g.jsx)(`h2`,{className:`sea-kicker`,children:`CHARACTER`}),(0,g.jsx)(x,{label:`DENSITY`,value:O,onChange:te}),(0,g.jsx)(x,{label:`TEXTURE`,value:D,onChange:ee}),(0,g.jsx)(x,{label:`VOLUME`,value:k,onChange:ne})]}),(0,g.jsxs)(`div`,{className:`sea-track`,children:[(0,g.jsx)(`button`,{type:`button`,className:`sea-play`,onClick:()=>void Z(),"aria-label":K.playing?`暂停`:`播放`,children:K.playing?(0,g.jsx)(s,{}):(0,g.jsx)(c,{className:`is-play`})}),(0,g.jsxs)(`div`,{className:`sea-track-meta`,children:[(0,g.jsx)(`div`,{className:`sea-filename`,title:B,children:B}),(0,g.jsxs)(`div`,{className:`sea-time`,children:[b(K.current),` / `,b(K.duration)]}),(0,g.jsxs)(`span`,{className:`sea-meter`,children:[(0,g.jsx)(`span`,{className:`sea-meter-fill`,style:{transform:`scaleX(${K.duration>0?K.current/K.duration:0})`}}),(0,g.jsx)(`input`,{className:`sea-range`,type:`range`,min:0,max:Math.max(K.duration,.01),step:.01,value:Math.min(K.current,Math.max(K.duration,.01)),"aria-label":`播放进度`,onPointerDown:()=>{r.current=!0},onPointerUp:()=>{r.current=!1},onChange:e=>{let n=Number(e.target.value);r.current=!0,t.current?.seek(n),q(e=>({...e,current:n}))}})]})]})]}),(0,g.jsx)(`p`,{className:`sea-hint`,children:`划过海面激起涟漪。空格播放，B 弹跳，F 全屏观看。`}),W?(0,g.jsx)(`p`,{className:`sea-hint`,children:W}):null]}),(0,g.jsxs)(`div`,{className:`sea-dock`,children:[R?(0,g.jsx)(`button`,{type:`button`,className:`sea-pop`,onClick:()=>void Z(),"aria-label":K.playing?`暂停`:`播放`,children:K.playing?(0,g.jsx)(s,{}):(0,g.jsx)(c,{className:`is-play`})}):(0,g.jsxs)(`button`,{type:`button`,className:`sea-cta`,onClick:()=>void X(),children:[(0,g.jsx)(c,{className:`is-play`}),`播放长风破浪`]}),(0,g.jsx)(`button`,{type:`button`,className:`sea-pop${A?` is-on`:``}`,"aria-pressed":A,onClick:()=>j(e=>!e),children:`弹`}),(0,g.jsxs)(`button`,{type:`button`,className:`sea-pill${M?` is-on`:``}`,onClick:()=>void Q(),children:[M?(0,g.jsx)(o,{}):(0,g.jsx)(a,{}),M?`返回`:`全屏观看`]})]})]}),H?(0,g.jsx)(`p`,{className:`sea-error`,children:H}):null]})}function w(){return(0,g.jsx)(C,{})}export{w as component};