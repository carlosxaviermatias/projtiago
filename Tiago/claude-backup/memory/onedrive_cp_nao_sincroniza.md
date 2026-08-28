---
name: onedrive_cp_nao_sincroniza
description: OneDrive no Mac não detecta modificação nem exclusão de arquivo feita por shell — só criação de nome novo sincroniza
metadata: 
  node_type: memory
  type: feedback
  originSessionId: be74a16d-48cc-4ed7-8b54-7a4cf6c23cc2
  modified: 2026-08-26T23:17:06.737Z
---

Em `~/Library/CloudStorage/OneDrive-Pessoal/`, o OneDrive do Mac **só detecta a CRIAÇÃO de arquivo com nome novo** (sincroniza em ~8s). Ele **não detecta**, quando a escrita vem do shell:

- sobrescrever arquivo existente (`cp` por cima, Write/Edit) — mesmo com inode novo via `rm`+`cp`, ou `mv` atômico;
- `touch` (mudança de mtime);
- **exclusão** — o arquivo some do disco local e permanece na nuvem.

**Como entregar arquivo atualizado ao Tiago:** gravar com **nome de arquivo novo**. Não adianta insistir em atualizar o mesmo nome.

**Why:** em 26/08/2026 atualizei o orçamento da Caterina cinco vezes; ele abriu no celular e via versões antigas. Duas vezes o arquivo sincronizou 40–50s depois e eu atribuí ao `rm`+`cp` e ao reinício do app — **era coincidência com a varredura periódica do OneDrive**, não efeito das minhas ações; na terceira vez nem reiniciar o app resolveu. O que funcionou de forma reprodutível foi nome novo (8s). Reiniciar o app (`osascript -e 'quit app "OneDrive"'; open -a OneDrive`) não é solução confiável.

**Verificar sempre antes de dizer que está sincronizado** — conferir o arquivo local (md5/conteúdo) NÃO prova nada sobre a nuvem:

```bash
D="$HOME/Library/Containers/com.microsoft.OneDrive-mac/Data/Library/Application Support/OneDrive/settings/Personal"
cp "$D/SyncEngineDatabase.db" /tmp/se.db; cp "$D/SyncEngineDatabase.db-wal" /tmp/se.db-wal
sqlite3 /tmp/se.db "SELECT fileName, size FROM od_ClientFile_Records WHERE fileName LIKE '%NOME%';"
```

Copiar o `-wal` junto, senão a leitura sai desatualizada. Comparar `size` com o do disco.

**Efeito colateral a avisar ao Tiago:** versões antigas que já subiram continuam na nuvem mesmo depois de apagadas localmente — ele precisa excluí-las pelo celular ou pela web, senão fica com arquivos duplicados e não sabe qual é o bom.

Não confundir com o domínio File Provider órfão de julho/2026, que era outro problema e foi resolvido — ver [[project_onedrive_dominio_orfao]]. Relevante para todo trabalho em `01.CLIENTES` e [[feedback_orcamentos_formato]].
