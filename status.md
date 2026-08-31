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

## Próximos passos

1. [ ] Verificar se `contas.js` aceita `cartao_id` na criação
2. [ ] Confirmar se o formulário HTML envia `cartao_id` quando forma="Cartão"
3. [ ] Verificar se há tabela de cartões em `pes_cartoes` ou `crm_fin_cartoes`
4. [ ] Testar lançamento via UI e API
5. [ ] Implementar correção
6. [ ] Validar em produção
