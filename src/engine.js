import { characterById, buffs, difficulties, getElo, resources } from "./data.js";
import { getResonance } from "./rules.js";

const RESOURCE_CAP = 5;
const SHIELD_CAP_RATIO = 0.5;
const ENCOUNTER_SCALE = {
  normal: { health: 1, damage: 1 },
  elite: { health: 1.08, damage: 1.05 },
  mini: { health: 1.15, damage: 1.1 },
  boss: { health: 1.25, damage: 1.12 },
  finale: { health: 1.3, damage: 1.15 }
};

const cloneUnit = (character, side) => ({
  id: character.id,
  name: character.name,
  nameEn: character.nameEn,
  title: character.title,
  realm: character.realm,
  elo: character.elo,
  eloId: character.eloId,
  color: character.color,
  symbol: character.symbol,
  affinity: character.affinity,
  art: character.art,
  role: character.role,
  abilities: character.abilities || [],
  passive: character.passive,
  risk: character.risk,
  side,
  hp: character.maxHp || 100,
  maxHp: character.maxHp || 100,
  shield: 0,
  weakened: 0,
  stunned: 0
});

function living(units) {
  return units.filter((unit) => unit.hp > 0);
}

function nearestTarget(units) {
  return living(units).sort((a, b) => a.hp - b.hp)[0] || null;
}

function log(state, text) {
  state.log.unshift(text);
  state.log = state.log.slice(0, 12);
}

export function getAbilityResourceCosts(actor, ability) {
  const source = ability.costs || (ability.cost ? { essence: ability.cost } : {});
  return Object.entries(source).reduce((costs, [resourceId, amount]) => {
    const resolvedId = resourceId === "affinity" ? actor.affinity : resourceId;
    if (resolvedId && amount > 0) costs[resolvedId] = (costs[resolvedId] || 0) + amount;
    return costs;
  }, {});
}

function resourcePool(state, isPlayer) {
  return isPlayer ? state.resources : state.enemyResources;
}

function canPay(state, actor, ability, isPlayer) {
  const pool = resourcePool(state, isPlayer);
  return Object.entries(getAbilityResourceCosts(actor, ability)).every(([resourceId, amount]) => (pool?.[resourceId] || 0) >= amount);
}

export function canAffordAbility(state, actor, ability) {
  return canPay(state, actor, ability, true);
}

function gainResource(state, resourceId, amount = 1, isPlayer = true) {
  const pool = resourcePool(state, isPlayer);
  if (!pool || !resourceId) return 0;
  const current = pool[resourceId] || 0;
  const next = Math.min(RESOURCE_CAP, current + amount);
  pool[resourceId] = next;
  return next - current;
}

function addShield(unit, amount) {
  const cap = Math.round(unit.maxHp * SHIELD_CAP_RATIO);
  const applied = Math.max(0, Math.min(amount, cap - unit.shield));
  unit.shield += applied;
  return applied;
}

function handleUnitDown(state, unit) {
  if (unit.side === "player" && state.buffs.revive && !state.reviveUsed) {
    state.reviveUsed = true;
    unit.hp = Math.min(unit.maxHp, 18);
    unit.stunned = 0;
    log(state, "O Voto Derradeiro impede a queda de " + unit.name + ": resta 18 de Vida.");
    return false;
  }
  return true;
}

function hit(target, value, state, attacker) {
  const weakened = attacker?.weakened ? 0.75 : 1;
  const incoming = attacker?.side === "enemy" && target.side === "player"
    ? Math.max(0.5, 1 - (state.buffs.damageReduction || 0))
    : 1;
  let raw = Math.max(1, Math.round(value * weakened * incoming));
  const pierce = attacker?.side === "player" && target.side === "enemy"
    ? Math.min(raw, Math.round(raw * (state.buffs.pierce || 0)))
    : 0;
  const shieldable = raw - pierce;
  const blocked = Math.min(target.shield, shieldable);
  target.shield -= blocked;
  const dealt = shieldable - blocked + pierce;
  const wasAlive = target.hp > 0;
  target.hp = Math.max(0, target.hp - dealt);
  if (attacker?.weakened) attacker.weakened = 0;
  if (wasAlive && target.hp <= 0) handleUnitDown(state, target);
  return { dealt, blocked, downed: wasAlive && target.hp <= 0 };
}

function rewardForDefeat(state) {
  if (state.buffs.killEssence) gainResource(state, "essence", state.buffs.killEssence);
  if (state.buffs.killShield) {
    for (const ally of living(state.allies)) addShield(ally, state.buffs.killShield);
  }
}

