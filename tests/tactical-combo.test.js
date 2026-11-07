import test from 'node:test';
import assert from 'node:assert/strict';
import {tacticalComboBeats,tacticalComboEligible,tacticalComboResult,tacticalComboDamage,
 tacticalComboAIOpposition,tacticalComboReplayEvents} from '../src/tactical-combo.js';

const player={id:'hero',hp:100,shield:0,side:'player'};
const target={id:'foe',hp:100,shield:12,side:'enemy'};
const positions={hero:{x:1,y:1},foe:{x:2,y:1}};
const snapshot=(hp,shield=12,status=0)=>({
 allies:[{...player}],enemies:[{...target,hp,shield,stunned:status}],
 positions:JSON.parse(JSON.stringify(positions)),width:6,height:6
});
const base={type:'skill',actorId:'hero',abilityId:'tecnica',
 title:'Ritual da Lâmina',family:'slash',anchor:{x:2,y:1},
 before:snapshot(100),after:snapshot(73,0,1),targets:['foe'],affectedTargetIds:['foe'],
 cells:[{x:2,y:1}],combo:tacticalComboResult({attackHits:2,defenseHits:1})};

test('three-beat rhythm clash modifies direct damage only and clamps hostile scores',()=>{
 assert.equal(tacticalComboBeats,3);
 assert.deepEqual(tacticalComboResult({attackHits:0,defenseHits:0}),{attackHits:0,defenseHits:0,tempo:0,rate:1});
 assert.equal(tacticalComboDamage(20,{attackHits:3}),26);
 assert.equal(tacticalComboDamage(20,{defenseHits:3}),14);
 assert.equal(tacticalComboDamage(20,{attackHits:3,defenseHits:3}),20);
 assert.equal(tacticalComboDamage(20,{attackHits:999,defenseHits:-18}),26);
 assert.equal(tacticalComboDamage(20,{attackHits:2.5,defenseHits:1}),18);
 assert.equal(tacticalComboDamage(0,{attackHits:3}),0);
});

test('active clash is limited to real offensive techniques with valid targets',()=>{
 const ability={id:'tecnica',damage:15,target:'enemy'};
 assert.equal(tacticalComboEligible(player,ability,['foe']),true);
 assert.equal(tacticalComboEligible(player,{...ability,id:'voto'},['foe']),true);
 assert.equal(tacticalComboEligible(player,{...ability,id:'impulso'},['foe']),false);
 assert.equal(tacticalComboEligible(player,{...ability,id:'fortress-basic'},['foe']),false);
 assert.equal(tacticalComboEligible(player,{...ability,target:'self'},['foe']),false);
 assert.equal(tacticalComboEligible(player,{...ability,damage:0},['foe']),false);
 assert.equal(tacticalComboEligible(player,ability,[]),false);
 assert.equal(tacticalComboEligible({...player,hp:0},ability,['foe']),false);
});

test('AI response is deterministic and never needs hidden opponent plans or RNG',()=>{
 const input={round:3,actorId:'hero',abilityId:'tecnica'};
 assert.equal(tacticalComboAIOpposition(input),tacticalComboAIOpposition(input));
 assert.ok([1,2].includes(tacticalComboAIOpposition(input)));
 assert.ok([1,2].includes(tacticalComboAIOpposition({...input,round:4})));
});

test('multi-contact replay faithfully distributes existing HP and shield loss',()=>{
 const frozen=structuredClone(base),beats=tacticalComboReplayEvents(base);
 assert.equal(beats.length,3);
 assert.deepEqual(base,frozen,'replay must not mutate canonical event snapshots');
 assert.deepEqual(beats.map(b=>b.comboBeat),[1,2,3]);
 assert.deepEqual(beats.map(b=>b.comboTotal),[3,3,3]);
 assert.deepEqual(beats[0].before,base.before);
 assert.deepEqual(beats.at(-1).after,base.after);
 assert.equal(beats[0].after.enemies[0].stunned,0,'states must not appear before final blow');
 assert.equal(beats[1].after.enemies[0].stunned,0);
 assert.equal(beats.at(-1).after.enemies[0].stunned,1);
 for(let i=1;i<beats.length;i++)assert.deepEqual(beats[i-1].after,beats[i].before);
 const loss=beats.reduce((total,event)=>total+event.totalDamage,0);
 assert.equal(loss,(100-73)+(12-0));
 assert.ok(beats.every(event=>event.totalDamage>0));
});

test('ultimate releases have four impact contacts; basic/no damage has no fabricated hits',()=>{
 const ultimate=tacticalComboReplayEvents({...base,abilityId:'despertar'});
 assert.equal(ultimate.length,4);
 assert.equal(ultimate[0].comboBeat,1);
 assert.equal(ultimate.at(-1).comboBeat,4);
 assert.equal(tacticalComboReplayEvents({...base,combo:null}).length,1);
 assert.equal(tacticalComboReplayEvents({...base,after:base.before}).length,1);
 assert.equal(tacticalComboReplayEvents({...base,skipped:true}).length,1);
});
