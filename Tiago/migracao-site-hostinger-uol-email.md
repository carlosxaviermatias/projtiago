# Migração do site tiagotavares.com.br para Hostinger (e-mail mantido na UOL)

Data: 2026-08-01

## Objetivo
Mover o site de tiagotavares.com.br para a Hostinger, mantendo o e-mail profissional 100% na UOL (sem interrupção).

## O que foi feito

### 1. Site criado na Hostinger
- WordPress instalado para o domínio `tiagotavares.com.br`
- IP do servidor Hostinger: `45.152.46.112`
- Nome do servidor: `server803` (South America / Brazil)
- Acesso: `https://tiagotavares.com.br/wp-admin`
- Usuário admin WordPress: e-mail cadastrado na Hostinger (premiumfisco@gmail.com)
- Senha do admin WordPress: definida durante a instalação — **guardar no gerenciador de senhas**, não está registrada aqui por segurança.

### 2. DNS configurado no painel UOL Host
Painel: https://meupainelhost.uol.com.br/meus-dominios/administrar-dns (domínio: tiagotavares.com.br)

Registros **criados**:
| Entrada | Tipo | Destino |
|---|---|---|
| tiagotavares.com.br (raiz) | A | 45.152.46.112 |
| www.tiagotavares.com.br | A | 45.152.46.112 |

Registros **mantidos intactos** (e-mail UOL):
| Entrada | Tipo | Destino |
|---|---|---|
| tiagotavares.com.br | MX (prioridade 0) | mx.uhserver.com |
| smtp.tiagotavares.com.br | CNAME | smtp.uhserver.com |
| pop3.tiagotavares.com.br | CNAME | pop.uhserver.com |
| pop.tiagotavares.com.br | CNAME | pop.uhserver.com |
| mail.tiagotavares.com.br | CNAME | service.uhserver.com |
| pro._domainkey.tiagotavares.com.br | CNAME | pro._domainkey.uhserver.com |
| tiagotavares.com.br | TXT (SPF) | v=spf1 include:spf.whservidor.com ?all |
| _pop3._tcp / _submission._tcp | SRV | (intactos) |

Os **nameservers continuam sendo os da UOL** (ns1/ns2/ns3.dominios.uol.com.br) — não houve migração de nameservers, apenas adição dos registros A no painel de zona DNS da própria UOL, que já gerenciava (e continua gerenciando) o domínio.

## Status
- Site: aguardando propagação de DNS (até ~1h) para tiagotavares.com.br apontar para a Hostinger.
- E-mail: sem qualquer alteração, funcionando normalmente na UOL durante e após a migração.

## Próximos passos (pendentes)
- Configurar o conteúdo/tema do WordPress em tiagotavares.com.br
- Validar SSL/HTTPS ativo no domínio principal (Hostinger já provisiona automaticamente)
- Conferir, após propagação, se `https://tiagotavares.com.br` carrega o novo site
