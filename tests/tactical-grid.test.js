import test from "node:test";
import assert from "node:assert/strict";
import {
 GRID_WIDTH,GRID_HEIGHT,setupGrid,gridDistance,insideGrid,mirrorCell,
 movementChoices,validateMovementPlans,setMovementPlan,removeMovementPlan,
 isTargetInRange,resolveGridMoves,greedyMovement
} from "../src/tactical-grid.js";

function battle(){
 const s={allies:[0,1,2].map(i=>({id:"a"+i,name:"Alma "+i,side:"player",hp:100,stunned:0})),
  enemies:[0,1,2].map(i=>({id:"b"+i,name:"Rival "+i,side:"enemy",hp:100,stunned:0}))};
 setupGrid(s);return s;
}
test("compact battlefield starts with three playable rows on opposing edges",()=>{
 const b=battle();
 assert.deepEqual([GRID_WIDTH,GRID_HEIGHT],[5,5]);
 assert.deepEqual(b.allies.map(u=>u.position),[{x:0,y:1},{x:0,y:2},{x:0,y:3}]);
 assert.deepEqual(b.enemies.map(u=>u.position),[{x:4,y:1},{x:4,y:2},{x:4,y:3}]);
});
test("movement card can be planned and canceled without changing physical position",()=>{
 const b=battle(),u=b.allies[1],enemy=b.enemies[1],ability={target:"enemy",range:3};
 assert.equal(isTargetInRange(b,u,enemy,ability),false);
 assert.deepEqual(movementChoices(b,u),[{x:1,y:2}]);
 assert.equal(setMovementPlan(b,"player",u.id,{x:1,y:2}).ok,true);
 assert.deepEqual(u.position,{x:0,y:2});
 assert.equal(isTargetInRange(b,u,enemy,ability),true);
 removeMovementPlan(b,"player",u.id);
 assert.equal(isTargetInRange(b,u,enemy,ability),false);
});
test("move validator rejects teleporting, overlap, wall crossing and duplicates",()=>{
 const b=battle();
 for(const destination of [{x:2,y:2},{x:0,y:1},{x:-1,y:2},{x:1.2,y:2}]){
  assert.throws(()=>validateMovementPlans(b,"player",[{actorId:"a1",to:destination}]),/inválido/);
 }
 assert.throws(()=>validateMovementPlans(b,"player",[
  {actorId:"a1",to:{x:1,y:2}},{actorId:"a1",to:{x:1,y:3}}
 ]),/inválido/);
 assert.throws(()=>validateMovementPlans(b,"player",[{actorId:"b1",to:{x:3,y:2}}]),/inválido/);
});
test("two opposing moves into same destination collide and neither moves",()=>{
 const b=battle(),first=[
  {actorId:"a1",side:"player",to:{x:1,y:2}},
  {actorId:"b1",side:"enemy",to:{x:3,y:2}}
 ];
 assert.equal(resolveGridMoves(b,first).length,2);
 assert.deepEqual(b.allies[1].position,{x:1,y:2});
 const conflict=[
  {actorId:"a1",side:"player",to:{x:2,y:2}},
  {actorId:"b1",side:"enemy",to:{x:2,y:2}}
 ];
 assert.equal(resolveGridMoves(b,conflict).length,0);
 assert.deepEqual(b.allies[1].position,{x:1,y:2});
 assert.deepEqual(b.enemies[1].position,{x:3,y:2});
});
test("AI advances towards the closest opponent and cannot occupy allied cells",()=>{
 const b=battle(),moves=greedyMovement(b,"enemy");
 assert.equal(moves.length,3);
 const changes=resolveGridMoves(b,moves);
 assert.equal(changes.length,3);
 assert.ok(changes.every(({from,to})=>gridDistance(from,to)===1));
});
test("PvP mirrors tiles without changing canonical server positions",()=>{
 const b=battle();
 assert.deepEqual(mirrorCell(b.enemies[2].position),{x:0,y:3});
 assert.deepEqual(mirrorCell(mirrorCell({x:3,y:1})),{x:3,y:1});
 assert.equal(insideGrid({x:GRID_WIDTH,y:0}),false);
});
test("enemy plans do not leak their hidden move through range validation",()=>{
 const b=battle(),actor=b.allies[1],target=b.enemies[1];
 b.movementPlans.enemy=[{actorId:target.id,side:"enemy",to:{x:3,y:2}}];
 assert.equal(isTargetInRange(b,actor,target,{target:"enemy",range:3}),false);
 assert.equal(setMovementPlan(b,"player",actor.id,{x:1,y:2}).ok,true);
 assert.equal(isTargetInRange(b,actor,target,{target:"enemy",range:3}),true);
});
