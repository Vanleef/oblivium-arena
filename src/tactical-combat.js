import {refreshConquestObjectives,collectConquestObjective,fortressPenaltyOptions,applyFortressPenalty,chooseFortressPenalty} from './conquest-objectives.js';
import {combatScene} from './combat-scenes.js';
import {conquestTechnique} from './conquest-techniques.js';
import {conquestProgress,conquestOfferOptions} from './conquest-augments.js';
import {techniqueElement,applyElementalArea,applyFieldEvent,pruneSurfaces} from './tactical-elements.js';
import {tacticalRequirementReason} from './tactical-requirements.js';
import {createTacticalEnvironment,resolveTacticalEnvironment} from './tactical-environment.js';
import {tacticalChestOptions,addTacticalAugment,triggerTacticalAugments} from './tactical-chests.js';
import {orderTacticalActions,tacticalFirstSide} from './tactical-order.js';
import {tacticalComboEligible,tacticalComboResult} from './tactical-combo.js';
import {characterById} from './data.js';
import {getResonance} from './rules.js';
import {createBattle,resolveBoardTechnique,resolveBoardReactiveCounter,finishBoardRound,getValidTargets} from './combat.js';
import {tacticalAnimationFamily} from './tactical-animation.js';
import {tacticalDuelResolve} from './tactical-duel.js';
import {getAbilityResourceCosts,resolveResourcePayment,resourceIds,resolveEssenceExchange} from './resource-costs.js';
import {refreshSkillForms} from './skill-state.js';
import {skillSealReason} from './combat-effects.js';
import {tacticalRoster,tacticalOpponentRoster,tacticalSpec} from './tactical-kits.js';
import {onBoard,sameCell,distance,movementRange,occupied,obstacle,canStep,lineOfSight,patternCells,directions,cellKey,boardCells,boardWidth,boardHeight,boardTracks,boardMetricPoint,mirrorCell,mirrorDirection,fortressClosure,findPath,unitFacing,faceMovement} from './tactical-board.js';

const fortressBasicAttack=Object.freeze({
 id:'fortress-basic',name:'Ataque Básico',description:'Causa 12 de dano físico na primeira casa à frente após o movimento.',
 target:'enemy',damage:12,damageType:'physical',cooldown:0,formKey:'base'
});

