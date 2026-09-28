const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = matchMedia('(pointer: coarse)').matches;

const SECTORS = [
  { code: '01', name: 'Accretion' },
  { code: '02', name: 'The Summit' },
  { code: '03', name: 'Galaxy of Works' },
  { code: '04', name: 'Event Horizon' },
];

// Camera path around the singularity, one key per chapter.
// off / offY shift the projection window so the black hole sits beside the text.
const KEYS = [
  { r: 8.6, el: 0.2, az: 0.78, off: -0.2, offY: 0 },
  { r: 14.5, el: 0.19, az: 2.1, off: 0.2, offY: 0 },
  { r: 26, el: 0.92, az: 2.9, off: -0.17, offY: 0 },
  { r: 4.4, el: 0.05, az: 3.9, off: 0, offY: 0 },
];

/* ======================================================================
   Sound
   ====================================================================== */

const CHORDS = [
  [55.0, 82.41, 110.0, 164.81],
  [49.0, 73.42, 98.0, 146.83],
  [43.65, 65.41, 87.31, 130.81],
  [36.71, 55.0, 73.42, 110.0],
];
const FILTER_BASE = [420, 320, 560, 240];
const SCALE = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];

class Sound {
  constructor() {
    this.ctx = null;
    this.on = false;
  }

  init() {
    if (this.ctx) return;
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    const ctx = (this.ctx = new C());

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.ratio.value = 3;
    this.master.connect(comp).connect(ctx.destination);

    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.impulse(5, 2.4);
    const wet = ctx.createGain();
    wet.gain.value = 0.6;
    this.reverb.connect(wet).connect(this.master);

    this.bus = ctx.createGain();
    this.bus.connect(this.master);
    this.bus.connect(this.reverb);

    this.droneFilter = ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.value = FILTER_BASE[0];
    this.droneFilter.Q.value = 0.8;
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.2;
    this.droneFilter.connect(droneGain).connect(this.bus);

    const levels = [0.5, 0.32, 0.22, 0.14];
    this.voices = CHORDS[0].map((f, i) => {
      const g = ctx.createGain();
      g.gain.value = levels[i];
      const saw = ctx.createOscillator();
      saw.type = 'sawtooth';
      saw.frequency.value = f;
      saw.detune.value = -7;
      const sine = ctx.createOscillator();
      sine.type = 'sine';
      sine.frequency.value = f;
      sine.detune.value = 6;
      saw.connect(g);
      sine.connect(g);
      g.connect(this.droneFilter);
      saw.start();
      sine.start();
      return { saw, sine };
    });

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 140;
    lfo.connect(lfoGain).connect(this.droneFilter.frequency);
    lfo.start();

    const noise = ctx.createBufferSource();
    noise.buffer = this.noise(3);
    noise.loop = true;
    this.windFilter = ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.value = 400;
    this.windFilter.Q.value = 0.9;
    this.windGain = ctx.createGain();
    this.windGain.gain.value = 0;
    noise.connect(this.windFilter).connect(this.windGain).connect(this.bus);

    const rumble = ctx.createBiquadFilter();
    rumble.type = 'lowpass';
    rumble.frequency.value = 90;
    const rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0.5;
    noise.connect(rumble).connect(rumbleGain).connect(this.bus);
    noise.start();
  }

  impulse(seconds, decay) {
    const rate = this.ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = this.ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  noise(seconds) {
    const rate = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, Math.floor(rate * seconds), rate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  start() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.on = true;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(0.85, t, 0.8);
    document.documentElement.classList.add('sound-on');
  }

  stop() {
    if (!this.ctx) return;
    this.on = false;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
    document.documentElement.classList.remove('sound-on');
  }

  toggle() {
    if (this.on) this.stop();
    else this.start();
  }

  setSector(i) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.voices.forEach((v, k) => {
      v.saw.frequency.setTargetAtTime(CHORDS[i][k], t, 1.1);
      v.sine.frequency.setTargetAtTime(CHORDS[i][k], t, 1.1);
    });
    this.droneFilter.frequency.setTargetAtTime(FILTER_BASE[i], t, 1.5);
    this.note(SCALE[(i * 2) % SCALE.length] / 2, 3, 0.07);
    this.note(SCALE[(i * 2 + 2) % SCALE.length] / 2, 3.5, 0.05, 0.18);
  }

