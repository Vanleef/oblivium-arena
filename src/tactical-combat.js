import {tacticalChestOptions,addTacticalAugment,triggerTacticalAugments} from './tactical-chests.js';
import {orderTacticalActions} from './tactical-order.js';
import {characterById} from './data.js';
import {getResonance} from './rules.js';
import {createBattle,resolveBoardTechnique,finishBoardRound,getValidTargets} from './combat.js';
import {getAbilityResourceCosts,resolveResourcePayment,resourceIds,resolveEssenceExchange} from './resource-costs.js';
import {refreshSkillForms} from './skill-state.js';
import {skillSealReason} from './combat-effects.js';
import {tacticalRoster,tacticalSpec} from './tactical-kits.js';
import {onBoard,sameCell,distance,occupied,obstacle,canStep,lineOfSight,patternCells,directions,cellKey,boardCells,mirrorCell,mirrorDirection} from './tactical-board.js';

export const tacticalUnits=s=>[...s.allies,...s.enemies];
const team=(s,side)=>side==='player'?s.allies:s.enemies;
const poolKey=side=>side==='player'?'resources':'enemyResources';
const copy=value=>JSON.parse(JSON.stringify(value));
const planningCopy=s=>copy({...s,tactical:{...s.tactical,events:[]}});
const fail=reason=>({ok:false,reason});
const validSide=side=>side==='player'||side==='enemy';
const actorFor=(s,side,id)=>team(s,side).find(u=>u.id===id&&u.hp>0);
const stamp=(s,event)=>{s.tactical.events.push({round:s.round,...event});};
const cleanPoint=p=>onBoard(p)?{x:p.x,y:p.y}:null;
const chestTierNames=Object.freeze({silver:'Prateado',gold:'Dourado',prismatic:'Prismático'});
function livingTeam(s,side){return team(s,side).filter(u=>u.hp>0);}
function chestTier(s,side){const count=livingTeam(s,side).length;return count<=1?'prismatic':count===2?'gold':'silver';}
function rewardCell(s,unitId){
 const origin=s.tactical.positions[unitId]||{x:0,y:2};
 return boardCells().filter(p=>!occupied(s,p,unitId)&&!obstacle(s,p)&&!s.tactical.chests.some(chest=>sameCell(chest.position,p)))
  .sort((a,b)=>distance(a,origin)-distance(b,origin)||Math.abs(a.x-2)-Math.abs(b.x-2)||a.y-b.y||a.x-b.x)[0]||null;
}
function applyChestEffect(s,side,effect){
 const units=team(s,side),living=livingTeam(s,side),pool=s[poolKey(side)];
 const healUnit=(unit,fraction)=>{if(unit&&unit.hp>0)unit.hp=Math.min(unit.maxHp,unit.hp+Math.max(1,Math.round(unit.maxHp*fraction)));};
 const addShield=(unit,amount)=>{if(unit?.hp>0)unit.shield=Math.min(Math.round(unit.maxHp*.5),unit.shield+amount);};
 if(effect.type==='heal-lowest'){
  const target=[...living].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp||a.id.localeCompare(b.id))[0];healUnit(target,effect.fraction);
 }else if(effect.type==='shield-team')for(const unit of living)addShield(unit,effect.amount);
 else if(effect.type==='essence')pool[effect.resource||'essence']=(pool[effect.resource||'essence']||0)+effect.amount;
 else if(effect.type==='blood-essence'){const unit=[...living].sort((a,b)=>b.hp-a.hp||a.id.localeCompare(b.id))[0];if(unit&&unit.hp>12){unit.hp-=12;pool[effect.resource]=(pool[effect.resource]||0)+effect.amount;}}
 else if(effect.type==='augment')addTacticalAugment(s,side,effect.augment);
 else if(effect.type==='cleanse-team')for(const unit of living){unit.dots=[];unit.marks={};unit.reactives=(unit.reactives||[]).filter(r=>!r.harmful);for(const key of ['stunned','weakened','exposed','sealSupport','sealAttack','healingBlock'])unit[key]=0;}
 else if(effect.type==='boost-team')for(const unit of living){unit.boost=Math.max(unit.boost||0,effect.amount);unit.boostFresh=true;}
 else if(effect.type==='revive'){
  const downed=units.filter(unit=>unit.hp<=0).sort((a,b)=>a.id.localeCompare(b.id))[0];
  const point=downed&&rewardCell(s,downed.id);
  if(downed&&point){downed.hp=Math.max(1,Math.round(downed.maxHp*effect.fraction));downed.shield=0;downed.dots=[];downed.stunned=0;downed.weakened=0;s.tactical.positions[downed.id]=point;}
  else healUnit([...living].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0],effect.fraction);
 }else if(effect.type==='full-recover'){
  for(const unit of living){unit.hp=unit.maxHp;unit.dots=[];unit.stunned=0;unit.weakened=0;unit.exposed=0;}
 }else if(effect.type==='prismatic-surge'){
  pool.essence=(pool.essence||0)+6;
  for(const unit of living){addShield(unit,24);unit.boost=Math.max(unit.boost||0,20);unit.boostFresh=true;}
 }
}
function makeChestOffer(s,side,chest){
 const tier=chestTier(s,side);
 return {id:`${chest.id}:${side}`,chestId:chest.id,side,tier,tierName:chestTierNames[tier],round:s.round,options:tacticalChestOptions(s,side,tier)};
}
function announceTacticalChest(s){
 if(s.round%4!==3)return;
 const center={x:2,y:2};
 const point=boardCells().filter(p=>!obstacle(s,p)&&!s.tactical.chests.some(c=>sameCell(c.position,p)))
  .sort((a,b)=>distance(a,center)-distance(b,center)||a.y-b.y||a.x-b.x)[0];
 if(point)s.tactical.nextChest={position:{...point},round:s.round+1};
}
function spawnTacticalChest(s){
 const center={x:2,y:2},point=s.tactical.nextChest?.position||boardCells().filter(p=>!occupied(s,p)&&!obstacle(s,p)&&!s.tactical.chests.some(chest=>sameCell(chest.position,p)))
  .sort((a,b)=>distance(a,center)-distance(b,center)||a.y-b.y||a.x-b.x)[0];
 if(!point)return null;
 const before=replayState(s);
 const chest={id:`chest-${s.round}-${s.tactical.chestSequence++}`,position:point,spawnedRound:s.round};
 s.tactical.nextChest=null;s.tactical.chests.push(chest);stamp(s,{type:'chest-spawn',title:'Um baú apareceu na arena',chest:copy(chest),before,after:replayState(s)});
 return chest;
}
export function chooseTacticalChestReward(s,offerId,optionId){
 const offer=s.tactical.pendingChestRewards?.[0];
 if(!offer||offer.id!==offerId||offer.side!=='player')return fail('Escolha de baú indisponível.');
 const option=offer.options.find(item=>item.id===optionId);if(!option)return fail('Aprimoramento inválido.');
 applyChestEffect(s,'player',option.effect);
 s.tactical.pendingChestRewards.shift();
 for(const pending of s.tactical.pendingChestRewards)pending.options=tacticalChestOptions(s,pending.side,pending.tier);
 if(!s.tactical.pendingChestRewards.length&&s.tactical.stage==='reward'){s.tactical.stage='planning';s.phase='tactical-planning';}
 return {ok:true,offer:copy(offer),option:copy(option),next:copy(s.tactical.pendingChestRewards[0]||null)};
}

