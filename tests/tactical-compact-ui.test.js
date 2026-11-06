import test from 'node:test';
import assert from 'node:assert/strict';

test('compact UI queues actions privately, undoes the plan and retains techniques through full-round playback',async()=>{
 const events={},renders=[];let html='';
 const root={set innerHTML(v){html=v;renders.push(v);},get innerHTML(){return html;},addEventListener:(type,fn)=>events[type]=fn,querySelector:()=>null,querySelectorAll:()=>[]};
 const names=['document','Worker','matchMedia','requestAnimationFrame'],saved=Object.fromEntries(names.map(k=>[k,globalThis[k]]));
 const click=dataset=>events.click({target:{closest:()=>({dataset,disabled:false})}});
 try{
  globalThis.document={getElementById:()=>root,addEventListener(){}};
  globalThis.matchMedia=()=>({matches:true});globalThis.requestAnimationFrame=undefined;
  globalThis.Worker=class{addEventListener(type,fn){if(type==='message')this.receive=fn;}postMessage({id}){queueMicrotask(()=>this.receive({data:{id,plan:[]}}));}};
  await import('../src/compact-demo.js?compact-ui-regression');
  assert.match(html,/grade 5 por 5/);assert.equal((html.match(/data-cell=/g)||[]).length,25);assert.match(html,/Confirmar rodada/);
  click({cell:'1,1'});assert.match(html,/Mover → B2/);assert.match(html,/1\/6 ações/);
  click({undo:''});assert.match(html,/0\/6 ações/);assert.doesNotMatch(html,/Mover → B2/);
  click({cell:'1,1'});click({technique:'despertar'});click({cell:'1,1'});
  assert.match(html,/Passo entre Lâminas/);assert.match(html,/2\/6 ações/);assert.match(html,/<b>1<\/b><strong role="status">Planejamento simultâneo/);
  click({confirm:''});assert.match(html,/data-panel-locked="true"/);
  const wait=async predicate=>{for(let i=0;i<160;i++){if(predicate())return;await new Promise(r=>setTimeout(r,25));}assert.fail('Round playback did not finish');};
  await wait(()=>html.includes('<b>2</b><strong role="status">Planejamento simultâneo'));
  assert.match(html,/0\/6 ações/);assert.ok(renders.filter(v=>v.includes('data-panel-locked="true"')).every(v=>v.includes('aria-label="Técnicas de ')));
 }finally{for(const key of names){if(saved[key]===undefined)delete globalThis[key];else globalThis[key]=saved[key];}}
});
