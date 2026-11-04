import test from 'node:test';
import assert from 'node:assert/strict';
import {createTacticalBattle,submitTacticalPlan,resolveTacticalRound,chooseTacticalChestReward,previewTacticalPlan} from '../src/tactical-combat.js';
import {tacticalChestOptions,tacticalChestResource,addTacticalAugment,triggerTacticalAugments} from '../src/tactical-chests.js';
const allies=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],enemies=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
function setup(){const s=createTacticalBattle(allies,enemies,{seed:1});for(const u of [...s.allies,...s.enemies])u.passive=null;return s;}
const round=(s,refs=[])=>{assert.equal(submitTacticalPlan(s,'player',refs).ok,true);assert.equal(submitTacticalPlan(s,'enemy',[]).ok,true);return resolveTacticalRound(s);};
test('baús oferecem três escolhas únicas, contextualizadas e determinísticas',()=>{
 const s=setup(),before=JSON.stringify(s),a=tacticalChestOptions(s,'player','silver');assert.equal(a.length,3);assert.equal(new Set(a.map(o=>o.id)).size,3);assert.ok(!a.some(o=>['heal','cleanse','revive'].includes(o.id)));assert.deepEqual(tacticalChestOptions(s,'player','silver'),a);assert.equal(JSON.stringify(s),before);
 s.allies[1].hp=15;const hurt=tacticalChestOptions(s,'player','silver');assert.ok(hurt.some(o=>o.id==='heal'));assert.ok(hurt.find(o=>o.id==='heal').reason.includes('Lira'));
 s.allies[1].hp=100;s.allies[1].stunned=2;assert.ok(tacticalChestOptions(s,'player','silver').some(o=>o.id==='cleanse'));
});
test('baú da quarta rodada preserva Prateado, Dourado e Prismático por vivos',()=>{
 for(const alive of [3,2,1]){const s=setup();for(let i=alive;i<3;i++)s.allies[i].hp=0;s.round=4;s.resources={essence:20,cinza:20,graca:20,ruptura:20};s.tactical.chests=[{id:'test',position:{x:2,y:1}}];const actor=s.allies[0];s.tactical.positions[actor.id]={x:1,y:1};const result=round(s,[{type:'skill',actorId:actor.id,abilityId:'impulso',anchor:{x:2,y:1},orientation:[1,0],formKey:'base'}]);const offer=result.chestRewards[0];assert.ok(offer);assert.equal(offer.tier,{3:'silver',2:'gold',1:'prismatic'}[alive]);assert.equal(offer.options.length,3);if(alive<3)assert.ok(offer.options.every(o=>o.id!=='revive'));}
});
test('Passo Residual aplica escudo após mover, uma vez por alma por rodada',()=>{
 const s=setup(),actor=s.allies[0];addTacticalAugment(s,'player',{type:'step-ward',amount:8,title:'Passo Residual'});const initial=actor.shield;
 const before=JSON.stringify(s),preview=previewTacticalPlan(s,'player',[{type:'move',actorId:actor.id,path:[{x:1,y:1}]}]);assert.equal(preview.ok,true);assert.equal(JSON.stringify(s),before);
 const result=round(s,[{type:'move',actorId:actor.id,path:[{x:1,y:1}]},{type:'move',actorId:actor.id,path:[{x:2,y:1}]}]);const moves=result.events.filter(e=>e.type==='move');assert.equal(moves[0].after.allies[0].shield,initial+8);assert.equal(moves[1].after.allies[0].shield,initial+8);assert.ok(moves[0].augmentNotes.length);
});
test('Colher a Brecha exige dano confirmado e tem limite por rodada',()=>{
 const s=setup(),actor=s.allies[0];addTacticalAugment(s,'player',{type:'exposed-essence',resource:'cinza'});const before=s.resources.cinza;
 assert.equal(triggerTacticalAugments(s,'player',actor,'skill',{exposedHit:false}).length,0);assert.equal(s.resources.cinza,before);
 assert.equal(triggerTacticalAugments(s,'player',actor,'skill',{exposedHit:true}).length,1);assert.equal(s.resources.cinza,before+1);assert.equal(triggerTacticalAugments(s,'player',actor,'skill',{exposedHit:true}).length,0);
});
test('Fonte Ritual expira sem antecipar Essência e ofertas sobrevivem ao estado máximo',()=>{
 const s=setup(),actor=s.allies[0];addTacticalAugment(s,'player',{type:'round-essence',resource:'cinza',rounds:2,amount:1});let n=s.resources.cinza;round(s);assert.equal(s.resources.cinza>=n+1,true);round(s);assert.equal(triggerTacticalAugments(s,'player',actor,'round-end').length,0);
 for(const u of s.allies){u.hp=u.maxHp;u.shield=u.maxHp/2;u.boost=100;}addTacticalAugment(s,'player',{type:'step-ward',amount:18});addTacticalAugment(s,'player',{type:'exposed-essence',resource:'cinza'});assert.equal(tacticalChestOptions(s,'player','silver').length,3);
});
test('somente o controlador pode escolher a oferta pendente',()=>{
 const s=setup(),options=tacticalChestOptions(s,'player','silver');s.tactical.pendingChestRewards=[{id:'offer',side:'player',tier:'silver',options}];s.tactical.stage='reward';assert.equal(chooseTacticalChestReward(s,'other',options[0].id).ok,false);assert.equal(chooseTacticalChestReward(s,'offer','forged').ok,false);assert.equal(chooseTacticalChestReward(s,'offer',options[0].id).ok,true);assert.equal(chooseTacticalChestReward(s,'offer',options[0].id).ok,false);
});
test('a recompensa não oferece uma Essência que o trio não utiliza',()=>{
 const s=setup();for(const u of s.allies)u.abilities=[{id:'test',costs:{cinza:1},damage:5,target:'enemy'}];s.resources={cinza:50,essence:0,graca:0,ruptura:0};assert.equal(tacticalChestResource(s,'player'),'cinza');
});
test('Essência de combo não financia ações futuras antes da geração',()=>{
 const s=setup(),u=s.allies[1];s.resources={cinza:1,graca:1,essence:0,ruptura:0};s.enemies[0].exposed=1;s.tactical.positions[s.enemies[0].id]={x:2,y:2};addTacticalAugment(s,'player',{type:'exposed-essence',resource:'cinza'});
 const plan=[{type:'skill',actorId:u.id,abilityId:'impulso',anchor:{x:2,y:2},orientation:[1,0],formKey:'base'},{type:'skill',actorId:u.id,abilityId:'tecnica',anchor:s.tactical.positions[u.id],orientation:[1,0],formKey:'base'}];assert.equal(previewTacticalPlan(s,'player',plan).ok,false);
});

test('aviso público reserva casa na rodada anterior e o baú surge ali mesmo ocupada',()=>{
 const s=createTacticalBattle(['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'],{seed:1});
 const tick=()=>{assert.equal(submitTacticalPlan(s,'player',[]).ok,true);assert.equal(submitTacticalPlan(s,'enemy',[]).ok,true);return resolveTacticalRound(s);};
 tick();assert.equal(s.round,2);assert.equal(s.tactical.nextChest,undefined);
 tick();assert.equal(s.round,3);assert.equal(s.tactical.nextChest.round,4);const point={...s.tactical.nextChest.position};
 s.tactical.positions[s.allies[0].id]={...point};
 const clone=JSON.parse(JSON.stringify(s));assert.deepEqual(clone.tactical.nextChest,s.tactical.nextChest);
 const result=tick();assert.equal(s.round,4);assert.deepEqual(s.tactical.chests[0].position,point);assert.equal(s.tactical.nextChest,null);assert.equal(result.events.find(e=>e.type==='chest-spawn').after.nextChest,null);
});
