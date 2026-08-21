# Resumo do Projeto — Site do Curso "Fotografia Digital com Smartphone"

> Documento de referência para retomar o projeto em novas conversas.
> Instrutor: **Tiago Tavares** · Curso 200h (SENAI/Firjan/SEEDUC) · público adolescente.
> **No ar:** https://fotografia.tiagotavares.online (será desativado em breve) e
> https://fotografia.tiagotavares.com.br (cópia, mesmo branch `fotografia-deploy` — vai virar o endereço definitivo)

---

## Últimas atualizações (o que mudou, e quando)

> Mesma lista, em página legível: **`atualizacoes.html`** no site.

### 21/08/2026 · Varinha mágica no FotoLab
- Ferramenta **Varinha** (tecla W): clica numa parte da foto e o editor seleciona tudo que for
  parecido em cor. Controles de **tolerância**, **suavizar borda**, **só a mancha do clique**
  (contígua) e **inverter**.
- Duas saídas, as duas do Photoshop: **"Ajustar só aqui"** (os ajustes da camada passam a valer
  apenas dentro da seleção) e **"Nova camada"** (a parte selecionada vira uma camada por cima,
  com ajustes próprios).
- Exercício novo: escurecer o céu sem tocar no resto da foto.

### 20/08/2026 · Um arquivo RAW de verdade entre os exemplos
- Entrou nos exemplos do FotoLab a **`DSC_0146.NEF`** (17 MB), foto original do professor feita numa
  **Nikon D5300** — o aluno abre um RAW sem precisar ter câmera.
- O cartão avisa o peso, e ao abrir o editor mostra o que achou lá dentro. O arquivo guarda **três**
  prévias JPEG (640×424, 1620×1080 e **6000×4000**) além dos dados do sensor; o editor usa a maior.
- Exercício novo na página do editor explicando o que é o RAW e por que ele pesa tanto.

### 19/08/2026 · FotoLab, o editor de imagens — **novo**
- Editor no estilo Photoshop dentro do site (`editor.html`): **camadas**, **curvas**, **histograma ao
  vivo**, corte com grade dos terços, nivelamento, pincel, borracha, **clarear/queimar** e texto.
- 10 predefinições, exportação JPG/PNG/WebP e **projeto .fotolab**, que guarda as camadas para
  continuar depois.
- Abre **RAW** (NEF, CR2, ARW…) usando a maior prévia JPEG que a câmera gravou dentro do arquivo.
- Nada é enviado para servidor nenhum: tudo acontece no aparelho do aluno.
- Link **Editor** no menu e no rodapé de todas as páginas, e destaque no Módulo 3.

### 14/08/2026 · FotoQuest com perfil por aluno
- Tela de entrada por nome: cada aluno tem o seu progresso no mesmo aparelho.
- Modo professor (nome `professortiago`): todas as fases abertas e moedas infinitas.
- Correções: rolagem das folhas (loja/galeria/perfil) e jogo legível com o site no tema claro.

### 13/08/2026 · FotoQuest chega a 20 fases
- 10 fases novas: hora dourada, estúdio profissional, luz de janela, mesa do chef, arquitetura,
  macro, esporte, edição em P&B, ensaio do cliente e exposição final.
- **Fotômetro** no visor, **visor ótico** da reflex, **gabarito** liberado ao concluir a fase e
  **direção de cena** (mover o assunto e as luzes muda a foto de verdade).

### 03/08/2026 · Fan Ho nos Mestres
- Seção completa do fotógrafo de Hong Kong, com galeria de obras.
- O site passou a atender também em **fotografia.tiagotavares.com.br**.

### 29 e 30/07/2026 · Safári 3D e acertos de navegação
- Safári 3D em **3ª pessoa**: fotógrafo voxel com a câmera na mão (vira 1ª pessoa ao fotografar).
- Os dois jogos responsivos no celular, com tela cheia horizontal.
- Menu cabendo numa linha só e **cache do HTML corrigido** (`.htaccess`): o aluno não fica mais com
  a versão antiga da página depois de uma publicação.