function damageEnemyThroughThorns(state, target, amount) {
  const blocked = Math.min(target.shield, amount);
  target.shield -= blocked;
  const dealt = amount - blocked;
  const wasAlive = target.hp > 0;
  target.hp = Math.max(0, target.hp - dealt);
  log(state, "Os Espinhos da Alma devolvem " + dealt + " de dano a " + target.name + ".");
  if (wasAlive && target.hp <= 0) rewardForDefeat(state);
}

function applyAbility(state, actor, ability, selectedTarget, isPlayer = true) {
  const allies = isPlayer ? state.allies : state.enemies;
  const enemies = isPlayer ? state.enemies : state.allies;
  const target = selectedTarget && selectedTarget.hp > 0 ? selectedTarget : nearestTarget(enemies);
  const costs = getAbilityResourceCosts(actor, ability);
  const totalCost = Object.values(costs).reduce((sum, amount) => sum + amount, 0);
  const limboRisk = isPlayer && actor.realm === "Limbo" && totalCost > 0 && !state.passivesUsed.has(actor.id);
  if (!canPay(state, actor, ability, isPlayer)) return false;
  const pool = resourcePool(state, isPlayer);
  for (const [resourceId, amount] of Object.entries(costs)) pool[resourceId] -= amount;
  if (isPlayer && !totalCost) gainResource(state, "essence", 1);

  if (ability.kind === "guard") {
    const baseShield = ability.shield ?? (ability.target === "team" ? 18 : 22);
    const shield = baseShield + (isPlayer ? state.buffs.shieldPower : 0);
    if (ability.target === "team") {
      for (const member of living(allies)) addShield(member, shield);
    } else {
      addShield(actor, shield);
    }
    log(state, actor.name + " ergue " + ability.name + (ability.target === "team" ? " e protege o trio com " : " e se protege com ") + shield + " de escudo.");
  } else if (ability.kind === "support") {
    const weakest = [...living(allies)].sort((a, b) => a.hp - b.hp)[0] || actor;
    const healed = Math.min(20 + (isPlayer ? state.buffs.healing : 0), weakest.maxHp - weakest.hp);
    const shield = (ability.shield ?? 6) + (isPlayer ? state.buffs.shieldPower : 0);
    weakest.hp += healed;
    const shieldApplied = addShield(weakest, shield);
    log(state, actor.name + " usa " + ability.name + ": " + weakest.name + " recupera " + healed + " de Vida e recebe " + shieldApplied + " de escudo.");
  } else {
    if (!target) return false;
    const multiplier = isPlayer
      ? 1 + state.resonance.bonus + state.buffs.damage
      : state.enemyDamageMultiplier;
    const desperation = isPlayer && actor.hp / actor.maxHp <= 0.4 ? state.buffs.desperation : 0;
    const firstStrike = isPlayer && !state.firstStrikesUsed.has(actor.id) ? state.buffs.firstStrike : 0;
    const execution = isPlayer && target.hp / target.maxHp <= 0.35 ? state.buffs.execution : 0;
    const controlBonus = isPlayer && ability.kind === "control" ? state.buffs.controlBonus : 0;
    let damage = Math.round(ability.damage * multiplier * (1 + desperation)) + firstStrike + execution + controlBonus + (limboRisk ? 8 : 0);
    if (ability.kind === "burst") damage += 5;
    const result = hit(target, damage, state, actor);
    if (isPlayer && result.dealt && state.buffs.lifesteal) {
      const healed = Math.min(actor.maxHp - actor.hp, Math.floor(result.dealt * state.buffs.lifesteal));
      actor.hp += healed;
      if (healed) log(state, actor.name + " recupera " + healed + " de Vida ao drenar o alvo.");
    }
    if (ability.kind === "control" && target.hp > 0) target.weakened = 1;
    if (ability.kind === "burst" && target.hp > 0) target.stunned = 1;
    if (result.downed && isPlayer) rewardForDefeat(state);
    log(state, actor.name + " usa " + ability.name + " em " + target.name + " (" + result.dealt + " dano" + (result.blocked ? ", " + result.blocked + " bloqueado" : "") + ").");

    if (!isPlayer && result.dealt > 0 && state.buffs.thorns) {
      damageEnemyThroughThorns(state, actor, state.buffs.thorns);
    }
    if (limboRisk) {
      state.passivesUsed.add(actor.id);
      const selfLoss = Math.max(0, 8 + state.buffs.risk);
      actor.hp = Math.max(1, actor.hp - selfLoss);
      log(state, "A Corrente Quebrada cobra " + selfLoss + " de Vida de " + actor.name + ".");
    }
    if (isPlayer) state.firstStrikesUsed.add(actor.id);
  }
  if (isPlayer && actor.realm === "Inferno" && !state.passivesUsed.has(actor.id) && !["guard", "support"].includes(ability.kind)) {
    state.passivesUsed.add(actor.id);
    if (gainResource(state, "essence", 1)) {
      log(state, actor.name + " canaliza a força do Inferno: +1 de Essência.");
    }
  }
  if (!state.virtuePassiveUsed && state.allies.some((ally) => ally.realm === "Paraíso") && state.allies.some((ally) => ally.hp > 0 && ally.hp <= 40)) {
    state.virtuePassiveUsed = true;
    for (const ally of living(state.allies)) addShield(ally, 10);
    log(state, "A virtude protege o trio: cada aliado em pé recebe 10 de escudo.");
  }
  return true;
}

