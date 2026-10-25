import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {characterById} from '../src/data.js';
import {getAbilityResourceCosts} from '../src/combat.js';

test('o Príncipe tem sete artes pictóricas próprias, incluindo a continuação do Grilhão',async()=>{
  const c=characterById['o-principe-das-correntes'];
  const art=[c.art.portrait,c.art.passive,...c.abilities.map(a=>a.art),c.abilities[0].forms.find(f=>f.formKey==='drag').art];
  assert.equal(art.length,7);assert.equal(new Set(art).size,7);
  const hashes=[];
  for(const path of art){assert.match(path,/style-reference-rework-20261025/);const file=new URL(`..${path}`,import.meta.url);await access(file);hashes.push(createHash('sha256').update(await readFile(file)).digest('hex'))}
  assert.equal(new Set(hashes).size,7);
  const manifest=JSON.parse(await readFile(new URL('../docs/ART_O_PRINCIPE_DAS_CORRENTES_STYLE_REFERENCE_REWORK_20261025.json',import.meta.url)));
  assert.equal(manifest.assets.length,7);
  for(const asset of manifest.assets){const bytes=await readFile(new URL(`../${asset.activePath}`,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.activeSha256);assert.equal(asset.activeDimensions,'512x512');assert.equal(asset.activeBytes,bytes.length);assert.ok((asset.scene+asset.camera).length>40)}
  assert.equal(c.abilities[3].cooldown,4);assert.equal(c.abilities[3].invulnerable,1);assert.deepEqual(getAbilityResourceCosts(c,c.abilities[3]),{random:1});
  assert.equal(c.passive.trigger,'hit');assert.equal(c.passive.requiresOwnMark,true);
});

