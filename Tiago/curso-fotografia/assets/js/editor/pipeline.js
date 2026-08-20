/* ============================================================
   FotoLab · pipeline.js
   A "revelação" dos pixels: recebe um ImageData e aplica os
   ajustes da camada. Tudo em JS puro, sem WebGL.

   Ordem (a mesma dos programas de revelação de verdade):
     1. mapa de clarear/queimar  (multiplica a exposição local)
     2. LUT por canal            (exposição, temperatura, pretos/brancos,
                                  contraste, curvas)
     3. altas luzes / sombras    (dependem do brilho do pixel → no laço)
     4. saturação / intensidade
     5. preto e branco (+ filtro colorido e viragem)
     6. passos espaciais         (desfoque, nitidez, textura/clareza)
     7. grão e vinheta

   Por que LUT: exposição, contraste, curva e temperatura só dependem
   do valor do canal. Calcular 256 valores uma vez e consultar é ~10×
   mais rápido do que fazer a conta em cada um dos milhões de pixels.
   ============================================================ */

const clamp255 = v => v < 0 ? 0 : v > 255 ? 255 : v;

/* ---------- curvas (spline monotônica de Fritsch–Carlson) ----------
   Spline monotônica em vez de cúbica comum: a cúbica normal "estoura"
   entre pontos distantes e a curva volta pra trás, criando solarização.
   Esta nunca ultrapassa os pontos que o usuário colocou. */
export function curveLUT(points) {
  const lut = new Uint8ClampedArray(256);
  const pts = (points || []).slice().sort((a, b) => a[0] - b[0]);
  if (pts.length < 2) { for (let i = 0; i < 256; i++) lut[i] = i; return lut; }
  const n = pts.length;
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const d = [], m = [];
  for (let i = 0; i < n - 1; i++) d[i] = (ys[i + 1] - ys[i]) / Math.max(1e-6, xs[i + 1] - xs[i]);
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) m[i] = 0;
    else m[i] = (d[i - 1] + d[i]) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  for (let x = 0; x < 256; x++) {
    if (x <= xs[0]) { lut[x] = ys[0]; continue; }
    if (x >= xs[n - 1]) { lut[x] = ys[n - 1]; continue; }
    let i = 0; while (i < n - 2 && x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h;
    const t2 = t * t, t3 = t2 * t;
    lut[x] = clamp255(
      (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] +
      (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1]
    );
  }
  return lut;
}

function isIdentityCurve(p) { return !p || (p.length === 2 && p[0][0] === 0 && p[0][1] === 0 && p[1][0] === 255 && p[1][1] === 255); }

/* ---------- LUT por canal ---------- */
function buildLUTs(adj, curve) {
  const expMul = Math.pow(2, (adj.exposure || 0) / 50);          // ±2 EV
  const t = (adj.temp || 0) / 100, ti = (adj.tint || 0) / 100;
  const gain = [
    expMul * (1 + t * 0.35),
    expMul * (1 - ti * 0.28),
    expMul * (1 - t * 0.35)
  ];
  const bp = -(adj.blacks || 0) / 400;         // ponto de preto
  const wp = 1 - (adj.whites || 0) / 400;      // ponto de branco
  const k = Math.pow(2, (adj.contrast || 0) / 100);
  const span = Math.max(0.05, wp - bp);

  const cRGB = isIdentityCurve(curve && curve.rgb) ? null : curveLUT(curve.rgb);
  const cCh = ['r', 'g', 'b'].map(c => isIdentityCurve(curve && curve[c]) ? null : curveLUT(curve[c]));

  const luts = [new Uint8ClampedArray(256), new Uint8ClampedArray(256), new Uint8ClampedArray(256)];
  for (let c = 0; c < 3; c++) {
    for (let i = 0; i < 256; i++) {
      let v = (i / 255) * gain[c];
      v = (v - bp) / span;                          // pretos/brancos
      v = 0.5 + (v - 0.5) * k;                      // contraste
      let o = clamp255(v * 255);
      if (cRGB) o = cRGB[o | 0];
      if (cCh[c]) o = cCh[c][o | 0];
      luts[c][i] = o;
    }
  }
  return luts;
}

