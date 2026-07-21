/* ============================================================
   Safári Fotográfico 3D · quality.js
   Presets de gráficos p/ celular fraco / médio / potente.
   Auto-detecta no 1º acesso e persiste a escolha do aluno.
   Trocar qualidade = salvar + recarregar a página (simples e
   à prova de vazamento de memória WebGL).
   ============================================================ */

const KEY = "fotoquest3d-quality";

export const PRESETS = {
  leve: {
    label: "🐢 Leve", desc: "celular fraco",
    pixelRatio: 0.55, antialias: false, shadows: false,
    trees: 55, rocks: 10, flowers: 25, fogFar: 130, far: 170,
  },
  medio: {
    label: "⚙️ Médio", desc: "celular intermediário",
    pixelRatio: 0.8, antialias: false, shadows: false,
    trees: 120, rocks: 18, flowers: 45, fogFar: 210, far: 280,
  },
  alto: {
    label: "🚀 Alto", desc: "celular potente / PC",
    pixelRatio: Math.min(devicePixelRatio || 1, 1.6), antialias: true, shadows: true,
    trees: 200, rocks: 26, flowers: 70, fogFar: 320, far: 420,
  },
};

export const ORDER = ["leve", "medio", "alto"];

function autoDetect() {
  const mem = navigator.deviceMemory;          // Chrome/Android
  const cores = navigator.hardwareConcurrency || 4;
  if (mem !== undefined) {
    if (mem <= 2) return "leve";
    if (mem <= 4) return "medio";
    return "alto";
  }
  // iOS não expõe deviceMemory — usa núcleos como pista
  if (cores <= 4) return "medio";
  return "alto";
}

export function getQuality() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && PRESETS[saved]) return saved;
  } catch { /* ok */ }
  return autoDetect();
}

export function setQuality(name) {
  try { localStorage.setItem(KEY, name); } catch { /* ok */ }
}

export function cycleQuality() {
  const cur = getQuality();
  const next = ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length];
  setQuality(next);
  return next;
}
