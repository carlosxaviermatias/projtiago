/* ============================================================
   Safári Fotográfico 3D · evaluate.js
   Nota 0–100 da foto com feedback por critério (mesma didática
   do FotoQuest 2D, adaptada ao 3D em primeira pessoa).
   ============================================================ */

export const SCENE_EV = 12;          // hora dourada

export const ISOS = [100, 200, 400, 800, 1600, 3200];
export const FS = [1.8, 2.8, 4, 5.6, 8, 11, 16];
export const TS = [
  { v: 1 / 15, label: "1/15" }, { v: 1 / 30, label: "1/30" }, { v: 1 / 60, label: "1/60" },
  { v: 1 / 125, label: "1/125" }, { v: 1 / 250, label: "1/250" }, { v: 1 / 500, label: "1/500" },
  { v: 1 / 1000, label: "1/1000" }, { v: 1 / 2000, label: "1/2000" },
];
export const LENSES = [
  { id: "wide", label: "Wide 24mm", fov: 72, reach: 0.7 },
  { id: "normal", label: "Normal 50mm", fov: 46, reach: 1 },
  { id: "tele", label: "Tele 200mm", fov: 14, reach: 2.6 },
];

export function exposureStops(sceneEV, iso, f, t) {
  return sceneEV + Math.log2(iso / 100) - Math.log2((f * f) / t);
}

const CI = {
  exposicao: {
    label: "Exposição", icon: "☀️", module: "Módulo 1 · Triângulo da exposição",
    good: "Exposição no ponto — a luz dourada rendeu!",
    dark: "Escura: abra a abertura, desça a velocidade ou suba o ISO.",
    bright: "Estourada: feche a abertura, suba a velocidade ou baixe o ISO.",
  },
  movimento: {
    label: "Movimento", icon: "🏃", module: "Módulo 1 · Velocidade do obturador",
    good: "Movimento congelado!",
    blur: "Borrada: esse alvo pede velocidade mais alta.",
    shake: "Tremida: abaixo de 1/30 na mão, tudo borra.",
  },
  enquadramento: {
    label: "Composição", icon: "▦", module: "Módulo 1 · Regra dos terços",
    good: "Regra dos terços aplicada!",
    center: "Muito central: leve o assunto a um ponto forte da grade.",
    out: "O assunto ficou fora do quadro.",
  },
  profundidade: {
    label: "Foco & DOF", icon: "🎯", module: "Módulo 1 · Profundidade de campo",
    good: "Foco cravado e profundidade ideal!",
    focus: "Fora de foco: ajuste a distância de foco até o alvo.",
    dof: "Abertura errada: retrato pede f baixo; paisagem, f alto.",
  },
  lente: {
    label: "Lente & distância", icon: "📏", module: "Módulo 1 · Tipos de objetivas",
    good: "Distância e lente certas!",
    far: "Longe demais: aproxime-se ou use a teleobjetiva.",
    near: "Perto demais: afaste-se ou use a wide.",
  },
  ruido: {
    label: "Ruído", icon: "🌫️", module: "Módulo 2 · Fotografia noturna",
    warn: "ISO alto à luz do dia = ruído à toa. Baixe o ISO.",
  },
};
export const CRITERIA_INFO = CI;

export const STARS = [
  { min: 95, stars: 5, title: "Obra-prima!" },
  { min: 85, stars: 4, title: "Excelente!" },
  { min: 70, stars: 3, title: "Muito boa!" },
  { min: 40, stars: 2, title: "Quase lá…" },
  { min: 0, stars: 1, title: "Continue tentando!" },
];

/**
 * @param {object} p  {target, dist, ndc:{x,y}|null, settings:{iso,f,t,lens,focus}}
 */
