import { characterById, buffs, getElo, resources } from "./data.js";
import { getResonance } from "./rules.js";

const RESOURCE_CAP = 5;
const SHIELD_CAP = 80;
const TEAM_ACTIONS = 3;
const living = (units) => units.filter((unit) => unit.hp > 0);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function cloneUnit(character, side, config = {}) {
  const maxHp = Number(character.maxHp) || 100;
  const persistedHp = config.teamHealth?.[character.id];
  return {
    id: character.id, name: character.name, nameEn: character.nameEn, title: character.title,
    realm: character.realm, elo: character.elo, eloId: character.eloId, color: character.color,
    symbol: character.symbol, affinity: character.affinity, art: character.art, role: character.role,
    abilities: character.abilities.map((ability) => ({ cooldown: 0, ...ability })),
    passive: character.passive, risk: character.risk, side,
    hp: clamp(Number(persistedHp) || maxHp, 0, maxHp), maxHp, shield: 0,
    weakened: 0, stunned: 0, exposed: 0, burning: 0, taunt: 0,
    cooldowns: {}, cooldownFresh: []
  };
}

function log(state, message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 14);
}

function livingById(units, id) {
  return units.find((unit) => unit.id === id && unit.hp > 0) || null;
}

function nearestTarget(units) {
  return [...living(units)].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp || a.hp - b.hp)[0] || null;
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
  state.resources[resourceId] = Math.min(RESOURCE_CAP, current + amount);
  return state.resources[resourceId] - current;
}

function addShield(target, amount) {
  const before = target.shield;
  target.shield = Math.min(SHIELD_CAP, target.shield + Math.max(0, amount));
  return target.shield - before;
}

function hit(target, value, state, options = {}) {
  const weakened = options.weakened ? 0.75 : 1;
  const exposed = target.exposed ? 1.25 : 1;
  const remaining = Math.max(0, Math.round(value * weakened * exposed));
  const blocked = Math.min(target.shield, remaining);
  target.shield -= blocked;
  const dealt = Math.min(target.hp, remaining - blocked);
  target.hp = Math.max(0, target.hp - dealt);
  if (target.exposed) target.exposed = 0;
  return { dealt, blocked };
}

function targetForAbility(state, actor, ability, selectedTarget, allies, enemies) {
  if (["guard", "support", "heal"].includes(ability.kind)) {
    if (ability.target === "team") return null;
    if (ability.target === "self") return actor;
    return livingById(allies, selectedTarget) || nearestTarget(allies) || actor;
  }
  if (ability.target === "self") return actor;
  if (["ally", "friendly"].includes(ability.target)) return livingById(allies, selectedTarget) || nearestTarget(allies) || actor;
  if (ability.target === "enemy" || !ability.target) return livingById(enemies, selectedTarget) || nearestTarget(enemies);
  return actor;
}

