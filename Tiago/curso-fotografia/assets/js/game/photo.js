/* ============================================================
   FotoQuest · photo.js — o coração do jogo
   Modo câmera (viewfinder), simulação de exposição, avaliação
   pedagógica (0–100) e "revelação" da foto com efeitos.

   Exposição (stops de erro em relação ao ideal):
     stops = EV_cena + log2(ISO/100) − log2(f² / t)
     0 = perfeita · >0 clara · <0 escura
   ============================================================ */

import { TILE, VIEW_W, VIEW_H } from "./renderer.js?v=7";
import { input } from "./input.js?v=7";
import { save } from "./save.js?v=7";
import { combinedCaps, EQUIPMENT } from "./data/equipment.js?v=7";
import { CRITERIA_INFO, STARS } from "./data/strings.js?v=7";
import { toast } from "./dialogue.js?v=7";
import { canvasPoint } from "./fullscreen.js?v=7";
import { sfx } from "./audio.js?v=7";

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
   Critérios que dependem SÓ dos ajustes (ISO/f/velocidade).
   Ficam aqui fora para que o gabarito (idealSettings) use
   exatamente a mesma conta da avaliação — se um dia a régua
   mudar, os dois mudam juntos.
   ============================================================ */

/** exposição: 0–30 pontos a partir do erro em stops */
function expPointsFor(stops, tol) {
  const err = Math.max(0, Math.abs(stops) - tol);
  return Math.round(30 * Math.max(0, 1 - err / 2.5));
}

/** velocidade mínima que o assunto exige para não borrar */
function motionNeed(target) {
  return target?.def.motion === "fast" ? 1 / 500
    : target?.def.motion === "slow" ? 1 / 125 : Infinity;
}

/** movimento/tremida: 0–20 pontos */
function movementFor(target, s, caps) {
  const CI = CRITERIA_INFO;
  const shake = s.t > 1 / 30 + 1e-9 && !caps.steady;
  const need = motionNeed(target);
  let pts = 20, msg = CI.movimento.good;
  if (target?.def.wantsLongExposure) {
    // rastros de luz: aqui o "erro" vira arte — exige tripé + velocidade lenta
    if (caps.steady && s.t >= 0.25) { pts = 20; msg = CI.movimento.trailGood; }
    else { pts = caps.steady ? 8 : 3; msg = CI.movimento.trailNeed; }
  } else {
    if (s.t > need + 1e-9) { pts = Math.max(0, Math.round(20 * (need / s.t))); msg = CI.movimento.blur; }
    if (shake) { pts = Math.min(pts, 5); msg = CI.movimento.shake; }
    if (!target || (target.def.motion || "still") === "still") {
      if (!shake) { pts = 20; msg = "Assunto parado, câmera firme — nitidez garantida."; }
    }
  }
  return { pts, msg, shake, need };
}

/** abertura x profundidade de campo desejada (parte "de ajuste" dos 15 pts) */
function dofFor(target, f) {
  const want = target?.def.wantsShallowDOF ? "shallow" : target?.def.wantsDeepDOF ? "deep" : "any";
  const got = f <= 2.9 ? "shallow" : f >= 8 ? "deep" : "mid";
  const ok = want === "any" || want === got;
  return { pts: ok ? 15 : 8, ok, want, got };
}

/** penalidade de ruído por ISO alto (a câmera melhor tolera mais) */
function noiseFor(iso, caps) {
  const thresh = 1600 * Math.pow(2, caps.noiseBonus || 0);
  if (iso < thresh) return 0;
  return iso >= thresh * 2 ? 8 : 4;
}

/* ============================================================
   Gabarito: a melhor combinação ISO/f/velocidade para a cena.
   Testa todas as combinações permitidas pelo equipamento atual
   (≈500 no pior caso) e devolve a de maior pontuação — por isso
   o gabarito acompanha a evolução da câmera e da lente.
   ============================================================ */
