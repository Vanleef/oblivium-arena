import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {characterById,resources} from '../src/data.js';
import {getAbilityResourceCosts} from '../src/combat.js';

test('Sussurro integra seis cenas próprias da identidade anfíbia sem mudar o kit',async()=>{
 const c=characterById['o-sussurro'];const assets=[c.art.portrait,c.art.passive,...c.abilities.map(a=>a.art)];
 assert.equal(new Set(assets).size,6);assert.ok(assets.every(p=>p.includes('/anime-amphibian-20261024/')));
 const manifest=JSON.parse(await readFile(new URL('../docs/ART_SUSSURRO_ANFIBIO_20261024.json',import.meta.url)));
 assert.equal(manifest.assets.length,6);assert.equal(new Set(manifest.assets.map(x=>x.sha256)).size,6);
 for(const asset of manifest.assets){
  assert.ok(assets.includes('/'+asset.path));const bytes=await readFile(new URL('../'+asset.path,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);assert.equal(asset.width,512);assert.equal(asset.height,512);
 }
 assert.match(c.lore,/espírito anfíbio/);assert.ok(resources.some(resource=>resource.id===c.affinity));
 assert.equal(c.abilities[0].damage,5);assert.equal(c.abilities[0].damageType,'energy');assert.equal(c.abilities[0].reactive.damage,8);
 assert.equal(c.abilities[1].damage,20);assert.equal(c.abilities[1].steal,1);assert.equal(c.abilities[1].combo.condition,'poison');
 assert.equal(c.abilities[2].target,'ally');assert.equal(c.abilities[2].counter,15);
 assert.equal(c.abilities[3].invulnerable,1);assert.equal(c.abilities[3].cooldown,4);assert.deepEqual(getAbilityResourceCosts(c,c.abilities[3]),{random:1});
 assert.equal(c.passive.requiresOwnDot,'veneno');assert.deepEqual(c.passive.effect.convertEssence,{from:'essence',to:'random',amount:1});
});
