/* ============================================================
   FotoLab · render.js
   Rasteriza o documento. Duas resoluções, o MESMO caminho:
     · pré-visualização (do tamanho da tela) — rápida
     · exportação (tamanho real da foto)     — idêntica, só maior
   Como as pinceladas são vetores e os ajustes são funções, mudar a
   escala não muda o resultado: o que o aluno vê é o que ele salva.
   ============================================================ */

import { state, ADJ_DEFAULTS } from './state.js?v=3';
import { getImage } from './assets.js?v=3';
import { applyAdjustments, isNeutral } from './pipeline.js?v=3';

const cache = new WeakMap();       // camada → {key, canvas}
let stampCache = { key: '', canvas: null };
let scratch = null;

function mkCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  return c;
}
function hexRGB(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#ffffff');
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [255, 255, 255];
}

/* ---------- geometria do documento (giro + nivelamento + corte) ---------- */
export function docGeometry(doc, ignoreCrop) {
  const deg = doc.rotStep * 90 + doc.angle;
  const th = deg * Math.PI / 180;
  const ca = Math.abs(Math.cos(th)), sa = Math.abs(Math.sin(th));
  const W = doc.w * ca + doc.h * sa;
  const H = doc.w * sa + doc.h * ca;
  const M = new DOMMatrix()
    .translateSelf(W / 2, H / 2)
    .rotateSelf(deg)
    .scaleSelf(doc.flipH ? -1 : 1, doc.flipV ? -1 : 1)
    .translateSelf(-doc.w / 2, -doc.h / 2);
  const crop = (!ignoreCrop && doc.crop) ? doc.crop : { x: 0, y: 0, w: W, h: H };
  const full = new DOMMatrix().translateSelf(-crop.x, -crop.y).multiplySelf(M);
  return { W, H, M, crop, full, inv: full.inverse() };
}

/** ponto do resultado (px do documento cortado) → px da imagem original */
export function outToDoc(x, y, ignoreCrop) {
  const g = docGeometry(state.doc, ignoreCrop);
  const p = g.inv.transformPoint(new DOMPoint(x, y));
  return { x: p.x, y: p.y };
}
export function docToOut(x, y, ignoreCrop) {
  const g = docGeometry(state.doc, ignoreCrop);
  const p = g.full.transformPoint(new DOMPoint(x, y));
  return { x: p.x, y: p.y };
}

/* ---------- pincéis ---------- */
function stamp(size, hardness) {
  const key = size + '|' + hardness;
  if (stampCache.key === key) return stampCache.canvas;
  const r = Math.max(0.5, size / 2);
  const c = mkCanvas(r * 2, r * 2);
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  const hard = Math.min(0.95, Math.max(0, hardness / 100));
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(hard, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, c.width, c.height);
  stampCache = { key, canvas: c };
  return c;
}

/** Desenha a pincelada em branco num canvas alfa (a cor entra na composição). */
function strokeMask(stroke, w, h, scale) {
  if (!scratch || scratch.width !== w || scratch.height !== h) scratch = mkCanvas(w, h);
  const g = scratch.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, w, h);
  const size = Math.max(1, stroke.size * scale);
  const st = stamp(size, stroke.hardness);
  const half = st.width / 2;
  const spacing = Math.max(1, size * 0.14);
  const pts = stroke.pts;
  let prev = null;
  for (let i = 0; i < pts.length; i++) {
    const x = pts[i][0] * scale, y = pts[i][1] * scale;
    if (!prev) { g.drawImage(st, x - half, y - half); prev = [x, y]; continue; }
    const dx = x - prev[0], dy = y - prev[1];
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(dist / spacing));
    for (let s = 1; s <= steps; s++) {
      g.drawImage(st, prev[0] + dx * s / steps - half, prev[1] + dy * s / steps - half);
    }
    prev = [x, y];
  }
  return scratch;
}

