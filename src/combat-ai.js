import {resourceIds,resolveResourcePayment,resolveEssenceExchange} from "./resource-costs.js";
import {findHandCard,applyCardUpgrades} from "./card-combat.js";
const living = units => units.filter(u => u.hp > 0);
const helpful = a => ['self', 'ally', 'friendly', 'team'].includes(a.target);
const team = (s, side) => side === 'player' ? s.allies : s.enemies;
const opponents = (s, side) => side === 'player' ? s.enemies : s.allies;
const pool = (s, side) => side === 'player' ? s.resources : s.enemyResources;
const clampedHeal = (u, amount) => Math.min(u.maxHp - u.hp, Math.max(0, Math.floor(amount * (1 - (u.healingBlock || 0)))));
const countered = (u, a) => u.counter > 0 && !a.ignoreCounters && (!u.counterRequiresShield || u.shield > 0) && (!u.counterFilter || u.counterFilter.includes(a.damageType || 'physical'));
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

// Threat is estimated only from current kits and visible combat state. It is
// used by the upper Ruptures to focus dangerous souls without reading a queue.
function threatToTeam(s, unit, rules) {
  let best = 0;
  for (const a of unit.abilities || []) {
    if (helpful(a) || unit.stunned || unit.cooldowns?.[a.id] || rules.skillSealReason(unit, a)) continue;
    const valid = rules.getValidTargets(s, unit, a);
    for (const target of valid) {
      const hit = attackResult(s, unit, a, target, rules);
      const value = hit.dealt + hit.blocked * .15 + (a.stun && !target.stunned ? 12 : 0)
        + (a.sealAttack && !target.sealAttack ? 6 : 0) + (a.sealSupport && !target.sealSupport ? 5 : 0);
      best = Math.max(best, value);
    }
  }
  return best;
}

function incomingPressure(s, target, rules) {
  const threats = [];
  for (const attacker of living(opponents(s, target.side))) {
    let best = 0;
    for (const a of attacker.abilities || []) {
      if (helpful(a) || attacker.stunned || attacker.cooldowns?.[a.id] || rules.skillSealReason(attacker, a)) continue;
      if (!rules.getValidTargets(s, attacker, a).some(u => u.id === target.id)) continue;
      const hit = attackResult(s, attacker, a, target, rules);
      best = Math.max(best, hit.dealt + hit.blocked * .1 + (a.stun ? 5 : 0));
    }
    if (best > 0) threats.push(best);
  }
  return threats.sort((a,b)=>b-a).slice(0,2).reduce((n,v)=>n+v,0);
}

function scoreSupport(s, actor, a, u, rules) {
  const regen = a.regen && !u.regens.some(r => r.sourceId === actor.id && r.skillId === a.id) ? clampedHeal(u, a.regen.heal * a.regen.turns) * .55 : 0;
  const extraShield = (actor.side === 'player' ? s.global.shieldPower || 0 : 0)+(actor.worldShieldPower||0);
  let score=healing(s, actor, a, u) * 1.1 + regen
    + (a.cleanse ? Math.min(24, harmfulCount(u) * 8) : 0)
    + (a.counter && !u.counter ? Math.min(20, a.counter+(actor.worldCounterPower||0)) : 0)
    + (a.shield ? Math.min(a.shield + extraShield, Math.max(0, 45 - u.shield)) * .65 : 0)
    + (a.reduce ? Math.max(0, a.reduce - u.reduction) * .6 : 0)
    + (a.boost ? Math.max(0, a.boost - u.boost) * .8 : 0)
    + (a.reactive && !u.reactives.some(r => r.sourceId === actor.id && r.skillId === a.id) ? 7 : 0)
    + (a.reduceCooldown ? u.abilities.filter(v => !v.defense).reduce((sum, v) => sum + Math.min(a.reduceCooldown, u.cooldowns[v.id] || 0) * 7, 0) : 0)
    + (a.generateEssence ? Math.min(a.generateEssence.amount||1, 2) * 5 : 0)
    + (a.convertEssence ? Math.min(a.convertEssence.amount||1, 2) * 2 : 0);
  const level=actor.side==='enemy'?Math.max(0,Math.min(6,s.difficulty||0)):0;
  if(level>=3){
    const pressure=incomingPressure(s,u,rules),mitigation=(a.shield||0)+(a.reduce||0)*2+(a.invulnerable?pressure:0)+healing(s,actor,a,u);
    score+=Math.min(14,Math.min(pressure,mitigation)*.18*(level-2));
  }
  return score;
}

