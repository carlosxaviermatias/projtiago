/* ============================================================
   Safári Fotográfico 3D · missions.js
   Missões do safári + save PRÓPRIO (localStorage separado —
   não toca no save do FotoQuest 2D).
   ============================================================ */

const SAVE_KEY = "fotoquest3d-save";
const GAL_KEY = "fotoquest3d-gallery";
const GAL_MAX = 12;

export const MISSIONS = [
  {
    id: "m1_flor", title: "Tesouro botânico", targetId: "flor", minScore: 50,
    brief: "Fotografe a Orquídea-do-campo de perto (nota ≥ 50).",
    tip: "Ela fica parada — treine foco e aproximação.",
    xp: 120,
  },
  {
    id: "m2_borboleta", title: "Asas douradas", targetId: "borboleta", minScore: 65,
    brief: "Retrato da borboleta com fundo desfocado (nota ≥ 65).",
    tip: "Perto + f/1.8–2.8 + foco cravado.",
    xp: 200,
  },
  {
    id: "m3_passaro", title: "Congele o voo", targetId: "passaro", minScore: 65,
    brief: "O Pássaro-azul em pleno voo, nítido (nota ≥ 65).",
    tip: "1/500+ e compense a luz.",
    xp: 260,
  },
  {
    id: "m4_barco", title: "Cartão-postal do lago", targetId: "barco", minScore: 60,
    brief: "O barco no contraluz dourado, tudo nítido (nota ≥ 60).",
    tip: "f/8+, foco longe e +1 ponto de exposição.",
    xp: 300,
  },
];

function fresh() {
  return { schemaVersion: 1, xp: 0, done: [], best: {}, fotos: 0 };
}

class Save3D {
  constructor() {
    try { this.data = { ...fresh(), ...(JSON.parse(localStorage.getItem(SAVE_KEY)) || {}) }; }
    catch { this.data = fresh(); }
    try { this.gallery = JSON.parse(localStorage.getItem(GAL_KEY)) || []; }
    catch { this.gallery = []; }
  }
  flush() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.data)); } catch { /* quota */ }
    while (this.gallery.length) {
      try { localStorage.setItem(GAL_KEY, JSON.stringify(this.gallery)); return; }
      catch { this.gallery.shift(); }
    }
  }
  addPhoto(p) {
    this.gallery.push(p);
    while (this.gallery.length > GAL_MAX) this.gallery.shift();
    this.flush();
  }
  reset() {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(GAL_KEY);
    this.data = fresh(); this.gallery = [];
  }
}

export const save3d = new Save3D();

/**
 * Registra uma foto avaliada. Retorna eventos p/ a UI:
 * { missionDone?, allDone?, xpGain }
 */
export function registerPhoto(result) {
  const d = save3d.data;
  d.fotos++;
  let ev = { xpGain: 0 };
  const t = result.target;
  if (t) {
    if ((d.best[t.def.id] || 0) < result.score) d.best[t.def.id] = result.score;
    const m = MISSIONS.find((m) => m.targetId === t.def.id && !d.done.includes(m.id));
    if (m && result.score >= m.minScore) {
      d.done.push(m.id);
      d.xp += m.xp;
      ev.missionDone = m;
      ev.xpGain = m.xp;
      if (d.done.length === MISSIONS.length) ev.allDone = true;
    }
  }
  save3d.addPhoto({
    id: Date.now(), score: result.score, thumb: result.photo.thumb,
    name: t?.def.name || "Paisagem",
    set: `ISO ${result.settings.iso} · f/${result.settings.f} · ${result.settings.tLabel}`,
  });
  save3d.flush();
  return ev;
}

export function missionStatus() {
  const d = save3d.data;
  return MISSIONS.map((m) => ({ ...m, done: d.done.includes(m.id) }));
}
