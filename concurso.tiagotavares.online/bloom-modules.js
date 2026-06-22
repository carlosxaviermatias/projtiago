// Módulo 1: Lembrar (Remember)
const LembrarModule = {
  flashcards: [
    { term: "Proposição", def: "Sentença declarativa que pode ser classificada como verdadeira ou falsa, mas não ambas." },
    { term: "Negação (~)", def: "Inverte o valor lógico da proposição. Se P é V, ~P é F." },
    { term: "Conjunção (^)", def: "Operador 'E'. Só é verdadeira quando AMBAS as proposições são verdadeiras." },
    { term: "Disjunção (v)", def: "Operador 'OU'. É verdadeira se pelo menos UMA das proposições for verdadeira." },
    { term: "Condicional (&rarr;)", def: "Operador 'Se... então'. Só é FALSA no caso 'Vera Fischer' (V &rarr; F)." },
    { term: "Bicondicional (&harr;)", def: "Operador 'se e somente se'. É verdadeira quando ambas possuem o MESMO valor lógico." },
    { term: "Tautologia", def: "Proposição composta que é sempre VERDADEIRA, independente dos valores das proposições simples." },
    { term: "Contradição", def: "Proposição composta que é sempre FALSA, independente dos valores das proposições simples." }
  ],
  currentCard: 0,

  init() {
    this.renderCard();
    this.setupListeners();
    this.initInteractiveTable();
  },

  setupListeners() {
    const cardEl = document.getElementById("flashcard");
    if (cardEl) {
      cardEl.onclick = () => cardEl.classList.toggle("flipped");
    }
    
    const prevBtn = document.getElementById("card-prev");
    const nextBtn = document.getElementById("card-next");
    
    if (prevBtn && nextBtn) {
      prevBtn.onclick = (e) => {
        e.stopPropagation();
        this.currentCard = (this.currentCard - 1 + this.flashcards.length) % this.flashcards.length;
        this.renderCard();
      };
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        this.currentCard = (this.currentCard + 1) % this.flashcards.length;
        this.renderCard();
      };
    }

    // Setup listeners for the Basic Logic Concepts tabs
    const tabButtons = document.querySelectorAll(".concept-tab-btn");
    const contentItems = document.querySelectorAll(".concept-content-item");
    tabButtons.forEach((btn) => {
      btn.onclick = () => {
        tabButtons.forEach((b) => b.classList.remove("active"));
        contentItems.forEach((item) => item.classList.remove("active"));
        btn.classList.add("active");
        const targetId = `concept-${btn.dataset.concept}`;
        const targetItem = document.getElementById(targetId);
        if (targetItem) {
          targetItem.classList.add("active");
        }
      };
    });
  },

  renderCard() {
    const card = this.flashcards[this.currentCard];
    const front = document.querySelector("#flashcard .front h3");
    const back = document.querySelector("#flashcard .back p");
    const counter = document.getElementById("card-counter");
    
    if (front && back && counter) {
      front.innerHTML = card.term;
      back.innerHTML = card.def;
      counter.innerText = `${this.currentCard + 1} / ${this.flashcards.length}`;
      document.getElementById("flashcard").classList.remove("flipped");
    }
  },

  tableExplanations: {
    "V-V": {
      title: "Linha 1: P é VERDADEIRO (V) e Q é VERDADEIRO (V)",
      details: [
        { op: "~P (Negação de P)", val: "F", desc: "Como P é Verdadeiro (V), a negação inverte o valor para <strong>Falso (F)</strong>." },
        { op: "P &and; Q (Conjunção 'E')", val: "V", desc: "A conjunção exige que ambas as partes sejam verdadeiras. Como P e Q são Verdadeiros (V), o resultado é <strong>Verdadeiro (V)</strong>." },
        { op: "P &or; Q (Disjunção 'OU')", val: "V", desc: "A disjunção exige que pelo menos um lado seja verdadeiro. Como ambos são Verdadeiros (V), o resultado é <strong>Verdadeiro (V)</strong>." },
        { op: "P &rarr; Q (Condicional)", val: "V", desc: "Na condicional (Se... então), o único caso falso é a antecedente Verdadeira implicando em consequente Falsa (V &rarr; F). Como temos V &rarr; V, o resultado é <strong>Verdadeiro (V)</strong>." }
      ]
    },
    "V-F": {
      title: "Linha 2: P é VERDADEIRO (V) e Q é FALSO (F)",
      details: [
        { op: "~P (Negação de P)", val: "F", desc: "Como P é Verdadeiro (V), a negação inverte o valor para <strong>Falso (F)</strong>." },
        { op: "P &and; Q (Conjunção 'E')", val: "F", desc: "A conjunção só é verdadeira se ambos forem V. Como Q é Falso (F), o resultado é <strong>Falso (F)</strong>." },
        { op: "P &or; Q (Disjunção 'OU')", val: "V", desc: "A disjunção exige apenas uma parte verdadeira. Como P é Verdadeiro (V), o resultado é <strong>Verdadeiro (V)</strong>." },
        { op: "P &rarr; Q (Condicional)", val: "F", desc: "Este é o clássico caso da <strong>'Vera Fischer' (V &rarr; F)</strong>, que é o único caso em que a condicional é <strong>Falsa (F)</strong>." }
      ]
    },
    "F-V": {
      title: "Linha 3: P é FALSO (F) e Q é VERDADEIRO (V)",
      details: [
        { op: "~P (Negação de P)", val: "V", desc: "Como P é Falso (F), a negação inverte o valor para <strong>Verdadeiro (V)</strong>." },
        { op: "P &and; Q (Conjunção 'E')", val: "F", desc: "A conjunção exige que ambos sejam V. Como P é Falso (F), o resultado é <strong>Falso (F)</strong>." },
        { op: "P &or; Q (Disjunção 'OU')", val: "V", desc: "A disjunção exige apenas um verdadeiro. Como Q é Verdadeiro (V), o resultado é <strong>Verdadeiro (V)</strong>." },
        { op: "P &rarr; Q (Condicional)", val: "V", desc: "Na condicional, se o ponto de partida (P) é falso, o resultado é sempre <strong>Verdadeiro (V)</strong>, pois não há quebra de promessa inicial (F &rarr; V = V)." }
      ]
    },
    "F-F": {
      title: "Linha 4: P é FALSO (F) e Q é FALSO (F)",
      details: [
        { op: "~P (Negação de P)", val: "V", desc: "Como P é Falso (F), a negação inverte o valor para <strong>Verdadeiro (V)</strong>." },
        { op: "P &and; Q (Conjunção 'E')", val: "F", desc: "Como ambos são Falsos (F), a conjunção é <strong>Falsa (F)</strong>." },
        { op: "P &or; Q (Disjunção 'OU')", val: "F", desc: "Como ambos são Falsos (F), a disjunção é <strong>Falsa (F)</strong>." },
        { op: "P &rarr; Q (Condicional)", val: "V", desc: "Na condicional, se o antecedente é Falso (F), o resultado é sempre <strong>Verdadeiro (V)</strong> (F &rarr; F = V)." }
      ]
    }
  },

  showRowExplanation(pVal, qVal) {
    const key = `${pVal ? 'V' : 'F'}-${qVal ? 'V' : 'F'}`;
    const exp = this.tableExplanations[key];
    if (!exp) return;

    const expBox = document.getElementById("table-explanation-box");
    const expTitle = document.getElementById("explanation-row-values");
    const expList = document.getElementById("explanation-details-list");

    if (expBox && expTitle && expList) {
      expTitle.innerText = exp.title;
      expList.innerHTML = "";
      exp.details.forEach((det) => {
        const li = document.createElement("li");
        
        let iconClass = "fa-solid fa-circle-info text-cyan";
        if (det.val === "V") {
          iconClass = "fa-solid fa-circle-check text-success";
        } else if (det.val === "F") {
          iconClass = "fa-solid fa-circle-xmark text-danger";
        }

        li.innerHTML = `
          <i class="${iconClass}"></i>
          <div>
            <strong>${det.op} &rArr; ${det.val}</strong>: ${det.desc}
          </div>
        `;
        expList.appendChild(li);
      });
      expBox.style.display = "block";
    }
  },

  initInteractiveTable() {
    const tableBody = document.getElementById("interactive-table-body");
    if (!tableBody) return;

    // Hide explanation box initially
    const expBox = document.getElementById("table-explanation-box");
    if (expBox) expBox.style.display = "none";

    // Truth matrix columns: P, Q, ~P, P^Q, PvQ, P->Q
    const rows = [
      { p: true,  q: true,  notP: false, and: true,  or: true,  cond: true },
      { p: true,  q: false, notP: false, and: false, or: true,  cond: false },
      { p: false, q: true,  notP: true,  and: false, or: true,  cond: true },
      { p: false, q: false, notP: true,  and: false, or: false, cond: true }
    ];

    tableBody.innerHTML = "";
    rows.forEach((row, rowIndex) => {
      const tr = document.createElement("tr");
      
      // Known constants
      tr.innerHTML = `
        <td class="fixed-val">${row.p ? 'V' : 'F'}</td>
        <td class="fixed-val">${row.q ? 'V' : 'F'}</td>
      `;

      // Guessable columns
      const guessCols = [
        { key: 'notP', ans: row.notP },
        { key: 'and', ans: row.and },
        { key: 'or', ans: row.or },
        { key: 'cond', ans: row.cond }
      ];

      guessCols.forEach((col) => {
        const td = document.createElement("td");
        td.className = "guess-cell";
        td.dataset.answer = col.ans ? 'V' : 'F';
        td.innerText = "?";
        td.onclick = (e) => {
          if (td.innerText === "?") {
            td.innerText = "V";
            td.classList.add("guessing-v");
          } else if (td.innerText === "V") {
            td.innerText = "F";
            td.classList.remove("guessing-v");
            td.classList.add("guessing-f");
          } else {
            td.innerText = "?";
            td.classList.remove("guessing-f", "correct-guess", "wrong-guess");
          }
          // The click will bubble up to the row tr, highlighting the row and showing the explanation!
        };
        tr.appendChild(td);
      });

      // Row click listener to select row and show step-by-step logic rules
      tr.onclick = () => {
        tableBody.querySelectorAll("tr").forEach((r) => r.classList.remove("selected-row"));
        tr.classList.add("selected-row");
        this.showRowExplanation(row.p, row.q);
      };

      tableBody.appendChild(tr);
    });

    // Check Answers Button
    const checkBtn = document.getElementById("check-table-btn");
    const resultMsg = document.getElementById("table-result");
    if (checkBtn) {
      checkBtn.onclick = () => {
        const cells = tableBody.querySelectorAll(".guess-cell");
        let allCorrect = true;
        let unanswered = false;
        let firstWrongRowIndex = -1;

        cells.forEach((cell) => {
          const userVal = cell.innerText;
          const correctVal = cell.dataset.answer;

          if (userVal === "?") {
            unanswered = true;
            cell.classList.add("wrong-guess");
          } else if (userVal === correctVal) {
            cell.classList.remove("wrong-guess");
            cell.classList.add("correct-guess");
          } else {
            allCorrect = false;
            cell.classList.remove("correct-guess");
            cell.classList.add("wrong-guess");
          }
        });

        // Let's identify the first row that has a wrong or unanswered guess
        const trs = tableBody.querySelectorAll("tr");
        trs.forEach((tr, idx) => {
          const wrongCells = tr.querySelectorAll(".wrong-guess");
          if (wrongCells.length > 0 && firstWrongRowIndex === -1) {
            firstWrongRowIndex = idx;
          }
        });

        if (unanswered) {
          resultMsg.innerHTML = "<span class='text-warning'>Responda todas as células com '?' para verificar!</span>";
        } else if (allCorrect) {
          resultMsg.innerHTML = "<span class='text-success'>&check; Excelente! Todas as respostas estão corretas!</span>";
          window.dispatchEvent(new CustomEvent("bloom-progress", { detail: { level: 1 } }));
          // Show the first row's explanation on success
          tableBody.querySelectorAll("tr").forEach((r) => r.classList.remove("selected-row"));
          const firstRow = trs[0];
          if (firstRow) {
            firstRow.classList.add("selected-row");
            this.showRowExplanation(rows[0].p, rows[0].q);
          }
        } else {
          resultMsg.innerHTML = "<span class='text-danger'>Algumas respostas estão incorretas. Tente novamente!</span>";
          // Highlight the first wrong row and show its explanation to teach the user
          if (firstWrongRowIndex !== -1) {
            tableBody.querySelectorAll("tr").forEach((r) => r.classList.remove("selected-row"));
            const targetRow = trs[firstWrongRowIndex];
            if (targetRow) {
              targetRow.classList.add("selected-row");
              this.showRowExplanation(rows[firstWrongRowIndex].p, rows[firstWrongRowIndex].q);
            }
          }
        }
      };
    }
  }
};

