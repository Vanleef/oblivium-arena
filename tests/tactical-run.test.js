import test from 'node:test';
import assert from 'node:assert/strict';
import {createTacticalBattle} from '../src/tactical-combat.js';
import {createTacticalRun,offerTacticalRewards,chooseTacticalReward,advanceTacticalRun} from '../src/tactical-run.js';

const player=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
const enemy=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];

test('vitória oferece três melhorias únicas e a escolhida acompanha o próximo encontro',()=>{
 const run=createTacticalRun(),battle=createTacticalBattle(player,enemy,{seed:19});
 battle.phase='victory';battle.tactical.stage='finished';battle.allies[0].hp=71;
 const offers=offerTacticalRewards(run,battle,19);assert.equal(offers.length,3);assert.equal(run.teamHealth[battle.allies[0].id],71);
 assert.equal(chooseTacticalReward(run,offers,offers[0].id),true);assert.equal(chooseTacticalReward(run,offers,offers[0].id),false);
 const next=advanceTacticalRun(run,battle);assert.equal(next.player.length,3);assert.equal(next.enemy.length,3);assert.deepEqual(next.buffs,[offers[0].id]);assert.equal(next.teamHealth[battle.allies[0].id],71);
 const nextBattle=createTacticalBattle(next.player,next.enemy,next);assert.equal(nextBattle.allies[0].hp,71);
 const upgrade=createTacticalBattle(next.player,next.enemy,{...next,buffs:['ward']});assert.equal(upgrade.allies[0].shield,12);
});

test('não oferece melhorias nem avança expedição sem vitória concluída',()=>{
 const run=createTacticalRun(),battle=createTacticalBattle(player,enemy,{seed:2});
 assert.deepEqual(offerTacticalRewards(run,battle,2),[]);assert.equal(advanceTacticalRun(run,battle),null);assert.equal(run.encounter,1);
});
