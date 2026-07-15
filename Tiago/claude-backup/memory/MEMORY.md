# Memory Index

## Projetos Ativos

- [Projeto Jonathan](project_jonatan.md) — Site Dr. Jonatan (fonoaudiólogo) em /Jonatan Bandeira/site-jonatan/, repo tavaresmatias/jonatanbandeira; **GitHub sync ✅ implementado e testado (2026-06-08)**
- [GitHub Sync Setup](github_sync_setup.md) — Feature completa: painel auto-commita edições de volta ao GitHub para não perder em deploy
- [Projeto Painel](project_painel.md) — Sistema interno em Tiago/painel/, deploy TrueNAS SCALE, 4 fases
- [Painel DataJud](project_painel_datajud.md) — Fase 2: processos direto no DataJud (CNJ); pendente periódico+e-mail+resumo IA
- [Concursos Polícia](project_concursos_policia.md) — Site de notícias automático de concursos (polícia/segurança) em Tiago/concursos-policia/; pipeline coleta→IA→publica, rodando em mock
- [Curso Fotografia](project_curso_fotografia.md) — Site de estudos do curso "Fotografia Digital com Smartphone" (200h, SENAI/Firjan) em Tiago/curso-fotografia/; Tiago é o instrutor; site estático criado 2026-06-09
- [CRM Advogado](project_crm_advogado.md) — Funil comercial; migração Python→Node.js **COMPLETA** (roadmap A→F) no ar em tiagotavares.adv.br/crm; ⚠️ LER [[crm_dois_sistemas]] PRIMEIRO
- [CRM - DOIS Sistemas + Migração Node](crm_dois_sistemas.md) — ⚠️ leitura pra retomar o CRM Node em produção. **✅ ROADMAP A→F COMPLETO (2026-07-04)**: Postgres/Supabase (projeto `crm-tiago`) · funil+cadastro+docs+tags · propostas+assinatura (PDF/pdfkit+e-mail/nodemailer) · painel Início/Tarefas/Anotações · Contatos · Processos+DataJud/CNJ · Google Agenda+Contatos (OAuth) · sessão persistente+senha via env. Tudo deployado e verificado em produção. Senha painel `tiago2026`

## Referências Externas

- [Clieent CRM - Exploração Completa](crm_clieent_full_exploration.md) — CRM para advogados (app.clieent.com); **273 clientes, 11 propostas, 92 tarefas, 59 oportunidades**; 13 seções exploradas (Banco de Clientes, Propostas, Oportunidades, Tarefas, Documentos, Relatórios, etc); design: roxo/indigo primária, verde fluorescente para números; integração com WhatsApp; chat integrado

- [Clieent CRM - Formulário de Cliente](crm_clieent_customer_form.md) — Cadastro PESSOA FÍSICA (completo) e PESSOA JURÍDICA (não explorado); 40+ campos incluindo: Responsável, Nome, CPF/RG, Data Nascimento, Gênero, Estado Civil, Escolaridade, Profissão, Cargo, Telefone/Celular (N+), E-mail (N+), Redes Sociais (N+), Endereço Completo com CEP/Estado/Cidade, 5 tipos de Documentos (upload), Tags opcionais; Editor de texto rico para observações; Múltiplas instâncias de campos dinâmicos

- [Clieent CRM - Formulário de Proposta](crm_clieent_proposal_form.md) — Criar nova proposta; **8+ templates** especializados (Escritura de Permuta, Alvará, Ambiental, Análise de Documentação, Averbação, Certidões, Compra/Venda); Campos: Tema, Oportunidade, Cliente, E-mail/WhatsApp, Tipo, Vencimento, Link; Valores com desconto dinâmico; **2 formatos**: Arquivo (PDF) vs Online (link); Integração WhatsApp; Workflow "Cadastrar e Prosseguir"
  
## Suporte

- [Deploy Hostinger Node](hostinger_node_deploy.md) — Sites Node (Jonatan/Romalha) rodam como Web App conectado ao GitHub na Hostinger (deploy auto por push); NÃO SSH/PM2/Actions
- [Comandos de Deploy](feedback_deploy_commands.md) — "deploy Jonathan" e "deploy Tiago" fazem git push
- [Backup Painel](backup_painel.md) — Backup rotativo 20 min, máx. 10, Mac (launchd) + TrueNAS (cron)
- [Teste de Ponta a Ponta](feedback_teste_ponta_a_ponta.md) — py_compile não basta p/ rotas com I/O (upload, sockets); exigir teste HTTP real antes de declarar "testado"
