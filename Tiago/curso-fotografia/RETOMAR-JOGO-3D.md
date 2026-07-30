# Retomar — Safári Fotográfico 3D (jogo EXTRA, em construção)

> Documento pra continuar numa nova conversa. Leia isto primeiro, junto com
> `RESUMO-PROJETO.md` (visão geral do site) e a memória do projeto.

## Contexto / pedido do Tiago
- Ele quer um **jogo NOVO em 3D primeira pessoa** (olhar pela tela da câmera), **SEM mexer** no
  FotoQuest 2D que já está no ar (`jogo.html`). É um **extra**, página/código/save separados.
- Pediu explicitamente um **botão de qualidade gráfica** (celular fraco / médio / potente). ✅ feito.
- Nome escolhido: **"Safári Fotográfico 3D"** — campina na hora dourada, primeira pessoa, fotografar
  a vida selvagem aplicando ISO/abertura/velocidade/lente/foco com a mesma didática do curso.

## ⚠️ REGRA DE OURO
NÃO tocar em nada de `assets/js/game/` (FotoQuest 2D) nem em `jogo.html`. O 3D é 100% isolado em
`assets/js/game3d/`, `assets/css/game3d.css`, `jogo3d.html`. Saves em chaves próprias
`fotoquest3d-*` (localStorage) — não conflita com o 2D.

## O que JÁ está feito (código completo, sintaxe validada, lógica testada)
**Tudo criado em `Tiago/curso-fotografia/`:**
- `jogo3d.html` — página nova (header/footer do site, canvas + camadas UI). Carrega
  `game.css?v=3` (reuso) + `game3d.css?v=1` + `game3d/main.js?v=1` (type=module).
- `assets/css/game3d.css` — viewfinder (grade dos terços em DOM), joystick touch, seletor de
  qualidade, flash. Complementa o `game.css` (reusa .gq-result/.gq-sheet/.gq-chip/etc).
- `assets/js/game3d/vendor/three.module.min.js` — **Three.js r0.160.0 (MIT)**, hospedado local
  (~670KB) + `THREE-LICENSE.txt`.
- `assets/js/game3d/` (10 módulos ES, sintaxe OK via `node --check`):
  - `main.js` — boot, loop, HUD, painéis (intro/missões/galeria), joystick touch, seletor de
    gráficos, integra fullscreen. **JÁ corrigido:** `preserveDrawingBuffer:true` + `setPixelRatio`
    antes de `setSize` (pra captura da foto não sair preta).
  - `quality.js` — presets leve/médio/alto + auto-detecção (deviceMemory/cores) + persistência.
  - `world.js` — mundo low-poly procedural: terreno com relevo, lago, árvores/pedras/flores
    instanciados, céu gradiente dourado, sol, névoa, luzes. `groundHeight()` compartilhado.
  - `targets.js` — 5 alvos low-poly animados por código: veado, pássaro (voa em círculo),
    borboleta, orquídea, barco no lago. Cada um com props pedagógicas (motion/idealDistance/DOF).
  - `controls.js` — 1ª pessoa: WASD+mouse (pointer lock) no desktop; joystick esq + arrastar dir
    no touch. Compatível com tela girada (remapeia deltas). Colisão com troncos + limites.
  - `camera3d.js` — modo câmera: viewfinder, ajustes ISO/f/vel/lente/foco, **exposição AO VIVO
    real** (toneMappingExposure), FOV da lente real, captura do frame WebGL + revelação
    (blur de foco/tremor, ruído ISO, vinheta) + `showResult()`.
  - `evaluate.js` — nota 0–100 por critério (exposição/movimento/terços/foco+DOF/lente) +
    feedback citando o módulo do curso. SCENE_EV=12 (hora dourada).
  - `missions.js` — 4 missões (flor, borboleta, pássaro, barco) + save3d próprio + galeria (12).
  - `audio3d.js` — sons sintetizados (passos, obturador, pássaros ambiente, etc), próprio.
  - `fullscreen3d.js` — tela cheia horizontal (mesma estratégia validada no 2D: API+lock no
    Android, fallback CSS+rotação 90° no iOS). Reusa classes `.gq-fs/.gq-rot/.gq-fsbtn` do game.css.

