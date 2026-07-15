# Migrar dados do CRM Node (JSON local) para Postgres/Supabase

## Contexto

O CRM em produção (`tiagotavares.adv.br/crm`, dentro de `site-tiagotavares`) guarda
leads/interações/áreas em `data/crm.json` + `data/crm-areas.json`, sincronizados de
volta pro GitHub a cada escrita. Investigação nos **logs de execução do hPanel**
confirmou que a Hostinger roda **múltiplos processos Node concorrentes** sobre o
mesmo app — vimos rajadas de 3-4 processos subindo em menos de 4 segundos, tanto em
redeploys quanto **organicamente** (09:02 de 01/07, sem deploy nenhum por perto).

A causa técnica: `crm/db.js` faz `readFileSync`/`writeFileSync` do arquivo inteiro,
sem nenhum lock. Com 2+ processos atendendo requisições ao mesmo tempo, é uma race
condition clássica (lost update): dois processos leem o mesmo estado, cada um grava
sua mudança, um sobrescreve o outro. Achamos prova concreta disso: um lead de teste
(`__TESTE_PUSH_REAL__`) que devia ter sido apagado na sessão anterior ainda está no
`data/crm.json` do GitHub — ou a exclusão nunca sincronizou, ou foi vítima da própria
race.

**Decisão do Tiago:** migrar para Postgres (Supabase), que resolve o problema de raiz
(um banco real com transações substitui o "arquivo inteiro reescrito"), independente
de quantos processos Node rodem em paralelo.

**Boa notícia:** já existe uma tentativa anterior (28/06) de implementar exatamente
isso, revertida não por defeito técnico do Postgres, mas porque **nenhum banco real
chegou a ser criado** (nunca configuraram `DATABASE_URL`) — o commit da migração de
volta pra JSON diz literalmente "sem dependência de conexão remota". A tentativa com
SQLite (`better-sqlite3`) é que falhou de verdade, por exigir compilação nativa que a
Hostinger não suporta — isso não se aplica ao `pg` (driver puro JS). Isso significa
que temos código Postgres já escrito e utilizável como base:
- `crm/db.js.bak` (git-ignorado do commit atual, mas presente no disco) — schema
  completo (`crm_areas_direito`, `crm_areas_atuacao`, `crm_leads`, `crm_interacoes`)
  com `ensureSchema()` idempotente, CRUD de leads/interações via `pg.Pool`.
- `crm/areas.js` — módulo de áreas já 100% Postgres, incluindo busca/ordenação por
  uso. Não é usado pelo `db.js` atual (JSON), mas está correto e pronto.
- `app.js:228-255` — rota `/api/crm/seed-areas` já escrita com o SQL certo
  (`INSERT ... ON CONFLICT`) contra as tabelas certas; está **quebrada hoje** porque
  chama `db.q()`, que no `db.js` atual é um stub (`return { rows: [] }`). Volta a
  funcionar sozinha assim que `q()` for uma query Postgres de verdade.

Faltam nesse código antigo os campos adicionados depois (Fase A1: CPF, RG, endereço,
contatos secundários, tags) e a tabela de documentos (Fase A2, hoje embutida no JSON
do lead) — isso entra como extensão do schema recuperado.

**Confirmado nesta sessão:** a produção hoje só tem esse 1 lead de teste (nenhum lead
real) — não há necessidade de migrar dados reais, só recriar a seed de 32
áreas/subáreas jurídicas.

## Passo 0 — Provisionar o banco (Tiago faz, eu não crio contas)

Tiago vai criar um projeto gratuito no Supabase e me passar a **connection string**
(recomendo pegar a de "Transaction pooler", não a direta — mais resiliente a vários
processos Node abrindo conexão ao mesmo tempo, que é exatamente o cenário aqui).
Formato: `postgresql://...pooler.supabase.com:6543/postgres`.

## Implementação

