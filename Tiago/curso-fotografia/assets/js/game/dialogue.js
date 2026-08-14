/* ============================================================
   FotoQuest · dialogue.js
   Caixa de diálogo (DOM) empilhada como cena-overlay:
   pausa a fase, mostra páginas, avança com E/Enter/toque
   e dispara um callback ao terminar.
   ============================================================ */

import { input } from "./input.js?v=8";
import { sfx } from "./audio.js?v=8";

export class DialogueScene {
  /**
   * @param {Array<{speaker:string, text:string}>} pages
   * @param {Function} [onDone]
   */
  constructor(pages, onDone) {
    this.pages = pages;
    this.i = 0;
    this.onDone = onDone;
    this.overlay = true;
  }

  enter(engine) {
    this.engine = engine;
    this.el = engine.dom.dialog;
    this.el.classList.add("open");
    this.el.onclick = () => this.advance();
    this.render();
  }

  exit() {
    this.el.classList.remove("open");
    this.el.onclick = null;
  }

  render() {
    const p = this.pages[this.i];
    const last = this.i === this.pages.length - 1;
    sfx.play("dialog");
    this.el.innerHTML = `
      <div class="gq-dlg-box">
        <div class="gq-dlg-speaker">${p.speaker}</div>
        <div class="gq-dlg-text">${p.text}</div>
        <div class="gq-dlg-next">${last ? "✓ fechar" : "▸ continuar"} <span class="gq-key">E</span></div>
      </div>`;
  }

  advance() {
    if (this.i < this.pages.length - 1) { this.i++; this.render(); }
    else { this.engine.pop(); this.onDone?.(); }
  }

  update() {
    if (input.pressed("A") || input.pressed("SHOOT")) this.advance();
    if (input.pressed("B")) { this.engine.pop(); this.onDone?.(); }
  }

  draw(ctx) {
    ctx.fillStyle = "rgba(0,0,0,.45)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

/** Toast rápido (não pausa o jogo) — usado p/ recompensas e avisos. */
export function toast(engine, html, ms = 2600) {
  const t = document.createElement("div");
  t.className = "gq-toast";
  t.innerHTML = html;
  engine.dom.shell.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 400); }, ms);
}
