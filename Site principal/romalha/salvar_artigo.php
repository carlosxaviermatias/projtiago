<?php
// Configurações de conexão — ajuste as credenciais conforme seu servidor
define('DB_HOST', 'localhost');
define('DB_NAME', 'legalizzare_db');
define('DB_USER', 'root');       // substitua pelo seu usuário MySQL
define('DB_PASS', '');           // substitua pela sua senha MySQL
define('DB_CHARSET', 'utf8mb4');

define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('MAX_SIZE',   5 * 1024 * 1024); // 5 MB
$ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ── Conexão PDO ──────────────────────────────────────────────────────────────
try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    die(paginaErro('Falha na conexão com o banco de dados: ' . htmlspecialchars($e->getMessage())));
}

// ── Validação básica ─────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: admin-blog.html');
    exit;
}

$titulo          = trim($_POST['titulo']          ?? '');
$subtitulo       = trim($_POST['subtitulo']       ?? '');
$legenda_foto    = trim($_POST['legenda_foto']    ?? '');
$texto_destaque  = trim($_POST['texto_destaque']  ?? '');
$conteudo        = trim($_POST['conteudo']        ?? '');

if ($titulo === '' || $conteudo === '') {
    die(paginaErro('Título e corpo do artigo são obrigatórios.'));
}

// ── Upload da imagem ─────────────────────────────────────────────────────────
$imagem_url = '';

if (!empty($_FILES['imagem']['name'])) {
    $file = $_FILES['imagem'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        die(paginaErro('Erro no upload da imagem (código ' . $file['error'] . ').'));
    }

    if ($file['size'] > MAX_SIZE) {
        die(paginaErro('A imagem excede o limite de 5 MB.'));
    }

    $finfo    = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);

    if (!in_array($mimeType, $ALLOWED_TYPES, true)) {
        die(paginaErro('Formato de imagem não permitido. Use JPG, PNG ou WEBP.'));
    }

    // Garante que a pasta uploads/ existe
    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }

    $ext        = pathinfo($file['name'], PATHINFO_EXTENSION);
    $novoNome   = time() . '_' . bin2hex(random_bytes(6)) . '.' . strtolower($ext);
    $destino    = UPLOAD_DIR . $novoNome;

    if (!move_uploaded_file($file['tmp_name'], $destino)) {
        die(paginaErro('Não foi possível salvar a imagem no servidor.'));
    }

    $imagem_url = 'uploads/' . $novoNome;
}

// ── Inserção no banco ────────────────────────────────────────────────────────
try {
    $sql = "INSERT INTO artigos
                (titulo, subtitulo, conteudo, imagem_url, legenda_foto, texto_destaque)
            VALUES
                (:titulo, :subtitulo, :conteudo, :imagem_url, :legenda_foto, :texto_destaque)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':titulo'         => $titulo,
        ':subtitulo'      => $subtitulo ?: null,
        ':conteudo'       => $conteudo,
        ':imagem_url'     => $imagem_url ?: null,
        ':legenda_foto'   => $legenda_foto ?: null,
        ':texto_destaque' => $texto_destaque ?: null,
    ]);
} catch (PDOException $e) {
    die(paginaErro('Erro ao salvar no banco de dados: ' . htmlspecialchars($e->getMessage())));
}

// ── Resposta de sucesso ──────────────────────────────────────────────────────
echo paginaSucesso($titulo);


// ── Funções de resposta ──────────────────────────────────────────────────────
function paginaSucesso(string $titulo): string {
    return <<<HTML
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Artigo publicado | Legalizzare</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Inter', sans-serif; background: #f2f2f2; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .box { background: #fff; border-radius: 8px; padding: 48px 40px; max-width: 480px; width: 90%; text-align: center; border-top: 4px solid #8b1a1a; }
            .icon { font-size: 48px; margin-bottom: 16px; }
            h1 { font-family: 'Playfair Display', serif; font-size: 22px; color: #0d0d0d; margin-bottom: 10px; }
            p { font-size: 14px; color: #666; margin-bottom: 28px; }
            a { display: inline-block; padding: 12px 28px; background: #8b1a1a; color: #fff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; transition: background .2s; }
            a:hover { background: #a82020; }
        </style>
    </head>
    <body>
        <div class="box">
            <div class="icon">✅</div>
            <h1>Artigo publicado!</h1>
            <p>O artigo <strong>" . htmlspecialchars($titulo) . "</strong> foi salvo com sucesso no banco de dados.</p>
            <a href="admin-blog.html">Criar novo artigo</a>
        </div>
    </body>
    </html>
    HTML;
}

function paginaErro(string $msg): string {
    return <<<HTML
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erro | Legalizzare</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Inter', sans-serif; background: #f2f2f2; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .box { background: #fff; border-radius: 8px; padding: 48px 40px; max-width: 480px; width: 90%; text-align: center; border-top: 4px solid #c0392b; }
            .icon { font-size: 48px; margin-bottom: 16px; }
            h1 { font-family: 'Playfair Display', serif; font-size: 22px; color: #0d0d0d; margin-bottom: 10px; }
            p { font-size: 14px; color: #666; margin-bottom: 28px; }
            a { display: inline-block; padding: 12px 28px; background: #8b1a1a; color: #fff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
            a:hover { background: #a82020; }
        </style>
    </head>
    <body>
        <div class="box">
            <div class="icon">⚠️</div>
            <h1>Ocorreu um erro</h1>
            <p>{$msg}</p>
            <a href="javascript:history.back()">Voltar e corrigir</a>
        </div>
    </body>
    </html>
    HTML;
}
