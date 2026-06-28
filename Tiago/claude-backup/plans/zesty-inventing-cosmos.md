# Plano — Publicar o site em fotografia.tiagotavares.online (Hostinger Git)

## Contexto
O site estático do curso "Fotografia Digital com Smartphone" (pasta `Tiago/curso-fotografia/`)
precisa ir ao ar em **fotografia.tiagotavares.online**, sem afetar o **jonatan.tiagotavares.online**
que já existe. O método escolhido pelo Tiago foi **deploy via Git** da Hostinger.

A parte do GitHub **já está pronta e testada**: criei o branch `fotografia-deploy` no repositório
público `tavaresmatias/projtiago`, contendo apenas o site na raiz. Verificado: `index.html`,
CSS e imagens respondem `200`. O branch `main` e o Jonatan não foram tocados.

Agora falta a parte no **hPanel da Hostinger**, que farei via automação do Chrome (já estou
logado como Tiago no hPanel).

## Passos a executar no hPanel
1. **Abrir a hospedagem** que contém `tiagotavares.online` (menu **Sites** → selecionar o site).
2. **Criar o subdomínio** `fotografia`:
   - Em **Domínios → Subdomínios**, criar `fotografia` → vira `fotografia.tiagotavares.online`.
   - Anotar a **pasta (document root)** que a Hostinger atribuir (ex.: `public_html/fotografia`
     ou `domains/fotografia.tiagotavares.online/public_html`).
   - Se a pasta vier com um `index.html`/placeholder, esvaziá-la (o Git exige pasta vazia).
3. **Configurar o Git** (menu **Avançado → GIT** → *Criar*):
   - Repository: `https://github.com/tavaresmatias/projtiago.git`  (repo público → HTTPS, sem chave)
   - Branch: `fotografia-deploy`
   - Diretório: a pasta do subdomínio anotada no passo 2
   - Criar → a Hostinger clona o site.
4. **SSL**: garantir certificado emitido para `fotografia.tiagotavares.online` (geralmente automático).
5. **(Opcional) Auto-deploy**: ativar Auto-Deployment, pegar a webhook URL e adicioná-la no GitHub
   (`projtiago` → Settings → Webhooks). Pode ser feito depois; sem isso, atualizações se fazem com
   o botão "Deploy" no hPanel.

## Salvaguardas
- Apenas **criar** subdomínio novo e deployment Git novo. **Não** editar/excluir nada do Jonatan
  nem outros domínios.
- Confirmar visualmente (screenshot) cada tela antes de clicar em botões que criam/gravam.
- Se o recurso **GIT não existir** no plano (alguns planos não têm), faço o fallback: subir o
  `Tiago/fotografia-tiagotavares-deploy.zip` (já pronto) pelo **Gerenciador de Arquivos** na pasta
  do subdomínio e descompactar — também isolado do Jonatan.

## Verificação (fim a fim)
- Abrir `https://fotografia.tiagotavares.online` no navegador.
- Conferir: home carrega, navegar a um módulo (ex.: Módulo 1) e ver os diagramas/imagens.
- Conferir que `jonatan.tiagotavares.online` continua no ar normalmente.

## Atualizações futuras
Quando o Tiago quiser mudar o site, eu edito em `curso-fotografia/`, atualizo o branch
`fotografia-deploy` e o deploy roda (automático via webhook, ou no clique "Deploy" do hPanel).
