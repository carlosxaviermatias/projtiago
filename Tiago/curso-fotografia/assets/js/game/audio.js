/* ============================================================
   FotoQuest · audio.js
   Efeitos sonoros 100% sintetizados (Web Audio API) — sem
   arquivos externos, sem licenças, sem downloads. Cada som é
   gerado por osciladores/ruído em tempo real.

   Uso: sfx.play("step"), sfx.play("shutter"), sfx.toggle()…
   O AudioContext só nasce após o 1º gesto do usuário (política
   de autoplay dos navegadores) — unlockAudio() cuida disso.
   ============================================================ */

const KEY = "fotoquest-sound";
let ctx = null, master = null, enabled = true;

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

/** Chamar no 1º gesto do usuário para destravar o áudio. */
export function unlockAudio() {
  const c = ensure();
  if (c && c.state === "suspended") c.resume();
}

/* ---------- blocos de síntese ---------- */
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

/* ---------- biblioteca de efeitos ---------- */
const SFX = {
  // passos do personagem: baque curto e grave, com pitch variando
  step() { const t = ctx.currentTime; noise(t, 0.055, 0.10, 430 + Math.random() * 160, "lowpass"); },
  // clique da câmera: "chá-clic" (espelho sobe + obturador)
  shutter() {
    const t = ctx.currentTime;
    noise(t, 0.025, 0.4, 3200, "bandpass");
    osc(1400, "square", t, 0.015, 0.12);
    noise(t + 0.07, 0.045, 0.34, 2400, "bandpass");
  },
  // abrir modo câmera: pequeno "whir" mecânico
  camera() { const t = ctx.currentTime; noise(t, 0.12, 0.08, 900, "lowpass"); osc(280, "sine", t, 0.12, 0.06, 560); },
  // navegação/seleção leve na UI
  select() { osc(620, "square", ctx.currentTime, 0.05, 0.10); },
  move() { osc(500, "square", ctx.currentTime, 0.035, 0.06); },
  // confirmar/entrar (dois tons subindo)
  confirm() { const t = ctx.currentTime; osc(660, "square", t, 0.08, 0.16); osc(990, "square", t + 0.08, 0.12, 0.16); },
  // bip de diálogo (um por página)
  dialog() { osc(430 + Math.random() * 70, "square", ctx.currentTime, 0.03, 0.055); },
  // moeda/recompensa
  coin() { const t = ctx.currentTime; osc(988, "square", t, 0.06, 0.15); osc(1319, "square", t + 0.06, 0.11, 0.15); },
  // missão concluída (3 notas subindo)
  quest() { const t = ctx.currentTime;[523, 659, 784].forEach((f, i) => osc(f, "triangle", t + i * 0.09, 0.16, 0.18)); },
  // subir de nível (fanfarra de 4 notas)
  levelup() { const t = ctx.currentTime;[523, 659, 784, 1047].forEach((f, i) => osc(f, "triangle", t + i * 0.1, 0.22, 0.2)); },
  // foto excelente (estrela)
  star() { const t = ctx.currentTime; osc(1047, "triangle", t, 0.1, 0.16); osc(1568, "triangle", t + 0.09, 0.16, 0.16); },
  // negado/erro
  deny() { osc(220, "sawtooth", ctx.currentTime, 0.18, 0.14, 120); },
};

export const sfx = {
  init() { try { enabled = localStorage.getItem(KEY) !== "0"; } catch { enabled = true; } },
  get enabled() { return enabled; },
  toggle() {
    enabled = !enabled;
    try { localStorage.setItem(KEY, enabled ? "1" : "0"); } catch { /* ok */ }
    if (enabled) unlockAudio();
    return enabled;
  },
  play(name) {
    if (!enabled) return;
    const c = ensure();
    if (!c) return;
    if (c.state === "suspended") c.resume();
    try { (SFX[name] || (() => {}))(); } catch { /* nunca deixa o áudio quebrar o jogo */ }
  },
};

/** Cria o botão 🔊/🔇 dentro do #gameShell (sempre visível). */
export function initSoundButton(shell) {
  sfx.init();
  const b = document.createElement("button");
  b.className = "gq-sndbtn";
  b.type = "button";
  b.setAttribute("aria-label", "Som");
  const paint = () => { b.textContent = sfx.enabled ? "🔊" : "🔇"; b.classList.toggle("off", !sfx.enabled); };
  paint();
  b.addEventListener("click", (e) => { e.stopPropagation(); sfx.toggle(); paint(); if (sfx.enabled) sfx.play("select"); });
  shell.appendChild(b);
}
