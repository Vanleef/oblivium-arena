import test from 'node:test';
import assert from 'node:assert/strict';
import {characterById,characters} from '../src/data.js';
import {tacticalAnimationFrames,tacticalAnimationFamily,tacticalFrameArt} from '../src/tactical-animation.js';

test('todas as habilidades de todo o elenco recebem sequência de oito quadros válida',()=>{
 let count=0;for(const actor of characters){for(const ability of actor.abilities){for(const form of ability.forms||[]){const frames=tacticalAnimationFrames(form);assert.equal(frames.length,8,`${actor.id}/${form.id}`);count++;}const frames=tacticalAnimationFrames(ability);assert.equal(frames.length,8,`${actor.id}/${ability.id}`);assert.equal(frames[0].pose,'ready');assert.equal(frames.at(-1).pose,'ready');assert.ok(['strike','slash','pierce','projectile','burst','bind','affliction','guard','counter','support'].includes(frames[0].family));count++;}}assert.ok(count>300,`cobertura de habilidades abaixo do esperado: ${count}`);
});

test('movimento, guarda, suporte e ataques em área usam sequências próprias',()=>{
 assert.equal(tacticalAnimationFamily(null,'move'),'move');assert.equal(tacticalAnimationFamily({defense:true}),'guard');assert.equal(tacticalAnimationFamily({heal:10,target:'ally'}),'support');assert.equal(tacticalAnimationFamily({target:'all-enemies'}),'burst');assert.equal(tacticalAnimationFamily({damage:10,damageType:'physical',target:'enemy'}),'slash');assert.equal(tacticalAnimationFamily({damage:10,damageType:'piercing',target:'enemy'}),'pierce');assert.equal(tacticalAnimationFamily({damage:10,damageType:'energy',target:'enemy'}),'projectile');assert.equal(tacticalAnimationFamily({counter:15,target:'self'}),'counter');assert.equal(tacticalAnimationFamily({damageType:'affliction',damage:10,target:'enemy'}),'affliction');assert.equal(tacticalFrameArt({art:'/art/skill.webp'},'impact','/art/portrait.webp'),'/art/portrait.webp');assert.equal(tacticalFrameArt({art:'/art/skill.webp'},'ready','/art/portrait.webp'),'/art/portrait.webp');assert.equal(tacticalFrameArt({},'impact','/art/portrait.webp'),'/art/portrait.webp');
});

import {readFile} from 'node:fs/promises';
import {tacticalRoster} from '../src/tactical-kits.js';
import {tacticalSpriteAtlases,tacticalSpriteFrame,paintTacticalToken} from '../src/tactical-sprites.js';

