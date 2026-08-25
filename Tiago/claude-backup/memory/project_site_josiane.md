---
name: project-site-josiane
description: "Site da enfermeira Josiane Tavares (drajosianetavares.com.br) — EM PRODUÇÃO, informativo + painel admin + sistema de puericultura"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0841758b-1ec9-4a80-ae5e-8d842c9ae0f2
  modified: 2026-08-23T12:30:44.934Z
---

**⚠️ Caminho do repo mudou**: agora é `~/Documents/github/site-josiane-push/` (repo GitHub `carlosxaviermatias/site-josiane`), não mais `Josiane Tavares/site-josiane/`. **No ar desde 22/08/2026** em https://drajosianetavares.com.br, deploy automático via Hostinger Web App a cada `git push`. Ver [[project-sistema-enfermagem]] para o sistema de puericultura (a parte que mais evoluiu) e `SEGURANCA.md`/`SISTEMA-ENFERMAGEM.md` no repo para o handoff técnico completo.

Mesma arquitetura do site do Dr. Jonatan (ver [[project-jonatan]] e [[github-sync-setup]]): Node+Express, todo o conteúdo em `data.json`, `loader.js` monta as páginas, painel em `/admin`. Roda como `site-josiane` na porta 3002 (`.claude/launch.json`).

**Decisões do Tiago (2026-08-21):**
- Site **informativo**, não comercial. Josiane atende **exclusivamente no SUS** — nada de agendamento, nada de "marque sua consulta".
- **Sem WhatsApp** por enquanto (ele pediu explicitamente para não ter).
- Área restrita = **painel admin dela** + página pública de **indicações/afiliados** (links com `rel="nofollow sponsored"`).
- Foco de conteúdo: pré-natal, puerpério, Papanicolau/exames ginecológicos, amamentação, planejamento familiar + enfermagem geral.

**Why:** ele descartou portal da paciente e agendamento; o "pequeno sistema" que virá depois ainda não foi definido — o que existe hoje é só o front + CMS.

**FAQ interativo (`/faq`, feito em 21/08/2026):** a visitante escolhe a fase (grávida / puérpera / prevenção / planejando); quem diz que está grávida informa a DUM ou as semanas e recebe idade gestacional, DPP (Näegele) e os marcos do pré-natal daquele momento. As 25 perguntas se filtram pela fase, com busca. Tudo editável na aba "Dúvidas (FAQ)" do painel.

**How to apply:** ao retomar, não sugerir CTA de consulta particular nem botão de WhatsApp sem ele pedir. Pendências: fotos definitivas em `img/` (as atuais são recorte de uma foto do Downloads dele; ⚠️ .heic do iPhone precisa de `ImageOps.exif_transpose`, senão sai deitada) (nomes listados no README), cidade e e-mail (ainda `[PLACEHOLDER]`; COREN já preenchido: **COREN-RJ 455892-ENF**), e configurar `GITHUB_TOKEN`/`GITHUB_REPO` antes de entregar, senão o painel perde as edições no deploy.

Senha de dev do painel: `josiane2026` (trocar via `ADMIN_PASSWORD` em produção).
