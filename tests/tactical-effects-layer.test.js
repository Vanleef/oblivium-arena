import test from 'node:test';
import assert from 'node:assert/strict';
import {tacticalImpactContacts,tacticalEffectResolution,TacticalEffectsLayer,tacticalParticleBudget} from '../src/tactical-effects-layer.js';

const cells=Array.from({length:54},(_,i)=>({x:i%9,y:Math.floor(i/9)}));
const allies=Array.from({length:6},(_,i)=>({id:'a'+i,hp:100,shield:10}));
const positions=Object.fromEntries(allies.map((unit,i)=>[unit.id,cells[i*9]]));
const before={width:9,height:6,allies,positions};
const after={...before,allies:allies.map((unit,i)=>({...unit,shield:i?10:0}))};
const impact={type:'skill',pose:'impact',family:'burst',actorId:'a0',before,after,cells,totalDamage:10,affectedTargetIds:allies.map(u=>u.id)};

test('contatos distinguem dano, absorção, cura e proteção, com direção por alvo',()=>{
 const next={...after,allies:after.allies.map((unit,i)=>({
  ...unit,hp:i===1?80:100,shield:i===2?20:unit.shield
 }))};
 const old={...before,allies:allies.map((unit,i)=>({...unit,hp:i===3?70:100}))};
 const event={...impact,before:old,after:next};
 const contacts=tacticalImpactContacts(event);
 assert.deepEqual(contacts.map(c=>c.reaction),['block','damage','shield','heal','effect','effect']);
 assert.deepEqual(contacts[1],{id:'a1',point:positions.a1,reaction:'damage',x:0,y:1});
 const invulnerability={...next,allies:next.allies.map((unit,i)=>i===4?{...unit,invulnerable:1}:unit)};
 assert.equal(tacticalImpactContacts({...event,after:invulnerability})[4].reaction,'shield');
 assert.deepEqual(tacticalImpactContacts({...impact,affectedTargetIds:[]}),[]);
 assert.deepEqual(tacticalImpactContacts({...impact,pose:'travel'}),[]);
 assert.deepEqual(tacticalImpactContacts({...impact,skipped:true}),[]);
 assert.equal(tacticalImpactContacts({...impact,type:'guard',after:before,affectedTargetIds:[]})[0].reaction,'shield');
});

test('limita resolução e partículas e encerra a animação após o impacto',()=>{
 const size=tacticalEffectResolution(1920,1080,3);
 assert.ok(size.width*size.height<=900000);
 assert.deepEqual(tacticalEffectResolution(400,300,3),{width:600,height:450});
 const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}})}, {get:(target,key)=>target[key]||(()=>{})});
 const canvas={getContext:()=>ctx,dataset:{}};
 const board={clientWidth:900,clientHeight:600,append(node){node.parentElement=this;}};
 const saved=globalThis.requestAnimationFrame;
 try{
  globalThis.requestAnimationFrame=()=>1;
  const layer=new TacticalEffectsLayer(canvas);
  layer.emit(board,impact,allies[0],'impact',200);
  assert.equal(layer.effects.length,6);
  assert.ok(layer.effects.reduce((sum,fx)=>sum+fx.particles,0)<=tacticalParticleBudget);
  layer.tick(performance.now()+50);
  assert.equal(canvas.dataset.active,'true');
  layer.tick(performance.now()+250);
  assert.equal(layer.frame,0);
  assert.equal(canvas.dataset.active,'false');
  layer.emit(board,impact,allies[0],'impact',200,{reduced:true});
  assert.ok(layer.effects.every(fx=>fx.particles===0));
 }finally{globalThis.requestAnimationFrame=saved;}
});

