import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('combat page loads the new sealed duel interface after all responsive styles',async()=>{
 const html=await read('tactical.html'),css=await read('compact-combo.css');
 assert.ok(html.indexOf('compact-combo.css?v=confronto-vontades-20261107')>html.indexOf('compact-responsive.css'));
 assert.match(html,/tactical-entry\.js\?v=confronto-vontades-20261107/);
 assert.match(css,/\.compact-duel-clash\{/);
 assert.match(css,/\.compact-duel-options\{/);
 assert.match(css,/repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(css,/safe-area-inset-bottom/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/@media\(max-width:360px\)/);
 assert.match(css,/@media\(max-height:460px\) and \(orientation:landscape\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test('specials show three distinct options, clear cyclic help and hidden opponent selection',async()=>{
 const js=await read('src/compact-demo.js');
 assert.match(js,/CONFRONTO DE VONTADES/);
 assert.match(js,/data-duel-choice/);
 assert.match(js,/tacticalDuelOptions\.map/);
 assert.match(js,/Ímpeto vence Finta/);
 assert.match(js,/Finta vence Contenção/);
 assert.match(js,/Contenção vence Ímpeto/);
 assert.match(js,/duel\.locked\?' disabled'/);
 assert.match(js,/tacticalDuelTendency\(rival\)/);
 assert.match(js,/tende a/);
 assert.match(js,/opponentLabel=reveal\?/);
 assert.match(js,/duel\.result=answer;state\.clash=duel;render\(\)/);
 assert.match(js,/role="dialog"/);
 assert.match(js,/aria-live="polite"/);
});

test('choices are a single interaction per special, never a reflex-timer minigame',async()=>{
 const js=await read('src/compact-demo.js');
 assert.match(js,/function interactiveDuel\(ref\)/);
 assert.match(js,/tacticalDuelAI\(\{round:current\.round/);
 assert.match(js,/const foeChoice=tacticalDuelAI/);
 assert.match(js,/const answer=tacticalDuelResolve\(attackChoice,defenseChoice\)/);
 assert.match(js,/const contest=pending\?\.comboEligible\?await interactiveDuel\(pending\):\{\}/);
 assert.match(js,/const next=session\.next\(contest\)/);
 assert.doesNotMatch(js,/tacticalReactiveJudge\(/);
 assert.doesNotMatch(js,/function interactiveCombo\(/);
 assert.match(js,/duel\.transitionTimer=setTimeout\(/);
});

test('click, keyboard and auto choice work even while the stage is busy',async()=>{
 const js=await read('src/compact-demo.js');
 const first=js.indexOf("if(state.clash){if(d.duelChoice)"),busy=js.indexOf('if(state.busy)return;',first);
 assert.ok(first>0&&busy>first);
 assert.match(js,/state\.clash\.press\?\.\(d\.duelChoice\)/);
 assert.match(js,/state\.clash\.skip\?\.\(\)/);
 assert.match(js,/event\.code==='Digit1'/);
 assert.match(js,/event\.code==='Digit2'/);
 assert.match(js,/event\.code==='Digit3'/);
 assert.match(js,/event\.key==='Escape'/);
 assert.match(js,/duel\.skip=\(\)=>finish\(attacking\?'impeto':'contencao'\)/);
});

test('winning choices apply ability effects, defensive victories miss entirely, ties only halve damage',async()=>{
 const engine=await read('src/tactical-combat.js'),combat=await read('src/combat.js');
 assert.match(engine,/tacticalDuelResolve\(responses\.attackChoice,responses\.defenseChoice\)/);
 assert.match(engine,/execute\(s,duel\?\{\.\.\.ref,clash:duel\}:ref\)/);
 assert.match(combat,/action\.clash\.duel\?action\.clash/);
 assert.match(combat,/tacticalDuelDamage\(technique\.damage,combo\)/);
 assert.match(combat,/combo\?\.duel&&combo\.outcome==='miss'/);
 assert.match(combat,/const result=apply\(s,actor,executed,/);
 assert.match(engine,/result\.combo\?\.outcome!=='miss'/);
 assert.match(engine,/duel\?\{duel\}:\{\}/);
});

test('lost specials visibly whiff without fake contact and successful specials retain chained hits',async()=>{
 const ui=await read('src/compact-demo.js'),cinema=await read('src/tactical-cinematic.js');
 assert.match(cinema,/if\(event\.duel\?\.outcome==='miss'\)/);
 assert.match(cinema,/\['anticipate','windup','release','followthrough','recover'\]/);
 assert.match(cinema,/if\(event\.comboReplay\)/);
 assert.match(ui,/events\.flatMap\(tacticalComboReplayEvents\)/);
 assert.match(ui,/compact-combo-counter/);
 assert.match(ui,/state\.event\?\.duel/);
 assert.doesNotMatch(cinema,/<img class="cutin-art"/);
});

test('UI errors still finish the staged round with a safe no-choice resolution',async()=>{
 const ui=await read('src/compact-demo.js');
 assert.match(ui,/for\(let attempts=0;attempts<26;attempts\+\+\)/);
 assert.match(ui,/const step=session\.next\(pending\?\.comboEligible/);
 assert.match(ui,/state\.busy=false;state\.clash=null;state\.event=null;state\.snapshot=null/);
});

test('missing or forged choices cannot bypass the duel and grant an unopposed full special',async()=>{
 const engine=await read('src/tactical-combat.js'),ui=await read('src/compact-demo.js');
 const guarded=engine.indexOf("if(awaiting?.comboEligible&&!duel)return fail(");
 const shifted=engine.indexOf("const ref=commands.shift();",guarded);
 assert.ok(guarded>=0&&shifted>guarded,'validate the secret response BEFORE removing the planned skill from queue');
 assert.match(ui,/const step=session\.next\(pending\?\.comboEligible/);
 assert.match(ui,/attackChoice:'contencao',defenseChoice:'contencao'/);
 assert.match(ui,/duel\.cancel=\(\)=>/);
});
