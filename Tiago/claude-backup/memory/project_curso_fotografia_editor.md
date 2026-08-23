---
name: project-curso-fotografia-editor
description: "FotoLab (editor de imagens do site do curso): por que o repo lightdrift-libraw não servia, o desenho não destrutivo e as armadilhas que custaram tempo"
metadata:
  type: project
---

# FotoLab — editor de imagens (19/08/2026)

Editor estilo Photoshop em `Tiago/curso-fotografia/editor.html` + `assets/js/editor/` (13 módulos ES,
Canvas 2D, sem libs/build). Ver [[project_curso_fotografia]] e a **seção 4b do `RESUMO-PROJETO.md`**,
que é a fonte detalhada. Aqui fica só o que não dá para deduzir lendo o código.

## O repositório que o Tiago mandou copiar não servia
`unique01082/lightdrift-libraw` é um **addon nativo de Node** (C++/LibRaw + Sharp) que decodifica RAW
no SERVIDOR: sem interface, sem navegador, exige node-gyp. O site é estático na Hostinger — não havia
uma linha aproveitável. O editor foi escrito do zero. **Se ele mandar outro repo, conferir primeiro se
é biblioteca de servidor antes de prometer "copiar".**

## Princípio que guiou tudo: documento não destrutivo
Pinceladas são **vetores** (pontos em coordenadas da imagem original) e ajustes são funções. Por isso
a mesma função rasteriza a pré-visualização pequena e a exportação em tamanho real — o que o aluno vê
é o que ele salva — e desfazer é restaurar um instantâneo JSON. Vale manter para qualquer recurso novo.

## Armadilhas reais (custaram tempo)
- **`pushHistory` não pode disparar `emit()`**: o refresh reescrevia `<select>`/`<input>` com o valor
  antigo ANTES do manipulador ler `e.target.value` — mesclagem e texto simplesmente "não pegavam".
  Quem altera é que chama `emit()` no fim.
- **`ctx.font` ignora `var(--…)`**: família com variável CSS invalida a atribuição inteira e o texto
  sai em 10px.
- **`fit()` com área de 0 px** dá zoom negativo e a foto some; o `resize()` refaz o encaixe quando a
  área ganha tamanho.
- **Aba em segundo plano** congela `requestAnimationFrame` e chega a reportar `innerWidth = 0`: medir
  pixel do canvas sem tirar screenshot antes dá valor velho e parece bug. (Mesma armadilha do jogo.)
- **Desempenho**: exportar 12 MP caiu de ~21 s para ~8 s (desfoque via `ctx.filter` só em imagem
  grande, textura+nitidez na mesma varredura, grão em mosaico, vinheta por tabela). Por isso o
  **padrão de exportação é 2048 px**, não tamanho real.

## RAW (NEF/CR2/ARW) — o Tiago abriu um NEF e "ficou em baixa resolução"
Não era o editor reduzindo nada: **navegador nenhum revela o negativo digital**. O que ele abre é
uma das **prévias JPEG que a câmera gravou dentro do arquivo** — e o sistema costuma entregar a
menor. Agora `raw.js` varre os bytes, acha todos os trechos `FFD8FF…FFD9` e usa a MAIOR prévia
legível, avisando a resolução obtida. Detalhes no `RESUMO-PROJETO.md` (seção 4b).
⚠️ **RAW chega com `file.type` vazio**: filtrar por `image/` fazia o arquivo arrastado sumir sem
mensagem, e `accept="image/*"` escondia os RAW no seletor. Vale para qualquer upload no site.

## Exemplo em RAW: a NEF do Tiago (20/08/2026)
`assets/img/raw/DSC_0146.NEF` (17,4 MB, **Nikon D5300**, foto do próprio Tiago) entrou entre os
exemplos do editor — ele pediu explicitamente que fosse **em NEF**, não convertida.
- **O arquivo tem 3 prévias JPEG**: 640×424, 1620×1080 e **6000×4000** (+ dados do sensor). É a
  resposta à pergunta dele de por que "ficou em baixa resolução": o sistema entregava uma das
  pequenas. O FotoLab abre a de 6000×4000.
- Exemplo RAW não pode ir por `<img>`: `openSample()` baixa os bytes e usa o caminho de arquivo do
  aluno. A miniatura do cartão é a prévia 640×424 extraída do próprio NEF.
- ⚠️ **`FilesMatch` do .htaccess diferencia maiúsculas**: a câmera grava `.NEF` em caixa alta e a
  regra de cache não pegava. Agora a regra é `(?i)` — vale para qualquer `.JPG` de câmera também.
- O arquivo é servido como `text/plain` (Apache não conhece .NEF). Não atrapalha: lemos bytes.

## Varinha mágica (21/08/2026)
`selection.js` + máscara por camada em dois modos: `adjust` (ajustes valem só dentro) e `clip`
(a camada só existe dentro da seleção). Decisões em detalhe na seção 4b do `RESUMO-PROJETO.md`.
As três que importam: seleção guardada como **parâmetros** (não bitmap); máscara calculada numa
**resolução de referência** (≤2000 px) para pré-visualização e exportação selecionarem o mesmo;
e a varinha amostra o **conteúdo cru** da camada — senão mexer na exposição depois de selecionar
mudaria a seleção sozinha.

⚠️ **Erro que cometi e não pode repetir**: publiquei a varinha reaproveitando o `?v=3` da entrega
anterior. Servidor com código novo + navegador servindo o v=3 guardado (cache de 30 dias) = a
ferramenta simplesmente não aparecia para quem já tinha visitado o site. **Cada entrega que toca
CSS/JS incrementa a versão**, mesmo que a anterior tenha sido no dia anterior. Corrigido em v=4.

## Estado: NO AR (19/08/2026)
`fotografia.tiagotavares.com.br/editor.html` — main `99948b0`, deploy `876a7ff`.
O **auto-deploy do Hostinger pegou sozinho** desta vez (não precisou Reimplantar no hPanel).
Verificado na produção: editor abre, P&B com filtro vermelho aplica, link "Editor" no menu e no
rodapé das 10 páginas, `raw.js` servido com a varredura nova, `tools/` e `_teste-jogo.html` fora
(404). Zero erros de console.
⚠️ No rsync do deploy, excluir também **`.DS_Store`** (além de `tools` e `_teste-jogo.html`).
✅ **Um push serve para os dois endereços**: `.com.br` e `.online` são deploys diferentes do MESMO
branch `fotografia-deploy`, e os dois atualizaram sozinhos (verificado em 20/08/2026 — o Tiago pediu
para "subir também no .online" achando que era separado). Só conferir antes de refazer trabalho.

## "Aquele resumo que sempre fazemos" (19/08/2026)
O Tiago chama assim o **`RESUMO-PROJETO.md`**, e o que ele quer dele é saber **o que mudou e quando**.
Por isso o arquivo agora abre com a seção **"Últimas atualizações"** (histórico datado, do mais recente
ao mais antigo) — manter essa seção em dia a cada entrega, não só as seções temáticas.
A mesma lista virou a página **`atualizacoes.html`** ("Novidades do site", linha do tempo no visual do
site), porque `.md` cru servido como `text/plain` é ruim de ler no celular. Link no **rodapé** das 12
páginas — fora do menu do topo, que já está cheio.