export const tacticalUnits=s=>[...s.allies,...s.enemies];
const team=(s,side)=>side==='player'?s.allies:s.enemies;
const poolKey=side=>side==='player'?'resources':'enemyResources';
const copy=value=>JSON.parse(JSON.stringify(value));
const planningCopy=s=>copy({...s,tactical:{...s.tactical,events:[]}});
const fail=reason=>({ok:false,reason});
const otherSide=side=>side==='player'?'enemy':'player';
const validSide=side=>side==='player'||side==='enemy';
const actorFor=(s,side,id)=>team(s,side).find(u=>u.id===id&&u.hp>0);
const stamp=(s,event)=>{s.tactical.events.push({round:s.round,...event});};
const cleanPoint=(p,s)=>onBoard(p,s)?{x:p.x,y:p.y}:null;
const chestTierNames=Object.freeze({silver:'Prateado',gold:'Dourado',prismatic:'Prismático'});
function livingTeam(s,side){return team(s,side).filter(u=>u.hp>0);}
function chestTier(s,side){const count=livingTeam(s,side).length;return count<=1?'prismatic':count===2?'gold':'silver';}
function applyChestEffect(s,side,effect){
 const units=team(s,side),living=livingTeam(s,side),pool=s[poolKey(side)];
 const healUnit=(unit,fraction)=>{if(unit&&unit.hp>0)unit.hp=Math.min(unit.maxHp,unit.hp+Math.max(1,Math.round(unit.maxHp*fraction)));};
 const addShield=(unit,amount)=>{if(unit?.hp>0)unit.shield=Math.min(Math.round(unit.maxHp*.5),unit.shield+amount);};
 if(effect.type==='conquest-augment'){
  addTacticalAugment(s,side,{...effect,id:effect.augmentId});
  return;
 }
 const recipient=units.find(unit=>unit.id===effect.actorId&&unit.hp>0);
 const healAmount=(unit,amount)=>{if(unit?.hp>0&&!unit.healingBlock)unit.hp=Math.min(unit.maxHp,unit.hp+amount);};
 const cleanseUnit=unit=>{
  if(!unit?.hp)return;
  unit.dots=[];unit.marks={};unit.reactives=(unit.reactives||[]).filter(r=>!r.harmful);
  for(const key of ['frozen','stunned','weakened','exposed','sealSupport','sealAttack','healingBlock'])unit[key]=0;
 };
 if(effect.type==='heal'){healAmount(recipient,effect.amount);return;}
 if(effect.type==='shield'){addShield(recipient,effect.amount);return;}
 if(effect.type==='reduction'){if(recipient)recipient.reduction=Math.max(recipient.reduction||0,effect.amount);return;}
 if(effect.type==='heal-team'){for(const unit of living)healAmount(unit,effect.amount);return;}
 if(effect.type==='restore'){cleanseUnit(recipient);healAmount(recipient,effect.amount);return;}
 if(effect.type==='cleanse'){cleanseUnit(recipient);return;}
 if(effect.type==='refresh'||effect.type==='refresh-team'){
  for(const unit of effect.type==='refresh-team'?living:[recipient].filter(Boolean)){
   for(const [id,left] of Object.entries(unit.cooldowns)){
    if(left<=effect.amount)delete unit.cooldowns[id];else unit.cooldowns[id]-=effect.amount;
   }
  }
  return;
 }
 if(['leap','terrain','breach','surface'].includes(effect.type))effect={...effect,type:'fortress-'+effect.type};
 if(effect.type==='fortress-heal')healUnit(units.find(u=>u.id===effect.actorId),.4);
 else if(effect.type==='fortress-ward'){
  const unit=units.find(u=>u.id===effect.actorId);
  addShield(unit,18);
  if(unit?.hp>0){unit.reduction=Math.max(unit.reduction||0,6);}
 }
 else if(effect.type==='fortress-surface'){
  const origin=s.tactical.positions[effect.actorId];
  if(!origin||!living.some(unit=>unit.id===effect.actorId))return;
  const cells=boardCells(s).filter(p=>distance(origin,p,s)<=1&&!obstacle(s,p));
  applyElementalArea(s,effect.element,cells,[]);
 }
 else if(effect.type==='fortress-leap'){
  if(!s.tactical.fortress.leaps.includes(effect.actorId))s.tactical.fortress.leaps.push(effect.actorId);
 }else if(effect.type==='fortress-rally'){
  for(const unit of living)healUnit(unit,.14);
 }else if(effect.type==='fortress-refresh'){
  for(const unit of living){
   addShield(unit,6);
   for(const [id,left] of Object.entries(unit.cooldowns)){
    if(left<=1)delete unit.cooldowns[id];else unit.cooldowns[id]--;
   }
  }
 }
 else if(effect.type==='fortress-terrain'){
  const enemyEdge=side==='player'?boardWidth(s)-1:0;
  const point=boardCells(s).filter(p=>p.x>0&&p.x<boardWidth(s)-1&&!occupied(s,p)&&!obstacle(s,p)&&!sameCell(p,s.tactical.environment?.position)).sort((a,b)=>Math.abs(a.x-enemyEdge)-Math.abs(b.x-enemyEdge)||Math.abs(a.y-2)-Math.abs(b.y-2))[0];
  if(point)s.tactical.obstacles.push(point);
 }else if(effect.type==='fortress-breach'){
  const unit=units.find(u=>u.id===effect.actorId);
  if(!unit?.hp||unit.abilities.some(a=>a.id==='fortress-breach'))return;
  const art=unit.abilities[0]?.art;
  unit.abilities.push({id:'fortress-breach',name:'Ruptura do Bastião',description:'Causa 18 de dano perfurante e aplica Exposto na área em cruz.',target:'all-enemies',damage:18,damageType:'piercing',expose:1,cooldown:3,formKey:'base',art});
 }else if(effect.type==='heal-lowest'){
  const target=[...living].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp||a.id.localeCompare(b.id))[0];healUnit(target,effect.fraction);
 }else if(effect.type==='shield-team')for(const unit of living)addShield(unit,effect.amount);
 else if(effect.type==='essence')pool[effect.resource||'essence']=(pool[effect.resource||'essence']||0)+effect.amount;
 else if(effect.type==='blood-essence'){const unit=[...living].sort((a,b)=>b.hp-a.hp||a.id.localeCompare(b.id))[0];if(unit&&unit.hp>12){unit.hp-=12;pool[effect.resource]=(pool[effect.resource]||0)+effect.amount;}}
 else if(effect.type==='augment')addTacticalAugment(s,side,effect.augment);
 else if(effect.type==='cleanse-team')for(const unit of living){unit.dots=[];unit.marks={};unit.reactives=(unit.reactives||[]).filter(r=>!r.harmful);for(const key of ['stunned','weakened','exposed','sealSupport','sealAttack','healingBlock'])unit[key]=0;}
 else if(effect.type==='boost-team')for(const unit of living){unit.boost=Math.max(unit.boost||0,effect.amount);unit.boostFresh=true;}
 else if(effect.type==='full-recover'){
  for(const unit of living){unit.hp=unit.maxHp;unit.dots=[];unit.stunned=0;unit.weakened=0;unit.exposed=0;}
 }else if(effect.type==='prismatic-surge'){
  pool.essence=(pool.essence||0)+6;
  for(const unit of living){addShield(unit,24);unit.boost=Math.max(unit.boost||0,20);unit.boostFresh=true;}
 }
}
function claimTacticalChests(s,side,cells){
 const chests=s.tactical.chests.filter(chest=>cells.some(point=>sameCell(point,chest.position)));
 return chests.map(chest=>{
  s.tactical.chests=s.tactical.chests.filter(item=>item.id!==chest.id);
  const offer=makeChestOffer(s,side,chest);
  const entry={chestId:chest.id,tier:offer.tier,tierName:offer.tierName,side,position:chest.position};
  if(side==='player')s.tactical.pendingChestRewards.push(offer);
  else if(s.tactical.activation)(s.tactical.enemyChestRewards??=[]).push(offer);
  else{const option=offer.options[0];applyChestEffect(s,side,option.effect);entry.reward=option.title;}
  return {...entry,...(side==='player'?{offerId:offer.id}:{})};
 });
}
function makeChestOffer(s,side,chest){
 const tier=chestTier(s,side);
 return {id:`${chest.id}:${side}`,chestId:chest.id,side,tier,tierName:chestTierNames[tier],round:s.round,options:tacticalChestOptions(s,side,tier)};
}
const chestInterval=s=>s.tactical.activation?3:4;
const chestSpawnRound=s=>s.tactical.activation?s.round%3===2:s.round%4===0;
function announceTacticalChest(s){
 if(s.tactical.activation?s.round%chestInterval(s)!==1:s.round%4!==3)return;
 const center={x:2,y:2};
 const point=boardCells(s).filter(p=>!obstacle(s,p)&&!s.tactical.chests.some(c=>sameCell(c.position,p)))
  .sort((a,b)=>distance(a,center)-distance(b,center)||a.y-b.y||a.x-b.x)[0];
 if(point)s.tactical.nextChest={position:{...point},round:s.round+1};
}
function spawnTacticalChest(s){
 const center={x:2,y:2},announced=s.tactical.nextChest?.position,point=(announced&&(!s.tactical.activation||!occupied(s,announced))?announced:null)||boardCells(s).filter(p=>!occupied(s,p)&&!obstacle(s,p)&&!s.tactical.chests.some(chest=>sameCell(chest.position,p)))
  .sort((a,b)=>distance(a,center)-distance(b,center)||a.y-b.y||a.x-b.x)[0];
 if(!point)return null;
 const before=replayState(s);
 const chest={id:`chest-${s.round}-${s.tactical.chestSequence++}`,position:point,spawnedRound:s.round};
 s.tactical.nextChest=null;s.tactical.chests.push(chest);stamp(s,{type:'chest-spawn',title:'Um baú apareceu na arena',chest:copy(chest),before,after:replayState(s)});
 return chest;
}
export function rerollTacticalChestReward(s,offerId){
 const offer=s.tactical.pendingChestRewards?.[0],progress=s.tactical.fortress?.progress;
 if(!offer?.fortress||offer.invasion||offer.id!==offerId||offer.side!=='player'||!progress||progress.spins<1)return fail('Nenhum giro disponível.');
 if(s.tactical.stage!=='reward')return fail('Aguarde a escolha de aprimoramento.');
 const next={...offer,rerolls:(offer.rerolls||0)+1};
 const options=conquestOfferOptions(s,next,offer.options.map(option=>option.id));
 if(options.length!==3)return fail('Não há três novas opções compatíveis neste tier.');
 progress.spins--;progress.spentSpins=(progress.spentSpins||0)+1;offer.rerolls=next.rerolls;offer.options=options;
 return {ok:true,offer:copy(offer),spins:progress.spins};
}
export function chooseTacticalChestReward(s,offerId,optionId,targetId){
 const offer=s.tactical.pendingChestRewards?.[0];
 if(!offer||offer.id!==offerId||offer.side!=='player')return fail('Escolha de baú indisponível.');
 const option=offer.options.find(item=>item.id===optionId);if(!option)return fail('Aprimoramento inválido.');
 if(offer.invasion){
  const applied=applyFortressPenalty(s,'player',option.effect,targetId,offer.round);if(!applied.ok)return applied;
 }else{
  if(offer.objective&&!actorFor(s,'player',offer.actorId))return fail('O portador saiu de combate.');
  applyChestEffect(s,'player',option.effect);
  if(offer.objective)actorFor(s,'player',offer.actorId).objectiveAugments=(actorFor(s,'player',offer.actorId).objectiveAugments||0)+1;
 }
 s.tactical.pendingChestRewards.shift();
 for(const pending of s.tactical.pendingChestRewards.filter(item=>item.fortress&&!item.invasion)){
  if(pending.objective&&!actorFor(s,pending.side,pending.actorId))continue;
  if(!livingTeam(s,pending.side).some(unit=>unit.id===pending.actorId))pending.actorId=livingTeam(s,pending.side)[0]?.id;
  pending.options=conquestOfferOptions(s,pending);
 }
 for(const pending of s.tactical.pendingChestRewards)if(!pending.fortress&&!pending.invasion)pending.options=tacticalChestOptions(s,pending.side,pending.tier);
 if(!s.tactical.pendingChestRewards.length&&s.tactical.stage==='reward'){s.tactical.stage='planning';s.phase='tactical-planning';}
 return {ok:true,offer:copy(offer),option:copy(option),next:copy(s.tactical.pendingChestRewards[0]||null)};
}

