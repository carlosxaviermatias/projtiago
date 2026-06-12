// Quiz Modulo 1 - Introducao a Fotografia
// Estruturado com Taxonomia de Bloom (lembrar, entender, aplicar, analisar, avaliar, criar)

const quizModulo1 = {
  titulo: "Quiz - Modulo 1 - Introducao a Fotografia Digital",
  questoes: [
    {
      num: 1,
      bloom: "lembrar",
      texto: "A palavra fotografia vem do grego e significa literalmente:",
      opcoes: [
        "Capturar a realidade",
        "Escrever com a luz",
        "Desenhar com sombras",
        "Congelar o tempo"
      ],
      correta: 1,
      explicacao: "Photo (luz) + graphein (escrever) = escrever com a luz."
    },
    {
      num: 2,
      bloom: "entender",
      texto: "O que e a camera escura e qual e sua importancia na historia da fotografia?",
      opcoes: [
        "Uma caixa fechada que projeta a imagem invertida de um objeto, foi o primeiro principio optico que inspirou a camera moderna",
        "Uma sala de laboratorio para revelar filmes fotograficos",
        "Um filtro usado em cameras analogicas para melhorar o contraste",
        "Um tipo especial de lente que captura imagens em ambientes escuros"
      ],
      correta: 0,
      explicacao: "A camera escura (camera obscura) e o principio base: um furo projeta a cena invertida. Os artistas usavam para desenhar com precisao."
    },
    {
      num: 3,
      bloom: "lembrar",
      texto: "O triangulo da exposicao e formado por tres ajustes. Quais sao?",
      opcoes: [
        "Foco, zoom e balanco de branco",
        "ISO, abertura e velocidade do obturador",
        "Diafragma, sensor e objetiva",
        "Histograma, brilho e contraste"
      ],
      correta: 1,
      explicacao: "ISO (sensibilidade), abertura (f) e velocidade (1/s) formam os tres vertices da exposicao correta."
    },
    {
      num: 4,
      bloom: "entender",
      texto: "Por que a abertura e medida em numeros f inversamente proporcionais ao tamanho? (Ex: f/1.8 e maior que f/16)",
      opcoes: [
        "E apenas uma convencao historica sem motivo tecnico",
        "Porque o numero f representa a proporcao entre a distancia focal da lente e o diametro da abertura",
        "Para confundir fotografos iniciantes",
        "Porque a luz refrata de forma inversa no sensor"
      ],
      correta: 1,
      explicacao: "f = distancia focal ÷ diametro da abertura. Quanto menor o resultado, maior a abertura. f/1.8 = grande (muita luz); f/16 = pequena (pouca luz)."
    },
    {
      num: 5,
      bloom: "aplicar",
      texto: "Voce esta fotografando um jogador saltando para fazer uma cesta. A luz e abundante. Qual ajuste de velocidade do obturador voce usaria para congelar o movimento?",
      opcoes: [
        "1/30 s (lenta)",
        "1/125 s (moderada)",
        "1/500 s a 1/1000 s (rapida)",
        "5 s (muito lenta para borrao criativo)"
      ],
      correta: 2,
      explicacao: "Movimentos rapidos exigem velocidades altas (fracoes pequenas). 1/500 a 1/1000 congela acoes explosivas. 1/30 deixaria borrao."
    },
    {
      num: 6,
      bloom: "entender",
      texto: "Qual e a relacao entre ISO e qualidade da imagem?",
      opcoes: [
        "ISO alto = imagem mais clara, sem perda de qualidade",
        "ISO baixo = imagem mais sensivel a luz, com mais ruido",
        "ISO alto = mais sensibilidade, MAS mais ruido/granulacao; ISO baixo = imagem mais limpa, precisa de mais luz",
        "ISO nao interfere na qualidade, so na velocidade de cameras digitais"
      ],
      correta: 2,
      explicacao: "Regra: use o menor ISO possivel para cada situacao. ISO 100 em dia ensolarado; ISO 1600-3200 em interiores; ISO acima de 3200 comeca a aparecer granulacao."
    },
    {
      num: 7,
      bloom: "aplicar",
      texto: "Voce quer fotografar um retrato com fundo desfocado (bokeh). Qual combinacao de ajustes e ideal?",
      opcoes: [
        "Abertura f/16 (pequena), velocidade 1/30 s, ISO 100",
        "Abertura f/1.8 ou f/2.8 (grande), velocidade moderada, ISO ajustado a luz",
        "Abertura f/8, velocidade 1/500 s, ISO 800",
        "Todas as opcoes acima funcionam igualmente bem"
      ],
      correta: 1,
      explicacao: "Aberturas grandes (numeros f pequenos) criam baixa profundidade de campo, desfocando o fundo. f/1.8-f/2.8 e ideal para retratos com bokeh."
    },
    {
      num: 8,
      bloom: "analisar",
      texto: "Ao fotografar com seu smartphone em modo manual (app FV-5), voce ve o histograma concentrado a esquerda. O que isso indica e o que voce faria?",
      opcoes: [
        "A foto esta corretamente exposta; histograma a esquerda e normal",
        "A foto esta superexposta (muito clara); voce diminuiria ISO/velocidade",
        "A foto esta subexposta (muito escura); voce aumentaria ISO, velocidade ou reduziria a abertura",
        "O histograma nao influencia a exposicao final"
      ],
      correta: 2,
      explicacao: "Histograma a esquerda = sombras concentradas = imagem escura. Solucao: aumentar ISO, aumentar velocidade, ou abrir mais o diafragma (se possivel)."
    },
    {
      num: 9,
      bloom: "avaliar",
      texto: "Qual e a vantagem de conhecer a regra dos tercos em vez de centralizar sempre o assunto?",
      opcoes: [
        "Nao ha vantagem real; e so uma moda de fotografos",
        "Composicoes fora do centro criam dinamismo, equilibrio visual mais interessante e guiam naturalmente o olhar do espectador",
        "Apenas profissionais precisam conhecer essa regra",
        "Serve apenas para fotografias de paisagem, nao para retratos"
      ],
      correta: 1,
      explicacao: "Posicionar o assunto sobre os pontos de forca (cruzamentos das linhas) cria composicoes naturalmente mais atraentes e profissionais que centralizar tudo."
    },
    {
      num: 10,
      bloom: "criar",
      texto: "Voce precisa fotografar o jornal sobre uma mesa em um dia nublado (pouca luz), quer o texto legivel (foco nitido) e o fundo desfocado. Qual seria sua estrategia de ajustes?",
      opcoes: [
        "Aumentar ISO para 3200, usar f/1.8, compensar a luz com menos velocidade (1/30)",
        "Usar ISO 100, f/16 e 1/8 s (tripe necessario)",
        "Aumentar ISO moderadamente (800-1600), usar a maior abertura possivel (f/2.8-f/4), velocidade rapida o bastante para evitar borrao (1/60-1/125) e confiar no ajuste de luz real",
        "Impossivel: voce teria que escolher entre foco total ou fundo desfocado"
      ],
      correta: 2,
      explicacao: "Solucao equilibrada: ISO um pouco elevado para dia nublado, abertura grande para desfoque do fundo E foco (profundidade) razoavel, velocidade segura para nao tremer. Sem luz extra, e um compromisso entre os tres."
    }
  ]
};