  setWarp(w) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.windGain.gain.setTargetAtTime(w * 0.45, t, 0.12);
    this.windFilter.frequency.setTargetAtTime(300 + w * 2200, t, 0.15);
  }

  note(freq, dur = 1.6, vol = 0.09, delay = 0) {
    if (!this.ctx || !this.on) return;
    const t = this.ctx.currentTime + delay;
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    env.connect(this.bus);
    const a = this.ctx.createOscillator();
    a.type = 'sine';
    a.frequency.value = freq;
    const b = this.ctx.createOscillator();
    b.type = 'triangle';
    b.frequency.value = freq * 2;
    const bg = this.ctx.createGain();
    bg.gain.value = 0.25;
    a.connect(env);
    b.connect(bg).connect(env);
    a.start(t);
    b.start(t);
    a.stop(t + dur + 0.1);
    b.stop(t + dur + 0.1);
  }

  boom(vol = 0.55) {
    if (!this.ctx || !this.on) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(96, t);
    o.frequency.exponentialRampToValueAtTime(26, t + 1.4);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    o.connect(g).connect(this.bus);
    o.start(t);
    o.stop(t + 2);

    const n = this.ctx.createBufferSource();
    n.buffer = this.noise(1.2);
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(2400, t);
    f.frequency.exponentialRampToValueAtTime(120, t + 1.1);
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(vol * 0.35, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    n.connect(f).connect(ng).connect(this.bus);
    n.start(t);
  }

  swell() {
    if (!this.ctx || !this.on) return;
    const t = this.ctx.currentTime;
    const n = this.ctx.createBufferSource();
    n.buffer = this.noise(3);
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(120, t);
    f.frequency.exponentialRampToValueAtTime(3200, t + 2.2);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 2.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    n.connect(f).connect(g).connect(this.bus);
    n.start(t);
    setTimeout(() => this.boom(0.7), 2100);
  }
}

/* ======================================================================
   Particle field — rendered inside the black hole's own space scene,
   so it shares its renderer and is bent by the same lensing pass
   ====================================================================== */