function applyAbility(state, actor, ability, selectedTarget, isPlayer = true) {
  const allies = isPlayer ? state.allies : state.enemies;
  const enemies = isPlayer ? state.enemies : state.allies;
  const target = targetForAbility(state, actor, ability, selectedTarget?.id || selectedTarget, allies, enemies);
  const costs = getAbilityResourceCosts(actor, ability);
  const totalCost = Object.values(costs).reduce((sum, amount) => sum + amount, 0);
  const limboRisk = isPlayer && actor.realm === "Limbo" && totalCost > 0 && !state.passivesUsed.has(actor.id);
  if (isPlayer && !canAffordAbility(state, actor, ability)) return false;
  if (isPlayer) for (const [resourceId, amount] of Object.entries(costs)) state.resources[resourceId] -= amount;
  if (isPlayer && !totalCost) gainResource(state, "essence", 1);

  const amount = ability.shield ?? (ability.target === "team" ? 18 : 22);
  if (ability.kind === "guard") {
    const recipients = ability.target === "team" ? living(allies) : [target || actor];
    const shielded = recipients.reduce((sum, member) => sum + addShield(member, amount), 0);
    if (ability.taunt) {
      actor.taunt = Math.max(actor.taunt, ability.taunt);
      if (isPlayer) for (const intent of state.intents) {
        intent.targetId = actor.id;
        intent.targetName = actor.name;
      }
    }
    log(state, `${actor.name} usa ${ability.name}: ${shielded} de escudo${ability.taunt ? " e atrai a próxima intenção" : ""}.`);
  } else if (ability.kind === "support" || ability.kind === "heal") {
    const recipient = ability.target === "self" ? actor : target || [...living(allies)].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0] || actor;
    const healed = Math.min(ability.heal ?? 20, recipient.maxHp - recipient.hp);
    recipient.hp += healed;
    const shielded = ability.shield ? addShield(recipient, ability.shield) : 0;
    log(state, `${actor.name} usa ${ability.name}: ${recipient.name} recupera ${healed} de Vida${shielded ? ` e recebe ${shielded} de escudo` : ""}.`);
  } else {
    if (!target) return false;
    const multiplier = isPlayer ? 1 + state.resonance.bonus + state.buffs.damage : 1;
    const weakened = actor.weakened > 0;
    let damage = Math.round((ability.damage || 0) * multiplier) + (limboRisk ? 8 : 0);
    if (ability.kind === "burst") damage += 5;
    const result = hit(target, damage, state, { weakened });
    if (ability.kind === "control") target.weakened = Math.max(target.weakened, ability.weakened ?? 1);
    if (ability.kind === "burst" && ability.stun !== false) target.stunned = Math.max(target.stunned, ability.stun ?? 1);
    if (ability.expose) target.exposed = Math.max(target.exposed, ability.expose);
    if (ability.burn) target.burning = Math.max(target.burning, ability.burn);
    log(state, `${actor.name} usa ${ability.name} em ${target.name} (${result.dealt} dano${result.blocked ? `, ${result.blocked} bloqueado` : ""}).`);
    if (limboRisk) {
      state.passivesUsed.add(actor.id);
      const selfLoss = Math.max(0, 8 + state.buffs.risk);
      actor.hp = Math.max(1, actor.hp - selfLoss);
      log(state, `A Corrente Quebrada cobra ${selfLoss} de Vida de ${actor.name}.`);
    }
    if (ability.kind === "control" && ability.taunt) target.taunt = Math.max(target.taunt, ability.taunt);
    if (actor.weakened) actor.weakened = Math.max(0, actor.weakened - 1);
  }

  if (isPlayer && actor.realm === "Inferno" && !state.passivesUsed.has(actor.id) && !["guard", "support", "heal"].includes(ability.kind)) {
    state.passivesUsed.add(actor.id);
    if (gainResource(state, "essence", 1)) log(state, `${actor.name} canaliza a força do Inferno: +1 de Essência.`);
  }
  if (!state.virtuePassiveUsed && state.allies.some((ally) => ally.realm === "Paraíso") && state.allies.some((ally) => ally.hp > 0 && ally.hp <= 40)) {
    state.virtuePassiveUsed = true;
    const shielded = living(state.allies).reduce((sum, ally) => sum + addShield(ally, 10), 0);
    log(state, `A virtude protege o trio: ${shielded} de escudo distribuído.`);
  }

  const cooldown = Math.max(0, Number(ability.cooldown) || 0);
  if (cooldown) {
    actor.cooldowns[ability.id] = cooldown;
    actor.cooldownFresh.push(ability.id);
  }
  return true;
}

function endBattle(state, outcome) {
  state.phase = outcome;
  state.intents = [];
  log(state, outcome === "victory" ? "Vitória! A trilha pode seguir." : "O trio caiu. As Correntes da Alma perdem estabilidade.");
}

function checkOutcome(state) {
  if (living(state.enemies).length === 0) endBattle(state, "victory");
  else if (living(state.allies).length === 0) endBattle(state, "defeat");
}

function enemyTarget(state, actor) {
  const taunting = living(state.allies).filter((ally) => ally.taunt > 0);
  return taunting[0] || nearestTarget(state.allies);
}

