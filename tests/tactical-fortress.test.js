import {applyFieldEvent,surfaceAt,pruneSurfaces} from '../src/tactical-elements.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createTacticalBattle,previewTacticalActivation,submitTacticalActivation,chooseTacticalChestReward,tacticalArea} from '../src/tactical-combat.js';
import {boardCells,findPath,cellLabel,fortressClosure,cellKey} from '../src/tactical-board.js';
import {planTacticalAIActivation} from '../src/tactical-ai.js';

const allies=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
const rivals=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
const battle=()=>createTacticalBattle(allies,rivals,{seed:1,fortress:true});
const order=(actorId,x,y,abilityId)=>[{type:'move',actorId,path:[{x,y}],abilityId}];
const exchange=(s,actorId,x,y,abilityId)=>{
 const reply=planTacticalAIActivation(s);
 if(reply)assert.equal(submitTacticalActivation(s,'enemy',reply.actorId,reply.actions).waiting,true);
 return submitTacticalActivation(s,'player',actorId,order(actorId,x,y,abilityId));
};

test('a arena tem 54 casas, fortalezas espelhadas, e aceita uma única casa por ordem',()=>{
 const s=battle();
 assert.equal(boardCells(s).length,54);
 assert.equal(cellLabel(boardCells(s).at(-1)),'I6');
 assert.ok(s.allies.every(u=>u.hp===100&&s.tactical.positions[u.id].x===0));
 assert.ok(s.enemies.every(u=>u.hp===100&&s.tactical.positions[u.id].x===8));
 assert.equal(previewTacticalActivation(s,'player',allies[0],order(allies[0],2,1)).ok,false);
 const result=exchange(s,allies[0],1,1,'despertar');
 assert.equal(result.ok,true);
 assert.ok(result.events.some(e=>e.type==='skill'&&e.actorId===allies[0]));
 assert.equal(s.allies[0].cooldowns.despertar,4);
 assert.equal(s.tactical.fortress.equipped[allies[0]],'despertar');
});

test('o ataque equipado atinge a área depois de mover, sem gastar Essência',()=>{
 const s=battle(),actor=allies[0];
 Object.assign(s.tactical.positions,{[actor]:{x:2,y:2},[s.enemies[0].id]:{x:4,y:2}});
 for(const u of s.enemies)u.stunned=5;
 for(const key of Object.keys(s.resources))s.resources[key]=0;
 const preview=previewTacticalActivation(s,'player',actor,order(actor,3,2,'impulso'));
 assert.deepEqual(preview.projection.tactical.positions[actor],{x:3,y:2});
 assert.deepEqual(s.tactical.positions[actor],{x:2,y:2});
 assert.ok(preview.aim.targets.includes(s.enemies[0].id));
 const result=exchange(s,actor,3,2,'impulso');
 const attack=result.events.find(e=>e.actorId===actor&&e.type==='skill');
 assert.ok(attack?.totalDamage>0);
 assert.equal(s.resources.cinza,0);
 assert.ok(s.allies[0].cooldowns.impulso>0);
});

test('cada invasão oferece três escolhas e a chegada do trio mantém a partida ativa',()=>{
 const s=battle();
 for(const u of s.enemies)u.stunned=5;
 const first=allies[0],second=allies[1],third=allies[2];
 Object.assign(s.tactical.positions,{[first]:{x:7,y:1},[second]:{x:7,y:3},[third]:{x:7,y:5}});
 const result=exchange(s,first,8,1);
 assert.equal(result.chestRewards[0].options.length,3);
 assert.equal(s.tactical.stage,'reward');
 assert.ok(chooseTacticalChestReward(s,result.chestRewards[0].id,'leap').ok);
 assert.ok(findPath(s,first,{x:6,y:2}));
 const another=exchange(s,second,8,3);
 assert.ok(chooseTacticalChestReward(s,another.chestRewards[0].id,another.chestRewards[0].options[0].id).ok);
 const last=exchange(s,third,8,5);
 assert.equal(last.finished,false);
 assert.equal(last.chestRewards.length,1);
 assert.ok(s.allies.every(unit=>s.tactical.positions[unit.id].x===8));
 assert.ok(chooseTacticalChestReward(s,last.chestRewards[0].id,last.chestRewards[0].options[0].id).ok);
 assert.equal(s.tactical.stage,'planning');
});

test('a IA ainda pode avançar com o ataque equipado em recarga',()=>{
 const s=battle();
 for(const unit of s.enemies)for(const ability of unit.abilities)unit.cooldowns[ability.id]=2;
 const plan=planTacticalAIActivation(s);
 assert.ok(plan);
 const result=previewTacticalActivation(s,'enemy',plan.actorId,plan.actions);
 assert.ok(result.ok);
 assert.equal(result.aim,null);
});

