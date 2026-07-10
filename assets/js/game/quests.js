/* ============================================================
   FotoQuest · quests.js
   Estado das missões de uma fase.
   Fluxo: available → active (falar com o NPC) → complete
   (foto de cada alvo com nota mínima). Recompensas: XP,
   moedas, itens e conquistas.
   ============================================================ */

import { save } from "./save.js";

export class QuestLog {
  constructor(level) {
    this.level = level;
    const done = save.levelState(level.id).questsDone;
    this.state = {};   // questId → 'available' | 'active' | 'complete'
    this.progress = {}; // questId → Set de targetIds fotografados
    for (const q of level.quests) {
      this.state[q.id] = done.includes(q.id) ? "complete" : "available";
      this.progress[q.id] = new Set();
    }
  }

  byGiver(npcId) { return this.level.quests.filter((q) => q.giver === npcId); }

  activate(q) {
    if (this.state[q.id] === "available") this.state[q.id] = "active";
  }

  get activeQuests() { return this.level.quests.filter((q) => this.state[q.id] === "active"); }
  get allDone() { return this.level.quests.every((q) => this.state[q.id] === "complete"); }

  /** Retorna a missão ativa que pede este alvo (ou null). */
  questForTarget(targetId) {
    return this.activeQuests.find((q) => q.targetIds.includes(targetId)) || null;
  }

  /**
   * Registra uma foto avaliada. Se completou a missão, aplica
   * recompensas e devolve {quest, levelUps} para a UI anunciar.
   */
  registerPhoto(targetId, score) {
    const q = this.questForTarget(targetId);
    if (!q || score < q.minScore) return null;
    this.progress[q.id].add(targetId);
    const doneAll = q.targetIds.every((t) => this.progress[q.id].has(t));
    if (!doneAll) return { quest: q, partial: true };

    this.state[q.id] = "complete";
    const st = save.levelState(this.level.id);
    if (!st.questsDone.includes(q.id)) st.questsDone.push(q.id);

    const r = q.rewards || {};
    const levelUps = r.xp ? save.addXP(r.xp) : 0;
    if (r.coins) save.addCoins(r.coins);
    if (r.item && !save.ownsItem(r.item)) save.data.equipment.owned.push(r.item);
    if (r.achievement) save.unlock(r.achievement);

    // desbloqueia a próxima fase quando todas as missões terminam
    if (this.allDone && this.level.unlocks) {
      save.levelState(this.level.unlocks).unlocked = true;
    }
    save.save();
    return { quest: q, partial: false, levelUps };
  }
}
