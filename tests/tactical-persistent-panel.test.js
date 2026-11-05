import test from 'node:test';
import assert from 'node:assert/strict';

test('fortress techniques remain visible and disabled through allied and rival playback',async()=>{
 const handlers={},renders=[];
 let html='';
 const root={get innerHTML(){return html;},set innerHTML(value){html=value;renders.push(value);},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,handler){handlers[type]=handler;}};
 const keys=['document','Image','matchMedia','requestAnimationFrame','location'];
 const saved=Object.fromEntries(keys.map(key=>[key,globalThis[key]]));
 const click=dataset=>handlers.click({target:{closest:()=>({dataset,disabled:false})}});
 const until=async predicate=>{for(let i=0;i<150;i++){if(predicate())return;await new Promise(resolve=>setTimeout(resolve,30));}assert.fail('Playback did not reach its expected state.');};
 try{
  globalThis.document={getElementById:()=>root,addEventListener(){},createElement:()=>({dataset:{},setAttribute(){},getContext:()=>null})};
  globalThis.Image=class {};globalThis.location={search:''};globalThis.matchMedia=()=>({matches:true});globalThis.requestAnimationFrame=fn=>fn();
  await import('../src/tactical-demo.js?persistent-panel-regression');
  assert.match(html,/Técnicas de Riven/);
  click({mode:'despertar'});click({cell:'1,1'});
  await until(()=>renders.some(r=>r.includes('data-panel-locked="true"')));
  const firstLocked=renders.find(r=>r.includes('data-panel-locked="true"'));
  assert.match(firstLocked,/Técnicas · Riven/);
  assert.match(firstLocked,/Técnicas de Riven/);
  const buttons=[...firstLocked.matchAll(/<button data-mode="[^"]+"[^>]*>/g)].map(m=>m[0]);
  assert.ok(buttons.length>=5);
  assert.ok(buttons.every(button=>button.includes('disabled')));
  // Attempts to use a read-only technique must not change the selected action.
  const before=html;click({mode:'impulso'});assert.equal(html,before);
  await until(()=>html.includes('Técnicas de Lira')&&html.includes('data-panel-locked="false"'));
  const locked=renders.filter(r=>r.includes('data-panel-locked="true"'));
  assert.ok(locked.length>=3,'exercise reveal, movement and techniques');
  for(const r of locked){assert.match(r,/Técnicas de Riven/);assert.ok((r.match(/<button data-mode=/g)||[]).length>=5);}
  assert.match(html,/Técnicas · Lira/);
 }finally{for(const key of keys){if(saved[key]===undefined)delete globalThis[key];else globalThis[key]=saved[key];}}
});
