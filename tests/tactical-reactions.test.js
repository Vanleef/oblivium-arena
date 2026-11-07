import test from 'node:test';
import assert from 'node:assert/strict';
import {tacticalReactiveBeats,tacticalReactiveJudge,tacticalReactiveOutcome,
 tacticalReactiveDamage,tacticalReactiveAI,tacticalReactiveCounterDamage}
 from '../src/tactical-reactions.js';

const actor={id:'hero',sourceId:'o-acougueiro'};
const technique={id:'tecnica',damage:30,target:'enemy'};
const beats=tacticalReactiveBeats(actor,technique,'strike');
const success=(action)=>({action,success:true,perfect:false});
const fail=(action)=>({action,success:false,perfect:false});
test('each three- or four-hit sequence has deterministic distinct attack telegraphs',()=>{
 const a=tacticalReactiveBeats(actor,technique,'strike');
 assert.deepEqual(a,beats);
 assert.equal(a.length,3);
 assert.equal(tacticalReactiveBeats(actor,{...technique,id:'voto'},'slash').length,4);
 assert.equal(tacticalReactiveBeats(actor,{...technique,id:'despertar'},'burst').length,4);
 for(const b of a){
  assert.ok(b.duration>=800&&b.duration<=1200);
  assert.ok(b.impactMs>400&&b.impactMs<b.duration);
 }
 assert.ok(new Set(a.map(b=>b.duration+'_'+b.impactMs)).size>=2,'non-identical timings replace metronome');
});
test('dodging is forgiving; parry demands a narrower contact window',()=>{
 const beat={duration:1000,impactMs:700,kind:'normal'};
 assert.equal(tacticalReactiveJudge(beat,'dodge',700).success,true);
 assert.equal(tacticalReactiveJudge(beat,'parry',700).success,true);
 assert.equal(tacticalReactiveJudge(beat,'dodge',850).success,true);
 assert.equal(tacticalReactiveJudge(beat,'parry',850).success,false);
 assert.equal(tacticalReactiveJudge(beat,'parry',780).success,true);
 assert.equal(tacticalReactiveJudge(beat,'parry',795).success,false);
 assert.equal(tacticalReactiveJudge(beat,'strike',700).success,true);
 assert.equal(tacticalReactiveJudge(beat,'strike',950).success,false);
 assert.equal(tacticalReactiveJudge(beat,'dodge',NaN).success,false);
});
test('ground sweep is telegraphed and responds only to the timed jump',()=>{
 const b={duration:1000,impactMs:700,kind:'sweep'};
 assert.equal(tacticalReactiveJudge(b,'dodge',700).success,false);
 assert.equal(tacticalReactiveJudge(b,'parry',700).success,false);
 assert.equal(tacticalReactiveJudge(b,'jump',700).success,true);
 assert.equal(tacticalReactiveJudge(b,'jump',980).success,false);
 assert.equal(tacticalReactiveJudge({...b,kind:'normal'},'jump',700).success,false);
 const fake=[{...b,index:1,total:3}];
 assert.deepEqual(tacticalReactiveOutcome({beats:fake,defenses:[success('jump')]}).avoidedBeats,[0]);
});
test('missed contacts hurt, timed dodge/parry fully avoid their OWN hits',()=>{
 const outcome=tacticalReactiveOutcome({beats,
  attacks:[success('strike'),success('strike'),success('strike')],
  defenses:[success('dodge'),fail('parry'),success('parry')]
 });
 assert.equal(outcome.attackHits,3);
 assert.equal(outcome.defenseHits,2);
 assert.deepEqual(outcome.avoidedBeats,[0,2]);
 assert.deepEqual(outcome.parryBeats,[2]);
 assert.equal(outcome.counter,false);
 assert.equal(tacticalReactiveDamage(30,outcome),13,'only unavoided middle contact remains');
 assert.equal(tacticalReactiveDamage(30,tacticalReactiveOutcome({beats,attacks:[],defenses:[]})),30);
 assert.equal(tacticalReactiveDamage(30,tacticalReactiveOutcome({beats,attacks:Array(3).fill(success('strike')),defenses:[]})),39);
});
test('full parry prevents damage and earns one physical counterattack',()=>{
 const response=tacticalReactiveOutcome({beats,
  attacks:[],defenses:Array(3).fill(success('parry'))});
 assert.equal(response.avoidedAll,true);
 assert.equal(response.counter,true);
 assert.equal(tacticalReactiveDamage(30,response),0);
 assert.equal(tacticalReactiveCounterDamage(30),7);
 assert.equal(tacticalReactiveCounterDamage(2),5);
 assert.equal(tacticalReactiveCounterDamage(100),12);
 assert.equal(tacticalReactiveOutcome({beats,defenses:[success('parry'),success('dodge'),success('parry')]}).counter,false);
});
test('clean parries followed by the mandatory jump can earn a finisher counter',()=>{
 const wave=[{...beats[0],kind:'normal'},{...beats[1],kind:'normal'},{...beats[2],kind:'sweep'}];
 const clean=tacticalReactiveOutcome({beats:wave,
  defenses:[success('parry'),success('parry'),success('jump')]});
 assert.equal(clean.counter,true);
 assert.equal(clean.avoidedAll,true);
 assert.equal(tacticalReactiveDamage(30,clean),0);
});
test('AI reaction policy is deterministic, bounded and cannot read hidden plans',()=>{
 const a=tacticalReactiveAI(beats,{side:'defense',round:3,actorId:'enemy',abilityId:'tecnica'});
 const b=tacticalReactiveAI(beats,{side:'defense',round:3,actorId:'enemy',abilityId:'tecnica'});
 assert.deepEqual(a,b);
 assert.equal(a.length,beats.length);
 assert.ok(a.every(beat=>beat.action==='dodge'||beat.action==='none'));
 assert.ok(tacticalReactiveAI(beats,{side:'attack',round:1,actorId:'enemy'})
  .every(beat=>beat.action==='strike'));
});