const vertexShader = /* glsl */ `
precision highp float;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float uTime;
uniform float uSecA;
uniform float uSecB;
uniform float uMix;
uniform float uReveal;
uniform float uSpin;
uniform float uPulse;
uniform float uShockT;
uniform float uWarp;
uniform float uSize;
uniform float uViewH;
uniform float uPx;
uniform float uAspect;
uniform float uMouseStr;
uniform vec2 uMouse;
uniform vec3 uAxis;

in vec4 aSeed;
in vec3 aRand;
in float aScale;

out vec3 vColor;
out float vAlpha;
out float vPs;

const float PI = 3.14159265;
const float TAU = 6.2831853;
const vec3 INNER = vec3(1.0, 0.56, 0.56);
const vec3 OUTER = vec3(0.26, 0.24, 1.0);

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float ridged(vec2 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 5; i++) {
    float n = 1.0 - abs(vnoise(p) * 2.0 - 1.0);
    s += n * n * a;
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return s;
}

// 0: matter spiralling into the disk
void stateInfall(out vec3 p, out vec3 c, out float a) {
  float ph = fract(aSeed.x + uTime * 0.018 * (0.6 + aSeed.y));
  float r = mix(17.0, 1.05, pow(ph, 0.8));
  float th = aSeed.z * TAU + 9.0 / sqrt(r) + uTime * 0.04;
  float h = aRand.y * (0.04 + r * 0.04);
  p = vec3(cos(th) * r, h, sin(th) * r);
  float heat = 1.0 - smoothstep(1.3, 9.0, r);
  c = mix(OUTER, INNER, heat) + vec3(pow(heat, 5.0) * 0.7);
  a = smoothstep(0.0, 0.08, ph) * smoothstep(1.0, 1.7, r) * (0.55 + heat * 0.6);
}

float gSize = 1.0;

// 1: a Himalayan ridge of light beneath the singularity, drawn as scanlines
void stateSummit(out vec3 p, out vec3 c, out float a) {
  float row = floor(aSeed.y * 120.0) / 120.0;
  vec2 xz = (vec2(aSeed.x, row) - 0.5) * vec2(56.0, 50.0);
  float d = length(xz);
  float m = ridged(xz * 0.055 + vec2(3.0, 7.0));
  float lift = smoothstep(4.0, 13.0, d);
  float y = -3.2 + pow(m, 2.2) * 11.0 * lift;
  p = vec3(xz.x, y, xz.y);
  float snow = smoothstep(0.0, 3.5, y);
  c = mix(vec3(0.36, 0.28, 1.0), vec3(1.0, 0.98, 1.0), snow);
  c = mix(c, vec3(1.0, 0.55, 0.6), smoothstep(-3.2, -2.4, y) * (1.0 - lift) * 0.8);
  a = (1.0 - smoothstep(15.0, 27.0, d)) * (1.6 + 2.2 * snow);
  a *= 0.8 + 0.2 * sin(uTime * 1.7 + aSeed.w * 50.0);
  gSize = 0.8;
}

// 2: a five-armed galaxy with the black hole as its core
void stateGalaxy(out vec3 p, out vec3 c, out float a) {
  float r = 1.7 + pow(aSeed.x, 0.55) * 18.0;
  float arm = floor(aSeed.y * 5.0) / 5.0 * TAU;
  float th = arm + r * 0.42 + uSpin + (aSeed.z - 0.5) * 0.4;
  vec3 sc = aRand * pow(aSeed.w, 2.0) * (0.6 + r * 0.13);
  p = vec3(cos(th) * r + sc.x, sc.y * 0.35, sin(th) * r + sc.z);
  float core = 1.0 - smoothstep(1.7, 7.5, r);
  c = mix(vec3(0.36, 0.42, 1.0), vec3(1.0, 0.82, 0.58), core);
  c = mix(c, vec3(1.0, 0.36, 0.72), step(0.94, fract(aSeed.z * 13.7)) * 0.85);
  a = 0.85 + 0.8 * core + uPulse * 0.7;
}

// 3: a wormhole funnel streaming past the camera into the horizon
void stateWorm(out vec3 p, out vec3 c, out float a) {
  vec3 ax = normalize(uAxis);
  vec3 t1 = normalize(cross(ax, vec3(0.0, 1.0, 0.0)));
  vec3 t2 = cross(t1, ax);
  float ph = fract(aSeed.x + uTime * 0.1 * (0.7 + aSeed.y * 0.6));
  float d = mix(9.0, 0.9, ph);
  float rad = 0.9 + pow(d, 1.3) * 0.36 + 0.2 * sin(d * 0.9 + uTime);
  float th = aSeed.z * TAU + d * 0.35 + uTime * 0.35;
  p = ax * d + (t1 * cos(th) + t2 * sin(th)) * rad * (0.8 + aSeed.w * 0.4);
  float heat = 1.0 - smoothstep(0.9, 4.0, d);
  c = mix(vec3(0.32, 0.5, 1.0), vec3(1.0, 0.62, 0.82), heat);
  a = smoothstep(0.0, 0.1, ph) * smoothstep(0.9, 1.6, d);
}

void getState(float s, out vec3 p, out vec3 c, out float a) {
  gSize = 1.0;
  if (s < 0.5) stateInfall(p, c, a);
  else if (s < 1.5) stateSummit(p, c, a);
  else if (s < 2.5) stateGalaxy(p, c, a);
  else stateWorm(p, c, a);
}

void main() {
  vec3 pA; vec3 cA; float aA;
  vec3 pB; vec3 cB; float aB;
  getState(uSecA, pA, cA, aA);
  float sA = gSize;
  float sB = sA;
  if (uMix > 0.001) {
    getState(uSecB, pB, cB, aB);
    sB = gSize;
  } else {
    pB = pA; cB = cA; aB = aA;
  }

  float t = clamp(uMix * 1.6 - aSeed.w * 0.6, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  vec3 pos = mix(pA, pB, t);
  float bulge = sin(t * PI);
  pos += aRand * bulge * 3.2;
  float sw = bulge * 1.3;
  pos.xz = mat2(cos(sw), -sin(sw), sin(sw), cos(sw)) * pos.xz;
  vec3 col = mix(cA, cB, t) + vec3(0.25, 0.3, 0.6) * bulge;
  float alpha = mix(aA, aB, t);

  float rv = clamp(uReveal * 1.3 - aSeed.y * 0.3, 0.0, 1.0);
  rv = 1.0 - pow(1.0 - rv, 3.0);
  pos = mix(aRand * 0.4, pos, rv);
  alpha *= rv;

  float wave = 0.0;
  if (uShockT >= 0.0) {
    float dist = length(pos);
    float front = uShockT * 14.0;
    wave = exp(-pow((dist - front) * 0.8, 2.0)) * exp(-uShockT * 1.1);
    pos += normalize(pos + 1e-4) * wave * 1.6;
    col += vec3(0.6, 0.75, 1.0) * wave;
  }

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vec4 clip = projectionMatrix * mv;
  vec2 ndc = clip.xy / clip.w;
  vec2 dm = (ndc - uMouse) * vec2(uAspect, 1.0);
  float md = length(dm);
  float push = exp(-md * md * 16.0) * uMouseStr * step(0.0, clip.w);
  mv.xy += (dm / (md + 1e-4)) * push * (-mv.z) * 0.07;
  col += vec3(0.45, 0.6, 1.0) * push * 0.7;
  gl_Position = projectionMatrix * mv;

  float shapeSize = mix(sA, sB, t);
  float scale = mix(min(aScale, 1.0), aScale, shapeSize >= 1.0 ? 1.0 : 0.0) * shapeSize;
  float size = uSize * scale * (1.0 + wave * 1.6 + push * 0.9);
  // Sizes are worked out in CSS pixels, then scaled to the render target.
  float ps = size * projectionMatrix[1][1] * uViewH * 0.5 / -mv.z;
  float energy = ps < 2.0 ? max(ps, 0.05) / 2.0 : 1.0;
  float psc = clamp(ps, 2.0, 56.0);
  gl_PointSize = psc * uPx;

  float nearFade = smoothstep(0.25, 1.6, -mv.z);
  float twinkle = 0.72 + 0.28 * sin(uTime * 3.0 + aSeed.z * 60.0);
  vAlpha = alpha * energy * nearFade * twinkle * (1.0 + uWarp * 0.7);
  vColor = col;
  vPs = psc;
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

in vec3 vColor;
in float vAlpha;
in float vPs;

layout(location = 0) out vec4 pc_FragColor;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = dot(uv, uv);
  if (d > 0.25) discard;
  float sharp = mix(3.0, 40.0, smoothstep(2.0, 14.0, vPs));
  float core = exp(-d * sharp);
  float halo = exp(-d * 12.0) * 0.3 * smoothstep(3.0, 10.0, vPs);
  float a = (core + halo) * vAlpha * 0.62;
  pc_FragColor = vec4(vColor * a, a);
}
`;

