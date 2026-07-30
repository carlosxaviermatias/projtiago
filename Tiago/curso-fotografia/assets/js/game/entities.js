/* ============================================================
   FotoQuest · entities.js
   Player, NPCs e Alvos fotográficos.
   Todas as posições em pixels de mundo; a caixa de colisão
   fica nos pés do personagem (sensação top-down correta).
   ============================================================ */

import { TILE } from "./renderer.js?v=5";
import { makePerson, makeProp, PEOPLE } from "./sprites.js?v=5";
import { sfx } from "./audio.js?v=5";

const SPR = TILE; // sprites 16×16 × escala 3 = 48

class Character {
  constructor(x, y, frames) {
    this.x = x; this.y = y;              // canto sup. esquerdo do sprite
    this.dir = "down";
    this.frame = 0;
    this.animT = 0;
    this.frames = frames;
    this.speed = 210;
  }
  get box() { return { x: this.x + 10, y: this.y + SPR - 14, w: SPR - 20, h: 12 }; }
  setBox(b) { this.x = b.x - 10; this.y = b.y - SPR + 14; }
  get cx() { return this.x + SPR / 2; }
  get cy() { return this.y + SPR / 2; }

  animate(dt, moving) {
    if (moving) {
      this.animT += dt;
      if (this.animT > 0.16) { this.animT = 0; this.frame = 1 - this.frame; }
    } else this.frame = 0;
  }

  draw(ctx, camX, camY) {
    const img = this.frames[this.dir][this.frame];
    ctx.drawImage(img, Math.round(this.x - camX), Math.round(this.y - camY));
  }
}

export class Player extends Character {
  constructor(tx, ty) {
    super(tx * TILE, ty * TILE, makePerson("player", PEOPLE.player));
  }
  update(dt, input, map) {
    let dx = input.dirX, dy = input.dirY;
    const moving = dx !== 0 || dy !== 0;
    if (moving) {
      if (Math.abs(dx) > Math.abs(dy)) this.dir = dx > 0 ? "right" : "left";
      else this.dir = dy > 0 ? "down" : "up";
      const n = Math.hypot(dx, dy);
      dx = (dx / n) * this.speed * dt;
      dy = (dy / n) * this.speed * dt;
      const b = this.box;
      map.moveBox(b, dx, dy);
      this.setBox(b);
    }
    const prev = this.frame;
    this.animate(dt, moving);
    // um passo a cada ciclo de animação (~3 passos/s)
    if (moving && this.frame === 1 && prev !== 1) sfx.play("step");
  }
}

export class NPC extends Character {
  constructor(def, tx, ty) {
    super(tx * TILE, ty * TILE, makePerson(`npc-${def.id}`, PEOPLE[def.palette] || PEOPLE.prof));
    this.def = def;
    this.homeX = this.x; this.homeY = this.y;
    this.patrol = def.patrol ? def.patrol * TILE : 0;  // anda N tiles p/ lá e p/ cá
    this.t = Math.random() * 4;
    this.speed = 60;
    this.badge = null; // '!' missão disponível · '?' em andamento · null
  }
  update(dt, map) {
    if (!this.patrol) { this.animate(dt, false); return; }
    this.t += dt;
    const phase = (this.t % 8) / 8;                    // ciclo de 8s
    const target = phase < 0.5
      ? this.homeX + this.patrol * (phase * 2)
      : this.homeX + this.patrol * (2 - phase * 2);
    const dx = target - this.x;
    const moving = Math.abs(dx) > 1;
    if (moving) {
      this.dir = dx > 0 ? "right" : "left";
      const b = this.box;
      map.moveBox(b, Math.sign(dx) * this.speed * dt, 0);
      this.setBox(b);
    } else this.dir = "down";
    this.animate(dt, moving);
  }
  draw(ctx, camX, camY) {
    super.draw(ctx, camX, camY);
    if (this.badge) {
      const x = Math.round(this.cx - camX), y = Math.round(this.y - camY) - 14;
      ctx.save();
      ctx.fillStyle = this.badge === "!" ? "#f4b03e" : "#5aa6e8";
      ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.fill();
      ctx.fillStyle = "#14161f";
      ctx.font = "800 14px Inter, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(this.badge, x, y + 1);
      ctx.restore();
    }
  }
}

/**
 * Alvo fotográfico. `motion`: still | slow | fast.
 * Alvos humanos usam makePerson; demais usam props.
 * `shy`: foge do jogador se ele se aproximar demais (fase 9).
 */
export class Target {
  constructor(def, tx, ty) {
    this.def = def;
    this.x = tx * TILE; this.y = ty * TILE;
    this.homeX = this.x; this.homeY = this.y;
    this.t = Math.random() * 10;
    this.vx = 0;
    this.fled = 0;
    if (def.person) {
      this.frames = makePerson(`tg-${def.id}`, PEOPLE[def.person] || PEOPLE.modelo);
      this.isPerson = true; this.dir = "down"; this.frame = 0; this.animT = 0;
    } else {
      this.img = makeProp(def.sprite);
    }
    this.speedPx = { still: 0, slow: 70, fast: 190 }[def.motion || "still"];
    this.range = (def.range || 3) * TILE;   // amplitude do vai-e-vem
  }
  get cx() { return this.x + TILE / 2; }
  get cy() { return this.y + TILE / 2; }

  update(dt, map, player) {
    // alvo arisco: foge e some por uns segundos
    if (this.def.shy && player) {
      const d = Math.hypot(player.cx - this.cx, player.cy - this.cy) / TILE;
      if (d < (this.def.shyDist || 4) && this.fled <= 0) this.fled = 5;
    }
    if (this.fled > 0) { this.fled -= dt; return; }

    if (this.speedPx > 0) {
      this.t += dt;
      const phase = this.t % 4;                        // vai-e-vem 4s
      this.vx = (phase < 2 ? 1 : -1) * this.speedPx;
      this.x += this.vx * dt;
      if (this.x > this.homeX + this.range) { this.x = this.homeX + this.range; }
      if (this.x < this.homeX - this.range) { this.x = this.homeX - this.range; }
      if (this.isPerson) {
        this.dir = this.vx > 0 ? "right" : "left";
        this.animT += dt;
        if (this.animT > 0.14) { this.animT = 0; this.frame = 1 - this.frame; }
      }
    }
  }

  draw(ctx, camX, camY) {
    if (this.fled > 0) return;                          // escondido
    const x = Math.round(this.x - camX), y = Math.round(this.y - camY);
    if (this.isPerson) ctx.drawImage(this.frames[this.dir][this.frame], x, y);
    else if (this.img) ctx.drawImage(this.img, x, y);
  }
}
