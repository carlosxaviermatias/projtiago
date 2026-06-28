# Projeto Curso Fotografia

Site de estudos para o curso **Fotografia Digital com Smartphone** (200h · SENAI/Firjan · SEEDUC).
Tiago Tavares é o **instrutor**. Objetivo: alunos estudarem a base teórica em casa.

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