### 21/07/2026 · Safári Fotográfico 3D — **novo**
- Jogo em 3D e primeira pessoa: campina na hora dourada, exposição reagindo ao vivo na tela da
  câmera e avaliação da foto ao final.

### 9 a 12/07/2026 · FotoQuest, o jogo — **novo**
- RPG 2D com 10 fases: ISO, abertura, velocidade e foco de verdade, nota 0–100 com feedback que
  **diz qual módulo revisar**, missões, loja, galeria e conquistas.
- Efeitos sonoros sintetizados e tela cheia horizontal no celular.

### 11/06/2026 · Os módulos ficam interativos
- **Editor ao vivo** no Módulo 3 (brilho, contraste, saturação e temperatura).
- Cards de segmento clicáveis no Módulo 4, abrindo fotos de exemplo.
- **Atividade prática** ao fim de cada módulo, pensada para a nossa sala (janelas grandes + 2 softboxes).
- Galeria de obras em domínio público na página Mestres.

### 09/06/2026 · O site entra no ar — **novo**
- Os 5 módulos do curso, Mestres, Glossário, busca no glossário e tema claro/escuro.

---

## 1. O que é
Site estático (HTML/CSS/JS puro, **sem build**) com toda a base teórica do curso para os
alunos estudarem em casa, mais recursos interativos e um jogo educacional.

**Local:** `Tiago/curso-fotografia/` (repo git `Tiago/`).
**Design:** tema escuro, accent âmbar `#f4b03e` (hora dourada), fontes Fraunces (títulos) + Inter.
Variáveis e componentes em `assets/css/style.css`; comportamento em `assets/js/main.js` (IIFE).

## 2. Páginas (11)
- `index.html` — home
- `modulo-1-introducao.html` … `modulo-5-projeto.html` — os 5 módulos com teoria, diagramas SVG,
  imagens de mestres, vídeos e **Atividade prática** ao fim de cada um.
- `mestres.html` — galeria de fotógrafos + obras em domínio público.
- `glossario.html` — dicionário de termos com busca.
- `jogo.html` — **FotoQuest**, o jogo (ver seção 4) · `jogo3d.html` — Safári 3D.
- `editor.html` — **FotoLab**, o editor de imagens (ver seção 4b).

## 3. Recursos interativos já construídos
- **Editor de imagem ao vivo** (Módulo 3): sliders de brilho/contraste/saturação/temperatura via CSS filters
  (amostra; o editor completo é o **FotoLab**, em `editor.html` — ver seção 4b).
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

## 4b. FotoLab — o editor de imagens (2026-08-19)
Editor estilo Photoshop 100% no navegador, em **Canvas 2D + ES modules** (sem libs, sem build, nada
sai do aparelho do aluno). `editor.html` + `assets/css/editor.css` + `assets/js/editor/` (13 módulos).

**Pedido do Tiago era "copiar o código do unique01082/lightdrift-libraw"** — mas aquele repositório é
um *addon nativo de Node* (C++/LibRaw + Sharp) que decodifica RAW no SERVIDOR: não tem interface, não
roda em navegador e exige compilação (node-gyp). Não havia nada aproveitável para um site estático;
o editor foi escrito do zero no padrão do projeto.

### O que faz
- **Camadas** (imagem, pintura, texto), com opacidade e 15 modos de mesclagem.
- **Ajustes por camada**: exposição, contraste, altas luzes, sombras, brancos, pretos, temperatura,
  matiz, saturação, intensidade, textura, nitidez, desfoque, grão, vinheta, P&B com filtro colorido
  (vermelho/laranja/amarelo/verde/azul) e viragem (sépia/frio).
