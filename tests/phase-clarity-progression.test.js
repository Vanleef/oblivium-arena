import test from 'node:test';
import assert from 'node:assert/strict';
import { characterById, characters } from '../src/data.js';
import { abilityDetailMarkup, abilityQuickEffect } from '../src/ability-presentation.js';
import { activeTeamSynergies } from '../src/team-synergies.js';
import { aggregateRunMemories, recordRunMemory, selectBossRoster } from '../src/progression.js';
import { chooseAction, createBattle, passTurn } from '../src/combat.js';
import { checkDeathInfluences } from '../src/world-influences.js';
import { tutorialView } from '../src/tutorial.js';
import { getRelevantBuffChoices } from '../src/rules.js';

const dummy={id:'dummy',name:'Treino',realm:'Inferno',affinity:'cinza',maxHp:10000,abilities:[{id:'idle',name:'Observar',target:'self',costs:{},shield:1}]};

test('detalhes de técnica seguem custo, efeito, condição, interação e duração',()=>{
 const actor=characterById['a-brasa-eterna'];
 const html=abilityDetailMarkup(actor,{id:'test',name:'Corte',target:'enemy',damage:12,damageType:'physical',costs:{essence:1},dot:{tag:'sangramento',damage:3,turns:2},cooldown:1,description:'Aplica Sangramento e deixa o alvo Exposto.'});
 const order=['CUSTO','EFEITO PRINCIPAL','CONDIÇÕES','INTERAÇÕES E EFEITOS SECUNDÁRIOS','DURAÇÃO · RECARGA'].map(text=>html.indexOf(text));
 assert.ok(order.every((index,i)=>index>=0&&(i===0||index>order[i-1])));
 assert.match(html,/<mark class="combat-keyword">Sangramento<\/mark>/);
});

test('resumo distingue Invulnerável, cura e Defesa destrutível',()=>{
 assert.equal(abilityQuickEffect({target:'team',shield:20,defense:true}),'+20 Defesa');
 assert.equal(abilityQuickEffect({target:'self',heal:10,invulnerable:1,defense:true}), 'Invulnerável · 1 turno · cura 10 Vida');
 assert.equal(abilityQuickEffect({target:'ally',heal:8,shield:12}), 'Cura 8 Vida · +12 Defesa');
});

test('Memórias são idempotentes por nó, acumulam até três e alimentam a próxima luta',()=>{
 const team=characters.filter(c=>c.realm==='Inferno').slice(0,3).map(c=>c.id),run={team,memories:[],memoryNodeIds:[]};
 assert.equal(recordRunMemory(run,team,{id:'elite-1',type:'elite'}).id,'inferno');
 assert.equal(recordRunMemory(run,team,{id:'elite-1',type:'elite'}),null);
 recordRunMemory(run,team,{id:'boss-1',type:'boss'});
 assert.equal(aggregateRunMemories(run).afflictionPower,2);
 const battle=createBattle(team,[dummy],{memories:run.memories,rng:()=>0,enemyPlanner:()=>[]});
 assert.equal(battle.global.afflictionPower,2);
});

test('Ecos de composição mostram apenas sinergias com pelo menos dois aliados vivos',()=>{
 const sameElo=characters.filter(c=>c.eloId==='sangria').slice(0,3);
 const twoRealms=[...characters.filter(c=>c.realm==='Inferno').slice(0,2),characters.find(c=>c.realm==='Limbo')];
 assert.ok(activeTeamSynergies(sameElo).some(item=>item.id==='elo-sangria'));
 assert.ok(activeTeamSynergies(twoRealms).some(item=>item.id==='realm-Inferno'));
 assert.ok(!activeTeamSynergies(twoRealms.slice(0,1)).some(item=>item.id==='realm-Inferno'));
});

