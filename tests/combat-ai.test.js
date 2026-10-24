import test from 'node:test';
import assert from 'node:assert/strict';
import {characters} from '../src/data.js';
import {createBattle, getCombatPlan, getAbilityResourceCosts, getValidTargets, chooseAction, commitTurn, resolveNextAction, previewHit} from '../src/combat.js';
import {renderBattleDetail} from '../src/battle-view.js';
import {simulateMatch} from '../scripts/simulate-combat.mjs';
const strike=(id,damage,extra={})=>({id,name:id,target:'enemy',damage,costs:{essence:1},...extra});
const enemy=(id,abilities)=>({id,name:id,realm:'Inferno',abilities});
function battle(enemies){const b=createBattle([characters[0].id,characters[1].id,characters[2].id],enemies,{rng:()=>0});b.enemyResources={essence:3,cinza:0,graca:0,ruptura:0,coringa:0};for(const u of [...b.allies,...b.enemies]){u.passive=null;u.shield=0;}return b;}

test('IA considera redução, Defesa, perfurante e aflição ao escolher seu ataque',()=>{
 const b=battle([enemy('inimigo',[strike('físico',25),strike('perfurante',15,{damageType:'piercing'}),strike('aflição',12,{damageType:'affliction'})])]);
 for(const u of b.allies){u.armor=30;u.shield=40;}
 assert.equal(getCombatPlan(b)[0].abilityId,'aflição');
 for(const u of b.allies)u.shield=0;
 assert.equal(getCombatPlan(b)[0].abilityId,'perfurante');
 assert.deepEqual(previewHit(b.allies[0],25),{dealt:0,blocked:0,immune:false});
});

test('IA evita contra-ataque anunciado e respeita o filtro de tipo',()=>{
 const b=battle([enemy('inimigo',[strike('físico',20),strike('espiritual',18,{damageType:'energy'})])]);
 for(const u of b.allies){u.counter=30;u.counterFilter=['physical'];}
 assert.equal(getCombatPlan(b)[0].abilityId,'espiritual');
 for(const u of b.allies)u.counterFilter=null;
 assert.equal(getCombatPlan(b).length,0);
});

test('Essência disputada vai à ação mais útil, independente da ordem do trio',()=>{
 const weak=enemy('fraco',[strike('fraco',8)]),strong=enemy('forte',[strike('forte',24)]);
 for(const roster of [[weak,strong],[strong,weak]]){const b=battle(roster);b.enemyResources.essence=1;assert.equal(getCombatPlan(b)[0].actorId,'forte');}
});

test('IA de Ruptura alta concentra ataques na ameaça mais perigosa com estado público',()=>{
 const b=battle([enemy('caçador',[strike('golpe',20)])]),quiet=b.allies[0],danger=b.allies[1];
 quiet.abilities=[strike('ameaça menor',5)];danger.abilities=[strike('ameaça maior',50)];
 b.difficulty=0;assert.equal(getCombatPlan(b)[0].targetId,quiet.id);
 b.difficulty=6;assert.equal(getCombatPlan(b)[0].targetId,danger.id);
});

test('a previsão evita desperdiçar ações numa vítima que o primeiro golpe elimina',()=>{
 const b=battle([enemy('um',[strike('golpe1',25)]),enemy('dois',[strike('golpe2',25)])]);b.allies[0].hp=20;
 const plan=getCombatPlan(b);assert.equal(plan.length,2);assert.equal(plan[0].targetId,b.allies[0].id);assert.notEqual(plan[1].targetId,b.allies[0].id);
});

test('apoio procura aliado ferido e evita cura ou defesa inútil em Vida cheia',()=>{
 const b=battle([enemy('cura',[{id:'cura',name:'Cura',target:'ally',heal:25,costs:{essence:1}},{id:'defesa',name:'Defesa',target:'self',defense:true,invulnerable:1,costs:{essence:1}}]),enemy('ferido',[])]);
 assert.equal(getCombatPlan(b).length,0);b.enemies[1].hp=30;
 assert.equal(getCombatPlan(b)[0].targetId,'ferido');
});

test('a ameaça de inatividade pode justificar usar a defesa pessoal em Vida cheia',()=>{
 const b=battle([enemy('alvo',[{id:'defesa',name:'Defesa',target:'self',defense:true,invulnerable:1,costs:{essence:1}}])]);
 b.enemies[0].reactives=[{trigger:'idle',damage:12,harmful:true,turns:1}];
 assert.equal(getCombatPlan(b)[0].abilityId,'defesa');
 b.enemies[0].reactives=[{trigger:'skill',damage:12,harmful:true,turns:1}];
 assert.equal(getCombatPlan(b).length,0);
});

test('a previsão não inventa dano de Exposto numa técnica sem dano',()=>{
 const b=battle([enemy('alvo',[strike('utilidade',0)])]);for(const u of b.allies)u.exposed=1;
 assert.equal(getCombatPlan(b).length,0);
});

