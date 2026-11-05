import test from 'node:test';
import assert from 'node:assert/strict';
import {createTacticalBattle,submitTacticalActivation,chooseTacticalChestReward} from '../src/tactical-combat.js';
import {applyFortressPenalty,fortressPenaltyOptions} from '../src/conquest-objectives.js';
import {finishBoardRound} from '../src/combat.js';
const allies=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],rivals=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
const make=()=>createTacticalBattle(allies,rivals,{fortress:true});
test('choosing a penalty after the round boundary does not give the player an extra round',()=>{
 for(const option of fortressPenaltyOptions()){
  const immediate=make(),delayed=make(),status=option.effect.status;
  immediate.round=4;applyFortressPenalty(immediate,'player',option.effect,immediate.enemies[0].id,4);
  finishBoardRound(immediate);assert.equal(immediate.enemies[0][status],1);
  delayed.round=5;applyFortressPenalty(delayed,'player',option.effect,delayed.enemies[0].id,4);
  finishBoardRound(immediate);finishBoardRound(delayed);
  assert.equal(immediate.enemies[0][status],0);assert.equal(delayed.enemies[0][status],0,status);
 }
});
test('an invasion offer retains its earned round even when the exchange closes that round',()=>{
 const s=make(),actor=s.allies[0];for(const rival of s.enemies)rival.stunned=50;
 s.round=3;s.tactical.positions[actor.id]={x:7,y:1};s.tactical.activation.spent=s.allies.slice(1).map(u=>u.id);
 const result=submitTacticalActivation(s,'player',actor.id,[{type:'move',actorId:actor.id,path:[{x:8,y:1}]}]);
 const offer=result.chestRewards.find(o=>o.invasion);assert.equal(offer.round,3);assert.equal(s.round,4);
 assert.ok(chooseTacticalChestReward(s,offer.id,'siege-expose').ok);
 assert.equal(s.enemies[0].boardFresh.exposed,3);
});
test('older penalties cannot shorten the freshness of another effect applied this round',()=>{
 const s=make(),target=s.enemies[0];s.round=5;target.weakened=1;target.boardFresh={weakened:5};
 applyFortressPenalty(s,'player',fortressPenaltyOptions()[0].effect,undefined,4);
 assert.equal(target.boardFresh.weakened,5);
});
test('the AI can select each penalty and selects a living individual target',async()=>{
 const {chooseFortressPenalty}=await import('../src/conquest-objectives.js');
 const s=make();
 // A vulnerable trio with attacks ready makes team disruption worthwhile.
 for(const u of s.allies){u.weakened=0;u.exposed=1;u.sealAttack=1;u.abilities=[{id:'hit',target:'enemy',damage:12}];}
 assert.equal(chooseFortressPenalty(s,'enemy').option.id,'siege-weaken');
 for(const u of s.allies){u.weakened=1;u.exposed=0;u.sealAttack=1;}
 assert.equal(chooseFortressPenalty(s,'enemy').option.id,'siege-expose');
 for(const u of s.allies){u.exposed=1;u.sealAttack=0;}
 s.allies[1].hp=0;
 s.allies[2].abilities=[{id:'burst',target:'enemy',damage:26,combo:{bonusDamage:8}}];
 const choice=chooseFortressPenalty(s,'enemy');assert.equal(choice.option.id,'siege-seal');assert.equal(choice.targetId,s.allies[2].id);
 const before=JSON.stringify(s);s.tactical.plans.player=[{type:'move',actorId:s.allies[0].id,path:[{x:1,y:1}]}];
 assert.deepEqual(chooseFortressPenalty(s,'enemy'),choice);delete s.tactical.plans.player;assert.equal(JSON.stringify(s),before);
});
test('AI invasion applies its selected individual seal through the actual exchange',()=>{
 const s=make(),enemy=s.enemies[0],target=s.allies[0];s.allies[1].hp=0;s.allies[2].hp=0;target.stunned=50;
 s.tactical.positions[target.id]={x:4,y:2};s.tactical.positions[enemy.id]={x:1,y:1};
 s.tactical.activation.spent=s.enemies.slice(1).map(u=>u.id);s.round=2;
 const result=submitTacticalActivation(s,'enemy',enemy.id,[{type:'move',actorId:enemy.id,path:[{x:0,y:1}]}]);
 assert.equal(result.ok,true);assert.equal(target.sealAttack,1);
 assert.ok(result.events.some(e=>e.title==='Invasão rival · Selar a Ofensiva'));
});
test('malformed penalties cannot write arbitrary unit fields',()=>{
 const s=make(),before=JSON.stringify(s);
 assert.equal(applyFortressPenalty(s,'player',{scope:'team',status:'hp'}).ok,false);
 assert.equal(JSON.stringify(s),before);
});
