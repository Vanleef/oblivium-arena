import test from 'node:test';
import assert from 'node:assert/strict';
import {characters} from '../src/data.js';
import {conquestAugmentCatalog,characterAugments,objectiveAugmentPool} from '../src/conquest-augments.js';

test('every offered damage, healing and protection magnitude is at least five, including alternate kits',()=>{
 const magnitudes=new Set(['damage','heal','shield','counter','dot','reduction','boost']);
 for(const option of conquestAugmentCatalog){
  const e=option.effect;
  if(magnitudes.has(e.stat)||['heal','shield','shield-team','heal-team','reduction','restore','boost'].includes(e.type)){
   assert.ok(e.amount>=5,option.id);
   assert.ok(!/\b[1-4] de (?:dano|Vida|Escudo)/.test(option.text),option.id);
  }
 }
 for(const source of characters){
  const variants=[null,...source.abilities.flatMap(a=>(a.forms||[]).map(form=>({abilityId:a.id,form})))];
  for(const variant of variants){
   const actor={...source,side:'player',hp:100,abilities:[...source.abilities.map(a=>variant?.abilityId===a.id?{...a,...variant.form}:a),{id:'fortress-basic',name:'Ataque Básico',damage:12}]};
   for(const option of characterAugments(actor))assert.ok(option.effect.amount>=5,option.id);
   const state={tactical:{augments:{player:[],enemy:[]}}};
   const pools=['silver','gold','prismatic'].map(tier=>objectiveAugmentPool(state,'player',actor,tier));
   for(const pool of pools){assert.ok(pool.length>=3);for(const o of pool)assert.ok(o.effect.amount>=5,o.id);}
   for(const silver of pools[0]){
    const key=silver.id.slice(0,silver.id.lastIndexOf(':'));
    const gold=pools[1].find(o=>o.id.startsWith(key+':')),prism=pools[2].find(o=>o.id.startsWith(key+':'));
    assert.ok(gold.effect.amount>silver.effect.amount&&prism.effect.amount>gold.effect.amount,key);
   }
  }
 }
 // Timing and resource counters are not damage/heal/attribute magnitudes.
 assert.equal(conquestAugmentCatalog.find(o=>o.id==='refresh').effect.amount,1);
 assert.equal(conquestAugmentCatalog.find(o=>o.id==='charge-cast').effect.amount,1);
});
