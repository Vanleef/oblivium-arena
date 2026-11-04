import test from 'node:test';
import assert from 'node:assert/strict';
import {createTacticalBattle,previewTacticalActivation,resolveTacticalActivation,tacticalActivationUnits} from '../src/tactical-combat.js';
import {planTacticalAIActivation} from '../src/tactical-ai.js';

const player=['o-acougueiro','a-viuva-escarlate','o-escudo-vivo'];
const enemy=['o-passo-interrompido','o-odio-encarnado','a-arquiteta-verde'];
const guard=actorId=>({type:'guard',actorId});
const step=(actorId,x,y)=>({type:'move',actorId,path:[{x,y}]});

test('alterna unidades escolhidas livremente e só encerra a rodada depois das ativações disponíveis',()=>{
 const battle=createTacticalBattle(player,enemy,{seed:1,alternating:true});
 const actor=player[2],actions=[step(actor,1,3),guard(actor)];
 assert.equal(resolveTacticalActivation(battle,'enemy',battle.enemies[0].id,[guard(battle.enemies[0].id)]).ok,false);
 assert.equal(resolveTacticalActivation(battle,'player',actor,actions.slice(0,1)).ok,false);
 assert.equal(previewTacticalActivation(battle,'player',actor,[guard(actor),step(actor,1,3)]).ok,false);
 assert.equal(previewTacticalActivation(battle,'player',actor,[step(actor,2,3),guard(actor)]).ok,false);
 assert.equal(previewTacticalActivation(battle,'player',actor,[step(actor,1,3),guard(player[1])]).ok,false);
 const predicted=previewTacticalActivation(battle,'player',actor,actions);
 assert.equal(predicted.ok,true);
 assert.deepEqual(battle.tactical.positions[actor],{x:0,y:3});
 const first=resolveTacticalActivation(battle,'player',actor,actions);
 assert.deepEqual(first.events.map(event=>event.type),['move','guard']);
 assert.deepEqual(battle.tactical.positions[actor],{x:1,y:3});
 assert.equal(battle.allies[2].shield,6);
 assert.equal(battle.tactical.activation.side,'enemy');
 assert.equal(battle.round,1);
 const reply=planTacticalAIActivation(battle);
 assert.ok(reply);
 assert.equal(resolveTacticalActivation(battle,'enemy',reply.actorId,reply.actions).ok,true);
 assert.equal(resolveTacticalActivation(battle,'player',actor,[guard(actor)]).ok,false);
 const sides=[];
 while(battle.round===1){
  const side=battle.tactical.activation.side,unit=tacticalActivationUnits(battle,side)[0];
  sides.push(side);
  assert.equal(resolveTacticalActivation(battle,side,unit.id,[guard(unit.id)]).ok,true);
 }
 assert.deepEqual(sides,['player','enemy','player','enemy']);
 assert.deepEqual(battle.tactical.activation,{side:'enemy',spent:[]});
});

test('pula unidades eliminadas e atordoadas durante a rodada',()=>{
 const battle=createTacticalBattle(player,enemy,{seed:1,alternating:true,obstacles:[{x:2,y:1},{x:2,y:3}]});
 battle.enemies[0].hp=0;
 battle.enemies[1].stunned=1;
 resolveTacticalActivation(battle,'player',player[0],[guard(player[0])]);
 assert.deepEqual(tacticalActivationUnits(battle,'enemy').map(u=>u.id),[battle.enemies[2].id]);
 const reply=planTacticalAIActivation(battle);
 assert.equal(resolveTacticalActivation(battle,'enemy',reply.actorId,reply.actions).ok,true);
 assert.equal(battle.tactical.activation.side,'player');
 resolveTacticalActivation(battle,'player',player[1],[guard(player[1])]);
 assert.equal(battle.tactical.activation.side,'player');
 assert.equal(battle.round,1);
});

test('interface seleciona pela arena, prevê técnica após movimento e devolve o controle após a resposta',async()=>{
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
  assert.match(root.innerHTML,/movimento disponível, 1 casa/);
  assert.ok(root.innerHTML.lastIndexOf('data-cell=')<root.innerHTML.indexOf('activation-dock'));
  click({cell:'1,1'});
  assert.match(root.innerHTML,/→ B2/);
  click({mode:'despertar'});
  assert.match(root.innerHTML,/class="cell[^"]*\baim\b[^"]*" data-cell="1,1"/);
  let handled=false;
  keys.keydown({code:'Space',target:{matches:()=>false,closest:()=>null},preventDefault(){handled=true;}});
  assert.equal(handled,true);
  await until(()=>root.innerHTML.includes('Vez do oponente'));
  await until(()=>root.innerHTML.includes('Rodada 1 · Sua vez'));
  assert.match(root.innerHTML,/activation-spent" data-actor="o-acougueiro" disabled/);
  assert.match(root.innerHTML,/data-cell="1,1"[^>]+aria-label="B2, Riven/);
  click({actor:player[1]});
  assert.match(root.innerHTML,/Técnicas de Lira/);
  click({mode:'guard'});click({command:'commit'});
  await until(()=>root.innerHTML.includes('Rodada 1 · Sua vez'));
  click({actor:player[2]});
  click({mode:'guard'});click({command:'commit'});
  await until(()=>root.innerHTML.includes('Rodada 2 · Sua vez'));
  assert.doesNotMatch(root.innerHTML,/activation-spent" data-actor="o-acougueiro"/);
 }finally{for(const [key,value]of Object.entries(saved)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
