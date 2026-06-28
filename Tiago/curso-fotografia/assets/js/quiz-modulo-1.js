/* Quiz Modulo 1 - Introducao a Fotografia Digital
   10 questoes com imagens, alinhadas a Taxonomia de Bloom
   Gera PDF com gabarito e resultado do aluno
*/

var quizState = { nome: "", respostas: [], currentQuestion: 0, iniciado: false };

var questoes = [
  /* 1 - LEMBRAR */
  {
    nivel: "lembrar",
    badge: "Lembrar",
    enunciado: "Esta e considerada a primeira fotografia da historia, tirada em 1826. Quem a produziu?",
    imagem: "assets/img/historia/niepce-primeira-foto.jpg",
    imgAlt: "Vista da Janela em Le Gras, primeira fotografia da historia",
    opcoes: [
      "Louis Daguerre",
      "Joseph Nicephore Niepce",
      "Hercule Florence",
      "William Fox Talbot"
    ],
    correta: 1,
    explicacao: "Joseph Nicephore Niepce registrou 'Vista da Janela em Le Gras' em 1826 com exposicao de 8 horas, sendo considerada a primeira fotografia da historia."
  },

  /* 2 - LEMBRAR */
  {
    nivel: "lembrar",
    badge: "Lembrar",
    enunciado: "O que controla o ISO na fotografia digital?",
    imagem: null,
    opcoes: [
      "O tempo que o obturador fica aberto",
      "O tamanho do orificio do diafragma",
      "A sensibilidade do sensor a luz",
      "A distancia focal da objetiva"
    ],
    correta: 2,
    explicacao: "ISO mede a sensibilidade do sensor a luz. Quanto maior o ISO, mais sensivel (util no escuro), mas surge ruido/granulacao na imagem."
  },

  /* 3 - ENTENDER */
  {
    nivel: "entender",
    badge: "Entender",
    enunciado: "Observe esta pintura de Caravaggio. Que tecnica de iluminacao ele utilizou — a mesma que inspira fotografos ate hoje?",
    imagem: "assets/img/historia/caravaggio-sao-mateus.jpg",
    imgAlt: "A Vocacao de Sao Mateus - Caravaggio, exemplo de chiaroscuro",
    opcoes: [
      "Luz de preenchimento difusa",
      "Contraluz total (backlight)",
      "Claro-escuro (chiaroscuro) — contraste forte entre luz e sombra",
      "Luz plana e uniforme"
    ],
    correta: 2,
    explicacao: "O chiaroscuro (claro-escuro) e a tecnica de criar contraste dramatico entre areas de luz e escuridao. Caravaggio era mestre nisso — um feixe de luz corta a escuridao e guia o olhar. Fotografos de retrato usam essa ideia ate hoje."
  },

  /* 4 - ENTENDER */
  {
    nivel: "entender",
    badge: "Entender",
    enunciado: "Qual e a relacao entre o numero f (ex: f/1.8 ou f/16) e o tamanho da abertura do diafragma?",
    imagem: null,
    opcoes: [
      "Quanto maior o numero f, maior a abertura e mais luz entra",
      "Quanto menor o numero f, maior a abertura e mais luz entra",
      "O numero f nao afeta a quantidade de luz",
      "A relacao depende da marca da camera"
    ],
    correta: 1,
    explicacao: "O numero f e inversamente proporcional a abertura: f/1.8 e muito aberto (entra muita luz), f/16 e muito fechado (entra pouca luz). Confunde bastante pois e ao contrario do que parece!"
  },

  /* 5 - APLICAR */
  {
    nivel: "aplicar",
    badge: "Aplicar",
    enunciado: "Voce quer fazer um retrato com o rosto nítido e o fundo bem desfocado (bokeh). Qual configuracao de abertura vai escolher?",
    imagem: "assets/img/tecnica/profundidade-bokeh.jpg",
    imgAlt: "Exemplo de bokeh - fundo desfocado em retrato fotografico",
    opcoes: [
      "f/16 — abertura pequena, tudo nitido",
      "f/8 — abertura media, profundidade moderada",
      "f/2.8 — abertura grande, separa o sujeito do fundo",
      "f/22 — minima abertura, maxima nitidez"
    ],
    correta: 2,
    explicacao: "Para bokeh (fundo desfocado), use abertura grande = numero f pequeno como f/1.8, f/2.8. A profundidade de campo pequena separa o sujeito do fundo. Para retratos, f/1.8-f/2.8 e ideal."
  },

  /* 6 - APLICAR */
  {
    nivel: "aplicar",
    badge: "Aplicar",
    enunciado: "Voce quer fotografar um jogo de futevôlei na praia e congelar a bola no ar. Qual velocidade de obturador usar?",
    imagem: null,
    opcoes: [
      "1/15 s — velocidade lenta, cria efeito de rastro",
      "1/60 s — velocidade media, para pessoas paradas",
      "1/500 s — velocidade rapida, congela o movimento",
      "2 s — longa exposicao para luz suave"
    ],
    correta: 2,
    explicacao: "Para congelar acao rapida como uma bola no ar, use velocidade alta: 1/500s ou mais. Velocidades lentas (1/15, 1/30) criam rastros de movimento — bonito para agua ou carros, mas nao para esportes."
  },

  /* 7 - ANALISAR */
  {
    nivel: "analisar",
    badge: "Analisar",
    enunciado: "Analise esta fotografia. O ponto de interesse (carro) foi posicionado deliberadamente fora do centro. Que regra de composicao foi aplicada?",
    imagem: "assets/img/tecnica/regra-tercos.jpg",
    imgAlt: "Fotografia demonstrando a regra dos tercos com objeto fora do centro",
    opcoes: [
      "Composicao simetrica",
      "Regra dos tercos — sujeito posicionado no ponto de forca",
      "Enquadramento dentro do enquadramento",
      "Linha do horizonte centrada"
    ],
    correta: 1,
    explicacao: "A regra dos tercos divide o quadro em 9 partes iguais. Posicionar o sujeito nos 4 pontos de intersecao (pontos de forca) cria composicao mais dinamica e agradavel do que centralizar tudo."
  },

  /* 8 - ANALISAR */
  {
    nivel: "analisar",
    badge: "Analisar",
    enunciado: "Compare as duas imagens abaixo. f/5 (esquerda) tem fundo desfocado; f/32 (direita) tem tudo nitido. Por que a diferenca?",
    imagem: null,
    imgPair: ["assets/img/tecnica/abertura-f5.jpg", "assets/img/tecnica/abertura-f32.jpg"],
    imgAltPair: ["Abertura f/5 - baixa profundidade de campo", "Abertura f/32 - alta profundidade de campo"],
    opcoes: [
      "A diferenca e pelo ISO: f/5 tem ISO alto e f/32 tem ISO baixo",
      "A diferenca e pela velocidade: f/5 e mais rapido",
      "A abertura controla a profundidade de campo: f/5 (aberto) = fundo desfocado; f/32 (fechado) = tudo nitido",
      "Nao ha diferenca real, e edicao de pos-producao"
    ],
    correta: 2,
    explicacao: "A abertura controla diretamente a profundidade de campo. Abertura grande (f/5, f/1.8) = profundidade de campo pequena = fundo desfocado. Abertura pequena (f/32, f/16) = profundidade de campo grande = tudo nitido do perto ao longe."
  },

  /* 9 - AVALIAR */
  {
    nivel: "avaliar",
    badge: "Avaliar",
    enunciado: "Voce vai fotografar um por do sol na praia com pessoas se movendo. Seu objetivo e ter o ceu bem exposto, as pessoas como silhuetas e a agua com efeito sedoso. Qual combinacao de configuracoes faz mais sentido?",
    imagem: null,
    opcoes: [
      "ISO 3200, f/1.8, 1/1000s — maximo de velocidade e luz",
      "ISO 100, f/11, 2s — ISO baixo, boa profundidade, velocidade lenta para o efeito de agua",
      "ISO 800, f/2.8, 1/500s — boa para fotos de acao",
      "ISO 100, f/1.8, 1/8000s — abertura maxima para bokeh no por do sol"
    ],
    correta: 1,
    explicacao: "Para por do sol com agua sedosa: ISO baixo (100) = imagem limpa; f/11 = tudo nitido do primeiro plano ao horizonte; velocidade lenta (2s) = efeit de agua sedosa E as pessoas viram silhuetas pela exposicao longa. Isso e o triangulo da exposicao na pratica!"
  },

  /* 10 - CRIAR */
  {
    nivel: "criar",
    badge: "Criar",
    enunciado: "Observe esta foto com simetria perfeita e reflexo na agua. Voce foi fotografar o mesmo lago. Que decisoes de composicao voce tomaria para criar uma imagem com sensacao de calma e equilibrio?",
    imagem: "assets/img/tecnica/simetria-reflexo.jpg",
    imgAlt: "Fotografia com composicao simetrica e reflexo na agua",
    opcoes: [
      "Inclinar a camera 45 graus para criar dinamismo e tensao visual",
      "Posicionar o horizonte no centro do quadro, deixar a simetria dominar e aguardar agua calma para o reflexo ficar perfeito",
      "Usar zoom maximo e fotografar apenas detalhes do reflexo",
      "Posicionar o sujeito no canto superior direito quebrando a simetria"
    ],
    correta: 1,
    explicacao: "Para calma e equilibrio: horizonte centralizado enfatiza a simetria; agua parada cria o reflexo perfeito; composicao simetrica transmite ordem e paz. Linhas diagonais e enquadramentos dinamicos servem para tensao e movimento — o oposto do que se busca aqui."
  }
];

