// All reactions are bounded, non-recursive effects. Sources and counters do not share ownership.
export function skillSealReason(unit,ability){
 if(ability.defense)return '';
 const helpful=['self','ally','friendly','team'].includes(ability.target);
 return helpful&&unit.sealSupport?'APOIO SELADO':!helpful&&unit.sealAttack?'OFENSIVA SELADA':'';
}
export function initializeCombatEffects(unit){unit.reactives=[];unit.regens=[];unit.skillGrowth={};unit.sealSupport=0;unit.sealAttack=0;unit.healingBlock=0;unit.actedThisTurn=false;}
export function addReactive(target,spec,actor,ability){
 target.reactives=target.reactives.filter(r=>r.sourceId!==actor.id||r.skillId!==ability.id);
 target.reactives.push({...spec,turns:spec.turns||1,sourceId:actor.id,skillId:ability.id,label:ability.name,harmful:actor.side!==target.side});
}
export function applyExtraEffects(s,actor,ability,target,ctx){
 if(ability.reactive){const r=ability.reactive;addReactive(target,{...r,...(r.damage?{damage:r.damage+((!r.damageType||r.damageType==='affliction')?actor.worldAffliction||0:0)+(actor.side==="player"?s.global.afflictionPower||0:0)}:{})},actor,ability);}
 if(ability.regen){target.regens=target.regens.filter(r=>r.sourceId!==actor.id||r.skillId!==ability.id);target.regens.push({...ability.regen,sourceId:actor.id,skillId:ability.id,label:ability.name});}
 if(ability.sealSupport)target.sealSupport=Math.max(target.sealSupport,ability.sealSupport);
 if(ability.sealAttack)target.sealAttack=Math.max(target.sealAttack,ability.sealAttack);
 if(ability.healingBlock){target.healingBlock=Math.max(target.healingBlock,ability.healingBlock);target.healingBlockFresh=true;}
 if(ability.reduceCooldown)for(const a of target.abilities)if(!a.defense&&target.cooldowns[a.id]){target.cooldowns[a.id]=Math.max(0,target.cooldowns[a.id]-ability.reduceCooldown);if(!target.cooldowns[a.id])delete target.cooldowns[a.id];}
 if(ability.cleanseBonusShield&&ability.cleanse){const count=target.dots.length+Object.keys(target.marks).length+['stunned','weakened','exposed','sealSupport','sealAttack','healingBlock'].filter(k=>target[k]>0).length+target.reactives.filter(r=>r.harmful).length;ctx.shield(target,Math.min(15,count*ability.cleanseBonusShield));}
}
export function triggerReactives(s,unit,kind,other,ctx){
 if(unit.hp<=0)return;
 const matches=r=>r.trigger===kind||kind==='attack'&&r.trigger==='skill'||kind==='support'&&r.trigger==='skill'||kind==='defense'&&r.trigger==='skill';
 const ready=unit.reactives.filter(r=>matches(r));unit.reactives=unit.reactives.filter(r=>!matches(r));
 for(const r of ready){
  const source=[...s.allies,...s.enemies].find(u=>u.id===r.sourceId);if(!source)continue;
  const victim=r.harmful?unit:other;
  const events=new Map();
  const record=(target,values={})=>{if(target)events.set(target.id,{...(events.get(target.id)||{}),...values});};
  if(r.damage&&victim?.hp>0){const result=ctx.hit(victim,r.damage,{damageType:r.damageType||'affliction',ignoreInvulnerability:true});record(victim,{damage:result.dealt});}
  const recipients=r.healBoth?[...new Set([source,unit])]:[r.healSource?source:unit];
  if(r.heal||r.healSource||r.healBoth)for(const u of recipients)record(u,{heal:ctx.heal(u,r.heal||r.healSource||r.healBoth)});
  if(r.shield)record(unit,{shield:ctx.shield(unit,r.shield)});if(r.shieldSource)record(source,{shield:ctx.shield(source,r.shieldSource)});
  if(r.drain)record(unit,{drain:ctx.transfer(s,source.side,r.drain,false)});
  if(r.exposeAttacker&&other?.hp>0){other.exposed=1;other.exposedFresh=s.resolutionSide===source.side;record(other);}
  if(r.shift){ctx.shift(s,source,r.shift,r.harmful?unit.id:other?.id,ctx.condition);record(source);}
  for(const [targetId,values]of events)ctx.reactions?.push({kind:'reaction',actorId:source.id,targetId,actorName:source.name,label:r.label,...values});
  ctx.log(s,`${r.label}: ${r.trigger==='idle'?'inatividade':'reação'} de ${unit.name} ativa o efeito.`);
 }
}
export function expireReactives(s,units,timing,ctx){
 for(const u of units){
  if(timing==='acting'){
   if(!u.actedThisTurn)triggerReactives(s,u,'idle',null,ctx);
   u.sealSupport=Math.max(0,u.sealSupport-1);u.sealAttack=Math.max(0,u.sealAttack-1);u.actedThisTurn=false;
  }
  u.reactives=u.reactives.filter(r=>{if((r.harmful?'acting':'opposing')===timing)r.turns--;return r.turns>0;});
 }
}
export function skillGrowthKey(ability){return `${ability.id}:${ability.formKey||'base'}`;}
export function extraDamage(actor,target,a){
 const missing=a.missingHpDamage,shield=a.shieldToDamage;
 return (missing?Math.min(missing.cap,Math.floor((actor.maxHp-actor.hp)/missing.step)*missing.amount):0)+(shield?Math.min(shield.cap,Math.floor(actor.shield*shield.ratio)):0)+(a.escalating?actor.skillGrowth[skillGrowthKey(a)]||0:0)+(a.purgeBonusDamage?Math.min(12,['boost','reduction','counter'].filter(k=>target[k]>0).length*a.purgeBonusDamage):0);
}