// Built from the black hole bundle's own Three.js classes, so the page
// only ships and runs a single engine and a single WebGL context.
class Field {
  constructor(bh) {
    this.bh = bh;
    const ref = bh.world.stars.particles;
    const Geometry = ref.geometry.constructor;
    const Attribute = ref.geometry.attributes.aSize.constructor;
    const Material = ref.material.constructor;
    const Points = ref.points.constructor;

    const count = reduced ? 16000 : isTouch ? 30000 : 80000;
    const seed = new Float32Array(count * 4);
    const rand = new Float32Array(count * 3);
    const scale = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      seed[i * 4] = Math.random();
      seed[i * 4 + 1] = Math.random();
      seed[i * 4 + 2] = Math.random();
      seed[i * 4 + 3] = Math.random();
      const u = Math.random() * 2 - 1;
      const th = Math.random() * Math.PI * 2;
      const rr = Math.cbrt(Math.random());
      const s = Math.sqrt(1 - u * u);
      rand[i * 3] = s * Math.cos(th) * rr;
      rand[i * 3 + 1] = u * rr;
      rand[i * 3 + 2] = s * Math.sin(th) * rr;
      scale[i] = 0.35 + Math.pow(Math.random(), 7) * 2.8;
    }

    const geo = new Geometry();
    geo.setAttribute('position', new Attribute(new Float32Array(count), 1));
    geo.setAttribute('aSeed', new Attribute(seed, 4));
    geo.setAttribute('aRand', new Attribute(rand, 3));
    geo.setAttribute('aScale', new Attribute(scale, 1));

    this.uniforms = {
      uTime: { value: 0 },
      uSecA: { value: 0 },
      uSecB: { value: 1 },
      uMix: { value: 0 },
      uReveal: { value: 0 },
      uSpin: { value: 0 },
      uPulse: { value: 0 },
      uShockT: { value: -1 },
      uWarp: { value: 0 },
      uSize: { value: 0.04 },
      uViewH: { value: 900 },
      uPx: { value: 2 },
      uAspect: { value: 1.6 },
      uMouseStr: { value: 0 },
      uMouse: { value: [9, 9] },
      uAxis: { value: [1, 0, 0] },
    };

    const mat = new Material({
      glslVersion: ref.material.glslVersion,
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: bh.world.blackHole.disc.material.blending,
    });

