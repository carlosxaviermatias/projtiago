/* ============================================================
   FotoLab · viewport.js
   A área de trabalho: desenha o resultado, o xadrez de
   transparência, a moldura de corte, a grade dos terços e o
   cursor do pincel. Também converte tela ⇄ imagem.
   ============================================================ */

import { state, emit } from './state.js?v=7';
import { renderResult, docGeometry } from './render.js?v=7';

let canvas = null, ctx = null, host = null;
let dpr = 1, pending = false, interactiveUntil = 0;
let last = { key: '', canvas: null };
let onAfter = null;

export function attach(canvasEl, hostEl, afterRender) {
  canvas = canvasEl; host = hostEl; onAfter = afterRender;
  ctx = canvas.getContext('2d');
  const ro = new ResizeObserver(() => { resize(); requestRender(); });
  ro.observe(host);
  resize();
}

let hadSize = false;
function resize() {
  if (!canvas || !host) return;
  dpr = Math.min(2, window.devicePixelRatio || 1);
  const r = host.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(r.width * dpr));
  canvas.height = Math.max(1, Math.round(r.height * dpr));
  canvas.style.width = r.width + 'px';
  canvas.style.height = r.height + 'px';
  // A área pode nascer com 0px (aba em segundo plano, fonte ainda carregando).
  // Um "encaixar na tela" calculado nesse instante daria zoom negativo e a foto
  // sumiria — então, quando a área ganha tamanho de verdade, refazemos o encaixe.
  const ok = r.width > 40 && r.height > 40;
  // refaz o encaixe quando a área muda de tamanho (girar o celular, abrir a
  // gaveta de painéis) — mas só se a foto ainda estava "encaixada na tela";
  // se o aluno deu zoom à mão, respeitamos o zoom dele
  if (ok && state.doc && (!hadSize || state.fitted)) fit();
  hadSize = ok;
}

export function viewSize() { return { w: canvas ? canvas.width / dpr : 1, h: canvas ? canvas.height / dpr : 1 }; }

/** tamanho do resultado levando em conta se a ferramenta corte está aberta */
export function outSize() {
  const g = docGeometry(state.doc, state.tool === 'crop');
  return { w: g.crop.w, h: g.crop.h };
}

export function fit(margin = 40) {
  if (!state.doc) return;
  const v = viewSize(), o = outSize();
  if (v.w < 40 || v.h < 40) return;                 // ainda sem área: espera o resize
  state.fitZoom = Math.min((v.w - margin) / o.w, (v.h - margin) / o.h);
  state.zoom = Math.max(0.02, Math.min(1, state.fitZoom));
  state.panX = 0; state.panY = 0;
  state.fitted = true;
  requestRender();
  emit();                                           // atualiza o rótulo de zoom
}
export function setZoom(z, cx, cy) {
  const old = state.zoom;
  state.fitted = false;
  state.zoom = Math.max(0.02, Math.min(16, z));
  if (cx != null) {
    // mantém sob o cursor o mesmo ponto da imagem ao aproximar
    const v = viewSize(), o = outSize();
    const ox = (v.w - o.w * old) / 2 + state.panX;
    const oy = (v.h - o.h * old) / 2 + state.panY;
    const ix = (cx - ox) / old, iy = (cy - oy) / old;
    state.panX += (cx - ((v.w - o.w * state.zoom) / 2 + state.panX) - ix * state.zoom);
    state.panY += (cy - ((v.h - o.h * state.zoom) / 2 + state.panY) - iy * state.zoom);
  }
  requestRender();
  zoomLabel();     // só o rótulo: um emit() a cada tique da roda redesenharia
}                  // a lista de camadas inteira sem necessidade

function zoomLabel() {
  const z = document.getElementById('flZoom');
  if (z) z.textContent = Math.round(state.zoom * 100) + '%';
}

function origin() {
  const v = viewSize(), o = outSize();
  return { x: (v.w - o.w * state.zoom) / 2 + state.panX, y: (v.h - o.h * state.zoom) / 2 + state.panY };
}

/** ponto da tela (clientX/Y) → px do resultado */
export function screenToOut(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  const o = origin();
  return { x: (clientX - r.left - o.x) / state.zoom, y: (clientY - r.top - o.y) / state.zoom };
}
export function outToScreen(x, y) {
  const o = origin();
  return { x: o.x + x * state.zoom, y: o.y + y * state.zoom };
}
/** px do resultado → px da imagem original (para pintar) */
export function outToImage(x, y) {
  const g = docGeometry(state.doc, state.tool === 'crop');
  const p = g.inv.transformPoint(new DOMPoint(x, y));
  return { x: p.x, y: p.y };
}

function signature() {
  const d = state.doc;
  return [state.zoom.toFixed(3), state.compare ? 'raw' : 'ed', state.tool === 'crop' ? 'nc' : 'c',
  d.rotStep, d.angle, d.flipH, d.flipV, JSON.stringify(d.crop),
  d.layers.map(l => l.id + ':' + l.rev + ':' + l.visible + ':' + l.opacity + ':' + l.blend).join(',')].join('|');
}

export function invalidate() { last.key = ''; }

export function requestRender(interactive) {
  if (interactive) interactiveUntil = performance.now() + 260;
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => { pending = false; paint(); });
}

let overlays = [];
export function addOverlay(fn) { overlays.push(fn); }

function paint() {
  if (!ctx) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!state.doc) { if (onAfter) onAfter(null); return; }

  const fast = performance.now() < interactiveUntil;
  const rs = Math.min(state.zoom * dpr, 2) * (fast ? 0.55 : 1);
  const key = signature() + '|' + rs.toFixed(3);
  let result = last.canvas;
  if (last.key !== key) {
    result = renderResult(rs, { raw: state.compare, ignoreCrop: state.tool === 'crop' });
    last = { key, canvas: result };
  }

  const o = origin(), out = outSize();
  const dx = o.x * dpr, dy = o.y * dpr;
  const dw = out.w * state.zoom * dpr, dh = out.h * state.zoom * dpr;

  // xadrez: mostra o que é transparente de verdade
  ctx.save();
  ctx.beginPath(); ctx.rect(dx, dy, dw, dh); ctx.clip();
  const sq = 12 * dpr;
  ctx.fillStyle = '#2a2d36'; ctx.fillRect(dx, dy, dw, dh);
  ctx.fillStyle = '#22252d';
  for (let y = 0; y < dh; y += sq) for (let x = ((y / sq) % 2) * sq; x < dw; x += sq * 2) ctx.fillRect(dx + x, dy + y, sq, sq);
  ctx.restore();

  ctx.imageSmoothingEnabled = state.zoom < 3;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(result, dx, dy, dw, dh);

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,.18)';
  ctx.lineWidth = 1;
  ctx.strokeRect(dx + .5, dy + .5, dw - 1, dh - 1);
  ctx.restore();

  overlays.forEach(fn => { ctx.save(); fn(ctx, { dpr, o, zoom: state.zoom, out }); ctx.restore(); });

  if (fast) requestRender();     // volta na resolução cheia quando o gesto parar
  if (onAfter) onAfter(result);
}

export function currentResult() { return last.canvas; }
export { dpr };
