---
name: project-sistema-enfermagem
description: "Sistema Enfermagem — acompanhamento de puericultura na área restrita do site da Josiane, EM PRODUÇÃO com 108 pacientes reais"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0841758b-1ec9-4a80-ae5e-8d842c9ae0f2
  modified: 2026-08-23T12:30:35.918Z
---

Sistema de acompanhamento de pacientes dentro do site da Josiane (ver [[project-site-josiane]]), em `~/Documents/github/site-josiane-push/admin/pacientes.html`. **No ar** desde 22/08/2026 em https://drajosianetavares.com.br/sistema/pacientes.

**⚠️ LER `SISTEMA-ENFERMAGEM.md` na raiz do repo antes de retomar** — handoff completo e atualizado (23/08/2026): motor de pontuação, modelo de dados, fluxo de teste local, segurança, pendências.

**O que é:** puericultura até 2 anos, checklist de contadores (não guarda peso/altura/datas — isso é do e-SUS). **6 critérios** de 1/6 cada (mudou de 5→6 em 22-23/08: visita de 30 dias e de 6 meses viraram critérios separados, não mais "1 dos dois"). Dados são **108 crianças reais** da ESF Granja (Paty do Alferes/RJ), mantidas por **importação automática do CSV do e-SUS** direto no painel (botão "Importar CSV" — casa por nome, atualiza quem existe, cadastra quem é novo, nunca duplica) — substituiu totalmente a digitação manual.

**Avisos de busca ativa do ACS (regra específica, 23/08):** cards separados pra visita de 30 dias e de 6 meses, mas só mostram quem **ainda dá tempo de agir** — quem já perdeu o prazo some da lista (a pontuação geral continua contando como não cumprido, só a lista de "correr atrás" que fica enxuta). A visita de 6 meses só entra na lista quando a criança **completa** 6 meses (calculado por calendário real via `diasAoCompletar()`, não em dias corridos fixos) e sai quando passa de 6m29d.

**Segurança (auditoria 23/08, ver SEGURANCA.md):** duas falhas críticas corrigidas — `express.static` expunha `app.js`/`package.json` publicamente (agora allowlist), e login sem rate limit (agora 8 erros/15min bloqueiam). `pacientes.json` nunca vai pro Git, fica em `~/dados-protegidos/` no servidor (fora da pasta de build, que é recriada a cada deploy). CPF criptografado (AES-256-GCM). **Pendente:** definir `SESSION_SECRET` no painel do Hostinger.

**Interface (22-23/08):** gráficos em barras/rosca/pizza (SVG à mão, sem lib), todo clicável → filtra lista de crianças. Exportação em PDF (botão ⇩ em cada bloco, `window.print()`, sem lib externa). Responsivo — tabelas viram cartões no celular. Logo no topo volta pra "Onde estou"; barra de abas fica fixa ao rolar (`position:sticky`, precisa ser filho direto de `#app` — um wrapper do tamanho da própria barra quebra o sticky, já foi bug real), com botão de ocultar/mostrar.

**Why:** ela presta contas de indicadores da APS e precisa saber, antes do indicador fechar oficialmente, onde está e qual criança buscar. Foi ela quem corrigiu a regra dos 6 critérios e a de busca ativa — confiar no domínio dela sobre a regra oficial do indicador, não assumir que a primeira implementação estava certa.

**How to apply:** ao propor mudança nesse sistema, sempre testar local primeiro (fluxo documentado no handoff: servidor com `DADOS_DIR` temporário + reimportar o CSV real de `~/Downloads/acompanhamento-condicao-saude_2026-08-21-20-10.csv`) antes de subir. Depois do `git push`, aguardar 1-2min de redeploy do Hostinger e confirmar com `curl` antes de dizer que terminou. **LGPD resolvida** para o desenho atual (dado fora do Git, criptografado, senha com rate limit) — mas segue sendo painel de senha única, sem log de acesso por pessoa; se crescer além dela, vale reconsiderar.