// Módulo 2: Entender (Understand)
const EntenderModule = {
  activeDiagramRelation: "",

  init() {
    this.setupVennDiagram();
  },

  setupVennDiagram() {
    const buttons = document.querySelectorAll(".venn-control-btn");
    const infoText = document.getElementById("venn-info");

    buttons.forEach((btn) => {
      btn.onclick = () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const relation = btn.dataset.relation;
        this.activeDiagramRelation = relation;
        this.updateVennUI(relation, infoText);
      };
    });

    // Click the first button as default
    if (buttons.length > 0) {
      buttons[0].click();
    }
  },

  updateVennUI(relation, infoEl) {
    const svg = document.getElementById("venn-svg");
    if (!svg) return;

    // Reset classes
    svg.querySelectorAll("path, circle, rect").forEach((el) => {
      el.setAttribute("class", "venn-area");
    });

    let explanation = "";

    switch (relation) {
      case "union":
        svg.querySelector("#circleA").setAttribute("class", "venn-area highlighted");
        svg.querySelector("#circleB").setAttribute("class", "venn-area highlighted");
        svg.querySelector("#overlap").setAttribute("class", "venn-area highlighted-overlap");
        explanation = "<b>União (A &cup; B):</b> Representa a disjunção lógica (A v B). Contém elementos que pertencem ao conjunto A <i>ou</i> ao conjunto B (ou a ambos). Ex: 'Uma pessoa é fotógrafa ou advogada'.";
        break;
      case "intersection":
        svg.querySelector("#overlap").setAttribute("class", "venn-area highlighted-overlap");
        explanation = "<b>Interseção (A &cap; B):</b> Representa a conjunção lógica (A &and; B). Contém apenas elementos que pertencem SIMULTANEAMENTE a A <i>e</i> a B. Ex: 'Uma pessoa é fotógrafa e advogada'.";
        break;
      case "difference":
        svg.querySelector("#circleA").setAttribute("class", "venn-area highlighted");
        explanation = "<b>Diferença (A - B):</b> Representa a proposição 'A e não B' (A &and; ~B). Contém elementos que pertencem a A, mas que excluem terminantemente o conjunto B. Ex: 'Pedro estuda lógica, mas não estuda matemática'.";
        break;
      case "subset":
        // Todo A é B. Circle A should lie entirely inside B
        // Here we simulate the highlight where the outer circle A is empty except the overlap
        svg.querySelector("#overlap").setAttribute("class", "venn-area highlighted-overlap");
        svg.querySelector("#circleA").setAttribute("class", "venn-area empty-area"); // A - B is shaded out as empty
        explanation = "<b>Todo A é B (A &sub; B):</b> Significa que o conjunto A é subconjunto de B. A área exclusiva de A é vazia (riscada), significando que qualquer elemento de A obrigatoriamente está em B. Ex: 'Todo cientista é curioso'.";
        break;
      case "disjoint":
        svg.querySelector("#overlap").setAttribute("class", "venn-area empty-area"); // Intersection is shaded as empty
        explanation = "<b>Nenhum A é B (A &cap; B = &empty;):</b> Significa que os conjuntos são totalmente separados. A interseção (overlap) é vazia (riscada/inativa). Ex: 'Nenhum mamífero é réptil'.";
        break;
    }

    if (infoEl) {
      infoEl.innerHTML = explanation;
    }

    // Trigger progress for exploring at least one diagram
    window.dispatchEvent(new CustomEvent("bloom-progress", { detail: { level: 2 } }));
  }
};

