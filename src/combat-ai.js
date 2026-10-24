const living = units => units.filter(u => u.hp > 0);
const helpful = a => ['self', 'ally', 'friendly', 'team'].includes(a.target);
const team = (s, side) => side === 'player' ? s.allies : s.enemies;
const opponents = (s, side) => side === 'player' ? s.enemies : s.allies;
const pool = (s, side) => side === 'player' ? s.resources : s.enemyResources;
const clampedHeal = (u, amount) => Math.min(u.maxHp - u.hp, Math.max(0, Math.floor(amount * (1 - (u.healingBlock || 0)))));
const countered = (u, a) => u.counter > 0 && !a.ignoreCounters && (!u.counterFilter || u.counterFilter.includes(a.damageType || 'physical'));
const harmfulCount = u => u.dots.length + Object.keys(u.marks).length + u.reactives.filter(r => r.harmful).length + ['stunned', 'weakened', 'exposed', 'sealSupport', 'sealAttack', 'healingBlock'].filter(k => u[k] > 0).length;

function healing(s, actor, a, u) {
  const global = actor.side === 'player' ? s.global.healPower || 0 : 0;
  const missing = a.missingHpHeal ? Math.min(a.missingHpHeal.cap, Math.floor((u.maxHp - u.hp) / a.missingHpHeal.step) * a.missingHpHeal.amount) : 0;
  return clampedHeal(u, (a.heal || 0) + (a.perChargeHeal || 0) * actor.charge + ((a.heal || a.perChargeHeal) ? global + (actor.worldHeal||0) + missing : 0));
}

function protectedTarget(target, a) {
  return {...target, shield: Math.max(0, target.shield - (a.stripShield || 0)), ...(a.purge ? {reduction: 0, counter: 0, boost: 0} : {})};
}

function attackResult(s, actor, a, target, rules) {
  if (!a.damage) return {dealt: 0, blocked: 0, immune: false};
  return rules.previewHit(protectedTarget(target, a), rules.attackValue(s, actor, a, target), {damageType: a.damageType, ignoreInvulnerability: a.ignoreInvulnerability});
}

function scoreSupport(s, actor, a, u) {
  const regen = a.regen && !u.regens.some(r => r.sourceId === actor.id && r.skillId === a.id) ? clampedHeal(u, a.regen.heal * a.regen.turns) * .55 : 0;
  const extraShield = (actor.side === 'player' ? s.global.shieldPower || 0 : 0)+(actor.worldShieldPower||0);
  return healing(s, actor, a, u) * 1.1 + regen
    + (a.cleanse ? Math.min(24, harmfulCount(u) * 8) : 0)
    + (a.counter && !u.counter ? Math.min(20, a.counter+(actor.worldCounterPower||0)) : 0)
    + (a.shield ? Math.min(a.shield + extraShield, Math.max(0, 45 - u.shield)) * .65 : 0)
    + (a.reduce ? Math.max(0, a.reduce - u.reduction) * .6 : 0)
    + (a.boost ? Math.max(0, a.boost - u.boost) * .8 : 0)
    + (a.reactive && !u.reactives.some(r => r.sourceId === actor.id && r.skillId === a.id) ? 7 : 0)
    + (a.reduceCooldown ? u.abilities.filter(v => !v.defense).reduce((sum, v) => sum + Math.min(a.reduceCooldown, u.cooldowns[v.id] || 0) * 7, 0) : 0);
}

