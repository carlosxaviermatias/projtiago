---
name: project-onedrive-dominio-orfao
description: "OneDrive no Mac com 40 pastas invisíveis por domínio File Provider órfão; 8,4 GB resgatados em ~/Documents/FORA-DO-ONEDRIVE"
metadata: 
  node_type: memory
  type: project
  originSessionId: a11993fd-0cf2-4663-866a-06070625cb88
  modified: 2026-07-29T19:08:00.330Z
---

**RESOLVIDO em 2026-07-29.** 40/40 pastas voltaram ao Finder (raiz saiu de 35 para 102 itens); disco de 95% para 83% (36 GB livres).

Diagnosticado em 2026-07-29. No Mac do Tiago, 40 pastas do OneDrive (entre elas `01.CLIENTES`, `Desktop`, `area de trabalho`, `AppData`, `ESCRITÓRIO`, `OAB - 2ª Fase`) não apareciam no Finder, embora existissem no Windows e no banco do OneDrive.

⚠️ **Pendência:** os 8,2 GB de `~/Documents/FORA-DO-ONEDRIVE/` (Romalha&Renee, 10850221, Antigravity, CNU) continuam existindo **só ali** — nunca estiveram na nuvem e não voltaram para a pasta do OneDrive. Tiago precisa decidir se sobe para o OneDrive ou guarda em disco externo.

**Causa raiz:** existem DOIS provedores File Provider registrados. O `~/Library/CloudStorage/OneDrive-Pessoal` está amarrado (via xattr `com.apple.file-provider-domain-id`) ao domínio **órfão** `com.microsoft.OneDrive.FileProvider` — de uma instalação antiga, cujo container `UBF8T346G9.OneDriveStandaloneSuite` não existe mais. O dump mostra `(⏹ extension not found)`, `(❔ app-ext not reachable)` e `extension backend: FPDDomainDeadEndBackend`. O provedor atual instalado, `com.microsoft.OneDrive-mac.FileProvider` (container `OneDriveSyncClientSuite`), está com `+ no root`.

Sintoma-assinatura: o Finder só mostra o cache velho (35 itens) e qualquer `mv` de diretório para fora dá **"Operation timed out"** — leitura de arquivo funciona normal (121 MB/s), porque ler materializado não precisa do provedor.

**⚠️ Dado resgatado:** 8,4 GB que NUNCA subiram pra nuvem estavam dentro da pasta quebrada e foram copiados (checksum SHA-256 conferido) para `~/Documents/FORA-DO-ONEDRIVE/`: `Romalha&Renee` (201 arq, cartão de câmera Sony em RAW/.ARW), `10850221` (184 arq), `Antigravity` (43 arq), `CNU` (vazia), `COLUNA 6 - ENTRE-RIOS JORNAL.docx`. Esses arquivos não existem em lugar nenhum além dessa cópia.

**O que NÃO resolve:** reiniciar o app; reiniciar o `fileproviderd`; e o `ResetOneDriveApp.command` da Microsoft — ele só mira `com.microsoft.OneDrive-mac.FileProvider`, nunca o órfão. Esse reset já foi rodado nessa máquina antes (prova: a extensão FinderSync está com `-`/ignore no `pluginkit`, que é o que a linha 36 do script faz).

**✅ SOLUÇÃO QUE FUNCIONOU (2026-07-29 16:05):** apagar a pasta-raiz do domínio órfão. O `fileproviderd` mantém um domínio morto vivo enquanto a pasta-raiz dele existir; sem raiz, ele desregistra sozinho — na hora, sem reboot.

O passo que trava e não está documentado em lugar nenhum: `rm -rf` falha com **Permission denied** porque o macOS põe ACLs de proteção na raiz de todo domínio File Provider:
```
OneDrive-Pessoal   0: group:everyone deny writeextattr
                   1: group:everyone deny delete
.Trash             0: group:everyone deny delete
```
Como dono, remova as ACLs primeiro e aí apague (`.Trash` interno tem ACL própria, precisa dos dois):
```
chmod -N ~/Library/CloudStorage/OneDrive-Pessoal/.Trash
chmod -N ~/Library/CloudStorage/OneDrive-Pessoal
rmdir ~/Library/CloudStorage/OneDrive-Pessoal/.Trash
rmdir ~/Library/CloudStorage/OneDrive-Pessoal
```
Efeito imediato: o órfão sumiu do `fileproviderctl dump`, o provedor vivo saiu de `no root` para `temporarily disconnected`, e o xattr do nome `OneDrive-Pessoal` passou a apontar para `com.microsoft.OneDrive-mac.FileProvider`.

Sequência completa: fechar OneDrive → `rm -rf` no conteúdo (apagou 24 GB de cache, disco 95%→83%) → `chmod -N` + `rmdir` na casca → `open -a OneDrive`.

Contexto: disco estava a 95% (12 GB livres) por causa da duplicação do resgate; foi para 83% / 36 GB livres.

Ferramentas úteis: `fileproviderctl dump -l` (não tem comando de remover domínio), `pluginkit -mAv | grep -i onedrive`, banco do OneDrive em `~/Library/Containers/com.microsoft.OneDrive-mac/Data/Library/Application Support/OneDrive/settings/Personal/SyncEngineDatabase.db` (tabela `od_ClientFolder_Records`).
