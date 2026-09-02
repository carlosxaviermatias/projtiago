---
name: project-contas-extrato-bancario
description: Import de extrato bancário (PDF) no app Contas pessoais (contas.tiagotavares.adv.br) — parser do BB reescrito, gravação implementada, pendente teste de ponta a ponta em produção
metadata:
  type: project
---

Trabalho em `Tiago/site-tiagotavares/` (repo `carlosxaviermatias/site-tiagotavares`,
branch `main`; gitlink em `carlosxaviermatias/projtiago` também em `main`), no app
**Contas** (finanças pessoais do Tiago, `contas.tiagotavares.adv.br` — diferente do
Financeiro do escritório e do Painel de documentos).

## O que foi pedido

Tiago já importava fatura de cartão de crédito em PDF. Perguntou onde importava
**extrato bancário** (Pix, boleto, tarifa — não é só despesa como o cartão, tem
entrada e saída) e pediu para implementar isso no app Contas.

## Estado atual — FALTA CONFIRMAR EM PRODUÇÃO

Todo o código abaixo está commitado e pushado para `main` nos dois repos. **Nunca foi
confirmado funcionando de ponta a ponta em produção** — cada rodada de teste do Tiago
revelou um problema novo, na ordem: upload não lia arquivo → PDF não suportado → erro
de import de biblioteca (`pdf-parse` 2.x mudou a API) → parser não reconhecia o
formato real do texto extraído → transações apareciam na tela mas nada era gravado no
banco → clique nos cards do painel caía em lista vazia com fatura paga adiantada.

**Próximo passo se retomar**: confirmar com o Tiago (ou testar via extensão Chrome, se
ele abrir uma sessão nova pra isso) que o fluxo completo funciona: Importar → upload
do PDF do extrato do BB → aparece tela "Conferir antes de lançar (N)" com dropdown de
conta e categoria por linha → escolhe conta → clica "Lançar os selecionados" → os
lançamentos aparecem no Painel/Lançamentos do mês certo.

⚠️ **Dependência nova**: `pdf-parse` (fixado em `1.1.1` no `package.json` — a versão
2.x quebra a API, não exporta a função direto). Se o deploy do hPanel não rodar
`npm install` sozinho, o app pode não subir. Ainda não confirmado se isso já rodou em
produção.

## O que foi implementado (`crm/contas.js`, `crm/contas-router.js`, `contas-app/public/index.html`)

- **Upload de PDF**: rota `POST /api/contas/extratos/upload` (multer, memória, só
  PDF) → `extrairTextoPDF()` usa `pdf-parse` pra extrair o texto → `parseExtratoBB()`.
  Upload de `.txt`/`.csv` continua lendo client-side com `FileReader`.
- **Parser do BB reescrito** (`parseExtratoBB` + `RX_LINHA_TRANSACAO`): o texto que sai
  do PDF vem em BLOCOS, não em colunas por espaço como a primeira versão supunha —
  `03/08/202650,00 (+)1439710939136598312` na mesma linha, história nas linhas
  seguintes. O sinal entre parênteses decide crédito/débito. Testado com extrato real
  do Tiago: 84 transações, 19 entradas e 65 saídas, valores batendo.
- **Sugestão automática de categoria** (`sugerirCategoria` + `PISTAS_CATEGORIA`):
  regex por palavra-chave no histórico (posto→Combustível, farmácia→Saúde, etc.).
  Acerta ~42% no extrato de teste — o resto é Pix pra nome de pessoa física, que
  nenhuma heurística resolve; fica em "Outros" e o usuário troca na tela.
- **Gravação** (`confirmarExtrato`, rota `POST /api/contas/extratos/confirmar`):
  diferença importante em relação à importação de fatura de cartão — o lançamento do
  extrato **nasce QUITADO** (pagamento = data do extrato), porque é histórico: o
  dinheiro já se moveu. Faturamento de cartão nasce em aberto (alguém ainda vai pagar).
  Anti-duplicata por `impressao` (hash de data+valor+descrição), mesmo mecanismo da
  importação de fatura.
- **`desfazerImportacao` corrigido**: o filtro original só apagava lançamentos com
  `pagamento IS NULL` — certo pra fatura (protege o que o usuário já quitou na mão),
  mas errado pra extrato (nasce quitado, então "Desfazer" apagaria zero linhas,
  silenciosamente). Agora checa `pes_importacoes.tipo === 'extrato'` e nesse caso apaga
  tudo que a importação criou.

## Bug relacionado, achado e corrigido no caminho: clique nos cards do painel

Não é do extrato, mas apareceu testando o fluxo. O card "Saiu no mês" soma em regime
de caixa: pago (por `pagamento`) + a vencer (por `vencimento`). Clicar no card sempre
filtrava só por `vencimento` — se uma fatura é paga ANTES do vencimento (comum: compra
em agosto, fatura vence em setembro, mas paga em agosto), a data que fez o card somar
(pagamento, agosto) é diferente da que a lista usava pra filtrar (vencimento,
setembro), e o clique caía numa lista vazia com o card mostrando valor >0.

Corrigido com um modo de período novo, `'mes_total'`, em `montarFiltro()` e
`faturasComoDespesa()`: `(pagamento no intervalo) OR (sem pagamento AND vencimento no
intervalo)` — mesmo regime que `resumo()` já usa pra somar os cards. `irLista()` no
frontend passa a usar esse modo ao navegar a partir dos cards (opção também exposta no
seletor "Período por" pra quem quiser usar manualmente).

## Bancos ainda não suportados

Só Banco do Brasil tem parser. `processarExtrato()` recusa com mensagem clara pra
Nubank, C6, Bradesco, Mercado Pago — se pedir, precisa de um extrato real de exemplo
de cada banco pra escrever o parser (o formato varia muito entre bancos, como já vimos
com o BB).