export function createTacticalBattle(playerIds,enemyIds,config={}){
 const extended=Boolean(config.fortress&&config.campaign);
 const validIds=(ids,min,max)=>Array.isArray(ids)&&ids.length>=min&&ids.length<=max&&new Set(ids).size===ids.length;
 if(!validIds(playerIds,3,3)||playerIds.some(id=>!tacticalRoster.includes(id))||
  !validIds(enemyIds,3,extended?5:3)||enemyIds.some(id=>!tacticalOpponentRoster.includes(id)))throw Error('Formação inválida para este modo.');
 const creatures=extended?(config.creatures||[]):[];
 if(enemyIds.length+creatures.length>5||creatures.some(unit=>!unit.npcOnly||!unit.abilities?.length))throw Error('Encontro de campanha inválido.');
 const enemyTeam=[...enemyIds.map(id=>characterById[id]),...creatures].map((unit,i)=>({...unit,sourceId:unit.id,id:'rival-'+i+'-'+unit.id}));
 const seed=Number.isSafeInteger(config.seed)?config.seed:1;
 const s=createBattle(playerIds,enemyTeam,{rngSeed:seed,fortress:config.fortress,enemyPlanner:()=>[],buffs:config.buffs||[],memories:config.memories||[],globalEffects:config.globalEffects||{},teamHealth:config.teamHealth});
 s.humanSides=true;s.enemyResonance=getResonance(enemyIds);
 s.tactical={version:1,environment:createTacticalEnvironment(config.environment),size:config.compact?6:5,positions:{},facings:{},aimFacings:{},lastFortresses:{},scene:combatScene(config.scene).id,obstacles:[],chests:[],chestSequence:0,pendingChestRewards:[],plans:{},events:[],firstSide:(seed>>>0)%2?'player':'enemy',stage:'planning'};
 if(config.fortress){
  Object.assign(s.tactical,{compact:Boolean(config.compact),width:config.compact?6:9,height:6,surfaces:{},weather:null,fortress:{entered:[],rearmed:[],fallen:[],closedColumns:[],closedRows:[],rewardSequence:0,leaps:[],equipped:{},progress:conquestProgress(config.augmentProgress)}});
  for(const u of tacticalUnits(s)){
   if(!u.npcOnly){u.maxHp=100;u.hp=config.teamHealth?.[u.id]??100;}
   u.abilities.push({...fortressBasicAttack});
   s.tactical.fortress.equipped[u.id]=fortressBasicAttack.id;
  }
 }
 const start=i=>s.tactical.fortress&&!s.tactical.compact?{x:0,y:i*2+1}:{x:i===1?1:0,y:i+1};
 team(s,'player').forEach((u,i)=>{s.tactical.positions[u.id]=start(i);});
 team(s,'enemy').forEach((u,i)=>{
  const point=extended&&enemyTeam.length>3?{x:0,y:(s.tactical.compact?[1,2,3,0,4]:[1,3,5,0,2])[i]}:start(i);
  s.tactical.positions[u.id]=mirrorCell(point,s);
 });
 if(s.tactical.fortress)for(const unit of tacticalUnits(s)){
  s.tactical.lastFortresses[unit.id]=unit.side==='player'?0:boardWidth(s)-1;
  s.tactical.facings[unit.id]=unitFacing(s,unit);
 }
 const obstacles=config.obstacles||[];
 if(!Array.isArray(obstacles)||obstacles.some(p=>!onBoard(p,s)||occupied(s,p))||new Set(obstacles.map(cellKey)).size!==obstacles.length)throw Error('Obstáculos inválidos.');
 s.tactical.obstacles=obstacles.map(point=>cleanPoint(point,s));
 if(s.tactical.environment&&obstacles.some(p=>sameCell(p,s.tactical.environment.position)))throw Error('A casa ambiental não pode ser um obstáculo.');
 if(config.routeEnemyShield)for(const u of s.enemies)u.shield=Math.min(Math.floor(u.maxHp/2),(u.shield||0)+Math.max(0,Math.min(18,config.routeEnemyShield)));
 if(!config.compact&&(config.alternating||config.fortress)){resetTacticalActivation(s);if(!config.fortress)announceTacticalChest(s);}
 if(s.tactical.fortress)for(const reward of config.fortressRewards||[]){
  if(reward==='shield'||reward==='gold-ward')applyChestEffect(s,'player',{type:'shield-team',amount:reward==='gold-ward'?16:8});
  if(reward==='heal')applyChestEffect(s,'player',{type:'heal-team',amount:8});
  if(reward==='purify')for(const unit of livingTeam(s,'player'))unit.armor=(unit.armor||0)+5;
  if(reward==='leap')for(const unit of livingTeam(s,'player'))s.tactical.fortress.leaps.push(unit.id);
  const campaignAugments={
   march:{trigger:'move',stat:'shield',amount:5},
   edge:{trigger:'modify',stat:'damage',amount:5},
   mender:{trigger:'modify',stat:'heal',amount:5},
   'gold-recovery':{trigger:'move',stat:'heal',amount:8},
   'gold-support':{trigger:'modify',stat:'shield',amount:8},
   'prism-edge':{trigger:'modify',stat:'damage',amount:12},
   'prism-march':{trigger:'move',stat:'shield',amount:12},
   'prism-mender':{trigger:'modify',stat:'heal',amount:12}
  };
  const augment=campaignAugments[reward];
  if(augment)for(const unit of livingTeam(s,'player')){
   const compatible=augment.trigger!=='modify'||unit.abilities.some(a=>a.id!=='fortress-basic'&&a[augment.stat]>0);
   if(compatible)addTacticalAugment(s,'player',{...augment,type:'conquest-augment',id:'campaign:'+reward,actorId:unit.id,title:'Travessia'});
  }
 }
 if(s.tactical.fortress)refreshConquestObjectives(s);
 s.phase='tactical-planning';s.queue=[];s.intents=[];
 return s;
}

// Safe input to AI / spectators / clients: no sealed plan, function or future random state.
export function tacticalView(s,side='player'){
 if(!validSide(side))throw Error('Lado inválido.');
 const v=planningCopy(s);delete v.rngState;delete v.rng;delete v.enemyPlanner;v.queue=[];v.intents=[];v.resolution=[];
 const confirmed=Object.fromEntries(['player','enemy'].map(k=>[k,Boolean(s.tactical.plans[k])]));
 v.tactical.plans={};delete v.tactical.enemyChestRewards;v.tactical.confirmed=confirmed;
 delete v.tactical.objectiveSeed;
 if(v.tactical.objectives)v.tactical.objectives=v.tactical.objectives[side]?{[side]:v.tactical.objectives[side]}:{};
 v.tactical.pendingChestRewards=v.tactical.pendingChestRewards.filter(offer=>offer.side===side);
 return v;
}

function definition(s,ref){
 const actor=actorFor(s,ref.side,ref.actorId);if(!actor)return null;
 const current=actor.abilities.find(a=>a.id===ref.abilityId);if(!current)return null;
 if(ref.formKey&&ref.formKey!==(current.formKey||'base')){
  const form=current._formRoot?.forms?.find(f=>f.formKey===ref.formKey);if(form)return {...form,id:current.id,formKey:ref.formKey};
 }
 return current;
}
function priority(s,ref){return ref.type==='move'?0:ref.type==='guard'?1:tacticalSpec(actorFor(s,ref.side,ref.actorId),definition(s,ref)).priority;}
function orderedOwn(s,refs){return orderTacticalActions(s,refs);}

