/* ============================================================
   FotoQuest · scenes.js
   Cenas do jogo: Menu → MapaMundi → Fase (gameplay), mais
   Galeria, Loja e Estatísticas (painéis DOM sobre o canvas).
   ============================================================ */

import { TILE, VIEW_W, VIEW_H, text } from "./renderer.js?v=6";
import { input } from "./input.js?v=6";
import { save } from "./save.js?v=6";
import { TileMap } from "./tilemap.js?v=6";
import { Player, NPC, Target } from "./entities.js?v=6";
import { makeProp } from "./sprites.js?v=6";
import { DialogueScene, toast } from "./dialogue.js?v=6";
import { QuestLog } from "./quests.js?v=6";
import { CameraScene } from "./photo.js?v=6";
import { LEVELS, LEVEL_ORDER } from "./data/levels.js?v=6";
import { EQUIPMENT, SLOT_NAMES } from "./data/equipment.js?v=6";
import { UI, ACHIEVEMENTS, CRITERIA_INFO } from "./data/strings.js?v=6";
import { sfx } from "./audio.js?v=6";

/* ============================================================
   MENU INICIAL
   ============================================================ */
export class MenuScene {
  enter(engine) {
    this.engine = engine;
    this.t = 0;
    const el = engine.dom.panel;
    const hasSave = save.data.stats.fotos > 0 || save.data.xp > 0;
    el.innerHTML = `
      <div class="gq-menu">
        <div class="gq-logo">📷</div>
        <h2>${UI.title}</h2>
        <p class="gq-menu-sub">${UI.subtitle}</p>
        <p class="gq-menu-desc">Explore 10 cenários, converse com mestres, aceite missões e
          fotografe aplicando o que você aprende no curso: exposição, composição, foco e muito mais.</p>
        <button class="btn btn--primary" id="gqStart">${hasSave ? "▶ Continuar jornada" : "▶ Começar a jornada"}</button>
        <div class="gq-menu-keys">
          <span><b>WASD/setas</b> andar</span><span><b>E</b> falar</span>
          <span><b>C</b> câmera</span><span><b>ESPAÇO</b> foto</span>
        </div>
      </div>`;
    el.classList.add("open");
    el.querySelector("#gqStart").onclick = () => { sfx.play("confirm"); engine.reset(new MapScene()); };
  }
  exit() { this.engine.dom.panel.classList.remove("open"); this.engine.dom.panel.innerHTML = ""; }
  update(dt) {
    this.t += dt;
    if (input.pressed("A") || input.pressed("SHOOT")) this.engine.reset(new MapScene());
  }
  draw(ctx) {
    ctx.fillStyle = "#0e0f13";
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    // "flashes" suaves de fundo
    for (let i = 0; i < 3; i++) {
      const a = 0.04 + 0.03 * Math.sin(this.t * 0.7 + i * 2.1);
      ctx.fillStyle = `rgba(244,176,62,${a})`;
      ctx.beginPath();
      ctx.arc(160 + i * 320, 270 + 80 * Math.sin(this.t * 0.35 + i), 170, 0, 7);
      ctx.fill();
    }
  }
}

/* ============================================================
   MAPA-MÚNDI — seleção de fases + hub (loja/galeria/stats)
   ============================================================ */
export class MapScene {
  enter(engine) {
    this.engine = engine;
    this.render();
  }
  resume() { this.render(); }
  exit() { this.engine.dom.panel.classList.remove("open"); this.engine.dom.panel.innerHTML = ""; }

