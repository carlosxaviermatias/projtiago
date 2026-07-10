/* ============================================================
   FotoQuest · save.js
   Persistência em localStorage com versão de schema.
   - fotoquest-save     : progresso (pequeno, sempre salvo)
   - fotoquest-gallery  : fotos (thumbnails dataURL, podável)
   ============================================================ */

const SAVE_KEY = "fotoquest-save";
const GALLERY_KEY = "fotoquest-gallery";
const SCHEMA = 1;
const GALLERY_MAX = 30;

function freshSave() {
  return {
    schemaVersion: SCHEMA,
    xp: 0, level: 1, coins: 0,
    equipment: {
      owned: ["cam_basica", "lente_normal"],
      equipped: { camera: "cam_basica", lens: "lente_normal", flash: null, tripod: null },
    },
    levels: { fase01: { unlocked: true, bestScore: 0, questsDone: [] } },
    achievements: [],
    stats: { fotos: 0, somaNotas: 0, porConceito: {} },
  };
}

class SaveManager {
  constructor() {
    this.data = this.loadSave();
    this.gallery = this.loadGallery();
    this._t = null;
  }

  loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return freshSave();
      const d = JSON.parse(raw);
      if (d.schemaVersion !== SCHEMA) return this.migrate(d);
      return { ...freshSave(), ...d };            // preenche chaves novas
    } catch { return freshSave(); }
  }

  migrate(old) {
    // migrações em cadeia entram aqui quando o schema evoluir
    const d = { ...freshSave(), ...old, schemaVersion: SCHEMA };
    return d;
  }

  loadGallery() {
    try { return JSON.parse(localStorage.getItem(GALLERY_KEY)) || []; }
    catch { return []; }
  }

  /** salvamento debounced — chamar à vontade */
  save() {
    clearTimeout(this._t);
    this._t = setTimeout(() => this.flush(), 400);
  }

  flush() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.data)); } catch { /* quota */ }
    this.flushGallery();
  }

  flushGallery() {
    // poda FIFO protegendo a melhor foto de cada missão
    while (true) {
      try { localStorage.setItem(GALLERY_KEY, JSON.stringify(this.gallery)); return; }
      catch {
        const idx = this.gallery.findIndex((p) => !p.protected);
        if (idx < 0) { this.gallery.shift(); }
        else this.gallery.splice(idx, 1);
        if (!this.gallery.length) return;
      }
    }
  }

  addPhoto(photo) {
    // protege a melhor foto de cada missão
    if (photo.questId) {
      const prev = this.gallery.filter((p) => p.questId === photo.questId);
      const best = Math.max(0, ...prev.map((p) => p.score));
      if (photo.score >= best) {
        prev.forEach((p) => (p.protected = false));
        photo.protected = true;
      }
    }
    this.gallery.push(photo);
    while (this.gallery.length > GALLERY_MAX) {
      const idx = this.gallery.findIndex((p) => !p.protected);
      this.gallery.splice(idx < 0 ? 0 : idx, 1);
    }
    this.flushGallery();
  }

  /* ---------- progressão ---------- */

  xpForLevel(l) { return 100 * l * (l + 1) / 2; }   // 100, 300, 600, 1000…

  addXP(amount) {
    this.data.xp += amount;
    let ups = 0;
    while (this.data.xp >= this.xpForLevel(this.data.level)) this.data.level++, ups++;
    this.save();
    return ups;
  }

  addCoins(n) { this.data.coins += n; this.save(); }

  recordShot(concept, score) {
    const s = this.data.stats;
    s.fotos++; s.somaNotas += score;
    if (concept) {
      const c = (s.porConceito[concept] ||= { tentativas: 0, soma: 0 });
      c.tentativas++; c.soma += score;
    }
    this.save();
  }

  unlock(achId) {
    if (!this.data.achievements.includes(achId)) {
      this.data.achievements.push(achId);
      this.save();
      return true;
    }
    return false;
  }

  levelState(id) {
    return (this.data.levels[id] ||= { unlocked: false, bestScore: 0, questsDone: [] });
  }

  ownsItem(id) { return this.data.equipment.owned.includes(id); }
  equippedId(slot) { return this.data.equipment.equipped[slot]; }

  resetAll() {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(GALLERY_KEY);
    this.data = freshSave();
    this.gallery = [];
  }
}

export const save = new SaveManager();
