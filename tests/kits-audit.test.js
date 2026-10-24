import test from 'node:test';
import assert from 'node:assert/strict';
import {characters} from '../src/data.js';
import {createBattle,chooseAction,passTurn,meetsCondition,getAbilityResourceCosts} from '../src/combat.js';
const target=()=>({id:'audit-target',name:'Alvo',realm:'Inferno',affinity:'cinza',maxHp:10000,abilities:[]});
function battle(c){const b=createBattle([c.id],[target()],{rng:()=>0});b.resources={essence:100,cinza:100,graca:100,ruptura:100,coringa:100};return b;}
function cast(b,a,targetId){assert.equal(chooseAction(b,b.allies[0].id,a.id,targetId||(['self','ally','team'].includes(a.target)?b.allies[0].id:'audit-target')).ok,true,a.name);assert.equal(passTurn(b),true);}
function findPreparation(c,condition){const tags={bleed:'sangramento',burn:'queimadura',poison:'veneno',decay:'decadencia'};return c.abilities.find(a=>condition.startsWith('mark:')?a.mark===condition.slice(5):tags[condition]?a.dot?.tag===tags[condition]:condition==='exposed'?a.expose:condition==='weakened'?a.weaken>=2:condition==='selfShielded'?a.shield:false);}

test('cada combo pode ser preparado pelo próprio kit e usado no turno seguinte',()=>{
 let checked=0;
 for(const c of characters)for(const a of c.abilities.filter(a=>a.combo)){
  const b=battle(c),u=b.allies[0],v=b.enemies[0],condition=a.combo.condition;
  if(condition==='wounded')v.hp=45;
  else if(condition==='selfWounded')u.hp=45;
  else {const prep=findPreparation(c,condition);assert.ok(prep,`${c.name}: falta preparação para ${condition}`);cast(b,prep);}
  assert.equal(meetsCondition(v,condition,u),true,`${c.name}/${a.name}: preparação expirou`);
  cast(b,a);assert.ok(b.log.some(l=>l.includes(a.name)&&l.includes('COMBO')),`${c.name}/${a.name}: combo não executou`);checked++;
 }
 assert.ok(checked>40);
});

test('cargas e marcas de todos os kits têm um uso mecânico',()=>{
 for(const c of characters){const ss=c.abilities,conditions=[...ss.map(a=>a.combo?.condition),c.passive.type==='hunter'?c.passive.condition:null];
  if(ss.some(a=>a.gainCharge))assert.ok(ss.some(a=>a.perChargeDamage||a.perChargeHeal),`${c.name}: carga sem uso`);
  for(const a of ss)if(a.mark)assert.ok(conditions.some(v=>v==='marked'||v===`mark:${a.mark}`),`${c.name}: marca sem uso`);
  for(const a of ss)assert.equal(Object.values(getAbilityResourceCosts(c,a)).reduce((sum,n)=>sum+n,0),a.cost,`${c.name}/${a.name}: custo exibido`);
 }
});

test('bônus criado no próprio turno chega à próxima ofensiva e expira depois dela',()=>{
 const c=characters.find(c=>c.id==='o-odio-encarnado'),b=battle(c),u=b.allies[0];u.passive=null;
 cast(b,c.abilities[1]);assert.equal(u.boost,10);
 const before=b.enemies[0].hp;cast(b,c.abilities[0]);assert.equal(before-b.enemies[0].hp,40);assert.equal(u.boost,0);
});

test('exposição beneficia a continuação do próprio usuário e expira no fim dessa janela',()=>{
 const c=characters.find(c=>c.id==='a-testemunha-cega'),b=battle(c);b.allies[0].passive=null;
 cast(b,c.abilities[0]);assert.equal(b.enemies[0].exposed,1);
 const hp=b.enemies[0].hp;cast(b,c.abilities[2]);assert.equal(hp-b.enemies[0].hp,50);assert.equal(b.enemies[0].exposed,0);
});

test('benefícios pessoais em área não se multiplicam pelo número de alvos',()=>{
 const b=createBattle([characters[0].id],[0,1,2].map(i=>({...target(),id:`alvo-${i}`}))),u=b.allies[0];u.passive=null;u.hp=30;
 u.abilities[0]={id:'area',name:'Área',target:'all-enemies',costs:{},damage:10,heal:5,shield:7,gainCharge:1};
 cast(b,u.abilities[0]);assert.equal(u.hp,35);assert.equal(u.shield,7);assert.equal(u.charge,1);assert.ok(b.enemies.every(v=>v.hp===9990));
});

test('uma habilidade completamente anulada preserva a primeira ofensiva e as cargas',()=>{
 const b=battle(characters.find(c=>c.passive.type==='firstHit')),u=b.allies[0];u.charge=2;b.enemies[0].counter=1;
 u.abilities[0]={id:'anulada',name:'Anulada',target:'enemy',costs:{},damage:10,gainCharge:1,spendCharge:true};
 cast(b,u.abilities[0]);assert.equal(u.passiveUsed,false);assert.equal(u.charge,2);
});

test('utilidade sem dano não causa dano adicional contra um alvo Exposto',()=>{
 const b=battle(characters[0]);b.enemies[0].exposed=1;b.allies[0].abilities[0]={id:'utilidade',name:'Marca',target:'enemy',costs:{},damage:0,mark:'teste'};
 cast(b,b.allies[0].abilities[0]);assert.equal(b.enemies[0].hp,10000);
});

test('as durações de preparação também funcionam para a oposição',()=>{
 const b=battle(characters[0]),u=b.allies[0],v=b.enemies[0];u.passive=null;
 v.abilities=[{id:'preparar',name:'Preparar',target:'self',costs:{},boost:10}];b.enemyPlanner=s=>s.intents;b.intents=[{actorId:v.id,abilityId:'preparar',targetId:v.id,side:'enemy'}];passTurn(b);assert.equal(v.boost,10);
 v.abilities=[{id:'golpe',name:'Golpe',target:'enemy',costs:{},damage:10}];b.enemyPlanner=s=>s.intents;b.intents=[{actorId:v.id,abilityId:'golpe',targetId:u.id,side:'enemy'}];passTurn(b);assert.equal(u.hp,80);assert.equal(v.boost,0);
 v.abilities=[{id:'expor',name:'Expor',target:'enemy',costs:{},damage:5,expose:1}];b.enemyPlanner=s=>s.intents;b.intents=[{actorId:v.id,abilityId:'expor',targetId:u.id,side:'enemy'}];passTurn(b);assert.equal(u.exposed,1);
 v.abilities=[{id:'golpe',name:'Golpe',target:'enemy',costs:{},damage:10}];b.enemyPlanner=s=>s.intents;b.intents=[{actorId:v.id,abilityId:'golpe',targetId:u.id,side:'enemy'}];const hp=u.hp;passTurn(b);assert.equal(hp-u.hp,20);assert.equal(u.exposed,0);
});