  render() {
    const el = this.engine.dom.panel;
    const d = save.data;
    const prevXP = d.level > 1 ? save.xpForLevel(d.level - 1) : 0;
    const nextXP = save.xpForLevel(d.level);
    const pct = Math.min(100, Math.round(((d.xp - prevXP) / (nextXP - prevXP)) * 100));

    const cards = LEVEL_ORDER.map((id, i) => {
      const L = LEVELS[id];
      const st = save.levelState(id);
      const done = L.quests.every((q) => st.questsDone.includes(q.id));
      const locked = !st.unlocked;
      return `
        <button class="gq-lvcard ${locked ? "locked" : ""} ${done ? "done" : ""}" data-id="${id}" ${locked ? "disabled" : ""}>
          <span class="gq-lv-emoji">${locked ? "🔒" : L.emoji}</span>
          <span class="gq-lv-num">Fase ${i + 1}</span>
          <b>${L.nome}</b>
          <small>${locked ? UI.locked : L.desc}</small>
          <span class="gq-lv-foot">
            ${done ? "✅ completa" : st.unlocked ? `${st.questsDone.length}/${L.quests.length} missões` : ""}
            ${st.bestScore ? ` · 🏅 ${st.bestScore}` : ""}
          </span>
        </button>`;
    }).join("");

    el.innerHTML = `
      <div class="gq-map">
        <div class="gq-map-head">
          <div class="gq-player-badge">
            <span class="gq-avatar">🤳</span>
            <div>
              <b>Nível ${d.level}</b>
              <div class="gq-xpbar"><i style="width:${pct}%"></i></div>
              <small>${d.xp - prevXP}/${nextXP - prevXP} XP</small>
            </div>
          </div>
          <h2>${UI.mapTitle}</h2>
          <div class="gq-map-actions">
            <span class="gq-coins">🪙 ${d.coins}</span>
            <button class="btn btn--ghost gq-sm" id="gqShop">🛒 Loja</button>
            <button class="btn btn--ghost gq-sm" id="gqGallery">🖼️ Fotos</button>
            <button class="btn btn--ghost gq-sm" id="gqStats">📊 Perfil</button>
          </div>
        </div>
        <div class="gq-lvgrid">${cards}</div>
      </div>`;
    el.classList.add("open");
    el.querySelectorAll(".gq-lvcard:not(.locked)").forEach((b) =>
      b.addEventListener("click", () => { sfx.play("confirm"); this.engine.reset(new FaseScene(b.dataset.id)); }));
    el.querySelector("#gqShop").onclick = () => { sfx.play("select"); this.engine.push(new ShopScene()); };
    el.querySelector("#gqGallery").onclick = () => { sfx.play("select"); this.engine.push(new GalleryScene()); };
    el.querySelector("#gqStats").onclick = () => { sfx.play("select"); this.engine.push(new StatsScene()); };
  }

  update() {}
  draw(ctx) {
    ctx.fillStyle = "#0e0f13";
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}

/* ============================================================
   FASE — gameplay top-down
   ============================================================ */
export class FaseScene {
  constructor(levelId) {
    this.level = LEVELS[levelId];
    this.map = new TileMap(this.level.map, this.level.legend);
    this.quests = new QuestLog(this.level);
    this.npcs = [];
    this.targets = [];
    this.props = [];
    this.exits = [];
    for (const s of this.map.spawns) {
      if (s.type === "player") this.player = new Player(s.tx, s.ty);
      if (s.type === "npc") {
        const def = this.level.npcs.find((n) => n.id === s.id);
        if (def) this.npcs.push(new NPC(def, s.tx, s.ty));
      }
      if (s.type === "target") {
        const def = this.level.targets.find((t) => t.id === s.id);
        if (def) this.targets.push(new Target(def, s.tx, s.ty));
      }
      if (s.type === "prop") this.props.push({ x: s.tx * TILE, y: s.ty * TILE, img: makeProp(s.sprite) });
      if (s.type === "exit") this.exits.push({ x: s.tx * TILE, y: s.ty * TILE });
    }
    this.camX = 0; this.camY = 0;
    this.hintNPC = null;
    this.leaving = false;
  }

  enter(engine) {
    this.engine = engine;
    this.updateBadges();
    this.buildHUD();
    engine.dom.hud.classList.add("open");
    this.snapCam();
  }
  resume() { this.updateBadges(); this.refreshQuestUI(); }
  exit() {
    this.engine.dom.hud.classList.remove("open");
    this.engine.dom.hud.innerHTML = "";
  }

  buildHUD() {
    const el = this.engine.dom.hud;
    el.innerHTML = `
      <div class="gq-hud-top">
        <span class="gq-hud-title">${this.level.emoji} ${this.level.nome}</span>
        <span class="gq-hud-right">
          <span class="gq-coins">🪙 <b id="gqHudCoins">${save.data.coins}</b></span>
          <button class="gq-hud-btn" id="gqHudMap" title="Voltar ao mapa">🗺️</button>
        </span>
      </div>
      <div class="gq-hud-quests" id="gqHudQuests"></div>
      <div class="gq-hud-hint" id="gqHudHint"></div>`;
    el.querySelector("#gqHudMap").onclick = () => this.engine.reset(new MapScene());
    this.refreshQuestUI();
  }

