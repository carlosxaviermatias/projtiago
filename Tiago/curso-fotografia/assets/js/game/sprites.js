/* ============================================================
   FotoQuest · sprites.js
   Pixel art 100% procedural (sem assets externos).
   - Personagens: template 16×16 parametrizado por cores
     (pele/cabelo/camisa/calça) gerando 4 direções × 2 quadros.
   - Tiles e props: desenhados por funções ou matrizes.
   Tudo é "assado" uma vez em canvases offscreen (renderer.bake).
   ============================================================ */

import { bake, bakeTile, TILE } from "./renderer.js?v=8";

/* ---------- template humano (16×16) ----------
   H cabelo · S pele · T camisa · P calça · B sapato · O contorno
   C câmera (opcional) · . transparente                       */

const HUMAN = {
  down: [
    [
      "....HHHHHHHH....",
      "...HHHHHHHHHH...",
      "...HHSSSSSSHH...",
      "...HSSSSSSSSH...",
      "...HSOSSSSOSH...",
      "...HSSSSSSSSH...",
      "....SSSOOSSS....",
      ".....SSSSSS.....",
      "...TTTTTTTTTT...",
      "..TTTTTTTTTTTT..",
      "..STTTTTTTTTTS..",
      "..STTTTTTTTTTS..",
      "...PPPPPPPPPP...",
      "...PPP....PPP...",
      "...PPP....PPP...",
      "...BBB....BBB...",
    ],
    [
      "....HHHHHHHH....",
      "...HHHHHHHHHH...",
      "...HHSSSSSSHH...",
      "...HSSSSSSSSH...",
      "...HSOSSSSOSH...",
      "...HSSSSSSSSH...",
      "....SSSOOSSS....",
      ".....SSSSSS.....",
      "...TTTTTTTTTT...",
      "..TTTTTTTTTTTT..",
      "..STTTTTTTTTTS..",
      "..STTTTTTTTTTS..",
      "...PPPPPPPPPP...",
      "....PPP..PPP....",
      "..PPP......PPP..",
      "..BBB......BBB..",
    ],
  ],
  up: [
    [
      "....HHHHHHHH....",
      "...HHHHHHHHHH...",
      "...HHHHHHHHHH...",
      "...HHHHHHHHHH...",
      "...HHHHHHHHHH...",
      "...HHHHHHHHHH...",
      "....HHHHHHHH....",
      ".....SSSSSS.....",
      "...TTTTTTTTTT...",
      "..TTTTTTTTTTTT..",
      "..STTTTTTTTTTS..",
      "..STTTTTTTTTTS..",
      "...PPPPPPPPPP...",
      "...PPP....PPP...",
      "...PPP....PPP...",
      "...BBB....BBB...",
    ],
    [
      "....HHHHHHHH....",
      "...HHHHHHHHHH...",
      "...HHHHHHHHHH...",
      "...HHHHHHHHHH...",
      "...HHHHHHHHHH...",
      "...HHHHHHHHHH...",
      "....HHHHHHHH....",
      ".....SSSSSS.....",
      "...TTTTTTTTTT...",
      "..TTTTTTTTTTTT..",
      "..STTTTTTTTTTS..",
      "..STTTTTTTTTTS..",
      "...PPPPPPPPPP...",
      "....PPP..PPP....",
      "..PPP......PPP..",
      "..BBB......BBB..",
    ],
  ],
  side: [ // olhando para a direita; esquerda = espelhado
    [
      "....HHHHHHHH....",
      "...HHHHHHHHHH...",
      "...HHHSSSSSS....",
      "...HHSSSSSSSS...",
      "...HHSSSOSSSS...",
      "...HHSSSSSSSS...",
      "....HSSSOOSS....",
      ".....SSSSSS.....",
      "....TTTTTTTT....",
      "...TTTTTTTTTT...",
      "...TTTTTTTTSS...",
      "...TTTTTTTTSS...",
      "....PPPPPPPP....",
      "....PPPPPPPP....",
      "....PPP.PPP.....",
      "....BBB.BBB.....",
    ],
    [
      "....HHHHHHHH....",
      "...HHHHHHHHHH...",
      "...HHHSSSSSS....",
      "...HHSSSSSSSS...",
      "...HHSSSOSSSS...",
      "...HHSSSSSSSS...",
      "....HSSSOOSS....",
      ".....SSSSSS.....",
      "....TTTTTTTT....",
      "...TTTTTTTTTT...",
      "...TTTTTTTTSS...",
      "...TTTTTTTTSS...",
      "....PPPPPPPP....",
      "...PPPP..PPP....",
      "..PPP.....PPP...",
      "..BBB.....BBB...",
    ],
  ],
};

