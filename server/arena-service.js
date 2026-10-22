import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { characterById } from '../src/data.js';
import { createDuel, submitDuelTurn, continueDuel } from '../src/combat.js';
import { beginInfluences, chooseInfluence } from '../src/world-influences.js';
import { rankForRating, playerLevel } from '../src/player-level.js';
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const hash=value=>createHash('sha256').update(value).digest('hex');
const profileKey=id=>`profile:${id}`;
const terminal=s=>['victory','defeat'].includes(s.phase);
export function attachRandom(s){s.rng=()=>{s.randomState=(Math.imul(s.randomState,1664525)+1013904223)>>>0;return s.randomState/4294967296;};s.enemyPlanner=()=>[];}
export function rankedResult(a,b,winner){
 const expected=1/(1+10**((b.rating-a.rating)/400));const delta=Math.max(8,Math.round(28*((winner===0?1:0)-expected))*(winner===0?1:-1));
 return [a,b].map((p,i)=>({...p,rating:Math.max(0,p.rating+(i===winner?delta:-delta)),wins:p.wins+(i===winner?1:0),losses:p.losses+(i!==winner?1:0),streak:i===winner?p.streak+1:0,xp:p.xp+(i===winner?70:30),matchId:p.matchId}));
}
export function publicBattle(match,index){
 const s=JSON.parse(JSON.stringify(match.battle));delete s.randomState;delete s.worldSeed;delete s.influenceQueue;delete s.influenceResume;delete s.resolution;delete s.eventDeaths;s.queue=[];s.intents=[];
 const side=index===0?'player':'enemy';
 if(index===1){[s.allies,s.enemies]=[s.enemies,s.allies];[s.resources,s.enemyResources]=[s.enemyResources,s.resources];s.resonance=s.enemyResonance;[s.energyDraws.player,s.energyDraws.enemy]=[s.energyDraws.enemy,s.energyDraws.player];if(s.phase==='victory')s.phase='defeat';else if(s.phase==='defeat')s.phase='victory';}
 for(const u of s.allies)u.side='player';for(const u of s.enemies)u.side='enemy';
 if(s.phase==='influence'){if(s.influenceDraft.side!==side){s.phase='waiting';s.influenceDraft=null;}else s.influenceDraft.side='player';}
 else if(s.phase==='player'&&match.battle.turnSide!==side)s.phase='waiting';
 s.worldEvents=(s.worldEvents||[]).map(e=>({...e,side:index===1?(e.side==='player'?'enemy':'player'):e.side}));s.online=true;return s;
}
export class ArenaService{
 constructor(store,{now=Date.now}={}){this.store=store;this.now=now;}
 async request(token,input={}){
  const now=this.now(),fresh=!/^[a-f0-9]{64}$/.test(token||''),sessionToken=fresh?randomBytes(32).toString('hex'):token;
  const result=await this.store.transaction(async tx=>{
   const sessionKey=`session:${hash(sessionToken)}`;let id=await tx.get(sessionKey),p=id?await tx.get(profileKey(id)):null;
   if(!p){id=randomUUID();p={id,name:`Alma ${id.slice(0,6)}`,rating:1000,wins:0,losses:0,streak:0,xp:0,matchId:null};await tx.set(sessionKey,id);await tx.set(profileKey(id),p);}
   const rateKey=`rate:${id}:${Math.floor(now/10000)}`,count=(await tx.get(rateKey)||0)+1;if(count>25)fail('Aguarde alguns segundos.',429);await tx.set(rateKey,count,20);
   const op=input.op||'profile';let match=p.matchId?await tx.get(`match:${p.matchId}`):null;
   if(p.matchId&&!match){p.matchId=null;await tx.set(profileKey(id),p);}
   if(op==='ack'&&match?.settled){p.matchId=null;await tx.set(profileKey(id),p);match=null;}
   const side=match?.players.indexOf(id);
   if(match&&side<0)fail('Partida indisponível.',403);
   if(match&&!match.settled&&match.deadline<=now){const current=match.battle.phase==='influence'?match.battle.influenceDraft.side:match.battle.turnSide;match.battle.phase=terminal({phase:match.battle.influenceResume})?match.battle.influenceResume:current==='player'?'defeat':'victory';match.reason='Tempo esgotado';match.version++;}
   if(op==='queue'&&!match){
    const ids=input.team;if(!Array.isArray(ids)||ids.length!==3||new Set(ids).size!==3||ids.some(id=>!characterById[id]))fail('Escolha três personagens diferentes.');
    const oldQueue=await tx.get('queue')||[],previous=oldQueue.find(q=>q.id===id);let queue=oldQueue.filter(q=>now-q.touched<20000&&q.id!==id);
    const rivalIndex=queue.findIndex(q=>Math.abs(q.rating-p.rating)<=150+Math.floor((now-q.since)/1000)*5);
    if(rivalIndex>=0){const rival=queue.splice(rivalIndex,1)[0],other=await tx.get(profileKey(rival.id));
     if(other&&!other.matchId){
      const first=randomBytes(1)[0]%2===0;const players=first?[p.id,other.id]:[other.id,p.id],teams=first?[ids,rival.team]:[rival.team,ids];let randomState=randomBytes(4).readUInt32LE();const random=()=>{randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296;};
      const battle=createDuel(teams[0],teams[1],{rng:random});battle.randomState=randomState;beginInfluences(battle,randomState);
      match={id:randomUUID(),players,battle,version:1,deadline:now+120000,created:now,settled:false};p.matchId=match.id;other.matchId=match.id;await tx.set(profileKey(other.id),other);await tx.set(profileKey(id),p);await tx.set(`match:${match.id}`,match,86400);
     }
    }
    if(!match){if(queue.length>=100)fail('Fila cheia. Tente novamente.',429);queue.push({id,team:ids,rating:p.rating,since:previous?.since||now,touched:now});}
    await tx.set('queue',queue,600);
   }else if(op==='cancel'){await tx.set('queue',(await tx.get('queue')||[]).filter(q=>q.id!==id),600);}
   if(['turn','influence','surrender'].includes(op)){
    if(!match||match.settled)fail('Partida encerrada ou indisponível.',409);
    if(op!=='surrender'&&input.version!==match.version)fail('O combate foi atualizado. Reconectando.',409);
    attachRandom(match.battle);const owner=match.players.indexOf(id)===0?'player':'enemy';
    if(op==='turn'){try{submitDuelTurn(match.battle,owner,input.actions);}catch{fail('Fila inválida ou fora do seu turno.',409);}}
    if(op==='influence'){
     if(match.battle.phase!=='influence'||match.battle.influenceDraft.side!==owner||!chooseInfluence(match.battle,input.eventId))fail('Escolha indisponível.',409);
     continueDuel(match.battle);
    }
    if(op==='surrender'){match.battle.phase=owner==='player'?'defeat':'victory';match.reason='Rendição';}
    match.version++;match.deadline=now+120000;
   }
   if(match){
    if(terminal(match.battle)&&!match.settled){const a=await tx.get(profileKey(match.players[0])),b=await tx.get(profileKey(match.players[1]));const result=rankedResult(a,b,match.battle.phase==='victory'?0:1);const leaderboard=await tx.get('leaderboard')||[];
     for(const row of result){await tx.set(profileKey(row.id),row);const old=leaderboard.findIndex(q=>q.id===row.id);if(old>=0)leaderboard.splice(old,1);leaderboard.push({id:row.id,name:row.name,rating:row.rating,wins:row.wins,losses:row.losses});}
     leaderboard.sort((a,b)=>b.rating-a.rating);await tx.set('leaderboard',leaderboard.slice(0,100));match.settled=true;match.result=result.map(row=>({id:row.id,rating:row.rating}));p=result.find(row=>row.id===id);
    }
    await tx.set(`match:${match.id}`,match,86400);
   }
   const leaderboard=(await tx.get('leaderboard')||[]).slice(0,25);
   return {profile:{...p,rank:rankForRating(p.rating),level:playerLevel(p.xp)},leaderboard,match:match?{id:match.id,version:match.version,deadline:match.deadline,reason:match.reason,settled:match.settled,battle:publicBattle(match,match.players.indexOf(id))}:null};
  });return {token:sessionToken,...result};
 }
}
