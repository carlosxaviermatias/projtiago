/* ============================================================
   Safári Fotográfico 3D · camera3d.js
   O modo câmera em primeira pessoa: viewfinder com grade dos
   terços, ajustes (ISO/f/vel/lente/foco) com EXPOSIÇÃO AO VIVO
   real (tone mapping do renderer), captura do frame WebGL e
   revelação da foto com efeitos + avaliação.
   ============================================================ */

import * as THREE from "./vendor/three.module.min.js?v=2";
import {
  ISOS, FS, TS, LENSES, SCENE_EV, exposureStops, evaluate, CRITERIA_INFO,
} from "./evaluate.js?v=2";
import { sfx3d } from "./audio3d.js?v=2";

const BASE_FOV = 70;

export class CameraMode {
  constructor(game) {
    this.g = game;                       // {renderer, scene, camera, targets, controls, dom, onPhoto}
    this.active = false;
    this.isoI = 1; this.fI = 3; this.tI = 3; this.lensI = 1;   // ISO200 f/5.6 1/125 normal
    this.focus = 8;
    this.sel = 0;
    this.flash = 0;
  }

  get settings() {
    const lens = LENSES[this.lensI];
    return {
      iso: ISOS[this.isoI], f: FS[this.fI], t: TS[this.tI].v, tLabel: TS[this.tI].label,
      lens, lensReach: lens.reach, focus: this.focus,
    };
  }

  get controls() {
    return [
      { key: "iso", label: "ISO", value: () => ISOS[this.isoI] },
      { key: "f", label: "f/", value: () => FS[this.fI] },
      { key: "t", label: "Vel", value: () => TS[this.tI].label },
      { key: "lens", label: "Lente", value: () => LENSES[this.lensI].label.split(" ")[0] },
      { key: "focus", label: "Foco", value: () => this.focus + " m" },
    ];
  }

  toggle() { this.active ? this.exit() : this.enter(); }

  enter() {
    this.active = true;
    sfx3d.play("camera");
    this.g.dom.camUI.classList.add("open");
    this.g.dom.viewfinder.classList.add("open");
    this.applyOptics();
    this.renderUI();
  }

  exit() {
    this.active = false;
    this.g.dom.camUI.classList.remove("open");
    this.g.dom.camUI.innerHTML = "";
    this.g.dom.viewfinder.classList.remove("open");
    this.g.camera.fov = BASE_FOV;
    this.g.camera.updateProjectionMatrix();
    this.g.renderer.toneMappingExposure = 1;
  }

  /** FOV da lente + exposição ao vivo no renderizador */
  applyOptics() {
    const s = this.settings;
    this.g.camera.fov = s.lens.fov;
    this.g.camera.updateProjectionMatrix();
    const stops = exposureStops(SCENE_EV, s.iso, s.f, s.t);
    this.g.renderer.toneMappingExposure = Math.pow(2, Math.max(-3.4, Math.min(3.4, stops)));
    this.updateFocusBadge();
  }

  adjust(d) {
    const key = this.controls[this.sel].key;
    if (key === "iso") this.isoI = clamp(this.isoI + d, 0, ISOS.length - 1);
    if (key === "f") this.fI = clamp(this.fI + d, 0, FS.length - 1);
    if (key === "t") this.tI = clamp(this.tI + d, 0, TS.length - 1);
    if (key === "lens") this.lensI = clamp(this.lensI + d, 0, LENSES.length - 1);
    if (key === "focus") this.focus = clamp(this.focus + d * (this.focus >= 10 ? 2 : 1), 1, 60);
    sfx3d.play("select");
    this.applyOptics();
    this.renderUI();
  }

