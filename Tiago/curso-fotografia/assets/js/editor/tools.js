/* ============================================================
   FotoLab · tools.js
   Ferramentas e gestos sobre a área de trabalho.

   As pinceladas são gravadas em coordenadas da IMAGEM ORIGINAL
   (não da tela). Por isso continuam certas depois de cortar, girar,
   dar zoom — e saem no tamanho real na exportação.
   ============================================================ */

import { state, activeLayer, beginChange, endChange, touch, emit, pushHistory } from './state.js?v=4';
import * as vp from './viewport.js?v=4';
import { docGeometry, selectionOverlayCanvas } from './render.js?v=4';

const PAINT = { brush: 1, eraser: 1, dodge: 1, burn: 1 };
let dragging = null;
let cursor = null;
let spaceDown = false;
let onNotify = () => { };

export function setNotifier(fn) { onNotify = fn; }

export function bind(canvas) {
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('pointerleave', () => { cursor = null; vp.requestRender(); });
  canvas.addEventListener('wheel', wheel, { passive: false });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('keydown', e => { if (e.code === 'Space' && !isTyping(e)) { spaceDown = true; canvas.style.cursor = 'grab'; } });
  window.addEventListener('keyup', e => { if (e.code === 'Space') { spaceDown = false; canvas.style.cursor = ''; } });
  vp.addOverlay(overlay);
}
function isTyping(e) {
  const t = e.target;
  return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
}

/* ---------- corte: alças ---------- */
const HANDLE = 16;
function cropRect() {
  if (state.cropDraft) return state.cropDraft;
  const g = docGeometry(state.doc, true);
  const c = state.doc.crop;
  return c ? Object.assign({}, c) : { x: 0, y: 0, w: g.W, h: g.H };
}
function handleAt(p, r, tol) {
  const near = (a, b) => Math.abs(a - b) < tol;
  const L = near(p.x, r.x), R = near(p.x, r.x + r.w), T = near(p.y, r.y), B = near(p.y, r.y + r.h);
  const insideX = p.x > r.x - tol && p.x < r.x + r.w + tol;
  const insideY = p.y > r.y - tol && p.y < r.y + r.h + tol;
  if (L && T) return 'nw'; if (R && T) return 'ne'; if (L && B) return 'sw'; if (R && B) return 'se';
  if (L && insideY) return 'w'; if (R && insideY) return 'e';
  if (T && insideX) return 'n'; if (B && insideX) return 's';
  if (insideX && insideY) return 'move';
  return null;
}

/* ---------- eventos ---------- */
function down(ev) {
  if (!state.doc) return;
  ev.preventDefault();
  ev.target.setPointerCapture && ev.target.setPointerCapture(ev.pointerId);
  const out = vp.screenToOut(ev.clientX, ev.clientY);
  const img = vp.outToImage(out.x, out.y);

  if (spaceDown || state.tool === 'hand' || ev.button === 1) {
    dragging = { type: 'pan', sx: ev.clientX, sy: ev.clientY, px: state.panX, py: state.panY };
    return;
  }
  if (state.tool === 'crop') {
    const r = cropRect();
    const tol = HANDLE / state.zoom;
    let h = handleAt(out, r, tol);
    // sem recorte definido ainda, a "moldura" é a foto inteira: arrastar dentro
    // dela tem de DESENHAR um recorte novo, e não arrastar a foto toda (que só
    // esbarraria nos limites e daria a impressão de que a ferramenta travou)
    const hasRect = !!(state.cropDraft || state.doc.crop);
    if (h === 'move' && !hasRect) h = null;
    state.cropDraft = r;
    dragging = h ? { type: 'crop', mode: h, start: out, rect: Object.assign({}, r) }
      : { type: 'crop', mode: 'new', start: out, rect: { x: out.x, y: out.y, w: 0, h: 0 } };
    vp.requestRender();
    return;
  }
  if (PAINT[state.tool]) {
    const layer = activeLayer();
    if (!layer) { onNotify('Escolha uma camada no painel Camadas.'); return; }
    if (layer.type !== 'image' && (state.tool === 'dodge' || state.tool === 'burn')) {
      onNotify('Clarear/queimar age sobre os pixels da camada — selecione a camada da foto.');
      return;
    }
    beginChange(labelFor(state.tool));
    const s = {
      mode: state.tool,
      size: state.brush.size,
      hardness: state.brush.hardness,
      flow: state.brush.flow,
      color: state.brush.color,
      pts: [[img.x, img.y]]
    };
    layer.strokes.push(s);
    touch(layer);
    dragging = { type: 'paint', stroke: s, layer };
    vp.requestRender(true);
    return;
  }
  if (state.tool === 'wand') {
    const layer = activeLayer();
    if (!layer) { onNotify('Escolha uma camada no painel Camadas.'); return; }
    pushHistory('Selecionar');
    state.selection = Object.assign({}, state.wand, { x: img.x, y: img.y, layerId: layer.id });
    emit();
    vp.requestRender();
    return;
  }
  if (state.tool === 'move') {
    const layer = activeLayer();
    if (!layer) return;
    beginChange('Mover camada');
    dragging = { type: 'move', layer, start: img, lx: layer.x, ly: layer.y };
    return;
  }
  if (state.tool === 'text') {
    const layer = activeLayer();
    if (layer && layer.type === 'text') {
      beginChange('Mover texto');
      dragging = { type: 'move', layer, start: img, lx: layer.x, ly: layer.y };
    }
  }
}

