---
name: github-sync-setup
description: GitHub auto-sync feature para site Jonathan - salva edições do painel de volta ao repositório
metadata: 
  node_type: memory
  type: feature-documentation
  status: deployed-and-tested
  lastUpdated: 2026-06-08
  originSessionId: 0f33c73c-cf2c-4cab-982b-acf2ba421e0e
---

# GitHub Sync Feature - Jonathan Site

## ✅ Status: COMPLETO E TESTADO

**Commit:** `b70c48e` — "Sincroniza edições do painel de volta ao GitHub"
**Deploy:** `f2b50ce` (teste de sync) — ✅ Funcionando

---

## Como Funciona

Quando o usuário **salva dados no painel admin** (`POST /api/admin/data`):

1. **Node.js Express** salva os dados em `data.json` localmente
2. **Em background (async)** dispara `syncToGitHub()`:
   - `git add data.json img` (commita data + imagens)
   - `git commit` com mensagem automática e autor "Painel Admin"
   - `git push` para `origin/main` usando token de autenticação HTTPS

3. **Não bloqueia** a resposta do painel — sync roda em background

---

## Código Implementado

### app.js (lines 72-99)

```javascript
function syncToGitHub(message) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !repo) {
    console.log('ℹ️ GITHUB_TOKEN/GITHUB_REPO não configurados — edições salvas só localmente.');
    return;
  }

  const remote = `https://x-access-token:${token}@github.com/${repo}.git`;
  const safeMsg = String(message || 'Atualiza conteúdo via painel').replace(/["`$\\]/g, '');

  const cmd = [
    `cd "${__dirname}"`,
    `git add data.json img`,
    `git -c user.email="painel@jonatanbandeira.site" -c user.name="Painel Admin" commit -m "${safeMsg}" || echo "Nada para commitar"`,
    `git push "${remote}" HEAD:${branch}`
  ].join(' && ');

  exec(cmd, { timeout: 60000 }, (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Falha ao sincronizar com o GitHub:', (stderr || err.message || '').replace(token, '***'));
    } else {
      console.log('✅ Conteúdo sincronizado com o GitHub.');
    }
  });
}
```

**Called from:** `POST /api/admin/data` (line 179)

---

## Variáveis de Ambiente (Hostinger)

### ✅ Configuradas em 2026-06-08

| Variável | Valor | Tipo |
|----------|-------|------|
| `GITHUB_TOKEN` | `github_pat_...` (fine-grained) | Credencial (user-provided) |
| `GITHUB_REPO` | `tavaresmatias/jonatanbandeira` | String |
| `GITHUB_BRANCH` | `main` | String (opcional, padrão) |

**Token Requirements:**
- Fine-grained Personal Access Token (GitHub > Settings > Developer settings > Tokens)
- Repository: `tavaresmatias/jonatanbandeira`
- Permissions: Contents → **Read and write**
- Expiration: 1 ano (user choice)

---

## Teste Realizado (2026-06-08)

### Teste via API (simulando painel)

1. **POST /api/login** → autenticado com `jonatan123`
2. **GET /api/admin/data** → baixei dados atuais
3. **Adicionei campo** `test_sync_at: 1780952965`
4. **POST /api/admin/data** → salvei dados modificados
5. **Resultado:** Commit `f2b50ce` apareceu no GitHub em ~4 segundos

```
commit f2b50ce4872517fb808161348a6b6b70d3721074
Author: Painel Admin <painel@jonatanbandeira.site>
Date:   Mon Jun 8 21:09:31 2026 +0000

    Atualiza conteúdo do site via painel admin

 data.json | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)
```

---

## Comportamento em Diferentes Cenários

### ✅ Sync ativado (GITHUB_TOKEN + GITHUB_REPO configurados)
- Salva dados localmente
- Faz commit automático
- Faz push para GitHub
- **Próximo deploy de código não perde edições do painel**

### ⚠️ Sem GITHUB_TOKEN (não configurado)
- Salva dados localmente
- Loga: "ℹ️ GITHUB_TOKEN/GITHUB_REPO não configurados"
- **Não bloqueia o painel** — sync é opcional

### ⚠️ Erro ao fazer push
- Loga erro (sem expor o token)
- Dados já foram salvos localmente
- Painel continua funcionando

---

## Segurança

- ✅ Token **nunca é logado** (substituído por `***` em logs)
- ✅ Token é **variável de ambiente** (não commitado no código)
- ✅ Git config temporário para user.email/user.name (não persiste)
- ✅ Sync é **opcional** — painel funciona mesmo sem GitHub

---

## Próximos Deploy de Código

Quando você fizer novo deploy de código:

1. **Sem GitHub sync:** Todas as edições do painel são perdidas ❌
2. **Com GitHub sync:** Edições estão no repositório, sync as recupera automaticamente ✅

Workflow recomendado:
```
git pull origin main  # Traz mudanças do painel
[faz edições de código]
git add/commit/push   # Deploy novo código
# Hostinger automaticamente puxa as mudanças (webhook ativado)
# Edições do painel voltam com o código novo ✅
```

---

## Monitoramento

Para verificar se sync está funcionando:

```bash
# No servidor (Hostinger SSH) ou localmente:
git log --oneline | grep "painel"

# Deve mostrar commits como:
# f2b50ce Atualiza conteúdo do site via painel admin
# 0befdd9 Atualiza conteúdo do site via painel admin
```

---

## Arquivos Relevantes

- **app.js:** Função `syncToGitHub()` (lines 72-99), chamada em `POST /api/admin/data` (line 179)
- **.env.example:** Documentação das variáveis (lines 27-35)
- **admin/index.html:** Painel onde usuário clica "Salvar"

---

## Conclusão

✅ Feature completamente implementada e testada
✅ Deploy ativo na Hostinger
✅ Pronto para uso em produção
