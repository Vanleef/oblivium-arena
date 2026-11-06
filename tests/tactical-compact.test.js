import test from 'node:test';
import assert from 'node:assert/strict';
import {createTacticalBattle,previewTacticalPlan,submitTacticalPlan,resolveTacticalRound,tacticalView,chooseTacticalChestReward} from '../src/tactical-combat.js';
import {boardCells,cellKey,distance,findPath,onBoard,movementRange,unitFacing} from '../src/tactical-board.js';
import {planTacticalAI} from '../src/tactical-ai.js';
import {conquestAugmentedAbility} from '../src/conquest-augments.js';
import {conquestTechnique} from '../src/conquest-techniques.js';
import {createTacticalRun,advanceTacticalRun} from '../src/tactical-run.js';
const allies=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],enemies=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
const make=(config={})=>createTacticalBattle(allies,enemies,{fortress:true,compact:true,...config});
const guard=actorId=>({type:'guard',actorId});
const step=(actorId,path)=>({type:'move',actorId,path});
const round=(s,a=[],b=[])=>{assert.ok(submitTacticalPlan(s,'player',a).ok);assert.ok(submitTacticalPlan(s,'enemy',b).ok);const result=resolveTacticalRound(s);assert.ok(result.ok);return result;};

test('compact mode is 5×5 with full-round plans and private same-tier objectives at adapted distances',()=>{
 const s=make();assert.equal(s.tactical.activation,undefined);assert.equal(boardCells(s).length,25);
 assert.equal(new Set(Object.values(s.tactical.positions).map(cellKey)).size,6);
 for(const side of ['player','enemy']){
  const goal=s.tactical.objectives[side],team=side==='player'?s.allies:s.enemies;
  assert.equal(goal.minimumDistance,3);assert.ok(team.every(u=>distance(goal.position,s.tactical.positions[u.id],s)>=3));
  assert.equal(tacticalView(s,side).tactical.objectives[side==='player'?'enemy':'player'],undefined);
  assert.ok(team.every(u=>movementRange(s,u.id)===2));
 }
 assert.equal(s.tactical.objectives.player.tier,s.tactical.objectives.enemy.tier);
});

test('a whole trio can queue two actions each; preview and first confirmation never execute the plan',()=>{
 const s=make(),actions=s.allies.flatMap(u=>[guard(u.id),guard(u.id)]),before=JSON.stringify(s);
 assert.ok(previewTacticalPlan(s,'player',actions).ok);assert.equal(JSON.stringify(s),before);
 assert.equal(previewTacticalPlan(s,'player',[...actions,guard(s.allies[0].id)]).ok,false);
 assert.equal(previewTacticalPlan(s,'player',[guard(s.allies[0].id),guard(s.allies[0].id),guard(s.allies[0].id)]).ok,false);
 const positions=structuredClone(s.tactical.positions),rng=s.rngState;
 assert.deepEqual(submitTacticalPlan(s,'player',actions),{ok:true,ready:false});
 assert.deepEqual(s.tactical.positions,positions);assert.equal(s.rngState,rng);assert.ok(s.allies.every(u=>u.shield===0));
 assert.deepEqual(tacticalView(s,'enemy').tactical.plans,{});
 assert.equal(resolveTacticalRound(s).ok,false);assert.equal(submitTacticalPlan(s,'player',[]).ok,false);
 assert.ok(submitTacticalPlan(s,'enemy',[]).ready);const result=resolveTacticalRound(s);
 assert.ok(result.ok);assert.deepEqual(result.events.filter(e=>e.type==='guard').map(e=>e.slot),[0,0,0,1,1,1]);
 assert.ok(s.allies.every(u=>u.shield===12));assert.equal(s.round,2);
});

test('same-wave collision stops both movements regardless of confirmation order, then both second actions occur',()=>{
 function run(first){
  const s=make(),a=s.allies[0],b=s.enemies[0];
  s.tactical.positions[a.id]={x:1,y:0};s.tactical.positions[b.id]={x:3,y:0};
  const plans={player:[step(a.id,[{x:2,y:0}]),guard(a.id)],enemy:[step(b.id,[{x:2,y:0}]),guard(b.id)]};
  assert.ok(submitTacticalPlan(s,first,plans[first]).ok);assert.ok(submitTacticalPlan(s,first==='player'?'enemy':'player',plans[first==='player'?'enemy':'player']).ok);
  const result=resolveTacticalRound(s),movement=result.events.find(e=>e.type==='exchange-move');
  assert.equal(movement.moves.length,0);assert.equal(movement.stopped.length,2);
  assert.deepEqual(s.tactical.positions[a.id],{x:1,y:0});assert.deepEqual(s.tactical.positions[b.id],{x:3,y:0});
  assert.equal(result.events.filter(e=>e.type==='guard').length,2);return {positions:s.tactical.positions,events:result.events};
 }
 assert.deepEqual(run('player'),run('enemy'));
});

