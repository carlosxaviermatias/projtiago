# Diagnóstico — login do CRM (tiagotavares.adv.br/crm)

**Data:** 28/08/2026
**Status:** NÃO RESOLVIDO. O login recusa a senha configurada no hPanel.
**Sintoma atual:** `Senha incorreta [node]` ao entrar com `@1211Ninah22@#$`.

Documento de passagem de bastão. Escrito para que uma sessão nova não repita o
caminho já percorrido. Leia a seção "Não repita" antes de propor qualquer coisa.

---

## 1. Onde o CRM realmente vive

Isso custou tempo no começo, então fica registrado:

| Coisa | Onde |
|---|---|
| Código do CRM em produção | `carlosxaviermatias/site-tiagotavares`, pasta `crm/` |
| Espelho neste repo | `Tiago/site-tiagotavares` (gitlink) |
| Serve `/crm` | `crm/index.js:662` → `crm/public/index.html` (Node/Express) |
| Serve `/api/login` | `app.js` (Node) — **confirmado**, ver §3 |
| Deploy | Hostinger, automático a cada push em `main` |
| Banco | Postgres/Supabase |

**Atenção — armadilha de documentação:** `.env.example:22` e `STATUS.md:49`
apontam para `tavaresmatias/site-tiagotavares`. Esse owner **não existe mais** —
a conta foi renomeada para `carlosxaviermatias`. Não saia procurando um
repositório `tavaresmatias`; ele não é um fork concorrente. Confirmado por
captura de tela da lista de repositórios do usuário.

**Segunda armadilha:** existe uma implementação PHP paralela no mesmo repo
(`api.php`, `config.php`, `.htaccess`), criada no commit `120ccfc` (22/08/2026,
"Converte site-tiagotavares de Node.js para PHP puro"). O `.htaccess` roteia
`/api/*` → `api.php`. **Isso está inerte** — quem responde é o Node (§3). Não
persiga essa pista de novo.

---

## 2. O que foi corrigido (tudo já em `main` e no ar)

Todos verificados antes de publicar. Todos continuam válidos, independentemente
do problema do login seguir aberto.

| PR | Commit | O que corrigiu |
|---|---|---|
| #1 | `04bea0b` | Botão de mostrar/ocultar senha no login (o pedido original) |
| #2 | `2074275` | **Login mostrava "Senha incorreta" para QUALQUER falha** |
| #3 | `3ed89d6` | Store de sessão ignorava `POSTGRES_URL`/`SUPABASE_*` |
| #4 | `37a2371` | Falhas antigas nunca expiravam no anti-força-bruta |
| #5 | `f49c974` | `.trim()` na `ADMIN_PASSWORD` + marcador `[node]` |
| #6 | `701d02a` | Log com tamanho e hash parcial da senha carregada |

Detalhe dos três que são bugs de verdade:

**#2 — a tela de login mentia.** O front colapsava todas as respostas não-2xx
em `"Senha incorreta."`. O servidor distingue quatro casos: 401 (senha errada),
429 (bloqueio por tentativas), 503 (`ADMIN_PASSWORD` ausente) e 500 (falha ao
gravar a sessão). O 500 é o pior: acontece **com a senha certa**. Sem essa
correção nada mais neste documento teria sido descoberto.

**#3 — sessão caía calada no MemoryStore.** `app.js` procurava o banco só em
`DATABASE_URL`; `crm/db.js` aceita também `POSTGRES_URL`, `SUPABASE_DB_URL` e
`SUPABASE_DATABASE_URL`. Com a connection string sob outro nome, o CRM achava o
banco e a sessão não. Como a Hostinger roda várias instâncias, o login gravava
a sessão na memória de uma e a chamada seguinte caía em outra → 401 → volta pra
tela de login sem explicação. **Nunca foi confirmado em produção se era o caso.**

**#4 — bloqueio virava armadilha.** O contador de falhas nunca era zerado pelo
tempo, só por um acerto (impossível durante o bloqueio). Verificado: no código
antigo, 7 falhas + 1 falha **6h20 depois** = bloqueio de 15 min. Agora a janela
é rolante de 15 min; 8 falhas seguidas ainda bloqueiam (proteção intacta).

---

## 3. O que está PROVADO sobre o problema atual

Cada linha tem evidência direta, não é suposição:

