import test from 'node:test';
import assert from 'node:assert/strict';
import { characters } from '../src/data.js';
import { createBattle, chooseAction, commitTurn, resolveNextAction, getValidTargets } from '../src/combat.js';
import { migrateBattleSkillIds } from '../src/battle-migration.js';

test('kits ampliados mantêm técnicas distintas e defesa selecionável',()=>{
 const expanded=characters.filter(c=>c.storyCharacter && c.abilities.length>4);
 assert.ok(expanded.length>0);
 for(const character of expanded){
  assert.equal(new Set(character.abilities.map(a=>a.id)).size,character.abilities.length,character.name);
  const battle=createBattle([character.id],[{id:'dummy',name:'Alvo',realm:'Inferno',maxHp:1000,abilities:[]}]);
  for(const id of Object.keys(battle.resources))battle.resources[id]=10;
  const actor=battle.allies[0],extra=actor.abilities[3],defense=actor.abilities.at(-1);
  assert.equal(extra.id,'tecnica-4',character.name);
  assert.equal(defense.id,'despertar',character.name);
  actor.ashExpansionTurns=1;
  if(extra.activateCollapse===2){actor.collapse1Used=true;actor.collapseLevel=1;}
  const target=getValidTargets(battle,actor,extra)[0];
  assert.ok(target,character.name);
  assert.equal(chooseAction(battle,actor.id,extra.id,target.id).ok,true,character.name);
  assert.equal(battle.queue[0].abilityId,'tecnica-4',character.name);
  assert.equal(chooseAction(battle,actor.id,defense.id,actor.id).ok,true,character.name);
  assert.equal(commitTurn(battle).ok,true,character.name);
  resolveNextAction(battle);
  assert.equal(actor.invulnerable,1,character.name);
  assert.equal(actor.cooldowns.despertar,4,character.name);
 }
});

test('migração de combate salvo preserva ação antiga e corrige defesa sem alterar estado',()=>{
 const id='nilo-ruptura-prefacio';
 const battle=createBattle([id],[{id:'dummy',name:'Alvo',realm:'Inferno',maxHp:1000,abilities:[]}]);
 const actor=battle.allies[0];actor.hp=42;actor.cooldowns.despertar=2;
 for(const list of [actor.skillBook,actor.abilities]){
  list[3].id='despertar';
  if(list[3]._formRoot)list[3]._formRoot.id='despertar';
 }
 battle.queue=[{actorId:id,abilityId:'despertar',targetId:'dummy'}];
 battle.intents=[{actorId:id,abilityId:'despertar',targetId:'dummy'}];
 const saved=JSON.parse(JSON.stringify(battle));
 assert.equal(migrateBattleSkillIds(saved),true);
 assert.equal(saved.allies[0].abilities[3].id,'tecnica-4');
 assert.equal(saved.allies[0].abilities[3]._formRoot.id,'tecnica-4');
 assert.equal(saved.allies[0].skillBook[3].id,'tecnica-4');
 assert.equal(saved.allies[0].abilities.at(-1).id,'despertar');
 assert.equal(saved.queue[0].abilityId,'tecnica-4');
 assert.equal(saved.intents[0].abilityId,'tecnica-4');
 assert.equal(saved.allies[0].hp,42);assert.equal(saved.allies[0].cooldowns.despertar,2);
 assert.equal(migrateBattleSkillIds(saved),false);
});
