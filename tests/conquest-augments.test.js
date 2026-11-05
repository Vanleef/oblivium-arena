import test from 'node:test';
import assert from 'node:assert/strict';
import {createTacticalBattle,chooseTacticalChestReward,rerollTacticalChestReward} from '../src/tactical-combat.js';
import {conquestAugmentCatalog,characterAugments,conquestAugmentPool,conquestOfferTier,conquestOfferOptions,conquestAugmentedAbility} from '../src/conquest-augments.js';
import {conquestTechnique} from '../src/conquest-techniques.js';
import {addTacticalAugment,triggerTacticalAugments} from '../src/tactical-chests.js';
import {createTacticalRun,offerTacticalRewards,advanceTacticalRun} from '../src/tactical-run.js';

const allies=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
const enemies=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
const make=(victories=0,spins=0)=>createTacticalBattle(allies,enemies,{fortress:true,augmentProgress:{victories,spins}});
const offerFor=(s,tier='silver')=>{
 const offer={id:'test-offer',side:'player',actorId:s.allies[0].id,fortress:true,tier,rerolls:0};
 offer.options=conquestOfferOptions(s,offer);
 s.tactical.pendingChestRewards=[offer];s.tactical.stage='reward';
 return offer;
};
test('catalogue expands past fifty, tiers unlock with progress and signatures match the owner',()=>{
 assert.ok(conquestAugmentCatalog.length>=50);
 const s=make(),actor=s.allies[0];
 for(let sequence=0;sequence<200;sequence++)assert.equal(conquestOfferTier(s,'player',actor,sequence),'silver');
 assert.deepEqual(conquestAugmentPool(s,'player',actor,'gold'),[]);
 s.tactical.fortress.progress.victories=8;
 const tiers=new Set(Array.from({length:300},(_,i)=>conquestOfferTier(s,'player',actor,i)));
 assert.deepEqual(tiers,new Set(['silver','gold','prismatic']));
 const pool=conquestAugmentPool(s,'player',actor,'gold');
 assert.ok(pool.some(o=>o.characterId===actor.id));
 assert.ok(pool.every(o=>!o.characterId||o.characterId===actor.id));
 assert.ok(!pool.some(o=>o.id==='deep-heal'));
 assert.ok(characterAugments(actor).every(o=>actor.abilities.some(a=>a.id===o.effect.abilityId)));
});
test('reroll charges exactly once, changes all three choices, keeps tier and rejects stale or empty currency',()=>{
 const s=make(0,2),offer=offerFor(s),old=offer.options.map(o=>o.id);
 const result=rerollTacticalChestReward(s,offer.id);
 assert.ok(result.ok);assert.equal(result.spins,1);
 assert.equal(result.offer.tier,'silver');
 assert.equal(result.offer.options.length,3);
 assert.ok(result.offer.options.every(o=>!old.includes(o.id)));
 const rejected=chooseTacticalChestReward(s,offer.id,old[0]);
 assert.equal(rejected.ok,false);
 assert.equal(rerollTacticalChestReward(s,'stale').ok,false);
 assert.equal(s.tactical.fortress.progress.spins,1);
 s.tactical.fortress.progress.spins=0;
 const before=JSON.stringify(offer.options);
 assert.equal(rerollTacticalChestReward(s,offer.id).ok,false);
 assert.equal(JSON.stringify(offer.options),before);
});
test('a permanent augment affects only its owner and signature technique, without duplicating another owner',()=>{
 const s=make(8),actor=s.allies[0],other=s.allies[1];
 const effect={type:'conquest-augment',id:'unique',trigger:'modify',stat:'damage',amount:4,abilityId:actor.abilities[0].id};
 addTacticalAugment(s,'player',{...effect,actorId:actor.id});
 addTacticalAugment(s,'player',{...effect,actorId:other.id});
 assert.equal(s.tactical.augments.player.length,2);
 const base=conquestTechnique(actor.abilities[0]);
 assert.equal(conquestAugmentedAbility(s,actor,base).damage,base.damage+4);
 const basic=actor.abilities.find(a=>a.id==='fortress-basic');
 assert.equal(conquestAugmentedAbility(s,actor,basic).damage,12);
 const allyBase=conquestTechnique(other.abilities.find(a=>a.id!==effect.abilityId)||other.abilities[0]);
 assert.equal(conquestAugmentedAbility(s,other,allyBase).damage,allyBase.damage);
});
test('movement procs are owner scoped, capped, once per round and respect healing block',()=>{
 const s=make(),actor=s.allies[0];actor.hp=50;actor.shield=0;
 addTacticalAugment(s,'player',{type:'conquest-augment',id:'march',actorId:actor.id,trigger:'move',stat:'heal',amount:3,title:'Marcha'});
 triggerTacticalAugments(s,'player',s.allies[1],'move');
 assert.equal(actor.hp,50);
 triggerTacticalAugments(s,'player',actor,'move');triggerTacticalAugments(s,'player',actor,'move');
 assert.equal(actor.hp,53);
 s.round++;actor.healingBlock=1;
 triggerTacticalAugments(s,'player',actor,'move');assert.equal(actor.hp,53);
});
test('campaign victories award one spin once, discovery grants another and progress carries over',()=>{
 const s=make(2,1),run=createTacticalRun();
 s.phase='victory';s.tactical.stage='finished';
 offerTacticalRewards(run,s);offerTacticalRewards(run,s);
 assert.deepEqual(run.augmentProgress,{victories:3,spins:2});
 const next=advanceTacticalRun(run,s,'discovery');
 assert.deepEqual(next.augmentProgress,{victories:3,spins:3});
 const again=advanceTacticalRun(run,s,'discovery');
 assert.deepEqual(again.augmentProgress,{victories:3,spins:3});
 const nextBattle=createTacticalBattle(next.player,next.enemy,{...next,fortress:true});
 assert.deepEqual(nextBattle.tactical.fortress.progress,next.augmentProgress);
});
test('balance caps direct control damage and afflictions without changing shared definitions',()=>{
 const ability={id:'test',target:'all-enemies',damage:55,stun:3,shield:40,dot:{damage:10,turns:5}};
 const result=conquestTechnique(ability);
 assert.equal(result.damage,18);assert.equal(result.stun,1);assert.equal(result.shield,12);
 assert.deepEqual(result.dot,{damage:4,turns:2});
 assert.equal(ability.damage,55);assert.equal(ability.dot.damage,10);
});