/* ---- Utilitarios ---- */
function nivelCor(n) {
  var cores = { lembrar:"#4e9af1", entender:"#7ec86e", aplicar:"#f4b03e", analisar:"#e07af0", avaliar:"#f07a7a", criar:"#f0a07a" };
  return cores[n] || "#aaa";
}

function iniciarQuiz() {
  var nomeEl = document.getElementById("quizNomeInput");
  if (!nomeEl) return;
  var nome = nomeEl.value.trim();
  if (!nome) { nomeEl.style.borderColor = "#f07a7a"; nomeEl.focus(); return; }
  nomeEl.style.borderColor = "";
  quizState.nome = nome;
  quizState.respostas = [];
  quizState.currentQuestion = 0;
  quizState.iniciado = true;
  document.getElementById("quizNomeModal").style.display = "none";
  document.getElementById("quizConteudo").style.display = "block";
  renderQuestao();
}

function renderQuestao() {
  var q = questoes[quizState.currentQuestion];
  var total = questoes.length;
  var idx = quizState.currentQuestion;
  var container = document.getElementById("quizQuestaoContainer");
  var progPct = Math.round((idx / total) * 100);

  var imgHtml = "";
  if (q.imgPair) {
    imgHtml = '<div class="quiz-img-pair">'
      + '<img src="' + q.imgPair[0] + '" alt="' + (q.imgAltPair ? q.imgAltPair[0] : "") + '" loading="lazy">'
      + '<img src="' + q.imgPair[1] + '" alt="' + (q.imgAltPair ? q.imgAltPair[1] : "") + '" loading="lazy">'
      + '</div>';
  } else if (q.imagem) {
    imgHtml = '<img src="' + q.imagem + '" alt="' + (q.imgAlt || "") + '" class="quiz-img-single" loading="lazy">';
  }

  var opcoesHtml = q.opcoes.map(function(op, i) {
    return '<label class="quiz-option"><input type="radio" name="qop" value="' + i + '"> <span>' + op + '</span></label>';
  }).join("");

  container.innerHTML =
    '<div class="quiz-progress-bar"><div style="width:' + progPct + '%"></div></div>'
    + '<div class="quiz-counter">Questao ' + (idx + 1) + ' de ' + total + '</div>'
    + '<div class="quiz-badge" style="background:' + nivelCor(q.nivel) + '">' + q.badge + '</div>'
    + '<p class="quiz-enunciado">' + q.enunciado + '</p>'
    + imgHtml
    + '<div class="quiz-opcoes">' + opcoesHtml + '</div>'
    + '<button class="btn btn--primary quiz-btn-prox" onclick="responderQuestao()">Proximo →</button>';
}

