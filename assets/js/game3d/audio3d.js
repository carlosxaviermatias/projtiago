/* ============================================================
   Safári Fotográfico 3D · audio3d.js
   Sons 100% sintetizados (Web Audio) — sem arquivos externos.
   Independente do áudio do FotoQuest 2D.
   ============================================================ */

const KEY = "fotoquest3d-sound";
let ctx = null, master = null, enabled = true, ambientTimer = null;

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);
  return ctx;
}

export function unlockAudio3d() {
  const c = ensure();
  if (c && c.state === "suspended") c.resume();
}

function osc(freq, type, t0, dur, vol, glideTo) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (glideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(master);
  o.start(t0); o.stop(t0 + dur + 0.02);
}

function noise(t0, dur, vol, freq, type = "lowpass") {
  const len = Math.max(1, (ctx.sampleRate * dur) | 0);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(); src.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t0); src.stop(t0 + dur);
}

const SFX = {
  // passos na grama: ruído suave e grave
  step() { const t = ctx.currentTime; noise(t, 0.07, 0.07, 320 + Math.random() * 120, "lowpass"); },
  shutter() {
    const t = ctx.currentTime;
    noise(t, 0.025, 0.4, 3200, "bandpass");
    osc(1400, "square", t, 0.015, 0.12);
    noise(t + 0.07, 0.045, 0.34, 2400, "bandpass");
  },
  camera() { const t = ctx.currentTime; noise(t, 0.12, 0.08, 900, "lowpass"); osc(280, "sine", t, 0.12, 0.06, 560); },
  select() { osc(620, "square", ctx.currentTime, 0.05, 0.10); },
  confirm() { const t = ctx.currentTime; osc(660, "square", t, 0.08, 0.16); osc(990, "square", t + 0.08, 0.12, 0.16); },
  quest() { const t = ctx.currentTime;[523, 659, 784].forEach((f, i) => osc(f, "triangle", t + i * 0.09, 0.16, 0.18)); },
  finale() { const t = ctx.currentTime;[523, 659, 784, 1047, 1319].forEach((f, i) => osc(f, "triangle", t + i * 0.11, 0.24, 0.2)); },
  deny() { osc(220, "sawtooth", ctx.currentTime, 0.18, 0.14, 120); },
  // canto de pássaro (ambiente): 2-3 trinados agudos
  bird() {
    const t = ctx.currentTime;
    const n = 2 + (Math.random() * 2 | 0);
    for (let i = 0; i < n; i++) {
      const f = 2200 + Math.random() * 1400;
      osc(f, "sine", t + i * 0.12, 0.09, 0.05, f * (0.8 + Math.random() * 0.5));
    }
  },
};

export const sfx3d = {
  init() { try { enabled = localStorage.getItem(KEY) !== "0"; } catch { enabled = true; } },
  get enabled() { return enabled; },
  toggle() {
    enabled = !enabled;
    try { localStorage.setItem(KEY, enabled ? "1" : "0"); } catch { /* ok */ }
    if (enabled) unlockAudio3d();
    return enabled;
  },
  play(name) {
    if (!enabled) return;
    const c = ensure();
    if (!c) return;
    if (c.state === "suspended") c.resume();
    try { (SFX[name] || (() => {}))(); } catch { /* som nunca derruba o jogo */ }
  },
  /** pássaros ao fundo, a cada 5–11 s */
  startAmbient() {
    if (ambientTimer) return;
    const tick = () => {
      this.play("bird");
      ambientTimer = setTimeout(tick, 5000 + Math.random() * 6000);
    };
    ambientTimer = setTimeout(tick, 2500);
  },
  stopAmbient() { clearTimeout(ambientTimer); ambientTimer = null; },
};