test('um invasor só ganha outro aprimoramento depois de passar pela própria fortaleza',()=>{
 const s=battle(),id=allies[0];
 for(const enemy of s.enemies)enemy.stunned=50;
 function advance(from,to){
  s.tactical.activation.spent=[];
  s.tactical.positions[id]={x:from,y:1};
  const result=submitTacticalActivation(s,'player',id,order(id,to,1));
  assert.ok(result.ok,result.reason);
  return result;
 }
 const first=advance(7,8).chestRewards[0];
 assert.ok(chooseTacticalChestReward(s,first.id,first.options[0].id).ok);
 assert.deepEqual(advance(7,8).chestRewards,[]);
 assert.deepEqual(advance(1,0).chestRewards,[]);
 const again=advance(7,8).chestRewards[0];
 assert.ok(again);
 assert.notEqual(again.id,first.id);
});

test('uma baixa concede três opções aos sobreviventes uma única vez e nenhuma revive',()=>{
 const s=battle(),actor=allies[0];
 for(const enemy of s.enemies)enemy.stunned=50;
 s.allies[1].hp=0;
 const first=submitTacticalActivation(s,'player',actor,order(actor,1,1));
 const [offer]=first.chestRewards;
 assert.equal(offer.source,'loss');
 assert.equal(offer.options.length,3);
 assert.ok(offer.options.every(option=>option.effect.type!=='revive'));
 chooseTacticalChestReward(s,offer.id,offer.options[0].id);
 const another=submitTacticalActivation(s,'player',allies[2],order(allies[2],1,5));
 assert.deepEqual(another.chestRewards,[]);
 assert.equal(s.allies[1].hp,0);
});

test('fecha as bordas após as rodadas 10, 15 e 25 e expulsa ocupantes para casas centrais',()=>{
 const s=battle(),actor=allies[0];
 for(const enemy of s.enemies)enemy.stunned=100;
 const limits=[[10,42],[15,28],[25,20]];
 for(const [round,total] of limits){
  s.round=round;
  s.allies[0].stunned=0;
  s.tactical.activation.spent=allies.slice(1);
  s.tactical.positions[actor]={x:3,y:3};
  const other=allies[1];
  s.tactical.positions[other]=round===10?{x:1,y:2}:round===15?{x:0,y:0}:{x:2,y:2};
  const result=submitTacticalActivation(s,'player',actor,order(actor,4,3));
  assert.ok(result.ok);
  const closing=result.events.find(event=>event.closure);
  assert.ok(closing);
  assert.equal(boardCells(s).length,total);
  const pushed=closing.moves.find(step=>step.actorId===other);
  assert.ok(pushed);
  assert.ok(pushed.to.x>0&&pushed.to.x<8);
  assert.equal(new Set([...s.allies,...s.enemies].map(u=>JSON.stringify(s.tactical.positions[u.id]))).size,6);
 }
 s.tactical.positions[actor]={x:3,y:3};
 assert.ok(findPath(s,actor,{x:0,y:3}));
});

test('o aviso de fechamento usa as mesmas faixas que a arena remove',()=>{
 const s=battle();
 assert.equal(fortressClosure(s,9),null);
 assert.deepEqual(fortressClosure(s,10),{axis:'x',tracks:[1,7]});
 assert.deepEqual(fortressClosure(s,15),{axis:'y',tracks:[0,5]});
 assert.deepEqual(fortressClosure(s,25),{axis:'x',tracks:[2,6]});
 assert.equal(fortressClosure(s,26),null);
 assert.equal(fortressClosure({tactical:{}},10),null);
});

test('os dois trios começam com ataque básico frontal equipado e podem usá-lo em rodadas consecutivas',()=>{
 const s=battle(),actor=allies[0],target=s.enemies[0].id,basic='fortress-basic';
 for(const unit of [...s.allies,...s.enemies]){
  assert.equal(s.tactical.fortress.equipped[unit.id],basic);
  assert.equal(unit.abilities.filter(a=>a.id===basic).length,1);
 }
 for(const unit of s.enemies)unit.stunned=5;
 s.tactical.positions[target]={x:4,y:2};
 for(let round=1;round<=2;round++){
  assert.equal(s.round,round);
  s.tactical.positions[actor]={x:2,y:2};
  const result=exchange(s,actor,3,2);
  const hit=result.events.find(e=>e.actorId===actor&&e.type==='skill');
  assert.equal(hit?.abilityId,basic);
  assert.deepEqual(hit.cells,[{x:4,y:2}]);
  assert.ok(hit.totalDamage>0);
  assert.equal(s.allies[0].cooldowns[basic],undefined);
  if(round===1){
   assert.ok(exchange(s,allies[1],1,3).ok);
   assert.ok(exchange(s,allies[2],1,5).ok);
  }
 }
 const classic=createTacticalBattle(allies,rivals);
 assert.ok(classic.allies.every(unit=>!unit.abilities.some(a=>a.id===basic)));
});

