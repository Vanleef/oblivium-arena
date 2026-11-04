import test from 'node:test';
import assert from 'node:assert/strict';
import {characters,characterById} from '../src/data.js';
import {createBattle,chooseAction,commitTurn,resolveNextAction} from '../src/combat.js';
import {localizeText} from '../src/i18n.js';
const empty=()=>({essence:0,cinza:0,graca:0,ruptura:0});
const dummy=id=>({id,name:id,realm:'Limbo',maxHp:1000,abilities:[]});
function setup(id,team=[id],enemies=[dummy('a'),dummy('b'),dummy('c')]){
 const b=createBattle(team,enemies,{rngSeed:123,enemyPlanner:()=>[]});
 b.resources=empty();b.enemyResources=empty();b.resonance.bonus=0;
 for(const u of [...b.allies,...b.enemies])u.shield=0;
 return b;
}
function cast(b,extra={},targetId='a'){
 const u=b.allies[0];u.abilities[0]={id:'impulso',name:'Teste',target:'enemy',damage:1,costs:{},...extra};
 assert.equal(chooseAction(b,u.id,'impulso',targetId).ok,true);
 assert.equal(commitTurn(b).ok,true);return resolveNextAction(b);
}

test('Chama e Fome somam doze assinaturas próprias e traduções editoriais do lote',()=>{
 const batch=characters.filter(c=>['chama','fome'].includes(c.eloId));assert.equal(batch.length,12);
 const signatures=batch.map(c=>{const {name,description,art,...rules}=c.passive;return JSON.stringify(rules)});
 assert.equal(new Set(signatures).size,12);assert.ok(batch.every(c=>c.passive.trigger||c.passive.healByDamageType));
 for(const id of ['o-incendiario','o-filho-da-cinza','a-pira-errante','o-coracao-em-furia','o-estomago-sem-fundo','a-senhora-do-ultimo-pao','o-credor']){
  const c=characterById[id];assert.notEqual(localizeText(c.passive.description,'en'),c.passive.description);
 }
});

test('Incendiário exige consumo de Queimadura e não multiplica Éter ou Defesa em área',()=>{
 for(const condition of ['burn','bleed']){
  const b=setup('o-incendiario');
  for(const u of b.enemies)u.dots=[{tag:'queimadura',damage:1,turns:2,sourceId:'another'},{tag:'sangramento',damage:1,turns:2,sourceId:'another'}];
  cast(b,{target:'all-enemies',combo:{condition,bonusDamage:0,consume:true}});
  assert.equal(b.resources.essence,condition==='burn'?1:0);assert.equal(b.allies[0].shield,condition==='burn'?3:0);
 }
});

test('Ressentido exige carga gasta e pelo menos 15 de cura efetiva em si',()=>{
 for(const [charge,hp,defense,expected] of [[0,50,false,0],[1,50,false,1],[3,90,false,0],[2,50,true,0]]){
  const b=setup('o-filho-da-cinza'),u=b.allies[0];u.charge=charge;u.hp=hp;
  cast(b,{damage:0,target:'self',heal:15,perChargeHeal:7,spendCharge:true,defense},u.id);
  assert.equal(b.resources.cinza,expected,JSON.stringify({charge,hp,defense}));assert.equal(u.charge,0);
 }
});

test('Vingadora reage apenas à perda de Vida contra agressor com sua Queimadura ainda ativa',()=>{
 for(const mode of ['own','other','expired','absorbed']){
  const enemy={...characterById['a-pira-errante'],id:'enemy-avenger'};
  const b=setup('o-incendiario',undefined,[enemy]);const u=b.allies[0],v=b.enemies[0];
  u.dots=[{tag:'queimadura',damage:1,turns:mode==='expired'?0:2,sourceId:mode==='other'?'another':v.id}];v.shield=mode==='absorbed'?50:0;
  cast(b,{damage:10},v.id);assert.equal(u.hp,mode==='own'?96:100,mode);
  assert.equal(v.shield,mode==='own'?3:mode==='absorbed'?40:0,mode);
 }
});

