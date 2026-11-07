import test from 'node:test';
import assert from 'node:assert/strict';
import {createTacticalBattle,previewTacticalPlan,submitTacticalPlan,resolveTacticalRound,tacticalView,chooseTacticalChestReward} from '../src/tactical-combat.js';
import {boardCells,cellKey,distance,findPath,onBoard,movementRange,unitFacing} from '../src/tactical-board.js';
import {planTacticalAI,compactExposurePenalty} from '../src/tactical-ai.js';
import {conquestAugmentedAbility} from '../src/conquest-augments.js';
import {conquestTechnique} from '../src/conquest-techniques.js';
import {createTacticalRun,advanceTacticalRun} from '../src/tactical-run.js';
import {applyFieldEvent,tacticalFieldForecast} from '../src/tactical-elements.js';
const allies=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],enemies=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
const make=(config={})=>createTacticalBattle(allies,enemies,{fortress:true,compact:true,...config});
const guard=actorId=>({type:'guard',actorId}); // Legacy command is rejected in compact mode.
const step=(actorId,path)=>({type:'move',actorId,path});
const round=(s,a=[],b=[])=>{assert.ok(submitTacticalPlan(s,'player',a).ok);assert.ok(submitTacticalPlan(s,'enemy',b).ok);const result=resolveTacticalRound(s);assert.ok(result.ok);return result;};

test('compact mode is 6×6 with full-round plans and private same-tier objectives at adapted distances',()=>{
 const s=make();assert.equal(s.tactical.activation,undefined);assert.equal(boardCells(s).length,36);
 assert.equal(new Set(Object.values(s.tactical.positions).map(cellKey)).size,6);
 for(const side of ['player','enemy']){
  const goal=s.tactical.objectives[side],team=side==='player'?s.allies:s.enemies;
  assert.equal(goal.minimumDistance,3);assert.ok(team.every(u=>distance(goal.position,s.tactical.positions[u.id],s)>=3));
  assert.equal(tacticalView(s,side).tactical.objectives[side==='player'?'enemy':'player'],undefined);
  assert.ok(team.every(u=>movementRange(s,u.id)===1));
 }
 assert.equal(s.tactical.objectives.player.tier,s.tactical.objectives.enemy.tier);
});

test('a complete trio queues two adjacent moves each; guard is no longer a compact action',()=>{
 const s=make(),[riven,lira,aegis]=s.allies;
 s.tactical.positions[riven.id]={x:0,y:1};s.tactical.positions[lira.id]={x:1,y:2};s.tactical.positions[aegis.id]={x:0,y:3};
 const actions=[
  step(riven.id,[{x:0,y:0}]),step(riven.id,[{x:1,y:0}]),
  step(lira.id,[{x:2,y:2}]),step(lira.id,[{x:3,y:2}]),
  step(aegis.id,[{x:0,y:4}]),step(aegis.id,[{x:1,y:4}])
 ];
 const before=JSON.stringify(s);
 assert.ok(previewTacticalPlan(s,'player',actions).ok);
 assert.equal(JSON.stringify(s),before,'previews are read only');
 assert.equal(previewTacticalPlan(s,'player',[guard(riven.id)]).ok,false,'Guard is removed from compact plans');
 assert.equal(previewTacticalPlan(s,'player',[...actions,guard(riven.id)]).ok,false);
 assert.equal(previewTacticalPlan(s,'player',[step(riven.id,[{x:0,y:0}]),step(riven.id,[{x:1,y:0}]),step(riven.id,[{x:2,y:0}])]).ok,false);
 const positions=structuredClone(s.tactical.positions),rng=s.rngState;
 assert.deepEqual(submitTacticalPlan(s,'player',actions),{ok:true,ready:false});
 assert.deepEqual(s.tactical.positions,positions);assert.equal(s.rngState,rng);
 assert.deepEqual(tacticalView(s,'enemy').tactical.plans,{});
 assert.equal(resolveTacticalRound(s).ok,false);
 assert.equal(submitTacticalPlan(s,'player',[]).ok,false);
 assert.ok(submitTacticalPlan(s,'enemy',[]).ready);
 const result=resolveTacticalRound(s);
 assert.ok(result.ok);assert.equal(result.events.filter(e=>e.type==='guard').length,0);
 assert.equal(result.events.filter(e=>e.type==='exchange-move').flatMap(e=>e.moves).length,6);
 assert.equal(s.round,2);
});

