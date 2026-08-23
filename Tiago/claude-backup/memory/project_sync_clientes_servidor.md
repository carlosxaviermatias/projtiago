---
name: project-sync-clientes-servidor
description: Sync automático da pasta 01.CLIENTES do OneDrive para o servidor TrueNAS via SMB (LaunchAgent)
metadata: 
  node_type: memory
  type: project
  originSessionId: c4d24bae-3385-41e5-8347-68938cac0c00
  modified: 2026-08-19T22:15:13.767Z
---

Cópia automática de `~/OneDrive/01.CLIENTES` → `/Volumes/documentos/01.CLIENTES` (SMB do TrueNAS em 192.168.18.22). É **cópia adicional**, não movimentação: os arquivos continuam no OneDrive (acessados de outro local) e passam a existir também no servidor. rsync sem `--delete`.

Peças:
- Script: `~/.local/bin/sync-clientes.sh` (lock, guarda de ping/mount com watchdog, log em `~/Library/Logs/sync-clientes.log`)
- LaunchAgent: `~/Library/LaunchAgents/com.tiago.sync-clientes.plist` — `WatchPaths` na pasta + `StartInterval` 600s + `ThrottleInterval` 60s

⚠️ **Bloqueio pendente (2026-08-19)**: o processo do launchd leva "Operation not permitted" ao ler `~/OneDrive` e escrever em `/Volumes/documentos`. É TCC — precisa de **Acesso Total ao Disco para `/bin/zsh`** em Ajustes do Sistema → Privacidade e Segurança. Só o Tiago pode conceder. Rodando na mão (do Terminal já autorizado) funciona.

⚠️ O servidor cai com frequência (ping falhou em 19/08/2026). O script sai quieto quando isso acontece — checar o log antes de suspeitar de bug.

Relacionado: [[project_truenas_immich]], [[backup_painel]], [[project_onedrive_dominio_orfao]]
