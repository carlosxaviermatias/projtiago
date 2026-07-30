# Projeto Curso Fotografia

Site de estudos para o curso **Fotografia Digital com Smartphone** (200h · SENAI/Firjan · SEEDUC).
Tiago Tavares é o **instrutor**. Objetivo: alunos estudarem a base teórica em casa.

## ✅ CONCLUÍDO E NO AR (2026-07-21): Safári Fotográfico 3D
Jogo EXTRA em 3D 1ª pessoa (Three.js r160 local), **separado** do FotoQuest 2D (não mexer no 2D!).
**Testado ao vivo no navegador** (WebGL só valida renderizando): mundo/movimento WASD/modo câmera
(C)/exposição AO VIVO (ISO 200→3200 estourou a cena)/**captura da foto NÃO sai preta**/avaliação
0–100 com feedback por critério citando módulos/galeria/touch — zero erros de console.
**No ar:** `fotografia.tiagotavares.online/jogo3d.html` (auto-deploy pegou no push desta vez).
Link "🦌 Safári 3D" no rodapé Explorar das 9 páginas + card de destaque no jogo.html.
Arquivos em `assets/js/game3d/` (10 módulos + vendor/three), `assets/css/game3d.css`, `jogo3d.html`.
Detalhes/estado em `Tiago/curso-fotografia/RETOMAR-JOGO-3D.md`.

## Local
- `Tiago/curso-fotografia/` (dentro do repo git `Tiago/`)
- Site estático puro: HTML + `assets/css/style.css` + `assets/js/main.js`. Sem build.
- Rodar local: `python3 -m http.server 8731 --directory Tiago/curso-fotografia` (config também em `.claude/launch.json` como "curso-fotografia")

## Estrutura (8 páginas)
- `index.html` (home) + 5 módulos + `mestres.html` + `glossario.html`
- Módulos: 1 Introdução (32h), 2 Iluminação (40h), 3 Edição (32h), 4 Empreendedorismo (32h), 5 Projeto (64h)

## Decisões
- Tema escuro, fonte Fraunces+Inter, accent âmbar (hora dourada). Identidade fotográfica.
- 31 imagens baixadas localmente do Wikimedia Commons (domínio público/CC) em assets/img/{historia,mestres,tecnica,deco} — evita links quebrados.
- Diagramas técnicos são SVG autorais inline. Vídeos = cards que linkam para busca no YouTube (nunca quebram).
- Mestres com foto: Salgado (+Gênesis), Cartier-Bresson (+1ª Leica), Leibovitz, Walter Firmo, Evandro Teixeira; sem foto (iniciais): Luisa Dörr, Isabella Lanave (não têm fonte aberta confiável).
- 2026-06-09: Tiago avisou que o site é INTERNO (não divulgado) → pode usar imagens copyright com crédito. Mesmo assim, as obras icônicas dos mestres não estão disponíveis p/ download direto em fontes abertas via curl; usei retratos/contexto CC do Wikimedia/Wikipedia com créditos. Se Tiago quiser obras específicas, ele dropa em assets/img/mestres/works/ e eu ligo no HTML.

## Fontes do conteúdo
- Apostila SENAI "FotoDigSmart 2026" (Cap 1 câmera, Cap 2 smartphone) + Plano de Curso + PER (5 itens de conhecimento). PDFs/xlsx em ~/Downloads/Orientacoes curso de Fotografia...

## Deploy (NO AR) — fotografia.tiagotavares.online
- Publicado na Hostinger (plano Business, mesma conta do jonatan.tiagotavares.online — NÃO afetar o Jonatan).
- Subdomínio `fotografia.tiagotavares.online` criado como site PHP/HTML; deploy via **Hostinger GIT** (Avançado→GIT).
- Conectado ao repo público **tavaresmatias/projtiago**, branch **`fotografia-deploy`** (órfão, só o site na raiz), diretório `public_html`.
- **IMPORTANTE — workflow de update:** editar em `curso-fotografia/` → commit no main → atualizar branch `fotografia-deploy` (worktree + rsync --delete + push). O **auto-deploy NÃO disparou sozinho** no push; foi preciso clicar **"Reimplantar"** no hPanel (GIT). Então, após push, alguém clica Reimplantar (ou investigar webhook do GitHub p/ auto-deploy real).
- SSL ok (HTTPS funciona). Verificação só funciona via navegador Chrome (curl/python do sandbox dão 000 por DNS).