function move(ev) {
  if (!state.doc) return;
  const out = vp.screenToOut(ev.clientX, ev.clientY);
  cursor = PAINT[state.tool] ? out : null;

  if (!dragging) { if (PAINT[state.tool]) vp.requestRender(); return; }

  if (dragging.type === 'pan') {
    state.panX = dragging.px + (ev.clientX - dragging.sx);
    state.panY = dragging.py + (ev.clientY - dragging.sy);
    vp.requestRender();
    return;
  }
  if (dragging.type === 'paint') {
    const img = vp.outToImage(out.x, out.y);
    const pts = dragging.stroke.pts;
    const lastP = pts[pts.length - 1];
    if (Math.hypot(img.x - lastP[0], img.y - lastP[1]) < 1.2) return;
    pts.push([img.x, img.y]);
    touch(dragging.layer);
    vp.requestRender(true);
    return;
  }
  if (dragging.type === 'move') {
    const img = vp.outToImage(out.x, out.y);
    dragging.layer.x = dragging.lx + (img.x - dragging.start.x);
    dragging.layer.y = dragging.ly + (img.y - dragging.start.y);
    touch(dragging.layer);
    vp.requestRender(true);
    return;
  }
  if (dragging.type === 'crop') {
    const g = docGeometry(state.doc, true);
    const r = Object.assign({}, dragging.rect);
    const dx = out.x - dragging.start.x, dy = out.y - dragging.start.y;
    if (dragging.mode === 'new') {
      r.x = Math.min(dragging.start.x, out.x); r.y = Math.min(dragging.start.y, out.y);
      r.w = Math.abs(dx); r.h = Math.abs(dy);
    } else if (dragging.mode === 'move') {
      r.x += dx; r.y += dy;
    } else {
      if (dragging.mode.includes('w')) { r.x += dx; r.w -= dx; }
      if (dragging.mode.includes('e')) { r.w += dx; }
      if (dragging.mode.includes('n')) { r.y += dy; r.h -= dy; }
      if (dragging.mode.includes('s')) { r.h += dy; }
    }
    applyAspect(r, dragging.mode);
    // não deixa a moldura sair da foto
    r.w = Math.max(16, Math.min(r.w, g.W)); r.h = Math.max(16, Math.min(r.h, g.H));
    r.x = Math.max(0, Math.min(r.x, g.W - r.w));
    r.y = Math.max(0, Math.min(r.y, g.H - r.h));
    state.cropDraft = r;
    vp.requestRender();
  }
}

function applyAspect(r, mode) {
  const a = aspectValue();
  if (!a) return;
  if (mode === 'move') return;
  if (mode === 'n' || mode === 's') r.w = r.h * a;
  else r.h = r.w / a;
}
function aspectValue() {
  const map = { free: 0, '1:1': 1, '4:5': 4 / 5, '3:4': 3 / 4, '2:3': 2 / 3, '4:3': 4 / 3, '3:2': 3 / 2, '16:9': 16 / 9, '9:16': 9 / 16 };
  return map[state.cropAspect] || 0;
}

function up() {
  if (!dragging) return;
  if (dragging.type === 'paint' || dragging.type === 'move') { endChange(); emit(); }
  dragging = null;
  vp.requestRender();
}

function wheel(ev) {
  if (!state.doc) return;
  ev.preventDefault();
  const r = ev.currentTarget.getBoundingClientRect();
  if (ev.ctrlKey || ev.metaKey || !ev.shiftKey) {
    const f = Math.pow(1.0016, -ev.deltaY);
    vp.setZoom(state.zoom * f, ev.clientX - r.left, ev.clientY - r.top);
  } else {
    state.panX -= ev.deltaX; state.panY -= ev.deltaY;
    vp.requestRender();
  }
}

function labelFor(t) {
  return { brush: 'Pincel', eraser: 'Borracha', dodge: 'Clarear', burn: 'Queimar' }[t] || 'Edição';
}

