/* ============================================================
   FotoLab · main.js
   Liga tudo: abre arquivo, atalhos de teclado, exportação,
   tela cheia e o salvamento automático da sessão.
   ============================================================ */

import { state, onChange, emit, undo, redo, pushHistory, activeLayer, ADJ_DEFAULTS, newCurve, touch } from './state.js?v=2';
import * as vp from './viewport.js?v=2';
import * as tools from './tools.js?v=2';
import * as ui from './ui.js?v=2';
import * as io from './io.js?v=2';
import { invalidateAll } from './render.js?v=2';

const $ = s => document.querySelector(s);

const app = {
  setTool(t) {
    if (state.tool === 'crop' && t !== 'crop') tools.cancelCrop();
    state.tool = t;
    if (t === 'crop') { state.cropDraft = null; vp.fit(); }
    emit(); vp.requestRender();
  },
  addImageLayer() { pickFiles(files => addLayers(files)); }
};

/* Devolve o controle ao navegador para ele desenhar antes de uma tarefa longa.
   Só com requestAnimationFrame não serve: em aba de segundo plano ele NUNCA
   dispara e a abertura do arquivo ficaria esperando para sempre. Daí a corrida
   com um setTimeout curto. */
function nextPaint(maxWait = 150) {
  return new Promise(resolve => {
    let done = false;
    const fin = () => { if (!done) { done = true; resolve(); } };
    requestAnimationFrame(() => requestAnimationFrame(fin));
    setTimeout(fin, maxWait);
  });
}

/* ---------- avisos ---------- */
let toastTimer = 0;
function notify(msg, ms = 4200) {
  const t = $('#flToast');
  t.innerHTML = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), ms);
}

/* ---------- abertura de arquivos ---------- */
const RAW_ACCEPT = '.nef,.nrw,.cr2,.cr3,.crw,.arw,.srf,.sr2,.raf,.rw2,.orf,.pef,.dng,.rwl,.srw,.3fr,.x3f,.iiq,.mrw,.kdc,.dcr';
function pickFiles(cb, multiple) {
  const i = document.createElement('input');
  i.type = 'file';
  // só "image/*" esconde os RAW no seletor de arquivos: o sistema não
  // classifica NEF/CR2 como imagem, então listamos as extensões também
  i.accept = 'image/*,' + RAW_ACCEPT;
  if (multiple) i.multiple = true;
  i.addEventListener('change', () => { if (i.files && i.files.length) cb([...i.files]); });
  i.click();
}
async function openFiles(files) {
  try {
    if (io.looksRaw(files[0])) {
      // procurar a prévia dentro de um RAW de 30 MB segura a página por um
      // instante: avisa e devolve o controle ao navegador antes de começar
      notify('Lendo o arquivo RAW… (procurando a maior prévia da câmera)', 12000);
      await nextPaint();
    }
    const info = await io.openFileAsDocument(files[0]);
    afterOpen();
    if (files.length > 1) { for (const f of files.slice(1)) await io.addFileAsLayer(f); emit(); }
    notify(io.openReport(info, files[0].name), info.raw ? 9000 : 3500);
  } catch (e) { notify('⚠️ ' + e.message, 8000); }
}
async function addLayers(files) {
  try {
    if (!state.doc) return openFiles(files);
    pushHistory('Nova camada de imagem');
    for (const f of files) await io.addFileAsLayer(f);
    emit(); vp.requestRender();
    notify('Imagem adicionada como camada nova. Use <b>Mover</b> para posicionar.');
  } catch (e) { notify('⚠️ ' + e.message, 6000); }
}
function afterOpen() {
  $('#flApp').classList.add('has-doc');
  state.tool = 'move';
  vp.invalidate();
  vp.fit();
  emit();
  closeDialogs();
}

/* ---------- diálogos ---------- */
function openDialog(id) { $('#' + id).classList.add('on'); $('#flScrim').classList.add('on'); }
function closeDialogs() {
  document.querySelectorAll('.fl-dialog').forEach(d => d.classList.remove('on'));
  $('#flScrim').classList.remove('on');
}

function buildSamples() {
  const host = $('#flSampleGrid');
  host.innerHTML = '';
  io.SAMPLES.forEach(s => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'fl-sample';
    b.innerHTML = '<img src="' + s.file + '" alt="" loading="lazy"><b>' + s.name + '</b><span>' + s.hint + '</span>';
    b.addEventListener('click', async () => {
      try { await io.openSample(s); afterOpen(); notify('Foto de exemplo aberta: <b>' + s.name + '</b>'); }
      catch (e) { notify('⚠️ ' + e.message); }
    });
    host.appendChild(b);
  });
}

