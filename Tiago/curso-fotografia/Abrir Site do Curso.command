#!/bin/bash
# Atalho para abrir o site do curso de Fotografia no navegador.
# Deixe esta janela do Terminal ABERTA enquanto estiver usando o site.
cd "$(dirname "$0")"
PORT=8731
echo "============================================"
echo "  Curso Fotografia Digital com Smartphone"
echo "  Abrindo em: http://localhost:$PORT"
echo "  >> NÃO feche esta janela enquanto estudar."
echo "  >> Para parar: feche esta janela ou Ctrl+C"
echo "============================================"
# mata um servidor antigo na mesma porta, se houver
pkill -f "http.server $PORT" 2>/dev/null
sleep 1
# abre o navegador depois de 1s
( sleep 1; open "http://localhost:$PORT" ) &
# inicia o servidor (segura a janela aberta)
python3 -m http.server $PORT --bind 127.0.0.1
