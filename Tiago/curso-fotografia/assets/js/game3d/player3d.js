/* ============================================================
   Safári Fotográfico 3D · player3d.js
   O fotógrafo: boneco "voxel" estilo Minecraft, montado com
   caixas nas proporções clássicas do personagem (cabeça 8×8×8,
   tronco 8×12×4, braços/pernas 4×12×4), escaladas para ~1,8 m.
   Segura uma câmera na mão direita e anima ao andar.
   Aparece na 3ª pessoa (explorando) e some na 1ª pessoa (ao
   fotografar), quando a vista passa a ser a do visor.
   ============================================================ */

import * as THREE from "./vendor/three.module.min.js?v=8";
import { groundHeight } from "./world.js?v=8";

/* 1 "pixel" do Minecraft: 32 px de altura = 1,8 m */
const U = 1.8 / 32;

const COR = {
  pele:   0xd8a06a,
  cabelo: 0x3a2a1c,
  colete: 0x7c7f4a,   // colete de safári (combina com a campina)
  camisa: 0xbfa878,
  calca:  0x4a5464,
  bota:   0x2c2620,
  camera: 0x22242c,
  lente:  0x3a3f4a,
  anel:   0xf4b03e,   // âmbar do site
  flash:  0xffe9b0,
};

/* Na hora dourada o sol fica baixo e à frente: visto de trás, o boneco
   viraria silhueta preta. Um emissivo leve (a própria cor) o mantém
   legível na sombra sem achatar o volume das caixas. */
const lambert = (c) => new THREE.MeshLambertMaterial({
  color: c, emissive: c, emissiveIntensity: 0.3,
});

/** caixa em "pixels" de Minecraft, já convertida para metros */
function px(w, h, d, cor) {
  return new THREE.Mesh(new THREE.BoxGeometry(w * U, h * U, d * U), lambert(cor));
}

/** membro com pivô no topo (ombro/quadril), para girar como articulação */
function membro(w, h, d, cor) {
  const pivo = new THREE.Group();
  const m = px(w, h, d, cor);
  m.position.y = -(h * U) / 2;      // pendura a partir do pivô
  pivo.add(m);
  return pivo;
}

/** a câmera fotográfica que ele carrega */
function fazCamera() {
  const g = new THREE.Group();
  const corpo = px(5, 3.5, 2.5, COR.camera); g.add(corpo);
  const lente = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1 * U, 1.3 * U, 2.2 * U, 10),
    lambert(COR.lente));
  lente.rotation.x = Math.PI / 2;
  lente.position.z = -2.2 * U;      // aponta para a frente (-Z)
  g.add(lente);
  const anel = new THREE.Mesh(
    new THREE.TorusGeometry(1.15 * U, 0.22 * U, 6, 12),
    lambert(COR.anel));
  anel.position.z = -3.2 * U;
  g.add(anel);
  const flash = px(1.6, 0.8, 1.2, COR.flash);
  flash.position.set(0, 2.1 * U, 0);
  g.add(flash);
  return g;
}

