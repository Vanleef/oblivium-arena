import test from 'node:test';
import assert from 'node:assert/strict';
import {tacticalDuelOptions,tacticalDuelResolve,tacticalDuelDamage,tacticalDuelAI}
 from '../src/tactical-duel.js';

const ids=tacticalDuelOptions.map(o=>o.id);
test('the three intentions form an exact non-transitive rock-paper-scissors triangle',()=>{
 assert.deepEqual(ids,['impeto','finta','contencao']);
 for(const attacker of ids){
  const results=ids.map(defender=>tacticalDuelResolve(attacker,defender)?.outcome).sort();
  assert.deepEqual(results,['clash','hit','miss'],attacker+' needs one win, one loss, one tie');
  assert.equal(tacticalDuelResolve(attacker,attacker).outcome,'clash');
 }
 assert.equal(tacticalDuelResolve('impeto','finta').outcome,'hit');
 assert.equal(tacticalDuelResolve('finta','contencao').outcome,'hit');
 assert.equal(tacticalDuelResolve('contencao','impeto').outcome,'hit');
 assert.equal(tacticalDuelResolve('finta','impeto').outcome,'miss');
 assert.equal(tacticalDuelResolve('contencao','finta').outcome,'miss');
 assert.equal(tacticalDuelResolve('impeto','contencao').outcome,'miss');
});
test('a special wins for full damage, clashes for half or misses with zero impact',()=>{
 const win=tacticalDuelResolve('impeto','finta');
 const draw=tacticalDuelResolve('impeto','impeto');
 const lose=tacticalDuelResolve('impeto','contencao');
 assert.equal(tacticalDuelDamage(27,win),27);
 assert.equal(tacticalDuelDamage(27,draw),14);
 assert.equal(tacticalDuelDamage(27,lose),0);
 assert.equal(tacticalDuelDamage(0,lose),0);
 assert.equal(tacticalDuelDamage(1,draw),1);
 assert.equal(tacticalDuelDamage(-7,draw),-7);
 assert.equal(win.hit,true);
 assert.equal(lose.hit,false);
});
test('invalid choices cannot count as successes or alter the outcome',()=>{
 assert.equal(tacticalDuelResolve('invalid','impeto'),null);
 assert.equal(tacticalDuelResolve('impeto','invalid'),null);
 assert.equal(tacticalDuelResolve('__proto__','impeto'),null);
 assert.equal(tacticalDuelResolve('',null),null);
 assert.equal(tacticalDuelDamage(17,undefined),17);
});
test('AI selection is sealed without looking at the human response',()=>{
 const scenario={round:4,actorId:'caster',targetId:'defender',abilityId:'voto',side:'defense'};
 const committed=tacticalDuelAI(scenario);
 assert.ok(ids.includes(committed));
 assert.equal(committed,tacticalDuelAI({...scenario}));
 for(const playerChoice of ids){
  assert.equal(tacticalDuelAI(scenario),committed);
  assert.ok(tacticalDuelResolve(playerChoice,committed));
 }
 assert.ok(new Set(Array.from({length:9},(_,i)=>tacticalDuelAI({...scenario,round:i+1}))).size>1);
});
test('all result UI labels describe the actual physical hit outcome',()=>{
 assert.equal(tacticalDuelResolve('finta','contencao').label,'ACERTO DECISIVO');
 assert.equal(tacticalDuelResolve('finta','finta').label,'CHOQUE DE VONTADES');
 assert.equal(tacticalDuelResolve('finta','impeto').label,'ESPECIAL EVITADO');
 for(const option of tacticalDuelOptions){
  assert.ok(option.name.length>0);
  assert.ok(option.hint.length>0);
  assert.ok(ids.includes(option.beats));
 }
});
