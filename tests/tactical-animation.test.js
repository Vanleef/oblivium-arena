import test from 'node:test';
import assert from 'node:assert/strict';
import {characterById,characters} from '../src/data.js';
import {tacticalAnimationFrames,tacticalAnimationFamily} from '../src/tactical-animation.js';

test('todas as habilidades de todo o elenco recebem sequência de oito quadros válida',()=>{
 let count=0;for(const actor of characters){for(const ability of actor.abilities){for(const form of ability.forms||[]){const frames=tacticalAnimationFrames(form);assert.equal(frames.length,8,`${actor.id}/${form.id}`);count++;}const frames=tacticalAnimationFrames(ability);assert.equal(frames.length,8,`${actor.id}/${ability.id}`);assert.equal(frames[0].pose,'ready');assert.equal(frames.at(-1).pose,'ready');assert.ok(['strike','burst','bind','guard','support'].includes(frames[0].family));count++;}}assert.ok(count>300,`cobertura de habilidades abaixo do esperado: ${count}`);
});

test('movimento, guarda, suporte e ataques em área usam sequências próprias',()=>{
 assert.equal(tacticalAnimationFamily(null,'move'),'move');assert.equal(tacticalAnimationFamily({defense:true}),'guard');assert.equal(tacticalAnimationFamily({heal:10,target:'ally'}),'support');assert.equal(tacticalAnimationFamily({target:'all-enemies'}),'burst');assert.equal(tacticalAnimationFamily({damage:10,target:'enemy'}),'strike');
});
