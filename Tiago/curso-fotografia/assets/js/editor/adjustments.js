/* ============================================================
   FotoLab · adjustments.js
   Definição dos controles. Cada um traz um "porquê" curto —
   o editor é material de aula, então todo controle explica o que
   faz e para onde o aluno volta no site se quiser o conteúdo.
   ============================================================ */

export const GROUPS = [
  {
    id: 'luz', title: 'Luz', icon: '☀️', open: true,
    help: 'É aqui que se conserta exposição. Olhe o histograma enquanto arrasta: encostou tudo na direita, estourou; tudo na esquerda, empretecéu.',
    link: { href: 'modulo-1-introducao.html#exposicao', text: 'Módulo 1 · Triângulo da exposição' },
    items: [
      { key: 'exposure', label: 'Exposição', min: -100, max: 100, help: 'Clareia ou escurece a foto inteira, como abrir/fechar o diafragma. ±100 equivale a ±2 pontos (EV).' },
      { key: 'contrast', label: 'Contraste', min: -100, max: 100, help: 'Distância entre o claro e o escuro. Muito contraste "fecha" as sombras e perde detalhe.' },
      { key: 'highlights', label: 'Altas luzes', min: -100, max: 100, help: 'Mexe só nas partes claras. Baixar recupera céu estourado — se ainda houver informação.' },
      { key: 'shadows', label: 'Sombras', min: -100, max: 100, help: 'Mexe só nas partes escuras. Subir revela o que ficou no breu (e mostra o ruído do ISO alto).' },
      { key: 'whites', label: 'Brancos', min: -100, max: 100, help: 'Onde termina a escala: define qual tom vira branco puro.' },
      { key: 'blacks', label: 'Pretos', min: -100, max: 100, help: 'Onde começa a escala: define qual tom vira preto puro. Um pretinho fechado dá "corpo" à imagem.' }
    ]
  },
  {
    id: 'cor', title: 'Cor', icon: '🎨',
    help: 'Balanço de branco é o que faz a foto parecer natural. Lembre da luz da sala: janela (fria) + softbox (quente) brigam entre si.',
    link: { href: 'modulo-2-iluminacao.html', text: 'Módulo 2 · Iluminação' },
    items: [
      { key: 'temp', label: 'Temperatura', min: -100, max: 100, help: 'Esquenta (âmbar) ou esfria (azul). Corrige luz de lâmpada amarela ou sombra azulada.' },
      { key: 'tint', label: 'Matiz', min: -100, max: 100, help: 'Eixo verde ↔ magenta. Serve para tirar o verde de lâmpada fluorescente.' },
      { key: 'saturation', label: 'Saturação', min: -100, max: 100, help: 'Intensidade de TODAS as cores por igual. Exagerar queima a pele.' },
      { key: 'vibrance', label: 'Intensidade', min: -100, max: 100, help: 'Saturação inteligente: mexe mais nas cores apagadas e poupa o tom de pele.' }
    ]
  },
  {
    id: 'detalhe', title: 'Detalhe', icon: '🔍',
    help: 'Nitidez não inventa foco: ela realça bordas que já existem. Em foto de celular, pouca coisa já resolve.',
    link: { href: 'modulo-3-edicao.html', text: 'Módulo 3 · Edição' },
    items: [
      { key: 'clarity', label: 'Textura', min: -100, max: 100, help: 'Contraste local (médio raio). Positivo marca a textura; negativo suaviza a pele.' },
      { key: 'sharpen', label: 'Nitidez', min: 0, max: 100, help: 'Realça as bordas finas. Demais = auréola branca em volta dos contornos.' },
      { key: 'blur', label: 'Desfoque', min: 0, max: 100, help: 'Borra a camada inteira. Usado numa camada de fundo, imita a profundidade de campo do retrato.' }
    ]
  },
  {
    id: 'efeitos', title: 'Efeitos', icon: '✨',
    help: 'Efeito bom é o que ninguém percebe. Use com moderação — é o que separa a foto tratada da foto "photoshopada".',
    items: [
      { key: 'grain', label: 'Grão', min: 0, max: 100, help: 'Simula o grão do filme. Também disfarça ruído digital feio e degradês em faixas.' },
      { key: 'vignette', label: 'Vinheta', min: -100, max: 100, help: 'Escurece (positivo) ou clareia (negativo) os cantos, puxando o olho para o centro.' }
    ]
  }
];

export const BW = {
  filters: [['none', 'Sem filtro'], ['vermelho', 'Vermelho'], ['laranja', 'Laranja'], ['amarelo', 'Amarelo'], ['verde', 'Verde'], ['azul', 'Azul']],
  tones: [['none', 'Neutro'], ['sepia', 'Sépia'], ['frio', 'Frio']],
  help: 'No P&B, o filtro colorido decide qual cor vira cinza-claro. O vermelho escurece o céu azul e clareia a pele — truque de laboratório, não de celular.'
};
