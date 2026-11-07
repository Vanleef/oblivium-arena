import test from 'node:test';
import assert from 'node:assert/strict';
import {tacticalFeedback,tacticalTechniqueTone,tacticalAreaPhase} from '../src/tactical-feedback.js';

const event={
 type:'skill',pose:'impact',actorId:'caster',abilityId:'tecnica',
 cells:[{x:1,y:1},{x:2,y:1},{x:3,y:1},{x:4,y:1}],
 targets:['foe','friend','warded','stunned'],
 affectedTargetIds:['foe','friend','warded','stunned'],
 before:{
  positions:{caster:{x:0,y:1},foe:{x:1,y:1},friend:{x:2,y:1},warded:{x:3,y:1},stunned:{x:4,y:1},out:{x:0,y:0}},
  allies:[{id:'caster',hp:100,shield:0},{id:'friend',hp:42,shield:0},{id:'warded',hp:80,shield:3}],
  enemies:[{id:'foe',hp:63,shield:0},{id:'stunned',hp:68,shield:0,stunned:0},{id:'out',hp:20,shield:0}]
 },
 after:{
  positions:{caster:{x:0,y:1},foe:{x:1,y:1},friend:{x:2,y:1},warded:{x:3,y:1},stunned:{x:4,y:1},out:{x:0,y:0}},
  allies:[{id:'caster',hp:100,shield:0},{id:'friend',hp:60,shield:0},{id:'warded',hp:80,shield:9}],
  enemies:[{id:'foe',hp:39,shield:0},{id:'stunned',hp:68,shield:0,stunned:1},{id:'out',hp:15,shield:0}]
 }
};
test('damage, healing, shields and real applied statuses are read from replay snapshots',()=>{
 const display=tacticalFeedback(event);
 assert.deepEqual(display.map(x=>[x.actorId,x.kind,x.label]),[
  ['friend','heal','+18'],['warded','shield','+6 Escudo'],
  ['foe','damage','−24'],['stunned','status','ATORDOADO']
 ]);
 assert.equal(display.some(x=>x.actorId==='out'),false,'unrelated outside target must not flash');
 assert.deepEqual(tacticalFeedback({...event,pose:'release'}),display,'resolved values can be inspected before contact without revealing live plans');
 assert.deepEqual(tacticalFeedback({...event,type:'move'}),[]);
 assert.deepEqual(tacticalFeedback({...event,skipped:true}),[]);
 assert.deepEqual(tacticalFeedback({...event,before:null}),[]);
});
test('shields lost without HP loss are visible and do not become fictitious damage',()=>{
 const after=structuredClone(event.after),before=structuredClone(event.before);
 before.allies.find(u=>u.id==='warded').shield=20;
 after.allies.find(u=>u.id==='warded').shield=8;
 assert.deepEqual(tacticalFeedback({...event,before,after}).filter(x=>x.actorId==='warded').map(x=>x.label),['−12 Escudo']);
});
test('visual cues reflect ability semantics and area phases, including reduced-motion use',()=>{
 const actor={realm:'Inferno'};
 assert.equal(tacticalTechniqueTone(actor,{name:'Chamas do Juízo'},event),'fire');
 assert.equal(tacticalTechniqueTone(actor,{name:'Corte Carmesim'},event),'blood');
 assert.equal(tacticalTechniqueTone(actor,{name:'Raiz Aprisionadora'},event),'nature');
 assert.equal(tacticalTechniqueTone(actor,{heal:10,target:'ally'},event),'heal');
 assert.equal(tacticalTechniqueTone(actor,{shield:8,target:'self'},event),'shield');
 assert.equal(tacticalTechniqueTone(actor,{name:'Maré de Raios'},event),'storm');
 assert.equal(tacticalAreaPhase({...event,pose:'windup'}),'preview');
 assert.equal(tacticalAreaPhase(event),'impact');
 assert.equal(tacticalAreaPhase({...event,pose:'recover'}),null);
 assert.equal(tacticalAreaPhase({...event,skipped:true}),null);
});
