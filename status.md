# Status: Bug - Cartão não lança como despesa no app Contas

**Data:** 31/08/2026  
**Branch:** `claude/cartao-despesa-bug-jv5m81`  
**Projeto:** carlosxaviermatias/site-tiagotavares  
**App:** contas.tiagotavares.adv.br (financeiro pessoal)  
**Módulo:** Contas (pes_*)

## Problema

O Web App de **Contas pessoais** (`contas.tiagotavares.adv.br`) não está lançando corretamente as **despesas com cartão de crédito**.

### Contexto

Existem **três aplicações Node** no mesmo repositório:
1. **Site + CRM** (`tiagotavares.adv.br`) — propostas, processos, contatos, agenda
2. **Financeiro** (`financeiro.tiagotavares.adv.br`) — dinheiro do escritório (tabelas `crm_fin_*`)
3. **Contas** (`contas.tiagotavares.adv.br`) — dinheiro pessoal (tabelas `pes_*`)

O módulo de **Contas** foi criado recentemente (31/08/2026) e implementa:
- Importação de PDF (fatura de cartão, boletos, contas de consumo)
- Leitura OCR de estabelecimentos e categorização
- Livro-caixa com data tripla (competência/vencimento/pagamento)
- Suporte a cartões com vencimento próprio

## Status da investigação

✅ **Repositório clonado:** `carlosxaviermatias/site-tiagotavares`  
✅ **Documentação lida:**
- `FINANCEIRO.md` — módulo do escritório (completo, deployado)
- `CONTAS.md` — módulo pessoal (novo, em implementação)
- `MELHORIAS_FINANCEIRO_G.md` — tipos de parceria e custos fixos

⚠️ **Achado no FINANCEIRO.md §6 (Pendente, item 1):**
> **Vincular 42 parcelas de cartão aos 5 cartões.** Estão em aberto com `forma = 'Cartão'` mas `cartao_id = NULL`, então não entram em nenhuma fatura.

## Arquivos relevantes

### Backend
- `crm/contas.js` — lógica do módulo Contas
- `crm/contas-router.js` — rotas HTTP (`/api/contas/*`)
- `crm/db.js` — schema (tabelas `pes_*`)

### Frontend
- `contas-app/public/index.html` — UI do app Contas
- `crm/web-app.js` — compartilhado (segurança, sessão, login)
- `crm/pdf-texto.js` — leitor de PDFs
- `crm/leitor-contas.js` — parser de fatura/boleto

### Servidor
- `contas-app/server.js` — inicializador

## Investigação realizada

### Backend (contas.js)
✅ **Função `criar(body)` (linha 666):**
- Aceita `cartao_id` corretamente (linha 676-678)
- Valida se o cartão existe (linha 678)
- Passa `cartao_id` para o INSERT na tabela `pes_lancamentos` (linha 726)
- Lógica correta: com cartão, `pagamento = NULL` (linha 688)

✅ **Schema no banco:** Tabela `pes_cartoes` existe e é consultada corretamente

### Frontend (contas-app/public/index.html)
✅ **Carregamento de cartões (linha 566):**
- API `/api/contas/cartoes` é chamada na inicialização
- Cartões armazenados em `ST.cartoes`

✅ **Formulário de lançamento (linhas 1068-1069):**
- Select com opções de cartão renderizado dinamicamente
- Opções têm prefix `k` (ex: `value="k5"` para cartão ID 5)

✅ **Envio de dados (linha 1200):**
- `cartao_id: origem.startsWith('k') ? origem.slice(1) : null`
- Lógica correta para extrair ID do cartão

### Router (contas-router.js)
❓ **Não verificado ainda** - precisa confirmar se `/api/contas/lancamentos` está conectado à função `criar()`

## Próximos passos

1. [ ] Verificar o arquivo `crm/contas-router.js` para confirmar rota POST
2. [ ] Testar lançamento de cartão via API (POST com cartao_id)
3. [ ] Verificar logs de erro em produção
4. [ ] Confirmar se há erro silencioso no lado do servidor
5. [ ] Implementar correção (se necessária)
6. [ ] Validar em produção