function endBattle(state, outcome) {
  state.phase = outcome;
  if (outcome === "victory") {
    log(state, "Vitória! A trilha pode seguir.");
  } else if (outcome === "defeat") {
    log(state, "O trio caiu. As Correntes da Alma perdem estabilidade.");
  }
}

function checkOutcome(state) {
  if (living(state.enemies).length === 0) endBattle(state, "victory");
  else if (living(state.allies).length === 0) endBattle(state, "defeat");
}

function targetPriority(target, aiLevel) {
  const hpRatio = target.hp / target.maxHp;
  const roleBonus = target.role === "Apoio" ? 11 : target.role === "Guardião" ? 4 : 0;
  return (1 - hpRatio) * (aiLevel >= 3 ? 24 : 17) + roleBonus * (aiLevel >= 3 ? 1.3 : 1);
}

function bestAiTarget(state, aiLevel) {
  return living(state.allies).sort((a, b) => {
    const scoreA = targetPriority(a, aiLevel);
    const scoreB = targetPriority(b, aiLevel);
    return scoreB - scoreA || a.hp - b.hp;
  })[0] || null;
}

function estimateEnemyDamage(state, actor, ability, target) {
  const base = (ability.damage || 0) * state.enemyDamageMultiplier;
  const burst = ability.kind === "burst" ? 5 : 0;
  const weak = actor.weakened ? 0.75 : 1;
  const reduced = Math.max(0.5, 1 - (state.buffs.damageReduction || 0));
  return Math.max(1, Math.round((base + burst) * weak * reduced));
}

function enemyAbilityScore(state, actor, ability, target, aiLevel) {
  const cost = Object.values(getAbilityResourceCosts(actor, ability)).reduce((sum, amount) => sum + amount, 0);
  if (ability.kind === "guard") {
    const guarded = ability.target === "team" ? living(state.enemies) : [actor];
    const needsGuard = guarded.some((unit) => unit.hp <= unit.maxHp * 0.82 || (unit.hp < unit.maxHp * 0.95 && unit.shield < 8));
    if (!needsGuard) return -20;
    const shield = ability.shield ?? (ability.target === "team" ? 18 : 22);
    const shieldRoom = guarded.reduce((sum, unit) => sum + Math.max(0, Math.round(unit.maxHp * SHIELD_CAP_RATIO) - unit.shield), 0);
    if (!shieldRoom) return -20;
    const danger = guarded.reduce((sum, unit) => sum + Math.max(0, 55 - unit.hp) * 0.28 + Math.max(0, 12 - unit.shield) * 0.35, 0);
    const effectiveShield = guarded.reduce((sum, unit) => sum + Math.min(shield, Math.max(0, Math.round(unit.maxHp * SHIELD_CAP_RATIO) - unit.shield)), 0);
    return Math.min(38, effectiveShield * 0.16 + danger + (aiLevel >= 3 ? 5 : 0)) - cost * (aiLevel >= 3 ? 0.5 : 2);
  }
  if (ability.kind === "support") {
    const weakest = nearestTarget(state.enemies);
    if (!weakest) return -20;
    const healing = Math.min(20, weakest.maxHp - weakest.hp);
    const shield = Math.min(ability.shield ?? 6, Math.max(0, Math.round(weakest.maxHp * SHIELD_CAP_RATIO) - weakest.shield));
    if (!healing && !shield) return -20;
    if (!healing && weakest.hp > weakest.maxHp * 0.85) return -20;
    const urgency = weakest.hp <= weakest.maxHp * 0.42 ? 17 : weakest.hp <= weakest.maxHp * 0.62 ? 8 : 0;
    return healing * 0.68 + shield * 0.35 + urgency - cost * (aiLevel >= 3 ? 0.5 : 2);
  }
  if (!target) return -100;
  const damage = estimateEnemyDamage(state, actor, ability, target);
  const kills = damage >= target.hp + target.shield;
  let score = damage * 0.4 + targetPriority(target, aiLevel) * 0.55;
  if (kills) score += aiLevel >= 3 ? 48 : 34;
  if (ability.kind === "control") score += target.role === "Apoio" ? 13 : 8;
  if (ability.kind === "burst") score += 12;
  return score - cost * (aiLevel >= 3 ? 0.5 : 2);
}