test('eventos usam a camada compartilhada com efeitos limitados e respeitam movimento reduzido',()=>{
 const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}})}, {get:(target,key)=>target[key]||(()=>{})});
 const canvas={getContext:()=>ctx,dataset:{}};
 const board={clientWidth:900,clientHeight:600,append(node){node.parentElement=this;}};
 const saved=globalThis.requestAnimationFrame;
 try{
  globalThis.requestAnimationFrame=()=>1;
  const layer=new TacticalEffectsLayer(canvas);
  const event={type:'field-event',id:'storm',before,cells,strikes:cells.slice(0,2)};
  layer.emit(board,event,null,'impact',400,{reduced:true});
  assert.equal(layer.effects.length,0);
  layer.emit(board,event,null,'impact',400);
  assert.equal(layer.effects.filter(fx=>fx.kind==='thunder').length,2);
  assert.equal(layer.effects.length,8);
  layer.tick(performance.now()+100);
  layer.tick(performance.now()+450);
  assert.equal(layer.frame,0);
  layer.emit(board,{type:'exchange-move',closure:true,before,cells},null,'impact',400);
  assert.ok(layer.effects.length<=12);
  assert.ok(layer.effects.every(fx=>fx.kind==='falling-shards'));
 }finally{globalThis.requestAnimationFrame=saved;}
});

test('ritual, memory and cinder signatures reuse the shared particle budget',()=>{
 const ctx=new Proxy({}, {get:(target,key)=>target[key]||(()=>{})});
 const canvas={getContext:()=>ctx,dataset:{}};
 const board={clientWidth:900,clientHeight:600,append(node){node.parentElement=this;}};
 const saved=globalThis.requestAnimationFrame;
 try{
  globalThis.requestAnimationFrame=()=>1;
  for(const [id,signature] of [['o-falso-profeta','ritual'],['o-corretor-de-memorias','memory'],['o-incendiario','cinder'],['a-brasa-eterna','cinder'],['o-filho-da-cinza','cinder'],['a-pira-errante','cinder'],['o-coracao-em-furia','pulse'],['o-devorador','jaw'],['a-mao-que-toma','relic'],['o-estomago-sem-fundo','hunger'],['a-senhora-do-ultimo-pao','ration'],['o-credor','contract'],['a-balanca-vazia','contract'],['o-apodrecido','rot'],['o-corrupto','contract'],['o-medico-de-vermes','parasite'],['o-jardim-morto','root'],['a-porta-fechada','threshold']]){
   const layer=new TacticalEffectsLayer(canvas);
   layer.emit(board,impact,{...allies[0],sourceId:id},'impact',200);
   assert.ok(layer.effects.every(f=>f.signature===signature));
   assert.ok(layer.effects.reduce((n,f)=>n+f.particles,0)<=tacticalParticleBudget);
   layer.tick(performance.now()+80);
   layer.tick(performance.now()+250);
   assert.equal(layer.effects.length,0);
  }
 }finally{globalThis.requestAnimationFrame=saved;}
});

test('technique concepts use distinct contact colors and silhouettes within the particle budget',()=>{
 const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}})}, {get:(target,key)=>target[key]||(()=>{})});
 const canvas={getContext:()=>ctx,dataset:{}},board={clientWidth:540,clientHeight:360,append(node){node.parentElement=this;}};
 const saved=globalThis.requestAnimationFrame;
 try{
  globalThis.requestAnimationFrame=()=>1;
  for(const [name,tone,color] of [
   ['Chama do Fim','fire','#ff643b'],['Raio Celeste','storm','#b498ff'],
   ['Corte de Sangue','blood','#ed5875'],['Círculo de Raízes','nature','#91d68e'],
   ['Luz Divina','grace','#ecd588'],['Sombra Silenciosa','void','#a877e1'],
   ['Congelamento Final','frost','#a5e2fb'],
   ['Rochas da Ruína','stone','#bfa88a'],['Fios de Memória','thread','#ce96df'],
   ['Vermes da Podridão','rot','#a4ac63']
  ]){
   const layer=new TacticalEffectsLayer(canvas);
   const event={...impact,abilityId:'tecnica'};
   const actor={...allies[0],realm:'Limbo',abilities:[{id:'tecnica',name,damage:12}]};
   layer.emit(board,event,actor,'impact',280);
   assert.ok(layer.effects.length>0);
   assert.ok(layer.effects.every(fx=>fx.tone===tone),name);
   assert.ok(layer.effects.some(fx=>fx.color[1]===color),name+' semantic contact');
   assert.ok(layer.effects.some(fx=>fx.color[1]==='#8dd9ff'),name+' shield block keeps the shield palette');
   assert.ok(layer.effects.reduce((n,fx)=>n+fx.particles,0)<=tacticalParticleBudget);
   layer.tick(performance.now()+70);
   layer.tick(performance.now()+300);
  }
 }finally{globalThis.requestAnimationFrame=saved;}
});