function actionSpec(s,actor,ability){
 const base=tacticalSpec(actor,ability);
 if(s.tactical.fortress&&(!ability.formKey||ability.formKey==='base')){
  const id=actor.sourceId||actor.id,slot=ability.id;
  if(id==='o-acougueiro'&&slot==='impulso')return {...base,pattern:'line',range:1,length:1};
  if(id==='o-acougueiro'&&slot==='voto')return {...base,pattern:'cone',range:2,length:2};
  if(id==='a-viuva-escarlate'&&slot==='impulso')return {...base,pattern:'line',range:2,length:2};
  if(id==='o-escudo-vivo'&&slot==='impulso')return {...base,pattern:'line',range:1,length:1,displacement:{kind:'push',distance:1}};
 }
 if(!s.tactical.fortress||ability.id==='fortress-breach'||base.pattern==='self')return base;
 const support=['ally','friendly','team'].includes(ability.target);
 if(support)return {...base,pattern:ability.target==='team'?'cross':'cell',range:2};
 if(base.pattern==='line'||base.pattern==='cone')return {...base,range:Math.min(base.range,2),length:Math.min(base.length||2,3)};
 if(ability.stun||ability.sealAttack||ability.weaken)return {...base,pattern:base.pattern==='cell'?'cross':base.pattern,range:Math.min(base.range,2)};
 return {...base,range:Math.min(base.range,2)};
}
export const fortressTechniqueSpec=actionSpec;
export function tacticalArea(s,actor,ability,anchor,orientation){
 const spec=actionSpec(s,actor,ability),origin=s.tactical.positions[actor.id];
 const directional=['line','cone'].includes(spec.pattern);
 if(!origin||!onBoard(anchor,s)||(!s.tactical.fortress||!directional)&&distance(origin,anchor,s)>spec.range)return [];
 if(directional&&!directions.some(d=>d[0]===orientation?.[0]&&d[1]===orientation?.[1]))return [];
 const cells=patternCells(spec.pattern,origin,anchor,orientation,spec.length,s);
 if(spec.vision&&(!s.tactical.fortress||!directional)&&!lineOfSight(s,origin,anchor))return [];
 return cells.filter(p=>!obstacle(s,p)&&(!spec.vision||lineOfSight(s,origin,p)));
}
export function tacticalTargets(s,actor,ability,anchor,orientation){
 const cells=tacticalArea(s,actor,ability,anchor,orientation),spec=actionSpec(s,actor,ability),origin=s.tactical.positions[actor.id];
 return getValidTargets(s,actor,ability).filter(u=>u.hp>0&&cells.some(p=>sameCell(p,s.tactical.positions[u.id])))
 .filter(u=>['self','ally','friendly','team'].includes(ability.target)||!u.invulnerable||ability.ignoreInvulnerability)
 .sort((a,b)=>distance(origin,s.tactical.positions[a.id],s)-distance(origin,s.tactical.positions[b.id],s)||a.id.localeCompare(b.id)).slice(0,s.tactical.fortress?undefined:spec.limit).map(u=>u.id);
}
function grantCompactLeapShield(s,actor,from,to){
 if(!s.tactical.compact||!s.tactical.fortress?.leaps.includes(actor.id)||from.x===to.x||from.y===to.y||actor.compactLeapShieldRound===s.round)return 0;
 const gained=Math.max(0,Math.min(8,Math.round(actor.maxHp*.5)-(actor.shield||0)));
 actor.shield=(actor.shield||0)+gained;
 actor.compactLeapShieldRound=s.round;
 return gained;
}
function grantCompactWindShield(s,actor){
 if(!s.tactical.compact||s.tactical.weather?.id!=='wind'||s.tactical.weather.round!==s.round)return 0;
 const gained=Math.max(0,Math.min(5,Math.round(actor.maxHp*.5)-(actor.shield||0)));
 actor.shield=(actor.shield||0)+gained;
 return gained;
}
function move(s,ref,strict=false){
 const actor=actorFor(s,ref.side,ref.actorId);if(!actor||actor.stunned)return {skipped:true,reason:actor?'Atordoado.':'Personagem fora de combate.'};
 let at=s.tactical.positions[actor.id],moved=0;const from={...at},steps=[];
 for(const step of ref.path){if(!canStep(s,actor.id,at,step)){if(strict)return {skipped:true,reason:'Caminho bloqueado.'};break;}const previous={...at};at={...step};s.tactical.positions[actor.id]=at;faceMovement(s,actor.id,previous,at);steps.push({from:previous,to:{...at}});if(s.tactical.compact)claimObjective(s,ref.side,actor.id,at);moved++;}
 if(s.tactical.compact)refreshConquestObjectives(s);
 actor.actedThisTurn=true;
 const augmentNotes=moved?triggerTacticalAugments(s,ref.side,actor,'move'):[];
 const windShield=moved?grantCompactWindShield(s,actor):0;
 const leapShield=moved?steps.reduce((total,step)=>total+grantCompactLeapShield(s,actor,step.from,step.to),0):0;
 return {skipped:!moved,moved,from,to:{...at},steps,augmentNotes,windShield,leapShield,reason:moved<ref.path.length?'Passagem ocupada; movimento interrompido.':''};
}
function displaceTargets(s,actor,ids,displacement){
 if(!displacement)return [];
 const origin=s.tactical.positions[actor.id],moves=[];
 for(const id of ids){
  const target=tacticalUnits(s).find(u=>u.id===id);if(!target||target.hp<=0||actor.hp<=0)continue;
  const from={...s.tactical.positions[id]},sign=displacement.kind==='pull'?-1:1;
  const dx=Math.sign(from.x-origin.x)*sign,dy=Math.sign(from.y-origin.y)*sign;
  let to={x:from.x+dx,y:from.y+dy};
  if(s.tactical.fortress){const pos=boardMetricPoint(s,from),tracks=boardTracks(s);to={x:tracks.columns[pos.x+dx],y:tracks.rows[pos.y+dy]};}
  const moved=canStep(s,id,from,to);
  if(moved){
   s.tactical.positions[id]={...to};
   faceMovement(s,id,from,to);
   if(s.tactical.fortress){claimFortressEntry(s,{actorId:id,side:target.side,to});claimObjective(s,target.side,id,to);}
  }
  moves.push({actorId:id,name:target.name,kind:displacement.kind,from,to:moved?{...to}:from,moved});
 }
 return moves;
}
function execute(s,ref,{projection=false}={}){
 const actor=actorFor(s,ref.side,ref.actorId);if(!actor)return {skipped:true,reason:'Personagem fora de combate.'};
 if((s.tactical.activation||s.tactical.compact)&&actor.stunned)return {skipped:true,reason:'Atordoado.'};
 if(ref.type==='move')return move(s,ref,projection);
 if(ref.type==='guard'){
  const guard=Math.max(0,Math.min(6,Math.floor(actor.maxHp/2)-actor.shield));
  actor.shield+=guard;actor.actedThisTurn=true;
  return {title:'Guarda',cells:[s.tactical.positions[actor.id]],targets:[actor.id]};
 }
 refreshSkillForms(s);const ability=actor.abilities.find(a=>a.id===ref.abilityId);
 if(!ability)return {skipped:true,reason:'Técnica indisponível.'};
 const requirement=tacticalRequirementReason(s,actor,ability);if(requirement)return {skipped:true,reason:requirement};
 if((ref.residueSpend||0)>(actor.residue||0))return {skipped:true,reason:'Resíduo insuficiente no momento da ação.'};
 const spec=actionSpec(s,actor,ability),origin=s.tactical.positions[actor.id],anchor=spec.range===0?origin:ref.anchor;
 if(!tacticalArea(s,actor,ability,anchor,ref.orientation).length)return {skipped:true,reason:'A região ficou fora de alcance ou da linha de visão.'};
 const cells=tacticalArea(s,actor,ability,anchor,ref.orientation),ids=tacticalTargets(s,actor,ability,anchor,ref.orientation);
 const exposedBefore=ids.map(id=>tacticalUnits(s).find(u=>u.id===id)).filter(u=>u?.exposed).map(u=>({id:u.id,hp:u.hp,shield:u.shield||0}));
 const element=s.tactical.fortress?techniqueElement(actor,ability):null;
 const result=resolveBoardTechnique(s,{...ref,element,...(s.tactical.compact?{fortressCooldown:fortressCooldown(ability)}:{}),targetId:ids[0]||null},ids);
 const elemental=element&&!result.skipped&&result.combo?.outcome!=='miss'?applyElementalArea(s,element,cells,tacticalUnits(s).filter(u=>result.affectedTargetIds?.includes(u.id))):null;
 const displacements=!result.skipped?displaceTargets(s,actor,result.affectedTargetIds||[],spec.displacement):[];
 const exposedHit=exposedBefore.some(old=>{const u=tacticalUnits(s).find(u=>u.id===old.id);return u&&(u.hp<old.hp||(u.shield||0)<old.shield);});
 const augmentNotes=!result.skipped?triggerTacticalAugments(s,ref.side,actor,'skill',{exposedHit,ability,affected:result.affectedTargetIds?.length>0}):[];
 const chestsOpened=!s.tactical.fortress&&!projection&&!result.skipped&&(ability.damage>0||ability.dot||ability.dots?.length)
  ?claimTacticalChests(s,ref.side,cells):[];
 return {...result,element,elemental,targets:ids,cells,displacements,augmentNotes,...(chestsOpened.length?{chestsOpened,title:`${result.title||ability.name} · baú aberto`}:{})};
}

