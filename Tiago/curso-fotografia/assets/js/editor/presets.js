/* ============================================================
   FotoLab · presets.js
   Predefinições ("filtros"). Cada uma é só um conjunto de ajustes —
   o aluno aplica e depois ABRE os painéis para ver o que mudou.
   É o melhor caminho pedagógico: primeiro o efeito, depois a receita.
   ============================================================ */

export const PRESETS = [
  { id: 'original', name: 'Original', desc: 'Volta tudo ao zero.', adj: {} },
  { id: 'nitido', name: 'Revelação básica', desc: 'O tratamento mínimo de qualquer foto: um respiro nas sombras, brancos definidos e nitidez.', adj: { contrast: 12, shadows: 18, whites: 10, blacks: -8, clarity: 14, sharpen: 30, vibrance: 12 } },
  { id: 'retrato', name: 'Retrato suave', desc: 'Pele lisa (textura negativa), tom quente e sombras abertas.', adj: { exposure: 6, contrast: 6, shadows: 24, highlights: -14, temp: 10, vibrance: 14, saturation: -4, clarity: -18, sharpen: 18 } },
  { id: 'dourada', name: 'Hora dourada', desc: 'Puxa o âmbar do fim de tarde e fecha os pretos.', adj: { exposure: 4, contrast: 14, highlights: -18, shadows: 10, temp: 26, tint: 4, vibrance: 20, blacks: -12, vignette: 18 } },
  { id: 'pb', name: 'Preto e branco', desc: 'P&B com filtro vermelho: céu dramático, pele clara.', adj: { bw: true, bwFilter: 'vermelho', contrast: 20, blacks: -14, whites: 10, clarity: 20, grain: 14 } },
  { id: 'filme', name: 'Filme antigo', desc: 'Contraste baixo, pretos levantados, grão e viragem sépia.', adj: { contrast: -10, shadows: 22, blacks: 18, temp: 12, saturation: -18, grain: 30, vignette: 14 } },
  { id: 'cinema', name: 'Cinema', desc: 'Sombras frias e altas luzes quentes — o visual de filme.', adj: { contrast: 16, highlights: -20, shadows: 14, temp: -8, tint: 6, saturation: -8, vibrance: 16, blacks: -10, vignette: 22 } },
  { id: 'produto', name: 'Produto', desc: 'Fundo limpo, cor fiel e detalhe: para vender no catálogo.', adj: { exposure: 10, contrast: 10, highlights: -8, shadows: 12, whites: 14, clarity: 18, sharpen: 45, vibrance: 8 } },
  { id: 'noturna', name: 'Noturna', desc: 'Salva a foto escura sem estourar as luzes da cidade.', adj: { exposure: 22, contrast: 14, highlights: -30, shadows: 30, blacks: -16, temp: -6, vibrance: 18, grain: 12, sharpen: 20 } },
  { id: 'gastro', name: 'Gastronomia', desc: 'Comida apetitosa: quente, saturada e com textura.', adj: { exposure: 8, contrast: 14, highlights: -12, shadows: 14, temp: 14, vibrance: 24, saturation: 6, clarity: 22, sharpen: 35, vignette: 12 } }
];
