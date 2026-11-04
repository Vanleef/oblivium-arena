import test from 'node:test';
import assert from 'node:assert/strict';
import {tacticalImpactContacts,tacticalEffectResolution,TacticalEffectsLayer,tacticalParticleBudget} from '../src/tactical-effects-layer.js';

const cells=Array.from({length:54},(_,i)=>({x:i%9,y:Math.floor(i/9)}));
const allies=Array.from({length:6},(_,i)=>({id:'a'+i,hp:100,shield:10}));
const positions=Object.fromEntries(allies.map((unit,i)=>[unit.id,cells[i*9]]));
const before={width:9,height:6,allies,positions};
const after={...before,allies:allies.map((unit,i)=>({...unit,shield:i?10:0}))};
const impact={type:'skill',pose:'impact',family:'burst',actorId:'a0',before,after,cells,totalDamage:10,affectedTargetIds:allies.map(u=>u.id)};

test('a área inteira mantém efeitos fortes apenas nas unidades atingidas',()=>{
 assert.deepEqual(tacticalImpactContacts(impact),allies.map((unit,i)=>({point:positions[unit.id],heavy:i===0})));
 assert.deepEqual(tacticalImpactContacts({...impact,totalDamage:0,affectedTargetIds:[]}),[]);
 assert.deepEqual(tacticalImpactContacts({...impact,type:'guard',totalDamage:0,affectedTargetIds:[]}),[{point:positions.a0,heavy:false}]);
});

test('limita resolução e partículas e encerra a animação após o impacto',()=>{
 const size=tacticalEffectResolution(1920,1080,3);
 assert.ok(size.width*size.height<=900000);
 assert.deepEqual(tacticalEffectResolution(400,300,3),{width:600,height:450});
 const ctx=new Proxy({}, {get:(target,key)=>target[key]||(()=>{})});
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