test('os kits piloto têm atlas transparente e quadros distintos para cada ação',async()=>{
 assert.equal(Object.keys(tacticalSpriteAtlases).length,29);
 for(const id of Object.keys(tacticalSpriteAtlases)){
  assert.ok(tacticalRoster.includes(id),id);
  const unit=characterById[id],idle=tacticalSpriteFrame(unit);
  const bytes=await readFile(new URL('..'+idle.src,import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  const enemy={...unit,sourceId:id,id:'rival-0-'+id};
  assert.deepEqual(idle,tacticalSpriteFrame(enemy));
  for(const abilityId of ['impulso','tecnica','voto','despertar']){
   const frames=tacticalAnimationFrames(unit.abilities.find(a=>a.id===abilityId));
   const sampled=frames.map(frame=>tacticalSpriteFrame(unit,{type:'skill',abilityId,...frame}));
   assert.ok(new Set(sampled.slice(0,-1).map(f=>f.row+'/'+f.column)).size>=5,id+'/'+abilityId);
   assert.deepEqual(sampled.at(-1),idle);
  }
  assert.deepEqual(tacticalSpriteFrame(unit,{type:'move',index:3}),idle);
  assert.deepEqual(tacticalSpriteFrame(unit,{type:'skill',abilityId:'tecnica',formKey:'unmapped-form'}),idle);
 }
 assert.equal(tacticalSpriteFrame({id:'unknown'}),null);
});

test('Fio de Memória usa seis quadros próprios e restaura o atlas base ao mover',()=>{
 const unit=characterById.nilo,sheet={getAttribute(){return this.src;},style:{setProperty(key,value){this[key]=value;}}},token={style:{setProperty(){}},dataset:{unitId:unit.id},closest:()=>null,querySelector:s=>s==='.sprite-sheet'?sheet:null};
 const event={actorId:unit.id,type:'skill',abilityId:'tecnica'};
 paintTacticalToken(token,unit,event,{family:'bind',pose:'impact',index:5});
 assert.match(sheet.src,/fio-de-memoria/);
 assert.equal(sheet.style.width,'300%');assert.equal(sheet.style.height,'200%');assert.equal(sheet.style.left,'0%');assert.equal(sheet.style.top,'-100%');
 paintTacticalToken(token,unit,{actorId:unit.id,type:'move'},{family:'move',pose:'launch',index:3});
 assert.match(sheet.src,/nilo.webp/);assert.equal(sheet.style.width,'600%');assert.equal(sheet.style.height,'600%');
});

test('reprodução atualiza o recorte do ator correto no DOM e preserva os demais',()=>{
 const unit=characterById[tacticalRoster[0]],sheet={getAttribute(){return this.src;},style:{setProperty(key,value){this[key]=value;}}},token={style:{setProperty(){}},dataset:{unitId:unit.id},closest:()=>null,querySelector:s=>s==='.sprite-sheet'?sheet:null};
 const event={actorId:unit.id,type:'skill',abilityId:'impulso'};
 const frames=tacticalAnimationFrames(unit.abilities[0]);
 paintTacticalToken(token,unit,event,frames[1]);assert.equal(sheet.style.left,'0%');assert.equal(sheet.style.top,'-100%');
 paintTacticalToken(token,unit,event,frames.find(f=>f.pose==='impact'));assert.equal(sheet.style.left,'-400%');assert.equal(sheet.style.top,'-100%');assert.equal(token.dataset.pose,'impact');
 token.dataset.unitId='other';assert.equal(paintTacticalToken(token,unit,event,frames[6]),false);assert.equal(sheet.style.left,'-400%');assert.equal(sheet.style.top,'-100%');
 const image={src:'/portrait.webp'},fallback={style:{setProperty(){}},closest:()=>null,dataset:{unitId:unit.id,portrait:'/portrait.webp',skillArt:'/skill.webp'},querySelector:s=>s==='.token-art'?image:null};
 paintTacticalToken(fallback,unit,event,{family:'slash',pose:'impact'});assert.equal(image.src,'/portrait.webp');
 paintTacticalToken(fallback,unit,event,{family:'slash',pose:'ready'});assert.equal(image.src,'/portrait.webp');
});

test('impactos visuais só aparecem no contato de habilidades efetivamente executadas',async()=>{
 const {tacticalImpactActive,tacticalFrameDuration}=await import('../src/tactical-animation.js');
 for(const pose of ['ready','anticipate','windup','release','travel','recover'])assert.equal(tacticalImpactActive({type:'skill',pose}),false,pose);
 for(const pose of ['impact','counter'])assert.equal(tacticalImpactActive({type:'skill',pose}),true,pose);
 assert.equal(tacticalImpactActive({type:'skill',pose:'impact',skipped:true}),false);
 assert.equal(tacticalImpactActive({type:'move',pose:'landing'}),false);
 assert.equal(tacticalFrameDuration({type:'skill',pose:'impact'}),430);
 assert.equal(tacticalFrameDuration({type:'skill',pose:'counter'}),430);
 assert.equal(tacticalFrameDuration({type:'move',pose:'landing'}),150);
});

test('reação de dano em área distingue alvos protegidos de alvos atingidos',async()=>{
 const {tacticalDamagedTargets}=await import('../src/tactical-animation.js');
 const event={type:'skill',pose:'impact',totalDamage:10,affectedTargetIds:['a','b','c'],
  before:{allies:[],enemies:[{id:'a',hp:100,shield:0},{id:'b',hp:100,shield:0},{id:'c',hp:100,shield:8}]},
  after:{allies:[],enemies:[{id:'a',hp:90,shield:0},{id:'b',hp:100,shield:0},{id:'c',hp:100,shield:3}]}};
 assert.deepEqual(tacticalDamagedTargets(event),['a','c']);
 assert.deepEqual(tacticalDamagedTargets({...event,pose:'windup'}),[]);
 assert.deepEqual(tacticalDamagedTargets({...event,skipped:true}),[]);
});

test('os atlas de Ashara, Judith e Sanson apontam para os sprites normalizados de 2026-11-02',()=>{
 const expected={'a-regente-de-cinzas':'ashara','a-juiza-de-ferro':'judith','o-carrasco-sem-rosto':'sanson'};
 for(const [id,name] of Object.entries(expected)){
  const atlas=tacticalSpriteAtlases[id];
  assert.ok(tacticalRoster.includes(id),id+' precisa estar no piloto');
  assert.equal(atlas.src,'/art/animations/tactical-pilot-20261102/'+name+'.webp');
  assert.deepEqual([atlas.columns,atlas.rows,atlas.cellSize],[6,6,209]);
 }
});

test('Orin tem atlas próprio para Desatar a Trama sem emprestar formas desconhecidas',()=>{
 const unit=characterById['o-tecelao-de-mentiras'];
 const frame=tacticalSpriteFrame(unit,{type:'skill',abilityId:'tecnica',formKey:'unweave',pose:'impact',index:5});
 assert.match(frame.src,/desatar-a-trama-v1/);
 assert.deepEqual([frame.sheetColumns,frame.sheetRows],[3,2]);
 assert.deepEqual(tacticalSpriteFrame(unit,{type:'skill',abilityId:'tecnica',formKey:'missing'}),tacticalSpriteFrame(unit));
});

