import test from 'node:test';
import assert from 'node:assert/strict';
import {createTacticalBattle,previewTacticalActivation,submitTacticalActivation,tacticalActivationUnits,tacticalView} from '../src/tactical-combat.js';
import {planTacticalAIActivation} from '../src/tactical-ai.js';

const player=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
const enemy=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
const guard=actorId=>({type:'guard',actorId});
const step=(actorId,x,y)=>({type:'move',actorId,path:[{x,y}]});

test('confirmações são independentes, secretas e resolvem a mesma troca em qualquer ordem',()=>{
 function run(firstSide){
  const battle=createTacticalBattle(player,enemy,{seed:1,alternating:true});
  const actor=player[2],rival=battle.enemies[0].id;
  const orders={player:{id:actor,actions:[step(actor,1,3),guard(actor)]},enemy:{id:rival,actions:[step(rival,3,3),guard(rival)]}};
  const submit=side=>submitTacticalActivation(battle,side,orders[side].id,orders[side].actions);
  assert.equal(submitTacticalActivation(battle,'player',actor,[step(actor,1,3)]).ok,false);
  assert.equal(previewTacticalActivation(battle,'player',actor,[guard(actor),step(actor,1,3)]).ok,false);
  assert.equal(previewTacticalActivation(battle,'player',actor,[step(actor,2,3),guard(actor)]).ok,false);
  assert.equal(previewTacticalActivation(battle,'player',actor,[step(actor,1,3),guard(player[1])]).ok,false);
  const before=structuredClone(battle.tactical.positions),resources={...battle.resources},rng=battle.rngState;
  const aiBefore=firstSide==='player'?planTacticalAIActivation(battle):null;
  assert.deepEqual(submit(firstSide),{ok:true,waiting:true});
  assert.deepEqual(battle.tactical.positions,before);
  assert.deepEqual(battle.resources,resources);
  assert.equal(battle.rngState,rng);
  assert.equal(battle.tactical.events.length,0);
  assert.deepEqual(battle.tactical.activation.spent,[]);
  const secondSide=firstSide==='player'?'enemy':'player',view=tacticalView(battle,secondSide);
  assert.deepEqual(view.tactical.plans,{});
  assert.equal(view.tactical.confirmed[firstSide],true);
  assert.equal(JSON.stringify(view.tactical).includes('actorId'),false);
  if(aiBefore)assert.deepEqual(planTacticalAIActivation(battle),aiBefore);
  assert.equal(submit(firstSide).ok,false);
  const result=submit(secondSide);
  assert.deepEqual(result.events.map(event=>event.type),['exchange-reveal','exchange-move','guard','guard']);
  assert.equal(result.events[0].actors.length,2);
  assert.equal(result.events[1].moves.length,2);
  assert.deepEqual(battle.tactical.positions[actor],{x:1,y:3});
  assert.equal(battle.allies[2].shield,6);
  assert.equal(submit('player').ok,false);
  return {battle,events:result.events};
 }
 const first=run('player'),second=run('enemy');
 assert.deepEqual(first.events,second.events);
 const {battle}=first;
 for(let exchange=2;exchange<=3;exchange++){
  assert.equal(battle.round,1);
  assert.equal(battle.tactical.activation.exchange,exchange);
  const a=tacticalActivationUnits(battle,'player')[0].id,b=tacticalActivationUnits(battle,'enemy')[0].id;
  assert.equal(submitTacticalActivation(battle,'player',a,[guard(a)]).waiting,true);
  assert.equal(submitTacticalActivation(battle,'enemy',b,[guard(b)]).ok,true);
 }
 assert.equal(battle.round,2);
 assert.deepEqual(battle.tactical.activation,{exchange:1,spent:[]});
});

test('duas unidades disputando a mesma casa param, mas continuam com a técnica',()=>{
 const battle=createTacticalBattle(player,enemy,{seed:1,alternating:true});
 const a=player[1],b=battle.enemies[1].id;
 assert.equal(submitTacticalActivation(battle,'player',a,[step(a,2,2),guard(a)]).waiting,true);
 const result=submitTacticalActivation(battle,'enemy',b,[step(b,2,2),guard(b)]);
 const movement=result.events.find(event=>event.type==='exchange-move');
 assert.deepEqual(movement.stopped.map(step=>step.actorId),[a,b]);
 assert.deepEqual(movement.moves,[]);
 assert.deepEqual(battle.tactical.positions[a],{x:1,y:2});
 assert.deepEqual(battle.tactical.positions[b],{x:3,y:2});
 assert.equal(result.events.filter(event=>event.type==='guard'&&!event.skipped).length,2);
});

