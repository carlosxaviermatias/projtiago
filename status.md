# Status: Bug - Cartão não lança como despesa

**Data:** 31/08/2026  
**Branch:** `claude/cartao-despesa-bug-jv5m81`  
**Projeto:** contas.tiagotavares.adv.br (CRM Node.js)  
**Módulo:** Financeiro (Fase G)

## Problema

O módulo de **Financeiro** do CRM (`contas.tiagotavares.adv.br`) não está lançando corretamente as **despesas com cartão**.

### Contexto

- Fase G (Financeiro) foi deployada em **26/08/2026**
- Implementa um livro-caixa com categorias de **receita** e **despesa**
- Inclui suporte a:
  - Lançamentos com data tripla (competência/vencimento/pagamento)
  - Categorias com grupos (ex: Fixo para ponto de equilíbrio)
  - Repasse automático de parcerias
  - Despesas reembolsáveis

## O que precisa ser verificado

1. **Lançamento de cartão como despesa** - não está funcionando
2. **Categorização** - verificar se categorias de cartão/débito existem e estão ativas
3. **UI/Formulário** - confirmar se o campo de tipo (receita/despesa) está sendo enviado corretamente
4. **Backend** - verificar rotas `/api/crm/fin/*` em `crm/index.js`

## Arquivos relevantes

- `crm/financeiro.js` - lógica do módulo
- `crm/db.js` - tabelas `crm_fin_categorias` e `crm_fin_lancamentos`
- `public/index.html` - UI do financeiro
- `crm/painel.js` - card no dashboard

## Próximos passos

1. [ ] Ler o código do módulo financeiro
2. [ ] Identificar onde o tipo "despesa" não está sendo persistido
3. [ ] Testar lançamento via UI e API
4. [ ] Corrigir o bug
5. [ ] Validar em produção
