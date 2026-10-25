import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {characterById} from '../src/data.js';
import {getAbilityResourceCosts} from '../src/combat.js';

test('a Déspota usa seis artes próprias da identidade de matriarca e preserva o kit',async()=>{
  const c=characterById['a-regente-de-cinzas'];
  const assets=[c.art.portrait,c.art.passive,...c.abilities.map(a=>a.art)];
  assert.equal(new Set(assets).size,6);
  const manifest=JSON.parse(await readFile(new URL('../docs/ART_A_REGENTE_DE_CINZAS_STYLE_REFERENCE_REWORK_20261025.json',import.meta.url)));
  assert.equal(manifest.assets.length,6);
  for(const asset of manifest.assets){
    assert.ok(assets.includes('/'+asset.activePath));const bytes=await readFile(new URL('../'+asset.activePath,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.activeSha256);
    assert.equal(asset.activeDimensions,'512x512');assert.equal(asset.activeBytes,bytes.length);
  }
  assert.equal(c.abilities[1].target,'team');assert.equal(c.abilities[1].shield,10);assert.equal(c.abilities[1].regen.heal,2);
  assert.equal(c.abilities[3].cooldown,4);assert.equal(c.abilities[3].invulnerable,1);assert.deepEqual(getAbilityResourceCosts(c,c.abilities[3]),{random:1});
  assert.equal(c.passive.trigger,'support');assert.equal(c.passive.nonDefensive,true);
});

