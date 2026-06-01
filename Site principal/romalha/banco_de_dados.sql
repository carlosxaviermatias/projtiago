-- Banco de dados: legalizzare_db
-- Execute este arquivo no seu servidor MySQL para criar a estrutura do site.

CREATE DATABASE IF NOT EXISTS legalizzare_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE legalizzare_db;

CREATE TABLE IF NOT EXISTS artigos (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    titulo           VARCHAR(255)  NOT NULL,
    subtitulo        VARCHAR(255)  DEFAULT NULL,
    conteudo         LONGTEXT      NOT NULL,
    imagem_url       VARCHAR(500)  NOT NULL,
    legenda_foto     VARCHAR(255)  DEFAULT NULL,
    texto_destaque   TEXT          DEFAULT NULL,
    data_publicacao  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
