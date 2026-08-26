---
name: seguranca-site-tiagotavares
description: Auditoria de segurança do site/CRM tiagotavares.adv.br (2026-08-24) — furo crítico de arquivos públicos corrigido; regras que NÃO podem ser desfeitas
metadata:
  type: project
---

Pentest completo do `Tiago/site-tiagotavares` em 2026-08-24 (código + ataque real
contra o app rodando local). **Corrigido, mas ainda não deployado.**

## ⚠️ O furo crítico (existia EM PRODUÇÃO, confirmado)

`app.js` tinha `express.static(__dirname)`, que publicava o projeto INTEIRO sem
login. Qualquer pessoa com a URL baixava `data/docs/**` — os PDFs de processo dos
clientes — além de `data.json`, `config.php`, `app.js` e o código do CRM.
Confirmado em produção via `curl` (o PDF do processo 3 respondeu 200 com 235 KB).

**Correção**: static virou allowlist — só `css/ js/ img/ assets/` mais
`loader.js, robots.txt, sitemap.xml, favicon.ico`. ⚠️ **NUNCA voltar a
`express.static(__dirname)`.** Página nova = rota nova em `app.js`, não arquivo solto.
Como efeito colateral, `/faq.html` e afins deixaram de ser servidos: há rota `/faq`
e 301 dos `.html` antigos.

## Regras que precisam continuar valendo

- **Nada de texto de usuário dentro de `onclick="fn('...')"`.** `esc()` não
  resolve: o HTML decodifica a entidade antes do JS rodar. Passe só o id e
  busque o texto no cache JS. (Era XSS real na exclusão de categoria do financeiro.)
- **`enviarParaVisualizacao()` em `crm/index.js`**: só PDF/imagem/txt vão inline;
  o resto é forçado a download. Upload de lead/processo não filtra extensão, então
  sem isso um `.html` anexado executaria JS na origem do CRM.
- **Senha padrão bloqueada em produção**: se a conexão é HTTPS e `ADMIN_PASSWORD`
  está ausente ou é `tiago2026`, o login devolve 503. ⚠️ **Antes de deployar,
  conferir que ADMIN_PASSWORD está definida no hPanel** — senão o CRM tranca.
- Cookie de sessão usa `secure:'auto'` (marca Secure sozinho sob HTTPS, nunca
  quebra o login). `COOKIE_SECURE` não precisa mais ser mexido.
- CSP separada: fechada em `/crm` `/admin` `/api`; no site público a lista do
  Google (Ads + Analytics) é nominal — **cortar um domínio dela quebra o
  rastreamento de conversão do anúncio**, que já quebrou uma vez no teste.
- Limitador de pedido de OTP na proposta pública (3/link, 10/IP por 15 min):
  sem ele dava pra bombardear o e-mail do cliente e zerar o contador de 5
  tentativas do código a cada novo pedido.

## Já estava bom (não mexer achando que falta)

Queries parametrizadas (zero SQLi em 48 payloads), login com bloqueio por IP,
`session.regenerate` no login, sem prototype pollution, sem path traversal,
comprovantes com allowlist de extensão, erros sem stack trace.

Ver [[crm_dois_sistemas]] para o módulo financeiro em si.
