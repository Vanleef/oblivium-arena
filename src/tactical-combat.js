import {characterById} from './data.js';
import {getResonance} from './rules.js';
import {createBattle,resolveBoardTechnique,finishBoardRound,getValidTargets} from './combat.js';
import {getAbilityResourceCosts,resolveResourcePayment,resourceIds,resolveEssenceExchange} from './resource-costs.js';
import {refreshSkillForms} from './skill-state.js';
import {skillSealReason} from './combat-effects.js';
import {tacticalRoster,tacticalSpec} from './tactical-kits.js';
import {onBoard,sameCell,distance,occupied,obstacle,canStep,lineOfSight,patternCells,directions,cellKey} from './tactical-board.js';

export const tacticalUnits=s=>[...s.allies,...s.enemies];
const team=(s,side)=>side==='player'?s.allies:s.enemies;
const poolKey=side=>side==='player'?'resources':'enemyResources';
const copy=value=>JSON.parse(JSON.stringify(value));
const fail=reason=>({ok:false,reason});
const validSide=side=>side==='player'||side==='enemy';
const actorFor=(s,side,id)=>team(s,side).find(u=>u.id===id&&u.hp>0);
const stamp=(s,event)=>{s.tactical.events.push({round:s.round,...event});};
const cleanPoint=p=>onBoard(p)?{x:p.x,y:p.y}:null;

export function createTacticalBattle(playerIds,enemyIds,config={}){
 for(const ids of [playerIds,enemyIds])if(!Array.isArray(ids)||ids.length!==3||new Set(ids).size!==3||ids.some(id=>!tacticalRoster.includes(id)))throw Error('Escolha três personagens distintos do elenco piloto em cada lado.');
 const enemyTeam=enemyIds.map((id,i)=>({...characterById[id],sourceId:id,id:`rival-${i}-${id}`}));
 const seed=Number.isSafeInteger(config.seed)?config.seed:1;
 const s=createBattle(playerIds,enemyTeam,{rngSeed:seed,enemyPlanner:()=>[],globalEffects:config.globalEffects||{},teamHealth:config.teamHealth});
 s.humanSides=true;s.enemyResonance=getResonance(enemyIds);
 s.tactical={version:1,size:5,positions:{},obstacles:[],plans:{},events:[],firstSide:(seed>>>0)%2?'player':'enemy',stage:'planning'};
 for(const [side,x]of [['player',0],['enemy',4]])team(s,side).forEach((u,i)=>{s.tactical.positions[u.id]={x,y:i+1};});
 const obstacles=config.obstacles||[];
 if(!Array.isArray(obstacles)||obstacles.some(p=>!onBoard(p)||occupied(s,p))||new Set(obstacles.map(cellKey)).size!==obstacles.length)throw Error('Obstáculos inválidos.');
 s.tactical.obstacles=obstacles.map(cleanPoint);s.phase='tactical-planning';s.queue=[];s.intents=[];
 return s;
}

