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

test('trilhas mantêm derrotados, limitam cura e aplicam risco somente à oposição',()=>{
 const battle=createTacticalBattle(player,enemy,{seed:7});battle.phase='victory';battle.tactical.stage='finished';battle.allies[0].hp=96;battle.allies[1].hp=40;battle.allies[2].hp=0;
 const run=createTacticalRun(),next=advanceTacticalRun(run,battle,'recovery');
 assert.deepEqual(Object.values(next.teamHealth),[100,58,0]);assert.equal(run.history[0].route,'recovery');
 const riskRun=createTacticalRun(),risk=advanceTacticalRun(riskRun,battle,'risk'),nextBattle=createTacticalBattle(risk.player,risk.enemy,risk);
 assert.equal(riskRun.rewardCount,4);assert.ok(nextBattle.enemies.every(u=>u.shield>=18));assert.equal(nextBattle.allies[0].shield,0);
 nextBattle.phase='victory';nextBattle.tactical.stage='finished';assert.equal(offerTacticalRewards(riskRun,nextBattle,7).length,4);
});
test('descoberta altera adversários e trilha inválida não modifica a expedição',()=>{
 const battle=createTacticalBattle(player,enemy);battle.phase='victory';battle.tactical.stage='finished';
 const run=createTacticalRun(),before=JSON.stringify(run);assert.equal(advanceTacticalRun(run,battle,'inventada'),null);assert.equal(JSON.stringify(run),before);
 const next=advanceTacticalRun(run,battle,'discovery');assert.equal(new Set(next.enemy).size,3);assert.notDeepEqual(next.enemy,enemy);assert.deepEqual(next.player,player);assert.doesNotThrow(()=>createTacticalBattle(next.player,next.enemy,next));
});

test('Conquista leva aprimoramentos táticos e criaturas a encontros de até cinco oponentes',()=>{
 const s=createTacticalBattle(player,enemy,{fortress:true});
 s.phase='victory';s.tactical.stage='finished';
 const run=createTacticalRun();
 const offers=offerTacticalRewards(run,s,1);
 assert.ok(chooseTacticalReward(run,offers,'shield'));
 run.encounter=3;
 const next=advanceTacticalRun(run,s,'risk');
 const battle=createTacticalBattle(next.player,next.enemy,{...next,fortress:true});
 assert.equal(battle.enemies.length,5);
 assert.equal(battle.enemies.filter(unit=>unit.npcOnly).length,2);
 assert.equal(new Set(battle.enemies.map(unit=>JSON.stringify(battle.tactical.positions[unit.id]))).size,5);
 assert.ok(battle.allies.every(unit=>unit.shield>=12));
});

test('técnicas de Conquista convertem roubo e geração em efeitos úteis sem Essência',async()=>{
 const {conquestTechnique}=await import('../src/conquest-techniques.js');
 const ability={target:'enemy',damage:12,steal:2,generateEssence:{resource:'cinza',amount:1}};
 const revised=conquestTechnique(ability);
 assert.equal(revised.stripShield,6);
 assert.equal(revised.shield,10);
 assert.equal(revised.steal,0);
 assert.equal(revised.generateEssence,null);
 assert.equal(ability.steal,2);
});
