import assert from 'node:assert/strict';
import {createTacticalBattle,submitTacticalPlan,resolveTacticalRound,chooseTacticalChestReward,tacticalView} from '../src/tactical-combat.js';
import {planTacticalAI} from '../src/tactical-ai.js';
import {boardCells,cellKey,onBoard} from '../src/tactical-board.js';
import {kingdomCatalog} from '../src/kingdoms.js';
const formations=[['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],['o-soberano-quebrado','a-brasa-eterna','a-arquiteta-verde'],['o-corrupto','o-medico-de-vermes','o-jardim-morto']];
let rounds=0,events=0,claims=0;
for(let seed=1;seed<=3;seed++){
 const s=createTacticalBattle(formations[seed-1],formations[seed%3],{fortress:true,compact:true,seed,augmentProgress:{completedKingdoms:kingdomCatalog.slice(0,8).map(k=>k.id)}});
 for(let i=0;i<45&&s.tactical.stage!=='finished';i++){
  while(s.tactical.pendingChestRewards.length){const offer=s.tactical.pendingChestRewards[0];assert.ok(chooseTacticalChestReward(s,offer.id,offer.options[0].id).ok);}
  const plans=Object.fromEntries(['player','enemy'].map(side=>[side,planTacticalAI(tacticalView(s,side),side)]));
  assert.ok(submitTacticalPlan(s,'player',plans.player).ok);assert.ok(submitTacticalPlan(s,'enemy',plans.enemy).ok);
  const result=resolveTacticalRound(s);assert.ok(result.ok);rounds++;events+=result.events.length;
  const living=[...s.allies,...s.enemies].filter(u=>u.hp>0),positions=living.map(u=>s.tactical.positions[u.id]);
  assert.equal(new Set(positions.map(cellKey)).size,positions.length);assert.ok(positions.every(p=>onBoard(p,s)));assert.equal(boardCells(s).length,25);
  assert.ok(living.every(u=>Number.isFinite(u.hp)&&u.hp<=u.maxHp));
  assert.equal(tacticalView(s,'enemy').tactical.objectives.player,undefined);assert.equal(s.tactical.objectives.player?.tier,s.tactical.objectives.enemy?.tier);
 }
 claims+=s.tactical.objectiveClaims.player+s.tactical.objectiveClaims.enemy;
 assert.equal(s.tactical.stage,'finished','combat did not finish within 45 rounds');
 console.log(JSON.stringify({seed,result:s.phase,round:s.round,claims:s.tactical.objectiveClaims}));
}
assert.ok(claims>0);console.log(JSON.stringify({battles:3,rounds,events,claims,errors:0}));
