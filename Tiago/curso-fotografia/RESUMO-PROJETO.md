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

- **20 fases**: 1–10 (estúdio→parque→centro→praia→floresta→evento→casamento→show→trilha→cidade à noite)
  e 11–20 (hora dourada→estúdio profissional→luz de janela→mesa do chef→arquitetura→macro→esporte→
  edição/P&B→ensaio do cliente→exposição final), cada uma amarrada a conceitos do curso.
- **Sistema de fotografia** = coração: viewfinder com grade dos terços, controles ISO/abertura/velocidade/
  lente/foco (limitados pelo equipamento), preview de exposição ao vivo, **nota 0–100** com feedback por
  critério que **cita o módulo do curso a revisar**.
- **Fotômetro** no visor (da fase 2 em diante, quando os controles estão liberados). A precisão é
  capacidade da câmera: celular = escuro/ok/claro · semipro = régua em pontos · full-frame = 1/3 + spot.
- **Gabarito** (botão 🎯 / tecla G) só depois de concluir a fase: mostra ISO/abertura/velocidade/foco
  ideais para o equipamento atual. É calculado testando as combinações permitidas com as MESMAS funções
  de pontuação do avaliador (`expPointsFor`/`movementFor`/`dofFor`/`noiseFor`), para nunca divergirem.
- **Visor ótico** (tecla V): o recorte ocupa a tela com a moldura da reflex — ocular, marcas de
  enquadramento, pontos de AF, fotômetro e barra de ajustes. É capacidade da câmera (semipro e
  full-frame), não da fase, e desenha pelo mesmo caminho que revela a foto: o que se vê é o que sai.
- **Direção de cena** (tecla E): alvos/props com `movable: true` são pegos e soltos. Como a nota de
  composição vem da posição do assunto no quadro, arrumar a cena passa a valer nota. Props com `light: N`
  (softbox/refletor) iluminam o assunto conforme a distância — mover a luz muda a exposição de verdade.
  ⚠️ Objeto móvel **não pode ser `solid`**: a grade de colisão é assada no início da fase e ficaria
  travando o lugar antigo depois de movido.
- NPCs, diálogos, missões, **progressão** (XP/nível/moedas/conquistas), **loja** de equipamentos,
  **galeria** de fotos (thumbnails) e **estatísticas** — tudo salvo em **localStorage**.
- Controles **WASD/setas + touch** (d-pad na tela). Data-driven: fases/NPCs/missões/equipamentos em
  `assets/js/game/data/` — expandir = adicionar dados, sem tocar no engine.
- **Verificado ponta a ponta** (desktop e touch) e testado no ar. Zero erros de console.

### Arquitetura do jogo (para expandir)
- `engine.js` (loop + pilha de cenas), `scenes.js` (menu/mapa/fase/loja/galeria/perfil),
  `photo.js` (câmera + avaliação), `tilemap.js`, `entities.js`, `input.js`, `dialogue.js`,
  `quests.js`, `save.js`, `renderer.js`, `sprites.js`.
- `data/levels.js` (as 20 fases), `data/equipment.js`, `data/strings.js` (feedback pedagógico).
- **Adicionar fase:** copiar o formato de uma fase em `levels.js` (mapa em strings + legenda + NPCs +
  alvos + missões). **Sempre rodar `node tools/validate-levels.mjs`**: ele pega largura de linha errada,
  caractere fora da legenda, fase sem saída, missão apontando para alvo inexistente e afins — erros que
  só apareceriam jogando. (Ficava no scratchpad e se perdeu uma vez; agora mora no repositório.)
- ⚠️ `tools/` é de desenvolvimento: manter fora do site com `--exclude 'tools'` no rsync do deploy.

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
  (hoje: `style.css?v=6`, `main.js?v=3`; jogo em `game.css?v=7`, `game/main.js?v=7`).
  No jogo, os módulos ES importam uns aos outros com `?v=N` — bumpar **todos** de uma vez:
  `sed -i '' 's/?v=7"/?v=8"/g' assets/js/game/*.js assets/js/game/data/*.js` + as duas tags no `jogo.html`.
- Verificação só funciona via navegador Chrome (curl/DNS do sandbox retorna 000).

## 6. Ideias futuras (não feitas)
- **Área de membros / acompanhamento de progresso** (aluno cadastra e-mail/telefone e vê barra do que já
  viu): possível, mas exige backend/serviço externo (o site é estático). Alternativa leve: progresso por
  **localStorage** (como o jogo já faz) — barra "você viu X de Y" sem cadastro, só no navegador do aluno.
  Uma área com login de verdade precisaria de um serviço (ex.: Supabase/Firebase) ou plataforma LMS.
