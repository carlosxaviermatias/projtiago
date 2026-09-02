---
name: crm_admin_password
description: "Senha admin de tiagotavares.adv.br (site, CRM e financeiro) e quais caracteres quebram no Hostinger"
metadata: 
  node_type: memory
  type: project
  modified: 2026-08-31T03:10:19.244Z
  originSessionId: 923b4c50-33c3-4afb-92ce-18fcbf259a04
---

**Senha em uso:** `Ti882590@` — vale para os três: `/admin`, `/crm` e
`financeiro.tiagotavares.adv.br`. Está em `ADMIN_PASSWORD` nas variáveis de
ambiente dos **dois** Web Apps (o do CRM e o do financeiro); trocar num só
quebra o outro.

⚠️ **Caractere especial quebra a senha no Hostinger.** A senha anterior era
`@1211Ninah22@#$` e era recusada mesmo estando certa no hPanel: `$` e `#` são
corrompidos pelo pipeline de variáveis de ambiente. `@` funciona (a atual tem
um). **Evitar:** `$` `#` `` ` `` `\` `"`.

Sintoma quando isso acontece: login responde "Senha incorreta" com a senha
certa, e o log de boot mostra um tamanho/hash diferente do valor salvo no
painel. Diagnóstico rápido: comparar `ADMIN_PASSWORD.length` do log com o
número de caracteres digitados.

Não confundir com o outro problema de login, de cookie duplicado — esse está
em [[financeiro_app]].