export function createTacticalBattle(playerIds,enemyIds,config={}){
 for(const ids of [playerIds,enemyIds])if(!Array.isArray(ids)||ids.length!==3||new Set(ids).size!==3||ids.some(id=>!tacticalRoster.includes(id)))throw Error('Escolha três personagens distintos do elenco piloto em cada lado.');
 const enemyTeam=enemyIds.map((id,i)=>({...characterById[id],sourceId:id,id:`rival-${i}-${id}`}));
 const seed=Number.isSafeInteger(config.seed)?config.seed:1;
 const s=createBattle(playerIds,enemyTeam,{rngSeed:seed,enemyPlanner:()=>[],buffs:config.buffs||[],memories:config.memories||[],globalEffects:config.globalEffects||{},teamHealth:config.teamHealth});
 s.humanSides=true;s.enemyResonance=getResonance(enemyIds);
 s.tactical={version:1,size:5,positions:{},obstacles:[],chests:[],chestSequence:0,pendingChestRewards:[],plans:{},events:[],firstSide:(seed>>>0)%2?'player':'enemy',stage:'planning'};
 team(s,'player').forEach((u,i)=>{s.tactical.positions[u.id]={x:i===1?1:0,y:i+1};});
 team(s,'enemy').forEach((u,i)=>{s.tactical.positions[u.id]=mirrorCell({x:i===1?1:0,y:i+1});});
 const obstacles=config.obstacles||[];
 if(!Array.isArray(obstacles)||obstacles.some(p=>!onBoard(p)||occupied(s,p))||new Set(obstacles.map(cellKey)).size!==obstacles.length)throw Error('Obstáculos inválidos.');
 s.tactical.obstacles=obstacles.map(cleanPoint);
 if(config.routeEnemyShield)for(const u of s.enemies)u.shield=Math.min(Math.floor(u.maxHp/2),(u.shield||0)+Math.max(0,Math.min(18,config.routeEnemyShield)));
 s.phase='tactical-planning';s.queue=[];s.intents=[];
 return s;
}