test('afinidade partilhada dá uma Essência específica no início, para os dois lados',()=>{
 const chosen=characters.find(character=>characters.filter(other=>other.affinity===character.affinity).length>=2),affinity=chosen.affinity;
 const team=[chosen,...characters.filter(character=>character.id!==chosen.id&&character.affinity===affinity).slice(0,1),...characters.filter(character=>character.affinity!==affinity).slice(0,1)].map(c=>c.id);
 const enemies=[...characters.filter(character=>character.affinity===affinity).slice(0,2),characters.find(character=>character.affinity!==affinity)];
 const battle=createBattle(team,enemies,{rng:()=>0,enemyPlanner:()=>[]});
 assert.equal(battle.resources[affinity],(affinity==='essence'?4:1));
 assert.equal(battle.enemyResources[affinity],affinity==='essence'?4:1);
 assert.ok(activeTeamSynergies(team).some(item=>item.id===`affinity-${affinity}`));
});

test('a composição do Guardião varia e mantém três personagens válidos do mesmo Elo',()=>{
 const team=['o-escudo-vivo','a-brasa-eterna','o-passo-interrompido'];
 const pool=characters.filter(c=>c.eloId==='sangria').map(c=>c.id);
 for(let seed=1;seed<=8;seed++){
  const roster=selectBossRoster(team,pool,seed);
  assert.equal(roster.length,3);assert.equal(new Set(roster).size,3);
  assert.ok(roster.every(id=>characterById[id].eloId==='sangria'));
 }
 assert.ok(new Set(Array.from({length:8},(_,i)=>selectBossRoster(team,pool,i+1).join(','))).size>1);
});

test('Herança de morte dá Essência e fortalece sobreviventes do mesmo Elo uma vez, com limite',()=>{
 const roster=characters.filter(c=>c.eloId==='sangria').slice(0,3),battle=createBattle(roster.map(c=>c.id),[dummy],{rng:()=>0,enemyPlanner:()=>[]});
 const fallen=battle.allies[0],survivors=battle.allies.slice(1),resource=fallen.bodyResource||fallen.affinity,before=battle.resources[resource]||0;
 fallen.hp=0;checkDeathInfluences(battle);
 assert.equal(battle.resources[resource],before+1);
 assert.ok(survivors.every(ally=>ally.worldDamage===1));
 assert.equal(battle.deathEchoStacks.player,1);
 checkDeathInfluences(battle);assert.equal(battle.deathEchoStacks.player,1);
});

test('aprimoramento de abate muda o fluxo de Essência durante o combate',()=>{
 const team=['o-escudo-vivo','a-brasa-eterna','o-passo-interrompido'];
 const battle=createBattle(team,[dummy],{buffs:['spoils'],rng:()=>0,enemyPlanner:()=>[]});
 const actor=battle.allies[0];actor.abilities[0]={id:'finisher',name:'Finalizar',target:'enemy',costs:{},damage:40,damageType:'physical'};
 battle.enemies[0].hp=1;const before=battle.resources.ruptura||0;
 assert.equal(chooseAction(battle,actor.id,'finisher',battle.enemies[0].id).ok,true);passTurn(battle);
 assert.equal(battle.resources.ruptura,before+1);
 assert.ok(battle.log.some(line=>line.includes('Espólio da queda')));
});

test('ofertas da trilha variam categorias e não repetem aprimoramentos já escolhidos',()=>{
 const team=['o-escudo-vivo','a-brasa-eterna','o-passo-interrompido'],first=getRelevantBuffChoices(team,[],42),next=getRelevantBuffChoices(team,first.map(buff=>buff.id),43);
 assert.equal(first.length,3);assert.equal(new Set(first.map(buff=>buff.category)).size,3);
 assert.ok(next.every(buff=>!first.some(chosen=>chosen.id===buff.id)));
 assert.equal(new Set(next.map(buff=>buff.category)).size,3);
});

test('tutorial exige responder a uma escolha de Essência antes de avançar',()=>{
 const locked=tutorialView(2);assert.match(locked,/data-tutorial-answer="exchange"/);assert.match(locked,/data-tutorial="3" disabled/);
 const answered=tutorialView(2,{answer:'exchange'});assert.match(answered,/Correto/);assert.doesNotMatch(answered,/data-tutorial="3" disabled/);
});
