/* ============================================================
   FotoQuest · photo.js — o coração do jogo
   Modo câmera (viewfinder), simulação de exposição, avaliação
   pedagógica (0–100) e "revelação" da foto com efeitos.

   Exposição (stops de erro em relação ao ideal):
     stops = EV_cena + log2(ISO/100) − log2(f² / t)
     0 = perfeita · >0 clara · <0 escura
   ============================================================ */

import { TILE, VIEW_W, VIEW_H } from "./renderer.js";
import { input } from "./input.js";
import { save } from "./save.js";
import { combinedCaps, EQUIPMENT } from "./data/equipment.js";
import { CRITERIA_INFO, STARS } from "./data/strings.js";
import { toast } from "./dialogue.js";

/* ---------- valores discretos dos controles ---------- */
export const ISOS = [100, 200, 400, 800, 1600, 3200, 6400];
export const FS = [1.8, 2.8, 4, 5.6, 8, 11, 16];
export const TS = [                                  // segundos + rótulo
  { v: 1, label: "1s" }, { v: 0.5, label: "1/2" }, { v: 0.25, label: "1/4" },
  { v: 1 / 15, label: "1/15" }, { v: 1 / 30, label: "1/30" }, { v: 1 / 60, label: "1/60" },
  { v: 1 / 125, label: "1/125" }, { v: 1 / 250, label: "1/250" }, { v: 1 / 500, label: "1/500" },
  { v: 1 / 1000, label: "1/1000" }, { v: 1 / 2000, label: "1/2000" },
];

export function exposureStops(sceneEV, iso, f, t) {
  return sceneEV + Math.log2(iso / 100) - Math.log2((f * f) / t);
}

/* ============================================================
   CameraScene — overlay sobre a FaseScene
   ============================================================ */
export class CameraScene {
  constructor(fase) {
    this.fase = fase;
    this.overlay = true;
    this.caps = combinedCaps(save.data.equipment.equipped);
    const lockCtl = fase.level.lockControls;   // tutorial: ISO/f/t travados
    this.locked = !!lockCtl;

    // recorte do viewfinder no mundo (zoom da lente reduz a área)
    this.cropW = 320 / this.caps.zoom;
    this.cropH = 180 / this.caps.zoom;
    this.cx = fase.player.cx;                  // centro do retículo (mundo)
    this.cy = fase.player.cy - TILE;

    // controles
    this.isoI = 2; this.fI = 3; this.tI = 6;   // ISO400 · f/5.6 · 1/125
    this.focus = 4;                            // distância de foco em tiles
    this.flashOn = false;
    this.sel = 0;                              // controle selecionado
    this.flashAnim = 0;
    this.clampSettings();
  }

  get controls() {
    const list = [];
    if (!this.locked) {
      list.push(
        { key: "iso", label: "ISO", value: () => ISOS[this.isoI] },
        { key: "f", label: "f/", value: () => FS[this.fI] },
        { key: "t", label: "Vel", value: () => TS[this.tI].label },
      );
    }
    list.push({ key: "focus", label: "Foco", value: () => this.focus + " tl" });
    if (save.ownsItem("flash")) list.push({ key: "flash", label: "Flash", value: () => (this.flashOn ? "ON" : "off") });
    return list;
  }

  clampSettings() {
    const maxIso = ISOS.indexOf(Math.min(this.caps.isoMax, 6400));
    if (this.isoI > maxIso) this.isoI = maxIso;
    while (FS[this.fI] < this.caps.fMin) this.fI++;
    if (!this.caps.steady && TS[this.tI].v > 1 / 15) this.tI = 3; // sem tripé começa em 1/15
  }

  enter(engine) {
    this.engine = engine;
    engine.dom.camUI.classList.add("open");
    this.renderUI();
  }
  exit() {
    this.engine.dom.camUI.classList.remove("open");
    this.engine.dom.camUI.innerHTML = "";
  }

