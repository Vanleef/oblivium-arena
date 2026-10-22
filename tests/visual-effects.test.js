import test from 'node:test';
import assert from 'node:assert/strict';
import { elos } from '../src/data.js';
import { eloVisual } from '../src/crests.js';
import { impactMarkup, renderBattleMotion } from '../src/battle-motion.js';
test('cada Elo usa sua própria silhueta sem perder o significado de dano, cura e defesa',()=>{
 const marks=elos.map(e=>eloVisual(e.id));assert.equal(new Set(marks.map(x=>x.path)).size,17);
 for(const elo of elos){for(const [change,mode] of [[{hp:-5},'strike'],[{hp:5},'restore'],[{hp:0,shield:5},'shield'],[{hp:0,shield:0,statuses:['INVULNERÁVEL']},'shield'],[{hp:0,shield:0,statuses:['MARCADO']},'control']]){
  const html=impactMarkup(change,'control',elo.id,25);assert.ok(html.includes(eloVisual(elo.id).path));assert.ok(html.includes(`impact-${mode}`));assert.doesNotMatch(html,/NaN|undefined/);
 }}
 assert.equal(eloVisual('unknown'),null);
});
test('contra-ataques desenham o brasão de quem revidou e o modo reduzido evita medir o campo',()=>{
 const node=(id,elo,x)=>({dataset:{target:id,elo},querySelector:()=>({getBoundingClientRect:()=>({left:x,top:20,width:50,height:50})})});
 let html='';const board={getBoundingClientRect:()=>({left:0,top:0,width:320,height:360}),querySelectorAll:()=>[node('a','protecao',10),node('b','sangria',250)],insertAdjacentHTML:(_,v)=>html=v};
 renderBattleMotion({querySelector:()=>board},{actorId:'a',kind:'impact',changes:[{id:'a',hp:-5}],reactions:[{actorId:'b',targetId:'a'}]});
 assert.ok(html.includes(eloVisual('sangria').path));assert.ok(!html.includes(eloVisual('protecao').path));
 const previous=globalThis.window;try{globalThis.window={matchMedia:()=>({matches:true})};renderBattleMotion({querySelector:()=>assert.fail('não deve medir o campo')},{actorId:'a',changes:[{id:'b',hp:-5}]});}finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
});
