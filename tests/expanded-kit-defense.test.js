import test from 'node:test';
import assert from 'node:assert/strict';
import { characters } from '../src/data.js';
import { createBattle, chooseAction, commitTurn, resolveNextAction, getValidTargets } from '../src/combat.js';

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