## Verificação já feita
- `node --check` nos 10 módulos: ✅ OK.
- Harness de lógica em Node (`scratchpad/harness3d.mjs`): **24/24 ✅** — evaluate (exposição,
  movimento, terços, foco, lente, fora-de-quadro), quality (auto-detecção leve/médio/alto),
  missions (XP/galeria/conclusão), audio3d. Rodar: `~/.local/node/bin/node <caminho>/harness3d.mjs`.
- Assets servem 200 no `python3 -m http.server 8731` (rodar a partir de `curso-fotografia/`).

## O QUE FALTA (próximos passos)
1. ✅ **TESTE VISUAL no navegador — FEITO (2026-07-21)**. Validado no preview (localhost:8731):
   - Mundo renderiza (campina dourada, árvores low-poly, lago com reflexo do sol, veado). ✅
   - Anda em 1ª pessoa (WASD) — andou até a beira do lago. ✅
   - Tecla **C** abre a câmera (viewfinder + grade dos terços + alvo detectado "Barco · 89 m"). ✅
   - **Exposição muda AO VIVO**: ISO 200→3200 clareou/estourou a cena visivelmente. ✅
   - **Foto (ESPAÇO/botão obturador) NÃO sai preta** — capturou o frame WebGL superexposto; EXIF
     "ISO 3200 · f/5.6 · 1/125 · Normal 50mm"; nota **26/100** ⭐ + feedback completo por critério
     (exposição/movimento/composição/foco/lente/ruído) citando o módulo do curso. ✅
   - Galeria persiste a foto com thumbnail real ("1/12 · 26 · Barco ao pôr do sol"). ✅
   - Mobile (viewport 375, gq-touch): joystick + botão 📷 + botão Tela cheia aparecem. ✅
   - **Console: ZERO erros** o teste inteiro. ✅
2. (nada quebrou)
3. ✅ **Links no site — FEITO (2026-07-21)**: adicionado `🦌 Safári Fotográfico 3D` no rodapé
   "Explorar" das 9 páginas (glossario, index, jogo, mestres, modulo-1..5), logo após o FotoQuest,
   mesmo padrão do próprio `jogo3d.html`. **Ainda opcional:** um card/destaque em `jogo.html`
   apontando pro 3D (decidir com o Tiago).
4. ✅ **Deploy — PUSH FEITO (2026-07-21)**. Commit no `main` (`c7b4bc1`) + branch
   `fotografia-deploy` atualizada e enviada (`d7bc904`) via worktree + `rsync --delete` + push.
   Confirmado no remoto: jogo3d.html, game3d.css, os 10 módulos ES e o `vendor/three.module.min.js`.
   ✅ **NO AR e testado (2026-07-21)**: `https://fotografia.tiagotavares.online/jogo3d.html` renderiza
   o mundo 3D, zero erros no console, todos os assets carregam. **A Hostinger auto-publica no push**
   (GIT auto-deploy) — NÃO precisou de "Reimplantar" manual no hPanel. Falta só testar num celular real.

## Pontos de atenção
- **Imports do game3d são "bare"** (sem `?v=`). É jogo NOVO, então na 1ª publicação tá ok. Se
  no futuro editar um sub-módulo do 3D, lembrar do problema de cache de ES modules (ou versionar
  os imports como foi feito no 2D com `?v=3`).
- Captura da foto: `preserveDrawingBuffer:true` já setado. Se a foto sair preta mesmo assim,
  capturar logo após `renderer.render()` no mesmo tick.
- Performance: presets já cortam pixelRatio/árvores/sombras. Testar "Leve" com CPU throttle.
- Three.js r160 API: usei WebGLRenderer, ACESFilmicToneMapping, InstancedMesh, CanvasTexture,
  MeshLambert/Standard/Basic, Fog, Hemisphere/DirectionalLight, geometrias básicas, Vector3.project.
  Se der erro de import/símbolo, checar a versão do build.

## Estado das tarefas (TaskList)
- #8 Etapa 1 (mundo/página) — feito, falta validar no navegador.
- #9 Etapa 2 (alvos/câmera/avaliação) — código feito, falta validar.
- #10 Etapa 3 (missões/HUD/galeria/sons) — código feito, falta validar.
- #11 Etapa 4 (touch/qualidade/fullscreen) — código feito, falta validar.
- #12 Etapa 5 (testes/links/deploy) — **pendente** (é o foco da retomada).

## Servidor local rodando?
Provavelmente sim na porta 8731 (background). Se não, subir de novo como acima.
