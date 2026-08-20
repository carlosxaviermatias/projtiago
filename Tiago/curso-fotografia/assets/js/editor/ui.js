/* ============================================================
   FotoLab · ui.js
   Constrói e sincroniza os painéis. Nada de framework: o HTML
   traz o esqueleto (editor.html) e aqui preenchemos o miolo e
   ligamos os eventos.
   ============================================================ */

import { state, activeLayer, makeLayer, beginChange, endChange, pushHistory, touch, emit, historyInfo, ADJ_DEFAULTS, BLEND_MODES, newCurve } from './state.js?v=1';
import { GROUPS, BW } from './adjustments.js?v=1';
import { PRESETS } from './presets.js?v=1';
import { createCurveEditor } from './curves.js?v=1';
import { drawHistogram } from './histogram.js?v=1';
import * as vp from './viewport.js?v=1';
import * as tools from './tools.js?v=1';
import { resultSize, straightenCrop } from './render.js?v=1';

const $ = s => document.querySelector(s);
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

export const TOOLS = [
  { id: 'move', icon: '✥', name: 'Mover', key: 'V', hint: 'Arrasta a camada selecionada.' },
  { id: 'crop', icon: '⬚', name: 'Cortar', key: 'C', hint: 'Recorta e endireita. A grade dos terços aparece sozinha.' },
  { id: 'brush', icon: '🖌', name: 'Pincel', key: 'B', hint: 'Pinta na camada selecionada.' },
  { id: 'eraser', icon: '🧽', name: 'Borracha', key: 'E', hint: 'Apaga pixels da camada — bom para revelar a camada de baixo.' },
  { id: 'dodge', icon: '◐', name: 'Clarear', key: 'D', hint: 'Clareia só onde você passa (o "dodge" do laboratório).' },
  { id: 'burn', icon: '◑', name: 'Queimar', key: 'Q', hint: 'Escurece só onde você passa (o "burn" do laboratório).' },
  { id: 'text', icon: 'T', name: 'Texto', key: 'T', hint: 'Crie e mova camadas de texto (marca d\'água, título).' },
  { id: 'hand', icon: '✋', name: 'Navegar', key: 'H', hint: 'Arrasta a imagem. Atalho: segure ESPAÇO em qualquer ferramenta.' }
];

let curveEditor = null;
let notify = () => { };
export function setNotifier(fn) { notify = fn; }

/* ---------- construção ---------- */
export function buildUI(app) {
  buildToolRail(app);
  buildAdjustments(app);
  buildPresets(app);
  buildCurves(app);
  buildLayersPanel(app);
  buildTabs();
  buildOptionsBar(app);
}

function buildToolRail(app) {
  const rail = $('#flTools');
  rail.innerHTML = '';
  TOOLS.forEach(t => {
    const b = el('button', 'fl-tool', '<span class="fl-tool-ico">' + t.icon + '</span><span class="fl-tool-name">' + t.name + '</span>');
    b.type = 'button';
    b.dataset.tool = t.id;
    b.title = t.name + ' (' + t.key + ') — ' + t.hint;
    b.addEventListener('click', () => app.setTool(t.id));
    rail.appendChild(b);
  });
}

function sliderRow(item, app) {
  const row = el('div', 'fl-row');
  row.dataset.key = item.key;
  row.innerHTML =
    '<div class="fl-row-head">' +
    '<button type="button" class="fl-q" title="O que faz?">?</button>' +
    '<span class="fl-row-label">' + item.label + '</span>' +
    '<output class="fl-row-val">0</output>' +
    '</div>' +
    '<input type="range" min="' + item.min + '" max="' + item.max + '" step="1" value="0">' +
    '<p class="fl-row-help">' + item.help + '</p>';
  const input = row.querySelector('input');
  const out = row.querySelector('output');

  const commit = (interactive) => {
    const l = activeLayer();
    if (!l) return;
    l.adj[item.key] = +input.value;
    out.value = fmt(+input.value);
    touch(l);
    vp.requestRender(interactive);
    refreshHistogramSoon();
  };
  input.addEventListener('pointerdown', () => beginChange('Ajuste: ' + item.label));
  input.addEventListener('keydown', () => beginChange('Ajuste: ' + item.label));
  input.addEventListener('input', () => commit(true));
  input.addEventListener('change', () => { commit(false); endChange(); emit(); });
  row.querySelector('.fl-q').addEventListener('click', () => row.classList.toggle('open'));
  row.querySelector('.fl-row-label').addEventListener('dblclick', () => {
    beginChange('Zerar ' + item.label);
    input.value = ADJ_DEFAULTS[item.key];
    commit(false); endChange(); emit();
  });
  return row;
}
const fmt = v => (v > 0 ? '+' : '') + v;

