import assert from 'node:assert/strict';
import {createTacticalBattle,submitTacticalPlan,resolveTacticalRound,chooseTacticalChestReward,tacticalView} from '../src/tactical-combat.js';
import {planTacticalAI} from '../src/tactical-ai.js';
import {boardCells,cellKey,onBoard} from '../src/tactical-board.js';
import {kingdomCatalog} from '../src/kingdoms.js';

// Default remains a quick smoke. --samples=12 exercises more seeds and tier unlocks.
const samplesOption=process.argv.find(arg=>arg.startsWith('--samples='));
const samples=samplesOption?Number(samplesOption.slice('--samples='.length)):3;
if(!Number.isInteger(samples)||samples<1||samples>24)throw Error('Use --samples=N com N entre 1 e 24.');
const formations=[['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],['o-soberano-quebrado','a-brasa-eterna','a-arquiteta-verde'],['o-corrupto','o-medico-de-vermes','o-jardim-morto']];
const aggregate={battles:samples,rounds:0,events:0,claims:0,guards:0,skills:0,moveStops:0,stunSkips:0,fieldEvents:0,results:{victory:0,defeat:0,draw:0}};
const matchRounds=[];
for(let seed=1;seed<=samples;seed++){
 const unlockedKingdoms=[0,3,8][(seed-1)%3];
 const progress={completedKingdoms:kingdomCatalog.slice(0,unlockedKingdoms).map(k=>k.id)};
 const s=createTacticalBattle(formations[(seed-1)%formations.length],formations[seed%formations.length],{fortress:true,compact:true,seed,augmentProgress:progress});
 const sample={seed,unlockedKingdoms,rounds:0,events:0,guards:0,skills:0,moveStops:0,stunSkips:0,fieldEvents:0};
 for(let i=0;i<45&&s.tactical.stage!=='finished';i++){
  while(s.tactical.pendingChestRewards.length){
   const offer=s.tactical.pendingChestRewards[0];
   assert.ok(chooseTacticalChestReward(s,offer.id,offer.options[0].id).ok);
  }
  const claimsBefore={...s.tactical.objectiveClaims};
  const plans=Object.fromEntries(['player','enemy'].map(side=>[side,planTacticalAI(tacticalView(s,side),side)]));
  assert.ok(submitTacticalPlan(s,'player',plans.player).ok);
  assert.ok(submitTacticalPlan(s,'enemy',plans.enemy).ok);
  const result=resolveTacticalRound(s);
  assert.ok(result.ok);
  sample.rounds++;sample.events+=result.events.length;
  sample.guards+=result.events.filter(event=>event.type==='guard'&&!event.skipped).length;
  sample.skills+=result.events.filter(event=>event.type==='skill'&&!event.skipped).length;
  sample.moveStops+=result.events.filter(event=>event.type==='exchange-move').reduce((n,event)=>n+(event.stopped?.length||0),0);
  sample.stunSkips+=result.events.filter(event=>event.skipped&&/atordoado/i.test(event.reason||'')).length;
  sample.fieldEvents+=result.events.filter(event=>event.type==='field-event').length;
  const living=[...s.allies,...s.enemies].filter(u=>u.hp>0),positions=living.map(u=>s.tactical.positions[u.id]);
  assert.equal(new Set(positions.map(cellKey)).size,positions.length,'surviving characters overlap');
  assert.ok(positions.every(p=>onBoard(p,s)),'a living character left the 5×5 board');
  assert.equal(boardCells(s).length,25);
  assert.ok(living.every(u=>Number.isFinite(u.hp)&&u.hp<=u.maxHp));
  assert.equal(tacticalView(s,'enemy').tactical.objectives.player,undefined);
  assert.equal(tacticalView(s,'player').tactical.objectives.enemy,undefined);
  assert.equal(result.events.some(event=>event.before?.objectives?.enemy||event.after?.objectives?.enemy),false);
  assert.ok(s.tactical.objectiveClaims.player>=claimsBefore.player&&s.tactical.objectiveClaims.enemy>=claimsBefore.enemy);
  assert.equal(s.tactical.objectives.player?.tier,s.tactical.objectives.enemy?.tier);
 }
 assert.equal(s.tactical.stage,'finished','combat did not finish within 45 rounds; seed '+seed);
 sample.result=s.phase;sample.claims={...s.tactical.objectiveClaims};
 aggregate.results[s.phase]++;
 for(const key of ['rounds','events','guards','skills','moveStops','stunSkips','fieldEvents'])aggregate[key]+=sample[key];
 aggregate.claims+=sample.claims.player+sample.claims.enemy;
 matchRounds.push(sample.rounds);
 console.log(JSON.stringify(sample));
}
if(samples>=3)assert.ok(aggregate.claims>0,'none of the representative fights collected objectives');
aggregate.averageRounds=Number((aggregate.rounds/samples).toFixed(2));
aggregate.minRounds=Math.min(...matchRounds);aggregate.maxRounds=Math.max(...matchRounds);
console.log(JSON.stringify({...aggregate,errors:0}));
