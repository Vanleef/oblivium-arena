import test from 'node:test';
import assert from 'node:assert/strict';
import {characters} from '../src/data.js';
import {conquestAugmentCatalog,characterAugments,objectiveAugmentPool} from '../src/conquest-augments.js';
import {createTacticalBattle} from '../src/tactical-combat.js';
import {createTacticalRun,offerTacticalRewards} from '../src/tactical-run.js';
import {kingdomCatalog} from '../src/kingdoms.js';
import {tacticalRoster} from '../src/tactical-kits.js';

test('every offered damage, healing and protection magnitude is at least five, including alternate kits',()=>{
 const magnitudes=new Set(['damage','heal','shield','counter','dot','reduction','reduce','boost','regen']);
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

test('all trail reward magnitudes match their descriptions and obey the minimum across the next encounter',()=>{
 const healer=characters.find(c=>tacticalRoster.includes(c.id)&&c.abilities.some(a=>a.heal));
 const team=['o-acougueiro','o-escudo-vivo',healer.id],enemy=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
 const progress={completedKingdoms:kingdomCatalog.slice(0,8).map(k=>k.id)},s=createTacticalBattle(team,enemy,{fortress:true,augmentProgress:progress});
 s.phase='victory';s.tactical.stage='finished';
 const run=createTacticalRun(progress);run.rewardCount=99;
 const choices=offerTacticalRewards(run,s);
 assert.equal(choices.length,13);
 for(const choice of choices){
  if(choice.id==='leap')continue;
  const amount=Number(choice.text.match(/\d+/)?.[0]);
  assert.ok(amount>=5,choice.id);
  const next=createTacticalBattle(team,enemy,{fortress:true,fortressRewards:[choice.id]});
  if(choice.id==='purify')assert.ok(next.allies.every((u,i)=>u.armor-s.allies[i].armor===amount));
  else if(['shield','gold-ward'].includes(choice.id))assert.ok(next.allies.every(u=>u.shield===amount));
  else if(choice.id!=='heal'){
   const effects=next.tactical.augments.player;
   assert.ok(effects.length>0,choice.id);
   assert.ok(effects.every(a=>a.amount===amount),choice.id);
  }
 }
});
