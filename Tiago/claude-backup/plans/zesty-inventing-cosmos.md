# Plano — Modo Tela Cheia Horizontal para o jogo FotoQuest (mobile)

## Contexto
O jogo FotoQuest (RPG 2D em Canvas, `Tiago/curso-fotografia/jogo.html` +
`assets/js/game/*.js`, já em produção) hoje só tem um `<canvas>` responsivo
(`width:100%; aspect-ratio:16/9`) dentro do fluxo normal da página, com d-pad e
botões touch sobrepostos. O Tiago quer que, no celular, dê pra jogar em
**tela cheia e sempre na horizontal**, mesmo segurando o telefone em pé.

Já existe um rascunho **órfão** `assets/js/game/fullscreen.js` (criado nesta sessão,
não importado em lugar nenhum, sem CSS correspondente). A estrutura dele é boa
(separa Fullscreen API nativa de fallback CSS+rotação) e será **reaproveitada e
corrigida**, não recriada do zero.

## Estratégia
**Rotacionar o `#gameShell` inteiro como um único bloco** (não cada filho
separadamente) — como HUD/painel/diálogo/camUI/touch já são `position:absolute;
inset:0` do próprio shell, eles acompanham automaticamente a rotação/redimensionamento
do pai sem precisar de nenhuma mudança de código.

- **Android/Chrome (tem API completa):** `shell.requestFullscreen()` +
  `screen.orientation.lock("landscape")`. Quando ambos funcionam, o próprio SO
  entrega a tela já em paisagem — **sem** transform CSS (`fs.rotated = false`).
- **iOS Safari (sem API completa, especialmente iPhone):** fallback CSS —
  `#gameShell` vira `position:fixed; inset:0` cobrindo a viewport
  (`100dvh`/`100dvw` com fallback `vh`/`vw`), body com `overflow:hidden`. Se
  `innerHeight > innerWidth` (telefone em pé), aplica `transform:rotate(90deg)`
  no shell com `width`/`height` **trocados** (`100vh`/`100vw`) — o clássico
  "letterbox rotation". `fs.rotated = true` nesse caso.

## Arquivos a mudar

1. **`assets/js/game/fullscreen.js`** — corrigir o rascunho existente (manter a
   estrutura: `fs` state, `enter()`, `exitFS()`, `applyLayout()`,
   `initFullscreen()`, `canvasPoint()`):
   - `fs.rotated` só é `true` quando `fs.mode==="css"` **e** `isPortrait()`;
     nunca quando `fs.mode==="api"`.
   - Validar/ajustar o sinal da fórmula em `canvasPoint()` testando visualmente
     (rotação 90° pode exigir inverter um eixo).

2. **`assets/css/game.css`** (bump `?v=1`→`?v=2`) — novo bloco ao final:
   - `body.gq-fs-on{ overflow:hidden; }`
   - `#gameShell.gq-fs{ position:fixed; inset:0; z-index:9999; max-width:none;
     margin:0; border:0; border-radius:0; width:100vw; height:100dvh; ... }`
   - `#gameShell.gq-fs:not(.gq-rot) #gameCanvas{ width:auto; height:100%;
     aspect-ratio:16/9; }` (fullscreen API real ou já em paisagem)
   - `#gameShell.gq-fs.gq-rot{ width:100vh; height:100vw; transform:rotate(90deg);
     transform-origin:center center; }` + ajuste fino de centralização
     (testar `top/left/margin` no DevTools até preencher sem cortes)
   - `.gq-fsbtn` (botão, canto superior direito, estilo consistente com os
     outros `.gq-*` do jogo: `background:rgba(14,15,19,.8)`, `border:1px solid
     var(--line)`, `border-radius:30px`) + `.on` quando ativo
   - Exibir o botão só em touch: `body.gq-touch .gq-fsbtn{ display:flex; }`
   - `env(safe-area-inset-*)` aplicado **apenas** dentro de `#gameShell.gq-fs`
     (botão e, se der tempo, d-pad/botões touch um pouco maiores em fullscreen)

3. **`assets/js/game/main.js`** (bump `?v=1`→`?v=2`) — importar e chamar
   `initFullscreen(dom.shell)` após montar o objeto `dom`.

4. **`assets/js/game/photo.js`** — em `CameraScene.renderUI()`, o handler
   `this._drag` (linhas ~113-123) hoje calcula `sx`/`sy` manualmente a partir de
   `cv.getBoundingClientRect()`. Trocar por `canvasPoint(e, cv)` importado de
   `./fullscreen.js`, mantendo o resto do arquivo intocado.

5. **`jogo.html`** — meta viewport ganha `, viewport-fit=cover`; bump dos `?v=`
   dos dois arquivos acima.

## Ordem de implementação (cada etapa verificável)
1. CSS + botão + fullscreen API/orientation lock (sem rotação ainda) → testar
   em DevTools emulando Android (Pixel 7): botão entra em tela cheia real.
2. Fallback CSS + rotação (`applyLayout`/`.gq-rot`) → testar emulando iPhone 14:
   girar pra portrait, confirmar rotação preenchendo a tela sem cortes.
3. Corrigir `canvasPoint` em `photo.js` → abrir modo câmera rotacionado,
   arrastar o retículo, confirmar que segue o dedo corretamente (ajustar sinal
   se invertido).
4. Teste final: entrar/sair do fullscreen várias vezes, portrait↔landscape,
   confirmar que o botão não aparece em desktop (sem `gq-touch`), e que o resto
   do site não foi afetado pelo `viewport-fit=cover`.

## Verificação
- `python3 -m http.server 8731` a partir de `Tiago/curso-fotografia/` →
  `http://localhost:8731/jogo.html`.
- Chrome DevTools → device toolbar → Pixel 7: tocar ⛶, confirmar fullscreen +
  landscape lock; testar d-pad e arrastar retículo da câmera.
- Emular iPhone 14: girar pra portrait, tocar ⛶, confirmar rotação CSS sem
  cortes; repetir teste de d-pad e retículo.
- `node --check` nos módulos alterados antes de publicar.
- Deploy: commit no `main` → sync branch `fotografia-deploy` (worktree + rsync
  + push) → conferir/"Reimplantar" no hPanel → testar no ar em
  `fotografia.tiagotavares.online/jogo.html` (idealmente também num celular
  real, já que emulação de iOS no DevTools não reproduz 100% o Safari real).
