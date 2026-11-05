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

test('resource reactions become bounded wards and show their trigger without mutating the original',()=>{
 const raw={id:'counter',target:'ally',counter:20,counterEffect:{drainEssence:{resource:'essence',amount:1},expose:1},reactive:{trigger:'support',turns:1,damage:5,drain:1}};
 const converted=conquestTechnique(raw);
 assert.equal(converted.counterEffect.drainEssence,null);
 assert.equal(converted.counterEffect.shieldBearer,3);
 assert.equal(converted.reactive.drain,0);
 assert.equal(converted.reactive.shieldSource,3);
 assert.ok(converted.description.includes('Após contra-atacar'));
 assert.ok(converted.description.includes('portador usar apoio'));
 assert.deepEqual(conquestTechnique(converted),converted,'rebalancing twice must not generate more shield');
 assert.equal(raw.reactive.drain,1);
 assert.equal(raw.counterEffect.drainEssence.amount,1);
});

test('counter resource conversion actually shields its bearer without changing either resource pool',async()=>{
 const {createTacticalBattle}=await import('../src/tactical-combat.js');
 const {resolveBoardTechnique}=await import('../src/combat.js');
 const s=createTacticalBattle(['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'],{fortress:true});
 const bearer=s.allies[0],enemy=s.enemies[0];
 for(const key of ['resources','enemyResources'])for(const id of Object.keys(s[key]))s[key][id]=0;
 const pools=JSON.stringify([s.resources,s.enemyResources]);
 bearer.counter=20;bearer.counterEffect=conquestTechnique({id:'counter',counterEffect:{drainEssence:{amount:1}}}).counterEffect;
 const oldShield=bearer.shield;
 resolveBoardTechnique(s,{side:'enemy',actorId:enemy.id,abilityId:'fortress-basic',formKey:'base',fortressCooldown:0},[bearer.id]);
 assert.equal(bearer.counter,0);
 assert.equal(bearer.shield,oldShield+3);
 assert.equal(JSON.stringify([s.resources,s.enemyResources]),pools);
});

test('harmful support trap grants its converted ward to the living caster',async()=>{
 const {triggerReactives}=await import('../src/combat-effects.js');
 const source={id:'caster',hp:100,shield:0},victim={id:'victim',hp:100,reactives:[]};
 victim.reactives.push({...conquestTechnique({id:'trap',reactive:{trigger:'support',turns:1,damage:5,drain:1}}).reactive,sourceId:source.id,harmful:true});
 const s={allies:[source],enemies:[victim]},reactions=[];
 triggerReactives(s,victim,'support',null,{reactions,hit:(u,n)=>(u.hp-=n,{dealt:n}),shield:(u,n)=>(u.shield+=n,n),log(){},transfer(){throw Error('Conquista reaction must not use a resource pool');}});
 assert.equal(source.shield,3);
 assert.equal(victim.hp,95);
 assert.equal(victim.reactives.length,0);
 assert.ok(reactions.some(r=>r.targetId===source.id&&r.shield===3));
});
