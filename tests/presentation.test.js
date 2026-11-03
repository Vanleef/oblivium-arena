import test from 'node:test';
import assert from 'node:assert/strict';
import { characters, elos, buffs, starters } from '../src/data.js';
import { createBattle, createEnemyTeam, chooseAction, commitTurn, resolveNextAction } from '../src/combat.js';
import { normalizeCampaign, createExpedition, globalChoices, aggregateGlobal, legacyCollection } from '../src/progression.js';
import { renderBattle, renderBattleDetail, skillAvailability } from '../src/battle-view.js';
import { renderTrail } from '../src/trail-view.js';
import { advanceTrail } from '../src/trail.js';
import { portraitAnchor, traceGeometry, effectTone, renderBattleMotion } from '../src/battle-motion.js';
const ids=['o-escudo-vivo','a-brasa-eterna','o-passo-interrompido'];
test('técnicas sem Essência e em recarga continuam legíveis, sem permitirem ações ilegais',()=>{
 const battle=createBattle(ids,createEnemyTeam(elos[0],ids),{rng:()=>0}),state={battle,battleNode:{label:'Patrulha'},focusSkill:{actorId:ids[0],abilityId:'impulso'}};
 assert.equal(skillAvailability(battle,battle.allies[0],battle.allies[0].abilities[0]),'ESSÊNCIA INSUFICIENTE');
 assert.match(renderBattleDetail(state),/ESSÊNCIA INSUFICIENTE/);assert.equal(chooseAction(battle,ids[0],'impulso',battle.enemies[0].id).ok,false);
 const html=renderBattle(state,elos[0]);assert.match(html,/skill-unavailable/);assert.doesNotMatch(html,/data-use-skill="o-escudo-vivo:impulso"[^>]* disabled/);
 battle.resources.graca=1;for(const enemy of battle.enemies)enemy.invulnerable=1;assert.equal(skillAvailability(battle,battle.allies[0],battle.allies[0].abilities[0]),'SEM ALVO VÁLIDO');assert.equal(chooseAction(battle,ids[0],'impulso',battle.enemies[0].id).ok,false);
 battle.allies[0].cooldowns.impulso=3;assert.match(renderBattleDetail(state),/RECARGA 3T/);
 battle.phase='resolving';assert.match(renderBattle(state,elos[0]),/data-use-skill="o-escudo-vivo:impulso"[^>]* disabled/);
});
test('conselho final permanece oculto até o próprio nó ser revelado',()=>{
 const p=normalizeCampaign({ownedIds:starters.map(c=>c.id),team:ids,completedElos:[],xp:0,fragments:0}),run=createExpedition(p,elos[0],'hunt',0,123);
 assert.doesNotMatch(renderTrail(run,elos[0],null,buffs,p.ownedIds),/CONSELHO REVELADO|council-members/);
 while(run.stage<6)advanceTrail(run,run.availableNodeIds[0]);
 const html=renderTrail(run,elos[0],null,buffs,p.ownedIds);assert.match(html,/CONSELHO REVELADO/);assert.equal((html.match(/council-portrait/g)||[]).length,3);
 for(const id of run.bossIds)assert.ok(html.includes(characters.find(c=>c.id===id).name));
});
test('efeitos se ancoram aos retratos renderizados em quadros largos ou estreitos',()=>{
 const wide=portraitAnchor({left:100,top:50,width:980,height:330},{left:120,top:90,width:70,height:70});assert.deepEqual(wide,{x:55,y:75});
 const mobile=portraitAnchor({left:12,top:200,width:366,height:360},{left:310,top:240,width:51,height:54});assert.deepEqual(mobile,{x:323.5,y:67});
 assert.equal(traceGeometry(wide,wide),null);assert.match(traceGeometry(wide,mobile),/^M55\.0 75\.0 Q/);assert.equal(effectTone({hp:0,shield:0,statuses:['INVULNERÁVEL']}),'#a3daf4');
 let html='';const app={querySelector:()=>({getBoundingClientRect:()=>({left:0,top:0,width:366,height:360}),querySelectorAll:()=>[],insertAdjacentHTML:(_,v)=>{html=v;}})};renderBattleMotion(app,{changes:[],kind:'impact'});assert.equal(html,'');
});
test('Legados repetidos são agrupados e ofertas evitam efeitos já no limite',()=>{
 const p=normalizeCampaign({ownedIds:[],completedElos:[]});
 p.globalUpgrades=[{id:'a',kind:'vitality',title:'Vida',difficulty:0,effect:{maxHp:8}},{id:'b',kind:'vitality',title:'Vida',difficulty:1,effect:{maxHp:11}},{id:'c',kind:'preparation',title:'Carga',difficulty:4,effect:{startingCharge:3}},{id:'d',kind:'shelter',title:'Abrigo',difficulty:4,effect:{restBonus:.6}},{id:'e',kind:'vampirism',title:'Vida',difficulty:4,effect:{lifesteal:.6}},{id:'f',kind:'bulwark',title:'Guarda',difficulty:4,effect:{shield:80}}];
 const group=legacyCollection(p).find(c=>c.kind==='vitality');assert.equal(group.count,2);assert.equal(group.effect.maxHp,19);assert.match(group.text,/19/);
 for(let seed=0;seed<40;seed++)for(const offer of globalChoices(p,'sangria',9,seed))assert.ok(!['preparation','shelter','vampirism','bulwark'].includes(offer.kind));
 p.globalUpgrades.push({kind:'preparation',difficulty:9,effect:{startingCharge:3}},{kind:'vampirism',difficulty:9,effect:{lifesteal:.3}});assert.equal(aggregateGlobal(p).startingCharge,3);assert.equal(aggregateGlobal(p).lifesteal,.6);
});
test('contra-ataque informa origem e alvo da reação para a animação correta',()=>{
 const battle=createBattle([ids[0]],[{id:'counter',name:'Revidador',realm:'Inferno',abilities:[{id:'idle',name:'Observar',target:'self',costs:{}}]}],{rng:()=>.41});battle.enemies[0].counter=17;
 battle.resources={essence:5,cinza:5,graca:5,ruptura:5};assert.equal(chooseAction(battle,ids[0],'impulso','counter').ok,true);assert.equal(commitTurn(battle).ok,true);const result=resolveNextAction(battle);
 assert.equal(result.event.reactions.length,1);assert.deepEqual(result.event.reactions[0],{actorId:'counter',targetId:ids[0],actorName:'Revidador',damage:17});
});