// Safe input to AI / spectators / clients: no sealed plan, function or future random state.
export function tacticalView(s,side='player'){
 if(!validSide(side))throw Error('Lado inválido.');
 const v=planningCopy(s);delete v.rngState;delete v.rng;delete v.enemyPlanner;v.queue=[];v.intents=[];v.resolution=[];
 const confirmed=Object.fromEntries(['player','enemy'].map(k=>[k,Boolean(s.tactical.plans[k])]));
 v.tactical.plans={};v.tactical.confirmed=confirmed;
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
function priority(s,ref){return ref.type==='move'?0:tacticalSpec(actorFor(s,ref.side,ref.actorId),definition(s,ref)).priority;}
function orderedOwn(s,refs){return orderTacticalActions(s,refs);}

export function tacticalArea(s,actor,ability,anchor,orientation){
 const spec=tacticalSpec(actor,ability),origin=s.tactical.positions[actor.id];
 if(!origin||!onBoard(anchor)||distance(origin,anchor)>spec.range)return [];
 if(spec.pattern==='line'&&!directions.some(d=>d[0]===orientation?.[0]&&d[1]===orientation?.[1]))return [];
 const cells=patternCells(spec.pattern,origin,anchor,orientation,spec.length);
 if(spec.vision&&!lineOfSight(s,origin,anchor))return [];
 return cells.filter(p=>!obstacle(s,p)&&(!spec.vision||lineOfSight(s,origin,p)));
}
export function tacticalTargets(s,actor,ability,anchor,orientation){
 const cells=tacticalArea(s,actor,ability,anchor,orientation),spec=tacticalSpec(actor,ability),origin=s.tactical.positions[actor.id];
 return getValidTargets(s,actor,ability).filter(u=>u.hp>0&&cells.some(p=>sameCell(p,s.tactical.positions[u.id])))
 .filter(u=>['self','ally','friendly','team'].includes(ability.target)||!u.invulnerable||ability.ignoreInvulnerability)
 .sort((a,b)=>distance(origin,s.tactical.positions[a.id])-distance(origin,s.tactical.positions[b.id])||a.id.localeCompare(b.id)).slice(0,spec.limit).map(u=>u.id);
}
function move(s,ref,strict=false){
 const actor=actorFor(s,ref.side,ref.actorId);if(!actor||actor.stunned)return {skipped:true,reason:actor?'Atordoado.':'Personagem fora de combate.'};
 let at=s.tactical.positions[actor.id],moved=0;const from={...at},steps=[];
 for(const step of ref.path){if(!canStep(s,actor.id,at,step)){if(strict)return {skipped:true,reason:'Caminho bloqueado.'};break;}const previous={...at};at={...step};s.tactical.positions[actor.id]=at;steps.push({from:previous,to:{...at}});moved++;}
 actor.actedThisTurn=true;
 const augmentNotes=moved?triggerTacticalAugments(s,ref.side,actor,'move'):[];
 return {skipped:!moved,moved,from,to:{...at},steps,augmentNotes,reason:moved<ref.path.length?'Passagem ocupada; movimento interrompido.':''};
}
function execute(s,ref,{projection=false}={}){
 const actor=actorFor(s,ref.side,ref.actorId);if(!actor)return {skipped:true,reason:'Personagem fora de combate.'};
 if(ref.type==='move')return move(s,ref,projection);
 refreshSkillForms(s);const ability=actor.abilities.find(a=>a.id===ref.abilityId);
 if(!ability)return {skipped:true,reason:'Técnica indisponível.'};
 const spec=tacticalSpec(actor,ability),origin=s.tactical.positions[actor.id],anchor=spec.pattern==='self'?origin:ref.anchor;
 if(!onBoard(anchor)||distance(origin,anchor)>spec.range||!tacticalArea(s,actor,ability,anchor,ref.orientation).length)return {skipped:true,reason:'A região ficou fora de alcance ou da linha de visão.'};
 const cells=tacticalArea(s,actor,ability,anchor,ref.orientation),ids=tacticalTargets(s,actor,ability,anchor,ref.orientation);
 const exposedBefore=ids.map(id=>tacticalUnits(s).find(u=>u.id===id)).filter(u=>u?.exposed).map(u=>({id:u.id,hp:u.hp,shield:u.shield||0}));
 const result=resolveBoardTechnique(s,{...ref,targetId:ids[0]||null},ids);
 const exposedHit=exposedBefore.some(old=>{const u=tacticalUnits(s).find(u=>u.id===old.id);return u&&(u.hp<old.hp||(u.shield||0)<old.shield);});
 const augmentNotes=!result.skipped?triggerTacticalAugments(s,ref.side,actor,'skill',{exposedHit}):[];
 const chestsOpened=[];
 if(!projection&&!result.skipped&&(ability.damage>0||ability.dot||ability.dots?.length)){
  const hits=s.tactical.chests.filter(chest=>cells.some(point=>sameCell(point,chest.position)));
  for(const chest of hits){
   s.tactical.chests=s.tactical.chests.filter(item=>item.id!==chest.id);
   const offer=makeChestOffer(s,ref.side,chest);
   if(ref.side==='enemy'){
    const option=offer.options[0];applyChestEffect(s,'enemy',option.effect);
    chestsOpened.push({chestId:chest.id,tier:offer.tier,tierName:offer.tierName,side:ref.side,reward:option.title});
   }else{
    s.tactical.pendingChestRewards.push(offer);
    chestsOpened.push({chestId:chest.id,tier:offer.tier,tierName:offer.tierName,side:ref.side,offerId:offer.id});
   }
  }
 }
 return {...result,targets:ids,cells,augmentNotes,...(chestsOpened.length?{chestsOpened,title:`${result.title||ability.name} · baú aberto`}:{})};
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
   if(!Array.isArray(ref.path)||ref.path.length<1||ref.path.length>2||ref.path.some(p=>!onBoard(p)))return fail('Movimento inválido.');
   refs.push({type:'move',actorId:actor.id,side,path:ref.path.map(cleanPoint),order});
  }else if(ref.type==='skill'){
   const ability=actor.abilities.find(a=>a.id===ref.abilityId);if(!ability)return fail('Técnica inválida.');
   const formKey=typeof ref.formKey==='string'?ref.formKey:(ability.formKey||'base');
   if(formKey!=='base'&&formKey!==(ability.formKey||'base')&&!ability._formRoot?.forms?.some(f=>f.formKey===formKey))return fail('Forma inválida.');
   const anchor=cleanPoint(ref.anchor||s.tactical.positions[actor.id]);if(!anchor)return fail('Região inválida.');
   const orientation=ref.orientation||(side==='player'?[1,0]:mirrorDirection([1,0]));
   if(!Array.isArray(orientation)||!directions.some(d=>d[0]===orientation[0]&&d[1]===orientation[1])||orientation.length!==2)return fail('Orientação inválida.');
   refs.push({type:'skill',actorId:actor.id,abilityId:ability.id,formKey,side,anchor,orientation:[...orientation],order});
  }else return fail('Tipo de ação inválido.');
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
   const cost=getAbilityResourceCosts(actor,ability);costs.push({ref,cost});
   for(const id of resourceIds)projection[poolKey(side)][id]=10000;
  }
  const result=execute(projection,ref,{projection:true});
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
 if(s.tactical.stage!=='planning'||!validSide(side)||s.tactical.plans[side])return fail('Este lado já confirmou ou a rodada terminou.');
 const result=previewTacticalPlan(s,side,actions,selected);if(!result.ok)return result;
 s.tactical.plans[side]=copy(result.actions);
 if(s.tactical.plans.player&&s.tactical.plans.enemy){s.tactical.stage='ready';s.phase='tactical-ready';}
 return {ok:true,ready:s.tactical.stage==='ready'};
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
function replayState(s){return copy({allies:s.allies,enemies:s.enemies,resources:s.resources,enemyResources:s.enemyResources,round:s.round,positions:s.tactical.positions,chests:s.tactical.chests,nextChest:s.tactical.nextChest||null});}
export function resolveTacticalRound(s){
 if(s.tactical.stage!=='ready')return fail('Ambos os lados precisam confirmar.');
 s.tactical.stage='resolving';s.phase='tactical-resolving';s.tactical.events=[];
 const player=s.tactical.plans.player,enemy=s.tactical.plans.enemy,first=s.round%2?s.tactical.firstSide:(s.tactical.firstSide==='player'?'enemy':'player');
 const actions=orderTacticalActions(s,[...player,...enemy],first).map(ref=>({...ref,category:priority(s,ref)}));
 stamp(s,{type:'reveal',title:'Planos revelados',actions:copy(actions)});
 for(const ref of actions){
  const before=replayState(s),result=execute(s,ref);stamp(s,{...ref,...result,before,after:replayState(s),title:ref.type==='move'?'Movimento':result.title||'Técnica cancelada'});
  if(boardOutcome(s))break;
 }
 if(s.tactical.stage!=='finished'){
  const endingRound=s.round,before=replayState(s),augmentNotes=['player','enemy'].flatMap(side=>{const actor=livingTeam(s,side)[0];return actor?triggerTacticalAugments(s,side,actor,'round-end'):[];}),result=finishBoardRound(s);stamp(s,{augmentNotes,round:endingRound,type:'effects',title:'Efeitos, recuperação e geração de Essência',before,after:replayState(s),reactions:result.reactions||[],recoveries:result.recoveries||[]});
  if(result.done)s.tactical.stage='finished';else {s.tactical.stage='planning';s.phase='tactical-planning';if(s.round%4===0)spawnTacticalChest(s);else announceTacticalChest(s);}
 }
 for(const offer of s.tactical.pendingChestRewards)offer.options=tacticalChestOptions(s,offer.side,offer.tier);
 if(s.tactical.pendingChestRewards.length&&s.tactical.stage==='planning'){s.tactical.stage='reward';s.phase='tactical-reward';}
 s.tactical.plans={};s.queue=[];s.intents=[];s.resolution=[];s.resolutionSide=null;
 return {ok:true,events:copy(s.tactical.events),chestRewards:copy(s.tactical.pendingChestRewards),finished:s.tactical.stage==='finished'};
}