function chooseEnemyAction(state, actor, actorIndex = 0) {
  const aiLevel = state.difficulty.aiLevel;
  const abilities = actor.abilities || [];
  const basic = abilities.find((ability) => !Object.values(getAbilityResourceCosts(actor, ability)).some(Boolean)) || abilities[0];
  const affordable = abilities.filter((ability) => canPay(state, actor, ability, false));
  if (aiLevel <= 0) {
    const targets = living(state.allies);
    return { ability: basic, target: targets[(state.round + actorIndex) % targets.length] || null };
  }
  const available = affordable.length ? affordable : [basic].filter(Boolean);
  if (aiLevel === 1) {
    const target = nearestTarget(state.allies);
    const attacks = available.filter((ability) => !["guard", "support"].includes(ability.kind));
    const bestAttack = attacks.map((ability) => ({ ability, score: enemyAbilityScore(state, actor, ability, target, aiLevel) })).sort((a, b) => b.score - a.score)[0];
    const bestUtility = available.filter((ability) => ["guard", "support"].includes(ability.kind))
      .map((ability) => ({ ability, score: enemyAbilityScore(state, actor, ability, null, aiLevel) }))
      .sort((a, b) => b.score - a.score)[0];
    if (bestUtility && bestUtility.score > 0 && bestUtility.score >= (bestAttack?.score || 0) * 0.85) {
      return { ability: bestUtility.ability, target: null };
    }
    const ability = bestAttack?.ability || basic;
    return { ability, target };
  }
  const target = bestAiTarget(state, aiLevel);
  const plans = available.map((ability) => ({
    ability,
    target: ["guard", "support"].includes(ability.kind) ? null : target,
    score: enemyAbilityScore(state, actor, ability, ["guard", "support"].includes(ability.kind) ? null : target, aiLevel)
  })).sort((a, b) => b.score - a.score);
  const chosen = plans[0];
  return chosen ? { ability: chosen.ability, target: chosen.target } : { ability: basic, target: nearestTarget(state.allies) };
}

function enemyTurn(state) {
  state.phase = "enemy";
  for (const [actorIndex, actor] of living(state.enemies).entries()) {
    if (!living(state.allies).length) break;
    if (actor.stunned) {
      actor.stunned = 0;
      log(state, actor.name + " perde a ação sob atordoamento.");
      continue;
    }
    const { ability, target } = chooseEnemyAction(state, actor, actorIndex);
    if (ability) applyAbility(state, actor, ability, target, false);
  }
  checkOutcome(state);
  if (state.phase !== "victory" && state.phase !== "defeat") {
    state.round += 1;
    state.acted = [];
    let essenceGained = 0;
    const affinityGains = {};
    for (const ally of living(state.allies)) {
      essenceGained += gainResource(state, "essence", 1);
      affinityGains[ally.affinity] = (affinityGains[ally.affinity] || 0) + gainResource(state, ally.affinity, 1 + state.buffs.affinityPerRound);
    }
    essenceGained += gainResource(state, "essence", state.buffs.essencePerRound);
    const wounded = nearestTarget(state.allies);
    const roundHealing = wounded ? Math.min(state.buffs.roundHeal, wounded.maxHp - wounded.hp) : 0;
    if (wounded && roundHealing) {
      wounded.hp += roundHealing;
      log(state, "A trilha recompõe " + roundHealing + " de Vida de " + wounded.name + ".");
    }
    for (const enemy of living(state.enemies)) {
      gainResource(state, "essence", 1, false);
      gainResource(state, enemy.affinity, 1, false);
    }
    state.phase = "player";
    const affinitySummary = Object.entries(affinityGains).filter(([, amount]) => amount > 0).map(([id, amount]) => `+${amount} ${resources.find((resource) => resource.id === id)?.shortName || id}`).join(", ");
    log(state, "Rodada " + state.round + ": aliados em pé geram +" + essenceGained + " Essência" + (affinitySummary ? " e " + affinitySummary : "") + ".");
  }
}

