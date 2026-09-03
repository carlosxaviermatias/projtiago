/* ============================================================
   FotoLab · drive-config.js
   Configuração do "Fotos da turma" (Google Drive).

   ------------------------------------------------------------
   1) PASTA FIXA DA TURMA
   ------------------------------------------------------------
   Cole aqui o link da pasta do Drive onde você põe as fotos dos
   exercícios. Ela precisa estar compartilhada como
   "qualquer pessoa com o link" (Drive → Compartilhar → Acesso geral).

   Trocar as fotos é só jogar arquivo novo na pasta: o site lê a
   pasta ao vivo, não precisa de deploy nenhum.

   ------------------------------------------------------------
   2) SENHA DA TURMA
   ------------------------------------------------------------
   ⚠️ Tranca leve, não segurança. O site é estático, então esta
   senha fica visível para quem abrir o código-fonte da página —
   e a pasta, por ser "qualquer pessoa com o link", abre para
   quem tiver o link mesmo sem senha. Ela serve para o material
   não ficar à mão de qualquer visitante do site. Não use esta
   pasta para nada sigiloso.

   Deixe SENHA_TURMA = '' para liberar sem senha.

   ------------------------------------------------------------
   3) CHAVE DA API (obrigatória para tudo isso funcionar)
   ------------------------------------------------------------
     1. console.cloud.google.com → crie um projeto (ex.: "FotoLab")
     2. "APIs e serviços" → "Ativar APIs" → ative a Google Drive API
     3. "Credenciais" → "Criar credenciais" → Chave de API
     4. Edite a chave:
          · Restrições de aplicativo → "Sites"
            → adicione  https://fotografia.tiagotavares.com.br/*
          · Restrições de API → só "Google Drive API"
     5. Cole abaixo e faça o deploy.

   A chave fica visível no código (é assim com toda chave de
   navegador). A restrição por site impede que usem fora daqui, e
   ela só LÊ arquivos que já estão públicos.
   ============================================================ */

export const DRIVE_API_KEY = 'AIzaSyAVkXsgLQ53tH-qIfNh0bAY5agAGwpnDO4';

/* Link (ou ID) da pasta fixa da turma. Vazio = sem pasta fixa. */
export const PASTA_TURMA = 'https://drive.google.com/drive/folders/1Ec-yDG1PJ5yeUZ4q8oS04KajbxvFyFfe';

/* Nome que aparece para o aluno. */
export const NOME_TURMA = 'Fotos do curso';

/* Senha única da turma. Vazio = entra direto, sem senha. */
export const SENHA_TURMA = 'foto123';

/* Deixar o aluno também colar o link de uma pasta própria? */
export const PERMITIR_OUTRA_PASTA = true;