const BW_FILTERS = {
  none: [0.2126, 0.7152, 0.0722],
  vermelho: [0.62, 0.30, 0.08],
  laranja: [0.50, 0.42, 0.08],
  amarelo: [0.34, 0.58, 0.08],
  verde: [0.16, 0.70, 0.14],
  azul: [0.10, 0.30, 0.60]
};
const BW_TONES = { none: [1, 1, 1], sepia: [1.09, 1.0, 0.84], frio: [0.90, 0.98, 1.12] };

const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* ---------- desfoque ----------
   Caminho rápido: o próprio navegador borra via `ctx.filter = blur()`, que é
   acelerado. Para raios grandes ainda reduzimos a imagem antes de borrar (o
   desfoque é justamente a informação de baixa frequência — reduzir 4× e voltar
   dá o mesmo visual por 1/16 do trabalho). Se o navegador não tiver filtro no
   canvas (Safari antigo), caímos no desfoque de caixa em JS abaixo, que dá o
   mesmo resultado, só mais devagar. */
let filterOK = null;
function supportsCanvasFilter() {
  if (filterOK !== null) return filterOK;
  try {
    const c = document.createElement('canvas'); c.width = c.height = 9;
    const g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, 9, 9);
    g.filter = 'blur(2px)';
    g.fillStyle = '#fff'; g.fillRect(4, 4, 1, 1);
    const d = g.getImageData(2, 4, 1, 1).data;
    filterOK = d[0] > 0;                    // borrou = o pixel vizinho clareou
  } catch (e) { filterOK = false; }
  return filterOK;
}

/** Devolve uma cópia borrada dos pixels (não altera o original). */
export function blurCopy(data, w, h, radius) {
  if (radius < 1) return new Uint8ClampedArray(data);
  // em imagem pequena (a pré-visualização) as idas e vindas de pixels para o
  // canvas custam mais do que o desfoque em JS — só vale a pena no tamanho real
  if (w * h < 2000000 || !supportsCanvasFilter()) return boxBlur(new Uint8ClampedArray(data), w, h, radius);
  const step = Math.max(1, Math.min(4, Math.round(radius / 5)));
  const dw = Math.max(1, Math.round(w / step)), dh = Math.max(1, Math.round(h / step));
  const src = document.createElement('canvas'); src.width = w; src.height = h;
  src.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(data), w, h), 0, 0);
  const small = document.createElement('canvas'); small.width = dw; small.height = dh;
  const sg = small.getContext('2d');
  sg.filter = 'blur(' + (radius / step) + 'px)';
  sg.drawImage(src, 0, 0, dw, dh);
  const out = document.createElement('canvas'); out.width = w; out.height = h;
  const og = out.getContext('2d', { willReadFrequently: true });
  og.imageSmoothingQuality = 'high';
  og.drawImage(small, 0, 0, w, h);
  return og.getImageData(0, 0, w, h).data;
}

