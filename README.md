# Curso de Fotografia Digital com Smartphone — Site de Estudos

Material de estudo on-line do curso **Fotografia Digital com Smartphone** (200h · SENAI/Firjan · Projeto SEEDUC).
Instrutor: **Tiago Tavares**.

Site estático (HTML/CSS/JS puro, sem build) com toda a base teórica do curso para os alunos estudarem em casa.

## Páginas

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Home — apresentação, grade dos 5 módulos, instrutor |
| `modulo-1-introducao.html` | História, câmera, triângulo da exposição, composição (32h) |
| `modulo-2-iluminacao.html` | Luz natural/artificial, qualidade, direção, esquemas (40h) |
| `modulo-3-edicao.html` | Ajustes, corte, filtros, formatos e tamanhos para redes (32h) |
| `modulo-4-empreendedorismo.html` | Mercado, Canvas, SWOT, preço, portfólio, MEI (32h) |
| `modulo-5-projeto.html` | Jornada do projeto final e portfólio (64h) |
| `mestres.html` | Galeria de grandes fotógrafos (Salgado, Cartier-Bresson…) |
| `glossario.html` | Glossário pesquisável de termos técnicos |

## Estrutura

```
curso-fotografia/
├── index.html + páginas
├── assets/
│   ├── css/style.css      (sistema de design)
│   ├── js/main.js         (nav, índice, lightbox, progresso)
│   └── img/               (historia, mestres, tecnica, deco)
└── README.md
```

## Como visualizar localmente

```bash
cd Tiago/curso-fotografia
python3 -m http.server 8731
# abra http://localhost:8731
```

## Recursos

- Design responsivo (desktop e celular), tema escuro com identidade fotográfica.
- Índice lateral com destaque automático da seção (scrollspy) nos módulos.
- Diagramas SVG autorais (triângulo da exposição, abertura, profundidade de campo,
  regra dos terços, histograma, esquema de iluminação, Canvas, SWOT…).
- Lightbox nas imagens, barra de progresso de leitura, glossário com busca.
- Imagens de **domínio público / Creative Commons** (Wikimedia Commons), baixadas
  localmente — o site funciona offline e sem links quebrados.
- Vídeos do YouTube via cards de busca (sempre atualizados, nunca quebram).

## Créditos das imagens

Todas de domínio público ou licença Creative Commons via Wikimedia Commons
(obras de Niépce, Daguerre, Caravaggio, Vermeer, Rembrandt; retratos de
Sebastião Salgado, Henri Cartier-Bresson e Annie Leibovitz; exemplos técnicos).