function normalizePlan(s,side,actions){
 if(!validSide(side))return fail('Lado inválido.');
 if(!Array.isArray(actions)||actions.length>6)return fail('A fila permite até seis ações.');
 const counts={},refs=[];
 for(const [order,ref]of actions.entries()){
  if(!ref||typeof ref!=='object')return fail('Ação inválida.');
  const actor=actorFor(s,side,ref.actorId);if(!actor||actor.stunned)return fail('Personagem indisponível.');
  counts[actor.id]=(counts[actor.id]||0)+1;if(counts[actor.id]>2)return fail('Cada personagem tem duas ações.');
  if(ref.type==='move'){
   if(!Array.isArray(ref.path)||ref.path.length<1||ref.path.length>movementRange(s,actor.id)||ref.path.some(p=>!onBoard(p,s)))return fail('Movimento inválido.');
   refs.push({type:'move',actorId:actor.id,side,path:ref.path.map(point=>cleanPoint(point,s)),order});
  }else if(ref.type==='skill'){
   const ability=actor.abilities.find(a=>a.id===ref.abilityId);if(!ability)return fail('Técnica inválida.');
   const formKey=typeof ref.formKey==='string'?ref.formKey:(ability.formKey||'base');
   if(formKey!=='base'&&formKey!==(ability.formKey||'base')&&!ability._formRoot?.forms?.some(f=>f.formKey===formKey))return fail('Forma inválida.');
   const anchor=cleanPoint(ref.anchor||s.tactical.positions[actor.id],s);if(!anchor)return fail('Região inválida.');
   const orientation=ref.orientation||(side==='player'?[1,0]:mirrorDirection([1,0]));
   if(!Array.isArray(orientation)||!directions.some(d=>d[0]===orientation[0]&&d[1]===orientation[1])||orientation.length!==2)return fail('Orientação inválida.');
   const spends={};for(const [key,max]of [['residueSpend',ability.spendResidueMax||0],['fractureSpend',ability.spendFracturesMax||0]]){const n=ref[key]??0;if(!Number.isInteger(n)||n<0||n>max)return fail('Gasto especial inválido.');if(n)spends[key]=n;}
   refs.push({...spends,type:'skill',actorId:actor.id,abilityId:ability.id,formKey,side,anchor,orientation:[...orientation],order});
  }else if(ref.type==='guard'&&s.tactical.activation&&!s.tactical.compact){refs.push({type:'guard',actorId:actor.id,side,order});}
  else return fail('Tipo de ação inválido.');
 }
 return {ok:true,actions:refs};
}

export function previewTacticalPlan(s,side,actions,selected){
 if(s.tactical.stage!=='planning')return fail('A rodada já está em resolução.');
 const normalized=normalizePlan(s,side,actions);if(!normalized.ok)return normalized;
 const projection=planningCopy(s);projection.tactical.plans={};projection.tactical.events=[];projection.rngState??=s.round*104729;
 // First discover costs along deterministic preparations and forms. No resource produced
 // by the projection finances the plan: payment is checked against the original pool.
 const costs=[],refs=orderedOwn(projection,normalized.actions);
 for(const ref of refs){
  if(ref.type==='skill'){
   refreshSkillForms(projection);const actor=actorFor(projection,side,ref.actorId),ability=actor?.abilities.find(a=>a.id===ref.abilityId);
   if(!actor||!ability||actor.cooldowns[ability.id]||skillSealReason(actor,ability))return fail('Técnica em recarga ou selada.');
   if((ability.formKey||'base')!==ref.formKey)return fail('A preparação necessária não está na fila.');
   const cost=s.tactical.compact?{}:getAbilityResourceCosts(actor,ability);costs.push({ref,cost});
   for(const id of resourceIds)projection[poolKey(side)][id]=10000;
  }
  const result=execute(projection,ref,{projection:true});
  if(ref.type==='skill'){ref.previewTargetIds=[...(result.targets||[])];ref.previewDisplacements=copy(result.displacements||[]);}
  if(result.skipped)return fail(result.reason||'Ação inválida na prévia.');
 }
 const sum=costs.reduce((out,{cost})=>{for(const [id,n]of Object.entries(cost))out[id]=(out[id]||0)+n;return out;},{});
 const payment=resolveResourcePayment(sum,s[poolKey(side)],selected);if(!payment.ok)return fail(payment.reason);
 const left={...payment.selected};
 for(const {ref,cost}of costs){ref.randomPayment={};let needed=cost.random||0;for(const id of resourceIds){const n=Math.min(needed,left[id]);if(n){ref.randomPayment[id]=n;left[id]-=n;needed-=n;}}}
 // Return a useful projection with real payments, not the exploratory resource budget.
 const paid=planningCopy(s);paid.tactical.plans={};paid.tactical.events=[];paid.rngState??=s.round*104729;
 for(const ref of refs)execute(paid,ref,{projection:true});
 return {ok:true,actions:refs,projection:paid,payment,remaining:Object.fromEntries(resourceIds.map(id=>[id,s[poolKey(side)][id]-(payment.costs[id]||0)]))};
}

export function submitTacticalPlan(s,side,actions,selected){
 if(s.tactical.activation||s.tactical.stage!=='planning'||!validSide(side)||s.tactical.plans[side])return fail('Este lado já confirmou ou a rodada terminou.');
 const result=previewTacticalPlan(s,side,actions,selected);if(!result.ok)return result;
 s.tactical.plans[side]=copy(result.actions);
 if(s.tactical.plans.player&&s.tactical.plans.enemy){s.tactical.stage='ready';s.phase='tactical-ready';}
 return {ok:true,ready:s.tactical.stage==='ready'};
}
export function chooseTacticalShadow(s,side,actorId,choice){
 if(!validSide(side)||s.tactical.stage!=='planning'||s.tactical.plans[side])return fail('A escolha está bloqueada.');
 const actor=actorFor(s,side,actorId);if(!actor?.shadowChoicePending||!['damage','response'].includes(choice))return fail('Resposta da Sombra indisponível.');
 actor.shadowChoicePending=false;if(choice==='damage')actor.shadowDamageBonus=5;else actor.shadowBroadCounter=true;
 return {ok:true};
}
export function exchangeTacticalEssence(s,side,target,selected){
 if(!validSide(side)||s.tactical.stage!=='planning'||s.tactical.plans[side])return fail('A reserva está bloqueada.');
 const result=resolveEssenceExchange(s[poolKey(side)],target,selected);if(result.ok)s[poolKey(side)]=result.pool;
 return result;
}
function boardOutcome(s){
 const a=s.allies.some(u=>u.hp>0),e=s.enemies.some(u=>u.hp>0);if(a&&e)return false;
 s.phase=a?'victory':e?'defeat':'draw';s.tactical.stage='finished';return true;
}
function replayState(s){return copy({allies:s.allies,enemies:s.enemies,resources:s.resources,enemyResources:s.enemyResources,round:s.round,surfaces:s.tactical.surfaces,weather:s.tactical.weather,fortress:s.tactical.fortress,width:s.tactical.width,height:s.tactical.height,obstacles:s.tactical.obstacles,activationSpent:s.tactical.activation?.spent,objectives:s.tactical.objectives?{player:s.tactical.objectives.player}:undefined,positions:s.tactical.positions,facings:s.tactical.facings,lastFortresses:s.tactical.lastFortresses,aimFacings:s.tactical.aimFacings,scene:s.tactical.scene,environment:s.tactical.environment,chests:s.tactical.chests,nextChest:s.tactical.nextChest||null});}
export function resolveTacticalRound(s){
 if(s.tactical.stage!=='ready')return fail('Ambos os lados precisam confirmar.');
 if(s.tactical.compact)return resolveCompactRound(s);
 s.tactical.stage='resolving';s.phase='tactical-resolving';s.tactical.events=[];
 const player=s.tactical.plans.player,enemy=s.tactical.plans.enemy,first=s.round%2?s.tactical.firstSide:(s.tactical.firstSide==='player'?'enemy':'player');
 const actions=orderTacticalActions(s,[...player,...enemy],first).map(ref=>({...ref,category:priority(s,ref)}));
 stamp(s,{type:'reveal',title:'Planos revelados',actions:copy(actions)});
 for(const ref of actions){
  const before=replayState(s),result=execute(s,ref);stamp(s,{...ref,...result,before,after:replayState(s),title:ref.type==='move'?'Movimento':result.title||'Técnica cancelada'});
  if(boardOutcome(s))break;
 }
 finishTacticalRound(s);
 pauseForTacticalRewards(s);
 return tacticalResolution(s);
}

