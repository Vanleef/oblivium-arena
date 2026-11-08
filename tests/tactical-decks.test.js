import test from 'node:test';
import assert from 'node:assert/strict';
import {createTacticalBattle,previewTacticalPlan,tacticalView,chooseTacticalChestReward,tacticalTargets} from '../src/tactical-combat.js';
import {boardCells,directions} from '../src/tactical-board.js';
import {TACTICAL_CARD_RULES,tacticalCardVariants,tacticalMovementSteps,createTacticalDecks,defaultTacticalCardBuild,tacticalCardDeck,tacticalHand,validateTacticalCardPlan,spendTacticalCards,nextTacticalCardRound,tacticalResponseOptions,spendTacticalResponse,upgradeTacticalCard} from '../src/tactical-decks.js';
import {tacticalDuelResolve} from '../src/tactical-duel.js';

const allies=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
const enemies=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
const battle=(options={})=>createTacticalBattle(allies,enemies,{compact:true,fortress:true,cardMode:true,seed:42,...options});

test('three independent hand/deck/discard states per side with deterministic seeded draws',()=>{
 const s=battle(),again=battle();
 const ally=s.allies[0],other=s.allies[1],rival=s.enemies[0];
 for(const side of ['player','enemy']){
  assert.equal(Object.keys(s.tactical.decks.sides[side]).length,3);
  for(const deck of Object.values(s.tactical.decks.sides[side])){
   assert.equal(Object.keys(deck.cards).length,8);
   assert.equal(deck.hand.length,TACTICAL_CARD_RULES.openingDraw);
   assert.equal(deck.movementReady,true);
  }
 }
 assert.deepEqual(tacticalHand(s,'player',ally.id),tacticalHand(again,'player',ally.id));
 assert.notEqual(tacticalCardDeck(s,'player',ally.id),tacticalCardDeck(s,'player',other.id));
 assert.notDeepEqual(tacticalHand(s,'player',ally.id).map(c=>c.id),tacticalHand(s,'enemy',rival.id).map(c=>c.id));
 assert.deepEqual(tacticalResponseOptions(s,'player').basic,true);
});

test('movement is free once per round and abilities require cards actually present in the selected hand',()=>{
 const s=battle(),unit=s.allies[0],path=[{x:0,y:0}],move={type:'move',actorId:unit.id,path};
 assert.ok(previewTacticalPlan(s,'player',[move]).ok);
 assert.equal(validateTacticalCardPlan(s,'player',[move,move]).ok,false);
 const noCard={type:'skill',actorId:unit.id,abilityId:unit.abilities.find(a=>a.id!=='fortress-basic').id};
 assert.equal(validateTacticalCardPlan(s,'player',[noCard]).ok,false);
 const card=tacticalHand(s,'player',unit.id).find(c=>c.kind==='skill');
 assert.ok(card);
 assert.ok(validateTacticalCardPlan(s,'player',[{...noCard,abilityId:card.abilityId,cardId:card.id}]).ok);
 assert.equal(validateTacticalCardPlan(s,'player',[{...noCard,abilityId:card.abilityId,cardId:card.id},{...noCard,abilityId:card.abilityId,cardId:card.id}]).ok,false);
 assert.ok(validateTacticalCardPlan(s,'player',[{...noCard,abilityId:'fortress-basic'}]).ok,'basic attack is guaranteed');
});

test('committed cards go to discard, movement resets, and the next hand is drawn',()=>{
 const s=battle(),unit=s.allies[0],deck=tacticalCardDeck(s,'player',unit.id);
 const card=tacticalHand(s,'player',unit.id)[0];
 spendTacticalCards(s,'player',[{type:'move',actorId:unit.id},{type:'skill',actorId:unit.id,cardId:card.id}]);
 assert.ok(!deck.movementReady);
 assert.ok(!deck.hand.includes(card.id));
 assert.ok(deck.discard.includes(card.id));
 s.round++;
 nextTacticalCardRound(s);
 assert.ok(deck.movementReady);
 assert.equal(deck.hand.length,TACTICAL_CARD_RULES.roundDraw);
 assert.equal(s.tactical.decks.responses.player,1);
 assert.ok(!deck.hand.includes(null));
});

test('response budget resets each round, while reactive cards grant extra replies',()=>{
 const base=battle(),unit=base.allies[0],build=defaultTacticalCardBuild(unit);
 build[build.length-1]={...build[build.length-1],upgrade:{opening:true}};
 const s=battle({decks:{[unit.id]:build}}),reaction=tacticalHand(s,'player',unit.id).find(c=>c.kind==='reaction');
 assert.ok(reaction,'opening reactive card is guaranteed');
 assert.ok(spendTacticalResponse(s,'player'));
 assert.equal(s.tactical.decks.responses.player,0);
 assert.ok(tacticalResponseOptions(s,'player').available);
 assert.equal(spendTacticalResponse(s,'player'),false);
 assert.ok(spendTacticalResponse(s,'player',reaction.id));
 assert.equal(tacticalResponseOptions(s,'player').available,false);
 s.round++;
 nextTacticalCardRound(s);
 assert.equal(s.tactical.decks.responses.player,1);
});

test('card inscriptions can upgrade an equipped card without leaking into other hands',()=>{
 const s=battle(),a=s.allies[0],b=s.allies[1];
 const card=tacticalHand(s,'player',a.id)[0],before=tacticalHand(s,'player',b.id);
 const upgraded=upgradeTacticalCard(s,'player',a.id,card.id,{opening:true,retain:true,damageBonus:5});
 assert.equal(upgraded.ok,true);
 assert.equal(upgraded.card.upgrade.damageBonus,5);
 assert.equal(upgraded.card.upgrade.opening,true);
 assert.deepEqual(tacticalHand(s,'player',b.id),before);
 assert.equal(upgradeTacticalCard(s,'player',a.id,'nonexistent',{damageBonus:15}).ok,false);
});

