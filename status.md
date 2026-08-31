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

## Cadeia Completa da Requisição

```
Frontend (contas-app/public/index.html)
    ↓
POST /api/contas/lancamentos
    ↓
Router (crm/contas-router.js, linha 208)
    ↓
Backend função criar() (crm/contas.js, linha 666)
    ↓
INSERT INTO pes_lancamentos (cartao_id=...)
```

### 1️⃣ Frontend → Backend
- **URL:** `POST /api/contas/lancamentos`
- **Parâmetro:** `cartao_id: origem.startsWith('k') ? origem.slice(1) : null` (linha 1200)
- Exemplo: usuário seleciona "💳 Nubank" → `origem = "k5"` → `cartao_id = 5`

### 2️⃣ Router
- **Arquivo:** `crm/contas-router.js`, linha 208
- **Código:** `router.post('/lancamentos', wrap(async (req, res) => erroOu(res, await contas.criar(req.body), 201)))`
- ✅ Passa `req.body` completo (com `cartao_id`)

### 3️⃣ Backend - Função criar()
- **Arquivo:** `crm/contas.js`, linhas 666-741
- **Linhas 676-678:** Valida se `cartao_id` é inteiro e se cartão existe
- **Linha 726:** Insere `cartaoId` na tabela `pes_lancamentos`
- ✅ Código correto para inserir cartão

## Verificação de Integridade

| Componente | Status | Detalhe |
|---|---|---|
| **Frontend - carregar cartões** | ✅ | `api('GET','/api/contas/cartoes')` na linha 566 |
| **Frontend - formulário** | ✅ | Select renderizado com opções de cartão (prefixo 'k') |
| **Frontend - envio** | ✅ | `cartao_id` extraído corretamente na linha 1200 |
| **Router** | ✅ | Rota POST `/lancamentos` conecta ao `contas.criar()` |
| **Backend - criar()** | ✅ | Aceita e insere `cartao_id` |
| **Backend - validação** | ✅ | Verifica se cartão existe antes de inserir |
| **Schema** | ✅ | Tabela `pes_lancamentos` tem coluna `cartao_id` |
| **Schema** | ✅ | Tabela `pes_cartoes` existe e é consultada |

## Possíveis Causas do Bug

### Hipótese 1: Frontend não carrega cartões
- `ST.cartoes` vazio → select sem opções
- Usuário não consegue selecionar cartão

**Testar:**
```javascript
// No console do navegador
console.log(ST.cartoes)  // deve ter lista de cartões
```

### Hipótese 2: Backend rejeita silenciosamente
- `inteiro(body.cartao_id)` retorna `null` (ID inválido)
- Ou cartão não existe na base (`obterCartao()` retorna `null`)

**Testar:**
```bash
curl -X POST https://contas.tiagotavares.adv.br/api/contas/lancamentos \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "despesa",
    "descricao": "Teste",
    "valor": 100,
    "categoria_id": 1,
    "cartao_id": 5,
    "vencimento": "2026-08-31"
  }'
```

### Hipótese 3: Cartão não existe no banco
- Nenhum cartão foi criado em `pes_cartoes`
- IDs nos cartões criados não correspondem aos IDs que o frontend tenta usar

**Verificar:**
```sql
SELECT id, nome, dia_fechamento, dia_vencimento FROM pes_cartoes;
```

## Próximos Passos Recomendados

1. [ ] **Verificar logs** — procurar erros em `/var/log/` da Hostinger
2. [ ] **Testar console** — verificar `ST.cartoes` no navegador
3. [ ] **Testar API** — fazer POST com `cartao_id` explícito
4. [ ] **Verificar BD** — contar registros em `pes_cartoes` e `pes_lancamentos`
5. [ ] **Implementar fix** — se identificada causa, aplicar correção
6. [ ] **Validar fix** — testar em staging antes de produção
