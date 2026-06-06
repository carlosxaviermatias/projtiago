---
name: backup-painel
description: "Backup rotativo automático dos dados do Painel: a cada 20 min, manter só os 10 mais recentes, em Mac (launchd) e TrueNAS (cron)"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 41759c1a-6ff9-49de-865d-b731a62e6ddb
---

O Tiago quer **backup automático dos dados do Painel** rodando continuamente.

**Regra:** a cada **20 minutos**, gerar um snapshot; manter no máximo **10 backups**; os mais antigos são apagados conforme novos são criados (rotação).

**Como está implementado (jun/2026):**
- Script versionado no repo: `Tiago/painel/scripts/backup.sh <ORIGEM> <DESTINO> [MAX=10]`. Faz `tar.gz` da pasta de dados e roda a rotação. POSIX sh (serve Mac e Linux). Backups nomeados `painel-data-YYYYmmdd-HHMMSS.tar.gz`.
- **Mac (launchd):** `~/Library/LaunchAgents/com.tiago.painel.backup.plist`, `StartInterval 1200`, chama uma cópia do script em `~/painel-backups/backup.sh`, origem `~/Documents/github/Tiago/painel/data`, destino `~/painel-backups`, log em `~/painel-backups/backup.log`. **Precisa de Full Disk Access** concedido a `/bin/sh` (senão TCC bloqueia leitura de ~/Documents com "Operation not permitted").
- **TrueNAS (cron):** rodar a cada 20 min `sh /mnt/HD2T/arquivosHD2T/painel/scripts/backup.sh /mnt/HD2T/arquivosHD2T/painel-data /mnt/HD2T/arquivosHD2T/painel-backups 10`. Configurar via UI (System → Cron Jobs) ou crontab do usuário `tiagotavares`.

Backups NÃO vão pro git (pasta `data/` é gitignored; backups ficam fora do repo).
