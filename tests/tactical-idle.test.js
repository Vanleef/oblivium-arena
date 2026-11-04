import test from 'node:test';
import assert from 'node:assert/strict';
import {tacticalSpriteAtlases,tacticalSpriteFrame,paintTacticalToken} from '../src/tactical-sprites.js';
import {tacticalFrameDuration,tacticalAnimationFrames} from '../src/tactical-animation.js';
import {tacticalIdleTiming,tacticalIdleStyle,tacticalIdleLayerMarkup,blendTacticalSpriteFrame} from '../src/tactical-motion.js';

test('ações sem técnica identificada preservam a pose de repouso',()=>{
 for(const id of Object.keys(tacticalSpriteAtlases)){
  const unit={id},idle=tacticalSpriteFrame(unit),skill=tacticalSpriteFrame(unit,{type:'skill',pose:'impact'});
  assert.equal(idle.row,0);assert.equal(idle.column,0);assert.equal(idle.idleAnimated,false);
  assert.deepEqual(skill,idle);
  assert.equal(tacticalIdleLayerMarkup(idle),'');
  assert.doesNotMatch(tacticalIdleStyle(unit,1000),/--idle-(?:clip|left|top)-/);
 }
 assert.equal(tacticalSpriteFrame({id:'unknown'}),null);assert.equal(tacticalIdleLayerMarkup(null),'');
});
test('fase de respiração continua através das atualizações do DOM e não sincroniza os personagens',()=>{
 const unit={id:'o-acougueiro'},a=tacticalIdleTiming(unit,1000),b=tacticalIdleTiming(unit,1100);
 assert.equal((b.phase-a.phase+a.cycle)%a.cycle,100);assert.deepEqual(tacticalIdleTiming(unit,1000+a.cycle),a);
 assert.notDeepEqual(tacticalIdleTiming({id:'a-viuva-escarlate'},1000),a);assert.equal(a.framePeriod,a.cycle/10);assert.ok(a.cycle<=2000);assert.ok(a.framePeriod<=200);
 assert.match(tacticalIdleStyle(unit,1000),/--idle-delay:-[\d.]+ms/);
});
test('cadência dá tempo a antecipação e recuperação e mantém o contato e o deslocamento sincronizados',()=>{
 const frames=tacticalAnimationFrames({damage:12,damageType:'physical'});
 for(const frame of frames)assert.ok(tacticalFrameDuration({type:'skill',...frame})>=95);
 assert.ok(tacticalFrameDuration({type:'skill',pose:'anticipate'})>=130);
 assert.ok(tacticalFrameDuration({type:'skill',pose:'release'})>=110);
 assert.equal(tacticalFrameDuration({type:'move',pose:'airborne'}),310);
 assert.equal(tacticalFrameDuration({type:'skill',pose:'impact'}),430);
 const sheet={style:{},getAttribute:()=>''},values={},unit={id:'o-acougueiro'};
 const token={style:{setProperty(k,v){values[k]=v;}},dataset:{unitId:unit.id},closest:()=>null,querySelector:()=>sheet};
 paintTacticalToken(token,unit,{actorId:unit.id,type:'move'},{family:'move',pose:'airborne',index:4});
 assert.equal(values['--pose-duration'],'310ms');
 assert.equal(sheet.src,tacticalSpriteFrame(unit).src);
 assert.equal(tacticalSpriteFrame(unit,{type:'move',pose:'airborne'}).column,0);
});
test('dissolução não cria duplicatas quando o quadro não muda, respeita movimento reduzido e remove a camada anterior',async()=>{
 let appended=0,removed=0,settle;const parent={querySelectorAll:()=>[],append(){appended++;}};
 const previous={className:'',setAttribute(){},remove(){removed++;},animate(){return {finished:new Promise(resolve=>{settle=resolve;})};}};
 const sprite={parentElement:parent,style:{left:'0%',top:'0%'},getAttribute:()=>'/atlas.webp',animate(){},cloneNode:()=>previous};
 assert.equal(blendTacticalSpriteFrame(sprite,{src:'/atlas.webp',column:0,row:0},200),false);
 assert.equal(blendTacticalSpriteFrame(sprite,{src:'/atlas.webp',column:1,row:0},200),true);assert.equal(appended,1);settle();await new Promise(resolve=>setTimeout(resolve,0));assert.equal(removed,1);
 const old=globalThis.matchMedia;globalThis.matchMedia=()=>({matches:true});
 try{assert.equal(blendTacticalSpriteFrame(sprite,{src:'/atlas.webp',column:2,row:0},200),false);assert.equal(appended,1);}finally{if(old===undefined)delete globalThis.matchMedia;else globalThis.matchMedia=old;}
});


test('atlas com linha de movimento alternam apoio, impulso, voo e aterrissagem',()=>{
 const unit={id:'nilo'};
 const step=pose=>tacticalSpriteFrame(unit,{type:'move',pose});
 assert.deepEqual(['anticipate','launch','airborne','landing'].map(pose=>{
  const frame=step(pose);
  return [frame.clip,frame.row,frame.column];
 }),[['move',1,1],['move',1,2],['move',1,3],['move',1,4]]);
 assert.deepEqual(step('ready'),tacticalSpriteFrame(unit));
});
