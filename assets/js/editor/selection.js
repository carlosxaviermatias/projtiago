/* ============================================================
   FotoLab · selection.js
   A varinha mágica: escolhe pixels parecidos com o que você
   clicou e devolve uma MÁSCARA (0 = fora, 255 = dentro).

   Duas decisões que valem explicação:

   1) A seleção é guardada como PARÂMETROS (ponto clicado,
      tolerância, contígua, suavização), nunca como um desenho
      pronto. É a mesma ideia das pinceladas: assim ela vale para
      qualquer tamanho de saída e sobrevive ao salvar o projeto.

   2) A máscara é calculada numa RESOLUÇÃO DE REFERÊNCIA (no
      máximo 2000 px de lado) e depois esticada para o tamanho que
      estiver sendo desenhado. Isso garante que a pré-visualização e
      a exportação selecionem exatamente a mesma coisa — e mantém o
      arrastar da tolerância instantâneo, porque um preenchimento
      em 24 MP levaria segundos a cada mexida no controle.
   ============================================================ */

export const MASK_REF = 2000;

/** Escala em que a máscara é calculada (px do documento → px de referência). */
export function refScale(docW, docH) {
  return Math.min(1, MASK_REF / Math.max(docW, docH));
}

/**
 * @param {Uint8ClampedArray} src  pixels RGBA da camada (sem os ajustes dela)
 * @param {object} sel {x,y} no espaço de referência, tolerance 0..100,
 *                     contiguous, feather 0..50, invert
 * @returns {Uint8ClampedArray} máscara de w*h (0..255)
 */
export function buildMask(src, w, h, sel) {
  const mask = new Uint8ClampedArray(w * h);
  const sx = Math.max(0, Math.min(w - 1, Math.round(sel.x)));
  const sy = Math.max(0, Math.min(h - 1, Math.round(sel.y)));
  const seed = (sy * w + sx) * 4;
  const r0 = src[seed], g0 = src[seed + 1], b0 = src[seed + 2];
  // 441 = distância máxima possível entre duas cores em RGB (√(255²·3))
  const limit = (sel.tolerance / 100) * 441;
  const limit2 = limit * limit;

  const parecido = (i) => {
    const dr = src[i] - r0, dg = src[i + 1] - g0, db = src[i + 2] - b0;
    return dr * dr + dg * dg + db * db <= limit2;
  };

  if (sel.contiguous === false) {
    for (let p = 0, i = 0; p < w * h; p++, i += 4) if (parecido(i)) mask[p] = 255;
  } else {
    // preenchimento por linhas: empilha faixas inteiras em vez de pixel a
    // pixel — numa área grande, a pilha pixel a pixel estoura a memória
    const visto = new Uint8Array(w * h);
    const pilha = [sx, sy];
    while (pilha.length) {
      const y = pilha.pop(), x = pilha.pop();
      let esq = x;
      while (esq > 0 && !visto[y * w + esq - 1] && parecido((y * w + esq - 1) * 4)) esq--;
      let dir = x;
      while (dir < w - 1 && !visto[y * w + dir + 1] && parecido((y * w + dir + 1) * 4)) dir++;
      for (let i = esq; i <= dir; i++) { mask[y * w + i] = 255; visto[y * w + i] = 1; }
      for (const ny of [y - 1, y + 1]) {
        if (ny < 0 || ny >= h) continue;
        let dentro = false;
        for (let i = esq; i <= dir; i++) {
          const ok = !visto[ny * w + i] && parecido((ny * w + i) * 4);
          if (ok && !dentro) { pilha.push(i, ny); dentro = true; }
          else if (!ok) dentro = false;
        }
      }
    }
  }

  if (sel.feather > 0) featherMask(mask, w, h, Math.round(sel.feather / 50 * Math.max(2, Math.min(w, h) / 40)));
  if (sel.invert) for (let p = 0; p < mask.length; p++) mask[p] = 255 - mask[p];
  return mask;
}

/** Borda suave: sem isso o recorte fica com aquele serrilhado de tesoura. */
function featherMask(mask, w, h, r) {
  if (r < 1) return;
  const tmp = new Uint8ClampedArray(mask.length);
  const div = r * 2 + 1;
  for (let y = 0; y < h; y++) {
    let soma = 0;
    for (let i = -r; i <= r; i++) soma += mask[y * w + Math.min(w - 1, Math.max(0, i))];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = soma / div;
      soma += mask[y * w + Math.min(w - 1, x + r + 1)] - mask[y * w + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < w; x++) {
    let soma = 0;
    for (let i = -r; i <= r; i++) soma += tmp[Math.min(h - 1, Math.max(0, i)) * w + x];
    for (let y = 0; y < h; y++) {
      mask[y * w + x] = soma / div;
      soma += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
    }
  }
}

/** Máscara → canvas com alfa (para compor com as operações do canvas). */
export function maskToCanvas(mask, w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const img = new ImageData(w, h);
  const d = img.data;
  for (let p = 0, i = 0; p < mask.length; p++, i += 4) {
    d[i] = 255; d[i + 1] = 255; d[i + 2] = 255; d[i + 3] = mask[p];
  }
  c.getContext('2d').putImageData(img, 0, 0);
  return c;
}

/** Quanto da imagem a seleção pegou (para avisar quando não pegou nada). */
export function maskCoverage(mask) {
  let soma = 0;
  for (let p = 0; p < mask.length; p += 7) soma += mask[p];   // amostra: basta a ordem de grandeza
  return soma / (Math.ceil(mask.length / 7) * 255);
}
