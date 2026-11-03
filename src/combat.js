import {getAbilityResourceCosts,resolveResourcePayment,allocateQueuePayment,resolveEssenceExchange,resourceIds} from "./resource-costs.js";
export {getAbilityResourceCosts} from "./resource-costs.js";
import { initializeWorldUnit, worldDamageBonus, worldAfterAction } from "./world-rules.js";
import { checkDeathInfluences } from "./world-influences.js";
import { skillSealReason, initializeCombatEffects, applyExtraEffects, triggerReactives, expireReactives, extraDamage, skillGrowthKey } from "./combat-effects.js";
import { initializeSkillForms, refreshSkillForms, applySkillShifts, scaleSkillForms, formSummary } from "./skill-state.js";
import { characterById, buffs, getElo, resources, realmResource } from "./data.js";
import { getResonance } from "./rules.js";
import { eloSynergyPeers, realmSynergyPeers } from "./team-synergies.js";
import { aggregateRunMemories, difficultyModifiers } from "./progression.js";
import { planTeamActions } from "./combat-ai.js";
const living = units => units.filter(u=>u.hp>0);
const byId = (units,id)=>units.find(u=>u.id===id && u.hp>0);
const nearest = units=>[...living(units)].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
const friendly = a=>["self","ally","friendly","team"].includes(a.target);
const team = (s,side)=>side==="player" ? s.allies : s.enemies;
const enemies = (s,side)=>side==="player" ? s.enemies : s.allies;
function nextRandom(s){
  if(s?.rngState!==undefined)return (s.rngState=(Math.imul(s.rngState,1664525)+1013904223)>>>0)/4294967296;
  return (s?.rng||Math.random)();
}
function randomResourceId(s,excluded=[]){
  const blocked=new Set(Array.isArray(excluded)?excluded:[excluded]),candidates=resourceIds.filter(id=>!blocked.has(id));
  const choices=candidates.length?candidates:resourceIds,roll=Math.min(.999999999,Math.max(0,nextRandom(s)));
  return choices[Math.floor(roll*choices.length)];
}
const totalEssence=p=>resourceIds.reduce((sum,id)=>sum+Math.max(0,Number(p?.[id])||0),0);
function normalizePool(s,side){
  const key=side==="player"?"resources":"enemyResources",p=s[key]&&typeof s[key]==="object"?s[key]:(s[key]={});
  const legacy=Math.max(0,Math.floor(Number(p.coringa)||0));delete p.coringa;
  for(let i=0;i<legacy;i++){const id=randomResourceId(s);p[id]=(p[id]||0)+1;}
  for(const id of Object.keys(p))if(!resourceIds.includes(id))delete p[id];
  for(const id of resourceIds)if(!Number.isFinite(p[id])||p[id]<0)p[id]=0;
  return p;
}
const pool = (s,side)=>normalizePool(s,side);
const sameRealmCount=(s,side,realm)=>living(team(s,side)).filter(unit=>unit.realm===realm).length;
const log=(s,message)=>{s.log.unshift(message);s.log=s.log.slice(0,30);};
const heal=(u,n)=>{const before=u.hp;if(u.hp>0)u.hp=Math.min(u.maxHp,u.hp+Math.max(0,Math.floor(n*(1-(u.healingBlock||0)))));return u.hp-before;};
const shield=(u,n)=>{const before=u.shield;u.shield=Math.min(Math.round(u.maxHp*0.5),u.shield+n);return u.shield-before;};
function gain(s,side,id,n=1){
  const p=pool(s,side),amount=Math.max(0,Math.floor(Number(n)||0));
  if(id==="random"||id==="coringa"){for(let i=0;i<amount;i++){const target=randomResourceId(s);p[target]=(p[target]||0)+1;}return amount;}
  if(!resourceIds.includes(id))return 0;
  p[id]=(p[id]||0)+amount;return amount;
}
function convertEssencePool(s,p,spec){
  const amount=Math.max(0,Math.floor(spec.amount||1)),fromAny=["any","random","coringa"].includes(spec.from);
  const source=fromAny?resourceIds.filter(id=>id!==spec.to&&(p[id]||0)>0).sort((a,b)=>(p[b]||0)-(p[a]||0))[0]:spec.from;
  const target=["random","coringa"].includes(spec.to)?randomResourceId(s,[source]):spec.to;
  if(!resourceIds.includes(source)||!resourceIds.includes(target)||source===target||amount<1||!(p[source]>=amount))return 0;
  p[source]-=amount;p[target]=(p[target]||0)+amount;return amount;
}
function clone(c,side,config={}) {const maxHp=c.maxHp||100;const unit={...c,side,maxHp,hp:Math.max(0,Math.min(maxHp,config.teamHealth?.[c.id]??maxHp)),affinity:c.affinity||realmResource[c.realm],abilities:c.abilities.map(a=>({...a})),shield:Math.min(Math.round(maxHp*.5),c.startingShield||0),armor:c.armor||0,regeneration:c.regeneration||0,globalStrikeUsed:false,weakened:0,stunned:0,exposed:0,invulnerable:0,reduction:0,boost:0,counter:0,counterEffect:null,counterRequiresShield:false,counterDamageType:"physical",charge:0,dots:[],marks:{},cooldowns:{},cooldownFresh:[],passiveUsed:false,passiveTriggeredRound:null,residue:0,interventionCharge:0,pillarIds:[],feridaAbertaTargets:{},stealthTurns:0,stealthFresh:false,ashExpansionTurns:0,ashExpansionFresh:false,ashExpansionUsed:false,collapseLevel:0,collapseTurns:0,collapseFresh:false,collapse1Used:false,collapse2Used:false,graceFormTurns:0,graceFormFresh:false,markNextTargetId:null,markNextBonus:0,markNextHeal:0,markNextFresh:false,clarityDamage:0,clarityHeal:0,shadowChoicePending:false,shadowDamageBonus:0,shadowBroadCounter:false,nextSkillBonus:0,nextSkillExpose:0,echoEssenceTypes:[],echoEssenceRound:0,offenseUsedThisTurn:false,offenseLastTurn:false,tookDamageThisTurn:false,damagedLastTurn:false,resonanceTargetId:null,resonanceTurns:0,resonanceFresh:false};initializeSkillForms(unit);initializeCombatEffects(unit);return unit;}
export function getAvailableResources(s,except=null){const out={...pool(s,"player")};for(const action of s.queue||[]){if(action.actorId===except)continue;const actor=byId(s.allies,action.actorId),ability=actor?.abilities.find(a=>a.id===action.abilityId);if(ability)for(const [id,n]of Object.entries(getAbilityResourceCosts(actor,ability)))if(id!=="random")out[id]-=n;}return out;}
export function getTurnPayment(s,selected){return allocateQueuePayment(s.queue||[],s.allies,pool(s,"player"),selected);}
export function exchangeEssence(s,target,selected){
 if(s.phase!=="player")return {ok:false,reason:"Aguarde o início do seu turno."};
 if(s.queue?.length)return {ok:false,reason:"Remova as ações da fila antes de trocar Essência."};
 const result=resolveEssenceExchange(pool(s,"player"),target,selected);if(!result.ok)return result;
 s.resources=result.pool;s.pendingEssenceExchanges??=[];s.pendingEssenceExchanges.push({target,payment:result.selected});
 const names={essence:"Éter",cinza:"Cinza",graca:"Graça",ruptura:"Ruptura"};
 log(s,`5 Essências foram trocadas por 1 ${names[target]}.`);
 return result;
}
export function applyEssenceExchanges(s,side,exchanges){
 if(!Array.isArray(exchanges)||exchanges.length>20)return {ok:false,reason:"Trocas de Essência inválidas."};
 let next={...pool(s,side)};const resolved=[];
 for(const exchange of exchanges){
  const result=resolveEssenceExchange(next,exchange?.target,exchange?.payment);
  if(!result.ok)return {ok:false,reason:result.reason};
  next=result.pool;resolved.push({target:result.target,payment:result.selected});
 }
 Object.assign(pool(s,side),next);
 const names={essence:'Éter',cinza:'Cinza',graca:'Graça',ruptura:'Ruptura'};
 for(const exchange of resolved)log(s,`5 Essências foram trocadas por 1 ${names[exchange.target]}.`);
 return {ok:true,exchanges:resolved};
}
export function canAffordAbility(s,actor,ability){
 if(actor.side==='enemy')return resolveResourcePayment(getAbilityResourceCosts(actor,ability),pool(s,"enemy")).ok;
 const actions=(s.queue||[]).filter(a=>a.actorId!==actor.id).concat({actorId:actor.id,abilityId:ability.id});
 return allocateQueuePayment(actions,s.allies,pool(s,"player")).ok;
}
export function getValidTargets(s,actor,ability){
 if(!actor||!ability)return [];
 const linked=actor.resonanceTargetId&&actor.resonanceTurns>0&&byId(enemies(s,actor.side),actor.resonanceTargetId);
 if((ability.requiresEchoLink&&!linked)||(ability.resonantWound&&actor.hp<=1))return [];
 if(ability.requiresAshExpansion&&!actor.ashExpansionTurns)return [];
 if(ability.requiresAnyCollapse&&!actor.collapseLevel)return [];
 if(ability.requiresCollapseI&&actor.collapseLevel!==1)return [];
 if(ability.requiresGraceForm&&!actor.graceFormTurns)return [];
 if(ability.requiresInterventionCharge&&actor.interventionCharge<1)return [];
 if(ability.activateAshExpansion&&actor.ashExpansionUsed)return [];
 if(ability.activateCollapse===1&&(actor.collapse1Used||actor.collapseLevel))return [];
 if(ability.activateCollapse===2&&(!actor.collapse1Used||actor.collapse2Used||actor.collapseLevel!==1))return [];
 if(ability.closeCollapse&&!actor.collapseLevel)return [];
 let candidates=ability.target==="self"?[actor]:living(friendly(ability)?team(s,actor.side):enemies(s,actor.side));
 return candidates.filter(u=>friendly(ability)||ability.target==="all-enemies"||!u.invulnerable||ability.ignoreInvulnerability)
  .filter(u=>friendly(ability)||ability.target==="all-enemies"||!u.stealthTurns||actor.side==="player")
  .filter(u=>!ability.formTargetId||u.id===ability.formTargetId)
  .filter(u=>!ability.requiredMark||u.marks[ability.requiredMark]?.sourceId===actor.id)
  .filter(u=>!ability.requiresPillar||u.pillarOwnerId===actor.id)
  .filter(u=>!ability.requiresTargetStatus||statusCount(u)>0);
}
function statusCount(u){
 if(!u)return 0;
 const tags=new Set((u.dots||[]).filter(d=>d.turns>0).map(d=>d.tag));
 const flags=["stunned","weakened","exposed","sealSupport","sealAttack","healingBlock"];
 const count=tags.size+Object.values(u.marks||{}).filter(m=>m.turns>0).length+flags.filter(k=>u[k]>0).length;
 return Math.min(3,count);
}
export function meetsCondition(u,condition,actor){if(!u||!condition)return false;if(condition.startsWith("mark:"))return u.marks[condition.slice(5)]?.sourceId===actor.id;const tags={bleed:"sangramento",burn:"queimadura",poison:"veneno",decay:"decadencia"};if(tags[condition])return u.dots.some(d=>d.tag===tags[condition]&&d.turns>0);if(condition==="afflicted")return u.dots.length>0;if(condition==="marked")return Object.values(u.marks).some(m=>m.sourceId===actor.id);if(condition==="wounded")return u.hp<=50;if(condition==="selfWounded")return actor.hp<=50;if(condition==="selfShielded")return actor.shield>0;if(condition==="shielded")return u.shield>0;if(condition==="anyStatus")return statusCount(u)>0;return (u[condition]||0)>0;}
function consume(u,condition,actor){if(condition.startsWith("mark:"))delete u.marks[condition.slice(5)];else if(["bleed","burn","poison","decay"].includes(condition)){const tag={bleed:"sangramento",burn:"queimadura",poison:"veneno",decay:"decadencia"}[condition];u.dots=u.dots.filter(d=>d.tag!==tag);}else if(condition==="marked")for(const [id,m]of Object.entries(u.marks))if(m.sourceId===actor.id)delete u.marks[id];}
export function previewHit(u,n,options={}){if(u.hp<=0||(u.invulnerable&&!options.ignoreInvulnerability))return {dealt:0,blocked:0,immune:true};const type=options.damageType||"physical";let amount=Math.max(0,Math.round(n));if(type!=="affliction"&&u.exposed)amount+=10;if(!["piercing","affliction"].includes(type))amount=Math.max(0,amount-u.reduction-(u.armor||0));const bypass=Math.max(0,Math.floor(options.ignoreDefense||0)),blocked=type==="affliction"?0:Math.min(Math.max(0,u.shield-bypass),amount);return {dealt:Math.min(u.hp,amount-blocked),blocked,immune:false};}
function hit(s,u,n,options={}){const result=previewHit(u,n,options);u.shield-=result.blocked;u.hp-=result.dealt;if(result.dealt>0&&!options.skipEcho&&u.resonanceTargetId&&u.resonanceTurns>0){const linked=byId(enemies(s,u.side),u.resonanceTargetId);if(linked){const mirrored=hit(s,linked,result.dealt,{damageType:"affliction",skipEcho:true});log(s,`${u.name} perde ${result.dealt} de Vida; a ressonância repercute ${mirrored.dealt} de aflição em ${linked.name}.`);if(linked.hp<=0){notifyDefeat(s,linked,u);u.resonanceTargetId=null;u.resonanceTurns=0;u.resonanceFresh=false;}}else{u.resonanceTargetId=null;u.resonanceTurns=0;u.resonanceFresh=false;}}return result;}
function cleanse(s,u){u.dots=[];u.marks={};u.stunned=0;u.weakened=0;u.exposed=0;u.sealSupport=0;u.sealAttack=0;u.healingBlock=0;u.resonanceTargetId=null;u.resonanceTurns=0;u.resonanceFresh=false;for(const unit of [...s.allies,...s.enemies])if(unit.resonanceTargetId===u.id){unit.resonanceTargetId=null;unit.resonanceTurns=0;unit.resonanceFresh=false;}u.reactives=u.reactives.filter(r=>!r.harmful);}
const activeTimed=effect=>effect?.turns==null||effect.turns>0;
const harmfulEffectCount=(u,s)=>u.dots.filter(activeTimed).length+Object.values(u.marks).filter(activeTimed).length+['stunned','weakened','exposed','sealSupport','sealAttack','healingBlock'].filter(key=>u[key]>0).length+(u.resonanceTargetId?1:0)+([...s.allies,...s.enemies].some(unit=>unit.resonanceTargetId===u.id)?1:0)+u.reactives.filter(r=>r.harmful&&activeTimed(r)).length;
const effectsContext=(s,reactions)=>({hit:(u,n,options)=>hit(s,u,n,options),heal,shield,transfer,log,reactions,shift:applySkillShifts,condition:meetsCondition});
// A preparation must survive long enough for its owner to take the next action.
function applySupport(s,actor,a,receiver,charges,action={}){
  const g=actor.side==="player"?s.global:{};
  applyExtraEffects(s,actor,a,receiver,effectsContext(s));
  const missingHeal=a.missingHpHeal?Math.min(a.missingHpHeal.cap,Math.floor((receiver.maxHp-receiver.hp)/a.missingHpHeal.step)*a.missingHpHeal.amount):0;
  const allies=team(s,actor.side),realmHeal=realmSynergyPeers(allies,actor,"heal"),eloHeal=eloSynergyPeers(allies,actor,"heal");
  const clarityHeal=a.heal?actor.clarityHeal||0:0;const healed=(a.heal||a.perChargeHeal)?heal(receiver,(a.heal||0)+(a.perChargeHeal||0)*charges+(g.healPower||0)+(actor.worldHeal||0)+missingHeal+realmHeal+eloHeal+clarityHeal):0;if(clarityHeal)actor.clarityHeal=0;
  const shieldBonus=eloSynergyPeers(allies,actor,"shield");
  const shielded=a.shield?shield(receiver,a.shield+(g.shieldPower||0)+(actor.worldShieldPower||0)+shieldBonus):0;
  if(a.reduce)receiver.reduction=Math.max(receiver.reduction,a.reduce);
  if(a.boost){receiver.boost=Math.max(receiver.boost,a.boost);receiver.boostFresh=receiver.side===actor.side;}
  if(a.counter&&a.counter+(actor.worldCounterPower||0)+(a.residueCounterBonus||0)*(action.residueSpend||0)>=receiver.counter){const broad=actor.shadowBroadCounter&&a.counter;receiver.counterFilter=broad?["physical","piercing","energy","affliction"]:a.counterFilter;receiver.counterRequiresShield=Boolean(a.counterRequiresShield);receiver.counterDamageType=a.counterDamageType||"physical";receiver.counterEffect=a.counterEffect||null;receiver.counter=a.counter+(actor.worldCounterPower||0)+(a.residueCounterBonus||0)*(action.residueSpend||0);receiver.counterSourceId=actor.id;receiver.counterFormChanges=a.counterShift||[];if(broad)actor.shadowBroadCounter=false;}if(a.consumeInterventionCharge||a.spendInterventionCharge)actor.interventionCharge=Math.max(0,(actor.interventionCharge||0)-(a.consumeInterventionCharge||a.spendInterventionCharge));
  let cleansed=a.cleanse?harmfulEffectCount(receiver,s):0;
  if(a.cleanse){cleanse(s,receiver);const creationShield=eloSynergyPeers(allies,actor,"cleanse");if(creationShield)shield(receiver,creationShield);}
  if(a.cleanseOneAffliction){const dot=receiver.dots.find(d=>d.turns>0);if(dot){receiver.dots=receiver.dots.filter(d=>d!==dot);cleansed++;}}if(cleansed)triggerPassive(s,actor,"controlCleansed",{target:receiver,ability:a,cleansed});
  if(a.setPillar){actor.pillarIds||=[];actor.pillarIds=actor.pillarIds.filter(id=>byId(team(s,actor.side),id)?.pillarOwnerId===actor.id);if(!actor.pillarIds.includes(receiver.id)){if(actor.pillarIds.length>=2){const old=byId(team(s,actor.side),actor.pillarIds.shift());if(old)delete old.pillarOwnerId;}receiver.pillarOwnerId=actor.id;actor.pillarIds.push(receiver.id);}}
  if(a.activateAshExpansion){actor.ashExpansionTurns=a.activateAshExpansion;actor.ashExpansionFresh=true;actor.ashExpansionUsed=true;}
  if(a.activateCollapse){actor.collapseLevel=a.activateCollapse;actor.collapseTurns=a.activateCollapse===1?3:2;actor.collapseFresh=true;if(a.activateCollapse===1)actor.collapse1Used=true;else actor.collapse2Used=true;}
  if(a.closeCollapse){actor.collapseLevel=0;actor.collapseTurns=0;actor.collapseFresh=false;}
  if(a.activateGraceForm){actor.graceFormTurns=a.activateGraceForm;actor.graceFormFresh=true;}
  if(a.nextSkillBonus){actor.nextSkillBonus=a.nextSkillBonus;actor.nextSkillExpose=a.nextSkillExpose||0;}
  if(a.silenceMarkedHealing){for(const enemy of living(enemies(s,actor.side)))if(Object.values(enemy.marks||{}).some(mark=>mark.sourceId===actor.id)){enemy.healingBlock=1;enemy.healingBlockFresh=true;}}
  if(a.stealth){actor.stealthTurns=Math.max(actor.stealthTurns||0,a.stealth);actor.stealthFresh=true;triggerPassive(s,actor,"stealthUsed",{ability:a});}
  if(actor.side==="player"&&a.damage&&actor.clarityDamage)actor.clarityDamage=0;
  if(actor.side==="player"&&a.heal&&actor.clarityHeal)actor.clarityHeal=0;
  if(a.invulnerable)receiver.invulnerable=a.invulnerable;
  return {healed,shielded,cleansed};
}
function passiveBonus(actor,target){const p=actor.passive;if(!p)return 0;if(p.type==="hunter"&&meetsCondition(target,p.condition,actor)||p.type==="firstHit"&&!actor.passiveUsed||p.type==="comeback"&&actor.hp<=50)return p.amount;return 0;}
function attackValue(s,actor,a,target,charges=actor.charge,action={},purged=0,prePurgeExtra){
  if(!a.damage)return 0;
  const g=actor.side==="player"?s.global:{},typeBonus=a.damageType==="energy"?g.spiritualPower:a.damageType==="piercing"?g.piercingPower:a.damageType==="affliction"?g.afflictionPower:g.physicalPower;
  const globalDamage=(typeBonus||0)+(!actor.globalStrikeUsed?(g.firstStrike||0):0),combo=a.combo&&meetsCondition(target,a.combo.condition,actor);
  const allies=team(s,actor.side),control=a.stun||a.weaken||a.expose||a.sealAttack||a.sealSupport||a.combo?.stun;
  const marked=Boolean(a.mark)||Object.values(target.marks||{}).some(mark=>mark.sourceId===actor.id);
  const resourceAction=a.steal||a.drain||a.generateEssence;
  const eloComboBonus=(control||actor.eloId==="justica"&&target.exposed?eloSynergyPeers(allies,actor,"control"):0)
    +(a.expose?eloSynergyPeers(allies,actor,"exposed"):0)
    +(marked?eloSynergyPeers(allies,actor,"marked"):0)
    +(actor.hp<=actor.maxHp*.5?eloSynergyPeers(allies,actor,"wounded"):0)
    +(a.formKey&&a.formKey!=="base"?eloSynergyPeers(allies,actor,"form"):0)
    +(resourceAction?eloSynergyPeers(allies,actor,"essence"):0)
    +(a.spendCharge?eloSynergyPeers(allies,actor,"charge"):0)
    +(control?realmSynergyPeers(allies,actor,"control"):0);
  const multiplier=actor.side==="player"?1+s.resonance.bonus+s.buffs.damage:s.humanSides?1+(s.enemyResonance?.bonus||0):1;
  const dotBonus=a.bonusIfDotTags&&target.dots.some(dot=>dot.turns>0&&a.bonusIfDotTags.includes(dot.tag))?a.bonusDamage||0:0;
  const ownMarkBonus=a.bonusIfOwnMark&&target.marks?.[a.bonusIfOwnMark]?.sourceId===actor.id?a.bonusDamage||0:0;
  const statusBonus=a.bonusIfAnyStatus&&statusCount(target)>0?a.bonusIfAnyStatus:0;
  const purgeBonus=a.damageIfPurged&&purged>0?a.damageIfPurged:0;
  const pillarBonus=a.pillarJudgment&&s.pillarHitters?.[actor.id]?.includes(target.id)?a.pillarJudgment.bonusDamage||0:0;
  const markBonus=!actor.markNextFresh&&actor.markNextTargetId===target.id?actor.markNextBonus||0:0;
  const clarityBonus=actor.clarityDamage||0,shadowBonus=actor.shadowDamageBonus||0,nextBonus=actor.nextSkillBonus||0;
  const stealthBonus=a.stealthBonus&&actor.stealthTurns?a.stealthBonus:0;
  const modeBonus=actor.ashExpansionTurns?7:actor.collapseLevel===2?10:actor.collapseLevel===1?6:0;
  const fractureBonus=(a.fractureBonusDamage||0)*(action.fractureSpend||0);
  const residueBonus=(a.residueBonusDamage||0)*(action.residueSpend||0);
  return Math.max(0,Math.round((a.damage+worldDamageBonus(s,actor,a,target,charges)+(prePurgeExtra??extraDamage(actor,target,a))+globalDamage+(a.perChargeDamage||0)*charges+(combo?a.combo.bonusDamage||0:0)+eloComboBonus+passiveBonus(actor,target)+dotBonus+ownMarkBonus+statusBonus+purgeBonus+pillarBonus+markBonus+clarityBonus+shadowBonus+nextBonus+stealthBonus+modeBonus+fractureBonus+residueBonus+actor.boost-(actor.weakened?10:0))*multiplier));
}
function purgeTargetBuffs(target,limit="all"){
 const keys=["boost","reduction","counter"];let removed=0;
 for(const key of keys){if(target[key]>0&&(limit==="all"||removed<Math.max(0,Math.floor(limit)))){target[key]=0;removed++;}}
 return removed;
}
function consumeFractures(target,actor,count){
 for(let i=0;i<count;i++){
  const flag=["exposed","weakened","stunned","sealSupport","sealAttack","healingBlock"].find(key=>target[key]>0);
  if(flag){target[flag]=0;continue;}
  const dot=target.dots.find(item=>item.turns>0);if(dot){target.dots=target.dots.filter(item=>item!==dot);continue;}
  const mark=Object.entries(target.marks).find(([,item])=>item.sourceId===actor.id);
  if(mark)delete target.marks[mark[0]];
 }
}
function transfer(s,side,n,steal,resource=null){const other=side==="player"?"enemy":"player",p=pool(s,other),requested=["random","coringa"].includes(resource)?null:resource;let count=0;for(let i=0;i<n;i++){const id=requested?(p[requested]>0?requested:null):resourceIds.filter(key=>(p[key]||0)>0).sort((a,b)=>(p[b]||0)-(p[a]||0))[0];if(!id)break;p[id]--;count++;if(steal)gain(s,side,id);}return count;}
const essenceName=id=>({essence:"Éter",cinza:"Cinza",ruptura:"Ruptura",graca:"Graça",random:"Essência aleatória",coringa:"Essência aleatória"}[id]||"Essência");
function triggerPassive(s,unit,trigger,context={}){
 const p=unit?.passive;if(!p||p.trigger!==trigger||unit.hp<=0)return false;
 if(p.oncePerBattle&&unit.passiveUsed)return false;
 if(!p.oncePerBattle&&!p.repeatPerRound&&unit.passiveTriggeredRound===s.round)return false;
 const own=pool(s,unit.side),other=pool(s,unit.side==="player"?"enemy":"player"),target=context.target,attacker=context.attacker;
 if(p.spendResource&&!(p.spendResource==="random"||p.spendResource==="coringa"?((context.ability?.costs?.random||0)+(context.ability?.costs?.coringa||0)>0):(context.costs?.[p.spendResource]>0)))return false;
 if(p.condition&&context.condition!==p.condition)return false;if(p.minSpent!=null&&(context.spent||0)<p.minSpent)return false;
 if(p.hpAtMost!=null&&unit.hp>p.hpAtMost)return false;
 if(p.ifForm&&unit.bodyForm!==p.ifForm)return false;
 if(p.ifResource&&(p.ifResource==="random"||p.ifResource==="coringa"?totalEssence(own):(own[p.ifResource]||0))<(p.resourceMinimum||1))return false;
 if(p.enemyResource&&(p.enemyResource==="random"||p.enemyResource==="coringa"?totalEssence(other):(other[p.enemyResource]||0))<(p.enemyResourceMinimum||1))return false;
 if(p.ifEnemyAfflicted&&!enemies(s,unit.side).some(u=>u.hp>0&&u.dots.length))return false;
 if(p.ownDotPopulation&&enemies(s,unit.side).filter(u=>u.hp>0&&u.dots.some(dot=>dot.tag===p.ownDotPopulation.tag&&dot.sourceId===unit.id&&dot.turns>0)).length<p.ownDotPopulation.minimum)return false;
 if(p.ifNoOffenseOrDamaged&&unit.offenseLastTurn&&!unit.damagedLastTurn)return false;
 if(p.ifDamagedLastTurn&&!unit.damagedLastTurn)return false;
 if(p.requireThreeAllies&&living(team(s,unit.side)).length<3)return false;
 if(p.requiresLifeLoss&&!(context.dealt>0))return false;
 if(p.requiresEchoLink&&(!unit.resonanceTargetId||unit.resonanceTurns<=0||!byId(enemies(s,unit.side),unit.resonanceTargetId)))return false;
 if(p.requiresOwnMark&&(!target||!Object.values(target.marks||{}).some(mark=>mark.sourceId===unit.id)))return false;
 if(p.requiresOwnDot&&(!target?.dots?.some(dot=>dot.tag===p.requiresOwnDot&&dot.sourceId===unit.id&&dot.turns>0)))return false;
 if(p.requiresAttackerOwnDot&&!attacker?.dots?.some(dot=>dot.tag===p.requiresAttackerOwnDot&&dot.sourceId===unit.id&&dot.turns>0))return false;
 if(p.requiresExposed&&!target?.exposed)return false;
 if(p.requiresStunned&&!target?.stunned)return false;
 if(p.requiresWeakened&&!target?.weakened)return false;
 if(p.requiresOtherAlly&&(!target||target.id===unit.id||target.side!==unit.side))return false;
 if(p.requiresSelf&&target?.id!==unit.id)return false;
 if(p.nonDefensive&&context.ability?.defense)return false;
 if(p.minimumShield&&(context.shielded||0)<p.minimumShield)return false;
 if(p.damageTypes&&!p.damageTypes.includes(context.damageType))return false;
 if(p.requiresRemainingShield&&!unit.shield)return false;
 if(p.minimumHeal&&(context.healed||0)<p.minimumHeal)return false;
 if(p.minimumChargesSpent&&(context.chargesSpent||0)<p.minimumChargesSpent)return false;
 if(p.minimumStripped&&(context.stripped||0)<p.minimumStripped)return false;
 if(p.minimumPurged&&(context.purged||0)<p.minimumPurged)return false;
 if(p.minimumCleansed&&(context.cleansed||0)<p.minimumCleansed)return false;
 if(p.offensive&&!context.ability?.damage)return false;
 const effect=p.effect||{},changes=[];
 if(effect.spendEssence){const spend=effect.spendEssence,resource=spend.resource==="affinity"?unit.bodyResource||unit.affinity:spend.resource,amount=Math.max(0,Math.floor(spend.amount||1)),any=["random","coringa"].includes(resource);if(any?totalEssence(own)<amount:(own[resource]||0)<amount)return false;if(any){for(let i=0;i<amount;i++){const id=randomResourceId(s,resourceIds.filter(key=>!(own[key]>0)));own[id]--;}}else own[resource]-=amount;changes.push(`−${amount} ${any?"Essência":essenceName(resource)}`);}
 if(effect.gainResidue){const before=unit.residue||0;unit.residue=Math.min(3,before+Math.max(0,Math.floor(effect.gainResidue)));if(unit.residue>before)changes.push(`+${unit.residue-before} Resíduo`);}
 if(effect.armNextHitIgnoreDefense&&target){unit.feridaAbertaTargets||={};const before=unit.feridaAbertaTargets[target.id]||0,next=Math.max(before,effect.armNextHitIgnoreDefense);if(next>before){unit.feridaAbertaTargets[target.id]=next;changes.push(`próximo dano ignora ${effect.armNextHitIgnoreDefense} Defesa`);}}
 if(effect.markNextSkill&&target){unit.markNextTargetId=target.id;unit.markNextBonus=effect.markNextSkill.bonusDamage||0;unit.markNextHeal=effect.markNextSkill.heal||0;unit.markNextFresh=true;changes.push(`prepara resposta contra ${target.name}`);}
 if(effect.clarity){unit.clarityDamage=effect.clarity.damage||0;unit.clarityHeal=effect.clarity.heal||0;changes.push("prepara Clareza");}
 if(effect.gainInterventionCharge){const before=unit.interventionCharge||0;unit.interventionCharge=Math.min(2,before+effect.gainInterventionCharge);if(unit.interventionCharge>before)changes.push(`+${unit.interventionCharge-before} Carga de Intervenção`);}
 if(effect.shadowChoice&&!unit.shadowChoicePending){unit.shadowChoicePending=true;changes.push("escolha a resposta da Sombra Preparada");}
 if(effect.trackFourEssences){
  if(unit.echoEssenceRound!==s.round){unit.echoEssenceRound=s.round;unit.echoEssenceTypes=[];}
  for(const id of resourceIds)if((context.costs?.[id]||0)>0&&!unit.echoEssenceTypes.includes(id))unit.echoEssenceTypes.push(id);
  if(resourceIds.every(id=>unit.echoEssenceTypes.includes(id))&&unit.echoHarmonyRound!==s.round){const before=unit.charge||0;unit.charge=Math.min(3,before+1);unit.echoHarmonyRound=s.round;if(unit.charge>before)changes.push("Harmonia completa: +1 Carga");}
 }
 if(effect.generateEssence){const resource=effect.generateEssence.resourceFromForm?(unit.bodyForm==="base"?unit.affinity:unit.bodyResource||unit.affinity):effect.generateEssence.resource;const amount=Math.max(0,Math.floor(effect.generateEssence.amount||1));if(resource&&amount){gain(s,unit.side,resource,amount);changes.push(`+${amount} ${essenceName(resource)}`);}}
 if(effect.convertEssence){const converted=convertEssencePool(s,own,effect.convertEssence);if(converted)changes.push(`${converted} Essência convertida`);}
 if(effect.drainEssence){const drained=transfer(s,unit.side,effect.drainEssence.amount||1,false,effect.drainEssence.resource||null);if(drained)changes.push(`${drained} Essência drenada`);}
 if(effect.stealEssence){const stolen=transfer(s,unit.side,effect.stealEssence.amount||1,true,effect.stealEssence.resource||null);if(stolen)changes.push(`${stolen} Essência roubada`);}
 if(effect.gainCharge){const before=unit.charge;unit.charge=Math.min(3,unit.charge+Math.max(0,Math.floor(effect.gainCharge)));if(unit.charge>before)changes.push(`+${unit.charge-before} carga`);}
 if(effect.heal){const amount=heal(unit,effect.heal);if(amount)changes.push(`+${amount} Vida`);}
 if(effect.healSource){const amount=heal(unit,effect.healSource);if(amount)changes.push(`+${amount} Vida`);}
 if(effect.healTarget&&target){const amount=heal(target,effect.healTarget);if(amount)changes.push(`${target.name} +${amount} Vida`);}
 if(effect.healTeam){for(const ally of living(team(s,unit.side))){const amount=heal(ally,effect.healTeam);if(amount)changes.push(`${ally.name} +${amount} Vida`);}}
 if(effect.healWeakestAlly){const ally=nearest(team(s,unit.side));if(ally){const amount=heal(ally,effect.healWeakestAlly);if(amount)changes.push(`${ally.name} +${amount} Vida`);}}
 if(effect.shield){const amount=shield(unit,effect.shield);if(amount)changes.push(`+${amount} Defesa`);}
 if(effect.shieldTarget&&target){const amount=shield(target,effect.shieldTarget);if(amount)changes.push(`${target.name} +${amount} Defesa`);}
 if(effect.shieldTeam){for(const ally of living(team(s,unit.side))){const amount=shield(ally,effect.shieldTeam);if(amount)changes.push(`${ally.name} +${amount} Defesa`);}}
 if(effect.weakenTarget&&target){const before=target.weakened||0,next=Math.max(before,effect.weakenTarget);if(next>before){target.weakened=next;changes.push(`${target.name} Enfraquecido`);}}
 if(effect.sealSupportTarget&&target?.hp>0){const before=target.sealSupport||0,next=Math.max(before,effect.sealSupportTarget);if(next>before){target.sealSupport=next;changes.push(`${target.name} Apoio selado`);}}
 if(effect.damageAttacker&&attacker?.hp>0){const result=hit(s,attacker,effect.damageAttacker,{damageType:"affliction",ignoreInvulnerability:true});if(result.dealt)changes.push(`${attacker.name} −${result.dealt} Vida`);if(attacker.hp<=0)notifyDefeat(s,attacker,unit);}
 if(effect.selfDamage&&unit.hp>1){const amount=Math.min(unit.hp-1,Math.max(0,Math.floor(effect.selfDamage))),wound=hit(s,unit,amount,{damageType:"affliction",ignoreInvulnerability:true});if(wound.dealt)changes.push(`−${wound.dealt} Vida`);}
 // Hidden tracking effects may update state without firing; only a real proc spends its activation limit.
 if(!changes.length)return false;
 if(!p.oncePerBattle)unit.passiveTriggeredRound=s.round;else unit.passiveUsed=true;
 log(s,`${unit.name} · ${p.name}: ${changes.join(" · ")}.`);
 return true;
}
function notifyDefeat(s,target,killer){
 if(target.hp>0||target.defeatNotified)return;
 target.defeatNotified=true;
 target.resonanceTargetId=null;target.resonanceTurns=0;target.resonanceFresh=false;
 for(const unit of [...s.allies,...s.enemies])if(unit.resonanceTargetId===target.id){unit.resonanceTargetId=null;unit.resonanceTurns=0;unit.resonanceFresh=false;}
 for(const unit of living(enemies(s,target.side))){
  if(unit.id===killer?.id||unit.passive?.watchDeaths)triggerPassive(s,unit,"kill",{target,killer});
 }
}
function outcome(s){if(!living(s.enemies).length)s.phase="victory";else if(!living(s.allies).length)s.phase="defeat";if(["victory","defeat"].includes(s.phase)){s.intents=[];s.resolution=[];s.queue=[];log(s,s.phase==="victory"?"Vitória! A próxima escolha da trilha será revelada.":"O trio caiu. Uma Corrente da Alma se rompe.");return true;}return false;}
function apply(s,actor,a,targetId,randomPayment,action={}){
  const valid=getValidTargets(s,actor,a),targets=["team","all-enemies"].includes(a.target)?valid:[valid.find(u=>u.id===targetId)||(a.target==="self"?actor:null)].filter(Boolean);
  if(!targets.length){log(s,`${actor.name}: ${a.name} não encontra um alvo válido.`);return {skipped:true,reason:"Alvo indisponível ou Invulnerável."};}
  const p=pool(s,actor.side),payment=resolveResourcePayment(getAbilityResourceCosts(actor,a),p,randomPayment);
  if(!payment.ok){log(s,`${actor.name} não tem os tipos de Essência escolhidos para ${a.name}.`);return {skipped:true,reason:"Essências escolhidas removidas antes da resolução."};}
  const costs=payment.costs;
  for(const [id,n]of Object.entries(costs))p[id]-=n;actor.actedThisTurn=true;
  const emptyEloPeers=eloSynergyPeers(team(s,actor.side),actor,"essence");
  if(actor.eloId==="vazio"&&emptyEloPeers&&Object.values(costs).some(n=>n>0)){s.eloEssenceEchoRound||={};if(s.eloEssenceEchoRound[actor.side]!==s.round){gain(s,actor.side,actor.bodyResource||actor.affinity||"essence",1);s.eloEssenceEchoRound[actor.side]=s.round;log(s,`${actor.name} · Vazio alimentado: +1 Essência após um gasto partilhado.`);}}
  triggerPassive(s,actor,"essenceSpent",{costs,ability:a});
  const spent=Object.values(costs).reduce((n,value)=>n+value,0);
  if(actor.side==="enemy"&&spent>=2)for(const unit of s.allies)triggerPassive(s,unit,"enemyEssenceSpent",{attacker:actor,ability:a,costs,spent});
  if(actor.side==="player"&&action.residueSpend){const amount=Math.min(actor.residue||0,a.spendResidueMax||0,Math.max(0,Math.floor(action.residueSpend)));actor.residue-=amount;action={...action,residueSpend:amount};if(amount)log(s,`${actor.name} gasta ${amount} Resíduo.`);}
  const absorption=s.niloAbsorption;
  if(actor.side==="player"&&absorption&&s.campaignRealm){
   const category=a.absorption||null,possible=new Set(category?[category]:[]);
   if(!category){
    if((a.dots||[a.dot].filter(Boolean)).some(dot=>["sangramento","queimadura"].includes(dot.tag)) )possible.add("cinza");
    if(a.heal||a.shield||a.cleanse||a.cleanseOneAffliction||a.setPillar||a.counter)possible.add("graca");
    if(a.dot||a.dots||a.mark||a.steal||a.drain||a.expose||a.weaken||a.stun||a.stealth||a.counter||a.reactive)possible.add("ruptura");
   }
   for(const key of possible)if(absorption[key]!=null)absorption[key]=Math.min(100,absorption[key]+5);
  }
  const priorForms=actor.abilities.map(a=>a.formKey||"base").join(":"),priorBodyForm=actor.bodyForm||"base",charges=actor.charge,isFriendly=friendly(a);let totalDamage=0,totalStripped=0,totalPurged=0,affected=0;const reactions=[];
  for(const target of targets){
    if(!isFriendly&&target.counter>0&&!a.ignoreCounters&&(!target.counterRequiresShield||target.shield>0)&&(!target.counterFilter||target.counterFilter.includes(a.damageType||"physical"))){const value=target.counter,effect=target.counterEffect;target.counter=0;const r=hit(s,actor,value,{damageType:target.counterDamageType||"physical",ignoreInvulnerability:true}),notes=[];if(effect?.drainEssence){const n=transfer(s,target.side,effect.drainEssence.amount||1,false,effect.drainEssence.resource||null);if(n)notes.push(`remove ${n} ${essenceName(effect.drainEssence.resource)}`);}if(effect?.stealEssence){const n=transfer(s,target.side,effect.stealEssence.amount||1,true,effect.stealEssence.resource||null);if(n)notes.push(`rouba ${n} Essência`);}if(effect?.generateEssence?.resource){const n=gain(s,target.side,effect.generateEssence.resource,effect.generateEssence.amount||1);if(n)notes.push(`gera ${n} ${essenceName(effect.generateEssence.resource)}`);}if(effect?.dot&&actor.hp>0){actor.dots.push({...effect.dot,sourceId:target.id,skillId:a.id});notes.push("aplica aflição");}if(effect?.expose&&actor.hp>0){actor.exposed=Math.max(actor.exposed,effect.expose);actor.exposedFresh=true;notes.push("expõe o agressor");}if(effect?.mark&&actor.hp>0){actor.marks[effect.mark]={sourceId:target.id,turns:effect.markTurns||2,label:effect.label||"Contra-ataque"};notes.push("marca o agressor");}log(s,`${target.name} anula ${a.name} e contra-ataca ${actor.name}: ${r.dealt} dano${notes.length?` · ${notes.join(" · ")}`:""}.`);if(actor.hp<=0)notifyDefeat(s,actor,target);reactions.push({actorId:target.id,targetId:actor.id,actorName:target.name,damage:r.dealt});const owner=byId(team(s,target.side),target.counterSourceId);if(owner)applySkillShifts(s,owner,target.counterFormChanges,actor.id,meetsCondition);triggerPassive(s,owner||(!target.counterSourceId?target:null),"counter",{target,attacker:actor,ability:a,dealt:r.dealt});target.counterFormChanges=[];target.counterEffect=null;target.counterRequiresShield=false;continue;}
    affected++;
    const combo=a.combo&&meetsCondition(target,a.combo.condition,actor);let value=0,purgedThis=0,fractureSpend=0;
    if(!isFriendly){
      if(a.damage)triggerPassive(s,actor,"attack",{target,ability:a,costs,damageType:a.damageType||"physical"});
      const prePurgeExtra=a.purgeBonusDamage&&(a.purge||a.purgeBuffs)?extraDamage(actor,target,a):undefined;
      if(a.stripShield){totalStripped+=Math.min(target.shield,a.stripShield);target.shield=Math.max(0,target.shield-a.stripShield);}
      if(a.purge||a.purgeBuffs)purgedThis=purgeTargetBuffs(target,a.purgeBuffs||"all");totalPurged+=purgedThis;
      fractureSpend=a.spendFracturesMax?Math.min(statusCount(target),a.spendFracturesMax,Math.max(0,Math.floor(action.fractureSpend||0))):0;
      value=attackValue(s,actor,a,target,charges,{...action,fractureSpend},purgedThis,prePurgeExtra);
      const ignoreDefense=actor.feridaAbertaTargets?.[target.id]||0;
      const r=a.damage?hit(s,target,value,{damageType:a.damageType,ignoreInvulnerability:a.ignoreInvulnerability,ignoreDefense}):{dealt:0,blocked:0};
      if((r.dealt||r.blocked)&&ignoreDefense)delete actor.feridaAbertaTargets[target.id];
      totalDamage+=r.dealt;
      if(a.damage&&a.executeIfHpAtMost!=null&&target.hp>0&&target.hp<=a.executeIfHpAtMost){target.hp=0;target.executed=true;log(s,`${target.name} é executado por ${a.name}.`);}
      if(a.damage&&fractureSpend)consumeFractures(target,actor,fractureSpend);
      if(a.damage){actor.offenseUsedThisTurn=true;if(r.dealt&&target.pillarOwnerId&&target.side!==actor.side){s.pillarHitters||={};s.pillarHitters[target.pillarOwnerId]||=[];if(!s.pillarHitters[target.pillarOwnerId].includes(actor.id))s.pillarHitters[target.pillarOwnerId].push(actor.id);const owner=byId(team(s,target.side),target.pillarOwnerId);triggerPassive(s,owner,"pillarDamaged",{target,attacker:actor,ability:a,dealt:r.dealt});}if(r.dealt)target.tookDamageThisTurn=true;if(r.dealt||r.blocked)triggerPassive(s,target,"damaged",{attacker:actor,ability:a,damageType:a.damageType||"physical",dealt:r.dealt,blocked:r.blocked});if(r.dealt)triggerPassive(s,actor,"hit",{target,ability:a,costs,dealt:r.dealt,blocked:r.blocked,damageType:a.damageType||"physical"});if(target.hp<=0){notifyDefeat(s,target,actor);if(actor.side==="player"&&target.side==="enemy"&&s.campaignRealm==="Inferno"&&s.niloAbsorption)s.niloAbsorption.cinza=Math.min(100,s.niloAbsorption.cinza+5);}}
      if(a.stun||combo&&a.combo.stun){target.stunned=Math.max(target.stunned,a.stun||a.combo.stun);target.skillGrowth={};triggerPassive(s,actor,"statusApplied",{target,ability:a,condition:"status"});}
      if(a.weaken){target.weakened=Math.max(target.weakened,a.weaken);triggerPassive(s,actor,"statusApplied",{target,ability:a,condition:"status"});}
      if(a.pillarJudgment&&s.pillarHitters?.[actor.id]?.includes(target.id))target.weakened=Math.max(target.weakened,a.pillarJudgment.weaken||1);
      if(a.expose){target.exposed=Math.max(target.exposed,a.expose);target.exposedFresh=true;triggerPassive(s,actor,"statusApplied",{target,ability:a,condition:"status"});}
      if(combo&&a.combo.consume){consume(target,a.combo.condition,actor);triggerPassive(s,actor,"consume",{target,condition:a.combo.condition,ability:a});}
      if(a.mark){target.marks[a.mark]={sourceId:actor.id,turns:a.markTurns||3,label:a.name};triggerPassive(s,actor,"markApplied",{target,ability:a,condition:"mark"});triggerPassive(s,actor,"statusApplied",{target,ability:a,condition:"status"});}
      if(a.echoLink&&target.hp>0){actor.resonanceTargetId=target.id;actor.resonanceTurns=Math.max(1,Math.floor(a.echoLink.turns||2));actor.resonanceFresh=true;log(s,`${actor.name} sincroniza sua Essência com ${target.name} por ${actor.resonanceTurns} turnos.`);}
      applyExtraEffects(s,actor,a,target,effectsContext(s,reactions));
      if(r.dealt)triggerReactives(s,target,"damaged",actor,effectsContext(s,reactions));
      const newDots=a.dots||[a.dot].filter(Boolean);
      for(const dot of newDots){target.dots=target.dots.filter(d=>!(d.sourceId===actor.id&&d.skillId===a.id&&d.tag===dot.tag));const realmAffliction=realmSynergyPeers(team(s,actor.side),actor,"affliction"),eloAffliction=eloSynergyPeers(team(s,actor.side),actor,"affliction"),eloStatusBonus=actor.eloId==="sangria"&&dot.tag==="sangramento"||actor.eloId==="chama"&&dot.tag==="queimadura"||actor.eloId==="podridao"?eloAffliction:0;target.dots.push({...dot,damage:dot.damage+(actor.worldAffliction||0)+(actor.side==="player"?s.global.afflictionPower||0:0)+realmAffliction+eloStatusBonus,sourceId:actor.id,skillId:a.id});triggerPassive(s,actor,"statusApplied",{target,ability:a,condition:dot.tag==="sangramento"||dot.tag==="queimadura"?"bleedOrBurn":"status"});}
      log(s,`${actor.name} usa ${a.name} em ${target.name}: ${r.dealt} dano${r.blocked?`, ${r.blocked} absorvido pela Defesa`:""}${combo?" · COMBO":""}.`);
      if(r.dealt&&target.passive?.type==="retaliate"&&(!target.passive.damageTypes||target.passive.damageTypes.includes(a.damageType||"physical"))&&actor.hp>0){hit(s,actor,target.passive.amount,{damageType:"affliction",ignoreInvulnerability:true});if(actor.hp<=0)notifyDefeat(s,actor,target);log(s,`${target.passive.name}: ${actor.name} sofre ${target.passive.amount} de aflição.`);}
    }
    if(isFriendly){const support=applySupport(s,actor,a,target,charges,action);triggerPassive(s,actor,"support",{target,ability:a,...support,chargesSpent:a.spendCharge?charges:0});}
  }
  // Self benefits of an offensive area skill are granted once per cast.
  if(!isFriendly&&affected)applySupport(s,actor,{...a,reactive:null,regen:null,sealSupport:0,sealAttack:0,healingBlock:0,reduceCooldown:0},actor,charges,action);
  if(isFriendly)log(s,`${actor.name} usa ${a.name}${a.target==="team"?" no trio":` em ${targets[0].name}`}${a.invulnerable?": Invulnerável por 1 turno":": apoio aplicado"}.`);
  if(affected){if(a.lifesteal){const sharedFamine=eloSynergyPeers(team(s,actor.side),actor,"lifesteal");heal(actor,Math.floor(totalDamage*a.lifesteal)+sharedFamine);}if(totalDamage&&actor.passive?.type==="leech"){const passive=actor.passive,typed=passive.healByDamageType,amount=typed?(typed[a.damageType||"physical"]||0):passive.amount;if(amount)heal(actor,amount+eloSynergyPeers(team(s,actor.side),actor,"lifesteal"));}if(isFriendly&&actor.passive?.type==="support")heal(actor,actor.passive.amount);if(a.drain||a.steal){const extra=eloSynergyPeers(team(s,actor.side),actor,"essence"),n=transfer(s,actor.side,(a.steal||a.drain)+extra,Boolean(a.steal));log(s,`${a.steal?"Roubo":"Drenagem"} de Essência: ${n} ${n===1?"unidade":"unidades"}.`);}}
  if(affected){if(a.shieldToDamage?.consume)actor.shield=0;if(a.wardFromDamage)shield(actor,Math.min(20,Math.floor(totalDamage*a.wardFromDamage)));if(a.shieldFromStripped)shield(actor,Math.min(15,Math.floor(totalStripped*a.shieldFromStripped)));if(a.siphonToAlly){const beneficiary=nearest(team(s,actor.side));if(beneficiary)heal(beneficiary,Math.min(15,Math.floor(totalDamage*a.siphonToAlly)));}if(a.escalating&&a.damage)actor.skillGrowth[skillGrowthKey(a)]=Math.min(a.escalating.max,(actor.skillGrowth[skillGrowthKey(a)]||0)+a.escalating.amount);}
  if(a.damage&&affected){actor.globalStrikeUsed=true;if(actor.side==="player"&&s.global.lifesteal)heal(actor,Math.floor(totalDamage*Math.min(.6,s.global.lifesteal)));}
  if(a.damage&&affected&&actor.passive?.type==="firstHit")actor.passiveUsed=true;
  if(totalDamage>0&&actor.passive?.trigger==="firstHit")triggerPassive(s,actor,"firstHit",{target:targets.find(target=>target.hp>0)||targets[0],ability:a,costs});
  if(affected){if(a.spendCharge)actor.charge=0;actor.charge=Math.min(3,actor.charge+(a.gainCharge||0));if(a.maxUses)actor.skillUses[a.id]=(actor.skillUses[a.id]||0)+1;applySkillShifts(s,actor,a.shift,targetId,meetsCondition);}
  if(affected&&a.convertEssence){const converted=convertEssencePool(s,p,a.convertEssence);if(converted)log(s,`${actor.name} converte ${converted} unidade(s) de Essência.`);}
  if(affected&&a.generateEssence?.resource){const extra=eloSynergyPeers(team(s,actor.side),actor,"essence"),generated=gain(s,actor.side,a.generateEssence.resource,Math.max(0,Math.floor(a.generateEssence.amount||1)+extra));if(generated)log(s,`${actor.name} gera ${generated} ${a.generateEssence.resource==='coringa'||a.generateEssence.resource==='random'?'Essência aleatória':'Essência'} para a equipe.`);}
  if((a.selfDamage||actor.ashExpansionTurns||actor.collapseLevel)&&actor.hp>0){const chargeWound=a.resonantWound&&a.spendCharge?(a.perChargeDamage||0)*charges:0,modeCost=a.damage?(actor.ashExpansionTurns?5:actor.collapseLevel===2?7:actor.collapseLevel===1?4:0):0,amount=Math.min(actor.hp-1,Math.max(0,Math.floor((a.selfDamage||0)+modeCost+chargeWound+(actor.side==="player"?(s.buffs.risk||0):0)))),wound=hit(s,actor,amount,{damageType:"affliction",ignoreInvulnerability:true});if(wound.dealt)log(s,`${actor.name} sofre ${wound.dealt} de dissonância.`);}
  if(affected&&a.spendCharge&&charges>0)triggerPassive(s,actor,"chargeSpent",{ability:a,chargesSpent:charges});
  if(totalStripped>0)triggerPassive(s,actor,"stripShield",{ability:a,stripped:totalStripped});
  if(totalPurged>0){triggerPassive(s,actor,"purge",{ability:a,purged:totalPurged});triggerPassive(s,actor,"controlCleansed",{target:targets[0],ability:a,purged:totalPurged});}
  if(actor.markNextFresh)actor.markNextFresh=false;else if(a.damage&&actor.markNextTargetId&&targets.some(target=>target.id===actor.markNextTargetId)){if(actor.markNextHeal)heal(actor,actor.markNextHeal);actor.markNextTargetId=null;actor.markNextBonus=0;actor.markNextHeal=0;}
  if(a.damage){actor.shadowDamageBonus=0;if(actor.nextSkillBonus){for(const target of targets)if(actor.nextSkillExpose){target.exposed=Math.max(target.exposed,actor.nextSkillExpose);target.exposedFresh=true;triggerPassive(s,actor,"statusApplied",{target,ability:a,condition:"status"});}actor.nextSkillBonus=0;actor.nextSkillExpose=0;}}
  if(a.clearEchoLink){actor.resonanceTargetId=null;actor.resonanceTurns=0;actor.resonanceFresh=false;}
  if(a.cooldown){actor.cooldowns[a.id]=Math.max(actor.cooldowns[a.id]||0,a.cooldown);actor.cooldownFresh.push(a.id);}
  const ownShift=affected&&a.shift?.some(t=>t.slot===a.id&&t.form!=="base");
  if(ownShift&&actor.skillForms[a.id]&&a.cooldown){actor.skillForms[a.id].returnCooldown=actor.cooldowns[a.id];delete actor.cooldowns[a.id];actor.cooldownFresh=actor.cooldownFresh.filter(id=>id!==a.id);}
  triggerReactives(s,actor,a.defense?"defense":isFriendly?"support":"attack",null,effectsContext(s,reactions));
  refreshSkillForms(s);if((actor.bodyForm||"base")!==priorBodyForm)triggerPassive(s,actor,"formChange",{from:priorBodyForm,to:actor.bodyForm||"base",costs,ability:a});const shifted=priorForms!==actor.abilities.map(a=>a.formKey||"base").join(":");worldAfterAction(s,actor,a,{affected,totalDamage,killed:targets.some(u=>u.hp<=0),shifted,helpful:isFriendly},{heal,shield,log,reactions});const synergies=team(s,actor.side);if(shifted){const formGuard=eloSynergyPeers(synergies,actor,"form")*2;if(formGuard){const gained=shield(actor,formGuard);if(gained){reactions.push({kind:"world",actorId:actor.id,targetId:actor.id,actorName:actor.name,label:"Pele em vigília",shield:gained});log(s,`${actor.name} · Pele em vigília: +${gained} Defesa.`);}}}if(isFriendly&&!a.defense){const supportGuard=eloSynergyPeers(synergies,actor,"support");if(supportGuard){const gained=shield(actor,supportGuard);if(gained){reactions.push({kind:"world",actorId:actor.id,targetId:actor.id,actorName:actor.name,label:"Promessa partilhada",shield:gained});log(s,`${actor.name} · Promessa partilhada: +${gained} Defesa.`);}}}
  if(actor.side==="player"&&targets.some(unit=>unit.hp<=0)&&s.global.essenceOnKill){s.essenceKillRound||={};if(s.essenceKillRound.player!==s.round){const amount=gain(s,"player","ruptura",s.global.essenceOnKill);s.essenceKillRound.player=s.round;if(amount)log(s,`${actor.name} · Espólio da queda: +${amount} Ruptura.`);}}
  if(actor.side==="player"&&shifted&&s.global.formEssence){s.formEssenceRound||={};if(s.formEssenceRound.player!==s.round){const amount=gain(s,"player",actor.bodyResource||actor.affinity||"essence",s.global.formEssence);s.formEssenceRound.player=s.round;if(amount)log(s,`${actor.name} · Reflexo faminto: +${amount} Essência após mudar de Forma.`);}}
  if(actor.side==="player"&&isFriendly&&!a.defense&&s.global.supportEssence){s.supportEssenceRound||={};if(s.supportEssenceRound.player!==s.round){const amount=gain(s,"player","graca",s.global.supportEssence);s.supportEssenceRound.player=s.round;if(amount)log(s,`${actor.name} · Refrão de apoio: +${amount} Graça.`);}}
  return {skipped:false,totalDamage,reactions,abilityArt:a.art,formKey:a.formKey||"base"};
}
function drawEssence(s,side){
  const count=living(team(s,side)).length,draws=[];
  for(let i=0;i<count;i++){
    const id=randomResourceId(s);gain(s,side,id);draws.push(id);
  }
  s.essenceDraws[side]=draws;
}
function applyNaturalTurnStart(s,side,recoveries=[]){
  for(const u of living(team(s,side))){
    for(const regen of u.regens){const restored=heal(u,regen.heal),source=[...s.allies,...s.enemies].find(v=>v.id===regen.sourceId);if(restored)recoveries.push({kind:"recovery",actorId:source?.id||u.id,targetId:u.id,actorName:source?.name||u.name,label:regen.label,heal:restored});regen.turns--;}u.regens=u.regens.filter(r=>r.turns>0);
    if(u.passive?.type==="ward")shield(u,u.passive.amount);
    if(u.passive?.type==="renew")heal(u,u.passive.amount);
    if(s.round>1)heal(u,u.regeneration+(side==="player"?s.global.regeneration||0:0));
  }
}
function grantTurn(s,recoveries=[]){
  // Both sides draw before any start-of-turn passive can manipulate either reserve.
  drawEssence(s,"player");drawEssence(s,"enemy");
  const order=s.round%2?["player","enemy"]:["enemy","player"];
  for(const side of ["player","enemy"])applyNaturalTurnStart(s,side,recoveries);
  const refreshAndTriggerForms=()=>{const before=new Map([...s.allies,...s.enemies].map(u=>[u.id,u.bodyForm||"base"]));refreshSkillForms(s);for(const u of [...s.allies,...s.enemies]){const from=before.get(u.id)||"base",to=u.bodyForm||"base";if(from!==to)triggerPassive(s,u,"formChange",{from,to});}};
  refreshAndTriggerForms();
  for(const side of order)for(const u of living(team(s,side)))triggerPassive(s,u,"turnStart");
  for(const side of order){const livingSide=living(team(s,side)),limboCount=livingSide.filter(unit=>unit.realm==="Limbo").length,limboPeers=Math.min(2,Math.max(0,limboCount-1));if(limboPeers)for(const u of livingSide)shield(u,limboPeers);if(s.round%2===0&&limboCount>=2){gain(s,side,"ruptura",1);log(s,`${side==="player"?"Correntes Quebradas":"O Limbo"} · Ressonância instável: +1 Ruptura.`);}}
  refreshAndTriggerForms();
}
// Planning reads public combat state only; the player's queue and future draws are never consulted.
export function getCombatPlan(s,side="enemy"){
 pool(s,side);
 return planTeamActions(s,side,{getAbilityResourceCosts,getValidTargets,meetsCondition,attackValue,previewHit,skillSealReason});
}
function planAI(s){s.intents=s.enemyPlanner(s);}
export function createBattle(ids,enemyTeam,config={}){
  const global={...(config.globalEffects||{})},legacyRandomEssence=Math.max(0,Math.floor(Number(config.globalEffects?.coringa)||0)),memoryEffects=aggregateRunMemories({memories:config.memories||[]}),resonance=getResonance(ids),buffValues=(config.buffs||[]).reduce((acc,id)=>{for(const [key,v]of Object.entries(buffs.find(b=>b.id===id)?.effect||{})){const k=key==="coringa"?"randomEssence":key;acc[k]=(acc[k]||0)+v;}return acc;},{damage:0,shield:0,essence:0,cinza:0,graca:0,ruptura:0,randomEssence:0,maxHp:0,resonance:0,risk:0});delete global.coringa;
  const runWorldKeys=["armor","regeneration","startingCharge","healPower","shieldPower","afflictionPower","woundedPower","markedPower","afflictedPower","executePower","shieldedPower","controlPower","chargePower","evolvedPower","lastStandPower","counterPower","firstStrike","lifesteal","supportShield","supportCharge","killShield","defenseHeal","shiftShield","essenceOnKill","formEssence","supportEssence"];
  for(const key of runWorldKeys)if(buffValues[key])global[key]=(global[key]||0)+buffValues[key];
  for(const [key,value] of Object.entries(memoryEffects))global[key]=(global[key]||0)+value;
  resonance.bonus+=buffValues.resonance+(memoryEffects.resonance||0);
  const allies=ids.slice(0,3).map(id=>characterById[id]).filter(Boolean).map(c=>clone(c,"player",config));for(const u of allies){u.maxHp+=buffValues.maxHp+(global.maxHp||0);u.armor=global.armor||0;u.charge=Math.min(3,global.startingCharge||0);u.hp=config.teamHealth?.[u.id]==null?u.maxHp:Math.max(0,Math.min(u.maxHp,config.teamHealth[u.id]));u.shield=Math.min(Math.round(u.maxHp*.5),buffValues.shield+(global.shield||0));initializeWorldUnit(u,Object.fromEntries(Object.keys(global).filter(key=>["woundedPower","markedPower","afflictedPower","executePower","shieldedPower","controlPower","chargePower","evolvedPower","lastStandPower","counterPower","supportShield","supportCharge","killShield","defenseHeal","shiftShield"].includes(key)).map(key=>[key,global[key]])));}
  const s={campaignRealm:config.campaignRealm||null,niloAbsorption:config.niloAbsorption?{cinza:config.niloAbsorption.cinza||0,graca:config.niloAbsorption.graca||0,ruptura:config.niloAbsorption.ruptura||0}:null,enemyPlanner:config.enemyPlanner||getCombatPlan,rng:config.rng||Math.random,...(config.rngSeed===undefined?{}:{rngState:(Number(config.rngSeed)||1)>>>0}),essenceDraws:{player:[],enemy:[]},pendingEssenceExchanges:[],global,difficulty:config.difficulty||0,allies,enemies:enemyTeam.map(c=>clone(c,"enemy")),round:1,resources:Object.fromEntries(resources.map(r=>[r.id,(buffValues[r.id]||0)+(global[r.id]||0)])),enemyResources:Object.fromEntries(resources.map(r=>[r.id,0])),resonance,buffs:{...buffValues,...memoryEffects},deathEchoStacks:{player:0,enemy:0},acted:[],actionLimit:3,queue:[],resolution:[],resolutionSide:null,phase:"player",log:["Escolha uma habilidade, clique no alvo e confirme a fila para executar seu turno."],intents:[]};
  for(let i=0;i<(buffValues.randomEssence||0)+legacyRandomEssence+(global.randomEssence||0);i++)gain(s,"player",randomResourceId(s));
  for(const [side,units] of [["player",s.allies],["enemy",s.enemies]]){const counts=new Map();for(const unit of living(units)){const affinity=unit.affinity||unit.bodyResource;if(affinity)counts.set(affinity,(counts.get(affinity)||0)+1);}const [affinity,count]=[...counts].sort((a,b)=>b[1]-a[1])[0]||[];if(count>=2){gain(s,side,affinity,1);log(s,`${side==="player"?"Seu trio":"A oposição"} · Afinidade convergente: +1 ${essenceName(affinity)} no início do combate.`);}}
  grantTurn(s);planAI(s);return s;
}
export function chooseAction(s,actorId,abilityId,targetId,options={}){
  refreshSkillForms(s);
  if(s.phase!=="player")return {ok:false,reason:"Aguarde a resolução do turno."};
  const actor=byId(s.allies,actorId),a=actor?.abilities.find(a=>a.id===abilityId);
  if(!actor||!a)return {ok:false,reason:"Personagem ou habilidade indisponível."};
  if(actor.stunned)return {ok:false,reason:"Personagem Atordoado neste turno."};
  if(skillSealReason(actor,a))return {ok:false,reason:skillSealReason(actor,a)};
  if(actor.cooldowns[abilityId])return {ok:false,reason:`Recarga: ${actor.cooldowns[abilityId]} turno(s).`};
  if(!canAffordAbility(s,actor,a))return {ok:false,reason:"A Essência disponível não paga esta habilidade."};
  const valid=getValidTargets(s,actor,a),target=["self","team","all-enemies"].includes(a.target)?valid[0]:valid.find(u=>u.id===targetId);
  if(!target)return {ok:false,reason:"Escolha um alvo destacado. Inimigos Invulneráveis não podem ser alvos."};
  const residueSpend=Math.max(0,Math.floor(options.residueSpend||0)),fractureSpend=Math.max(0,Math.floor(options.fractureSpend||0));
  if(residueSpend>(a.spendResidueMax||0)||residueSpend>(actor.residue||0))return {ok:false,reason:"Resíduo insuficiente para este gasto."};
  if(fractureSpend>(a.spendFracturesMax||0))return {ok:false,reason:"Gasto de Fraturas inválido."};
  const action={actorId,abilityId,formKey:a.formKey||"base",targetId:a.target==="self"?actor.id:target.id,side:"player",
   ...(residueSpend?{residueSpend}:{}),...(fractureSpend?{fractureSpend}:{})};
  const index=s.queue.findIndex(ref=>ref.actorId===actorId);if(index>=0)s.queue[index]=action;else s.queue.push(action);
  return {ok:true,action};
}
export function removeQueuedAction(s,id){if(s.phase!=="player")return false;s.queue=s.queue.filter(a=>a.actorId!==id);return true;}
export function moveQueuedAction(s,id,direction){if(s.phase!=="player")return false;const i=s.queue.findIndex(a=>a.actorId===id),j=i+direction;if(i<0||j<0||j>=s.queue.length)return false;[s.queue[i],s.queue[j]]=[s.queue[j],s.queue[i]];return true;}
export function commitTurn(s,selected){if(s.phase!=="player")return {ok:false,reason:"O turno já está em resolução."};const payment=getTurnPayment(s,selected);if(!payment.ok)return {ok:false,reason:payment.reason};s.phase="resolving";s.resolutionSide="player";s.acted=[];s.resolution=[...payment.actions,{type:"handoff"},{type:"effects"},{type:"next-turn"}];s.queue=[];s.pendingEssenceExchanges=[];return {ok:true};}
function endOpposing(s,units){expireReactives(s,units,"opposing",effectsContext(s));for(const u of units){if(!u.healingBlockFresh)u.healingBlock=0;u.healingBlockFresh=false;u.invulnerable=0;u.counter=0;u.reduction=0;if(!u.exposedFresh)u.exposed=0;u.exposedFresh=false;}}
function endActing(s,units,reactions=[]){expireReactives(s,units,"acting",effectsContext(s,reactions));for(const u of units){if(!u.boostFresh)u.boost=0;u.boostFresh=false;u.weakened=Math.max(0,u.weakened-1);u.stunned=Math.max(0,u.stunned-1);}}
function tickEffects(s){
 for(const u of [...s.allies,...s.enemies]){
  if(u.hp<=0)continue;
  for(const d of u.dots){const r=hit(s,u,d.damage,{damageType:"affliction",ignoreInvulnerability:true});log(s,`${u.name}: ${d.tag} causa ${r.dealt} de aflição.`);if(u.hp<=0){const source=[...s.allies,...s.enemies].find(unit=>unit.id===d.sourceId);notifyDefeat(s,u,source);}d.turns--;if(u.hp<=0)break;}
  u.dots=u.dots.filter(d=>d.turns>0);
  for(const [id,m]of Object.entries(u.marks)){m.turns--;if(m.turns<=0)delete u.marks[id];}
  if(u.resonanceTargetId){if(!byId(enemies(s,u.side),u.resonanceTargetId)){u.resonanceTargetId=null;u.resonanceTurns=0;u.resonanceFresh=false;}else if(u.resonanceFresh)u.resonanceFresh=false;else if(--u.resonanceTurns<=0){log(s,`${u.name} perde a ressonância.`);u.resonanceTargetId=null;u.resonanceTurns=0;}}
  const tick=(turnsKey,freshKey,expire)=>{if(!u[turnsKey])return;if(u[freshKey])u[freshKey]=false;else if(--u[turnsKey]<=0){u[turnsKey]=0;if(expire)expire();}};
  tick("stealthTurns","stealthFresh");
  tick("ashExpansionTurns","ashExpansionFresh");
  tick("graceFormTurns","graceFormFresh");
  tick("collapseTurns","collapseFresh",()=>{u.collapseLevel=0;});
 }
}
function nextTurn(s,recoveries){for(const u of [...s.allies,...s.enemies]){const fresh=new Set(u.cooldownFresh);u.cooldownFresh=[];for(const [id,n]of Object.entries(u.cooldowns))if(!fresh.has(id)){if(n>1)u.cooldowns[id]=n-1;else delete u.cooldowns[id];}u.offenseLastTurn=u.offenseUsedThisTurn;u.damagedLastTurn=u.tookDamageThisTurn;u.offenseUsedThisTurn=false;u.tookDamageThisTurn=false;}s.round++;s.acted=[];s.phase="player";s.resolutionSide=null;grantTurn(s,recoveries);for(const u of [...s.allies,...s.enemies])u.cooldownFresh=[];planAI(s);log(s,`Turno ${s.round}: Essência recebida. Monte sua próxima fila.`);}
function resolveAction(s){
  if(s.phase!=="resolving")return {done:true};refreshSkillForms(s);const action=s.resolution.shift();
  if(!action||action.type==="next-turn"){const before=JSON.stringify([...s.allies,...s.enemies].map(formSummary)),recoveries=[];nextTurn(s,recoveries);const changed=before!==JSON.stringify([...s.allies,...s.enemies].map(formSummary));return {done:true,newTurn:true,...(recoveries.length?{event:{mode:"recovery",reactions:recoveries,title:"Regeneração",summary:"A recuperação do início do turno foi aplicada."}}:changed?{event:{mode:"forms",title:"Técnicas alteradas",summary:"As formas foram atualizadas para este turno."}}:{})};}
  if(action.type==="essence-exchange"){
   const result=resolveEssenceExchange(s.enemyResources,action.target,action.payment);
   if(result.ok){s.enemyResources=result.pool;const names={essence:"Éter",cinza:"Cinza",graca:"Graça",ruptura:"Ruptura"};log(s,`A oposição troca 5 Essências por 1 ${names[action.target]}.`);return {done:false,event:{...action,mode:"exchange",title:"Essência convertida",summary:`5 Essências convertidas em 1 ${names[action.target]}.`}};}
   return {done:false,event:{...action,mode:"exchange",skipped:true,title:"Troca cancelada",summary:result.reason}};
  }
  if(action.type==="handoff"){const reactions=[];endActing(s,s.allies,reactions);endOpposing(s,s.enemies);if(outcome(s))return {done:true,event:{mode:"effects",reactions,title:"Efeito ativado",summary:"As reações encerraram o confronto."}};s.resolutionSide="enemy";planAI(s);s.resolution.unshift(...s.intents.map(a=>({...a})));return {done:false,event:{mode:reactions.length?"reactions":"turn",reactions,title:reactions.length?"Efeito reativo":"Turno da oposição",summary:"As habilidades adversárias serão resolvidas uma a uma."}};}
  if(action.type==="effects"){const reactions=[];endActing(s,s.enemies,reactions);endOpposing(s,s.allies);tickEffects(s);outcome(s);return {done:s.phase!=="resolving",event:{mode:reactions.length?"reactions":"effects",reactions,title:reactions.length?"Efeito reativo":"Efeitos persistentes",summary:"Aflições e durações foram atualizadas."}};}
  const actor=byId(team(s,action.side),action.actorId),a=actor?.abilities.find(a=>a.id===action.abilityId);
  if(!actor||!a)return {done:false,event:{...action,skipped:true,title:"Ação cancelada",summary:"O personagem deixou o combate antes de agir."}};
  if(actor.stunned){log(s,`${actor.name} perde a ação: Atordoado.`);return {done:false,event:{...action,skipped:true,title:`${actor.name} · Atordoado`,summary:"A habilidade foi interrompida."}};}
  if(actor.cooldowns[a.id])return {done:false,event:{...action,skipped:true,title:"Técnica em recarga",summary:"A recarga impede esta ação. Custos de Essência preservados."}};
  if(skillSealReason(actor,a))return {done:false,event:{...action,skipped:true,title:skillSealReason(actor,a),summary:"A técnica foi selada antes de agir. Custos de Essência preservados."}};
  if(action.formKey&&action.formKey!==(a.formKey||"base"))return {done:false,event:{...action,skipped:true,title:"Técnica alterada",summary:"A forma mudou após a confirmação. Ação cancelada; custos de Essência preservados."}};
  const result=apply(s,actor,a,action.targetId,action.randomPayment,action);if(action.side==="player")s.acted.push(actor.id);outcome(s);return {done:s.phase!=="resolving",event:{...action,...result,title:a.name,actorName:actor.name,summary:result.reason||""}};
}
export function passTurn(s){if(!commitTurn(s).ok)return false;let guard=0;while(s.phase==="resolving"&&guard++<20)resolveNextAction(s);return true;}
export function createEnemyTeam(elo,playerIds,encounter="normal",sequence=0,config={}){
  const roster=Object.values(characterById).filter(c=>c.kingdomId===elo.id||c.legacyEloId===elo.id||c.eloId===elo.id),other=roster.filter(c=>!playerIds.includes(c.id)),source=other.length>=3?other:roster,m=difficultyModifiers(config.difficulty),multiplier=encounter==="elite"?1.12:encounter==="mini"?1.2:encounter==="boss"?1.16:1;
  const boss=config.bossIds?.map(id=>characterById[id]).filter(c=>c&&(c.kingdomId===elo.id||c.legacyEloId===elo.id||c.eloId===elo.id));
  return [0,1,2].map(i=>{
    const c=encounter==="boss"&&boss?.length===3?boss[i]:source[(sequence*3+i)%source.length],baseHp=encounter==="boss"?i===0?135:115:encounter==="mini"?130:encounter==="elite"?120:100;
    return {...c,sourceId:c.id,id:`oponente-${sequence}-${i}`,name:encounter==="elite"?`Elite · ${c.name}`:c.name,maxHp:Math.round(baseHp*m.hp),startingShield:m.shield,armor:m.armor,regeneration:m.regen,abilities:c.abilities.map(a=>scaleSkillForms(a,form=>({...form,damage:Math.round((form.damage||0)*multiplier*m.damage),...(form.dot?{dot:{...form.dot,damage:form.dot.damage+m.affliction}}:{}),...(form.reactive?.damage?{reactive:{...form.reactive,damage:Math.round(form.reactive.damage*multiplier*m.damage)+m.affliction}}:{})})))};
  });
}
export function getEloById(id){return getElo(id);}