/** Cria as 8 imagens (down/up/right/left × 2 quadros) de um personagem. */
export function makePerson(id, colors) {
  const pal = {
    H: colors.hair, S: colors.skin, T: colors.shirt,
    P: colors.pants, B: colors.shoes || "#22242c", O: "#1a1205",
  };
  const frames = { down: [], up: [], right: [], left: [] };
  for (let f = 0; f < 2; f++) {
    frames.down.push(bake(`${id}-d${f}`, HUMAN.down[f], pal));
    frames.up.push(bake(`${id}-u${f}`, HUMAN.up[f], pal));
    frames.right.push(bake(`${id}-r${f}`, HUMAN.side[f], pal));
    frames.left.push(mirror(`${id}-l${f}`, frames.right[f]));
  }
  return frames;
}

function mirror(key, img) {
  const cv = document.createElement("canvas");
  cv.width = img.width; cv.height = img.height;
  const c = cv.getContext("2d");
  c.translate(img.width, 0); c.scale(-1, 1);
  c.drawImage(img, 0, 0);
  return cv;
}

/* ---------- paletas de personagens ---------- */
export const PEOPLE = {
  player:   { skin: "#e8b88a", hair: "#3a2a1c", shirt: "#f4b03e", pants: "#2c3e50" },
  prof:     { skin: "#8a5a34", hair: "#111111", shirt: "#5ec8c0", pants: "#3d3d4d" },
  fotografo:{ skin: "#e8b88a", hair: "#666677", shirt: "#22242c", pants: "#44465a" },
  modelo:   { skin: "#c98d5e", hair: "#151515", shirt: "#e8736b", pants: "#efe6da" },
  cliente:  { skin: "#f0c9a0", hair: "#8a4a20", shirt: "#5aa6e8", pants: "#22242c" },
  organizador:{ skin: "#8a5a34", hair: "#2a2a2a", shirt: "#8e7cc3", pants: "#2c3e50" },
  noiva:    { skin: "#f0c9a0", hair: "#6a4a2a", shirt: "#f6f3ee", pants: "#f6f3ee" },
  noivo:    { skin: "#c98d5e", hair: "#151515", shirt: "#1d1f27", pants: "#1d1f27" },
  musico:   { skin: "#e8b88a", hair: "#c0392b", shirt: "#151515", pants: "#3a2a5a" },
  crianca:  { skin: "#e8b88a", hair: "#d4a017", shirt: "#58c08b", pants: "#365a8c" },
  guia:     { skin: "#8a5a34", hair: "#444433", shirt: "#7a8c4e", pants: "#5a4a34" },
};

/* ---------- props e alvos (matrizes) ---------- */

