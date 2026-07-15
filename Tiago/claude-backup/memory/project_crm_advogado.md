---
name: project-crm-advogado
description: CRM/funil comercial do Tiago (advogado) como MÓDULO do painel; Fase 1 (kanban de leads) feita e testada 2026-06-26
metadata: 
  node_type: memory
  type: project
  originSessionId: 6bb0fcdd-94f6-4516-81a2-25c22bb37581
---

CRM para a advocacia do Tiago — gestão de **prospecção** (funil comercial),
construído como **módulo do painel** (`Tiago/painel/`, repo `tavaresmatias/painel-tiago`).
Foco: o que vem ANTES do cliente (lead → proposta → fechamento); quando vira
cliente, vai pro Astrea/painel. Ver [[project-painel]].

**Decisões do Tiago (2026-06-26):** módulo do painel (não app separado);
WhatsApp via **API oficial Meta Cloud API**; Google Agenda via **OAuth** (integração
real); stack = padrão painel **+ SQLite** (`crm.db`), deploy no TrueNAS.

**Arquitetura (segue o painel):** `crm.py` = camada SQLite isolada em `crm.db`
dentro de `PAINEL_DATA` (entra no mesmo backup, não toca nos JSON existentes).
Exposto por `crm.handle(method, path, body, query) -> (status, dict)`. `server.py`
intercepta `/api/crm/...` nos 4 verbos reusando `_auth_ok()`/`_json()`. Front: aba
"Funil / CRM" no `static/index.html` (kanban drag&drop + modal de lead reusando
`#modal`/`fecharModal()`). Etapas fixas: novo→contato→reuniao→proposta→negociacao→
ganho/perdido. Tabelas: `leads`, `interacoes` (histórico, com eventos "sistema"
automáticos em criação e mudança de etapa).

**Fase 1 ✅ (2026-06-26):** funil kanban + CRUD de leads + histórico de interações
+ métricas (valor no funil, ganhos no mês) + botão WhatsApp (link wa.me já no card,
mesmo antes da API oficial). Testado: py_compile, teste lógico, HTTP end-to-end
(login+CRUD+401), e visual no preview. **Deployado 2026-06-26** (commit 7527047,
push p/ main de `tavaresmatias/painel-tiago`; TrueNAS puxa main). Ver
[[feedback_deploy_commands]].

**Integração Google ✅ CÓDIGO PRONTO (2026-06-27), setup do Tiago pendente:**
módulo `google_api.py` (OAuth + People API + Calendar API, tudo urllib/stdlib).
Contatos: rótulo/grupo "CRM" no Google ⇄ leads **nos dois sentidos** (casa por
últimos 8 dígitos do telefone p/ não duplicar; cria/atualiza/vincula). Agenda:
botão "Agendar" no lead cria evento na Google Agenda (opção de convidar lead por
e-mail). UI: barra/⚙️ Google + "Sincronizar contatos" na aba CRM. Credenciais/token
em `data/google.json` (gitignored). Migração de colunas `google_resource/etag/sync`
na tabela leads (ALTER idempotente em `crm._ensure`). Callback OAuth
`/api/crm/google/callback` é isento de token (validado por `state`). **Guia do
setup do Google Cloud: `CONECTAR-GOOGLE.md`** (Tiago faz uma vez, ~10 min: criar
projeto, ativar People+Calendar API, PUBLICAR app p/ token não expirar, criar OAuth
client Web c/ redirect `http://localhost:8770/api/crm/google/callback`, colar
ID/Secret no ⚙️ Google). Detalhe de produção: token salvo é local — p/ rodar no
TrueNAS, copiar `data/google.json` ou conectar via HTTPS Tailscale Serve. Testado:
py_compile, lógica de sync (casamento por telefone), HTTP (status/connect/callback/
sync/agendar) e visual no preview. ⚠️ NÃO commitado/deployado ainda.

Conta Google do Tiago: **tyagotavares@gmail.com** (claude tem MCP de Calendar
conectado a ela nesta sessão — mas o app no TrueNAS precisa do próprio OAuth).