test('successive objective inscriptions add their advertised damage without an intermediate cap',()=>{
 const s=battle(),unit=s.allies[0],deck=tacticalCardDeck(s,'player',unit.id);
 const card=Object.values(deck.cards).find(item=>item.kind==='skill'&&unit.abilities.find(ability=>ability.id===item.abilityId)?.damage>0);
 const ability=unit.abilities.find(item=>item.id===card.abilityId),victim=s.enemies[0];
 s.resonance.bonus=0;s.buffs.damage=0;
 s.tactical.positions[unit.id]={x:2,y:2};s.tactical.positions[victim.id]={x:3,y:2};
 deck.draw=deck.draw.filter(id=>id!==card.id);deck.hand=[card.id];
 let action,baseline;
 for(const anchor of boardCells(s)){
  for(const orientation of directions){
   if(!tacticalTargets(s,unit,ability,anchor,orientation).includes(victim.id))continue;
   const candidate={type:'skill',actorId:unit.id,abilityId:ability.id,cardId:card.id,anchor,orientation};
   const preview=previewTacticalPlan(s,'player',[candidate]);
   if(preview.ok&&preview.projection.enemies[0].hp<victim.hp){action=candidate;baseline=preview.projection.enemies[0].hp;break;}
  }
  if(action)break;
 }
 assert.ok(action,'must find a valid damaging skill');
 for(const [index,amount] of [5,5,10,5].entries()){
  const offer={id:'objective:test:'+index,side:'player',actorId:unit.id,objective:true,fortress:true,tier:'silver',
   options:[{id:'inscription',effect:{type:'tactical-card-upgrade',upgrade:{
    damageBonus:amount,...(index===1?{retain:true,damageType:'piercing'}:{}),...(index===2?{opening:true}:{})
   }}}]};
  s.tactical.stage='reward';s.tactical.pendingChestRewards.push(offer);
  const result=chooseTacticalChestReward(s,offer.id,'inscription',card.id,'player');
  assert.equal(result.ok,true,result.reason);
 }
 assert.equal(card.upgrade.damageBonus,25);
 assert.equal(card.upgrade.retain,true);
 assert.equal(card.upgrade.opening,true);
 assert.equal(card.upgrade.damageType,'piercing');
 const upgradedPreview=previewTacticalPlan(s,'player',[action]);
 assert.equal(upgradedPreview.ok,true,upgradedPreview.reason);
 assert.equal(baseline-upgradedPreview.projection.enemies[0].hp,25);
 const saved=Object.values(deck.cards).map(item=>({kind:item.kind,abilityId:item.abilityId,variantId:item.variantId,upgrade:item.upgrade}));
 const restored=battle({decks:{[unit.id]:saved}});
 assert.equal(tacticalCardDeck(restored,'player',unit.id).cards[card.id].upgrade.damageBonus,25);
 const previous=structuredClone(card.upgrade);
 assert.equal(upgradeTacticalCard(s,'player',unit.id,card.id,{damageBonus:-1}).ok,false);
 assert.equal(upgradeTacticalCard(s,'player',unit.id,card.id,{damageBonus:Number.MAX_SAFE_INTEGER}).ok,false);
 assert.deepEqual(card.upgrade,previous);
});

test('tactical views conceal the opponent deck and the future draw order',()=>{
 const s=battle();
 const view=tacticalView(s,'player');
 assert.deepEqual(view.tactical.decks.sides.enemy,{});
 for(const deck of Object.values(view.tactical.decks.sides.player))assert.ok(deck.draw.every(id=>id===null));
 assert.ok(Object.values(s.tactical.decks.sides.enemy).some(deck=>deck.hand.length),'full engine still owns both hands');
});

test('card-mode duel grants full damage on tie, crit on attack win, and cancels a protected target on defense win',()=>{
 const tied=tacticalDuelResolve('miragem','miragem',{mode:'cards'});
 const hit=tacticalDuelResolve('miragem','luz',{mode:'cards'});
 const block=tacticalDuelResolve('miragem','sombra',{mode:'cards'});
 assert.equal(tied.damageRate,1);
 assert.equal(hit.damageRate,1.5);
 assert.equal(block.damageRate,0);
 assert.equal(block.outcome,'miss');
 assert.equal(tacticalDuelResolve('miragem','miragem').damageRate,.5,'legacy mode preserved');
});

test('campaign completion gates extra movement and reactive card variants',()=>{
 const unit={id:'hero',side:'player',hp:100,abilities:[
  {id:'a',name:'A'},{id:'b',name:'B'},{id:'c',name:'C'},{id:'d',name:'D'}]};
 const stub={round:1,allies:[unit],enemies:[]};
 const base=defaultTacticalCardBuild(unit);
 const variants=tacticalCardVariants;
 assert.equal(variants.length,3);
 for(const variant of variants){
  const custom=base.map((entry,i)=>i===6?{kind:variant.kind,variantId:variant.id}:entry);
  assert.throws(()=>createTacticalDecks(stub,{decks:{hero:custom},unlockedKingdoms:variant.kingdoms-1}),/não liberada/);
  const state=createTacticalDecks(stub,{decks:{hero:custom},unlockedKingdoms:variant.kingdoms});
  const card=Object.values(state.sides.player.hero.cards).find(c=>c.variantId===variant.id);
  assert.ok(card);
  assert.equal(card.kind,variant.kind);
  if(card.kind==='mobility')assert.equal(tacticalMovementSteps(card),variant.movement);
 }
});
