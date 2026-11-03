import test from 'node:test';
import assert from 'node:assert/strict';
import {createTacticalBattle,previewTacticalPlan,submitTacticalPlan,resolveTacticalRound} from '../src/tactical-combat.js';
import {movementRange,findPath} from '../src/tactical-board.js';
import {addTacticalAugment,tacticalChestOptions} from '../src/tactical-chests.js';
import {tacticalHandGroups,tacticalSlotAction,reorderTacticalSlots,tacticalTurnIncome} from '../src/tactical-hand.js';
const ids=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
const setup=()=>{const s=createTacticalBattle(ids,['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'],{seed:1});for(const u of [...s.allies,...s.enemies])u.passive=null;for(const key of ['resources','enemyResources'])Object.assign(s[key],{essence:20,cinza:20,graca:20,ruptura:20});return s;};
const round=(s,actions=[])=>{assert.equal(submitTacticalPlan(s,'player',actions).ok,true);assert.equal(submitTacticalPlan(s,'enemy',[]).ok,true);assert.equal(resolveTacticalRound(s).ok,true);};
test('a mão preserva a ordem da formação e oculta habilidades em recarga',()=>{
 const s=setup(),u=s.allies[0];u.cooldowns.tecnica=2;const before=JSON.stringify(s),groups=tacticalHandGroups(s,[]);
 assert.deepEqual(groups.map(g=>g.unit.id),ids);assert.ok(!groups[0].abilities.some(a=>a.id==='tecnica'));assert.ok(groups[1].abilities.length);assert.equal(JSON.stringify(s),before);
});
test('carta usada com recarga sai da mão planejada e retorna somente após quatro rodadas',()=>{
 const s=setup(),u=s.allies[0],action={type:'skill',actorId:u.id,abilityId:'despertar',anchor:s.tactical.positions[u.id],orientation:[1,0],formKey:'base'};
 assert.ok(!tacticalHandGroups(s,[action])[0].abilities.some(a=>a.id==='despertar'));round(s,[action]);
 for(let i=0;i<4;i++){assert.ok(!tacticalHandGroups(s,[])[0].abilities.some(a=>a.id==='despertar'));round(s);}
 assert.ok(tacticalHandGroups(s,[])[0].abilities.some(a=>a.id==='despertar'));
});
test('trocar encaixes altera a ordem do personagem e exige revisar caminhos dependentes',()=>{
 const s=setup(),id=s.allies[0].id,actions=[{type:'move',actorId:id,path:[{x:1,y:1}]},{type:'move',actorId:id,path:[{x:2,y:1}]}],before=JSON.stringify(actions);
 assert.equal(previewTacticalPlan(s,'player',actions).ok,true);const swapped=reorderTacticalSlots(actions,id,0,1);
 assert.equal(tacticalSlotAction(swapped,id,0).action,actions[1]);assert.equal(previewTacticalPlan(s,'player',swapped).ok,false);assert.equal(JSON.stringify(actions),before);
 assert.equal(previewTacticalPlan(s,'player',reorderTacticalSlots(swapped,id,0,1)).ok,true);
});
test('Passo Ampliado aumenta o alcance deste lado e não se acumula indevidamente',()=>{
 const s=setup(),u=s.allies[0];assert.equal(movementRange(s,u.id),1);assert.equal(findPath(s,u.id,{x:2,y:0}),null);
 let offered=false;for(let round=1;round<20;round++){s.round=round;if(tacticalChestOptions(s,'player','silver').some(o=>o.id==='movement-range'))offered=true;}assert.equal(offered,true);
 addTacticalAugment(s,'player',{type:'movement-range',amount:1,title:'Passo Ampliado'});assert.equal(movementRange(s,u.id),2);assert.equal(findPath(s,u.id,{x:2,y:0}).length,2);assert.equal(movementRange(s,s.enemies[0].id),1);
 addTacticalAugment(s,'player',{type:'movement-range',amount:1});assert.equal(movementRange(s,u.id),2);addTacticalAugment(s,'player',{type:'movement-range',amount:2});assert.equal(movementRange(s,u.id),3);
 const fresh=createTacticalBattle(ids,['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde']);assert.equal(movementRange(fresh,u.id),1);
});
test('recebimento de Essências se refere à rodada atual e o total permanece separado',()=>{
 const s=setup();const incoming=tacticalTurnIncome(s);assert.equal(Object.values(incoming).reduce((a,b)=>a+b),3);assert.ok(Object.values(s.resources).reduce((a,b)=>a+b)>3);round(s);assert.equal(Object.values(tacticalTurnIncome(s)).reduce((a,b)=>a+b),3);
});
