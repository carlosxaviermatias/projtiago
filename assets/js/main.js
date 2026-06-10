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

  /* ---- Footer year ---- */
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
})();