function difficultyFor(id) {
  return difficulties.find((difficulty) => difficulty.id === id) || difficulties.find((difficulty) => difficulty.id === "veteran") || difficulties[0];
}

function encounterScaleFor(id) {
  return ENCOUNTER_SCALE[id] || ENCOUNTER_SCALE.normal;
}

export function createBattle(teamIds, enemyTeam, config = {}) {
  const resonance = getResonance(teamIds);
  const buffsApplied = config.buffs || [];
  const buffValues = buffsApplied.reduce((acc, id) => {
    const effect = buffs.find((buff) => buff.id === id)?.effect || {};
    for (const [key, value] of Object.entries(effect)) acc[key] = (acc[key] || 0) + value;
    return acc;
  }, {
    damage: 0, shield: 0, essence: 0, cinza: 0, graca: 0, ruptura: 0,
    maxHp: 0, resonance: 0, risk: 0, healing: 0, shieldPower: 0,
    damageReduction: 0, execution: 0, desperation: 0, lifesteal: 0,
    killEssence: 0, essencePerRound: 0, affinityPerRound: 0, firstStrike: 0,
    killShield: 0, openingWeakness: 0, allAffinity: 0, revive: 0,
    pierce: 0, roundHeal: 0, controlBonus: 0, thorns: 0
  });
  resonance.bonus += buffValues.resonance;
  const allies = teamIds.map((id) => characterById[id]).filter(Boolean).map((character) => {
    const unit = cloneUnit(character, "player");
    unit.maxHp += buffValues.maxHp;
    unit.hp = unit.maxHp;
    return unit;
  });
  const enemies = enemyTeam.map((character) => cloneUnit(character, "enemy"));
  const difficulty = difficultyFor(config.difficulty);
  const encounter = config.encounter || "normal";
  const encounterScale = encounterScaleFor(encounter);
  const enemyHealthMultiplier = difficulty.enemyHealth * encounterScale.health;
  const enemyDamageMultiplier = difficulty.enemyDamage * encounterScale.damage;
  for (const enemy of enemies) {
    enemy.maxHp = Math.max(1, Math.round(enemy.maxHp * enemyHealthMultiplier));
    enemy.hp = enemy.maxHp;
    enemy.damageMultiplier = enemyDamageMultiplier;
    if (buffValues.openingWeakness) enemy.weakened = 1;
  }
  for (const ally of allies) addShield(ally, buffValues.shield);

  const playerResources = Object.fromEntries(resources.map((resource) => [resource.id, buffValues[resource.id] || 0]));
  if (buffValues.allAffinity) {
    for (const affinity of new Set(allies.map((ally) => ally.affinity))) {
      playerResources[affinity] = Math.min(RESOURCE_CAP, (playerResources[affinity] || 0) + buffValues.allAffinity);
    }
  }
  const enemyResources = Object.fromEntries(resources.map((resource) => [resource.id, 0]));
  enemyResources.essence = difficulty.startingEssence + (encounter === "boss" || encounter === "finale" ? 1 : 0);
  for (const affinity of new Set(enemies.map((enemy) => enemy.affinity).filter(Boolean))) {
    enemyResources[affinity] = difficulty.startingAffinity + (encounter === "boss" || encounter === "finale" ? 1 : 0);
  }
  return {
    allies, enemies, round: 1, resources: playerResources, enemyResources, resonance,
    buffs: buffValues, difficulty, encounter, enemyHealthMultiplier, enemyDamageMultiplier,
    acted: [], passivesUsed: new Set(), firstStrikesUsed: new Set(), reviveUsed: false,
    virtuePassiveUsed: false, phase: "player",
    log: [`Combate iniciado · ${difficulty.name}. Ações do trio compartilham Essência.`],
    turnSlots: allies.length
  };
}

function finishPlayerAction(state) {
  checkOutcome(state);
  if (state.phase === "player" && living(state.allies).every((unit) => state.acted.includes(unit.id))) enemyTurn(state);
}

