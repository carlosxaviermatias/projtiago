# Memory Index

## Projetos Ativos

- [Caso Carlos Castilho](project_carlos_castilho.md) — Revisional + superendividamento; aposentado INSS com consignados abusivos (cartões RMC/RCC que não amortizam, seguro embutido, desconto associativo); pasta Desktop/KAKÁ - RENATA
- [Embargo Giseli](project_embargo_giseli.md) — Embargos de terceiro (Fiat/Palio, contrato de gaveta) + inventário em Além Paraíba/MG; **liminar indeferida 29/07; manifestação de terceira interessada protocolada no inventário em 13/08/2026**; ⚠️ contém decisões táticas a manter (o que NÃO citar/juntar)
- [Orçamento Demarcatória](project_orcamento_demarcatoria.md) — cerca do vizinho fora da divisa; proposta pronta no Desktop (1º grau R$ 17.500 + 15% de êxito); ⚠️ apurar há quanto tempo a cerca está lá (risco de usucapião) antes de assinar
- [Projeto Jonathan](project_jonatan.md) — Site Dr. Jonatan (fonoaudiólogo) em /Jonatan Bandeira/site-jonatan/, repo tavaresmatias/jonatanbandeira; **GitHub sync ✅ implementado e testado (2026-06-08)**
- [GitHub Sync Setup](github_sync_setup.md) — Feature completa: painel auto-commita edições de volta ao GitHub para não perder em deploy
- [Sistema Enfermagem](project_sistema_enfermagem.md) — puericultura na área restrita do site da Josiane; **checklist de contadores (5 critérios × 0,20), sem peso/altura** — reescrito 21/08/2026; ⚠️ LER SISTEMA-ENFERMAGEM.md e o aviso de LGPD antes de usar com paciente real
- [Site Josiane (enfermeira)](project_site_josiane.md) — drajosianetavares.com.br; site informativo de saúde da mulher (Node+Express, painel em /admin, afiliados); ⚠️ só SUS, sem agendamento e sem WhatsApp
- [Projeto Painel](project_painel.md) — Sistema interno em Tiago/painel/, deploy TrueNAS SCALE, 4 fases
- [Painel DataJud](project_painel_datajud.md) — Fase 2: processos direto no DataJud (CNJ); pendente periódico+e-mail+resumo IA
- [Concursos Polícia](project_concursos_policia.md) — Site de notícias automático de concursos (polícia/segurança) em Tiago/concursos-policia/; pipeline coleta→IA→publica, rodando em mock
- [Curso Fotografia](project_curso_fotografia.md) — Site de estudos do curso "Fotografia Digital com Smartphone" (200h, SENAI/Firjan) em Tiago/curso-fotografia/; Tiago é o instrutor; site estático criado 2026-06-09
- [FotoLab (editor de imagens)](project_curso_fotografia_editor.md) — editor estilo Photoshop no site do curso; ⚠️ o repo `lightdrift-libraw` que ele mandou copiar é addon de servidor e não servia; **no ar** em fotografia.tiagotavares.com.br/editor.html
- [FotoQuest 2D](project_curso_fotografia_jogo2d.md) — Jogo com 20 fases, fotômetro/visor como capacidade da câmera, direção de cena; armadilhas de teste e desbloqueio retroativo
- [CRM Advogado](project_crm_advogado.md) — Funil comercial; migração Python→Node.js **COMPLETA** (roadmap A→F) no ar em tiagotavares.adv.br/crm; ⚠️ LER [[crm_dois_sistemas]] PRIMEIRO
- [CRM - DOIS Sistemas + Migração Node](crm_dois_sistemas.md) — ⚠️ leitura pra retomar o CRM Node em produção. **✅ ROADMAP A→F COMPLETO (2026-07-04)**: Postgres/Supabase (projeto `crm-tiago`) · funil+cadastro+docs+tags · propostas+assinatura (PDF/pdfkit+e-mail/nodemailer) · painel Início/Tarefas/Anotações · Contatos · Processos+DataJud/CNJ · Google Agenda+Contatos (OAuth) · sessão persistente+senha via env. Tudo deployado e verificado em produção. Senha painel `tiago2026`