**1. Reescrever `crm/db.js`** partindo de `crm/db.js.bak` + `crm/areas.js`:
- `connString()`/`pool()`/`q()`/`ensureSchema()` como no `.bak`, usando `DATABASE_URL`.
- Estender `ensureSchema()`: adicionar à `crm_leads` as colunas da Fase A1 (`cpf`,
  `rg`, `data_nasc`, `profissao`, `cargo`, `cep`, `estado`, `cidade`, `rua`,
  `numero`, `bairro`, `complemento`, `email_secundario`, `telefone_secundario`,
  `tags JSONB DEFAULT '[]'`) via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` (idempotente,
  mesmo padrão do painel Python). Nova tabela `crm_documentos` (id, lead_id FK,
  tipo, nome_arquivo, nome_original, criado) substituindo o array embutido no JSON.
- `criarLead`/`atualizarLead`: usar a lista `CAMPOS_EDITAVEIS` já expandida do
  `db.js` atual (JSON), não a antiga do `.bak` (que não tinha os campos novos).
- `estado()`: **não filtrar por `arquivado`** — confirmei que o front nunca usou esse
  filtro (mostra todos os leads sempre), manter esse comportamento para não regredir.
  Portar o cálculo de `relatorio_area` (hoje feito em JS sobre o array) igual está,
  só trocando a fonte dos dados de `loadData()` pra uma query.
- `adicionarDocumento`/`listarDocumentos`/`removerDocumento`: viram queries em
  `crm_documentos` (metadado). Os arquivos em si continuam em disco
  (`data/docs/{leadId}/`, via multer, sem mudança em `crm/index.js`).
- Áreas: delegar para `crm/areas.js` (já correto) em vez de reimplementar.
- Remover o `q()` stub e o `configured() { return true; }` fixo — usar o
  `configured()` real do `.bak` (checa se `DATABASE_URL` existe), pra manter o aviso
  amigável em ambiente sem banco configurado.

**2. Atualizar `syncToGitHub`** (mesma função, ajustar a lista de `git add`): tirar
`data/crm.json data/crm-areas.json` (não existem mais), manter só `data/docs` — os
arquivos de documento continuam precisando desse mecanismo pra sobreviver a
redeploys; risco de conflito ali é bem menor (arquivos novos, não um blob reescrito
por completo) e o retry-com-reset-soft que já existe cobre isso.

**3. Limpar código morto:** apagar `crm/db.js.bak`, remover a rota
`/api/crm/seed-areas` de `app.js` (mover pra dentro do módulo CRM ou manter em
app.js mas confirmando que funciona), `data/crm.json`/`data/crm-areas.json` saem de
uso (não precisam ser apagados do disco, só não são mais lidos).

**4. `.env.example`** (criar, não existe ainda): documentar `DATABASE_URL`,
`GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`, `ADMIN_PASSWORD`, `SESSION_SECRET`.

## Verificação

1. **Local:** apontar `.env` local pro Supabase (mesmo projeto ou um de teste — a
   decidir na hora), rodar `node app.js`, chamar `/api/crm/seed-areas` (deve voltar a
   funcionar), depois exercitar CRUD completo via curl: criar lead com todos os
   campos novos, editar, adicionar interação, upload de documento, download, remover
   documento, excluir lead.
2. **Teste de concorrência (o motivo de tudo isso):** disparar 2+ `POST /leads` em
   paralelo (`curl ... & curl ... & wait`) e confirmar que **ambos** os leads
   aparecem no banco depois — esse é o teste que prova que a race foi resolvida.
3. **Deploy:** configurar `DATABASE_URL` nas variáveis de ambiente do hPanel, dar
   push, acompanhar os logs de execução (sem erros de conexão), rodar o
   `seed-areas` uma vez em produção, criar um lead real de teste pela UI e conferir
   que ele aparece no dashboard do Supabase.

## Fora de escopo (mencionar ao Tiago, não fazer agora)

- Os arquivos de documento enviados continuam em disco local + git-sync — se a
  hipótese de "filesystem separado por instância" (não totalmente confirmada) for
  real, uploads ainda podem se perder num redeploy. Resolver de vez exigiria mover
  pra um object storage (Supabase Storage) — proposta de próximo passo, não incluída
  aqui.
- Não migra o lead de teste `__TESTE_PUSH_REAL__` (fica pra trás, banco novo começa
  limpo só com as áreas semeadas).
