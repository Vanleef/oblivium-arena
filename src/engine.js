import { characterById, buffs, getElo, resources } from "./data.js";
import { getResonance } from "./rules.js";

const RESOURCE_CAP = 5;

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
  abilities: character.abilities,
  passive: character.passive,
  risk: character.risk,
  side,
  hp: 100,
  maxHp: 100,
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

export function canAffordAbility(state, actor, ability) {
  return Object.entries(getAbilityResourceCosts(actor, ability)).every(([resourceId, amount]) => (state.resources?.[resourceId] || 0) >= amount);
}

function gainResource(state, resourceId, amount = 1) {
  const current = state.resources[resourceId] || 0;
  const next = Math.min(RESOURCE_CAP, current + amount);
  state.resources[resourceId] = next;
  return next - current;
}

function hit(target, value, state) {
  let remaining = Math.max(1, Math.round(value * (target.weakened ? 0.75 : 1)));
  const blocked = Math.min(target.shield, remaining);
  target.shield -= blocked;
  remaining -= blocked;
  target.hp = Math.max(0, target.hp - remaining);
  target.weakened = 0;
  return { dealt: remaining, blocked };
}

function applyAbility(state, actor, ability, selectedTarget, isPlayer = true) {
  const allies = isPlayer ? state.allies : state.enemies;
  const enemies = isPlayer ? state.enemies : state.allies;
  const target = selectedTarget && selectedTarget.hp > 0 ? selectedTarget : nearestTarget(enemies);
  const costs = getAbilityResourceCosts(actor, ability);
  const totalCost = Object.values(costs).reduce((sum, amount) => sum + amount, 0);
  const limboRisk = isPlayer && actor.realm === "Limbo" && totalCost > 0 && !state.passivesUsed.has(actor.id);
  if (isPlayer && !canAffordAbility(state, actor, ability)) return false;
  if (isPlayer) for (const [resourceId, amount] of Object.entries(costs)) state.resources[resourceId] -= amount;
  if (!totalCost) gainResource(state, "essence", 1);

  if (ability.kind === "guard") {
    const shield = ability.shield ?? (ability.target === "team" ? 18 : 22);
    if (ability.target === "team") {
      for (const member of living(allies)) member.shield += shield;
    } else {
      actor.shield += shield;
    }
    log(state, actor.name + " ergue " + ability.name + (ability.target === "team" ? " e protege o trio com " : " e se protege com ") + shield + " de escudo.");
  } else if (ability.kind === "support") {
    const weakest = [...living(allies)].sort((a, b) => a.hp - b.hp)[0] || actor;
    const healed = Math.min(20, weakest.maxHp - weakest.hp);
    weakest.hp += healed;
    weakest.shield += ability.shield ?? 6;
    log(state, actor.name + " usa " + ability.name + ": " + weakest.name + " recupera " + healed + " de Vida.");
  } else {
    if (!target) return false;
    const multiplier = isPlayer ? 1 + state.resonance.bonus + state.buffs.damage : 1;
    let damage = Math.round(ability.damage * multiplier) + (limboRisk ? 8 : 0);
    if (ability.kind === "burst") damage += 5;
    const result = hit(target, damage, state);
    if (ability.kind === "control") target.weakened = 1;
    if (ability.kind === "burst" && target.hp > 0) target.stunned = 1;
    log(state, actor.name + " usa " + ability.name + " em " + target.name + " (" + result.dealt + " dano" + (result.blocked ? ", " + result.blocked + " bloqueado" : "") + ").");
    if (limboRisk) {
      state.passivesUsed.add(actor.id);
      const selfLoss = Math.max(0, 8 + state.buffs.risk);
      actor.hp = Math.max(1, actor.hp - selfLoss);
      log(state, "A Corrente Quebrada cobra " + selfLoss + " de Vida de " + actor.name + ".");
    }
  }
  if (isPlayer && actor.realm === "Inferno" && !state.passivesUsed.has(actor.id) && !["guard", "support"].includes(ability.kind)) {
    state.passivesUsed.add(actor.id);
    if (gainResource(state, "essence", 1)) {
      log(state, actor.name + " canaliza a força do Inferno: +1 de Essência.");
    }
  }
  if (!state.virtuePassiveUsed && state.allies.some((ally) => ally.realm === "Paraíso") && state.allies.some((ally) => ally.hp > 0 && ally.hp <= 40)) {
    state.virtuePassiveUsed = true;
    for (const ally of living(state.allies)) ally.shield += 10;
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

function enemyTurn(state) {
  state.phase = "enemy";
  const enemyActions = living(state.enemies);
  for (const actor of enemyActions) {
    if (!living(state.allies).length) break;
    const target = nearestTarget(state.allies);
    if (actor.stunned) {
      actor.stunned = 0;
      log(state, actor.name + " perde a ação sob atordoamento.");
      continue;
    }
    const ability = actor.abilities[(state.round + actor.id.length) % actor.abilities.length];
    applyAbility(state, actor, ability, target, false);
  }
  checkOutcome(state);
  if (state.phase !== "victory" && state.phase !== "defeat") {
    state.round += 1;
    state.acted = [];
    for (const ally of living(state.allies)) ally.stunned = 0;
    let essenceGained = 0;
    const affinityGains = {};
    for (const ally of living(state.allies)) {
      essenceGained += gainResource(state, "essence", 1);
      affinityGains[ally.affinity] = (affinityGains[ally.affinity] || 0) + gainResource(state, ally.affinity, 1);
    }
    state.phase = "player";
    const affinitySummary = Object.entries(affinityGains).filter(([, amount]) => amount > 0).map(([id, amount]) => `+${amount} ${resources.find((resource) => resource.id === id)?.shortName || id}`).join(", ");
    log(state, "Rodada " + state.round + ": aliados em pé geram +" + essenceGained + " Essência" + (affinitySummary ? " e " + affinitySummary : "") + ".");
  }
}

export function createBattle(teamIds, enemyTeam, config = {}) {
  const resonance = getResonance(teamIds);
  const buffsApplied = config.buffs || [];
  const buffValues = buffsApplied.reduce((acc, id) => {
    const effect = buffs.find((buff) => buff.id === id)?.effect || {};
    for (const [key, value] of Object.entries(effect)) acc[key] = (acc[key] || 0) + value;
    return acc;
  }, { damage: 0, shield: 0, essence: 0, cinza: 0, graca: 0, ruptura: 0, maxHp: 0, resonance: 0, risk: 0 });
  resonance.bonus += buffValues.resonance;
  const allies = teamIds.map((id) => characterById[id]).filter(Boolean).map((character) => {
    const unit = cloneUnit(character, "player");
    unit.maxHp += buffValues.maxHp;
    unit.hp = unit.maxHp;
    return unit;
  });
  const enemies = enemyTeam.map((character) => cloneUnit(character, "enemy"));
  for (const ally of allies) ally.shield = buffValues.shield;
  const resourceValues = Object.fromEntries(resources.map((resource) => [resource.id, buffValues[resource.id] || 0]));
  return {
    allies, enemies, round: 1, resources: resourceValues, resonance,
    buffs: buffValues, acted: [], passivesUsed: new Set(), virtuePassiveUsed: false, phase: "player", log: ["O combate começou. Ações do trio compartilham Essência."],
    turnSlots: allies.length
  };
}

export function chooseAction(state, actorId, abilityId, targetId) {
  if (state.phase !== "player") return { ok: false, reason: "Não é seu turno." };
  const actor = state.allies.find((unit) => unit.id === actorId && unit.hp > 0);
  if (!actor || state.acted.includes(actor.id)) return { ok: false, reason: "Esse aliado já agiu." };
  const ability = actor.abilities.find((item) => item.id === abilityId);
  if (!ability) return { ok: false, reason: "Técnica indisponível." };
  if (!canAffordAbility(state, actor, ability)) return { ok: false, reason: "Recursos insuficientes para essa técnica." };
  const target = state.enemies.find((unit) => unit.id === targetId && unit.hp > 0) || nearestTarget(state.enemies);
  if (!applyAbility(state, actor, ability, target, true)) return { ok: false, reason: "Não foi possível usar essa técnica." };
  state.acted.push(actor.id);
  checkOutcome(state);
  if (state.phase === "player" && living(state.allies).every((unit) => state.acted.includes(unit.id))) enemyTurn(state);
  return { ok: true, state };
}

export function passTurn(state) {
  if (state.phase !== "player") return false;
  for (const ally of living(state.allies)) {
    if (state.acted.includes(ally.id)) continue;
    state.acted.push(ally.id);
    log(state, ally.name + " guarda sua ação para o próximo turno.");
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
        risk: false, abilities: [
          { id: "basic", name: elo.moves[0], kind: "strike", cost: 0, damage: 23, target: "enemy" },
          { id: "power", name: elo.moves[2], kind: "control", cost: 1, damage: 28, target: "enemy" },
          { id: "ultimate", name: elo.moves[3], kind: "burst", cost: 2, damage: 40, target: "enemy" }
        ]
      },
      ...[0, 1].map((offset) => ({
        id: "subordinado-" + elo.id + "-" + offset, name: ["Arauto", "Custódio"][offset] + " da " + elo.name,
        title: "Subordinado do guardião", realm: elo.realm, elo: elo.name, eloId: elo.id, color: elo.color, symbol: elo.symbol, role: "Subordinado",
        risk: false, abilities: [
          { id: "basic", name: elo.moves[offset], kind: "strike", cost: 0, damage: 16, target: "enemy" },
          { id: "power", name: elo.moves[offset + 1], kind: "control", cost: 1, damage: 20, target: "enemy" },
          { id: "ultimate", name: elo.moves[3], kind: "burst", cost: 2, damage: 27, target: "enemy" }
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

export function getEloById(id) {
  return getElo(id);
}
