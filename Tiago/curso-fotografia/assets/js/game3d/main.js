/* ============================================================
   Safári Fotográfico 3D · main.js — ponto de entrada
   Monta renderer/cena/loop, HUD, painéis, joystick touch e o
   seletor de gráficos (Leve/Médio/Alto). Jogo independente do
   FotoQuest 2D (página, save e módulos próprios).
   ============================================================ */

import * as THREE from "./vendor/three.module.min.js?v=8";
import { PRESETS, getQuality, cycleQuality } from "./quality.js?v=8";
import { buildWorld } from "./world.js?v=8";
import { spawnTargets } from "./targets.js?v=8";
import { FirstPerson } from "./controls.js?v=8";
import { Player3D } from "./player3d.js?v=8";
import { CameraMode, showResult } from "./camera3d.js?v=8";
import { MISSIONS, missionStatus, registerPhoto, save3d } from "./missions.js?v=8";
import { sfx3d, unlockAudio3d } from "./audio3d.js?v=8";
import { fs3, initFullscreen3d } from "./fullscreen3d.js?v=8";

/* ---------- input mínimo (teclado) ---------- */
const KEY2ACT = { c: "CAM", C: "CAM", " ": "SHOOT", Tab: "TAB", z: "MINUS", Z: "MINUS", x: "PLUS", X: "PLUS", Escape: "ESC", q: "QUEST", Q: "QUEST" };
const queue = [];
const input = {
  pressed(a) { const i = queue.indexOf(a); if (i >= 0) { queue.splice(i, 1); return true; } return false; },
};