export function chooseAction(state, actorId, abilityId, targetId) {
  if (state.phase !== "player") return { ok: false, reason: "Não é seu turno." };
  const actor = state.allies.find((unit) => unit.id === actorId && unit.hp > 0);
  if (!actor || state.acted.includes(actor.id)) return { ok: false, reason: "Esse aliado já agiu." };
  if (actor.stunned) return { ok: false, reason: "Esse aliado está atordoado e perde a ação." };
  const ability = actor.abilities.find((item) => item.id === abilityId);
  if (!ability) return { ok: false, reason: "Técnica indisponível." };
  if (!canAffordAbility(state, actor, ability)) return { ok: false, reason: "Recursos insuficientes para essa técnica." };
  const target = state.enemies.find((unit) => unit.id === targetId && unit.hp > 0) || nearestTarget(state.enemies);
  if (!applyAbility(state, actor, ability, target, true)) return { ok: false, reason: "Não foi possível usar essa técnica." };
  state.acted.push(actor.id);
  finishPlayerAction(state);
  return { ok: true, state };
}

export function skipStunnedAction(state, actorId) {
  if (state.phase !== "player") return false;
  const actor = state.allies.find((unit) => unit.id === actorId && unit.hp > 0);
  if (!actor || !actor.stunned || state.acted.includes(actor.id)) return false;
  actor.stunned = 0;
  state.acted.push(actor.id);
  log(state, actor.name + " perde a ação sob atordoamento.");
  finishPlayerAction(state);
  return true;
}

export function passTurn(state) {
  if (state.phase !== "player") return false;
  for (const ally of living(state.allies)) {
    if (state.acted.includes(ally.id)) continue;
    state.acted.push(ally.id);
    if (ally.stunned) {
      ally.stunned = 0;
      log(state, ally.name + " perde a ação sob atordoamento.");
    } else {
      log(state, ally.name + " guarda sua ação para o próximo turno.");
    }
  }
  enemyTurn(state);
  return true;
}

export function createEnemyTeam(elo, playerIds, encounter = "normal", sequence = 0) {
  const pool = Object.values(characterById).filter((character) => character.eloId === elo.id && !playerIds.includes(character.id));
  const source = pool.length >= 3 ? pool : Object.values(characterById).filter((character) => character.eloId === elo.id);
  const boss = encounter === "boss";
  if (boss) {
    return [
      {
        id: "guardiao-" + elo.id, name: "Guardião do Elo da " + elo.name,
        title: "Guardião principal", realm: elo.realm, elo: elo.name, eloId: elo.id, color: elo.color, symbol: "✹", role: "Guardião",
        affinity: realmResourceFor(elo.realm), risk: false, abilities: [
          { id: "basic", name: elo.moves[0], kind: "strike", cost: 0, damage: 23, target: "enemy" },
          { id: "power", name: elo.moves[2], kind: "control", costs: { affinity: 1 }, damage: 28, target: "enemy" },
          { id: "ultimate", name: elo.moves[3], kind: "burst", costs: { essence: 1, affinity: 1 }, damage: 40, target: "enemy" }
        ]
      },
      ...[0, 1].map((offset) => ({
        id: "subordinado-" + elo.id + "-" + offset, name: ["Arauto", "Custódio"][offset] + " da " + elo.name,
        title: "Subordinado do guardião", realm: elo.realm, elo: elo.name, eloId: elo.id, color: elo.color, symbol: elo.symbol, role: offset ? "Guardião" : "Apoio",
        affinity: realmResourceFor(elo.realm), risk: false, abilities: [
          { id: "basic", name: elo.moves[offset], kind: "strike", cost: 0, damage: 16, target: "enemy" },
          { id: "power", name: elo.moves[offset + 1], kind: offset ? "guard" : "support", costs: { affinity: 1 }, damage: 20, shield: offset ? 18 : 6, target: offset ? "team" : "team" },
          { id: "ultimate", name: elo.moves[3], kind: "burst", costs: { essence: 1, affinity: 1 }, damage: 27, target: "enemy" }
        ]
      }))
    ];
  }
  return [0, 1, 2].map((index) => {
    const character = source[(sequence * 3 + index) % source.length];
    return {
      ...character,
      id: "oponente-" + sequence + "-" + index,
      name: encounter === "mini" && index === 0 ? "Guardião Menor: " + character.name : character.name
    };
  });
}

function realmResourceFor(realm) {
  return realm === "Inferno" ? "cinza" : realm === "Paraíso" ? "graca" : "ruptura";
}

export function getEloById(id) {
  return getElo(id);
}