function buildAdjustments(app) {
  const host = $('#flAdjust');
  host.innerHTML = '';
  GROUPS.forEach(g => {
    const sec = el('section', 'fl-group' + (g.open ? ' open' : ''));
    const head = el('button', 'fl-group-head', '<span>' + g.icon + ' ' + g.title + '</span><span class="fl-caret">▾</span>');
    head.type = 'button';
    head.addEventListener('click', () => sec.classList.toggle('open'));
    sec.appendChild(head);
    const body = el('div', 'fl-group-body');
    if (g.help) {
      body.appendChild(el('p', 'fl-group-help', g.help +
        (g.link ? ' <a href="' + g.link.href + '" target="_blank" rel="noopener">' + g.link.text + ' ↗</a>' : '')));
    }
    g.items.forEach(item => body.appendChild(sliderRow(item, app)));
    if (g.id === 'cor') body.appendChild(bwBlock(app));
    sec.appendChild(body);
    host.appendChild(sec);
  });
}

function bwBlock(app) {
  const box = el('div', 'fl-bw');
  box.innerHTML =
    '<label class="fl-check"><input type="checkbox" id="flBW"> <span>Preto e branco</span></label>' +
    '<div class="fl-bw-opts">' +
    '<label class="fl-field"><span>Filtro</span><select id="flBWFilter">' + BW.filters.map(f => '<option value="' + f[0] + '">' + f[1] + '</option>').join('') + '</select></label>' +
    '<label class="fl-field"><span>Viragem</span><select id="flBWTone">' + BW.tones.map(f => '<option value="' + f[0] + '">' + f[1] + '</option>').join('') + '</select></label>' +
    '</div><p class="fl-row-help open">' + BW.help + '</p>';
  const set = (k, v, label) => {
    const l = activeLayer(); if (!l) return;
    pushHistory(label);
    l.adj[k] = v; touch(l); vp.requestRender(); refreshHistogramSoon(); emit();
  };
  box.querySelector('#flBW').addEventListener('change', e => set('bw', e.target.checked, 'Preto e branco'));
  box.querySelector('#flBWFilter').addEventListener('change', e => set('bwFilter', e.target.value, 'Filtro P&B'));
  box.querySelector('#flBWTone').addEventListener('change', e => set('bwTone', e.target.value, 'Viragem'));
  return box;
}

function buildPresets(app) {
  const host = $('#flPresets');
  host.innerHTML = '';
  PRESETS.forEach(p => {
    const b = el('button', 'fl-preset', '<b>' + p.name + '</b><span>' + p.desc + '</span>');
    b.type = 'button';
    b.addEventListener('click', () => {
      const l = activeLayer();
      if (!l) { notify('Abra uma foto primeiro.'); return; }
      pushHistory('Predefinição: ' + p.name);
      l.adj = Object.assign({}, ADJ_DEFAULTS, p.adj);
      touch(l); vp.requestRender(); emit();
      notify('Predefinição “' + p.name + '” aplicada. Abra o painel Ajustes para ver a receita.');
    });
    host.appendChild(b);
  });
}

function buildCurves(app) {
  curveEditor = createCurveEditor($('#flCurves'), {
    get: () => { const l = activeLayer(); return l ? l.curve : newCurve(); },
    set: () => { const l = activeLayer(); if (l) { touch(l); vp.requestRender(true); refreshHistogramSoon(); } },
    onBegin: label => beginChange(label),
    onEnd: () => { endChange(); emit(); }
  });
}