// Safe input to AI / spectators / clients: no sealed plan, function or future random state.
export function tacticalView(s,side='player'){
 if(!validSide(side))throw Error('Lado inválido.');
 const v=copy(s);delete v.rngState;delete v.rng;delete v.enemyPlanner;v.queue=[];v.intents=[];v.resolution=[];
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
function orderedOwn(s,refs){return [...refs].sort((a,b)=>priority(s,a)-priority(s,b)||a.order-b.order);}

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
 let at=s.tactical.positions[actor.id],moved=0;
 for(const step of ref.path){if(!canStep(s,actor.id,at,step)){if(strict)return {skipped:true,reason:'Caminho bloqueado.'};break;}at={...step};s.tactical.positions[actor.id]=at;moved++;}
 actor.actedThisTurn=true;
 return {skipped:!moved,moved,to:{...at},reason:moved<ref.path.length?'Passagem ocupada; movimento interrompido.':''};
}
function execute(s,ref,{projection=false}={}){
 const actor=actorFor(s,ref.side,ref.actorId);if(!actor)return {skipped:true,reason:'Personagem fora de combate.'};
 if(ref.type==='move')return move(s,ref,projection);
 refreshSkillForms(s);const ability=actor.abilities.find(a=>a.id===ref.abilityId);
 if(!ability)return {skipped:true,reason:'Técnica indisponível.'};
 const spec=tacticalSpec(actor,ability),origin=s.tactical.positions[actor.id],anchor=spec.pattern==='self'?origin:ref.anchor;
 if(!onBoard(anchor)||distance(origin,anchor)>spec.range||!tacticalArea(s,actor,ability,anchor,ref.orientation).length)return {skipped:true,reason:'A região ficou fora de alcance ou da linha de visão.'};
 const ids=tacticalTargets(s,actor,ability,anchor,ref.orientation);
 return {...resolveBoardTechnique(s,{...ref,targetId:ids[0]||null},ids),targets:ids,cells:tacticalArea(s,actor,ability,anchor,ref.orientation)};
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
   const orientation=ref.orientation||[side==='player'?1:-1,0];
   if(!Array.isArray(orientation)||!directions.some(d=>d[0]===orientation[0]&&d[1]===orientation[1])||orientation.length!==2)return fail('Orientação inválida.');
   refs.push({type:'skill',actorId:actor.id,abilityId:ability.id,formKey,side,anchor,orientation:[...orientation],order});
  }else return fail('Tipo de ação inválido.');
 }
 return {ok:true,actions:refs};
}

export function previewTacticalPlan(s,side,actions,selected){
 if(s.tactical.stage!=='planning')return fail('A rodada já está em resolução.');
 const normalized=normalizePlan(s,side,actions);if(!normalized.ok)return normalized;
 const projection=copy(s);projection.tactical.plans={};projection.tactical.events=[];projection.rngState??=s.round*104729;
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
 const paid=copy(s);paid.tactical.plans={};paid.tactical.events=[];paid.rngState??=s.round*104729;
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
export function resolveTacticalRound(s){
 if(s.tactical.stage!=='ready')return fail('Ambos os lados precisam confirmar.');
 s.tactical.stage='resolving';s.phase='tactical-resolving';s.tactical.events=[];
 const player=s.tactical.plans.player,enemy=s.tactical.plans.enemy,first=s.round%2?s.tactical.firstSide:(s.tactical.firstSide==='player'?'enemy':'player');
 const rankSide={player:0,enemy:0},actions=[];
 for(const side of ['player','enemy'])for(const category of [0,1,2]){
  rankSide[side]=0;
  for(const ref of s.tactical.plans[side].filter(r=>priority(s,r)===category).sort((a,b)=>a.order-b.order))actions.push({...ref,category,rank:rankSide[side]++});
 }
 actions.sort((a,b)=>a.category-b.category||a.rank-b.rank||(a.side===first?-1:1));
 stamp(s,{type:'reveal',title:'Planos revelados',actions:copy(actions)});
 for(const ref of actions){
  const result=execute(s,ref);stamp(s,{...ref,...result,title:ref.type==='move'?'Movimento':result.title||'Técnica cancelada'});
  if(boardOutcome(s))break;
 }
 if(s.tactical.stage!=='finished'){
  const endingRound=s.round,result=finishBoardRound(s);stamp(s,{round:endingRound,type:'effects',title:'Encerramento da rodada',reactions:result.reactions||[],recoveries:result.recoveries||[]});
  if(result.done)s.tactical.stage='finished';else {s.tactical.stage='planning';s.phase='tactical-planning';}
 }
 s.tactical.plans={};s.queue=[];s.intents=[];s.resolution=[];s.resolutionSide=null;
 return {ok:true,events:copy(s.tactical.events),finished:s.tactical.stage==='finished'};
}
