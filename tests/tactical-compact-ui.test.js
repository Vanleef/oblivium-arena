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
  assert.match(html,/grade 6 por 6/);assert.equal((html.match(/data-cell=/g)||[]).length,36);assert.match(html,/compact-roster-rail/);assert.match(html,/compact-portrait/);assert.match(html,/compact-command-panel/);for(const section of ['actions','abilities','items','planning'])assert.match(html,new RegExp('data-panel-section="'+section+'"'));assert.match(html,/Mover<\/span>/);assert.doesNotMatch(html,/data-guard/);assert.match(html,/data-confirm/);assert.doesNotMatch(html,/class="arena-techniques"/);assert.match(html,/Próximo evento: rodada 4/);
  click({cell:'1,1'});assert.match(html,/Mover → B2/);assert.match(html,/data-hero-index="0" style="--hero-accent:#f0ae56"/);assert.equal((html.match(/class="compact-sequence-icon"/g)||[]).length,1);assert.match(html,/compact-planned-destination/);assert.match(html,/--compact-scene-image:url\('/);assert.match(html,/--compact-floor-zoom:295%/);assert.match(html,/--compact-floor-focus:66%/);assert.match(html,/data-action-kind="move"/);assert.match(html,/data-plan-wave="1"/);assert.match(html,/data-plan-wave="2"/);assert.match(html,/data-actor-color="#f0ae56"/);
  click({undo:''});assert.equal((html.match(/class="compact-sequence-icon"/g)||[]).length,0);assert.doesNotMatch(html,/Mover → B2/);
  click({cell:'1,1'});click({technique:'despertar'});click({cell:'1,1'});
  assert.match(html,/Passo entre Lâminas/);assert.equal((html.match(/class="compact-sequence-icon"/g)||[]).length,2);assert.match(html,/data-action-step="4"/,'second action is shown in wave two');
  assert.doesNotMatch(html,/class="compact-roster-card"/);
  click({actor:'a-viuva-escarlate'});click({mode:'move'});click({cell:'2,2'});
  assert.match(html,/data-actor-color="#e94a86"/,'Lira has her own color on queued actions');
  assert.equal((html.match(/class="compact-sequence-icon"/g)||[]).length,3);
  click({removeIndex:'2'});
  assert.equal((html.match(/class="compact-sequence-icon"/g)||[]).length,2,'tap one action icon to remove that specific order');assert.match(html,/<b>1<\/b><strong role="status">Planejamento simultâneo/);
  click({confirm:''});assert.match(html,/data-panel-locked="true"/);assert.match(html,/aria-label="Comandos de /);
  const wait=async predicate=>{for(let i=0;i<160;i++){if(predicate())return;await new Promise(r=>setTimeout(r,25));}assert.fail('Round playback did not finish');};
  await wait(()=>html.includes('<b>2</b><strong role="status">Planejamento simultâneo'));
  assert.equal((html.match(/class="compact-sequence-icon"/g)||[]).length,0);assert.ok(renders.filter(v=>v.includes('data-panel-locked="true"')).every(v=>v.includes('aria-label="Comandos de ')));
  // Fill six moves using live highlighted cells (no Guard shortcut): auto-submit on sixth order.
  for(const hero of ['o-acougueiro','a-viuva-escarlate','o-escudo-vivo']){
   click({actor:hero});
   for(let i=0;i<2;i++){
    click({mode:'move'});
    const cell=html.match(/<button class="cell reachable [^"]*" data-cell="([^"]+)"/)?.[1];
    assert.ok(cell,'an adjacent move remains available for '+hero+' / action '+(i+1));
    click({cell});
   }
  }
  assert.match(html,/data-panel-locked="true"/,'six legal moves seal the plan automatically');
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
 assert.match(css,/grid-template-columns:var\(--compact-side-width\) minmax\(0,1fr\)/,'mobile stays lateral');
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
 assert.match(styles,/\.compact-board \.cell\{background:transparent!important\}/);assert.match(styles,/auto var\(--compact-floor-zoom,250%\)/);assert.match(styles,/\.compact-ground-shadow\{/);
});

test('mobile HUD shows the full 3v3 roster and places the board immediately beside a scrollable sidebar',async()=>{
 const {readFile}=await import('node:fs/promises');
 const css=await readFile(new URL('../compact-planning.css',import.meta.url),'utf8');
 const latest=css.slice(css.lastIndexOf('/* Responsive combat layout:'));
 assert.ok(latest.includes('height:auto;')&&latest.includes('overflow:visible;'),'HUD must grow instead of hiding third team member');
 assert.match(latest,/\.compact-hud\s*\{[\s\S]*?height:auto;[\s\S]*?overflow:visible;/,'roster HUD must not be fixed-height');
 assert.match(latest,/--compact-side-width:clamp\(94px,18cqw,130px\)/);
 assert.match(latest,/--compact-side-gap:4px/);
 assert.match(latest,/grid-template-columns:var\(--compact-side-width\) minmax\(0,1fr\)/);
 assert.match(latest,/max-height:var\(--compact-board-side\)/,'panel scrolls independently instead of cropping');
 assert.match(latest,/top:auto;\s*bottom:auto;/,'old fortress-board vertical offset is removed');
 assert.match(latest,/\.compact-board-stack>\.compact-board\s*\{[\s\S]*?width:100%;/,'board uses all available mobile space');
 assert.match(latest,/--compact-side-width:clamp\(82px,23cqw,95px\)/,'extra narrow phones get a smaller sidebar');
});

test('combat feedback is not a guessing overlay and renders actions as icons above the arena',async()=>{
 const {readFile}=await import('node:fs/promises');
 const js=await readFile(new URL('../src/compact-demo.js',import.meta.url),'utf8');
 const css=await readFile(new URL('../compact-planning.css',import.meta.url),'utf8');
 assert.match(js,/compact-order-symbol/);
 assert.match(js,/actionGlyph\(unit,action\)/);
 assert.match(js,/tacticalFeedback\(event\)/);
 assert.match(js,/tacticalAreaPhase\(event\)/);
 assert.match(js,/data-feedback-kind/);
 assert.doesNotMatch(js,/if\('guard'in d\)/,'no click to plan Guard');
 assert.match(css,/\.compact-stage>\.fighter-super\s*\{/);
 assert.match(css,/z-index:5;pointer-events:none/,'super stays behind the active combat board');
 assert.match(css,/\.compact-stage:has\(>\.fighter-super\)>\.arena-field\{[\s\S]*?z-index:6/,'fighters stay foreground during the special');
 assert.match(css,/\.compact-token-label\s*\{[\s\S]*?top:-9px/);
 assert.match(css,/\.compact-hit-damage \.conquest-model/);
 assert.match(css,/\.compact-hit-heal \.conquest-model/);
});

test('compact combat resolves projectile trajectories, early telegraphs and full impact holds',async()=>{
 const {readFile}=await import('node:fs/promises');
 const source=await readFile(new URL('../src/compact-demo.js',import.meta.url),'utf8');
 assert.match(source,/tacticalReplayFrames\(unit,ability/);
 assert.match(source,/tacticalVisualCells\(event\)\.map\(cellKey\)/);
 assert.match(source,/tacticalCompactFrameDuration\(state\.event,feedbackStack\)/);
 assert.match(source,/\['anticipate','compress','brace','inhale','gather'/);
 assert.doesNotMatch(source,/Math\.min\(330,tacticalFrameDuration\(state\.event\)\)/);
});

test('combat-speed controls scale CSS reactions together with replay and reduced-motion VFX',async()=>{
 const {readFile}=await import('node:fs/promises');
 const source=await readFile(new URL('../src/compact-demo.js',import.meta.url),'utf8');
 const css=await readFile(new URL('../compact-planning.css',import.meta.url),'utf8');
 assert.match(source,/--compact-hit-duration:'\+Math\.round\(420\/state\.speed\)/);
 assert.match(source,/--compact-heal-duration:'\+Math\.round\(460\/state\.speed\)/);
 assert.match(source,/--compact-feedback-delay:'\+Math\.round\(36\/state\.speed\)/);
 assert.match(source,/\(reduced\?35:duration\)\/state\.speed/);
 assert.match(css,/animation:compact-hit-stagger var\(--compact-hit-duration,420ms\)/);
 assert.match(css,/animation:compact-heal-rise var\(--compact-heal-duration,460ms\)/);
 assert.match(css,/--compact-feedback-delay,36ms/);
});

test('fallen characters linger only during the resolved killing contact, with reduced-motion safety',async()=>{
 const {readFile}=await import('node:fs/promises');
 const js=await readFile(new URL('../src/compact-demo.js',import.meta.url),'utf8');
 const css=await readFile(new URL('../compact-planning.css',import.meta.url),'utf8');
 assert.match(js,/if\(phase==='impact'\)for\(const fallen of tacticalDefeatedUnits\(event\)\)/);
 assert.match(js,/fallenByCell\.get\(cellKey\(p\)\)/);
 assert.match(js,/compact-defeated /);
 assert.match(css,/compact-defeat-collapse var\(--compact-hit-duration,420ms\)/);
 assert.match(css,/data-feedback-kind="defeat"/);
 assert.match(css,/compact-defeated \.conquest-model\{\s*animation:none!important/);
});

test('KOF-inspired special keeps the actual fighter visible and avoids portrait-sized cut-ins',async()=>{
 const {readFile}=await import('node:fs/promises');
 const source=await readFile(new URL('../src/compact-demo.js',import.meta.url),'utf8');
 const cinematic=await readFile(new URL('../src/tactical-cinematic.js',import.meta.url),'utf8');
 const styles=await readFile(new URL('../compact-planning.css',import.meta.url),'utf8');
 assert.match(source,/data-super-active=/);
 assert.match(source,/data-super-impact=/);
 assert.match(styles,/\.fighter-super-speedlines/);
 assert.match(styles,/\.fighter-super-rupture/);
 assert.match(styles,/fighter-super-sprite/);
 assert.match(styles,/fighter-super-shock/);
 assert.match(styles,/@media\(prefers-reduced-motion:reduce\)\{[\s\S]*?fighter-super-speedlines/);
 assert.match(cinematic,/superSlots=new Set\(\['voto','despertar'\]\)/);
 assert.doesNotMatch(cinematic,/<img class="cutin-art"/);
 assert.doesNotMatch(styles,/\.compact-stage>\.skill-cutin/);
});

test('super activation stinger and physical thrust particles stay synchronized with replay frames',async()=>{
 const {readFile}=await import('node:fs/promises');
 const source=await readFile(new URL('../src/compact-demo.js',import.meta.url),'utf8');
 const audio=await readFile(new URL('../src/audio.js',import.meta.url),'utf8');
 const effects=await readFile(new URL('../src/tactical-effects-layer.js',import.meta.url),'utf8');
 assert.match(source,/let superCuePlayed=false/);
 assert.match(source,/!superCuePlayed&&tacticalCutinActive\(state\.event\)/);
 assert.match(source,/playCombatCue\('super',frame\.family\)/);
 assert.match(source,/\['release','thrust','travel'\]\.includes\(frame\.pose\)/);
 assert.match(source,/frame\.pose==='thrust'\?'release':frame\.pose/);
 assert.match(audio,/if\(kind==='super'\)/);
 assert.match(effects,/drawImpactBurst\(ctx,fx,p\)/);
 assert.match(effects,/const meleeFamilies=new Set\(\['strike','slash','pierce','counter'\]\)/);
});

test('KOF-style contact hold freezes recoil and material VFX without touching resolved battle state',async()=>{
 const {readFile}=await import('node:fs/promises');
 const src=await readFile(new URL('../src/compact-demo.js',import.meta.url),'utf8');
 const css=await readFile(new URL('../compact-planning.css',import.meta.url),'utf8');
 assert.match(src,/tacticalImpactContacts\(event\)/);
 assert.match(src,/tacticalContactRecoil\(contact,profile/);
 assert.match(src,/data-impact-family=/);
 assert.match(src,/data-impact-reaction=/);
 assert.match(src,/data-hitstop=/);
 assert.match(src,/effects\?\.freeze\(hit\.hitstopMs\)/);
 assert.match(src,/await pauseExact\(hit\.hitstopMs\)/);
 assert.match(src,/tacticalImpactProfile\(state\.event,\{speed:state\.speed,reduced\}\)/);
 assert.match(src,/const pauseExact=ms=>new Promise\(resolve=>setTimeout\(resolve,ms\)\)/);
 assert.doesNotMatch(src,/freeze\(hit\.hitstopMs\/state\.speed\)|await pause\(hit\.hitstopMs\)/);
 assert.match(src,/state\.hitstop=false/);
 assert.match(css,/compact-recoil-strike/);
 assert.match(css,/compact-recoil-slash/);
 assert.match(css,/compact-recoil-pierce/);
 assert.match(css,/compact-recoil-counter/);
 assert.match(css,/compact-recoil-block/);
 assert.match(css,/animation-play-state:paused!important/);
 assert.match(css,/@media\(max-width:760px\)\{/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.doesNotMatch(src,/\.battle\.allies\[[^\]]+\]\.hp\s*-=/,
  'visual hitstop must not apply or modify game damage');
});

test('mobile cinematic clarity does not sacrifice the readability of damage in reduced motion',async()=>{
 const {readFile}=await import('node:fs/promises');
 const src=await readFile(new URL('../src/compact-demo.js',import.meta.url),'utf8');
 const css=await readFile(new URL('../compact-planning.css',import.meta.url),'utf8');
 assert.match(src,/Math\.max\(180,220\/state\.speed\)/);
 assert.match(src,/await pause\(duration,\{holdFeedback:impact\}\)/);
 assert.match(css,/\.compact-hit-body\[data-impact-reaction="damage"\]\[data-impact-family="strike"\]/);
 assert.match(css,/\.compact-hit-body\[data-impact-reaction="damage"\]\[data-impact-family="slash"\]/);
 assert.match(css,/\.compact-hit-body\[data-impact-reaction="damage"\]\[data-impact-family="pierce"\]/);
 assert.match(css,/\.compact-hit-body\[data-impact-reaction="damage"\]\[data-impact-family="counter"\]/);
 assert.match(css,/\.compact-hit-body\[data-impact-reaction="block"\]/);
 assert.match(css,/\.compact-stage\[data-hitstop="true"\]/);
 assert.match(css,/\.compact-area-sigil\[data-phase="impact"\]\[data-effect-tone="stone"\]/);
 assert.match(css,/\.compact-area-sigil\[data-phase="impact"\]\[data-effect-tone="blood"\]/);
 assert.match(css,/\.compact-area-sigil\[data-phase="impact"\]\[data-effect-tone="thread"\]/);
});


test('physical camera shake is applied only during resolved hits and preserves square field layout',async()=>{
 const {readFile}=await import('node:fs/promises');
 const js=await readFile(new URL('../src/compact-demo.js',import.meta.url),'utf8');
 const css=await readFile(new URL('../compact-planning.css',import.meta.url),'utf8');
 assert.match(js,/const cinematicImpact=tacticalImpactProfile\(state\.event,\{speed:state\.speed/);
 assert.match(js,/data-impact-shake=/);
 assert.match(js,/data-attack-family=/);
 assert.match(css,/compact-physical-camera/);
 assert.match(css,/data-impact-shake="physical"/);
 assert.match(css,/data-impact-shake="special"/);
 assert.match(css,/data-impact-shake="heavy"/);
 assert.match(css,/\.compact-stage\[data-hitstop="true"\] \.compact-board-stack/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{/);
 assert.match(css,/animation:none!important;translate:none!important/);
 assert.doesNotMatch(js,/\.tactical\.positions\[[^\]]+\]\s*=/,
  'camera shake must not mutate logical grid positions');
});
test('melee footprint displays physically different strike slash pierce and counter shapes',async()=>{
 const {readFile}=await import('node:fs/promises');
 const css=await readFile(new URL('../compact-planning.css',import.meta.url),'utf8');
 for(const family of ['strike','slash','pierce','counter'])
  assert.match(css,new RegExp('data-attack-family="'+family+'"'));
 assert.match(css,/compact-melee-area-read/);
 assert.match(css,/clip-path:polygon\(0 24%,66% 24%,100% 50%,66% 76%,0 76%\)/);
 assert.match(css,/@media\(max-width:760px\)\{/);
 assert.match(css,/\.compact-area-sigil\[data-attack-family\]::before\{animation:none!important/);
});
