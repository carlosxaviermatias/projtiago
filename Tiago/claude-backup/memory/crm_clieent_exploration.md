---
name: crm_clieent_exploration
description: "Exploração do CRM Clieent (app.clieent.com) - interface, estrutura e funcionalidades"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 6bb0fcdd-94f6-4516-81a2-25c22bb37581
---

# Clieent® CRM - Exploração

## Overview
- **URL**: https://app.clieent.com
- **Tipo**: CRM especializado para advogados
- **Usuário de teste**: Romalha
- **Status**: Sistema funcional com dados de teste

## Interface & Menu Principal

### Topbar
- Avatar + nome do usuário
- Botões rápidos: "Mensagens" e "Resumo Pessoal"

### Sidebar (Menu esquerdo)
Seções principais (completo):
1. **Início** - Dashboard com KPIs
2. **Notificações** - 932 notificações pendentes (badge atualizado)
3. **Banco de Clientes** - CRM de stakeholders/clientes
4. **Propostas Rastreáveis** - Gestão de propostas
5. **Jornada de Conversão** - Funil de vendas
6. **Assinatura de Documentos** - Integração de assinatura
7. **Oportunidades** - Pipeline de negócios
8. **Páginas de captura** - Landing pages/formulários
9. **Tarefas** - 92 tarefas pendentes (badge atualizado)
10. **Mensagens** - Chat/comunicação
11. **Campanhas de atração** - Marketing campaigns
12. **Metas** - Goal tracking
13. **Relatórios** - Analytics e reports

### Seções Adicionais (Footer/Expandidas)
14. **Mais Recursos** - Seção de recursos adicionais
15. **Meu Negócio** - Configurações da empresa/negócio
16. **Meu Perfil** - Perfil do usuário
17. **Treinamento & Ajuda** - Help e onboarding
18. **Contrato e termos de uso** - Legal docs
19. **Política de Privacidade** - Privacy policy
20. **Sair** - Logout

## Dashboard (Início)

### KPIs Exibidos
- **Propostas Emitidas (30D)**: 11
- **Documentos Emitidos (30D)**: 0

### Tarefas para Hoje
- Exemplo: "31/08/2023 às 15:30"
- Status: "CONCLUIR" (botão verde)
- Oportunidade vinculada
- Descrição: "Entrar em contato urgente com novo potencial cliente..."
- Ações: WhatsApp, notação manual

## Banco de Clientes (/stakeholder)

### Filtros & Busca
- Abas: "ENTES" (clientes) + outras
- Campo de busca: "Pesquisar cliente por nome"
- Filtro por Tags
- Botão "Novo Registro" (azul)

### Cards de Cliente
Estrutura:
- Avatar com iniciais (ex: "Ic")
- Nome do cliente (ex: "[TESTE] client® CRM")
- Número de propostas (ex: "0")
- Responsável (ex: "Romalha")
- Ícone de ação/edição (lápis)

## Identidade Visual
- **Cores principais**:
  - Roxo/Indigo (botões, links, highlights)
  - Verde fluorescente (números, status OK)
  - Rosa/Vermelho (badges, notificações)
  - Verde claro (avatares/ícones)
  
- **Tipografia**: Sans-serif moderna
- **Ícones**: Lineares coloridos

## Funcionalidades Identificadas (não explorado em profundidade)

- [ ] Gestão de clientes com relacionamento
- [ ] Propostas e rastreamento
- [ ] Assinatura digital de documentos
- [ ] Jornada de conversão (funil)
- [ ] Tarefas com data/hora
- [ ] Notificações
- [ ] Mensagens integradas
- [ ] Campanhas de marketing
- [ ] Relatórios e analytics
- [ ] Metas/KPIs

## Clientes Reais no Sistema
Exemplos de dados encontrados:
- ADJAIME JULIANO SANTOS - 1 proposta - Responsável: Romalha
- ADRIANA CARVALHO FRIEDHEIM - 1 proposta - Responsável: Romalha

## Estrutura de Dados do Cliente
Cada cliente possui:
- Nome
- Foto/Avatar com iniciais
- Número de propostas
- Responsável/Owner (pode ser Romalha ou outros)

## Próximas áreas para explorar
(Não explorado ainda - para investigação futura)
- Propostas Rastreáveis (detalhe de propostas)
- Jornada de Conversão (funil detalhado com etapas)
- Assinatura de Documentos (integração, workflow)
- Oportunidades (pipeline de negócios)
- Tarefas (visão completa, tipos de tarefa)
- Mensagens (chat integrado)
- Campanhas (tipos de campanhas)
- Relatórios (métricas e KPIs)
- Integração com WhatsApp
- Integração com Google Contacts/Calendar
- Páginas de Captura (landing pages)
- Metas (como funciona o tracking)
- Notificações (tipos e triggers)