export function resolveNextAction(s){
 const aliveBefore=new Set([...s.allies,...s.enemies].filter(unit=>unit.hp>0).map(unit=>unit.id));
 const result=resolveAction(s),units=[...s.allies,...s.enemies];
 // Reactions and idle traps can defeat a soul outside the direct-hit path.
 for(const unit of units)if(aliveBefore.has(unit.id)&&unit.hp<=0&&!unit.defeatNotified){
  const reaction=result.event?.reactions?.find(item=>item.targetId===unit.id&&item.damage>0);
  notifyDefeat(s,unit,units.find(source=>source.id===reaction?.actorId));
 }
 if(checkDeathInfluences(s))return {...result,done:true,influence:true};return result;
}

// Authoritative human-v-human entry points. No client health, costs or results are accepted.
export function createDuel(firstIds,secondIds,config={}){
 const roster=secondIds.map((id,i)=>({...characterById[id],sourceId:id,id:`rival-${i}-${id}`}));
 const s=createBattle(firstIds,roster,{...config,enemyPlanner:()=>[]});
 s.humanSides=true;s.turnSide='player';s.turnNumber=1;s.intents=[];
 // Both human teams receive their own composition bonus.
 s.enemyResonance=getResonance(secondIds);return s;
}
export function submitDuelTurn(s,side,actions,selected,exchanges=[]){
 if(s.phase!=='player'||s.turnSide!==side)throw new Error('Não é seu turno.');
 if(!Array.isArray(actions)||actions.length>3)throw new Error('Fila inválida.');
 refreshSkillForms(s);const used=new Set(),queue=[];
 for(const ref of actions){
  const actor=byId(team(s,side),ref.actorId),a=actor?.abilities.find(a=>a.id===ref.abilityId);
  if(!actor||!a||used.has(actor.id)||actor.stunned||actor.cooldowns[a.id]||skillSealReason(actor,a))throw new Error('Ação indisponível.');
  if(!getValidTargets(s,actor,a).some(u=>u.id===ref.targetId))throw new Error('Alvo inválido.');
  used.add(actor.id);queue.push({actorId:actor.id,abilityId:a.id,targetId:ref.targetId,formKey:a.formKey||'base',side});
 }
 if(!Array.isArray(exchanges)||exchanges.length>20)throw new Error('Trocas de Essência inválidas.');
 const nextPool={...pool(s,side)},resolvedExchanges=[];
 for(const exchange of exchanges){const result=resolveEssenceExchange(nextPool,exchange?.target,exchange?.payment);if(!result.ok)throw new Error(result.reason);Object.assign(nextPool,result.pool);resolvedExchanges.push(result);}
 const payment=allocateQueuePayment(queue,team(s,side),nextPool,selected);if(!payment.ok)throw new Error(payment.reason);
 Object.assign(pool(s,side),nextPool);const names={essence:'Éter',cinza:'Cinza',graca:'Graça',ruptura:'Ruptura'};for(const exchange of resolvedExchanges)log(s,`5 Essências foram trocadas por 1 ${names[exchange.target]}.`);s.pendingEssenceExchanges=[];
 s.phase='resolving';s.resolution=[...payment.actions,{type:'duel-end',side}];s.queue=[];continueDuel(s);
}
export function continueDuel(s){
 let guard=0;
 while(s.phase==='resolving'&&guard++<12){
  if(s.resolution[0]?.type==='duel-end'){
   const {side}=s.resolution.shift();endActing(s,team(s,side));endOpposing(s,enemies(s,side));
   if(side==='enemy'){tickEffects(s);if(!outcome(s))nextTurn(s,[]);}else if(!outcome(s))s.phase='player';
   s.turnSide=side==='player'?'enemy':'player';s.turnNumber++;refreshSkillForms(s);
   checkDeathInfluences(s);break;
  }
  resolveNextAction(s);
 }
}
