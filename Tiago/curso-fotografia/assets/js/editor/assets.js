/* ============================================================
   FotoLab · assets.js
   Registro das imagens abertas. As camadas guardam só o ID —
   o bitmap fica aqui fora, porque o documento é serializado
   (JSON) no histórico e no salvamento automático.
   ============================================================ */

const registry = new Map();
let seq = 1;

export function addImage(img, name, dataURL) {
  const id = 'img' + (seq++);
  registry.set(id, { id, img, name: name || 'imagem', w: img.naturalWidth || img.width, h: img.naturalHeight || img.height, dataURL: dataURL || null });
  return id;
}
export function getImage(id) { return registry.get(id) || null; }
export function allImages() { return [...registry.values()]; }

export function loadFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) { reject(new Error('O arquivo "' + file.name + '" não é uma imagem.')); return; }
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('Não consegui ler o arquivo.'));
    fr.onload = () => {
      const img = new Image();
      img.onload = () => resolve({ id: addImage(img, file.name.replace(/\.[^.]+$/, ''), fr.result), img });
      img.onerror = () => reject(new Error('Formato de imagem não suportado pelo navegador (RAW da câmera, por exemplo, não abre aqui).'));
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
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