export function evaluate(p) {
  const { target, dist, ndc, settings: s } = p;
  const breakdown = [];
  let score = 0;

  /* exposição (30) */
  const stops = exposureStops(SCENE_EV + (target?.def.lightMod || 0), s.iso, s.f, s.t);
  const err = Math.max(0, Math.abs(stops) - 0.6);
  const expPts = Math.round(30 * Math.max(0, 1 - err / 2.5));
  breakdown.push({
    key: "exposicao", pts: expPts, max: 30, ok: expPts >= 22,
    msg: expPts >= 22 ? CI.exposicao.good : stops < 0 ? CI.exposicao.dark : CI.exposicao.bright,
  });
  score += expPts;

  /* movimento (20) */
  const shake = s.t > 1 / 30 + 1e-9;
  const need = target?.def.motion === "fast" ? 1 / 500 : target?.def.motion === "slow" ? 1 / 125 : Infinity;
  let movPts = 20, movMsg = CI.movimento.good;
  if (s.t > need + 1e-9) { movPts = Math.max(0, Math.round(20 * (need / s.t))); movMsg = CI.movimento.blur; }
  if (shake) { movPts = Math.min(movPts, 5); movMsg = CI.movimento.shake; }
  if ((target?.def.motion || "still") === "still" && !shake) { movPts = 20; movMsg = "Assunto parado, câmera firme."; }
  breakdown.push({ key: "movimento", pts: movPts, max: 20, ok: movPts >= 15, msg: movMsg });
  score += movPts;

  /* composição (20) — ndc: -1..1 (null = fora do quadro) */
  let framePts = 0, frameMsg = CI.enquadramento.out;
  if (ndc) {
    const nx = (ndc.x + 1) / 2, ny = (1 - ndc.y) / 2;
    const pts3 = [[1 / 3, 1 / 3], [2 / 3, 1 / 3], [1 / 3, 2 / 3], [2 / 3, 2 / 3]];
    const d = Math.min(...pts3.map(([px, py]) => Math.hypot(nx - px, ny - py)));
    framePts = Math.round(20 * Math.max(0, 1 - d * 2.4));
    frameMsg = framePts >= 15 ? CI.enquadramento.good : CI.enquadramento.center;
  }
  breakdown.push({ key: "enquadramento", pts: framePts, max: 20, ok: framePts >= 15, msg: frameMsg });
  score += framePts;

  /* foco & DOF (15) */
  const focusTol = Math.max(1.2, dist * 0.16) * (s.f / 5.6 + 0.55);
  const focusOk = target ? Math.abs(dist - s.focus) <= focusTol : false;
  let dofPts = 0, dofMsg = CI.profundidade.focus;
  if (focusOk) {
    const want = target?.def.wantsShallowDOF ? "shallow" : target?.def.wantsDeepDOF ? "deep" : "any";
    const got = s.f <= 2.9 ? "shallow" : s.f >= 8 ? "deep" : "mid";
    const dofOk = want === "any" || want === got;
    dofPts = dofOk ? 15 : 8;
    dofMsg = dofOk ? CI.profundidade.good : CI.profundidade.dof;
  }
  breakdown.push({ key: "profundidade", pts: dofPts, max: 15, ok: dofPts >= 12, msg: dofMsg });
  score += dofPts;

  /* lente & distância (15) */
  let lensPts = 0, lensMsg = CI.lente.far;
  if (target) {
    const [dMin, dMax] = target.def.idealDistance;
    const eff = dist / p.settings.lensReach;
    if (eff >= dMin && eff <= dMax) { lensPts = 15; lensMsg = CI.lente.good; }
    else if (eff > dMax) { lensPts = Math.max(0, Math.round(15 - (eff - dMax) * 0.8)); lensMsg = CI.lente.far; }
    else { lensPts = Math.max(0, Math.round(15 - (dMin - eff) * 4)); lensMsg = CI.lente.near; }
  }
  breakdown.push({ key: "lente", pts: lensPts, max: 15, ok: lensPts >= 12, msg: lensMsg });
  score += lensPts;

  /* ruído (penalidade em pleno dia) */
  if (s.iso >= 1600) {
    const n = s.iso >= 3200 ? 8 : 4;
    score -= n;
    breakdown.push({ key: "ruido", pts: -n, max: 0, ok: false, msg: CI.ruido.warn });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const stars = STARS.find((r) => score >= r.min);
  return { score, stars, breakdown, stops, focusOk, shake, tooSlow: s.t > need };
}
