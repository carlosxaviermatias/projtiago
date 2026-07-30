/* ============================================================
   Safári Fotográfico 3D · targets.js
   Alvos fotográficos: modelos low-poly montados com primitivas
   e animados por código. Cada alvo carrega as propriedades
   pedagógicas usadas na avaliação (movimento, distância ideal,
   profundidade de campo, conceito do curso).
   ============================================================ */

import * as THREE from "./vendor/three.module.min.js?v=9";
import { groundHeight, LAKE } from "./world.js?v=9";

function lambert(color) { return new THREE.MeshLambertMaterial({ color }); }
function box(w, h, d, color) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lambert(color)); }

/* ---------- modelos ---------- */

function makeDeer() {
  const g = new THREE.Group();
  const body = box(1.5, 0.9, 0.7, 0xa97c50); body.position.y = 1.05; g.add(body);
  const head = box(0.55, 0.55, 0.45, 0xa97c50); head.position.set(0.95, 1.65, 0); g.add(head);
  const snout = box(0.3, 0.25, 0.3, 0x8a6238); snout.position.set(1.25, 1.55, 0); g.add(snout);
  for (const [i, sx] of [[-0.55, 1], [0.55, 1], [-0.55, -1], [0.55, -1]].entries()) {
    const leg = box(0.18, 1.0, 0.18, 0x8a6238);
    leg.position.set(sx[0], 0.5, 0.22 * sx[1]);
    leg.name = "leg" + i;
    g.add(leg);
  }
  for (const s of [-1, 1]) {
    const a1 = box(0.08, 0.5, 0.08, 0x6a4a28); a1.position.set(0.9, 2.1, 0.15 * s); g.add(a1);
    const a2 = box(0.3, 0.08, 0.08, 0x6a4a28); a2.position.set(0.9, 2.3, 0.15 * s); g.add(a2);
  }
  const tail = box(0.15, 0.25, 0.15, 0xe8d8c4); tail.position.set(-0.8, 1.25, 0); g.add(tail);
  return g;
}

function makeBird() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.9, 6), lambert(0x5aa6e8));
  body.rotation.z = -Math.PI / 2; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), lambert(0x3d7ec4));
  head.position.set(0.5, 0.08, 0); g.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.25, 5), lambert(0xf4b03e));
  beak.rotation.z = -Math.PI / 2; beak.position.set(0.72, 0.06, 0); g.add(beak);
  for (const s of [-1, 1]) {
    const wing = box(0.55, 0.04, 0.85, 0x4a90d0);
    wing.position.set(-0.05, 0.08, 0.5 * s);
    wing.name = s < 0 ? "wingL" : "wingR";
    g.add(wing);
  }
  return g;
}

function makeButterfly() {
  const g = new THREE.Group();
  const body = box(0.05, 0.05, 0.28, 0x22242c); g.add(body);
  const mat = new THREE.MeshLambertMaterial({ color: 0xf4b03e, side: THREE.DoubleSide });
  for (const s of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.4), mat);
    wing.position.set(0.16 * s, 0, 0);
    wing.name = s < 0 ? "wingL" : "wingR";
    g.add(wing);
  }
  return g;
}

function makeRareFlower() {
  const g = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.1, 5), lambert(0x4e7a3a));
  stem.position.y = 0.55; g.add(stem);
  const petalMat = new THREE.MeshLambertMaterial({ color: 0x8e7cc3, side: THREE.DoubleSide });
  for (let i = 0; i < 6; i++) {
    const p = new THREE.Mesh(new THREE.CircleGeometry(0.22, 6), petalMat);
    p.position.set(Math.cos(i / 6 * 6.28) * 0.2, 1.15, Math.sin(i / 6 * 6.28) * 0.2);
    p.lookAt(0, 1.6, 0);
    g.add(p);
  }
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), lambert(0xffd17a));
  core.position.y = 1.15; g.add(core);
  return g;
}

function makeBoat() {
  const g = new THREE.Group();
  const hull = box(2.6, 0.5, 1.1, 0x8a5a34); hull.position.y = 0.25; g.add(hull);
  const bow = box(0.7, 0.4, 0.9, 0x7a4e2c); bow.position.set(1.5, 0.28, 0); bow.rotation.y = 0.4; g.add(bow);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 5), lambert(0x5a4a34));
  mast.position.set(0.2, 1.6, 0); g.add(mast);
  const sailMat = new THREE.MeshLambertMaterial({ color: 0xf6f3ee, side: THREE.DoubleSide });
  const sail = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.7), sailMat);
  sail.position.set(-0.6, 1.7, 0); g.add(sail);
  return g;
}

/* ---------- definição + animação ---------- */