    this.points = new Points(geo, mat);
    this.points.frustumCulled = false;
    this.points.visible = false;
    bh.scenes.space.add(this.points);
    this.resize();
  }

  resize() {
    const { width, height } = this.bh.config;
    this.uniforms.uViewH.value = height;
    this.uniforms.uPx.value = this.bh.renderer.composition.space.height / height;
    this.uniforms.uAspect.value = width / height;
  }
}

/* ======================================================================
   Director — scroll, camera, HUD, interactions
   ====================================================================== */

const sound = new Sound();
const BH = window.__BH && window.__BH.camera && window.__BH.world ? window.__BH : null;
let field = null;
if (BH) {
  try {
    field = new Field(BH);
  } catch (err) {
    console.warn('Particle field unavailable', err);
  }
}

const state = {
  entered: false,
  enterAt: 0,
  from: null,
  sTarget: 0,
  s: 0,
  sector: 0,
  reveal: 0,
  scrollY: 0,
  lastY: 0,
  vel: 0,
  warp: 0,
  skew: 0,
  mouse: { x: 9, y: 9, sx: 0, sy: 0, str: 0, moved: 0 },
  pulse: 0,
  pulseTarget: 0,
  spin: 0,
  shockT: -1,
  pose: { r: 8.6, el: 0.2, az: 0.78, off: 0, offY: 0 },
  camPos: { x: 0, y: 0, z: 8.6 },
  last: performance.now(),
  t0: performance.now(),
};

const chapters = $$('[data-chapter]');
let tops = [];

function measure() {
  tops = chapters.map((el) => el.getBoundingClientRect().top + scrollY);
}

function computeS() {
  const y = scrollY;
  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  for (let i = 0; i < tops.length - 1; i++) {
    const a = tops[i];
    const b = Math.min(tops[i + 1], maxScroll);
    if (y < b || i === tops.length - 2) {
      const f = clamp((y - a) / Math.max(1, b - a), 0, 1);
      return i + smooth(0.42, 1.0, f);
    }
  }
  return 0;
}

function sphericalFromVec(v) {
  const r = Math.hypot(v.x, v.y, v.z) || 1;
  return { r, el: Math.asin(clamp(v.y / r, -1, 1)), az: Math.atan2(v.z, v.x) };
}

function targetPose(time) {
  const s = state.s;
  const i = Math.min(Math.floor(s), KEYS.length - 2);
  const f = s - i;
  const A = KEYS[i];
  const B = KEYS[i + 1];
  const narrow = innerWidth < 820;
  const pose = {
    r: Math.exp(lerp(Math.log(A.r), Math.log(B.r), f)) * portraitFit(),
    el: lerp(A.el, B.el, f),
    az: lerp(A.az, B.az, f),
    off: narrow ? 0 : lerp(A.off, B.off, f),
    offY: narrow ? (s < 2.5 ? 0.2 : lerp(0.2, 0, clamp((s - 2.5) * 2, 0, 1))) : 0,
  };
  pose.az += time * 0.012 + state.mouse.sx * 0.16;
  pose.el += state.mouse.sy * 0.06;
  return pose;
}

// Runs once per frame, right before the black hole renders.
function drive() {
  const now = performance.now();
  const time = (now - state.t0) / 1000;
  let pose = targetPose(time);

  if (state.from) {
    const k = easeInOut(clamp((now - state.enterAt) / 3200, 0, 1));
    let daz = pose.az - state.from.az;
    daz = Math.atan2(Math.sin(daz), Math.cos(daz));
    pose = {
      r: lerp(state.from.r, pose.r, k),
      el: lerp(state.from.el, pose.el, k) + Math.sin(k * Math.PI) * 0.35,
      az: state.from.az + daz * k,
      off: pose.off * k,
      offY: pose.offY * k,
    };
    if (k >= 1) state.from = null;
  }
  state.pose = pose;

  const ce = Math.cos(pose.el);
  state.camPos.x = pose.r * ce * Math.cos(pose.az);
  state.camPos.y = pose.r * Math.sin(pose.el);
  state.camPos.z = pose.r * ce * Math.sin(pose.az);

  if (BH) {
    const cam = BH.camera;
    const W = BH.config.width;
    const H = BH.config.height;
    const d = cam.modes.default.instance;
    d.position.set(state.camPos.x, state.camPos.y, state.camPos.z);
    d.lookAt(0, 0, 0);
    cam.instance.fov = 45 + state.warp * 14;
    cam.instance.setViewOffset(W, H, pose.off * W, pose.offY * H, W, H);
  }
}

