/* ============================================================
   FotoQuest · data/equipment.js
   Equipamentos declarativos. `caps` limita/estende os controles
   do modo câmera. Novos itens: basta adicionar aqui.
   ============================================================ */

export const EQUIPMENT = {
  /* ---------- câmeras ---------- */
  cam_basica: {
    type: "camera", name: "Câmera do celular", icon: "📱", price: 0,
    desc: "Sua fiel companheira. ISO até 800.",
    caps: { isoMax: 800 },
  },
  cam_semi: {
    type: "camera", name: "Semiprofissional", icon: "📷", price: 350,
    desc: "Sensor maior: ISO até 3200 com menos ruído.",
    caps: { isoMax: 3200, noiseBonus: 1 },
  },
  cam_pro: {
    type: "camera", name: "Profissional Full-Frame", icon: "🎥", price: 900,
    desc: "O sonho: ISO 6400 utilizável e disparo silencioso.",
    caps: { isoMax: 6400, noiseBonus: 2, silent: true },
  },

  /* ---------- lentes ---------- */
  lente_normal: {
    type: "lens", name: "Lente normal (35mm)", icon: "🔘", price: 0,
    desc: "Versátil. Vê o mundo como o olho humano.",
    caps: { fMin: 3.5, reach: 1, zoom: 1 },
  },
  lente_50: {
    type: "lens", name: "50mm f/1.8", icon: "⭕", price: 180,
    desc: "A queridinha do retrato: abre até f/1.8 e desfoca o fundo.",
    caps: { fMin: 1.8, reach: 1.2, zoom: 1.15 },
  },
  lente_wide: {
    type: "lens", name: "Grande angular (16mm)", icon: "🌐", price: 220,
    desc: "Abraça a paisagem inteira. Ideal de perto.",
    caps: { fMin: 2.8, reach: 0.7, zoom: 0.7 },
  },
  lente_tele: {
    type: "lens", name: "Teleobjetiva (200mm)", icon: "🔭", price: 420,
    desc: "Aproxima o que está longe — essencial p/ vida selvagem.",
    caps: { fMin: 4, reach: 2.6, zoom: 2.4 },
  },

  /* ---------- acessórios ---------- */
  flash: {
    type: "flash", name: "Flash externo", icon: "⚡", price: 250,
    desc: "+2 pontos de luz em ambientes escuros (ligue no modo câmera).",
    caps: { evBonus: 2 },
  },
  tripe: {
    type: "tripod", name: "Tripé", icon: "🗼", price: 200,
    desc: "Estabilidade total: longa exposição sem tremer.",
    caps: { steady: true },
  },
};

export const SLOT_NAMES = { camera: "Câmera", lens: "Lente", flash: "Flash", tripod: "Tripé" };

/** Junta as capacidades do conjunto equipado. */
export function combinedCaps(equipped) {
  const caps = { isoMax: 800, fMin: 3.5, reach: 1, zoom: 1, evBonus: 0, steady: false, noiseBonus: 0 };
  for (const slot of ["camera", "lens", "flash", "tripod"]) {
    const it = EQUIPMENT[equipped[slot]];
    if (it) Object.assign(caps, it.caps);
  }
  // flash/tripé só contribuem com suas próprias chaves
  caps.evBonus = EQUIPMENT[equipped.flash]?.caps.evBonus || 0;
  caps.steady = !!EQUIPMENT[equipped.tripod]?.caps.steady;
  caps.isoMax = EQUIPMENT[equipped.camera]?.caps.isoMax || 800;
  caps.noiseBonus = EQUIPMENT[equipped.camera]?.caps.noiseBonus || 0;
  caps.fMin = EQUIPMENT[equipped.lens]?.caps.fMin ?? 3.5;
  caps.reach = EQUIPMENT[equipped.lens]?.caps.reach ?? 1;
  caps.zoom = EQUIPMENT[equipped.lens]?.caps.zoom ?? 1;
  return caps;
}