function responderQuestao() {
  var sel = document.querySelector('input[name="qop"]:checked');
  if (!sel) {
    var div = document.querySelector(".quiz-opcoes");
    if (div) { div.style.animation = "shake .3s ease"; setTimeout(function(){ div.style.animation=""; }, 400); }
    return;
  }
  quizState.respostas.push(parseInt(sel.value));
  quizState.currentQuestion++;
  if (quizState.currentQuestion < questoes.length) {
    renderQuestao();
  } else {
    renderResultado();
  }
}

function renderResultado() {
  var container = document.getElementById("quizQuestaoContainer");
  var acertos = 0;
  quizState.respostas.forEach(function(r, i) {
    if (r === questoes[i].correta) acertos++;
  });
  var pct = Math.round((acertos / questoes.length) * 100);
  var emoji = pct >= 80 ? "🏆" : pct >= 60 ? "📸" : "📚";
  var msg = pct >= 80 ? "Excelente domínio do conteudo!" : pct >= 60 ? "Bom progresso! Revise os topicos errados." : "Continue estudando — voce ja sabe bastante, mas precisa revisar!";

  var detalhes = questoes.map(function(q, i) {
    var certo = quizState.respostas[i] === q.correta;
    return '<div class="quiz-det-row ' + (certo ? "certo" : "errado") + '">'
      + '<span class="quiz-det-ico">' + (certo ? "✓" : "✗") + '</span>'
      + '<div><b>Q' + (i+1) + ' [' + q.badge + ']:</b> ' + (certo ? "Correta" : "Errada")
      + (certo ? "" : ' — Certa: <em>' + q.opcoes[q.correta] + '</em>')
      + '<br><small>' + q.explicacao + '</small></div></div>';
  }).join("");

  container.innerHTML =
    '<div class="quiz-resultado">'
    + '<div class="quiz-res-emoji">' + emoji + '</div>'
    + '<h3 class="quiz-res-nome">' + quizState.nome + '</h3>'
    + '<div class="quiz-res-score">' + acertos + '<span>/' + questoes.length + '</span></div>'
    + '<div class="quiz-res-pct">' + pct + '% de acertos</div>'
    + '<p class="quiz-res-msg">' + msg + '</p>'
    + '<div class="quiz-detalhes">' + detalhes + '</div>'
    + '<div class="quiz-acoes">'
    + '<button class="btn btn--outline" onclick="gerarPDF()">⬇ Baixar PDF com gabarito</button>'
    + '<button class="btn btn--primary" onclick="fecharQuiz()">Fechar</button>'
    + '</div>'
    + '</div>';
}

