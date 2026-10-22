import { checkDeathInfluences } from "./world-influences.js";
import { skillSealReason, initializeCombatEffects, applyExtraEffects, triggerReactives, expireReactives, extraDamage, skillGrowthKey } from "./combat-effects.js";
import { initializeSkillForms, refreshSkillForms, applySkillShifts, scaleSkillForms, formSummary } from "./skill-state.js";
import { characterById, buffs, getElo, resources, realmResource } from "./data.js";
import { getResonance } from "./rules.js";
import { difficultyModifiers } from "./progression.js";
import { planTeamActions } from "./combat-ai.js";
const living = units => units.filter(u=>u.hp>0);
const byId = (units,id)=>units.find(u=>u.id===id && u.hp>0);
const nearest = units=>[...living(units)].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
const friendly = a=>["self","ally","friendly","team"].includes(a.target);
const team = (s,side)=>side==="player" ? s.allies : s.enemies;
const enemies = (s,side)=>side==="player" ? s.enemies : s.allies;
const pool = (s,side)=>side==="player" ? s.resources : s.enemyResources;
const log=(s,message)=>{s.log.unshift(message);s.log=s.log.slice(0,30);};
const heal=(u,n)=>{const before=u.hp;if(u.hp>0)u.hp=Math.min(u.maxHp,u.hp+Math.max(0,Math.floor(n*(1-(u.healingBlock||0)))));return u.hp-before;};
const shield=(u,n)=>{const before=u.shield;u.shield=Math.min(80,u.shield+n);return u.shield-before;};
function gain(s,side,id,n=1){const p=pool(s,side),before=p[id]||0;p[id]=before+n;return p[id]-before;}
function clone(c,side,config={}) {const maxHp=c.maxHp||100;const unit={...c,side,maxHp,hp:Math.max(0,Math.min(maxHp,config.teamHealth?.[c.id]??maxHp)),affinity:c.affinity||realmResource[c.realm],abilities:c.abilities.map(a=>({...a})),shield:c.startingShield||0,armor:c.armor||0,regeneration:c.regeneration||0,globalStrikeUsed:false,weakened:0,stunned:0,exposed:0,invulnerable:0,reduction:0,boost:0,counter:0,charge:0,dots:[],marks:{},cooldowns:{},cooldownFresh:[],passiveUsed:false};initializeSkillForms(unit);initializeCombatEffects(unit);return unit;}
export function getAbilityResourceCosts(actor,ability){return Object.entries(ability.costs||(ability.cost?{essence:ability.cost}:{})).reduce((out,[id,n])=>{const key=id==="affinity"?actor.affinity:id;if(key&&n>0)out[key]=(out[key]||0)+n;return out;},{});}
export function getAvailableResources(s,except=null){const out={...s.resources};for(const action of s.queue||[]){if(action.actorId===except)continue;const actor=byId(s.allies,action.actorId),ability=actor?.abilities.find(a=>a.id===action.abilityId);if(ability)for(const [id,n]of Object.entries(getAbilityResourceCosts(actor,ability)))out[id]-=n;}return out;}
export function canAffordAbility(s,actor,ability){const p=actor.side==="enemy"?s.enemyResources:getAvailableResources(s,actor.id);return Object.entries(getAbilityResourceCosts(actor,ability)).every(([id,n])=>(p[id]||0)>=n);}
export function getValidTargets(s,actor,ability){if(!actor||!ability)return [];if(ability.target==="self")return actor.hp>0?[actor]:[];return living(friendly(ability)?team(s,actor.side):enemies(s,actor.side)).filter(u=>friendly(ability)||!u.invulnerable||ability.ignoreInvulnerability).filter(u=>!ability.formTargetId||u.id===ability.formTargetId).filter(u=>!ability.requiredMark||u.marks[ability.requiredMark]?.sourceId===actor.id);}
export function meetsCondition(u,condition,actor){if(!u||!condition)return false;if(condition.startsWith("mark:"))return u.marks[condition.slice(5)]?.sourceId===actor.id;const tags={bleed:"sangramento",burn:"queimadura",poison:"veneno",decay:"decadencia"};if(tags[condition])return u.dots.some(d=>d.tag===tags[condition]&&d.turns>0);if(condition==="afflicted")return u.dots.length>0;if(condition==="marked")return Object.values(u.marks).some(m=>m.sourceId===actor.id);if(condition==="wounded")return u.hp<=50;if(condition==="selfWounded")return actor.hp<=50;if(condition==="selfShielded")return actor.shield>0;if(condition==="shielded")return u.shield>0;return (u[condition]||0)>0;}
function consume(u,condition,actor){if(condition.startsWith("mark:"))delete u.marks[condition.slice(5)];else if(["bleed","burn","poison","decay"].includes(condition)){const tag={bleed:"sangramento",burn:"queimadura",poison:"veneno",decay:"decadencia"}[condition];u.dots=u.dots.filter(d=>d.tag!==tag);}else if(condition==="marked")for(const [id,m]of Object.entries(u.marks))if(m.sourceId===actor.id)delete u.marks[id];}
export function previewHit(u,n,options={}){if(u.hp<=0||(u.invulnerable&&!options.ignoreInvulnerability))return {dealt:0,blocked:0,immune:true};const type=options.damageType||"physical";let amount=Math.max(0,Math.round(n));if(type!=="affliction"&&u.exposed)amount+=10;if(!["piercing","affliction"].includes(type))amount=Math.max(0,amount-u.reduction-(u.armor||0));const blocked=type==="affliction"?0:Math.min(u.shield,amount);return {dealt:Math.min(u.hp,amount-blocked),blocked,immune:false};}
function hit(u,n,options={}){const result=previewHit(u,n,options);u.shield-=result.blocked;u.hp-=result.dealt;return result;}
function cleanse(u){u.dots=[];u.marks={};u.stunned=0;u.weakened=0;u.exposed=0;u.sealSupport=0;u.sealAttack=0;u.healingBlock=0;u.reactives=u.reactives.filter(r=>!r.harmful);}
const effectsContext=reactions=>({hit,heal,shield,transfer,log,reactions,shift:applySkillShifts,condition:meetsCondition});
// A preparation must survive long enough for its owner to take the next action.
function applySupport(s,actor,a,receiver,charges){
  const g=actor.side==="player"?s.global:{};
  applyExtraEffects(s,actor,a,receiver,effectsContext());
  const missingHeal=a.missingHpHeal?Math.min(a.missingHpHeal.cap,Math.floor((receiver.maxHp-receiver.hp)/a.missingHpHeal.step)*a.missingHpHeal.amount):0;
  if(a.heal||a.perChargeHeal)heal(receiver,(a.heal||0)+(a.perChargeHeal||0)*charges+(g.healPower||0)+(actor.worldHeal||0)+missingHeal);
  if(a.shield)shield(receiver,a.shield+(g.shieldPower||0));
  if(a.reduce)receiver.reduction=Math.max(receiver.reduction,a.reduce);
  if(a.boost){receiver.boost=Math.max(receiver.boost,a.boost);receiver.boostFresh=receiver.side===actor.side;}
  if(a.counter){receiver.counterFilter=a.counterFilter;receiver.counter=Math.max(receiver.counter,a.counter);receiver.counterSourceId=actor.id;receiver.counterFormChanges=a.counterShift||[];}
  if(a.cleanse)cleanse(receiver);
  if(a.invulnerable)receiver.invulnerable=a.invulnerable;
}
function passiveBonus(actor,target){const p=actor.passive;if(!p)return 0;if(p.type==="hunter"&&meetsCondition(target,p.condition,actor)||p.type==="firstHit"&&!actor.passiveUsed||p.type==="comeback"&&actor.hp<=50)return p.amount;return 0;}
function attackValue(s,actor,a,target,charges=actor.charge){
  if(!a.damage)return 0;
  const g=actor.side==="player"?s.global:{},typeBonus=a.damageType==="energy"?g.spiritualPower:a.damageType==="piercing"?g.piercingPower:a.damageType==="affliction"?g.afflictionPower:g.physicalPower;
  const globalDamage=(typeBonus||0)+(!actor.globalStrikeUsed?(g.firstStrike||0):0),combo=a.combo&&meetsCondition(target,a.combo.condition,actor);
  const multiplier=actor.side==="player"?1+s.resonance.bonus+s.buffs.damage:s.humanSides?1+(s.enemyResonance?.bonus||0):1;
  return Math.max(0,Math.round((a.damage+(actor.worldDamage||0)+extraDamage(actor,target,a)+globalDamage+(a.perChargeDamage||0)*charges+(combo?a.combo.bonusDamage||0:0)+passiveBonus(actor,target)+actor.boost-(actor.weakened?10:0))*multiplier));
}
function transfer(s,side,n,steal){const other=side==="player"?"enemy":"player",p=pool(s,other);let count=0;for(let i=0;i<n;i++){const id=Object.keys(p).sort((a,b)=>p[b]-p[a]).find(k=>p[k]>0);if(!id)break;p[id]--;count++;if(steal)gain(s,side,id);}return count;}
function outcome(s){if(!living(s.enemies).length)s.phase="victory";else if(!living(s.allies).length)s.phase="defeat";if(["victory","defeat"].includes(s.phase)){s.intents=[];s.resolution=[];s.queue=[];log(s,s.phase==="victory"?"Vitória! A próxima escolha da trilha será revelada.":"O trio caiu. Uma Corrente da Alma se rompe.");return true;}return false;}
function apply(s,actor,a,targetId){
  const valid=getValidTargets(s,actor,a),targets=["team","all-enemies"].includes(a.target)?valid:[valid.find(u=>u.id===targetId)||(a.target==="self"?actor:null)].filter(Boolean);
  if(!targets.length){log(s,`${actor.name}: ${a.name} não encontra um alvo válido.`);return {skipped:true,reason:"Alvo indisponível ou Invulnerável."};}
  const costs=getAbilityResourceCosts(actor,a),p=pool(s,actor.side);
  if(!Object.entries(costs).every(([id,n])=>(p[id]||0)>=n)){log(s,`${actor.name} não tem recursos para ${a.name}.`);return {skipped:true,reason:"Recursos removidos antes da resolução."};}
  for(const [id,n]of Object.entries(costs))p[id]-=n;actor.actedThisTurn=true;
  const charges=actor.charge,isFriendly=friendly(a);let totalDamage=0,totalStripped=0,affected=0;const reactions=[];
  for(const target of targets){
    if(!isFriendly&&target.counter>0&&!a.ignoreCounters&&(!target.counterFilter||target.counterFilter.includes(a.damageType||"physical"))){const value=target.counter;target.counter=0;const r=hit(actor,value,{ignoreInvulnerability:true});log(s,`${target.name} anula ${a.name} e contra-ataca ${actor.name}: ${r.dealt} dano.`);reactions.push({actorId:target.id,targetId:actor.id,actorName:target.name,damage:r.dealt});const owner=byId(team(s,target.side),target.counterSourceId);if(owner)applySkillShifts(s,owner,target.counterFormChanges,actor.id,meetsCondition);target.counterFormChanges=[];continue;}
    affected++;
    const combo=a.combo&&meetsCondition(target,a.combo.condition,actor),value=attackValue(s,actor,a,target,charges);
    if(!isFriendly){
      if(a.stripShield){totalStripped+=Math.min(target.shield,a.stripShield);target.shield=Math.max(0,target.shield-a.stripShield);}
      if(a.purge){target.boost=0;target.reduction=0;target.counter=0;}
      const r=a.damage?hit(target,value,{damageType:a.damageType,ignoreInvulnerability:a.ignoreInvulnerability}):{dealt:0,blocked:0};totalDamage+=r.dealt;
      if(a.stun||combo&&a.combo.stun){target.stunned=Math.max(target.stunned,a.stun||a.combo.stun);target.skillGrowth={};}
      if(a.weaken)target.weakened=Math.max(target.weakened,a.weaken);
      if(a.expose){target.exposed=Math.max(target.exposed,a.expose);target.exposedFresh=true;}
      if(combo&&a.combo.consume)consume(target,a.combo.condition,actor);
      if(a.mark)target.marks[a.mark]={sourceId:actor.id,turns:a.markTurns||3,label:a.name};
      applyExtraEffects(s,actor,a,target,effectsContext(reactions));
      if(r.dealt)triggerReactives(s,target,"damaged",actor,effectsContext(reactions));
      if(a.dot){target.dots=target.dots.filter(d=>!(d.sourceId===actor.id&&d.skillId===a.id));target.dots.push({...a.dot,damage:a.dot.damage+(actor.side==="player"?s.global.afflictionPower||0:0),sourceId:actor.id,skillId:a.id});}
      log(s,`${actor.name} usa ${a.name} em ${target.name}: ${r.dealt} dano${r.blocked?`, ${r.blocked} absorvido pela Defesa`:""}${combo?" · COMBO":""}.`);
      if(r.dealt&&target.passive?.type==="retaliate"&&actor.hp>0){hit(actor,target.passive.amount,{damageType:"affliction",ignoreInvulnerability:true});log(s,`${target.passive.name}: ${actor.name} sofre ${target.passive.amount} de aflição.`);}
    }
    if(isFriendly)applySupport(s,actor,a,target,charges);
  }
  // Self benefits of an offensive area skill are granted once per cast.
  if(!isFriendly&&affected)applySupport(s,actor,{...a,reactive:null,regen:null,sealSupport:0,sealAttack:0,healingBlock:0,reduceCooldown:0},actor,charges);
  if(isFriendly)log(s,`${actor.name} usa ${a.name}${a.target==="team"?" no trio":` em ${targets[0].name}`}${a.invulnerable?": Invulnerável por 1 turno":": apoio aplicado"}.`);
  if(affected){if(a.lifesteal)heal(actor,Math.floor(totalDamage*a.lifesteal));if(totalDamage&&actor.passive?.type==="leech")heal(actor,actor.passive.amount);if(isFriendly&&actor.passive?.type==="support")heal(actor,actor.passive.amount);if(a.drain||a.steal){const n=transfer(s,actor.side,a.steal||a.drain,Boolean(a.steal));log(s,`${a.steal?"Roubo":"Drenagem"}: ${n} recurso(s).`);}}
  if(affected){if(a.shieldToDamage?.consume)actor.shield=0;if(a.wardFromDamage)shield(actor,Math.min(20,Math.floor(totalDamage*a.wardFromDamage)));if(a.shieldFromStripped)shield(actor,Math.min(15,Math.floor(totalStripped*a.shieldFromStripped)));if(a.siphonToAlly){const beneficiary=nearest(team(s,actor.side));if(beneficiary)heal(beneficiary,Math.min(15,Math.floor(totalDamage*a.siphonToAlly)));}if(a.escalating&&a.damage)actor.skillGrowth[skillGrowthKey(a)]=Math.min(a.escalating.max,(actor.skillGrowth[skillGrowthKey(a)]||0)+a.escalating.amount);}
  if(a.damage&&affected){actor.globalStrikeUsed=true;if(actor.side==="player"&&s.global.lifesteal)heal(actor,Math.floor(totalDamage*Math.min(.6,s.global.lifesteal)));}
  if(a.damage&&affected&&actor.passive?.type==="firstHit")actor.passiveUsed=true;
  if(affected){if(a.spendCharge)actor.charge=0;actor.charge=Math.min(3,actor.charge+(a.gainCharge||0));if(a.maxUses)actor.skillUses[a.id]=(actor.skillUses[a.id]||0)+1;applySkillShifts(s,actor,a.shift,targetId,meetsCondition);}
  if(a.selfDamage&&actor.hp>0)actor.hp=Math.max(1,actor.hp-Math.max(0,a.selfDamage+(actor.side==="player"?s.buffs.risk:0)));
  if(a.cooldown){actor.cooldowns[a.id]=Math.max(actor.cooldowns[a.id]||0,a.cooldown);actor.cooldownFresh.push(a.id);}
  const ownShift=affected&&a.shift?.some(t=>t.slot===a.id&&t.form!=="base");
  if(ownShift&&actor.skillForms[a.id]&&a.cooldown){actor.skillForms[a.id].returnCooldown=actor.cooldowns[a.id];delete actor.cooldowns[a.id];actor.cooldownFresh=actor.cooldownFresh.filter(id=>id!==a.id);}
  triggerReactives(s,actor,a.defense?"defense":isFriendly?"support":"attack",null,effectsContext(reactions));
  refreshSkillForms(s);return {skipped:false,totalDamage,reactions,abilityArt:a.art,formKey:a.formKey||"base"};
}
function grantTurn(s,side,opening=false,recoveries=[]){
  const count=opening&&side==="player"?1:living(team(s,side)).length,draws=[];
  for(let i=0;i<count;i++){const id=resources[Math.min(3,Math.floor(s.rng()*4))].id;gain(s,side,id);draws.push(id);}
  s.energyDraws[side]=draws;
  for(const u of living(team(s,side))){
    for(const regen of u.regens){const restored=heal(u,regen.heal),source=[...s.allies,...s.enemies].find(v=>v.id===regen.sourceId);if(restored)recoveries.push({kind:"recovery",actorId:source?.id||u.id,targetId:u.id,actorName:source?.name||u.name,label:regen.label,heal:restored});regen.turns--;}u.regens=u.regens.filter(r=>r.turns>0);
    if(u.passive?.type==="ward")shield(u,u.passive.amount);
    if(u.passive?.type==="renew")heal(u,u.passive.amount);
    if(s.round>1)heal(u,u.regeneration+(side==="player"?s.global.regeneration||0:0));
  }
}
// Planning reads public combat state only; the player's queue and future draws are never consulted.
export function getCombatPlan(s,side="enemy"){
 return planTeamActions(s,side,{getAbilityResourceCosts,getValidTargets,meetsCondition,attackValue,previewHit,skillSealReason});
}
function planAI(s){s.intents=s.enemyPlanner(s);}
export function createBattle(ids,enemyTeam,config={}){
  const global=config.globalEffects||{},resonance=getResonance(ids),buffValues=(config.buffs||[]).reduce((acc,id)=>{for(const [k,v]of Object.entries(buffs.find(b=>b.id===id)?.effect||{}))acc[k]=(acc[k]||0)+v;return acc;},{damage:0,shield:0,essence:0,cinza:0,graca:0,ruptura:0,maxHp:0,resonance:0,risk:0});resonance.bonus+=buffValues.resonance;
  const allies=ids.slice(0,3).map(id=>characterById[id]).filter(Boolean).map(c=>clone(c,"player",config));for(const u of allies){u.maxHp+=buffValues.maxHp+(global.maxHp||0);u.armor=global.armor||0;u.charge=Math.min(3,global.startingCharge||0);u.hp=config.teamHealth?.[u.id]==null?u.maxHp:Math.max(0,Math.min(u.maxHp,config.teamHealth[u.id]));u.shield=Math.min(80,buffValues.shield+(global.shield||0));}
  const s={enemyPlanner:config.enemyPlanner||getCombatPlan,rng:config.rng||Math.random,energyDraws:{player:[],enemy:[]},global,difficulty:config.difficulty||0,allies,enemies:enemyTeam.map(c=>clone(c,"enemy")),round:1,resources:Object.fromEntries(resources.map(r=>[r.id,(buffValues[r.id]||0)+(global[r.id]||0)])),enemyResources:Object.fromEntries(resources.map(r=>[r.id,0])),resonance,buffs:buffValues,acted:[],actionLimit:3,queue:[],resolution:[],resolutionSide:null,phase:"player",log:["Escolha uma habilidade, clique no alvo e confirme a fila para executar seu turno."],intents:[]};grantTurn(s,"player",true);grantTurn(s,"enemy",true);refreshSkillForms(s);planAI(s);return s;
}
export function chooseAction(s,actorId,abilityId,targetId){
  refreshSkillForms(s);
  if(s.phase!=="player")return {ok:false,reason:"Aguarde a resolução do turno."};const actor=byId(s.allies,actorId),a=actor?.abilities.find(a=>a.id===abilityId);
  if(!actor||!a)return {ok:false,reason:"Personagem ou habilidade indisponível."};if(actor.stunned)return {ok:false,reason:"Personagem Atordoado neste turno."};if(skillSealReason(actor,a))return {ok:false,reason:skillSealReason(actor,a)};if(actor.cooldowns[abilityId])return {ok:false,reason:`Recarga: ${actor.cooldowns[abilityId]} turno(s).`};if(!canAffordAbility(s,actor,a))return {ok:false,reason:"Os recursos livres não pagam esta habilidade."};
  const valid=getValidTargets(s,actor,a),target=["self","team","all-enemies"].includes(a.target)?valid[0]:valid.find(u=>u.id===targetId);if(!target)return {ok:false,reason:"Escolha um alvo destacado. Inimigos Invulneráveis não podem ser alvos."};
  const action={actorId,abilityId,formKey:a.formKey||"base",targetId:a.target==="self"?actor.id:target.id,side:"player"},index=s.queue.findIndex(a=>a.actorId===actorId);if(index>=0)s.queue[index]=action;else s.queue.push(action);return {ok:true,action};
}
export function removeQueuedAction(s,id){if(s.phase!=="player")return false;s.queue=s.queue.filter(a=>a.actorId!==id);return true;}
export function moveQueuedAction(s,id,direction){if(s.phase!=="player")return false;const i=s.queue.findIndex(a=>a.actorId===id),j=i+direction;if(i<0||j<0||j>=s.queue.length)return false;[s.queue[i],s.queue[j]]=[s.queue[j],s.queue[i]];return true;}
export function commitTurn(s){if(s.phase!=="player")return {ok:false,reason:"O turno já está em resolução."};s.phase="resolving";s.resolutionSide="player";s.acted=[];s.resolution=[...s.queue.map(a=>({...a})),{type:"handoff"},{type:"effects"},{type:"next-turn"}];s.queue=[];return {ok:true};}
function endOpposing(s,units){expireReactives(s,units,"opposing",effectsContext());for(const u of units){if(!u.healingBlockFresh)u.healingBlock=0;u.healingBlockFresh=false;u.invulnerable=0;u.counter=0;u.reduction=0;if(!u.exposedFresh)u.exposed=0;u.exposedFresh=false;}}
function endActing(s,units,reactions=[]){expireReactives(s,units,"acting",effectsContext(reactions));for(const u of units){if(!u.boostFresh)u.boost=0;u.boostFresh=false;u.weakened=Math.max(0,u.weakened-1);u.stunned=Math.max(0,u.stunned-1);}}
function tickEffects(s){for(const u of [...s.allies,...s.enemies]){if(u.hp<=0)continue;for(const d of u.dots){const r=hit(u,d.damage,{damageType:"affliction",ignoreInvulnerability:true});log(s,`${u.name}: ${d.tag} causa ${r.dealt} de aflição.`);d.turns--;}u.dots=u.dots.filter(d=>d.turns>0);for(const [id,m]of Object.entries(u.marks)){m.turns--;if(m.turns<=0)delete u.marks[id];}}}
function nextTurn(s,recoveries){for(const u of [...s.allies,...s.enemies]){const fresh=new Set(u.cooldownFresh);u.cooldownFresh=[];for(const [id,n]of Object.entries(u.cooldowns))if(!fresh.has(id)){if(n>1)u.cooldowns[id]=n-1;else delete u.cooldowns[id];}}s.round++;s.acted=[];s.phase="player";s.resolutionSide=null;grantTurn(s,"player",false,recoveries);grantTurn(s,"enemy",false,recoveries);refreshSkillForms(s);for(const u of [...s.allies,...s.enemies])u.cooldownFresh=[];planAI(s);log(s,`Turno ${s.round}: recursos recebidos. Monte sua próxima fila.`);}
function resolveAction(s){
  if(s.phase!=="resolving")return {done:true};refreshSkillForms(s);const action=s.resolution.shift();
  if(!action||action.type==="next-turn"){const before=JSON.stringify([...s.allies,...s.enemies].map(formSummary)),recoveries=[];nextTurn(s,recoveries);const changed=before!==JSON.stringify([...s.allies,...s.enemies].map(formSummary));return {done:true,newTurn:true,...(recoveries.length?{event:{mode:"recovery",reactions:recoveries,title:"Regeneração",summary:"A recuperação do início do turno foi aplicada."}}:changed?{event:{mode:"forms",title:"Técnicas alteradas",summary:"As formas foram atualizadas para este turno."}}:{})};}
  if(action.type==="handoff"){const reactions=[];endActing(s,s.allies,reactions);endOpposing(s,s.enemies);if(outcome(s))return {done:true,event:{mode:"effects",reactions,title:"Efeito ativado",summary:"As reações encerraram o confronto."}};s.resolutionSide="enemy";planAI(s);s.resolution.unshift(...s.intents.map(a=>({...a})));return {done:false,event:{mode:reactions.length?"reactions":"turn",reactions,title:reactions.length?"Efeito reativo":"Turno da oposição",summary:"As habilidades adversárias serão resolvidas uma a uma."}};}
  if(action.type==="effects"){const reactions=[];endActing(s,s.enemies,reactions);endOpposing(s,s.allies);tickEffects(s);outcome(s);return {done:s.phase!=="resolving",event:{mode:reactions.length?"reactions":"effects",reactions,title:reactions.length?"Efeito reativo":"Efeitos persistentes",summary:"Aflições e durações foram atualizadas."}};}
  const actor=byId(team(s,action.side),action.actorId),a=actor?.abilities.find(a=>a.id===action.abilityId);
  if(!actor||!a)return {done:false,event:{...action,skipped:true,title:"Ação cancelada",summary:"O personagem deixou o combate antes de agir."}};
  if(actor.stunned){log(s,`${actor.name} perde a ação: Atordoado.`);return {done:false,event:{...action,skipped:true,title:`${actor.name} · Atordoado`,summary:"A habilidade foi interrompida."}};}
  if(actor.cooldowns[a.id])return {done:false,event:{...action,skipped:true,title:"Técnica em recarga",summary:"A recarga impede esta ação. Recursos preservados."}};
  if(skillSealReason(actor,a))return {done:false,event:{...action,skipped:true,title:skillSealReason(actor,a),summary:"A técnica foi selada antes de agir. Recursos preservados."}};
  if(action.formKey&&action.formKey!==(a.formKey||"base"))return {done:false,event:{...action,skipped:true,title:"Técnica alterada",summary:"A forma mudou após a confirmação. Ação cancelada; recursos preservados."}};
  const result=apply(s,actor,a,action.targetId);if(action.side==="player")s.acted.push(actor.id);outcome(s);return {done:s.phase!=="resolving",event:{...action,...result,title:a.name,actorName:actor.name,summary:result.reason||""}};
}
export function passTurn(s){if(!commitTurn(s).ok)return false;let guard=0;while(s.phase==="resolving"&&guard++<20)resolveNextAction(s);return true;}
export function createEnemyTeam(elo,playerIds,encounter="normal",sequence=0,config={}){
  const roster=Object.values(characterById).filter(c=>c.eloId===elo.id),other=roster.filter(c=>!playerIds.includes(c.id)),source=other.length>=3?other:roster,m=difficultyModifiers(config.difficulty),multiplier=encounter==="elite"?1.12:encounter==="mini"?1.2:encounter==="boss"?1.16:1;
  const boss=config.bossIds?.map(id=>characterById[id]).filter(c=>c?.eloId===elo.id);
  return [0,1,2].map(i=>{
    const c=encounter==="boss"&&boss?.length===3?boss[i]:source[(sequence*3+i)%source.length],baseHp=encounter==="boss"?i===0?135:115:encounter==="mini"?130:encounter==="elite"?120:100;
    return {...c,sourceId:c.id,id:`oponente-${sequence}-${i}`,name:encounter==="elite"?`Elite · ${c.name}`:c.name,maxHp:Math.round(baseHp*m.hp),startingShield:m.shield,armor:m.armor,regeneration:m.regen,abilities:c.abilities.map(a=>scaleSkillForms(a,form=>({...form,damage:Math.round((form.damage||0)*multiplier*m.damage),...(form.dot?{dot:{...form.dot,damage:form.dot.damage+m.affliction}}:{}),...(form.reactive?.damage?{reactive:{...form.reactive,damage:Math.round(form.reactive.damage*multiplier*m.damage)+m.affliction}}:{})})))};
  });
}
export function getEloById(id){return getElo(id);}