function scoreAttack(s, actor, a, target, rules) {
  if (countered(target, a)) return -12 - rules.previewHit(actor, target.counter, {ignoreInvulnerability: true}).dealt;
  const r = attackResult(s, actor, a, target, rules), combo = a.combo && rules.meetsCondition(target, a.combo.condition, actor);
  const newDot = a.dot && !target.dots.some(d => d.sourceId === actor.id && d.skillId === a.id);
  return r.dealt + r.blocked * .4 + (r.dealt >= target.hp ? 24 : 0)
    + (a.lifesteal ? clampedHeal(actor,Math.floor(r.dealt*a.lifesteal))*1.1 : 0)
    + (newDot ? Math.min(target.hp - r.dealt, (a.dot.damage+(actor.worldAffliction||0)) * a.dot.turns) * .65 : 0)
    + ((a.stun || combo && a.combo.stun) && !target.stunned ? 13 : 0)
    + (a.mark && target.marks[a.mark]?.sourceId !== actor.id ? 6 : 0)
    + (a.expose && !target.exposed ? 7 : 0)
    + (a.sealAttack && !target.sealAttack ? 11 : 0) + (a.sealSupport && !target.sealSupport ? 8 : 0)
    + (a.reactive && !target.reactives.some(v => v.sourceId === actor.id && v.skillId === a.id) ? 8 : 0)
    + (a.healingBlock && target.hp < target.maxHp * .75 && !target.healingBlock ? 7 : 0)
    + Math.min(target.shield, a.stripShield || 0) * .4;
}

function scoreAction(s, actor, a, targets, rules) {
  let score;
  if (a.defense) score = actor.hp < actor.maxHp * .45 && !actor.invulnerable ? 28 + healing(s,actor,a,actor) : 0;
  else if (helpful(a)) score = targets.reduce((n, u) => n + scoreSupport(s, actor, a, u), 0);
  else score = targets.reduce((n, u) => n + scoreAttack(s, actor, a, u, rules), 0) + healing(s, actor, a, actor) * .7;
  // A visible trap is a real cost, but a lethal attack may still justify paying it.
  const kind = a.defense ? 'defense' : helpful(a) ? 'support' : 'attack';
  for (const r of actor.reactives) if (r.harmful) {
    const risk = r.damage ? rules.previewHit(actor, r.damage, {damageType: r.damageType || 'affliction', ignoreInvulnerability: true}).dealt : 0;
    if (r.trigger === kind || r.trigger === 'skill') score -= risk;
    if (r.trigger === 'idle') score += risk * .8;
  }
  score += (a.shift || []).filter(v => v.form !== 'base' && (!v.condition || targets.some(t => rules.meetsCondition(t, v.condition, actor)))).length * 7;
  // Value a transformation through its future kit using only visible state.
  if(a.assumeForm){
    const body=actor.bodyForms?.find(f=>f.key===a.assumeForm);
    let potential=0;
    for(const root of actor.skillBook||actor.abilities){
      const next=root.forms?.find(f=>f.formKey===body?.when[root.id]);if(!next)continue;
      const valid=rules.getValidTargets(s,actor,next),area=['team','all-enemies'].includes(next.target);
      const values=valid.map(u=>helpful(next)?scoreSupport(s,actor,next,u):scoreAttack(s,actor,next,u,rules)+healing(s,actor,next,actor)*.7);
      potential=Math.max(potential,area?values.reduce((n,v)=>n+v,0):Math.max(0,...values));
    }
    score+=Math.min(40,potential*.5);
  }
  if (a.gainCharge && actor.charge < 3) score += Math.min(3 - actor.charge, a.gainCharge) * 3;
  score -= (a.selfDamage || 0) * .6;
  const cost = Object.values(rules.getAbilityResourceCosts(actor, a)).reduce((n, v) => n + v, 0);
  return score / (1 + Math.max(0, cost - 1) * .3) - cost * 1.5;
}