// Reveal the entire round, then resolve both teams' first actions before seconds.
// Movement within each wave is evaluated against the same occupancy snapshot.
function resolveCompactRound(s){
 s.tactical.stage='resolving';s.phase='tactical-resolving';s.tactical.events=[];
 const actions=orderTacticalActions(s,[...s.tactical.plans.player,...s.tactical.plans.enemy]).map(ref=>({...ref,category:priority(s,ref)}));
 const before=replayState(s);
 stamp(s,{type:'reveal',title:'Planos revelados',actions:copy(actions),before,after:before});
 for(const slot of [0,1]){
  const wave=actions.filter(ref=>ref.slot===slot);
  const paths=wave.filter(ref=>ref.type==='move'&&actorFor(s,ref.side,ref.actorId)&&!actorFor(s,ref.side,ref.actorId).stunned);
  if(paths.length)resolveExchangeMovement(s,paths);
  const commands=wave.filter(ref=>ref.type!=='move').sort((a,b)=>a.category-b.category||a.turnRank-b.turnRank);
  for(const ref of commands){
   const before=replayState(s),result=execute(s,ref);
   stamp(s,{...ref,...result,before,after:replayState(s),title:result.title||'Técnica interrompida'});
   if(boardOutcome(s))break;
  }
  if(s.tactical.stage==='finished')break;
 }
 finishTacticalRound(s);pauseForTacticalRewards(s);
 return tacticalResolution(s);
}

/**
 * Optional staged resolver for a *revealed* compact round.
 * It resolves each real action only after a bounded rhythm response is received.
 * The planning actions are still sealed until BOTH teams submit; preview, RNG,
 * movement and the canonical resolveTacticalRound() remain backward compatible.
 */
export function startCompactRoundResolution(s){
 if(!s?.tactical?.compact||s.tactical.stage!=='ready')return fail('A rodada compacta precisa das duas ordens confirmadas.');
 s.tactical.stage='resolving';s.phase='tactical-resolving';s.tactical.events=[];
 const actions=orderTacticalActions(s,[...s.tactical.plans.player,...s.tactical.plans.enemy]).map(ref=>({...ref,category:priority(s,ref)}));
 const before=replayState(s);
 stamp(s,{type:'reveal',title:'Planos revelados',actions:copy(actions),before,after:before});
 let slot=0,prepared=false,commands=[],closed=false;
 const peek=()=>{
  if(closed||!prepared||!commands.length)return null;
  const ref=commands[0],actor=actorFor(s,ref.side,ref.actorId);
  const ability=ref.type==='skill'?actor?.abilities.find(a=>a.id===ref.abilityId):null;
  const origin=actor?s.tactical.positions[actor.id]:null;
  const anchor=ability&&origin&&actionSpec(s,actor,ability).range===0?origin:ref.anchor;
  const targets=ability&&anchor?tacticalTargets(s,actor,ability,anchor,ref.orientation):[];
  return {...ref,anchor,actor:actor||null,ability:ability||null,targets,
   comboEligible:tacticalComboEligible(actor,ability,targets)&&!actor.cooldowns?.[ability.id]&&!skillSealReason(actor,ability)&&!tacticalRequirementReason(s,actor,ability)};
 };
 const next=(responses={})=>{
  if(closed)return fail('A rodada já foi concluída.');
  const start=s.tactical.events.length;
  if(slot<2&&!prepared){
   const wave=actions.filter(ref=>ref.slot===slot);
   const paths=wave.filter(ref=>ref.type==='move'&&actorFor(s,ref.side,ref.actorId)&&!actorFor(s,ref.side,ref.actorId).stunned);
   if(paths.length)resolveExchangeMovement(s,paths);
   commands=wave.filter(ref=>ref.type!=='move').sort((a,b)=>a.category-b.category||a.turnRank-b.turnRank);
   prepared=true;
   // Return control to the UI BEFORE any skill resolves so the player can respond.
   return {ok:true,done:false,events:copy(s.tactical.events.slice(start))};
  }
  if(commands.length){
   const awaiting=peek(),ref=commands.shift();
   // Responses are revealed together. No guess or target damage is committed
   // until both intents are known, including the already sealed local AI choice.
   const duel=awaiting?.comboEligible
    ?tacticalDuelResolve(responses.attackChoice,responses.defenseChoice):null;
   const before=replayState(s),result=execute(s,duel?{...ref,clash:duel}:ref);
   const title=result.title||'Técnica interrompida';
   stamp(s,{...ref,...result,...(duel?{duel}:{}),before,after:replayState(s),
    title:duel&&!result.skipped?title+' · '+duel.label:title});
   if(boardOutcome(s)){slot=2;commands=[];}
   return {ok:true,done:false,events:copy(s.tactical.events.slice(start))};
  }
  if(slot<2){slot++;prepared=false;return {ok:true,done:false,events:[]};}
  finishTacticalRound(s);pauseForTacticalRewards(s);closed=true;
  return {ok:true,done:true,events:copy(s.tactical.events.slice(start)),finished:s.tactical.stage==='finished'};
 };
 return {ok:true,events:copy(s.tactical.events),peek,next};
}

