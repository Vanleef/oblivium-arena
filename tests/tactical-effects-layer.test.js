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
  for(const [id,signature] of [['o-falso-profeta','ritual'],['o-corretor-de-memorias','memory'],['o-incendiario','cinder'],['a-brasa-eterna','cinder'],['o-filho-da-cinza','cinder'],['a-pira-errante','cinder'],['o-coracao-em-furia','pulse'],['o-devorador','jaw'],['a-mao-que-toma','relic'],['o-estomago-sem-fundo','hunger'],['a-senhora-do-ultimo-pao','ration'],['o-credor','contract'],['a-balanca-vazia','contract'],['o-apodrecido','rot']]){
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