test('movement collects only the owner objective and upgrades only its collector after the round',()=>{
 const s=make(),u=s.allies[0],goal={x:2,y:0};s.tactical.objectives.player.position=goal;
 const path=findPath(s,u.id,goal);assert.equal(path.length,2);
 const original=JSON.stringify(s),preview=previewTacticalPlan(s,'player',[step(u.id,path),guard(u.id)]);
 assert.ok(preview.ok);assert.equal(JSON.stringify(s),original);
 const result=round(s,[step(u.id,path),guard(u.id)]),offer=result.chestRewards.find(o=>o.objective);
 assert.ok(offer);assert.equal(offer.actorId,u.id);assert.equal(offer.options.length,3);assert.equal(s.tactical.stage,'reward');
 assert.equal(s.tactical.objectiveClaims.player,1);assert.equal(s.tactical.objectiveClaims.enemy,0);
 assert.equal(result.events.some(e=>e.before?.objectives?.enemy||e.after?.objectives?.enemy),false);
 const option=offer.options.find(o=>o.effect.trigger==='modify');
 const base=conquestTechnique(u.abilities.find(a=>a.id===option.effect.abilityId));
 assert.ok(chooseTacticalChestReward(s,offer.id,option.id).ok);assert.equal(u.objectiveAugments,1);
 assert.notDeepEqual(conquestAugmentedAbility(s,u,base),base);assert.ok(s.allies.slice(1).every(v=>!v.objectiveAugments));
 assert.equal(s.tactical.stage,'planning');
 if(s.tactical.objectives.player)assert.equal(s.tactical.objectives.player.minimumDistance,2);
});

test('compact edges do not grant invasion penalties and keep the starting horizontal facing',()=>{
 const s=make(),u=s.allies[0];s.tactical.positions[u.id]={x:3,y:0};s.tactical.objectives.player.position={x:1,y:4};
 const result=round(s,[step(u.id,[{x:4,y:0}])]);
 assert.ok(result.chestRewards.every(o=>!o.invasion));assert.deepEqual(s.tactical.fortress.entered,[]);assert.deepEqual(unitFacing(s,u),[1,0]);
});

test('compact techniques use the balanced cooldowns without spending Essência',()=>{
 const s=make(),u=s.allies[0],a=u.abilities.find(a=>a.id==='despertar');
 for(const p of [s.resources,s.enemyResources])for(const key of Object.keys(p))p[key]=0;
 const action={type:'skill',actorId:u.id,abilityId:a.id,anchor:s.tactical.positions[u.id],orientation:[1,0]};
 assert.ok(previewTacticalPlan(s,'player',[action]).ok);
 assert.equal(previewTacticalPlan(s,'player',[action,action]).ok,false);
 round(s,[action]);assert.equal(u.cooldowns[a.id],4);assert.ok(Object.values(s.resources).every(n=>n===0));
});

test('events recur every four rounds and never close the compact field',()=>{
 const s=make();const weather=[];
 for(let i=0;i<26;i++){const result=round(s);weather.push(...result.events.filter(e=>e.type==='field-event').map(e=>e.id));assert.equal(boardCells(s).length,25);assert.ok(units(s).filter(u=>u.hp>0).every(u=>onBoard(s.tactical.positions[u.id],s)));}
 assert.deepEqual(weather,['storm','wind','rain','storm','wind','rain']);
 assert.deepEqual(s.tactical.fortress.closedRows,[]);assert.deepEqual(s.tactical.fortress.closedColumns,[]);
});
const units=s=>[...s.allies,...s.enemies];

test('AI produces a legal sealed full-round plan without receiving the player objective',()=>{
 const s=make(),view=tacticalView(s,'enemy');assert.equal(view.tactical.objectives.player,undefined);
 const before=JSON.stringify(s),plan=planTacticalAI(view);
 assert.ok(plan.length>0&&plan.length<=6);assert.ok(previewTacticalPlan(s,'enemy',plan).ok);assert.equal(JSON.stringify(s),before);
 for(const u of s.enemies)assert.ok(plan.filter(a=>a.actorId===u.id).length<=2);
});

test('next encounters retain compact planning, progression and earned trail rewards',()=>{
 const s=make(),run=createTacticalRun();run.fortressRewards=['edge'];
 s.phase='victory';s.tactical.stage='finished';
 const next=advanceTacticalRun(run,s,'recovery');assert.equal(next.compact,true);
 const following=createTacticalBattle(next.player,next.enemy,{...next,fortress:true});
 assert.equal(following.tactical.compact,true);assert.equal(following.tactical.activation,undefined);assert.equal(boardCells(following).length,25);
 assert.ok(following.tactical.augments.player.every(a=>a.amount>=5));
 const extended=createTacticalBattle(allies,[...enemies,'o-corrupto','o-medico-de-vermes'],{fortress:true,compact:true,campaign:true});
 assert.ok(Object.values(extended.tactical.positions).every(p=>onBoard(p,extended)));assert.equal(new Set(Object.values(extended.tactical.positions).map(cellKey)).size,8);
});
