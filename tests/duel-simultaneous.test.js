import test from "node:test";
import assert from "node:assert/strict";
import {characters} from "../src/data.js";
import {createDuel,submitDuelTurn,answerDuelClash,getValidTargets} from "../src/combat.js";
import {publicBattle} from "../server/arena-service.js";

const testCharacter=characters.find(c=>c.abilities?.some(a=>a.damage>0&&["enemy","all-enemies"].includes(a.target)));
assert.ok(testCharacter,"At least one character must have an offensive skill.");
const pools=()=>({essence:80,cinza:80,graca:80,ruptura:80});

function duel(){
 const s=createDuel([testCharacter.id],[testCharacter.id],{rng:()=>0.4,cardMode:true});
 s.resources=pools();s.enemyResources=pools();
 // Prevent a critical/normal comparison from saturating a target's 100 HP.
 for(const unit of [...s.allies,...s.enemies]){unit.maxHp=1000;unit.hp=1000;}
 return s;
}
function attack(s,willSign="fenda"){
 const actor=s.allies[0],enemy=s.enemies[0],deck=s.cardCombat.decks[actor.id];
 const ability=actor.abilities.find(a=>a.damage>0&&["enemy","all-enemies"].includes(a.target)&&getValidTargets(s,actor,a).some(t=>t.id===enemy.id));
 assert.ok(ability,"Expected at least one valid offensive ability");
 let card=deck.hand.find(c=>c.abilityId===ability.id);
 if(!card){
  const i=deck.draw.findIndex(c=>c.abilityId===ability.id);
  assert.ok(i>=0,"Needed skill absent from deck");
  card=deck.draw.splice(i,1)[0];deck.hand.push(card);
 }
 return {actorId:actor.id,abilityId:ability.id,targetId:enemy.id,cardId:card.id,willSign};
}
test("both teams submit simultaneously: one commit does not execute or reveal its plan",()=>{
 const s=duel(),initial=s.enemies[0].hp;
 const planned=attack(s);
 submitDuelTurn(s,"player",[planned]);
 assert.equal(s.phase,"player");
 assert.equal(s.enemies[0].hp,initial);
 assert.ok(s.duelPlans.player);
 assert.equal(s.duelPlans.enemy,null);
 const view=publicBattle({battle:s},1);
 assert.equal(view.phase,"player");
 assert.deepEqual(view.ready,{player:false,enemy:true});
 assert.equal(view.duelPlans,undefined);
 assert.equal(view.duelPools,undefined);
 assert.equal(view.resolution,undefined);
 assert.equal(view.cardCombat.decks[s.allies[0].id],undefined);
 assert.throws(()=>submitDuelTurn(s,"player",[]),/confirmado/);
});
test("successful defender will sign blocks damage, preserving its team budget until the next round",()=>{
 const s=duel(),oldHp=s.enemies[0].hp;
 submitDuelTurn(s,"player",[attack(s,"fenda")]);
 submitDuelTurn(s,"enemy",[]);
 assert.equal(s.phase,"clash");
 assert.equal(s.clash.defenderSide,"enemy");
 const defender=publicBattle({battle:s},1),attacker=publicBattle({battle:s},0);
 assert.equal(defender.phase,"clash");
 assert.equal(defender.clash.willSign,undefined);
 assert.equal(attacker.phase,"waiting");
 assert.equal(attacker.clash.willSign,undefined);
 assert.throws(()=>answerDuelClash(s,"player","egide"),/pendente/);
 answerDuelClash(s,"enemy","egide");
 assert.equal(s.enemies[0].hp,oldHp);
 assert.equal(s.round,2);
 assert.equal(s.cardCombat.responses.enemy,1,"Response budget resets in new round");
 assert.equal(s.cardCombat.decks[s.allies[0].id].hand.filter(c=>c.kind==="movement").length,1);
 assert.equal(s.duelPlans.player,null);
});
test("losing a reply raises the damage over an identical ordinary strike",()=>{
 const ordinary=duel();
 submitDuelTurn(ordinary,"player",[attack(ordinary,"fenda")]);
 submitDuelTurn(ordinary,"enemy",[]);
 assert.equal(ordinary.phase,"clash");
 answerDuelClash(ordinary,"enemy","pass");
 const normalDamage=ordinary.enemies[0].maxHp-ordinary.enemies[0].hp;

 const critical=duel();
 submitDuelTurn(critical,"player",[attack(critical,"fenda")]);
 submitDuelTurn(critical,"enemy",[]);
 assert.equal(critical.phase,"clash");
 answerDuelClash(critical,"enemy","vinculo");
 const critDamage=critical.enemies[0].maxHp-critical.enemies[0].hp;
 assert.ok(critDamage>normalDamage, "Critical must exceed the normal damage");
});
test("invalid signs and duplicate response attempts do not spend a response",()=>{
 const s=duel();
 submitDuelTurn(s,"player",[attack(s)]);
 submitDuelTurn(s,"enemy",[]);
 assert.throws(()=>answerDuelClash(s,"enemy","sangue"),/inválida/);
 assert.equal(s.cardCombat.responses.enemy,1);
 answerDuelClash(s,"enemy","vinculo");
 assert.throws(()=>answerDuelClash(s,"enemy","egide"),/pendente/);
});
test("legacy duel without card mode remains sequential",()=>{
 const s=createDuel([testCharacter.id],[testCharacter.id],{rng:()=>0.4});
 assert.equal(s.simultaneousDuel,undefined);
 assert.equal(s.turnSide,"player");
});
