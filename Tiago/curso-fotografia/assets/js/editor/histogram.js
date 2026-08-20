/* ============================================================
   FotoLab · histogram.js
   O histograma é o instrumento de medida do editor (o "fotômetro"
   da revelação). Desenha os 3 canais somados por transparência +
   a luminância, e acende os avisos de recorte nas pontas.
   ============================================================ */

import { histogram } from './pipeline.js?v=1';

export function drawHistogram(canvas, imgData) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.fillRect(0, 0, w, h);

  // grade dos quintos (as "zonas")
  ctx.strokeStyle = 'rgba(255,255,255,.10)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) {
    const x = Math.round(w * i / 5) + .5;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  if (!imgData) return null;

  const hist = histogram(imgData);
  // pico ignorando os extremos: uma foto com fundo preto chapado tem um
  // pico gigante no 0 que achataria todo o resto do gráfico
  let peak = 1;
  for (let i = 2; i < 254; i++) peak = Math.max(peak, hist.r[i], hist.g[i], hist.b[i]);
  peak = Math.max(peak, 1);

  const paint = (arr, color) => {
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let i = 0; i < 256; i++) {
      const x = i / 255 * w;
      const y = h - Math.min(1, Math.pow(arr[i] / peak, 0.62)) * (h - 2);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };
  ctx.globalCompositeOperation = 'lighter';
  paint(hist.r, 'rgba(232,80,72,.55)');
  paint(hist.g, 'rgba(88,192,139,.55)');
  paint(hist.b, 'rgba(90,150,232,.55)');
  ctx.globalCompositeOperation = 'source-over';

  ctx.beginPath();
  for (let i = 0; i < 256; i++) {
    const x = i / 255 * w;
    const y = h - Math.min(1, Math.pow(hist.l[i] / peak, 0.62)) * (h - 2);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'rgba(255,255,255,.75)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  let total = 0;
  for (let i = 0; i < 256; i++) total += hist.l[i];
  const clipLow = total ? (hist.l[0] + hist.l[1]) / total : 0;
  const clipHigh = total ? (hist.l[255] + hist.l[254]) / total : 0;
  return { clipLow, clipHigh };
}
