---
name: crm_clieent_full_exploration
description: "Exploração completa do CRM Clieent (app.clieent.com) - todas seções, interfaces e funcionalidades"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 6bb0fcdd-94f6-4516-81a2-25c22bb37581
---

# Clieent® CRM - Exploração Completa

## Overview
- **URL**: https://app.clieent.com
- **Tipo**: CRM especializado para advogados
- **Usuário de teste**: Romalha (Romalha Pereira)
- **Total de Clientes**: 273
- **Status**: Sistema funcional com dados reais de trabalho

---

## Menu Principal (Sidebar Completo)

### Seções Principais (20 itens)
1. **Início** (`/`) - Dashboard com KPIs
2. **Notificações** (`/notification`) - 932 notificações
3. **Banco de Clientes** (`/stakeholder`) - 273 clientes
4. **Propostas Rastreáveis** (`/proposal`) - Propostas comerciais
5. **Jornada de Conversão** (`/conversion-journey`) - Premium (R$ 19,90/mês)
6. **Assinatura de Documentos** (`/document`) - Contratos digitais
7. **Oportunidades** (`/opportunity/flow`) - 59 oportunidades ativas
8. **Páginas de captura** (`/landing-page`) - Landing pages
9. **Tarefas** (`/reminder`) - 92 tarefas pendentes
10. **Mensagens** (`/message/template`) - Templates e chat
11. **Campanhas de atração** (`/campaign`) - Marketing (vazio)
12. **Metas** (`/goal`) - Goal tracking (educacional)
13. **Relatórios** (`/bi`) - 3 relatórios BI
14. **Mais Recursos** - Recursos adicionais
15. **Meu Negócio** - Configurações
16. **Meu Perfil** - Perfil do usuário
17. **Treinamento & Ajuda** - Help
18. **Contrato e termos** - Legal
19. **Privacidade** - Privacy policy
20. **Sair** - Logout

---

## Seções Detalhadas (Exploradas)

### Dashboard Principal
**KPIs:**
- Propostas Emitidas (30D): 11
- Documentos Emitidos (30D): 0

**Tarefas para Hoje:**
- Com data/hora específicas
- Oportunidades vinculadas
- Status "CONCLUIR"
- Ações: WhatsApp, notação

### Banco de Clientes (273 clientes)
- Cards com: Avatar, Nome, Propostas, Responsável
- Filtros: Tags, Busca
- Exemplos: ADJAIME JULIANO SANTOS, ADRIANA CARVALHO FRIEDHEIM

### Propostas Rastreáveis
**Tabela com:**
- NÚMERO (20260601, 20260610, etc)
- STATUS (ABERTA)
- EMISSÃO / EXPIRAÇÃO
- Período visualizado: ABR, MAI, JUN 2026
- Validade: ~10 dias

### Oportunidades/Fluxos
- Pasta: "FLUXO DE VENDAS" (1 fluxo, 0 sub-pastas)
- Fluxo: "FLUXO PROSPECÇÃO DE CLIENTE"
  - Lider: Romalha
  - Oportunidades Ativas: 59

### Tarefas
**Filtros:**
- HOJE
- PROGRAMADAS: 1
- TODAS: 93
- ATRASADAS: 9+

**Campos:**
- Data, Hora
- Cliente (dropdown)
- Mensagem (editor rico)
- Lembrete para equipe

### Assinatura de Documentos
**Colunas:**
- STATUS (EM PROGRESSO, ASSINADO)
- CRIADO POR (Romalha Pereira)
- CRIADO EM (data)
- TÍTULO (Contratos de Honorários, Prestação de Serviços)
- ASSINATURA (status colorido)

**Documentos:**
- Contrato de Honorários - EM PROGRESSO - 12/07/24
- Contrato de Prestação de Serviços - EM PROGRESSO - 03/07/23
- Contrato de Honorários Advocacios - EM PROGRESSO - 22/06/23
- Contrato de Honorários (2023006003) - ASSINADO - 18/06/23

### Relatórios (BI)
1. **Aniversariantes** - Clientes aniversariantes
2. **Resumo Diário** - Atividades do dia
3. **LTV - Life Time Value** - Valor de vida do cliente

### Jornada de Conversão
- Premium (R$ 19,90/mês)
- Permite criar jornadas de conversão
- Vídeo demonstrativo disponível

### Metas
- Título: "Chegou a hora de definir metas!"
- Tutorial em vídeo: "Como criar uma Meta"
- Seção de metas encerradas

### Campanhas
- Vazio (sem registros)
- Filtros: Data início/fim (29/05/2026 a 29/06/2026)

---

## Design & UX

**Cores:**
- Roxo/Indigo - Headers, botões principais, titles
- Verde fluorescente - Números, status OK
- Rosa - Badges, botões de ação
- Azul claro - Avatares status
- Cinza - Textos secundários

**Componentes:**
- Cards com sombra
- Buttons com border-radius
- Avatares coloridos com iniciais
- Badges arredondados
- Icons lineares

---

## Chat Integrado
- Widget em várias páginas
- Suporte: Felipe
- Mensagem onboarding sobre relatórios

---

## Funcionalidades (Resumo)

✅ 273 Clientes cadastrados
✅ 11 Propostas em junho
✅ Assinatura Digital de Documentos
✅ 59 Oportunidades ativas
✅ 92 Tarefas pendentes
✅ 3 Relatórios BI
✅ Chat integrado
⚠️ Jornada de Conversão (premium)
⚠️ Campanhas (vazio)

---

## Tecnologia

**URLs:** RESTful com paths descritivos
**Front-end:** Vue.js ou React
**Features:** Editor texto rico, date pickers, dropdowns, responsivo
**Backend:** Autenticação, notificações, chat, documentos, API REST
