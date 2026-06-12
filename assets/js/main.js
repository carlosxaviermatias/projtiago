/* Fotografia Digital com Smartphone — interações compartilhadas */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---- Mobile menu ---- */
  const burger = $(".burger");
  const links = $(".nav-links");
  if (burger && links) {
    burger.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open);
    });
    $$(".nav-links a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        burger.classList.remove("open");
      })
    );
  }

  /* ---- Header shadow + reading progress ---- */
  const header = $(".site-header");
  const progress = $("#progress");
  const toTop = $("#toTop");
  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
    if (toTop) toTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---- Reveal on scroll ---- */
  const revs = $$(".reveal");
  if (revs.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    revs.forEach((r) => io.observe(r));
  } else revs.forEach((r) => r.classList.add("in"));

  /* ---- TOC scrollspy (module pages) ---- */
  const tocLinks = $$(".toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    const map = new Map();
    tocLinks.forEach((a) => {
      const id = a.getAttribute("href");
      if (id && id.startsWith("#")) {
        const sec = $(id);
        if (sec) map.set(sec, a);
      }
    });
    const spy = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            tocLinks.forEach((l) => l.classList.remove("active"));
            const a = map.get(e.target);
            if (a) a.classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    map.forEach((_, sec) => spy.observe(sec));
  }

  /* ---- Lightbox ---- */
  let lb = $("#lightbox");
  if (!lb) {
    lb = document.createElement("div");
    lb.id = "lightbox";
    lb.innerHTML = '<img alt=""><div class="lb-cap"></div>';
    document.body.appendChild(lb);
  }
  const lbImg = $("img", lb);
  const lbCap = $(".lb-cap", lb);
  $$(".zoomable, figure.frame img, .master .ph img").forEach((img) => {
    img.classList.add("zoomable");
    img.addEventListener("click", () => {
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || "";
      const fc = img.closest("figure") ? img.closest("figure").querySelector("figcaption") : null;
      lbCap.textContent = img.dataset.caption || (fc ? fc.textContent.trim() : img.alt || "");
      lb.classList.add("open");
    });
  });
  // Cards/elementos com data-img abrem um exemplo no lightbox
  $$("[data-img]").forEach((el) => {
    const openIt = () => {
      lbImg.src = el.dataset.img;
      lbImg.alt = el.dataset.cap || "";
      lbCap.textContent = el.dataset.cap || "";
      lb.classList.add("open");
    };
    el.addEventListener("click", openIt);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openIt(); }
    });
  });
  lb.addEventListener("click", () => lb.classList.remove("open"));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") lb.classList.remove("open");
  });

  /* ---- Glossary filter ---- */
  const gs = $("#glossarySearch");
  if (gs) {
    const terms = $$(".term");
    const groups = $$("[data-letter]");
    gs.addEventListener("input", () => {
      const q = gs.value.toLowerCase().trim();
      terms.forEach((t) => {
        const hit = t.textContent.toLowerCase().includes(q);
        t.style.display = hit ? "" : "none";
      });
      groups.forEach((g) => {
        const any = $$(".term", g).some((t) => t.style.display !== "none");
        g.style.display = any ? "" : "none";
      });
    });
  }

  /* ---- Editor interativo ao vivo (Módulo 3) ---- */
  const ed = $("#liveEditor");
  if (ed) {
    const img = $(".editor-img", ed);
    const temp = $(".editor-temp", ed);
    const bwBtn = $("#ec-bw", ed);
    let bw = false;
    const state = { brightness: 100, contrast: 100, saturate: 100, temp: 0 };
    function apply() {
      img.style.filter =
        "brightness(" + state.brightness + "%) contrast(" + state.contrast + "%) saturate(" +
        (bw ? 0 : state.saturate) + "%)";
      const t = state.temp;
      if (t === 0) {
        temp.style.opacity = 0;
      } else {
        temp.style.background = t > 0 ? "rgb(255,150,40)" : "rgb(40,120,255)";
        temp.style.opacity = Math.min((Math.abs(t) / 100) * 0.5, 0.5);
      }
    }
    function setOut(r) {
      const out = r.closest(".ec-row").querySelector("output");
      if (out) out.textContent = r.dataset.unit ? r.value + r.dataset.unit : (r.value > 0 ? "+" : "") + r.value;
    }
    $$("input[type=range]", ed).forEach((r) => {
      r.addEventListener("input", () => {
        state[r.dataset.filter] = +r.value;
        setOut(r);
        apply();
      });
    });
    if (bwBtn) {
      bwBtn.addEventListener("click", () => {
        bw = !bw;
        bwBtn.classList.toggle("active", bw);
        bwBtn.textContent = bw ? "Voltar à cor" : "Preto e branco";
        apply();
      });
    }
    const resetBtn = $("#ec-reset", ed);
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        state.brightness = 100; state.contrast = 100; state.saturate = 100; state.temp = 0;
        bw = false;
        if (bwBtn) { bwBtn.classList.remove("active"); bwBtn.textContent = "Preto e branco"; }
        $$("input[type=range]", ed).forEach((r) => {
          r.value = r.dataset.filter === "temp" ? 0 : 100;
          setOut(r);
        });
        apply();
      });
    }
    apply();
  }

  /* ---- Footer year ---- */
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
})();