function buildLayersPanel(app) {
  $('#flLayerAdd').addEventListener('click', () => {
    pushHistory('Nova camada');
    const l = makeLayer({ name: 'Camada ' + (state.doc.layers.length + 1), type: 'paint' });
    state.doc.layers.push(l); state.activeId = l.id; emit(); vp.requestRender();
  });
  $('#flLayerText').addEventListener('click', () => {
    pushHistory('Camada de texto');
    const l = makeLayer({
      name: 'Texto', type: 'text', color: '#ffffff',
      x: Math.round(state.doc.w * 0.08), y: Math.round(state.doc.h * 0.8)
    });
    l.text.size = Math.max(18, Math.round(state.doc.h / 14));
    l.text.content = 'Seu nome · Foto';
    state.doc.layers.push(l); state.activeId = l.id;
    app.setTool('text'); emit(); vp.requestRender();
  });
  $('#flLayerImg').addEventListener('click', () => app.addImageLayer());
  $('#flLayerDup').addEventListener('click', () => {
    const l = activeLayer(); if (!l) return;
    pushHistory('Duplicar camada');
    const c = JSON.parse(JSON.stringify(l));
    c.id = 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    c.name = l.name + ' (cópia)';
    state.doc.layers.splice(state.doc.layers.indexOf(l) + 1, 0, c);
    state.activeId = c.id; emit(); vp.requestRender();
  });
  $('#flLayerDel').addEventListener('click', () => {
    const l = activeLayer(); if (!l) return;
    if (state.doc.layers.length === 1) { notify('O documento precisa de pelo menos uma camada.'); return; }
    pushHistory('Excluir camada');
    const i = state.doc.layers.indexOf(l);
    state.doc.layers.splice(i, 1);
    state.activeId = (state.doc.layers[i] || state.doc.layers[i - 1]).id;
    emit(); vp.requestRender();
  });
  $('#flLayerUp').addEventListener('click', () => moveLayer(1));
  $('#flLayerDown').addEventListener('click', () => moveLayer(-1));
}
function moveLayer(dir) {
  const l = activeLayer(); if (!l) return;
  const i = state.doc.layers.indexOf(l), j = i + dir;
  if (j < 0 || j >= state.doc.layers.length) return;
  pushHistory('Reordenar camadas');
  state.doc.layers.splice(i, 1);
  state.doc.layers.splice(j, 0, l);
  emit(); vp.requestRender();
}

function buildTabs() {
  document.querySelectorAll('.fl-tab').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('.fl-tab').forEach(x => x.classList.toggle('on', x === t));
    document.querySelectorAll('.fl-pane').forEach(p => p.classList.toggle('on', p.dataset.pane === t.dataset.tab));
    if (t.dataset.tab === 'curvas' && curveEditor) curveEditor.draw();
  }));
}