/* ---------- desfoque de caixa separável (3 passadas ≈ gaussiana) ---------- */
export function boxBlur(src, w, h, radius, passes = 3) {
  if (radius < 1) return src;
  let a = src, b = new Uint8ClampedArray(src.length);
  for (let p = 0; p < passes; p++) {
    blurPass(a, b, w, h, radius, true);
    blurPass(b, a === src ? (a = new Uint8ClampedArray(src.length)) : a, w, h, radius, false);
  }
  return a;
}
function blurPass(src, dst, w, h, r, horizontal) {
  const len = horizontal ? w : h, other = horizontal ? h : w;
  const stepIn = horizontal ? 4 : w * 4, stepOut = horizontal ? w * 4 : 4;
  const div = r * 2 + 1;
  for (let o = 0; o < other; o++) {
    const base = o * stepOut;
    for (let c = 0; c < 4; c++) {
      let sum = 0;
      const first = src[base + c], last = src[base + (len - 1) * stepIn + c];
      for (let i = -r; i <= r; i++) sum += src[base + Math.min(len - 1, Math.max(0, i)) * stepIn + c];
      for (let i = 0; i < len; i++) {
        dst[base + i * stepIn + c] = sum / div;
        const add = i + r + 1 <= len - 1 ? src[base + (i + r + 1) * stepIn + c] : last;
        const sub = i - r >= 0 ? src[base + (i - r) * stepIn + c] : first;
        sum += add - sub;
      }
    }
  }
}

/* ---------- ruído determinístico (grão) ---------- */
let _tile = null;
function noiseTile() {
  if (_tile) return _tile;
  _tile = new Float32Array(256 * 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) _tile[(y << 8) + x] = noiseAt(x, y) - 0.5;
  return _tile;
}
function noiseAt(x, y) {
  let n = (x * 374761393 + y * 668265263) | 0;
  n = (n ^ (n >> 13)) * 1274126177 | 0;
  return ((n ^ (n >> 16)) & 0xffff) / 65535;
}

/**
 * Aplica os ajustes no ImageData (in-place).
 * @param {ImageData} img
 * @param {object} adj  ajustes da camada
 * @param {object} curve  curvas da camada
 * @param {Uint8ClampedArray|null} dodgeMap  mapa RGBA de clarear/queimar (128 = neutro)
 */
