import test from 'node:test';
import assert from 'node:assert/strict';
import {createCompactPvpBattle,publicCompactPvpBattle,submitCompactPvpPlan,respondCompactPvp,chooseCompactPvpReward} from '../server/compact-pvp.js';
import {tacticalHand} from '../src/tactical-decks.js';
import {tacticalTargets,previewTacticalPlan} from '../src/tactical-combat.js';
import {tacticalComboEligible} from '../src/tactical-combo.js';
import {boardCells,directions} from '../src/tactical-board.js';
const ids=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
const rivals=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
const duel=(config={})=>createCompactPvpBattle(ids,rivals,{seed:17,...config});

test('two separate sealed plans resume a 6x6 server-authored round after JSON persistence',()=>{
 let s=duel();
 assert.equal(s.tactical.width,6);
 assert.doesNotThrow(()=>structuredClone(s));
 assert.ok(Number.isInteger(s.rngState));
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
 s.tactical.events.push({type:'reveal',actions:[{actorId:s.allies[0].id,willSign:'luz',cardId:'secret',randomPayment:{eter:1}}],before:{objectives:{player:s.tactical.objectives.player}}});
 const rival=publicCompactPvpBattle(s,'enemy');
 assert.equal(rival.phase,'tactical-clash');
 assert.equal(rival.tactical.clash.defender,true);
 assert.equal(JSON.stringify(rival).includes('"willSign"'),false);
 assert.equal(JSON.stringify(rival).includes('"authoritativeResolution"'),false);
 assert.equal(JSON.stringify(rival.tactical.events).includes('"objectives"'),false);
 assert.equal(JSON.stringify(rival.tactical.events).includes('"cardId"'),false);
 assert.equal(JSON.stringify(rival.tactical.events).includes('"randomPayment"'),false);
 assert.equal(rival.tactical.events.length,1);
 assert.equal(s.tactical.events[0].actions[0].willSign,'luz','projection must not mutate authoritative events');
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

test('a real special waits for the defender after the two sealed plans, then resumes on a fresh JSON snapshot',()=>{
 let s=duel();
 const actor=s.allies[0],victim=s.enemies[0];
 s.tactical.positions[actor.id]={x:2,y:2};
 s.tactical.positions[victim.id]={x:3,y:2};
 const deck=s.tactical.decks.sides.player[actor.id];
 let chosen=null;
 for(const card of Object.values(deck.cards)){
  const ability=actor.abilities.find(a=>a.id===card.abilityId);
  if(!ability||!tacticalComboEligible(actor,ability,[victim.id]))continue;
  for(const anchor of boardCells(s)){
   for(const orientation of directions){
    if(!tacticalTargets(s,actor,ability,anchor,orientation).includes(victim.id))continue;
    const ref={type:'skill',actorId:actor.id,abilityId:ability.id,cardId:card.id,
     anchor,orientation,willSign:'miragem'};
    const previous=[...deck.hand];deck.hand=[card.id];
    const preview=previewTacticalPlan(s,'player',[ref]);
    if(preview.ok){chosen=ref;break;}
    deck.hand=previous;
   }
   if(chosen)break;
  }
  if(chosen)break;
 }
 assert.ok(chosen,'must find an actual valid offensive special with the enemy adjacent');
 assert.equal(submitCompactPvpPlan(s,'player',1,[chosen]).ready,false);
 s=JSON.parse(JSON.stringify(s));
 const started=submitCompactPvpPlan(s,'enemy',1,[]);
 assert.equal(started.ok,true,started.reason);
 assert.equal(started.clash,true,'server must stop before executing a contestable hit');
 assert.equal(s.tactical.pendingClash.defenderSide,'enemy');
 const view=publicCompactPvpBattle(s,'enemy');
 assert.equal(view.phase,'tactical-clash');
 assert.equal(view.tactical.clash.defender,true);
 assert.equal(JSON.stringify(view).includes('"willSign"'),false);
 assert.equal(JSON.stringify(view).includes('"authoritativeResolution"'),false);
 const hp=victim.hp;
 s=JSON.parse(JSON.stringify(s));
 assert.equal(respondCompactPvp(s,'player','luz').ok,false,'the attacker cannot answer in place of the defender');
 assert.equal(s.enemies[0].hp,hp);
 const resolved=respondCompactPvp(s,'enemy','luz');
 assert.equal(resolved.ok,true,resolved.reason);
 assert.equal(s.tactical.pendingClash,undefined);
 assert.ok(s.enemies[0].hp<hp,'Miragem defeats Luz, so the defender must suffer the special');
 assert.equal(s.round,2);
 for(const side of ['player','enemy']){
  const event=publicCompactPvpBattle(s,side).tactical.events.find(item=>item.duel);
  assert.equal(event.duel.attackChoice,'miragem');
  assert.equal(event.duel.defenseChoice,'luz');
  assert.equal(event.duel.outcome,'hit');
 }
});

test('a defensive block protects only its target from elemental effects in an area',()=>{
 const s=duel(),actor=s.allies[0],protectedUnit=s.enemies[0],other=s.enemies[1];
 s.tactical.positions[actor.id]={x:2,y:2};
 s.tactical.positions[protectedUnit.id]={x:3,y:2};
 s.tactical.positions[other.id]={x:4,y:2};
 s.tactical.surfaces['3,2']={element:'water',until:3};
 s.tactical.surfaces['4,2']={element:'water',until:3};
 const deck=s.tactical.decks.sides.player[actor.id];
 const card=Object.values(deck.cards).find(item=>item.kind==='skill'&&item.abilityId==='voto');
 card.upgrade.damageType='electric';
 deck.draw=deck.draw.filter(id=>id!==card.id);deck.hand=[card.id];
 const ability=actor.abilities.find(item=>item.id==='voto');
 let chosen;
 for(const anchor of boardCells(s)){
  for(const orientation of directions){
   const targets=tacticalTargets(s,actor,ability,anchor,orientation);
   if(!targets.includes(protectedUnit.id)||!targets.includes(other.id))continue;
   const ref={type:'skill',actorId:actor.id,abilityId:ability.id,cardId:card.id,anchor,orientation,willSign:'miragem'};
   if(previewTacticalPlan(s,'player',[ref]).ok){chosen=ref;break;}
  }
  if(chosen)break;
 }
 assert.ok(chosen,'must find an area that reaches both targets');
 assert.equal(submitCompactPvpPlan(s,'player',1,[chosen]).ok,true);
 const started=submitCompactPvpPlan(s,'enemy',1,[]);
 assert.equal(started.clash,true);
 assert.equal(s.tactical.pendingClash.targetId,protectedUnit.id);
 const hp=protectedUnit.hp;
 const result=respondCompactPvp(s,'enemy','sombra');
 assert.equal(result.ok,true,result.reason);
 const event=s.tactical.events.find(item=>item.duel?.outcome==='miss');
 assert.ok(event.affectedTargetIds.includes(other.id));
 assert.equal(protectedUnit.hp,hp);
 assert.equal(protectedUnit.stunned,0);
 assert.ok(event.elemental.stuns.includes(other.id));
 assert.ok(!event.elemental.stuns.includes(protectedUnit.id));
 assert.equal(event.after.surfaces['4,2'].element,'electric');
});
test('a fully blocked elemental special spends its card without producing a contact surface',()=>{
 const s=duel(),actor=s.allies[0],victim=s.enemies[0];
 s.tactical.positions[actor.id]={x:2,y:2};
 s.tactical.positions[victim.id]={x:3,y:2};
 s.tactical.surfaces['3,2']={element:'water',until:3};
 const deck=s.tactical.decks.sides.player[actor.id];
 const card=Object.values(deck.cards).find(item=>item.kind==='skill'&&item.abilityId==='voto');
 card.upgrade.damageType='electric';
 deck.draw=deck.draw.filter(id=>id!==card.id);deck.hand=[card.id];
 const ability=actor.abilities.find(item=>item.id==='voto');
 actor.cooldowns.voto=3;
 let chosen;
 for(const anchor of boardCells(s)){
  for(const orientation of directions){
   const targets=tacticalTargets(s,actor,ability,anchor,orientation);
   if(targets.length!==1||targets[0]!==victim.id)continue;
   const ref={type:'skill',actorId:actor.id,abilityId:ability.id,cardId:card.id,anchor,orientation,willSign:'miragem'};
   if(previewTacticalPlan(s,'player',[ref]).ok){chosen=ref;break;}
  }
  if(chosen)break;
 }
 assert.ok(chosen);
 assert.equal(submitCompactPvpPlan(s,'player',1,[chosen]).ok,true);
 assert.equal(submitCompactPvpPlan(s,'enemy',1,[]).clash,true);
 assert.equal(respondCompactPvp(s,'enemy','sombra').ok,true);
 const event=s.tactical.events.find(item=>item.duel?.outcome==='miss');
 assert.deepEqual(event.affectedTargetIds,[]);
 assert.equal(event.elemental,null);
 assert.equal(event.after.surfaces['3,2'].element,'water');
 assert.ok(!deck.hand.includes(card.id));
 assert.equal(actor.cooldowns.voto,undefined,'card mode ignores and clears any legacy cooldown; the spent card controls when the technique returns');
 assert.ok(deck.discard.includes(card.id),'a blocked technique still spends its card into the discard pile');
});
