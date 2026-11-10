import test from 'node:test';
import assert from 'node:assert/strict';
import {createTacticalBattle,submitTacticalPlan,startCompactRoundResolution,resumeCompactRoundResolution} from '../src/tactical-combat.js';
import {tacticalHand,defaultTacticalCardBuild} from '../src/tactical-decks.js';
const roster=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
const rivals=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
function duel(){const s=createTacticalBattle(roster,rivals,{compact:true,fortress:true,cardMode:true,seed:31});s.tactical.pvpMode=true;return s;}
test('authoritative compact session survives JSON serialization between first and second action waves',()=>{
 const s=duel();
 assert.equal(submitTacticalPlan(s,'player',[]).ready,false);
 assert.equal(submitTacticalPlan(s,'enemy',[]).ready,true);
 const session=startCompactRoundResolution(s,{persist:true});
 assert.equal(session.ok,true);
 let snapshot=JSON.parse(JSON.stringify(s));
 let resume=resumeCompactRoundResolution(snapshot);
 let steps=0;
 while(steps++<24){
  const result=resume.next({});
  assert.equal(result.ok,true,result.reason);
  if(result.done)break;
  snapshot=JSON.parse(JSON.stringify(snapshot));
  resume=resumeCompactRoundResolution(snapshot);
 }
 assert.ok(steps<24,'round resolution must finish without recreating already executed actions');
 assert.equal(snapshot.round,2);
 assert.equal(snapshot.tactical.stage,'planning');
 assert.equal(snapshot.tactical.plans.player,undefined);
});
test('PvP intent is canonical, validated before deck mutation and stored only on skill actions',()=>{
 const s=duel(),a=s.allies[0],card=tacticalHand(s,'player',a.id).find(x=>x.kind==='skill');
 assert.ok(card);
 const action={type:'skill',actorId:a.id,abilityId:card.abilityId,cardId:card.id,anchor:s.tactical.positions[a.id],orientation:[1,0],willSign:'fraud'};
 const rejected=submitTacticalPlan(s,'player',[action]);
 assert.equal(rejected.ok,false);
 assert.equal(s.tactical.plans.player,undefined);
 assert.ok(tacticalHand(s,'player',a.id).some(x=>x.id===card.id));
 assert.equal(submitTacticalPlan(s,'player',[]).ok,true);
});
test('per-side deck builds do not collide when opposing teams use the same character',()=>{
 const hero=roster[0],s0=duel(),unit=s0.allies[0];
 const playerBuild=defaultTacticalCardBuild(unit).map((x,i)=>i===0?{kind:'mobility'}:x);
 const enemyBuild=defaultTacticalCardBuild(unit).map((x,i)=>i===0?{kind:'reaction'}:x);
 const s=createTacticalBattle(roster,roster,{compact:true,fortress:true,cardMode:true,seed:31,decks:{player:{[hero]:playerBuild},enemy:{[hero]:enemyBuild}}});
 const own=Object.values(s.tactical.decks.sides.player[hero].cards);
 const foe=Object.values(s.tactical.decks.sides.enemy[s.enemies[0].id].cards);
 assert.equal(own[0].kind,'mobility');
 assert.equal(foe[0].kind,'reaction');
});