test('same-wave collision stops both movements regardless of confirmation order, then both second actions occur',()=>{
 function run(first){
  const s=make(),a=s.allies[0],b=s.enemies[0];
  s.tactical.positions[a.id]={x:1,y:0};s.tactical.positions[b.id]={x:3,y:0};
  const plans={player:[step(a.id,[{x:2,y:0}]),step(a.id,[{x:1,y:1}])],enemy:[step(b.id,[{x:2,y:0}]),step(b.id,[{x:3,y:1}])]};
  assert.ok(submitTacticalPlan(s,first,plans[first]).ok);assert.ok(submitTacticalPlan(s,first==='player'?'enemy':'player',plans[first==='player'?'enemy':'player']).ok);
  const result=resolveTacticalRound(s),movement=result.events.find(e=>e.type==='exchange-move');
  assert.equal(movement.moves.length,0);assert.equal(movement.stopped.length,2);
  assert.deepEqual(s.tactical.positions[a.id],{x:1,y:0});assert.deepEqual(s.tactical.positions[b.id],{x:3,y:0});
  assert.equal(result.events.filter(e=>e.type==='guard').length,0);return {positions:s.tactical.positions,events:result.events};
 }
 assert.deepEqual(run('player'),run('enemy'));
});

test('movement collects only the owner objective and upgrades only its collector after the round',()=>{
 const s=make(),u=s.allies[0],goal={x:1,y:0};s.tactical.objectives.player.position=goal;
 const path=findPath(s,u.id,goal);assert.equal(path.length,1);
 const original=JSON.stringify(s),preview=previewTacticalPlan(s,'player',[step(u.id,path)]);
 assert.ok(preview.ok);assert.equal(JSON.stringify(s),original);
 const result=round(s,[step(u.id,path)]),offer=result.chestRewards.find(o=>o.objective);
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

test('all 36 compact cells permit valid movement and skill targets, including row 6 and column F',()=>{
 const s=make(),u=s.allies[0];
 s.tactical.positions[u.id]={x:4,y:4};
 assert.equal(findPath(s,u.id,{x:5,y:5})?.length,1);
 assert.equal(previewTacticalPlan(s,'player',[step(u.id,[{x:5,y:5}])]).ok,true);
 assert.equal(previewTacticalPlan(s,'player',[step(u.id,[{x:6,y:5}])]).ok,false);
 const passive=u.abilities.find(a=>a.id==='despertar');
 const cast={type:'skill',actorId:u.id,abilityId:passive.id,anchor:{x:5,y:5},orientation:[1,0]};
 assert.equal(previewTacticalPlan(s,'player',[step(u.id,[{x:5,y:5}]),cast]).ok,true);
 assert.deepEqual(s.tactical.positions[u.id],{x:4,y:4},'previews must not move an actor before the round');
 const result=round(s,[step(u.id,[{x:5,y:5}]),cast]);
 assert.ok(result.events.some(e=>e.type==='exchange-move'&&e.moves.some(move=>move.actorId===u.id&&move.to.x===5&&move.to.y===5)));
 assert.deepEqual(s.tactical.positions[u.id],{x:5,y:5});
});

test('compact one-cell movement does not inherit the historical L leap bonus',()=>{
 const s=make({fortressRewards:['leap']}),u=s.allies[0];
 assert.ok(s.tactical.fortress.leaps.includes(u.id),'fixture grants the old traversal bonus');
 assert.equal(movementRange(s,u.id),1);
 assert.equal(findPath(s,u.id,{x:2,y:1}),null,'a two-cell L leap cannot consume one compact action');
 assert.equal(previewTacticalPlan(s,'player',[step(u.id,[{x:2,y:1}])]).ok,false);
 // Put the actor on two deliberately clear diagonal steps; default formations vary by seed.
 s.tactical.obstacles=[];
 s.tactical.positions[u.id]={x:1,y:1};
 const movement=[step(u.id,[{x:2,y:2}]),step(u.id,[{x:3,y:3}])];
 assert.ok(previewTacticalPlan(s,'player',movement).ok);
 assert.equal(u.shield,0,'the pre-execution projection must not grant shields to the real actor');
 const result=round(s,movement);
 const moves=result.events.filter(event=>event.type==='exchange-move').flatMap(event=>event.moves).filter(move=>move.actorId===u.id);
 assert.equal(moves.length,2);
 assert.equal(moves[0].leapShield,8,'one diagonal step grants the Gold reward');
 assert.equal(moves[1].leapShield,0,'the bonus activates only once per round');
 assert.equal(u.shield,8);
});

test('two consecutive compact moves are individually adjacent and never move the unit before resolution',()=>{
 const s=make(),u=s.allies[0],start={...s.tactical.positions[u.id]};
 const first=step(u.id,[{x:1,y:1}]),second=step(u.id,[{x:2,y:1}]);
 assert.equal(findPath(s,u.id,{x:2,y:1}),null,'two cells are not one action');
 assert.equal(previewTacticalPlan(s,'player',[step(u.id,[{x:1,y:1},{x:2,y:1}])]).ok,false);
 assert.ok(previewTacticalPlan(s,'player',[first,second]).ok,'two moves require two action slots');
 assert.deepEqual(s.tactical.positions[u.id],start,'the simulated first move must never move the real actor');
 assert.ok(submitTacticalPlan(s,'player',[first,second]).ok);
 assert.deepEqual(s.tactical.positions[u.id],start,'sealing the plan does not execute either movement');
 assert.ok(submitTacticalPlan(s,'enemy',[]).ok);
 const result=resolveTacticalRound(s);
 assert.ok(result.ok);
 const moves=result.events.filter(e=>e.type==='exchange-move').flatMap(e=>e.moves).filter(e=>e.actorId===u.id);
 assert.equal(moves.length,2);
 assert.deepEqual(moves.map(m=>m.to),[{x:1,y:1},{x:2,y:1}]);
 assert.deepEqual(s.tactical.positions[u.id],{x:2,y:1});
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
 for(let i=0;i<26;i++){const result=round(s);weather.push(...result.events.filter(e=>e.type==='field-event').map(e=>e.id));assert.equal(boardCells(s).length,36);assert.ok(units(s).filter(u=>u.hp>0).every(u=>onBoard(s.tactical.positions[u.id],s)));}
 assert.deepEqual(weather,['storm','wind','rain','storm','wind','rain']);
 assert.deepEqual(s.tactical.fortress.closedRows,[]);assert.deepEqual(s.tactical.fortress.closedColumns,[]);
});
const units=s=>[...s.allies,...s.enemies];

test('field forecast describes the public event cadence and current weather without future strikes',()=>{
 const s=make();
 assert.deepEqual(tacticalFieldForecast(s),{nextRound:4,roundsRemaining:3,active:null});
 s.round=8;
 const wind=applyFieldEvent(s),forecast=tacticalFieldForecast(s);
 assert.equal(wind.id,'wind');
 assert.equal(forecast.nextRound,12);
 assert.equal(forecast.roundsRemaining,4);
 assert.equal(forecast.active?.id,'wind');
 assert.equal(Object.hasOwn(forecast,'strikes'),false);
 s.round=9;
 assert.equal(tacticalFieldForecast(s).active,null,'last round weather is not claimed as active');
});

test('Vendaval grants a shield for a single-tile move and Chuva extinguishes active fire on 6×6',()=>{
 const s=make(),u=s.allies[0];
 s.round=8;
 const wind=applyFieldEvent(s);
 assert.equal(wind.id,'wind');
 assert.equal(movementRange(s,u.id),1);
 assert.equal(findPath(s,u.id,{x:3,y:0}),null);
 const path=findPath(s,u.id,{x:1,y:0});
 assert.equal(path?.length,1);
 assert.ok(previewTacticalPlan(s,'player',[step(u.id,path)]).ok);
 assert.equal(s.tactical.positions[u.id].x,0,'preview never moves the real character');
 const moveResult=round(s,[step(u.id,path)]);
 assert.equal(s.tactical.positions[u.id].x,1);
 assert.equal(u.shield,5);
 assert.ok(moveResult.events.some(e=>e.type==='exchange-move'&&e.moves.some(m=>m.windShield===5)));
 s.round=12;
 s.tactical.surfaces['2,2']={element:'fire',until:16};
 const rain=applyFieldEvent(s);
 assert.equal(rain.id,'rain');
 assert.notEqual(s.tactical.surfaces['2,2']?.element,'fire');
 assert.equal(movementRange(s,u.id),1);
 assert.equal(boardCells(s).length,36);
});

test('AI produces a legal sealed full-round plan without receiving the player objective',()=>{
 const s=make(),view=tacticalView(s,'enemy');assert.equal(view.tactical.objectives.player,undefined);
 const before=JSON.stringify(s),plan=planTacticalAI(view);
 assert.ok(plan.length>0&&plan.length<=6);assert.ok(previewTacticalPlan(s,'enemy',plan).ok);assert.equal(JSON.stringify(s),before);
 for(const u of s.enemies)assert.ok(plan.filter(a=>a.actorId===u.id).length<=2);
});

test('compact AI exposure values a shield that prevents a visible lethal hit, without guessing sealed orders',()=>{
 const s=make(),vulnerable=s.enemies[0],attacker=s.allies[0];
 s.tactical.positions[vulnerable.id]={x:2,y:0};
 s.tactical.positions[attacker.id]={x:3,y:0};
 vulnerable.hp=10;vulnerable.shield=0;
 const threats=[attacker],before=JSON.stringify(s);
 const bare=compactExposurePenalty(s,vulnerable,threats);
 assert.ok(bare>=60,'visible damage can defeat the low-health unit');
 vulnerable.shield=6;
 const guarded=compactExposurePenalty(s,vulnerable,threats);
 assert.ok(guarded<bare,'shields from skills or movement reduce estimated danger');
 vulnerable.hp=90;
 assert.equal(compactExposurePenalty(s,vulnerable,threats),0,'healthy unit should not be forced to defend');
 s.tactical.positions[attacker.id]={x:4,y:4};
 vulnerable.hp=10;vulnerable.shield=0;
 assert.equal(compactExposurePenalty(s,vulnerable,threats),0,'distant threats do not count as immediate attackers');
 assert.equal(compactExposurePenalty({...s,tactical:{...s.tactical,compact:false}},vulnerable,threats),0,'legacy modes stay unchanged');
 assert.notEqual(JSON.stringify(s),before,'the fixture deliberately changes values');
});

test('compact AI never plans Guard even with blocked paths and unavailable skills',()=>{
 const s=make(),taken=new Set(Object.values(s.tactical.positions).map(cellKey));
 s.tactical.obstacles=boardCells(s).filter(p=>!taken.has(cellKey(p)));
 for(const u of s.enemies)for(const a of u.abilities)if(a.id!=='fortress-basic')u.cooldowns[a.id]=10;
 const before=JSON.stringify(s),plan=planTacticalAI(tacticalView(s,'enemy'));
 assert.ok(plan.every(ref=>ref.type!=='guard'),'neither team can use Guard in compact combat');
 assert.ok(previewTacticalPlan(s,'enemy',plan).ok);
 assert.equal(JSON.stringify(s),before,'the planner must not mutate the real battle');
 const result=round(s,[],plan);
 assert.ok(result.events.every(event=>event.type!=='guard'));
});

test('next encounters retain compact planning, progression and earned trail rewards',()=>{
 const s=make(),run=createTacticalRun();run.fortressRewards=['edge'];
 s.phase='victory';s.tactical.stage='finished';
 const next=advanceTacticalRun(run,s,'recovery');assert.equal(next.compact,true);
 const following=createTacticalBattle(next.player,next.enemy,{...next,fortress:true});
 assert.equal(following.tactical.compact,true);assert.equal(following.tactical.activation,undefined);assert.equal(boardCells(following).length,36);
 assert.ok(following.tactical.augments.player.every(a=>a.amount>=5));
 const extended=createTacticalBattle(allies,[...enemies,'o-corrupto','o-medico-de-vermes'],{fortress:true,compact:true,campaign:true});
 assert.ok(Object.values(extended.tactical.positions).every(p=>onBoard(p,extended)));assert.equal(new Set(Object.values(extended.tactical.positions).map(cellKey)).size,8);
});
