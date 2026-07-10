/* ============================================================
   FotoQuest · input.js
   Entrada unificada: teclado (WASD/setas + ações) e toque
   (d-pad e botões DOM). O engine só enxerga o estado abstrato:
   input.dirX/dirY, input.down(a), input.pressed(a).
   Ações: A (interagir/confirmar) · B (voltar) · CAM (câmera)
          QUEST (missões) · SHOOT (disparar)
   ============================================================ */

const KEYMAP = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", s: "down", a: "left", d: "right",
  W: "up", S: "down", A: "left", D: "right",
  e: "A", E: "A", Enter: "A",
  Escape: "B",
  c: "CAM", C: "CAM",
  q: "QUEST", Q: "QUEST",
  " ": "SHOOT",
  Tab: "TAB",
  z: "MINUS", Z: "MINUS", x: "PLUS", X: "PLUS", // ajustes no modo câmera
};

class Input {
  constructor() {
    this.held = new Set();
    this.queue = [];       // ações "just pressed" (consumidas 1×)
    this.touchDir = { x: 0, y: 0 };
    this.isTouch = false;
    this.enabled = true;
  }

  init() {
    addEventListener("keydown", (e) => {
      if (!this.enabled) return;
      const a = KEYMAP[e.key];
      if (!a) return;
      // não roubar Tab/setas/espaço da página quando o jogo está ativo
      e.preventDefault();
      if (!this.held.has(a)) this.queue.push(a);
      this.held.add(a);
    });
    addEventListener("keyup", (e) => {
      const a = KEYMAP[e.key];
      if (a) this.held.delete(a);
    });
    addEventListener("blur", () => this.held.clear());

    if (matchMedia("(pointer: coarse)").matches) this.isTouch = true;
    addEventListener("touchstart", () => { this.isTouch = true; document.body.classList.add("gq-touch"); }, { once: true, passive: true });
    if (this.isTouch) document.body.classList.add("gq-touch");
  }

  /* --- consultas --- */
  get dirX() {
    let x = this.touchDir.x;
    if (this.held.has("left")) x -= 1;
    if (this.held.has("right")) x += 1;
    return Math.max(-1, Math.min(1, x));
  }
  get dirY() {
    let y = this.touchDir.y;
    if (this.held.has("up")) y -= 1;
    if (this.held.has("down")) y += 1;
    return Math.max(-1, Math.min(1, y));
  }
  down(a) { return this.held.has(a); }
  /** true uma única vez por pressionamento (consumido). */
  pressed(a) {
    const i = this.queue.indexOf(a);
    if (i >= 0) { this.queue.splice(i, 1); return true; }
    return false;
  }
  /** injeta ação vinda dos botões touch */
  push(a) { this.queue.push(a); }
  clearFrame() { if (this.queue.length > 12) this.queue.length = 0; }

  /* --- montagem dos controles touch (DOM) --- */
  buildTouchUI(container) {
    container.innerHTML = `
      <div class="gq-dpad" id="gqDpad">
        <button data-d="up"    class="gq-dbtn gq-up"    aria-label="Cima">▲</button>
        <button data-d="left"  class="gq-dbtn gq-left"  aria-label="Esquerda">◀</button>
        <button data-d="right" class="gq-dbtn gq-right" aria-label="Direita">▶</button>
        <button data-d="down"  class="gq-dbtn gq-down"  aria-label="Baixo">▼</button>
      </div>
      <div class="gq-abtns">
        <button id="gqBtnCam" class="gq-abtn gq-abtn--cam" aria-label="Modo câmera">📷</button>
        <button id="gqBtnA"   class="gq-abtn" aria-label="Interagir">E</button>
      </div>`;

    // d-pad: pointer events com suporte a deslizar entre botões
    const dpad = container.querySelector("#gqDpad");
    const setDir = (d, on) => {
      if (d === "up") this.touchDir.y = on ? -1 : (this.touchDir.y < 0 ? 0 : this.touchDir.y);
      if (d === "down") this.touchDir.y = on ? 1 : (this.touchDir.y > 0 ? 0 : this.touchDir.y);
      if (d === "left") this.touchDir.x = on ? -1 : (this.touchDir.x < 0 ? 0 : this.touchDir.x);
      if (d === "right") this.touchDir.x = on ? 1 : (this.touchDir.x > 0 ? 0 : this.touchDir.x);
    };
    let active = null;
    const from = (e) => document.elementFromPoint(e.clientX, e.clientY)?.dataset?.d || null;
    dpad.addEventListener("pointerdown", (e) => { e.preventDefault(); dpad.setPointerCapture(e.pointerId); active = from(e); if (active) setDir(active, true); });
    dpad.addEventListener("pointermove", (e) => {
      if (e.buttons === 0) return;
      const d = from(e);
      if (d !== active) { if (active) setDir(active, false); active = d; if (d) setDir(d, true); }
    });
    const end = () => { if (active) setDir(active, false); active = null; this.touchDir.x = 0; this.touchDir.y = 0; };
    dpad.addEventListener("pointerup", end);
    dpad.addEventListener("pointercancel", end);

    container.querySelector("#gqBtnA").addEventListener("pointerdown", (e) => { e.preventDefault(); this.push("A"); });
    container.querySelector("#gqBtnCam").addEventListener("pointerdown", (e) => { e.preventDefault(); this.push("CAM"); });
  }
}

export const input = new Input();
