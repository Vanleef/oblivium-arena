import test from "node:test";
import assert from "node:assert/strict";
import {characters} from "../src/data.js";
import {createDuel,submitDuelTurn,answerDuelClash,getValidTargets} from "../src/combat.js";
import {publicBattle} from "../server/arena-service.js";
import {setMovementPlan} from "../src/tactical-grid.js";

const testCharacter=characters.find(c=>c.abilities?.some(a=>a.damage>0&&["enemy","all-enemies"].includes(a.target)));
assert.ok(testCharacter,"At least one character must have an offensive skill.");
const pools=()=>({essence:80,cinza:80,graca:80,ruptura:80});

function duel(){
 const s=createDuel([testCharacter.id],[testCharacter.id],{rng:()=>0.4,cardMode:true});
 s.resources=pools();s.enemyResources=pools();
 // Prevent a critical/normal comparison from saturating a target's 100 HP.
 for(const unit of [...s.allies,...s.enemies]){unit.maxHp=1000;unit.hp=1000;unit.shield=0;unit.armor=0;unit.reduction=0;unit.invulnerable=0;}
 return s;
}
function attack(s,willSign="miragem"){
 const actor=s.allies[0],enemy=s.enemies[0],deck=s.cardCombat.decks[actor.id];
 const movement=setMovementPlan(s,"player",actor.id,{x:1,y:actor.position.y});
 assert.equal(movement.ok,true);
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
function submitAttack(s,sign="miragem"){
 const action=attack(s,sign);
 return submitDuelTurn(s,"player",[action],undefined,[],s.movementPlans.player);
}
test("both teams submit simultaneously: one commit does not execute or reveal its plan",()=>{
 const s=duel(),initial=s.enemies[0].hp;
 submitAttack(s);
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
 submitAttack(s,"miragem");
 submitDuelTurn(s,"enemy",[]);
 assert.equal(s.phase,"clash");
 assert.equal(s.clash.defenderSide,"enemy");
 const defender=publicBattle({battle:s},1),attacker=publicBattle({battle:s},0);
 assert.equal(defender.phase,"clash");
 assert.equal(defender.clash.willSign,undefined);
 assert.equal(attacker.phase,"waiting");
 assert.equal(attacker.clash.willSign,undefined);
 assert.throws(()=>answerDuelClash(s,"player","sombra"),/pendente/);
 answerDuelClash(s,"enemy","sombra");
 assert.equal(s.enemies[0].hp,oldHp);
 assert.equal(s.round,2);
 assert.equal(s.cardCombat.responses.enemy,1,"Response budget resets in new round");
 assert.equal(s.cardCombat.decks[s.allies[0].id].hand.filter(c=>c.kind==="movement").length,1);
 assert.equal(s.duelPlans.player,null);
});
test("losing a reply raises the damage over an identical ordinary strike",()=>{
 const ordinary=duel();
 submitAttack(ordinary,"miragem");
 submitDuelTurn(ordinary,"enemy",[]);
 assert.equal(ordinary.phase,"clash");
 answerDuelClash(ordinary,"enemy","pass");
 const normalDamage=ordinary.enemies[0].maxHp-ordinary.enemies[0].hp;

 const critical=duel();
 submitAttack(critical,"miragem");
 submitDuelTurn(critical,"enemy",[]);
 assert.equal(critical.phase,"clash");
 answerDuelClash(critical,"enemy","luz");
 const critDamage=critical.enemies[0].maxHp-critical.enemies[0].hp;
 assert.ok(critDamage>normalDamage, "Critical must exceed the normal damage");
});
test("invalid signs and duplicate response attempts do not spend a response",()=>{
 const s=duel();
 submitAttack(s);
 submitDuelTurn(s,"enemy",[]);
 assert.throws(()=>answerDuelClash(s,"enemy","sangue"),/inválida/);
 assert.equal(s.cardCombat.responses.enemy,1);
 answerDuelClash(s,"enemy","luz");
 assert.throws(()=>answerDuelClash(s,"enemy","sombra"),/pendente/);
});
test("movement collision cancels an out-of-range basic attack instead of hitting from a ghost position",()=>{
 const s=duel(),a=s.allies[0],b=s.enemies[0];
 a.position={x:1,y:2};b.position={x:3,y:2};
 assert.equal(setMovementPlan(s,"player",a.id,{x:2,y:2}).ok,true);
 assert.equal(setMovementPlan(s,"enemy",b.id,{x:2,y:2}).ok,true);
 assert.ok(getValidTargets(s,a,a.abilities.find(ability=>ability.id==="__basic_attack__")).some(target=>target.id===b.id));
 const initial=b.hp;
 submitDuelTurn(s,"player",[{actorId:a.id,abilityId:"__basic_attack__",targetId:b.id,willSign:"luz"}],undefined,[],s.movementPlans.player);
 submitDuelTurn(s,"enemy",[],undefined,[],s.movementPlans.enemy);
 assert.deepEqual(a.position,{x:1,y:2});
 assert.deepEqual(b.position,{x:3,y:2});
 assert.equal(b.hp,initial);
 assert.notEqual(s.phase,"clash");
 assert.equal(s.round,2);
});
test("legacy duel without card mode remains sequential",()=>{
 const s=createDuel([testCharacter.id],[testCharacter.id],{rng:()=>0.4});
 assert.equal(s.simultaneousDuel,undefined);
 assert.equal(s.turnSide,"player");
});
