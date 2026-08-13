/* ============================================================
   FotoQuest · validador de fases
   Roda fora do navegador: node validate-levels.mjs

   Pega os erros que só apareceriam jogando — caractere fora da
   legenda vira chão silenciosamente, alvo de missão que não existe
   trava a fase, mapa sem saída prende o jogador lá dentro.
   ============================================================ */

const RAIZ = new URL("../assets/js/game/data/levels.js", import.meta.url).pathname;
const { LEVELS, LEVEL_ORDER } = await import(`file://${RAIZ}`);

let erros = 0, avisos = 0;
const erro = (fase, msg) => { console.log(`  ✘ ${fase}: ${msg}`); erros++; };
const aviso = (fase, msg) => { console.log(`  ⚠ ${fase}: ${msg}`); avisos++; };

/* ---------- ordem e existência ---------- */
for (const id of LEVEL_ORDER) if (!LEVELS[id]) erro(id, "está em LEVEL_ORDER mas não existe em LEVELS");
for (const id of Object.keys(LEVELS)) if (!LEVEL_ORDER.includes(id)) erro(id, "existe em LEVELS mas ficou fora de LEVEL_ORDER");

for (const id of LEVEL_ORDER) {
  const L = LEVELS[id];
  if (!L) continue;

  /* ---------- cabeçalho ---------- */
  if (L.id !== id) erro(id, `campo id="${L.id}" diferente da chave`);
  for (const campo of ["nome", "emoji", "desc", "map", "legend", "targets", "quests"])
    if (L[campo] === undefined) erro(id, `falta o campo obrigatório "${campo}"`);
  if (typeof L.ambientLight !== "number") erro(id, "ambientLight precisa ser número (EV da cena)");
  if (L.unlocks && !LEVELS[L.unlocks]) erro(id, `unlocks aponta para "${L.unlocks}", que não existe`);

  /* ---------- mapa ---------- */
  const rows = L.map || [];
  const w = rows[0]?.length ?? 0;
  rows.forEach((r, i) => { if (r.length !== w) erro(id, `linha ${i} tem ${r.length} colunas (esperado ${w})`); });

  const conta = { player: 0, exit: 0 };
  const alvosNoMapa = new Set(), npcsNoMapa = new Set();
  const usados = new Set();

  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    usados.add(ch);
    const def = L.legend?.[ch];
    if (!def) { erro(id, `caractere "${ch}" em (${x},${y}) não está na legenda`); return; }
    if (def.spawn) {
      const s = def.spawn;
      if (s.type === "player" || s.type === "exit") conta[s.type]++;
      if (s.type === "target") alvosNoMapa.add(s.id);
      if (s.type === "npc") npcsNoMapa.add(s.id);
      if (def.under && !L.legend[def.under]) erro(id, `legenda "${ch}" tem under:"${def.under}" fora da legenda`);
    }
  }));

  if (conta.player !== 1) erro(id, `precisa de exatamente 1 spawn de player (achei ${conta.player})`);
  if (conta.exit !== 1) erro(id, `precisa de exatamente 1 saída (achei ${conta.exit})`);
  for (const ch of Object.keys(L.legend || {})) if (!usados.has(ch)) aviso(id, `legenda define "${ch}" mas o mapa não usa`);

  /* ---------- alvos ---------- */
  const alvosDef = new Set((L.targets || []).map((t) => t.id));
  for (const a of alvosNoMapa) if (!alvosDef.has(a)) erro(id, `mapa põe o alvo "${a}", que não está em targets[]`);
  for (const a of alvosDef) if (!alvosNoMapa.has(a)) aviso(id, `alvo "${a}" definido mas não colocado no mapa`);
  for (const t of L.targets || []) {
    if (!t.person && !t.sprite) erro(id, `alvo "${t.id}" não tem person nem sprite`);
    if (!t.concept) aviso(id, `alvo "${t.id}" sem concept (não entra nas estatísticas por conceito)`);
    const [a, b] = t.idealDistance || [];
    if (t.idealDistance && !(a < b)) erro(id, `alvo "${t.id}" com idealDistance inválida [${a},${b}]`);
    if (t.wantsShallowDOF && t.wantsDeepDOF) erro(id, `alvo "${t.id}" pede DOF rasa E profunda ao mesmo tempo`);
  }

  /* ---------- NPCs ---------- */
  const npcsDef = new Set((L.npcs || []).map((n) => n.id));
  for (const n of npcsNoMapa) if (!npcsDef.has(n)) erro(id, `mapa põe o NPC "${n}", que não está em npcs[]`);
  for (const n of npcsDef) if (!npcsNoMapa.has(n)) aviso(id, `NPC "${n}" definido mas não colocado no mapa`);

  /* ---------- missões ---------- */
  const vistos = new Set();
  for (const q of L.quests || []) {
    if (vistos.has(q.id)) erro(id, `missão com id repetido "${q.id}"`);
    vistos.add(q.id);
    if (!npcsDef.has(q.giver)) erro(id, `missão "${q.id}" tem giver "${q.giver}" que não é NPC da fase`);
    if (!q.targetIds?.length) erro(id, `missão "${q.id}" sem targetIds`);
    for (const t of q.targetIds || []) if (!alvosDef.has(t)) erro(id, `missão "${q.id}" pede o alvo "${t}", que não existe`);
    if (typeof q.minScore !== "number") erro(id, `missão "${q.id}" sem minScore`);
    else if (q.minScore > 95) aviso(id, `missão "${q.id}" pede nota ${q.minScore} — quase impossível`);
    if (!q.intro?.length) aviso(id, `missão "${q.id}" sem diálogo de introdução`);
  }
  const givers = new Set((L.quests || []).map((q) => q.giver));
  for (const n of npcsDef) if (!givers.has(n) && !(L.npcs.find((x) => x.id === n)?.chat?.length))
    aviso(id, `NPC "${n}" não dá missão nem tem chat — não faz nada`);
}

console.log(`\n${erros ? "✘" : "✔"} ${LEVEL_ORDER.length} fases · ${erros} erro(s) · ${avisos} aviso(s)`);
process.exit(erros ? 1 : 0);