test('resposta da Vingadora preserva lado e limite por rodada após serialização',()=>{
 const enemy={...characterById['a-pira-errante'],id:'enemy-avenger'};
 const b=setup('o-incendiario',['o-incendiario','o-credor'],[enemy]);const v=b.enemies[0];
 for(const u of b.allies){u.abilities[0]={id:'impulso',name:'Golpe',target:'enemy',damage:10,costs:{}};u.dots=[{tag:'queimadura',damage:1,turns:2,sourceId:v.id}];assert.equal(chooseAction(b,u.id,'impulso',v.id).ok,true)}
 assert.equal(commitTurn(b).ok,true);resolveNextAction(b);
 const restored=JSON.parse(JSON.stringify(b));resolveNextAction(restored);
 assert.equal(restored.allies[0].hp,96);assert.equal(restored.allies[1].hp,100);assert.equal(restored.enemies[0].hp,83);
});

test('Colérico cura depois do custo de Vida, exige duas cargas e técnica não anulada',()=>{
 for(const [charge,counter,expected] of [[1,false,91],[2,false,97],[3,false,97],[2,true,90]]){
  const b=setup('o-coracao-em-furia'),u=b.allies[0];u.hp=99;u.charge=charge;if(counter)b.enemies[0].counter=1;
  cast(b,{spendCharge:true,selfDamage:8});assert.equal(u.hp,expected,JSON.stringify({charge,counter}));assert.equal(u.charge,counter?charge:0);
 }
 const b=setup('o-coracao-em-furia');b.allies[0].hp=50;b.allies[0].charge=2;
 cast(b,{damage:0,target:'self',shield:2,spendCharge:true},b.allies[0].id);assert.equal(b.allies[0].hp,50);
});

test('Insaciável conta Defesa removida de fato, não dano absorvido nem valor nominal',()=>{
 for(const [guard,strip,expected] of [[9,20,50],[10,20,54],[50,0,50]]){
  const b=setup('o-estomago-sem-fundo');b.allies[0].hp=50;b.enemies[0].shield=guard;
  cast(b,{damage:20,stripShield:strip});assert.equal(b.allies[0].hp,expected);
 }
 const b=setup('o-estomago-sem-fundo');b.allies[0].hp=50;for(const v of b.enemies)v.shield=4;
 cast(b,{target:'all-enemies',stripShield:4});assert.equal(b.allies[0].hp,54);
 const canceled=setup('o-estomago-sem-fundo');canceled.allies[0].hp=50;canceled.enemies[0].shield=20;canceled.enemies[0].counter=1;
 cast(canceled,{stripShield:20});assert.equal(canceled.enemies[0].shield,20);assert.equal(canceled.allies[0].hp,49);
});

test('Matriarca recompensa outro aliado sem multiplicar o roubo pela cura do trio',()=>{
 for(const mode of ['team','self','overheal','defense','empty']){
  const b=setup('a-senhora-do-ultimo-pao',['a-senhora-do-ultimo-pao','o-incendiario','o-credor']);
  for(const u of b.allies)u.hp=mode==='overheal'?99:50;b.enemyResources.essence=mode==='empty'?0:3;
  cast(b,{damage:0,target:mode==='self'?'self':'team',heal:8,defense:mode==='defense'},b.allies[0].id);
  assert.equal(b.resources.essence,mode==='team'?1:0,mode);assert.equal(b.enemyResources.essence,mode==='team'?2:mode==='empty'?0:3,mode);
 }
});

test('Credor exige consumo da própria Dívida e cobra uma vez em área mesmo sem Essência',()=>{
 for(const owner of ['own','other','empty']){
  const b=setup('o-credor');b.allies[0].hp=50;b.enemyResources.essence=owner==='empty'?0:3;
  for(const v of b.enemies)v.marks.divida={sourceId:owner==='other'?'another':b.allies[0].id,turns:3};
  cast(b,{target:'all-enemies',combo:{condition:'mark:divida',bonusDamage:0,consume:true}});
  assert.equal(b.allies[0].hp,owner==='other'?50:52);assert.equal(b.resources.essence,owner==='own'?1:0);
 }
});
