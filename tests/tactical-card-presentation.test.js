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

test('compact card descriptions include inscriptions without hiding the actual effect',async()=>{
 const {tacticalCardPresentation}=await import('../src/tactical-card-presentation.js');
 const {createTacticalBattle}=await import('../src/tactical-combat.js');
 const ids=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
 const s=createTacticalBattle(ids,ids,{compact:true,fortress:true,cardMode:true,seed:7});
 const actor=s.allies[0],ability=actor.abilities[0],before=JSON.stringify(s);
 const plain=tacticalCardPresentation(s,actor,{kind:'skill',abilityId:ability.id,name:'Nome antigo'});
 const upgraded=tacticalCardPresentation(s,actor,{kind:'skill',abilityId:ability.id,upgrade:{damageBonus:5,retain:true,exhaust:true,damageType:'fire',weaken:1,expose:1}});
 assert.equal(plain.name,ability.name);
 assert.match(upgraded.description,new RegExp('Causa '+(plain.ability.damage+5)+' de dano de Fogo'));
 assert.match(upgraded.description,/Enfraquecido/);
 assert.match(upgraded.description,/Exposto/);
 assert.ok(upgraded.traits.includes('Preservar'));
 assert.ok(upgraded.traits.includes('Exaurir'));
 assert.match(upgraded.description,/dano/);
 assert.doesNotMatch(upgraded.description,/rodada\(s\)/);
 assert.equal(JSON.stringify(s),before);
});

test('mobility and response variants describe their actual side effects',async()=>{
 const {tacticalCardPresentation,tacticalUtilityArtMarkup,handleTacticalCardArtError}=await import('../src/tactical-card-presentation.js');
 const actor={art:{portrait:'/portrait.webp'}};
 assert.match(tacticalCardPresentation({},actor,{kind:'mobility',variantId:'passo-guardado'}).description,/5 de Escudo/);
 assert.match(tacticalCardPresentation({},actor,{kind:'reaction',variantId:'reverso-vital'}).description,/5 de Vida/);
 assert.match(tacticalUtilityArtMarkup(actor,'mobility',String),/portrait.webp/);
 const image={matches:()=>true,hidden:false,parentElement:{dataset:{}}};
 handleTacticalCardArtError({target:image});
 assert.equal(image.hidden,true);
 assert.equal(image.parentElement.dataset.artMissing,'true');
});

test('battlefield removes visible names while retaining names in accessible tile labels',async()=>{
 const local=await readFile(new URL('../src/compact-demo.js',import.meta.url),'utf8');
 const online=await readFile(new URL('../src/compact-online.js',import.meta.url),'utf8');
 assert.doesNotMatch(local,/class="compact-token-label"/);
 assert.doesNotMatch(online,/class="online-unit-name"/);
 assert.ok(local.includes('aria-label="'+"'+cellLabel(p)"));
 assert.match(online,/aria-label="Casa /);
});