test('planejamento não modifica combate, não lê fila do jogador nem sorteia Essência',()=>{
 const b=battle([enemy('um',[strike('golpe',20)]),enemy('dois',[strike('golpe2',20)])]);const before=JSON.stringify(b),first=getCombatPlan(b);
 assert.equal(JSON.stringify(b),before);b.rng=()=>{throw Error('Sorteio antecipado');};b.queue=[{actorId:b.allies[0].id,abilityId:'despertar',targetId:b.allies[0].id}];
 assert.deepEqual(getCombatPlan(b),first);
 const costs={...b.enemyResources};for(const action of first){const u=b.enemies.find(v=>v.id===action.actorId),a=u.abilities.find(v=>v.id===action.abilityId);assert.ok(getValidTargets(b,u,a).some(v=>v.id===action.targetId));for(const [id,n]of Object.entries(getAbilityResourceCosts(u,a)))costs[id]-=n;}assert.ok(Object.values(costs).every(v=>v>=0));
});

test('a previsão de conversão financia a próxima ação sem alterar a reserva real',()=>{
 const converter=enemy('converter',[{id:'converter',name:'Converter Essência',target:'enemy',damage:20,costs:{essence:1,coringa:1},convertEssence:{from:'essence',to:'coringa',amount:1}}]);
 const follow=enemy('eco',[strike('golpe-coringa',5,{costs:{coringa:1}})]),b=battle([converter,follow]);
 b.enemyResources={essence:2,cinza:0,graca:0,ruptura:0,coringa:1};
 const before=JSON.stringify(b.enemyResources),plan=getCombatPlan(b);
 assert.deepEqual(plan.map(action=>action.abilityId),['converter','golpe-coringa']);
 assert.equal(JSON.stringify(b.enemyResources),before,'planejamento não debita nem converte a reserva real');
});

test('a oposição decide na própria vez e evita uma defesa aplicada após o planejamento inicial',()=>{
 const b=battle([enemy('agressor',[strike('golpe',20)])]),[u]=b.allies;
 u.hp=20;u.abilities[0]={id:'proteger',name:'Proteger',target:'self',defense:true,invulnerable:1,costs:{}};
 assert.equal(getCombatPlan(b)[0].targetId,u.id);
 chooseAction(b,u.id,'proteger',u.id);commitTurn(b);resolveNextAction(b);resolveNextAction(b);
 assert.notEqual(b.intents[0].targetId,u.id);assert.equal(b.resources.essence,3);
});

test('reação de cura e Defesa informa a origem e cada beneficiário à animação',()=>{
 const b=battle([enemy('agressor',[strike('golpe',10,{costs:{}})])]),[owner,ally]=b.allies;
 owner.hp=50;ally.hp=50;owner.abilities[0]={id:'pacto',name:'Pacto',target:'ally',costs:{},reactive:{trigger:'damaged',healBoth:6,shieldSource:7,turns:1}};
 b.enemyPlanner=s=>s.intents;b.intents=[{actorId:'agressor',abilityId:'golpe',targetId:ally.id,side:'enemy'}];
 assert.equal(chooseAction(b,owner.id,'pacto',ally.id).ok,true);commitTurn(b);resolveNextAction(b);resolveNextAction(b);const event=resolveNextAction(b).event;
 assert.equal(event.reactions.length,2);assert.ok(event.reactions.every(r=>r.actorId===owner.id&&r.kind==='reaction'));
 assert.equal(event.reactions.find(r=>r.targetId===owner.id).shield,7);assert.equal(event.reactions.find(r=>r.targetId===ally.id).heal,6);
});

test('início de turno informa recuperação e mantém a origem da regeneração',()=>{
 const b=battle([enemy('quieto',[])]),[u]=b.allies;u.hp=50;u.regens=[{heal:7,turns:1,sourceId:u.id,skillId:'regen',label:'Regenerar'}];
 commitTurn(b);let result;do{result=resolveNextAction(b);}while(!result.done);
 assert.equal(result.event.mode,'recovery');assert.equal(result.event.reactions[0].actorId,u.id);assert.equal(result.event.reactions[0].heal,7);assert.equal(u.hp,57);
});

test('inspeção informa origem, gatilho, valor, duração e filtro dos efeitos sem novos botões no campo',()=>{
 const b=battle([enemy('origem',[])]),[u]=b.allies;
 u.reactives=[{sourceId:'origem',label:'Dívida <rara>',trigger:'support',damage:9,turns:1,harmful:true}];u.counter=20;u.counterFilter=['energy'];
 const html=renderBattleDetail({battle:b,inspectUnitId:u.id});
 assert.match(html,/EFEITOS ATIVOS · 2/);assert.match(html,/origem · Ao usar apoio \(exceto a defesa pessoal\)/);assert.match(html,/9 de dano de aflição/);assert.match(html,/expira após 1/);assert.match(html,/próxima técnica espiritual/);assert.match(html,/Dívida &lt;rara&gt;/);
});

test('os 100 personagens atravessam combates completos com tipos reais de Essência e invariantes a cada ação',()=>{
 for(let i=0;i<characters.length;i++){const result=simulateMatch(i,i%3);assert.ok(result.steps>0);assert.ok(result.rounds<=100);}
});