const canLeave=(s,u)=>boardCells(s).some(to=>canStep(s,u.id,s.tactical.positions[u.id],to,{movement:true}));
export function tacticalActivationUnits(s,side){
 const activation=s.tactical.activation;
 return activation?livingTeam(s,side).filter(u=>!u.stunned&&!activation.spent.includes(u.id)&&(!s.tactical.fortress||canLeave(s,u))):[];
}
const sides=['player','enemy'];
const isTechnique=ref=>ref?.type==='skill'||ref?.type==='guard';
const isSprint=ref=>ref?.type==='move'&&ref.path?.length===2;
function resetTacticalActivation(s){
 s.tactical.activation={exchange:1,spent:[]};
}
export function previewTacticalActivation(s,side,actorId,actions,selected){
 if(!validSide(side)||!s.tactical.activation||s.tactical.stage!=='planning'||s.tactical.plans[side]||s.tactical.confirmed?.[side])return fail('Aguarde a próxima troca.');
 if(!tacticalActivationUnits(s,side).some(u=>u.id===actorId))return fail('Este personagem não pode agir agora.');
 if(s.tactical.fortress)return fortressPreview(s,side,actorId,actions);
 if(!Array.isArray(actions)||actions.length>2||actions.some(ref=>ref?.actorId!==actorId)||
    (actions.length===1&&actions[0].type!=='move'&&!isTechnique(actions[0]))||
    (actions.length===2&&(actions[0].type!=='move'||isSprint(actions[0])||!isTechnique(actions[1]))))return fail('Mova até uma casa e use uma técnica ou Guarda, ou mova duas casas sem outra ação.');
 return previewTacticalPlan(s,side,actions,selected);
}
export function submitTacticalActivation(s,side,actorId,actions,selected){
 const plan=previewTacticalActivation(s,side,actorId,actions,selected);
 if(!plan.ok)return plan;
 if(!s.tactical.fortress&&!isTechnique(plan.actions.at(-1))&&!isSprint(plan.actions[0]))return fail('Escolha uma técnica ou Guarda, ou percorra duas casas.');
 // Store only a sealed order. No position, status, Essência or RNG changes on the first confirmation.
 s.tactical.plans[side]=copy(plan.actions);
 if(sides.some(k=>!s.tactical.plans[k]&&tacticalActivationUnits(s,k).length))return {ok:true,waiting:true};
 return resolveTacticalExchange(s);
}
function resolveExchangeMovement(s,paths){
 const interrupted=new Set(),moved=new Set();
 for(let index=0;paths.some(ref=>ref.path.length>index&&!interrupted.has(ref.actorId));index++){
  const before=replayState(s);
  const steps=paths.filter(ref=>ref.path.length>index&&!interrupted.has(ref.actorId)).map(ref=>{
   const from={...s.tactical.positions[ref.actorId]},to=ref.path[index];
   return {actorId:ref.actorId,side:ref.side,from,to};
  });
  // Validate against the same board before moving either participant.
  const moving=steps.filter(step=>canStep(s,step.actorId,step.from,step.to,{movement:true})&&!steps.some(other=>other!==step&&sameCell(step.to,other.to)));
  const stopped=steps.filter(step=>!moving.includes(step));
  for(const step of stopped)interrupted.add(step.actorId);
  for(const step of moving){s.tactical.positions[step.actorId]={...step.to};faceMovement(s,step.actorId,step.from,step.to);moved.add(step.actorId);}
  for(const step of moving)if(index===0){
   const actor=actorFor(s,step.side,step.actorId);actor.actedThisTurn=true;
   step.augmentNotes=triggerTacticalAugments(s,step.side,actor,'move');
   step.windShield=grantCompactWindShield(s,actor);
   step.leapShield=grantCompactLeapShield(s,actor,step.from,step.to);
  }
  const chestsOpened=s.tactical.fortress?[]:moving.flatMap(step=>claimTacticalChests(s,step.side,[step.to]));
  if(s.tactical.fortress){
   for(const step of moving){if(!s.tactical.compact)claimFortressEntry(s,step);claimObjective(s,step.side,step.actorId,step.to);}
   refreshConquestObjectives(s);
  }
  for(const step of steps){
   const path=paths.find(ref=>ref.actorId===step.actorId);
   if(!s.tactical.fortress&&isSprint(path)&&(stopped.includes(step)||index===1))s.tactical.activation.spent.push(step.actorId);
  }
  stamp(s,{type:'exchange-move',title:chestsOpened.length?'Baú recolhido':stopped.length?'Passagem bloqueada':'Movimento',moves:moving,stopped,chestsOpened,before,after:replayState(s)});
 }
 return moved;
}
function resolveTacticalExchange(s){
 const activation=s.tactical.activation,plans=sides.map(side=>s.tactical.plans[side]).filter(Boolean);
 const paths=plans.filter(refs=>refs[0].type==='move').map(refs=>refs[0]);
 const first=activation.exchange%2?tacticalFirstSide(s):otherSide(tacticalFirstSide(s));
 const commands=plans.map(refs=>{
  const ref=refs.at(-1),origin=refs[0].path?.at(-1)||s.tactical.positions[ref.actorId];
  return {ref,origin,category:ref.type==='guard'?1:priority(s,ref)};
 }).sort((a,b)=>a.category-b.category||Number(b.ref.side===first)-Number(a.ref.side===first));
 s.tactical.plans={};s.tactical.events=[];
 const reveal=replayState(s);
 stamp(s,{type:'exchange-reveal',title:'Ordens reveladas',actors:commands.map(({ref,category})=>({id:ref.actorId,side:ref.side,category})),before:reveal,after:reveal});
 const moved=resolveExchangeMovement(s,paths);
 for(const {ref,origin,category} of commands){
  if(s.tactical.fortress){
   activation.spent.push(ref.actorId);
   s.tactical.fortress.equipped[ref.actorId]=ref.abilityId;
   if(!moved.has(ref.actorId))continue;
   const actor=actorFor(s,ref.side,ref.actorId),ability=actor?.abilities.find(a=>a.id===ref.abilityId);
   if(!ability||actor.cooldowns[ability.id])continue;
   const before=replayState(s),aim=fortressAim(s,actor,ability,s.tactical.aimFacings?.[actor.id]||unitFacing(s,actor));
   if(!aim)continue;
   const action={...ref,type:'skill',...aim,formKey:ability.formKey||'base',fortressCooldown:fortressCooldown(ability)};
   const result=execute(s,action);
   stamp(s,{...action,...result,category:1,before,after:replayState(s),title:result.title||'Técnica interrompida'});
   if(boardOutcome(s))break;
   continue;
  }
  if(ref.type==='move')continue;
  const before=replayState(s),at=s.tactical.positions[ref.actorId];
  const action=ref.type==='skill'?{...ref,anchor:{x:at.x+ref.anchor.x-origin.x,y:at.y+ref.anchor.y-origin.y}}:ref;
  activation.spent.push(ref.actorId);
  const result=execute(s,action);
  stamp(s,{...action,...result,category,before,after:replayState(s),title:result.title||'Técnica interrompida'});
 }
 if(s.tactical.fortress)registerFortressDeaths(s);
 applyRivalRewards(s,s.tactical.stage==='finished');
 if(!boardOutcome(s)){
  activation.exchange++;
  while(s.tactical.stage==='planning'&&!sides.some(side=>tacticalActivationUnits(s,side).length)){
   if(s.tactical.fortress&&!tacticalUnits(s).some(u=>u.hp>0&&canLeave(s,u))){s.phase='draw';s.tactical.stage='finished';break;}
   finishTacticalRound(s);
  }
  pauseForTacticalRewards(s);
 }
 return tacticalResolution(s);
}
function applyRivalRewards(s,finished=false){
 for(const offer of s.tactical.enemyChestRewards||[]){
  if(finished||!livingTeam(s,'enemy').length)break;
  if(offer.objective&&!actorFor(s,'enemy',offer.actorId))continue;
  const before=replayState(s),choice=offer.invasion?chooseFortressPenalty(s,'enemy',offer.options):null;
  const option=choice?.option||(offer.fortress?offer.options[0]:tacticalChestOptions(s,'enemy',offer.tier)[0]);
  if(offer.invasion)applyFortressPenalty(s,'enemy',option.effect,choice?.targetId,offer.round);
  else{applyChestEffect(s,'enemy',option.effect);if(offer.objective){const actor=actorFor(s,'enemy',offer.actorId);actor.objectiveAugments=(actor.objectiveAugments||0)+1;}}
  stamp(s,{type:'effects',rewardActorId:offer.fortress?offer.actorId:null,title:(offer.invasion?'Invasão rival · ':'Aprimoramento rival · ')+option.title,description:option.text,before,after:replayState(s)});
 }
 delete s.tactical.enemyChestRewards;
}
function pauseForTacticalRewards(s){
 for(const offer of s.tactical.pendingChestRewards)if(!offer.fortress&&!offer.invasion)offer.options=tacticalChestOptions(s,offer.side,offer.tier);
 if(s.tactical.pendingChestRewards.length&&s.tactical.stage==='planning'){s.tactical.stage='reward';s.phase='tactical-reward';}
}
function tacticalResolution(s){
 return {ok:true,events:copy(s.tactical.events),chestRewards:copy(s.tactical.pendingChestRewards),finished:s.tactical.stage==='finished'};
}
function finishTacticalRound(s){
 if(s.tactical.stage!=='finished'&&s.tactical.environment){
  const before=replayState(s),augmentNotes=resolveTacticalEnvironment(s);
  stamp(s,{type:'environment',title:s.tactical.environment.title,augmentNotes,cells:[{...s.tactical.environment.position}],before,after:replayState(s)});
  if(s.tactical.fortress)registerFortressDeaths(s);
  boardOutcome(s);
 }
 if(s.tactical.stage!=='finished'){
  const endingRound=s.round,before=replayState(s),augmentNotes=['player','enemy'].flatMap(side=>{const actor=livingTeam(s,side)[0];return actor?triggerTacticalAugments(s,side,actor,'round-end'):[];}),result=finishBoardRound(s);stamp(s,{augmentNotes,round:endingRound,type:'effects',title:s.tactical.fortress?'Efeitos e recargas':'Efeitos, recuperação e geração de Essência',before,after:replayState(s),reactions:result.reactions||[],recoveries:result.recoveries||[]});
  if(result.done)s.tactical.stage='finished';else {s.tactical.stage='planning';s.phase='tactical-planning';if(s.tactical.activation)resetTacticalActivation(s);if(s.tactical.fortress){
   if(!s.tactical.compact)closeFortressBoard(s,endingRound);
   pruneSurfaces(s);
   const beforeField=replayState(s),fieldEvent=applyFieldEvent(s);
   if(fieldEvent)stamp(s,{type:'field-event',...fieldEvent,before:beforeField,after:replayState(s)});
  }else if(chestSpawnRound(s))spawnTacticalChest(s);else announceTacticalChest(s);}
 }
 if(s.tactical.fortress){registerFortressDeaths(s);applyRivalRewards(s,s.tactical.stage==='finished');}
 s.tactical.plans={};s.queue=[];s.intents=[];s.resolution=[];s.resolutionSide=null;
}

