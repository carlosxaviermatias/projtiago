---
name: crm-dois-sistemas
description: ATENÇÃO - existem DOIS CRMs separados do Tiago (painel Python vs Node.js em produção); Fase 4 só está no Python local
metadata: 
  node_type: memory
  type: project
  originSessionId: 6bb0fcdd-94f6-4516-81a2-25c22bb37581
  modified: 2026-08-26T20:38:50.613Z
---

## 💰 Fase G — Financeiro: ✅ DEPLOYADA (confirmado em 2026-08-26)

Nova aba **Financeiro** no CRM Node (`Tiago/site-tiagotavares/crm/`). Arquivos:
`financeiro.js` (novo), rotas `/api/crm/fin/*` em `index.js`, tabelas em `db.js`
(`crm_fin_categorias` + `crm_fin_lancamentos`), UI em `public/index.html`,
card no Início via `painel.js`.

**Decisões de modelagem que valem lembrar:**
- UM livro-caixa só (`tipo` = receita|despesa), não duas tabelas.
- Data tripla: `competencia` / `vencimento` / `pagamento`. `pagamento IS NULL` = em aberto.
  É isso que separa regime de caixa (o que bateu na conta) de previsto.
- **Repasse de parceria é automático**: receita com `parceiro` + `parceria_perc` gera
  sozinha a despesa vinculada por `origem_id` (ON DELETE CASCADE). Com parcelas, gera
  um repasse POR PARCELA. Repasse já pago nunca é reescrito por edição na receita.
- Categoria com `grupo='Fixo'` alimenta o **ponto de equilíbrio** (média dos 3 meses
  ANTERIORES — o mês corrente está incompleto e puxaria a média pra baixo).
- Exclusão de categoria é lógica (`ativo=0`), pro histórico não perder o rótulo.
- Despesa `reembolsavel=1` → botão "Recebi" cria a receita de reembolso e limpa a flag.
- **Comprovantes** (recibo/boleto/print do PIX) em `crm_fin_comprovantes`, arquivos em
  `data/docs/financeiro/{lancamento_id}/`. Só PDF e imagem, 15 MB. ⚠️ Aqui o
  `db.syncDocs` é chamado TAMBÉM na remoção — nos módulos de lead/processo não é, e por
  isso lá o arquivo apagado volta no redeploy (pendência antiga registrada acima).

**Migração**: nenhuma manual. `ensureSchema()` cria as tabelas e o seed de 28
categorias roda na primeira chamada de `/fin/*` em produção.

**Testado de ponta a ponta** com Postgres real (embedded-postgres na porta 55432 +
SSL self-signed, porque `db.js` força `ssl:{rejectUnauthorized:false}`) e HTTP real
contra `node app.js` na 3999: 60+ asserções, todas verdes, mais verificação visual no
navegador (painel, lançamentos, modal, mobile). Sem erro de console.

✅ **Publicado.** Commit `547ff00` no `site-tiagotavares`, já em `origin/main` (Hostinger
faz deploy automático). A correção de segurança do `express.static(__dirname)` também
está no ar (ver `app.js:112`). Ver [[feedback_deploy_commands]] e [[seguranca_site_tiagotavares]].

---

## ✅ Deployado (2026-07-06): pré-visualização de docs, anti-duplicata, limpeza de órfão

Continuação da sessão (Tiago confirmou: login com senha nova OK, descrição de docs OK).
- **Pré-visualização de documentos** (commit `976c73d`): clicar no nome do doc abre a
  prévia INLINE em nova aba (visualizador nativo do navegador) via rotas novas `/view`
  (`Content-Disposition: inline` + `res.sendFile`, Content-Type pela extensão); botão
  "⬇ Baixar" separado usa as rotas `/download` (que continuam `res.download`=attachment).
  Aplicado a docs do processo, docs do cliente no processo e docs na ficha do lead.
  Testado com PDF real: view→inline/application-pdf, download→attachment.
- **Anti-upload-duplicado** (commit `05cff29`): o clique-duplo no "Enviar" disparava 2
  POSTs (causa das duplicatas). Agora o botão desativa ("Enviando…") + flag
  `_enviandoDocProc`/`_enviandoDocLead` bloqueia envio concorrente. Prevenção só; sem
  dedup no servidor (multi-instância + risco de falso-positivo com mesmo nome legítimo).
- **Limpeza**: varredura pela sessão logada do Tiago (browser MCP, `fetch` same-origin)
  nos 5 processos → 0 duplicatas no BANCO (ele já tinha apagado as dupes pela UI). Só
  sobrava 1 PDF órfão em `data/docs/processos/3/` (registro já apagado) — removido do Git
  (commit `c2e5eef`), preservando os 2 docs válidos (ids 4 e 5, referenciados no banco).

