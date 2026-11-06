import test from 'node:test';
import assert from 'node:assert/strict';
import {starters} from '../src/data.js';
import {defaultKingdomByTrack} from '../src/kingdoms.js';
import {normalizeCampaign} from '../src/progression.js';

const oldProfile=(legacyId)=>({
 ownedIds:starters.map(character=>character.id),
 team:starters.slice(0,3).map(character=>character.id),
 completedElos:[legacyId],
 eloProgress:{[legacyId]:{clearedDifficulties:[0],wins:2,combats:3,elites:1,events:1}}
});
const cleared=(profile,id)=>profile.eloProgress[id]?.clearedDifficulties||[];

test('a previous Limbo Elo clear migrates only into Vestíbulo, not four Reinos',()=>{
 const p=normalizeCampaign(oldProfile('correntes-quebradas'));
 assert.equal(defaultKingdomByTrack['correntes-quebradas'],'vestibulo');
 assert.deepEqual(cleared(p,'vestibulo'),[0]);
 for(const id of ['purgatorio','aqueronte','umbral'])assert.deepEqual(cleared(p,id),[],id);
 assert.deepEqual(p.completedElos,['vestibulo']);
 assert.deepEqual(p.conquestAugments.completedKingdoms,['vestibulo']);
 assert.equal(p.conquestAugments.spins,2,'one historical clear earns two spins, not eight');
 assert.equal(p.kingdomProgressVersion,1);
});

test('legacy split-roster tracks never grant unrelated Reinos or unlock Gold tiers',()=>{
 for(const [legacy,destination,unrelated] of [
  ['fome','magma','putrido'],
  ['protecao','marte','empireo'],
  ['verdade','sol','oblivio']
 ]){
  const p=normalizeCampaign(oldProfile(legacy));
  assert.deepEqual(cleared(p,destination),[0],legacy);
  assert.deepEqual(cleared(p,unrelated),[],legacy);
  assert.deepEqual(p.completedElos,[destination],legacy);
  assert.equal(p.conquestAugments.completedKingdoms.length,1);
 }
});

test('already recorded canonical kingdom clears remain intact through migration',()=>{
 const p=oldProfile('correntes-quebradas');
 p.completedElos.push('purgatorio');
 p.eloProgress.purgatorio={clearedDifficulties:[0,1],wins:2};
 normalizeCampaign(p);
 assert.deepEqual(cleared(p,'vestibulo'),[0]);
 assert.deepEqual(cleared(p,'purgatorio'),[0,1]);
 assert.deepEqual(cleared(p,'aqueronte'),[]);
 assert.deepEqual(cleared(p,'umbral'),[]);
 assert.deepEqual(p.conquestAugments.completedKingdoms,['purgatorio','vestibulo']);
 assert.equal(p.conquestAugments.spins,4);
 const again=structuredClone(p);
 normalizeCampaign(again);
 assert.deepEqual(again.eloProgress,p.eloProgress,'migration is idempotent');
 assert.deepEqual(again.conquestAugments,p.conquestAugments,'spins are not duplicated on reload');
});
