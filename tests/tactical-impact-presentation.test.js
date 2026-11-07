import test from 'node:test';
import assert from 'node:assert/strict';
import {tacticalImpactProfile,tacticalContactRecoil,tacticalMobileParticleBudget} from '../src/tactical-impact-presentation.js';

const before={
 allies:[{id:'a',hp:100,shield:0,bodyForm:'base'}],
 enemies:[{id:'b',hp:80,shield:15,bodyForm:'base'}]
};
const after={
 allies:[{id:'a',hp:100,shield:0,bodyForm:'base'}],
 enemies:[{id:'b',hp:45,shield:0,bodyForm:'base'}]
};
const event={
 type:'skill',pose:'impact',family:'strike',abilityId:'tecnica',
 affectedTargetIds:['b'],before,after
};
test('resolved melee hits stop briefly according to physical type and real damage',()=>{
 const heavy=tacticalImpactProfile(event);
 assert.equal(heavy.melee,true);
 assert.equal(heavy.family,'strike');
 assert.equal(heavy.damage,50);
 assert.ok(heavy.hitstopMs>=46);
 const slash=tacticalImpactProfile({...event,family:'slash'});
 const pierce=tacticalImpactProfile({...event,family:'pierce'});
 assert.ok(heavy.hitstopMs>slash.hitstopMs);
 assert.ok(slash.hitstopMs>pierce.hitstopMs);
 assert.equal(tacticalImpactProfile({...event,family:'counter'}).melee,true);
 assert.ok(heavy.recoilPx>5);
 assert.equal(heavy.shake,'physical');
});
test('special, kill and transformed bodies receive longer impact pauses',()=>{
 const normal=tacticalImpactProfile(event);
 const vote=tacticalImpactProfile({...event,abilityId:'voto'});
 assert.ok(vote.special);
 assert.ok(vote.hitstopMs>normal.hitstopMs);
 assert.equal(vote.shake,'special');
 const dead={...after,enemies:[{...after.enemies[0],hp:0}]};
 const lethal=tacticalImpactProfile({...event,after:dead});
 assert.equal(lethal.finishing,true);
 assert.equal(lethal.shake,'heavy');
 const transformed={...after,allies:[{...after.allies[0],bodyForm:'awakened'}]};
 assert.equal(tacticalImpactProfile({...event,after:transformed}).special,true);
 const collateral={...event,affectedTargetIds:['a'],targets:[],after:dead};
 assert.equal(tacticalImpactProfile(collateral).finishing,true,
  'reactive knockouts not in explicit targets still require a decisive hitstop');
});
test('speed and reduced-motion cut hitstop without affecting resolved damage',()=>{
 const normal=tacticalImpactProfile(event);
 const fast=tacticalImpactProfile(event,{speed:3});
 const reduced=tacticalImpactProfile(event,{reduced:true});
 assert.equal(fast.hitstopMs,Math.round(normal.hitstopMs/3));
 assert.equal(reduced.hitstopMs,0);
 assert.equal(reduced.damage,normal.damage);
 assert.equal(reduced.shake,'none');
 assert.equal(tacticalImpactProfile({...event,pose:'travel'}),null);
 assert.equal(tacticalImpactProfile({...event,skipped:true}),null);
 assert.equal(tacticalImpactProfile({...event,type:'move'}),null);
});
test('responsive particle cap and recoil preserve legibility on mobile',()=>{
 assert.equal(tacticalMobileParticleBudget(180),10);
 assert.equal(tacticalMobileParticleBudget(300),14);
 assert.equal(tacticalMobileParticleBudget(450),22);
 assert.equal(tacticalMobileParticleBudget(800),36);
 assert.equal(tacticalMobileParticleBudget(800,{reduced:true}),0);
 const profile=tacticalImpactProfile(event);
 const contact={x:1,y:-1,reaction:'damage'};
 const desktop=tacticalContactRecoil(contact,profile);
 const mobile=tacticalContactRecoil(contact,profile,{mobile:true});
 assert.ok(Math.abs(mobile.x)<Math.abs(desktop.x));
 assert.ok(Math.abs(mobile.y)<Math.abs(desktop.y));
 assert.equal(mobile.family,'strike');
 assert.equal(tacticalContactRecoil(null,profile),null);
 assert.equal(tacticalContactRecoil(contact,null),null);
});
