/* ============================================================
   FotoQuest · fullscreen.js
   Modo tela cheia com jogo SEMPRE na horizontal:
   - Android/desktop com API completa: Fullscreen API +
     screen.orientation.lock("landscape"). O SO já entrega a
     tela em paisagem — nenhuma rotação CSS é aplicada.
   - iPhone/iOS Safari (sem API completa): tela cheia via CSS
     fixed cobrindo a viewport; se o aparelho estiver em pé
     (retrato), o #gameShell inteiro é girado 90° via transform
     ("letterbox rotation") para forçar a experiência horizontal.
   Exponibiliza canvasPoint() — conversão toque→coordenada do
   canvas que funciona também com o jogo rotacionado.
   ============================================================ */

import { VIEW_W, VIEW_H } from "./renderer.js";

export const fs = { active: false, rotated: false, mode: null };

let shell = null, btn = null;

const isPortrait = () => innerHeight > innerWidth;

/** Converte um evento de ponteiro em coordenadas internas do canvas
    (960×540). getBoundingClientRect() de um elemento rotacionado via
    CSS já retorna a bounding box pós-rotação (eixos trocados), então
    quando fs.rotated é true os eixos do toque também vêm trocados. */
export function canvasPoint(e, canvas) {
  const r = canvas.getBoundingClientRect();
  if (fs.rotated) {
    return {
      x: ((e.clientY - r.top) / r.height) * VIEW_W,
      y: ((r.right - e.clientX) / r.width) * VIEW_H,
    };
  }
  return {
    x: ((e.clientX - r.left) / r.width) * VIEW_W,
    y: ((e.clientY - r.top) / r.height) * VIEW_H,
  };
}

function applyLayout() {
  if (!fs.active) return;
  // fullscreen nativo (Android/desktop): o SO já entrega paisagem,
  // nunca rotacionar via CSS nesse modo.
  const needRotate = fs.mode === "css" && isPortrait();
  fs.rotated = needRotate;
  shell.classList.toggle("gq-rot", needRotate);
}

async function enter() {
  fs.active = true;
  document.body.classList.add("gq-fs-on");
  shell.classList.add("gq-fs");
  if (shell.requestFullscreen) {
    try { await shell.requestFullscreen(); fs.mode = "api"; }
    catch { fs.mode = "css"; }
  } else fs.mode = "css";                    // iOS Safari

  if (fs.mode === "api") {
    try { await screen.orientation.lock("landscape"); }
    catch { /* alguns Android negam sem gesto extra; segue mesmo assim */ }
  }
  applyLayout();
  updateBtn();
  if (fs.mode === "css") scrollTo(0, 0);      // garante que o fixed cubra do topo
}

export function exitFS() {
  fs.active = false; fs.rotated = false; fs.mode = null;
  document.body.classList.remove("gq-fs-on");
  shell.classList.remove("gq-fs", "gq-rot");
  try { screen.orientation.unlock?.(); } catch { /* ok */ }
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  updateBtn();
}

function updateBtn() {
  if (!btn) return;
  btn.innerHTML = fs.active ? "✕ <span>Sair</span>" : "⛶ <span>Tela cheia</span>";
  btn.classList.toggle("on", fs.active);
}

export function initFullscreen(shellEl) {
  shell = shellEl;
  btn = document.createElement("button");
  btn.className = "gq-fsbtn";
  btn.type = "button";
  btn.setAttribute("aria-label", "Tela cheia");
  btn.addEventListener("click", () => (fs.active ? exitFS() : enter()));
  shell.appendChild(btn);
  updateBtn();

  // usuário saiu do fullscreen pelo gesto/Esc do navegador (não pelo nosso botão)
  document.addEventListener("fullscreenchange", () => {
    if (fs.mode === "api" && !document.fullscreenElement && fs.active) exitFS();
  });
  addEventListener("resize", applyLayout);
  addEventListener("orientationchange", () => setTimeout(applyLayout, 120));
}
