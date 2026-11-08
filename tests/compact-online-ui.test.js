import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {tacticalDuelOptions,tacticalDuelResolve,tacticalDuelSummary} from '../src/tactical-duel.js';
import {createCompactPvpBattle,publicCompactPvpBattle} from '../server/compact-pvp.js';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
test('online mode routes to its own server-driven screen without changing the AI mode',async()=>{
 const entry=await read('src/tactical-entry.js'),page=await read('tactical.html'),local=await read('src/compact-demo.js');
 assert.match(entry,/query\.has\('online'\)/);
 assert.match(entry,/import\('\.\/compact-online\.js'\)/);
 assert.match(entry,/import\('\.\/compact-demo\.js'\)/);
 assert.match(page,/compact-online\.css/);
 assert.match(local,/href="\/tactical\.html\?online"/);
});
test('compact PvP client routes mutations through the authenticated authoritative API',async()=>{
 const app=await read('src/compact-online.js'),client=await read('src/compact-online-client.js');
 assert.match(client,/fetch\('\/api\/arena-compact'/);
 for(const op of ['queue','cancel','turn','response','reward','ack','profile'])assert.match(app,new RegExp("op:'"+op+"'"));
 assert.match(app,/previewTacticalPlan\(s,side,\[\.\.\.state\.actions,ref\]\)/);
 assert.match(app,/state\.actions\.push\(ref\)/);
 assert.match(app,/willSign:state\.willSign/);
 assert.match(app,/tacticalHand\(s,side,actor\.id\)/);
 assert.match(app,/data-deck-slot/);
 assert.match(app,/data-deck-add/);
 assert.match(app,/deckFor\(id\)/);
 assert.match(app,/team:state\.team,decks/);
 assert.match(app,/tacticalSpriteFrame\(unit,null/);
});
test('online interface exposes private card hands, clash controls, objectives and a responsive battlefield',async()=>{
 const app=await read('src/compact-online.js'),css=await read('compact-online.css');
 for(const part of ['online-cards','online-board','online-unit-name','online-objective','online-clash','online-reward','online-formation'])assert.match(app,new RegExp(part));
 assert.match(app,/data-response/);
 assert.match(app,/data-reward/);
 assert.match(app,/aria-label="Arena 6 por 6"/);
 for(const bp of ['990px','760px','420px'])assert.ok(css.includes(bp));
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test('online screen imports successfully with the browser environment mocked',async()=>{
 const prevDocument=globalThis.document,prevFetch=globalThis.fetch,prevInterval=globalThis.setInterval;
 const root={innerHTML:'',addEventListener(){}};
 try{
  globalThis.document={getElementById:()=>root,addEventListener(){}};
  globalThis.fetch=async()=>({ok:true,json:async()=>({user:null})});
  globalThis.setInterval=()=>0;
  await import('../src/compact-online.js?online-smoke=1');
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(root.innerHTML,/Entre na sua conta/);
  assert.match(root.innerHTML,/Treino contra IA/);
 }finally{
  if(prevDocument===undefined)delete globalThis.document;else globalThis.document=prevDocument;
  if(prevFetch===undefined)delete globalThis.fetch;else globalThis.fetch=prevFetch;
  globalThis.setInterval=prevInterval;
 }
});

test('combat activity and surrender derive from confirmed server events and two deliberate steps',async()=>{
 const app=await read('src/compact-online.js'),css=await read('compact-online.css');
 assert.match(app,/function activityMarkup\(s\)/);
 assert.match(app,/event\.before\?\.allies/);
 assert.match(app,/event\.after\?\.enemies/);
 assert.match(app,/online-activity-changes/);
 assert.match(css,/online-activity-changes/);
 assert.match(app,/data-surrender-confirm/);
 assert.match(app,/data-surrender-cancel/);
 assert.match(app,/op:'surrender'/);
});
test('resolved duels expose both intentions and the canonical result in the activity, even after the match',async()=>{
 for(const attack of tacticalDuelOptions)for(const defense of tacticalDuelOptions){
  const result=tacticalDuelResolve(attack.id,defense.id,{mode:'cards'});
  assert.deepEqual(tacticalDuelSummary(result),{attack:attack.name,defense:defense.name,label:result.label});
 }
 assert.equal(tacticalDuelSummary(null),null);
 const app=await read('src/compact-online.js'),css=await read('compact-online.css');
 assert.match(app,/tacticalDuelSummary\(event\.duel\)/);
 assert.match(app,/Ataque: .*Defesa:/);
 assert.match(app,/Retornar à formação<\/button><\/div>'\+activityMarkup\(s\)/);
 assert.match(css,/online-activity-duel/);
});
test('a default reactive card is submitted when the basic response has been spent',async()=>{
 const previous={document:globalThis.document,fetch:globalThis.fetch,setInterval:globalThis.setInterval};
 const ids=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
 const rivals=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
 const battle=createCompactPvpBattle(ids,rivals,{seed:17});
 const deck=battle.tactical.decks.sides.player[ids[0]];
 const card=Object.values(deck.cards).find(item=>item.kind==='reaction');
 deck.draw=deck.draw.filter(id=>id!==card.id);
 deck.hand.push(card.id);
 battle.tactical.decks.responses.player=0;
 battle.tactical.stage='resolving';
 battle.tactical.pendingClash={defenderSide:'player',actorId:battle.enemies[0].id,
  abilityId:'voto',targetId:ids[0],willSign:'luz'};
 const response={profile:{name:'Alice'},match:{id:'match',version:4,battle:publicCompactPvpBattle(battle,'player')}};
 const listeners={};
 const select={value:card.id,options:[{value:card.id}]};
 const root={innerHTML:'',addEventListener(type,listener){listeners[type]=listener;},
  querySelector(selector){return selector==='[data-response-card]'?select:null;}};
 let sent;
 try{
  globalThis.document={getElementById:()=>root,addEventListener(){}};
  globalThis.setInterval=()=>0;
  globalThis.fetch=async(url,options)=>{
   if(url==='/api/account')return {ok:true,json:async()=>({user:{handle:'Alice'},profile:{ownedIds:ids}})};
   const payload=JSON.parse(options.body);
   if(payload.op==='response')sent=payload;
   return {ok:true,json:async()=>response};
  };
  await import('../src/compact-online.js?reactive-default=1');
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(root.innerHTML,/Custo da resposta/);
  await listeners.click({target:{closest:()=>({disabled:false,dataset:{response:'miragem'}})}});
  assert.deepEqual(sent,{op:'response',version:4,sign:'miragem',cardId:card.id});
 }finally{
  for(const [key,value] of Object.entries(previous)){
   if(value===undefined)delete globalThis[key];else globalThis[key]=value;
  }
 }
});