  refreshQuestUI() {
    const box = this.engine.dom.hud.querySelector("#gqHudQuests");
    if (!box) return;
    const active = this.quests.activeQuests;
    const avail = this.level.quests.filter((q) => this.quests.state[q.id] === "available");
    let html = "";
    if (active.length) {
      html = active.map((q) => {
        const prog = this.quests.progress[q.id].size;
        return `<div class="gq-quest-pill">🎯 ${q.title}${q.targetIds.length > 1 ? ` · ${prog}/${q.targetIds.length}` : ""}</div>`;
      }).join("");
    } else if (avail.length) {
      html = `<div class="gq-quest-pill idle">💬 Fale com quem tem <b>!</b> sobre a cabeça</div>`;
    } else if (this.quests.allDone) {
      html = `<div class="gq-quest-pill done">✅ Fase completa! Vá até a saída ao sul</div>`;
    }
    box.innerHTML = html;
    const coins = this.engine.dom.hud.querySelector("#gqHudCoins");
    if (coins) coins.textContent = save.data.coins;
  }

  updateBadges() {
    for (const n of this.npcs) {
      const qs = this.quests.byGiver(n.def.id);
      if (qs.some((q) => this.quests.state[q.id] === "available")) n.badge = "!";
      else if (qs.some((q) => this.quests.state[q.id] === "active")) n.badge = "?";
      else n.badge = null;
    }
  }

  snapCam() {
    this.camX = this.player.cx - VIEW_W / 2;
    this.camY = this.player.cy - VIEW_H / 2;
    this.clampCam();
  }
  clampCam() {
    this.camX = Math.max(0, Math.min(this.map.pxW - VIEW_W, this.camX));
    this.camY = Math.max(0, Math.min(this.map.pxH - VIEW_H, this.camY));
  }

  update(dt) {
    this.player.update(dt, input, this.map);
    for (const n of this.npcs) n.update(dt, this.map);
    for (const t of this.targets) t.update(dt, this.map, this.player);

    // câmera segue com suavidade
    this.camX += (this.player.cx - VIEW_W / 2 - this.camX) * Math.min(1, dt * 6);
    this.camY += (this.player.cy - VIEW_H / 2 - this.camY) * Math.min(1, dt * 6);
    this.clampCam();

    // NPC mais próximo (p/ dica e interação)
    this.hintNPC = null;
    let best = 70;
    for (const n of this.npcs) {
      const d = Math.hypot(n.cx - this.player.cx, n.cy - this.player.cy);
      if (d < best) { best = d; this.hintNPC = n; }
    }
    const hint = this.engine.dom.hud.querySelector("#gqHudHint");
    if (hint) {
      hint.textContent = this.hintNPC
        ? `${UI.talkHint} com ${this.hintNPC.def.name}`
        : `${UI.camHint} · ${UI.talkHint}`;
    }

    if (input.pressed("A") && this.hintNPC) this.talkTo(this.hintNPC);
    else if (input.pressed("CAM")) this.engine.push(new CameraScene(this));
    if (input.pressed("B")) this.engine.reset(new MapScene());

    // saída da fase
    if (!this.leaving) {
      const b = this.player.box;
      for (const ex of this.exits) {
        if (b.x < ex.x + TILE && b.x + b.w > ex.x && b.y < ex.y + TILE && b.y + b.h > ex.y) {
          this.leaving = true;
          this.engine.reset(new MapScene());
          break;
        }
      }
    }
  }

  talkTo(npc) {
    const qs = this.quests.byGiver(npc.def.id);
    const avail = qs.find((q) => this.quests.state[q.id] === "available");
    if (avail) {
      this.engine.push(new DialogueScene(avail.intro, () => {
        this.quests.activate(avail);
        this.updateBadges();
        this.refreshQuestUI();
        toast(this.engine, `🎯 Nova missão: <b>${avail.title}</b><br><small>${avail.brief}</small>`, 3400);
      }));
      return;
    }
    const act = qs.find((q) => this.quests.state[q.id] === "active");
    if (act && act.reminder) {
      this.engine.push(new DialogueScene([act.reminder]));
      return;
    }
    this.engine.push(new DialogueScene(npc.def.chat));
  }

