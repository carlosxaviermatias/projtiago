/* ============================================================
   FotoQuest · main.js — ponto de entrada
   Liga input + engine + cenas aos elementos da página jogo.html.
   ============================================================ */

import { Engine } from "./engine.js?v=6";
import { input } from "./input.js?v=6";
import { MenuScene } from "./scenes.js?v=6";
import { initFullscreen } from "./fullscreen.js?v=6";
import { initSoundButton, unlockAudio } from "./audio.js?v=6";

function boot() {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;

  const dom = {
    shell: document.getElementById("gameShell"),
    hud: document.getElementById("gameHud"),
    panel: document.getElementById("gamePanel"),
    dialog: document.getElementById("gameDialog"),
    camUI: document.getElementById("gameCamUI"),
    touch: document.getElementById("gameTouch"),
  };

  input.init();
  input.buildTouchUI(dom.touch);
  initFullscreen(dom.shell);
  initSoundButton(dom.shell);

  // destrava o áudio no 1º gesto do usuário (política de autoplay)
  const unlock = () => { unlockAudio(); removeEventListener("pointerdown", unlock); removeEventListener("keydown", unlock); };
  addEventListener("pointerdown", unlock);
  addEventListener("keydown", unlock);

  // só captura teclas quando o mouse/foco está no jogo
  let inside = false;
  dom.shell.addEventListener("pointerenter", () => (inside = true));
  dom.shell.addEventListener("pointerleave", () => (inside = false));
  dom.shell.addEventListener("pointerdown", () => (inside = true));
  input.enabled = true; // sempre ativo; scroll da página fica preservado fora do canvas
  addEventListener("keydown", (e) => {
    // impede a página de rolar com espaço/setas apenas quando o ponteiro está no jogo
    if (!inside && ["ArrowUp", "ArrowDown", " "].includes(e.key)) return;
  }, true);

  const engine = new Engine(canvas, dom);
  engine.push(new MenuScene());
  engine.start();
}

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", boot)
  : boot();
