---
name: project-curso-fotografia-jogo2d
description: "FotoQuest 2D: 20 fases, fotômetro, gabarito, visor ótico e direção de cena — decisões de arquitetura e armadilhas de teste"
metadata: 
  node_type: memory
  type: project
  originSessionId: ff69166b-bd77-40cb-98c6-7ac43d1f9871
  modified: 2026-08-14T16:44:59.853Z
---

# FotoQuest (jogo 2D) — estado em 13/08/2026

Ver também [[project_curso_fotografia]] (projeto todo) e o `RESUMO-PROJETO.md` no repo, que é a
fonte detalhada. Aqui ficam só as decisões que **não dá para deduzir lendo o código**.

## Princípio que guiou tudo: capacidade da câmera, não flag de fase
Fotômetro (precisão 1/2/3) e visor ótico são `caps` do equipamento em `data/equipment.js`, não
propriedades da fase. Assim evoluir o equipamento muda a experiência em TODAS as fases, e a fase
nova só ensina o recurso. O Tiago aprovou esse desenho e ele deve valer para recursos futuros.

## Uma régua só para nota e gabarito
`expPointsFor`/`movementFor`/`dofFor`/`noiseFor` foram extraídas de `evaluateShot` em `photo.js`
justamente para o **gabarito** (`idealSettings`, força bruta em ~500 combinações) usar a mesma
conta da avaliação. Se um dia mexer na régua, os dois mudam juntos — não duplicar essa lógica.

## Armadilhas reais (custaram tempo)
- **Objeto `movable` não pode ser `solid`**: a grade de colisão é assada no `TileMap` no início da
  fase; mover um prop sólido deixa a colisão travada no lugar antigo.
- **Prioridade do E**: conversar vem ANTES de soltar o objeto. Na primeira versão, quem estava de
  mãos ocupadas não conseguia pegar missão com o NPC ao lado.
- **Desbloqueio retroativo**: quando novas fases entram no fim da fila, quem já terminou a última
  nunca receberia a seguinte (o unlock só acontecia no instante da conclusão). `MapScene.render()`
  agora conserta a corrente ao abrir o mapa. **Repetir isso sempre que acrescentar fases.**
- **Teste no painel do navegador**: `requestAnimationFrame` congela com a aba oculta, então o loop
  do jogo não roda e teclas não surtem efeito. Uso `_teste-jogo.html` (harness na raiz do site,
  fora do deploy) que troca rAF por setTimeout. Mesmo assim, com o painel em segundo plano o
  setTimeout é estrangulado (~1 fps) — screenshot antes de medir para forçar o painel a acordar.
- **Diálogo aberto pausa a fase**: apertar E repetidamente perto de um NPC abre missão atrás de
  missão e o jogador parece "travado" — não é bug.

## Armadilhas de CSS (custaram tempo em 13/08/2026)
- **Duas rolagens aninhadas**: as folhas (loja/galeria/perfil) tinham `max-height` FIXA no corpo
  maior que o espaço do shell, então painel e corpo rolavam os dois. O gesto ia para um ou outro
  conforme onde o dedo caía — o Tiago relatou como "às vezes a loja não rola". Regra: folha é flex
  com `max-height:calc(100% - margem)` e **uma** rolagem só, no corpo.
- **`transform` em ancestral prende `position:fixed`**: `#gameShell` tinha a classe `.reveal` do
  site (fade-in com `translateY`), e isso fazia o painel `fixed` caber nos ~190px do canvas em vez
  de cobrir a tela. Tirei `.reveal` do shell. Se um dia algo `fixed` dentro do jogo "não cobrir a
  tela", olhar transform/filter/contain nos ancestrais ANTES de qualquer outra hipótese.
- **Tema claro do site quebrava o jogo**: a UI do jogo tem cores fixas escuras mas herdava as
  variáveis do site; no tema claro virava texto branco em cartão bege. Agora `#gameShell`
  redeclara a paleta escura — o jogo é sempre escuro. Ao criar UI nova no jogo, usar `var(--…)`
  normalmente, que já resolve para escuro.

## Validador
`tools/validate-levels.mjs` (roda com node, sem navegador). Vivia num scratchpad e **sumiu** entre
sessões; agora está no repo e é excluído do deploy (`--exclude 'tools'` no rsync).

## Entrada por nome (feita) e nuvem (pendente)
- **No ar**: tela de nome, sem senha; save por perfil `fotoquest-save:<slug>` (slug sem acento/maiúscula).
  Nome repetido não é bloqueado — mostra o progresso e pergunta "é você?", senão trancaria o dono
  para fora. O primeiro nome a entrar **adota o save antigo** (chaves sem slug).
- **`professortiago` = modo professor**: todas as fases abertas + moedas ∞ (loja não desconta).
  O desbloqueio é reaplicado a cada entrada, então fase nova já nasce aberta para ele.
- ⚠️ **Campo de texto dentro do jogo**: o listener global de teclado engolia A/S/E/G. `input.js` agora
  ignora eventos com foco em input/textarea. Lembrar disso ao criar qualquer outro campo.
- **Pendente**: sincronizar o save na nuvem (PHP na Hostinger, para o aluno continuar em outro
  aparelho). Parado esperando o Tiago autorizar a publicação de um `api/ping.php` de teste — ele já
  disse que as fotos podem ir junto e que o servidor aguenta. Ver [[project_curso_fotografia]].
