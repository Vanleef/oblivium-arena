import test from 'node:test';
import assert from 'node:assert/strict';
import {createBattle,getCombatPlan,previewHit} from '../src/combat.js';
import {characters} from '../src/data.js';
import {highlightKeywords} from '../src/ability-presentation.js';

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

test('glossário de dano perfurante concorda com o motor',()=>{
 const unit={hp:100,shield:20,armor:9,reduction:8,exposed:0,invulnerable:0};
 assert.deepEqual(previewHit(unit,15,{damageType:'piercing'}),{dealt:0,blocked:15,immune:false});
 assert.deepEqual(previewHit(unit,15,{damageType:'affliction'}),{dealt:15,blocked:0,immune:false});
 assert.match(highlightKeywords('dano perfurante'),/ignora reduções de dano, mas é absorvido por Defesa/i);
 assert.match(highlightKeywords('Defesa'),/Dano de aflição a ignora/);
});
