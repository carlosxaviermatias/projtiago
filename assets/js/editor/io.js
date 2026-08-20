/* ============================================================
   FotoLab · io.js
   Abrir, exportar e guardar o projeto.

   O projeto (.fotolab) é um JSON com o documento + as imagens em
   base64 — o mesmo papel do .psd: guarda as CAMADAS e os ajustes,
   não a foto achatada. Já a exportação (JPG/PNG/WebP) é a foto
   pronta, no tamanho real.
   ============================================================ */

import { state, newDoc, makeLayer, clearHistory, emit } from './state.js?v=3';
import { addImage, getImage, loadFromFile, loadFromURL, ensureDataURL, restoreImage } from './assets.js?v=3';
import { isRawFile } from './raw.js?v=3';
import { renderResult, resultSize, invalidateAll } from './render.js?v=3';

export const SAMPLES = [
  { file: 'assets/img/deco/hora-dourada.jpg', name: 'Hora dourada', hint: 'Trabalhe a temperatura e a vinheta.' },
  { file: 'assets/img/deco/cidade-noite.jpg', name: 'Cidade à noite', hint: 'Sombras e ruído: teste grão e altas luzes.' },
  { file: 'assets/img/deco/preto-branco-rua.jpg', name: 'Rua em P&B', hint: 'Curva em S e contraste.' },
  { file: 'assets/img/deco/comida.jpg', name: 'Gastronomia', hint: 'Cor e textura para dar fome.' },
  { file: 'assets/img/tecnica/luz-janela-retrato.jpg', name: 'Retrato na janela', hint: 'Pele: textura negativa e sombras.' },
  { file: 'assets/img/tecnica/profundidade-bokeh.jpg', name: 'Bokeh', hint: 'Desfoque e separação do fundo.' },
  { file: 'assets/img/tecnica/estudio-softbox.jpg', name: 'Estúdio', hint: 'Luz controlada: ajuste fino.' },
  { file: 'assets/img/segmentos/produtos.jpg', name: 'Produto', hint: 'Fundo limpo e nitidez.' },
  { file: 'assets/img/obras/lange-mae-migrante.jpg', name: 'Mãe Migrante (Lange)', hint: 'Domínio público. Clarear/queimar como no laboratório.' },
  {
    file: 'assets/img/raw/DSC_0146.NEF', name: 'Arquivo RAW (NEF)', raw: true,
    thumb: 'assets/img/raw/DSC_0146-thumb.jpg', peso: '17 MB',
    hint: 'Foto original do professor, direto da Nikon D5300 — sem passar por JPG. Abre a prévia de 6000×4000 que está dentro do arquivo. Baixe no Wi-Fi.'
  }
];

export function docFromImage(assetId, name) {
  const a = getImage(assetId);
  const doc = newDoc(a.w, a.h);
  const layer = makeLayer({ type: 'image', name: name || a.name, asset: assetId });
  doc.layers.push(layer);
  state.doc = doc;
  state.activeId = layer.id;
  state.cropDraft = null;
  clearHistory();
  return doc;
}

export async function openFileAsDocument(file) {
  const r = await loadFromFile(file);
  docFromImage(r.id);
  return r;                       // traz `raw` para a interface explicar o caso RAW
}
export async function openSample(sample) {
  if (sample.raw) {
    // RAW não pode ir por <img>: o navegador não decodifica. Baixamos os bytes
    // e usamos o mesmo caminho de um arquivo escolhido pelo aluno, que procura
    // a maior prévia embutida.
    const resp = await fetch(sample.file);
    if (!resp.ok) throw new Error('Não consegui baixar o arquivo de exemplo.');
    const blob = await resp.blob();
    const info = await loadFromFile(new File([blob], sample.file.split('/').pop(), { type: '' }));
    docFromImage(info.id, sample.name);
    return info;
  }
  const { id } = await loadFromURL(sample.file, sample.name);
  docFromImage(id);
  return { id, raw: null };
}
export async function addFileAsLayer(file) {
  const r = await loadFromFile(file);
  const id = r.id;
  const a = getImage(id);
  // encaixa a nova imagem dentro do documento em vez de deixá-la estourando a tela
  const s = Math.min(1, state.doc.w / a.w, state.doc.h / a.h);
  const layer = makeLayer({
    type: 'image', name: a.name, asset: id, scale: s,
    x: (state.doc.w - a.w * s) / 2, y: (state.doc.h - a.h * s) / 2
  });
  state.doc.layers.push(layer);
  state.activeId = layer.id;
  return layer;
}