// Forecast only immediate, public effects. It never executes the real battle or draws energy.
function forecast(s, actor, a, targets, rules) {
  for (const u of targets) {
    if (!helpful(a)) {
      if (countered(u, a)) { const r = rules.previewHit(actor, u.counter, {ignoreInvulnerability: true}); actor.hp -= r.dealt; actor.shield -= r.blocked; u.counter = 0; continue; }
      const r = attackResult(s, actor, a, u, rules);
      u.hp -= r.dealt; u.shield = Math.max(0, u.shield - (a.stripShield || 0) - r.blocked);
      if (a.purge) { u.reduction = 0; u.counter = 0; u.boost = 0; }
      if (a.expose) u.exposed = Math.max(u.exposed, a.expose);
      if (a.mark) u.marks[a.mark] = {sourceId: actor.id};
      if (a.dot) u.dots.push({...a.dot, sourceId: actor.id, skillId: a.id});
      if (a.sealAttack) u.sealAttack = a.sealAttack;
      if (a.sealSupport) u.sealSupport = a.sealSupport;
      if (a.stun) u.stunned = a.stun;
      continue;
    }
    u.hp += healing(s, actor, a, u);
    if (a.shield) u.shield = Math.min(80, u.shield + a.shield);
    if (a.counter) { u.counter = a.counter; u.counterFilter = a.counterFilter; }
    if (a.reduce) u.reduction = Math.max(u.reduction, a.reduce);
    if (a.boost) u.boost = Math.max(u.boost, a.boost);
    if (a.invulnerable) u.invulnerable = a.invulnerable;
    if (a.regen) u.regens.push({...a.regen, sourceId: actor.id, skillId: a.id});
    if (a.reactive) u.reactives.push({...a.reactive, sourceId: actor.id, skillId: a.id, harmful: false});
    if (a.cleanse) { u.dots = []; u.marks = {}; u.reactives = u.reactives.filter(r => !r.harmful); for (const k of ['stunned', 'weakened', 'exposed', 'sealSupport', 'sealAttack', 'healingBlock']) u[k] = 0; }
    if (a.reduceCooldown) for (const skill of u.abilities) if (!skill.defense && u.cooldowns[skill.id]) u.cooldowns[skill.id] = Math.max(0, u.cooldowns[skill.id] - a.reduceCooldown);
  }
}

function copyUnit(u) { return {...u, marks: {...u.marks}, dots: [...u.dots], reactives: [...u.reactives], regens: [...u.regens], cooldowns: {...u.cooldowns}}; }

export function planTeamActions(battle, side, rules) {
  const s = {...battle, allies: battle.allies.map(copyUnit), enemies: battle.enemies.map(copyUnit)};
  const reserved = {...pool(battle, side)}, used = new Set(), plan = [];
  for (let slot = 0; slot < team(s, side).length; slot++) {
    if (!living(opponents(s, side)).length) break;
    const choices = [];
    for (const actor of living(team(s, side))) {
      const original = team(battle, side).find(u => u.id === actor.id);
      if (used.has(actor.id) || actor.stunned || original.stunned) continue;
      for (const a of actor.abilities) {
        const costs = rules.getAbilityResourceCosts(actor, a);
        if (actor.cooldowns[a.id] || original.cooldowns[a.id] || rules.skillSealReason(actor, a) || rules.skillSealReason(original, a) || !Object.entries(costs).every(([id, n]) => (reserved[id] || 0) >= n)) continue;
        const valid = rules.getValidTargets(s, actor, a), area = ['team', 'all-enemies'].includes(a.target);
        for (const target of area ? valid.slice(0, 1) : valid) {
          const targets = area ? valid : [target], score = scoreAction(s, actor, a, targets, rules);
          choices.push({actor, a, target, targets, costs, score});
        }
      }
    }
    choices.sort((a, b) => b.score - a.score);
    const pick = choices[0]; if (!pick || pick.score <= 0) break;
    const {actor, a, target, targets, costs} = pick;
    for (const [id, n] of Object.entries(costs)) reserved[id] -= n;
    used.add(actor.id);
    plan.push({actorId: actor.id, abilityId: a.id, targetId: target.id, abilityName: a.name, targetName: target.name, side, formKey: a.formKey || 'base'});
    forecast(s, actor, a, targets, rules);
  }
  return plan;
}