  /* ---------- UI DOM (chips de controle) ---------- */
  renderUI() {
    const el = this.engine.dom.camUI;
    const chips = this.controls.map((c, i) =>
      `<button class="gq-chip ${i === this.sel ? "sel" : ""}" data-i="${i}">
         <span>${c.label}</span><b>${c.value()}</b></button>`).join("");
    el.innerHTML = `
      <div class="gq-cam-row">
        <button class="gq-chipnav" id="gqMinus">−</button>
        <div class="gq-chips">${chips}</div>
        <button class="gq-chipnav" id="gqPlus">＋</button>
        <button class="gq-shutter" id="gqShutter" aria-label="Fotografar">📷</button>
        <button class="gq-camclose" id="gqCamClose" aria-label="Sair da câmera">✕</button>
      </div>
      <div class="gq-cam-help">${this.locked ? "Mova o retículo (setas/arrastar) · " : "TAB seleciona · Z/X ajustam · "}ESPAÇO fotografa · ESC sai</div>`;
    el.querySelectorAll(".gq-chip").forEach((b) =>
      b.addEventListener("pointerdown", (e) => { e.preventDefault(); this.sel = +b.dataset.i; this.renderUI(); }));
    el.querySelector("#gqMinus").addEventListener("pointerdown", (e) => { e.preventDefault(); this.adjust(-1); });
    el.querySelector("#gqPlus").addEventListener("pointerdown", (e) => { e.preventDefault(); this.adjust(1); });
    el.querySelector("#gqShutter").addEventListener("pointerdown", (e) => { e.preventDefault(); this.shoot(); });
    el.querySelector("#gqCamClose").addEventListener("pointerdown", (e) => { e.preventDefault(); this.engine.pop(); });

    // arrastar no canvas move o retículo (touch/mouse)
    const cv = this.engine.canvas;
    this._drag = (e) => {
      if (e.buttons === 0 && e.type === "pointermove") return;
      const r = cv.getBoundingClientRect();
      const sx = ((e.clientX - r.left) / r.width) * VIEW_W;
      const sy = ((e.clientY - r.top) / r.height) * VIEW_H;
      this.cx = this.fase.camX + sx;
      this.cy = this.fase.camY + sy;
      this.clampReticle();
    };
    cv.addEventListener("pointerdown", this._drag);
    cv.addEventListener("pointermove", this._drag);
  }

  adjust(d) {
    const c = this.controls[this.sel];
    if (!c) return;
    if (c.key === "iso") this.isoI = clampI(this.isoI + d, 0, ISOS.indexOf(Math.min(this.caps.isoMax, 6400)));
    if (c.key === "f") { const min = FS.findIndex((f) => f >= this.caps.fMin); this.fI = clampI(this.fI + d, min, FS.length - 1); }
    if (c.key === "t") this.tI = clampI(this.tI + d, 0, TS.length - 1);
    if (c.key === "focus") this.focus = clampI(this.focus + d, 1, 16);
    if (c.key === "flash") this.flashOn = !this.flashOn;
    this.renderUI();
  }

  clampReticle() {
    const m = this.fase.map;
    const hw = this.cropW / 2, hh = this.cropH / 2;
    // retículo limitado a um raio em volta do fotógrafo (alcance realista)
    const R = 340;
    const dx = this.cx - this.fase.player.cx, dy = this.cy - this.fase.player.cy;
    const d = Math.hypot(dx, dy);
    if (d > R) { this.cx = this.fase.player.cx + (dx / d) * R; this.cy = this.fase.player.cy + (dy / d) * R; }
    this.cx = Math.max(hw, Math.min(m.pxW - hw, this.cx));
    this.cy = Math.max(hh, Math.min(m.pxH - hh, this.cy));
  }

  update(dt) {
    // alvos continuam vivos enquanto você enquadra!
    for (const t of this.fase.targets) t.update(dt, this.fase.map, this.fase.player);
    const sp = 300 * dt;
    this.cx += input.dirX * sp; this.cy += input.dirY * sp;
    this.clampReticle();

    if (input.pressed("TAB")) { this.sel = (this.sel + 1) % this.controls.length; this.renderUI(); }
    if (input.pressed("MINUS")) this.adjust(-1);
    if (input.pressed("PLUS")) this.adjust(1);
    if (input.pressed("SHOOT") || input.pressed("A")) this.shoot();
    if (input.pressed("B") || input.pressed("CAM")) this.engine.pop();
    if (this.flashAnim > 0) this.flashAnim -= dt;
  }

  get settings() {
    return {
      iso: this.locked ? 400 : ISOS[this.isoI],
      f: this.locked ? 5.6 : FS[this.fI],
      t: this.locked ? 1 / 125 : TS[this.tI].v,
      tLabel: this.locked ? "1/125" : TS[this.tI].label,
      focus: this.focus,
      flash: this.flashOn,
    };
  }