  /* ---------- UI ---------- */
  renderUI() {
    const el = this.g.dom.camUI;
    const chips = this.controls.map((c, i) =>
      `<button class="gq-chip ${i === this.sel ? "sel" : ""}" data-i="${i}">
         <span>${c.label}</span><b>${c.value()}</b></button>`).join("");
    el.innerHTML = `
      <div class="gq-cam-row">
        <button class="gq-chipnav" id="g3Minus">−</button>
        <div class="gq-chips">${chips}</div>
        <button class="gq-chipnav" id="g3Plus">＋</button>
        <button class="gq-shutter" id="g3Shutter" aria-label="Fotografar">📷</button>
        <button class="gq-camclose" id="g3CamClose" aria-label="Sair da câmera">✕</button>
      </div>
      <div class="gq-cam-help">TAB seleciona · Z/X ou −/＋ ajustam · ESPAÇO fotografa · C/ESC sai</div>`;
    el.querySelectorAll(".gq-chip").forEach((b) =>
      b.addEventListener("pointerdown", (e) => { e.preventDefault(); this.sel = +b.dataset.i; sfx3d.play("select"); this.renderUI(); }));
    el.querySelector("#g3Minus").addEventListener("pointerdown", (e) => { e.preventDefault(); this.adjust(-1); });
    el.querySelector("#g3Plus").addEventListener("pointerdown", (e) => { e.preventDefault(); this.adjust(1); });
    el.querySelector("#g3Shutter").addEventListener("pointerdown", (e) => { e.preventDefault(); this.shoot(); });
    el.querySelector("#g3CamClose").addEventListener("pointerdown", (e) => { e.preventDefault(); this.exit(); });
  }

  /** melhor alvo no quadro: menor distância angular ao centro */
  targetInFrame() {
    const cam = this.g.camera;
    let best = null, bestD = Infinity;
    const v = new THREE.Vector3();
    for (const t of this.g.targets) {
      v.copy(t.pos).project(cam);
      if (v.z < -1 || v.z > 1) continue;                    // atrás/fora
      if (Math.abs(v.x) > 1 || Math.abs(v.y) > 1) continue;
      const d = Math.hypot(v.x, v.y);
      if (d < bestD) { bestD = d; best = { target: t, ndc: { x: v.x, y: v.y } }; }
    }
    return best;
  }

  updateFocusBadge() {
    const badge = this.g.dom.viewfinder.querySelector(".g3-focus");
    if (!badge) return;
    const hit = this.targetInFrame();
    if (!hit) { badge.textContent = "— sem alvo no quadro —"; badge.className = "g3-focus"; return; }
    const dist = this.g.camera.position.distanceTo(hit.target.pos);
    const tol = Math.max(1.2, dist * 0.16) * (this.settings.f / 5.6 + 0.55);
    const ok = Math.abs(dist - this.focus) <= tol;
    badge.textContent = `${hit.target.def.name} · ${dist.toFixed(0)} m ${ok ? "· EM FOCO ✓" : ""}`;
    badge.className = "g3-focus " + (ok ? "ok" : "bad");
  }

  /* ---------- disparo ---------- */
  shoot() {
    if (!this.active) return;
    sfx3d.play("shutter");
    this.flash = 0.25;

    const hit = this.targetInFrame();
    const target = hit?.target || null;
    const dist = target ? this.g.camera.position.distanceTo(target.pos) : 99;
    const s = this.settings;
    const result = evaluate({
      target, dist, ndc: hit?.ndc || null,
      settings: { iso: s.iso, f: s.f, t: s.t, lensReach: s.lensReach, focus: this.focus },
    });
    result.settings = s;
    result.target = target;
    result.dist = dist;
    result.photo = this.developPhoto(result);
    setTimeout(() => this.g.onPhoto(result), 180);
  }