function boot() {
  const canvas = document.getElementById("gameCanvas");
  const shell = document.getElementById("gameShell");
  if (!canvas || !shell) return;
  const dom = {
    shell, canvas,
    hud: document.getElementById("gameHud"),
    panel: document.getElementById("gamePanel"),
    camUI: document.getElementById("gameCamUI"),
    touch: document.getElementById("gameTouch"),
    viewfinder: document.getElementById("g3Viewfinder"),
    flash: document.getElementById("g3Flash"),
  };

  const qName = getQuality();
  const q = PRESETS[qName];

  /* ---------- three ---------- */
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: q.antialias, powerPreference: "high-performance",
    preserveDrawingBuffer: true,   // necessário p/ capturar o frame na foto
  });
  renderer.setPixelRatio(q.pixelRatio);   // antes do setSize
  renderer.setSize(960, 540, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = q.shadows;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, 16 / 9, 0.3, q.far);

  /* Ajusta o buffer do WebGL ao tamanho REAL do canvas na tela.
     Sem isto o mundo estica quando a proporção da tela não é 16:9
     (é o caso da tela cheia horizontal do celular). O `false` evita
     que o Three escreva width/height inline — quem manda é o CSS. */
  function resize3d() {
    const w = canvas.clientWidth || 960;
    const h = canvas.clientHeight || 540;
    if (w === resize3d.w && h === resize3d.h) return;
    resize3d.w = w; resize3d.h = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const { treePositions } = buildWorld(scene, q);
  const targets = spawnTargets(scene);

  const controls = new FirstPerson(camera, canvas, fs3);
  controls.treeCircles = treePositions;
  const player = new Player3D(scene);       // o fotógrafo (visível na 3ª pessoa)

  const game = { renderer, scene, camera, targets, controls, dom, onPhoto };
  const cam = new CameraMode(game);
  let paused = true;                        // começa no painel de introdução

  /* ---------- teclado ---------- */
  addEventListener("keydown", (e) => {
    const a = KEY2ACT[e.key];
    if (!a) return;
    e.preventDefault();
    queue.push(a);
  });

  /* ---------- HUD ---------- */
  function hud() {
    const st = missionStatus();
    const done = st.filter((m) => m.done).length;
    const next = st.find((m) => !m.done);
    dom.hud.innerHTML = `
      <div class="gq-hud-top">
        <span class="gq-hud-title">🦌 Safári Fotográfico 3D</span>
        <span class="gq-hud-right">
          <span class="gq-coins">⭐ ${save3d.data.xp} XP</span>
          <button class="gq-hud-btn" id="g3Snd" title="Som">${sfx3d.enabled ? "🔊" : "🔇"}</button>
          <button class="gq-hud-btn" id="g3Qual" title="Gráficos">${PRESETS[getQuality()].label}</button>
          <button class="gq-hud-btn" id="g3Quests" title="Missões">🎯 ${done}/${MISSIONS.length}</button>
          <button class="gq-hud-btn" id="g3Gal" title="Minhas fotos">🖼️</button>
        </span>
      </div>
      ${next ? `<div class="gq-hud-quests"><div class="gq-quest-pill">🎯 ${next.title}: ${next.brief}</div></div>` : `<div class="gq-hud-quests"><div class="gq-quest-pill done">🏆 Safári completo! Continue fotografando livre.</div></div>`}
      <div class="gq-hud-hint">${document.body.classList.contains("gq-touch") ? "Joystick anda · arraste p/ olhar · 📷 câmera" : "WASD anda · mouse olha (clique na tela) · C câmera · ESPAÇO foto"}</div>`;
    dom.hud.classList.add("open");
    dom.hud.querySelector("#g3Snd").onclick = () => { sfx3d.toggle(); hud(); };
    dom.hud.querySelector("#g3Qual").onclick = () => {
      const n = cycleQuality();
      toast(`Gráficos: <b>${PRESETS[n].label}</b> — recarregando…`);
      setTimeout(() => location.reload(), 650);
    };
    dom.hud.querySelector("#g3Quests").onclick = () => openMissions();
    dom.hud.querySelector("#g3Gal").onclick = () => openGallery();
  }

  function toast(html, ms = 2600) {
    const t = document.createElement("div");
    t.className = "gq-toast";
    t.innerHTML = html;
    shell.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 400); }, ms);
  }

  /* ---------- painéis ---------- */
  function openPanel(html, wire) {
    paused = true;
    if (cam.active) cam.exit();
    dom.panel.innerHTML = html;
    dom.panel.classList.add("open");
    wire?.(dom.panel);
  }
  function closePanel() {
    dom.panel.classList.remove("open");
    dom.panel.innerHTML = "";
    paused = false;
  }

  function openIntro() {
    const qn = getQuality();
    openPanel(`
      <div class="gq-menu">
        <div class="gq-logo">🦌</div>
        <h2>Safári Fotográfico <span style="color:var(--accent)">3D</span></h2>
        <p class="gq-menu-sub">primeira pessoa · hora dourada</p>
        <p class="gq-menu-desc">Você e sua câmera numa campina ao pôr do sol. Encontre os 5 alvos,
          ajuste <b>ISO, abertura, velocidade, lente e foco</b> — a imagem reage ao vivo — e
          complete as ${MISSIONS.length} missões do safári.</p>
        <div class="g3-qualrow">
          ${Object.entries(PRESETS).map(([k, p]) => `
            <button class="g3-qualbtn ${k === qn ? "sel" : ""}" data-q="${k}">
              ${p.label}<small>${p.desc}</small></button>`).join("")}
        </div>
        <button class="btn btn--primary" id="g3Start">▶ Entrar no safári</button>
        <div class="gq-menu-keys">
          <span><b>WASD</b> andar</span><span><b>mouse</b> olhar</span>
          <span><b>C</b> câmera</span><span><b>ESPAÇO</b> foto</span>
        </div>
      </div>`, (el) => {
      el.querySelectorAll(".g3-qualbtn").forEach((b) => b.onclick = () => {
        const k = b.dataset.q;
        if (k === getQuality()) return;
        cycleToPreset(k);
      });
      el.querySelector("#g3Start").onclick = () => { unlockAudio3d(); sfx3d.play("confirm"); sfx3d.startAmbient(); closePanel(); hud(); };
    });
  }
  function cycleToPreset(k) {
    try { localStorage.setItem("fotoquest3d-quality", k); } catch { /* ok */ }
    toast(`Gráficos: <b>${PRESETS[k].label}</b> — recarregando…`);
    setTimeout(() => location.reload(), 500);
  }

  function openMissions() {
    const rows = missionStatus().map((m) => `
      <div class="gq-crit ${m.done ? "ok" : ""}">
        <span class="gq-crit-ic">${m.done ? "✅" : "🎯"}</span>
        <div class="gq-crit-body"><b>${m.title} · +${m.xp} XP</b>
          <span>${m.brief}</span><em>💡 ${m.tip}</em></div>
      </div>`).join("");
    openPanel(`
      <div class="gq-sheet"><div class="gq-sheet-head"><h2>Missões do safári</h2>
        <button class="gq-close" id="g3X">✕</button></div>
        <div class="gq-sheet-body"><div class="gq-crits">${rows}</div>
        <button class="btn btn--ghost gq-sm gq-danger" id="g3Reset">🗑️ Zerar progresso do safári</button></div></div>`,
      (el) => {
        el.querySelector("#g3X").onclick = closePanel;
        el.querySelector("#g3Reset").onclick = () => {
          if (confirm("Apagar o progresso do Safári 3D? (o FotoQuest 2D não é afetado)")) {
            save3d.reset(); closePanel(); hud();
          }
        };
      });
  }

  function openGallery() {
    const pics = [...save3d.gallery].reverse();
    const grid = pics.length ? pics.map((p) => `
      <figure class="gq-ph"><img src="${p.thumb}" alt="${p.name}">
        <figcaption><b>${p.score}</b> · ${p.name}<br><small>${p.set}</small></figcaption></figure>`).join("")
      : `<p class="gq-empty">Nenhuma foto ainda — o safári te espera! 📷</p>`;
    openPanel(`
      <div class="gq-sheet"><div class="gq-sheet-head"><h2>Fotos do safári</h2>
        <span class="gq-coins">${pics.length}/12</span><button class="gq-close" id="g3X">✕</button></div>
        <div class="gq-sheet-body gq-gallery">${grid}</div></div>`,
      (el) => { el.querySelector("#g3X").onclick = closePanel; });
  }

  /* ---------- resultado da foto ---------- */
  function onPhoto(result) {
    paused = true;
    cam.exit();
    const ev = registerPhoto(result);
    let extra = "";
    if (ev.missionDone) {
      sfx3d.play("quest");
      extra = `<div class="gq-questdone">✅ Missão concluída: <b>${ev.missionDone.title}</b>
        <span>+${ev.xpGain} XP</span></div>`;
    } else if (result.target) {
      const m = MISSIONS.find((m) => m.targetId === result.target.def.id && !save3d.data.done.includes(m.id));
      if (m) extra = `<div class="gq-questdone warn">A missão "${m.title}" pede nota ≥ <b>${m.minScore}</b>. ${m.tip}</div>`;
    }
    showResult(dom, result, extra,
      () => {
        hud();
        paused = false;
        if (ev.allDone) {
          sfx3d.play("finale");
          openPanel(`<div class="gq-menu"><div class="gq-logo">🏆</div>
            <h2>Safári completo!</h2>
            <p class="gq-menu-desc">Você dominou exposição, velocidade, composição, foco e lentes
              em 3D. Continue explorando e caçando a foto perfeita — ou volte ao
              <a href="jogo.html">FotoQuest 2D</a> e ao <a href="index.html">curso</a>.</p>
            <button class="btn btn--primary" id="g3Free">📷 Continuar fotografando</button></div>`,
            (el) => { el.querySelector("#g3Free").onclick = () => { closePanel(); hud(); }; });
        }
      },
      () => { hud(); paused = false; cam.enter(); });
  }

  /* ---------- touch: joystick + botão câmera ---------- */
  function buildTouch() {
    dom.touch.innerHTML = `
      <div class="g3-joy" id="g3Joy"><div class="g3-stick" id="g3Stick"></div></div>
      <div class="gq-abtns"><button class="gq-abtn gq-abtn--cam" id="g3CamBtn">📷</button></div>`;
    const joy = dom.touch.querySelector("#g3Joy");
    const stick = dom.touch.querySelector("#g3Stick");
    let jid = null, cx = 0, cy = 0;
    joy.addEventListener("pointerdown", (e) => {
      e.preventDefault(); joy.setPointerCapture(e.pointerId);
      jid = e.pointerId; cx = e.clientX; cy = e.clientY;
    });
    joy.addEventListener("pointermove", (e) => {
      if (e.pointerId !== jid) return;
      let dx = e.clientX - cx, dy = e.clientY - cy;
      if (fs3.rotated) { const t = dx; dx = dy; dy = -t; }
      const R = 46, len = Math.hypot(dx, dy), k = len > R ? R / len : 1;
      stick.style.transform = `translate(${dx * k}px,${dy * k}px)`;
      controls.setJoy((dx * k) / R, (dy * k) / R);
    });
    const end = (e) => {
      if (e.pointerId !== jid) return;
      jid = null; stick.style.transform = "";
      controls.setJoy(0, 0);
    };
    joy.addEventListener("pointerup", end);
    joy.addEventListener("pointercancel", end);
    dom.touch.querySelector("#g3CamBtn").addEventListener("pointerdown", (e) => {
      e.preventDefault(); if (!paused) cam.toggle();
    });
  }

  if (matchMedia("(pointer: coarse)").matches) document.body.classList.add("gq-touch");
  addEventListener("touchstart", () => document.body.classList.add("gq-touch"), { once: true, passive: true });
  buildTouch();
  initFullscreen3d(shell, resize3d);   // entrar/sair da tela cheia re-dimensiona o 3D
  shell.addEventListener("pointerdown", unlockAudio3d, { once: true });

  /* ---------- loop ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (!paused) {
      if (input.pressed("CAM")) cam.toggle();
      if (input.pressed("ESC") && cam.active) cam.exit();
      if (input.pressed("QUEST")) openMissions();
      cam.update(dt, input);
      controls.enabled = true;
      controls.update(dt, cam.active ? 0.55 : 1);
    } else {
      controls.enabled = false;
      queue.length = 0;
      // quem apaga o flash é cam.update(), que não roda pausado — e tirar
      // foto PAUSA o jogo. Sem isto o clarão branco fica sobre o resultado.
      if (cam.flash > 0) cam.flash = Math.max(0, cam.flash - dt);
    }
    /* Vista: 3ª pessoa explorando; ao erguer a câmera vai para a 1ª pessoa.
       Na 1ª pessoa forçamos view=0 (sem transição) porque a avaliação mede
       distância e enquadramento A PARTIR da câmera — no meio de uma
       interpolação ela estaria metros atrás e a nota sairia errada. */
    controls.viewTarget = cam.active ? 0 : 1;
    if (cam.active) controls.view = 0;
    player.update(dt, {
      x: controls.pos.x, z: controls.pos.z, yaw: controls.yaw,
      pitch: controls.pitch, andando: controls.moving,
    });
    player.setVisivel(controls.view > 0.2);   // sumiria dentro da lente

    for (const t of targets) t.update(dt);
    dom.flash.style.opacity = cam.flash > 0 ? Math.min(1, cam.flash * 4) : 0;
    resize3d();                      // barato: só age quando o tamanho muda
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }

  openIntro();
  requestAnimationFrame(loop);
}

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", boot)
  : boot();
