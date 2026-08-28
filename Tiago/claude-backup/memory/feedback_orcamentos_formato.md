---
name: feedback_orcamentos_formato
description: Orçamentos para clientes seguem o modelo curto de 1 página no timbrado — não a proposta longa em seções
metadata: 
  node_type: memory
  type: feedback
  originSessionId: be74a16d-48cc-4ed7-8b54-7a4cf6c23cc2
  modified: 2026-08-26T20:59:48.129Z
---

Orçamento de serviços advocatícios para cliente é **1 página, objetivo e direto**, no papel timbrado. Estrutura fixa: título "ORÇAMENTO DE SERVIÇOS ADVOCATÍCIOS" · **Serviço:** · **Objeto:** (+ parágrafo do que compreende) · **VALORES** · **CONDIÇÕES DE PAGAMENTO** · **Observação:** · local e data · assinatura "TIAGO TAVARES MATIAS / OAB/RJ 270.860".

**Why:** em 26/08/2026 entreguei uma proposta de 9 seções com tabelas, riscos e citações da Tabela OAB — ele rejeitou ("quero que seja mais objetivo e direto") e apontou o modelo dele na pasta. O cliente não lê documento longo; a fundamentação da Tabela OAB serve para o Tiago decidir o preço, não para o papel que vai ao cliente.

**How to apply:** procurar `Orçamento - modelo.docx` na pasta do cliente (ou em outra pasta de `01.CLIENTES`) ANTES de escrever. Gerar **editando o próprio modelo** — `unzip` → reescrever os parágrafos de `word/document.xml` → `zip` — em vez de criar do zero com docx-js: preserva logo do cabeçalho, rodapé com endereço, fontes e estilo `1Pargrafo`. Não há LibreOffice no Mac para renderizar em PDF; validar extraindo o texto do XML e conferindo a aritmética dos exemplos à mão (já errei uma subtração num exemplo de honorários). Exemplos numéricos são bem-vindos — ele pediu explicitamente. Ver [[project_caterina_arias_jmsn]] e [[reference_tabela_oab_rj]].