function chooseEnemyAbility(state, actor) {
  const available = actor.abilities.filter((ability) => (actor.cooldowns[ability.id] || 0) === 0);
  const candidates = available.length ? available : actor.abilities;
  const target = enemyTarget(state, actor);
  return [...candidates].sort((a, b) => enemyAbilityScore(b, actor, target) - enemyAbilityScore(a, actor, target))[0];
}

function enemyAbilityScore(ability, actor, target) {
  if (ability.kind === "guard") return actor.shield < 24 ? 42 : 2;
  if (ability.kind === "support" || ability.kind === "heal") {
    const ally = actor;
    return ally.hp < ally.maxHp * 0.45 ? 18 : 4;
  }
  let score = (ability.damage || 0) + (ability.kind === "burst" ? 8 : 0) + (ability.kind === "control" ? 4 : 0);
  if (target?.hp < target.maxHp * 0.35) score += 8;
  if ((actor.cooldowns[ability.id] || 0) > 0) score -= 100;
  return score;
}

function planEnemyIntents(state) {
  state.intents = living(state.enemies).map((actor) => {
    const ability = chooseEnemyAbility(state, actor);
    const friendlyEffect = ["guard", "support", "heal"].includes(ability.kind);
    const target = friendlyEffect ? null : enemyTarget(state, actor);
    const friendlyTarget = [...living(state.enemies)].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    const damage = ability.kind === "guard" || ability.kind === "support" || ability.kind === "heal" ? 0 : Math.max(0, ability.damage || 0) + (ability.kind === "burst" ? 5 : 0);
    const targetName = ability.kind === "guard" ? "próprio trio" : ["support", "heal"].includes(ability.kind) ? friendlyTarget?.name || "aliado ferido" : target?.name || "Trio";
    const effect = ability.kind === "guard" ? "protege o próprio trio" : ["support", "heal"].includes(ability.kind) ? `cura ${targetName}` : "";
    const intent = { actorId: actor.id, abilityId: ability.id, abilityName: ability.name, targetId: target?.id || friendlyTarget?.id || null, targetName, kind: ability.kind, damage, effect };
    actor.intent = intent;
    return intent;
  });
}

function tickStatus(unit, state) {
  if (unit.hp <= 0) return;
  if (unit.burning > 0) {
    const result = hit(unit, 6, state);
    log(state, `${unit.name} sofre 6 de dano de queimadura${result.blocked ? ` (${result.blocked} bloqueado)` : ""}.`);
    unit.burning -= 1;
  }
  for (const status of ["weakened", "exposed", "taunt"]) unit[status] = Math.max(0, unit[status] - 1);
}

function expireCooldowns(unit) {
  const fresh = new Set(unit.cooldownFresh);
  unit.cooldownFresh = [];
  for (const [abilityId, remaining] of Object.entries(unit.cooldowns)) {
    if (fresh.has(abilityId)) continue;
    const next = Math.max(0, remaining - 1);
    if (next) unit.cooldowns[abilityId] = next;
    else delete unit.cooldowns[abilityId];
  }
}

function resolveIntent(state, intent) {
  const actor = livingById(state.enemies, intent.actorId);
  if (!actor) return;
  if (actor.stunned > 0) {
    actor.stunned -= 1;
    log(state, `${actor.name} perde a ação: está atordoado.`);
    return;
  }
  const ability = actor.abilities.find((item) => item.id === intent.abilityId) || actor.abilities[0];
  const taunting = living(state.allies).find((ally) => ally.taunt > 0);
  const target = taunting || livingById(state.allies, intent.targetId) || enemyTarget(state, actor);
  if (!target) return;
  applyAbility(state, actor, ability, target, false);
  checkOutcome(state);
}