  /** captura o frame WebGL e aplica os efeitos de revelação */
  developPhoto(r) {
    const src = this.g.renderer.domElement;
    /* A foto sai na MESMA proporção da tela (o enquadramento que o aluno
       viu na grade dos terços é exatamente o que ele fotografou), em vez
       de forçar 16:9 — que esticaria a imagem na tela cheia do celular. */
    const W = 640;
    const H = Math.max(1, Math.round(W * (src.height / src.width)));
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const c = cv.getContext("2d");
    c.drawImage(src, 0, 0, W, H);       // exposição/FOV já são reais

    const blurPx = (r.focusOk ? 0 : 3) + (r.shake ? 2.5 : 0) + (r.tooSlow && r.target ? 2 : 0);
    if (blurPx > 0) {
      try {
        const cv2 = document.createElement("canvas");
        cv2.width = W; cv2.height = H;
        const c2 = cv2.getContext("2d");
        c2.filter = `blur(${blurPx}px)`;
        c2.drawImage(cv, 0, 0);
        c.clearRect(0, 0, W, H);
        c.drawImage(cv2, 0, 0);
      } catch { /* sem filter: segue sem blur */ }
    }
    if (r.settings.iso >= 1600) {
      for (let i = 0; i < 2600; i++) {
        c.fillStyle = `rgba(255,255,255,${Math.random() * 0.25})`;
        c.fillRect(Math.random() * W, Math.random() * H, 1, 1);
      }
    }
    const g = c.createRadialGradient(W / 2, H / 2, H * 0.5, W / 2, H / 2, H * 1.05);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.42)");
    c.fillStyle = g; c.fillRect(0, 0, W, H);

    const th = document.createElement("canvas");
    th.width = 200; th.height = Math.max(1, Math.round(200 * (H / W)));
    th.getContext("2d").drawImage(cv, 0, 0, th.width, th.height);
    return { dataUrl: cv.toDataURL("image/jpeg", 0.85), thumb: th.toDataURL("image/jpeg", 0.55) };
  }

  update(dt, input) {
    if (this.flash > 0) this.flash -= dt;
    if (!this.active) return;
    if (input.pressed("TAB")) { this.sel = (this.sel + 1) % this.controls.length; this.renderUI(); }
    if (input.pressed("MINUS")) this.adjust(-1);
    if (input.pressed("PLUS")) this.adjust(1);
    if (input.pressed("SHOOT")) this.shoot();
    this.updateFocusBadge();
  }
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

/* painel de resultado (DOM, reutiliza classes .gq-result do site) */
export function showResult(dom, r, extraHtml, onClose, onAgain) {
  const rows = r.breakdown.map((b) => `
    <div class="gq-crit ${b.ok ? "ok" : "bad"}">
      <span class="gq-crit-ic">${CRITERIA_INFO[b.key].icon}</span>
      <div class="gq-crit-body">
        <b>${CRITERIA_INFO[b.key].label} · ${b.pts}/${b.max}</b>
        <span>${b.msg}</span>
        ${b.ok ? "" : `<em>📖 Reveja: ${CRITERIA_INFO[b.key].module}</em>`}
      </div>
      <span class="gq-crit-mark">${b.ok ? "✔" : "✘"}</span>
    </div>`).join("");

  const el = dom.panel;
  el.innerHTML = `
    <div class="gq-result">
      <div class="gq-result-photo">
        <img src="${r.photo.dataUrl}" alt="Sua foto">
        <div class="gq-result-set">ISO ${r.settings.iso} · f/${r.settings.f} · ${r.settings.tLabel} · ${r.settings.lens.label}</div>
      </div>
      <div class="gq-result-info">
        <div class="gq-result-score">
          <b>${r.score}</b><span>/100</span>
          <div class="gq-stars">${"★".repeat(r.stars.stars)}${"☆".repeat(5 - r.stars.stars)}</div>
          <div class="gq-result-title">${r.stars.title}</div>
        </div>
        ${extraHtml || ""}
        <div class="gq-crits">${rows}</div>
        <div class="gq-result-btns">
          <button class="btn btn--ghost" id="g3Again">📷 Tentar de novo</button>
          <button class="btn btn--primary" id="g3Ok">Continuar</button>
        </div>
      </div>
    </div>`;
  el.classList.add("open");
  el.querySelector("#g3Ok").onclick = () => { el.classList.remove("open"); el.innerHTML = ""; onClose?.(); };
  el.querySelector("#g3Again").onclick = () => { el.classList.remove("open"); el.innerHTML = ""; onAgain?.(); };
}