⚠️ **PENDÊNCIA registrada (pedida pelo Tiago)**: a rota de EXCLUIR documento (tanto de
lead quanto de processo, em `crm/index.js`) apaga o registro no Postgres e faz
`fs.unlink` do arquivo, mas NÃO chama `db.syncDocs` — então a remoção não é commitada
de volta ao Git. Num redeploy o arquivo apagado pode "voltar" ao disco (invisível no
CRM, pois o registro do banco sumiu, mas ocupa espaço/vira órfão). Corrigir: chamar
`syncDocs('CRM: remove documento ...')` após o unlink nas rotas de delete de doc.
(O upload já sincroniza; só o delete que não.)

## ✅ Deployado (2026-07-06, commits `9ff881b`+`f4c1d00`): segurança + descrição de docs + ordenação

**Auditoria de segurança do CRM** (pedida pelo Tiago pra "ninguém invadir"). O que
estava OK e foi confirmado: SQL parametrizado (nomes de coluna vêm de whitelists
fixas, nunca de chaves do usuário — sem injeção), autorização das rotas (tudo sob
`checkAuth`; públicas só a proposta por link secreto de 96 bits e o callback Google
validado por state), OTP com hash+expiração+limite de 5 tentativas, sem path
traversal (nomes de arquivo saneados no banco + IDs inteiros), XSS escapado na
proposta pública. Bloqueadores ADICIONADOS e testados ponta a ponta (`app.js`):
- **Anti-força-bruta no login**: 8 falhas por IP → bloqueio de 15 min (429); durante
  o bloqueio nem a senha certa passa; +400ms de atraso por falha. Em memória, POR
  INSTÂNCIA (Hostinger roda várias) — reduz muito mas não é perfeito; a defesa
  principal continua sendo senha forte.
- Cookie de sessão: `HttpOnly` + `SameSite=Lax` (anti-CSRF). `secure` fica atrás de
  env `COOKIE_SECURE=1` (default 0) pra NÃO arriscar travar o login; ⚠️ pendente o
  Tiago ligar depois de confirmar HTTPS ok.
- Regeneração de sessão no login (anti-fixação), `trust proxy` (req.ip real), headers
  X-Frame-Options/nosniff/Referrer-Policy, avisos no boot se senha/secret no padrão,
  sanitização da msg do git commit no sync (defesa em profundidade).
- **BOA NOTÍCIA verificada no hPanel**: `ADMIN_PASSWORD` JÁ não é mais o padrão
  `tiago2026` (o Tiago já tinha trocado por uma senha própria), e `SESSION_SECRET`
  também já está setado. Então o ponto crítico já estava coberto.

**Descrição nos documentos do processo**: coluna `descricao` em
`crm_processo_documentos` (ALTER idempotente — tabela já existia em prod), campo no
upload + edição depois (link "editar"/"+ adicionar descrição", inclusive nos já
enviados). Texto NÃO passa pelo onclick (lê de `_docsProcCache`) pra evitar XSS.

**Ordenação da lista de processos**: `ORDER BY atualizado_fonte DESC NULLS LAST,
ultima_consulta DESC NULLS LAST, id DESC` — movimentação mais recente do tribunal no
topo. Antes era `p.atualizado` (mudava a cada edição e era achatado pela rotina de
2h). Interpretei "atualizou" como "teve movimentação nova"; se o Tiago quiser por
"última vez que cliquei Atualizar", trocar pra priorizar `ultima_consulta`.

⚠️ **NADA disto foi verificado no navegador/produção** (sessão sem acesso ao Postgres
real nem clique no site): validado só por `node --check` + testes de lógica com o
`db.q` mockado. Confirmar em prod: login ainda entra (mexi em cookie/sessão!), upload+
descrição de doc, ordenação. Rebase feito por cima do auto-sync `86558ab` (upload de
doc do Tiago em prod) sem perda.

Detalhe operacional: durante a navegação no hPanel apareceu "Alterações não salvas: 1"
nas Variáveis de ambiente — eu NÃO apliquei; o Tiago deve clicar "Descartar".

## ✅ Deployado (2026-07-05, commit `dbe6044`): fallback ao eproc (TRF2/JFRJ) quando o DataJud não indexa

O Tiago pediu "instalar a API do TJ juizado especial federal eproc". Não existe
API pública oficial do eproc (o web service MNI/CNJ é restrito a órgãos do
Judiciário) — pesquisei e confirmei isso antes de implementar qualquer coisa.

