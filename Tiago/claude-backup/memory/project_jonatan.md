---
name: project-jonatan
description: "Quando o usuário mencionar \"Jonathan\", o projeto referenciado é o site localizado em /Users/tiagotavares/Documents/github/Jonatan Bandeira/site-jonatan/, conectado ao repositório git@github.com:tavaresmatias/jonatanbandeira.git"
metadata: 
  node_type: memory
  type: project
  originSessionId: 078e1b21-4c52-4a6e-9fd7-bf90ba877b53
---

Quando o usuário mencionar "Jonathan", o projeto é:
- **Pasta local:** `/Users/tiagotavares/Documents/github/Jonatan Bandeira/site-jonatan/`
- **Repositório GitHub:** `git@github.com:tavaresmatias/jonatanbandeira.git`
- **URL site:** https://jonatan.tiagotavares.online

## ✅ Status Atual

### Fase 1: Admin Login (CONCLUÍDO)
- Senha alterada para `jonatan123` na Hostinger
- Fallback no app.js removido

### Fase 2: Detail Pages (CONCLUÍDO)
- 3 páginas de detalhe para serviços (Avaliação, Terapia, Workshops)
- Campos editáveis no painel: detailImage, detailContent, whatsappText
- URLs: `/servico/1`, `/servico/2`, `/servico/3`

### Fase 4: Blog com Imagens e Agendamento (✅ IMPLEMENTADO 2026-06-08)
**Commit:** `f95368b` — "Blog: adiciona imagens, data/hora de publicação e agendamento"

**O que foi adicionado:**
- ✅ **Imagens nos posts**: campo `image` mostra em destaque no blog e detalhe
- ✅ **Data e hora de publicação**: campo `publishedAt` em ISO format (ex: "2026-06-05T09:00:00Z")
- ✅ **Status do post**: "published", "scheduled", "draft"
- ✅ **Agendamento**: campo `scheduledFor` - programar quando post fica online

**Painel Admin:**
- Campos: Data, Hora, Status (dropdown), "Agendar para" (aparece se status=scheduled)
- Upload de imagem funciona normalmente
- Mostra status e data agendada na lista de posts

**API (`/api/blog`, `/api/blog/post/:slug`):**
- Filtra: apenas posts com status="published" E `publishedAt` <= data atual
- Ordena por data decrescente (mais recentes primeiro)
- Posts agendados/rascunho ficam invisíveis até o horário

**Frontend:**
- blog.html: Mostra imagem + data formatada (ex: "5 de junho de 2026")
- blog-detalhe.html: Mostra data/hora (ex: "5 de junho de 2026 às 09:00")

### Fase 3: GitHub Sync (✅ IMPLEMENTADO E TESTADO)
**Código:** commit `b70c48e` — "Sincroniza edições do painel de volta ao GitHub"

**Como funciona:**
- Quando admin salva dados via painel → dispara `syncToGitHub()` em background (async)
- Git commita `data.json` + imagens automaticamente
- Push para GitHub no branch `main`
- Mensagem: "Atualiza conteúdo do site via painel admin"
- Autor do commit: "Painel Admin <painel@jonatanbandeira.site>"

**Variáveis de ambiente Hostinger (✅ Configuradas 2026-06-08):**
```
GITHUB_TOKEN=<user-created-fine-grained-token>
GITHUB_REPO=tavaresmatias/jonatanbandeira
GITHUB_BRANCH=main
```

**Teste realizado:**
- Salvei dados com campo `test_sync_at` via API
- Commit `f2b50ce` apareceu no GitHub em ~4 segundos
- ✅ **Sync funcionando perfeitamente**

### Deploy (✅ ATIVO)
- **Implantação automática:** Ativada no Hostinger via webhook GitHub
- **Status:** Deployment `f2b50ce` marcado como "Atual" e "Concluído"
- **Timestamp:** 2026-06-08 18:09:36

## Próximos passos para usuário
1. Acessar painel: https://jonatan.tiagotavares.online/admin
2. Editar conteúdo (serviços, blog, eventos, etc.)
3. Clicar "Salvar" → **automaticamente sincroniza para GitHub**
4. Fazer deploy de código novo → **edições do painel não serão perdidas**
