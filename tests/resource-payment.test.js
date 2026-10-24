import test from 'node:test';
import assert from 'node:assert/strict';
import {characters,starters,resources,resourceById} from '../src/data.js';
import {createFinalBoss} from '../src/final-boss.js';
import {previewBodyForm} from '../src/body-forms.js';
import {createBattle,createDuel,chooseAction,commitTurn,resolveNextAction,getTurnPayment,canAffordAbility,getAvailableResources,getCombatPlan,submitDuelTurn,exchangeEssence,applyEssenceExchanges} from '../src/combat.js';
import {getAbilityResourceCosts,resolveResourcePayment,resolveEssenceExchange,allocateQueuePayment,resourceIds} from '../src/resource-costs.js';
import {renderBattle,renderBattleDetail} from '../src/battle-view.js';
import {costMarkup} from '../src/view-utils.js';
const pool=values=>({essence:0,cinza:0,graca:0,ruptura:0,coringa:0,...values});
const target={id:'target',name:'Treino',realm:'Inferno',maxHp:1000,abilities:[]};
function battle(costs){const b=createBattle(starters.map(c=>c.id),[target],{rng:()=>0,enemyPlanner:()=>[]});b.allies.forEach((u,i)=>u.abilities=[{id:'use',name:`Uso ${i}`,target:'enemy',damage:10,costs:costs[i]||{}}]);return b;}
function queue(b,i){const u=b.allies[i];return chooseAction(b,u.id,'use',b.enemies[0].id);}
const snapshot=b=>JSON.stringify(b);

test('Qualquer é um custo flexível e Coringa é o quinto tipo de Essência; todas as quartas defesas custam 1',()=>{
 assert.equal(resources.length,5);assert.equal(resourceById.random.name,'Qualquer');assert.deepEqual(resources.map(r=>r.name),['Éter','Cinza','Graça','Ruptura','Coringa']);assert.equal(resources[0].id,'essence');assert.equal(resources[4].id,'coringa');
 for(const c of [...characters,createFinalBoss()]){assert.equal(c.abilities[3].invulnerable,1);assert.deepEqual(c.abilities[3].costs,{random:1},c.name);assert.match(costMarkup(c,c.abilities[3]),/Custo: 1 Qualquer/);assert.match(costMarkup(c,c.abilities[3]),/pip-random/);}
 const ordinary=characters.filter(c=>c.abilities.slice(0,3).some(a=>a.costs.random));assert.ok(ordinary.length>characters.length/2,`Qualquer aparece em ${ordinary.length} personagens`);
 assert.equal(ordinary.length,77);
 for(const c of characters){const skill=c.abilities[1];if(skill.costs.random)assert.equal(Object.values(skill.costs).reduce((sum,n)=>sum+n,0),skill.cost,`${c.name}: a flexibilidade não altera os pontos totais`);}
 const b=battle([{}]);assert.deepEqual(Object.keys(b.resources),resourceIds);assert.ok(!b.essenceDraws.player.includes('random'));
});

test('formas declaram seu tipo de Essência sem alterar o custo Qualquer',()=>{
 for(const c of [createFinalBoss(),...characters.filter(c=>c.bodyForms)]){
  const seen=new Set();
  for(const f of c.bodyForms){if(f.resource!==c.affinity){assert.ok(!seen.has(f.resource),`${c.name}/${f.name}`);seen.add(f.resource);}const p=previewBodyForm(c,f.key);assert.equal(p.bodyResource,f.resource);assert.deepEqual(getAbilityResourceCosts(p,p.abilities[3]),{random:1});for(const a of p.abilities.slice(0,3)){if(a.costs.affinity)assert.equal(getAbilityResourceCosts(p,a)[f.resource]>=a.costs.affinity,true);}}
  assert.equal(previewBodyForm(c,'base').bodyResource,c.affinity);
 }
});

test('cada lado recebe uma Essência aleatória por alma viva desde a abertura',()=>{
 const b=createBattle(starters.map(c=>c.id),starters,{rng:()=>0,enemyPlanner:()=>[]});
 assert.equal(b.essenceDraws.player.length,3);assert.equal(b.essenceDraws.enemy.length,3);
 assert.deepEqual(b.essenceDraws.player,['essence','essence','essence']);assert.deepEqual(b.essenceDraws.enemy,['essence','essence','essence']);
});