| Fato | Evidência |
|---|---|
| Os deploys **chegam** em produção | o botão do olho (#1) aparece na tela |
| Quem responde `/api/login` é o **Node** | sufixo `[node]` no erro (#5) |
| O PHP/`.htaccess` **não** intercepta | idem |
| É **401 real**, não bloqueio de tentativas | a mensagem de 429 é outra e não aparece |
| `ADMIN_PASSWORD` **está setada**, não-padrão | sob HTTPS, se estivesse ausente ou fosse `tiago2026`, o guarda de `app.js` devolveria **503** com outra mensagem — e não devolve |
| **Não** é espaço/quebra de linha invisível | o `.trim()` de #5 não resolveu |
| **Não** é o fallback público | `tiago2026` também é recusada |

**Conclusão:** o processo Node carregou, na variável `ADMIN_PASSWORD`, uma
string que não é `@1211Ninah22@#$` nem `tiago2026`, apesar de o hPanel exibir
`@1211Ninah22@#$`.

---

## 4. Próximo passo — o diagnóstico já está no ar

O PR #6 faz o servidor imprimir, no boot, a impressão digital da senha que ele
de fato carregou. Sai **só no log do servidor**, nunca em resposta HTTP, e não
revela a senha:

```
[login] ADMIN_PASSWORD em uso -> origem=..., tamanho=..., sha256[0:8]=...
```

**Onde ler:** hPanel → o site → logs da aplicação Node (procurar `[login]`).

**Como interpretar:**

| O log diz | Significa | O que fazer |
|---|---|---|
| `origem=PADRAO DO CODIGO` | a variável não chega no processo | problema é a injeção do env na Hostinger, não o valor |
| `tamanho=15, sha256[0:8]=1a203666` | o processo TEM a senha certa | o problema está na comparação ou no que o navegador envia |
| `tamanho=9, sha256[0:8]=cd788db8` | está com `tiago2026` | ⚠️ risco de segurança, ver §6 |
| qualquer outro hash | o painel guarda valor diferente do que exibe | regravar a variável (§5) |

Referência: `@1211Ninah22@#$` → tamanho **15**, `sha256[0:8]=`**`1a203666`**.

---

## 5. Hipótese principal ainda não testada

**O valor no hPanel pode nunca ter sido aplicado.** Duas razões para suspeitar:

1. `Tiago/claude-backup/memory/crm_admin_password.md` registra essa senha como
   criada em 25/08 com a checklist **inteiramente desmarcada**:
   `[ ] Adicionada no hPanel`, `[ ] Deploy realizado`, `[ ] Testada`.
2. `crm_dois_sistemas.md` registra que numa sessão anterior o hPanel exibiu
   "Alterações não salvas: 1" nas variáveis de ambiente. Ou seja: **já houve
   precedente de o painel mostrar um valor em rascunho, não aplicado.**

**Ação sugerida:** no hPanel, apagar o campo `ADMIN_PASSWORD` inteiro, digitar
a senha de novo à mão (não colar), salvar, conferir que não sobrou banner de
"alterações não salvas", e forçar redeploy. Depois ler o log de §4.

---

## 6. Pendências de segurança

1. **`tiago2026` é o padrão público** e está escrito no código e no
   `.env.example`. O guarda de HTTPS em `app.js` bloqueia esse valor com 503,
   então hoje não é explorável — mas confirme pelo log de §4 que não é ele.
2. **`COOKIE_SECURE`** nunca foi ligado (pendência antiga registrada em
   `crm_dois_sistemas.md`).
3. **Remover os diagnósticos temporários** quando o login for resolvido:
   - sufixo `[node]` em `app.js` (#5)
   - log `[login]` no boot (#6)

---

## 7. Não repita — becos sem saída já percorridos

- ❌ **"O `#` da senha trunca a variável"** — inventado, sem base no código.
- ❌ **"Os deploys não estão chegando"** — o ícone do olho prova que chegam.
- ❌ **"O PHP/`api.php` está respondendo com o fallback"** — o marcador `[node]`
  e a recusa de `tiago2026` derrubam isso.
- ❌ **"É o bloqueio de tentativas"** — a mensagem seria a de 429.
- ❌ **"É espaço invisível na variável"** — o `.trim()` não resolveu.
- ❌ **Procurar o repositório `tavaresmatias/...`** — a conta foi renomeada.

**Lição do processo:** o que destravou cada etapa não foi deduzir mais alto, foi
fazer o sistema **contar a verdade** (#2, depois `[node]`, depois o log de #6).
Enquanto a tela dizia "Senha incorreta" para tudo, qualquer teoria parecia
plausível e nenhuma era verificável. Se a sessão nova ficar sem informação, o
caminho é adicionar diagnóstico, não adicionar hipótese.

---

## 8. Limitação da sessão que escreveu isto

`tiagotavares.adv.br` está **bloqueado pela política de egresso** do ambiente
onde o Claude roda. Nenhuma verificação em produção pôde ser feita diretamente —
tudo veio de capturas de tela do usuário. Uma sessão nova provavelmente terá a
mesma limitação; planeje o diagnóstico contando com isso.

---

## 9. Sobre restaurar o backup antigo

Se a escolha for voltar a um estado anterior, atenção ao que se perde:

- **`main` hoje contém 6 correções** (§2), das quais 3 são bugs reais e
  independentes deste problema — em especial #2, sem a qual o login volta a
  esconder o motivo real das falhas e o diagnóstico regride ao ponto zero.
- **A Fase G (Financeiro)** foi publicada em 26/08 (`547ff00`). Um backup
  anterior a essa data perde o módulo inteiro.
- O commit imediatamente anterior a todo este trabalho é **`07d908a`**.

Recomendação: se restaurar, **preserve pelo menos o #2** (`crm/public/index.html`
e `admin/index.html`), senão a sessão nova fica cega do mesmo jeito que esta
ficou nos dois primeiros dias.