export function idealSettings(cam, target) {
  const caps = cam.caps;
  const tol = cam.fase.level.expTolerance ?? 0.5;
  const sceneEV = cam.sceneEVFor(target);
  const maxIsoI = Math.max(0, ISOS.indexOf(Math.min(caps.isoMax, 6400)));
  const minFI = Math.max(0, FS.findIndex((f) => f >= caps.fMin));
  const want = dofFor(target, 5.6).want;

  let best = null;
  for (let i = 0; i <= maxIsoI; i++) {
    for (let fi = minFI; fi < FS.length; fi++) {
      for (let ti = 0; ti < TS.length; ti++) {
        const s = { iso: ISOS[i], f: FS[fi], t: TS[ti].v, tLabel: TS[ti].label };
        const stops = exposureStops(sceneEV, s.iso, s.f, s.t);
        let pts = expPointsFor(stops, tol)
          + movementFor(target, s, caps).pts
          + dofFor(target, s.f).pts
          - noiseFor(s.iso, caps);
        // desempates didáticos (frações: só decidem empates exatos)
        if (want === "any" && s.f >= 4 && s.f <= 8) pts += 0.4;
        if (!target?.def.wantsLongExposure && s.t <= 1 / 60 && s.t >= 1 / 250) pts += 0.3;
        if (!best || pts > best.pts) best = { ...s, pts, isoI: i, fI: fi, tI: ti, stops };
      }
    }
  }
  return best;
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

    // fotômetro: aparece quando o jogador já tem os controles completos
    // (ISO + abertura + velocidade, da fase 2 em diante). A precisão da
    // leitura vem da câmera equipada — 1 simples, 2 em pontos, 3 spot 1/3.
    this.meterLevel = this.locked ? 0 : (this.caps.meter || 1);

    // gabarito: só depois de passar a fase (todas as missões concluídas)
    this.gabAvailable = fase.quests.allDone;
    this.gabOn = false;
    this._gabT = 0;

    // visor ótico: câmeras de verdade têm, celular não (compõe pela tela).
    // Ligado por padrão em quem tem — é assim que se fotografa com reflex.
    this.vfAvailable = !!this.caps.viewfinder;
    this.vfOn = this.vfAvailable;

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
    sfx.play("camera");
    this.renderUI();
    this.bindDrag();
  }
  exit() {
    const cv = this.engine.canvas;
    cv.removeEventListener("pointerdown", this._drag);
    cv.removeEventListener("pointermove", this._drag);
    removeEventListener("pointerup", this._dragEnd);
    removeEventListener("pointercancel", this._dragEnd);
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
        ${this.vfAvailable ? `<button class="gq-camgab ${this.vfOn ? "on" : ""}" id="gqVfBtn" aria-label="Alternar visor ótico e tela">${this.vfOn ? "🔎" : "📱"}</button>` : ""}
        ${this.gabAvailable ? `<button class="gq-camgab ${this.gabOn ? "on" : ""}" id="gqGabBtn" aria-label="Gabarito da cena">🎯</button>` : ""}
        <button class="gq-camclose" id="gqCamClose" aria-label="Sair da câmera">✕</button>
      </div>
      ${this.gabAvailable && this.gabOn ? `<div class="gq-gab" id="gqGab">${this.gabaritoHTML()}</div>` : ""}
      <div class="gq-cam-help">${this.locked ? "Mova o retículo (setas/arrastar) · " : "TAB seleciona · Z/X ajustam · "}ESPAÇO fotografa${this.vfAvailable ? " · V visor" : ""}${this.gabAvailable ? " · G gabarito" : ""} · ESC sai</div>`;
    el.querySelectorAll(".gq-chip").forEach((b) =>
      b.addEventListener("pointerdown", (e) => { e.preventDefault(); this.sel = +b.dataset.i; this.renderUI(); }));
    el.querySelector("#gqMinus").addEventListener("pointerdown", (e) => { e.preventDefault(); this.adjust(-1); });
    el.querySelector("#gqPlus").addEventListener("pointerdown", (e) => { e.preventDefault(); this.adjust(1); });
    el.querySelector("#gqShutter").addEventListener("pointerdown", (e) => { e.preventDefault(); this.shoot(); });
    el.querySelector("#gqCamClose").addEventListener("pointerdown", (e) => { e.preventDefault(); this.engine.pop(); });
    el.querySelector("#gqGabBtn")?.addEventListener("pointerdown", (e) => { e.preventDefault(); this.toggleGab(); });
    el.querySelector("#gqVfBtn")?.addEventListener("pointerdown", (e) => { e.preventDefault(); this.toggleVf(); });

  }

  /* arrastar no canvas move o retículo (touch/mouse) — canvasPoint() já
     resolve a conversão corretamente mesmo com o jogo rotacionado (fullscreen
     mobile). Ligado UMA vez ao entrar: ficava dentro do renderUI(), que roda a
     cada ajuste de chip, empilhando um par de listeners por toque. */
  bindDrag() {
    const cv = this.engine.canvas;
    this._drag = (e) => {
      if (e.buttons === 0 && e.type === "pointermove") return;
      const { x: sx, y: sy } = canvasPoint(e, cv);
      if (this.vfOn) {
        // no visor a tela INTEIRA é o quadro, então não dá para "tocar onde
        // quero enquadrar": arrastar move a câmera junto com o dedo.
        if (e.type === "pointerdown" || !this._last) { this._last = { sx, sy }; return; }
        const { sc } = this.vfRect;
        this.cx -= (sx - this._last.sx) / sc;
        this.cy -= (sy - this._last.sy) / sc;
        this._last = { sx, sy };
      } else {
        this.cx = this.fase.camX + sx;
        this.cy = this.fase.camY + sy;
      }
      this.clampReticle();
    };
    this._dragEnd = () => { this._last = null; };
    cv.addEventListener("pointerdown", this._drag);
    cv.addEventListener("pointermove", this._drag);
    addEventListener("pointerup", this._dragEnd);
    addEventListener("pointercancel", this._dragEnd);
  }

  adjust(d) {
    const c = this.controls[this.sel];
    if (!c) return;
    if (c.key === "iso") this.isoI = clampI(this.isoI + d, 0, ISOS.indexOf(Math.min(this.caps.isoMax, 6400)));
    if (c.key === "f") { const min = FS.findIndex((f) => f >= this.caps.fMin); this.fI = clampI(this.fI + d, min, FS.length - 1); }
    if (c.key === "t") this.tI = clampI(this.tI + d, 0, TS.length - 1);
    if (c.key === "focus") this.focus = clampI(this.focus + d, 1, 16);
    if (c.key === "flash") this.flashOn = !this.flashOn;
    sfx.play("move");
    this.renderUI();
  }

  /* ---------- visor ótico ---------- */
  /** retângulo do quadro do visor na tela (desenho e arrasto usam o mesmo) */
  get vfRect() {
    // o quadro precisa caber ACIMA da fileira de chips (que é DOM, no rodapé),
    // senão a barra de informações do visor fica escondida atrás dos botões
    const dw = 648, dh = Math.round((dw * this.cropH) / this.cropW);
    return { dx: Math.round((VIEW_W - dw) / 2), dy: 20, dw, dh, sc: dw / this.cropW };
  }

  toggleVf() {
    if (!this.vfAvailable) { sfx.play("deny"); return; }
    this.vfOn = !this.vfOn;
    sfx.play("camera");
    this.renderUI();
  }

  /* ---------- gabarito (só com a fase concluída) ---------- */
  toggleGab() {
    if (!this.gabAvailable) { sfx.play("deny"); return; }
    this.gabOn = !this.gabOn;
    this._gabT = 0;
    sfx.play("select");
    this.renderUI();
  }

  /** conteúdo do painel: o ideal para o que está no visor agora */
  gabaritoHTML() {
    const tg = this.targetInCrop();
    const s = this.settings;
    const rows = [];

    if (!this.locked) {
      const best = idealSettings(this, tg);
      const cmp = (ideal, atual) => ideal > atual ? `<i class="up">↑ aumente</i>`
        : ideal < atual ? `<i class="down">↓ diminua</i>` : `<i class="eq">✔ no ponto</i>`;
      rows.push(`<div class="gq-gab-row"><span>ISO</span><b>${best.iso}</b>${cmp(best.isoI, this.isoI)}</div>`);
      rows.push(`<div class="gq-gab-row"><span>Abertura</span><b>f/${best.f}</b>${cmp(best.fI, this.fI)}</div>`);
      rows.push(`<div class="gq-gab-row"><span>Velocidade</span><b>${best.tLabel}</b>${cmp(best.tI, this.tI)}</div>`);
    }

    if (tg) {
      const dist = Math.hypot(tg.cx - this.fase.player.cx, tg.cy - this.fase.player.cy) / TILE;
      const foco = Math.round(dist);
      rows.push(`<div class="gq-gab-row"><span>Foco</span><b>${foco} tl</b>${
        this.focus === foco ? `<i class="eq">✔ no ponto</i>`
          : `<i class="${foco > this.focus ? "up" : "down"}">${foco > this.focus ? "↑ aumente" : "↓ diminua"}</i>`}</div>`);
      const [dMin, dMax] = tg.def.idealDistance || [2, 9];
      const eff = dist / this.caps.reach;
      const distTip = eff > dMax ? "aproxime-se do assunto (ou use tele)"
        : eff < dMin ? "afaste-se um pouco do assunto"
          : "distância do assunto está boa";
      rows.push(`<div class="gq-gab-tip">📏 ${distTip}</div>`);
      rows.push(`<div class="gq-gab-tip">▦ Componha o assunto num cruzamento da grade dos terços</div>`);
    } else {
      rows.push(`<div class="gq-gab-tip">🎯 Nenhum assunto no quadro — enquadre um alvo para ver o gabarito completo.</div>`);
    }

    if (save.ownsItem("flash") && !this.locked) {
      rows.push(`<div class="gq-gab-tip">⚡ Calculado com o flash <b>${s.flash ? "ligado" : "desligado"}</b>.</div>`);
    }

    return `<div class="gq-gab-head">🎯 Gabarito${tg ? ` · ${tg.def.name}` : ""}</div>${rows.join("")}
      <div class="gq-gab-foot">Ideal para o equipamento que você tem agora.</div>`;
  }

  refreshGab() {
    const el = this.engine?.dom.camUI.querySelector("#gqGab");
    if (el) el.innerHTML = this.gabaritoHTML();
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
    if (input.pressed("GAB") && this.gabAvailable) this.toggleGab();
    if (input.pressed("VF") && this.vfAvailable) this.toggleVf();
    if (input.pressed("SHOOT") || input.pressed("A")) this.shoot();
    if (input.pressed("B") || input.pressed("CAM")) this.engine.pop();
    if (this.flashAnim > 0) this.flashAnim -= dt;

    // o gabarito acompanha o retículo: atualiza algumas vezes por segundo
    if (this.gabOn) {
      this._gabT -= dt;
      if (this._gabT <= 0) { this._gabT = 0.3; this.refreshGab(); }
    }
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
    // Luzes de cena (softbox, refletor): quanto mais perto do assunto, mais luz.
    // Como o aluno pode ARRASTAR esses objetos, aproximar a luz clareia o
    // assunto de verdade — a lição de iluminação vira gesto, não texto.
    if (target) {
      for (const p of this.fase.props) {
        if (!p.light) continue;
        const alcance = p.lightRange || 5;
        const d = Math.hypot(p.x - target.x, p.y - target.y) / TILE;
        if (d < alcance) ev += p.light * (1 - d / alcance);
      }
    }
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

  /* ---------- desenho ----------
     Duas apresentações da MESMA cena: pela tela (celular, o recorte
     claro sobre o mundo escurecido) ou pelo visor ótico (o recorte
     ocupando a tela, com a moldura da reflex em volta). */
  draw(ctx) {
    const tg = this.targetInCrop();
    const stops = exposureStops(this.sceneEVFor(tg), this.settings.iso, this.settings.f, this.settings.t);

    if (this.vfOn) this.drawViewfinder(ctx, tg, stops);
    else this.drawLiveView(ctx, tg, stops);

    if (this.flashAnim > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this.flashAnim * 4})`;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  }

  /* ---------- pela tela (como no celular) ---------- */
  drawLiveView(ctx, tg, stops) {
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

    if (this.meterLevel > 0) this.drawMeter(ctx, stops, tg);
  }

  /* ---------- pelo visor ótico (reflex) ----------
     O recorte vira a tela inteira. Desenhamos a cena pelo MESMO caminho
     que revela a foto (renderWorld com forPhoto), então o que aparece no
     visor é literalmente o que sai na foto — inclusive sem o fotógrafo
     no quadro. Em volta, a moldura da câmera: ocular, marcas de
     enquadramento, pontos de foco e a barra de informações. */
  drawViewfinder(ctx, tg, stops) {
    const f = this.fase;
    const { dx, dy, dw, dh } = this.vfRect;
    const l = this.cx - this.cropW / 2, t = this.cy - this.cropH / 2;

    // corpo da câmera (você está com o olho na ocular)
    ctx.fillStyle = "#07080c";
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    // a cena, recortada pelo quadro do visor
    ctx.save();
    ctx.beginPath(); ctx.rect(dx, dy, dw, dh); ctx.clip();
    ctx.translate(dx, dy);
    ctx.scale(dw / this.cropW, dh / this.cropH);
    ctx.translate(-l, -t);
    f.renderWorld(ctx, 0, 0, true);
    ctx.restore();

    ctx.save();
    ctx.beginPath(); ctx.rect(dx, dy, dw, dh); ctx.clip();

    // preview de exposição
    if (Math.abs(stops) > 0.4) {
      ctx.fillStyle = stops > 0
        ? `rgba(255,255,255,${Math.min(0.85, (stops - 0.4) * 0.28)})`
        : `rgba(0,0,10,${Math.min(0.85, (-stops - 0.4) * 0.28)})`;
      ctx.fillRect(dx, dy, dw, dh);
    }

    // grade dos terços
    ctx.strokeStyle = "rgba(244,176,62,.45)";
    ctx.lineWidth = 1.5;
    for (let i = 1; i <= 2; i++) {
      line(ctx, dx + (dw * i) / 3, dy, dx + (dw * i) / 3, dy + dh);
      line(ctx, dx, dy + (dh * i) / 3, dx + dw, dy + (dh * i) / 3);
    }

    // pontos de AF (9, como numa reflex de entrada); acende o que cobre o alvo
    const sc = dw / this.cropW;
    const inFocus = tg && Math.abs(Math.hypot(tg.cx - f.player.cx, tg.cy - f.player.cy) / TILE - this.settings.focus) <= 1.5;
    for (let gy = 0; gy < 3; gy++) {
      for (let gx = 0; gx < 3; gx++) {
        const px = dx + dw * (gx + 1) / 4, py = dy + dh * (gy + 1) / 4;
        let on = false;
        if (tg) {
          const tx = dx + (tg.cx - l) * sc, ty = dy + (tg.cy - t) * sc;
          on = Math.abs(tx - px) < dw / 8 && Math.abs(ty - py) < dh / 8;
        }
        ctx.strokeStyle = on ? (inFocus ? "#58c08b" : "#e8736b") : "rgba(255,255,255,.35)";
        ctx.lineWidth = on ? 2 : 1;
        ctx.strokeRect(px - 9, py - 6, 18, 12);
      }
    }

    // vinheta da ocular: o círculo escuro nas quinas denuncia que é um visor
    const vig = ctx.createRadialGradient(dx + dw / 2, dy + dh / 2, dh * 0.52, dx + dw / 2, dy + dh / 2, dh * 1.02);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,.55)");
    ctx.fillStyle = vig; ctx.fillRect(dx, dy, dw, dh);
    ctx.restore();

    // marcas de enquadramento nos cantos
    ctx.strokeStyle = "#f4b03e"; ctx.lineWidth = 2.5;
    const m = 18;
    for (const [cx0, cy0, sx, sy] of [[dx, dy, 1, 1], [dx + dw, dy, -1, 1], [dx, dy + dh, 1, -1], [dx + dw, dy + dh, -1, -1]]) {
      line(ctx, cx0, cy0, cx0 + sx * m, cy0);
      line(ctx, cx0, cy0, cx0, cy0 + sy * m);
    }

    // fotômetro dentro do visor, na barra de baixo (como numa câmera de verdade)
    if (this.meterLevel > 0) this.drawMeter(ctx, stops, tg, { y: dy + dh - (this.meterLevel === 1 ? 40 : 52) });

    // barra de informações abaixo do quadro
    const s = this.settings;
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.font = "700 15px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff";
    const by = dy + dh + 22;
    ctx.fillText(`${s.tLabel}`, dx + 6, by);
    ctx.fillText(`F${s.f}`, dx + 78, by);
    ctx.fillText(`ISO ${s.iso}`, dx + 146, by);
    ctx.fillStyle = inFocus ? "#58c08b" : "rgba(255,255,255,.3)";
    ctx.beginPath(); ctx.arc(dx + 250, by, 5, 0, 7); ctx.fill();
    ctx.font = "600 11px Inter, sans-serif";
    ctx.fillStyle = inFocus ? "#58c08b" : "rgba(255,255,255,.35)";
    ctx.fillText(inFocus ? "foco confirmado" : "sem foco", dx + 262, by + 1);
    if (s.flash) {
      ctx.fillStyle = "#f4b03e";
      ctx.font = "700 15px Inter, sans-serif";
      ctx.fillText("⚡", dx + dw - 96, by);
    }
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,.45)";
    ctx.font = "600 11px Inter, sans-serif";
    ctx.fillText("V · voltar p/ tela", dx + dw - 6, by + 1);
    ctx.restore();
  }

  /* ---------- fotômetro ----------
     Nível 1 (celular): só diz escuro / ok / claro.
     Nível 2 (semipro): régua −3…+3 EV em pontos inteiros.
     Nível 3 (pro):     régua de 1/3 de ponto, leitura spot no assunto. */
  drawMeter(ctx, stops, tg, opts = {}) {
    const lvl = this.meterLevel;
    const tol = this.fase.level.expTolerance ?? 0.5;
    const ok = Math.abs(stops) <= tol;
    const W = 200, H = lvl === 1 ? 32 : 44;
    const x = opts.x ?? Math.round(VIEW_W / 2 - W / 2);
    const y = opts.y ?? 8;

    ctx.save();
    ctx.textBaseline = "middle";
    roundRect(ctx, x, y, W, H, 8);
    ctx.fillStyle = "rgba(14,15,19,.85)"; ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.14)"; ctx.lineWidth = 1; ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "700 8px Inter, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.45)";
    ctx.fillText(lvl === 3 && tg ? "FOTÔMETRO · SPOT" : "FOTÔMETRO", x + 10, y + 10);

    if (lvl === 1) {
      // leitura grosseira: três lâmpadas
      const segs = [["escuro", stops < -tol, "#e8736b"], ["ok", ok, "#58c08b"], ["claro", stops > tol, "#fff"]];
      const sw = (W - 20) / 3;
      segs.forEach(([label, on, color], i) => {
        const sx = x + 10 + i * sw;
        roundRect(ctx, sx + 2, y + 16, sw - 4, 12, 4);
        ctx.fillStyle = on ? color : "rgba(255,255,255,.08)"; ctx.fill();
        ctx.textAlign = "center";
        ctx.font = "700 8px Inter, sans-serif";
        ctx.fillStyle = on ? "#0e0f13" : "rgba(255,255,255,.5)";
        ctx.fillText(String(label).toUpperCase(), sx + sw / 2, y + 22);
      });
      ctx.restore();
      return;
    }

    // régua graduada
    const step = lvl >= 3 ? 1 / 3 : 1;
    const snapped = Math.max(-3, Math.min(3, Math.round(stops / step) * step));
    const bx = x + 16, bw = W - 32, by = y + 28;
    ctx.strokeStyle = "rgba(255,255,255,.28)";
    line(ctx, bx, by, bx + bw, by);
    const nTicks = lvl >= 3 ? 18 : 6;
    for (let i = 0; i <= nTicks; i++) {
      const s = -3 + (6 * i) / nTicks;
      const px = bx + ((s + 3) / 6) * bw;
      const major = Math.abs(s - Math.round(s)) < 1e-6;
      ctx.strokeStyle = major ? "rgba(255,255,255,.45)" : "rgba(255,255,255,.2)";
      line(ctx, px, by - (major ? 4 : 2), px, by + (major ? 4 : 2));
    }
    // zero destacado
    ctx.strokeStyle = "rgba(88,192,139,.8)";
    line(ctx, bx + bw / 2, by - 7, bx + bw / 2, by + 7);

    // agulha
    const mx = bx + ((snapped + 3) / 6) * bw;
    ctx.fillStyle = ok ? "#58c08b" : "#f4b03e";
    ctx.beginPath();
    ctx.moveTo(mx, by - 6); ctx.lineTo(mx - 5, by - 13); ctx.lineTo(mx + 5, by - 13);
    ctx.closePath(); ctx.fill();

    // leitura numérica
    const val = (snapped >= 0 ? "+" : "−") + Math.abs(snapped).toFixed(lvl >= 3 ? 1 : 0);
    ctx.textAlign = "right";
    ctx.font = "700 10px Inter, sans-serif";
    ctx.fillStyle = ok ? "#58c08b" : stops > 0 ? "#fff" : "#e8736b";
    ctx.fillText(`${val} EV ${ok ? "✔" : stops > 0 ? "claro" : "escuro"}`, x + W - 10, y + 10);
    ctx.restore();
  }

  /* ---------- disparo ---------- */
  shoot() {
    this.flashAnim = 0.25;
    sfx.play("shutter");
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
/** retângulo arredondado com fallback p/ navegadores sem ctx.roundRect */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

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
  const expPts = expPointsFor(stops, tol);
  const CI = CRITERIA_INFO;
  breakdown.push({
    key: "exposicao", pts: expPts, max: 30, ok: expPts >= 22,
    msg: expPts >= 22 ? CI.exposicao.good : stops < 0 ? CI.exposicao.dark : CI.exposicao.bright,
  });
  score += expPts;

  /* movimento (20) */
  const mov = movementFor(target, s, caps);
  const { pts: movPts, msg: movMsg, shake, need } = mov;
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
    const d = dofFor(target, s.f);
    dofPts = d.pts;
    dofMsg = d.ok ? CI.profundidade.good : CI.profundidade.dof;
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
  const noise = noiseFor(s.iso, caps);
  if (noise > 0) {
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
    // som de resultado quando a foto não faz parte de uma missão ativa
    // (missões tocam sons próprios abaixo)
    if (!r.quest) sfx.play(r.stars.stars >= 4 ? "star" : "select");
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
        sfx.play("quest");
        if (qr.levelUps) setTimeout(() => sfx.play("levelup"), 650);
        questMsg = `<div class="gq-questdone">✅ Missão concluída: <b>${qr.quest.title}</b>
          <span>+${rw.xp || 0} XP${rw.coins ? ` · +${rw.coins} 🪙` : ""}${rw.item ? ` · item novo!` : ""}</span></div>`;
        if (qr.levelUps) toast(engine, `⬆️ Subiu para o nível <b>${save.data.level}</b>!`);
        this.fase.refreshQuestUI();
      } else if (qr && qr.partial) {
        sfx.play("coin");
        questMsg = `<div class="gq-questdone">📌 Alvo registrado! Continue a missão <b>${qr.quest.title}</b>.</div>`;
      } else if (r.quest && r.score < r.quest.minScore) {
        sfx.play("deny");
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
    const continuar = () => engine.pop();
    const tentarDeNovo = () => {
      engine.pop();
      engine.push(new CameraScene(this.fase));
    };
    el.querySelector("#gqOk").onclick = continuar;
    el.querySelector("#gqAgain").onclick = tentarDeNovo;

    /* ESC (e Enter) fecham como "Continuar", sem precisar mirar no botão.
       Guardado em this._onKey para o exit() remover — senão o listener fica
       preso na página e o próximo ESC fecharia uma tela que já saiu.
       Obs.: na tela cheia NATIVA o navegador consome o ESC para sair dela. */
    this._onKey = (e) => {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        continuar();
      }
    };
    addEventListener("keydown", this._onKey, true);
  }

  exit() {
    if (this._onKey) { removeEventListener("keydown", this._onKey, true); this._onKey = null; }
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
