---
name: project-sistema-enfermagem
description: "Sistema Enfermagem — acompanhamento de puericultura na área restrita do site da Josiane, espelhando os 5 indicadores da APS"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0841758b-1ec9-4a80-ae5e-8d842c9ae0f2
  modified: 2026-08-21T23:14:35.725Z
---

Sistema de acompanhamento de pacientes dentro do site da Josiane (ver [[project-site-josiane]]), em `Josiane Tavares/site-josiane/admin/pacientes.html`, rota `/admin/pacientes`. Criado em 21/08/2026.

**⚠️ LER `SISTEMA-ENFERMAGEM.md` na raiz do projeto antes de retomar** — é o handoff completo (motor, modelo de dados, próximos passos).

**O que é:** puericultura até 2 anos, como **checklist de contadores** — não guarda peso, altura nem data de consulta, porque isso já está no e-SUS. 5 critérios de 0,20 cada (tudo ou nada): visita domiciliar 30d **e** 6m · 1ª consulta ≤30d · 9 consultas até 2a · 9 dessas com peso/altura · 4 vacinas (Pneumo10V, Penta, VIP, Tríplice viral). Ela clica `−`/`+` a cada atendimento e o gráfico se move. **Dados agora são REAIS: 108 crianças da ESF Granja (Paty do Alferes/RJ)**, importadas em 21/08/2026 do CSV do e-SUS "acompanhamento de condições de saúde". `pacientes.json` foi tirado do Git (`git rm --cached` + `.gitignore` + removido do `git add` do sync) ANTES de gravar os dados reais — o histórico local só tem as fictícias e não há remoto. CPF/CNS ficaram de fora. Medições de peso/altura podem exceder consultas (medem na vacina) — a trava antiga foi removida. ⚠️ `vis6m` veio quase todo 0: o CSV só traz a data da 1ª e 2ª visita, não dá pra saber se houve visita na janela dos 6 meses — ela precisa marcar manualmente.

**Why:** em 21/08/2026 ele mandou o relatório oficial `relatorio_desenvolvimento_inf.pdf` e pediu para tirar a digitação de peso/altura. Eu conferi a fórmula nos 18 registros do PDF e ela fecha exatamente — 5 critérios × 0,2 = coluna *Pontuação*. **Foi uma reescrita: o motor antigo de 9 marcos com janelas em dias de vida deixou de existir.** O propósito declarado é o caso em que **falta pouco tempo** para bater a meta, daí o estado `apertado` (sobra menos de 30 dias por consulta faltante) e a fila ordenada por prazo.

**How to apply:** o gráfico tem 3 leituras — barras por critério, distribuição de pontuação (0,00…1,00, igual à coluna do relatório) e fila por prazo. Ao estender para gestante, criar nova lista de critérios + `avaliarX()` irmão. **Notificação hoje é só painel recalculado na abertura** — e-mail automático (node-cron + nodemailer) é fase 2 e ele sabe.

**⚠️ LGPD:** avisei que o desenho atual NÃO serve para paciente real — `pacientes.json` é versionado no Git e vai pro GitHub pelo sync, senha única sem usuário individual, sem log de acesso. Dado de saúde é sensível (art. 11). Se ele quiser usar de verdade: tirar do Git, Postgres/Supabase (o do CRM já serve), login por pessoa. Enquanto for demo fictícia, ok.

**Deploy (21/08/2026):** repo local iniciado e commitado (2 commits). Falta criar `tavaresmatias/josianetavares` **privado** no GitHub — não consegui, `gh` não está instalado nesta máquina e SSH autentica como `carlosxaviermatias`. Comandos de push prontos no handoff.