/* ---------- desenho por cima (moldura de corte, cursor) ---------- */
function overlay(ctx, { dpr, o, zoom }) {
  if (state.tool === 'crop') {
    const r = cropRect();
    const g = docGeometry(state.doc, true);
    const X = (v) => (o.x + v * zoom) * dpr, Y = (v) => (o.y + v * zoom) * dpr;
    ctx.fillStyle = 'rgba(8,9,14,.62)';
    ctx.beginPath();
    ctx.rect(X(0), Y(0), g.W * zoom * dpr, g.H * zoom * dpr);
    ctx.rect(X(r.x), Y(r.y), r.w * zoom * dpr, r.h * zoom * dpr);
    ctx.fill('evenodd');

    ctx.strokeStyle = '#f4b03e'; ctx.lineWidth = 1.5 * dpr;
    ctx.strokeRect(X(r.x), Y(r.y), r.w * zoom * dpr, r.h * zoom * dpr);
    // grade dos terços: o mesmo enquadramento que o jogo ensina
    ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 1 * dpr;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(X(r.x + r.w * i / 3), Y(r.y)); ctx.lineTo(X(r.x + r.w * i / 3), Y(r.y + r.h));
      ctx.moveTo(X(r.x), Y(r.y + r.h * i / 3)); ctx.lineTo(X(r.x + r.w), Y(r.y + r.h * i / 3));
      ctx.stroke();
    }
    ctx.fillStyle = '#f4b03e';
    [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]].forEach(p => {
      ctx.fillRect(X(p[0]) - 5 * dpr, Y(p[1]) - 5 * dpr, 10 * dpr, 10 * dpr);
    });
    return;
  }
  if (state.selection && (state.tool === 'wand' || state.tool === 'move')) {
    drawSelection(ctx, o, zoom, dpr);
  }
  if (cursor && PAINT[state.tool]) {
    const p = vp.outToScreen(cursor.x, cursor.y);
    const rad = state.brush.size / 2 * zoom * dpr;
    ctx.beginPath();
    ctx.arc(p.x * dpr, p.y * dpr, Math.max(3, rad), 0, 7);
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.2 * dpr; ctx.stroke();
    ctx.beginPath();
    ctx.arc(p.x * dpr, p.y * dpr, Math.max(3, rad) + 1.2 * dpr, 0, 7);
    ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 1.2 * dpr; ctx.stroke();
  }
}

export function commitCrop() {
  if (!state.cropDraft) return false;
  beginChange('Cortar');
  const r = state.cropDraft;
  state.doc.crop = { x: Math.round(r.x), y: Math.round(r.y), w: Math.max(8, Math.round(r.w)), h: Math.max(8, Math.round(r.h)) };
  state.cropDraft = null;
  endChange();
  emit();
  return true;
}
export function cancelCrop() { state.cropDraft = null; vp.requestRender(); }
export function resetCrop() {
  beginChange('Desfazer corte');
  state.doc.crop = null; state.cropDraft = null;
  endChange(); emit();
}
export { cropRect };


/* Mostra a seleção escurecendo o que ficou de FORA e clareando de leve o que
   ficou dentro. A borda aparece pelo contraste entre os dois — mais legível
   para quem está aprendendo do que o tracejado piscante do Photoshop. */
let veil = null;
function drawSelection(ctx, o, zoom, dpr) {
  const layer = state.doc.layers.find(l => l.id === state.selection.layerId) || activeLayer();
  if (!layer) return;
  const m = selectionOverlayCanvas(layer, state.selection, Math.min(zoom, 1));
  if (!m) return;
  const dw = Math.round(m.width / Math.min(zoom, 1) * zoom * dpr);
  const dh = Math.round(m.height / Math.min(zoom, 1) * zoom * dpr);
  const dx = Math.round(o.x * dpr), dy = Math.round(o.y * dpr);

  if (!veil || veil.width !== dw || veil.height !== dh) {
    veil = document.createElement('canvas');
    veil.width = Math.max(1, dw); veil.height = Math.max(1, dh);
  }
  const vg = veil.getContext('2d');
  vg.setTransform(1, 0, 0, 1, 0, 0);
  vg.clearRect(0, 0, dw, dh);
  vg.fillStyle = 'rgba(8,9,14,.55)';
  vg.fillRect(0, 0, dw, dh);
  vg.globalCompositeOperation = 'destination-out';
  vg.drawImage(m, 0, 0, dw, dh);
  vg.globalCompositeOperation = 'source-over';
  ctx.drawImage(veil, dx, dy, dw, dh);

  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(m, dx, dy, dw, dh);
  ctx.restore();
}
