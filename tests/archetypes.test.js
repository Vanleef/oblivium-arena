import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { characters, characterById, resources } from '../src/data.js';
import { archetypeCatalog, affinityForTeam } from '../src/archetypes.js';
import { previewBodyForm } from '../src/body-forms.js';
import { createBattle, chooseAction, commitTurn, resolveNextAction } from '../src/combat.js';

test('cada arquétipo tem presença ampla e identidade com contexto e ícone', () => {
  assert.equal(Object.keys(archetypeCatalog).length, 15);
  for (const [id, archetype] of Object.entries(archetypeCatalog)) {
    assert.ok(archetype.name && archetype.context && archetype.icon, id);
    assert.ok(characters.filter((character) => character.archetypes.includes(id)).length >= 5, id);
  }
  for (const character of characters) {
    assert.ok(character.archetypes.length >= 1 && character.archetypes.length <= 5, character.name);
    assert.equal(character.archetypeDetails[0].id, character.archetype);
    assert.ok(character.archetypeVariant, character.name);
  }
});

test('os cinco tipos de Essência dependem dos kits e variam em cada reino', () => {
  assert.deepEqual(resources.map((resource) => resource.id), ['essence', 'cinza', 'graca', 'ruptura', 'coringa']);
  assert.equal(new Set(characters.map((character) => character.affinity)).size, 5);
  for (const realm of new Set(characters.map((character) => character.realm))) {
    assert.ok(new Set(characters.filter((character) => character.realm === realm).map((character) => character.affinity)).size > 1, realm);
  }
  const matching = characters.find((character) => character.affinity === characters[0].affinity && character.id !== characters[0].id);
  assert.equal(affinityForTeam([characters[0].id, matching.id, characters.find((c) => c.affinity !== matching.affinity).id], characterById), matching.affinity);
});

test('três personagens novos recebem forma completa, técnicas próprias e retrato distinto', () => {
  for (const id of ['o-soberano-quebrado', 'a-brasa-eterna', 'o-eco-sem-dono']) {
    const character = characterById[id], form = character.bodyForms[0];
    assert.ok(form, id);
    assert.deepEqual(Object.keys(form.when).sort(), ['impulso', 'tecnica', 'voto']);
    assert.ok(existsSync(new URL('..' + form.portrait, import.meta.url)), form.portrait);
    assert.notEqual(form.portrait, character.art.portrait);
    const preview = previewBodyForm(character, form.key);
    assert.equal(preview.bodyForm, form.key);
    for (let slot = 0; slot < 3; slot++) {
      assert.equal(preview.abilities[slot].formKey, form.key);
      assert.notEqual(preview.abilities[slot].name, character.abilities[slot].name, `${character.name}/${slot}`);
    }
  }
  assert.ok(characters.filter((character) => character.bodyForms?.length).length >= 8);
});

test('as formas mudam o arquétipo ativo no Codex e durante a batalha', () => {
  for (const character of characters.filter((unit) => unit.bodyForms?.length)) {
    for (const form of character.bodyForms) {
      const preview = previewBodyForm(character, form.key);
      assert.equal(preview.archetype, form.archetype, `${character.name}/${form.name}`);
      assert.equal(preview.archetypeDetails[0].id, form.archetype, `${character.name}/${form.name}`);
      assert.notEqual(preview.archetype, character.baseArchetype, `${character.name}/${form.name}`);
    }
  }

  const id = 'a-pele-alheia', battle = createBattle([id], [{ id: 'alvo', name: 'Alvo', realm: 'Inferno', maxHp: 1000, abilities: [] }], { rng: () => 0 });
  for (const key of Object.keys(battle.resources)) battle.resources[key] = 10;
  const actor = battle.allies[0];
  assert.equal(actor.archetype, 'setup');
  assert.equal(chooseAction(battle, id, 'tecnica', id).ok, true);
  commitTurn(battle);
  resolveNextAction(battle);
  assert.equal(actor.bodyForm, 'skin');
  assert.equal(actor.archetype, 'burst');
  assert.equal(actor.archetypeName, archetypeCatalog.burst.name);
  assert.equal(battle.resources.ruptura, 11);
});
