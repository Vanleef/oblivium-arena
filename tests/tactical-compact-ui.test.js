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
  assert.match(html,/grade 6 por 6/);assert.equal((html.match(/data-cell=/g)||[]).length,36);assert.match(html,/compact-roster-rail/);assert.match(html,/compact-portrait/);assert.match(html,/compact-command-panel/);assert.match(html,/data-confirm/);assert.doesNotMatch(html,/class="arena-techniques"/);assert.match(html,/Próximo evento: rodada 4/);
  click({cell:'1,1'});assert.match(html,/Mover → B2/);assert.match(html,/data-hero-index="0" style="--hero-accent:#f0ae56"/);assert.equal((html.match(/class="compact-sequence-icon"/g)||[]).length,1);assert.match(html,/compact-planned-destination/);assert.match(html,/--compact-scene-image:url\('/);assert.match(html,/data-action-kind="move"/);assert.match(html,/data-actor-color="#f0ae56"/);
  click({undo:''});assert.equal((html.match(/class="compact-sequence-icon"/g)||[]).length,0);assert.doesNotMatch(html,/Mover → B2/);
  click({cell:'1,1'});click({technique:'despertar'});click({cell:'1,1'});
  assert.match(html,/Passo entre Lâminas/);assert.equal((html.match(/class="compact-sequence-icon"/g)||[]).length,2);
  assert.doesNotMatch(html,/class="compact-roster-card"/);
  click({actor:'a-viuva-escarlate'});click({guard:''});
  assert.match(html,/data-actor-color="#e94a86"/,'Lira has her own color on queued actions');
  assert.equal((html.match(/class="compact-sequence-icon"/g)||[]).length,3);
  click({removeIndex:'2'});
  assert.equal((html.match(/class="compact-sequence-icon"/g)||[]).length,2,'tap one action icon to remove that specific order');assert.match(html,/<b>1<\/b><strong role="status">Planejamento simultâneo/);
  click({confirm:''});assert.match(html,/data-panel-locked="true"/);assert.match(html,/aria-label="Comandos de /);
  const wait=async predicate=>{for(let i=0;i<160;i++){if(predicate())return;await new Promise(r=>setTimeout(r,25));}assert.fail('Round playback did not finish');};
  await wait(()=>html.includes('<b>2</b><strong role="status">Planejamento simultâneo'));
  assert.equal((html.match(/class="compact-sequence-icon"/g)||[]).length,0);assert.ok(renders.filter(v=>v.includes('data-panel-locked="true"')).every(v=>v.includes('aria-label="Comandos de ')));
  for(let i=0;i<6;i++)click({guard:''});
  assert.match(html,/data-panel-locked="true"/,'six actions seal the plan automatically');
  await wait(()=>html.includes('<b>3</b><strong role="status">Planejamento simultâneo'));
  assert.equal((html.match(/class="compact-sequence-icon"/g)||[]).length,0);
 }finally{for(const key of names){if(saved[key]===undefined)delete globalThis[key];else globalThis[key]=saved[key];}}
});

// CSS layout is part of this regression: the command panel replaces, rather than stacks over, the arena.
test('compact action panel lives in the old left sidebar while the 6x6 board stays in the larger right column',async()=>{
 const {readFile}=await import('node:fs/promises');
 const css=await readFile(new URL('../compact-planning.css',import.meta.url),'utf8');
 assert.match(css,/\.compact-command-panel\s*\{\s*grid-column:1;grid-row:1/);
 assert.match(css,/\.compact-board-stack\s*\{\s*grid-column:2;grid-row:1/);
 assert.match(css,/grid-template-columns:minmax\(88px,24%\) minmax\(0,1fr\)/,'mobile stays lateral');
 assert.match(css,/max-height:var\(--compact-field-height\)/,'sidebar cannot grow the board while scrolling');
});

test('portrait-only sidebar keeps actual scene artwork under its transparent field',async()=>{
 const {readFile}=await import('node:fs/promises');
 const source=await readFile(new URL('../src/compact-demo.js',import.meta.url),'utf8');
 const styles=await readFile(new URL('../compact-planning.css',import.meta.url),'utf8');
 assert.match(source,/orderTacticalActions\(state\.battle,state\.actions/);
 assert.match(source,/data-hero-index=/);
 assert.match(source,/data-remove-index=/);
 assert.match(source,/class="compact-sequence-icon"/);
 assert.doesNotMatch(source,/compact-roster-slots/);
 assert.match(styles,/border:2px solid var\(--hero-accent\)/);
 assert.match(styles,/background-image:linear-gradient\(180deg,[^\n]*var\(--compact-scene-image\)/);
 assert.match(styles,/\.compact-board \.cell\{background:transparent!important\}/);
});
