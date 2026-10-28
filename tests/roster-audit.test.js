import test from 'node:test';
import assert from 'node:assert/strict';
import { characters } from '../src/data.js';
import { reviseRosterCharacter } from '../src/roster-revisions.js';
import { englishCharacterPhrases } from '../src/character-english.js';

const byId = id => characters.find(character => character.id === id);
test('roster keeps unique identities and distinct titles for unrelated originals', () => {
  assert.equal(characters.length, 150);
  assert.equal(new Set(characters.map(c => c.id)).size, characters.length);
  assert.equal(new Set(characters.map(c => c.name.normalize('NFC').toLocaleLowerCase('pt-BR'))).size, characters.length);
  const titles = characters.filter(c => !c.storyCharacter).map(c => c.identityTitle.toLocaleLowerCase('pt-BR'));
  assert.equal(new Set(titles).size, titles.length);
  const renamed = characters.filter(c => !c.storyCharacter && !['o-soberano-quebrado','o-falso-profeta','o-que-pesa'].includes(c.id));
  assert.equal(renamed.length, 97);
  assert.ok(renamed.every(c => c.name.includes(' ') && c.identityTitle && c.englishIdentityTitle));
  for (const id of ['o-soberano-quebrado','khoren-caminho','elaris-prologo','o-falso-profeta','o-que-pesa']) assert.ok(byId(id));
  assert.equal(byId('a-mae-rubra').identityTitle, 'Matriarca Escarlate');
  assert.equal(byId('a-senhora-do-ultimo-pao').identityTitle, 'Senhora dos Grãos');
  assert.equal(byId('o-eco-sem-dono').identityTitle, 'Eco Perdido');
});
test('revised names and titles retain historical aliases and preserve gameplay data', () => {
  const source = {id:'a-senhora-do-ultimo-pao', name:'Helena de Adiabene', englishName:'Helena of Adiabene', identityTitle:'A Matriarca', aliases:['A Senhora do Último Pão'], abilities:[{id:'one'}], kingdomId:'magma'};
  const revised = reviseRosterCharacter(source);
  assert.equal(revised.name, 'Yui Shimizu');
  assert.equal(revised.identityTitle, 'Senhora dos Grãos');
  assert.ok(revised.aliases.includes(source.name));
  assert.ok(revised.aliases.includes(source.identityTitle));
  assert.deepEqual(revised.abilities, source.abilities);
  assert.equal(revised.id, source.id);
  assert.equal(revised.kingdomId, source.kingdomId);
  assert.equal(byId('o-falso-profeta').name, 'Joanna Southcott');
  assert.equal(byId('o-soberano-quebrado').englishName, 'Astyages');
  assert.equal(byId('o-soberano-quebrado').name, 'Astíages');
  assert.equal(byId('a-mae-rubra').aliases.includes('A Mãe Rubra'), true);
  assert.equal(byId('o-que-pesa').identityTitle, 'O Regulador');
});
test('revised lore refers to present kingdoms in both languages', () => {
  for (const id of ['o-acougueiro','a-viuva-escarlate','o-colecionador-de-cabecas','gemeos-do-cutelo','o-carrasco-sem-rosto','a-mae-rubra','o-soberano-quebrado','o-trono-vazio','o-principe-das-correntes','a-regente-de-cinzas','o-herdeiro-cativo','o-que-pesa']) {
    const c = byId(id);
    assert.doesNotMatch(c.lore, /\b(?:Sangria|Coroa)\b/);
    assert.ok(englishCharacterPhrases[c.lore], id);
    assert.doesNotMatch(englishCharacterPhrases[c.lore], /\b(?:Bloodshed|Crown)\b/, id);
  }
});
