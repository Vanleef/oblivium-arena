import test from 'node:test';
import assert from 'node:assert/strict';
import {tacticalActorPalette,tacticalVfxPalette,tacticalPaletteVariables} from '../src/tactical-visual-palette.js';

test('character-specific VFX stays distinct even among combatants sharing a kingdom',()=>{
 const butcher=tacticalActorPalette({id:'oponente-0-0',sourceId:'o-acougueiro',realm:'Inferno',color:'blood'});
 const widow=tacticalActorPalette({id:'a-viuva-escarlate',realm:'Inferno',color:'blood'});
 const architect=tacticalActorPalette({id:'a-arquiteta-verde',realm:'Paraíso',color:'creation'});
 const myra=tacticalActorPalette({id:'a-rainha-dos-fungos',realm:'Limbo',color:'grace'});
 const shield=tacticalActorPalette({id:'o-escudo-vivo',realm:'Paraíso',color:'guard'});
 const limbo=tacticalActorPalette({id:'o-passo-interrompido',realm:'Limbo',color:'limbo'});
 assert.notDeepEqual(butcher,widow);
 assert.notDeepEqual(architect,shield);
 assert.notDeepEqual(architect,limbo);
 assert.notDeepEqual(myra,limbo);
 assert.match(butcher[1],/^#[0-9a-f]{6}$/);
 assert.equal(architect[1],'#76be84');
 assert.equal(shield[1],'#d7b56f');
 assert.equal(limbo[1],'#a88bf0');
 assert.equal(myra[1],'#b47caf');
});
test('unmapped characters retain their canonical kingdom identity without generic world colors',()=>{
 assert.deepEqual(tacticalActorPalette({id:'other-soul',realm:'Inferno',color:'rot'}),['#dce7b6','#90a765','#45513d']);
 assert.deepEqual(tacticalActorPalette({id:'other-soul',realm:'Paraíso',color:'truth'}),['#f1f7ff','#99bcdf','#557398']);
 assert.equal(tacticalActorPalette({id:'new-character',realm:'Inferno'}),null);
 assert.deepEqual(tacticalActorPalette({id:'new-character',realm:'Inferno'},{realmFallback:true}),['#ffe3c7','#cd5447','#602734']);
});
test('real Nilo transformations change the VFX palette only when the form actually changes',()=>{
 const normal=tacticalActorPalette({id:'nilo',realm:'Limbo'});
 const inferno=tacticalActorPalette({id:'nilo',bodyForm:'cinza++',realm:'Limbo'});
 const grace=tacticalActorPalette({id:'nilo',bodyForm:'graca-purificada',realm:'Limbo'});
 const rupture=tacticalActorPalette({id:'nilo',bodyForm:'ruptura',realm:'Limbo'});
 assert.notDeepEqual(normal,inferno);
 assert.notDeepEqual(normal,grace);
 assert.notDeepEqual(normal,rupture);
 assert.notDeepEqual(inferno,grace);
});
test('only validated full hex triples enter Canvas and inline styles',()=>{
 const chosen=['#eFe8D4','#20A0B3','#1A2B3C'];
 assert.deepEqual(tacticalActorPalette({id:'unknown',visualPalette:chosen}),chosen.map(c=>c.toLowerCase()));
 assert.equal(tacticalPaletteVariables(chosen),'--actor-vfx-light:#eFe8D4;--actor-vfx-main:#20A0B3;--actor-vfx-shadow:#1A2B3C;');
 const unsafe={id:'o-acougueiro',visualPalette:['red;opacity:0','#ffffff','#111111']};
 assert.deepEqual(tacticalActorPalette(unsafe),tacticalActorPalette({id:'o-acougueiro'}));
 assert.equal(tacticalPaletteVariables(['red','#ffffff','#000000']),'');
 assert.deepEqual(tacticalVfxPalette(null,['#e4ebf0','#bbabbc','#554477']),['#e4ebf0','#bbabbc','#554477']);
});