const PROPS = {
  bird: {
    pal: { B: "#5aa6e8", W: "#3d7ec4", K: "#f4b03e", E: "#111", C: "#dce8f4" },
    rows: [
      "................", "................", "................", "................",
      ".......BBB......", "......BBBBB.....", ".....BBBEBB.....", "....WBBBBBBK....",
      "...WWWBBBBB.....", "...WWWWBCCB.....", "....WWBCCCB.....", ".....BBCCB......",
      "......BBB.......", ".......KK.......", "......K..K......", "................",
    ],
  },
  dog: {
    pal: { D: "#a97c50", L: "#8a6238", E: "#111", N: "#222", T: "#c9a06e" },
    rows: [
      "................", "................", "................", "..DD............",
      "..DDD...........", "..DEDD..........", "..DDDDN.........", "...DDDD.........",
      "....DDDDDDDDD...", "....DDDDDDDDDD..", "....LDDDDDDDLT..", "....LDDDDDDDL...",
      "....LD.....LD...", "....LD.....LD...", "....LL.....LL...", "................",
    ],
  },
  cat: {
    pal: { D: "#4a4a55", E: "#f4b03e", N: "#e8736b", L: "#33333d" },
    rows: [
      "................", "................", "................", "................",
      "....D...D.......", "....DD.DD.......", "....DDDDD.......", "....DEDED.......",
      "....DDNDD....D..", ".....DDDDDDDDD..", "....DDDDDDDDD...", "....DDDDDDDD....",
      "....LD....LD....", "....LD....LD....", "....LL....LL....", "................",
    ],
  },
  flower: {
    pal: { F: "#e8736b", C: "#f4b03e", G: "#4e7a3a", L: "#5e8c4a" },
    rows: [
      "................", "................", "................", "......FF........",
      ".....FFFF.......", "....FFCCFF......", "....FFCCFF......", ".....FFFF.......",
      "......FF........", "......GG........", "......GG...L....", "..L...GG..LL....",
      "..LL..GG.LL.....", "...LL.GGLL......", "....LLGGL.......", ".....GGG........",
    ],
  },
  statue: {
    pal: { S: "#9aa3b2", D: "#7a8394", B: "#5a6374" },
    rows: [
      "................", "......SSS.......", ".....SSSSS......", ".....SDSDS......",
      ".....SSSSS......", "......SSS.......", ".....SSSSS......", "....SSSSSSS.....",
      "....SSSSSSS.....", ".....SSSSS......", ".....SSSSS......", "....BBBBBBB.....",
      "...BBBBBBBBB....", "..BBBBBBBBBBB...", "..BBBBBBBBBBB...", "................",
    ],
  },
  boat: {
    pal: { W: "#8a5a34", V: "#f6f3ee", M: "#5a4a34", L: "#6a4a28" },
    rows: [
      "................", "........M.......", "........M.......", ".....VVVM.......",
      "....VVVVM.......", "...VVVVVM.......", "..VVVVVVM.......", ".....VVVM.......",
      "........M.......", "..W..........W..", "..WWWWWWWWWWWW..", "...WLWWWWWWLW...",
      "....WWWWWWWW....", ".....WWWWWW.....", "................", "................",
    ],
  },
  guitar: {
    pal: { G: "#c0392b", N: "#8a5a34", S: "#eef0f4", D: "#7a2318" },
    rows: [
      "................", "..........NN....", ".........NN.....", "........NN......",
      ".......NN.......", "......SS........", ".....GGGG.......", "....GGGGGG......",
      "...GGGDDGGG.....", "...GGDDDDGG.....", "...GGGDDGGG.....", "....GGGGGG......",
      ".....GGGG.......", "................", "................", "................",
    ],
  },
  cake: {
    pal: { W: "#f6f3ee", P: "#e8a0b4", C: "#f4b03e", B: "#d9c8b4" },
    rows: [
      "................", "................", ".......C........", ".......C........",
      "......WWW.......", "......WWW.......", ".....PPPPP......", ".....WWWWW......",
      "....PPPPPPP.....", "....WWWWWWW.....", "...PPPPPPPPP....", "...WWWWWWWWW....",
      "..BBBBBBBBBBB...", "..BBBBBBBBBBB...", "................", "................",
    ],
  },
  butterfly: {
    pal: { A: "#f4b03e", B: "#e8736b", K: "#222" },
    rows: [
      "................", "................", "................", "................",
      "................", "....AA...AA.....", "...AAAA.AAAA....", "...AABKKKBAA....",
      "...ABBKKKBBA....", "....AA.K.AA.....", "........K.......", "................",
      "................", "................", "................", "................",
    ],
  },
  deer: {
    pal: { D: "#a97c50", L: "#8a6238", E: "#111", A: "#6a4a28", W: "#e8d8c4" },
    rows: [
      "....A...A.......", "....AA.AA.......", ".....A.A........", "....DDDDD.......",
      "....DEDDD.......", "....DDDDD.......", ".....DDD........", ".....DDDDDDDD...",
      "....DDDDDDDDDD..", "....DDDDDDDDWW..", "....LDDDDDDDL...", "....LD.....LD...",
      "....LD.....LD...", "....LD.....LD...", "....LL.....LL...", "................",
    ],
  },
  lamp: {
    pal: { P: "#33353f", L: "#ffd17a", G: "#f4b03e" },
    rows: [
      "......GGG.......", ".....GLLLG......", ".....GLLLG......", "......GGG.......",
      ".......P........", ".......P........", ".......P........", ".......P........",
      ".......P........", ".......P........", ".......P........", ".......P........",
      ".......P........", "......PPP.......", ".....PPPPP......", "................",
    ],
  },
  softbox: {
    pal: { P: "#33353f", L: "#f6f3ee", D: "#22242c" },
    rows: [
      "..LLLLLL........", "..LLLLLL........", "..LLLLLL........", "..LLLLLL........",
      "..DDDDDD........", ".....P..........", ".....P..........", ".....P..........",
      ".....P..........", ".....P..........", ".....P..........", ".....P..........",
      "....P.P.........", "...P...P........", "..P.....P.......", "................",
    ],
  },
  tripodProp: {
    pal: { P: "#44465a", C: "#22242c" },
    rows: [
      "................", "......CCC.......", "......CCC.......", ".......P........",
      ".......P........", ".......P........", ".......P........", "......P.P.......",
      "......P.P.......", ".....P...P......", ".....P...P......", "....P.....P.....",
      "....P.....P.....", "...P.......P....", "...P.......P....", "................",
    ],
  },
  car: {
    pal: { C: "#c0392b", D: "#7a2318", G: "#8ec4e8", W: "#22242c", L: "#ffd17a" },
    rows: [
      "................", "................", "................", "................",
      "................", "....CCCCCC......", "...CGGCCGGC.....", "..CCGGCCGGCC....",
      ".CCCCCCCCCCCCL..", ".CCCCCCCCCCCCC..", ".DCCCCCCCCCCCD..", "..WW......WW....",
      ".WWWW....WWWW...", "..WW......WW....", "................", "................",
    ],
  },
  skyline: {
    pal: { B: "#2a2c3a", D: "#1d1f2b", L: "#ffd17a", N: "#5ec8c0" },
    rows: [
      "......B.........", "......B....D....", "..B...B....D....", "..B..BBB...DD...",
      "..BB.BLB.D.DL...", "..BL.BBB.D.DD...", "..BB.BLB.DDDL...", "..BL.BBB.DLDD...",
      ".BBB.BLB.DDDL...", ".BLB.BBBNDLDD...", ".BBB.BLBNDDDL...", ".BLBBBBBNDLDD...",
      ".BBBBBLBNDDDL...", ".BLBBBBBNDLDD...", "BBBBBBBBBBBBBB..", "................",
    ],
  },
  waterfall: {
    pal: { W: "#c8e4f4", B: "#8ec4e8", D: "#2a5a8c", R: "#5a6374" },
    rows: [
      "R.WWBWWB.R......", "R.WBWWBW.R......", "R.WWBWWB.R......", "R.WBWWBW.R......",
      "R.WWBWWB.R......", "R.WBWWBW.R......", "R.WWBWWB.R......", "R.WBWWBW.R......",
      "R.WWBWWB.R......", "R.WBWWBW.R......", "RRWWBWWBRR......", ".DWWWWWWD.......",
      ".DWBWWBWD.......", "..DDDDDD........", "................", "................",
    ],
  },
  camIcon: {
    pal: { C: "#22242c", L: "#5aa6e8", A: "#f4b03e", D: "#44465a" },
    rows: [
      "................", "................", "................", "....AA..........",
      "...CCCCCCCCCC...", "..CCCCCCCCCCCC..", "..CCDLLLLDCCCC..", "..CCLLLLLLCCCC..",
      "..CCLLLLLLCCAC..", "..CCLLLLLLCCCC..", "..CCDLLLLDCCCC..", "..CCCCCCCCCCCC..",
      "...CCCCCCCCCC...", "................", "................", "................",
    ],
  },
  /* ---------- fases 11–20 ---------- */
  plate: {
    pal: { P: "#e0dcd2", W: "#f6f3ee", F: "#e8a05a", G: "#6f9a4a" },
    rows: [
      "................", "................", "................", "....PPPPPPPP....",
      "...PPWWWWWWPP...", "..PPWWFFFFWWPP..", "..PWWFFGGFFWWP..", "..PWWFFGGFFWWP..",
      "..PPWWFFFFWWPP..", "...PPWWWWWWPP...", "....PPPPPPPP....", "................",
      "................", "................", "................", "................",
    ],
  },
  mug: {
    pal: { M: "#f6f3ee", C: "#6b4a32", H: "#e0dcd2" },
    rows: [
      "................", "................", "................", "................",
      ".....MMMMMM.....", "....MMMMMMMM....", "....MMCCCCMM.HH.", "....MMCCCCMMHHH.",
      "....MMCCCCMM.HH.", "....MMMMMMMM....", ".....MMMMMM.....", "......MMMM......",
      "................", "................", "................", "................",
    ],
  },
  ball: {
    pal: { W: "#f6f3ee", K: "#22242c" },
    rows: [
      "................", "................", "................", "................",
      "......WWWW......", "....WWKKKKWW....", "...WWKKWWKKWW...", "...WKKWWWWKKW...",
      "...WKKWWWWKKW...", "...WWKKWWKKWW...", "....WWKKKKWW....", "......WWWW......",
      "................", "................", "................", "................",
    ],
  },
  monitor: {
    pal: { K: "#2b2e38", S: "#5aa6e8", A: "#f4b03e" },
    rows: [
      "................", "................", "..KKKKKKKKKKKK..", "..KSSSSSSSSSSK..",
      "..KSAAAASSSSSK..", "..KSAAAASSSSSK..", "..KSSSSSSSSSSK..", "..KSSSSSSSSSSK..",
      "..KKKKKKKKKKKK..", "......KKKK......", "......KKKK......", "....KKKKKKKK....",
      "................", "................", "................", "................",
    ],
  },
  frameArt: {
    pal: { C: "#c9962f", W: "#f6f3ee", S: "#8a8f9c", A: "#3d5a80" },
    rows: [
      "................", "..CCCCCCCCCCCC..", "..CWWWWWWWWWWC..", "..CWSSSSSSSSWC..",
      "..CWSAAAAAASWC..", "..CWSAAAAAASWC..", "..CWSAAAAAASWC..", "..CWSSSSSSSSWC..",
      "..CWWWWWWWWWWC..", "..CCCCCCCCCCCC..", "................", "................",
      "................", "................", "................", "................",
    ],
  },
  mushroom: {
    pal: { R: "#c0453d", W: "#f6f3ee", S: "#e8e0cf", G: "#4e7a3a" },
    rows: [
      "................", "................", "................", ".....RRRRRR.....",
      "....RRWRRWRR....", "...RRRRRRRRRR...", "...RRRRRRRRRR...", "....RRRRRRRR....",
      "......SSSS......", "......SSSS......", "......SSSS......", ".....SSSSSS.....",
      "....GGGGGGGG....", "................", "................", "................",
    ],
  },
};