test('explicit single-target impacts still animate when a self/target technique has no area cells',()=>{
 const single={...impact,cells:[],affectedTargetIds:['a1']};
 assert.deepEqual(tacticalImpactContacts(single).map(contact=>contact.id),['a1']);
 assert.deepEqual(tacticalImpactContacts({...single,affectedTargetIds:[]}),[]);
 assert.deepEqual(tacticalImpactContacts({...single,pose:'windup'}),[]);
});

test('displaced victims receive the contact at the landing tile, without extending the original impact area',()=>{
 const displaced={...after,positions:{...positions,a1:{x:4,y:4}}};
 const event={...impact,after:displaced,affectedTargetIds:['a1']};
 const contacts=tacticalImpactContacts(event);
 assert.equal(contacts.length,1);
 assert.deepEqual(contacts[0].point,{x:4,y:4});
 assert.deepEqual([contacts[0].x,contacts[0].y],[0,1],
  'force direction must follow the original point of impact');
 assert.deepEqual(tacticalImpactContacts({...event,cells:[{x:4,y:4}]}),[],
  'a displaced unit must not create a second hit outside the original area');
});
test('pilot actors own contact choreography without increasing the particle budget',()=>{
 const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}})}, {get:(target,key)=>target[key]||(()=>{})});
 const canvas={getContext:()=>ctx,dataset:{}},board={clientWidth:540,clientHeight:540,append(node){node.parentElement=this;}};
 const saved=globalThis.requestAnimationFrame;
 try{
  globalThis.requestAnimationFrame=()=>1;
  for(const [sourceId,kind] of [
   ['o-acougueiro','cleaver'],['a-viuva-escarlate','crimson'],
   ['o-escudo-vivo','bastion'],['o-passo-interrompido','stutter'],
   ['o-odio-encarnado','rage'],['a-arquiteta-verde','architect'],['nilo','memory']
  ]){
   const layer=new TacticalEffectsLayer(canvas);
   layer.emit(board,{...impact,abilityId:'tecnica'},{
    id:'a0',sourceId,realm:'Limbo',
    abilities:[{id:'tecnica',name:'Técnica',damage:12}]
   },'impact',300);
   assert.equal(layer.effects.length,6);
   assert.ok(layer.effects.every(fx=>fx.choreography?.kind===kind),sourceId);
   assert.ok(layer.effects.reduce((sum,fx)=>sum+fx.particles,0)<=tacticalParticleBudget);
   layer.tick(performance.now()+100);
   layer.tick(performance.now()+400);
  }
 }finally{globalThis.requestAnimationFrame=saved;}
});

test('an explicitly targeted hit survives an empty affectedTargetIds list',()=>{
 const event={...impact,cells:[],affectedTargetIds:[],targets:['a2']};
 assert.deepEqual(tacticalImpactContacts(event).map(contact=>contact.id),['a2']);
});

