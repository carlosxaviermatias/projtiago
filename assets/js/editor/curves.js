/* ============================================================
   FotoLab · curves.js
   Editor de curvas. Arrastar cria/move pontos; duplo toque remove.
   A curva é o controle mais completo do editor: contraste, brilho e
   dominante de cor saem todos daqui.
   ============================================================ */

import { curveLUT } from './pipeline.js?v=7';

const CH = [['rgb', 'RGB', '#eef0f4'], ['r', 'R', '#e85048'], ['g', 'G', '#58c08b'], ['b', 'B', '#5a96e8']];

export function createCurveEditor(host, { get, set, onBegin, onEnd }) {
  host.innerHTML =
    '<div class="fl-curve-tabs">' + CH.map((c, i) =>
      '<button type="button" data-ch="' + c[0] + '" class="fl-chip' + (i === 0 ? ' on' : '') + '" style="--c:' + c[2] + '">' + c[1] + '</button>').join('') +
    '</div>' +
    '<canvas class="fl-curve-canvas" width="260" height="260"></canvas>' +
    '<div class="fl-curve-foot"><span class="fl-hint">Arraste para criar pontos · duplo clique remove · a diagonal é a foto sem mexer</span>' +
    '<button type="button" class="fl-mini" data-act="reset">Zerar curva</button></div>';

  const canvas = host.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  let ch = 'rgb', drag = -1;

  host.querySelectorAll('[data-ch]').forEach(b => b.addEventListener('click', () => {
    ch = b.dataset.ch;
    host.querySelectorAll('[data-ch]').forEach(x => x.classList.toggle('on', x === b));
    draw();
  }));
  host.querySelector('[data-act="reset"]').addEventListener('click', () => {
    onBegin && onBegin('Zerar curva');
    const c = get(); c[ch] = [[0, 0], [255, 255]];
    set(c); onEnd && onEnd(); draw();
  });

  function pos(ev) {
    const r = canvas.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width * 255;
    const y = 255 - (ev.clientY - r.top) / r.height * 255;
    return [Math.max(0, Math.min(255, x)), Math.max(0, Math.min(255, y))];
  }
  function nearest(p, pts) {
    let best = -1, bd = 1e9;
    pts.forEach((q, i) => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < bd) { bd = d; best = i; } });
    return bd < 22 ? best : -1;
  }

  canvas.addEventListener('pointerdown', ev => {
    ev.preventDefault();
    canvas.setPointerCapture(ev.pointerId);
    const c = get(), pts = c[ch], p = pos(ev);
    let i = nearest(p, pts);
    onBegin && onBegin('Curva');
    if (i < 0) {
      pts.push(p);
      pts.sort((a, b) => a[0] - b[0]);
      i = pts.indexOf(p);
    }
    drag = i;
    set(c); draw();
  });
  canvas.addEventListener('pointermove', ev => {
    if (drag < 0) return;
    const c = get(), pts = c[ch], p = pos(ev);
    const first = drag === 0, last = drag === pts.length - 1;
    // as pontas só sobem e descem: se pudessem andar na horizontal, a curva
    // deixaria de cobrir toda a faixa de tons e o resultado ficaria chapado
    pts[drag] = [first ? 0 : last ? 255 : Math.max(pts[drag - 1][0] + 2, Math.min(pts[drag + 1][0] - 2, p[0])), p[1]];
    set(c); draw();
  });
  const stop = () => { if (drag >= 0) { drag = -1; onEnd && onEnd(); } };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);
  canvas.addEventListener('dblclick', ev => {
    const c = get(), pts = c[ch], i = nearest(pos(ev), pts);
    if (i > 0 && i < pts.length - 1) { onBegin && onBegin('Remover ponto'); pts.splice(i, 1); set(c); onEnd && onEnd(); draw(); }
  });

  function draw() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,.10)';
    for (let i = 1; i < 4; i++) {
      const p = Math.round(w * i / 4) + .5;
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, h); ctx.moveTo(0, p); ctx.lineTo(w, p); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,.22)';
    ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(w, 0); ctx.stroke();

    const c = get();
    CH.forEach(([k, , color]) => {
      if (k !== ch && isIdent(c[k])) return;
      const lut = curveLUT(c[k]);
      ctx.beginPath();
      for (let i = 0; i < 256; i++) {
        const x = i / 255 * w, y = h - lut[i] / 255 * h;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = k === ch ? color : color + '55';
      ctx.lineWidth = k === ch ? 2 : 1;
      ctx.stroke();
    });

    const color = (CH.find(x => x[0] === ch) || CH[0])[2];
    c[ch].forEach(p => {
      const x = p[0] / 255 * w, y = h - p[1] / 255 * h;
      ctx.beginPath(); ctx.arc(x, y, 5, 0, 7);
      ctx.fillStyle = color; ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 1.5; ctx.stroke();
    });
  }
  function isIdent(p) { return p.length === 2 && p[0][1] === 0 && p[1][1] === 255; }

  draw();
  return { draw };
}
