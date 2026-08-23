---
name: project-truenas-immich
description: Immich no TrueNAS travado em Postgres 15; preso na versão 1.13.6 do app — NÃO atualizar sem migrar o banco antes
metadata: 
  node_type: memory
  type: project
  originSessionId: 8faf5895-71b6-45f8-aec5-cebafefc1a51
  modified: 2026-08-17T03:06:07.801Z
---

**⚠️ NÃO ATUALIZAR o app Immich no TrueNAS sem resolver o Postgres antes.**

TrueNAS SCALE 26.0.0-BETA.2 em `192.168.18.22`, pool `PRINCIPAL`. Consertado em 16/08/2026.

**O que quebrou:** o banco do Immich em disco é **PostgreSQL 15** (`/mnt/.ix-apps/app_mounts/immich/postgres_data/15/docker`, ~172 MB). O app foi atualizado até a **1.14.34**, que só suporta PG 18. O container `pgvecto_upgrade` falha em loop com `ERROR: Old PostgreSQL [15] binaries not found at [/usr/lib/postgresql/15/bin]` — a imagem `ixsystems/postgres-upgrade` **não traz os binários do PG15 em nenhuma versão testada** (nem 1.2.15, nem 1.2.1). Sem a migração, `pgvecto` e `server` nunca sobem e o app fica CRASHED.

**Como foi resolvido:** rollback pra **1.13.6** (última versão que aceita PG15 — a faixa 1.11.11→1.13.6 traz `vectorchord_15_image` E `vectorchord_18_image`; da 1.14.21 em diante só a 18) + trocar na config do app `immich.postgres_image_selector` de `vectorchord_18_image` para **`vectorchord_15_image`**. Aí o Immich sobe direto no PG15, sem migração nenhuma.

**Estado atual:** Immich RUNNING, app 1.13.6, Immich v2.5.6, porta **30041**. A UI mostra "Update available" — **ignorar**, atualizar quebra tudo de novo.

**Pra destravar de verdade (pendente):** fazer `pg_dumpall` do PG15 num container `postgres:15-vectorchord0.5.3` e restaurar num PG18 — só então dá pra ir pra 1.14.x. Backup do PG15 em `/mnt/PRINCIPAL/DOCUMENTOS/ARQUIVOS_SERVER/immich-pg15-backup-20260816` (cópia via `cp -a`; dono/permissões NÃO preservados por ACL do destino — ao restaurar, `chown -R 999:999` e `chmod 700`).

**Descobertas de infra que valem pra tudo no NAS:**
- O fuso do sistema estava em `Brazil/West`, nome legado removido do tzdata. O middleware do TrueNAS 26 quebra com `No time zone found with key 'Brazil/West'` — inclusive o visualizador de logs de container. Corrigido pra `America/Sao_Paulo` (no sistema E na config do app Immich).
- **SSH está desligado** (porta 22 recusa). Só dá pra trabalhar pela web.
- O Shell da web **engole teclas enviadas por automação** — comandos precisam ser digitados pelo Tiago.
- O TrueNAS **proíbe snapshot ZFS em todo o ramo `PRINCIPAL/ix-apps`** ("protected path"), em qualquer nível. Backup de dados de app só por cópia de arquivos.
- API: REST v2.0 não existe mais; é JSON-RPC por websocket em `ws://IP/api/current`. Dá pra autenticar do próprio navegador logado com `auth.login_with_token` usando o token do `localStorage['ngx-webstorage|token']` — **o token é de uso único**, então gerar um novo com `auth.generate_token` e regravar no localStorage a cada chamada, senão a sessão web do Tiago cai.
- ⚠️ A lista de apps da UI **troca o app selecionado sozinha** quando a tabela atualiza — chegou a abrir o diálogo de Roll Back do `cloudflared` achando que era do `immich`. Não usar a UI pra ações destrutivas; usar a API.

**Pool HD2T OFFLINE = NORMAL, não investigar.** É um HD externo que o Tiago pluga e despluga provisoriamente (confirmado por ele em 17/08/2026). O alerta "Pool HD2T state is OFFLINE" é esperado quando está desconectado, e o `painel-tiago` fica STOPPED junto — ver [[project_painel]] e [[backup_painel]].

## GPU: GTX 1050 Ti NÃO funciona neste TrueNAS (17/08/2026)

Tiago instalou uma **NVIDIA GeForce GTX 1050 Ti** (GP107, PCI `0000:01:00.0`, ID `10de:1c82`). Habilitei `docker.update({nvidia:true})` e reiniciamos. **Não funciona e não tem conserto:**

```
NVRM: GPU ... is not supported by open nvidia.ko because it does not
NVRM: include the required GPU System Processor (GSP).
```

O TrueNAS só distribui os **módulos de kernel abertos** da NVIDIA, que exigem **GSP — só existe da arquitetura Turing (GTX 16xx / RTX 20xx) em diante**. A 1050 Ti é Pascal. O driver proprietário suportaria, mas instalar na mão é não-suportado e some na próxima atualização. `nvidia-smi` existe mas falha; `/sys/module/nvidia` nunca carrega.

Recomendação dada: se quiser aceleração, trocar por **GTX 1650 SUPER / GTX 1660 / RTX 3050 6GB** (75 W, sem conector auxiliar, cabem em fonte de OEM antigo). Serviria pra transcodificação no Emby (exige **Emby Premiere**) e pra IA do Immich (o chart 1.13.6 tem `ml_cuda_image` pronto — hoje está em `ml_image`, CPU).

⚠️ **Prioridade real é RAM, não GPU:** só 3,8 GiB, e isso já derrubou o serviço de apps antes. DDR3 é barata e melhora o servidor inteiro.

**Efeito colateral de instalar a placa:** a interface de rede mudou de `enp2s0` para **`enp3s0`** (a GPU empurrou a numeração do PCI). O IP 192.168.18.22 continuou funcionando, mas atenção ao mexer em rede.

`docker.config.nvidia` ficou em `true` — pode voltar pra `false` pra parar de tentar carregar a cada boot.