export function resolveNextAction(s){const result=resolveAction(s);if(checkDeathInfluences(s))return {...result,done:true,influence:true};return result;}

// Authoritative human-v-human entry points. No client health, costs or results are accepted.
export function createDuel(firstIds,secondIds,config={}){
 const roster=secondIds.map((id,i)=>({...characterById[id],sourceId:id,id:`rival-${i}-${id}`}));
 const s=createBattle(firstIds,roster,{...config,enemyPlanner:()=>[]});
 s.humanSides=true;s.turnSide='player';s.turnNumber=1;s.intents=[];
 // Both human teams receive their own composition bonus.
 s.enemyResonance=getResonance(secondIds);return s;
}
export function submitDuelTurn(s,side,actions){
 if(s.phase!=='player'||s.turnSide!==side)throw new Error('Não é seu turno.');
 if(!Array.isArray(actions)||actions.length>3)throw new Error('Fila inválida.');
 refreshSkillForms(s);const used=new Set(),remaining={...pool(s,side)},queue=[];
 for(const ref of actions){
  const actor=byId(team(s,side),ref.actorId),a=actor?.abilities.find(a=>a.id===ref.abilityId);
  if(!actor||!a||used.has(actor.id)||actor.stunned||actor.cooldowns[a.id]||skillSealReason(actor,a))throw new Error('Ação indisponível.');
  if(!getValidTargets(s,actor,a).some(u=>u.id===ref.targetId))throw new Error('Alvo inválido.');
  for(const [id,n]of Object.entries(getAbilityResourceCosts(actor,a))){remaining[id]-=n;if(remaining[id]<0)throw new Error('Energia insuficiente.');}
  used.add(actor.id);queue.push({actorId:actor.id,abilityId:a.id,targetId:ref.targetId,formKey:a.formKey||'base',side});
 }
 s.phase='resolving';s.resolution=[...queue,{type:'duel-end',side}];s.queue=[];continueDuel(s);
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
