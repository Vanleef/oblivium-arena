import {randomBytes,randomUUID,createHash} from 'node:crypto';
import {rankedResult} from './arena-service.js';
import {rankForRating,playerLevel} from '../src/player-level.js';
import {tacticalRoster,tacticalOpponentRoster} from '../src/tactical-kits.js';
import {createCompactPvpBattle,validateCompactPvpLoadouts,publicCompactPvpBattle,submitCompactPvpPlan,respondCompactPvp,chooseCompactPvpReward} from './compact-pvp.js';

const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const key=id=>'compact-profile:'+id;
const terminal=s=>['victory','defeat','draw'].includes(s.phase);
const validTeam=new Set(tacticalRoster.filter(id=>tacticalOpponentRoster.includes(id)));
const freshToken=()=>randomBytes(32).toString('hex');

function settleDraw(a,b){
 return [a,b].map(p=>({...p,xp:p.xp+40,streak:0}));
}
function duration(battle){return battle.tactical.pendingClash?25000:120000;}
function timeoutRound(match,now){
 const b=match.battle;
 if(b.tactical.pendingClash){
  const result=respondCompactPvp(b,b.tactical.pendingClash.defenderSide,'pass');
  if(!result.ok)throw Error(result.reason);
  match.deadline=now+duration(b);match.version++;return;
 }
 if(b.tactical.stage==='reward'){
  for(const offer of [...b.tactical.pendingChestRewards]){
   const chosen=offer.options.find(x=>x.effect?.type!=='tactical-card-upgrade');
   if(!chosen)throw Error('Aprimoramento automático indisponível.');
   const result=chooseCompactPvpReward(b,offer.side,offer.id,chosen.id);
   if(!result.ok)throw Error(result.reason);
  }
  match.deadline=now+duration(b);match.version++;return;
 }
 if(b.tactical.stage==='planning'){
  const own=Boolean(b.tactical.plans.player),rival=Boolean(b.tactical.plans.enemy);
  b.phase=own&&!rival?'victory':rival&&!own?'defeat':'draw';
 }else b.phase='draw';
 b.tactical.stage='finished';
 match.reason='Tempo esgotado';
 match.version++;
}
export class CompactArenaService {
 constructor(store,{now=Date.now}={}){this.store=store;this.now=now;}
 async request(token,input={},identity=null){
  const now=this.now(),sessionToken=/^[a-f0-9]{64}$/.test(token||'')?token:freshToken();
  const result=await this.store.transaction(async tx=>{
   const sessionKey='compact-session:'+createHash('sha256').update(sessionToken).digest('hex');
   let id,p;
   if(identity?.id){
    const accountKey='account-arena:'+identity.id;
    id=await tx.get(accountKey);
    if(!id){id=await tx.get(sessionKey)||randomUUID();await tx.set(accountKey,id);}
    p=await tx.get(key(id));
   }else{
    id=await tx.get(sessionKey);p=id?await tx.get(key(id)):null;
   }
   if(!p){id=id||randomUUID();p={id,name:'Alma '+id.slice(0,6),rating:1000,wins:0,losses:0,streak:0,xp:0,compactMatchId:null};await tx.set(key(id),p);}
   await tx.set(sessionKey,id);
   if(identity?.handle){p.name=identity.handle;await tx.set(key(id),p);}
   const rateKey='compact-rate:'+(identity?.id||id)+':'+Math.floor(now/10000);
   const count=(await tx.get(rateKey)||0)+1;
   if(count>25)fail('Aguarde alguns segundos.',429);
   await tx.set(rateKey,count,20);
   const op=input.op||'profile';
   let match=p.compactMatchId?await tx.get('compact-match:'+p.compactMatchId):null;
   if(p.compactMatchId&&!match){p.compactMatchId=null;await tx.set(key(id),p);}
   if(op==='ack'&&match?.settled){p.compactMatchId=null;await tx.set(key(id),p);match=null;}
   if(match&&!match.players.includes(id))fail('Partida indisponível.',403);
   if(match&&!match.settled&&match.deadline<=now)timeoutRound(match,now);
   if(op==='queue'&&!match){
    const team=input.team;
    if(!Array.isArray(team)||team.length!==3||new Set(team).size!==3||team.some(id=>!validTeam.has(id)))fail('Escolha três personagens táticos diferentes.');
    let decks;try{decks=validateCompactPvpLoadouts(team,input.decks||{});}catch(error){fail(error.message||'Baralhos inválidos.');}
    const waiting=await tx.get('compact-queue')||[];
    const previous=waiting.find(q=>q.id===id);
    const queue=waiting.filter(q=>now-q.touched<20000&&q.id!==id);
    const rivalIndex=queue.findIndex(q=>Math.abs(q.rating-p.rating)<=150+Math.floor((now-q.since)/1000)*5);
    if(rivalIndex>=0){
     const rival=queue.splice(rivalIndex,1)[0],other=await tx.get(key(rival.id));
     if(other&&!other.compactMatchId){
      const first=randomBytes(1)[0]%2===0;
      const players=first?[id,other.id]:[other.id,id];
      const teams=first?[team,rival.team]:[rival.team,team];
      const loadouts=first?[decks,rival.decks]:[rival.decks,decks];
      let battle;try{battle=createCompactPvpBattle(teams[0],teams[1],{
       seed:randomBytes(4).readUInt32LE(),decks:{player:loadouts[0],enemy:loadouts[1]}
      });}catch(error){fail(error.message||'Combinação de baralhos inválida.');}
      match={id:randomUUID(),mode:'compact',players,battle,version:1,deadline:now+120000,created:now,settled:false,reason:null};
      p.compactMatchId=match.id;other.compactMatchId=match.id;
      await tx.set(key(other.id),other);await tx.set(key(id),p);
      await tx.set('compact-match:'+match.id,match,86400);
     }
    }
    if(!match){
     if(queue.length>=100)fail('Fila cheia.',429);
     queue.push({id,team,decks,rating:p.rating,since:previous?.since||now,touched:now});
    }
    await tx.set('compact-queue',queue,600);
   }else if(op==='cancel'){
    await tx.set('compact-queue',(await tx.get('compact-queue')||[]).filter(q=>q.id!==id),600);
   }
   if(['turn','response','reward','surrender'].includes(op)){
    if(!match||match.settled)fail('Partida encerrada ou indisponível.',409);
    const side=match.players.indexOf(id)===0?'player':'enemy',b=match.battle;
    const independent=op==='turn'&&b.tactical.stage==='planning'&&!b.tactical.plans[side]&&input.round===b.round;
    if(op!=='surrender'&&!independent&&input.version!==match.version)fail('O combate foi atualizado. Reconectando.',409);
    if(op==='turn'){
     if(!Array.isArray(input.actions)||input.actions.length>6)fail('Fila inválida.',409);
     const outcome=submitCompactPvpPlan(b,side,input.round,input.actions);
     if(!outcome.ok)fail(outcome.reason,409);
    }
    if(op==='response'){
     const outcome=respondCompactPvp(b,side,input.sign||'pass',input.cardId||null);
     if(!outcome.ok)fail(outcome.reason,409);
    }
    if(op==='reward'){
     const outcome=chooseCompactPvpReward(b,side,input.offerId,input.optionId,input.cardId||null);
     if(!outcome.ok)fail(outcome.reason,409);
    }
    if(op==='surrender'){
     b.phase=side==='player'?'defeat':'victory';b.tactical.stage='finished';match.reason='Rendição';
    }
    match.version++;
    match.deadline=now+duration(b);
   }
   if(match){
    if(terminal(match.battle)&&!match.settled){
     const a=await tx.get(key(match.players[0])),b=await tx.get(key(match.players[1]));
     const winner=match.battle.phase==='victory'?0:match.battle.phase==='defeat'?1:null;
     const results=winner===null?settleDraw(a,b):rankedResult(a,b,winner);
     const leaderboard=await tx.get('compact-leaderboard')||[];
     for(const row of results){
      await tx.set(key(row.id),row);
      const old=leaderboard.findIndex(q=>q.id===row.id);
      if(old>=0)leaderboard.splice(old,1);
      leaderboard.push({id:row.id,name:row.name,rating:row.rating,wins:row.wins,losses:row.losses});
     }
     leaderboard.sort((a,b)=>b.rating-a.rating||a.id.localeCompare(b.id));
     await tx.set('compact-leaderboard',leaderboard.slice(0,100));
     match.settled=true;match.result=results.map(row=>({id:row.id,rating:row.rating}));
     p=results.find(row=>row.id===id);
    }
    await tx.set('compact-match:'+match.id,match,86400);
   }
   return {
    profile:{...p,rank:rankForRating(p.rating),level:playerLevel(p.xp)},
    leaderboard:(await tx.get('compact-leaderboard')||[]).slice(0,25),
    match:match?{id:match.id,mode:'compact',version:match.version,deadline:match.deadline,reason:match.reason,
     settled:match.settled,battle:publicCompactPvpBattle(match.battle,match.players.indexOf(id)===0?'player':'enemy')}:null
   };
  });
  return {token:sessionToken,...result};
 }
}