test('melee techniques generate a directional contact flash and material fragments within the VFX budget',()=>{
 const calls={fill:0,stroke:0,ellipse:0};
 const ctx=new Proxy({fill(){calls.fill++;},stroke(){calls.stroke++;},ellipse(){calls.ellipse++;}},
  {get:(target,key)=>target[key]||(()=>{})});
 const canvas={getContext:()=>ctx,dataset:{}};
 const board={clientWidth:540,clientHeight:360,append(node){node.parentElement=this;}};
 const event={...impact,affectedTargetIds:['a1'],abilityId:'tecnica',
  after:{...after,allies:after.allies.map(unit=>unit.id==='a1'?{...unit,hp:62}:unit)}};
 const actor={...allies[0],realm:'Inferno',sourceId:'o-acougueiro',
  abilities:[{id:'tecnica',name:'Talho do Açougue',damage:38}]};
 const prior=globalThis.requestAnimationFrame;
 try{
  globalThis.requestAnimationFrame=()=>1;
  for(const family of ['slash','strike','pierce']){
   const layer=new TacticalEffectsLayer(canvas);
   layer.emit(board,{...event,family},actor,'impact',460);
   assert.equal(layer.effects.length,1);
   assert.equal(layer.effects[0].melee,true,family+' is physical contact');
   assert.ok(layer.effects[0].power>1,'impact strength follows resolved damage');
   assert.ok(layer.effects[0].particles>0);
   assert.ok(layer.effects[0].particles<=tacticalParticleBudget);
   const before={...calls};layer.tick(performance.now()+30);
   assert.ok(calls.fill>before.fill,family+' produces substantial bright shards');
   assert.ok(calls.stroke>before.stroke,family+' has a thick close-range shock arc');
  }
  const ranged=new TacticalEffectsLayer(canvas);
  ranged.emit(board,{...event,family:'projectile'},actor,'impact',460);
  assert.equal(ranged.effects[0].melee,false);
  const reduced=new TacticalEffectsLayer(canvas);
  reduced.emit(board,{...event,family:'slash'},actor,'impact',35,{reduced:true});
  assert.equal(reduced.effects[0].particles,0);
 }finally{globalThis.requestAnimationFrame=prior;}
});
test('melee release follows the physical attack arc, while protective support does not swing',()=>{
 const ctx=new Proxy({}, {get:(target,key)=>target[key]||(()=>{})});
 const canvas={getContext:()=>ctx,dataset:{}},board={clientWidth:540,clientHeight:360,append(node){node.parentElement=this;}};
 const before=globalThis.requestAnimationFrame;
 try{
  globalThis.requestAnimationFrame=()=>1;
  const actor={...allies[0],abilities:[]};
  const blade=new TacticalEffectsLayer(canvas);
  blade.emit(board,{...impact,family:'slash',pose:'release',anchor:{x:0,y:1}},actor,'release',115);
  assert.equal(blade.effects[0].kind,'swing');
  assert.equal(blade.effects[0].melee,true);
  const guard=new TacticalEffectsLayer(canvas);
  guard.emit(board,{...impact,family:'support',pose:'release'},actor,'release',115);
  assert.equal(guard.effects[0].melee,false);
 }finally{globalThis.requestAnimationFrame=before;}
});

test('projectile travel shows substantial physical fragments, not a single thin beam',()=>{
 const calls={fills:0,strokes:0};
 const ctx=new Proxy({fill(){calls.fills++;},stroke(){calls.strokes++;}},
  {get:(target,key)=>target[key]||(()=>{})});
 const canvas={getContext:()=>ctx,dataset:{}};
 const board={clientWidth:540,clientHeight:360,append(node){node.parentElement=this;}};
 const saved=globalThis.requestAnimationFrame;
 try{
  globalThis.requestAnimationFrame=()=>1;
  const actor={...allies[0],realm:'Inferno',abilities:[{id:'tecnica',name:'Projeção material'}]};
  for(const projectile of ['ember','glass','shard']){
   const layer=new TacticalEffectsLayer(canvas);
   layer.emit(board,{...impact,actorId:'a0',abilityId:'tecnica',anchor:{x:5,y:4}},actor,'travel',300,{projectile});
   assert.equal(layer.effects.length,1);
   assert.equal(layer.effects[0].kind,'travel');
   const before=calls.fills;
   layer.tick(performance.now()+130);
   assert.ok(calls.fills-before>=4,projectile+' must draw multiple physical pieces');
  }
  const ritual=new TacticalEffectsLayer(canvas);
  ritual.emit(board,{...impact,actorId:'a0',anchor:{x:5,y:4}},actor,'travel',300,{projectile:'thread'});
  const before=calls.strokes;
  ritual.tick(performance.now()+120);
  assert.ok(calls.strokes-before>=3,'thread has material thickness and a tied head');
  const reduced=new TacticalEffectsLayer(canvas);
  reduced.emit(board,{...impact,anchor:{x:5,y:4}},actor,'travel',35,{projectile:'ember',reduced:true});
  assert.equal(reduced.effects.length,0,'reduced motion should not animate projectile travel');
 }finally{globalThis.requestAnimationFrame=saved;}
});