/* ---------- barra de opções da ferramenta ---------- */
function buildOptionsBar(app) {
  const host = $('#flOptions');
  host.innerHTML =
    '<div class="fl-opt" data-for="paint">' +
    field('Tamanho', '<input type="range" id="flBrushSize" min="2" max="600" value="90"><output id="flBrushSizeV">90</output>') +
    field('Dureza', '<input type="range" id="flBrushHard" min="0" max="100" value="60"><output id="flBrushHardV">60</output>') +
    field('Força', '<input type="range" id="flBrushFlow" min="1" max="100" value="70"><output id="flBrushFlowV">70</output>') +
    '<label class="fl-field" id="flBrushColorWrap"><span>Cor</span><input type="color" id="flBrushColor" value="#ffffff"></label>' +
    '</div>' +
    '<div class="fl-opt" data-for="crop">' +
    '<span class="fl-opt-label">Proporção</span><div class="fl-chips" id="flAspects"></div>' +
    field('Endireitar', '<input type="range" id="flAngle" min="-45" max="45" step="0.1" value="0"><output id="flAngleV">0°</output>') +
    '<div class="fl-opt-actions">' +
    '<button type="button" class="fl-mini" id="flRotL">⟲ 90°</button>' +
    '<button type="button" class="fl-mini" id="flRotR">⟳ 90°</button>' +
    '<button type="button" class="fl-mini" id="flFlipH">⇄ Espelhar</button>' +
    '<button type="button" class="fl-mini" id="flCropReset">Tudo</button>' +
    '<button type="button" class="fl-mini primary" id="flCropApply">Aplicar corte</button>' +
    '</div></div>' +
    '<div class="fl-opt" data-for="text">' +
    '<label class="fl-field grow"><span>Texto</span><input type="text" id="flTextContent" placeholder="Digite aqui"></label>' +
    field('Tamanho', '<input type="range" id="flTextSize" min="8" max="400" value="64"><output id="flTextSizeV">64</output>') +
    '<label class="fl-field"><span>Cor</span><input type="color" id="flTextColor" value="#ffffff"></label>' +
    '<label class="fl-field"><span>Fonte</span><select id="flTextFont">' +
    '<option value="Fraunces, Georgia, serif">Fraunces</option><option value="Inter, sans-serif">Inter</option>' +
    '<option value="Georgia, serif">Georgia</option><option value="Courier New, monospace">Máquina</option></select></label>' +
    '</div>' +
    '<div class="fl-opt" data-for="move"><span class="fl-opt-hint">Arraste a camada selecionada. Segure <b>ESPAÇO</b> para navegar pela imagem.</span></div>' +
    '<div class="fl-opt" data-for="hand"><span class="fl-opt-hint">Arraste para navegar · roda do mouse ou pinça para aproximar.</span></div>';

  const ASPECTS = ['free', '1:1', '4:5', '3:4', '2:3', '4:3', '3:2', '16:9', '9:16'];
  const chips = $('#flAspects');
  ASPECTS.forEach(a => {
    const b = el('button', 'fl-chip' + (a === 'free' ? ' on' : ''), a === 'free' ? 'Livre' : a);
    b.type = 'button';
    b.addEventListener('click', () => {
      state.cropAspect = a;
      chips.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      if (a !== 'free' && state.cropDraft) {
        state.cropDraft.h = state.cropDraft.w / ({ '1:1': 1, '4:5': .8, '3:4': .75, '2:3': 2 / 3, '4:3': 4 / 3, '3:2': 1.5, '16:9': 16 / 9, '9:16': 9 / 16 })[a];
        vp.requestRender();
      }
    });
    chips.appendChild(b);
  });

  const bind = (id, key, outId, suffix) => {
    const i = $('#' + id), o = outId ? $('#' + outId) : null;
    i.addEventListener('input', () => {
      state.brush[key] = +i.value;
      if (o) o.value = i.value + (suffix || '');
      vp.requestRender();
    });
  };
  bind('flBrushSize', 'size', 'flBrushSizeV');
  bind('flBrushHard', 'hardness', 'flBrushHardV');
  bind('flBrushFlow', 'flow', 'flBrushFlowV');
  $('#flBrushColor').addEventListener('input', e => { state.brush.color = e.target.value; });

  $('#flAngle').addEventListener('pointerdown', () => beginChange('Endireitar'));
  $('#flAngle').addEventListener('input', e => {
    state.doc.angle = +e.target.value;
    $('#flAngleV').value = (+e.target.value).toFixed(1) + '°';
    state.doc.crop = straightenCrop(state.doc);   // corta os cantos vazios do giro
    state.cropDraft = state.doc.crop ? Object.assign({}, state.doc.crop) : null;
    clampCrop();
    vp.requestRender(true);
  });
  $('#flAngle').addEventListener('change', () => { endChange(); emit(); });
  $('#flRotL').addEventListener('click', () => rotate(-1));
  $('#flRotR').addEventListener('click', () => rotate(1));
  $('#flFlipH').addEventListener('click', () => {
    pushHistory('Espelhar');
    state.doc.flipH = !state.doc.flipH;
    vp.requestRender(); emit();
  });
  $('#flCropApply').addEventListener('click', () => {
    if (tools.commitCrop()) { app.setTool('move'); vp.fit(); notify('Corte aplicado. Dá para voltar atrás com Ctrl+Z ou no botão "Tudo".'); }
  });
  $('#flCropReset').addEventListener('click', () => { tools.resetCrop(); vp.fit(); });

  const textBind = (id, fn, outId) => {
    const i = $('#' + id);
    i.addEventListener('input', () => {
      const l = activeLayer(); if (!l || l.type !== 'text') return;
      const v = i.value;
      beginChange('Editar texto');
      fn(l, v);
      if (outId) $('#' + outId).value = v;
      touch(l); vp.requestRender(true);
    });
    i.addEventListener('change', () => { endChange(); emit(); });
  };
  textBind('flTextContent', (l, v) => l.text.content = v);
  textBind('flTextSize', (l, v) => l.text.size = +v, 'flTextSizeV');
  textBind('flTextColor', (l, v) => l.color = v);
  textBind('flTextFont', (l, v) => l.text.font = v);
}
function field(label, inner) { return '<label class="fl-field"><span>' + label + '</span>' + inner + '</label>'; }

