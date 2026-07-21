/* ============================================================
   Safári Fotográfico 3D · world.js
   Constrói o mundo low-poly: campina na HORA DOURADA com
   colinas, lago, árvores (instanced), pedras e flores.
   Tudo procedural — nenhum modelo externo.
   ============================================================ */

import * as THREE from "./vendor/three.module.min.js";

export const WORLD_SIZE = 380;        // lado do terreno (m)
export const LAKE = { x: -70, z: -60, r: 42 };   // posição/raio do lago
export const EYE = 1.65;              // altura dos olhos (m)

/* relevo procedural — mesma função p/ malha e p/ caminhar */
export function groundHeight(x, z) {
  let h =
    Math.sin(x * 0.045) * Math.cos(z * 0.038) * 3.2 +
    Math.sin(x * 0.013 + 2) * Math.cos(z * 0.017 + 1) * 5.5 +
    Math.sin((x + z) * 0.09) * 0.6;
  // achata a região do lago (vira uma bacia rasa)
  const dl = Math.hypot(x - LAKE.x, z - LAKE.z);
  if (dl < LAKE.r + 26) {
    const t = Math.max(0, Math.min(1, (dl - LAKE.r) / 26));
    h = h * t * t - (1 - t) * 1.4;
  }
  // clareira suave no spawn (0,0)
  const ds = Math.hypot(x, z);
  if (ds < 24) h *= ds / 24;
  return h;
}

/* rand determinístico (mundo sempre igual) */
function makeRand(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export function buildWorld(scene, q /* preset de qualidade */) {
  /* ---------- céu (gradiente dourado→azul via canvas) ---------- */
  const skyCv = document.createElement("canvas");
  skyCv.width = 2; skyCv.height = 256;
  const sc = skyCv.getContext("2d");
  const grad = sc.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "#3a6ea5");
  grad.addColorStop(0.55, "#c9a06e");
  grad.addColorStop(0.78, "#f4b03e");
  grad.addColorStop(1, "#ffd17a");
  sc.fillStyle = grad; sc.fillRect(0, 0, 2, 256);
  const skyTex = new THREE.CanvasTexture(skyCv);
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(q.far * 0.96, 16, 12),
    new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })
  );
  scene.add(sky);

  /* sol baixo no horizonte */
  const sun = new THREE.Mesh(
    new THREE.CircleGeometry(14, 24),
    new THREE.MeshBasicMaterial({ color: 0xffe9b0, fog: false })
  );
  sun.position.set(-q.far * 0.7, 26, -q.far * 0.55);
  sun.lookAt(0, 20, 0);
  scene.add(sun);

  /* névoa dourada + luzes */
  scene.fog = new THREE.Fog(0xe8c07a, 30, q.fogFar);
  scene.add(new THREE.HemisphereLight(0xffe0b0, 0x4a5a3a, 0.85));
  const dir = new THREE.DirectionalLight(0xffc06a, 1.6);
  dir.position.set(-60, 42, -40);
  if (q.shadows) {
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    const s = 70;
    Object.assign(dir.shadow.camera, { left: -s, right: s, top: s, bottom: -s, far: 220 });
  }
  scene.add(dir);

  /* ---------- terreno ---------- */
  const segs = q.shadows ? 96 : 72;
  const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, segs, segs);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = [];
  const cGrass = new THREE.Color(0x4e7a3a), cDry = new THREE.Color(0x8c8c46),
        cSand = new THREE.Color(0xd8c48a);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const h = groundHeight(x, z);
    pos.setY(i, h);
    const dl = Math.hypot(x - LAKE.x, z - LAKE.z);
    const c = dl < LAKE.r + 7 ? cSand
      : cGrass.clone().lerp(cDry, Math.max(0, Math.min(1, (h + 1) / 9)));
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const ground = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
  ground.receiveShadow = q.shadows;
  scene.add(ground);

  /* ---------- lago ---------- */
  const lake = new THREE.Mesh(
    new THREE.CircleGeometry(LAKE.r, 28),
    new THREE.MeshStandardMaterial({ color: 0x3d7ec4, metalness: 0.55, roughness: 0.25 })
  );
  lake.rotation.x = -Math.PI / 2;
  lake.position.set(LAKE.x, -0.55, LAKE.z);
  scene.add(lake);

  /* ---------- vegetação instanciada ---------- */
  const rand = makeRand(1234);
  const dummy = new THREE.Object3D();
  const treePositions = [];

  const spot = (minR) => {   // posição válida (fora do lago/clareira)
    for (let k = 0; k < 40; k++) {
      const x = (rand() - 0.5) * (WORLD_SIZE - 30);
      const z = (rand() - 0.5) * (WORLD_SIZE - 30);
      if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r + 8) continue;
      if (Math.hypot(x, z) < minR) continue;
      return [x, z];
    }
    return [50, 50];
  };

  // troncos + copas
  const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, 3.2, 6);
  const crownGeo = new THREE.ConeGeometry(2.6, 6.5, 7);
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6a4a28 });
  const crownMat = new THREE.MeshLambertMaterial({ color: 0x2c4a22 });
  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, q.trees);
  const crowns = new THREE.InstancedMesh(crownGeo, crownMat, q.trees);
  trunks.castShadow = crowns.castShadow = q.shadows;
  for (let i = 0; i < q.trees; i++) {
    const [x, z] = spot(18);
    const y = groundHeight(x, z);
    const s = 0.75 + rand() * 0.9;
    treePositions.push({ x, z, r: 1.1 * s });
    dummy.position.set(x, y + 1.6 * s, z);
    dummy.scale.setScalar(s);
    dummy.rotation.y = rand() * 6.28;
    dummy.updateMatrix();
    trunks.setMatrixAt(i, dummy.matrix);
    dummy.position.y = y + (3.2 + 3.2) * s * 0.78;
    dummy.updateMatrix();
    crowns.setMatrixAt(i, dummy.matrix);
  }
  scene.add(trunks, crowns);

  // pedras
  const rockGeo = new THREE.DodecahedronGeometry(1, 0);
  const rockMat = new THREE.MeshLambertMaterial({ color: 0x8a8f9c });
  const rocks = new THREE.InstancedMesh(rockGeo, rockMat, q.rocks);
  for (let i = 0; i < q.rocks; i++) {
    const [x, z] = spot(10);
    const s = 0.4 + rand() * 1.3;
    dummy.position.set(x, groundHeight(x, z) + s * 0.4, z);
    dummy.scale.set(s, s * (0.6 + rand() * 0.5), s);
    dummy.rotation.set(rand(), rand() * 6.28, rand());
    dummy.updateMatrix();
    rocks.setMatrixAt(i, dummy.matrix);
  }
  scene.add(rocks);

  // flores silvestres (cruz de 2 planos)
  const flowerGeo = new THREE.PlaneGeometry(0.5, 0.5);
  const flowerMat = new THREE.MeshLambertMaterial({
    color: 0xe8736b, side: THREE.DoubleSide, alphaTest: 0.1,
  });
  const flowers = new THREE.InstancedMesh(flowerGeo, flowerMat, q.flowers * 2);
  for (let i = 0; i < q.flowers; i++) {
    const [x, z] = spot(6);
    const y = groundHeight(x, z) + 0.25;
    for (let j = 0; j < 2; j++) {
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, j * Math.PI / 2 + rand(), 0);
      dummy.scale.setScalar(0.7 + rand() * 0.6);
      dummy.updateMatrix();
      flowers.setMatrixAt(i * 2 + j, dummy.matrix);
    }
  }
  scene.add(flowers);

  return { treePositions };
}
