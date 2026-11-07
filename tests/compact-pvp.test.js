import test from 'node:test';
import assert from 'node:assert/strict';
import {createCompactPvpBattle,publicCompactPvpBattle,submitCompactPvpPlan,respondCompactPvp,chooseCompactPvpReward} from '../server/compact-pvp.js';
import {tacticalHand} from '../src/tactical-decks.js';
const ids=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
const rivals=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
const duel=(config={})=>createCompactPvpBattle(ids,rivals,{seed:17,...config});

test('two separate sealed plans resume a 6x6 server-authored round after JSON persistence',()=>{
 let s=duel();
 assert.equal(s.tactical.width,6);
 assert.equal(submitCompactPvpPlan(s,'player',1,[]).ready,false);
 assert.equal(publicCompactPvpBattle(s,'player').phase,'waiting');
 assert.equal(publicCompactPvpBattle(s,'enemy').tactical.confirmed.player,true);
 assert.deepEqual(publicCompactPvpBattle(s,'enemy').tactical.plans,{});
 s=JSON.parse(JSON.stringify(s));
 const second=submitCompactPvpPlan(s,'enemy',1,[]);
 assert.equal(second.ok,true,second.reason);
 assert.equal(s.round,2);
 assert.equal(s.tactical.stage,'planning');
 assert.equal(s.tactical.authoritativeResolution,undefined);
 assert.equal(submitCompactPvpPlan(s,'player',1,[]).ok,false);
});
test('opponent hands, draw order, planned signs and objective coordinates never leave server',()=>{
 const s=duel();
 assert.ok(Object.keys(s.tactical.decks.sides.enemy).length);
 const view=publicCompactPvpBattle(s,'player');
 assert.deepEqual(view.tactical.decks.sides.enemy,{});
 assert.ok(Object.values(view.tactical.decks.sides.player).every(deck=>deck.draw.every(id=>id===null)));
 const objective=s.tactical.objectives.enemy;
 assert.ok(objective);
 assert.equal(view.tactical.objectives.enemy,undefined);
 s.tactical.pendingClash={round:1,defenderSide:'enemy',actorId:s.allies[0].id,abilityId:'voto',targetId:s.enemies[0].id,willSign:'luz'};
 s.tactical.events.push({type:'reveal',actions:[{actorId:s.allies[0].id,willSign:'luz',cardId:'secret'}],before:{objectives:{player:s.tactical.objectives.player}}});
 const rival=publicCompactPvpBattle(s,'enemy');
 assert.equal(rival.phase,'tactical-clash');
 assert.equal(rival.tactical.clash.defender,true);
 assert.equal(JSON.stringify(rival).includes('"willSign"'),false);
 assert.equal(JSON.stringify(rival).includes('"authoritativeResolution"'),false);
 assert.equal(JSON.stringify(rival.tactical.events).includes('"objectives"'),false);
});
test('forged upgrades never enter competitive decks',()=>{
 const s=duel({decks:{player:{[ids[0]]:[
  {kind:'skill',abilityId:'impulso',upgrade:{damageBonus:15,opening:true}},
  {kind:'skill',abilityId:'tecnica'}, {kind:'skill',abilityId:'voto'},
  {kind:'skill',abilityId:'despertar'}, {kind:'skill',abilityId:'impulso'},
  {kind:'skill',abilityId:'tecnica'}, {kind:'mobility'}, {kind:'reaction'}
 ]}}});
 const first=Object.values(s.tactical.decks.sides.player[ids[0]].cards)[0];
 assert.equal(first.upgrade.damageBonus,0);
 assert.equal(first.upgrade.opening,false);
});
test('invalid defender requests cannot spend the card budget or affect pending special',()=>{
 const s=duel();s.tactical.pendingClash={round:1,defenderSide:'enemy',actorId:ids[0],abilityId:'voto',targetId:s.enemies[0].id,willSign:'miragem'};
 assert.equal(respondCompactPvp(s,'player','luz').ok,false);
 assert.equal(respondCompactPvp(s,'enemy','forged').ok,false);
 assert.equal(respondCompactPvp(s,'enemy','pass','forged').ok,false);
 assert.equal(s.tactical.pendingClash.willSign,'miragem');
 assert.equal(s.tactical.decks.responses.enemy,1);
});
test('private objective reward can be chosen by the owning rival, never by the attacker',()=>{
 const s=duel(),unit=s.enemies[0];s.tactical.stage='reward';
 s.tactical.pendingChestRewards.push({id:'objective:enemy:0',side:'enemy',actorId:unit.id,objective:true,fortress:true,tier:'silver',
  options:[{id:'shield',title:'Defesa',text:'Escudo',effect:{type:'shield-team',amount:5}}]});
 const offer='objective:enemy:0';
 assert.equal(chooseCompactPvpReward(s,'player',offer,'shield').ok,false);
 assert.equal(publicCompactPvpBattle(s,'player').tactical.pendingChestRewards.length,0);
 assert.equal(publicCompactPvpBattle(s,'enemy').tactical.pendingChestRewards.length,1);
 const result=chooseCompactPvpReward(s,'enemy',offer,'shield');
 assert.equal(result.ok,true,result.reason);
 assert.equal(s.tactical.stage,'planning');
 assert.equal(s.tactical.pendingChestRewards.length,0);
});