export function applyAdjustments(img, adj, curve, dodgeMap) {
  const d = img.data, w = img.width, h = img.height;
  const luts = buildLUTs(adj, curve);
  const [lr, lg, lb] = luts;
  const hi = (adj.highlights || 0) / 100, sh = (adj.shadows || 0) / 100;
  const sat = (adj.saturation || 0) / 100, vib = (adj.vibrance || 0) / 100;
  const bw = !!adj.bw;
  const wts = BW_FILTERS[adj.bwFilter] || BW_FILTERS.none;
  const tone = BW_TONES[adj.bwTone] || BW_TONES.none;

  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    let r = d[i], g = d[i + 1], b = d[i + 2];

    if (dodgeMap) {
      const v = dodgeMap[i];              // 128 = não mexeu
      if (v !== 128) {
        const f = Math.pow(2, ((v - 128) / 128) * 1.15);
        r = clamp255(r * f); g = clamp255(g * f); b = clamp255(b * f);
      }
    }

    r = lr[r | 0]; g = lg[g | 0]; b = lb[b | 0];

    if (hi !== 0 || sh !== 0) {
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      let f = 1;
      if (hi !== 0) f *= 1 + hi * 0.85 * smoothstep(0.45, 1, lum);
      if (sh !== 0) f *= 1 + sh * 0.95 * (1 - smoothstep(0, 0.55, lum));
      r = clamp255(r * f); g = clamp255(g * f); b = clamp255(b * f);
    }

    if (sat !== 0 || vib !== 0) {
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      let amt = sat;
      if (vib !== 0) {
        const mx = r > g ? (r > b ? r : b) : (g > b ? g : b);
        const mn = r < g ? (r < b ? r : b) : (g < b ? g : b);
        amt += vib * (1 - (mx - mn) / 255);   // mexe mais no que está apagado
      }
      const m = 1 + amt;
      r = clamp255(lum + (r - lum) * m);
      g = clamp255(lum + (g - lum) * m);
      b = clamp255(lum + (b - lum) * m);
    }

    if (bw) {
      const gy = wts[0] * r + wts[1] * g + wts[2] * b;
      r = clamp255(gy * tone[0]); g = clamp255(gy * tone[1]); b = clamp255(gy * tone[2]);
    }

    d[i] = r; d[i + 1] = g; d[i + 2] = b;
  }

  /* ---- passos espaciais ---- */
  const minDim = Math.min(w, h);
  const blurR = Math.round((adj.blur || 0) / 100 * minDim / 22);
  if (blurR >= 1) d.set(blurCopy(d, w, h, blurR));
  // Textura e nitidez são a mesma conta (máscara de desfoque) em raios
  // diferentes. Fazendo as duas na MESMA varredura, poupamos uma passada
  // inteira sobre a imagem — em foto de 12 MP isso vale mais de um segundo.
  const clarity = (adj.clarity || 0) / 100;
  const sharp = (adj.sharpen || 0) / 100;
  if (clarity !== 0 || sharp > 0) {
    const bC = clarity !== 0 ? blurCopy(d, w, h, Math.max(2, Math.round(minDim / 55))) : null;
    const bS = sharp > 0 ? blurCopy(d, w, h, 1) : null;
    const aC = clarity * 0.75, aS = sharp * 1.4;
    for (let i = 0; i < d.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const v = d[i + c];
        let o = v;
        if (bC) o += (v - bC[i + c]) * aC;
        if (bS) o += (v - bS[i + c]) * aS;
        d[i + c] = clamp255(o);
      }
    }
  }
  const grain = (adj.grain || 0) / 100;
  if (grain > 0) {
    const amp = grain * 46;
    const tile = noiseTile();            // 256×256 pronto: o grão é aleatório,
    let p = 0;                           // não precisa de um hash por pixel
    for (let y = 0; y < h; y++) {
      const row = (y & 255) << 8;
      for (let x = 0; x < w; x++, p += 4) {
        if (d[p + 3] === 0) continue;
        const n = tile[row + (x & 255)] * amp;
        d[p] = clamp255(d[p] + n); d[p + 1] = clamp255(d[p + 1] + n); d[p + 2] = clamp255(d[p + 2] + n);
      }
    }
  }
  const vig = (adj.vignette || 0) / 100;
  if (vig !== 0) {
    const cx = w / 2, cy = h / 2, maxd2 = cx * cx + cy * cy;
    // tabela de atenuação indexada pela distância AO QUADRADO: evita uma raiz
    // quadrada e um smoothstep em cada um dos milhões de pixels
    const N = 1024, tab = new Float32Array(N);
    for (let i = 0; i < N; i++) tab[i] = 1 - vig * smoothstep(0.35, 1.05, Math.sqrt(i / (N - 1)));
    let p = 0;
    for (let y = 0; y < h; y++) {
      const dy = y - cy, dy2 = dy * dy;
      for (let x = 0; x < w; x++, p += 4) {
        if (d[p + 3] === 0) continue;
        const dx = x - cx;
        const f = tab[((dx * dx + dy2) / maxd2 * (N - 1)) | 0];
        d[p] = clamp255(d[p] * f); d[p + 1] = clamp255(d[p + 1] * f); d[p + 2] = clamp255(d[p + 2] * f);
      }
    }
  }
  return img;
}

export function isNeutral(adj) {
  return !adj.bw && !adj.exposure && !adj.contrast && !adj.highlights && !adj.shadows &&
    !adj.whites && !adj.blacks && !adj.temp && !adj.tint && !adj.saturation && !adj.vibrance &&
    !adj.clarity && !adj.sharpen && !adj.blur && !adj.grain && !adj.vignette;
}

/* histograma (256 níveis por canal + luminância) */
export function histogram(imgData) {
  const d = imgData.data;
  const r = new Uint32Array(256), g = new Uint32Array(256), b = new Uint32Array(256), l = new Uint32Array(256);
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 8) continue;
    r[d[i]]++; g[d[i + 1]]++; b[d[i + 2]]++;
    l[(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) | 0]++;
  }
  return { r, g, b, l };
}