// Módulo 3: Aplicar (Apply)
const AplicarModule = {
  currentQuestionIndex: 0,
  score: 0,
  answered: false,

  init() {
    this.score = 0;
    this.currentQuestionIndex = 0;
    this.renderQuestion();
    
    const nextBtn = document.getElementById("quiz-next-btn");
    if (nextBtn) {
      nextBtn.onclick = () => {
        this.nextQuestion();
      };
    }
  },

  renderQuestion() {
    this.answered = false;
    const questions = window.QUESTIONS_DATABASE.filter(q => q.level === "aplicar" || q.level === "entender");
    if (questions.length === 0) return;

    // Loop questions
    if (this.currentQuestionIndex >= questions.length) {
      this.showFinalScore(questions.length);
      return;
    }

    const question = questions[this.currentQuestionIndex];
    
    // UI Elements
    const cardTitle = document.getElementById("quiz-question-title");
    const questionText = document.getElementById("quiz-question-text");
    const optionsList = document.getElementById("quiz-options-list");
    const explanationCard = document.getElementById("quiz-explanation-card");
    const explanationText = document.getElementById("quiz-explanation-text");
    const nextBtn = document.getElementById("quiz-next-btn");
    
    if (!cardTitle || !questionText || !optionsList) return;

    cardTitle.innerHTML = `<span class="badge">${question.banca} - ${question.ano}</span>`;
    questionText.innerHTML = question.enunciado;
    optionsList.innerHTML = "";
    
    // Hide explanation and next button initially
    if (explanationCard) explanationCard.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";

    question.alternativas.forEach((opt, idx) => {
      const li = document.createElement("li");
      li.className = "quiz-option";
      li.innerHTML = `
        <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
        <span class="option-text">${opt}</span>
      `;
      li.onclick = () => {
        if (this.answered) return;
        this.selectAnswer(li, idx, question.respostaCorreta, question.explicacao);
      };
      optionsList.appendChild(li);
    });

    const progressMeter = document.getElementById("quiz-progress-meter");
    if (progressMeter) {
      progressMeter.style.width = `${((this.currentQuestionIndex) / questions.length) * 100}%`;
    }
  },

  selectAnswer(selectedLi, selectedIdx, correctIdx, explanation) {
    this.answered = true;
    const options = document.querySelectorAll(".quiz-option");
    
    options.forEach((li, idx) => {
      li.classList.add("disabled");
      if (idx === correctIdx) {
        li.classList.add("correct");
      }
    });

    if (selectedIdx === correctIdx) {
      selectedLi.classList.add("correct-select");
      this.score++;
    } else {
      selectedLi.classList.add("wrong-select");
    }

    // Show Explanation
    const explanationCard = document.getElementById("quiz-explanation-card");
    const explanationText = document.getElementById("quiz-explanation-text");
    const nextBtn = document.getElementById("quiz-next-btn");

    if (explanationCard && explanationText) {
      explanationText.innerHTML = explanation;
      explanationCard.style.display = "block";
      explanationCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (nextBtn) {
      nextBtn.style.display = "inline-block";
    }

    // Dispatch Progress
    window.dispatchEvent(new CustomEvent("bloom-progress", { detail: { level: 3 } }));
  },

  nextQuestion() {
    this.currentQuestionIndex++;
    this.renderQuestion();
  },

  showFinalScore(total) {
    const questionText = document.getElementById("quiz-question-text");
    const optionsList = document.getElementById("quiz-options-list");
    const explanationCard = document.getElementById("quiz-explanation-card");
    const nextBtn = document.getElementById("quiz-next-btn");
    const cardTitle = document.getElementById("quiz-question-title");
    
    if (cardTitle) cardTitle.innerHTML = `Resultado do Quiz`;
    if (explanationCard) explanationCard.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";

    if (questionText && optionsList) {
      questionText.innerHTML = `
        <div class="quiz-results">
          <h3>Parabéns por finalizar o Quiz Arena!</h3>
          <p class="score-display">Você acertou <strong class="text-success">${this.score}</strong> de <strong>${total}</strong> questões.</p>
          <p>${this.score >= total * 0.7 ? "Excelente desempenho! Você aplicou muito bem os conceitos!" : "Que tal revisar os flashcards e tentar novamente para melhorar sua nota?"}</p>
          <button class="btn btn-primary mt-3" id="restart-quiz-btn">Refazer Quiz</button>
        </div>
      `;
      optionsList.innerHTML = "";
      
      const restartBtn = document.getElementById("restart-quiz-btn");
      if (restartBtn) {
        restartBtn.onclick = () => {
          this.init();
        };
      }
    }
  }
};

// Módulo 4: Analisar (Analyze)
const AnalisarModule = {
  selectedPremise1: "",
  selectedPremise2: "",
  selectedConclusion: "",

  init() {
    this.setupAnalyzer();
  },

  setupAnalyzer() {
    const p1Select = document.getElementById("analise-p1");
    const p2Select = document.getElementById("analise-p2");
    const cSelect = document.getElementById("analise-c");
    const verifyBtn = document.getElementById("analyze-verify-btn");
    const resultBox = document.getElementById("analyze-result-box");

    if (verifyBtn && resultBox) {
      verifyBtn.onclick = () => {
        const p1 = p1Select.value;
        const p2 = p2Select.value;
        const c = cSelect.value;

        this.verifyArgument(p1, p2, c, resultBox);
      };
    }
  },

  verifyArgument(p1, p2, c, resultEl) {
    let isValid = false;
    let explanation = "";

    // P1: P -> Q (Se chove, molha)
    if (p1 === "p_cond_q") {
      if (p2 === "p") { // Premisse 2: P (Afirmação do Antecedente)
        if (c === "q") { // Modus Ponens
          isValid = true;
          explanation = "<b>Argumento VÁLIDO (Modus Ponens):</b> A premissa estabelece que P implica Q. Como P ocorreu, obrigatoriamente Q ocorre.";
        } else {
          explanation = "<b>Argumento INVÁLIDO:</b> Se P implica Q, e P ocorreu, a conclusão deve ser obrigatoriamente Q (e não ~P ou ~Q).";
        }
      } else if (p2 === "not_q") { // Premisse 2: ~Q (Negação do Consequente)
        if (c === "not_p") { // Modus Tollens
          isValid = true;
          explanation = "<b>Argumento VÁLIDO (Modus Tollens):</b> Se P implica Q, a ausência de Q (~Q) implica necessariamente a ausência de P (~P).";
        } else {
          explanation = "<b>Argumento INVÁLIDO:</b> Se P implica Q e não temos Q, a única conclusão lógica possível é a negação de P (~P).";
        }
      } else if (p2 === "not_p") { // Premisse 2: ~P (Negação do Antecedente)
        explanation = "<b>Argumento INVÁLIDO (Falácia da Negação do Antecedente):</b> Saber que P implica Q não nos diz nada sobre o que acontece quando P NÃO ocorre. Q ainda poderia ocorrer por outras razões.";
      } else if (p2 === "q") { // Premisse 2: Q (Afirmação do Consequente)
        explanation = "<b>Argumento INVÁLIDO (Falácia da Afirmação do Consequente):</b> Saber que P implica Q e que Q ocorreu não garante que P ocorreu. Q pode ter ocorrido por outras causas.";
      }
    }

    // P1: P ^ Q (E)
    if (p1 === "p_and_q") {
      if (p2 === "none") {
        if (c === "p" || c === "q") {
          isValid = true;
          explanation = "<b>Argumento VÁLIDO (Simplificação):</b> Se a conjunção P ^ Q é verdadeira, então cada uma das partes (P isoladamente, Q isoladamente) é necessariamente verdadeira.";
        } else {
          explanation = "<b>Argumento INVÁLIDO:</b> A partir de P ^ Q, só podemos deduzir P ou Q de forma isolada.";
        }
      } else {
        explanation = "<b>Argumento redundante ou inválido:</b> Com a premissa P ^ Q, não é necessária outra premissa de suporte simples para extrair P ou Q.";
      }
    }

    // P1: P v Q (OU)
    if (p1 === "p_or_q") {
      if (p2 === "not_p" && c === "q") {
        isValid = true;
        explanation = "<b>Argumento VÁLIDO (Silogismo Disjuntivo):</b> P ou Q é verdadeiro. Se sabemos que P é falso (~P), obrigatoriamente Q tem que ser verdadeiro.";
      } else if (p2 === "not_q" && c === "p") {
        isValid = true;
        explanation = "<b>Argumento VÁLIDO (Silogismo Disjuntivo):</b> P ou Q é verdadeiro. Se sabemos que Q é falso (~Q), obrigatoriamente P tem que ser verdadeiro.";
      } else if (p2 === "p" && c === "not_q") {
        explanation = "<b>Argumento INVÁLIDO:</b> A disjunção simples (OU) é inclusiva. Saber que P é verdadeiro não impede que Q também seja verdadeiro. O silogismo disjuntivo exige a negação de uma das partes.";
      } else {
        explanation = "<b>Argumento INVÁLIDO:</b> Para concluir algo de uma disjunção P v Q, precisamos negar uma das partes no conectivo de suporte.";
      }
    }

    // Update Result Box UI
    resultEl.style.display = "block";
    if (isValid) {
      resultEl.className = "alert-box success";
      resultEl.innerHTML = `
        <div class="result-title">&check; Argumento Válido</div>
        <p>${explanation}</p>
      `;
      window.dispatchEvent(new CustomEvent("bloom-progress", { detail: { level: 4 } }));
    } else {
      resultEl.className = "alert-box danger";
      resultEl.innerHTML = `
        <div class="result-title">&times; Argumento Inválido (Falácia)</div>
        <p>${explanation}</p>
      `;
    }
  }
};

// Módulo 5: Avaliar (Evaluate)
const AvaliarModule = {
  currentStage: 0,
  stages: [
    {
      title: "Caso 1: A Dedução dos Resultados",
      context: "Um analista de TI propõe a seguinte demonstração de código seguro a partir de três premissas:",
      steps: [
        { text: "1. Se o certificado expirar, então o sistema disparará alertas.", valid: true, errorMsg: "Isto é uma premissa válida dada como base do problema." },
        { text: "2. Se o sistema disparar alertas, então o administrador agirá rápido.", valid: true, errorMsg: "Isto é outra premissa dada. Passo válido." },
        { text: "3. O administrador não agiu rápido.", valid: true, errorMsg: "Esta é a terceira premissa dada. Passo válido." },
        { text: "4. O sistema não disparou alertas (Dedução de 2 e 3 por Modus Tollens).", valid: true, errorMsg: "Correto! Se A implica B, a ausência de B implica a ausência de A (~B -> ~A)." },
        { text: "5. O certificado expirou (Dedução de 1 e 4 por Modus Ponens).", valid: false, errorMsg: "<b>ERRO ENCONTRADO!</b> Se 'Certificado expirado' (P) implica 'Disparar alertas' (Q), sabendo que 'O sistema NÃO disparou alertas' (~Q), a conclusão lógica por Modus Tollens deveria ser 'O certificado NÃO expirou' (~P). Concluir que ele expirou é uma contradição de Modus Tollens!" }
      ]
    },
    {
      title: "Caso 2: O Diagnóstico do Paciente",
      context: "Um médico estuda o diagnóstico lógico a partir de premissas clínicas:",
      steps: [
        { text: "1. Se o paciente contraiu o vírus X, então ele apresentará febre alta.", valid: true, errorMsg: "Premissa inicial dada. Correta." },
        { text: "2. O paciente apresentou febre alta.", valid: true, errorMsg: "Fato constatado pelo exame físico (Premissa). Correto." },
        { text: "3. O paciente contraiu o vírus X (Dedução de 1 e 2 por afirmação do consequente).", valid: false, errorMsg: "<b>ERRO ENCONTRADO!</b> Isto é a Falácia da Afirmação do Consequente. O fato de o paciente ter febre (consequente) não prova que ele tem o vírus X (antecedente), pois a febre pode ser causada por inúmeras outras doenças!" }
      ]
    }
  ],

  init() {
    this.currentStage = 0;
    this.renderStage();
  },

  renderStage() {
    if (this.currentStage >= this.stages.length) {
      this.showVictory();
      return;
    }

    const stage = this.stages[this.currentStage];
    const stageTitle = document.getElementById("eval-stage-title");
    const stageContext = document.getElementById("eval-stage-context");
    const stepsList = document.getElementById("eval-steps-list");
    const resultBox = document.getElementById("eval-result-box");

    if (!stageTitle || !stageContext || !stepsList) return;

    stageTitle.innerText = stage.title;
    stageContext.innerText = stage.context;
    stepsList.innerHTML = "";
    
    if (resultBox) resultBox.style.display = "none";

    stage.steps.forEach((step, idx) => {
      const li = document.createElement("li");
      li.className = "eval-step-item";
      li.innerText = step.text;
      li.onclick = () => {
        this.selectStep(li, step, resultBox);
      };
      stepsList.appendChild(li);
    });
  },

  selectStep(selectedLi, step, resultEl) {
    const items = document.querySelectorAll(".eval-step-item");
    
    if (step.valid) {
      selectedLi.classList.add("valid-warning");
      if (resultEl) {
        resultEl.style.display = "block";
        resultEl.className = "alert-box info";
        resultEl.innerHTML = `<strong>Passo Válido:</strong> ${step.errorMsg}`;
      }
    } else {
      items.forEach(item => item.classList.add("disabled"));
      selectedLi.classList.add("found-error");
      
      if (resultEl) {
        resultEl.style.display = "block";
        resultEl.className = "alert-box success";
        resultEl.innerHTML = `
          <div class="result-title">&check; Detetive de Falácias: Erro Identificado!</div>
          <p>${step.errorMsg}</p>
          <button class="btn btn-primary mt-3" id="eval-next-btn">Próximo Caso</button>
        `;
        
        const nextBtn = document.getElementById("eval-next-btn");
        if (nextBtn) {
          nextBtn.onclick = () => {
            this.currentStage++;
            this.renderStage();
          };
        }
      }
      
      window.dispatchEvent(new CustomEvent("bloom-progress", { detail: { level: 5 } }));
    }
  },

  showVictory() {
    const stageTitle = document.getElementById("eval-stage-title");
    const stageContext = document.getElementById("eval-stage-context");
    const stepsList = document.getElementById("eval-steps-list");
    const resultBox = document.getElementById("eval-result-box");

    if (stageTitle) stageTitle.innerText = "Parabéns, Detetive!";
    if (stageContext) stageContext.innerText = "Você encontrou e avaliou corretamente todos os erros de dedução lógica apresentados!";
    if (stepsList) stepsList.innerHTML = "";
    if (resultBox) {
      resultBox.style.display = "block";
      resultBox.className = "alert-box success";
      resultBox.innerHTML = `
        <p>Sua capacidade de avaliar e auditar argumentos é excelente. Você dominou o Nível 5 (Avaliar) da Taxonomia de Bloom!</p>
        <button class="btn btn-primary mt-2" id="eval-reset-btn">Resetar Casos</button>
      `;
      const resetBtn = document.getElementById("eval-reset-btn");
      if (resetBtn) {
        resetBtn.onclick = () => {
          this.init();
        };
      }
    }
  }
};

// Módulo 6: Criar (Create)
const CriarModule = {
  init() {
    this.setupSandbox();
  },

  setupSandbox() {
    const inputFormula = document.getElementById("sandbox-formula-input");
    const charButtons = document.querySelectorAll(".char-btn");
    const buildBtn = document.getElementById("sandbox-build-btn");
    const clearBtn = document.getElementById("sandbox-clear-btn");
    const errorMsg = document.getElementById("sandbox-error-msg");
    const resultStats = document.getElementById("sandbox-stats");

    charButtons.forEach((btn) => {
      btn.onclick = () => {
        const char = btn.dataset.char;
        inputFormula.value += char;
        inputFormula.focus();
      };
    });

    if (clearBtn) {
      clearBtn.onclick = () => {
        inputFormula.value = "";
        errorMsg.innerText = "";
        if (resultStats) resultStats.style.display = "none";
        const tableHeader = document.getElementById("sandbox-table-header");
        const tableBody = document.getElementById("sandbox-table-body");
        if (tableHeader) tableHeader.innerHTML = "";
        if (tableBody) tableBody.innerHTML = "";
      };
    }

    if (buildBtn) {
      buildBtn.onclick = () => {
        const formula = inputFormula.value.trim();
        this.generateTruthTable(formula, errorMsg, resultStats);
      };
    }
  },

  // A tiny logical expression parser using RPN (Reverse Polish Notation)
  evaluateExpression(rpn, pVal, qVal) {
    const stack = [];
    for (const token of rpn) {
      if (token === 'P') {
        stack.push(pVal);
      } else if (token === 'Q') {
        stack.push(qVal);
      } else if (token === '~') {
        const val = stack.pop();
        stack.push(!val);
      } else if (token === '^') {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(a && b);
      } else if (token === 'v') {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(a || b);
      } else if (token === '→') {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(!a || b); // P -> Q is ~P v Q
      } else if (token === '↔') {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(a === b);
      }
    }
    return stack[0];
  },

  // Basic Shunting-Yard parser
  parseToRPN(formulaStr) {
    // Standardize input spacing/symbols
    let f = formulaStr
      .replace(/\s+/g, '')
      .replace(/->/g, '→')
      .replace(/<->/g, '↔')
      .replace(/\^/g, '^')
      .replace(/v/g, 'v')
      .replace(/~/g, '~')
      .replace(/!/g, '~');

    // Tokenize
    const tokens = [];
    for (let i = 0; i < f.length; i++) {
      const char = f[i];
      if (['P', 'Q', '~', '^', 'v', '→', '↔', '(', ')'].includes(char)) {
        tokens.push(char);
      } else {
        throw new Error(`Caractere inválido encontrado: ${char}`);
      }
    }

    const outQueue = [];
    const opStack = [];
    const prec = {
      '~': 5,
      '^': 4,
      'v': 3,
      '→': 2,
      '↔': 1
    };

    const isAssocRight = (op) => op === '~' || op === '→';

    for (const token of tokens) {
      if (token === 'P' || token === 'Q') {
        outQueue.push(token);
      } else if (token === '(') {
        opStack.push(token);
      } else if (token === ')') {
        while (opStack.length > 0 && opStack[opStack.length - 1] !== '(') {
          outQueue.push(opStack.pop());
        }
        if (opStack.length === 0) {
          throw new Error("Parênteses desbalanceados.");
        }
        opStack.pop(); // Remove '('
      } else { // Operator
        while (opStack.length > 0 && opStack[opStack.length - 1] !== '(') {
          const topOp = opStack[opStack.length - 1];
          if (
            (!isAssocRight(token) && prec[token] <= prec[topOp]) ||
            (isAssocRight(token) && prec[token] < prec[topOp])
          ) {
            outQueue.push(opStack.pop());
          } else {
            break;
          }
        }
        opStack.push(token);
      }
    }

    while (opStack.length > 0) {
      const topOp = opStack.pop();
      if (topOp === '(' || topOp === ')') {
        throw new Error("Parênteses desbalanceados.");
      }
      outQueue.push(topOp);
    }

    return outQueue;
  },

  generateTruthTable(formula, errorEl, statsEl) {
    errorEl.innerText = "";
    if (statsEl) statsEl.style.display = "none";

    if (!formula) {
      errorEl.innerText = "Por favor, digite ou monte uma fórmula antes de gerar.";
      return;
    }

    try {
      const rpn = this.parseToRPN(formula);
      
      // We must make sure it executes fine
      // Variables: P and Q. Generate rows.
      const rows = [
        { p: true,  q: true },
        { p: true,  q: false },
        { p: false, q: true },
        { p: false, q: false }
      ];

      const results = [];
      rows.forEach((row) => {
        const val = this.evaluateExpression(rpn, row.p, row.q);
        results.push({ p: row.p, q: row.q, res: val });
      });

      // Render Table
      const tableHeader = document.getElementById("sandbox-table-header");
      const tableBody = document.getElementById("sandbox-table-body");
      
      if (!tableHeader || !tableBody) return;

      // Clean
      tableHeader.innerHTML = `
        <tr>
          <th>P</th>
          <th>Q</th>
          <th>${formula}</th>
        </tr>
      `;

      tableBody.innerHTML = "";
      let trueCount = 0;
      let falseCount = 0;

      results.forEach((row) => {
        if (row.res) trueCount++; else falseCount++;
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.p ? 'V' : 'F'}</td>
          <td>${row.q ? 'V' : 'F'}</td>
          <td class="${row.res ? 'cell-true' : 'cell-false'}">${row.res ? 'V' : 'F'}</td>
        `;
        tableBody.appendChild(tr);
      });

      // Classify Proposition
      let typeText = "";
      let typeClass = "";
      if (trueCount === 4) {
        typeText = "TAUTOLOGIA";
        typeClass = "badge-success";
      } else if (falseCount === 4) {
        typeText = "CONTRADIÇÃO";
        typeClass = "badge-danger";
      } else {
        typeText = "CONTINGÊNCIA";
        typeClass = "badge-warning";
      }

      if (statsEl) {
        statsEl.style.display = "block";
        statsEl.innerHTML = `
          <p>A fórmula digitada representa uma <span class="badge ${typeClass}">${typeText}</span>.</p>
        `;
      }

      // Dispatch achievement logic for Level 6
      window.dispatchEvent(new CustomEvent("bloom-progress", { detail: { level: 6 } }));

    } catch (err) {
      errorEl.innerText = "Erro na análise da fórmula: " + err.message + "\nVerifique se os conectivos e parênteses estão equilibrados (ex: P ^ Q).";
    }
  }
};

// Export to window object
window.LembrarModule = LembrarModule;
window.EntenderModule = EntenderModule;
window.AplicarModule = AplicarModule;
window.AnalisarModule = AnalisarModule;
window.AvaliarModule = AvaliarModule;
window.CriarModule = CriarModule;
