---
name: project-concursos-policia
description: Site de notícias automático de concursos (Polícia/Segurança) em Tiago/concursos-policia/
metadata:
  node_type: memory
  type: project
  originSessionId: f6d8671b-0dfb-4341-9048-e21000ca161b
---

Protótipo de **site de notícias automático** sobre concursos públicos da área
de **polícia e segurança**, em `Tiago/concursos-policia/`. Criado 2026-06-08.

Pipeline: `fontes.py` (coleta) → `ia.py` (gera texto) → `classificar.py`
(polícia + UF) → `pipeline.py` (grava `data/posts.json`, idempotente) →
`server.py` (site, porta 8780). `util.py` = slug.

Conteúdo tem dois `tipo`s: **concurso** (editais, dados estruturados) e
**noticia** (assuntos/manchetes). Cada post: tipo, policia, uf, titulo, corpo,
campos, slug, fonte_url. Modos: `edital` (extração rica) vs `manchete` (brief).

Coleta ao vivo (`coletar_ao_vivo`, `CONCURSOS_AOVIVO=1`): **Google News RSS** por
categoria, com filtro de relevância, dedupe e classificação. Fallback p/ amostra
embutida. ⚠️ Google News RSS é só uso pessoal pelos termos — em produção trocar
por fontes oficiais (DOU/diários) ou feed licenciado. IA com **modo MOCK**
(templates variados) quando não há `ANTHROPIC_API_KEY`.

Site: home `/`, página própria `/noticia/<slug>` (blog), filtros `/tipo/...`,
`/policia/...`, `/estado/<UF>`; topo com espaço de logo + menu + subnav de
polícias e siglas de estado linkáveis; **3 espaços de Google AdSense** prontos
(placeholders em `_bloco_ads` no server.py). Cards estilo portal (miniatura à
esquerda).

Imagens (`imagens.py`): capa temática SVG por polícia em `/cover/<policia>`
(padrão, sem direitos autorais) — NUNCA usar a foto do portal de origem. Com
`PEXELS_API_KEY` (grátis), vira foto real do Pexels (uso comercial liberado).

Agendamento 9h/12h/18h: arquivos prontos em `scripts/` (plist launchd +
rodar.sh). **NÃO ativado** — launchd no Mac é bloqueado pelo TCC ao ler
`~/Documents` (precisa Acesso Total ao Disco p/ /usr/bin/python3, ou mover o
projeto, ou usar cron no TrueNAS). Usuário escolheu "deixar pronto, decido
depois". Ver [[project-painel]].

Pendências: decidir onde agendar; plugar `ANTHROPIC_API_KEY` (textos melhoram
muito); trocar fonte ao vivo por oficial para produção; personalizar logo/cores.
