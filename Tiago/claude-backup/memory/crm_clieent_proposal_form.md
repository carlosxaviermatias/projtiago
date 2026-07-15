---
name: crm_clieent_proposal_form
description: "Formulário completo de Criar Nova Proposta do Clieent CRM - campos, templates e estrutura"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 6bb0fcdd-94f6-4516-81a2-25c22bb37581
---

# Clieent CRM - Formulário de Criar Nova Proposta

## Visão Geral
- **URL**: `/proposal?register=-`
- **Título**: "Criar nova Proposta"
- **Descrição**: "propostas comerciais representam o movimento da empresa."

---

## Estrutura de Layout (2 Colunas)

### Coluna Esquerda - Templates/Temas
Lista de modelos de propostas disponíveis (scroll verticalmente):

1. **ESCRITURA DE PERMUTA**
2. **ALVARÁ**
3. **AMBIENTAL**
4. **ANÁLISE DE DOCUMENTAÇÃO**
5. **AVERBAÇÃO**
6. **CERTIDÕES**
7. **CERTIDÕES PARA LAVRAR ESCRITURA PÚBLICA DE COMPRA E VENDA** (exemplo selecionado)
8. ... (mais templates)

*Cada template pode ser clicado para selecionar e preencher a proposta*

### Coluna Direita - Formulário da Proposta

---

## Campos do Formulário

### Informações Básicas
- **Selecione: Tema** (dropdown) - Carrega template selecionado
- **Selecione: Oportunidade de Origem** (dropdown) - Vincula a oportunidade
- **Selecione: Cliente** (dropdown) - Obrigatório, identificar cliente

### Contato
- **E-mail de destinatário** (campo de texto)
- **Whatsapp de destinatário** (campo de texto)

### Detalhes da Proposta
- **Selecione: Tipo** (dropdown) - Tipo de proposta
- **Data de vencimento** (data com máscara DD/MM/YY)
- **Link de Redirecionamento** (URL/campo de texto)

### Valores
- **Subtotal**: R$ 0 (calculado)
- **Desconto**: R$ 0 (editável)
  - Link "APLICAR DESCONTO" (roxo)
- **Valor final**: R$ 0 (calculado após desconto)

### Formato de Apresentação
- **Seção: "ESCOLHA O FORMATO DE APRESENTAÇÃO"**
  - **PROPOSTA COM ARQUIVO** (botão com ícone de arquivo/documento)
  - **PROPOSTA ONLINE** (botão com ícone de link/world)

### Opções de Pagamento
- **Link: "OPÇÕES DE PAGAMENTO"** (roxo, clicável)
- Permite configurar formas de pagamento

---

## Botões de Ação

### Primários
- **CADASTRAR** (roxo/indigo, destacado) - Salva a proposta
- **CADASTRAR E PROSSEGUIR** (roxo, texto link) - Salva e continua para próxima etapa

### Secundários
- **VOLTAR** (vermelho, canto superior direito) - Cancela e volta

---

## Fluxo de Criação de Proposta

1. **Selecionar Template** (esquerda)
   - Carrega campos padrão
   - Preenche estrutura base

2. **Preencher Informações** (direita)
   - Tema
   - Cliente
   - Oportunidade
   - Contatos (e-mail, WhatsApp)
   - Tipo
   - Vencimento
   - Link redirecionamento

3. **Configurar Valores**
   - Subtotal (padrão do template)
   - Aplicar desconto (opcional)
   - Revisar valor final

4. **Escolher Formato**
   - Com Arquivo (PDF, documento)
   - Online (link compartilhável)

5. **Configurar Pagamento** (opcional)
   - Opções de pagamento
   - Termos e condições

6. **Salvar**
   - Cadastrar apenas
   - Ou Cadastrar e Prosseguir (edição avançada)

---

## Características Principais

### Templates Especializados para Advocacia
- Escrituras (Permuta, Compra e Venda)
- Certidões e Documentação
- Averbações
- Análises Jurídicas
- Alvarás
- Ambiental

### Flexibilidade de Apresentação
- 2 opções de formato (arquivo vs online)
- Link de redirecionamento customizável
- WhatsApp integrado para compartilhamento

### Gestão de Valores
- Subtotal baseado em template
- Desconto aplicável
- Cálculo automático

### Integração com CRM
- Vinculação com Cliente
- Vinculação com Oportunidade
- Rastreamento de contatos

---

## Dados Observados no Exemplo

- **Template Selecionado**: CERTIDÕES PARA LAVRAR ESCRITURA PÚBLICA DE COMPRA E VENDA
- **Números de Propostas Recentes**: 20260601, 20260610, 20260609, 20260608, 20260607, 20260606, 20260605
- **Padrão**: Propostas numeradas por data (202606XX para junho 2026)
- **Status Padrão**: ABERTA (após criar)
- **Período Padrão**: 10 dias (emissão para expiração)

---

## Comparação com CRM Local

**Funcionalidades não observadas em CRM local:**
1. ✗ Templates de propostas por tipo (Escritura, Alvará, etc)
2. ✗ Escolha entre formato arquivo vs online
3. ✗ Link de redirecionamento customizável
4. ✗ Integração com WhatsApp direto na proposta
5. ✗ Desconto aplicável na proposta
6. ✗ Opções de pagamento configuráveis

**Similares:**
- ✓ Vinculação com Cliente
- ✓ Valores/Preços
- ✓ Data de vencimento
- ✓ Rastreamento/Status

---

## Potencial de Inspiração

1. **Templates Reutilizáveis** - Sistema de templates por tipo de serviço
2. **Múltiplos Formatos** - Exportar como arquivo ou link
3. **Integração WhatsApp** - Compartilhamento direto
4. **Desconto Dinâmico** - Aplicar desconto e recalcular
5. **Workflow Multi-Etapa** - "Cadastrar e Prosseguir" para edição avançada
6. **Especialização por Ramo** - Templates específicos para advocacia

---

## Campos Obrigatórios (Inferido)
- Cliente * (necessário para proposta válida)
- Tema * (para usar template)
- Data de vencimento (provavelmente obrigatória)

## Campos Opcionais
- Oportunidade de Origem
- Desconto
- Link de Redirecionamento
- Configuração de Pagamento