/* ---------- exportação ---------- */
function buildExport() {
  $('#flDoExport').addEventListener('click', async () => {
    const type = $('#flExpType').value;
    const q = +$('#flExpQuality').value / 100;
    const maxSide = +$('#flExpSize').value;
    const btn = $('#flDoExport');
    btn.disabled = true; btn.textContent = 'Gerando…';
    // a revelação em tamanho real trava a página por alguns segundos numa foto
    // de 12 MP; sem devolver o controle ao navegador aqui, o próprio "Gerando…"
    // não chega a ser desenhado e parece que o botão não fez nada
    await nextPaint();
    try {
      const { blob, w, h } = await io.exportBlob({ type, quality: q, maxSide });
      const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
      io.download(blob, ($('#flExpName').value.trim() || 'foto-editada') + '.' + ext);
      notify('Imagem salva: ' + w + '×' + h + ' px · ' + Math.round(blob.size / 1024) + ' KB');
      closeDialogs();
    } catch (e) { notify('⚠️ Não consegui exportar: ' + e.message, 6000); }
    btn.disabled = false; btn.textContent = 'Salvar imagem';
  });
  const q = $('#flExpQuality');
  q.addEventListener('input', () => { $('#flExpQualityV').value = q.value + '%'; });
  $('#flExpType').addEventListener('change', e => {
    $('#flExpQualityWrap').style.display = e.target.value === 'image/png' ? 'none' : '';
  });
}

/* ---------- atalhos ---------- */
function isTyping(e) {
  const t = e.target;
  return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
}
function keys(e) {
  if (isTyping(e)) return;
  const meta = e.ctrlKey || e.metaKey;
  if (meta && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    (e.shiftKey ? redo() : undo()) && (invalidateVP(), notify(e.shiftKey ? 'Refeito' : 'Desfeito', 1200));
    return;
  }
  if (meta && e.key.toLowerCase() === 'y') { e.preventDefault(); redo() && invalidateVP(); return; }
  if (meta && e.key === '0') { e.preventDefault(); vp.fit(); emit(); return; }
  if (meta && e.key.toLowerCase() === 's') { e.preventDefault(); openDialog('flExport'); return; }
  if (meta) return;
  const map = { v: 'move', c: 'crop', b: 'brush', e: 'eraser', d: 'dodge', q: 'burn', t: 'text', h: 'hand' };
  const k = e.key.toLowerCase();
  if (map[k] && state.doc) { app.setTool(map[k]); return; }
  if (k === '[') { state.brush.size = Math.max(2, Math.round(state.brush.size * 0.8)); syncBrush(); return; }
  if (k === ']') { state.brush.size = Math.min(600, Math.round(state.brush.size * 1.25)); syncBrush(); return; }
  if (k === '\\' && !state.compare) { state.compare = true; vp.requestRender(); return; }
  if (e.key === 'Enter' && state.tool === 'crop') { if (tools.commitCrop()) { app.setTool('move'); vp.fit(); } return; }
  if (e.key === 'Escape') { closeDialogs(); if (state.tool === 'crop') tools.cancelCrop(); }
  if (k === '+' || k === '=') vp.setZoom(state.zoom * 1.2);
  if (k === '-') vp.setZoom(state.zoom / 1.2);
}
function syncBrush() {
  $('#flBrushSize').value = state.brush.size;
  $('#flBrushSizeV').value = state.brush.size;
  vp.requestRender();
}
function invalidateVP() { vp.invalidate(); vp.requestRender(); ui.refreshHistogramSoon(); emit(); }

/* ---------- tela cheia ---------- */
function toggleFullscreen() {
  const appEl = $('#flApp');
  if (document.fullscreenElement) { document.exitFullscreen(); return; }
  if (appEl.requestFullscreen) appEl.requestFullscreen().catch(() => appEl.classList.toggle('fl-fs'));
  else appEl.classList.toggle('fl-fs');   // iPhone não tem Fullscreen API: cai no CSS
}

/* ---------- salvamento automático ---------- */
let saveTimer = 0;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => io.saveSession(), 3000);
}

