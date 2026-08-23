---
name: project-tiagotavares-combr-redirect
description: "Migração de tiagotavares.com.br — WordPress abandonado, domínio vira redirect pra tiagotavares.adv.br; e-mail UOL intocável"
metadata: 
  node_type: memory
  type: project
  originSessionId: 61099acd-b567-453d-b6f4-7c402fec5545
  modified: 2026-08-02T01:57:07.105Z
---

Em 2026-08-01 o usuário instalou um WordPress para `tiagotavares.com.br` numa conta Hostinger separada (IP visto: `45.152.46.112`, doc em `Tiago/migracao-site-hostinger-uol-email.md`). Em 2026-08-02 decidiu abandonar essa ideia: quer que `tiagotavares.com.br` (e `www`) sejam só um alias que redireciona 301 para `https://tiagotavares.adv.br`, preservando o path.

**Feito:** middleware de redirect por Host header adicionado em `Tiago/site-tiagotavares/app.js` (logo após `trust proxy`), commitado e enviado (push) pro repo `site-tiagotavares` (remote moveu de `tavaresmatias` para `carlosxaviermatias/site-tiagotavares` — confirmado pelo usuário como intencional, não é problema).

**Pendente (ações manuais do usuário, fora do meu acesso):**
1. Apagar o WordPress no hPanel da conta Hostinger onde ele foi instalado.
2. No painel de DNS da UOL (`meupainelhost.uol.com.br`), apagar os registros A de `tiagotavares.com.br`/`www` que apontam pro WordPress.
3. Na conta "Tiago" da Hostinger (app Node que já serve `tiagotavares.adv.br`), adicionar `tiagotavares.com.br`/`www` como domínio desse mesmo app Node.
4. Criar os novos registros A na UOL apontando pro(s) IP(s) que a Hostinger indicar no passo 3 (no momento da checagem, o app Node estava em `89.116.213.72` / `147.79.105.176`, mas confirmar na hora).

**Why:** o domínio `.com.br` é registrado/hospedado na UOL (nameservers UOL, DNS gerenciado lá), enquanto o e-mail profissional histórico (`@tiagotavares.com.br`) também vive na UOL (MX `mx.uhserver.com`, SPF, DKIM, SMTP/POP). O usuário foi explícito e repetiu duas vezes: **nunca mexer nos registros de e-mail da UOL** (MX, SPF, CNAME de smtp/pop/mail/_domainkey, SRV) — só nos registros A do site.

**How to apply:** em qualquer trabalho futuro tocando DNS de `tiagotavares.com.br` na UOL, tocar **somente** registros A (raiz e www). Nunca alterar/remover MX, TXT SPF, CNAME de e-mail, SRV. Antes de apagar o WordPress ou mudar DNS, lembrar que é ação manual do usuário no hPanel/UOL — eu não tenho acesso a essas contas.

Ver também [[crm_dois_sistemas]] (contexto geral do site/CRM `tiagotavares.adv.br`, mesmo Node app que vai receber esse domínio).