function rotate(dir) {
  pushHistory('Girar 90°');
  state.doc.rotStep = ((state.doc.rotStep + dir) % 4 + 4) % 4;
  state.doc.crop = null; state.cropDraft = null;
  vp.fit(); emit();
}
function clampCrop() {
  const r = state.cropDraft || state.doc.crop;
  if (!r) return;
  const g = vp.outSize();
  r.w = Math.min(r.w, g.w); r.h = Math.min(r.h, g.h);
  r.x = Math.max(0, Math.min(r.x, g.w - r.w));
  r.y = Math.max(0, Math.min(r.y, g.h - r.h));
}

/* ---------- sincronização ---------- */
let histoTimer = 0;
export function refreshHistogramSoon() {
  clearTimeout(histoTimer);
  histoTimer = setTimeout(updateHistogram, 140);
}
export function updateHistogram(result) {
  const c = $('#flHisto');
  if (!c) return;
  const canvas = result || vp.currentResult();
  if (!canvas) { drawHistogram(c, null); return; }
  // amostra reduzida: o histograma não precisa de todos os pixels e assim
  // ele acompanha o arrastar do slider sem travar
  const s = Math.min(1, 220 / Math.max(canvas.width, canvas.height));
  const tmp = document.createElement('canvas');
  tmp.width = Math.max(1, Math.round(canvas.width * s));
  tmp.height = Math.max(1, Math.round(canvas.height * s));
  const g = tmp.getContext('2d', { willReadFrequently: true });
  g.drawImage(canvas, 0, 0, tmp.width, tmp.height);
  const info = drawHistogram(c, g.getImageData(0, 0, tmp.width, tmp.height));
  const warn = $('#flClip');
  if (info && warn) {
    const bits = [];
    if (info.clipHigh > 0.02) bits.push('<span class="fl-warn">' + Math.round(info.clipHigh * 100) + '% estourado</span>');
    if (info.clipLow > 0.02) bits.push('<span class="fl-warn dark">' + Math.round(info.clipLow * 100) + '% empretecido</span>');
    warn.innerHTML = bits.join('') || '<span class="fl-ok">exposição dentro da escala</span>';
  }
}