test('o dano usa a superfície anterior e as reações mudam o piso depois do contato',()=>{
 const cast=(element,surface)=>{
  const s=battle(),actor=s.allies[0],target=s.enemies[0],point={x:4,y:2};
  for(const enemy of s.enemies.slice(1))enemy.stunned=5;
  s.tactical.positions[actor.id]={x:2,y:2};
  s.tactical.positions[target.id]=point;
  target.armor=0;
  actor.abilities[0]={...actor.abilities[0],element,_formRoot:{...actor.abilities[0]._formRoot,element}};
  if(surface)s.tactical.surfaces[cellKey(point)]={element:surface,until:3};
  const result=submitTacticalActivation(s,'player',actor.id,order(actor.id,3,2,'impulso'));
  assert.ok(result.waiting);
  const response=submitTacticalActivation(s,'enemy',target.id,order(target.id,4,3));
  // Move away in the opponent's sealed order and move the hit cell to the new lane.
  return {s,response,point,target};
 };
 const empty=cast('water',null);
 assert.equal(surfaceAt(empty.s,empty.point)?.element,'water');
 function impact(element,surface){
  const s=battle(),actor=s.allies[0],target=s.enemies[0],point={x:4,y:2};
  for(const enemy of s.enemies)enemy.stunned=3;
  s.tactical.positions[actor.id]={x:2,y:2};
  s.tactical.positions[target.id]=point;
  actor.abilities[0]={...actor.abilities[0],element,_formRoot:{...actor.abilities[0]._formRoot,element}};
  if(surface)s.tactical.surfaces[cellKey(point)]={element:surface,until:3};
  const result=submitTacticalActivation(s,'player',actor.id,order(actor.id,3,2,'impulso'));
  return {event:result.events.find(e=>e.abilityId==='impulso'),s,point,target};
 }
 const plain=impact('fire',null),steam=impact('fire','water'),ignite=impact('fire','oil');
 assert.ok(steam.event.totalDamage<plain.event.totalDamage);
 assert.ok(ignite.event.totalDamage>plain.event.totalDamage);
 assert.equal(steam.event.elemental.changes['4,2'],'steam');
 assert.equal(surfaceAt(steam.s,steam.point),null);
 assert.equal(surfaceAt(ignite.s,ignite.point).element,'fire');
 const wind=impact('air','water');
 assert.deepEqual(wind.event.elemental.stuns,[wind.target.id]);
 assert.equal(wind.target.boardFresh.stunned,1);
 wind.s.round=3;pruneSurfaces(wind.s);
 assert.equal(surfaceAt(wind.s,wind.point),null);
});

test('Tempestade começa na rodada 4 e o Vendaval permite dois passos livres e uma técnica',()=>{
 const s=battle(),actor=s.allies[0];
 s.round=3;
 for(const enemy of s.enemies)enemy.stunned=3;
 s.tactical.activation.spent=allies.slice(1);
 const result=submitTacticalActivation(s,'player',actor.id,order(actor.id,1,1));
 const storm=result.events.find(e=>e.type==='field-event');
 assert.equal(storm.id,'storm');
 assert.equal(storm.strikes.length,2);
 assert.equal(s.allies.filter(u=>u.stunned).length,1);
 assert.ok(storm.cells.every(point=>surfaceAt(s,point)?.until===9));
 s.round=8;actor.stunned=0;
 for(const enemy of s.enemies)enemy.stunned=3;
 assert.equal(applyFieldEvent(s).id,'wind');
 const from=s.tactical.positions[actor.id],to={x:from.x+2,y:from.y};
 const path=findPath(s,actor.id,to);
 assert.equal(path.length,2);
 s.tactical.obstacles.push(path[0]);
 assert.equal(findPath(s,actor.id,to),null);
 s.tactical.obstacles.pop();
 const move={type:'move',actorId:actor.id,path,abilityId:'despertar'};
 const windy=submitTacticalActivation(s,'player',actor.id,[move]);
 assert.equal(windy.events.filter(e=>e.type==='exchange-move').length,2);
 assert.ok(windy.events.some(e=>e.type==='skill'&&e.abilityId==='despertar'));
});

test('área frontal segue a direção da grade e termina no obstáculo',()=>{
 const s=battle(),actor=s.allies[0],basic=actor.abilities.find(a=>a.id==='fortress-basic');
 s.tactical.positions[actor.id]={x:2,y:2};
 assert.deepEqual(tacticalArea(s,actor,basic,{x:2,y:2},[1,-1]),[{x:3,y:1}]);
 s.tactical.obstacles=[{x:3,y:1}];
 assert.deepEqual(tacticalArea(s,actor,basic,{x:2,y:2},[1,-1]),[]);
});
