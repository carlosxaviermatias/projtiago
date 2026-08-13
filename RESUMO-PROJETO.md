# Resumo do Projeto — Site do Curso "Fotografia Digital com Smartphone"

> Documento de referência para retomar o projeto em novas conversas.
> Instrutor: **Tiago Tavares** · Curso 200h (SENAI/Firjan/SEEDUC) · público adolescente.
> **No ar:** https://fotografia.tiagotavares.online (será desativado em breve) e
> https://fotografia.tiagotavares.com.br (cópia, mesmo branch `fotografia-deploy` — vai virar o endereço definitivo)

---

## 1. O que é
Site estático (HTML/CSS/JS puro, **sem build**) com toda a base teórica do curso para os
alunos estudarem em casa, mais recursos interativos e um jogo educacional.

**Local:** `Tiago/curso-fotografia/` (repo git `Tiago/`).
**Design:** tema escuro, accent âmbar `#f4b03e` (hora dourada), fontes Fraunces (títulos) + Inter.
Variáveis e componentes em `assets/css/style.css`; comportamento em `assets/js/main.js` (IIFE).

## 2. Páginas (9)
- `index.html` — home
- `modulo-1-introducao.html` … `modulo-5-projeto.html` — os 5 módulos com teoria, diagramas SVG,
  imagens de mestres, vídeos e **Atividade prática** ao fim de cada um.
- `mestres.html` — galeria de fotógrafos + obras em domínio público.
- `glossario.html` — dicionário de termos com busca.
- `jogo.html` — **FotoQuest**, o jogo (ver seção 4).

## 3. Recursos interativos já construídos
- **Editor de imagem ao vivo** (Módulo 3): sliders de brilho/contraste/saturação/temperatura via CSS filters.
- **Simuladores** no Módulo 1 (obturador, lentes, sensor) e **quiz** do Módulo 1.
- **Cards de segmento clicáveis** (Módulo 4): abrem foto de exemplo no lightbox.
- **Atividades práticas** por módulo, contextualizadas à sala real (janelas grandes + 2 softboxes).
- Tema claro/escuro, lightbox, TOC scrollspy, reveal on scroll, menu mobile.

## 4. FotoQuest — o jogo (2026-07-09)
RPG 2D educacional em **Canvas 2D vanilla + ES modules** (sem libs, sem build), **pixel art procedural**
(sem assets externos). ~3.500 linhas em `assets/js/game/` (15 módulos) + `assets/css/game.css`.

- **10 fases** (estúdio→parque→centro→praia→floresta→evento→casamento→show→trilha→cidade à noite),
  cada uma amarrada a conceitos do curso (exposição, terços, DOF, lentes, luz, noturna).
- **Sistema de fotografia** = coração: viewfinder com grade dos terços, controles ISO/abertura/velocidade/
  lente/foco (limitados pelo equipamento), preview de exposição ao vivo, **nota 0–100** com feedback por
  critério que **cita o módulo do curso a revisar**.
- NPCs, diálogos, missões, **progressão** (XP/nível/moedas/conquistas), **loja** de equipamentos,
  **galeria** de fotos (thumbnails) e **estatísticas** — tudo salvo em **localStorage**.
- Controles **WASD/setas + touch** (d-pad na tela). Data-driven: fases/NPCs/missões/equipamentos em
  `assets/js/game/data/` — expandir = adicionar dados, sem tocar no engine.
- **Verificado ponta a ponta** (desktop e touch) e testado no ar. Zero erros de console.

### Arquitetura do jogo (para expandir)
- `engine.js` (loop + pilha de cenas), `scenes.js` (menu/mapa/fase/loja/galeria/perfil),
  `photo.js` (câmera + avaliação), `tilemap.js`, `entities.js`, `input.js`, `dialogue.js`,
  `quests.js`, `save.js`, `renderer.js`, `sprites.js`.
- `data/levels.js` (as 10 fases), `data/equipment.js`, `data/strings.js` (feedback pedagógico).
- **Adicionar fase:** copiar o formato de uma fase em `levels.js` (mapa em strings + legenda + NPCs +
  alvos + missões). Validador de mapas em `scratchpad/validate-levels.mjs`.

## 5. Deploy (IMPORTANTE)
- Hostinger, plano Business (mesma conta do `jonatan.tiagotavares.online` — **não afetar o Jonatan**).
- Dois subdomínios apontando pro **mesmo branch de deploy** via **Hostinger GIT**:
  `fotografia.tiagotavares.online` (será desativado em breve) e `fotografia.tiagotavares.com.br`
  (cópia que vai virar o endereço definitivo) — repo `tavaresmatias/projtiago`, branch
  **`fotografia-deploy`** (órfão, site na raiz), dir `public_html` (de cada subdomínio).
- **Fluxo de atualização:** editar em `curso-fotografia/` → commit no `main` → atualizar o branch
  `fotografia-deploy` (worktree + `rsync --delete` + push) → conferir/`Reimplantar` no hPanel (GIT).
  O auto-deploy às vezes dispara sozinho, às vezes não — **sempre conferir o commit em hPanel→GIT**.
- **Cache-busting:** ao mexer em `style.css`/`main.js`, **incrementar `?v=N`** em todas as páginas
  (hoje: `style.css?v=5`, `main.js?v=3`; jogo em `game.css?v=1`, `game/main.js?v=1`).
- Verificação só funciona via navegador Chrome (curl/DNS do sandbox retorna 000).

## 6. Ideias futuras (não feitas)
- **Área de membros / acompanhamento de progresso** (aluno cadastra e-mail/telefone e vê barra do que já
  viu): possível, mas exige backend/serviço externo (o site é estático). Alternativa leve: progresso por
  **localStorage** (como o jogo já faz) — barra "você viu X de Y" sem cadastro, só no navegador do aluno.
  Uma área com login de verdade precisaria de um serviço (ex.: Supabase/Firebase) ou plataforma LMS.