export function fortressCooldown(ability){
 if(ability.id===fortressBasicAttack.id)return 0;
 ability=conquestTechnique(ability);
 return Math.max(1,Math.min(5,ability.cooldown||0),ability.invulnerable?4:ability.stun||ability.sealAttack||(ability.damage||0)>=30?3:(ability.damage||0)>=18||ability.heal||ability.shield?2:1);
}
export function fortressAim(s,actor,ability,facing){
 const origin=s.tactical.positions[actor.id],forward=actor.side==='player'?1:-1;
 const spec=actionSpec(s,actor,ability);
 const support=['self','ally','friendly','team'].includes(ability.target);
 const direction=support?unitFacing(s,actor):(facing||unitFacing(s,actor));
 const directional=!support&&['line','cone'].includes(spec.pattern);
 const anchors=spec.range===0||directional?[origin]:boardCells(s).filter(p=>distance(origin,p,s)<=spec.range);
 const units=new Map(tacticalUnits(s).map(unit=>[unit.id,unit]));
 let best=null;
 for(const anchor of anchors){
  const orientation=[...direction];
  if(!support&&!directional&&(anchor.x-origin.x)*direction[0]+(anchor.y-origin.y)*direction[1]<0)continue;
  const cells=tacticalArea(s,actor,ability,anchor,orientation);
  if(!cells.length)continue;
  const targets=tacticalTargets(s,actor,ability,anchor,orientation);
  const value=targets.reduce((score,id)=>{
   if(!support)return score+10;
   const unit=units.get(id);
   const missingHealth=ability.heal?Math.min(ability.heal,unit.maxHp-unit.hp):0;
   const missingShield=ability.shield?Math.min(ability.shield,Math.max(0,Math.round(unit.maxHp*.5)-unit.shield)):0;
   const cleanseValue=ability.cleanse&&(unit.stunned||unit.weakened||unit.exposed||unit.dots?.length)?12:0;
   return score+2+missingHealth+missingShield+cleanseValue;
  },0)+(anchor.x-origin.x)*forward*.18-distance(origin,anchor,s)*.03;
  if(!best||value>best.value)best={anchor:directional?(targets[0]?s.tactical.positions[targets[0]]:cells.at(-1)):anchor,orientation,cells,targets,value};
 }
 return best;
}
function fortressPreview(s,side,actorId,actions){
 const actor=actorFor(s,side,actorId),move=actions?.[0];
 const to=Array.isArray(move?.path)?move.path.at(-1):null;
 const path=to&&findPath(s,actorId,to);
 if(actions?.length!==1||move?.type!=='move'||move.actorId!==actorId||!path||
    path.length!==move.path.length||!path.every((point,index)=>sameCell(point,move.path[index])))return fail('Escolha uma casa válida para o movimento.');
 const abilityId=move.abilityId||s.tactical.fortress.equipped[actorId];
 const ability=actor.abilities.find(a=>a.id===abilityId);
 if(!ability)return fail('Técnica indisponível.');
 if(move.abilityId&&abilityId!==s.tactical.fortress.equipped[actorId]&&actor.cooldowns[abilityId])return fail('Técnica em recarga.');
 const projection=planningCopy(s);
 projection.tactical.positions[actorId]={...to};
 const ready=!actor.cooldowns[abilityId]&&!skillSealReason(actor,ability)&&!tacticalRequirementReason(projection,actor,ability);
 const from=move.path.at(-2)||s.tactical.positions[actorId],facing=faceMovement(projection,actorId,from,to);
 const aim=ready?fortressAim(projection,actor,ability,facing):null;
 return {ok:true,projection,ability,aim,actions:[{type:'move',side,actorId,abilityId,facing,path:move.path.map(p=>({x:p.x,y:p.y}))}]};
}
function claimFortressEntry(s,{actorId,side,to}){
 if(s.tactical.compact)return;
 const f=s.tactical.fortress,home=side==='player'?0:boardWidth(s)-1,enemy=boardWidth(s)-1-home;
 if(to.x===home&&f.entered.includes(actorId)&&!f.rearmed.includes(actorId))f.rearmed.push(actorId);
 if(to.x!==enemy||(f.entered.includes(actorId)&&!f.rearmed.includes(actorId)))return;
 if(!f.entered.includes(actorId))f.entered.push(actorId);
 f.rearmed=f.rearmed.filter(id=>id!==actorId);
 const offer={id:'invasion:'+f.rewardSequence++,side,actorId,round:s.round,invasion:true,source:'invasion',options:fortressPenaltyOptions()};
 if(side==='player')s.tactical.pendingChestRewards.push(offer);else(s.tactical.enemyChestRewards??=[]).push(offer);
}
function claimObjective(s,side,actorId,to){
 const offer=collectConquestObjective(s,side,actorId,to);if(!offer)return;
 offer.options=conquestOfferOptions(s,offer);
 if(side==='player')s.tactical.pendingChestRewards.push(offer);else(s.tactical.enemyChestRewards??=[]).push(offer);
}
function registerFortressDeaths(s){
 const f=s.tactical.fortress;
 for(const unit of tacticalUnits(s))if(unit.hp<=0&&!f.fallen.includes(unit.id))f.fallen.push(unit.id);
 s.tactical.pendingChestRewards=s.tactical.pendingChestRewards.filter(o=>!o.objective||actorFor(s,o.side,o.actorId));
 refreshConquestObjectives(s);
}
function closeFortressBoard(s,completed){
 const closure=fortressClosure(s,completed);
 if(!closure)return;
 const before=replayState(s),f=s.tactical.fortress,previous=boardCells(s);
 const tracks=closure.axis==='y'?f.closedRows:f.closedColumns;
 tracks.push(...closure.tracks);
 const moves=[];
 for(const unit of tacticalUnits(s)){
  const from=s.tactical.positions[unit.id];
  if(unit.hp<=0||onBoard(from,s))continue;
  const free=boardCells(s).filter(p=>p.x>0&&p.x<boardWidth(s)-1&&!occupied(s,p))
   .sort((a,b)=>distance(a,from)-distance(b,from)||Math.abs(a.x-from.x)+Math.abs(a.y-from.y)-Math.abs(b.x-from.x)-Math.abs(b.y-from.y)||a.y-b.y||a.x-b.x);
  const to=free.find(p=>!obstacle(s,p))||free[0];
  if(!to)throw Error('Não há uma casa livre para o fechamento.');
  if(obstacle(s,to))s.tactical.obstacles=s.tactical.obstacles.filter(p=>!sameCell(p,to));
  s.tactical.positions[unit.id]=to;moves.push({actorId:unit.id,side:unit.side,from,to});
 }
 refreshConquestObjectives(s);
 stamp(s,{type:'exchange-move',title:'O tabuleiro se fecha',closure:true,cells:previous.filter(p=>!onBoard(p,s)),moves,stopped:[],before,after:replayState(s)});
}
