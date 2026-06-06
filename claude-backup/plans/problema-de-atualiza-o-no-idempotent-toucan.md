# Contexto

O OneDrive está com problema de sincronização/atualização. A causa mais provável são arquivos ocultos do macOS (`.DS_Store`) e a pasta duplicada **"Antigravity - cópia"** que contém os mesmos arquivos da pasta original **"Antigravity"**. O OneDrive tenta sincronizar todos esses arquivos e conflita, especialmente com `.DS_Store` que o Mac recria constantemente.

## Arquivos/pastas problemáticos identificados

### 1. Arquivos `.DS_Store` (8 arquivos) — causam conflito constante no OneDrive
Criados automaticamente pelo macOS, o OneDrive tenta sincronizá-los mas o Mac os recria, gerando loop:
- `Antigravity/.DS_Store`
- `Antigravity/Site principal/.DS_Store`
- `Antigravity/Site links/.DS_Store`
- `Antigravity/Jonatan Bandeira/.DS_Store`
- `Antigravity/Jonatan Bandeira/site-jonatan/.DS_Store`
- `Antigravity/Site principal/romalha/.DS_Store`
- `Antigravity - cópia/.DS_Store`
- `Antigravity - cópia/Site links/.DS_Store`
- `Antigravity - cópia/Site principal/.DS_Store`

### 2. Pasta `Antigravity - cópia` — duplicata desnecessária
Cópia da pasta Antigravity original, com os mesmos arquivos + um `.claude/settings.local.json` perdido. Não tem valor adicional e dobra o trabalho do OneDrive.

### 3. `.vscode/settings.json` dentro de Antigravity — arquivo de config de editor
Não tem utilidade no OneDrive, só gera ruído na sincronização.

### 4. `Site principal.zip` dentro de Antigravity — zip do conteúdo já existente na pasta
O arquivo `Site principal.zip` é um backup da pasta `Site principal/` que já existe ao lado. Duplicata de 3,7MB.

## Plano de execução

1. **Excluir todos os `.DS_Store`** dentro de Antigravity e "Antigravity - cópia"
2. **Excluir a pasta `Antigravity - cópia`** inteira (é uma cópia desatualizada e menos completa que a original)
3. **Excluir `.vscode/`** dentro de Antigravity
4. **Excluir `Site principal.zip`** dentro de Antigravity (pasta já existe)

## Verificação

Após as exclusões, verificar que o OneDrive não tem mais erros de sincronização abrindo o app do OneDrive na barra de menu e confirmando que não há conflitos.
