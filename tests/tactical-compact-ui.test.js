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
  assert.match(html,/grade 6 por 6/);assert.equal((html.match(/data-cell=/g)||[]).length,36);assert.match(html,/compact-roster-rail/);assert.match(html,/compact-command-panel/);assert.match(html,/data-confirm/);assert.doesNotMatch(html,/class="arena-techniques"/);assert.match(html,/Próximo evento: rodada 4/);
  click({cell:'1,1'});assert.match(html,/Mover → B2/);assert.match(html,/1\/6 ações/);assert.match(html,/compact-planned-destination/);assert.match(html,/data-action-kind="move"/);
  click({undo:''});assert.match(html,/0\/6 ações/);assert.doesNotMatch(html,/Mover → B2/);
  click({cell:'1,1'});click({technique:'despertar'});click({cell:'1,1'});
  assert.match(html,/Passo entre Lâminas/);assert.match(html,/2\/6 ações/);assert.match(html,/<b>1<\/b><strong role="status">Planejamento simultâneo/);
  click({confirm:''});assert.match(html,/data-panel-locked="true"/);assert.match(html,/aria-label="Comandos de /);
  const wait=async predicate=>{for(let i=0;i<160;i++){if(predicate())return;await new Promise(r=>setTimeout(r,25));}assert.fail('Round playback did not finish');};
  await wait(()=>html.includes('<b>2</b><strong role="status">Planejamento simultâneo'));
  assert.match(html,/0\/6 ações/);assert.ok(renders.filter(v=>v.includes('data-panel-locked="true"')).every(v=>v.includes('aria-label="Comandos de ')));
  for(let i=0;i<6;i++)click({guard:''});
  assert.match(html,/data-panel-locked="true"/,'six actions seal the plan automatically');
  await wait(()=>html.includes('<b>3</b><strong role="status">Planejamento simultâneo'));
  assert.match(html,/0\/6 ações/);
 }finally{for(const key of names){if(saved[key]===undefined)delete globalThis[key];else globalThis[key]=saved[key];}}
});

// CSS layout is part of this regression: the command panel replaces, rather than stacks over, the arena.
test('compact action panel lives in the old left sidebar while the 6x6 board stays in the larger right column',async()=>{
 const {readFile}=await import('node:fs/promises');
 const css=await readFile(new URL('../compact-planning.css',import.meta.url),'utf8');
 assert.match(css,/\.compact-command-panel\s*\{\s*grid-column:1;grid-row:1/);
 assert.match(css,/\.compact-board-stack\s*\{\s*grid-column:2;grid-row:1/);
 assert.match(css,/grid-template-columns:minmax\(112px,35%\) minmax\(0,1fr\)/,'mobile stays lateral');
 assert.match(css,/max-height:var\(--compact-field-height\)/,'sidebar cannot grow the board while scrolling');
});