function paintStrokes(ctx, layer, w, h, scale) {
  for (const s of layer.strokes) {
    if (s.mode !== 'brush' && s.mode !== 'eraser') continue;
    if (!s.pts.length) continue;
    const mask = strokeMask(s, w, h, scale);
    ctx.save();
    ctx.globalAlpha = Math.max(0.02, s.flow / 100);
    if (s.mode === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.drawImage(mask, 0, 0);
    } else {
      ctx.globalCompositeOperation = 'source-over';
      const tmp = mkCanvas(w, h);
      const tg = tmp.getContext('2d');
      tg.drawImage(mask, 0, 0);
      tg.globalCompositeOperation = 'source-in';
      tg.fillStyle = s.color;
      tg.fillRect(0, 0, w, h);
      ctx.drawImage(tmp, 0, 0);
    }
    ctx.restore();
  }
}

/** Mapa de clarear/queimar: cinza 128 = nada; mais claro = clareia. */
function dodgeMapFor(layer, w, h, scale) {
  const has = layer.strokes.some(s => (s.mode === 'dodge' || s.mode === 'burn') && s.pts.length);
  if (!has) return null;
  const c = mkCanvas(w, h);
  const g = c.getContext('2d');
  g.fillStyle = 'rgb(128,128,128)';
  g.fillRect(0, 0, w, h);
  for (const s of layer.strokes) {
    if (s.mode !== 'dodge' && s.mode !== 'burn') continue;
    if (!s.pts.length) continue;
    const mask = strokeMask(s, w, h, scale);
    const tmp = mkCanvas(w, h);
    const tg = tmp.getContext('2d');
    tg.drawImage(mask, 0, 0);
    tg.globalCompositeOperation = 'source-in';
    tg.fillStyle = s.mode === 'dodge' ? '#ffffff' : '#000000';
    tg.fillRect(0, 0, w, h);
    g.globalAlpha = Math.max(0.03, s.flow / 100) * 0.85;
    g.drawImage(tmp, 0, 0);
    g.globalAlpha = 1;
  }
  return g.getImageData(0, 0, w, h).data;
}

/* ---------- uma camada ---------- */
function layerCanvas(layer, doc, scale, raw) {
  const w = Math.max(1, Math.round(doc.w * scale));
  const h = Math.max(1, Math.round(doc.h * scale));
  const key = scale.toFixed(4) + '|' + layer.rev + '|' + (raw ? 'raw' : 'ed');
  const hit = cache.get(layer);
  if (hit && hit.key === key) return hit.canvas;

  const c = mkCanvas(w, h);
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingQuality = 'high';

  if (layer.type === 'image') {
    const a = getImage(layer.asset);
    if (a) {
      ctx.save();
      ctx.translate(layer.x * scale, layer.y * scale);
      ctx.rotate((layer.rot || 0) * Math.PI / 180);
      ctx.scale(layer.scale * scale, layer.scale * scale);
      ctx.drawImage(a.img, 0, 0);
      ctx.restore();
    }
  } else if (layer.type === 'fill') {
    ctx.fillStyle = layer.color;
    ctx.fillRect(0, 0, w, h);
  } else if (layer.type === 'text') {
    const t = layer.text;
    ctx.save();
    ctx.translate(layer.x * scale, layer.y * scale);
    ctx.rotate((layer.rot || 0) * Math.PI / 180);
    ctx.fillStyle = layer.color;
    ctx.textBaseline = 'top';
    ctx.textAlign = t.align || 'left';
    // ctx.font é CSS "de verdade", mas NÃO resolve var(--…): uma família com
    // variável faz a atribuição inteira ser ignorada e o texto sai em 10px
    const family = (t.font && t.font.indexOf('var(') < 0) ? t.font : 'Fraunces, Georgia, serif';
    ctx.font = t.weight + ' ' + (t.size * scale) + 'px ' + family;
    const lines = String(t.content || '').split('\n');
    const lh = t.size * scale * 1.15;
    lines.forEach((ln, i) => ctx.fillText(ln, 0, i * lh));
    ctx.restore();
  }

  if (!raw) {
    paintStrokes(ctx, layer, w, h, scale);
    const map = dodgeMapFor(layer, w, h, scale);
    if (map || !isNeutral(layer.adj) || layer.curveActive !== undefined) {
      const needs = map || !isNeutral(layer.adj) || hasCurve(layer.curve);
      if (needs) {
        const img = ctx.getImageData(0, 0, w, h);
        applyAdjustments(img, layer.adj, layer.curve, map);
        ctx.putImageData(img, 0, 0);
      }
    }
  }

  cache.set(layer, { key, canvas: c });
  return c;
}

