import test from 'node:test';
import assert from 'node:assert/strict';
import {characterById} from '../src/data.js';
import {tacticalClipCoverage} from '../src/tactical-animation-coverage.js';

test('idle fallback never counts as coverage for an unsupported form',()=>{
 const actor=characterById['o-acougueiro'],ability=actor.abilities[0];
 assert.deepEqual(tacticalClipCoverage(actor,ability,{...ability,formKey:'missing-form'}),{mappedAtlas:false,dedicatedAtlas:false,atlasKind:'none'});
});
test('shared base slots and dedicated form clips have separate coverage labels',()=>{
 const actor=characterById['o-tecelao-de-mentiras'],ability=actor.abilities.find(a=>a.id==='tecnica');
 assert.equal(tacticalClipCoverage(actor,ability).atlasKind,'slot');
 assert.equal(tacticalClipCoverage(actor,ability,{...ability,formKey:'unweave'}).atlasKind,'dedicated');
});
test('characters without an atlas remain pending regardless of generic animation timelines',()=>{
 const actor={...characterById['a-senhora-do-ultimo-pao'],id:'unmapped-character-fixture'};
 assert.equal(tacticalClipCoverage(actor,actor.abilities[0]).mappedAtlas,false);
});