test('uma troca avança sem esperar um lado que já não pode agir',()=>{
 const battle=createTacticalBattle(player,enemy,{seed:1,alternating:true,obstacles:[{x:2,y:1},{x:2,y:3}]});
 battle.enemies[0].hp=0;
 battle.enemies[1].stunned=1;
 const reply=planTacticalAIActivation(battle);
 assert.equal(submitTacticalActivation(battle,'enemy',reply.actorId,reply.actions).waiting,true);
 const first=submitTacticalActivation(battle,'player',player[0],[guard(player[0])]);
 assert.equal(first.ok,true);
 assert.deepEqual(tacticalActivationUnits(battle,'enemy'),[]);
 const solo=submitTacticalActivation(battle,'player',player[1],[guard(player[1])]);
 assert.equal(solo.waiting,undefined);
 assert.equal(solo.events[0].actors.length,1);
 assert.equal(battle.round,1);
});

test('interface distingue seleção privada, revelação e ativação já consumida',async()=>{
 const handlers={},keys={},root={innerHTML:'',querySelector:selector=>selector.includes('[data-command="commit"]')&&root.innerHTML.includes('data-command="commit"  aria-label')?{}:null,querySelectorAll:()=>[],addEventListener(type,handler){handlers[type]=handler;}};
 const saved={document:globalThis.document,Image:globalThis.Image,matchMedia:globalThis.matchMedia,requestAnimationFrame:globalThis.requestAnimationFrame};
 globalThis.document={getElementById:()=>root,addEventListener(type,handler){keys[type]=handler;}};
 globalThis.Image=class {};globalThis.matchMedia=()=>({matches:true});globalThis.requestAnimationFrame=fn=>fn();
 const click=dataset=>handlers.click({target:{closest:()=>({dataset,disabled:false})}});
 const until=async predicate=>{for(let i=0;i<125;i++){if(predicate())return;await new Promise(resolve=>setTimeout(resolve,40));}assert.fail('A interface não chegou ao estado esperado.');};
 try{
  await import('../src/tactical-demo.js?alternating-flow');
  assert.equal((root.innerHTML.match(/data-cell=/g)||[]).length,25);
  assert.doesNotMatch(root.innerHTML,/activation-dock|card-socket|hand-scroll/);
  click({cell:'0,1'});
  assert.match(root.innerHTML,/movement-mode/);
  assert.match(root.innerHTML,/activation-signal selected/);
  assert.doesNotMatch(root.innerHTML,/activation-signal acting/);
  assert.match(root.innerHTML,/movimento disponível, 1 casa/);
  assert.ok(root.innerHTML.lastIndexOf('data-cell=')<root.innerHTML.indexOf('activation-dock'));
  click({cell:'1,1'});
  assert.match(root.innerHTML,/→ B2/);
  click({mode:'despertar'});
  assert.match(root.innerHTML,/class="cell[^"]*\baim\b[^"]*" data-cell="1,1"/);
  let handled=false;
  keys.keydown({code:'Space',target:{matches:()=>false,closest:()=>null},preventDefault(){handled=true;}});
  assert.equal(handled,true);
  await until(()=>root.innerHTML.includes('Rodada 1 · Em ação'));
  await until(()=>root.innerHTML.includes('Rodada 1 · Escolha um aliado'));
  assert.match(root.innerHTML,/activation-spent mark-spent" data-actor="o-acougueiro" disabled/);
  assert.match(root.innerHTML,/data-cell="1,1"[^>]+aria-label="B2, Riven/);
  click({actor:player[1]});
  assert.match(root.innerHTML,/Técnicas de Lira/);
  click({mode:'guard'});click({command:'commit'});
  await until(()=>root.innerHTML.includes('Rodada 1 · Escolha um aliado'));
  click({actor:player[2]});
  click({mode:'guard'});click({command:'commit'});
  await until(()=>root.innerHTML.includes('Rodada 2 · Escolha um aliado'));
  assert.doesNotMatch(root.innerHTML,/activation-spent mark-spent" data-actor="o-acougueiro"/);
 }finally{for(const [key,value]of Object.entries(saved)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