**Descoberta com processo real do Tiago** (`5001508-74.2026.4.02.5113`,
"Auxílio Reclusão - Rafaela", TRF2/JFRJ — Três Rios): o **DataJud realmente
não tem esse processo indexado** (testei direto na API pública do CNJ, 0
resultados) — é uma lacuna real de cobertura, não bug. Já o outro processo que
ele mencionou (`0030026-07.2026.8.27.2729`, TJTO) já funcionava normalmente
(roda em Projudi, não eproc).

**A solução:** a "Consulta Pública" do eproc do TRF2/JFRJ
(`eproc-consulta.jfrj.jus.br`) é servida como HTML estático simples pra
processos não sigilosos — sem precisar de JS nem chave de acesso (confirmei:
a URL funciona igual com ou sem o parâmetro `hash`). Dá pra extrair com fetch
puro, sem navegador headless (que não rodaria na Hostinger de qualquer jeito).

- **`crm/eproc.js`** (novo): extrai classe, órgão julgador, autuação e todas as
  movimentações via regex sobre o HTML — decodificado como **ISO-8859-1**
  (não UTF-8, é como o eproc serve a página; usei `TextDecoder` nativo do
  Node, sem dependência nova). Testado ao vivo contra o processo real: 26/26
  movimentações extraídas corretamente, com acentuação certa.
- **`crm/processos.js`**: `consultar()` tenta o DataJud primeiro (sempre); só
  cai no eproc quando o DataJud não encontra nada E o processo é do TRF2
  (reaproveita `datajud.aliasDoNumero`). Testado (mock do banco + chamadas
  reais ao DataJud/eproc): fallback ativa certo quando precisa, e NÃO
  interfere em processos que o DataJud já resolve (ex.: o caso do TJTO).
- Transparente pro usuário: o botão "Atualizar (DataJud)" que já existe passa
  a ter o fallback automaticamente. Sem mudança de schema, sem rota nova, sem
  mudança no frontend.
- **Cobertura: só TRF2/JFRJ por enquanto** (o caso confirmado). Outros
  tribunais com eproc (TRF4, TJs com JEF por competência delegada — cada um
  tem domínio próprio, ex. `eproc.tjto.jus.br`) podem ser adicionados depois,
  SE o Tiago trouxer um número de processo real que falhe lá — não vale a
  pena adivinhar URLs sem confirmar.
- ⚠️ É "screen scraping" de site de governo — pode quebrar se a Justiça
  Federal mudar o layout do eproc. `eproc.js` nunca lança em falha (sempre
  cai de volta pro erro do DataJud), então não devia derrubar nada, mas
  **ainda não testei clicando "Atualizar" no processo real em produção** —
  só validei via chamadas diretas fora do CRM (curl + node standalone).

## ✅ Deployado, ⚠️ NÃO verificado em produção (2026-07-05): vínculo a Contatos, cliente inline, docs no processo, mensagem mais natural

Sessão sem Node/DATABASE_URL disponível pra testar de verdade — validação foi
só sintaxe (`node --check` em todos os arquivos) + lógica do SQL mockada (fingi
o `db.q` pra capturar o texto da query sem tocar no Postgres real). Isso pegou
e corrigiu 2 bugs reais antes do deploy:
1. `atualizarProcesso` gerava `SET contato_id = $2, contato_id = $3` (a mesma
   coluna duas vezes) sempre que o front mandava lead_id+contato_id juntos —
   o Postgres rejeitaria essa query. Corrigido calculando as duas colunas juntas.
