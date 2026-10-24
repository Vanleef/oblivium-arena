import test from 'node:test';
import assert from 'node:assert/strict';
import { characters, characterById } from '../src/data.js';
import { createBattle, chooseAction, commitTurn, resolveNextAction, getAbilityResourceCosts } from '../src/combat.js';

const essenceIds = ['essence', 'cinza', 'graca', 'ruptura', 'coringa'];
const emptyPool = () => Object.fromEntries(essenceIds.map(id => [id, 0]));
const dummy = (id='alvo') => ({ id, name: 'Alvo', realm: 'Inferno', maxHp: 1000, abilities: [] });
const rich = battle => { for (const id of essenceIds) battle.resources[id] = 30; };
function strike(battle, ability, targetId) {
  const actor = battle.allies[0];
  actor.abilities[0] = { id: 'impulso', name: 'Teste', target: 'enemy', damage: 1, costs: {}, ...ability };
  assert.equal(chooseAction(battle, actor.id, 'impulso', targetId).ok, true);
  assert.equal(commitTurn(battle).ok, true);
  resolveNextAction(battle);
  return actor;
}

test('37 passivas já usam gatilhos distintos ou recuperação ligada ao tipo de dano', () => {
  const revised = characters.filter(c => c.passive.type === 'triggered' || c.passive.healByDamageType);
  assert.equal(revised.length, 37);
  for (const character of revised) assert.ok(character.passive.description.length > 35, character.name);
});

test('consumir Sangramento gera Ruptura uma vez por rodada, mesmo em área', () => {
  const battle = createBattle(['o-acougueiro'], [dummy('a'), dummy('b'), dummy('c')], { rng: () => 0 });
  battle.resources = emptyPool();
  for (const enemy of battle.enemies) enemy.dots.push({ tag: 'sangramento', damage: 1, turns: 2, sourceId: battle.allies[0].id });
  const actor = battle.allies[0];
  actor.abilities[0] = { id: 'impulso', name: 'Execução em Área', target: 'all-enemies', damage: 1, costs: {}, combo: { condition: 'bleed', bonusDamage: 1, consume: true } };
  assert.equal(chooseAction(battle, actor.id, 'impulso', 'a').ok, true);
  assert.equal(commitTurn(battle).ok, true);
  resolveNextAction(battle);
  assert.equal(battle.resources.ruptura, 1);
  assert.ok(battle.enemies.every(enemy => !enemy.dots.some(dot => dot.tag === 'sangramento')));
});

test('a Viúva recebe Vida e Coringa ao eliminar a própria vítima marcada', () => {
  const battle = createBattle(['a-viuva-escarlate'], [dummy()], { rng: () => 0 });
  battle.resources = emptyPool();
  const actor = battle.allies[0], target = battle.enemies[0];
  actor.hp = 50;
  target.hp = 1;
  target.marks.fio = { sourceId: actor.id, turns: 2, label: 'Fio Escarlate' };
  strike(battle, {}, target.id);
  assert.equal(actor.hp, 58);
  assert.equal(battle.resources.coringa, 1);
});

test('a recuperação de três devoradores muda conforme o tipo de dano', () => {
  const cases = [['physical', 4], ['piercing', 6], ['energy', 2], ['affliction', 0]];
  for (const [damageType, restored] of cases) {
    const battle = createBattle(['o-devorador'], [dummy()], { rng: () => 0 });
    battle.resources = emptyPool();
    battle.allies[0].hp = 50;
    strike(battle, { damage: 10, damageType }, battle.enemies[0].id);
    assert.equal(battle.allies[0].hp, 50 + restored, damageType);
  }
});

