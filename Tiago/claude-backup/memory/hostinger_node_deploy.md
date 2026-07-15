---
name: hostinger_node_deploy
description: "Como os sites Node.js (Jonatan, e futuramente Romalha) rodam na Hostinger — via Web App conectado ao GitHub, NÃO via SSH/PM2"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 32ebabf4-6a4f-4ad9-aa02-4195732a36af
---

Os sites Node/Express do Tiago na Hostinger rodam como **Web App conectado ao GitHub** (hPanel → site → "Configurações e reimplantação" / Implantações), com **deploy automático a cada push** na branch. NÃO usar SSH+PM2 nem GitHub Actions — isso falha (shared hosting mata o PM2; o domínio é servido pela CDN da Hostinger). Tentativas com PM2/Actions no [[project_romalha]] falharam todas.

Config exata do Jonatan (jonatan.tiagotavares.online), para replicar:
- Preset (Configuração predefinida): **Express**
- Branch: **main** | Versão do Node: **22.x** | Diretório raiz: **./**
- Gerenciador de pacotes: **npm** | Arquivo de entrada: **app.js**
- Variáveis de ambiente: `GITHUB_TOKEN` (PAT), `GITHUB_BRANCH=main`, `GITHUB_REPO=tavaresmatias/jonatanbandeira`

O loop "salvar de volta" ([[github_sync_setup]]): o admin salva → app.js (syncToGitHub) commita data.json+img de volta ao GitHub via GITHUB_TOKEN → push dispara redeploy automático da Hostinger → conteúdo persiste entre deploys. Por isso as env vars GITHUB_* são essenciais.

Para um site novo (ex: Romalha): no hPanel a hospedagem precisa ser do tipo Web App conectado ao repo (ex: tavaresmatias/site-romalha) com a MESMA config acima. Site estático comum não roda /api nem admin.
