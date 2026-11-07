import test from 'node:test';
import assert from 'node:assert/strict';
import {tacticalDuelOptions,tacticalDuelResolve,tacticalDuelDamage,tacticalDuelAI,tacticalDuelTendency}
 from '../src/tactical-duel.js';

const ids=tacticalDuelOptions.map(o=>o.id);
test('the three intentions form an exact non-transitive rock-paper-scissors triangle',()=>{
 assert.deepEqual(ids,['miragem','luz','sombra']);
 for(const attacker of ids){
  const results=ids.map(defender=>tacticalDuelResolve(attacker,defender)?.outcome).sort();
  assert.deepEqual(results,['clash','hit','miss'],attacker+' needs one win, one loss, one tie');
  assert.equal(tacticalDuelResolve(attacker,attacker).outcome,'clash');
 }
 assert.equal(tacticalDuelResolve('miragem','luz').outcome,'hit');
 assert.equal(tacticalDuelResolve('luz','sombra').outcome,'hit');
 assert.equal(tacticalDuelResolve('sombra','miragem').outcome,'hit');
 assert.equal(tacticalDuelResolve('luz','miragem').outcome,'miss');
 assert.equal(tacticalDuelResolve('sombra','luz').outcome,'miss');
 assert.equal(tacticalDuelResolve('miragem','sombra').outcome,'miss');
});
test('a special wins for full damage, clashes for half or misses with zero impact',()=>{
 const win=tacticalDuelResolve('miragem','luz');
 const draw=tacticalDuelResolve('miragem','miragem');
 const lose=tacticalDuelResolve('miragem','sombra');
 assert.equal(tacticalDuelDamage(27,win),41);
 assert.equal(tacticalDuelDamage(27,draw),14);
 assert.equal(tacticalDuelDamage(27,lose),0);
 assert.equal(tacticalDuelDamage(0,lose),0);
 assert.equal(tacticalDuelDamage(1,draw),1);
 assert.equal(tacticalDuelDamage(-7,draw),-7);
 assert.equal(win.hit,true);
 assert.equal(win.damageRate,1.5);
 assert.equal(draw.damageRate,0.5);
 assert.equal(lose.damageRate,0);
 assert.equal(lose.hit,false);
});
test('invalid choices cannot count as successes or alter the outcome',()=>{
 assert.equal(tacticalDuelResolve('invalid','miragem'),null);
 assert.equal(tacticalDuelResolve('miragem','invalid'),null);
 assert.equal(tacticalDuelResolve('__proto__','miragem'),null);
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
 assert.equal(tacticalDuelResolve('luz','sombra').label,'ACERTO DECISIVO');
 assert.equal(tacticalDuelResolve('luz','luz').label,'CHOQUE DE VONTADES');
 assert.equal(tacticalDuelResolve('luz','miragem').label,'ESPECIAL EVITADO');
 for(const option of tacticalDuelOptions){
  assert.ok(option.name.length>0);
  assert.ok(option.hint.length>0);
  assert.ok(ids.includes(option.beats));
 }
});

test('distinct character personalities give imperfect but actionable strategy clues',()=>{
 assert.equal(tacticalDuelTendency({sourceId:'o-acougueiro'}),'miragem');
 assert.equal(tacticalDuelTendency({sourceId:'a-viuva-escarlate'}),'luz');
 assert.equal(tacticalDuelTendency({sourceId:'o-escudo-vivo'}),'sombra');
 const sample=Array.from({length:28},(_,round)=>tacticalDuelAI({
  round,actorId:'o-escudo-vivo',targetId:'hero',abilityId:'tecnica',
  side:'defense',tendency:'sombra'
 }));
 assert.ok(sample.filter(choice=>choice==='sombra').length>=10);
 assert.ok(sample.some(choice=>choice!=='sombra'),'a tendency must never reveal the actual choice');
});
