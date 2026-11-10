import test from 'node:test';
import assert from 'node:assert/strict';
import {tacticalCharacterMotifs,tacticalCharacterChoreography,drawTacticalCharacterImpact} from '../src/tactical-character-vfx.js';

const kinds=Object.values(tacticalCharacterMotifs);
test('nine combatants have distinct procedural physical motifs and all four technique slots',()=>{
 assert.equal(new Set(kinds).size,9);
 assert.deepEqual(Object.keys(tacticalCharacterMotifs).sort(),[
  'a-arquiteta-verde','a-praga-andante','a-rainha-dos-fungos','a-viuva-escarlate','nilo','o-acougueiro',
  'o-escudo-vivo','o-odio-encarnado','o-passo-interrompido'
 ].sort());
 for(const [id,kind] of Object.entries(tacticalCharacterMotifs)){
  const actor={id:'rival-0-'+id,sourceId:id};
  const profiles=['impulso','tecnica','voto','despertar'].map(abilityId=>
   tacticalCharacterChoreography(actor,{type:'skill',abilityId,formKey:'base'}));
  assert.deepEqual(profiles.map(m=>m.kind),[kind,kind,kind,kind]);
  assert.deepEqual(profiles.map(m=>m.weight),[.85,1,1.15,1.3]);
  assert.equal(tacticalCharacterChoreography(actor,{type:'move',abilityId:'tecnica'}),null);
  assert.equal(tacticalCharacterChoreography(actor,{type:'skill',abilityId:'tecnica',skipped:true}),null);
  assert.equal(tacticalCharacterChoreography(actor,{type:'skill',abilityId:'fortress-basic'}),null);
  assert.equal(tacticalCharacterChoreography(actor,{type:'skill',abilityId:'tecnica/awakened'}).slot,'tecnica');
  assert.equal(tacticalCharacterChoreography(actor,{type:'skill',abilityId:'voto/alt'}).slot,'voto');
  assert.equal(tacticalCharacterChoreography(actor,{type:'skill',abilityId:'tecnica-4'}).slot,'tecnica');
  assert.equal(tacticalCharacterChoreography(actor,{type:'skill',abilityId:'tecnica',formKey:'alt'}).weight,1.1);
  assert.equal(tacticalCharacterChoreography({...actor,bodyForm:'winged'},{type:'skill',abilityId:'tecnica'}).form,'alternate');
  assert.equal(tacticalCharacterChoreography(actor,{type:'skill',abilityId:'tecnica',bodyForm:'ruin'}).weight,1.1);
 }
 assert.equal(tacticalCharacterChoreography({id:'nonexistent'},{type:'skill',abilityId:'tecnica'}),null);
});

test('physical contact motifs render different geometry without changing combat state',()=>{
 for(const [id,kind] of Object.entries(tacticalCharacterMotifs)){
  const calls={fills:0,strokes:0,arcs:0};
  const ctx=new Proxy({
   fill(){calls.fills++;},stroke(){calls.strokes++;},ellipse(){calls.arcs++;}
  },{get:(target,key)=>target[key]||(()=>{})});
  const fx={
   choreography:tacticalCharacterChoreography({id},{type:'skill',abilityId:'tecnica'}),
   radius:24,color:['#fff','#d96','#522'],reaction:'damage'
  };
  assert.equal(fx.choreography.kind,kind);
  assert.equal(drawTacticalCharacterImpact(ctx,fx,.4),true,id);
  assert.ok(calls.fills+calls.strokes>0,id+' needs a drawn contact shape');
  assert.equal(drawTacticalCharacterImpact(ctx,{...fx,reaction:'heal'},.4),false,
   id+' keeps a legible universal healing indicator');
 }
 assert.equal(drawTacticalCharacterImpact({}, {radius:20,color:[]},.4),false);
});

test('each pilot character has four visibly different physical gestures, not only size changes',()=>{
 const poses=['impulso','tecnica','voto','despertar'];
 for(const id of Object.keys(tacticalCharacterMotifs)){
  const silhouettes=poses.map(abilityId=>{
   const path=[];
   const ctx=new Proxy({}, {get:(target,key)=>target[key]||((...args)=>{
    if(['moveTo','lineTo','quadraticCurveTo','bezierCurveTo','ellipse','arc','fill','stroke'].includes(key))
     path.push([key,...args.map(v=>typeof v==='number'?Math.round(v*100)/100:v)]);
   })});
   const choreography=tacticalCharacterChoreography({sourceId:id},{type:'skill',abilityId});
   assert.ok(choreography);
   assert.equal(drawTacticalCharacterImpact(ctx,{
    choreography,radius:24,color:['#fff','#b86','#422'],reaction:'damage'
   },.3),true);
   return JSON.stringify(path);
  });
  assert.equal(new Set(silhouettes).size,4,id+' needs four distinct material motion paths');
 }
});
