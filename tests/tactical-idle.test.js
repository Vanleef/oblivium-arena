import test from 'node:test';
import assert from 'node:assert/strict';
import {tacticalSpriteAtlases,tacticalSpriteFrame,paintTacticalToken} from '../src/tactical-sprites.js';
import {tacticalFrameDuration,tacticalAnimationFrames} from '../src/tactical-animation.js';
import {tacticalIdleTiming,tacticalIdleStyle,tacticalIdleLayerMarkup,blendTacticalSpriteFrame} from '../src/tactical-motion.js';

test('todos os 25 atlas existentes usam a primeira fileira no idle, sem emprestar atlas desconhecido',()=>{
 for(const id of Object.keys(tacticalSpriteAtlases)){
  const frame=tacticalSpriteFrame({id});assert.equal(frame.row,0);assert.equal(frame.column,0);assert.equal(frame.idleAnimated,true);
  const layer=tacticalIdleLayerMarkup(frame);assert.match(layer,/idle-next-frame/);assert.match(layer,/left:-100%;top:0%/);
  assert.equal(tacticalSpriteFrame({id},{type:'move',pose:'ready'}).idleAnimated,false);
 }
 assert.equal(tacticalSpriteFrame({id:'unknown'}),null);assert.equal(tacticalIdleLayerMarkup(null),'');
});
test('fase de respiração continua através das atualizações do DOM e não sincroniza os personagens',()=>{
 const unit={id:'o-acougueiro'},a=tacticalIdleTiming(unit,1000),b=tacticalIdleTiming(unit,1100);
 assert.equal((b.phase-a.phase+a.cycle)%a.cycle,100);assert.deepEqual(tacticalIdleTiming(unit,1000+a.cycle),a);
 assert.notDeepEqual(tacticalIdleTiming({id:'a-viuva-escarlate'},1000),a);assert.equal(a.framePeriod,a.cycle/10);
 assert.match(tacticalIdleStyle(unit,1000),/--idle-delay:-[\d.]+ms/);
});
test('cadência dá tempo a antecipação e recuperação e mantém o contato e o deslocamento sincronizados',()=>{
 for(const frame of tacticalAnimationFrames({damage:12,damageType:'physical'}))assert.ok(tacticalFrameDuration({type:'skill',...frame})>=120);
 assert.equal(tacticalFrameDuration({type:'move',pose:'airborne'}),420);
 assert.equal(tacticalFrameDuration({type:'skill',pose:'impact'}),560);
 const sheet={style:{}},values={},unit={id:'o-acougueiro'};
 const token={style:{setProperty(k,v){values[k]=v;}},dataset:{unitId:unit.id},closest:()=>null,querySelector:()=>sheet};
 paintTacticalToken(token,unit,{actorId:unit.id,type:'move'},{family:'move',pose:'airborne',index:4});
 assert.equal(values['--pose-duration'],'420ms');assert.equal(sheet.style.top,'-100%');
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
