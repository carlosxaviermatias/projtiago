---
name: financeiro_app
description: Financeiro virou Web App próprio em financeiro.tiagotavares.adv.br; ler FINANCEIRO.md no repo antes de mexer
metadata: 
  node_type: memory
  type: project
  modified: 2026-08-31T03:10:34.567Z
  originSessionId: 923b4c50-33c3-4afb-92ce-18fcbf259a04
---

O Financeiro saiu do CRM e virou um **segundo Web App** em
`financeiro.tiagotavares.adv.br`, no mesmo repositório (`site-tiagotavares`) e
no mesmo banco. Um `git push` na `main` deploya **os dois**.

**Antes de mexer, ler `FINANCEIRO.md` na raiz do repo** — tem arquitetura,
modelo de dados, armadilhas e pendências, todos atualizados em 31/08/2026.

**Estrutura:** `financeiro-app/server.js` (sem `package.json` próprio — usa o
da raiz, por isso o diretório raiz do Web App é `.` e o comando é
`node financeiro-app/server.js`) · `crm/financeiro.js` (lógica, compartilhada)
· `crm/financeiro-router.js` (rotas, montadas só pelo financeiro-app).

**Sessão compartilhada** entre os dois domínios via
`COOKIE_DOMAIN=.tiagotavares.adv.br`.

⚠️ **Armadilha que já custou caro:** ao ativar o COOKIE_DOMAIN, quem já tinha
entrado ficou com dois cookies `connect.sid` (um host-only antigo, um de
domínio). O navegador manda os dois, o servidor lê o velho e responde 401 — a
tela diz "a senha foi aceita mas a sessão não se manteve". Já corrigido (o
login expira o host-only), mas o padrão vale para qualquer mudança de escopo
de cookie: **testar em navegador que já tinha sessão, não só com `curl`**, que
começa com o pote limpo e nunca reproduz.

Modelo de cartão de crédito: a parcela **não** vira paga na data dela — quem
quita é a **fatura** (tabela `crm_fin_cartoes` + `cartao_id`). Ver
[[crm_admin_password]] para a senha e o problema de caractere especial.
