import test from 'node:test';
import assert from 'node:assert/strict';
import {createTacticalBattle,previewTacticalActivation,submitTacticalActivation,chooseTacticalChestReward} from '../src/tactical-combat.js';
import {boardCells,findPath,cellLabel} from '../src/tactical-board.js';
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
 const result=exchange(s,actor,3,2,'impulso');
 const attack=result.events.find(e=>e.actorId===actor&&e.type==='skill');
 assert.ok(attack?.totalDamage>0);
 assert.equal(s.resources.cinza,0);
 assert.ok(s.allies[0].cooldowns.impulso>0);
});

test('a primeira invasão oferece três escolhas e o terceiro aliado na fortaleza encerra a partida',()=>{
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
 assert.ok(last.finished);
 assert.equal(s.phase,'victory');
});