function enemyTurn(state) {
  state.phase = "enemy";
  const intents = [...state.intents];
  for (const intent of intents) {
    if (!living(state.allies).length) break;
    resolveIntent(state, intent);
  }
  for (const unit of [...state.allies, ...state.enemies]) tickStatus(unit, state);
  checkOutcome(state);
  if (state.phase === "victory" || state.phase === "defeat") return;
  for (const unit of [...state.allies, ...state.enemies]) {
    expireCooldowns(unit);
  }
  state.round += 1;
  state.acted = [];
  let essenceGained = 0;
  const affinityGains = {};
  for (const ally of living(state.allies)) {
    essenceGained += gainResource(state, "essence", 1);
    affinityGains[ally.affinity] = (affinityGains[ally.affinity] || 0) + gainResource(state, ally.affinity, 1);
  }
  state.phase = "player";
  for (const ally of living(state.allies)) {
    if (ally.stunned > 0) {
      ally.stunned -= 1;
      state.acted.push(ally.id);
      log(state, `${ally.name} perde sua ação: está atordoado.`);
    }
  }
  planEnemyIntents(state);
  const affinitySummary = Object.entries(affinityGains).filter(([, amount]) => amount > 0).map(([id, amount]) => `+${amount} ${resources.find((resource) => resource.id === id)?.shortName || id}`).join(", ");
  log(state, `Rodada ${state.round}: aliados em pé geram +${essenceGained} Essência${affinitySummary ? ` e ${affinitySummary}` : ""}.`);
}

export function createBattle(teamIds, enemyTeam, config = {}) {
  const resonance = getResonance(teamIds);
  const buffValues = (config.buffs || []).reduce((acc, id) => {
    const effect = buffs.find((buff) => buff.id === id)?.effect || {};
    for (const [key, value] of Object.entries(effect)) acc[key] = (acc[key] || 0) + value;
    return acc;
  }, { damage: 0, shield: 0, essence: 0, cinza: 0, graca: 0, ruptura: 0, maxHp: 0, resonance: 0, risk: 0 });
  resonance.bonus += buffValues.resonance;
  const allies = teamIds.map((id) => characterById[id]).filter(Boolean).map((character) => {
    const unit = cloneUnit(character, "player", config);
    unit.maxHp += buffValues.maxHp;
    if (config.teamHealth?.[character.id] == null) unit.hp = unit.maxHp;
    else unit.hp = clamp(config.teamHealth[character.id], 1, unit.maxHp);
    return unit;
  });
  const enemies = enemyTeam.map((character) => cloneUnit(character, "enemy"));
  for (const ally of allies) ally.shield = buffValues.shield;
  const resourceValues = Object.fromEntries(resources.map((resource) => [resource.id, buffValues[resource.id] || 0]));
  const state = {
    allies, enemies, round: 1, resources: resourceValues, resonance,
    buffs: buffValues, acted: [], actionLimit: TEAM_ACTIONS, passivesUsed: new Set(),
    virtuePassiveUsed: false, phase: "player", log: ["O combate começou. Planeje três ações com recursos compartilhados."],
    turnSlots: TEAM_ACTIONS, intents: []
  };
  planEnemyIntents(state);
  return state;
}

export function chooseAction(state, actorId, abilityId, targetId) {
  if (state.phase !== "player") return { ok: false, reason: "Não é seu turno." };
  if (state.acted.length >= state.actionLimit) return { ok: false, reason: "As três ações do turno já foram usadas." };
  const actor = livingById(state.allies, actorId);
  if (!actor || state.acted.includes(actor.id)) return { ok: false, reason: "Esse aliado já agiu neste turno." };
  if (actor.stunned > 0) return { ok: false, reason: "Esse aliado está atordoado e perderá a ação." };
  const ability = actor.abilities.find((item) => item.id === abilityId);
  if (!ability) return { ok: false, reason: "Técnica indisponível." };
  if ((actor.cooldowns[ability.id] || 0) > 0) return { ok: false, reason: `Técnica em recarga por ${actor.cooldowns[ability.id]} turno(s).` };
  if (!canAffordAbility(state, actor, ability)) return { ok: false, reason: "Recursos insuficientes para essa técnica." };
  const friendlyEffect = ["guard", "support", "heal"].includes(ability.kind);
  const targetPool = friendlyEffect || ["ally", "friendly"].includes(ability.target) ? state.allies : state.enemies;
  const target = livingById(targetPool, targetId) || (ability.target === "self" || ability.target === "team" ? actor : nearestTarget(targetPool));
  if (!friendlyEffect && !["self", "ally", "friendly"].includes(ability.target) && !target) return { ok: false, reason: "Não há alvo válido." };
  if (!applyAbility(state, actor, ability, target, true)) return { ok: false, reason: "Não foi possível usar essa técnica." };
  state.acted.push(actor.id);
  checkOutcome(state);
  if (state.phase === "player" && (state.acted.length >= state.actionLimit || living(state.allies).every((unit) => state.acted.includes(unit.id)))) enemyTurn(state);
  return { ok: true, state };
}