  /** desenha o mundo (usado pela fase, pelo viewfinder e pela foto) */
  renderWorld(ctx, camX, camY, forPhoto = false) {
    this.map.draw(ctx, camX, camY, forPhoto ? this.map.pxW : VIEW_W, forPhoto ? this.map.pxH : VIEW_H);
    const ents = [...this.props, ...this.npcs, ...this.targets];
    if (!forPhoto) ents.push(this.player);
    ents.sort((a, b) => (a.y + (a.img ? TILE : TILE)) - (b.y + (b.img ? TILE : TILE)));
    for (const e of ents) {
      if (e.img) ctx.drawImage(e.img, Math.round(e.x - camX), Math.round(e.y - camY));
      else e.draw(ctx, camX, camY);
    }
    // seta da saída
    for (const ex of this.exits) {
      const x = ex.x - camX + TILE / 2, y = ex.y - camY + 6;
      if (x > -40 && x < VIEW_W + 40 && y > -40 && y < VIEW_H + 40) {
        ctx.fillStyle = "#f4b03e";
        ctx.font = "700 13px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("▼ saída", x, y);
      }
    }
  }

  draw(ctx) {
    this.renderWorld(ctx, this.camX, this.camY);
    // escurece levemente fases noturnas (ambiente)
    const ev = this.level.ambientLight;
    if (ev <= 7) {
      ctx.fillStyle = `rgba(8,10,24,${ev <= 4 ? 0.42 : 0.28})`;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  }
}

/* ============================================================
   LOJA
   ============================================================ */
export class ShopScene {
  constructor() { this.overlay = true; }
  enter(engine) {
    this.engine = engine;
    this.render();
  }
  exit() { this.engine.dom.panel.classList.remove("open"); this.engine.dom.panel.innerHTML = ""; }

