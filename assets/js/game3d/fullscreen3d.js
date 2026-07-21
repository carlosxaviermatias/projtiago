/* ============================================================
   Safári Fotográfico 3D · fullscreen3d.js
   Tela cheia horizontal (mesma estratégia validada no 2D):
   - API nativa + orientation.lock quando existir (Android);
   - fallback CSS fixed + rotação 90° quando em pé (iOS).
   Versão própria do jogo 3D — independente do FotoQuest 2D.
   ============================================================ */

export const fs3 = { active: false, rotated: false, mode: null };

let shell = null, btn = null, onChange = null;

const isPortrait = () => innerHeight > innerWidth;

function applyLayout() {
  if (!fs3.active) return;
  const rot = fs3.mode === "css" && isPortrait();
  fs3.rotated = rot;
  shell.classList.toggle("gq-rot", rot);
  onChange?.();
}

async function enter() {
  fs3.active = true;
  document.body.classList.add("gq-fs-on");
  shell.classList.add("gq-fs");
  if (shell.requestFullscreen) {
    try { await shell.requestFullscreen(); fs3.mode = "api"; }
    catch { fs3.mode = "css"; }
  } else fs3.mode = "css";
  if (fs3.mode === "api") {
    try { await screen.orientation.lock("landscape"); } catch { /* segue */ }
  }
  applyLayout();
  paint();
  if (fs3.mode === "css") scrollTo(0, 0);
  onChange?.();
}

export function exitFS3() {
  fs3.active = false; fs3.rotated = false; fs3.mode = null;
  document.body.classList.remove("gq-fs-on");
  shell.classList.remove("gq-fs", "gq-rot");
  try { screen.orientation.unlock?.(); } catch { /* ok */ }
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  paint();
  onChange?.();
}

function paint() {
  if (!btn) return;
  btn.innerHTML = fs3.active ? "✕ <span>Sair</span>" : "⛶ <span>Tela cheia</span>";
  btn.classList.toggle("on", fs3.active);
}

export function initFullscreen3d(shellEl, resizeCb) {
  shell = shellEl;
  onChange = resizeCb;
  btn = document.createElement("button");
  btn.className = "gq-fsbtn";
  btn.type = "button";
  btn.setAttribute("aria-label", "Tela cheia");
  btn.addEventListener("click", () => (fs3.active ? exitFS3() : enter()));
  shell.appendChild(btn);
  paint();
  document.addEventListener("fullscreenchange", () => {
    if (fs3.mode === "api" && !document.fullscreenElement && fs3.active) exitFS3();
  });
  addEventListener("resize", () => { applyLayout(); onChange?.(); });
  addEventListener("orientationchange", () => setTimeout(() => { applyLayout(); onChange?.(); }, 120));
}
