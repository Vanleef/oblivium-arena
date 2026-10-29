import test from 'node:test';
import assert from 'node:assert/strict';
import { createBattle, chooseAction, commitTurn, resolveNextAction } from '../src/combat.js';

const dummy = id => ({ id, name: id, realm: 'Limbo', maxHp: 1000, abilities: [] });

function setup() {
  const battle = createBattle(['merlindrope'], [dummy('first'), dummy('second'), dummy('third')], {
    rng: () => 0,
    enemyPlanner: () => []
  });
  for (const resource of Object.keys(battle.resources)) battle.resources[resource] = 30;
  return battle;
}

function castCells(battle) {
  const actor = battle.allies[0];
  assert.equal(chooseAction(battle, actor.id, 'voto', battle.enemies[0].id).ok, true);
  assert.equal(commitTurn(battle).ok, true);
  resolveNextAction(battle);
  return actor;
}

function mark(target, sourceId) {
  target.marks.prison = { sourceId, turns: 3, label: 'Grade de Éter' };
}

test('Cláusula de Prisão seals only the first own-marked enemy hit each round', () => {
  const battle = setup(), actor = battle.allies[0];
  mark(battle.enemies[0], actor.id);
  mark(battle.enemies[1], actor.id);

  castCells(battle);
  assert.equal(battle.enemies[0].sealSupport, 1);
  assert.equal(battle.enemies[1].sealSupport, 0);
  assert.equal(battle.enemies[2].sealSupport, 0);
  assert.equal(actor.passiveTriggeredRound, 1);

  let guard = 0;
  while (battle.phase === 'resolving' && guard++ < 30) resolveNextAction(battle);
  assert.equal(battle.round, 2);
  assert.equal(battle.phase, 'player');
  castCells(battle);
  assert.equal(battle.enemies[0].sealSupport, 1);
  assert.equal(battle.enemies[1].sealSupport, 0);
  assert.equal(actor.passiveTriggeredRound, 2);
});

test('Cláusula de Prisão ignores unmarked enemies and another caster\'s mark', () => {
  const battle = setup();
  mark(battle.enemies[0], 'another-caster');
  castCells(battle);
  assert.ok(battle.enemies.every(enemy => enemy.sealSupport === 0));
  assert.equal(battle.allies[0].passiveTriggeredRound, null);
});

test('Cláusula de Prisão does not trigger when Defense absorbs the marked target\'s hit', () => {
  const battle = setup(), actor = battle.allies[0], target = battle.enemies[0];
  mark(target, actor.id);
  target.shield = 50;
  const healthBefore = target.hp;
  castCells(battle);
  assert.equal(target.hp, healthBefore);
  assert.ok(target.shield < 50);
  assert.equal(target.sealSupport, 0);
  assert.equal(actor.passiveTriggeredRound, null);
});