- [OneDrive: domínio órfão no Mac](project_onedrive_dominio_orfao.md) — ⚠️ 40 pastas invisíveis no Finder (inclui `01.CLIENTES`) por File Provider órfão de instalação antiga; **8,4 GB nunca sincronizados resgatados em ~/Documents/FORA-DO-ONEDRIVE** (cópia única!); reset da Microsoft NÃO resolve (2026-07-29)
- [tiagotavares.com.br → redirect](project_tiagotavares_combr_redirect.md) — WordPress abandonado, domínio vira alias/redirect 301 pra tiagotavares.adv.br; ⚠️ e-mail da UOL NUNCA mexer (só registros A)
- [Sync Clientes → Servidor](project_sync_clientes_servidor.md) — cópia automática de `~/OneDrive/01.CLIENTES` pro TrueNAS via LaunchAgent; ⚠️ **falta dar Acesso Total ao Disco pro `/bin/zsh`**, sem isso o launchd não roda
- [TrueNAS: Immich + GPU](project_truenas_immich.md) — ⚠️ **NÃO atualizar o app Immich** (banco preso no Postgres 15, app fixado na 1.13.6) · GTX 1050 Ti é incompatível (Pascal sem GSP) · pool HD2T OFFLINE é normal, é HD externo · macetes de API/Shell do TrueNAS

## Referências Externas

- [Tabela OAB/RJ 2025](reference_tabela_oab_rj.md) — PDF em ~/Desktop/tabela oab rj.pdf; pisos já conferidos (demarcatória 9.20 = R$ 12.000, reivindicatória, usucapião, apelação, perícia) + regra dos 20% do valor econômico; ⚠️ ler com pypdf, não há pdftotext no Mac

- [Clieent CRM - Exploração Completa](crm_clieent_full_exploration.md) — CRM para advogados (app.clieent.com); **273 clientes, 11 propostas, 92 tarefas, 59 oportunidades**; 13 seções exploradas (Banco de Clientes, Propostas, Oportunidades, Tarefas, Documentos, Relatórios, etc); design: roxo/indigo primária, verde fluorescente para números; integração com WhatsApp; chat integrado

- [Clieent CRM - Formulário de Cliente](crm_clieent_customer_form.md) — Cadastro PESSOA FÍSICA (completo) e PESSOA JURÍDICA (não explorado); 40+ campos incluindo: Responsável, Nome, CPF/RG, Data Nascimento, Gênero, Estado Civil, Escolaridade, Profissão, Cargo, Telefone/Celular (N+), E-mail (N+), Redes Sociais (N+), Endereço Completo com CEP/Estado/Cidade, 5 tipos de Documentos (upload), Tags opcionais; Editor de texto rico para observações; Múltiplas instâncias de campos dinâmicos

- [Clieent CRM - Formulário de Proposta](crm_clieent_proposal_form.md) — Criar nova proposta; **8+ templates** especializados (Escritura de Permuta, Alvará, Ambiental, Análise de Documentação, Averbação, Certidões, Compra/Venda); Campos: Tema, Oportunidade, Cliente, E-mail/WhatsApp, Tipo, Vencimento, Link; Valores com desconto dinâmico; **2 formatos**: Arquivo (PDF) vs Online (link); Integração WhatsApp; Workflow "Cadastrar e Prosseguir"
  
## Suporte

- [Deploy Hostinger Node](hostinger_node_deploy.md) — Sites Node (Jonatan/Romalha) rodam como Web App conectado ao GitHub na Hostinger (deploy auto por push); NÃO SSH/PM2/Actions
- [Comandos de Deploy](feedback_deploy_commands.md) — "deploy Jonathan" e "deploy Tiago" fazem git push
- [Backup Painel](backup_painel.md) — Backup rotativo 20 min, máx. 10, Mac (launchd) + TrueNAS (cron)
- [Teste de Ponta a Ponta](feedback_teste_ponta_a_ponta.md) — py_compile não basta p/ rotas com I/O (upload, sockets); exigir teste HTTP real antes de declarar "testado"
- [Endereçamento de Peças](feedback_enderecamento_pecas.md) — ⚠️ usar "DOUTO JUÍZO FEDERAL DA ..."; NUNCA "Excelentíssimo Senhor Doutor Juiz", mesmo que o arquivo-modelo traga assim
