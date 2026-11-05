import test from 'node:test';
import assert from 'node:assert/strict';
import {characters} from '../src/data.js';
import {conquestTechnique} from '../src/conquest-techniques.js';
import {fortressCooldown} from '../src/tactical-combat.js';
import {tacticalSpec} from '../src/tactical-kits.js';

test('all roster forms have legal no-resource combat values and a usable spatial pattern',()=>{
 let count=0;
 for(const actor of characters)for(const base of actor.abilities)for(const form of [base,...base.forms||[]]){
  const raw={...base,...form},original=JSON.stringify(raw),a=conquestTechnique(raw);
  assert.ok(tacticalSpec(actor,raw).pattern,actor.id+'/'+a.id);
  assert.ok(fortressCooldown(a)>=1&&fortressCooldown(a)<=5);
  assert.ok(!a.steal&&!a.drain&&!a.generateEssence&&!a.convertEssence);
  assert.ok((a.stun||0)<=1&&(a.combo?.stun||0)<=1);
  assert.ok((a.damage||0)<=26&&(a.counter||0)<=20);
  assert.equal(JSON.stringify(raw),original,'source definitions must remain intact');
  count++;
 }
 assert.ok(count>=689);
});
test('charge finishers and control pay for their secondary effects with cooldown',()=>{
 const burst=conquestTechnique({id:'burst',damage:25,perChargeDamage:10,combo:{bonusDamage:15},cooldown:1,target:'enemy'});
 assert.equal(burst.perChargeDamage,4);
 assert.equal(burst.combo.bonusDamage,8);
 assert.equal(fortressCooldown(burst),3);
 const control=conquestTechnique({id:'control',stun:2,cooldown:0,target:'enemy'});
 assert.equal(fortressCooldown(control),3);
 assert.equal(fortressCooldown({id:'fortress-basic',damage:12}),0);
});
test('regeneration, reactive damage and lifesteal retain identity within secondary budgets',()=>{
 const source={id:'mixed',target:'self',heal:10,regen:{heal:9,turns:4},lifesteal:.8,reactive:{damage:20,turns:4},missingHpHeal:{cap:30,amount:10,step:10}};
 const a=conquestTechnique(source);
 assert.deepEqual(a.regen,{heal:4,turns:2});
 assert.equal(a.reactive.damage,8);
 assert.equal(a.lifesteal,.4);
 assert.equal(a.missingHpHeal.cap,8);
 assert.ok(a.description.includes('Regenera 4 de Vida por 2'));
 assert.equal(source.regen.heal,9);
});