function hasCurve(cv) {
  if (!cv) return false;
  return ['rgb', 'r', 'g', 'b'].some(k => {
    const p = cv[k];
    return !(p && p.length === 2 && p[0][0] === 0 && p[0][1] === 0 && p[1][0] === 255 && p[1][1] === 255);
  });
}

/* ---------- documento inteiro ---------- */
export function composeDoc(scale, opts = {}) {
  const doc = state.doc;
  const w = Math.max(1, Math.round(doc.w * scale));
  const h = Math.max(1, Math.round(doc.h * scale));
  const out = mkCanvas(w, h);
  const ctx = out.getContext('2d');
  if (opts.flatten) { ctx.fillStyle = opts.flatten; ctx.fillRect(0, 0, w, h); }
  for (const layer of doc.layers) {
    if (!layer.visible) continue;
    if (opts.raw && layer.type !== 'image') continue;   // o "antes" é a foto original
    const lc = layerCanvas(layer, doc, scale, !!opts.raw);
    ctx.save();
    ctx.globalAlpha = opts.raw ? 1 : Math.max(0, Math.min(1, layer.opacity / 100));
    ctx.globalCompositeOperation = opts.raw ? 'source-over' : layer.blend;
    ctx.drawImage(lc, 0, 0);
    ctx.restore();
  }
  return out;
}

/** Resultado final: camadas compostas + giro/nivelamento + corte. */
export function renderResult(scale, opts = {}) {
  const doc = state.doc;
  const g = docGeometry(doc, opts.ignoreCrop);
  const base = composeDoc(scale, opts);
  const ow = Math.max(1, Math.round(g.crop.w * scale));
  const oh = Math.max(1, Math.round(g.crop.h * scale));
  const simple = !doc.rotStep && !doc.angle && !doc.flipH && !doc.flipV &&
    g.crop.x === 0 && g.crop.y === 0 && Math.abs(g.crop.w - doc.w) < 0.5 && Math.abs(g.crop.h - doc.h) < 0.5;
  if (simple) return base;

  const out = mkCanvas(ow, oh);
  const ctx = out.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  const V = new DOMMatrix().scaleSelf(scale).multiplySelf(g.full).scaleSelf(1 / scale);
  ctx.setTransform(V);
  ctx.drawImage(base, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return out;
}

/** Maior retângulo (mesma orientação) que cabe dentro da foto girada.
    É o que os editores fazem ao "nivelar": sem isso, endireitar 8° deixa
    quatro triângulos vazios nos cantos e o aluno acha que quebrou. */
export function straightenCrop(doc) {
  const base = doc.rotStep % 2 ? { w: doc.h, h: doc.w } : { w: doc.w, h: doc.h };
  const a = Math.abs(doc.angle * Math.PI / 180);
  const g = docGeometry(doc, true);
  if (a < 1e-4) return null;
  const sa = Math.abs(Math.sin(a)), ca = Math.abs(Math.cos(a));
  const longer = base.w >= base.h;
  const sideLong = longer ? base.w : base.h, sideShort = longer ? base.h : base.w;
  let wr, hr;
  if (sideShort <= 2 * sa * ca * sideLong || Math.abs(sa - ca) < 1e-10) {
    const x = 0.5 * sideShort;
    wr = longer ? x / sa : x / ca;
    hr = longer ? x / ca : x / sa;
  } else {
    const cos2a = ca * ca - sa * sa;
    wr = (base.w * ca - base.h * sa) / cos2a;
    hr = (base.h * ca - base.w * sa) / cos2a;
  }
  return {
    x: Math.round((g.W - wr) / 2), y: Math.round((g.H - hr) / 2),
    w: Math.round(wr), h: Math.round(hr)
  };
}

export function resultSize() {
  const g = docGeometry(state.doc);
  return { w: Math.round(g.crop.w), h: Math.round(g.crop.h) };
}

export function invalidateAll() {
  if (!state.doc) return;
  state.doc.layers.forEach(l => l.rev++);
}

export { ADJ_DEFAULTS };
