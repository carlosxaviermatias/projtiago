---
name: feedback-deploy-commands
description: "Atalhos de deploy: \"deploy Jonathan\" e \"deploy Tiago\" executam git add/commit/push nos respectivos projetos"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 078e1b21-4c52-4a6e-9fd7-bf90ba877b53
---

Quando o usuário disser **"deploy Jonathan"**: fazer git add + commit + push na pasta `/Users/tiagotavares/Documents/github/Jonatan Bandeira/site-jonatan/` para o repositório `git@github.com:tavaresmatias/jonatanbandeira.git`.

Quando o usuário disser **"deploy Tiago"**: fazer git add + commit + push na pasta `/Users/tiagotavares/Documents/github/Tiago/` para o repositório `git@github.com:tavaresmatias/projtiago.git`.

**Why:** O usuário quer comandos curtos para fazer deploy sem precisar informar caminhos.

**How to apply:** Sempre que ouvir "deploy Jonathan" ou "deploy Tiago", executar automaticamente o fluxo completo de git add, commit e push no projeto correspondente. Não commitar PDFs nem ZIPs (já configurado no .gitignore do Tiago). Pedir mensagem de commit ou usar "update" como padrão.
