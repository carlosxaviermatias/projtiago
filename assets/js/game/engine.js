/* ============================================================
   FotoQuest · engine.js
   Game loop com timestep fixo (1/60 s) e pilha de cenas.
   Cena = { enter(engine), exit(), update(dt), draw(ctx),
            overlay: bool }  — overlays deixam a cena de baixo
   visível (escurecida) mas pausada.
   ============================================================ */

import { VIEW_W, VIEW_H } from "./renderer.js?v=8";
import { input } from "./input.js?v=8";

const STEP = 1 / 60;

export class Engine {
  constructor(canvas, dom) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.dom = dom;            // referências aos elementos DOM da UI
    this.stack = [];
    this.acc = 0;
    this.last = 0;
    this.running = false;
  }

  get scene() { return this.stack[this.stack.length - 1]; }

  push(scene) { this.stack.push(scene); scene.enter?.(this); }
  pop() { const s = this.stack.pop(); s?.exit?.(); this.scene?.resume?.(this); }
  replace(scene) { const s = this.stack.pop(); s?.exit?.(); this.push(scene); }
  /** troca a pilha inteira (voltar ao menu, abrir fase…) */
  reset(scene) { while (this.stack.length) this.stack.pop()?.exit?.(); this.push(scene); }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now) => {
      if (!this.running) return;
      this.acc += Math.min(0.1, (now - this.last) / 1000);  // clamp p/ abas em bg
      this.last = now;
      while (this.acc >= STEP) {
        this.scene?.update?.(STEP);
        input.clearFrame();
        this.acc -= STEP;
      }
      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  draw() {
    const { ctx } = this;
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    // desenha da 1ª cena não-overlay (de baixo) até o topo
    let i = this.stack.length - 1;
    while (i > 0 && this.stack[i].overlay) i--;
    for (; i < this.stack.length; i++) this.stack[i].draw?.(ctx);
  }
}
