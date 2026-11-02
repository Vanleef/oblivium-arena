import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {characters} from '../src/data.js';
import {tacticalAnimationFamily} from '../src/tactical-animation.js';
import {tacticalVfxAtlas,tacticalVfxMarkup,tacticalVfxRow} from '../src/tactical-vfx.js';

test('efeitos compartilhados cobrem as famílias do catálogo e recusam famílias desconhecidas',async()=>{
 for(const c of characters)for(const a of c.abilities)for(const f of [a,...(a.forms||[])]){
  const row=tacticalVfxRow(tacticalAnimationFamily(f));assert.ok(Number.isInteger(row)&&row>=0&&row<4);
 }
 assert.equal(tacticalVfxMarkup('unknown'), '');
 assert.match(tacticalVfxMarkup('support'),/aria-hidden="true"/);
 const bytes=await readFile(new URL('..'+tacticalVfxAtlas.src,import.meta.url));
 assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
});
