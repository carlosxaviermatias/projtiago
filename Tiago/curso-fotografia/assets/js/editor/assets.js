/* ============================================================
   FotoLab · assets.js
   Registro das imagens abertas. As camadas guardam só o ID —
   o bitmap fica aqui fora, porque o documento é serializado
   (JSON) no histórico e no salvamento automático.
   ============================================================ */

import { isRawFile, largestPreview } from './raw.js?v=2';

const registry = new Map();
let seq = 1;

export function addImage(img, name, dataURL) {
  const id = 'img' + (seq++);
  registry.set(id, { id, img, name: name || 'imagem', w: img.naturalWidth || img.width, h: img.naturalHeight || img.height, dataURL: dataURL || null });
  return id;
}
export function getImage(id) { return registry.get(id) || null; }
export function allImages() { return [...registry.values()]; }

/* URL de objeto, não base64: transformar um arquivo de 28 MB em data URL
   custa segundos (e o dobro de memória) só para descobrir, no fim, que o
   navegador nem sabe abrir aquele RAW. O data URL, quando for preciso para
   salvar o projeto, é gerado depois por ensureDataURL(). */
function decodeNormally(file) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, dataURL: null });
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

/**
 * Abre o arquivo. Em RAW, o navegador não revela o negativo digital: o máximo
 * que existe pronto lá dentro são as prévias JPEG da câmera. Pegamos a MAIOR
 * delas e comparamos com o que o próprio navegador conseguiu decodificar
 * (o Safari no Mac, por exemplo, às vezes entrega a prévia pequena sozinho) —
 * fica valendo a de maior resolução.
 * O resultado traz `raw` para a interface poder explicar o que aconteceu.
 */
export async function loadFromFile(file) {
  const name = file.name || 'imagem';
  const raw = isRawFile(file);
  if (!raw && file.type && !file.type.startsWith('image/')) {
    throw new Error('O arquivo "' + name + '" não é uma imagem.');
  }

  // Em RAW, procurar a prévia PRIMEIRO: é o caminho que quase sempre vence, e
  // assim não pagamos a decodificação (que vai falhar) do arquivo inteiro.
  let preview = null;
  if (raw) {
    try { preview = await largestPreview(file); } catch (e) { preview = null; }
  }
  // Só vale conferir o que o navegador faz sozinho se não achamos prévia ou se
  // ela veio pequena — há sistemas (macOS) que entregam algo melhor.
  const direct = (!raw || !preview || Math.max(preview.w, preview.h) < 1600)
    ? await decodeNormally(file) : null;

  const dPx = direct ? direct.img.naturalWidth * direct.img.naturalHeight : 0;
  const pPx = preview ? preview.w * preview.h : 0;

  if (preview && pPx >= dPx) {
    const id = addImage(preview.img, name.replace(/\.[^.]+$/, ''), null);
    return { id, img: preview.img, raw: { previews: preview.previews, w: preview.w, h: preview.h, browser: dPx ? { w: direct.img.naturalWidth, h: direct.img.naturalHeight } : null } };
  }
  if (direct) {
    const id = addImage(direct.img, name.replace(/\.[^.]+$/, ''), direct.dataURL);
    return { id, img: direct.img, raw: raw ? { previews: 0, w: direct.img.naturalWidth, h: direct.img.naturalHeight, browser: null } : null };
  }
  throw new Error(raw
    ? 'Não achei nenhuma prévia legível dentro deste RAW. Exporte um JPG ou TIFF pelo programa da câmera (ou pelo Lightroom/Camera Raw) e abra aqui.'
    : 'Formato de imagem não suportado pelo navegador.');
}

export function loadFromURL(url, name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve({ id: addImage(img, name), img });
    img.onerror = () => reject(new Error('Não consegui carregar ' + url));
    img.src = url;
  });
}

/* Converte a imagem para dataURL quando ela veio de arquivo do site,
   para o salvamento automático conseguir restaurar depois. */
export function ensureDataURL(id) {
  const a = registry.get(id);
  if (!a) return null;
  if (a.dataURL) return a.dataURL;
  try {
    const c = document.createElement('canvas');
    c.width = a.w; c.height = a.h;
    c.getContext('2d').drawImage(a.img, 0, 0);
    a.dataURL = c.toDataURL('image/jpeg', 0.85);
    return a.dataURL;
  } catch (e) { return null; }
}

export function restoreImage(id, dataURL, name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      registry.set(id, { id, img, name: name || 'imagem', w: img.naturalWidth, h: img.naturalHeight, dataURL });
      const n = parseInt(String(id).replace(/\D/g, ''), 10);
      if (n >= seq) seq = n + 1;
      resolve(id);
    };
    img.onerror = reject;
    img.src = dataURL;
  });
}