export function refresh(app) {
  const l = activeLayer();
  document.querySelectorAll('.fl-tool').forEach(b => b.classList.toggle('on', b.dataset.tool === state.tool));
  document.querySelectorAll('.fl-opt').forEach(o => {
    const f = o.dataset.for;
    const show = f === 'paint' ? !!{ brush: 1, eraser: 1, dodge: 1, burn: 1 }[state.tool] : f === state.tool;
    o.classList.toggle('on', show);
  });
  const colorWrap = $('#flBrushColorWrap');
  if (colorWrap) colorWrap.style.display = state.tool === 'brush' ? '' : 'none';

  // sliders
  if (l) {
    GROUPS.forEach(g => g.items.forEach(item => {
      const row = document.querySelector('.fl-row[data-key="' + item.key + '"]');
      if (!row) return;
      const v = l.adj[item.key] || 0;
      row.querySelector('input').value = v;
      row.querySelector('output').value = fmt(v);
      row.classList.toggle('changed', v !== ADJ_DEFAULTS[item.key]);
    }));
    const bw = $('#flBW'); if (bw) bw.checked = !!l.adj.bw;
    const bf = $('#flBWFilter'); if (bf) bf.value = l.adj.bwFilter || 'none';
    const bt = $('#flBWTone'); if (bt) bt.value = l.adj.bwTone || 'none';
    if (curveEditor) curveEditor.draw();
  }

  // camadas
  const list = $('#flLayers');
  if (list && state.doc) {
    list.innerHTML = '';
    [...state.doc.layers].reverse().forEach(layer => {
      const row = el('div', 'fl-layer' + (layer.id === state.activeId ? ' on' : ''));
      const icon = { image: '🖼', text: 'T', paint: '🖌', fill: '▨' }[layer.type] || '▧';
      row.innerHTML =
        '<button type="button" class="fl-eye" title="Mostrar/ocultar">' + (layer.visible ? '👁' : '🚫') + '</button>' +
        '<span class="fl-layer-ico">' + icon + '</span>' +
        '<span class="fl-layer-name" title="Duplo clique para renomear">' + escapeHTML(layer.name) + '</span>' +
        (layer.blend !== 'source-over' ? '<span class="fl-layer-tag">' + (BLEND_MODES.find(b => b[0] === layer.blend) || [, ''])[1] + '</span>' : '') +
        (layer.opacity < 100 ? '<span class="fl-layer-tag">' + layer.opacity + '%</span>' : '');
      row.addEventListener('click', () => { state.activeId = layer.id; emit(); });
      row.querySelector('.fl-eye').addEventListener('click', ev => {
        ev.stopPropagation();
        pushHistory('Mostrar/ocultar camada');
        layer.visible = !layer.visible; emit(); vp.requestRender();
      });
      row.querySelector('.fl-layer-name').addEventListener('dblclick', ev => {
        ev.stopPropagation();
        const n = prompt('Nome da camada:', layer.name);
        if (n != null) { pushHistory('Renomear camada'); layer.name = n.slice(0, 40); emit(); }
      });
      list.appendChild(row);
    });
    const op = $('#flOpacity'), bl = $('#flBlend');
    if (l && op) { op.value = l.opacity; $('#flOpacityV').value = l.opacity + '%'; }
    if (l && bl) bl.value = l.blend;
    const tOpt = $('#flTextContent');
    if (l && l.type === 'text' && tOpt) {
      tOpt.value = l.text.content;
      $('#flTextSize').value = l.text.size; $('#flTextSizeV').value = l.text.size;
      $('#flTextColor').value = l.color;
      const ff = $('#flTextFont');
      if (ff && [...ff.options].some(o => o.value === l.text.font)) ff.value = l.text.font;
    }
  }

  // barra de estado
  const h = historyInfo();
  const u = $('#flUndo'), r = $('#flRedo');
  if (u) u.disabled = !h.canUndo;
  if (r) r.disabled = !h.canRedo;
  const z = $('#flZoom');
  if (z) z.textContent = Math.round(state.zoom * 100) + '%';
  const info = $('#flInfo');
  if (info && state.doc) {
    const s = resultSize();
    info.textContent = s.w + ' × ' + s.h + ' px · ' + state.doc.layers.length + ' camada' + (state.doc.layers.length > 1 ? 's' : '');
  }
  const ang = $('#flAngle');
  if (ang && state.doc) { ang.value = state.doc.angle; $('#flAngleV').value = state.doc.angle.toFixed(1) + '°'; }
}

function escapeHTML(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

export function bindLayerProps() {
  $('#flOpacity').addEventListener('pointerdown', () => beginChange('Opacidade'));
  $('#flOpacity').addEventListener('input', e => {
    const l = activeLayer(); if (!l) return;
    l.opacity = +e.target.value;
    $('#flOpacityV').value = l.opacity + '%';
    touch(l); vp.requestRender(true);
  });
  $('#flOpacity').addEventListener('change', () => { endChange(); emit(); });
  const sel = $('#flBlend');
  sel.innerHTML = BLEND_MODES.map(b => '<option value="' + b[0] + '">' + b[1] + '</option>').join('');
  sel.addEventListener('change', e => {
    const l = activeLayer(); if (!l) return;
    const v = e.target.value;
    pushHistory('Modo de mesclagem');
    l.blend = v;
    touch(l); vp.requestRender(); emit();
  });
}
