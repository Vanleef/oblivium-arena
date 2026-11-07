import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
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
