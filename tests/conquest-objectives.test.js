import test from 'node:test';
import assert from 'node:assert/strict';
import {createTacticalBattle,tacticalView,submitTacticalActivation,chooseTacticalChestReward,rerollTacticalChestReward} from '../src/tactical-combat.js';
import {boardCells,distance,occupied,obstacle,onBoard,findPath,sameCell} from '../src/tactical-board.js';
import {refreshConquestObjectives,objectiveMinimumDistance,objectiveGrowth,fortressPenaltyOptions,applyFortressPenalty} from '../src/conquest-objectives.js';
import {objectiveAugmentPool,conquestAugmentedAbility} from '../src/conquest-augments.js';
import {conquestTechnique} from '../src/conquest-techniques.js';
import {kingdomCatalog} from '../src/kingdoms.js';
import {triggerTacticalAugments} from '../src/tactical-chests.js';
import {planTacticalAIActivation} from '../src/tactical-ai.js';
const ids=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],rivals=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
const make=(seed=1,count=0)=>createTacticalBattle(ids,rivals,{seed,fortress:true,augmentProgress:{completedKingdoms:kingdomCatalog.slice(0,count).map(k=>k.id)}});
function collect(s,side='player',index=0){
 const actor=(side==='player'?s.allies:s.enemies)[index],goal=s.tactical.objectives[side].position;
 const from=boardCells(s).find(p=>distance(p,goal,s)===1&&!occupied(s,p)&&!obstacle(s,p));
 s.tactical.positions[actor.id]=from;s.tactical.activation.spent=[];
 for(const unit of side==='player'?s.enemies:s.allies)unit.stunned=50;
 const path=findPath(s,actor.id,goal);assert.ok(path);
 const result=submitTacticalActivation(s,side,actor.id,[{type:'move',actorId:actor.id,path}]);
 assert.equal(result.ok,true,result.reason);return {actor,result,goal};
}
test('same-tier private objectives start at least five tiles from every teammate',()=>{
 for(let seed=1;seed<=35;seed++){
  const s=make(seed,8);assert.equal(s.tactical.objectives.player.tier,s.tactical.objectives.enemy.tier);
  for(const side of ['player','enemy']){
   const point=s.tactical.objectives[side].position,units=side==='player'?s.allies:s.enemies;
   assert.ok(!occupied(s,point)&&!obstacle(s,point));assert.ok(units.every(u=>distance(point,s.tactical.positions[u.id],s)>=5));
   const view=tacticalView(s,side),opponent=side==='player'?'enemy':'player';
   assert.ok(view.tactical.objectives[side]);assert.equal(view.tactical.objectives[opponent],undefined);assert.equal(view.tactical.objectiveSeed,undefined);
  }
 }
});
test('collecting gives three owner-specific skill upgrades and a new goal at least three tiles away',()=>{
 const s=make(),{actor,result,goal}=collect(s),offer=result.chestRewards.find(o=>o.objective);
 assert.ok(offer);assert.equal(offer.actorId,actor.id);assert.equal(offer.tier,'silver');assert.equal(offer.options.length,3);
 assert.ok(offer.options.every(o=>o.effect.type==='conquest-augment'&&o.effect.actorId===actor.id&&actor.abilities.some(a=>a.id===o.effect.abilityId)));
 const next=s.tactical.objectives.player.position;
 assert.ok(!sameCell(next,goal)&&!occupied(s,next));assert.ok(s.allies.every(u=>distance(next,s.tactical.positions[u.id],s)>=3));
 assert.equal(s.tactical.objectives.player.tier,s.tactical.objectives.enemy.tier);
 const option=offer.options.find(o=>['modify','basic'].includes(o.effect.trigger))||offer.options[0],base=conquestTechnique(actor.abilities.find(a=>a.id===option.effect.abilityId));
 assert.equal(chooseTacticalChestReward(s,offer.id,option.id).ok,true);assert.equal(actor.objectiveAugments,1);assert.equal(s.allies[1].objectiveAugments,undefined);
 assert.equal(chooseTacticalChestReward(s,offer.id,option.id).ok,false);assert.notDeepEqual(conquestAugmentedAbility(s,actor,base),base);
 assert.equal(result.events.some(e=>e.before?.objectives?.enemy||e.after?.objectives?.enemy),false);
});
test('objective basic-attack procs are ability scoped and once per round',()=>{
 const s=make(),actor=s.allies[0],option=objectiveAugmentPool(s,'player',actor,'silver').find(o=>o.id.includes(':ward:'));
 s.tactical.augments={player:[{...option.effect,id:option.effect.augmentId}],enemy:[]};actor.shield=0;
 triggerTacticalAugments(s,'player',actor,'skill',{ability:actor.abilities[0],affected:true});assert.equal(actor.shield,0);
 const basic=actor.abilities.find(a=>a.id==='fortress-basic');
 triggerTacticalAugments(s,'player',actor,'skill',{ability:basic,affected:true});assert.equal(actor.shield,2);
 triggerTacticalAugments(s,'player',actor,'skill',{ability:basic,affected:true});assert.equal(actor.shield,2);
});
test('repeated objectives create distinct upgrade instances instead of replacing earlier ones',()=>{
 const s=make(),{actor,result}=collect(s),offer=result.chestRewards.find(o=>o.objective);chooseTacticalChestReward(s,offer.id,offer.options[0].id);
 const first=s.tactical.augments.player[0],next=objectiveAugmentPool(s,'player',actor,'silver').find(o=>o.effect.abilityId===first.abilityId&&o.effect.stat===first.stat&&o.effect.trigger===first.trigger);
 assert.notEqual(next.effect.augmentId,first.id);
});
test('contraction relocates removed objectives and lowers distance without spawning on units',()=>{
 const s=make();s.tactical.objectiveClaims={player:1,enemy:1};s.tactical.fortress.closedColumns=[1,7,2,6];s.tactical.fortress.closedRows=[0,5];
 const cells=boardCells(s);[...s.allies,...s.enemies].forEach((u,i)=>s.tactical.positions[u.id]=cells[i]);
 s.tactical.objectives={player:{position:{x:1,y:1}},enemy:{position:{x:7,y:1}}};refreshConquestObjectives(s);assert.equal(objectiveMinimumDistance(s),2);
 for(const side of ['player','enemy']){
  const goal=s.tactical.objectives[side];assert.ok(goal);assert.ok(onBoard(goal.position,s)&&!occupied(s,goal.position));
  assert.ok((side==='player'?s.allies:s.enemies).every(u=>distance(goal.position,s.tactical.positions[u.id],s)>=2));
 }
});
test('asynchronous pickups retain shared tiers and kingdom-based unlocks',()=>{
 const seen=new Set();for(let seed=1;seed<=45;seed++)for(const count of [0,3,8]){
  const s=make(seed,count);s.tactical.objectiveClaims.player=4;s.tactical.objectiveClaims.enemy=2;refreshConquestObjectives(s);
  const tier=s.tactical.objectives.player.tier;assert.equal(tier,s.tactical.objectives.enemy.tier);
  if(count===0)assert.equal(tier,'silver');if(count===3)assert.notEqual(tier,'prismatic');if(count===8)seen.add(tier);
 }assert.equal(seen.size,3);
});
test('fortress offers three penalties, validates targets, and never grows its invader',()=>{
 const s=make(),actor=s.allies[0];for(const u of s.enemies)u.stunned=50;s.tactical.positions[actor.id]={x:7,y:1};
 const result=submitTacticalActivation(s,'player',actor.id,[{type:'move',actorId:actor.id,path:[{x:8,y:1}]}]),offer=result.chestRewards.find(o=>o.invasion);
 assert.equal(offer.options.length,3);assert.equal(rerollTacticalChestReward(s,offer.id).ok,false);
 assert.equal(chooseTacticalChestReward(s,offer.id,'siege-seal',actor.id).ok,false);
 const target=s.enemies[0];assert.equal(chooseTacticalChestReward(s,offer.id,'siege-seal',target.id).ok,true);
 assert.equal(target.sealAttack,1);assert.ok(s.enemies.slice(1).every(u=>!u.sealAttack));assert.equal(actor.objectiveAugments,undefined);assert.equal(s.tactical.augments,undefined);
 applyFortressPenalty(s,'player',fortressPenaltyOptions()[0].effect);assert.ok(s.enemies.every(u=>u.weakened===1&&u.boardFresh.weakened===s.round));
});
test('enemy collection applies its own upgrade without revealing the objective in replay',()=>{
 const s=make(),{actor,result}=collect(s,'enemy');assert.equal(actor.objectiveAugments,1);assert.ok(s.tactical.augments.enemy.some(a=>a.actorId===actor.id));
 assert.deepEqual(result.chestRewards,[]);assert.equal(result.events.some(e=>e.after?.objectives?.enemy),false);
});
test('growth has diminishing increments bounded by one logical tile',()=>{
 let previous=objectiveGrowth(0),increment=1;for(let i=1;i<40;i++){const next=objectiveGrowth(i),gain=next-previous;assert.ok(gain>0&&gain<increment);assert.ok(next*.7<.9);previous=next;increment=gain;}
 assert.ok(objectiveGrowth(1e6)<=1.28);assert.equal(objectiveGrowth(-1),1);
});
test('AI advances toward its own private objective',()=>{
 const s=make(),enemy=s.enemies[0];s.tactical.positions[enemy.id]={x:4,y:2};s.tactical.objectives.enemy={id:'ai',side:'enemy',tier:'silver',position:{x:3,y:2}};s.tactical.activation.spent=s.enemies.slice(1).map(u=>u.id);
 const plan=planTacticalAIActivation(s);assert.equal(plan.actorId,enemy.id);assert.deepEqual(plan.actions[0].path.at(-1),{x:3,y:2});
});
test('every character and transformation has three skill-specific choices in every tier',async()=>{
 const {characters}=await import('../src/data.js');const s=make(1,8);
 for(const source of characters)for(const variant of [null,...source.abilities.flatMap(a=>(a.forms||[]).map(form=>({abilityId:a.id,form})))]){
  const actor={...source,hp:100,side:'player',abilities:[...source.abilities.map(a=>variant?.abilityId===a.id?{...a,...variant.form}:a),{id:'fortress-basic',name:'Ataque Básico',damage:12}]};
  for(const tier of ['silver','gold','prismatic']){
   const options=objectiveAugmentPool(s,'player',actor,tier);assert.ok(options.length>=3,source.id+'/'+tier);assert.ok(options.every(o=>o.effect.actorId===source.id&&actor.abilities.some(a=>a.id===o.effect.abilityId)));
  }
 }
});
