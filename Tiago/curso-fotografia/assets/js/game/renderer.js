/* ============================================================
   FotoQuest · renderer.js
   Helpers de desenho pixel-art: "assa" sprites definidos como
   matrizes de caracteres em canvases offscreen (1× por sessão)
   e oferece utilitários de texto/painel para as cenas.
   ============================================================ */

export const TILE = 48;          // tamanho do tile na tela (16px de arte × 3)
export const SCALE = 3;          // fator de escala da pixel art
export const VIEW_W = 960;       // resolução interna do canvas
export const VIEW_H = 540;

const bakeCache = new Map();

/**
 * Converte uma matriz de strings (16 linhas × 16 colunas) numa
 * imagem offscreen já escalada. `palette` mapeia caractere→cor;
 * espaço e "." são transparentes.
 */
export function bake(key, rows, palette, scale = SCALE) {
  if (bakeCache.has(key)) return bakeCache.get(key);
  const h = rows.length, w = rows[0].length;
  const cv = document.createElement("canvas");
  cv.width = w * scale; cv.height = h * scale;
  const c = cv.getContext("2d");
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (ch === "." || ch === " ") continue;
      const col = palette[ch];
      if (!col) continue;
      c.fillStyle = col;
      c.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  bakeCache.set(key, cv);
  return cv;
}

/** Assa um tile 48×48 desenhado por uma função `fn(ctx, size)`. */
export function bakeTile(key, fn) {
  if (bakeCache.has(key)) return bakeCache.get(key);
  const cv = document.createElement("canvas");
  cv.width = TILE; cv.height = TILE;
  fn(cv.getContext("2d"), TILE);
  bakeCache.set(key, cv);
  return cv;
}

export function getBaked(key) { return bakeCache.get(key); }

/* ---------- utilitários de UI no canvas ---------- */

export function panel(ctx, x, y, w, h, opts = {}) {
  ctx.save();
  ctx.fillStyle = opts.bg || "rgba(14,15,19,.88)";
  ctx.strokeStyle = opts.border || "#f4b03e";
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, opts.r ?? 10);
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function text(ctx, str, x, y, opts = {}) {
  ctx.save();
  ctx.font = `${opts.weight || 600} ${opts.size || 16}px Inter, sans-serif`;
  ctx.textAlign = opts.align || "left";
  ctx.textBaseline = opts.baseline || "top";
  if (opts.shadow !== false) {
    ctx.fillStyle = "rgba(0,0,0,.6)";
    ctx.fillText(str, x + 2, y + 2);
  }
  ctx.fillStyle = opts.color || "#eef0f4";
  ctx.fillText(str, x, y);
  ctx.restore();
}
