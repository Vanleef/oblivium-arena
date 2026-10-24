import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {characterById} from '../src/data.js';
import {createBattle,getAbilityResourceCosts} from '../src/combat.js';

test('Herdeiro integra seis cenas da efígie dinástica e preserva riscos e defesa do kit',async()=>{
 const c=characterById['o-herdeiro-cativo'];
 const assets=[c.art.portrait,c.art.passive,...c.abilities.map(a=>a.art)];
 assert.equal(new Set(assets).size,6);
 const manifest=JSON.parse(await readFile(new URL('../docs/ART_HERDEIRO_20261024.json',import.meta.url)));
 assert.equal(manifest.assets.length,6);
 for(const asset of manifest.assets){
  assert.ok(assets.includes('/'+asset.path));const bytes=await readFile(new URL('../'+asset.path,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
  assert.equal(asset.width,512);assert.equal(asset.height,512);
 }
 assert.match(c.lore,/porcelana viva/);assert.match(c.lore,/antebraço esquerdo de correntes/);
 assert.equal(c.abilities[0].missingHpDamage.cap,9);
 assert.equal(c.abilities[1].heal,15);assert.equal(c.abilities[1].reduce,10);
 assert.equal(c.abilities[2].perChargeDamage,8);assert.equal(c.abilities[2].selfDamage,5);
 assert.equal(c.abilities[3].invulnerable,1);assert.equal(c.abilities[3].cooldown,4);
 assert.deepEqual(getAbilityResourceCosts(c,c.abilities[3]),{random:1});
 for(const [hp,expected,charge] of [[1,1,1],[50,47,1],[51,51,0]]){
  const b=createBattle([c.id],[{id:'target',name:'Alvo',maxHp:1000,abilities:[]}],{rngSeed:123,teamHealth:{[c.id]:hp}});
  assert.equal(b.allies[0].hp,expected);assert.equal(b.allies[0].charge,charge);
 }
});
