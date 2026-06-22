// Main Application Setup and Coordinator
document.addEventListener("DOMContentLoaded", () => {
  // Navigation State
  const sections = document.querySelectorAll(".bloom-section");
  const navItems = document.querySelectorAll(".nav-level-item");
  const pyramidSlices = document.querySelectorAll(".pyramid-slice");

  // Load progress
  let progressState = {
    1: false, // Lembrar
    2: false, // Entender
    3: false, // Aplicar
    4: false, // Analisar
    5: false, // Avaliar
    6: false  // Criar
  };

  const loadProgress = () => {
    const saved = localStorage.getItem("concurso_rlm_progress");
    if (saved) {
      try {
        progressState = JSON.parse(saved);
      } catch (e) {
        console.error("Error loading progress, resetting.");
      }
    }
    updateProgressUI();
  };

  const saveProgress = () => {
    localStorage.setItem("concurso_rlm_progress", JSON.stringify(progressState));
    updateProgressUI();
  };

  const updateProgressUI = () => {
    let completedCount = 0;
    for (let key = 1; key <= 6; key++) {
      const isDone = progressState[key];
      const indicator = document.getElementById(`progress-dot-level-${key}`);
      const pySlice = document.querySelector(`.pyramid-slice[data-level="${key}"]`);
      
      if (isDone) {
        completedCount++;
        if (indicator) indicator.classList.add("completed");
        if (pySlice) pySlice.classList.add("completed-slice");
      } else {
        if (indicator) indicator.classList.remove("completed");
        if (pySlice) pySlice.classList.remove("completed-slice");
      }
    }

    const percentage = Math.round((completedCount / 6) * 100);
    const progressFill = document.getElementById("header-progress-fill");
    const progressText = document.getElementById("header-progress-text");
    
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressText) progressText.innerText = `${percentage}%`;

    // Congratulate user on 100%
    const finalBadge = document.getElementById("congratulations-badge");
    if (finalBadge) {
      if (percentage === 100) {
        finalBadge.style.display = "flex";
      } else {
        finalBadge.style.display = "none";
      }
    }
  };

  // Nav function
  const navigateToLevel = (levelId) => {
    // Hide all
    sections.forEach((sec) => sec.classList.remove("active"));
    navItems.forEach((item) => item.classList.remove("active"));
    pyramidSlices.forEach((slice) => slice.classList.remove("active"));

    // Show target section
    const targetSection = document.getElementById(`level-section-${levelId}`);
    if (targetSection) {
      targetSection.classList.add("active");
      // Scroll to view if on mobile
      targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Set active in nav
    const activeNav = document.querySelector(`.nav-level-item[data-level="${levelId}"]`);
    if (activeNav) activeNav.classList.add("active");

    // Set active in pyramid
    const activeSlice = document.querySelector(`.pyramid-slice[data-level="${levelId}"]`);
    if (activeSlice) activeSlice.classList.add("active");
  };

  // Setup click listeners for nav and pyramid slices
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const level = item.dataset.level;
      navigateToLevel(level);
    });
  });

  pyramidSlices.forEach((slice) => {
    slice.addEventListener("click", () => {
      const level = slice.dataset.level;
      navigateToLevel(level);
    });
  });

  // Listen for progress achievements from modules
  window.addEventListener("bloom-progress", (e) => {
    const levelCompleted = e.detail.level;
    if (levelCompleted && !progressState[levelCompleted]) {
      progressState[levelCompleted] = true;
      saveProgress();
      showLevelUpToast(levelCompleted);
    }
  });

  const showLevelUpToast = (levelNum) => {
    const toast = document.getElementById("toast-achievement");
    const toastName = document.getElementById("toast-level-name");
    
    const levelNames = {
      1: "Lembrar - Domínio das tabelas-verdade",
      2: "Entender - Domínio dos diagramas de Venn",
      3: "Aplicar - Resolução correta de questões",
      4: "Analisar - Validade de argumentos estruturados",
      5: "Avaliar - Identificação crítica de falácias",
      6: "Criar - Construção e análise de fórmulas"
    };

    if (toast && toastName) {
      toastName.innerText = levelNames[levelNum];
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
      }, 4000);
    }
  };

  // Reset Progress Button
  const resetBtn = document.getElementById("reset-progress-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Deseja realmente resetar todo o seu progresso de estudos?")) {
        progressState = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
        saveProgress();
        // Reset submodules
        window.LembrarModule.initInteractiveTable();
        window.AplicarModule.init();
        window.AvaliarModule.init();
        alert("Progresso reiniciado com sucesso!");
      }
    });
  }

  // Initialize Modules
  if (window.LembrarModule) window.LembrarModule.init();
  if (window.EntenderModule) window.EntenderModule.init();
  if (window.AplicarModule) window.AplicarModule.init();
  if (window.AnalisarModule) window.AnalisarModule.init();
  if (window.AvaliarModule) window.AvaliarModule.init();
  if (window.CriarModule) window.CriarModule.init();

  // Load progress initially
  loadProgress();

  // Default view
  navigateToLevel(1);
});