let quizState = {
  nome: "",
  respostas: [],
  currentQuestion: 0,
  iniciado: false
};

function iniciarQuiz() {
  const modal = document.getElementById("quizModal");
  const nomeInput = document.getElementById("nomeAluno");
  const nome = nomeInput.value.trim();

  if (!nome) {
    alert("Por favor, digite seu nome completo.");
    return;
  }

  quizState.nome = nome;
  quizState.iniciado = true;
  quizState.respostas = new Array(quizModulo1.questoes.length).fill(-1);

  document.getElementById("quizNomeModal").style.display = "none";
  document.getElementById("quizConteudo").style.display = "block";

  mostrarQuestao(0);
}

function mostrarQuestao(idx) {
  const q = quizModulo1.questoes[idx];
  const container = document.getElementById("quizQuestaoContainer");

  let html = `
    <div class="quiz-header">
      <h3>${q.num} de ${quizModulo1.questoes.length}</h3>
      <div class="quiz-progress"><div class="quiz-progress-bar" style="width: ${((idx + 1) / quizModulo1.questoes.length) * 100}%"></div></div>
    </div>
    <div class="quiz-question">
      <p class="quiz-bloom"><span class="bloom-badge bloom-${q.bloom}">${q.bloom.toUpperCase()}</span></p>
      <h4>${q.texto}</h4>
    </div>
    <div class="quiz-options">
  `;

  q.opcoes.forEach((opcao, i) => {
    const checked = quizState.respostas[idx] === i ? "checked" : "";
    html += `
      <label class="quiz-option">
        <input type="radio" name="opcao" value="${i}" ${checked} onchange="registrarResposta(${idx}, ${i})">
        <span>${String.fromCharCode(65 + i)})</span>
        <span>${opcao}</span>
      </label>
    `;
  });

  html += `
    </div>
    <div class="quiz-nav">
      <button class="btn btn--secondary" onclick="questaoAnterior()" ${idx === 0 ? "disabled" : ""}>Anterior</button>
      <button class="btn btn--primary" onclick="proximaQuestao()" ${idx === quizModulo1.questoes.length - 1 ? "disabled" : ""}>Proxima</button>
      ${idx === quizModulo1.questoes.length - 1 ? `<button class="btn btn--success" onclick="finalizarQuiz()">Finalizar e gerar gabarito</button>` : ""}
    </div>
  `;

  container.innerHTML = html;
  quizState.currentQuestion = idx;
}