test('formas transformadas têm custos próprios e mudam a passiva de turno', () => {
  const furor = characterById['o-odio-encarnado'];
  const eruption = furor.abilities.find(a => a.id === 'voto').forms.find(a => a.formKey === 'eruption');
  const baseCost = getAbilityResourceCosts({ ...furor, bodyForm: 'base' }, eruption);
  const rageCost = getAbilityResourceCosts({ ...furor, bodyForm: 'rage' }, eruption);
  assert.equal(baseCost.essence, rageCost.essence + 1);

  const suserano = createBattle(['o-trono-vazio'], [dummy()], { rng: () => 0 });
  assert.equal(suserano.allies[0].shield, 4);
  const herdeiro = createBattle(['o-herdeiro-cativo'], [dummy()], { rng: () => 0, teamHealth: { 'o-herdeiro-cativo': 40 } });
  assert.equal(herdeiro.allies[0].hp, 37);
  assert.equal(herdeiro.allies[0].charge, 1);
});

test('as quatro respostas de contra-ataque têm condições e efeitos diferentes', () => {
  const find = id => characterById[id].abilities.find(a => a.counter);
  const accomplice = find('a-testemunha-cega');
  const deserter = find('o-vigia-ausente');
  const guardian = find('o-ultimo-guardiao');
  const sovereign = find('o-trono-vazio');
  assert.deepEqual(accomplice.counterFilter, ['energy', 'affliction']);
  assert.equal(accomplice.counterEffect.stealEssence.amount, 1);
  assert.deepEqual(deserter.counterFilter, ['physical', 'piercing']);
  assert.equal(deserter.counterEffect.expose, 1);
  assert.equal(guardian.counterRequiresShield, true);
  assert.equal(guardian.counterEffect.generateEssence.resource, 'graca');
  assert.equal(sovereign.counterEffect.drainEssence.resource, 'essence');
  assert.equal(sovereign.counterEffect.expose, 1);
  for (const ability of [accomplice, deserter, guardian, sovereign]) assert.ok(ability.description.length > 50);
});

test('sinergias de Mundo escalam suavemente com aliados vivos', () => {
  const inferno = createBattle(['o-acougueiro', 'o-soberano-quebrado', 'o-sussurro'], [dummy()], { rng: () => 0 });
  rich(inferno);
  strike(inferno, { damage: 1, dot: { tag: 'sangramento', damage: 4, turns: 2 } }, inferno.enemies[0].id);
  assert.equal(inferno.enemies[0].dots[0].damage, 6);

  const paradiseIds = characters.filter(c => c.realm === 'Paraíso').slice(0, 3).map(c => c.id);
  const paradise = createBattle(paradiseIds, [dummy()], { rng: () => 0 });
  rich(paradise);
  const healer = paradise.allies[0], receiver = paradise.allies[1];
  receiver.hp = 50;
  healer.abilities[0] = { id: 'impulso', name: 'Cuidado', target: 'ally', heal: 10, costs: {} };
  assert.equal(chooseAction(paradise, healer.id, 'impulso', receiver.id).ok, true);
  commitTurn(paradise); resolveNextAction(paradise);
  assert.equal(receiver.hp, 62);

  const limboIds = characters.filter(c => c.realm === 'Limbo').slice(0, 3).map(c => c.id);
  const limbo = createBattle(limboIds, [dummy()], { rng: () => 0 });
  assert.ok(limbo.allies.every(ally => ally.shield >= 2));
});

test('a sinergia da Sangria reforça a aflição em +1 por aliado do Elo, até +2', () => {
  const resolve = ids => {
    const battle = createBattle(ids, [dummy()], { rng: () => 0 });
    battle.resources = emptyPool();
    battle.resonance.bonus = 0;
    for (const ally of battle.allies.slice(1)) ally.realm = 'Limbo';
    strike(battle, { damage: 1, dot: { tag: 'sangramento', damage: 4, turns: 2 } }, battle.enemies[0].id);
    return battle.enemies[0].dots[0].damage;
  };
  assert.equal(resolve(['o-acougueiro']), 4);
  assert.equal(resolve(['o-acougueiro', 'a-viuva-escarlate']), 5);
  assert.equal(resolve(['o-acougueiro', 'a-viuva-escarlate', 'o-colecionador-de-cabecas']), 6);
});