// The whole site ticks inside the black hole's frame loop, right before it renders.
if (BH) {
  const orig = BH.camera.update.bind(BH.camera);
  BH.camera.update = () => {
    frame(performance.now());
    orig();
  };

  // Mobile browsers fire resize whenever the address bar slides; the canvas is
  // sized to 100vh and doesn't change, so skip the costly re-allocation.
  const origResize = BH.resize.bind(BH);
  let last = '';
  BH.resize = () => {
    const r = BH.targetElement.getBoundingClientRect();
    const key = `${Math.round(r.width)}x${Math.round(r.height)}@${window.devicePixelRatio}`;
    if (key === last) return;
    last = key;
    origResize();
    field?.resize();
    measure();
  };
  last = `${Math.round(BH.config.width)}x${Math.round(BH.config.height)}@${window.devicePixelRatio}`;

  // The loader camera is framed for landscape; on a portrait phone the disc
  // overflows the narrow horizontal field of view, so back it off to fit.
  const fit = portraitFit();
  if (fit > 1) {
    const dbg = BH.camera.modes.debug;
    dbg.instance.position.multiplyScalar(fit);
    dbg.orbitControls.update();
  }
}

function portraitFit() {
  const aspect = innerWidth / innerHeight;
  return clamp(Math.sqrt(1.1 / aspect), 1, 1.6);
}

/* ---------------- HUD ---------------- */

const hud = {
  code: $('#sector-code'),
  name: $('#sector-name'),
  fill: $('#rail-fill'),
  dots: $$('.rail-dot'),
  tele: $('#telemetry'),
  lastTele: 0,
};

const GLYPHS = '!<>-_\\/[]{}=+*^?#01ΣΔΛΨΩ';

