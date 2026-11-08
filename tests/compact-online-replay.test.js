import test from 'node:test';
import assert from 'node:assert/strict';
import {onlineReplayFrames,onlineReplayBattle} from '../src/compact-online-replay.js';
import {createCompactPvpBattle,publicCompactPvpBattle,submitCompactPvpPlan} from '../server/compact-pvp.js';
import {boardCells,findPath} from '../src/tactical-board.js';

const ids=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
const rivals=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];

test('a resolved server movement replays public snapshots without exposing objectives',()=>{
 const battle=createCompactPvpBattle(ids,rivals,{seed:17});
 const unit=battle.allies[0];
 const destination=boardCells(battle).find(cell=>findPath(battle,unit.id,cell,1));
 const path=findPath(battle,unit.id,destination,1);
 assert.equal(submitCompactPvpPlan(battle,'player',1,[{type:'move',actorId:unit.id,path}]).ok,true);
 assert.equal(submitCompactPvpPlan(battle,'enemy',1,[]).ok,true);
 const view=publicCompactPvpBattle(battle,'player');
 const event=view.tactical.events.find(item=>item.type==='exchange-move');
 const frames=onlineReplayFrames(event);
 assert.equal(frames.length,2);
 assert.deepEqual(frames[0].snapshot.positions[unit.id],event.before.positions[unit.id]);
 assert.deepEqual(frames[1].snapshot.positions[unit.id],destination);
 const projected=onlineReplayBattle(view,frames[0].snapshot);
 assert.deepEqual(projected.tactical.objectives,{});
 assert.deepEqual(projected.tactical.positions,event.before.positions);
 assert.notEqual(projected.tactical.positions,view.tactical.positions);
 assert.deepEqual(view.tactical.positions[unit.id],destination);
});

test('skill frames switch to the server result at impact and a blocked special visibly misses',()=>{
 const unit={id:'actor',abilities:[{id:'voto',target:'enemy',damage:10}]};
 const before={allies:[unit],enemies:[{id:'target',hp:100}],positions:{actor:{x:1,y:1}},round:1};
 const after={...before,enemies:[{id:'target',hp:90}]};
 const event={type:'skill',actorId:'actor',abilityId:'voto',before,after,anchor:{x:2,y:1}};
 const frames=onlineReplayFrames(event);
 const impact=frames.findIndex(frame=>frame.pose.pose==='impact');
 assert.ok(impact>0);
 assert.equal(frames[impact-1].snapshot,before);
 assert.equal(frames[impact].snapshot,after);
 const blocked=onlineReplayFrames({...event,after:before,affectedTargetIds:[],duel:{outcome:'miss'}});
 assert.ok(blocked.some(frame=>frame.pose.duelMiss));
 assert.ok(blocked.every(frame=>frame.pose.pose!=='impact'));
 assert.equal(blocked.at(-1).snapshot,before);
 assert.deepEqual(onlineReplayFrames({type:'skill'}),[]);
});