  sceneEVFor(target) {
    const lv = this.fase.level;
    let ev = lv.ambientLight + (target?.def.lightMod || 0);
    if (this.flashOn && save.ownsItem("flash")) ev += this.caps.evBonus || 2;
    return ev;
  }

  /** alvo mais relevante dentro do recorte (missão ativa 1º) */
  targetInCrop() {
    const l = this.cx - this.cropW / 2, t = this.cy - this.cropH / 2;
    const inside = this.fase.targets.filter((tg) =>
      tg.fled <= 0 &&
      tg.cx > l && tg.cx < l + this.cropW && tg.cy > t && tg.cy < t + this.cropH);
    if (!inside.length) return null;
    const quested = inside.find((tg) => this.fase.quests.questForTarget(tg.def.id));
    if (quested) return quested;
    inside.sort((a, b) => Math.hypot(a.cx - this.cx, a.cy - this.cy) - Math.hypot(b.cx - this.cx, b.cy - this.cy));
    return inside[0];
  }

  /* ---------- desenho do viewfinder ---------- */
  draw(ctx) {
    const f = this.fase;
    // recentra a câmera do jogo no retículo (suave)
    f.camX += ((this.cx - VIEW_W / 2) - f.camX) * 0.2;
    f.camY += ((this.cy - VIEW_H / 2) - f.camY) * 0.2;
    f.clampCam();
    f.renderWorld(ctx, f.camX, f.camY);

    const rx = this.cx - this.cropW / 2 - f.camX;
    const ry = this.cy - this.cropH / 2 - f.camY;
    const rw = this.cropW, rh = this.cropH;

    // máscara escura fora do recorte
    ctx.save();
    ctx.fillStyle = "rgba(5,6,10,.82)";
    ctx.beginPath();
    ctx.rect(0, 0, VIEW_W, VIEW_H);
    ctx.rect(rx, ry, rw, rh);
    ctx.fill("evenodd");

    // preview de exposição dentro do recorte
    const tg = this.targetInCrop();
    const stops = exposureStops(this.sceneEVFor(tg), this.settings.iso, this.settings.f, this.settings.t);
    if (Math.abs(stops) > 0.4) {
      ctx.fillStyle = stops > 0
        ? `rgba(255,255,255,${Math.min(0.85, (stops - 0.4) * 0.28)})`
        : `rgba(0,0,10,${Math.min(0.85, (-stops - 0.4) * 0.28)})`;
      ctx.fillRect(rx, ry, rw, rh);
    }

    // grade dos terços
    ctx.strokeStyle = "rgba(244,176,62,.75)";
    ctx.lineWidth = 1.5;
    for (let i = 1; i <= 2; i++) {
      line(ctx, rx + (rw * i) / 3, ry, rx + (rw * i) / 3, ry + rh);
      line(ctx, rx, ry + (rh * i) / 3, rx + rw, ry + (rh * i) / 3);
    }
    // moldura + cantos
    ctx.strokeStyle = "#f4b03e"; ctx.lineWidth = 2.5;
    ctx.strokeRect(rx, ry, rw, rh);

    // indicador de foco no alvo
    if (tg) {
      const distT = Math.hypot(tg.cx - f.player.cx, tg.cy - f.player.cy) / TILE;
      const inFocus = Math.abs(distT - this.settings.focus) <= 1.5;
      ctx.strokeStyle = inFocus ? "#58c08b" : "#e8736b";
      ctx.lineWidth = 2;
      ctx.strokeRect(tg.x - f.camX - 3, tg.y - f.camY - 3, TILE + 6, TILE + 6);
      ctx.font = "700 12px Inter, sans-serif";
      ctx.fillStyle = inFocus ? "#58c08b" : "#e8736b";
      ctx.textAlign = "center";
      ctx.fillText(inFocus ? "EM FOCO" : `alvo a ${distT.toFixed(0)} tiles`, tg.cx - f.camX, tg.y - f.camY - 8);
    }

    // luz de "REC"
    ctx.fillStyle = "#e8736b";
    ctx.beginPath(); ctx.arc(rx + 12, ry + 12, 4, 0, 7); ctx.fill();
    ctx.restore();

    if (this.flashAnim > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this.flashAnim * 4})`;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  }

  /* ---------- disparo ---------- */
  shoot() {
    this.flashAnim = 0.25;
    const tg = this.targetInCrop();
    const result = evaluateShot(this, tg);
    // pequena espera p/ animação do flash aparecer
    setTimeout(() => {
      this.engine.pop();                       // sai do modo câmera
      this.engine.push(new ResultScene(this.fase, result));
    }, 180);
  }
}

function clampI(v, a, b) { return Math.max(a, Math.min(b, v)); }
function line(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

/* ============================================================
   Avaliação pedagógica + revelação da foto
   ============================================================ */

function evaluateShot(cam, target) {
  const s = cam.settings;
  const fase = cam.fase;
  const level = fase.level;
  const caps = cam.caps;
  const breakdown = [];
  let score = 0;

  const dist = target ? Math.hypot(target.cx - fase.player.cx, target.cy - fase.player.cy) / TILE : 99;

  /* exposição (30) */
  const stops = exposureStops(cam.sceneEVFor(target), s.iso, s.f, s.t);
  const tol = level.expTolerance ?? 0.5;
  const err = Math.max(0, Math.abs(stops) - tol);
  const expPts = Math.round(30 * Math.max(0, 1 - err / 2.5));
  const CI = CRITERIA_INFO;
  breakdown.push({
    key: "exposicao", pts: expPts, max: 30, ok: expPts >= 22,
    msg: expPts >= 22 ? CI.exposicao.good : stops < 0 ? CI.exposicao.dark : CI.exposicao.bright,
  });
  score += expPts;

  /* movimento (20) */
  const shake = s.t > 1 / 30 + 1e-9 && !caps.steady;
  let movPts = 20;
  const need = target?.def.motion === "fast" ? 1 / 500 : target?.def.motion === "slow" ? 1 / 125 : Infinity;
  let movMsg = CI.movimento.good;
  if (target?.def.wantsLongExposure) {
    // rastros de luz: aqui o "erro" vira arte — exige tripé + velocidade lenta
    if (caps.steady && s.t >= 0.25) { movPts = 20; movMsg = CI.movimento.trailGood; }
    else { movPts = caps.steady ? 8 : 3; movMsg = CI.movimento.trailNeed; }
  } else {
    if (s.t > need + 1e-9) { movPts = Math.max(0, Math.round(20 * (need / s.t))); movMsg = CI.movimento.blur; }
    if (shake) { movPts = Math.min(movPts, 5); movMsg = CI.movimento.shake; }
    if (!target || (target.def.motion || "still") === "still") {
      if (!shake) { movPts = 20; movMsg = "Assunto parado, câmera firme — nitidez garantida."; }
    }
  }
  breakdown.push({ key: "movimento", pts: movPts, max: 20, ok: movPts >= 15, msg: movMsg });
  score += movPts;

  /* enquadramento / regra dos terços (20) */
  let framePts = 0, frameMsg = CI.enquadramento.out;
  if (target) {
    const l = cam.cx - cam.cropW / 2, t = cam.cy - cam.cropH / 2;
    const nx = (target.cx - l) / cam.cropW, ny = (target.cy - t) / cam.cropH; // 0..1
    const pts3 = [[1 / 3, 1 / 3], [2 / 3, 1 / 3], [1 / 3, 2 / 3], [2 / 3, 2 / 3]];
    const d = Math.min(...pts3.map(([px, py]) => Math.hypot(nx - px, ny - py)));
    framePts = Math.round(20 * Math.max(0, 1 - d * 2.4));
    frameMsg = framePts >= 15 ? CI.enquadramento.good : CI.enquadramento.center;
  }
  breakdown.push({ key: "enquadramento", pts: framePts, max: 20, ok: framePts >= 15, msg: frameMsg });
  score += framePts;

  /* foco & profundidade de campo (15) */
  let dofPts = 0, dofMsg = CI.profundidade.focus;
  const focusErr = target ? Math.abs(dist - s.focus) : 9;
  const focusOk = focusErr <= 1.5;
  if (focusOk) {
    const want = target?.def.wantsShallowDOF ? "shallow" : target?.def.wantsDeepDOF ? "deep" : "any";
    const got = s.f <= 2.9 ? "shallow" : s.f >= 8 ? "deep" : "mid";
    const dofOk = want === "any" || want === got;
    dofPts = dofOk ? 15 : 8;
    dofMsg = dofOk ? CI.profundidade.good : CI.profundidade.dof;
  } else dofPts = Math.max(0, Math.round(6 - focusErr));
  breakdown.push({ key: "profundidade", pts: dofPts, max: 15, ok: dofPts >= 12, msg: dofMsg });
  score += dofPts;

  /* lente & distância (15) */
  let lensPts = 0, lensMsg = CI.lente.far;
  if (target) {
    const [dMin, dMax] = target.def.idealDistance || [2, 9];
    const eff = dist / caps.reach;
    if (eff >= dMin && eff <= dMax) { lensPts = 15; lensMsg = CI.lente.good; }
    else if (eff > dMax) { lensPts = Math.max(0, Math.round(15 - (eff - dMax) * 3)); lensMsg = CI.lente.far; }
    else { lensPts = Math.max(0, Math.round(15 - (dMin - eff) * 4)); lensMsg = CI.lente.near; }
  }
  breakdown.push({ key: "lente", pts: lensPts, max: 15, ok: lensPts >= 12, msg: lensMsg });
  score += lensPts;

  /* ruído de ISO alto (penalidade, fase 8 em diante) */
  const noiseThresh = 1600 * Math.pow(2, caps.noiseBonus || 0);
  let noise = 0;
  if (s.iso >= noiseThresh) {
    noise = s.iso >= noiseThresh * 2 ? 8 : 4;
    score -= noise;
    breakdown.push({ key: "ruido", pts: -noise, max: 0, ok: false, msg: CI.ruido.warn });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const stars = STARS.find((r) => score >= r.min);
  const quest = target ? fase.quests.questForTarget(target.def.id) : null;

  const photo = renderPhoto(cam, target, { stops, shake, focusOk, noisy: noise > 0, needBlur: target && s.t > need });
  return { score, stars, breakdown, target, quest, settings: s, photo, dist };
}

/** Revela a foto: recorte do mundo + efeitos de erro. */
function renderPhoto(cam, target, fx) {
  const W = 320, H = 180;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const c = cv.getContext("2d");
  c.imageSmoothingEnabled = false;

  const l = cam.cx - cam.cropW / 2, t = cam.cy - cam.cropH / 2;
  c.save();
  c.scale(W / cam.cropW, H / cam.cropH);
  c.translate(-l, -t);
  cam.fase.renderWorld(c, 0, 0, true);
  c.restore();

  // motion blur do alvo (fantasma deslocado)
  if (fx.needBlur && target) {
    c.save();
    c.globalAlpha = 0.45;
    const sc = W / cam.cropW;
    const off = 8;
    c.scale(sc, sc); c.translate(-l, -t);
    c.translate(off / sc * Math.sign(target.vx || 1), 0);
    target.draw(c, 0, 0);
    c.restore();
  }

  // exposição + blur de foco/tremida via filter (fallback: overlay)
  const bright = Math.pow(2, Math.max(-3.2, Math.min(3.2, fx.stops)));
  const blurPx = (fx.focusOk ? 0 : 2.2) + (fx.shake ? 2.5 : 0);
  try {
    const cv2 = document.createElement("canvas");
    cv2.width = W; cv2.height = H;
    const c2 = cv2.getContext("2d");
    c2.filter = `brightness(${bright}) blur(${blurPx}px)`;
    c2.drawImage(cv, 0, 0);
    c.clearRect(0, 0, W, H);
    c.drawImage(cv2, 0, 0);
  } catch {
    c.fillStyle = fx.stops > 0 ? `rgba(255,255,255,${Math.min(0.8, fx.stops * 0.25)})` : `rgba(0,0,8,${Math.min(0.8, -fx.stops * 0.25)})`;
    c.fillRect(0, 0, W, H);
  }

  // ruído de ISO alto
  if (fx.noisy) {
    for (let i = 0; i < 1400; i++) {
      c.fillStyle = `rgba(255,255,255,${Math.random() * 0.28})`;
      c.fillRect(Math.random() * W, Math.random() * H, 1, 1);
    }
  }

  // vinheta
  const g = c.createRadialGradient(W / 2, H / 2, H * 0.55, W / 2, H / 2, H * 1.05);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,.4)");
  c.fillStyle = g; c.fillRect(0, 0, W, H);

  const dataUrl = cv.toDataURL("image/jpeg", 0.82);
  // thumbnail p/ galeria
  const th = document.createElement("canvas");
  th.width = 160; th.height = 90;
  th.getContext("2d").drawImage(cv, 0, 0, 160, 90);
  const thumb = th.toDataURL("image/jpeg", 0.5);
  return { dataUrl, thumb };
}

/* ============================================================
   ResultScene — foto revelada + nota + feedback (painel DOM)
   ============================================================ */
export class ResultScene {
  constructor(fase, result) {
    this.fase = fase;
    this.r = result;
    this.overlay = true;
  }

  enter(engine) {
    this.engine = engine;
    const r = this.r;

    // registra estatísticas / conquistas / galeria / missão
    save.recordShot(r.target?.def.concept, r.score);
    if (save.unlock("primeira_foto")) toast(engine, "🏅 Conquista: <b>Primeiro clique</b>");
    if (r.stars.stars === 5 && save.unlock("cinco_estrelas")) toast(engine, "🏅 Conquista: <b>Perfeccionista</b>");
    if (this.fase.level.ambientLight <= 5 && r.score >= 90 && save.unlock("mestre_luz")) toast(engine, "🏅 Conquista: <b>Mestre da luz</b>");

    let questMsg = "";
    if (r.target) {
      save.addPhoto({
        id: Date.now(), levelId: this.fase.level.id, questId: r.quest?.id || null,
        score: r.score, settings: { iso: r.settings.iso, f: r.settings.f, t: r.settings.tLabel },
        thumb: r.photo.thumb, targetName: r.target.def.name,
      });
      const st = save.levelState(this.fase.level.id);
      if (r.score > st.bestScore) { st.bestScore = r.score; save.save(); }

      const qr = this.fase.quests.registerPhoto(r.target.def.id, r.score);
      if (qr && !qr.partial) {
        const rw = qr.quest.rewards || {};
        questMsg = `<div class="gq-questdone">✅ Missão concluída: <b>${qr.quest.title}</b>
          <span>+${rw.xp || 0} XP${rw.coins ? ` · +${rw.coins} 🪙` : ""}${rw.item ? ` · item novo!` : ""}</span></div>`;
        if (qr.levelUps) toast(engine, `⬆️ Subiu para o nível <b>${save.data.level}</b>!`);
        this.fase.refreshQuestUI();
      } else if (qr && qr.partial) {
        questMsg = `<div class="gq-questdone">📌 Alvo registrado! Continue a missão <b>${qr.quest.title}</b>.</div>`;
      } else if (r.quest && r.score < r.quest.minScore) {
        questMsg = `<div class="gq-questdone warn">A missão pede nota ≥ <b>${r.quest.minScore}</b>. Ajuste e tente de novo!</div>`;
      }
    }

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

    const el = engine.dom.panel;
    el.innerHTML = `
      <div class="gq-result">
        <div class="gq-result-photo">
          <img src="${r.photo.dataUrl}" alt="Sua foto">
          <div class="gq-result-set">ISO ${r.settings.iso} · f/${r.settings.f} · ${r.settings.tLabel}${r.settings.flash ? " · ⚡" : ""}</div>
        </div>
        <div class="gq-result-info">
          <div class="gq-result-score">
            <b>${r.score}</b><span>/100</span>
            <div class="gq-stars">${"★".repeat(r.stars.stars)}${"☆".repeat(5 - r.stars.stars)}</div>
            <div class="gq-result-title">${r.stars.title}</div>
          </div>
          ${questMsg}
          <div class="gq-crits">${rows}</div>
          <div class="gq-result-btns">
            <button class="btn btn--ghost" id="gqAgain">📷 Tentar de novo</button>
            <button class="btn btn--primary" id="gqOk">Continuar</button>
          </div>
        </div>
      </div>`;
    el.classList.add("open");
    el.querySelector("#gqOk").onclick = () => engine.pop();
    el.querySelector("#gqAgain").onclick = () => {
      engine.pop();
      engine.push(new CameraScene(this.fase));
    };
  }

  exit() {
    this.engine.dom.panel.classList.remove("open");
    this.engine.dom.panel.innerHTML = "";
  }

  update() {
    if (input.pressed("B")) this.engine.pop();
    if (input.pressed("CAM")) { this.engine.pop(); this.engine.push(new CameraScene(this.fase)); }
  }

  draw(ctx) {
    ctx.fillStyle = "rgba(5,6,10,.7)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}
