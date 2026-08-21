/* ============================================================
   FotoLab · state.js
   O documento do editor e o histórico (desfazer/refazer).

   O documento é 100% NÃO DESTRUTIVO: nada é "aplicado" no pixel.
   Cada camada guarda os ajustes, a curva e as PINCELADAS EM VETOR
   (lista de pontos). Assim o mesmo documento é rasterizado tanto na
   pré-visualização (pequena, rápida) quanto na exportação (tamanho
   real) sem perder qualidade — e desfazer é só voltar um instantâneo.
   ============================================================ */

export const ADJ_DEFAULTS = {
  exposure: 0, contrast: 0, highlights: 0, shadows: 0, whites: 0, blacks: 0,
  temp: 0, tint: 0, saturation: 0, vibrance: 0,
  clarity: 0, sharpen: 0, blur: 0, grain: 0, vignette: 0,
  bw: false, bwFilter: 'none', bwTone: 'none'
};

export const BLEND_MODES = [
  ['source-over', 'Normal'],
  ['multiply', 'Multiplicar'],
  ['screen', 'Divisão (screen)'],
  ['overlay', 'Sobrepor'],
  ['soft-light', 'Luz suave'],
  ['hard-light', 'Luz forte'],
  ['color-dodge', 'Subexposição de cor'],
  ['color-burn', 'Superexposição de cor'],
  ['darken', 'Escurecer'],
  ['lighten', 'Clarear'],
  ['difference', 'Diferença'],
  ['hue', 'Matiz'],
  ['saturation', 'Saturação'],
  ['color', 'Cor'],
  ['luminosity', 'Luminosidade']
];

export function newCurve() {
  return { rgb: [[0, 0], [255, 255]], r: [[0, 0], [255, 255]], g: [[0, 0], [255, 255]], b: [[0, 0], [255, 255]] };
}

let idSeq = 1;
export function nextId(p) { return (p || 'l') + (idSeq++) + '_' + Math.random().toString(36).slice(2, 6); }

export function makeLayer(o = {}) {
  return Object.assign({
    id: nextId('l'),
    name: 'Camada',
    type: 'paint',          // 'image' | 'paint' | 'text' | 'fill'
    visible: true,
    opacity: 100,
    blend: 'source-over',
    asset: null,            // id no registro de imagens (type 'image')
    x: 0, y: 0, scale: 1, rot: 0,   // posicionamento (type 'image' e 'text')
    color: '#f4b03e',       // fill / text
    text: { content: 'Texto', size: 64, font: 'Fraunces, Georgia, serif', weight: 700, align: 'left' },
    mask: null,             // seleção fixada na camada: {…parâmetros da varinha…, mode:'adjust'|'clip'}
    adj: Object.assign({}, ADJ_DEFAULTS),
    curve: newCurve(),
    strokes: [],            // {mode,size,hardness,flow,color,pts:[[x,y],…]}
    rev: 1                  // muda a cada alteração → invalida o cache de rasterização
  }, o);
}

export const state = {
  doc: null,
  activeId: null,
  tool: 'move',
  zoom: 1, panX: 0, panY: 0, fitZoom: 1, fitted: true,
  compare: false,           // segurar para ver o "antes"
  cropDraft: null,          // {x,y,w,h} enquanto a ferramenta corte está aberta
  cropAspect: 'free',
  brush: { size: 90, hardness: 60, flow: 70, color: '#ffffff' },
  wand: { tolerance: 18, contiguous: true, feather: 6, invert: false },
  selection: null,          // {x,y,tolerance,contiguous,feather,invert,layerId}
  dirty: false
};

export function newDoc(w, h) {
  return {
    w, h,
    rotStep: 0,             // 0..3 (múltiplos de 90°)
    angle: 0,               // nivelamento fino (graus)
    flipH: false, flipV: false,
    crop: null,             // {x,y,w,h} no espaço já rotacionado
    bg: 'transparent',
    layers: []
  };
}

export function activeLayer() {
  if (!state.doc) return null;
  return state.doc.layers.find(l => l.id === state.activeId) || null;
}

export function touch(layer) { if (layer) layer.rev++; state.dirty = true; }

/* ---------- histórico ---------- */
const history = { past: [], future: [], limit: 40 };
let pending = null;

function snap() { return JSON.stringify({ doc: state.doc, activeId: state.activeId }); }

/** Guarda o estado ANTES de uma alteração. label aparece no painel Histórico. */
/* Não dispara emit(): quem chama é que decide quando atualizar a interface.
   Um emit() aqui fazia a interface se re-sincronizar ANTES da alteração — e o
   refresh reescrevia o <select>/<input> com o valor antigo, de modo que o
   próprio manipulador lia o valor já revertido e a mudança "não pegava". */
export function pushHistory(label) {
  if (!state.doc) return;
  history.past.push({ label, data: snap() });
  if (history.past.length > history.limit) history.past.shift();
  history.future.length = 0;
}

/** Para arrastar sliders: guarda uma vez só no início do gesto. */
export function beginChange(label) {
  if (pending === label) return;
  pending = label;
  pushHistory(label);
}
export function endChange() { pending = null; }

function restore(entry) {
  const o = JSON.parse(entry.data);
  state.doc = o.doc;
  state.activeId = o.activeId;
  // objetos novos → todo cache de camada precisa cair
  state.doc.layers.forEach(l => { l.rev = (l.rev || 1) + 1000; });
}

export function undo() {
  if (!history.past.length) return false;
  const cur = { label: 'Refazer', data: snap() };
  const e = history.past.pop();
  history.future.push(cur);
  restore(e);
  emit();
  return true;
}
export function redo() {
  if (!history.future.length) return false;
  history.past.push({ label: 'Desfazer', data: snap() });
  const e = history.future.pop();
  restore(e);
  emit();
  return true;
}
export function historyInfo() { return { canUndo: history.past.length > 0, canRedo: history.future.length > 0, past: history.past.map(p => p.label) }; }
export function clearHistory() { history.past.length = 0; history.future.length = 0; }

/* ---------- eventos ---------- */
const listeners = new Set();
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function emit() { listeners.forEach(fn => fn()); }
