# Plano — Migrar o Painel (Python) para Node.js em produção na Hostinger

## Context

Hoje o Tiago tem **dois sistemas separados** e isso gerou confusão (ele achou que a
Fase 4 "não funcionou"):

1. **`/Tiago/painel/` (Python, stdlib + SQLite + PyMuPDF)** — onde TODO o trabalho
   recente foi feito (7 abas: Início, Processos, Tarefas, Anotações, Contatos,
   Documentos, CRM; CRM com 4 fases completas). Só roda no **Mac local**
   (`localhost:8770`). Repo `tavaresmatias/painel-tiago`.
2. **`/Tiago/site-tiagotavares/` (Node/Express)** — site público + um **CRM Node
   antigo** montado em **tiagotavares.adv.br/crm** (kanban básico, sem as 4 fases).
   Roda na **Hostinger** (Web App conectado ao GitHub, deploy automático por push).

A Hostinger do Tiago é **shared hosting só de Node.js** — não roda Python/PyMuPDF.
Decisão do Tiago: **reescrever o painel inteiro em Node.js**, rodando na Hostinger
que ele já paga, de forma **incremental**. Resultado pretendido: acessar o painel
completo de qualquer lugar (celular/escritório), 24h, sem depender do Mac ligado.

## Estratégia geral

**Estender o app Node que já existe** (`site-tiagotavares`), não construir do zero.
Reaproveitar o que já está provado em produção:

- **Auth**: `checkAuth` por sessão (senha `tiago2026`, já igual à do painel Python)
  em `app.js:46,166`. O CRM em `/crm` e o `/admin` já são protegidos por ela.
- **Git-sync** (persistência entre deploys): padrão `syncToGitHub()` em
  `app.js:64` e `crm/db.js:88` — salva JSON → `git commit/push` → Hostinger
  redeploya → dados persistem. Ver [[github_sync_setup]] e [[hostinger_node_deploy]].
- **Storage**: JSON por coleção em `data/` (espelha o `load_coll/save_coll` do
  Python em `server.py:122-130`). O CRM já usa `data/crm.json` + `data/crm-areas.json`.
- **Upload**: `multer` já é dependência (`package.json`), já usado em
  `/api/admin/upload`.
- **Deploy**: `git push` → redeploy automático (preset Express, Node 22.x). Novas
  dependências npm (pdf, e-mail) entram no `package.json` e são instaladas no deploy.

**Onde mora o painel:** módulo privado dentro do `site-tiagotavares`, montado em
**`/painel`** atrás do `checkAuth` (mesmo padrão do `/crm`, que vira o módulo CRM do
painel). Mantém o site público e o painel privado no mesmo Web App, separados pelo
login. Sem novo Web App na Hostinger, sem migração de URL do CRM (preserva os leads
reais que já estão em `data/crm.json`).

**Modelo de áreas:** manter o modelo **relacional** que o CRM Node já usa
(`area_direito_id`/`area_atuacao_id`, `crm/db.js`) — NÃO migrar para o
`area_principal/subarea` (string) do Python. Evita migração arriscada de dados reais.
Tags/filtros/relatório funcionam sobre o modelo existente.

## Roadmap incremental (fases)

Ordem por **valor cedo × risco baixo**. Cada fase termina com push → produção.

### Fase A — CRM completo no Node (sem dependências novas) ← COMEÇAR AQUI
Estende o `/crm` existente. Zero lib externa nova. Espelha as Fases 1B/1C/4 do Python.
- **A1 — Cadastro expandido:** adicionar ~20 campos ao lead (CPF, RG, data_nasc,
  profissão, cargo, endereço completo CEP/UF/cidade/rua/nº/bairro/complemento,
  e-mail/telefone secundário). Modal de lead em abas (Dados/Endereço/Contatos/Notas).
  Validação de CPF + auto-fetch ViaCEP (fetch nativo do Node 22). Schema: novos
  campos no objeto lead de `data/crm.json` (sem migração — JSON é flexível).
  Referência de campos: `crm.py:213-229`.
- **A2 — Documentos por lead:** upload (reusa `multer`) → `data/docs/{leadId}/`,
  metadados no lead. Lista + download + remover. Espelha tabela `documentos`
  (`crm.py:177-183`). Tipos: CPF, RG, Comprovante, Outro.
