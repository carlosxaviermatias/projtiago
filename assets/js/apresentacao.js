/* =========================================================
   MODO APRESENTAÇÃO + ÍNDICE RECOLHÍVEL
   Curso Fotografia Digital com Smartphone — Tiago Tavares

   Transforma o conteúdo do módulo em slides de tela cheia,
   quebrando em cada <h2> e <h3>. Nada é duplicado no HTML:
   os slides são montados a partir da própria página.
   ========================================================= */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var doc = $(".doc");
  var body = $(".doc-body");
  if (!doc || !body) return;

  var ICO = {
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'
  };

  /* =======================================================
     1) ÍNDICE LATERAL RECOLHÍVEL
     ======================================================= */
  (function tocCollapse() {
    var toc = $(".toc", doc);
    if (!toc) return;
    var h5 = $("h5", toc);
    if (!h5) return;

    var KEY = "fotosmart-toc";

    // cabeçalho com botão de recolher
    var head = document.createElement("div");
    head.className = "toc-head";
    h5.parentNode.insertBefore(head, h5);
    head.appendChild(h5);

    var btn = document.createElement("button");
    btn.className = "toc-btn";
    btn.type = "button";
    btn.title = "Recolher o índice";
    btn.setAttribute("aria-label", "Recolher o índice");
    btn.innerHTML = ICO.left;
    head.appendChild(btn);

    // aba flutuante para reabrir
    var reopen = document.createElement("button");
    reopen.className = "toc-reopen";
    reopen.type = "button";
    reopen.title = "Mostrar o índice";
    reopen.innerHTML = ICO.right + "<span>Índice</span>";
    document.body.appendChild(reopen);

    function set(off, save) {
      doc.classList.toggle("toc-off", off);
      document.body.classList.toggle("toc-collapsed", off);
      if (save !== false) { try { localStorage.setItem(KEY, off ? "off" : "on"); } catch (e) {} }
    }

    btn.addEventListener("click", function () { set(true); });
    reopen.addEventListener("click", function () { set(false); });

    try { if (localStorage.getItem(KEY) === "off") set(true, false); } catch (e) {}
  })();

  /* =======================================================
     2) MONTAGEM DOS SLIDES
     ======================================================= */
  function buildSlides() {
    var out = [];
    var secs = $$(":scope > section", body);
    if (!secs.length) secs = [body];

    secs.forEach(function (sec) {
      var secTitle = "";
      var h2 = sec.querySelector("h2");
      if (h2) secTitle = h2.textContent.trim();

      var cur = null;
      var pending = [];

      function flush() {
        if (cur && cur.nodes.length) out.push(cur);
        cur = null;
      }
      function open(level, title) {
        flush();
        cur = { sec: secTitle, level: level, title: title, nodes: pending.slice() };
        pending = [];
      }

      Array.prototype.forEach.call(sec.children, function (node) {
        var tag = node.tagName;
        if (tag === "H2" || tag === "H3") {
          open(tag === "H2" ? 2 : 3, node.textContent.trim());
          cur.nodes.push(node);
          return;
        }
        // "Parte 1" e afins entram no próximo slide, nunca sozinhos
        if (!cur && node.classList && node.classList.contains("eyebrow")) {
          pending.push(node);
          return;
        }
        if (!cur) open(2, secTitle || "");
        cur.nodes.push(node);
      });
      flush();
    });

    return out;
  }

  var slides = buildSlides();
  if (!slides.length) return;

  /* =======================================================
     3) INTERFACE
     ======================================================= */
  var modTitle = (function () {
    var h1 = $(".mod-hero h1");
    return h1 ? h1.textContent.trim() : document.title.split("—")[0].trim();
  })();

  var pres = document.createElement("div");
  pres.className = "pres";
  pres.setAttribute("role", "dialog");
  pres.setAttribute("aria-label", "Modo apresentação");
  pres.innerHTML =
    '<div class="pres-top">' +
      '<span class="mod"></span>' +
      '<span class="sec"></span>' +
      '<span class="count"></span>' +
      '<div class="pres-tools">' +
        '<button type="button" data-act="index" title="Índice dos slides (O)">' + ICO.list + "</button>" +
        '<button type="button" data-act="help" title="Atalhos do teclado (?)">' + ICO.help + "</button>" +
        '<button type="button" data-act="full" title="Tela cheia (F)">' + ICO.expand + "</button>" +
        '<button type="button" data-act="exit" title="Sair (Esc)">' + ICO.close + "</button>" +
      "</div>" +
    "</div>" +
    '<div class="pres-stage">' +
      '<button type="button" class="pres-nav pres-prev" title="Anterior">' + ICO.left + "</button>" +
      '<button type="button" class="pres-nav pres-next" title="Próximo">' + ICO.right + "</button>" +
      '<div class="pres-center"><div class="pres-fit"><div class="pres-slide"></div></div></div>' +
      '<div class="pres-index"><h4>Slides deste módulo</h4><ol></ol></div>' +
      '<div class="pres-more" aria-hidden="true">' + ICO.down + "<span>role para ver mais</span></div>" +
      '<div class="pres-help"><h4>Atalhos</h4><dl>' +
        "<dt><kbd>→</kbd> <kbd>espaço</kbd></dt><dd>Próximo slide</dd>" +
        "<dt><kbd>←</kbd></dt><dd>Slide anterior</dd>" +
        "<dt><kbd>O</kbd></dt><dd>Índice dos slides</dd>" +
        "<dt><kbd>B</kbd></dt><dd>Tela preta (pausa)</dd>" +
        "<dt><kbd>F</kbd></dt><dd>Tela cheia</dd>" +
        "<dt><kbd>Home</kbd> <kbd>End</kbd></dt><dd>Primeiro / último</dd>" +
        "<dt><kbd>Esc</kbd></dt><dd>Sair da apresentação</dd>" +
      "</dl></div>" +
    "</div>" +
    '<div class="pres-foot"><i></i></div>';
  document.body.appendChild(pres);

  var stage = $(".pres-stage", pres);
  var center = $(".pres-center", pres);
  var fitBox = $(".pres-fit", pres);
  var slideEl = $(".pres-slide", pres);
  var elMod = $(".pres-top .mod", pres);
  var elSec = $(".pres-top .sec", pres);
  var elCount = $(".pres-top .count", pres);
  var bar = $(".pres-foot i", pres);
  var indexList = $(".pres-index ol", pres);
  var btnPrev = $(".pres-prev", pres);
  var btnNext = $(".pres-next", pres);

  elMod.textContent = modTitle;

  // índice de slides
  slides.forEach(function (s, i) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.type = "button";
    b.className = s.level === 3 ? "lv3" : "";
    b.innerHTML = '<span class="n">' + (i + 1) + "</span><span>" + (s.title || s.sec || "Slide") + "</span>";
    b.addEventListener("click", function () {
      pres.classList.remove("index-on");
      go(i);
    });
    li.appendChild(b);
    indexList.appendChild(li);
  });
  var indexBtns = $$("button", indexList);

  /* =======================================================
     4) NAVEGAÇÃO
     ======================================================= */
  var cur = -1;

  /* Encolhe o slide até caber na tela — como um slide de verdade.
     Ao encolher, alarga o conteúdo na mesma proporção para não sobrar
     faixa vazia dos lados. Abaixo de MIN_K o palco volta a rolar. */
  var MIN_K = 0.7;

  function fit() {
    if (!pres.classList.contains("open")) return;
    fitBox.style.height = "";
    slideEl.style.width = "";
    slideEl.style.transform = "";

    var cs = getComputedStyle(center);
    var availH = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    var baseW = fitBox.clientWidth;
    if (!availH || !baseW) return;

    var k = 1, h = slideEl.scrollHeight;
    for (var n = 0; n < 4; n++) {
      if (h <= availH) { k = 1; break; }
      var need = Math.max(MIN_K, availH / h * k);
      if (Math.abs(need - k) < 0.015) { k = need; break; }
      k = need;
      slideEl.style.width = baseW / k + "px";
      h = slideEl.scrollHeight;
      if (k <= MIN_K) break;
    }

    if (k >= 0.995) {
      slideEl.style.width = "";
      slideEl.style.transform = "";
      fitBox.style.height = "";
      fitBox.classList.remove("scaled");
    } else {
      slideEl.style.width = baseW / k + "px";
      slideEl.style.transform = "translateX(-50%) scale(" + k + ")";
      fitBox.style.height = slideEl.scrollHeight * k + "px";
      fitBox.classList.add("scaled");
    }

    // se ainda sobra conteúdo, avisa que dá para rolar
    pres.classList.toggle("more", stage.scrollHeight - stage.clientHeight > 12);
  }

  stage.addEventListener("scroll", function () {
    pres.classList.toggle("scrolled", stage.scrollTop > 8);
  }, { passive: true });

  var fitTimer;
  function scheduleFit() { clearTimeout(fitTimer); fitTimer = setTimeout(fit, 30); }
  window.addEventListener("resize", scheduleFit);

  function render(i) {
    var s = slides[i];
    slideEl.innerHTML = "";
    s.nodes.forEach(function (n) {
      var c = n.cloneNode(true);
      c.removeAttribute("id");
      $$("[id]", c).forEach(function (e) { e.removeAttribute("id"); });
      c.classList.remove("reveal");
      $$(".reveal", c).forEach(function (e) { e.classList.remove("reveal"); });
      slideEl.appendChild(c);
    });
    // reinicia a animação
    fitBox.style.animation = "none";
    void fitBox.offsetWidth;
    fitBox.style.animation = "";

    elSec.textContent = s.sec || "";
    elCount.textContent = i + 1 + " / " + slides.length;
    bar.style.width = ((i + 1) / slides.length) * 100 + "%";
    btnPrev.disabled = i === 0;
    btnNext.disabled = i === slides.length - 1;
    indexBtns.forEach(function (b, k) { b.classList.toggle("cur", k === i); });
    stage.scrollTop = 0;

    // imagens que ainda não carregaram mudam a altura → reajusta
    $$("img", slideEl).forEach(function (im) {
      if (!im.complete) im.addEventListener("load", scheduleFit, { once: true });
    });
    fit();
  }

  function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i === cur) return;
    pres.classList.toggle("rev", i < cur);
    cur = i;
    render(i);
    try { localStorage.setItem("fotosmart-pres-" + location.pathname, String(i)); } catch (e) {}
  }

  function next() { go(cur + 1); }
  function prev() { go(cur - 1); }

  btnNext.addEventListener("click", next);
  btnPrev.addEventListener("click", prev);

  /* =======================================================
     5) ABRIR / FECHAR
     ======================================================= */
  function isFull() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }

  function toggleFull() {
    if (isFull()) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else {
      var el = document.documentElement;
      var req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) { var p = req.call(el); if (p && p.catch) p.catch(function () {}); }
    }
  }

  function open(startAt) {
    pres.classList.add("open");
    document.documentElement.classList.add("pres-on");
    if (cur < 0) {
      var i = typeof startAt === "number" ? startAt : 0;
      cur = -1;
      go(i);
    }
    toggleFull();
    pres.focus();
  }

  function close() {
    pres.classList.remove("open", "blackout", "index-on", "help-on");
    document.documentElement.classList.remove("pres-on");
    if (isFull()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); }
    // volta a página para a seção que estava sendo apresentada
    var s = slides[cur];
    if (s && s.nodes[0]) {
      var sec = s.nodes[0].closest("section");
      if (sec) sec.scrollIntoView({ block: "start" });
    }
  }

  $$(".pres-tools button", pres).forEach(function (b) {
    b.addEventListener("click", function () {
      var a = b.dataset.act;
      if (a === "exit") close();
      else if (a === "full") toggleFull();
      else if (a === "index") pres.classList.toggle("index-on");
      else if (a === "help") pres.classList.toggle("help-on");
    });
  });

  // clicar fora fecha os painéis sobrepostos
  $(".pres-index", pres).addEventListener("click", function (e) {
    if (e.target === this) pres.classList.remove("index-on");
  });

  /* =======================================================
     6) TECLADO (compatível com apresentador remoto)
     ======================================================= */
  document.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;

    // fora do modo apresentação: P abre
    if (!pres.classList.contains("open")) {
      if ((e.key === "p" || e.key === "P") && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        open(0);
      }
      return;
    }

    var k = e.key;
    if (k === "Escape" || k === "Esc") {
      e.preventDefault();
      if (pres.classList.contains("index-on")) pres.classList.remove("index-on");
      else if (pres.classList.contains("help-on")) pres.classList.remove("help-on");
      else if (pres.classList.contains("blackout")) pres.classList.remove("blackout");
      else close();
      return;
    }
    // "Right"/"Left"/"Up"/"Down" = nomes antigos, usados por alguns apresentadores remotos
    if (k === "ArrowRight" || k === "Right" || k === "PageDown" || k === " " || k === "Spacebar" || k === "Enter" || k === "n") {
      e.preventDefault(); next(); return;
    }
    if (k === "ArrowLeft" || k === "Left" || k === "PageUp" || k === "Backspace") { e.preventDefault(); prev(); return; }
    if (k === "ArrowDown" || k === "Down") { e.preventDefault(); stage.scrollBy({ top: stage.clientHeight * 0.45 }); return; }
    if (k === "ArrowUp" || k === "Up") { e.preventDefault(); stage.scrollBy({ top: -stage.clientHeight * 0.45 }); return; }
    if (k === "Home") { e.preventDefault(); go(0); return; }
    if (k === "End") { e.preventDefault(); go(slides.length - 1); return; }
    if (k === "b" || k === "B" || k === ".") { e.preventDefault(); pres.classList.toggle("blackout"); return; }
    if (k === "f" || k === "F") { e.preventDefault(); toggleFull(); return; }
    if (k === "o" || k === "O") { e.preventDefault(); pres.classList.toggle("index-on"); return; }
    if (k === "?" || k === "h" || k === "H") { e.preventDefault(); pres.classList.toggle("help-on"); return; }
  });

  // sair da tela cheia pelo botão do navegador encerra a apresentação
  document.addEventListener("fullscreenchange", function () {
    if (!isFull() && pres.classList.contains("open")) close();
    else scheduleFit();
  });

  /* =======================================================
     7) GESTOS (celular/tablet)
     ======================================================= */
  (function swipe() {
    var x0 = null, y0 = null;
    stage.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) return;
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - x0, dy = t.clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.8) { dx < 0 ? next() : prev(); }
    }, { passive: true });
  })();

  /* =======================================================
     8) BOTÃO "APRESENTAR" NA PÁGINA
     ======================================================= */
  var openBtn = document.createElement("button");
  openBtn.type = "button";
  openBtn.className = "pres-open-btn";
  openBtn.innerHTML = ICO.play + "<span>Modo apresentação</span>";
  openBtn.addEventListener("click", function () { open(0); });

  var wrapBar = document.createElement("div");
  wrapBar.className = "pres-bar";
  wrapBar.appendChild(openBtn);
  var hint = document.createElement("span");
  hint.className = "hint";
  hint.innerHTML = "Tela cheia estilo slide · <kbd>P</kbd> abre · <kbd>→</kbd> avança · <kbd>Esc</kbd> sai";
  wrapBar.appendChild(hint);
  body.insertBefore(wrapBar, body.firstChild);

  // atalho pelo menu do topo
  var navList = $(".nav-links");
  if (navList) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = "#";
    a.textContent = "🎬 Apresentar";
    a.addEventListener("click", function (e) { e.preventDefault(); open(0); });
    li.appendChild(a);
    navList.insertBefore(li, navList.lastElementChild);
  }
})();
