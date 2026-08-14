/* ============================================================
   FotoQuest · save.js
   Persistência em localStorage com versão de schema.

   Cada aluno tem seu próprio par de chaves, pela versão "slug" do
   nome que ele digita na entrada:
   - fotoquest-save:<slug>     progresso (pequeno, sempre salvo)
   - fotoquest-gallery:<slug>  fotos (thumbnails dataURL, podável)
   - fotoquest-perfil          último aluno usado neste navegador

   As chaves SEM slug são a versão antiga (jogo sem login). Elas são
   adotadas pelo primeiro nome que entrar, para ninguém perder o que
   já jogou.
   ============================================================ */

import { LEVEL_ORDER } from "./data/levels.js?v=8";

const SAVE_KEY = "fotoquest-save";
const GALLERY_KEY = "fotoquest-gallery";
const PROFILE_KEY = "fotoquest-perfil";
const SCHEMA = 1;
const GALLERY_MAX = 30;

/** conta do instrutor: tudo aberto e moedas infinitas */
export const PROF_SLUG = "professortiago";

/** "Ana Clara" e "ANACLARA" viram o mesmo aluno; acentos não atrapalham */
export function slugNome(nome) {
  return (nome || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]/g, "");
}

function freshSave() {
  return {
    schemaVersion: SCHEMA,
    xp: 0, level: 1, coins: 0,
    equipment: {
      owned: ["cam_basica", "lente_normal"],
      equipped: { camera: "cam_basica", lens: "lente_normal", flash: null, tripod: null },
    },
    levels: { fase01: { unlocked: true, bestScore: 0, questsDone: [] } },
    achievements: [],
    stats: { fotos: 0, somaNotas: 0, porConceito: {} },
  };
}

class SaveManager {
  constructor() {
    this.slug = localStorage.getItem(PROFILE_KEY) || null;
    this.nome = this.slug ? (this.lerNome(this.slug) || this.slug) : null;
    this.data = this.loadSave();
    this.gallery = this.loadGallery();
    this._t = null;
    if (this.isProf) this.aplicarModoProfessor();
  }

  /* ---------- perfis ---------- */

  get saveKey() { return this.slug ? `${SAVE_KEY}:${this.slug}` : SAVE_KEY; }
  get galleryKey() { return this.slug ? `${GALLERY_KEY}:${this.slug}` : GALLERY_KEY; }
  get isProf() { return this.slug === PROF_SLUG; }

  lerNome(slug) {
    try { return JSON.parse(localStorage.getItem(`${SAVE_KEY}:${slug}`))?.nome || null; }
    catch { return null; }
  }

