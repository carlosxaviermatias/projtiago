---
name: feedback-teste-ponta-a-ponta
description: "py_compile/checagem de sintaxe não substitui teste HTTP real para rotas com I/O (upload, geração de arquivo, sockets)"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 6bb0fcdd-94f6-4516-81a2-25c22bb37581
---

Para qualquer rota/feature que toque I/O real — upload de arquivo, leitura de corpo de
requisição em bytes brutos, geração de arquivo em disco, sockets — `py_compile` ou
"importar o módulo sem erro" **não prova que funciona**. É preciso rodar o servidor de
verdade e fazer uma requisição HTTP real (`curl` com `--data-binary`, headers corretos,
`--max-time` para detectar travamentos).

**Por quê:** na Fase 1C do painel do Tiago ([[project-crm-advogado]]), documentei
"upload de documentos testado ✅" baseado só em checagem de sintaxe. Só na Fase 2,
ao testar de ponta a ponta, descobri que o upload **nunca funcionou** — dois bugs
reais: (1) `sqlite3.Connection` não tem `.lastrowid` (só `Cursor` tem, e o código
chamava no objeto errado); (2) a rota lia o corpo da requisição duas vezes (uma vez
como JSON via um helper genérico, outra vez como bytes brutos no handler de upload) —
a segunda leitura travava esperando dados que já tinham sido consumidos, gerando
deadlock numa conexão keep-alive. Esse tipo de bug é invisível em `py_compile` e só
aparece quando uma requisição real percorre o caminho de código completo.

**Como aplicar:** depois de implementar qualquer rota de servidor (Python `http.server`,
Flask, etc.) que faça parsing de corpo de requisição, leitura de socket, ou upload de
arquivo, rodar uma instância de teste isolada (porta diferente, `PAINEL_DATA`/diretório
de dados temporário) e validar com `curl` real antes de declarar "testado". Para
roteamento (qual handler atende qual path), testar TODAS as variações de path
esperadas — não só uma, porque uma condição de roteamento mal escrita pode "compilar"
mas nunca ser alcançada (ex.: bloco aninhado sob a condição errada, len(parts) errado).