export function looksRaw(file) { return isRawFile(file); }

/** Frase para o aluno entender o que veio do arquivo (e por que). */
export function openReport(info, name) {
  const a = getImage(info.id);
  if (!info.raw) return 'Foto aberta: <b>' + a.w + ' × ' + a.h + ' px</b>.';
  if (!info.raw.previews) {
    return '⚠️ <b>RAW</b>: o navegador não revela o negativo digital — abriu a prévia de <b>' +
      a.w + ' × ' + a.h + ' px</b> que veio no arquivo.';
  }
  const pequena = Math.max(a.w, a.h) < 1600;
  return '<b>RAW</b> ' + (name ? '(' + name.split('.').pop().toUpperCase() + ') ' : '') +
    '— o navegador não revela o negativo digital, então usei a <b>maior prévia embutida</b> da câmera: <b>' +
    a.w + ' × ' + a.h + ' px</b>.' +
    (pequena ? ' Sua câmera grava prévia pequena: para editar em alta resolução, exporte um JPG ou TIFF pelo programa da câmera.' : '');
}

/* ---------- exportar imagem ---------- */
export function exportBlob({ type = 'image/jpeg', quality = 0.92, maxSide = 0 } = {}) {
  const size = resultSize();
  let scale = 1;
  if (maxSide && Math.max(size.w, size.h) > maxSide) scale = maxSide / Math.max(size.w, size.h);
  const canvas = renderResult(scale, { flatten: type === 'image/jpeg' ? '#ffffff' : null });
  return new Promise(res => canvas.toBlob(b => res({ blob: b, w: canvas.width, h: canvas.height }), type, quality));
}

export function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* ---------- projeto ---------- */
export function projectJSON() {
  const used = new Set();
  state.doc.layers.forEach(l => { if (l.asset) used.add(l.asset); });
  const images = {};
  used.forEach(id => {
    const a = getImage(id);
    const url = ensureDataURL(id);
    if (url) images[id] = { name: a.name, dataURL: url };
  });
  return JSON.stringify({ app: 'fotolab', version: 1, doc: state.doc, activeId: state.activeId, images });
}

export async function loadProject(text) {
  const o = JSON.parse(text);
  if (!o || o.app !== 'fotolab') throw new Error('Esse arquivo não é um projeto do FotoLab.');
  await Promise.all(Object.entries(o.images || {}).map(([id, v]) => restoreImage(id, v.dataURL, v.name)));
  state.doc = o.doc;
  state.activeId = o.activeId || (o.doc.layers[0] && o.doc.layers[0].id);
  state.cropDraft = null;
  clearHistory();
  invalidateAll();
  emit();
}

/* ---------- sessão automática (IndexedDB: o localStorage não aguenta fotos) ---------- */
const DB = 'fotolab', STORE = 'sessao';
function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
export async function saveSession() {
  if (!state.doc) return;
  try {
    const db = await idb();
    await new Promise((res, rej) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put({ at: Date.now(), json: projectJSON() }, 'last');
      tx.oncomplete = res; tx.onerror = () => rej(tx.error);
    });
  } catch (e) { /* modo anônimo, cota cheia… não é motivo para quebrar o editor */ }
}
export async function readSession() {
  try {
    const db = await idb();
    return await new Promise((res, rej) => {
      const tx = db.transaction(STORE, 'readonly');
      const g = tx.objectStore(STORE).get('last');
      g.onsuccess = () => res(g.result || null);
      g.onerror = () => rej(g.error);
    });
  } catch (e) { return null; }
}
export async function clearSession() {
  try {
    const db = await idb();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete('last');
  } catch (e) { }
}
