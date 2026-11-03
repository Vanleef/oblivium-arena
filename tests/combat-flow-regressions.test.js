import test from 'node:test';
import assert from 'node:assert/strict';
import {createBattle,getCombatPlan,previewHit,chooseAction,commitTurn,resolveNextAction} from '../src/combat.js';
import {characters} from '../src/data.js';
import {highlightKeywords} from '../src/ability-presentation.js';
import {localizeText} from '../src/i18n.js';

test('IA pode abrir a Defesa inimiga em vez de repetir proteção em Vida cheia',()=>{
 const opponent={id:'op',name:'Oponente',realm:'Inferno',abilities:[
  {id:'golpe',name:'Golpe',target:'enemy',damage:15,costs:{essence:1}},
  {id:'escudo',name:'Escudo',target:'self',shield:15,costs:{essence:1}}
 ]};
 const b=createBattle([characters[0].id],[opponent],{rng:()=>0});
 b.enemyResources={essence:1,cinza:0,graca:0,ruptura:0};b.allies[0].shield=40;b.enemies[0].shield=0;
 assert.equal(getCombatPlan(b)[0].abilityId,'golpe');
 b.allies[0].counter=40;assert.equal(getCombatPlan(b)[0].abilityId,'escudo');
});

test('bônus de purga usa vantagens presentes antes da remoção',()=>{
 for(const [id,base,bonus] of [['a-testemunha-integra',15,4],['a-luz-nua',10,3]]){
  for(const count of [0,1,3]){
   const target={id:'target',name:'Alvo',realm:'Inferno',maxHp:1000,abilities:[]};
   const b=createBattle([id],[target],{rng:()=>0,enemyPlanner:()=>[]});
   b.resources={essence:10,cinza:10,graca:10,ruptura:10};const enemy=b.enemies[0];
   for(const key of ['boost','reduction','counter'].slice(0,count))enemy[key]=5;
   const ability=b.allies[0].abilities.find(a=>a.purgeBonusDamage);assert.match(ability.description,/antes de removê-los/);
   assert.match(localizeText(ability.description,'en'),/before removal/);
   assert.equal(chooseAction(b,id,ability.id,'target').ok,true);assert.equal(commitTurn(b).ok,true);resolveNextAction(b);
   assert.equal(1000-enemy.hp,base+bonus*count,`${id}: ${count} vantagens`);
   assert.equal(enemy.boost+enemy.reduction+enemy.counter,0);
  }
 }
});

test('glossário de dano perfurante concorda com o motor',()=>{
 const unit={hp:100,shield:20,armor:9,reduction:8,exposed:0,invulnerable:0};
 assert.deepEqual(previewHit(unit,15,{damageType:'piercing'}),{dealt:0,blocked:15,immune:false});
 assert.deepEqual(previewHit(unit,15,{damageType:'affliction'}),{dealt:15,blocked:0,immune:false});
 assert.match(highlightKeywords('dano perfurante'),/ignora reduções de dano, mas é absorvido por Defesa/i);
 assert.match(highlightKeywords('Defesa'),/Dano de aflição a ignora/);
});