- **Curvas** (RGB + R/G/B) com spline monotônica, **histograma ao vivo** com aviso de recorte.
- **Varinha mágica** (`selection.js`): seleção por semelhança de cor com tolerância, suavização,
  contígua ou global, e inversão. Vira **máscara da camada** em dois modos — `adjust` (os ajustes
  valem só dentro) e `clip` (a camada só existe dentro da seleção).
- **Corte** com proporções, grade dos terços, giro de 90° e **nivelamento** (que já recorta os cantos
  vazios sozinho, como o Lightroom).
- **Ferramentas**: mover, cortar, pincel, borracha, **clarear e queimar** (dodge/burn do laboratório),
  texto e navegar. Atalhos V/C/B/E/D/Q/T, ESPAÇO navega, `\` compara com o antes, Ctrl+Z/Ctrl+Shift+Z.
- **Predefinições** (10 "filtros" que são só receitas de ajuste — o aluno abre e vê o que mudou).
- **Exportar** JPG/PNG/WebP com qualidade e tamanho (padrão 2048 px) e **projeto .fotolab** (JSON com
  camadas + imagens em base64 — o papel do .psd). Sessão anterior guardada em IndexedDB.

### Decisões que não dá para deduzir do código
- **Documento 100% não destrutivo**: as pinceladas são guardadas em VETOR (lista de pontos em
  coordenadas da imagem original) e os ajustes são funções. Por isso a mesma função desenha a
  pré-visualização pequena e a exportação em tamanho real — *o que o aluno vê é o que ele salva* —
  e desfazer é só restaurar um instantâneo JSON.
- **`pushHistory` NÃO dispara `emit()`.** Disparava, e o refresh reescrevia `<select>`/`<input>` com o
  valor antigo ANTES do manipulador ler `e.target.value` — a mudança "não pegava" (aconteceu com o
  modo de mesclagem e com o texto). Quem altera é que chama `emit()` no fim.
- **`ctx.font` não resolve `var(--…)`**: com uma variável CSS na família, a atribuição inteira é
  ignorada e o texto sai em 10px. Camada de texto guarda a família literal.
- **Ferramenta corte sem recorte definido**: arrastar dentro da moldura tem de DESENHAR um recorte
  novo; tratar como "mover" só esbarrava nos limites e parecia travado.
- **Desempenho**: desfoque via `ctx.filter` do navegador (com teste de suporte e queda para desfoque
  de caixa em JS) e só em imagem grande — em imagem pequena as idas e vindas de pixel custam mais.
  Textura e nitidez saem na MESMA varredura; grão usa mosaico de ruído pronto; vinheta usa tabela por
  distância². Exportar 12 MP: ~21 s antes, ~8 s depois — daí o padrão de exportação ser 2048 px.
- **Área com 0 px**: se o `fit()` roda antes de a área ter tamanho, o zoom fica negativo e a foto some.
  O `resize()` refaz o encaixe quando a área ganha tamanho (e sempre que ela muda, se ainda estava
  encaixada — é o que faz a gaveta do celular funcionar).
- **Celular**: os painéis viram **gaveta de baixo** (não lateral), senão a foto ficaria totalmente
  escondida enquanto se arrasta um controle.
- **A interface é sempre escura** (paleta redeclarada em `#flApp`, como no jogo): parede clara em
  volta engana o olho ao julgar brilho e cor.
