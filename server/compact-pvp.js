// Authoritative, restart-safe adapter for the 6x6 compact battle.
// This module intentionally does not replace the historical ranked 3v3 API.
import {createTacticalBattle,submitTacticalPlan,startCompactRoundResolution,resumeCompactRoundResolution,tacticalView,chooseTacticalChestReward} from '../src/tactical-combat.js';
import {tacticalDuelOptions} from '../src/tactical-duel.js';
import {characterById} from '../src/data.js';
import {validateTacticalBuild} from '../src/tactical-decks.js';

const other=side=>side==='player'?'enemy':'player';
const signs=new Set(tacticalDuelOptions.map(option=>option.id));
const fail=reason=>({ok:false,reason});
const terminal=s=>['victory','defeat','draw'].includes(s.phase);
const clone=value=>JSON.parse(JSON.stringify(value));
const validSide=side=>side==='player'||side==='enemy';

// Never trust client-provided upgrades or campaign unlock counts.
// Ranked matches begin from clean legal decks; earned inscriptions are battle-local.
function cleanBuilds(builds){
 if(!builds)return {};
 if(typeof builds!=='object'||Array.isArray(builds))throw Error('Baralhos inválidos.');
 return Object.fromEntries(Object.entries(builds).map(([id,cards])=>{
  if(!Array.isArray(cards))throw Error('Baralho inválido.');
  return [id,cards.map(card=>{
   if(!card||typeof card!=='object'||Array.isArray(card))throw Error('Carta inválida.');
   return {kind:card.kind,...(card.abilityId?{abilityId:card.abilityId}:{}),...(card.variantId?{variantId:card.variantId}:{})};
  })];
 }));
}
export function validateCompactPvpLoadouts(team,raw){
 const builds=cleanBuilds(raw);
 if(!Array.isArray(team)||Object.keys(builds).some(id=>!team.includes(id)))throw Error('Baralho pertence a outro personagem.');
 for(const [id,cards] of Object.entries(builds))validateTacticalBuild(characterById[id],cards,0);
 return builds;
}
export function createCompactPvpBattle(firstIds,secondIds,{seed=1,decks={}}={}){
 const battle=createTacticalBattle(firstIds,secondIds,{
  compact:true,fortress:true,cardMode:true,seed,
  decks:{player:validateCompactPvpLoadouts(firstIds,decks.player),enemy:validateCompactPvpLoadouts(secondIds,decks.enemy)}
 });
 battle.tactical.pvpMode=true;
 battle.tactical.pvpProtocol=1;
 delete battle.enemyPlanner;
 delete battle.rng;
 return battle;
}
export function publicCompactPvpBattle(s,side){
 if(!validSide(side))throw Error('Lado inválido.');
 const v=tacticalView(s,side);
 v.tactical.events=clone(s.tactical.events||[]);
 // Project only public information, never the queued signs, cursor or other
 // team's hidden objective. "reveal" events may include both action lists.
 delete v.tactical.authoritativeResolution;
 delete v.tactical.pendingClash;
 for(const event of v.tactical.events||[]){
  delete event.willSign;
  delete event.cardId;
  delete event.randomPayment;
  if(Array.isArray(event.actions))for(const action of event.actions){
   delete action.willSign;
   delete action.cardId;
   delete action.randomPayment;
  }
  if(event.before)delete event.before.objectives;
  if(event.after)delete event.after.objectives;
 }
 const clash=s.tactical.pendingClash;
 v.tactical.online=true;
 v.tactical.clash=clash?{
  defender:clash.defenderSide===side,actorId:clash.actorId,
  abilityId:clash.abilityId,targetId:clash.targetId
 }:null;
 if(side==='enemy'&&v.phase==='victory')v.phase='defeat';
 else if(side==='enemy'&&v.phase==='defeat')v.phase='victory';
 if(clash)v.phase=clash.defenderSide===side?'tactical-clash':'waiting';
 else if(s.tactical.stage==='planning'&&s.tactical.plans?.[side])v.phase='waiting';
 else if(s.tactical.stage==='resolving'||s.tactical.stage==='ready')v.phase='waiting';
 else if(s.tactical.stage==='reward'&&!v.tactical.pendingChestRewards.length)v.phase='waiting';
 return v;
}
export function advanceCompactPvp(s){
 if(!s?.tactical?.pvpMode)return fail('Modo PvP compacto indisponível.');
 if(s.tactical.pendingClash)return {ok:true,clash:true};
 if(s.tactical.stage!=='resolving')return {ok:true,finished:terminal(s)};
 const session=resumeCompactRoundResolution(s);
 if(!session.ok)return session;
 for(let steps=0;steps<36;steps++){
  const pending=session.peek();
  if(pending?.comboEligible){
   s.tactical.pendingClash={
    round:s.round,defenderSide:other(pending.side),
    actorId:pending.actorId,abilityId:pending.abilityId,
    targetId:pending.targets[0],willSign:pending.willSign||'miragem'
   };
   return {ok:true,clash:true};
  }
  const step=session.next({});
  if(!step.ok)return step;
  if(step.done){
   delete s.tactical.authoritativeResolution;
   return {ok:true,finished:terminal(s),round:s.round,reward:s.tactical.stage==='reward'};
  }
 }
 return fail('Limite de resolução excedido.');
}
export function submitCompactPvpPlan(s,side,round,actions){
 if(!s?.tactical?.pvpMode||!validSide(side)||s.tactical.stage!=='planning')return fail('Planejamento indisponível.');
 if(!Number.isInteger(round)||round!==s.round)return fail('Rodada desatualizada.');
 const result=submitTacticalPlan(s,side,actions);
 if(!result.ok)return result;
 if(!result.ready)return {ok:true,ready:false,round:s.round};
 const started=startCompactRoundResolution(s,{persist:true});
 if(!started.ok)return started;
 return advanceCompactPvp(s);
}
export function respondCompactPvp(s,side,sign='pass',reactionCardId=null){
 const pending=s?.tactical?.pendingClash;
 if(!pending||!validSide(side)||pending.defenderSide!==side||s.tactical.stage!=='resolving')return fail('Resposta indisponível.');
 if(sign!=='pass'&&!signs.has(sign))return fail('Manifestação inválida.');
 if(sign==='pass'&&reactionCardId)return fail('Não é possível gastar carta sem responder.');
 if(reactionCardId!==null&&(typeof reactionCardId!=='string'||reactionCardId.length>120))return fail('Carta reativa inválida.');
 const session=resumeCompactRoundResolution(s);
 if(!session.ok)return session;
 const response=sign==='pass'?{decline:true}:{
  attackChoice:pending.willSign,defenseChoice:sign,
  ...(reactionCardId?{reactionCardId}:{})
 };
 const step=session.next(response);
 if(!step.ok)return step;
 delete s.tactical.pendingClash;
 return advanceCompactPvp(s);
}
export function chooseCompactPvpReward(s,side,offerId,optionId,cardId=null){
 if(!s?.tactical?.pvpMode||!validSide(side)||s.tactical.stage!=='reward')return fail('Aprimoramento indisponível.');
 return chooseTacticalChestReward(s,offerId,optionId,cardId,side);
}