- **A3 — Tags, filtros e relatório por área:** editor de chips de tags, tags no card
  do kanban, barra de filtros (tag OU + área ==), botão limpar, relatório por área
  (contagem+valor). Porta direta da Fase 4 já feita no Python
  (`painel/static/index.html` funções `tagsEditorHTML`, `renderFiltrosCRM`,
  `passaFiltro`, `renderRelatorioCRM`; backend `relatorio_area` em `crm.py estado()`).

**Arquivos (Fase A):** `crm/db.js` (novos campos/funções), `crm/index.js` (rotas docs),
`crm/public/index.html` (modal em abas, tags, filtros), `app.js` (rota de upload de
doc do lead, se necessário). Git-sync passa a incluir `data/docs`.

### Fase B — Propostas + Assinatura digital (deps novas) — DECISÃO DE PDF pendente
Mais complexa: precisa de **geração de PDF** e **SMTP**. **A abordagem de PDF será
decidida no início desta fase** (PyMuPDF não existe em Node):
- Opção 1: `pdfkit`/`pdf-lib` (JS puro, monta o PDF programaticamente — refazer o
  layout do contrato em código).
- Opção 2: manter proposta como HTML + impressão pelo navegador (como a Fase 2
  original), e gerar só um PDF programático simples para o artefato assinado/hash.
- **B1 — Propostas:** a partir do template `painel/templates/proposta-honorarios.html`,
  link público compartilhável (hash, sem login), botão WhatsApp `wa.me`.
- **B2 — Assinatura digital:** OTP por e-mail (`nodemailer` + SMTP Hostinger), PDF
  congelado + hash SHA-256, manifesto (nome/e-mail/data/IP), status
  rascunho→enviada→assinada. Espelha Fase 3 (`crm.py` + `notificacoes.py`).
  **Depende de configurar SMTP** (pendência já conhecida).

### Fase C — Abas leves do painel (JSON CRUD simples)
- **Tarefas** (com prazo/venc.), **Anotações**, **Início (dashboard agregador)**.
  Espelha as coleções JSON do Python (`server.py` COLLECTIONS). Baixo risco.

### Fase D — Contatos + Documentos gerais
- **Contatos** (JSON CRUD, busca por letra). Documentos gerais (já há `/api/admin/upload`).

### Fase E — Processos + DataJud
- **Processos** (JSON CRUD) + integração **DataJud CNJ** (portar `datajud.py` para
  `fetch` em Node). Integração mais pesada.

### Fase F — Google (Agenda/Contatos) — opcional, por último
- Portar o OAuth + People + Calendar (`google_api.py`) para Node. Pesado; só se o
  Tiago quiser a sincronização com Google em produção.

## Arquivos-chave (visão geral)

- `site-tiagotavares/app.js` — monta `/painel` (e mantém `/crm`), rotas novas, reusa
  `checkAuth` + `syncToGitHub`.
- `site-tiagotavares/crm/` — vira o **módulo CRM do painel**; `db.js` (dados+sync),
  `index.js` (rotas), `public/index.html` (UI). É onde a Fase A acontece.
- `site-tiagotavares/data/` — JSONs por coleção (`crm.json`, `tarefas.json`, etc.)
  + `docs/` para uploads, todos no git-sync.
- `site-tiagotavares/package.json` — adicionar deps por fase (`nodemailer`, lib de
  PDF) só quando a Fase B chegar.
- **Fontes de referência (Python, só leitura):** `painel/crm.py`,
  `painel/static/index.html`, `painel/templates/proposta-honorarios.html`,
  `painel/notificacoes.py`, `painel/datajud.py`, `painel/google_api.py`.

## Verificação (cada fase)

1. **Local:** rodar `node app.js` em `site-tiagotavares` (porta 3001, ver
   `.claude/launch.json`) e testar via navegador/preview MCP — login, CRM, a feature
   nova de ponta a ponta (não só "abre"; exercitar criar/editar/upload/filtrar).
2. **HTTP real:** `curl` nas rotas novas (criar lead com campos novos, listar docs,
   etc.), conferir que `data/crm.json` persiste.
3. **Regressão:** site público (`/`, `/servicos`, `/blog`, `/admin`) e o CRM antigo
   continuam funcionando.
4. **Deploy:** push → confirmar redeploy da Hostinger e a feature no ar em
   tiagotavares.adv.br, com os dados persistindo (git-sync).

## Fora de escopo (por ora)

- Migrar dados do CRM Python (SQLite local) para o Node — os leads reais já vivem no
  `data/crm.json` do Node (produção); o SQLite local era de teste.
- Descontinuar o painel Python — fica como referência até o Node alcançar paridade.
- Decidir a lib de PDF agora — fica para o início da Fase B.
