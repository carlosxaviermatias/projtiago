/* ============================================================
   FotoQuest · data/strings.js
   Textos de UI e feedback pedagógico por critério.
   Cada feedback aponta o módulo do curso onde revisar.
   ============================================================ */

export const CRITERIA_INFO = {
  exposicao: {
    label: "Exposição", icon: "☀️", module: "Módulo 1 · Triângulo da exposição",
    good: "Exposição no ponto — luz equilibrada!",
    dark: "Ficou escura: abra a abertura (f menor), reduza a velocidade ou suba o ISO.",
    bright: "Estourou: feche a abertura (f maior), aumente a velocidade ou baixe o ISO.",
  },
  movimento: {
    label: "Movimento", icon: "🏃", module: "Módulo 1 · Velocidade do obturador",
    good: "Movimento congelado com a velocidade certa!",
    blur: "Saiu borrada: alvo em movimento pede velocidade mais alta (1/500+).",
    shake: "Tremida: velocidade lenta na mão borra tudo — use 1/60+ ou um tripé.",
    trailGood: "Longa exposição perfeita: os faróis viraram rastros de luz!",
    trailNeed: "Para rastros de luz: monte o tripé e use velocidade lenta (1/4s ou mais).",
  },
  enquadramento: {
    label: "Composição", icon: "▦", module: "Módulo 1 · Regra dos terços",
    good: "Regra dos terços aplicada — composição forte!",
    center: "Muito centralizado: posicione o assunto num ponto forte da grade.",
    out: "O assunto ficou fora (ou cortado) do quadro — enquadre antes de disparar.",
  },
  profundidade: {
    label: "Foco & DOF", icon: "🎯", module: "Módulo 1 · Profundidade de campo",
    good: "Foco cravado e profundidade de campo ideal!",
    focus: "Fora de foco: ajuste a distância de foco até o assunto ficar nítido.",
    dof: "Abertura errada p/ a cena: retrato pede f baixo (fundo desfocado); paisagem pede f alto.",
  },
  lente: {
    label: "Lente & distância", icon: "📏", module: "Módulo 1 · Tipos de objetivas",
    good: "Distância e lente perfeitas para o assunto!",
    far: "Longe demais: aproxime-se ou use uma teleobjetiva.",
    near: "Perto demais: afaste-se ou troque para uma lente mais aberta (wide).",
  },
  ruido: {
    label: "Ruído", icon: "🌫️", module: "Módulo 2 · Fotografia noturna",
    warn: "ISO muito alto gerou ruído — equilibre com abertura/velocidade quando puder.",
  },

  /* Os de baixo NÃO são critérios de nota: são os `concept` dos alvos, usados
     no perfil ("Desempenho por conceito"). Sem eles a tela mostrava a chave
     crua com um 📌 genérico. */
  velocidade:  { label: "Velocidade", icon: "⏱️", module: "Módulo 1 · Velocidade do obturador" },
  iso:         { label: "ISO & ruído", icon: "🎚️", module: "Módulo 1 · Triângulo da exposição" },
  lentes:      { label: "Lentes", icon: "🔭", module: "Módulo 1 · Tipos de objetivas" },
  iluminacao:  { label: "Iluminação", icon: "💡", module: "Módulo 2 · Luz natural e artificial" },
  noturna:     { label: "Fotografia noturna", icon: "🌙", module: "Módulo 2 · Fotografia noturna" },
  composicao:  { label: "Direção de cena", icon: "🎬", module: "Módulo 1 · Composição" },
  edicao:      { label: "Edição", icon: "🖥️", module: "Módulo 3 · Edição de imagem" },
  negocio:     { label: "Cliente & mercado", icon: "🤝", module: "Módulo 4 · Empreendedorismo" },
  projeto:     { label: "Projeto fotográfico", icon: "🖼️", module: "Módulo 5 · Projeto final" },
};

export const STARS = [
  { min: 95, stars: 5, title: "Obra-prima!" },
  { min: 85, stars: 4, title: "Excelente!" },
  { min: 70, stars: 3, title: "Muito boa!" },
  { min: 40, stars: 2, title: "Quase lá…" },
  { min: 0,  stars: 1, title: "Continue tentando!" },
];

export const ACHIEVEMENTS = {
  primeira_foto:  { icon: "📸", name: "Primeiro clique",     desc: "Tirou sua primeira foto" },
  cinco_estrelas: { icon: "🌟", name: "Perfeccionista",      desc: "Tirou uma foto 5 estrelas" },
  estudio_ok:     { icon: "🎓", name: "Formado no estúdio",  desc: "Completou o tutorial" },
  meia_jornada:   { icon: "🧭", name: "Meio caminho",        desc: "Completou as 10 primeiras fases" },
  colecionador:   { icon: "🎒", name: "Colecionador",        desc: "Comprou 3 equipamentos" },
  mestre_luz:     { icon: "💡", name: "Mestre da luz",       desc: "Nota 90+ numa foto noturna" },
  formado:        { icon: "🏆", name: "Fotógrafo formado",   desc: "Completou as 20 fases" },
};

export const UI = {
  title: "FotoQuest",
  subtitle: "A jornada do fotógrafo",
  pressStart: "Toque ou pressione E para começar",
  mapTitle: "Mapa da jornada",
  locked: "Bloqueada — complete a fase anterior",
  talkHint: "E · falar",
  camHint: "C · modo câmera",
  exitHint: "Saída ➜",
  questTitle: "Missões",
  galleryTitle: "Minhas fotos",
  shopTitle: "Loja de equipamentos",
  statsTitle: "Meu desempenho",
};