export const TARGET_DEFS = [
  {
    id: "veado", name: "Veado-campeiro", build: makeDeer,
    motion: "slow", idealDistance: [8, 26], concept: "velocidade",
    hint: "Ele caminha devagar — 1/125 já congela.",
  },
  {
    id: "passaro", name: "Pássaro-azul", build: makeBird,
    motion: "fast", idealDistance: [8, 30], concept: "velocidade",
    hint: "Voa rápido! 1/500 ou mais.",
  },
  {
    id: "borboleta", name: "Borboleta-dourada", build: makeButterfly,
    motion: "slow", idealDistance: [1.2, 5], wantsShallowDOF: true, concept: "profundidade",
    hint: "Chegue perto, f baixo, foco cravado.",
  },
  {
    id: "flor", name: "Orquídea-do-campo", build: makeRareFlower,
    motion: "still", idealDistance: [1, 4.5], wantsShallowDOF: true, concept: "profundidade",
    hint: "Retrato de flor: aproxime e desfoque o fundo.",
  },
  {
    id: "barco", name: "Barco ao pôr do sol", build: makeBoat,
    motion: "still", idealDistance: [18, 70], wantsDeepDOF: true, lightMod: -1, concept: "exposicao",
    hint: "Contraluz no lago: compense a exposição. f/8+ p/ paisagem.",
  },
];

export class Target {
  constructor(def, scene) {
    this.def = def;
    this.group = def.build();
    this.t = Math.random() * 10;
    scene.add(this.group);
    this.place();
  }

  place() {
    const g = this.group;
    switch (this.def.id) {
      case "veado": this.wp = { x: 28, z: -34, x2: 58, z2: -6 }; g.position.set(28, 0, -34); break;
      case "passaro": this.circle = { cx: -12, cz: 24, r: 16, h: 7 }; break;
      case "borboleta": this.home = { x: 16, z: 14 }; break;
      case "flor": g.position.set(-20, groundHeight(-20, 30), 30); break;
      case "barco": g.position.set(LAKE.x + 6, -0.35, LAKE.z + 4); break;
    }
  }

  /** posição central p/ avaliação (peito/corpo do alvo) */
  get pos() {
    const p = this.group.position.clone();
    p.y += this.def.id === "passaro" ? 0 : 1;
    return p;
  }
  get speed() { return { still: 0, slow: 1.4, fast: 9 }[this.def.motion]; }

  update(dt) {
    this.t += dt;
    const g = this.group, t = this.t;
    switch (this.def.id) {
      case "veado": {
        const ph = (t * 0.045) % 2;                      // vai-e-vem ~44s
        const k = ph < 1 ? ph : 2 - ph;
        const x = this.wp.x + (this.wp.x2 - this.wp.x) * k;
        const z = this.wp.z + (this.wp.z2 - this.wp.z) * k;
        g.lookAt(ph < 1 ? this.wp.x2 : this.wp.x, g.position.y, ph < 1 ? this.wp.z2 : this.wp.z);
        g.rotation.y += Math.PI / 2;                     // corpo é lateral
        g.position.set(x, groundHeight(x, z), z);
        for (let i = 0; i < 4; i++) {
          const leg = g.getObjectByName("leg" + i);
          if (leg) leg.rotation.x = Math.sin(t * 4 + i * 1.7) * 0.35;
        }
        break;
      }
      case "passaro": {
        const a = t * 0.55;
        const c = this.circle;
        g.position.set(c.cx + Math.cos(a) * c.r, c.h + Math.sin(t * 1.3) * 1.2, c.cz + Math.sin(a) * c.r);
        g.rotation.y = -a;                               // aponta na tangente
        const flap = Math.sin(t * 14) * 0.7;
        const wl = g.getObjectByName("wingL"), wr = g.getObjectByName("wingR");
        if (wl) wl.rotation.x = flap;
        if (wr) wr.rotation.x = -flap;
        break;
      }
      case "borboleta": {
        const x = this.home.x + Math.sin(t * 0.7) * 3 + Math.sin(t * 1.9) * 1.2;
        const z = this.home.z + Math.cos(t * 0.5) * 3;
        g.position.set(x, groundHeight(x, z) + 1.1 + Math.sin(t * 2.3) * 0.35, z);
        const flap = Math.sin(t * 16) * 1.0;
        const wl = g.getObjectByName("wingL"), wr = g.getObjectByName("wingR");
        if (wl) wl.rotation.y = flap;
        if (wr) wr.rotation.y = -flap;
        break;
      }
      case "flor":
        g.rotation.y = Math.sin(t * 0.8) * 0.08;         // balança na brisa
        break;
      case "barco":
        g.position.y = -0.35 + Math.sin(t * 0.9) * 0.08;
        g.rotation.z = Math.sin(t * 0.7) * 0.04;
        break;
    }
  }
}

export function spawnTargets(scene) {
  return TARGET_DEFS.map((d) => new Target(d, scene));
}
