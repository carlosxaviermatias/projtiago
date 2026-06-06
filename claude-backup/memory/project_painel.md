---
name: project-painel
description: "Painel privado do Tiago (advogado) — sistema interno em Tiago/painel/, alvo de deploy no TrueNAS SCALE"
metadata: 
  node_type: memory
  type: project
  originSessionId: bc17a606-62d9-40f4-884b-45cee7523e8c
---

Sistema interno pessoal do Tiago (advogado, usa Astrea) para organizar trabalho. Código em `Tiago/painel/`.

**Arquitetura:** backend Python puro (stdlib, sem dependências) em `server.py` servindo SPA em `static/index.html`. Lógica e senha NUNCA no HTML (exigência do Tiago por segurança). Senha criptografada (pbkdf2) em `data/config.json`; dados em JSON em `data/`. Config por env: `PAINEL_HOST`, `PAINEL_PORT`, `PAINEL_DATA`, `PAINEL_CONFIG`, `PAINEL_SENHA` (senha inicial no container).

**Onde roda:** decidido rodar no **TrueNAS SCALE 26 (Community)**, hostname `truenas`, como app Docker (`docker-compose.yaml` + guia `INSTALAR-TRUENAS.md`). Imagem `python:3.12-slim`, sem build. Também roda local no Mac via `Abrir Painel.command`. GitHub Pages foi descartado (é público; não serve backend privado).

**Plano em fases (combinado com ele, ir por partes):**
- Fase 1 ✅ (jun/2026): processos, tarefas com prazo, anotações. Feito e testado.
- Fase 2: IA (resumir processos, redigir textos).
- Fase 3: automação (cálculo de prazos, lembretes).
- Fase 4 (mais complexa, por último): buscar movimentação dos processos automaticamente — depende de saber os tribunais dele (PJe/ESAJ/Projudi/TRT) e API CNJ/DataJud ou raspagem.

Só o Tiago usa (um login). Acesso externo futuro = Tailscale (já instalado no NAS), não expor na internet. Ver [[feedback_deploy_commands]].

**Infra concreta (jun/2026):** Repo privado `tavaresmatias/painel-tiago`. Push do Mac via alias SSH `github-painel` (`~/.ssh/id_ed25519_painel`). TrueNAS IP `192.168.18.22`; Shell loga como `tiagotavares` SEM sudo; só `/mnt/HD2T/arquivosHD2T` é gravável → código clonado em `/mnt/HD2T/arquivosHD2T/painel`, deploy key (read-only) em `/mnt/HD2T/arquivosHD2T/painel-deploy/key`. Sessão web do TrueNAS expira rápido. **Estado/handoff sempre atualizado em `_handoff/ESTADO-ATUAL.md` no repo** — ler esse arquivo pra retomar. Há um loop de relatório a cada 15 min ativo durante a sessão de instalação.