## Fotos coladas no chat (truque importante)
- Imagens que o Tiago COLA no chat NÃO viram arquivo em disco (não estão em Downloads/tmp/IndexedDB de forma utilizável). Mas estão em base64 no .jsonl da sessão em `~/.claude/projects/.../<sessao>.jsonl` (blocos de mensagens "type":"user" com content "type":"image"/source.base64). Dá pra extrair com python (json+base64), filtrando só mensagens do usuário (ignorar tool_result = minhas screenshots). Feito em 2026-06-11 para pegar fotos de Luisa Dörr e Isabella Lanave.
- Mestres agora com TODAS as 6 fotos: +Luisa Dörr e +Isabella Lanave (luisa-dorr.jpg, isabella-lanave.jpg em assets/img/mestres/). Crédito: "imagens de divulgação, uso educacional".
- Obs deploy: nessa última o auto-deploy DISPAROU sozinho (~1min após push). Então o webhook funciona, só pode ter atraso. Se não aparecer, clicar Reimplantar no hPanel GIT.

## FotoQuest — efeitos sonoros (2026-07-10)
- Novo `assets/js/game/audio.js`: SFX 100% sintetizados via Web Audio API (osciladores + ruído), SEM arquivos externos. Efeitos: step (passo), shutter (obturador "chá-clic"), camera (abrir), dialog (bip), select/move/confirm, coin, quest, levelup, deny. Botão 🔊/🔇 (`initSoundButton`) no canto do shell, persistido em localStorage `fotoquest-sound`. Áudio destravado no 1º gesto (autoplay policy) — `unlockAudio` em main.js.
- Ligações: passos em entities.js (Player, no toggle de frame===1), obturador+abrir câmera+tique nos ajustes em photo.js, bip em dialogue.js (render), jingles missão/nível/moeda em photo.js ResultScene + sons de UI em scenes.js (menu/mapa/loja).
- **CACHE-BUST IMPORTANTE:** agora TODOS os 38 imports ES do jogo têm `?v=3` (perl: `s{from "(\.\.?/[^"?]+\.js)(\?v=\d+)?"}{from "$1?v=3"}g` em assets/js/game/*.js e data/*.js). Isso RESOLVE o problema latente de cache de sub-módulos (antes só o main.js tinha versão; sub-módulos alterados ficavam em cache p/ quem já jogou). **Regra nova: ao mexer em QUALQUER módulo do jogo, bumpar TODOS os imports para o mesmo ?v=N** + jogo.html (game.css/game/main.js). Node resolve `?v=N` normalmente (import query).
- **Verificação na produção** (localhost estava inacessível na janela do Chrome): instalei um espião no `window.AudioContext` (wrap de createOscillator/createBufferSource) — como o áudio é lazy, contei os osciladores criados por evento real: confirmar=2, passos=5 em 0,9s andando, abrir câmera=2, obturador disparou. Botão 🔊 renderiza, zero erros de console. Deploy pegou sozinho (auto-deploy).
- DICA: pra testar áudio sem "ouvir", o espião no AudioContext conta a síntese (createOscillator/createBufferSource) — funciona mesmo com contexto "suspended" (sem gesto), provando o wiring. Segurar tecla = `dispatchEvent(new KeyboardEvent('keydown',{key:'d'}))` + timeout + keyup (toques rápidos não sustentam o movimento).

## FotoQuest — tela cheia horizontal mobile (2026-07-10)
- Novo `assets/js/game/fullscreen.js`: botão "⛶ Tela cheia" (só aparece com `body.gq-touch`). Android/Chrome: `requestFullscreen()`+`screen.orientation.lock("landscape")`. iOS/sem API: fallback CSS `position:fixed` cobrindo viewport; se `innerHeight>innerWidth` (telefone em pé), gira `#gameShell` inteiro 90° via `transform:rotate(90deg)` ("letterbox rotation") — UM único transform no shell resolve tudo (HUD/painel/diálogo/camUI/touch já são inset:0 do shell, acompanham de graça).
- **Bug real encontrado e corrigido em teste ao vivo:** centralizar um elemento `position:fixed;inset:0` que também tem `transform:rotate()` NÃO funciona só com inset:0 — precisa cancelar o inset (`inset:auto`) e centralizar manualmente com `top:50%;left:50%;transform:translate(-50%,-50%) rotate(90deg)`. Sem isso o box rotacionado ficava preso no canto, com a página por trás vazando.
- `photo.js`: drag do retículo da câmera agora usa `canvasPoint()` de `fullscreen.js` em vez de calcular `sx/sy` manualmente — funciona corrigido também rotacionado.
- **Verificação real no Chrome** (não só teoria): entrei em fullscreen CSS, forcei `.gq-rot`, confirmei via `getBoundingClientRect()` que o shell cobre exatamente o viewport (0,0)-(1440,722), joguei a Fase 2 rotacionada, abri modo câmera e ARRASTEI o retículo — seguiu corretamente a direção do toque na tela real. Zero erros de console. Botão fica `display:none` sem `gq-touch` (não aparece no desktop).
- Também fiz prova matemática independente (script Node) validando que a fórmula de `canvasPoint()` bate exatamente com a semântica de `rotate(90deg)` do CSS para os 4 cantos + centro — útil se precisar mexer nisso de novo.
- Cache: `game.css?v=2`, `game/main.js?v=2`. `viewport-fit=cover` adicionado em jogo.html (só afeta essa página).
- **Dica de teste**: `resize_window` da extensão do Chrome nem sempre afeta o `innerWidth/innerHeight` real da página neste setup — pra testar o modo retrato/rotacionado, é mais confiável forçar a classe `gq-rot` via JS diretamente e conferir visualmente/via `getBoundingClientRect()`, já que a lógica de quando rotacionar (`isPortrait()`) já está coberta pela prova matemática.

## FotoQuest — jogo 2D educacional (2026-07-09) ⭐
- **NO AR:** fotografia.tiagotavares.online/jogo.html · página `jogo.html` + `assets/css/game.css` + `assets/js/game/` (15 módulos ES, ~3.5k linhas).
- Canvas 2D vanilla + **ES modules** (`<script type="module">`), SEM libs/build. **Pixel art procedural** (sprites em matrizes de chars em `sprites.js` — sem assets externos). **Data-driven**: fases/NPCs/missões/equipamentos em `assets/js/game/data/`.
- 10 fases (estúdio…cidade à noite) mapeadas a conceitos do curso. Coração = **sistema de fotografia** (`photo.js`): viewfinder+grade dos terços, ISO/f/velocidade/lente/foco, preview de exposição ao vivo, nota 0–100 c/ feedback que cita o módulo a revisar. Progressão (XP/nível/moedas/conquistas), loja, galeria, stats — tudo em **localStorage** (`save.js`, chaves `fotoquest-save`/`fotoquest-gallery`).
- Controles WASD/setas + **touch** (d-pad DOM). Link "🎮 Jogo" no nav+footer das 8 páginas.
- **Expandir:** copiar formato de fase em `data/levels.js` (mapa em strings+legenda). Validador em `scratchpad/validate-levels.mjs`; harness de lógica em `scratchpad/dom-harness.mjs` (shim de DOM no Node). Testar local exige servidor (ES modules não rodam via file://): `python3 -m http.server 8731`.
- Verificado ponta a ponta no Chrome (desktop+touch) e no ar. Zero erros de console. Auto-deploy pegou sozinho desta vez.
- **RESUMO completo do projeto** em `curso-fotografia/RESUMO-PROJETO.md` (pedido do Tiago p/ retomar em novas conversas).

## Pergunta em aberto: área de membros (2026-07-09)
- Tiago perguntou se dá pra ter área de membros (aluno cadastra e-mail/tel e vê barra de progresso do que já viu). Respondido: site é ESTÁTICO → login real precisaria de backend/serviço (Supabase/Firebase) ou LMS. Alternativa leve = progresso por localStorage (sem cadastro), como o jogo já faz. NÃO implementado — aguarda decisão do Tiago.

## Cards de segmento clicáveis — Módulo 4 (2026-06-11)
- Seção "Fotografia dá dinheiro?": os 6 cards (Eventos/Produtos/Gastronomia/Retratos/Imóveis/Conteúdo) viraram `.seg-card` clicáveis (role=button, tabindex, dica "🔍 Ver exemplo") que abrem foto de exemplo no LIGHTBOX. JS: handler genérico para qualquer `[data-img]`/`data-cap` em main.js (reaproveitável p/ outros lugares). CSS `.seg-card/.seg-hint`.
- Imagens novas CC BY 2.0 em assets/img/segmentos/: eventos.jpg (Jazz Guy), produtos.jpg (CK Euphoria), imoveis.jpg (Shixart1985). Reuso: comida/estudio-softbox/smartphone.
- Cache atual: style.css?v=4, main.js?v=3. Testado ao vivo: clicar abre o exemplo. Auto-deploy pegou sozinho desta vez.
- PADRÃO REAPROVEITÁVEL: qualquer elemento com data-img+data-cap abre lightbox. Bom para criar "ver exemplo" em outras seções.

## Editor interativo no Módulo 3 (2026-06-11)
- Na seção "Os ajustes básicos" do modulo-3, substituí o diagrama SVG estático por um EDITOR AO VIVO (#liveEditor): foto + sliders de Brilho/Contraste/Saturação (CSS filters) + Temperatura (overlay div .editor-temp com mix-blend soft-light, laranja/azul) + botões P&B e Resetar. Lógica em main.js (bloco "Editor interativo ao vivo"). CSS .editor/.editor-stage/.ec-row no style.css. Testado ao vivo: funciona.
- Cache: subiu para style.css?v=3 e main.js?v=2. (Regra: sempre que mexer em CSS/JS, INCREMENTAR a versão nos 8 html via perl.)
- DEPLOY: auto-deploy NÃO pegou esse push (ficou no commit anterior); precisei clicar **Reimplantar** no hPanel. Ou seja, o auto-deploy é INCONSISTENTE — após push, conferir o commit em hPanel→GIT e clicar Reimplantar se necessário.

## Atividades práticas + cache-bust CSS (2026-06-11)
- Cada módulo (1–5) tem um bloco `.exercise` ("Atividade prática") ao fim, com exercícios de celular/câmera. Componente novo `.exercise/.ex-tag/.ex-meta/.ex-tip` no style.css.
- Contexto da SALA (importante p/ futuras atividades): muito clara, **janelas grandes** (muita luz natural) + **2 softboxes**. O Módulo 2 (iluminação) explora isso.
- **CACHE-BUST:** o link do CSS nas 8 páginas é `assets/css/style.css?v=2`. Se mudar o style.css no futuro, **incrementar para ?v=3** (perl -0pi) senão navegadores servem CSS velho. (Foi o que quebrou o estilo da 1ª atividade até bumpar.)
- Crédito fotos: Luisa Dörr = Leda Abuhab/Itaú Cultural (2019); Isabella Lanave = Gazeta do Povo (2017). Isabella trocada pelo original 1024px.
- Dica de verificação no navegador: as seções têm `.reveal` (fade-in via IntersectionObserver). scroll_to + screenshot imediato pega opacity 0 → ESPERAR ~2s após rolar antes do screenshot.

## Galeria de mestres (2026-06-11)
- mestres.html ganhou galeria "Obras-primas em domínio público": Lange (Mãe Migrante), Hine (O Mecânico), Riis (Bandits Roost), Muybridge (Cavalo em Movimento, GIF animado). Em assets/img/obras/.
- Retratos extras CC em assets/img/mestres/: salgado-ensina, walter-firmo-2, leibovitz-2.
- Obras icônicas dos contemporâneos (Salgado/Cartier/Leibovitz) são copyright → só links "Ver fotos". Site é interno (Tiago autorizou copyright com crédito), mas priorizei CC/domínio público.

## Reserva (imagens baixadas não usadas)
- niepce-retrato, daguerre-retrato, rembrandt-autorretrato, cachoeira-longa-exposicao, walter-firmo-2, leibovitz-2.
