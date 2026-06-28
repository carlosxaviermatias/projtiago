# Plano: Conectar projeto Jonatan Bandeira ao GitHub

## Contexto
O usuário tem um projeto de site localizado em `/Users/tiagotavares/Documents/github/Jonatan Bandeira/site-jonatan/` que precisa ser conectado ao repositório GitHub `tavaresmatias/jonatanbandeira` via SSH (já configurada).

## Arquivos do projeto
- `index.html`
- `index_jonatan.html`
- `img/` (pasta com imagens)

## Passos de execução

1. Entrar na pasta do projeto:
   ```
   cd "/Users/tiagotavares/Documents/github/Jonatan Bandeira/site-jonatan"
   ```

2. Inicializar o repositório git:
   ```
   git init
   ```

3. Adicionar todos os arquivos:
   ```
   git add .
   ```

4. Fazer o primeiro commit:
   ```
   git commit -m "first commit"
   ```

5. Definir branch principal como `main`:
   ```
   git branch -M main
   ```

6. Conectar ao repositório remoto via SSH:
   ```
   git remote add origin git@github.com:tavaresmatias/jonatanbandeira.git
   ```

7. Fazer push:
   ```
   git push -u origin main
   ```

## Verificação
Após o push, confirmar que os arquivos aparecem em `github.com/tavaresmatias/jonatanbandeira`.