**GOOGLE CONECTADO ✅ (2026-06-27)** — setup feito por Claude via navegador (Chrome
MCP) no Google Cloud do Tiago (conta hostinger/cloud = "Wilson Tavares"; projeto
`careful-cosine-413700` "My Project 11099"): tela de consentimento criada (app "CRM
Tiago", Externo, **publicado em produção** p/ token não expirar), People API +
Calendar API ativadas, cliente OAuth Web criado (redirect
`http://localhost:8770/api/crm/google/callback`). Client ID/Secret baixados via JSON
e plugados no painel. Conectado como tyagotavares@gmail.com (refresh_token em
`data/google.json` **LOCAL no Mac**). ⚠️ **PEGADINHA SSL no Mac:** Python.org Python
dava `CERTIFICATE_VERIFY_FAILED` — resolvido rodando `/Applications/Python 3.12/
Install Certificates.command`. No Docker (TrueNAS) não ocorre. ⚠️ Token está só no
Mac; p/ a produção (TrueNAS) sincronizar sozinha, copiar `data/google.json` pra lá
quando o NAS voltar. server.py `_google_callback` agora loga traceback (mudança não
commitada ainda).

**WhatsApp (Fase 2):** número escolhido pelo Tiago = **24988387333** — ⚠️ é o MESMO
publicado no site tiagotavares.adv.br, então já está num WhatsApp ativo; pra usar na
Meta Cloud API precisa MIGRAR (sai do app). Confirmar com ele antes.

**Áreas de atuação do Tiago** (de tiagotavares.adv.br/servicos): Consumidor, Cível,
Tributário, Legalização de Imóveis (usucapião/REURB/regularização de obras),
Previdenciário (foco aposentadoria rural/segurado especial), Consultoria.
Endereço: R. Pres. Vargas, 595, Sala 404, Três Rios/RJ, CEP 25802-200.
**OAB/RJ 270.860.** Tiago atua SOZINHO na proposta (mandou remover a co-advogada
Fernanda que aparecia no PDF-exemplo — era só exemplo). Site é separado (Site
principal/, não é o painel).

**Propostas (Fase 4) — EM ANDAMENTO (2026-06-27):** Tiago mandou o modelo REAL dele
(PDF "Contrato de Prestação de Serviços de Advogado") — o template foi **reescrito
pra seguir exatamente esse contrato** (em vez do genérico). `painel/templates/
proposta-honorarios.html`: partes c/ qualificação completa, preâmbulo Boa-fé Objetiva,
Cláusulas 1ª Objeto · 2ª Atos Processuais/substabelecimento · 3ª Prazos docs (10 dias)
· 4ª Remuneração (+mora 1%/mês) · 5ª Despesas (c/ recibo) · 6ª Disposições/foro Três
Rios + LGPD. **Objeto e Remuneração ficam LIVRES** (Tiago preenche por demanda — "cada
demanda é diferente"). Bloco da Fernanda é opcional. `escopos-por-area.md` = helper
opcional de textos por área. ASSINATURA decidida: **própria no painel (avançada)** —
OTP e-mail/SMS + consentimento + hash SHA-256 do PDF + trilha IP/data/hora + manifesto
anexado; válida entre partes (MP 2200-2 art.10 §2º + Lei 14.063/2020). Sequência
escolhida: **fechar o texto ANTES de construir**. Logo no topo do modelo
(`templates/logo-tiago.png`, = `Site principal/Logotiago.png`); contato com e-mail
**contato@tiagotavares.com.br** + tel (24) 98838-7333 + site tiagotavares.adv.br.
Texto revisado e aprovado visualmente (preview). Falta: aval final p/ construir
"Gerar proposta" + fluxo de assinatura no CRM.

**Fases seguintes (pendentes):** 2-WhatsApp Meta Cloud API (número definido, migrar);
4-Propostas (assinatura — decidir método); 5-webhook respostas + IA (reusa
`ANTHROPIC_API_KEY`, módulo `resumir.py`).

⚠️ **Pegadinha WhatsApp:** a Cloud API exige um número NÃO registrado em WhatsApp
comum/Business app — Tiago vai precisar de número dedicado ou migrar o atual.
Meta e Google exigem cadastro/verificação (guiar clique a clique nas Fases 2/3).

---

**⚠️ Numeração de fases divergente:** a partir de 2026-06-29, a implementação passou a
seguir um roadmap **diferente** (inspirado na exploração do Clieent CRM — ver
[[crm_clieent_full_exploration]]), com fases **1A/1B/1C/2/3/4**, que NÃO corresponde
à numeração 1-5 usada acima (que tratava WhatsApp como "Fase 2" e Propostas como
"Fase 4"). Tratar como dois roadmaps históricos sobre o mesmo projeto; o roadmap
1A-4 é o que está sendo executado agora.

**Cadastro Expandido + Documentos + Propostas ✅ COMPLETO (2026-06-29):**
- **Fase 1A** (commit b3faaf2): 16 campos novos no lead (CPF, RG, endereço completo,
  contatos secundários, tags) — backend só.
- **Fase 1B** (commit d5ccdf8): modal de lead reescrita com 4→5 abas (Dados Pessoais,
  Endereço, Contatos, Notas, Propostas). Validação de CPF com algoritmo, auto-fetch
  de endereço via ViaCEP.
- **Fase 1C** (commit 1f9d4a6, fix em 36ab678): upload de documentos (CPF/RG/Comprovante)
  por lead, tabela `documentos`, storage em `data/docs/{lead_id}/`.
- **Fase 2** (commits 14f859b, 36ab678, 223d6eb): geração de propostas a partir do
  template `proposta-honorarios.html` já existente. Tabela `propostas`, link público
  compartilhável (hash, sem login), preview/impressão via navegador (Cmd+P → Salvar
  PDF — **decisão deliberada de não instalar wkhtmltopdf/weasyprint**, porque a imagem
  Docker de produção é `python:3.12-slim` sem essas deps de sistema). Botão WhatsApp
  via `wa.me`.

**🐛 Lição importante (2026-06-29):** as fases 1B/1C foram documentadas como "testadas"
com base só em `py_compile` + leitura de código — nunca exercitadas com HTTP real. Ao
testar a Fase 2 de ponta a ponta (`curl` completo: login→lead→proposta→preview→link
público), apareceram **2 bugs que tornavam o upload de documentos da Fase 1C
inoperante em produção desde que foi implementado**: (1) `c.lastrowid` chamado num
`sqlite3.Connection` em vez do `Cursor` retornado por `execute()` → `AttributeError`;
(2) `_crm()` consumia o corpo da requisição via `self._body()` antes de checar a rota
de upload, que precisava ler o corpo de novo como bytes brutos → deadlock (conexão
trava esperando bytes que não vêm). Corrigidos no commit 36ab678. **Daqui pra frente,
qualquer rota que toque I/O real (upload, geração de arquivo) precisa de teste HTTP
de ponta a ponta antes de declarar "testado" — `py_compile` não é suficiente.**

⚠️ **Servidor local do Tiago (Mac) precisa reiniciar** pra carregar esses fixes — estava
rodando desde antes da correção. Mesma observação pro TrueNAS no próximo deploy.

**Fase 3 ✅ COMPLETA (2026-06-29, commit c6883d1):** assinatura digital de propostas.
Cliente assina pelo link público (sem login) via código OTP de 6 dígitos enviado ao
e-mail JÁ cadastrado no lead (não digitado livremente). Tiago clica botão explícito
"Enviar para Assinatura" → congela PDF real + hash SHA-256 → status `enviada`; cliente
confirma com o código → PDF final assinado com manifesto embutido (nome/e-mail/data/
hora/IP/hash, citação MP 2200-2 + Lei 14.063/2020) → status `assinada`. **PDF real via
PyMuPDF (`fitz.Story`+`fitz.DocumentWriter`)** — já instalado, renderiza o HTML+CSS do
template (inclusive `display:flex`) sem precisar de wkhtmltopdf/weasyprint. OTP: hash
SHA-256 no banco (nunca texto puro), expira 10 min, máx. 5 tentativas. Bug de
regressão da Fase 2 corrigido de passagem: `listar_propostas()` não trazia
`link_unico`, então "Copiar Link"/WhatsApp" na lista de propostas estavam
copiando/enviando `undefined` desde a Fase 2. Testado de ponta a ponta via HTTP real
(servidor isolado): fluxo completo + todos os casos de borda (sem e-mail, código
errado, 5 tentativas, expiração, reenvio em proposta já assinada, downloads auth e
público). Push feito (`painel-tiago` + gitlink em `projtiago`). **Servidor local do
Mac reiniciado** com o código novo (PID novo, env `PAINEL_SENHA=devlocal123
PAINEL_PORT=8770` — essa env só inicializa senha se não houver config; a senha real
do Tiago já configurada continua sendo a válida, login com `devlocal123` falha como
esperado). A tabela `propostas` ainda não existe no banco real (`data/crm.db`) porque
nenhuma proposta real foi criada ainda — a migração roda automaticamente (idempotente,
via `_ensure()`) na primeira ação real do Tiago no painel.

**Fase 4 ✅ COMPLETA (2026-06-30, commit 0c1208b):** tags e filtros do CRM.
Tags agora são editor visual de chips (add/remove via botão ou Enter), renderizadas
como `.tag-chip` colorido no card do kanban junto com área/origem, com sugestões via
`<datalist>` de tags já usadas (`todasTagsUsadas()`). Barra de filtros acima do kanban:
chips de tag clicáveis (filtro OU — leva se tiver QUALQUER tag selecionada), dropdown
de área (filtro ==), botão "Limpar filtros". Estado do filtro em `FILTROS{}` separado
de `CRM{}` de propósito — `carregarCRM()` substitui `CRM` inteiro a cada reload (após
drag&drop, editar lead, etc.), mas `FILTROS` sobrevive e filtro continua aplicado
(client-side, sem recarregar backend). Relatório por área: tabela com distribuição de
leads em aberto (count+valor por `area_principal`), ordenada por valor desc, renderizada
em `<details>` expandível no rodapé do kanban. Computado no backend (`estado()`), sem
query SQL nova — reusa a lista `abertos` já calculada. Testado: 3 leads com áreas/tags
diferentes via curl, `relatorio_area` endpoint OK, regressão documentos+propostas+kanban
OK. Push feito (`painel-tiago` + gitlink em `projtiago`). **Servidor local do Mac
reiniciado** com o código novo (PID novo, env padrão). Nenhuma tabela SQL nova — tags
já existiam desde Fase 1A como coluna `TEXT DEFAULT '[]'`, agora com editor visual +
filtro + visualização no kanban.

---

## SESSÃO 2026-06-30 (continuação) — Descoberta dos dois sistemas + migração pro Node

**Resumo executivo pra quem retomar:** o Tiago achou que a Fase 4 "não funcionou"
porque ele estava olhando o **CRM Node antigo** (tiagotavares.adv.br/crm), não o
painel Python onde tudo foi implementado. Isso levou a uma decisão maior: **migrar
o painel inteiro pra Node.js**, incremental, direto no `site-tiagotavares` que já
está em produção. A Fase A dessa migração (equivalente ao cadastro expandido +
documentos + tags/filtros) **já está implementada, deployada e funcionando em
produção**. Só falta resolver uma limitação de infraestrutura da Hostinger antes de
confiar 100% nos dados. Detalhes completos em [[crm_dois_sistemas]] — ESSE é o
arquivo mais importante pra ler primeiro numa sessão nova sobre este projeto.

**Ordem dos acontecimentos desta sessão:**

1. **Diagnóstico do "Fase 4 não funciona":** achado que existem DOIS CRMs
   completamente separados — `/Tiago/painel/` (Python, onde tudo foi feito) rodando
   só em `localhost:8770`, e `/Tiago/site-tiagotavares/crm/` (Node, versão antiga
   sem nenhuma das 4 fases) publicado em `tiagotavares.adv.br/crm`. Ver
   [[crm_dois_sistemas]] pros detalhes técnicos de cada um.

2. **Login com botão de mostrar/ocultar senha** adicionado ao painel Python local
   (`painel/static/index.html`) — label "Senha" dentro do campo, ícone de olho que
   alterna entre cortado/aberto via `toggleSenha()`. Commits `0897902`→`52ead91` em
   `painel-tiago`. Senha local resetada pra `tiago2026`.

3. **Decisão do Tiago: reescrever o painel inteiro em Node.js**, incremental, na
   Hostinger que ele já paga — em vez de VPS novo ou voltar pro TrueNAS. Plano
   completo escrito em `~/.claude/plans/claude-estou-querendo-criar-functional-key.md`
   (roadmap Fase A→F). Estratégia: ESTENDER o `site-tiagotavares/crm/` que já roda
   em produção, não reescrever do zero.

4. **Fase A implementada e deployada** (commits `a8684d3`→`0686812` em
   `tavaresmatias/site-tiagotavares`): cadastro expandido (~15 campos, modal em
   abas Dados/Endereço/Contatos/Notas/Histórico, CPF com validação, ViaCEP),
   documentos por lead (multer), tags+filtros+relatório por área — tudo isso
   portado do painel Python pro CRM Node existente. Arquivos: `crm/db.js`,
   `crm/index.js`, `crm/public/index.html`. Modelo de área continua **relacional**
   (`area_direito_id`/`area_atuacao_id`), diferente do Python (`area_principal`
   string) — decisão deliberada pra não migrar dados reais.

5. **Bug crítico de persistência encontrado e corrigido:** produção perdeu um lead
   real ("Tiago Tavares R$2.000") entre deploys. Causa raiz: `GITHUB_REPO` nunca
   tinha sido configurado no hPanel (só `GITHUB_TOKEN` existia sozinho), e o código
   de sync exige os dois (`if (!token || !repo) return`). Corrigido: `GITHUB_REPO=
   tavaresmatias/site-tiagotavares` adicionado + `GITHUB_TOKEN` renovado (o antigo
   era fine-grained e o Tiago não tinha mais o valor; gerado um novo PAT classic,
   escopo `repo`, sem expiração). Configuração feita via navegador (Chrome MCP),
   pedindo confirmação explícita ao Tiago em cada ponto que tocava token/produção —
   ver [[crm_dois_sistemas]] pro detalhe de por que Claude nunca digita/cola tokens.

6. **Limitação arquitetural séria descoberta (NÃO resolvida ainda):** a Hostinger
   roda **múltiplas instâncias do processo Node em paralelo**, cada uma com sua
   própria cópia do filesystem — confirmado via 5 reinícios do servidor em 30s nos
   logs, sessões de login caindo aleatoriamente, e leads "sumindo e reaparecendo"
   dependendo de qual instância atende a requisição. Foi adicionado **retry** em
   `syncToGitHub()` (`crm/db.js`) pra lidar com conflitos de push concorrente
   ("cannot lock ref"), mas isso NÃO resolve o problema de fundo: um lead pode ser
   escrito no disco de uma instância que nunca chega a sincronizar antes do próximo
   redeploy apagar tudo. **Esse é o item mais importante pra investigar na próxima
   sessão** — precisa de uma solução real (banco de dados externo tipo Postgres —
   já tentado antes nesse projeto e revertido por problema de compilação SQLite —
   ou configurar a Hostinger pra rodar 1 única instância, se o plano permitir).

7. **Estado final desta sessão:** Fase A no ar, código limpo (rotas de debug
   temporárias removidas, commit `0686812`), leads de teste apagados do CRM real.
   Login local do painel Python inalterado (`tiago2026`). CRM em produção
   (`tiagotavares.adv.br/crm`) tem 0 leads reais no momento (os de teste foram
   apagados) — o Tiago ainda não recomeçou a usar pra valer.

**Pendências pra próxima sessão, em ordem de prioridade:**
1. Decidir e implementar a solução real pro problema de múltiplas instâncias
   (ver item 6) — sem isso, não é seguro o Tiago confiar no CRM Node em produção.
2. Depois disso resolvido: continuar o roadmap (Fase B — propostas + assinatura
   digital, decidir lib de PDF em Node; depois C/D/E/F conforme o plano salvo).
3. SMTP de produção pra e-mails de OTP (pendência antiga, ainda não configurada).
4. Decidir o que fazer com o painel Python local — mantém como referência até o
   Node alcançar paridade completa, ou descontinua antes?
