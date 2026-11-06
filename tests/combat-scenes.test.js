import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {combatScenes,combatScene,encounterScene} from '../src/combat-scenes.js';
import {createTacticalBattle} from '../src/tactical-combat.js';
import {createTacticalRun,advanceTacticalRun} from '../src/tactical-run.js';
const allies=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'],enemies=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
test('each world has distinct available scenery and all backgrounds are valid local WebP files',async()=>{
 assert.equal(new Set(combatScenes.map(scene=>scene.id)).size,combatScenes.length);
 assert.equal(new Set(combatScenes.map(scene=>scene.art)).size,combatScenes.length);
 for(const realm of ['Inferno','Paraíso','Limbo'])assert.ok(combatScenes.filter(scene=>scene.realm===realm).length>=2);
 for(const scene of combatScenes){
  const image=await readFile(new URL('..'+scene.art,import.meta.url));
  assert.equal(image.toString('ascii',0,4),'RIFF');assert.equal(image.toString('ascii',8,12),'WEBP');
  const battle=createTacticalBattle(allies,enemies,{fortress:true,scene:scene.id});assert.equal(battle.tactical.scene,scene.id);
 }
});
test('encounters vary scenery within their world without mutating RNG or repeating the previous arena',()=>{
 for(const realm of ['Inferno','Paraíso','Limbo']){
  let previous=combatScenes.find(scene=>scene.realm===realm).id;
  for(let i=0;i<10;i++){
   const next=encounterScene(realm,i,previous);assert.notEqual(next,previous);assert.equal(combatScene(next).realm,realm);
   assert.equal(encounterScene(realm,i,previous),next);previous=next;
  }
 }
 assert.equal(encounterScene('unknown',0,'limbo'),'limbo');
 const battle=createTacticalBattle(allies,enemies,{fortress:true,scene:'limbo'}),before=battle.rngState;
 battle.phase='victory';battle.tactical.stage='finished';
 const next=advanceTacticalRun(createTacticalRun(),battle);
 assert.equal(battle.rngState,before);assert.equal(combatScene(next.scene).realm,battle.enemies[0].realm);
 assert.deepEqual(advanceTacticalRun(createTacticalRun(),battle),next);
});

test('every arena supplies an explicit crop of the playable ground, distinct from distant scenery',()=>{
 for(const scene of combatScenes){
  assert.ok(scene.floorZoom>=200&&scene.floorZoom<=320,scene.id+' zoom');
  assert.ok(scene.floorFocus>=55&&scene.floorFocus<=80,scene.id+' focus');
  const start=(1-100/scene.floorZoom)*scene.floorFocus;
  const end=start+100/scene.floorZoom*100;
  assert.ok(start>=30&&end<=87,scene.id+' must show playable floor rather than sky or front precipice');
 }
});
