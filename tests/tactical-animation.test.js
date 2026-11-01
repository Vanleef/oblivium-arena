import test from 'node:test';
import assert from 'node:assert/strict';
import {characterById,characters} from '../src/data.js';
import {tacticalAnimationFrames,tacticalAnimationFamily,tacticalFrameArt} from '../src/tactical-animation.js';

test('todas as habilidades de todo o elenco recebem sequência de oito quadros válida',()=>{
 let count=0;for(const actor of characters){for(const ability of actor.abilities){for(const form of ability.forms||[]){const frames=tacticalAnimationFrames(form);assert.equal(frames.length,8,`${actor.id}/${form.id}`);count++;}const frames=tacticalAnimationFrames(ability);assert.equal(frames.length,8,`${actor.id}/${ability.id}`);assert.equal(frames[0].pose,'ready');assert.equal(frames.at(-1).pose,'ready');assert.ok(['strike','slash','pierce','projectile','burst','bind','affliction','guard','counter','support'].includes(frames[0].family));count++;}}assert.ok(count>300,`cobertura de habilidades abaixo do esperado: ${count}`);
});

test('movimento, guarda, suporte e ataques em área usam sequências próprias',()=>{
 assert.equal(tacticalAnimationFamily(null,'move'),'move');assert.equal(tacticalAnimationFamily({defense:true}),'guard');assert.equal(tacticalAnimationFamily({heal:10,target:'ally'}),'support');assert.equal(tacticalAnimationFamily({target:'all-enemies'}),'burst');assert.equal(tacticalAnimationFamily({damage:10,damageType:'physical',target:'enemy'}),'slash');assert.equal(tacticalAnimationFamily({damage:10,damageType:'piercing',target:'enemy'}),'pierce');assert.equal(tacticalAnimationFamily({damage:10,damageType:'energy',target:'enemy'}),'projectile');assert.equal(tacticalAnimationFamily({counter:15,target:'self'}),'counter');assert.equal(tacticalAnimationFamily({damageType:'affliction',damage:10,target:'enemy'}),'affliction');assert.equal(tacticalFrameArt({art:'/art/skill.webp'},'impact','/art/portrait.webp'),'/art/skill.webp');assert.equal(tacticalFrameArt({art:'/art/skill.webp'},'ready','/art/portrait.webp'),'/art/portrait.webp');assert.equal(tacticalFrameArt({},'impact','/art/portrait.webp'),'/art/portrait.webp');
});

import {readFile} from 'node:fs/promises';
import {tacticalRoster} from '../src/tactical-kits.js';
import {tacticalSpriteAtlases,tacticalSpriteFrame,paintTacticalToken} from '../src/tactical-sprites.js';

test('seis kits piloto têm atlas transparente e quadros distintos para cada ação',async()=>{
 assert.equal(Object.keys(tacticalSpriteAtlases).length,6);
 for(const id of tacticalRoster){
  const unit=characterById[id],atlas=tacticalSpriteAtlases[id];assert.ok(atlas,id);
  const bytes=await readFile(new URL('..'+atlas.src,import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
  const enemy={...unit,sourceId:id,id:'rival-0-'+id};
  assert.deepEqual(tacticalSpriteFrame(unit),tacticalSpriteFrame(enemy));
  for(const [row,abilityId]of ['impulso','tecnica','voto','despertar'].entries()){
   const frames=tacticalAnimationFrames(unit.abilities.find(a=>a.id===abilityId));
   const sampled=frames.map(frame=>tacticalSpriteFrame(unit,{type:'skill',abilityId,...frame}));
   assert.ok(sampled.every(f=>f.row===row+2));assert.equal(new Set(sampled.map(f=>f.column)).size,6);
   const contact=frames.findIndex(f=>f.pose==='impact'||f.pose==='counter');
   assert.ok([3,4].includes(sampled[contact].column),'o contato mostra o desenho ofensivo');
  }
  assert.equal(tacticalSpriteFrame(unit,{type:'move',index:3}).row,1);
  assert.equal(tacticalSpriteFrame(unit,{type:'skill',abilityId:'tecnica',formKey:'unmapped-form'}),null);
 }
 assert.equal(tacticalSpriteFrame({id:'unknown'}),null);
});

test('reprodução atualiza o recorte do ator correto no DOM e preserva os demais',()=>{
 const unit=characterById[tacticalRoster[0]],sheet={style:{}},token={dataset:{unitId:unit.id},querySelector:s=>s==='.sprite-sheet'?sheet:null};
 const event={actorId:unit.id,type:'skill',abilityId:'impulso'};
 const frames=tacticalAnimationFrames(unit.abilities[0]);
 paintTacticalToken(token,unit,event,frames[1]);assert.equal(sheet.style.backgroundPosition,'20% 40%');
 paintTacticalToken(token,unit,event,frames.find(f=>f.pose==='impact'));assert.equal(sheet.style.backgroundPosition,'60% 40%');assert.equal(token.dataset.pose,'impact');
 token.dataset.unitId='other';assert.equal(paintTacticalToken(token,unit,event,frames[6]),false);assert.equal(sheet.style.backgroundPosition,'60% 40%');
 const image={src:''},fallback={dataset:{unitId:unit.id,portrait:'/portrait.webp',skillArt:'/skill.webp'},querySelector:s=>s==='.token-art'?image:null};
 paintTacticalToken(fallback,unit,event,{family:'slash',pose:'impact'});assert.equal(image.src,'/skill.webp');
 paintTacticalToken(fallback,unit,event,{family:'slash',pose:'ready'});assert.equal(image.src,'/portrait.webp');
});
