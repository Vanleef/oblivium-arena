import assert from 'node:assert/strict';
import {createTacticalBattle,submitTacticalActivation,chooseTacticalChestReward,tacticalUnits,tacticalView} from '../src/tactical-combat.js';
import {planTacticalAIActivation} from '../src/tactical-ai.js';
import {chooseFortressPenalty} from '../src/conquest-objectives.js';
import {onBoard,cellKey} from '../src/tactical-board.js';
import {kingdomCatalog} from '../src/kingdoms.js';
import {combatScenes} from '../src/combat-scenes.js';
const formations=[['o-soberano-quebrado','a-brasa-eterna','o-escudo-vivo'],['o-acougueiro','a-viuva-escarlate','o-tecelao-de-mentiras'],['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde']];
let exchanges=0,pickups=0,invasions=0,closures=0;
for(let seed=1;seed<=6;seed++){
 const s=createTacticalBattle(formations[seed%3],formations[(seed+1)%3],{seed,fortress:true,scene:combatScenes[seed-1].id,augmentProgress:{completedKingdoms:kingdomCatalog.slice(0,8).map(k=>k.id)}});
 for(let step=0;step<100&&s.tactical.stage!=='finished';step++){
  while(s.tactical.stage==='reward'){
   const offer=s.tactical.pendingChestRewards[0];assert.ok(offer,'reward stage without a choice');
   const choice=offer.invasion?chooseFortressPenalty(s,'player',offer.options):{option:offer.options[0]};
   assert.ok(choice?.option);assert.equal(chooseTacticalChestReward(s,offer.id,choice.option.id,choice.targetId).ok,true);
  }
  const plans=['player','enemy'].map(side=>({side,plan:planTacticalAIActivation(s,side)})).filter(p=>p.plan);
  assert.ok(plans.length,'planning deadlock');let resolved;
  for(const {side,plan}of plans){
   const result=submitTacticalActivation(s,side,plan.actorId,plan.actions);assert.equal(result.ok,true,result.reason);if(!result.waiting)resolved=result;
  }
  assert.ok(resolved,'exchange never resolved');exchanges++;
  closures+=resolved.events.filter(e=>e.closure).length;
  invasions+=resolved.chestRewards.filter(o=>o.invasion).length+resolved.events.filter(e=>e.title?.startsWith('Invasão rival')).length;
  const living=tacticalUnits(s).filter(u=>u.hp>0),positions=living.map(u=>s.tactical.positions[u.id]);
  assert.equal(new Set(positions.map(cellKey)).size,positions.length,'overlapping survivors');
  assert.ok(positions.every(p=>onBoard(p,s)),'survivor outside active field');
  assert.ok(living.every(u=>Number.isFinite(u.hp)&&u.hp<=u.maxHp),'invalid health');
  assert.equal(s.tactical.objectives.player?.tier,s.tactical.objectives.enemy?.tier);
  assert.equal(tacticalView(s,'enemy').tactical.objectives.player,undefined);
 }
 pickups+=s.tactical.objectiveClaims.player+s.tactical.objectiveClaims.enemy;
 console.log(JSON.stringify({seed,round:s.round,result:s.phase,pickups:s.tactical.objectiveClaims}));
}
assert.ok(pickups>0,'no objective collected');assert.ok(invasions>0,'no fortress invaded');
console.log(JSON.stringify({battles:6,exchanges,pickups,invasions,closures,errors:0}));