function scramble(el, text, duration = 900) {
  const final = text ?? el.dataset.text ?? el.textContent;
  el.dataset.text = final;
  if (reduced) {
    el.textContent = final;
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const k = clamp((now - start) / duration, 0, 1);
    let out = '';
    for (let i = 0; i < final.length; i++) {
      const ch = final[i];
      if (ch === ' ' || i / final.length < k) out += ch;
      else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function setSector(i) {
  if (i === state.sector) return;
  state.sector = i;
  hud.code.textContent = SECTORS[i].code;
  scramble(hud.name, SECTORS[i].name, 700);
  hud.dots.forEach((d, k) => d.classList.toggle('active', k === i));
  document.documentElement.dataset.sector = String(i);
  sound.setSector(i);
}

function updateTelemetry(now) {
  if (now - hud.lastTele < 90) return;
  hud.lastTele = now;
  const p = state.pose;
  const deg = (v) => ((((v * 180) / Math.PI) % 360) + 360) % 360;
  const t = (now - state.t0) / 1000;
  const mm = String(Math.floor(t / 60)).padStart(2, '0');
  const ss = String(Math.floor(t % 60)).padStart(2, '0');
  hud.tele.innerHTML =
    `<span>R <b>${p.r.toFixed(2)}</b> r<sub>s</sub></span>` +
    `<span>θ <b>${deg(p.az).toFixed(1)}°</b></span>` +
    `<span>φ <b>${deg(p.el).toFixed(1)}°</b></span>` +
    `<span>v <b>${(state.warp * 0.99).toFixed(2)}</b>c</span>` +
    `<span>T+ <b>${mm}:${ss}</b></span>`;
}

/* ---------------- Chapter stages ---------------- */

const stages = $$('[data-stage]');

function updateStages() {
  const vh = innerHeight;
  stages.forEach((el) => {
    const host = el.closest('[data-chapter]');
    const r = host.getBoundingClientRect();
    const total = Math.max(1, r.height - vh);
    const local = clamp(-r.top / total, 0, 1);
    const enter = 1 - smooth(0.05, 0.85, r.top / vh);
    const leave = smooth(0.62, 0.98, local);
    const o = enter * (1 - leave);
    el.style.opacity = o.toFixed(3);
    el.style.transform = `translate3d(0, ${((1 - enter) * 60 - leave * 80).toFixed(1)}px, 0) skewY(${state.skew.toFixed(2)}deg)`;
    el.style.filter = o < 0.98 ? `blur(${((1 - o) * 10).toFixed(1)}px)` : 'none';
    el.style.pointerEvents = o > 0.4 ? 'auto' : 'none';
  });
}

/* ---------------- Main loop ---------------- */

function frame(now) {
  const dt = Math.min(0.05, (now - state.last) / 1000);
  state.last = now;
  const time = (now - state.t0) / 1000;

  if (state.entered) {
    state.sTarget = computeS();
    state.s += (state.sTarget - state.s) * Math.min(1, dt * 3.2);
    if (Math.abs(state.sTarget - state.s) < 0.0005) state.s = state.sTarget;
    setSector(Math.round(state.s));
    hud.fill.style.transform = `scaleY(${(state.s / 3).toFixed(4)})`;

    const y = scrollY;
    const v = (y - state.lastY) / Math.max(dt, 0.001);
    state.lastY = y;
    state.vel += (v - state.vel) * Math.min(1, dt * 6);
    const warpT = reduced ? 0 : clamp(Math.abs(state.vel) / 2600, 0, 1);
    state.warp += (warpT - state.warp) * Math.min(1, dt * 4);
    state.skew += (clamp(state.vel * -0.0012, -2.5, 2.5) - state.skew) * Math.min(1, dt * 6);
    sound.setWarp(state.warp);

    state.reveal = clamp((now - state.enterAt - 500) / 3800, 0, 1);
    updateStages();
    updateTelemetry(now);
  }

  const m = state.mouse;
  m.sx += ((m.x === 9 ? 0 : m.x) - m.sx) * Math.min(1, dt * 2.5);
  m.sy += ((m.y === 9 ? 0 : m.y) - m.sy) * Math.min(1, dt * 2.5);
  m.str += ((now - m.moved < 1800 ? 1 : 0.25) - m.str) * Math.min(1, dt * 3);

  state.pulse += (state.pulseTarget - state.pulse) * Math.min(1, dt * 4);
  state.spin += dt * (0.045 + state.pulse * 0.3);
  if (state.shockT >= 0) {
    state.shockT += dt;
    if (state.shockT > 4) state.shockT = -1;
  }

  if (state.entered) drive();
  if (!field) return;

  const u = field.uniforms;
  u.uTime.value = time;
  const a = Math.min(Math.floor(state.s), 3);
  u.uSecA.value = a;
  u.uSecB.value = Math.min(a + 1, 3);
  u.uMix.value = state.s - a;
  u.uReveal.value = state.reveal;
  u.uSpin.value = state.spin;
  u.uPulse.value = state.pulse;
  u.uShockT.value = state.shockT;
  u.uWarp.value = state.warp;
  u.uSize.value = (isTouch ? 0.044 : 0.048) * (0.55 + state.pose.r * 0.05);
  u.uMouse.value[0] = m.x;
  u.uMouse.value[1] = m.y;
  u.uMouseStr.value = isTouch ? 0 : m.str;
  const c = state.camPos;
  const cl = Math.hypot(c.x, c.y, c.z) || 1;
  u.uAxis.value[0] = c.x / cl;
  u.uAxis.value[1] = c.y / cl;
  u.uAxis.value[2] = c.z / cl;

  field.points.visible = state.reveal > 0.001;
}

/* ---------------- Interactions ---------------- */

function goTo(i) {
  const el = chapters[i];
  if (!el) return;
  const y = i === 0 ? 0 : el.getBoundingClientRect().top + scrollY;
  window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  sound.note(SCALE[i * 2], 1.2, 0.06);
}

function splitLetters() {
  $$('[data-split]').forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = [...text]
      .map((ch, i) => `<span class="ch" aria-hidden="true" style="--i:${i}">${ch === ' ' ? '&nbsp;' : ch}</span>`)
      .join('');
  });
}

function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  const dur = 1600;
  const step = (now) => {
    const k = clamp((now - start) / dur, 0, 1);
    const e = 1 - Math.pow(1 - k, 4);
    el.textContent = Math.round(target * e) + suffix;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function observe() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.classList.add('in');
        if (el.hasAttribute('data-scramble')) scramble(el, undefined, 1100);
        if (el.dataset.count) countUp(el);
        io.unobserve(el);
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -5% 0px' }
  );
  $$('.reveal, [data-scramble], [data-count], [data-split]').forEach((el) => io.observe(el));
}