function registrarResposta(questaoIdx, opcaoIdx) {
  quizState.respostas[questaoIdx] = opcaoIdx;
}

function proximaQuestao() {
  if (quizState.currentQuestion < quizModulo1.questoes.length - 1) {
    mostrarQuestao(quizState.currentQuestion + 1);
    document.getElementById("quizQuestaoContainer").scrollIntoView({ behavior: "smooth" });
  }
}

function questaoAnterior() {
  if (quizState.currentQuestion > 0) {
    mostrarQuestao(quizState.currentQuestion - 1);
    document.getElementById("quizQuestaoContainer").scrollIntoView({ behavior: "smooth" });
  }
}

function finalizarQuiz() {
  if (quizState.respostas.includes(-1)) {
    alert("Voce ainda nao respondeu todas as questoes. Revise antes de finalizar.");
    return;
  }

  let acertos = 0;
  quizModulo1.questoes.forEach((q, idx) => {
    if (quizState.respostas[idx] === q.correta) acertos++;
  });

  const nota = Math.round((acertos / quizModulo1.questoes.length) * 100);
  mostrarResultado(acertos, nota);
  gerarPDF(acertos, nota);
}

function mostrarResultado(acertos, nota) {
  const container = document.getElementById("quizQuestaoContainer");
  const emoji = nota >= 80 ? "Excelente!" : nota >= 60 ? "Bom!" : "Continuar estudando";

  let html = `
    <div class="quiz-resultado">
      <div class="resultado-card">
        <h3>Quiz finalizado!</h3>
        <p class="resultado-nome"><strong>${quizState.nome}</strong></p>
        <div class="resultado-nota">${nota}%</div>
        <p class="resultado-sub">${acertos} de ${quizModulo1.questoes.length} questoes corretas</p>
        <div class="resultado-msg">
          <p>${emoji}</p>
        </div>
        <a href="modulo-1-introducao.html" class="btn btn--secondary" style="margin-top: 20px;">Voltar ao Modulo</a>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function gerarPDF(acertos, nota) {
  if (typeof jsPDF === "undefined") {
    alert("PDF library nao carregada. Tente novamente.");
    return;
  }

  const doc = new jsPDF();
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();
  let y = 20;

  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text("Quiz - Modulo 1 - Introducao a Fotografia", largura / 2, y, { align: "center" });

  y += 15;
  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  doc.text("Aluno: " + quizState.nome, 20, y);
  y += 8;
  doc.text("Data: " + new Date().toLocaleDateString("pt-BR"), 20, y);
  y += 8;
  doc.text("Nota: " + nota + "% (" + acertos + "/" + quizModulo1.questoes.length + ")", 20, y);

  y += 15;
  doc.setFont(undefined, "bold");
  doc.setFontSize(12);
  doc.text("Respostas e Gabarito:", 20, y);

  y += 10;
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");

  quizModulo1.questoes.forEach((q, idx) => {
    const resposta = quizState.respostas[idx];
    const correta = q.correta === resposta;

    if (y > altura - 30) {
      doc.addPage();
      y = 20;
    }

    doc.text("Q" + q.num + ". " + q.texto.substring(0, 50) + "...", 20, y);
    y += 8;
    doc.text("Sua resposta: " + String.fromCharCode(65 + resposta), 25, y);
    y += 5;
    doc.text("Gabarito: " + String.fromCharCode(65 + q.correta), 25, y);
    y += 8;
  });

  const nomeArquivo = "Quiz-M1-" + quizState.nome.replace(/\s+/g, "-") + "-" + new Date().getTime() + ".pdf";
  doc.save(nomeArquivo);
}
