import test from 'node:test';
import assert from 'node:assert/strict';
import {tacticalHandFanStyle,tacticalCardArtMarkup,restoreTacticalHand} from '../src/tactical-card-presentation.js';
import {readFile} from 'node:fs/promises';

test('o leque é simétrico para mãos de um a seis cartões',()=>{
 for(let count=1;count<=6;count++){
  const styles=Array.from({length:count},(_,index)=>tacticalHandFanStyle(index,count));
  const angles=styles.map(style=>Number(style.match(/--hand-angle:([-\d.]+)deg/)[1]));
  assert.ok(angles.every(angle=>Math.abs(angle)<=8));
  for(let i=0;i<count;i++)assert.equal(angles[i]+angles[count-1-i],0);
 }
});

test('arte usa o escapador fornecido e apresenta uma alternativa quando ausente',()=>{
 const escape=value=>value.replaceAll('"','&quot;');
 assert.match(tacticalCardArtMarkup({art:'image"test.webp'},escape),/src="image&quot;test.webp"/);
 assert.match(tacticalCardArtMarkup(null,escape),/hand-card-art-placeholder/);
});

test('a seleção mantém a rolagem da mão e devolve foco ao cartão acionado pelo teclado',()=>{
 let focused=null;
 const buttons=['first','last'].map(id=>({dataset:{card:id},focus(options){focused={id,options};}}));
 const hand={scrollLeft:0,querySelectorAll:()=>buttons},root={querySelector:()=>hand};
 restoreTacticalHand(root,'.hand','card','last',140,true);
 assert.equal(hand.scrollLeft,140);
 assert.deepEqual(focused,{id:'last',options:{preventScroll:true}});
 focused=null;restoreTacticalHand(root,'.hand','card','first',30,false);
 assert.equal(hand.scrollLeft,30);assert.equal(focused,null);
});

test('cartas mantêm arte dominante e grade legível em desktop e celular',async()=>{
 const css=await readFile(new URL('../compact-online.css',import.meta.url),'utf8');
 assert.match(css,/grid-template-rows:112px minmax\(36px,auto\) 48px/);
 assert.match(css,/grid-template-rows:78px minmax\(29px,auto\) 40px/);
 assert.match(css,/\.compact-area-mini\{[\s\S]*?width:48px;height:48px/);
 assert.match(css,/\.compact-area-mini\{width:40px;height:40px/);
 assert.match(css,/\.hand-card-area-label\{position:absolute/);
});
