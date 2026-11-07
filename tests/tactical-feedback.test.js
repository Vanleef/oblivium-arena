import test from 'node:test';
import assert from 'node:assert/strict';
import {tacticalFeedback,tacticalTechniqueTone,tacticalAreaPhase,tacticalVisualCells} from '../src/tactical-feedback.js';

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

test('field hazards and encounter rewards show the real resulting damage and recovery',()=>{
 const storm={...event,type:'field-event',id:'storm',affectedTargetIds:[],targets:[]};
 const feedback=tacticalFeedback(storm);
 assert.ok(feedback.some(f=>f.actorId==='foe'&&f.kind==='damage'&&f.label==='−24'));
 assert.ok(feedback.some(f=>f.actorId==='friend'&&f.kind==='heal'&&f.label==='+18'));
 assert.equal(tacticalAreaPhase(storm),'impact');
 assert.equal(tacticalTechniqueTone(null,null,storm),'storm');
 const rewards={...event,type:'effects',cells:[],affectedTargetIds:[],targets:[]};
 assert.deepEqual(tacticalFeedback(rewards).filter(x=>x.kind==='heal').map(x=>x.label),['+18']);
 assert.equal(tacticalAreaPhase(rewards),'impact');
 assert.equal(tacticalAreaPhase({...rewards,pose:'ready'}),null);
});

test('new boons, marks and afflictions appear as resolved feedback without repeating ongoing effects',()=>{
 const before=structuredClone(event.before),after=structuredClone(event.after);
 const original=before.enemies.find(unit=>unit.id==='stunned');
 Object.assign(original,{stunned:1,boost:5,reduction:0,marks:{},dots:[]});
 const changed=after.enemies.find(unit=>unit.id==='stunned');
 Object.assign(changed,{stunned:1,boost:5,reduction:8,invulnerable:1,
  marks:{omen:{turns:2,label:'Alvo marcado'}},dots:[{skillId:'bleed',sourceId:'caster',tag:'sangria',turns:3}]});
 const feedback=tacticalFeedback({...event,before,after}).filter(item=>item.actorId==='stunned');
 assert.deepEqual(feedback.map(item=>[item.kind,item.label]),[
  ['buff','INVULNERÁVEL'],['buff','REDUÇÃO DE DANO'],['status','MARCADO'],['status','AFLIÇÃO']
 ]);
 assert.ok(!feedback.some(item=>item.label==='DANO AUMENTADO'||item.label==='ATORDOADO'));
 const ongoing=structuredClone(after);
 ongoing.enemies.find(unit=>unit.id==='stunned').dots[0].turns=2;
 ongoing.enemies.find(unit=>unit.id==='stunned').marks.omen.turns=1;
 assert.deepEqual(tacticalFeedback({...event,before:after,after:ongoing}).filter(item=>item.actorId==='stunned'),[]);
});

test('support shields are not shown as healing and single-target contact is visible without a cells array',()=>{
 assert.equal(tacticalTechniqueTone({realm:'Limbo'},{target:'ally',shield:8},event),'shield');
 assert.equal(tacticalTechniqueTone({realm:'Limbo'},{target:'ally',name:'Sombras Protetoras'},event),'void');
 assert.equal(tacticalAreaPhase({...event,cells:[],pose:'impact'}),'impact');
 assert.equal(tacticalAreaPhase({...event,cells:[],targets:[],affectedTargetIds:[],pose:'impact'}),null);
 const result=tacticalFeedback({...event,cells:[]});
 assert.equal(result.find(item=>item.actorId==='foe')?.label,'−24');
});

test('single-target techniques telegraph resolved targets or the anchor even without motor area cells',()=>{
 const noArea={...event,cells:[]};
 assert.deepEqual(tacticalVisualCells(noArea),[{x:1,y:1},{x:2,y:1},{x:3,y:1},{x:4,y:1}]);
 assert.equal(tacticalAreaPhase({...noArea,pose:'windup'}),'preview');
 assert.deepEqual(tacticalVisualCells({...noArea,targets:[],affectedTargetIds:[],anchor:{x:5,y:5}}),[{x:5,y:5}]);
 assert.equal(tacticalAreaPhase({...noArea,targets:[],affectedTargetIds:[],anchor:{x:5,y:5},pose:'impact'}),'impact');
 assert.deepEqual(tacticalVisualCells({...noArea,skipped:true}),[]);
 assert.deepEqual(tacticalVisualCells({...noArea,type:'move'}),[]);
});
test('numbers follow a displaced unit at the impact snapshot rather than floating over its old tile',()=>{
 const after=structuredClone(event.after);
 after.positions.foe={x:5,y:4};
 const display=tacticalFeedback({...event,after}).find(x=>x.actorId==='foe'&&x.kind==='damage');
 assert.deepEqual(display.point,{x:5,y:4});
});

test('physical technique materials outrank vague energy keywords and preserve actual healing',()=>{
 const attacker={realm:'Limbo'};
 assert.equal(tacticalTechniqueTone(attacker,{name:'Fios de Memória',damage:12},event),'thread');
 assert.equal(tacticalTechniqueTone(attacker,{name:'Pilares de Mármore',damage:12},event),'stone');
 assert.equal(tacticalTechniqueTone(attacker,{name:'Vermes da Ruína',damage:12},event),'rot');
 assert.equal(tacticalTechniqueTone(attacker,{name:'Talho de Sangue',damage:12},event),'blood');
 assert.equal(tacticalTechniqueTone(attacker,{name:'Vermes da Ruína',heal:5},event),'heal');
});

test('an area-less skill reports only explicitly affected targets, not unrelated snapshot changes',()=>{
 const onlyTarget={...event,cells:[],affectedTargetIds:[],targets:['foe']};
 const actual=tacticalFeedback(onlyTarget);
 assert.deepEqual(actual.map(item=>[item.actorId,item.label]),[['foe','−24']]);
 const environment={...onlyTarget,type:'effects',targets:[],affectedTargetIds:[]};
 assert.ok(tacticalFeedback(environment).some(item=>item.actorId==='friend'),
  'unscoped world-effects snapshots may describe several affected characters');
});
