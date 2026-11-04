import test from 'node:test';
import assert from 'node:assert/strict';
import {orderTacticalActions} from '../src/tactical-order.js';
const battle=round=>({round,tactical:{firstSide:'player'},allies:[{id:'a'},{id:'b'},{id:'c'}],enemies:[{id:'x'},{id:'y'},{id:'z'}]});
test('first actions of all fighters precede every second action, irrespective of category',()=>{
 const refs=['c','a','c','b','a','b','z','x','z','y','x','y'].map((actorId,order)=>({actorId,order,type:order%2?'skill':'move',category:order%3}));
 const original=JSON.stringify(refs),out=orderTacticalActions(battle(1),refs);
 assert.deepEqual(out.map(x=>x.actorId),['a','x','b','y','c','z','a','x','b','y','c','z']);
 assert.deepEqual(out.map(x=>x.slot),[0,0,0,0,0,0,1,1,1,1,1,1]);
 assert.equal(JSON.stringify(refs),original);
 assert.ok(out.filter(x=>x.actorId==='a')[0].order<out.filter(x=>x.actorId==='a')[1].order);
});
test('initiative switches sides on even rounds',()=>{
 const refs=['a','x','b','y','c','z'].map((actorId,order)=>({actorId,order}));
 assert.deepEqual(orderTacticalActions(battle(2),refs).map(x=>x.actorId),['x','a','y','b','z','c']);
});
test('waiting fighters do not promote a second action into the first wave',()=>{
 const refs=[{actorId:'a',order:0},{actorId:'a',order:1},{actorId:'z',order:2}];
 const result=orderTacticalActions(battle(1),refs);
 assert.deepEqual(result.map(x=>[x.actorId,x.slot]),[['a',0],['z',0],['a',1]]);
});