/* ---- Geracao de PDF ---- */
function gerarPDF() {
  var acertos = 0;
  quizState.respostas.forEach(function(r, i) { if (r === questoes[i].correta) acertos++; });
  var pct = Math.round((acertos / questoes.length) * 100);
  var data = new Date().toLocaleDateString("pt-BR");
  var hora = new Date().toLocaleTimeString("pt-BR", {hour:"2-digit", minute:"2-digit"});

  var linhas = [];
  linhas.push("QUIZ - MODULO 1: INTRODUCAO A FOTOGRAFIA DIGITAL");
  linhas.push("Curso Fotografia Digital com Smartphone - FotoSmart");
  linhas.push("Instrutor: Tiago Tavares");
  linhas.push("========================================");
  linhas.push("Aluno: " + quizState.nome);
  linhas.push("Data: " + data + " as " + hora);
  linhas.push("Resultado: " + acertos + "/" + questoes.length + " (" + pct + "%)");
  linhas.push("========================================");
  linhas.push("");
  linhas.push("GABARITO COMPLETO:");
  linhas.push("");

  questoes.forEach(function(q, i) {
    var certo = quizState.respostas[i] === q.correta;
    linhas.push("Q" + (i+1) + " [" + q.badge + "] " + q.enunciado);
    q.opcoes.forEach(function(op, oi) {
      var prefixo = oi === q.correta ? "[GABARITO] " : "[ ] ";
      var marcado = oi === quizState.respostas[i] && !certo ? "[ALUNO] " : "";
      linhas.push("  " + prefixo + marcado + op);
    });
    linhas.push("  >> " + q.explicacao);
    linhas.push("  Status: " + (certo ? "CORRETA" : "ERRADA"));
    linhas.push("");
  });

  var conteudo = linhas.join("\n");
  var blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "quiz-modulo1-" + quizState.nome.replace(/\s+/g, "-") + ".txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