export class Player3D {
  constructor(scene) {
    const g = new THREE.Group();      // construído olhando para -Z (frente)
    this.grupo = g;

    /* ---- cabeça ---- */
    const cabeca = new THREE.Group();
    cabeca.position.y = 24 * U;       // topo do tronco
    const cranio = px(8, 8, 8, COR.pele);
    cranio.position.y = 4 * U;
    cabeca.add(cranio);
    // cabelo: "casquinha" por cima e atrás
    const topo = px(8.4, 1.6, 8.4, COR.cabelo);
    topo.position.y = 7.6 * U; cabeca.add(topo);
    const nuca = px(8.4, 5, 1.2, COR.cabelo);
    nuca.position.set(0, 4.5 * U, 3.8 * U); cabeca.add(nuca);
    // olhos na face da frente (-Z)
    for (const s of [-1, 1]) {
      const olho = px(1.4, 1.4, 0.4, 0x2b2b33);
      olho.position.set(s * 1.9 * U, 4.4 * U, -4.1 * U);
      cabeca.add(olho);
    }
    g.add(cabeca);
    this.cabeca = cabeca;

    /* ---- tronco ---- */
    const tronco = px(8, 12, 4, COR.camisa);
    tronco.position.y = 18 * U;
    g.add(tronco);
    const colete = px(8.6, 8, 4.6, COR.colete);   // colete por cima
    colete.position.y = 19 * U;
    g.add(colete);

    /* ---- braços (pivô no ombro, y = 24U) ---- */
    this.bracoE = membro(4, 12, 4, COR.colete);
    this.bracoE.position.set(-6 * U, 23 * U, 0);
    g.add(this.bracoE);

    this.bracoD = membro(4, 12, 4, COR.colete);
    this.bracoD.position.set(6 * U, 23 * U, 0);
    this.bracoD.rotation.x = 1.15;                // dobrado à frente, segurando
    /* afastado do corpo: como a vista padrão é por trás, com o braço colado
       a câmera ficaria escondida atrás do tronco — e ela é o ponto do boneco. */
    this.bracoD.rotation.z = 0.42;
    g.add(this.bracoD);

    // mãos (tom de pele na ponta dos braços)
    for (const [braco, sx] of [[this.bracoE, -1], [this.bracoD, 1]]) {
      const mao = px(4.2, 2.4, 4.2, COR.pele);
      mao.position.y = -11 * U;
      braco.add(mao);
    }

    /* ---- câmera na mão direita ---- */
    const cam = fazCamera();
    cam.position.set(0, -13.5 * U, -1.2 * U);     // logo abaixo/à frente da mão
    cam.rotation.x = -1.15;                        // compensa a dobra do braço
    cam.scale.setScalar(1.3);                      // legível a 3,6 m de distância
    this.bracoD.add(cam);

    /* ---- pernas (pivô no quadril, y = 12U) ---- */
    this.pernaE = membro(4, 12, 4, COR.calca);
    this.pernaE.position.set(-2 * U, 12 * U, 0);
    g.add(this.pernaE);
    this.pernaD = membro(4, 12, 4, COR.calca);
    this.pernaD.position.set(2 * U, 12 * U, 0);
    g.add(this.pernaD);
    for (const perna of [this.pernaE, this.pernaD]) {
      const bota = px(4.2, 2.2, 4.6, COR.bota);
      bota.position.set(0, -11 * U, -0.2 * U);
      perna.add(bota);
    }

    this.fase = 0;        // ciclo da caminhada
    scene.add(g);
  }

  /** @param est {x,z,yaw,andando} */
  update(dt, est) {
    const g = this.grupo;
    g.position.set(est.x, groundHeight(est.x, est.z), est.z);
    g.rotation.y = est.yaw;

    if (est.andando) {
      this.fase += dt * 8.5;
      const s = Math.sin(this.fase) * 0.62;
      this.pernaE.rotation.x = s;
      this.pernaD.rotation.x = -s;
      this.bracoE.rotation.x = -s * 0.8;
      this.bracoD.rotation.x = 1.15 + s * 0.12;   // o braço da câmera balança pouco
      g.position.y += Math.abs(Math.sin(this.fase)) * 0.035;   // quicada
    } else {
      // volta suavemente ao repouso + respiração leve
      this.fase += dt * 1.6;
      const calma = (a, alvo) => a + (alvo - a) * Math.min(1, dt * 8);
      this.pernaE.rotation.x = calma(this.pernaE.rotation.x, 0);
      this.pernaD.rotation.x = calma(this.pernaD.rotation.x, 0);
      this.bracoE.rotation.x = calma(this.bracoE.rotation.x, 0);
      this.bracoD.rotation.x = calma(this.bracoD.rotation.x, 1.15);
      g.position.y += Math.sin(this.fase) * 0.012;
    }
    // a cabeça acompanha para onde ele olha (limitada, para não quebrar o pescoço)
    this.cabeca.rotation.x = Math.max(-0.6, Math.min(0.6, est.pitch || 0));
  }

  setVisivel(v) { this.grupo.visible = v; }
}
