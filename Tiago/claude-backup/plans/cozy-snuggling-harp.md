# CRM interligado — tela de detalhe do processo (estilo Astrea)

## Context

Hoje o CRM (em `Tiago/site-tiagotavares/crm/`, produção em `tiagotavares.adv.br/crm`) tem as seções soltas: Funil (leads/clientes), Processos, Agenda (tarefas), Contatos, Propostas. O processo até tem a coluna `lead_id` no banco (`crm_processos`), **mas não há UI para preencher esse vínculo** — então cliente, agenda, documentos, propostas e atendimentos não se conversam.

O objetivo (referência: tela de processo do Astrea) é **clicar num processo e abrir uma página inteira** com todas as informações agregadas, e amarrar **cliente ↔ processo ↔ agenda ↔ funil**. O vínculo central é `processo → cliente (lead)`; por ele alcançamos documentos, propostas (honorários) e atendimentos que já vivem sob o lead.

**Decisões do usuário:** (1) detalhe em **página inteira** (não modal); (2) campos manuais que o DataJud não fornece (réu/parte contrária, valor da causa/condenação, honorários faturado/a-faturar) ficam para uma fase posterior. Entregar **em fases**, cada uma testável isolada.

O que o DataJud já fornece e está no banco: `tribunal`, `classe`, `orgao` (=juízo), `ajuizamento`, `movimentos[]`, `atualizado_fonte`, `ultima_consulta`.

---

## Fase 1 — Vínculo processo↔cliente + página de detalhe

**Backend** (`crm/index.js`, `crm/db.js`, `crm/processos.js`)
- `criarProcesso`/`atualizarProcesso` já aceitam `lead_id` (`crm/processos.js:50-74`) — nenhuma mudança de escrita necessária.
- Adicionar endpoint leve para o seletor de cliente: `GET /api/crm/leads` → `db.listarLeadsResumo()` retornando `[{id, nome, etapa}]` (novo helper em `db.js`, um `SELECT id,nome,etapa FROM crm_leads WHERE arquivado=0 ORDER BY nome`). Registrar a rota junto das rotas de leads em `crm/index.js:66`.

**Frontend** (`crm/public/index.html`)
- **Seletor de cliente** no formulário "nova proc" (`sec-processos`, ~linha 289) e no detalhe: um `<select>`/busca simples populado por `GET /api/crm/leads`. Passar `lead_id` no `criarProcesso()` (~linha 702) e num novo `salvarVinculoProcesso(id, lead_id)` via `PUT /api/crm/processos/:id`.
- **Card clicável**: em `renderProcessos()` (~674-700), tornar o `.proc-card` clicável chamando `abrirProcesso(p.id)`; manter os botões de ação com `event.stopPropagation()`.
- **Nova função `abrirProcesso(id)`**: renderiza um "modo detalhe" de **largura total dentro de `sec-processos`** (esconde lista+form, mostra `<div id="proc-detalhe">`, com botão **← Voltar** que restaura a lista). Layout em 2 colunas espelhando o Astrea:
  - Esquerda: **Dados do Processo** (numero_fmt, juízo=`orgao`, classe, tribunal, ajuizamento, criado, status), **Cliente vinculado** (nome clicável → `abrirLead(lead_id)`), **Últimos históricos** (movimentos DataJud, reusar padrão `.mov-item` de `verMovimentos` ~733-750), botão **Atualizar (DataJud)** deste processo.
  - Direita (agregações **read-only** puxadas do cliente vinculado, reusando endpoints existentes): **Documentos** (`GET /leads/:id/docs`), **Atendimentos** (interações de `GET /leads/:id`), **Honorários** (`GET /leads/:id/propostas`, reusar `PROP_STATUS`/`renderPropostasLead` ~1117-1150). Sem cliente vinculado, mostrar aviso "Vincule um cliente para ver documentos/atendimentos/honorários".
- **Interligação reversa (funil → processos)**: no detalhe do lead (`abrirLead` ~1022-1114) adicionar bloco/aba **"Processos"** listando processos do cliente (filtrar `GET /api/crm/processos` por `lead_id` no cliente, cada um clicável → `abrirProcesso`).

**Reuso:** `api`, `esc`, `fmtData`, `fmtDataHora`, `fmtBRL`, `fmtPrazo` (index.html ~338-758); `abrirLead`, `renderPropostasLead`, `PROP_STATUS`; padrão `.mov-item`.

---

## Fase 2 — Agenda interligada (tarefas ↔ processo/cliente)

**Backend** (`crm/db.js`, `crm/painel.js`, `crm/index.js`)
- `ALTER TABLE crm_tarefas ADD COLUMN IF NOT EXISTS processo_id INTEGER REFERENCES crm_processos(id) ON DELETE SET NULL` (idempotente, junto dos ALTERs em `db.js:202-211`).
- `criarTarefa`/`tarefaDict`/`listarTarefas` em `painel.js` passam a aceitar/retornar `processo_id` (+ `processo_titulo`/`numero_fmt` via JOIN). Aceitar filtro `?processo_id=` e `?lead_id=` em `GET /api/crm/tarefas`.

**Frontend** (`crm/public/index.html`)
- Formulário de nova tarefa (`criarTarefa` ~449-456): adicionar seletor opcional de **cliente** e **processo**.
- Detalhe do processo: seção **"Próximas atividades"** listando tarefas deste processo (e/ou do cliente), com criação inline.
- Aba Agenda (`renderTarefas` ~435-448): mostrar cliente/processo vinculado em cada item, clicável.

---

## Fase 3 — Documentos e atendimentos direto no processo

**Backend**
- `ALTER TABLE crm_documentos ADD COLUMN IF NOT EXISTS processo_id INTEGER` (opcional) para anexar documentos direto ao processo; endpoints de upload/list aceitam `processo_id`.
- Endpoint para registrar **atendimento** (interação) a partir do processo (reusar `db.adicionarInteracao`, associando ao cliente vinculado).

**Frontend**
- No detalhe do processo, tornar Documentos e Atendimentos **editáveis** (upload/add), não só leitura.

---

## Fase 4 (depois) — campos manuais estilo Astrea

Réu/parte contrária, valor da causa/condenação, honorários (faturado / a faturar como valores rastreados), status editável, link no tribunal manual, Recursos e desdobramentos, Apensos. Requer novas colunas em `crm_processos` e formulário de edição — deixado para o fim por ser entrada de dados manual e menos central.

---

## Verificação (cada fase)

Não há Node neste ambiente local; validar **após deploy** em `tiagotavares.adv.br/crm` (ou local, se rodar `node app.js` com `DATABASE_URL`). Conforme o feedback de "teste de ponta a ponta", não basta compilar — testar via HTTP real:

- **Fase 1:** criar/editar um processo vinculando um cliente; clicar no card e confirmar que a página de detalhe abre com Dados + Cliente (link abre o lead) + Históricos; conferir que Documentos/Atendimentos/Honorários do cliente aparecem; no detalhe do lead, ver a lista de processos vinculados e navegar de volta. Testar sem cliente vinculado (avisos aparecem).
- **Fase 2:** criar tarefa vinculada a processo/cliente; confirmar que aparece em "Próximas atividades" do processo e na aba Agenda com o vínculo.
- **Fase 3:** subir um documento e registrar um atendimento pelo próprio processo; confirmar persistência e exibição.

Migrações são `ALTER ... IF NOT EXISTS` idempotentes rodadas por `ensureSchema()` no boot — seguras em produção.
