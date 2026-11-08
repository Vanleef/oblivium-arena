import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {tacticalDuelOptions,tacticalDuelResolve,tacticalDuelSummary} from '../src/tactical-duel.js';
import {createCompactPvpBattle,publicCompactPvpBattle,submitCompactPvpPlan} from '../server/compact-pvp.js';
import {boardCells,findPath} from '../src/tactical-board.js';
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
 assert.match(app,/tacticalSpriteFrame\(unit,event/);
});
test('online interface exposes private card hands, clash controls, objectives and a responsive battlefield',async()=>{
 const app=await read('src/compact-online.js'),css=await read('compact-online.css');
 for(const part of ['online-cards','online-board','online-unit-name','online-objective','online-clash','online-reward','online-formation'])assert.match(app,new RegExp(part));
 assert.match(app,/data-response/);
 assert.match(app,/data-reward/);
 assert.match(app,/class="tactical-hand-dock"/);
 assert.match(app,/class="online-card" data-move/);
 assert.match(app,/class="online-card" data-basic/);
 assert.doesNotMatch(app,/<h3>Itens<\/h3>|<h3>Ações<\/h3>/);
 assert.match(app,/event\.target\.matches\('button,input,select,textarea,\[contenteditable\]'\)/);
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

test('online permanent move card tracks a queued free movement and undo',async()=>{
 const previous={document:globalThis.document,fetch:globalThis.fetch,setInterval:globalThis.setInterval};
 const ids=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
 const rivals=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
 const battle=publicCompactPvpBattle(createCompactPvpBattle(ids,rivals,{seed:17}),'player');
 const destination=boardCells(battle).find(cell=>findPath(battle,ids[0],cell,1));
 assert.ok(destination);
 const response={profile:{name:'Alice'},match:{id:'match',version:1,battle}};
 const listeners={};
 const root={innerHTML:'',addEventListener(type,fn){listeners[type]=fn;},querySelector(){return null;}};
 const click=dataset=>listeners.click({detail:1,target:{closest:()=>({dataset,disabled:false})}});
 try{
  globalThis.document={getElementById:()=>root,addEventListener(){}};
  globalThis.setInterval=()=>0;
  globalThis.fetch=async url=>({ok:true,json:async()=>url==='/api/account'?{user:{handle:'Alice'},profile:{ownedIds:ids}}:response});
  await import('../src/compact-online.js?permanent-move-hand=1');
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(root.innerHTML,/data-move[^>]*aria-pressed="false"[^>]*>/);
  await click({move:''});
  await click({cell:destination.x+','+destination.y});
  assert.match(root.innerHTML,/data-move[^>]*disabled/);
  assert.match(root.innerHTML,/Confirmar rodada · 1\/6/);
  await click({undo:''});
  assert.doesNotMatch(root.innerHTML,/data-move[^>]*disabled/);
 }finally{
  for(const [key,value] of Object.entries(previous)){
   if(value===undefined)delete globalThis[key];else globalThis[key]=value;
  }
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

test('successive reward offers submit the card selected for the current character',async()=>{
 const previous={document:globalThis.document,fetch:globalThis.fetch,setInterval:globalThis.setInterval};
 const ids=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
 const rivals=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
 const battle=createCompactPvpBattle(ids,rivals,{seed:17});
 const offer=actorId=>({id:'offer:'+actorId,side:'player',actorId,tierName:'Prata',
  options:[{id:'inscription',title:'Inscrição',text:'Melhoria',effect:{type:'tactical-card-upgrade'}}]});
 battle.tactical.stage='reward';
 battle.tactical.pendingChestRewards=[offer(ids[0]),offer(ids[1])];
 const response=()=>({profile:{name:'Alice'},match:{id:'match',version:4,battle:publicCompactPvpBattle(battle,'player')}});
 const listeners={},sent=[];
 let html='',select=null;
 const root={
  get innerHTML(){return html;},
  set innerHTML(value){
   html=value;
   const section=value.match(/<select data-reward-card>(.*?)<\/select>/);
   const options=section?[...section[1].matchAll(/<option value="([^"]+)"/g)].map(match=>({value:match[1]})):[];
   select=options.length?{value:options[0].value,options}:null;
  },
  addEventListener(type,listener){listeners[type]=listener;},
  querySelector(selector){return selector==='[data-reward-card]'?select:null;}
 };
 try{
  globalThis.document={getElementById:()=>root,addEventListener(){}};
  globalThis.setInterval=()=>0;
  globalThis.fetch=async(url,options)=>{
   if(url==='/api/account')return {ok:true,json:async()=>({user:{handle:'Alice'},profile:{ownedIds:ids}})};
   const payload=JSON.parse(options.body);
   if(payload.op==='reward'){sent.push(payload);battle.tactical.pendingChestRewards.shift();}
   return {ok:true,json:async()=>response()};
  };
  await import('../src/compact-online.js?successive-rewards=1');
  await new Promise(resolve=>setImmediate(resolve));
  assert.ok(select.options.length>1);
  select.value=select.options[1].value;
  const firstCard=select.value;
  listeners.change({target:{matches:selector=>selector==='[data-reward-card]',value:firstCard}});
  await listeners.click({target:{closest:()=>({disabled:false,dataset:{reward:'inscription'}})}});
  const secondCard=select.value;
  assert.notEqual(secondCard,firstCard);
  await listeners.click({target:{closest:()=>({disabled:false,dataset:{reward:'inscription'}})}});
  assert.deepEqual(sent.map(item=>({offerId:item.offerId,cardId:item.cardId})),[
   {offerId:'offer:'+ids[0],cardId:firstCard},{offerId:'offer:'+ids[1],cardId:secondCard}
  ]);
 }finally{
  for(const [key,value] of Object.entries(previous)){
   if(value===undefined)delete globalThis[key];else globalThis[key]=value;
  }
 }
});

test('unchanged polling preserves the current controls while updates and errors are rendered',async()=>{
 const previous={document:globalThis.document,fetch:globalThis.fetch,setInterval:globalThis.setInterval};
 const ids=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
 const rivals=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
 const battle=createCompactPvpBattle(ids,rivals,{seed:17});
 const response={profile:{name:'Alice'},queued:false,
  match:{id:'match',version:1,battle:publicCompactPvpBattle(battle,'player')}};
 let html='',renders=0,poll,failed=false;
 const listeners={};
 const root={
  get innerHTML(){return html;},
  set innerHTML(value){html=value;renders++;},
  addEventListener(type,listener){listeners[type]=listener;},querySelector(){return null;}
 };
 try{
  globalThis.document={getElementById:()=>root,addEventListener(){}};
  globalThis.setInterval=callback=>{poll=callback;return 0;};
  globalThis.fetch=async(url)=>{
   if(url==='/api/account')return {ok:true,json:async()=>({user:{handle:'Alice'},profile:{ownedIds:ids}})};
   if(failed)return {ok:false,status:503,json:async()=>({error:'Arena indisponível'})};
   return {ok:true,json:async()=>structuredClone(response)};
  };
  await import('../src/compact-online.js?stable-poll=1');
  await new Promise(resolve=>setImmediate(resolve));
  const initialRenders=renders;
  await poll();
  assert.equal(renders,initialRenders);
  response.match.version++;
  await poll();
  assert.equal(renders,initialRenders+1);
  failed=true;
  await poll();
  assert.equal(renders,initialRenders+2);
  assert.match(html,/Arena indisponível/);
  failed=false;
  await poll();
  assert.equal(renders,initialRenders+3);
  assert.doesNotMatch(html,/Arena indisponível/);
  await poll();
  assert.equal(renders,initialRenders+3);
  failed=true;
  await listeners.click({target:{closest:()=>({disabled:false,dataset:{refresh:''}})}});
  assert.match(html,/Arena indisponível/);
  failed=false;
  await poll();
  assert.equal(renders,initialRenders+4);
  assert.match(html,/Arena indisponível/);
 }finally{
  for(const [key,value] of Object.entries(previous)){
   if(value===undefined)delete globalThis[key];else globalThis[key]=value;
  }
 }
});

test('a player request cancels an in-flight poll and ignores its stale response',async()=>{
 const previous={document:globalThis.document,fetch:globalThis.fetch,setInterval:globalThis.setInterval};
 const ids=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
 const rivals=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
 const battle=publicCompactPvpBattle(createCompactPvpBattle(ids,rivals,{seed:17}),'player');
 const response=(name,version)=>({profile:{name},queued:false,match:{id:'match',version,battle}});
 const listeners={};
 const root={innerHTML:'',addEventListener(type,listener){listeners[type]=listener;},querySelector(){return null;}};
 let poll,resolvePoll,pollSignal,requests=0;
 try{
  globalThis.document={getElementById:()=>root,addEventListener(){}};
  globalThis.setInterval=callback=>{poll=callback;return 0;};
  globalThis.fetch=async(url,options)=>{
   if(url==='/api/account')return {ok:true,json:async()=>({user:{handle:'Alice'},profile:{ownedIds:ids}})};
   requests++;
   if(requests===2){
    pollSignal=options.signal;
    return await new Promise(resolve=>{resolvePoll=resolve;});
   }
   if(requests===4){
    return await new Promise((resolve,reject)=>{
     options.signal.addEventListener('abort',()=>reject(Object.assign(Error('aborted'),{name:'AbortError'})));
    });

   }
   return {ok:true,json:async()=>structuredClone(requests===1?response('Inicial',1):response('Atualizado',2))};
  };
  await import('../src/compact-online.js?poll-race=1');
  await new Promise(resolve=>setImmediate(resolve));
  const pending=poll();
  assert.ok(resolvePoll);
  await listeners.click({target:{closest:()=>({disabled:false,dataset:{refresh:''}})}});
  assert.equal(pollSignal.aborted,true);
  assert.equal(requests,3);
  assert.match(root.innerHTML,/Atualizado/);
  resolvePoll({ok:true,json:async()=>structuredClone(response('Obsoleto',1))});
  await pending;
  assert.match(root.innerHTML,/Atualizado/);
  assert.doesNotMatch(root.innerHTML,/Obsoleto/);
  const aborted=poll();
  await listeners.click({target:{closest:()=>({disabled:false,dataset:{refresh:''}})}});
  await aborted;
  assert.equal(requests,5);
  assert.doesNotMatch(root.innerHTML,/aborted/);
  await poll();
  assert.equal(requests,6);
 }finally{
  for(const [key,value] of Object.entries(previous)){
   if(value===undefined)delete globalThis[key];else globalThis[key]=value;
  }
 }
});

test('a failed resynchronization after a rejected action is visible to the player',async()=>{
 const previous={document:globalThis.document,fetch:globalThis.fetch,setInterval:globalThis.setInterval};
 const ids=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
 const rivals=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
 const battle=publicCompactPvpBattle(createCompactPvpBattle(ids,rivals,{seed:17}),'player');
 const response={profile:{name:'Alice'},queued:false,match:{id:'match',version:1,battle}};
 const listeners={};
 const root={innerHTML:'',addEventListener(type,listener){listeners[type]=listener;},querySelector(){return null;}};
 let requests=0;
 try{
  globalThis.document={getElementById:()=>root,addEventListener(){}};
  globalThis.setInterval=()=>0;
  globalThis.fetch=async(url)=>{
   if(url==='/api/account')return {ok:true,json:async()=>({user:{handle:'Alice'},profile:{ownedIds:ids}})};
   requests++;
   if(requests===1)return {ok:true,json:async()=>structuredClone(response)};
   if(requests===2)return {ok:false,status:409,json:async()=>({error:'Rodada desatualizada.'})};
   return {ok:false,status:503,json:async()=>({error:'Serviço indisponível.'})};
  };
  await import('../src/compact-online.js?failed-resync=1');
  await new Promise(resolve=>setImmediate(resolve));
  await listeners.click({target:{closest:()=>({disabled:false,dataset:{confirm:''}})}});
  assert.equal(requests,3);
  assert.match(root.innerHTML,/Rodada desatualizada/);
  assert.match(root.innerHTML,/Não foi possível atualizar o combate: Serviço indisponível/);
 }finally{
  for(const [key,value] of Object.entries(previous)){
   if(value===undefined)delete globalThis[key];else globalThis[key]=value;
  }
 }
});

test('a pending clash interrupts an on-demand replay and keeps its response controls available',async()=>{
 const previous={document:globalThis.document,fetch:globalThis.fetch,setInterval:globalThis.setInterval,setTimeout:globalThis.setTimeout};
 const ids=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
 const rivals=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
 const battle=createCompactPvpBattle(ids,rivals,{seed:17});
 const unit=battle.allies[0],destination=boardCells(battle).find(cell=>findPath(battle,unit.id,cell,1));
 assert.equal(submitCompactPvpPlan(battle,'player',1,[{type:'move',actorId:unit.id,path:findPath(battle,unit.id,destination,1)}]).ok,true);
 assert.equal(submitCompactPvpPlan(battle,'enemy',1,[]).ok,true);
 let response={profile:{name:'Alice'},queued:false,match:{id:'match',version:1,battle:publicCompactPvpBattle(battle,'player')}};
 const index=response.match.battle.tactical.events.findIndex(event=>event.type==='exchange-move');
 const listeners={};
 const stage={innerHTML:''};
 const root={innerHTML:'',addEventListener(type,listener){listeners[type]=listener;},
  querySelector(selector){return selector==='[data-replay-stage]'?stage:null;}};
 let poll,timer;
 try{
  globalThis.document={getElementById:()=>root,addEventListener(){}};
  globalThis.setInterval=callback=>{poll=callback;return 0;};
  globalThis.fetch=async(url)=>url==='/api/account'
   ?{ok:true,json:async()=>({user:{handle:'Alice'},profile:{ownedIds:ids}})}
   :{ok:true,json:async()=>structuredClone(response)};
  await import('../src/compact-online.js?replay-interruption=1');
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(root.innerHTML,/data-replay-event/);
  globalThis.setTimeout=callback=>{timer=callback;return 1;};
  await listeners.click({target:{closest:()=>({disabled:false,dataset:{replayEvent:String(index)}})}});
  assert.match(stage.innerHTML,/Repetição visual/);
  const firstFrame=stage.innerHTML;
  battle.tactical.stage='resolving';
  battle.tactical.pendingClash={defenderSide:'player',actorId:battle.enemies[0].id,
   abilityId:'voto',targetId:unit.id,willSign:'luz'};
  response={profile:{name:'Alice'},queued:false,match:{id:'match',version:2,battle:publicCompactPvpBattle(battle,'player')}};
  await poll();
  assert.match(root.innerHTML,/Confronto de Vontades/);
  assert.doesNotMatch(root.innerHTML,/data-replay-event/);
  timer();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(stage.innerHTML,firstFrame);
 }finally{
  for(const [key,value] of Object.entries(previous)){
   if(value===undefined)delete globalThis[key];else globalThis[key]=value;
  }
 }
});
