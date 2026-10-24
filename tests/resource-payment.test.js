import test from 'node:test';
import assert from 'node:assert/strict';
import {characters,starters,resources,resourceById} from '../src/data.js';
import {createFinalBoss} from '../src/final-boss.js';
import {previewBodyForm} from '../src/body-forms.js';
import {createBattle,createDuel,chooseAction,commitTurn,resolveNextAction,getTurnPayment,canAffordAbility,getAvailableResources,getCombatPlan,submitDuelTurn} from '../src/combat.js';
import {getAbilityResourceCosts,resolveResourcePayment,allocateQueuePayment,resourceIds} from '../src/resource-costs.js';
import {renderBattle,renderBattleDetail} from '../src/battle-view.js';
import {costMarkup} from '../src/view-utils.js';
const pool=values=>({essence:0,cinza:0,graca:0,ruptura:0,...values});
const target={id:'target',name:'Treino',realm:'Inferno',maxHp:1000,abilities:[]};
function battle(costs){const b=createBattle(starters.map(c=>c.id),[target],{rng:()=>0,enemyPlanner:()=>[]});b.allies.forEach((u,i)=>u.abilities=[{id:'use',name:`Uso ${i}`,target:'enemy',damage:10,costs:costs[i]||{}}]);return b;}
function queue(b,i){const u=b.allies[i];return chooseAction(b,u.id,'use',b.enemies[0].id);}
const snapshot=b=>JSON.stringify(b);

test('Aleatório é um custo preto, sem quinto recurso sorteado; todas as quartas defesas custam 1',()=>{
 assert.equal(resources.length,4);assert.equal(resourceById.random.name,'Aleatório');
 for(const c of [...characters,createFinalBoss()]){assert.equal(c.abilities[3].invulnerable,1);assert.deepEqual(c.abilities[3].costs,{random:1},c.name);assert.match(costMarkup(c,c.abilities[3]),/Custo: 1 Aleatório/);assert.match(costMarkup(c,c.abilities[3]),/pip-random/);}
 const ordinary=characters.filter(c=>c.abilities.slice(0,3).some(a=>a.costs.random));assert.equal(ordinary.length,12);
 const b=battle([{}]);assert.deepEqual(Object.keys(b.resources),resourceIds);assert.ok(!b.energyDraws.player.includes('random'));
});

test('cada corpo usa um recurso próprio no motor e no preview; o custo Aleatório não muda com o corpo',()=>{
 for(const c of [createFinalBoss(),...characters.filter(c=>c.bodyForms)]){
  const seen=new Set([c.affinity]);
  for(const f of c.bodyForms){assert.ok(!seen.has(f.resource),`${c.name}/${f.name}`);seen.add(f.resource);const p=previewBodyForm(c,f.key);assert.equal(p.bodyResource,f.resource);assert.deepEqual(getAbilityResourceCosts(p,p.abilities[3]),{random:1});for(const a of p.abilities.slice(0,3)){if(a.costs.affinity)assert.equal(getAbilityResourceCosts(p,a)[f.resource]>=a.costs.affinity,true);}}
  assert.equal(previewBodyForm(c,'base').bodyResource,c.affinity);
 }
});

test('reserva os custos fixos de toda a fila antes de sugerir o pagamento flexível',()=>{
 const b=battle([{random:1},{essence:1},{random:1}]);b.resources=pool({essence:1,cinza:1});assert.equal(queue(b,0).ok,true);assert.equal(queue(b,1).ok,true);
 const p=getTurnPayment(b);assert.equal(p.ok,true);assert.deepEqual(p.fixed,pool({essence:1}));assert.deepEqual(p.selected,pool({cinza:1}));assert.equal(canAffordAbility(b,b.allies[2],b.allies[2].abilities[0]),false);
 assert.deepEqual(getAvailableResources(b),pool({cinza:1}));assert.deepEqual(b.resources,pool({essence:1,cinza:1}));
 assert.equal(commitTurn(b,pool({cinza:1})).ok,true);resolveNextAction(b);assert.deepEqual(b.resources,pool({essence:1}));resolveNextAction(b);assert.deepEqual(b.resources,pool({}));
});

test('um custo misto aceita qualquer combinação escolhida e debita cada tipo exatamente uma vez',()=>{
 const b=battle([{cinza:1,random:2}]);b.resources=pool({cinza:1,essence:3,ruptura:2});queue(b,0);
 const selected=pool({essence:1,ruptura:1});assert.equal(commitTurn(b,selected).ok,true);assert.equal(resolveNextAction(b).event.skipped,false);assert.deepEqual(b.resources,pool({essence:2,ruptura:1}));
});

test('seleção parcial, excessiva, negativa, fracionária, desconhecida ou malformada não confirma nem altera o combate',()=>{
 const b=battle([{random:2}]);b.resources=pool({essence:3,cinza:2});queue(b,0);
 for(const selected of [{},{essence:1},{essence:3},{essence:-1,cinza:3},{essence:.5,cinza:1.5},{essence:NaN},{random:2},{fake:2},[],2,'2']){const before=snapshot(b);assert.equal(commitTurn(b,selected).ok,false,JSON.stringify(selected));assert.equal(snapshot(b),before);}
 for(const costs of [{random:-1},{random:NaN},{random:Infinity},{fake:1}])assert.equal(resolveResourcePayment(costs,b.resources).ok,false);
});

