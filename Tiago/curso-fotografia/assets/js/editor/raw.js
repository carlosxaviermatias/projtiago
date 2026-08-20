/* ============================================================
   FotoLab · raw.js
   Arquivos RAW (NEF, CR2, ARW, RAF…) não são imagens: são
   caixas. Dentro vêm os dados crus do sensor (que o navegador
   NÃO sabe revelar — isso é trabalho de um programa como o
   Lightroom) e, junto, uma ou mais **prévias em JPEG** que a
   própria câmera gravou.

   Quando o sistema "abre" um NEF no navegador, é uma dessas
   prévias que aparece — e costuma ser a menor delas. Daí a
   sensação de "ficou em baixa resolução".

   O que este módulo faz: varre os bytes do arquivo, acha TODAS
   as prévias JPEG e escolhe a maior. Não é revelação de RAW —
   é a melhor imagem que existe pronta lá dentro.
   ============================================================ */

export const RAW_EXT = /\.(nef|nrw|cr2|cr3|crw|arw|srf|sr2|raf|rw2|orf|pef|dng|rwl|srw|3fr|x3f|iiq|mrw|kdc|dcr)$/i;

export function isRawFile(file) {
  return RAW_EXT.test(file.name || '') || /raw|nikon|canon|sony|fuji|panasonic|olympus|adobe\.photoshop\.raw/i.test(file.type || '');
}

/** Todos os trechos que começam com FFD8FF (início de JPEG) e terminam em FFD9.
    Um NEF tem ~30 MB: percorrer byte a byte é lento, então varremos de 4 em 4
    (Uint32Array) e só olhamos byte a byte os blocos que contêm algum 0xFF —
    o mesmo truque de "tem byte zero nesta palavra?", aplicado ao complemento. */
function findJPEGs(buf) {
  const soi = [], eoi = [];
  const n = buf.length - 2;
  const check = (i) => {
    if (i >= n || buf[i] !== 0xFF) return;
    if (buf[i + 1] === 0xD8 && buf[i + 2] === 0xFF) soi.push(i);
    else if (buf[i + 1] === 0xD9) eoi.push(i + 2);
  };
  const nWords = buf.length >>> 2;
  const words = new Uint32Array(buf.buffer, buf.byteOffset, nWords);
  for (let w = 0; w < nWords; w++) {
    const v = ~words[w];
    if ((((v - 0x01010101) & ~v & 0x80808080) >>> 0) === 0) continue;   // sem 0xFF aqui
    const base = w << 2;
    check(base); check(base + 1); check(base + 2); check(base + 3);
  }
  for (let i = nWords << 2; i < n; i++) check(i);                        // sobra do fim
  const out = [];
  let k = 0;
  for (const s of soi) {
    while (k < eoi.length && eoi[k] <= s) k++;
    if (k < eoi.length) out.push({ start: s, end: eoi[k], size: eoi[k] - s });
  }
  return out.sort((a, b) => b.size - a.size).slice(0, 6);   // as maiores primeiro
}

function measure(blob) {
  return new Promise(res => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { res({ img, w: img.naturalWidth, h: img.naturalHeight, url }); };
    // os dados do sensor do Nikon também começam com FFD8 (é um JPEG sem perdas,
    // que navegador nenhum abre): esse candidato simplesmente falha e é ignorado
    img.onerror = () => { URL.revokeObjectURL(url); res(null); };
    img.src = url;
  });
}

/**
 * @returns {Promise<{img:HTMLImageElement,w:number,h:number,previews:number}|null>}
 */
export async function largestPreview(file) {
  let buf;
  try { buf = new Uint8Array(await file.arrayBuffer()); }
  catch (e) { return null; }
  const cands = findJPEGs(buf);
  if (!cands.length) return null;

  let best = null, ok = 0;
  for (const c of cands) {
    const r = await measure(new Blob([buf.subarray(c.start, c.end)], { type: 'image/jpeg' }));
    if (!r) continue;
    ok++;
    if (!best || r.w * r.h > best.w * best.h) {
      if (best) URL.revokeObjectURL(best.url);
      best = r;
    } else URL.revokeObjectURL(r.url);
  }
  return best ? { img: best.img, w: best.w, h: best.h, previews: ok } : null;
}
