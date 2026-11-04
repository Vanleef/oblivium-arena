import test from 'node:test';
import assert from 'node:assert/strict';
import {stat} from 'node:fs/promises';
import {tacticalSpriteFrame,tacticalSpriteInline} from '../src/tactical-sprites.js';

test('os seis combatentes têm quatro sequências corporais com preparação, execução e recuperação',async()=>{
 const ids=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo','o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
 const skills=['impulso','tecnica','voto','despertar'];
 for(const id of ids){
  const unit={id};
  const idle=tacticalSpriteFrame(unit);
  assert.equal(idle.row,0);
  assert.ok((await stat(new URL('..'+idle.src,import.meta.url))).size>1000);
  for(const [index,abilityId] of skills.entries()){
   const event={type:'skill',abilityId,formKey:'base',family:'slash'};
   const frames=['anticipate','windup','release','impact','followthrough','recover'].map(pose=>tacticalSpriteFrame(unit,{...event,pose}));
   assert.deepEqual(frames.map(frame=>frame.column),[0,1,2,3,4,5]);
   assert.ok(frames.every(frame=>frame.bodyClip&&frame.row===index+1&&frame.src===idle.src));
   assert.match(tacticalSpriteInline(frames[3]),/left:-300%!important/);
   assert.equal(tacticalSpriteFrame(unit,{...event,pose:'ready',index:8}).row,0);
   assert.equal(tacticalSpriteFrame(unit,{...event,pose:'impact',formKey:'unknown'}).row,0);
  }
 }
});