test('Atordoamento devolve o custo daquela ação sem trocar o pagamento das demais',()=>{
 const b=battle([{random:1},{random:1}]);b.resources=pool({essence:1,cinza:1});queue(b,0);queue(b,1);commitTurn(b,pool({essence:1,cinza:1}));b.allies[0].stunned=1;
 assert.equal(resolveNextAction(b).event.skipped,true);assert.deepEqual(b.resources,pool({essence:1,cinza:1}));resolveNextAction(b);assert.deepEqual(b.resources,pool({essence:1}));
});

test('drenagem do recurso escolhido impede a ação sem substituir por outra cor disponível',()=>{
 const b=battle([{random:1}]);b.resources=pool({essence:2,cinza:1});queue(b,0);commitTurn(b,pool({cinza:1}));b.resources.cinza=0;
 const before={...b.resources},r=resolveNextAction(b);assert.equal(r.event.skipped,true);assert.deepEqual(b.resources,before);
});

test('perda de alvo antes da resolução preserva todos os recursos escolhidos',()=>{
 const b=battle([{random:1}]);b.resources=pool({graca:1});queue(b,0);commitTurn(b);b.enemies[0].invulnerable=1;const before={...b.resources};assert.equal(resolveNextAction(b).event.skipped,true);assert.deepEqual(b.resources,before);
});

test('duelo valida o pagamento agregado nos dois lados e ignora tentativas de falsificar custo por ação',()=>{
 const b=createDuel(starters.slice(0,1).map(c=>c.id),starters.slice(0,1).map(c=>c.id),{rng:()=>0});b.resources=pool({ruptura:1});b.enemyResources=pool({cinza:1});
 const first=b.allies[0],second=b.enemies[0],action=u=>({actorId:u.id,abilityId:'despertar',targetId:u.id,randomPayment:{fake:999},costs:{}});
 const before=snapshot(b);assert.throws(()=>submitDuelTurn(b,'player',[action(first)],{graca:1}));assert.equal(snapshot(b),before);
 submitDuelTurn(b,'player',[action(first)],{ruptura:1});assert.deepEqual(b.resources,pool({}));assert.equal(first.invulnerable,1);
 submitDuelTurn(b,'enemy',[action(second)],{cinza:1});assert.equal(second.cooldowns.despertar,4);assert.equal(second.invulnerable,1);assert.equal(b.enemyResources.cinza,0);
});

test('IA fixa pagamentos concretos e não cria uma reserva Aleatório',()=>{
 const b=battle([{}]);const e=b.enemies[0];e.abilities=[{id:'wild',name:'Ataque',target:'enemy',damage:40,costs:{random:2}}];b.enemyResources=pool({graca:1,ruptura:1});const before=snapshot(b),plan=getCombatPlan(b);assert.equal(snapshot(b),before);assert.equal(plan.length,1);assert.deepEqual(plan[0].randomPayment,pool({graca:1,ruptura:1}));assert.equal(resolveResourcePayment({random:2},b.enemyResources,plan[0].randomPayment).ok,true);
 b.enemyResources=pool({graca:1});assert.equal(getCombatPlan(b).length,0);
});

test('revisão mostra sugestão, ajustes, custos separados e confirmação bloqueada enquanto faltar pagamento',()=>{
 const b=battle([{essence:1,random:2}]);b.resources=pool({essence:2,ruptura:2});queue(b,0);
 const state={battle:b,battleNode:{label:'Teste'},confirmTurn:true},elo={name:'Sangria'};
 let html=renderBattle(state,elo);assert.match(html,/2 Aleatório/);assert.match(html,/USAR SUGESTÃO/);assert.match(html,/Gastar menos Ruptura/);assert.match(html,/Pagamento completo/);assert.doesNotMatch(html,/data-action="commit-turn" disabled/);
 state.randomPayment=pool({ruptura:1});html=renderBattle(state,elo);assert.match(html,/Falta escolher 1/);assert.match(html,/data-action="commit-turn" disabled/);assert.match(html,/1 fixos/);
});

test('fichas retiram classes decorativas e blocos de palavras-chave sem perder efeitos e recarga',()=>{
 const b=battle([{random:1}]);b.allies[0].abilities[0].classes=['TAG INVENTADA'];b.allies[0].abilities[0].description='Causa 10 de dano.';b.allies[0].combo='PALAVRAS CHAVE';
 const html=renderBattleDetail({battle:b,focusSkill:{actorId:b.allies[0].id,abilityId:'use'}});assert.doesNotMatch(html,/TAG INVENTADA|PALAVRAS CHAVE|COMBO/);assert.match(html,/Causa 10 de dano/);assert.match(html,/RECARGA/);
});
