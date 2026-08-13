/* ============================================================
   FotoQuest · tilemap.js
   Mapas declarados como strings + legenda (char → tile/spawn).
   O terreno é pré-renderizado num canvas offscreen por fase
   (rápido em celular); colisão é AABB contra a grade `solid`.
   ============================================================ */

import { TILE } from "./renderer.js?v=7";
import { bakeAllTiles } from "./sprites.js?v=7";

let tileImgs = null;

export class TileMap {
  /**
   * @param {string[]} rows      linhas do mapa (mesma largura)
   * @param {object}   legend    char → { tile, solid?, over? } | { spawn } | ...
   */
  constructor(rows, legend) {
    if (!tileImgs) tileImgs = bakeAllTiles();
    this.w = rows[0].length;
    this.h = rows.length;
    this.pxW = this.w * TILE;
    this.pxH = this.h * TILE;
    this.solid = [];
    this.spawns = [];          // {type:'player'|'npc'|'target'|'exit'|'prop', id, tx, ty}
    const base = legend["."] || { tile: "grass" };

    // pré-render do terreno
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.pxW; this.canvas.height = this.pxH;
    const c = this.canvas.getContext("2d");

    for (let y = 0; y < this.h; y++) {
      this.solid.push(new Array(this.w).fill(false));
      for (let x = 0; x < this.w; x++) {
        const ch = rows[y][x];
        let def = legend[ch] || base;
        // spawns desenham o tile base por baixo
        if (def.spawn) {
          this.spawns.push({ ...def.spawn, tx: x, ty: y });
          if (def.spawn.solid) this.solid[y][x] = true;
          def = def.under ? (legend[def.under] || base) : base;
        }
        const img = tileImgs[def.tile] || tileImgs.grass;
        c.drawImage(img, x * TILE, y * TILE);
        if (def.solid) this.solid[y][x] = true;
      }
    }
  }

  isSolidPx(px, py) {
    if (px < 0 || py < 0 || px >= this.pxW || py >= this.pxH) return true;
    return this.solid[(py / TILE) | 0][(px / TILE) | 0];
  }

  /** Colisão AABB (caixa nos pés) resolvida por eixo. */
  moveBox(box, dx, dy) {
    // eixo X
    if (dx !== 0) {
      const nx = box.x + dx;
      const edge = dx > 0 ? nx + box.w : nx;
      if (!this.isSolidPx(edge, box.y) && !this.isSolidPx(edge, box.y + box.h - 1)) box.x = nx;
      else box.x = dx > 0
        ? Math.floor((box.x + box.w + dx) / TILE) * TILE - box.w - 0.01
        : Math.floor((box.x + dx) / TILE + 1) * TILE + 0.01;
    }
    // eixo Y
    if (dy !== 0) {
      const ny = box.y + dy;
      const edge = dy > 0 ? ny + box.h : ny;
      if (!this.isSolidPx(box.x, edge) && !this.isSolidPx(box.x + box.w - 1, edge)) box.y = ny;
      else box.y = dy > 0
        ? Math.floor((box.y + box.h + dy) / TILE) * TILE - box.h - 0.01
        : Math.floor((box.y + dy) / TILE + 1) * TILE + 0.01;
    }
  }

  draw(ctx, camX, camY, viewW, viewH) {
    ctx.drawImage(this.canvas, camX, camY, viewW, viewH, 0, 0, viewW, viewH);
  }
}