- **RAW (NEF/CR2/ARW…) — `assets/js/editor/raw.js`.** Navegador nenhum revela o negativo digital.
  O que existe pronto dentro do arquivo são as **prévias JPEG da câmera** — e quando o sistema
  "abre" um NEF, costuma entregar a MENOR delas (daí o Tiago ver "baixa resolução"). O FotoLab
  varre os bytes procurando todos os trechos `FFD8FF…FFD9`, testa os maiores e usa a **maior prévia
  legível**, dizendo no aviso qual resolução conseguiu (e sugerindo exportar JPG/TIFF se a prévia
  for pequena). Os dados do sensor do Nikon também começam com `FFD8` (JPEG sem perdas): esse
  candidato falha ao carregar e é ignorado sozinho.
  - Varredura de 4 em 4 bytes (`Uint32Array` + truque do "tem byte 0xFF nesta palavra"): NEF de
    28 MB abre em ~0,9 s (era ~9 s byte a byte + data URL).
  - **Nada de `readAsDataURL` para abrir**: virar base64 um arquivo de 28 MB custa segundos e o
    dobro de memória. Usar `URL.createObjectURL`; o data URL só é gerado ao salvar o projeto.
  - ⚠️ **RAW chega com `file.type` VAZIO**: o filtro `type.startsWith('image/')` do arrastar-e-soltar
    engolia o NEF sem mensagem nenhuma, e `accept="image/*"` escondia os RAW no seletor. Os dois
    passaram a considerar a EXTENSÃO.
- **Varinha — as três decisões que sustentam o resto:**
  1. A seleção é guardada como **parâmetros** (ponto clicado, tolerância, suavização, contígua,
     invertida), nunca como um desenho pronto: sobrevive ao salvar o projeto e vale em qualquer
     tamanho de saída, igual às pinceladas.
  2. A máscara é calculada numa **resolução de referência** (máx. 2000 px de lado) e esticada para
     o tamanho desenhado. Garante que pré-visualização e exportação selecionem a MESMA coisa e
     evita um preenchimento de 24 MP a cada mexida na tolerância.
  3. A varinha amostra o **conteúdo cru** da camada (`drawContent()`, sem ajustes). Se olhasse a
     imagem já ajustada, mexer na exposição depois de selecionar mudaria a seleção sozinha.
  - Desempenho: pixels de origem em cache + máscara da TELA em meia resolução (≈28 ms por quadro
     em vez de ≈110). O que é **aplicado** na foto usa sempre a resolução cheia.
  - `maskCanvasFor(layer, doc, selOverride, fast)`; o véu na tela escurece o que ficou de fora em
     vez de tracejado piscante — mais legível para quem está aprendendo.
- **`nextPaint()` em vez de `requestAnimationFrame` puro** antes de tarefas longas (ler RAW,
  exportar): em aba de segundo plano o rAF nunca dispara e a abertura ficaria esperando para sempre.

### Varinha testada ao vivo (Chrome, 2026-08-21)
Clique no céu de *Hora dourada* seleciona 32% da imagem em ~0,3 s. "Ajustar só aqui" + exposição
−70: céu 152,5 → 62 e **chão 139,7 → 139,7 (idêntico ao byte)**. "Nova camada": a camada nova tem
pixels em 39,8% da área e aceita ajustes próprios (temperatura −60 esfriou só o céu). Máscara
sobrevive ao projeto .fotolab e acompanha o giro de 90°. Zero erros de console.

### Testado ao vivo (Chrome, 2026-08-19)
RAW: NEF sintético de 28 MB com miniatura 160×120 + prévia 6000×4000 → escolheu a grande em 0,9 s;
NEF só com prévia 320×212 → abriu e sugeriu exportar JPG; arquivo sem prévia legível → mensagem
explicando o que fazer; NEF arrastado (tipo vazio) → abriu com o aviso.
Abrir exemplo · ajustes (exposição/saturação medidas em pixel) · corte e nivelamento (0 pixel
transparente sobrando) · giro 90° (dimensões trocam) · pincel, borracha e clarear (42,8 → 99 de
brilho) · texto (59 px de altura para fonte 61) · camadas com mesclagem e opacidade · desfazer/refazer ·
projeto .fotolab ida e volta (135,46 → 135,50 de média) · exportação em tamanho real bate com a
pré-visualização (135,96) · celular 375×812. Zero erros de console.
⚠️ **Armadilha de teste** (a mesma do jogo): com a aba em segundo plano o `requestAnimationFrame`
congela e o `innerWidth` chega a 0 — medir pixel do canvas sem tirar um screenshot antes dá valor
velho e faz parecer que a mudança não funcionou.

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
