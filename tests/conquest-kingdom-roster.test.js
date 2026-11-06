import test from 'node:test';
import assert from 'node:assert/strict';
import {characters,elos,characterById} from '../src/data.js';
import {createEnemyTeam} from '../src/combat.js';

test('all current Reinos expose their own canonical character roster',()=>{
 assert.equal(elos.length,22);
 for(const kingdom of elos){
  const expected=characters.filter(character=>character.kingdomId===kingdom.id).map(character=>character.name);
  assert.ok(expected.length>=3,kingdom.id+' must support a three-character encounter');
  assert.deepEqual(kingdom.forms,expected,kingdom.id+' must not fall back to historical Elo IDs');
 }
});

test('each current Reino can create a valid three-opponent encounter',()=>{
 for(const kingdom of elos){
  const enemies=createEnemyTeam(kingdom,[],'normal',0,{difficulty:0});
  assert.equal(enemies.length,3,kingdom.id);
  for(const enemy of enemies){
   const source=characterById[enemy.sourceId];
   assert.ok(source,kingdom.id+' has a missing opponent reference');
   assert.equal(source.kingdomId,kingdom.id,enemy.sourceId+' belongs to another Reino');
   assert.ok(enemy.abilities.length,enemy.sourceId+' has no playable kit');
  }
 }
});
