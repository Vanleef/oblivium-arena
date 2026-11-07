import test from "node:test";
import assert from "node:assert/strict";
import {CARD_RULES,createCardState,beginCardRound,endCardRound,drawCards,findHandCard,consumeHandCard,handFor,validateLoadout,applyCardUpgrades,spendResponse,resolveWillClash} from "../src/card-combat.js";
const unit=id=>({id,hp:100,side:id==="a"?"player":"enemy",abilities:[{id:"strike",damage:20},{id:"curse",damage:10},{id:"shield",shield:10},{id:"blast",damage:30}]});
const rng=()=>0.42;
test("three separate decks have separate hands and a guaranteed temporary movement card",()=>{
 const units=["a","b","c"].map(unit),s=createCardState(units,{rng});beginCardRound(s,units,1,rng);
 assert.equal(Object.keys(s.decks).length,3);
 for(const u of units){
  assert.equal(handFor(s,u.id).filter(c=>c.kind==="ability").length,2);
  assert.equal(handFor(s,u.id).filter(c=>c.kind==="movement").length,1);
  assert.equal(s.decks[u.id].draw.length,6);
 }
 const b=JSON.stringify(s.decks.b);
 const card=handFor(s,"a").find(c=>c.kind==="ability");
 assert.ok(consumeHandCard(s,"a",card.id));
 assert.equal(JSON.stringify(s.decks.b),b,"playing A does not touch B");
 endCardRound(s);beginCardRound(s,units,2,rng);
 assert.equal(handFor(s,"a").filter(c=>c.kind==="movement").length,1);
 assert.equal(handFor(s,"a").find(c=>c.kind==="movement").id,"a:movement:2");
});
test("loadouts validate ability ownership and card-count limits",()=>{
 const u=unit("a");
 assert.throws(()=>validateLoadout(u,["strike"]),/entre 8 e 10/);
 assert.throws(()=>validateLoadout(u,Array(8).fill("other")),/inválida/);
 assert.equal(validateLoadout(u,Array(8).fill("strike")).length,8);
});
test("innate cards start in hand, retained cards remain, exhausted cards do not reshuffle",()=>{
 const u=unit("a");
 const loadout=[
  {abilityId:"strike",upgrades:["innate","retain"]},
  {abilityId:"curse",upgrades:["exhaust"]},
  ...Array(6).fill("blast")
 ];
 const s=createCardState([u],{loadouts:{a:loadout},rng});beginCardRound(s,[u],1,rng);
 const innate=findHandCard(s,"a","strike");assert.ok(innate);
 endCardRound(s);assert.ok(s.decks.a.hand.some(c=>c.id===innate.id));
 const exhausted=s.decks.a.draw.find(c=>c.abilityId==="curse")||s.decks.a.discard.find(c=>c.abilityId==="curse");
 // Directly put the test card into hand to verify the exhaust destination.
 s.decks.a.draw=s.decks.a.draw.filter(c=>c.id!==exhausted.id);
 s.decks.a.discard=s.decks.a.discard.filter(c=>c.id!==exhausted.id);
 s.decks.a.hand.push(exhausted);
 consumeHandCard(s,"a",exhausted.id);
 assert.equal(s.decks.a.exhaust.length,1);
 assert.equal(s.decks.a.discard.some(c=>c.id===exhausted.id),false);
});
test("draw pile reshuffles discard without cloning or losing a card",()=>{
 const u=unit("a"),s=createCardState([u],{rng});beginCardRound(s,[u],1,rng);
 const deck=s.decks.a;
 deck.discard.push(...deck.hand.filter(c=>c.kind==="ability"),...deck.draw.splice(0));
 deck.hand=deck.hand.filter(c=>c.kind==="movement");
 drawCards(deck,2,rng);
 assert.equal(deck.hand.filter(c=>c.kind==="ability").length,2);
 assert.equal(new Set([...deck.hand,...deck.draw,...deck.discard,...deck.exhaust].filter(c=>c.kind==="ability").map(c=>c.id)).size,8);
});
test("upgrade damage and physical status effects",()=>{
 const ability={id:"strike",damage:20};
 assert.equal(applyCardUpgrades(ability,["damage"]).damage,25);
 assert.equal(applyCardUpgrades(ability,["fire"]).damageType,"fire");
 assert.deepEqual(applyCardUpgrades(ability,["bleed"]).dot,{tag:"sangramento",damage:5,turns:2});
 assert.equal(ability.damage,20);
});
test("one team response per round and cyclic clash outcomes",()=>{
 const a=unit("a"),b=unit("b");const s=createCardState([a,b],{rng});
 beginCardRound(s,[a,b],1,rng);
 assert.ok(spendResponse(s,"player"));
 assert.equal(spendResponse(s,"player"),false);
 assert.equal(s.responses.enemy,CARD_RULES.responsesPerRound);
 endCardRound(s);beginCardRound(s,[a,b],2,rng);assert.ok(spendResponse(s,"player"));
 assert.deepEqual(resolveWillClash({attackerChoice:"fenda",defenderChoice:"egide",baseDamage:30}),{outcome:"blocked",cancel:true,critical:false,damage:0});
 assert.deepEqual(resolveWillClash({attackerChoice:"fenda",defenderChoice:"vinculo",baseDamage:30}),{outcome:"critical",cancel:false,critical:true,damage:42});
 assert.equal(resolveWillClash({attackerChoice:"egide",defenderChoice:"egide",baseDamage:30}).damage,30);
 assert.throws(()=>resolveWillClash({attackerChoice:"stone",defenderChoice:"egide"}),/inválida/);
});
