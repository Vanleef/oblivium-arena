import test from 'node:test';
import assert from 'node:assert/strict';
import {characters} from '../src/data.js';
import {createBattle,chooseAction,commitTurn,resolveNextAction} from '../src/combat.js';
import {migrateBattleSkillIds} from '../src/battle-migration.js';

test('Vaas prepara a própria Marca antes de ativar passiva e combo',()=>{
 const id='vaas-o-sem-rosto',character=characters.find(c=>c.id===id);
 const target={id:'target',name:'Alvo',realm:'Inferno',maxHp:1000,abilities:[]};
 const battle=createBattle([id],[target],{rng:()=>0,enemyPlanner:()=>[]});
 battle.resources={essence:20,cinza:20,graca:20,ruptura:20};battle.enemyResources={essence:10,cinza:0,graca:0,ruptura:0};
 const cast=ability=>{assert.equal(chooseAction(battle,id,ability,'target').ok,true);assert.equal(commitTurn(battle).ok,true);while(battle.phase==='resolving')resolveNextAction(battle);};
 assert.match(character.abilities[0].description,/Marca o alvo por 3 turnos/);
 cast('impulso');assert.equal(battle.enemies[0].marks.identidade.sourceId,id);
 assert.ok(!battle.log.some(line=>line.includes('Confisco de Identidade')),'a primeira aplicação não dispara a passiva');
 cast('voto');assert.ok(battle.log.some(line=>line.includes('Ruptura da Máscara')&&line.includes('COMBO')));
 assert.ok(battle.log.some(line=>line.includes('Confisco de Identidade')),'atingir a Marca própria dispara a passiva');
});

test('partida salva de Vaas recebe a Marca sem perder estado',()=>{
 const id='vaas-o-sem-rosto',target={id:'target',name:'Alvo',realm:'Inferno',maxHp:1000,abilities:[]};
 const battle=createBattle([id],[target],{rng:()=>0,enemyPlanner:()=>[]}),unit=battle.allies[0];
 unit.hp=61;
 for(const list of [unit.skillBook,unit.abilities])for(const a of list.filter(a=>a.id==='impulso')){
  delete a.mark;delete a.markTurns;if(a._formRoot){delete a._formRoot.mark;delete a._formRoot.markTurns;}
 }
 const old=JSON.parse(JSON.stringify(battle));assert.equal(migrateBattleSkillIds(old),true);
 assert.equal(old.allies[0].hp,61);assert.equal(old.allies[0].skillBook[0].mark,'identidade');
 assert.equal(old.allies[0].abilities[0]._formRoot.mark,'identidade');assert.match(old.allies[0].abilities[0].description,/Marca o alvo por 3 turnos/);
 assert.equal(migrateBattleSkillIds(old),false);
});
