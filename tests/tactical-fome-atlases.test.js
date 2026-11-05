import test from 'node:test';
import assert from 'node:assert/strict';
import {characterById} from '../src/data.js';
import {tacticalAnimationFrames} from '../src/tactical-animation.js';
import {tacticalSpriteFrame,paintTacticalToken} from '../src/tactical-sprites.js';

const ids=['a-senhora-do-ultimo-pao','o-credor','a-balanca-vazia','o-apodrecido'];
test('new infernal atlases keep separate skill rows and restore the idle texture after each cast',()=>{
 for(const id of ids){
  const actor=characterById[id],idle=tacticalSpriteFrame(actor);
  for(const [index,ability] of actor.abilities.entries()){
   const frames=tacticalAnimationFrames(ability);
   const clips=frames.map(frame=>tacticalSpriteFrame(actor,{type:'skill',abilityId:ability.id,...frame}));
   assert.ok(clips.slice(0,-1).every(clip=>clip.row===index+2),id+'/'+ability.id);
   assert.ok(new Set(clips.slice(0,-1).map(clip=>clip.column)).size>=5);
   assert.deepEqual(clips.at(-1),idle);
   const properties={},image={src:'/old.webp',getAttribute(){return this.src;},style:{setProperty:(key,value)=>properties[key]=value}};
   const enemy={...actor,id:'enemy-'+id,sourceId:id};
   const token={dataset:{unitId:enemy.id},querySelector:()=>image,closest:()=>null,style:{setProperty:(key,value)=>properties[key]=value}};
   const event={type:'skill',actorId:enemy.id,abilityId:ability.id,orientation:[-1,0]};
   paintTacticalToken(token,enemy,event,frames.find(frame=>frame.pose==='impact'));
   assert.equal(image.src,idle.src);assert.equal(properties['--facing-sign'],-1);
   assert.equal(properties.top,`${-(index+2)*100}%`);
   paintTacticalToken(token,enemy,event,frames.at(-1));
   assert.equal(properties.top,'0%');assert.equal(properties.left,'0%');
  }
  const walking=['anticipate','launch','airborne','landing','settle'].map(pose=>tacticalSpriteFrame(actor,{type:'move',pose,index:0}));
  assert.ok(walking.every(clip=>clip.row===1));
  assert.equal(new Set(walking.map(clip=>clip.column)).size,5);
 }
});