2. A coluna nova `contato_id` estava dentro do `CREATE TABLE IF NOT EXISTS
   crm_processos(...)` — como essa tabela JÁ EXISTE em produção com dados
   reais, isso é um no-op e a coluna nunca seria criada lá. Trocado pro padrão
   já usado no arquivo (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`).

Commits `feed584` (vínculo+docs) e `0538eb1` (mensagem) enviados a
`origin/main`. **Precisa confirmar em produção** (Postgres real + navegador):
vincular processo a um Contato, cadastrar cliente novo direto no processo,
subir um documento no processo, gerar mensagem e ver a saída — nenhum desses
caminhos rodou contra o banco de verdade nesta sessão.

Mudanças:
- `crm_processos.contato_id` (Contatos como alternativa a lead_id — vínculo
  mutuamente exclusivo, um limpa o outro) + seletor combinado Funil/Contatos/
  "cadastrar novo cliente" no detalhe do processo.
- `crm_processo_documentos` (nova tabela): upload de documento direto no
  processo, independente do cliente vinculado.
- `crm/glossario.js`: campo `semAcaoNecessaria` marca movimentações de rotina
  (despacho, juntada, certidão...) vs. as que podem exigir ação do cliente
  (citação, audiência, intimação, recurso) — a mensagem só promete "nenhuma
  providência necessária" nas rotineiras.
- `crm/ia.js`: mensagem (template E prompt da IA) reescrita no formato que o
  Tiago pediu — negrito real do WhatsApp (`*texto*`), rótulo "Movimentação:",
  definições de termos tecidas dentro da frase de explicação (via substituição
  de texto — funciona mesmo sem `ANTHROPIC_API_KEY` configurada).

## ✅ Verificado e deployado (2026-07-05): CRM interligado (estilo Astrea) + mensagem IA p/ cliente

Trabalho feito numa sessão paralela (sem Node disponível lá pra testar) em cima
do CRM Node em `site-tiagotavares/crm`. Plano faseado em
`~/.claude/plans/cozy-snuggling-harp.md` (Fase 1 vínculo processo↔cliente + tela
de detalhe página-inteira; Fase 2 agenda↔processo; Fase 3 docs/atendimentos no
processo; Fase 4 campos manuais réu/valores — só a Fase 1 foi feita até agora).

**Esta sessão (que tem Node) testou tudo e deployou** (commit `ee0df8f` +
`1ed7359` doc): `GET /api/crm/leads` (seletor de cliente), card de processo
clicável → tela de detalhe (Dados + Cliente vinculado + Históricos DataJud +
Documentos/Atendimentos/Honorários agregados do cliente), aba "Processos" no
lead (vínculo reverso). Testado local E em produção: criar processo vinculado,
trocar vínculo via PUT, tela de detalhe renderizando os 3 painéis (confirmado
visualmente no navegador com screenshot).

**Mensagem de WhatsApp p/ cliente via IA (`crm/ia.js`):** botão no detalhe do
processo gera texto pronto explicando a última movimentação. Usa a **Claude
Messages API via fetch nativo** (sem SDK novo, não arrisca o `npm install` do
deploy). Rota `POST /api/crm/processos/:id/mensagem-cliente`. Testado local e em
produção: cai no **fallback template** corretamente (texto formatado, nome do
cliente, número do processo, data e movimento reais do DataJud) — confirma que
o botão nunca fica quebrado mesmo sem a chave.
⚠️ **PENDENTE: configurar `ANTHROPIC_API_KEY` no hPanel** — sem ela funciona,
mas só com o template, não com texto gerado de verdade. Modelo padrão
`claude-opus-4-8` (sobrescrevível por `ANTHROPIC_MODEL`).

**Nota de higiene:** durante a verificação, limpei da produção um lead+processo
de teste (`__VIS_FINAL__`) que essa própria sessão tinha criado e esquecido de
apagar — confirmei antes que os outros 5 processos que já estavam lá (Raissa,
Gabriel, Fabiano, Gilmara, Rafaela) são dados REAIS do Tiago e não toquei neles.

**`STATUS.md`** no repo (`site-tiagotavares/STATUS.md`) foi reescrito com o
histórico completo do projeto (site + CRM A-F + esta interligação) — é o
arquivo que o Tiago abre pra retomar sem depender da memória do Claude.

## ✅ Fase F (2026-07-04): Integração Google — Agenda + Contatos (commit `c182fec`) — ROADMAP COMPLETO 🎉

Última fase. Conecta o Google via OAuth e destrava: **Calendar** (botão "📅
Agendar" no lead cria reunião no Google Agenda, opção de convidar por e-mail,
registra no histórico) e **People** (sincroniza a agenda de Contatos ⇄ grupo
"CRM" do Google, bidirecional, match por telefone). Deployado e **verificado em
produção** (status conectado, sync importou 2 contatos reais, agendar criou
evento real).

- **`crm/google.js`**: porte do `google_api.py`. Diferença de arquitetura:
  client_id/secret em **env** (`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` no
  hPanel), e `refresh_token`/email/grupo no **Postgres** (tabela `crm_config`
  chave-valor) em vez de arquivo local. State anti-CSRF do OAuth na **sessão**
  (compartilhada no Postgres → instância que atende o callback reconhece).
- Rotas: `/google/{status,connect,desconectar,sync-contatos}` + `/google/callback`
  (público, validado pelo state) + `/leads/:id/agendar`. Colunas
  `google_resource/etag` na crm_contatos.
- **Setup feito:** reusa o MESMO OAuth client do painel Python (app "CRM Tiago",
  projeto `careful-cosine-413700`, "Cliente Web 1"). Adicionado o redirect de
  produção `https://tiagotavares.adv.br/api/crm/google/callback` no Google Cloud
  (além do localhost:8770 que já tinha). `GOOGLE_CLIENT_ID/SECRET` no hPanel.
- **Atalho esperto:** o `refresh_token` que já existia (de tyagotavares@gmail.com,
  do painel Python) foi semeado no `crm_config` do Postgres — refresh tokens não
  dependem do redirect, então o Google já ficou **conectado em produção sem o
  Tiago reautorizar**. O botão "Conectar" existe pra reautorizar/trocar de conta.

**ROADMAP A→F COMPLETO.** O CRM Node tem: Postgres · funil (cadastro/docs/tags) ·
propostas+assinatura (PDF+e-mail) · painel (Início/Tarefas/Anotações) · Contatos ·
Processos+DataJud · Google (Agenda+Contatos) · sessão persistente · senha via env.
Melhorias externas (linter/Tiago) adicionadas depois na Fase E: retry 429 no
datajud + "atualizar todos os processos" + rotina periódica (claimAutoRun).

## ✅ Fase D (2026-07-04): Agenda de Contatos (commit `29a21c0`)

Seção "Contatos" no painel: agenda geral **separada dos leads do funil** (para
clientes, advogados, cartórios, peritos, fornecedores). Deployada e verificada
em produção. Tabela `crm_contatos` (nome, apelido, telefone, email, documento
CPF/CNPJ, categoria, observações); CRUD em `crm/painel.js`, rotas
`/api/crm/contatos`. Front: busca (nome/apelido/email/doc, insensível a acento),
filtro por letra A-Z (só habilita letras com contato), lista agrupada por inicial
com avatar/categoria/ações (WhatsApp/email/editar/excluir), modal com categorias
sugeridas. Card "Acervo" do dashboard conta contatos. Sem deps novas.
Nota: os "documentos gerais" que o plano juntava na Fase D ficaram de fora (os
leads já têm documentos próprios) — dá pra fazer depois se o Tiago quiser.
**Roadmap: falta só a Fase F (Google Agenda/Contatos), opcional e pesada.**

## ✅ Fase E (2026-07-04): Processos + DataJud/CNJ (commit `fc7427a`)

Seção "Processos" no painel: cadastra processos judiciais e busca as
movimentações direto na **API Pública do DataJud (CNJ)** — mesma fonte dos
tribunais, sem Astrea. Deployado e **verificado em produção com consulta real**
(processo TJRJ de Três Rios → 8 movimentos, classe, órgão, ajuizamento).

- **`crm/datajud.js`**: porte do `datajud.py`. Chave PÚBLICA do CNJ (não é
  segredo, sobrescrevível por `DATAJUD_APIKEY`), fetch nativo. Mapeia
  segmento+tribunal do número CNJ → índice (`api_publica_tj**`). Failure-safe:
  trata 429 (rate-limit), timeout (60s — a API é LENTA, 10-60s), inválido,
  não-suportado, não-indexado.
- **`crm/processos.js`**: CRUD + `consultar(id)` que chama o DataJud e grava
  (movimentos JSONB, ultima_consulta, erro_consulta). Vínculo opcional a lead.
- Tabela `crm_processos`, rotas `/api/crm/processos` + `/consultar`. Front:
  seção Processos (adicionar por número, botão Atualizar com loading, card com
  tribunal/classe/órgão/último movimento, modal timeline). Card "Acervo" no dash.
- ⚠️ **DataJud tem rate-limit por IP e é LENTO** (uma consulta levou 61s em prod,
  passou pelo proxy da Hostinger OK). Se atualizar muitas vezes seguidas, dá 429
  (tratado com mensagem clara). Processo recém-distribuído pode não estar
  indexado ainda (semanas de atraso do CNJ). Nada disso é bug — é a natureza da API.

## ✅ Fase C (2026-07-04): Painel com Início/Tarefas/Anotações (commit `46d61f3`)

A página `/crm` virou um **painel com navegação por seções** (Início · Funil ·
Tarefas · Anotações) no header; o funil foi encapsulado numa seção, intacto.
Deployado e verificado em produção.
- **Início**: dashboard que agrega funil + propostas (por status) + tarefas
  (pendentes/atrasadas + próximas com prazo) + contagem de anotações; cards
  clicáveis navegam.
- **Tarefas**: CRUD com prazo opcional (`crm_tarefas`), checkbox concluir,
  vínculo opcional a lead (`lead_id` FK ON DELETE SET NULL), ordenação
  pendentes-por-prazo / concluídas no fim, badge de atraso vermelho.
- **Anotações**: CRUD título+texto (`crm_anotacoes`), cards, criar/editar via modal.
- Código: `crm/painel.js` (tarefas/anotações/dashboard), tabelas no `ensureSchema`,
  rotas `/api/crm/{dashboard,tarefas,anotacoes}` no `index.js`. Sem deps novas.
- 🐛 Corrigido off-by-one de fuso na exibição de prazo: `new Date('YYYY-MM-DD')`
  recuava 1 dia em BR; criado `fmtPrazo()` que formata a data pura sem `Date`.

## ✅ Fase B (2026-07-04): Propostas + Assinatura digital no CRM Node

Portada do painel Python pro CRM Node (`site-tiagotavares`), commit `32cd89b`,
**deployada e verificada em produção**. Fluxo completo: criar proposta
(rascunho, objeto+honorários livres) → "Enviar para assinatura" (congela um
`snapshot` JSONB do cliente + hash SHA-256, gera PDF, status `enviada`) → link
público sem login → cliente pede OTP por e-mail → confirma com código + aceite →
`assinada` com manifesto legal (MP 2.200-2/2001 art.10 §2º + Lei 14.063/2020).

- **PDF via `pdfkit`** (JS puro — a Hostinger é shared hosting, não roda
  PyMuPDF/Chromium/Puppeteer). Layout do contrato remontado em código; confirmado
  gerando PDF válido de ~118KB EM PRODUÇÃO. Template+logo em `crm/templates/`.
- **`crm/propostas.js`** (CRUD, render HTML+PDF, fluxo OTP), **`crm/email.js`**
  (nodemailer, failure-safe, lê `SMTP_*`), tabela `crm_propostas` no `ensureSchema`.
- Rotas PÚBLICAS (sem login) montadas ANTES do `app.use('/api/crm', checkAuth)`.
- Aba "Propostas" na modal do lead. O documento é imutável após envio (usa o
  snapshot, não o lead ao vivo) — editar o lead depois não altera proposta enviada.
- Testado ponta a ponta local E prod: criar→enviar→página pública→OTP→código
  errado/certo→5 tentativas (lockout 429)→lead sem e-mail bloqueado→PDF assinado.

✅ **SMTP configurado e testado com e-mail REAL (2026-07-04):** as env vars
`SMTP_HOST=smtp.hostinger.com`, `SMTP_PORT=465`, `SMTP_USER=SMTP_FROM=
contato@tiagotavares.adv.br`, `SMTP_PASS` foram adicionadas no hPanel. Teste de
ponta a ponta em produção: proposta criada → OTP pedido → **e-mail chegou de
verdade** na caixa contato@ (lido no webmail, código 406036) → assinatura
confirmada → status `assinada`. Fluxo 100% funcional. (Obs: o rodapé do contrato
mostra `contato@tiagotavares.com.br`, mas a caixa que ENVIA é `@tiagotavares.adv.br`.)

✅ **Endurecimento (2026-07-04, commit `3d78548`):** dois ajustes de produção,
deployados e verificados:
- **Sessão persistente no Postgres** (`connect-pg-simple`, tabela `user_sessions`
  no Supabase, cookie 30 dias). Resolve o login que caía a cada redeploy (antes
  cada instância Node tinha seu MemoryStore). Testado: sessão sobrevive a
  restart do processo; em prod grava a sessão no banco e não dá erro nos logs.
- **`ADMIN_PASSWORD` agora vem de `process.env`** (fallback `tiago2026` só dev),
  não mais chumbado no `app.js`. A env do hPanel foi ajustada de `MNzfm6PsAOxK`
  pra `tiago2026` ANTES do deploy pra o login não mudar. (O repo é **privado** —
  a senha nunca esteve exposta publicamente; era só higiene.) Login segue
  `tiago2026`; agora dá pra trocar só mexendo na env var. Verificado em prod:
  `tiago2026`→200, `MNzfm6PsAOxK`→401.

---

## ✅ RESOLVIDO (2026-07-03): CRM Node migrado pra Postgres/Supabase

O problema de **múltiplas instâncias perdendo leads** (parágrafo grande mais
abaixo) foi **resolvido na raiz**: o CRM Node (`site-tiagotavares/crm`) deixou de
usar `data/crm.json` (reescrito por completo sem lock → race "lost update" entre as
várias instâncias Node da Hostinger) e passou a usar **Postgres no Supabase**.
Commits `2f588e4` (migração) + `e4f171b` (fix do seletor de área) em
`tavaresmatias/site-tiagotavares`, **deployados e verificados em produção**.

- **Banco:** projeto Supabase **`crm-tiago`** (org `tavaresmatias`, região us-east-2,
  free/nano). Conexão via **Transaction pooler** (porta 6543). A connection string
  fica **só** na env var `DATABASE_URL` do hPanel (Variáveis de ambiente) — NÃO está
  no código nem em memória. A senha do banco foi resetada nesta sessão (valor só no
  hPanel/Supabase). Havia código Postgres de uma tentativa antiga (jun/28) revertida
  porque nunca criaram o banco de verdade — reaproveitado como base.
- **`crm/db.js`** reescrito sobre `pg.Pool`; schema idempotente (`ensureSchema`) com
  colunas do cadastro expandido (Fase A1) via `ALTER ... ADD COLUMN IF NOT EXISTS` +
  tabela `crm_documentos`. Áreas jurídicas **auto-semeadas** no 1º boot de banco
  vazio (`seedAreasSeVazio`) — a rota não-autenticada `/api/crm/seed-areas` foi
  REMOVIDA. `crm/areas.js` virou pool singleton (antes vazava conexão por query).
- **Documentos:** metadados no Postgres; o ARQUIVO continua em disco
  (`data/docs/{leadId}/`) e é commitado de volta ao GitHub via `syncDocs()` pra
  sobreviver a redeploy. ⚠️ Pendência conhecida (fora de escopo): se a hipótese de
  "filesystem separado por instância" for real, uploads ainda podem se perder num
  redeploy — solução definitiva seria Supabase Storage.
- **Verificado:** teste de concorrência local (12 POST /leads paralelos → 12/12
  persistidos) e em produção (lead criado, visível em 5 leituras seguidas sem
  "sumir/reaparecer", depois apagado). Produção limpa (0 leads reais, áreas semeadas).
- **`data/crm.json` e `data/crm-areas.json` removidos do repo** (dados mortos). O
  lead fantasma `__TESTE_PUSH_REAL__` que vivia nesse JSON foi embora junto.
- Removido `crm/db.js.bak`; criado `.env.example`. Node local do Mac fica em
  `/Users/tiagotavares/.local/node/bin/node` (não está no PATH do Bash tool).

**🔜 Próximo passo:** retomar o roadmap de fases (Fase B — propostas + assinatura
digital em Node, decidir lib de PDF; ver `~/.claude/plans/`), agora que a base de
dados é confiável. SMTP de produção pra OTP continua pendente.

---
### (histórico abaixo — o alarme de múltiplas instâncias já está resolvido acima)

⚠️ **Descoberta crítica (2026-06-30):** o Tiago tem **DOIS sistemas CRM separados**,
e isso causou confusão (ele achou que a Fase 4 "não funcionou"):

1. **`/Tiago/painel/` (Python, stdlib + SQLite)** — onde TODAS as fases 1A→4 foram
   implementadas. Roda em `localhost:8770`. Repo `tavaresmatias/painel-tiago`.
   Deploy alvo era TrueNAS. É o sistema "bom", completo.

2. **`/Tiago/site-tiagotavares/crm/` (Node.js/Express + JSON)** — versão ANTIGA,
   SEM as fases 1A→4. É o que está PÚBLICO em **tiagotavares.adv.br/crm/**
   (Hostinger, `X-Powered-By: Express`). Arquitetura totalmente diferente (areas
   via `/api/crm/areas-direito`, sem tags/filtros/relatório).

O Tiago acessava `tiagotavares.adv.br/crm/` (Node.js antigo) e por isso não via a
Fase 4 — que estava só no painel Python local. **Decisão de produção pendente:**
qual sistema é o definitivo? Recomendação dada: usar o painel Python (mais completo,
4 fases). Migração para produção (Hostinger ou TrueNAS) ainda não resolvida.

**Senha local do painel Python:** resetada para **`tiago2026`** nesta sessão
(`data/config.json`, PBKDF2-SHA256 com **200_000 iterações** — não 100k!).
`hash_senha()` em `server.py:55` usa 200k. A env `PAINEL_SENHA` só inicializa senha
se não houver config.json.

**Login ganhou botão "olho"** (mostrar/ocultar senha) — label "Senha" dentro da
caixa azul, ícone SVG à direita que troca entre olho-cortado/olho-aberto via
`toggleSenha()`. Pegadinha: `#login button{width:100%}` afetava o botão do olho —
resolvido com `width:auto` no `.password-toggle`. Commits 0897902→52ead91.

**Decisão (2026-06-30): migrar o painel inteiro para Node.js na Hostinger**, de
forma incremental, ESTENDENDO o `site-tiagotavares` (não do zero). Plano completo em
`~/.claude/plans/claude-estou-querendo-criar-functional-key.md`. Roadmap: Fase A
(CRM completo) → B (propostas+assinatura, PDF+SMTP) → C (tarefas/notas/início) →
D (contatos) → E (processos+DataJud) → F (Google).

**Fase A ✅ COMPLETA e DEPLOYADA (2026-06-30, commit a8684d3 em
`tavaresmatias/site-tiagotavares`):** o CRM Node em tiagotavares.adv.br/crm ganhou
as 4 fases do Python: cadastro expandido (~15 campos, modal em abas
Dados/Endereço/Contatos/Notas/Histórico, CPF com dígito verificador, auto-fetch
ViaCEP), documentos por lead (multer → `data/docs/{id}`), tags em chips + filtros
(tag OU + área) + relatório por área. Backend em `crm/db.js`+`crm/index.js`, frontend
em `crm/public/index.html`. Mantém o modelo relacional de áreas existente
(`area_direito_id`/`area_atuacao_id`); `estado()` resolve o nome da área e calcula
`relatorio_area`. Corrigido bug latente: rotas de lead usavam id string vs number
(agora `parseInt`). Testado ponta a ponta (curl + preview MCP) e confirmado no ar.

⚠️ **RISCO DE PERSISTÊNCIA — CAUSA RAIZ RESOLVIDA (2026-06-30):** após o deploy da
Fase A, produção ficou com **0 leads** — o lead "Tiago Tavares R$2.000" que existia
sumiu. Investigação (ver sessão detalhada em [[project_crm_advogado]]) achou a causa:
`GITHUB_REPO` estava REALMENTE ausente das variáveis de ambiente da Hostinger
(`GITHUB_TOKEN` sozinho existia, mas o código exige os dois —
`if (!token || !repo) return`, então o sync falhava silenciosamente desde sempre).
Corrigido no hPanel (Variáveis de ambiente): adicionado `GITHUB_REPO=
tavaresmatias/site-tiagotavares` + `GITHUB_TOKEN` renovado (PAT classic, escopo
`repo`, sem expiração — o antigo era fine-grained e o Tiago não tinha mais o valor
salvo). Diagnóstico feito com rotas de debug temporárias
(`/api/debug/gitcheck`/`gitlocal-test`, **removidas ao final**, commit `0686812`),
cada chamada autorizada explicitamente pelo Tiago por tocar segredo/produção — ver
[[hostinger_node_deploy]] pra convenções de deploy desse ambiente. Também foi
adicionado **retry** em `syncToGitHub()` (`crm/db.js`): em caso de push rejeitado
por "cannot lock ref" (conflito), faz `fetch`+`reset --soft` pro estado remoto e
tenta de novo (até 4x).

⚠️ **LIMITAÇÃO ARQUITETURAL SÉRIA DESCOBERTA (não resolvida):** o Web App da
Hostinger roda **múltiplas instâncias do processo Node em paralelo**, cada uma
aparentemente com sua PRÓPRIA cópia do filesystem (não compartilhado) — confirmado
via logs de execução mostrando 4-5 reinícios ("🚀 Servidor rodando") em janelas de
30s, sessões de login caindo aleatoriamente entre requisições (`MemoryStore` por
processo), e leads "sumindo e reaparecendo" dependendo de qual instância atende a
requisição. Isso quebra a premissa do design atual (JSON local + git-sync
fire-and-forget): **um lead criado pode ir para o disco de uma instância que nunca
sincroniza, ou duas instâncias podem colidir tentando commitar ao mesmo tempo**. O
retry ajuda com conflitos de push, mas NÃO resolve leads escritos no disco "errado"
de uma instância que não sincronizou antes do próximo redeploy/restart apagar tudo.
**Precisa de solução arquitetural real** (ex.: mover para um banco de dados externo
real — Postgres/Supabase, que já foi tentado antes nesse projeto e revertido por
problema de compilação SQLite; ou configurar a Hostinger pra rodar 1 única
instância, se o plano permitir). Ver [[project_crm_advogado]] pra decidir o próximo
passo — isso é mais sério que a falta de env var e pode estar causando perda
silenciosa de leads reais desde a migração pro Node.

---

**📍 Estado ao final da sessão de 2026-06-30 (pra retomar sem perder contexto):**
- Fase A (cadastro expandido + documentos + tags/filtros) está **no ar** em
  tiagotavares.adv.br/crm, código limpo (sem rotas de debug), commit `0686812`.
- CRM em produção está **vazio (0 leads)** de propósito — os leads de teste criados
  durante o diagnóstico foram apagados a pedido do Tiago. O Tiago ainda não voltou a
  usar o CRM pra valer.
- Painel Python local (`localhost:8770`) continua intacto como referência, senha
  `tiago2026`, com todas as 4 fases + o botão de olho no login.
- **Não fechar como resolvido** — o problema de múltiplas instâncias (parágrafo
  acima) ainda não tem solução implementada, só diagnosticada.

**🔜 Próximo passo imediato ao retomar:** decidir com o Tiago como resolver a
limitação de múltiplas instâncias (banco externo tipo Postgres vs. forçar 1
instância só na Hostinger) ANTES de incentivá-lo a usar o CRM Node pra valer ou
de continuar pra Fase B do roadmap. Plano de fases completo (B→F) em
`~/.claude/plans/claude-estou-querendo-criar-functional-key.md`.

Ver [[project-crm-advogado]] e [[project-painel]].
