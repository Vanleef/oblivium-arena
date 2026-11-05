import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {characterById} from '../src/data.js';
import {tacticalSpriteFrame,tacticalSkillAtlases} from '../src/tactical-sprites.js';
import {tacticalClipCoverage} from '../src/tactical-animation-coverage.js';

const forms=[['o-filho-da-cinza','impulso','rebirth'],['a-pira-errante','impulso','reply'],['o-devorador','impulso','starved'],['a-mao-que-toma','tecnica','open']];
test('the new skill variations use their own atlas rather than an idle or shared base fallback',async()=>{
 for(const [id,slot,key] of forms){
  const actor=characterById[id],ability=actor.abilities.find(a=>a.id===slot),form=ability.forms.find(f=>f.formKey===key);
  assert.ok(form);
  assert.equal(tacticalClipCoverage(actor,ability,form).atlasKind,'dedicated');
  const action=tacticalSpriteFrame(actor,{type:'skill',abilityId:slot,formKey:key,pose:'impact',index:4});
  const base=tacticalSpriteFrame(actor,{type:'skill',abilityId:slot,formKey:'base',pose:'impact',index:4});
  assert.notEqual(action.src,base.src);
  assert.deepEqual([action.sheetColumns,action.sheetRows],[3,2]);
  const bytes=await readFile(new URL('..'+tacticalSkillAtlases[id+'/'+slot+'/'+key].src,import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  const done=tacticalSpriteFrame(actor,{type:'skill',abilityId:slot,formKey:key,pose:'ready',index:7});
  assert.equal(done.clip,'idle');
 }
});