  render() {
    const el = this.engine.dom.panel;
    const d = save.data;
    const rows = Object.entries(EQUIPMENT).map(([id, it]) => {
      const owned = save.ownsItem(id);
      const equipped = d.equipment.equipped[it.type] === id;
      let btn;
      if (equipped) btn = `<button class="btn gq-sm" disabled>✔ Equipado</button>`;
      else if (owned) btn = `<button class="btn btn--ghost gq-sm" data-equip="${id}">Equipar</button>`;
      else btn = `<button class="btn btn--primary gq-sm" data-buy="${id}" ${d.coins < it.price ? "disabled" : ""}>🪙 ${it.price}</button>`;
      return `
        <div class="gq-shop-row ${equipped ? "eq" : ""}">
          <span class="gq-shop-ic">${it.icon}</span>
          <div class="gq-shop-info"><b>${it.name}</b><small>${SLOT_NAMES[it.type]} · ${it.desc}</small></div>
          ${btn}
        </div>`;
    }).join("");

    el.innerHTML = `
      <div class="gq-sheet">
        <div class="gq-sheet-head"><h2>${UI.shopTitle}</h2>
          <span class="gq-coins">🪙 ${d.coins}</span>
          <button class="gq-close" id="gqBack">✕</button></div>
        <div class="gq-sheet-body">${rows}</div>
      </div>`;
    el.classList.add("open");
    el.querySelector("#gqBack").onclick = () => this.engine.pop();
    el.querySelectorAll("[data-buy]").forEach((b) => b.onclick = () => {
      const id = b.dataset.buy, it = EQUIPMENT[id];
      if (d.coins < it.price) { sfx.play("deny"); return; }
      d.coins -= it.price;
      d.equipment.owned.push(id);
      d.equipment.equipped[it.type] = id;
      save.save();
      sfx.play("coin");
      toast(this.engine, `🛒 Comprou <b>${it.name}</b>!`);
      if (d.equipment.owned.length >= 5 && save.unlock("colecionador")) toast(this.engine, "🏅 Conquista: <b>Colecionador</b>");
      this.render();
    });
    el.querySelectorAll("[data-equip]").forEach((b) => b.onclick = () => {
      const id = b.dataset.equip;
      d.equipment.equipped[EQUIPMENT[id].type] = id;
      save.save();
      sfx.play("select");
      this.render();
    });
  }
  update() { if (input.pressed("B")) this.engine.pop(); }
  draw(ctx) { ctx.fillStyle = "rgba(5,6,10,.7)"; ctx.fillRect(0, 0, VIEW_W, VIEW_H); }
}

/* ============================================================
   GALERIA
   ============================================================ */
export class GalleryScene {
  constructor() { this.overlay = true; }
  enter(engine) {
    this.engine = engine;
    const el = engine.dom.panel;
    const pics = [...save.gallery].reverse();
    const grid = pics.length
      ? pics.map((p) => `
          <figure class="gq-ph">
            <img src="${p.thumb}" alt="${p.targetName || "foto"}">
            <figcaption><b>${p.score}</b> · ${p.targetName || ""}<br>
              <small>ISO ${p.settings.iso} · f/${p.settings.f} · ${p.settings.t}</small></figcaption>
          </figure>`).join("")
      : `<p class="gq-empty">Nenhuma foto ainda — sua jornada está só começando! 📷</p>`;
    el.innerHTML = `
      <div class="gq-sheet">
        <div class="gq-sheet-head"><h2>${UI.galleryTitle}</h2>
          <span class="gq-coins">${pics.length}/30</span>
          <button class="gq-close" id="gqBack">✕</button></div>
        <div class="gq-sheet-body gq-gallery">${grid}</div>
      </div>`;
    el.classList.add("open");
    el.querySelector("#gqBack").onclick = () => engine.pop();
  }
  exit() { this.engine.dom.panel.classList.remove("open"); this.engine.dom.panel.innerHTML = ""; }
  update() { if (input.pressed("B")) this.engine.pop(); }
  draw(ctx) { ctx.fillStyle = "rgba(5,6,10,.7)"; ctx.fillRect(0, 0, VIEW_W, VIEW_H); }
}

/* ============================================================
   ESTATÍSTICAS / PERFIL
   ============================================================ */
export class StatsScene {
  constructor() { this.overlay = true; }
  enter(engine) {
    this.engine = engine;
    const el = engine.dom.panel;
    const d = save.data;
    const s = d.stats;
    const media = s.fotos ? Math.round(s.somaNotas / s.fotos) : 0;
    const fasesDone = LEVEL_ORDER.filter((id) => {
      const L = LEVELS[id]; const st = save.levelState(id);
      return L.quests.every((q) => st.questsDone.includes(q.id));
    }).length;

    const conceitos = Object.entries(s.porConceito).map(([k, v]) => {
      const m = Math.round(v.soma / v.tentativas);
      const info = CRITERIA_INFO[k];
      return `<div class="gq-stat-row"><span>${info?.icon || "📌"} ${info?.label || k}</span>
        <div class="gq-xpbar"><i style="width:${m}%"></i></div><b>${m}</b></div>`;
    }).join("") || `<p class="gq-empty">Fotografe para ver seu desempenho por conceito.</p>`;

    const achs = Object.entries(ACHIEVEMENTS).map(([id, a]) => {
      const got = d.achievements.includes(id);
      return `<div class="gq-ach ${got ? "got" : ""}" title="${a.desc}">
        <span>${got ? a.icon : "🔒"}</span><small>${a.name}</small></div>`;
    }).join("");

    el.innerHTML = `
      <div class="gq-sheet">
        <div class="gq-sheet-head"><h2>${UI.statsTitle}</h2>
          <button class="gq-close" id="gqBack">✕</button></div>
        <div class="gq-sheet-body">
          <div class="gq-stat-cards">
            <div class="gq-stat-card"><b>${d.level}</b><span>nível</span></div>
            <div class="gq-stat-card"><b>${s.fotos}</b><span>fotos</span></div>
            <div class="gq-stat-card"><b>${media}</b><span>nota média</span></div>
            <div class="gq-stat-card"><b>${fasesDone}/10</b><span>fases</span></div>
          </div>
          <h3>Desempenho por conceito</h3>
          ${conceitos}
          <h3>Conquistas</h3>
          <div class="gq-achs">${achs}</div>
          <button class="btn btn--ghost gq-sm gq-danger" id="gqReset">🗑️ Zerar progresso</button>
        </div>
      </div>`;
    el.classList.add("open");
    el.querySelector("#gqBack").onclick = () => engine.pop();
    el.querySelector("#gqReset").onclick = () => {
      if (confirm("Apagar TODO o progresso do jogo? Não dá pra desfazer!")) {
        save.resetAll();
        engine.reset(new MenuScene());
      }
    };
  }
  exit() { this.engine.dom.panel.classList.remove("open"); this.engine.dom.panel.innerHTML = ""; }
  update() { if (input.pressed("B")) this.engine.pop(); }
  draw(ctx) { ctx.fillStyle = "rgba(5,6,10,.7)"; ctx.fillRect(0, 0, VIEW_W, VIEW_H); }
}