export function makeProp(name) {
  const p = PROPS[name];
  if (!p) return null;
  return bake(`prop-${name}`, p.rows, p.pal);
}

/* ---------- tiles procedurais ---------- */

function noiseDots(c, size, color, n, seed) {
  c.fillStyle = color;
  let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 16807) % 2147483647;
    const x = s % size; s = (s * 16807) % 2147483647;
    const y = s % size;
    c.fillRect(x, y, 3, 3);
  }
}

export const TILES = {
  grass:  () => bakeTile("t-grass", (c, s) => { c.fillStyle = "#3e6b34"; c.fillRect(0, 0, s, s); noiseDots(c, s, "#4e7a3a", 14, 7); noiseDots(c, s, "#35592c", 8, 13); }),
  grassDark: () => bakeTile("t-grassD", (c, s) => { c.fillStyle = "#2e5026"; c.fillRect(0, 0, s, s); noiseDots(c, s, "#3a6030", 12, 5); }),
  floor:  () => bakeTile("t-floor", (c, s) => { c.fillStyle = "#8a8f9c"; c.fillRect(0, 0, s, s); c.strokeStyle = "#7a7f8c"; c.lineWidth = 2; c.strokeRect(1, 1, s - 2, s - 2); }),
  floorDark: () => bakeTile("t-floorD", (c, s) => { c.fillStyle = "#565b68"; c.fillRect(0, 0, s, s); c.strokeStyle = "#4a4f5c"; c.lineWidth = 2; c.strokeRect(1, 1, s - 2, s - 2); }),
  wood:   () => bakeTile("t-wood", (c, s) => { c.fillStyle = "#8a5a34"; c.fillRect(0, 0, s, s); c.fillStyle = "#7a4e2c"; for (let i = 0; i < 4; i++) c.fillRect(0, i * 12 + 4, s, 2); }),
  wall:   () => bakeTile("t-wall", (c, s) => {
    c.fillStyle = "#33353f"; c.fillRect(0, 0, s, s);
    c.fillStyle = "#3d3f4b";
    for (let r = 0; r < 4; r++) for (let b = 0; b < 2; b++) c.fillRect(((r % 2) * 24 + b * 48) % s - 12, r * 12, 22, 10);
    c.fillStyle = "#22242c"; c.fillRect(0, s - 4, s, 4);
  }),
  brick:  () => bakeTile("t-brick", (c, s) => {
    c.fillStyle = "#7a4a3a"; c.fillRect(0, 0, s, s);
    c.fillStyle = "#8a5a46";
    for (let r = 0; r < 4; r++) for (let b = 0; b < 2; b++) c.fillRect(((r % 2) * 24 + b * 48) % s - 12, r * 12, 22, 10);
  }),
  water:  () => bakeTile("t-water", (c, s) => { c.fillStyle = "#2a5a8c"; c.fillRect(0, 0, s, s); c.strokeStyle = "#3d7ec4"; c.lineWidth = 2; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(4, 10 + i * 16); c.quadraticCurveTo(12, 6 + i * 16, 22, 10 + i * 16); c.quadraticCurveTo(32, 14 + i * 16, 42, 10 + i * 16); c.stroke(); } }),
  sand:   () => bakeTile("t-sand", (c, s) => { c.fillStyle = "#e0c48a"; c.fillRect(0, 0, s, s); noiseDots(c, s, "#d4b478", 14, 9); noiseDots(c, s, "#eed49c", 8, 3); }),
  path:   () => bakeTile("t-path", (c, s) => { c.fillStyle = "#b0a080"; c.fillRect(0, 0, s, s); noiseDots(c, s, "#a09070", 12, 11); }),
  road:   () => bakeTile("t-road", (c, s) => { c.fillStyle = "#3a3c46"; c.fillRect(0, 0, s, s); noiseDots(c, s, "#44465a", 8, 17); }),
  roadLine: () => bakeTile("t-roadL", (c, s) => { c.fillStyle = "#3a3c46"; c.fillRect(0, 0, s, s); c.fillStyle = "#f4b03e"; c.fillRect(s / 2 - 3, 4, 6, 16); c.fillRect(s / 2 - 3, 30, 6, 16); }),
  tree:   () => bakeTile("t-tree", (c, s) => {
    c.fillStyle = "#3e6b34"; c.fillRect(0, 0, s, s); noiseDots(c, s, "#4e7a3a", 10, 7);
    c.fillStyle = "#6a4a28"; c.fillRect(s / 2 - 4, s - 16, 8, 14);
    c.fillStyle = "#2c4a22"; c.beginPath(); c.arc(s / 2, s / 2 - 6, 17, 0, 7); c.fill();
    c.fillStyle = "#3a6030"; c.beginPath(); c.arc(s / 2 - 5, s / 2 - 10, 10, 0, 7); c.fill();
  }),
  pine:   () => bakeTile("t-pine", (c, s) => {
    c.fillStyle = "#2e5026"; c.fillRect(0, 0, s, s);
    c.fillStyle = "#6a4a28"; c.fillRect(s / 2 - 3, s - 12, 6, 10);
    c.fillStyle = "#1d3a18";
    for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(s / 2, 2 + i * 10); c.lineTo(s / 2 - 14 + i * 2, 18 + i * 10); c.lineTo(s / 2 + 14 - i * 2, 18 + i * 10); c.fill(); }
  }),
  rock:   () => bakeTile("t-rock", (c, s) => { c.fillStyle = "#3e6b34"; c.fillRect(0, 0, s, s); c.fillStyle = "#7a8394"; c.beginPath(); c.moveTo(8, s - 10); c.lineTo(14, 14); c.lineTo(28, 8); c.lineTo(40, 20); c.lineTo(38, s - 10); c.fill(); c.fillStyle = "#9aa3b2"; c.fillRect(16, 16, 10, 6); }),
  stage:  () => bakeTile("t-stage", (c, s) => { c.fillStyle = "#2a1d3a"; c.fillRect(0, 0, s, s); c.fillStyle = "#3a2a5a"; c.fillRect(0, 0, s, 6); }),
  carpet: () => bakeTile("t-carpet", (c, s) => { c.fillStyle = "#7a2334"; c.fillRect(0, 0, s, s); c.strokeStyle = "#f4b03e"; c.lineWidth = 2; c.strokeRect(4, 4, s - 8, s - 8); }),
  table:  () => bakeTile("t-table", (c, s) => { c.fillStyle = "#565b68"; c.fillRect(0, 0, s, s); c.fillStyle = "#f6f3ee"; c.fillRect(4, 4, s - 8, s - 8); c.fillStyle = "#e8dcc8"; c.fillRect(4, 4, s - 8, 6); }),
  window: () => bakeTile("t-window", (c, s) => { c.fillStyle = "#33353f"; c.fillRect(0, 0, s, s); c.fillStyle = "#8ec4e8"; c.fillRect(6, 6, s - 12, s - 12); c.fillStyle = "#c8e4f4"; c.beginPath(); c.moveTo(8, s - 8); c.lineTo(s - 8, 8); c.lineTo(s - 14, 8); c.lineTo(8, s - 14); c.fill(); c.strokeStyle = "#22242c"; c.lineWidth = 3; c.strokeRect(6, 6, s - 12, s - 12); }),
  backdrop: () => bakeTile("t-backdrop", (c, s) => { c.fillStyle = "#d9d2c4"; c.fillRect(0, 0, s, s); c.fillStyle = "#cfc6b4"; c.fillRect(0, 0, s, 8); }),
  night:  () => bakeTile("t-night", (c, s) => { c.fillStyle = "#14161f"; c.fillRect(0, 0, s, s); noiseDots(c, s, "#1d2030", 10, 21); }),
  building: () => bakeTile("t-building", (c, s) => {
    c.fillStyle = "#22242e"; c.fillRect(0, 0, s, s);
    c.fillStyle = "#ffd17a";
    for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) if ((x + y * 3 + 1) % 3) c.fillRect(6 + x * 14, 6 + y * 14, 8, 8);
  }),
  neon: () => bakeTile("t-neon", (c, s) => {
    c.fillStyle = "#22242e"; c.fillRect(0, 0, s, s);
    c.fillStyle = "#e8736b"; c.fillRect(4, 8, s - 8, 10);
    c.fillStyle = "#5ec8c0"; c.fillRect(4, 26, s - 8, 10);
  }),
};

/** Instancia todos os tiles de uma vez (chamar no boot). */
export function bakeAllTiles() {
  const out = {};
  for (const k of Object.keys(TILES)) out[k] = TILES[k]();
  return out;
}