function scoreAttack(s, actor, a, target, rules) {
  if (countered(target, a)) return -12 - rules.previewHit(actor, target.counter, {ignoreInvulnerability: true}).dealt;
  const r = attackResult(s, actor, a, target, rules), combo = a.combo && rules.meetsCondition(target, a.combo.condition, actor);
  const newDot = a.dot && !target.dots.some(d => d.sourceId === actor.id && d.skillId === a.id);
  const value=r.dealt + r.blocked * .4 + (r.dealt >= target.hp ? 24 : 0)
    + (a.lifesteal ? clampedHeal(actor,Math.floor(r.dealt*a.lifesteal))*1.1 : 0)
    + (newDot ? Math.min(target.hp - r.dealt, (a.dot.damage+(actor.worldAffliction||0)) * a.dot.turns) * .65 : 0)
    + ((a.stun || combo && a.combo.stun) && !target.stunned ? 13 : 0)
    + (a.mark && target.marks[a.mark]?.sourceId !== actor.id ? 6 : 0)
    + (a.expose && !target.exposed ? 7 : 0)
    + (a.sealAttack && !target.sealAttack ? 11 : 0) + (a.sealSupport && !target.sealSupport ? 8 : 0)
    + (a.reactive && !target.reactives.some(v => v.sourceId === actor.id && v.skillId === a.id) ? 8 : 0)
    + (a.healingBlock && target.hp < target.maxHp * .75 && !target.healingBlock ? 7 : 0)
    + Math.min(target.shield, a.stripShield || 0) * .4
    + (a.generateEssence ? Math.min(a.generateEssence.amount||1, 2) * 5 : 0)
    + (a.convertEssence ? Math.min(a.convertEssence.amount||1, 2) * 2 : 0);
  const level=actor.side==='enemy'?Math.max(0,Math.min(6,s.difficulty||0)):0;
  if(level>=2&&!['team','all-enemies'].includes(a.target))return value+Math.min(20,threatToTeam(s,target,rules)*.4)*Math.min(1,(level-1)/4);
  return value;
}

function scoreAction(s, actor, a, targets, rules) {
  let score;
  const level=actor.side==='enemy'?Math.max(0,Math.min(6,s.difficulty||0)):0;
  if (a.defense) {
    const threshold=.45+Math.min(.15,level*.025),pressure=level>=3?incomingPressure(s,actor,rules):0;
    const crisis=actor.hp<actor.maxHp*threshold||pressure>=actor.hp+actor.shield*.4;
    score=crisis&&!actor.invulnerable?28+healing(s,actor,a,actor)+Math.min(14,pressure*.18*Math.max(0,level-2)):0;
  }
  else if (helpful(a)) score = targets.reduce((n, u) => n + scoreSupport(s, actor, a, u, rules), 0);
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
      const values=valid.map(u=>helpful(next)?scoreSupport(s,actor,next,u,rules):scoreAttack(s,actor,next,u,rules)+healing(s,actor,next,actor)*.7);
      potential=Math.max(potential,area?values.reduce((n,v)=>n+v,0):Math.max(0,...values));
    }
    score+=Math.min(40,potential*.5);
  }
  if (a.gainCharge && actor.charge < 3) score += Math.min(3 - actor.charge, a.gainCharge) * 3;
  score -= (a.selfDamage || 0) * .6;
  const cost = Object.values(rules.getAbilityResourceCosts(actor, a)).reduce((n, v) => n + v, 0);
  return score / (1 + Math.max(0, cost - 1) * .3) - cost * 1.5;
}

