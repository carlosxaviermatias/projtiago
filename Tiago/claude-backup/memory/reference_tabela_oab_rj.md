---
name: reference-tabela-oab-rj
description: Tabela Indicativa de Honorários OAB/RJ 2025 — onde está o PDF e os itens já conferidos
metadata: 
  node_type: memory
  type: reference
  originSessionId: c4d24bae-3385-41e5-8347-68938cac0c00
  modified: 2026-08-21T13:42:09.334Z
---

PDF em `~/Desktop/tabela oab rj.pdf` (53 páginas). Sem `pdftotext`/LibreOffice no Mac — extrair com `python3` + `pypdf` (instalado), que funciona bem.

**Regras gerais (págs. 7–9):**
- Salvo estipulação diversa, os honorários sugeridos correspondem a **20% do valor econômico**.
- Item 4.4: no silêncio do contrato, 1/3 no início, 1/3 até a sentença de 1º grau, 1/3 ao final (art. 22, § 3º, Lei 8.906/94).
- Item 4.5: contrato de meio — honorários devidos independentemente do resultado.
- Item 4.6: sucumbência é exclusiva do advogado, **não abate** do contratual.
- Item 4.8: acordo entre as partes **não reduz** os honorários contratados.
- Item 4.10: custas e despesas por conta do contratante.
- Valores reajustáveis anualmente pelo IPCA.

**Itens já conferidos (piso RJ / média RJ-MG-SP):**
| Item | Serviço | Piso | Média |
|---|---|---|---|
| 9.20 | Ação de divisão ou demarcação | 12.000 | 15.225,71 |
| 9.21 | Cumulação de pedidos (a mais) | 4.000 | 5.075,24 |
| 9.36 | Ação reivindicatória | 15.000 | 18.304,89 |
| 9.18 | Usucapião | 6.000 | 9.005,53 |
| 9.16 | Possessória de imóvel (reintegração/manutenção) | 4.000 | 4.778,64 |
| 9.23 | Embargos de terceiro | 4.000 | 4.778,64 |
| 7.1.f | Apelação ou contrarrazões | 4.000 | 5.154,21 |
| 7.1.a | Agravo de instrumento | 3.000 | 3.852,43 |
| 1.32.b | Acompanhamento de perícia judicial | 1.000 | 1.580,49 |
| 1.11 / 10.9 | Notificação extrajudicial | 700 | 746,95 |

⚠️ A tabela é **inconsistente consigo mesma**: "ação de divisão ou de demarcação" aparece duas vezes — item 9.20 por R$ 12.000 e item 9.35 por R$ 10.000. Usar o 9.20 (valor maior, na sequência das ações reais).

⚠️ Ao orçar, não confiar em resumo de IA que fale em "piso de R$ 5.000 a R$ 8.000 para ações reais" — é bem abaixo do que a tabela traz. Procurar o item específico. Ver [[project_orcamento_demarcatoria]].
