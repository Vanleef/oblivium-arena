import {tacticalRequirementReason} from './tactical-requirements.js';
import {createTacticalEnvironment,resolveTacticalEnvironment} from './tactical-environment.js';
import {tacticalChestOptions,addTacticalAugment,triggerTacticalAugments} from './tactical-chests.js';
import {orderTacticalActions,tacticalFirstSide} from './tactical-order.js';
import {characterById} from './data.js';
import {getResonance} from './rules.js';
import {createBattle,resolveBoardTechnique,finishBoardRound,getValidTargets} from './combat.js';
import {getAbilityResourceCosts,resolveResourcePayment,resourceIds,resolveEssenceExchange} from './resource-costs.js';
import {refreshSkillForms} from './skill-state.js';
import {skillSealReason} from './combat-effects.js';
import {tacticalRoster,tacticalOpponentRoster,tacticalSpec} from './tactical-kits.js';
import {onBoard,sameCell,distance,movementRange,occupied,obstacle,canStep,lineOfSight,patternCells,directions,cellKey,boardCells,boardWidth,mirrorCell,mirrorDirection} from './tactical-board.js';

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
const cleanPoint=p=>onBoard(p)?{x:p.x,y:p.y}:null;
const chestTierNames=Object.freeze({silver:'Prateado',gold:'Dourado',prismatic:'Prismático'});
function livingTeam(s,side){return team(s,side).filter(u=>u.hp>0);}
function chestTier(s,side){const count=livingTeam(s,side).length;return count<=1?'prismatic':count===2?'gold':'silver';}
function rewardCell(s,unitId){
 const origin=s.tactical.positions[unitId]||{x:0,y:2};
 return boardCells(s).filter(p=>!occupied(s,p,unitId)&&!obstacle(s,p)&&!s.tactical.chests.some(chest=>sameCell(chest.position,p)))
  .sort((a,b)=>distance(a,origin)-distance(b,origin)||Math.abs(a.x-2)-Math.abs(b.x-2)||a.y-b.y||a.x-b.x)[0]||null;
}
function applyChestEffect(s,side,effect){
 const units=team(s,side),living=livingTeam(s,side),pool=s[poolKey(side)];
 const healUnit=(unit,fraction)=>{if(unit&&unit.hp>0)unit.hp=Math.min(unit.maxHp,unit.hp+Math.max(1,Math.round(unit.maxHp*fraction)));};
 const addShield=(unit,amount)=>{if(unit?.hp>0)unit.shield=Math.min(Math.round(unit.maxHp*.5),unit.shield+amount);};
 if(effect.type==='fortress-heal')healUnit(units.find(u=>u.id===effect.actorId),.4);
 else if(effect.type==='fortress-leap')s.tactical.fortress.leaps.push(effect.actorId);
 else if(effect.type==='fortress-terrain'){
  const enemyEdge=side==='player'?boardWidth(s)-1:0;
  const point=boardCells(s).filter(p=>p.x>0&&p.x<boardWidth(s)-1&&!occupied(s,p)&&!obstacle(s,p)&&!sameCell(p,s.tactical.environment?.position)).sort((a,b)=>Math.abs(a.x-enemyEdge)-Math.abs(b.x-enemyEdge)||Math.abs(a.y-2)-Math.abs(b.y-2))[0];
  if(point)s.tactical.obstacles.push(point);
 }else if(effect.type==='fortress-breach'){
  const unit=units.find(u=>u.id===effect.actorId);
  const art=unit.abilities[0]?.art;
  unit.abilities.push({id:'fortress-breach',name:'Ruptura do Bastião',description:'Causa 24 de dano perfurante e aplica Exposto na área em cruz.',target:'all-enemies',damage:24,damageType:'piercing',expose:1,cooldown:2,formKey:'base',art});
 }else if(effect.type==='heal-lowest'){
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
export function chooseTacticalChestReward(s,offerId,optionId){
 const offer=s.tactical.pendingChestRewards?.[0];
 if(!offer||offer.id!==offerId||offer.side!=='player')return fail('Escolha de baú indisponível.');
 const option=offer.options.find(item=>item.id===optionId);if(!option)return fail('Aprimoramento inválido.');
 applyChestEffect(s,'player',option.effect);
 s.tactical.pendingChestRewards.shift();
 for(const pending of s.tactical.pendingChestRewards)if(!pending.fortress)pending.options=tacticalChestOptions(s,pending.side,pending.tier);
 if(!s.tactical.pendingChestRewards.length&&s.tactical.stage==='reward'){s.tactical.stage='planning';s.phase='tactical-planning';}
 return {ok:true,offer:copy(offer),option:copy(option),next:copy(s.tactical.pendingChestRewards[0]||null)};
}

export function createTacticalBattle(playerIds,enemyIds,config={}){
 for(const [side,ids]of [['player',playerIds],['enemy',enemyIds]])if(!Array.isArray(ids)||ids.length!==3||new Set(ids).size!==3||ids.some(id=>!(side==='player'?tacticalRoster:tacticalOpponentRoster).includes(id)))throw Error('Escolha três personagens distintos disponíveis para este lado. Lordes e NPCs não entram no trio livre.');
 const enemyTeam=enemyIds.map((id,i)=>({...characterById[id],sourceId:id,id:`rival-${i}-${id}`}));
 const seed=Number.isSafeInteger(config.seed)?config.seed:1;
 const s=createBattle(playerIds,enemyTeam,{rngSeed:seed,enemyPlanner:()=>[],buffs:config.buffs||[],memories:config.memories||[],globalEffects:config.globalEffects||{},teamHealth:config.teamHealth});
 s.humanSides=true;s.enemyResonance=getResonance(enemyIds);
 s.tactical={version:1,environment:createTacticalEnvironment(config.environment),size:5,positions:{},obstacles:[],chests:[],chestSequence:0,pendingChestRewards:[],plans:{},events:[],firstSide:(seed>>>0)%2?'player':'enemy',stage:'planning'};
 if(config.fortress){
  Object.assign(s.tactical,{width:9,height:6,fortress:{entered:[],leaps:[],equipped:{}}});
  for(const u of tacticalUnits(s)){u.hp=u.maxHp=100;s.tactical.fortress.equipped[u.id]=u.abilities[0].id;}
 }
 const start=i=>s.tactical.fortress?{x:0,y:i*2+1}:{x:i===1?1:0,y:i+1};
 team(s,'player').forEach((u,i)=>{s.tactical.positions[u.id]=start(i);});
 team(s,'enemy').forEach((u,i)=>{s.tactical.positions[u.id]=mirrorCell(start(i),s);});
 const obstacles=config.obstacles||[];
 if(!Array.isArray(obstacles)||obstacles.some(p=>!onBoard(p,s)||occupied(s,p))||new Set(obstacles.map(cellKey)).size!==obstacles.length)throw Error('Obstáculos inválidos.');
 s.tactical.obstacles=obstacles.map(cleanPoint);
 if(s.tactical.environment&&obstacles.some(p=>sameCell(p,s.tactical.environment.position)))throw Error('A casa ambiental não pode ser um obstáculo.');
 if(config.routeEnemyShield&&!config.fortress)for(const u of s.enemies)u.shield=Math.min(Math.floor(u.maxHp/2),(u.shield||0)+Math.max(0,Math.min(18,config.routeEnemyShield)));
 if(config.alternating||config.fortress){resetTacticalActivation(s);if(!config.fortress)announceTacticalChest(s);}
 s.phase='tactical-planning';s.queue=[];s.intents=[];
 return s;
}

// Safe input to AI / spectators / clients: no sealed plan, function or future random state.
export function tacticalView(s,side='player'){
 if(!validSide(side))throw Error('Lado inválido.');
 const v=planningCopy(s);delete v.rngState;delete v.rng;delete v.enemyPlanner;v.queue=[];v.intents=[];v.resolution=[];
 const confirmed=Object.fromEntries(['player','enemy'].map(k=>[k,Boolean(s.tactical.plans[k])]));
 v.tactical.plans={};delete v.tactical.enemyChestRewards;v.tactical.confirmed=confirmed;
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
 if(!origin||!onBoard(anchor,s)||distance(origin,anchor)>spec.range)return [];
 if(['line','cone'].includes(spec.pattern)&&!directions.some(d=>d[0]===orientation?.[0]&&d[1]===orientation?.[1]))return [];
 const cells=patternCells(spec.pattern,origin,anchor,orientation,spec.length,s);
 if(spec.vision&&!lineOfSight(s,origin,anchor))return [];
 return cells.filter(p=>!obstacle(s,p)&&(!spec.vision||lineOfSight(s,origin,p)));
}
export function tacticalTargets(s,actor,ability,anchor,orientation){
 const cells=tacticalArea(s,actor,ability,anchor,orientation),spec=tacticalSpec(actor,ability),origin=s.tactical.positions[actor.id];
 return getValidTargets(s,actor,ability).filter(u=>u.hp>0&&cells.some(p=>sameCell(p,s.tactical.positions[u.id])))
 .filter(u=>['self','ally','friendly','team'].includes(ability.target)||!u.invulnerable||ability.ignoreInvulnerability)
 .sort((a,b)=>distance(origin,s.tactical.positions[a.id])-distance(origin,s.tactical.positions[b.id])||a.id.localeCompare(b.id)).slice(0,s.tactical.fortress?undefined:spec.limit).map(u=>u.id);
}
function move(s,ref,strict=false){
 const actor=actorFor(s,ref.side,ref.actorId);if(!actor||actor.stunned)return {skipped:true,reason:actor?'Atordoado.':'Personagem fora de combate.'};
 let at=s.tactical.positions[actor.id],moved=0;const from={...at},steps=[];
 for(const step of ref.path){if(!canStep(s,actor.id,at,step)){if(strict)return {skipped:true,reason:'Caminho bloqueado.'};break;}const previous={...at};at={...step};s.tactical.positions[actor.id]=at;steps.push({from:previous,to:{...at}});moved++;}
 actor.actedThisTurn=true;
 const augmentNotes=moved?triggerTacticalAugments(s,ref.side,actor,'move'):[];
 return {skipped:!moved,moved,from,to:{...at},steps,augmentNotes,reason:moved<ref.path.length?'Passagem ocupada; movimento interrompido.':''};
}
function displaceTargets(s,actor,ids,displacement){
 if(!displacement)return [];
 const origin=s.tactical.positions[actor.id],moves=[];
 for(const id of ids){
  const target=tacticalUnits(s).find(u=>u.id===id);if(!target||target.hp<=0||actor.hp<=0)continue;
  const from={...s.tactical.positions[id]},sign=displacement.kind==='pull'?-1:1;
  const dx=Math.sign(from.x-origin.x)*sign,dy=Math.sign(from.y-origin.y)*sign,to={x:from.x+dx,y:from.y+dy};
  const moved=canStep(s,id,from,to);if(moved)s.tactical.positions[id]={...to};
  moves.push({actorId:id,name:target.name,kind:displacement.kind,from,to:moved?{...to}:from,moved});
 }
 return moves;
}
function execute(s,ref,{projection=false}={}){
 const actor=actorFor(s,ref.side,ref.actorId);if(!actor)return {skipped:true,reason:'Personagem fora de combate.'};
 if(s.tactical.activation&&actor.stunned)return {skipped:true,reason:'Atordoado.'};
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
 const spec=tacticalSpec(actor,ability),origin=s.tactical.positions[actor.id],anchor=spec.range===0?origin:ref.anchor;
 if(!onBoard(anchor,s)||distance(origin,anchor)>spec.range||!tacticalArea(s,actor,ability,anchor,ref.orientation).length)return {skipped:true,reason:'A região ficou fora de alcance ou da linha de visão.'};
 const cells=tacticalArea(s,actor,ability,anchor,ref.orientation),ids=tacticalTargets(s,actor,ability,anchor,ref.orientation);
 const exposedBefore=ids.map(id=>tacticalUnits(s).find(u=>u.id===id)).filter(u=>u?.exposed).map(u=>({id:u.id,hp:u.hp,shield:u.shield||0}));
 const result=resolveBoardTechnique(s,{...ref,targetId:ids[0]||null},ids);
 const displacements=!result.skipped?displaceTargets(s,actor,result.affectedTargetIds||[],spec.displacement):[];
 const exposedHit=exposedBefore.some(old=>{const u=tacticalUnits(s).find(u=>u.id===old.id);return u&&(u.hp<old.hp||(u.shield||0)<old.shield);});
 const augmentNotes=!result.skipped?triggerTacticalAugments(s,ref.side,actor,'skill',{exposedHit}):[];
 const chestsOpened=!s.tactical.fortress&&!projection&&!result.skipped&&(ability.damage>0||ability.dot||ability.dots?.length)
  ?claimTacticalChests(s,ref.side,cells):[];
 return {...result,targets:ids,cells,displacements,augmentNotes,...(chestsOpened.length?{chestsOpened,title:`${result.title||ability.name} · baú aberto`}:{})};
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
   if(!Array.isArray(ref.path)||ref.path.length<1||ref.path.length>movementRange(s,actor.id)||ref.path.some(p=>!onBoard(p)))return fail('Movimento inválido.');
   refs.push({type:'move',actorId:actor.id,side,path:ref.path.map(cleanPoint),order});
  }else if(ref.type==='skill'){
   const ability=actor.abilities.find(a=>a.id===ref.abilityId);if(!ability)return fail('Técnica inválida.');
   const formKey=typeof ref.formKey==='string'?ref.formKey:(ability.formKey||'base');
   if(formKey!=='base'&&formKey!==(ability.formKey||'base')&&!ability._formRoot?.forms?.some(f=>f.formKey===formKey))return fail('Forma inválida.');
   const anchor=cleanPoint(ref.anchor||s.tactical.positions[actor.id]);if(!anchor)return fail('Região inválida.');
   const orientation=ref.orientation||(side==='player'?[1,0]:mirrorDirection([1,0]));
   if(!Array.isArray(orientation)||!directions.some(d=>d[0]===orientation[0]&&d[1]===orientation[1])||orientation.length!==2)return fail('Orientação inválida.');
   const spends={};for(const [key,max]of [['residueSpend',ability.spendResidueMax||0],['fractureSpend',ability.spendFracturesMax||0]]){const n=ref[key]??0;if(!Number.isInteger(n)||n<0||n>max)return fail('Gasto especial inválido.');if(n)spends[key]=n;}
   refs.push({...spends,type:'skill',actorId:actor.id,abilityId:ability.id,formKey,side,anchor,orientation:[...orientation],order});
  }else if(ref.type==='guard'&&s.tactical.activation){refs.push({type:'guard',actorId:actor.id,side,order});}
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
   const cost=getAbilityResourceCosts(actor,ability);costs.push({ref,cost});
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
function replayState(s){return copy({allies:s.allies,enemies:s.enemies,resources:s.resources,enemyResources:s.enemyResources,round:s.round,width:s.tactical.width,height:s.tactical.height,obstacles:s.tactical.obstacles,activationSpent:s.tactical.activation?.spent,positions:s.tactical.positions,environment:s.tactical.environment,chests:s.tactical.chests,nextChest:s.tactical.nextChest||null});}
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
 finishTacticalRound(s);
 pauseForTacticalRewards(s);
 return tacticalResolution(s);
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
  for(const step of moving){s.tactical.positions[step.actorId]={...step.to};moved.add(step.actorId);}
  for(const step of moving)if(index===0){
   const actor=actorFor(s,step.side,step.actorId);actor.actedThisTurn=true;
   step.augmentNotes=triggerTacticalAugments(s,step.side,actor,'move');
  }
  const chestsOpened=s.tactical.fortress?[]:moving.flatMap(step=>claimTacticalChests(s,step.side,[step.to]));
  if(s.tactical.fortress)for(const step of moving)claimFortressEntry(s,step);
  for(const step of steps){
   const path=paths.find(ref=>ref.actorId===step.actorId);
   if(isSprint(path)&&(stopped.includes(step)||index===1))s.tactical.activation.spent.push(step.actorId);
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
 const conquered=s.tactical.fortress&&fortressOutcome(s);
 for(const {ref,origin,category} of commands){
  if(s.tactical.fortress){
   activation.spent.push(ref.actorId);
   s.tactical.fortress.equipped[ref.actorId]=ref.abilityId;
   if(conquered||!moved.has(ref.actorId))continue;
   const actor=actorFor(s,ref.side,ref.actorId),ability=actor?.abilities.find(a=>a.id===ref.abilityId);
   if(!ability||actor.cooldowns[ability.id])continue;
   const before=replayState(s),aim=fortressAim(s,actor,ability);
   if(!aim)continue;
   const action={...ref,type:'skill',...aim,formKey:ability.formKey||'base',fortressCooldown:fortressCooldown(ability)};
   const result=execute(s,action);
   stamp(s,{...action,...result,category:1,before,after:replayState(s),title:result.title||'Técnica interrompida'});
   continue;
  }
  if(ref.type==='move')continue;
  const before=replayState(s),at=s.tactical.positions[ref.actorId];
  const action=ref.type==='skill'?{...ref,anchor:{x:at.x+ref.anchor.x-origin.x,y:at.y+ref.anchor.y-origin.y}}:ref;
  activation.spent.push(ref.actorId);
  const result=execute(s,action);
  stamp(s,{...action,...result,category,before,after:replayState(s),title:result.title||'Técnica interrompida'});
 }
 for(const offer of s.tactical.enemyChestRewards||[]){
  if(conquered)break;
  const before=replayState(s),option=offer.fortress?offer.options[0]:tacticalChestOptions(s,'enemy',offer.tier)[0];
  applyChestEffect(s,'enemy',option.effect);
  stamp(s,{type:'effects',title:'Aprimoramento rival · '+option.title,before,after:replayState(s)});
 }
 delete s.tactical.enemyChestRewards;
 if(!conquered&&!boardOutcome(s)){
  activation.exchange++;
  while(s.tactical.stage==='planning'&&!sides.some(side=>tacticalActivationUnits(s,side).length)){
   if(s.tactical.fortress&&!tacticalUnits(s).some(u=>u.hp>0&&canLeave(s,u))){s.phase='draw';s.tactical.stage='finished';break;}
   finishTacticalRound(s);
  }
  pauseForTacticalRewards(s);
 }
 return tacticalResolution(s);
}
function pauseForTacticalRewards(s){
 for(const offer of s.tactical.pendingChestRewards)if(!offer.fortress)offer.options=tacticalChestOptions(s,offer.side,offer.tier);
 if(s.tactical.pendingChestRewards.length&&s.tactical.stage==='planning'){s.tactical.stage='reward';s.phase='tactical-reward';}
}
function tacticalResolution(s){
 return {ok:true,events:copy(s.tactical.events),chestRewards:copy(s.tactical.pendingChestRewards),finished:s.tactical.stage==='finished'};
}
function finishTacticalRound(s){
 if(s.tactical.stage!=='finished'&&s.tactical.environment){
  const before=replayState(s),augmentNotes=resolveTacticalEnvironment(s);
  stamp(s,{type:'environment',title:s.tactical.environment.title,augmentNotes,cells:[{...s.tactical.environment.position}],before,after:replayState(s)});
  boardOutcome(s);
 }
 if(s.tactical.stage!=='finished'){
  const endingRound=s.round,before=replayState(s),augmentNotes=['player','enemy'].flatMap(side=>{const actor=livingTeam(s,side)[0];return actor?triggerTacticalAugments(s,side,actor,'round-end'):[];}),result=finishBoardRound(s);stamp(s,{augmentNotes,round:endingRound,type:'effects',title:s.tactical.fortress?'Efeitos e recargas':'Efeitos, recuperação e geração de Essência',before,after:replayState(s),reactions:result.reactions||[],recoveries:result.recoveries||[]});
  if(result.done)s.tactical.stage='finished';else {s.tactical.stage='planning';s.phase='tactical-planning';if(s.tactical.activation)resetTacticalActivation(s);if(!s.tactical.fortress){if(chestSpawnRound(s))spawnTacticalChest(s);else announceTacticalChest(s);}}
 }
 s.tactical.plans={};s.queue=[];s.intents=[];s.resolution=[];s.resolutionSide=null;
}

export function fortressCooldown(ability){
 return Math.max(1,ability.cooldown||0,ability.invulnerable?4:ability.stun||ability.sealAttack||(ability.damage||0)>=30?3:(ability.damage||0)>=18||ability.heal||ability.shield?2:1);
}
export function fortressAim(s,actor,ability){
 const origin=s.tactical.positions[actor.id],forward=actor.side==='player'?1:-1;
 const spec=tacticalSpec(actor,ability);
 const anchors=spec.range===0?[origin]:boardCells(s).filter(p=>distance(origin,p)<=spec.range);
 let best=null;
 for(const anchor of anchors){
  const dx=Math.sign(anchor.x-origin.x),dy=Math.sign(anchor.y-origin.y);
  const orientation=[dx||(!dy?forward:0),dy];
  const cells=tacticalArea(s,actor,ability,anchor,orientation);
  if(!cells.length)continue;
  const targets=tacticalTargets(s,actor,ability,anchor,orientation);
  const value=targets.length*10+(anchor.x-origin.x)*forward*.18-distance(origin,anchor)*.03;
  if(!best||value>best.value)best={anchor,orientation,cells,targets,value};
 }
 return best;
}
function fortressPreview(s,side,actorId,actions){
 const actor=actorFor(s,side,actorId),move=actions?.[0];
 if(actions?.length!==1||move?.type!=='move'||move.actorId!==actorId||!Array.isArray(move.path)||move.path.length!==1||
    !canStep(s,actorId,s.tactical.positions[actorId],move.path[0],{movement:true}))return fail('Escolha uma casa válida para o movimento.');
 const abilityId=move.abilityId||s.tactical.fortress.equipped[actorId];
 const ability=actor.abilities.find(a=>a.id===abilityId);
 if(!ability)return fail('Técnica indisponível.');
 if(move.abilityId&&abilityId!==s.tactical.fortress.equipped[actorId]&&actor.cooldowns[abilityId])return fail('Técnica em recarga.');
 const projection=planningCopy(s);
 projection.tactical.positions[actorId]={...move.path[0]};
 const aim=!actor.cooldowns[abilityId]&&!skillSealReason(actor,ability)&&!tacticalRequirementReason(projection,actor,ability)&&fortressAim(projection,actor,ability);
 return {ok:true,projection,ability,aim,actions:[{type:'move',side,actorId,abilityId,path:move.path.map(p=>({x:p.x,y:p.y}))}]};
}
function claimFortressEntry(s,{actorId,side,to}){
 const fortress=s.tactical.fortress,edge=side==='player'?boardWidth(s)-1:0;
 if(to.x!==edge||fortress.entered.includes(actorId))return;
 fortress.entered.push(actorId);
 const options=[
  {id:'recover',title:'Fôlego do Invasor',category:'Individual',text:'Recupere até 40 de Vida.',effect:{type:'fortress-heal',actorId}},
  {id:'rampart',title:'Muralha de Cinzas',category:'Campo',text:'Ergue um obstáculo em uma casa livre perto da fortaleza invadida.',effect:{type:'fortress-terrain'}},
  {id:'rally',title:'Bastião Partilhado',category:'Coletivo',text:'Concede 14 de Escudo a cada aliado vivo.',effect:{type:'shield-team',amount:14}},
  {id:'leap',title:'Salto do Cavalo',category:'Movimento',text:'Pode saltar em L, como um cavalo do xadrez. Conta como a única ação da ativação.',effect:{type:'fortress-leap',actorId}},
  {id:'breach',title:'Ruptura do Bastião',category:'Técnica',text:'Libera um ataque em cruz que causa dano perfurante e aplica Exposto.',effect:{type:'fortress-breach',actorId}}
 ];
 const offset=(fortress.entered.length-1)%options.length;
 const offer={id:'fortress:'+actorId,side,fortress:true,tierName:'Fortaleza',options:[options[offset],options[(offset+2)%5],options[(offset+3)%5]]};
 if(side==='player')s.tactical.pendingChestRewards.push(offer);
 else (s.tactical.enemyChestRewards??=[]).push(offer);
}
function fortressOutcome(s){
 const entered=side=>team(s,side).every(u=>u.hp>0&&s.tactical.positions[u.id].x===(side==='player'?boardWidth(s)-1:0));
 const player=entered('player'),enemy=entered('enemy');
 if(!player&&!enemy)return false;
 s.phase=player&&enemy?'draw':player?'victory':'defeat';
 s.tactical.stage='finished';
 return true;
}