test('a troca 5:1 escolhe o tipo de destino e reduz o estoque líquido em quatro',()=>{
 const before=pool({essence:2,cinza:1,graca:1,coringa:1});
 const result=resolveEssenceExchange(before,'ruptura',before);assert.equal(result.ok,true);
 assert.deepEqual(result.pool,pool({ruptura:1}));assert.equal(result.totalBefore,5);assert.equal(result.totalAfter,1);
 assert.deepEqual(before,pool({essence:2,cinza:1,graca:1,coringa:1}));
 assert.equal(resolveEssenceExchange(pool({essence:2,cinza:2}),'ruptura',pool({essence:2,cinza:2})).ok,false);
 assert.equal(resolveEssenceExchange(pool({essence:5}),'inventada',pool({essence:5})).ok,false);
 assert.equal(resolveEssenceExchange(pool({essence:5}),'ruptura',pool({essence:4})).ok,false);
});

test('troca local valida a fila, habilita custo fixo e registra o débito para o servidor',()=>{
 const b=battle([{}]);b.resources=pool({essence:2,cinza:1,graca:1,coringa:1});
 assert.equal(exchangeEssence(b,'ruptura',pool({essence:2,cinza:1,graca:1,coringa:1})).ok,true);
 b.allies[0].abilities[0]={id:'specific',name:'Golpe de Ruptura',target:'enemy',damage:20,costs:{ruptura:1}};
 assert.equal(chooseAction(b,b.allies[0].id,'specific',b.enemies[0].id).ok,true);
 assert.equal(exchangeEssence(b,'cinza',pool({ruptura:1})).ok,false);
 assert.equal(b.pendingEssenceExchanges.length,1);assert.deepEqual(b.resources,pool({ruptura:1}));
 assert.equal(commitTurn(b).ok,true);assert.deepEqual(b.pendingEssenceExchanges,[]);resolveNextAction(b);assert.deepEqual(b.resources,pool({}));
});

