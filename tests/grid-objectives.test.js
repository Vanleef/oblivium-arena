import test from "node:test";
import assert from "node:assert/strict";
import {setupGrid,gridDistance,resolveGridMoves,mirrorCell} from "../src/tactical-grid.js";
import {createCardState,applyCardUpgrades} from "../src/card-combat.js";
import {campaignObjectiveTier,eligibleObjectivePairs,spawnGridObjectives,collectGridObjectives,OBJECTIVE_INTERVAL} from "../src/grid-objectives.js";
import {publicBattle} from "../server/arena-service.js";

const make=()=>{
 const mk=(side,id)=>({id,side,name:id,hp:100,stunned:0,
  abilities:[{id:"strike",name:"Golpe",damage:10,target:"enemy"},{id:"mend",name:"Amparo",heal:10,target:"ally"}]});
 const b={allies:[0,1,2].map(i=>mk("player","a"+i)),enemies:[0,1,2].map(i=>mk("enemy","b"+i)),round:1,objectiveTier:"silver",phase:"player",log:[],worldEvents:[],
  essenceDraws:{player:[],enemy:[]},resources:{},enemyResources:{}};
 setupGrid(b);
 b.cardCombat=createCardState([...b.allies,...b.enemies],{rng:()=>0.2});
 return b;
};
test("objective pair is mirrored, same-tier and at least three tiles from each own soul",()=>{
 const b=make();const pairs=eligibleObjectivePairs(b);
 assert.ok(pairs.length);
 const result=spawnGridObjectives(b,()=>0.2);
 assert.equal(result.length,2);
 const a=result.find(o=>o.side==="player"),e=result.find(o=>o.side==="enemy");
 assert.deepEqual({x:e.x,y:e.y},{x:4-a.x,y:4-a.y});
 assert.equal(a.tier,"silver");
 assert.equal(e.tier,a.tier);
 assert.ok(Math.min(...b.allies.map(u=>gridDistance(u.position,a)))>=3);
 assert.ok(Math.min(...b.enemies.map(u=>gridDistance(u.position,e)))>=3);
});
test("claim applies an immediate battle-local card upgrade, never a permanent loadout change",()=>{
 const b=make(),own=spawnGridObjectives(b,()=>0)[0],actor=b.allies[0];
 const before=JSON.stringify(actor.abilities),other=b.gridObjectives[1];
 const occupied=new Set([...b.allies.slice(1),...b.enemies].map(u=>u.position.x+":"+u.position.y));
 const adjacent=[{x:own.x-1,y:own.y},{x:own.x+1,y:own.y},{x:own.x,y:own.y-1},{x:own.x,y:own.y+1}].find(p=>p.x>=0&&p.x<5&&p.y>=0&&p.y<5&&!occupied.has(p.x+":"+p.y));
 assert.ok(adjacent);
 actor.position=adjacent;
 const moves=resolveGridMoves(b,[{actorId:actor.id,side:"player",to:{x:own.x,y:own.y}}]);
 assert.equal(moves.length,1);
 const claims=collectGridObjectives(b,moves);
 assert.equal(claims.length,1);
 assert.equal(claims[0].side,"player");
 assert.equal(claims[0].reward.upgrades.length,1);
 assert.deepEqual(claims[0].reward.upgrades,["damage"]);
 const card=[...b.cardCombat.decks[actor.id].draw,...b.cardCombat.decks[actor.id].hand].find(c=>c.id===claims[0].reward.cardId);
 assert.ok(card);
 assert.equal(applyCardUpgrades(actor.abilities[0],card.upgrades).damage,15);
 assert.equal(b.gridObjectives.length,1);
 assert.equal(b.gridObjectives[0].side,other.side);
 assert.equal(JSON.stringify(actor.abilities),before);
});
test("campaign tier unlocks from completed kingdoms; ranked default stays silver",()=>{
 assert.equal(campaignObjectiveTier({}),"silver");
 assert.equal(campaignObjectiveTier({completedElos:["1","2","3","4"]}),"silver");
 assert.equal(campaignObjectiveTier({completedElos:["1","2","3","4","5"]}),"gold");
 assert.equal(campaignObjectiveTier({eloProgress:Object.fromEntries(Array.from({length:12},(_,i)=>["e"+i,{wins:1}]))}),"prismatic");
 const b=make();delete b.objectiveTier;
 assert.equal(spawnGridObjectives(b,()=>0)[0].tier,"silver");
});
test("gold and prismatic rewards offer stronger upgrades, while support receives Vigor",()=>{
 for(const [tier,expected] of [["silver",["damage"]],["gold",["damage","bleed"]],["prismatic",["damage","fire","retain"]]]){
  const b=make();b.objectiveTier=tier;const [o]=spawnGridObjectives(b,()=>0);
  const unit=b.allies[0];
  unit.position={x:o.x,y:o.y};
  const claim=collectGridObjectives(b,[{actorId:unit.id,side:"player",to:{x:o.x,y:o.y}}]);
  assert.deepEqual(claim[0].reward.upgrades,expected);
  const card=[...b.cardCombat.decks[unit.id].draw,...b.cardCombat.decks[unit.id].hand,...b.cardCombat.decks[unit.id].discard].find(c=>c.id===claim[0].reward.cardId);
  assert.deepEqual(card.upgrades,expected);
 }
 const b=make();b.objectiveTier="prismatic";
 const [o]=spawnGridObjectives(b,()=>0),unit=b.allies[0];
 // No offensive cards for this unit: its support ability gains Vigor and Preserve.
 b.cardCombat.decks[unit.id].draw=b.cardCombat.decks[unit.id].draw.filter(c=>c.abilityId==="mend");
 b.cardCombat.decks[unit.id].discard=[];
 unit.position={x:o.x,y:o.y};
 const [claimed]=collectGridObjectives(b,[{actorId:unit.id,side:"player",to:{x:o.x,y:o.y}}]);
 assert.deepEqual(claimed.reward.upgrades,["vigor","vigor","retain"]);
 const skill=applyCardUpgrades(unit.abilities[1],claimed.reward.upgrades);
 assert.equal(skill.heal,20);
});
test("pairs reappear only at four-turn event boundaries",()=>{
 const b=make(),pair=spawnGridObjectives(b,()=>0).map(o=>({...o}));
 assert.equal(OBJECTIVE_INTERVAL,4);
 b.round=2;
 assert.deepEqual(spawnGridObjectives(b,()=>0.5),pair);
 b.round=5;
 const next=spawnGridObjectives(b,()=>0.5);
 assert.equal(next.length,2);
 assert.ok(next.every(o=>o.round===5));
});
test("enemy objective is absent from each ranked client's public battle snapshot",()=>{
 const b=make();spawnGridObjectives(b,()=>0);
 b.simultaneousDuel=true;b.duelPlans={player:null,enemy:null};
 b.cardCombat.responses={player:1,enemy:1};
 const one=publicBattle({battle:b},0),two=publicBattle({battle:b},1);
 assert.equal(one.gridObjectives.length,1);
 assert.equal(two.gridObjectives.length,1);
 assert.equal(one.gridObjectives[0].side,"player");
 assert.equal(two.gridObjectives[0].side,"player");
 const source=b.gridObjectives.find(o=>o.side==="enemy");
 assert.deepEqual({x:two.gridObjectives[0].x,y:two.gridObjectives[0].y},mirrorCell(source));
 assert.equal(b.gridObjectives.length,2,"Authoritative state must remain unchanged");
});
