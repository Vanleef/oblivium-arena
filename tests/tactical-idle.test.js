import test from 'node:test';
import assert from 'node:assert/strict';
import {tacticalSpriteAtlases,tacticalSpriteFrame,paintTacticalToken} from '../src/tactical-sprites.js';
import {tacticalIdleCrops} from '../src/tactical-idle-crops.js';
import {tacticalFrameDuration,tacticalAnimationFrames} from '../src/tactical-animation.js';
import {tacticalIdleTiming,tacticalIdleStyle,tacticalIdleLayerMarkup,blendTacticalSpriteFrame} from '../src/tactical-motion.js';

test('todos os 25 atlas existentes usam a primeira fileira no idle, sem emprestar atlas desconhecido',()=>{
 for(const id of Object.keys(tacticalSpriteAtlases)){
  const frame=tacticalSpriteFrame({id});assert.equal(frame.row,0);assert.equal(frame.column,0);assert.equal(frame.idleAnimated,true);
  assert.equal(tacticalIdleLayerMarkup(frame),'');assert.equal(tacticalIdleCrops[id].length,6);assert.match(tacticalIdleStyle({id},1000),/--idle-clip-5:inset/);
  assert.equal(tacticalSpriteFrame({id},{type:'move',pose:'ready'}).idleAnimated,false);
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


test('recorte da Lira preserva a pose e exclui os fragmentos vermelhos do quadro vizinho',()=>{
 const frame=tacticalIdleCrops['a-viuva-escarlate'][3],sourceWidth=1254;
 const left=frame.clip[3]/100*sourceWidth,right=(1-frame.clip[1]/100)*sourceWidth;
 assert.ok(left<=632&&left>620);assert.ok(right>=793&&right<831);
 const anchoredFoot=724+frame.left/100*209;assert.ok(Math.abs(anchoredFoot-104.5)<.01);
});

test('as seis poses cabem na janela de idle sem cortar os braços ao alinhar os pés',()=>{
 for(const [id,frames] of Object.entries(tacticalIdleCrops))for(const frame of frames){
  const left=frame.clip[3]*6+frame.left,right=(100-frame.clip[1])*6+frame.left;
  assert.ok(left>=-.002&&right<=100.002,id+' possui silhueta cortada');
 }
});