let typebotLoaded = false;
function loadTypebot() {
  if (typebotLoaded) return;
  typebotLoaded = true;
  $('#typebot-container').classList.add('open');
  $('#open-channel').remove();
  sound.note(880, 2.2, 0.07);
  state.shockT = 0;
  const s = document.createElement('script');
  s.src = 'https://unpkg.com/typebot-js@2.2';
  s.onload = () => {
    window.Typebot?.initContainer('typebot-container', {
      url: 'https://viewer.typebot.io/my-typebot-e7x6obe',
    });
    setTimeout(measure, 800);
  };
  document.head.appendChild(s);
}

function initCursor() {
  if (isTouch) return;
  const dot = $('#cursor-dot');
  const ring = $('#cursor-ring');
  let x = innerWidth / 2;
  let y = innerHeight / 2;
  let rx = x;
  let ry = y;
  addEventListener('pointermove', (e) => {
    x = e.clientX;
    y = e.clientY;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
  const loop = () => {
    rx += (x - rx) * 0.16;
    ry += (y - ry) * 0.16;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(loop);
  };
  loop();
  document.addEventListener('pointerover', (e) => {
    const hot = e.target.closest('a, button, [data-goto]');
    document.documentElement.classList.toggle('cursor-hot', !!hot);
  });
}

function initMagnetic() {
  if (isTouch) return;
  $$('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.28}px, ${dy * 0.35}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  });
}

function initWorks() {
  $$('.work').forEach((row, i) => {
    row.addEventListener('pointerenter', () => {
      state.pulseTarget = 1;
      sound.note(SCALE[i % SCALE.length], 1.8, 0.07);
    });
    row.addEventListener('pointerleave', () => {
      state.pulseTarget = 0;
    });
    row.addEventListener('pointermove', (e) => {
      const r = row.getBoundingClientRect();
      row.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    });
  });
}

function enter() {
  if (state.entered) return;
  state.entered = true;
  sound.start();
  sound.swell();

  if (BH) {
    const dbg = BH.camera.modes.debug.instance;
    state.from = sphericalFromVec(dbg.position);
    BH.camera.mode = 'default';
  } else {
    state.from = { r: 7.35, el: 0.27, az: 0.78 };
  }
  state.enterAt = performance.now();
  state.lastY = scrollY;

  document.documentElement.classList.add('entered');
  $('#intro').classList.add('gone');

  setTimeout(() => {
    document.documentElement.classList.add('site-on');
    measure();
    observe();
    const hashIndex = ['#home', '#about', '#works', '#contact'].indexOf(location.hash);
    if (hashIndex > 0) setTimeout(() => goTo(hashIndex), 1400);
  }, 1100);
}

function initIntro() {
  const intro = $('#intro');
  const pct = $('#intro-pct');
  const start = performance.now();
  const dur = reduced ? 300 : 2400;
  const tick = (now) => {
    const k = clamp((now - start) / dur, 0, 1);
    pct.textContent = String(Math.round(easeInOut(k) * 100)).padStart(3, '0') + '%';
    if (k < 1) requestAnimationFrame(tick);
    else intro.classList.add('ready');
  };
  requestAnimationFrame(tick);

  $('#enter').addEventListener('click', enter);
  addEventListener('keydown', (e) => {
    if (!state.entered && intro.classList.contains('ready') && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      enter();
    }
  });
}

function init() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  splitLetters();
  initIntro();
  initCursor();
  initMagnetic();
  initWorks();

  $('#open-channel').addEventListener('click', loadTypebot);

  $('#sound').addEventListener('click', () => {
    sound.toggle();
    if (sound.on) sound.note(660, 1, 0.06);
  });

  $$('[data-goto]').forEach((el) =>
    el.addEventListener('click', (e) => {
      e.preventDefault();
      goTo(parseInt(el.dataset.goto, 10));
    })
  );

  addEventListener(
    'pointermove',
    (e) => {
      state.mouse.x = (e.clientX / innerWidth) * 2 - 1;
      state.mouse.y = -(e.clientY / innerHeight) * 2 + 1;
      state.mouse.moved = performance.now();
    },
    { passive: true }
  );
  document.addEventListener('pointerleave', () => {
    state.mouse.x = 9;
    state.mouse.y = 9;
  });

  addEventListener('pointerdown', (e) => {
    if (!state.entered) return;
    if (e.target.closest('a, button, input, textarea, iframe, #typebot-container')) return;
    state.shockT = 0;
    sound.boom(0.4);
  });

  new ResizeObserver(() => measure()).observe(document.body);

  document.documentElement.classList.add('cosmos-ready');
  if (!BH) {
    const loop = (now) => {
      frame(now);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

init();
