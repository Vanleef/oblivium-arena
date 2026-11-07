import test from 'node:test';
import assert from 'node:assert/strict';
import {createTacticalBattle,submitTacticalPlan,resolveTacticalRound,startCompactRoundResolution} from '../src/tactical-combat.js';
import {resolveBoardReactiveCounter} from '../src/combat.js';

const player=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
const enemy=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
const prepared=(seed=9)=>{
 const battle=createTacticalBattle(player,enemy,{seed,compact:true,fortress:true});
 assert.equal(submitTacticalPlan(battle,'player',[]).ok,true);
 assert.equal(submitTacticalPlan(battle,'enemy',[]).ok,true);
 return battle;
};

test('staged compact resolution never reveals or executes before both teams confirm',()=>{
 const state=createTacticalBattle(player,enemy,{seed:5,compact:true,fortress:true});
 assert.equal(startCompactRoundResolution(state).ok,false);
 assert.equal(submitTacticalPlan(state,'player',[]).ok,true);
 assert.equal(startCompactRoundResolution(state).ok,false);
 assert.equal(submitTacticalPlan(state,'enemy',[]).ready,true);
 assert.equal(startCompactRoundResolution(state).ok,true);
});

test('staged empty-wave resolver preserves canonical compact outcome and effect order',()=>{
 const staged=prepared(11),canonical=prepared(11);
 const first=startCompactRoundResolution(staged);
 assert.equal(first.ok,true);
 assert.equal(first.events.length,1);
 assert.equal(first.events[0].type,'reveal');
 assert.equal(first.peek(),null,'no pending action before wave setup');
 const events=[...first.events],response=[];
 let closed=false;
 for(let i=0;i<16;i++){
  const next=first.next();
  assert.equal(next.ok,true,next.reason);
  events.push(...next.events);
  response.push(next.done);
  if(next.done){closed=true;break;}
 }
 assert.equal(closed,true,'the staged resolver must always terminate');
 assert.equal(first.next().ok,false,'closed resolutions cannot execute again');
 const base=resolveTacticalRound(canonical);
 assert.equal(base.ok,true);
 assert.equal(staged.round,canonical.round);
 assert.equal(staged.phase,canonical.phase);
 assert.equal(staged.tactical.stage,canonical.tactical.stage);
 assert.deepEqual(events.map(event=>event.type),base.events.map(event=>event.type));
 assert.deepEqual(staged.allies.map(unit=>[unit.hp,unit.shield]),canonical.allies.map(unit=>[unit.hp,unit.shield]));
 assert.deepEqual(staged.enemies.map(unit=>[unit.hp,unit.shield]),canonical.enemies.map(unit=>[unit.hp,unit.shield]));
});

test('the opponent cannot embed forged clash scores into sealed planning actions',()=>{
 const s=createTacticalBattle(player,enemy,{seed:7,compact:true,fortress:true});
 const hero=s.allies[0];
 const intent={
  type:'skill',actorId:hero.id,abilityId:'impulso',
  anchor:{...s.tactical.positions[hero.id]},orientation:[1,0],
  clash:{attackHits:3,defenseHits:0},comboAdjustedDamage:99999
 };
 // Whether the target is currently legal is irrelevant: invalid/forged plans
 // cannot store the reaction scores in the sealed plan.
 const result=submitTacticalPlan(s,'player',[intent]);
 if(result.ok){
  assert.equal(s.tactical.plans.player[0].clash,undefined);
  assert.equal(s.tactical.plans.player[0].comboAdjustedDamage,undefined);
 }else assert.deepEqual(s.tactical.plans,{});
});

test('earned reactive counter uses real shield and health values without adding a new skill action',()=>{
 const s=createTacticalBattle(player,enemy,{seed:9,compact:true,fortress:true});
 const victim=s.enemies[0],defender=s.allies[0];
 const originalHP=victim.hp,originalTurn=s.round,originalActions=JSON.stringify(s.tactical.plans);
 victim.shield=0;
 const r=resolveBoardReactiveCounter(s,{
  attackerId:victim.id,defenderId:defender.id,baseDamage:30
 });
 assert.equal(r.skipped,false);
 assert.equal(r.counterPower,7);
 assert.equal(r.actorId,defender.id);
 assert.ok(victim.hp<=originalHP);
 assert.equal(s.round,originalTurn);
 assert.equal(JSON.stringify(s.tactical.plans),originalActions,'counter costs no extra sealed order');
 assert.equal(resolveBoardReactiveCounter(s,{attackerId:victim.id,defenderId:victim.id}).skipped,true);
});