/* ---------- início ---------- */
function boot() {
  const canvas = $('#flCanvas');
  vp.attach(canvas, $('#flStage'), result => ui.updateHistogram(result));
  tools.bind(canvas);
  tools.setNotifier(notify);
  ui.setNotifier(notify);
  ui.buildUI(app);
  ui.bindLayerProps();
  buildSamples();
  buildExport();

  onChange(() => { ui.refresh(app); if (state.doc) scheduleSave(); });

  $('#flOpen').addEventListener('click', () => pickFiles(openFiles, true));
  $('#flOpenBig').addEventListener('click', () => pickFiles(openFiles, true));
  $('#flSamples').addEventListener('click', () => openDialog('flSampleDlg'));
  $('#flSamplesBig').addEventListener('click', () => openDialog('flSampleDlg'));
  $('#flExportBtn').addEventListener('click', () => {
    if (!state.doc) { notify('Abra uma foto primeiro.'); return; }
    openDialog('flExport');
  });
  $('#flUndo').addEventListener('click', () => { undo() && invalidateVP(); });
  $('#flRedo').addEventListener('click', () => { redo() && invalidateVP(); });
  $('#flFit').addEventListener('click', () => { vp.fit(); emit(); });
  $('#flZoomIn').addEventListener('click', () => { vp.setZoom(state.zoom * 1.25); emit(); });
  $('#flZoomOut').addEventListener('click', () => { vp.setZoom(state.zoom / 1.25); emit(); });
  $('#flFull').addEventListener('click', toggleFullscreen);
  $('#flReset').addEventListener('click', () => {
    const l = activeLayer(); if (!l) return;
    pushHistory('Zerar ajustes');
    l.adj = Object.assign({}, ADJ_DEFAULTS);
    l.curve = newCurve();
    touch(l); vp.requestRender(); emit();
    notify('Ajustes desta camada zerados (as pinceladas continuam).');
  });
  $('#flSaveProj').addEventListener('click', () => {
    if (!state.doc) return;
    io.download(new Blob([io.projectJSON()], { type: 'application/json' }), 'projeto.fotolab.json');
    notify('Projeto salvo com as camadas. Abra de novo em <b>Projeto → Abrir</b>.');
  });
  $('#flOpenProj').addEventListener('click', () => {
    const i = document.createElement('input');
    i.type = 'file'; i.accept = '.json,application/json';
    i.addEventListener('change', async () => {
      try {
        const text = await i.files[0].text();
        await io.loadProject(text);
        afterOpen();
        notify('Projeto aberto com as camadas preservadas.');
      } catch (e) { notify('⚠️ ' + e.message, 6000); }
    });
    i.click();
  });

  // comparar (segurar)
  const cmp = $('#flCompare');
  const on = () => { state.compare = true; cmp.classList.add('on'); vp.requestRender(); };
  const off = () => { if (!state.compare) return; state.compare = false; cmp.classList.remove('on'); vp.requestRender(); };
  cmp.addEventListener('pointerdown', on);
  window.addEventListener('pointerup', off);
  window.addEventListener('keyup', e => { if (e.key === '\\') off(); });

  $('#flScrim').addEventListener('click', closeDialogs);
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeDialogs));
  window.addEventListener('keydown', keys);

  // arrastar e soltar
  const stage = $('#flStage');
  ['dragenter', 'dragover'].forEach(ev => stage.addEventListener(ev, e => { e.preventDefault(); stage.classList.add('drop'); }));
  ['dragleave', 'drop'].forEach(ev => stage.addEventListener(ev, e => { e.preventDefault(); stage.classList.remove('drop'); }));
  stage.addEventListener('drop', e => {
    // arquivo RAW costuma chegar com tipo VAZIO — filtrar só por "image/"
    // fazia o NEF arrastado sumir sem nenhuma mensagem
    const all = [...(e.dataTransfer.files || [])];
    const files = all.filter(f => (f.type || '').startsWith('image/') || io.looksRaw(f));
    if (!files.length) {
      if (all.length) notify('⚠️ “' + all[0].name + '” não é um arquivo de imagem que eu consiga abrir.', 6000);
      return;
    }
    state.doc ? addLayers(files) : openFiles(files);
  });

  // painéis no celular
  $('#flPanelToggle').addEventListener('click', () => $('#flApp').classList.toggle('panels-open'));

  ui.refresh(app);
  ui.updateHistogram(null);

  // sessão anterior
  io.readSession().then(s => {
    if (!s || !s.json) return;
    const bar = $('#flResume');
    bar.classList.add('on');
    $('#flResumeYes').addEventListener('click', async () => {
      try {
        await io.loadProject(s.json);
        afterOpen();
        bar.classList.remove('on');
        notify('Voltamos de onde você parou.');
      } catch (e) { notify('⚠️ Não consegui restaurar a sessão.'); bar.classList.remove('on'); }
    });
    $('#flResumeNo').addEventListener('click', () => { bar.classList.remove('on'); io.clearSession(); });
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
