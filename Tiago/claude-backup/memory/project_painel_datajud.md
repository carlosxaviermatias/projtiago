---
name: project_painel_datajud
description: "Painel Fase 2 — consulta de movimentação de processos direto no DataJud (CNJ), sem Astrea"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4a745fdc-983a-43d7-b146-0914a97605c5
---

No [[project_painel]], a Fase 2 começou em 2026-06-06: consulta de movimentação processual **direto no tribunal via API Pública do DataJud (CNJ)**, explicitamente para NÃO depender do Astrea.

**Feito e testado (tudo entregue):** `datajud.py` (Python puro, urllib, sem deps; detecta tribunal pelo nº CNJ; certifi p/ SSL no Mac), endpoint `POST /api/processos/<id>/movimentacao`, botão 📜 + modal de movimentações, busca automática em 2º plano ao cadastrar. Reconsulta periódica: `scripts/atualizar_movimentacoes.py` (diff de novidades + e-mail via `notificacoes.notificar_movimentacoes`), agendada por `scripts/com.tiago.painel.movimentacao.plist` (launchd) / cron — ver `scripts/AGENDAR-MOVIMENTACOES.md`. Resumo IA: `resumir.py` (urllib, **não** SDK, p/ manter zero deps), liga sozinho com `ANTHROPIC_API_KEY`, modelo padrão claude-opus-4-8 (trocável via `PAINEL_IA_MODELO`), box "✨ Resumo (IA)" no modal.

**Estado:** IA fica **dormente** até o Tiago configurar `ANTHROPIC_API_KEY` (ele não tinha chave). Cron no TrueNAS precisa ser configurado por ele (não tenho acesso ao NAS).

**Decisão importante:** mantivemos zero dependências mesmo na parte de IA — usamos HTTP puro via urllib em vez do SDK `anthropic`, porque o deploy é `python:3.12-slim` rodando só `python server.py`, sem etapa de pip. Ver [[feedback_deploy_commands]].

**Limitação:** DataJud tem atraso de indexação — processos recém-distribuídos voltam vazios (aviso, não erro). Chave pública do CNJ por padrão; trocável via `PAINEL_DATAJUD_APIKEY`.