// Forecast only immediate, public effects. It never executes the real battle or draws Essência.
function forecast(s, actor, a, targets, rules) {
  let affected=0;
  for (const u of targets) {
    if (!helpful(a)) {
      if (countered(u, a)) { const r = rules.previewHit(actor, u.counter, {ignoreInvulnerability: true}); actor.hp -= r.dealt; actor.shield -= r.blocked; u.counter = 0; continue; }
      affected++;
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
    affected++;
    u.hp += healing(s, actor, a, u);
    if (a.shield) u.shield = Math.min(Math.round(u.maxHp * .5), u.shield + a.shield);
    if (a.counter && a.counter + (actor.worldCounterPower || 0) >= u.counter) {
      u.counter = a.counter + (actor.worldCounterPower || 0); u.counterFilter = a.counterFilter;
      u.counterRequiresShield = Boolean(a.counterRequiresShield); u.counterDamageType = a.counterDamageType || 'physical';
    }
    if (a.reduce) u.reduction = Math.max(u.reduction, a.reduce);
    if (a.boost) u.boost = Math.max(u.boost, a.boost);
    if (a.invulnerable) u.invulnerable = a.invulnerable;
    if (a.regen) u.regens.push({...a.regen, sourceId: actor.id, skillId: a.id});
    if (a.reactive) u.reactives.push({...a.reactive, sourceId: actor.id, skillId: a.id, harmful: false});
    if (a.cleanse) { u.dots = []; u.marks = {}; u.reactives = u.reactives.filter(r => !r.harmful); for (const k of ['stunned', 'weakened', 'exposed', 'sealSupport', 'sealAttack', 'healingBlock']) u[k] = 0; }
    if (a.reduceCooldown) for (const skill of u.abilities) if (!skill.defense && u.cooldowns[skill.id]) u.cooldowns[skill.id] = Math.max(0, u.cooldowns[skill.id] - a.reduceCooldown);
  }
  const resources=pool(s,actor.side);
  if(affected&&a.convertEssence){
    const amount=Math.max(0,Math.floor(a.convertEssence.amount||1));
    const source=a.convertEssence.from==='any'?Object.keys(resources).filter(id=>id!==a.convertEssence.to&&resources[id]>0).sort((x,y)=>resources[y]-resources[x])[0]:a.convertEssence.from;
    if(source&&source!==a.convertEssence.to&&resources[source]>=amount){resources[source]-=amount;resources[a.convertEssence.to]=(resources[a.convertEssence.to]||0)+amount;}
  }
  if(affected&&a.generateEssence?.resource)resources[a.generateEssence.resource]=(resources[a.generateEssence.resource]||0)+Math.max(0,Math.floor(a.generateEssence.amount||1));
}

function copyUnit(u) { return {...u, marks: {...u.marks}, dots: [...u.dots], reactives: [...u.reactives], regens: [...u.regens], cooldowns: {...u.cooldowns}}; }

function affordableResourcePlans(costs,pool,minExchangePool=5){
 const direct=resolveResourcePayment(costs,pool);if(direct.ok)return [{payment:direct,exchanges:[]}];
 let frontier=[{pool:{...pool},exchanges:[]}],found=[];
 for(let depth=0;depth<3&&frontier.length;depth++){
  const next=[];
  for(const entry of frontier){
   const payment=resourceIds.reduce((out,id)=>out+(entry.pool[id]||0),0)>=minExchangePool
    ? Object.fromEntries(resourceIds.map(id=>[id,0])) : null;
   if(!payment)continue;
   for(const target of resourceIds){
    if((costs[target]||0)<=(entry.pool[target]||0))continue;
    const spend={...entry.pool},paid={...payment};let remaining=5;
    for(const id of [...resourceIds].sort((a,b)=>(spend[b]||0)-(spend[a]||0))){const amount=Math.min(remaining,spend[id]||0);spend[id]-=amount;paid[id]=amount;remaining-=amount;if(!remaining)break;}
    if(remaining)continue;
    const exchange=resolveEssenceExchange(entry.pool,target,paid);if(!exchange.ok)continue;
    const exchanges=[...entry.exchanges,{target,payment:exchange.selected}];
    const result=resolveResourcePayment(costs,exchange.pool);
    if(result.ok)found.push({payment:result,exchanges});
    else next.push({pool:exchange.pool,exchanges});
   }
  }
  frontier=next;
 }
 return found;
}

export function planTeamActions(battle, side, rules) {
  const s = {...battle, resources:{...battle.resources}, enemyResources:{...battle.enemyResources}, allies: battle.allies.map(copyUnit), enemies: battle.enemies.map(copyUnit)};
  // Forecasted generation and conversion must fund later slots in this same plan.
  const reserved = pool(s, side), used = new Set(), plan = [];
  for (let slot = 0; slot < team(s, side).length; slot++) {
    if (!living(opponents(s, side)).length) break;
    const choices = [];
    for (const actor of living(team(s, side))) {
      const original = team(battle, side).find(u => u.id === actor.id);
      if (used.has(actor.id) || actor.stunned || original.stunned) continue;
      for (const baseAbility of actor.abilities) {
        const card=battle.cardCombat?findHandCard(battle.cardCombat,actor.id,baseAbility.id):null;
        if(battle.cardCombat&&!card)continue;
        const a=card?.upgrades?.length?applyCardUpgrades(baseAbility,card.upgrades):baseAbility;
        const required=rules.getAbilityResourceCosts(actor,a),plans=affordableResourcePlans(required,reserved,5);
        if (actor.cooldowns[a.id] || original.cooldowns[a.id] || rules.skillSealReason(actor, a) || rules.skillSealReason(original, a) || !plans.length) continue;
        const valid = rules.getValidTargets(s, actor, a), area = ['team', 'all-enemies'].includes(a.target);
        for (const target of area ? valid.slice(0, 1) : valid) {
          const targets = area ? valid : [target];
          for(const plan of plans){
           const score = scoreAction(s, actor, a, targets, rules)-plan.exchanges.length*6;
           choices.push({actor,a,card,target,targets,costs:plan.payment.costs,randomPayment:plan.payment.selected,exchanges:plan.exchanges,score});
          }
        }
      }
    }
    choices.sort((a, b) => b.score - a.score);
    const pick = choices[0]; if (!pick || pick.score <= 0) break;
    const {actor, a, card,target, targets, costs,randomPayment,exchanges} = pick;
    for(const exchange of exchanges){for(const id of resourceIds)reserved[id]-=exchange.payment[id]||0;reserved[exchange.target]++;plan.push({type:'essence-exchange',target:exchange.target,payment:exchange.payment,side});}
    for (const [id, n] of Object.entries(costs)) reserved[id] -= n;
    used.add(actor.id);
    plan.push({actorId: actor.id, abilityId: a.id, targetId: target.id, abilityName: a.name, targetName: target.name, side, randomPayment, formKey: a.formKey || 'base',...(card?{cardId:card.id}:{})});
    forecast(s, actor, a, targets, rules);
  }
  return plan;
}

