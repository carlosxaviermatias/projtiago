const QUESTIONS_DATABASE = [
  {
    id: 1,
    level: "aplicar",
    banca: "FGV",
    ano: 2024,
    enunciado: "Considere a proposição: 'Se eu estudar bastante, então serei aprovado no concurso.' Uma proposição logicamente equivalente a essa é:",
    alternativas: [
      "Se eu não estudar bastante, então não serei aprovado no concurso.",
      "Se eu for aprovado no concurso, então estudei bastante.",
      "Eu não estudo bastante ou serei aprovado no concurso.",
      "Eu estudo bastante e não serei aprovado no concurso.",
      "Se eu não for aprovado no concurso, então estudei bastante."
    ],
    respostaCorreta: 2, // "Eu não estudo bastante ou serei aprovado no concurso." (~P v Q)
    explicacao: "A proposição dada é uma condicional da forma <b>P &rarr; Q</b> (Se P, então Q), onde:<br>• P: 'eu estudar bastante'<br>• Q: 'serei aprovado no concurso'.<br><br>Existem duas equivalências lógicas principais para a condicional:<br>1. <b>Contrapositiva:</b> ~Q &rarr; ~P (Se não Q, então não P). Seria: 'Se eu não for aprovado no concurso, então não estudei bastante'. (Não está nas alternativas).<br>2. <b>Disjunção Equivalente:</b> ~P v Q (Não P ou Q). Negamos a primeira parte, trocamos o 'Se... então' por 'ou' e mantemos a segunda parte. Ficaria: 'Eu não estudo bastante ou serei aprovado no concurso'.<br><br>Portanto, a alternativa correta é a <b>C</b>."
  },
  {
    id: 2,
    level: "aplicar",
    banca: "Cesgranrio",
    ano: 2023,
    enunciado: "A negação lógica da proposição 'Se chover hoje à tarde, então o trânsito ficará congestionado e eu chegarei atrasado' é equivalente a:",
    alternativas: [
      "Se não chover hoje à tarde, então o trânsito não ficará congestionado ou eu não chegarei atrasado.",
      "Chove hoje à tarde, e o trânsito não ficará congestionado ou eu não chegarei atrasado.",
      "Chove hoje à tarde, e o trânsito não ficará congestionado e eu não chegarei atrasado.",
      "Se o trânsito não ficar congestionado ou eu não chegar atrasado, então não choveu hoje à tarde.",
      "Não chove hoje à tarde, ou o trânsito não ficará congestionado ou eu não chegarei atrasado."
    ],
    respostaCorreta: 1, // "Chove hoje à tarde, e o trânsito não ficará congestionado ou eu não chegarei atrasado."
    explicacao: "Queremos negar uma condicional da forma <b>P &rarr; (Q &and; R)</b>.<br>A regra de negação da condicional é a regra do <i>'Mantém a primeira E NEGA a segunda'</i> (<b>P &and; ~(Q &and; R)</b>).<br><br>Aplicando a Lei de De Morgan para negar a conjunção <b>(Q &and; R)</b>, temos:<br><b>~(Q &and; R) &equiv; ~Q v ~R</b> (troca-se o 'e' por 'ou' e nega-se ambas).<br><br>Juntando tudo:<br>• Mantém a primeira: 'Chove hoje à tarde'<br>• Conectivo: 'E'<br>• Negação da segunda: 'o trânsito NÃO ficará congestionado OU eu NÃO chegarei atrasado'.<br><br>Fica: 'Chove hoje à tarde, e o trânsito não ficará congestionado ou eu não chegarei atrasado'.<br>Portanto, a alternativa correta é a <b>B</b>."
  },
  {
    id: 3,
    level: "aplicar",
    banca: "Cebraspe",
    ano: 2024,
    enunciado: "Considere as seguintes premissas:<br>Premissa 1: Todo concurseiro é focado.<br>Premissa 2: Nenhum focado é preguiçoso.<br>Com base nessas premissas, é correto concluir logicamente que:",
    alternativas: [
      "Algum concurseiro é preguiçoso.",
      "Nenhum concurseiro é preguiçoso.",
      "Todo focado é concurseiro.",
      "Algum preguiçoso é focado.",
      "Todos os preguiçosos são concurseiros."
    ],
    respostaCorreta: 1, // "Nenhum concurseiro é preguiçoso."
    explicacao: "Este é um problema de silogismo categórico que pode ser facilmente visualizado por diagramas de Venn:<br>1. 'Todo concurseiro é focado' significa que o conjunto dos Concurseiros (C) está totalmente contido no conjunto dos Focados (F) [C &sub; F].<br>2. 'Nenhum focado é preguiçoso' significa que os conjuntos dos Focados (F) e dos Preguiçosos (P) são disjuntos (não possuem elementos em comum) [F &cap; P = &empty;].<br><br>Como todo concurseiro está dentro de Focados, e Focados não tem nenhuma interseção com Preguiçosos, conclui-se que o conjunto dos Concurseiros também não tem nenhuma interseção com Preguiçosos.<br>Logo, <b>Nenhum concurseiro é preguiçoso</b>.<br><br>Portanto, a alternativa correta é a <b>B</b>."
  },
  {
    id: 4,
    level: "aplicar",
    banca: "FCC",
    ano: 2022,
    enunciado: "A negação da proposição 'Todo estudante de lógica passa no concurso' é:",
    alternativas: [
      "Nenhum estudante de lógica passa no concurso.",
      "Todos os estudantes de lógica não passam no concurso.",
      "Algum estudante de lógica não passa no concurso.",
      "Se uma pessoa não passa no concurso, então não é estudante de lógica.",
      "Algum estudante de lógica passa no concurso."
    ],
    respostaCorreta: 2, // "Algum estudante de lógica não passa no concurso."
    explicacao: "A proposição dada é um quantificador universal afirmativo: 'Todo A é B'.<br>Para negar uma proposição universal ('Todo' ou 'Nenhum'), precisamos apenas de um contraexemplo, ou seja, transformar em uma particular que contradiz a afirmação.<br><br>A regra de negação de <b>'Todo A é B'</b> é: <b>'Algum A não é B'</b> (ou 'Pelo menos um A não é B', ou 'Existe A que não é B').<br><br>• Proposição original: 'Todo estudante de lógica passa no concurso'<br>• Negação: 'Algum estudante de lógica NÃO passa no concurso'.<br><br>Nota: Nunca se nega o 'Todo' com 'Nenhum', pois 'Nenhum' é forte demais e não representa a negação lógica exata.<br>Portanto, a alternativa correta é a <b>C</b>."
  },
  {
    id: 5,
    level: "analisar",
    banca: "FGV",
    ano: 2023,
    enunciado: "Considere o seguinte argumento:<br>Premissa 1: Se o candidato faz resumos, então ele retém o conteúdo.<br>Premissa 2: O candidato não fez resumos.<br>Conclusão: O candidato não reteve o conteúdo.<br>Sobre esse argumento, é correto afirmar que:",
    alternativas: [
      "É um argumento válido, pois segue a regra do Modus Tollens.",
      "É um argumento inválido, apresentando a falácia da afirmação do consequente.",
      "É um argumento inválido, apresentando a falácia da negação do antecedente.",
      "É um argumento válido, pois se a premissa 2 é verdadeira, a conclusão necessariamente é verdadeira.",
      "É uma tautologia lógica inquestionável."
    ],
    respostaCorreta: 2, // Falácia da negação do antecedente
    explicacao: "Vamos simbolizar o argumento:<br>• P &rarr; Q (Se faz resumos, então retém)<br>• ~P (Não faz resumos)<br>• Conclusão: ~Q (Não retém)<br><br>Esse formato é uma clássica falácia formal conhecida como <b>Falácia da Negação do Antecedente</b>.<br>Apenas saber que fazer resumos implica reter o conteúdo não impede que o candidato retenha o conteúdo por outros meios (assistindo aulas, fazendo questões, etc.). Logo, negar que ele fez resumos não nos permite concluir com certeza que ele não reteve o conteúdo.<br><br>Para ser válido por Modus Tollens, o argumento deveria ser:<br>• P &rarr; Q<br>• ~Q<br>• Conclusão: ~P<br><br>Portanto, o argumento é inválido devido à falácia da negação do antecedente (Alternativa <b>C</b>)."
  },
  {
    id: 6,
    level: "avaliar",
    banca: "Cebraspe",
    ano: 2023,
    enunciado: "Avalie a validade da dedução lógica a seguir:<br>1. P &rarr; Q (Premissa)<br>2. Q &rarr; R (Premissa)<br>3. ~R (Premissa)<br>4. ~Q (Deduzido de 2 e 3 por Modus Tollens)<br>5. P (Deduzido de 1 e 4 por Modus Ponens)<br>Qual linha contém o primeiro ERRO de dedução lógica?",
    alternativas: [
      "Linha 1",
      "Linha 2",
      "Linha 3",
      "Linha 4",
      "Linha 5"
    ],
    respostaCorreta: 4, // Linha 5 (deveria ser ~P por Modus Tollens, não P por Modus Ponens)
    explicacao: "Vamos avaliar os passos dedutivos:<br>• Linhas 1, 2 e 3 são premissas dadas, portanto estão corretas.<br>• Linha 4: A partir de Q &rarr; R (2) e ~R (3), podemos deduzir ~Q usando a regra <i>Modus Tollens</i>. Esse passo está <b>correto</b>.<br>• Linha 5: A partir de P &rarr; Q (1) e ~Q (4), a dedução correta via <i>Modus Tollens</i> seria <b>~P</b>. O argumento afirma que foi deduzido <b>P</b> por <i>Modus Ponens</i>, o que é um erro crasso. O Modus Ponens requer a afirmação do antecedente (ter P para concluir Q), e não a negação do consequente.<br><br>Logo, o primeiro erro de dedução está na <b>Linha 5</b>."
  },
  {
    id: 7,
    level: "analisar",
    banca: "Vunesp",
    ano: 2024,
    enunciado: "Se nego que 'Pedro é engenheiro e Maria é advogada', a afirmação logicamente equivalente será:",
    alternativas: [
      "Pedro não é engenheiro e Maria não é advogada.",
      "Pedro não é engenheiro ou Maria não é advogada.",
      "Se Pedro não for engenheiro, então Maria não será advogada.",
      "Pedro é engenheiro ou Maria não é advogada.",
      "Pedro não é engenheiro se, e somente se, Maria não for advogada."
    ],
    respostaCorreta: 1, // "Pedro não é engenheiro ou Maria não é advogada."
    explicacao: "Para negar uma conjunção do tipo <b>P &and; Q</b>, aplicamos a Primeira Lei de De Morgan:<br><b>~(P &and; Q) &equiv; ~P v ~Q</b><br><br>Passos:<br>1. Nega-se a primeira proposição: 'Pedro não é engenheiro'.<br>2. Altera-se o conectivo 'e' pelo conectivo 'ou'.<br>3. Nega-se a segunda proposição: 'Maria não é advogada'.<br><br>Fica: 'Pedro não é engenheiro ou Maria não é advogada'.<br>A alternativa correta é a <b>B</b>."
  },
  {
    id: 8,
    level: "entender",
    banca: "FGV",
    ano: 2024,
    enunciado: "Uma proposição composta é considerada uma Contingência quando:",
    alternativas: [
      "Seu valor lógico é sempre verdadeiro, independentemente das proposições simples que a compõem.",
      "Seu valor lógico é sempre falso, independentemente das proposições simples que a compõem.",
      "Pode ser verdadeira ou falsa, dependendo dos valores lógicos das proposições simples componentes.",
      "É composta apenas por conectivos de negação (~).",
      "É equivalente a uma condicional cujo antecedente é falso."
    ],
    respostaCorreta: 2, // "Pode ser verdadeira ou falsa, dependendo..."
    explicacao: "Em lógica proposicional, classificamos as proposições compostas em três categorias baseadas em seus resultados na tabela-verdade:<br>1. <b>Tautologia:</b> O resultado na tabela-verdade é 100% verdadeiro (V).<br>2. <b>Contradição:</b> O resultado na tabela-verdade é 100% falso (F).<br>3. <b>Contingência:</b> O resultado apresenta valores verdadeiros (V) e falsos (F) a depender da combinação dos valores das proposições simples.<br><br>Logo, a alternativa correta é a <b>C</b>."
  }
];

// Export to window object for browser access
window.QUESTIONS_DATABASE = QUESTIONS_DATABASE;