  /** todos os alunos já criados neste navegador */
  listarPerfis() {
    const out = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k?.startsWith(`${SAVE_KEY}:`)) continue;
      const slug = k.slice(SAVE_KEY.length + 1);
      try {
        const d = JSON.parse(localStorage.getItem(k));
        out.push({ slug, nome: d?.nome || slug, nivel: d?.level || 1, fotos: d?.stats?.fotos || 0 });
      } catch { /* entrada corrompida: ignora */ }
    }
    return out.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  perfilExiste(slug) { return localStorage.getItem(`${SAVE_KEY}:${slug}`) !== null; }

  /** entra como um aluno; cria o perfil se for a primeira vez */
  entrar(nome) {
    const slug = slugNome(nome);
    if (!slug) return false;
    const novo = !this.perfilExiste(slug);
    this.slug = slug;
    this.nome = nome.trim();
    localStorage.setItem(PROFILE_KEY, slug);

    if (novo) {
      // primeiro nome a entrar herda o progresso do jogo antigo (sem login),
      // senão quem já jogava perderia tudo ao aparecer a tela de entrada
      const legado = localStorage.getItem(SAVE_KEY);
      if (legado && !this.listarPerfis().length) {
        try { this.data = { ...freshSave(), ...JSON.parse(legado) }; }
        catch { this.data = freshSave(); }
        try { this.gallery = JSON.parse(localStorage.getItem(GALLERY_KEY)) || []; }
        catch { this.gallery = []; }
      } else {
        this.data = freshSave();
        this.gallery = [];
      }
    } else {
      this.data = this.loadSave();
      this.gallery = this.loadGallery();
    }

    this.data.nome = this.nome;
    if (this.isProf) this.aplicarModoProfessor();
    this.flush();
    return true;
  }

  sair() {
    this.flush();
    localStorage.removeItem(PROFILE_KEY);
    this.slug = null; this.nome = null;
    this.data = freshSave();
    this.gallery = [];
  }

  /* ---------- modo professor ----------
     Conta de demonstração para dar aula: tudo aberto e moedas infinitas.
     Roda a cada entrada (e não só na criação) para que fases acrescentadas
     depois já apareçam abertas, sem precisar zerar o perfil. */
  aplicarModoProfessor() {
    for (const id of LEVEL_ORDER) this.levelState(id).unlocked = true;
    this.data.coins = Math.max(this.data.coins, 99999);
    this.save();
  }

  /** moedas para exibição — o professor vê ∞ */
  get coinsLabel() { return this.isProf ? "∞" : String(this.data.coins); }

  /** tenta pagar um preço; no modo professor sai sempre de graça */
  gastar(preco) {
    if (this.isProf) return true;
    if (this.data.coins < preco) return false;
    this.data.coins -= preco;
    this.save();
    return true;
  }

  loadSave() {
    try {
      const raw = localStorage.getItem(this.saveKey);
      if (!raw) return freshSave();
      const d = JSON.parse(raw);
      if (d.schemaVersion !== SCHEMA) return this.migrate(d);
      return { ...freshSave(), ...d };            // preenche chaves novas
    } catch { return freshSave(); }
  }

  migrate(old) {
    // migrações em cadeia entram aqui quando o schema evoluir
    const d = { ...freshSave(), ...old, schemaVersion: SCHEMA };
    return d;
  }

  loadGallery() {
    try { return JSON.parse(localStorage.getItem(this.galleryKey)) || []; }
    catch { return []; }
  }

  /** salvamento debounced — chamar à vontade */
  save() {
    clearTimeout(this._t);
    this._t = setTimeout(() => this.flush(), 400);
  }

  flush() {
    try { localStorage.setItem(this.saveKey, JSON.stringify(this.data)); } catch { /* quota */ }
    this.flushGallery();
  }

  flushGallery() {
    // poda FIFO protegendo a melhor foto de cada missão
    while (true) {
      try { localStorage.setItem(this.galleryKey, JSON.stringify(this.gallery)); return; }
      catch {
        const idx = this.gallery.findIndex((p) => !p.protected);
        if (idx < 0) { this.gallery.shift(); }
        else this.gallery.splice(idx, 1);
        if (!this.gallery.length) return;
      }
    }
  }

  addPhoto(photo) {
    // protege a melhor foto de cada missão
    if (photo.questId) {
      const prev = this.gallery.filter((p) => p.questId === photo.questId);
      const best = Math.max(0, ...prev.map((p) => p.score));
      if (photo.score >= best) {
        prev.forEach((p) => (p.protected = false));
        photo.protected = true;
      }
    }
    this.gallery.push(photo);
    while (this.gallery.length > GALLERY_MAX) {
      const idx = this.gallery.findIndex((p) => !p.protected);
      this.gallery.splice(idx < 0 ? 0 : idx, 1);
    }
    this.flushGallery();
  }

  /* ---------- progressão ---------- */

  xpForLevel(l) { return 100 * l * (l + 1) / 2; }   // 100, 300, 600, 1000…

  addXP(amount) {
    this.data.xp += amount;
    let ups = 0;
    while (this.data.xp >= this.xpForLevel(this.data.level)) this.data.level++, ups++;
    this.save();
    return ups;
  }

  addCoins(n) { this.data.coins += n; this.save(); }

  recordShot(concept, score) {
    const s = this.data.stats;
    s.fotos++; s.somaNotas += score;
    if (concept) {
      const c = (s.porConceito[concept] ||= { tentativas: 0, soma: 0 });
      c.tentativas++; c.soma += score;
    }
    this.save();
  }

  unlock(achId) {
    if (!this.data.achievements.includes(achId)) {
      this.data.achievements.push(achId);
      this.save();
      return true;
    }
    return false;
  }

  levelState(id) {
    return (this.data.levels[id] ||= { unlocked: false, bestScore: 0, questsDone: [] });
  }

  ownsItem(id) { return this.data.equipment.owned.includes(id); }
  equippedId(slot) { return this.data.equipment.equipped[slot]; }

  /** zera só o aluno atual — os outros perfis do navegador continuam */
  resetAll() {
    localStorage.removeItem(this.saveKey);
    localStorage.removeItem(this.galleryKey);
    this.data = freshSave();
    this.data.nome = this.nome;
    this.gallery = [];
    if (this.isProf) this.aplicarModoProfessor();
  }
}

export const save = new SaveManager();
