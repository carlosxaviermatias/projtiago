---
name: crm_clieent_customer_form
description: "Formulário completo de Cadastro de Cliente do Clieent CRM - campos, seções e estrutura"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 6bb0fcdd-94f6-4516-81a2-25c22bb37581
---

# Clieent CRM - Formulário de Cadastro de Cliente

## Visão Geral
- **URL**: `/stakeholder?register=-`
- **Título**: "Registro de Cliente"
- **Descrição**: "O registro de pessoas e empresas compõe todo o seu banco de dados de stakeholders, ou seja, são seus clientes, fornecedores, parceiros e qualquer outra pessoa ou empresa que se relaciona com o seu negócio."

---

## Abas (2 tipos de cadastro)

### 1. PESSOA FÍSICA ✓ (Explorada)
Campos para cadastro de pessoa natural

### 2. PESSOA JURÍDICA
Campos para cadastro de empresa (não explorada)

---

## Campos - PESSOA FÍSICA

### Responsabilidade & Vinculação
- **Selecione: Responsável** * (dropdown) - Ex: Romalha Pereira
- **Vincular com Cliente da Base** (dropdown)
- **Código interno** (texto)

### Identificação Pessoal
- **Nome completo** * (texto, obrigatório)
- **Apelido** (texto)
- **Data de Nascimento** (data com máscara __/__/__)
- **CPF** (número com máscara)
- **RG** (número)
- **Selecione: Gênero** (dropdown)

### Informações Adicionais
- **Selecione: Estado Civil** (dropdown)
- **Selecione: Escolaridade** (dropdown)
- **Selecione: Profissão** (dropdown)
- **Cargo** (texto)

### Informações Extras
- **Editor de Texto Rico** (similar a tarefas)
  - Formatação: Fonte (16px), B, I, U, Strikethrough
  - Barlow font selector
  - Highlight, Listas, Links, Quote, Code, etc.

### Contato - Telefone
- **Telefone ou celular?** (label)
- **Número Telefone/celular** (campo)
- **Descrição** (ex: operadora)
- Link: "Clique aqui para inserir mais um número"

### Contato - E-mail
- **E-mail** (campo)
- **Descrição** (campo)
- Link: "Clique aqui para inserir mais um e-mail"

### Redes Sociais
- **Rede social** (dropdown/campo)
- **Link da Rede social** (URL)
- Link: "Clique aqui para inserir mais uma Rede social"

### Endereço Completo
- **CEP** (máscara numérica)
- **Selecione: Estado** (dropdown)
- **Selecione: Cidade** (dropdown)
- **Endereço** (texto)
- **Número** (número/texto)
- **Bairro** (texto)
- **Complemento** (texto)
- **Descrição** (texto)

### Documentos/Arquivos Necessários

#### Para Pessoa Física
1. **CONTRATO SOCIAL** - "Nenhum arquivo escolhido"
2. **CNH, RG OU CPF** - "Nenhum arquivo escolhido"
3. **COMPROVANTE DE RESIDÊNCIA** - "Nenhum arquivo escolhido"
4. **COMPROVANTE DE RECEBIMENTO** - "Nenhum arquivo escolhido"
5. **CERTIDÃO DE CASAMENTO** - "Nenhum arquivo escolhido"

### Tags para Cliente

**Descrição**: "Você pode escolher tags para este cliente. As tags ajudam a identificar mais facilmente características e comportamentos do seu cliente na hora de realizar um bom atendimento, apesar disso, elas são opcionais."

**Tags Disponíveis:**
- ☐ Desmembramento ✓
- ☐ Inventário
- ☐ Legalização de ✓
- ☐ Negociação
- ☐ Usucapião

*Nota: Alguns pré-selecionados no exemplo visto*

---

## Botões

- **CADASTRAR** (roxo/indigo, destacado, submete o formulário)
- **VOLTAR** (canto superior direito em vermelho)

---

## Estrutura de Dados Observada

### Padrões de UI
- Campos obrigatórios marcados com * (asterisco)
- Dropdowns com busca/seleção
- Máscaras de entrada (data, CPF, CEP)
- Upload de arquivos com status "Nenhum arquivo escolhido"
- Links dinâmicos para adicionar múltiplos valores (telefone, e-mail, redes sociais)
- Checkboxes para tags opcionais
- Editor de texto rico reutilizável

### Campos Reutilizáveis em Múltiplas Instâncias
- Telefone/Celular (N+)
- E-mail (N+)
- Rede Social (N+)
- Documentos (5 tipos fixos)

### Validação
- Nome completo é obrigatório (*)
- Responsável é obrigatório (*)
- Demais campos são opcionais

---

## Comparação com CRM Desenvolvido Localmente

**Semelhanças esperadas:**
- Campos de cliente (nome, telefone, e-mail)
- Documentos/arquivos
- Estatísticas de propostas por cliente

**Diferenciais do Clieent:**
- Abas para Pessoa Física vs Jurídica
- Editor de texto rico para observações
- Upload de múltiplos documentos
- Tags para categorização
- Integração com "Vincular com Cliente da Base"
- Endereço completo com CEP/Estado/Cidade
- Múltiplos telefones, e-mails, redes sociais
- Campos detalhados (Escolaridade, Estado Civil, Profissão, Gênero)
- Editor de texto integrado (WYSIWYG)

---

## Potencial de Inspiração para CRM Local

O formulário é muito completo e bem estruturado. Principais aprendizados:
1. **Suporte a múltiplas instâncias** de campos (telefone, e-mail, redes)
2. **Editor de texto rico** para anotações
3. **Validação clara** (campos obrigatórios marcados)
4. **Organização em abas** por tipo de cliente
5. **Tags opcionais** para categorização rápida
6. **Upload de documentos** com tipos específicos
7. **Endereço completo** (CEP/Estado/Cidade/Número/Bairro)
8. **Responsável atribuído** (integração com usuários)
9. **Código interno** para referência
10. **Links dinâmicos** para adicionar mais campos