test('a troca remota é aplicada atomicamente antes do custo da ação',()=>{
 const ids=starters.slice(0,1).map(c=>c.id),b=createDuel(ids,ids,{rng:()=>0}),actor=b.allies[0];
 actor.abilities[0]={id:'specific',name:'Golpe de Ruptura',target:'enemy',damage:20,costs:{ruptura:1}};
 b.resources=pool({essence:2,cinza:1,graca:1,coringa:1});
 const action={actorId:actor.id,abilityId:'specific',targetId:b.enemies[0].id},exchange={target:'ruptura',payment:pool({essence:2,cinza:1,graca:1,coringa:1})};
 const before=snapshot(b);assert.throws(()=>submitDuelTurn(b,'player',[action],undefined,[exchange,{target:'ruptura',payment:pool({essence:1})}]));assert.equal(snapshot(b),before);
 submitDuelTurn(b,'player',[action],undefined,[exchange]);assert.equal(b.resources.ruptura,0);assert.equal(b.enemies[0].hp,80);
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

test('drenagem do tipo de Essência escolhido impede a ação sem substituir por outra cor disponível',()=>{
 const b=battle([{random:1}]);b.resources=pool({essence:2,cinza:1});queue(b,0);commitTurn(b,pool({cinza:1}));b.resources.cinza=0;
 const before={...b.resources},r=resolveNextAction(b);assert.equal(r.event.skipped,true);assert.deepEqual(b.resources,before);
});

test('perda de alvo antes da resolução preserva toda a Essência escolhida',()=>{
 const b=battle([{random:1}]);b.resources=pool({graca:1});queue(b,0);commitTurn(b);b.enemies[0].invulnerable=1;const before={...b.resources};assert.equal(resolveNextAction(b).event.skipped,true);assert.deepEqual(b.resources,before);
});

test('duelo valida o pagamento agregado nos dois lados e ignora tentativas de falsificar custo por ação',()=>{
 const b=createDuel(starters.slice(0,1).map(c=>c.id),starters.slice(0,1).map(c=>c.id),{rng:()=>0});b.resources=pool({ruptura:1});b.enemyResources=pool({cinza:1});
 const first=b.allies[0],second=b.enemies[0],action=u=>({actorId:u.id,abilityId:'despertar',targetId:u.id,randomPayment:{fake:999},costs:{}});
 const before=snapshot(b);assert.throws(()=>submitDuelTurn(b,'player',[action(first)],{graca:1}));assert.equal(snapshot(b),before);
 submitDuelTurn(b,'player',[action(first)],{ruptura:1});assert.deepEqual(b.resources,pool({}));assert.equal(first.invulnerable,1);
 submitDuelTurn(b,'enemy',[action(second)],{cinza:1});assert.equal(second.cooldowns.despertar,4);assert.equal(second.invulnerable,1);assert.equal(b.enemyResources.cinza,0);
});

test('IA fixa pagamentos concretos e não cria uma reserva Qualquer',()=>{
 const b=battle([{}]);const e=b.enemies[0];e.abilities=[{id:'wild',name:'Ataque',target:'enemy',damage:40,costs:{random:2}}];b.enemyResources=pool({graca:1,ruptura:1});const before=snapshot(b),plan=getCombatPlan(b);assert.equal(snapshot(b),before);assert.equal(plan.length,1);assert.deepEqual(plan[0].randomPayment,pool({graca:1,ruptura:1}));assert.equal(resolveResourcePayment({random:2},b.enemyResources,plan[0].randomPayment).ok,true);
 b.enemyResources=pool({graca:1});assert.equal(getCombatPlan(b).length,0);
});

test('IA considera a troca 5:1 ao planejar custo fixo, sem mutar o combate antes da resolução',()=>{
 const b=battle([{}]);for(const u of b.enemies.slice(1))u.hp=0;
 b.enemies[0].abilities=[{id:'rupture',name:'Ataque de Ruptura',target:'enemy',damage:40,costs:{ruptura:1}}];
 b.enemyResources=pool({essence:2,cinza:1,graca:1});assert.equal(getCombatPlan(b).length,0,'a oposição deve esperar até ter cinco Essências');
 b.enemyResources=pool({essence:3,coringa:2});
 const before=snapshot(b),plan=getCombatPlan(b);
 assert.equal(snapshot(b),before);assert.equal(plan.length,2);assert.equal(plan[0].type,'essence-exchange');assert.equal(plan[0].target,'ruptura');assert.deepEqual(plan[0].payment,pool({essence:3,coringa:2}));assert.equal(plan[1].abilityId,'rupture');
});

test('revisão mostra sugestão, ajustes, custos separados e confirmação bloqueada enquanto faltar pagamento',()=>{
 const b=battle([{essence:1,random:2}]);b.resources=pool({essence:2,ruptura:2});queue(b,0);
 const state={battle:b,battleNode:{label:'Teste'},confirmTurn:true},elo={name:'Sangria'};
 let html=renderBattle(state,elo);assert.match(html,/Custo Qualquer · 2/);assert.match(html,/USAR SUGESTÃO/);assert.match(html,/Gastar menos Ruptura/);assert.match(html,/Pagamento completo/);assert.doesNotMatch(html,/data-action="commit-turn" disabled/);
 state.randomPayment=pool({ruptura:1});html=renderBattle(state,elo);assert.match(html,/Falta escolher 1/);assert.match(html,/data-action="commit-turn" disabled/);assert.match(html,/1 fixos/);
});

test('interface oferece troca 5:1, seleção do tipo de saída e desativa-a com ações na fila',()=>{
 const b=battle([{}]);b.resources=pool({essence:2,cinza:1,graca:1,coringa:1});
 const state={battle:b,battleNode:{label:'Teste'},exchangeOpen:true,exchangePayment:pool({essence:2,cinza:1,graca:1,coringa:1})},elo={name:'Sangria'};
 let html=renderBattle(state,elo);assert.match(html,/TROCAR ESSÊNCIA · 5 → 1/);assert.match(html,/Troque 5 por 1 tipo escolhido/);assert.match(html,/data-exchange-target="ruptura"/);assert.match(html,/5\/5 Essências escolhidas/);
 queue(b,0);html=renderBattle(state,elo);assert.match(html,/Remova a fila do turno para converter Essência/);assert.doesNotMatch(html,/Troque 5 por 1 tipo escolhido/);
});

test('fichas retiram classes decorativas e blocos de palavras-chave sem perder efeitos e recarga',()=>{
 const b=battle([{random:1}]);b.allies[0].abilities[0].classes=['TAG INVENTADA'];b.allies[0].abilities[0].description='Causa 10 de dano.';b.allies[0].combo='PALAVRAS CHAVE';
 const html=renderBattleDetail({battle:b,focusSkill:{actorId:b.allies[0].id,abilityId:'use'}});assert.doesNotMatch(html,/TAG INVENTADA|PALAVRAS CHAVE|COMBO/);assert.match(html,/Causa 10 de dano/);assert.match(html,/RECARGA/);
});
