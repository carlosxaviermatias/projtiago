/* ============================================================
   Safári Fotográfico 3D · controls.js
   Primeira pessoa:
   - Desktop: WASD/setas + mouse (Pointer Lock ao clicar).
   - Touch: joystick virtual (esquerda) + arrastar p/ olhar
     (direita). Compatível com o modo tela cheia rotacionado
     (os deltas de arrasto são remapeados quando girado).
   ============================================================ */

import { groundHeight, EYE, WORLD_SIZE } from "./world.js?v=9";
import { sfx3d } from "./audio3d.js?v=9";

const KEYS = {
  w: "f", W: "f", ArrowUp: "f",
  s: "b", S: "b", ArrowDown: "b",
  a: "l", A: "l", ArrowLeft: "l",
  d: "r", D: "r", ArrowRight: "r",
};

export class FirstPerson {
  constructor(camera, canvas, fsState) {
    this.cam = camera;
    this.canvas = canvas;
    this.fs = fsState;                  // { rotated } do fullscreen3d
    this.yaw = 0.6; this.pitch = -0.06;
    this.pos = { x: 0, z: 6 };
    this.held = new Set();
    this.joy = { x: 0, y: 0 };          // joystick touch (-1..1)
    this.stepT = 0;
    this.enabled = true;
    this.treeCircles = [];
    this.moving = false;
    /* vista: 1 = 3ª pessoa (explorando), 0 = 1ª pessoa (olhando pelo visor).
       `view` persegue `viewTarget` para a troca ser suave, não um corte seco. */
    this.view = 1;
    this.viewTarget = 1;

    addEventListener("keydown", (e) => {
      const k = KEYS[e.key];
      if (k) { this.held.add(k); e.preventDefault(); }
    });
    addEventListener("keyup", (e) => { const k = KEYS[e.key]; if (k) this.held.delete(k); });
    addEventListener("blur", () => this.held.clear());

    /* mouse-look via Pointer Lock (desktop) */
    canvas.addEventListener("click", () => {
      if (!this.isTouch() && document.pointerLockElement !== canvas) {
        canvas.requestPointerLock?.();
      }
    });
    addEventListener("mousemove", (e) => {
      if (document.pointerLockElement === this.canvas) this.look(e.movementX, e.movementY, 0.0023);
    });

    /* touch-look: arrastar na METADE DIREITA da tela */
    let lookId = null, lx = 0, ly = 0;
    canvas.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "touch") return;
      const half = this.screenHalf(e);
      if (half === "right" && lookId === null) { lookId = e.pointerId; lx = e.clientX; ly = e.clientY; }
    });
    canvas.addEventListener("pointermove", (e) => {
      if (e.pointerId !== lookId) return;
      let dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      if (this.fs?.rotated) { const t = dx; dx = dy; dy = -t; }   // tela girada 90°
      this.look(dx, dy, 0.0042);
    });
    const endLook = (e) => { if (e.pointerId === lookId) lookId = null; };
    canvas.addEventListener("pointerup", endLook);
    canvas.addEventListener("pointercancel", endLook);
  }

  isTouch() { return document.body.classList.contains("gq-touch"); }

  /** qual metade FÍSICA da tela foi tocada (considera rotação) */
  screenHalf(e) {
    const r = this.canvas.getBoundingClientRect();
    if (this.fs?.rotated) {
      // conteúdo girado: eixo X lógico = eixo Y físico
      return e.clientY - r.top > r.height / 2 ? "right" : "left";
    }
    return e.clientX - r.left > r.width / 2 ? "right" : "left";
  }

  look(dx, dy, sens) {
    if (!this.enabled) return;
    this.yaw -= dx * sens;
    this.pitch = Math.max(-1.35, Math.min(1.35, this.pitch - dy * sens));
  }

  /** joystick DOM alimenta isto (main.js) */
  setJoy(x, y) { this.joy.x = x; this.joy.y = y; }

  update(dt, speedMul = 1) {
    // a vista persegue o alvo mesmo com os controles travados (ex.: painel aberto)
    this.view += (this.viewTarget - this.view) * Math.min(1, dt * 9);
    this.moving = false;
    if (!this.enabled) { this.apply(); return; }
    let mx = 0, mz = 0;
    if (this.held.has("f")) mz += 1;
    if (this.held.has("b")) mz -= 1;
    if (this.held.has("l")) mx -= 1;
    if (this.held.has("r")) mx += 1;
    mz += -this.joy.y; mx += this.joy.x;
    const len = Math.hypot(mx, mz);
    if (len > 0.15) {
      mx /= Math.max(1, len); mz /= Math.max(1, len);
      const sp = 7.5 * speedMul * dt;
      const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
      let nx = this.pos.x + (sin * -mz + cos * mx) * sp;
      let nz = this.pos.z + (cos * -mz - sin * mx) * sp;
      // limites do mundo e troncos de árvore
      const lim = WORLD_SIZE / 2 - 6;
      nx = Math.max(-lim, Math.min(lim, nx));
      nz = Math.max(-lim, Math.min(lim, nz));
      let blocked = false;
      for (const t of this.treeCircles) {
        if (Math.hypot(nx - t.x, nz - t.z) < t.r + 0.5) { blocked = true; break; }
      }
      if (!blocked) { this.pos.x = nx; this.pos.z = nz; }
      this.moving = true;
      this.stepT += dt;
      if (this.stepT > 0.42) { this.stepT = 0; sfx3d.play("step"); }
    }
    this.apply();
  }

  apply() {
    this.cam.rotation.order = "YXZ";
    this.cam.rotation.y = this.yaw;
    this.cam.rotation.x = this.pitch;

    const eyeY = groundHeight(this.pos.x, this.pos.z) + EYE;
    const t = this.view;
    if (t < 0.002) {                       // 1ª pessoa: olho do fotógrafo
      this.cam.position.set(this.pos.x, eyeY, this.pos.z);
      return;
    }
    /* 3ª pessoa: a câmera ORBITA um ponto no peito do boneco, recuando pela
       linha de visão. Assim o pivô cai no centro da tela e ele aparece
       inteiro — só deslocar a câmera para trás jogava o boneco para baixo.
       Com ordem YXZ, a frente é (-sin y·cos p, sin p, -cos y·cos p). */
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    const fx = -Math.sin(this.yaw) * cp, fy = sp, fz = -Math.cos(this.yaw) * cp;
    const dist = 3.6 * t;
    const peitoY = groundHeight(this.pos.x, this.pos.z) + 1.3;
    const baseY = eyeY + (peitoY - eyeY) * t;   // olho → peito conforme afasta
    const x = this.pos.x - fx * dist;
    const z = this.pos.z - fz * dist;
    let y = baseY - fy * dist;
    const chao = groundHeight(x, z) + 0.5;   // não entra no morro
    if (y < chao) y = chao;
    this.cam.position.set(x, y, z);
  }
}
