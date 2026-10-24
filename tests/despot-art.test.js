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
  const manifest=JSON.parse(await readFile(new URL('../docs/ART_DESPOTA_20261024.json',import.meta.url)));
  assert.equal(manifest.assets.length,6);
  for(const asset of manifest.assets){
    assert.ok(assets.includes('/'+asset.path));const bytes=await readFile(new URL('../'+asset.path,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
    assert.equal(asset.width,512);assert.equal(asset.height,512);
  }
  assert.equal(c.abilities[1].target,'team');assert.equal(c.abilities[1].shield,10);assert.equal(c.abilities[1].regen.heal,2);
  assert.equal(c.abilities[3].cooldown,4);assert.equal(c.abilities[3].invulnerable,1);assert.deepEqual(getAbilityResourceCosts(c,c.abilities[3]),{random:1});
  assert.equal(c.passive.trigger,'support');assert.equal(c.passive.nonDefensive,true);
});