export function passTurn(state) {
  if (state.phase !== "player") return false;
  if (state.acted.length < state.actionLimit) log(state, `Você encerra o turno com ${state.actionLimit - state.acted.length} ação(ões) disponível(is).`);
  enemyTurn(state);
  return true;
}

export function createEnemyTeam(elo, playerIds, encounter = "normal", sequence = 0) {
  const pool = Object.values(characterById).filter((character) => character.eloId === elo.id && !playerIds.includes(character.id));
  const source = pool.length >= 3 ? pool : Object.values(characterById).filter((character) => character.eloId === elo.id);
  if (encounter === "boss") {
    return [
      {
        id: "guardiao-" + elo.id, name: "Guardião do Elo da " + elo.name,
        title: "Guardião principal", realm: elo.realm, elo: elo.name, eloId: elo.id, color: elo.color, symbol: "✹", role: "Guardião", maxHp: 175,
        risk: false, abilities: [
          { id: "basic", name: elo.moves[0], kind: "strike", cost: 0, damage: 23, target: "enemy" },
          { id: "power", name: elo.moves[2], kind: "control", cost: 1, damage: 28, target: "enemy", cooldown: 1 },
          { id: "ultimate", name: elo.moves[3], kind: "burst", cost: 2, damage: 40, target: "enemy", cooldown: 2 }
        ]
      },
      ...[0, 1].map((offset) => ({
        id: "subordinado-" + elo.id + "-" + offset, name: ["Arauto", "Custódio"][offset] + " da " + elo.name,
        title: "Subordinado do guardião", realm: elo.realm, elo: elo.name, eloId: elo.id, color: elo.color, symbol: elo.symbol, role: "Subordinado", maxHp: 112,
        risk: false, abilities: [
          { id: "basic", name: elo.moves[offset], kind: "strike", cost: 0, damage: 16, target: "enemy" },
          { id: "power", name: elo.moves[offset + 1], kind: "control", cost: 1, damage: 20, target: "enemy", cooldown: 1 },
          { id: "ultimate", name: elo.moves[3], kind: "burst", cost: 2, damage: 27, target: "enemy", cooldown: 2 }
        ]
      }))
    ];
  }
  const multiplier = encounter === "elite" ? 1.18 : encounter === "mini" ? 1.28 : 1;
  const maxHp = encounter === "elite" ? 124 : encounter === "mini" ? 138 : 100;
  return [0, 1, 2].map((index) => {
    const character = source[(sequence * 3 + index) % source.length];
    return {
      ...character,
      id: `oponente-${sequence}-${index}`,
      name: encounter === "elite" ? `Guarda de Elite: ${character.name}` : encounter === "mini" && index === 0 ? `Guardião Menor: ${character.name}` : character.name,
      role: encounter === "elite" ? "Elite" : encounter === "mini" && index === 0 ? "Mini-Boss" : character.role,
      maxHp,
      abilities: character.abilities.map((ability) => ({
        ...ability,
        damage: Math.round((ability.damage || 0) * multiplier),
        shield: ability.shield ? Math.round(ability.shield * multiplier) : ability.shield,
        heal: ability.heal ? Math.round(ability.heal * multiplier) : ability.heal
      }))
    };
  });
}

export function getEloById(id) {
  return getElo(id);
}
