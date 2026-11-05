import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {characterById} from '../src/data.js';
import {tacticalAnimationFrames} from '../src/tactical-animation.js';
import {tacticalSpriteFrame,tacticalDirectionalAtlases,paintTacticalToken} from '../src/tactical-sprites.js';

test('six initial characters have separate front and rear frames for idle and every base technique',async()=>{
 assert.equal(Object.keys(tacticalDirectionalAtlases).length,6);
 for(const [id,atlas] of Object.entries(tacticalDirectionalAtlases)){
  const unit=characterById[id];
  const data=await readFile(new URL('..'+atlas.src,import.meta.url));
  assert.equal(data.toString('ascii',0,4),'RIFF');
  assert.equal(data.toString('ascii',8,12),'WEBP');
  for(const direction of [[0,-1],[0,1]]){
   const idle=tacticalSpriteFrame(unit,null,direction);
   const offset=direction[1]<0?0:5;
   assert.equal(idle.row,offset);
   assert.equal(idle.view,offset?'south':'north');
   assert.ok(idle.directional);
   for(const [index,abilityId] of ['impulso','tecnica','voto','despertar'].entries()){
    const ability=unit.abilities.find(a=>a.id===abilityId);
    const frames=tacticalAnimationFrames(ability);
    const sampled=frames.map(frame=>tacticalSpriteFrame(unit,{type:'skill',abilityId,...frame},direction));
    assert.ok(sampled.slice(0,-1).every(f=>f.src===atlas.src&&f.row===offset+index+1));
    assert.ok(new Set(sampled.slice(0,-1).map(f=>f.column)).size>=3);
    assert.equal(sampled.at(-1).row,offset);
    assert.ok(sampled.every(f=>f.column>=0&&f.column<atlas.columns&&f.row<10));
   }
  }
  const horizontal=tacticalSpriteFrame(unit,null,[-1,0]);
  assert.ok(!horizontal.directional);
  assert.ok(horizontal.src.includes('tactical-body-20261104'));
 }
});

test('directional casts change texture geometry atomically and do not mirror an authored rear view',()=>{
 const unit=characterById['o-acougueiro'],properties={};
 const sprite={style:{setProperty:(key,value)=>properties[key]=value},getAttribute:()=>'/old.webp'};
 const token={dataset:{unitId:unit.id},querySelector:()=>sprite,closest:()=>null,style:{setProperty:(key,value)=>properties[key]=value}};
 paintTacticalToken(token,unit,{actorId:unit.id,type:'skill',abilityId:'impulso',orientation:[-1,-1]},
  {family:'slash',pose:'impact',index:4});
 assert.equal(token.dataset.directional,'true');
 assert.equal(properties['--facing-sign'],1);
 assert.equal(properties.height,'1000%');
 assert.equal(properties.width,'600%');
 assert.equal(sprite.src,tacticalDirectionalAtlases[unit.id].src);
});
