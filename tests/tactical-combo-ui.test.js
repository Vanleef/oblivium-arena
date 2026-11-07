import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('new physical cue interface keeps touch controls fixed above safe area',async()=>{
 const html=await read('tactical.html'),css=await read('compact-combo.css');
 assert.ok(html.indexOf('compact-combo.css')>html.indexOf('compact-responsive.css'));
 assert.match(css,/\.compact-rhythm-clash\{/);
 assert.match(css,/position:fixed;z-index:950/);
 assert.match(css,/safe-area-inset-bottom/);
 assert.match(css,/\.compact-rhythm-contact-ring/);
 assert.match(css,/oblivium-reactive-windup/);
 assert.match(css,/\.compact-rhythm-actions \[data-combo-dodge\]/);
 assert.match(css,/\.compact-rhythm-actions \[data-combo-parry\]/);
 assert.match(css,/\.compact-rhythm-actions \[data-combo-jump\]/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/@media\(max-height:460px\) and \(orientation:landscape\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test('attacker and defender can choose DIFFERENT timed actions on each incoming hit',async()=>{
 const ui=await read('src/compact-demo.js');
 assert.match(ui,/data-combo-strike/);
 assert.match(ui,/data-combo-dodge/);
 assert.match(ui,/data-combo-parry/);
 assert.match(ui,/data-combo-jump/);
 assert.match(ui,/data-combo-skip/);
 assert.match(ui,/if\('comboStrike'in d\)state\.clash\.press\?\.\('strike'\)/);
 assert.match(ui,/if\('comboDodge'in d\)state\.clash\.press\?\.\('dodge'\)/);
 assert.match(ui,/if\('comboParry'in d\)state\.clash\.press\?\.\('parry'\)/);
 assert.match(ui,/if\('comboJump'in d\)state\.clash\.press\?\.\('jump'\)/);
 assert.match(ui,/event\.code==='KeyE'\?'parry'/);
 assert.match(ui,/event\.code==='KeyW'\?'jump'/);
 assert.match(ui,/event\.key==='Escape'/);
 assert.match(ui,/value\.skip=\(\)=>complete\(true\)/);
 assert.match(ui,/neutral\?\{attacks:\[\],defenses:\[\]\}/);
});

test('different telegraphed timings drive actual sprite swings; player reacts to impact, not metronome',async()=>{
 const ui=await read('src/compact-demo.js'),css=await read('compact-combo.css');
 assert.match(ui,/tacticalReactiveBeats\(ref\.actor,ref\.ability,tacticalAnimationFamily\(ref\.ability\)\)/);
 assert.match(ui,/const outcome=tacticalReactiveJudge\(beat,action,elapsed\)/);
 assert.match(ui,/beat\.impactMs-240/);
 assert.match(ui,/setAttribute\('data-reactive-telegraph',beat\.kind\)/);
 assert.match(ui,/paintTacticalToken\(caster,ref\.actor/);
 assert.match(ui,/emit\(\{\.\.\.state\.event,pose:'release'\},ref\.actor/);
 assert.match(ui,/setAttribute\('data-reactive-evade',action\)/);
 assert.match(ui,/emit\(\{type:'guard'/);
 assert.match(css,/\.compact-board \[data-reactive-evade\]/);
 assert.doesNotMatch(ui,/compact-rhythm-track/);
});

test('staged resolver accepts defender moves and calculates defense before real damage and parry counter',async()=>{
 const ui=await read('src/compact-demo.js'),engine=await read('src/tactical-combat.js'),combat=await read('src/combat.js');
 assert.match(ui,/const session=startCompactRoundResolution\(state\.battle\)/);
 assert.match(ui,/const contest=pending\?\.comboEligible\?await interactiveCombo\(pending\):\{\}/);
 assert.match(ui,/const next=session\.next\(contest\)/);
 assert.match(engine,/tacticalReactiveOutcome\(\{beats:awaiting\.beats,attacks:responses\.attacks,defenses:responses\.defenses\}\)/);
 assert.match(engine,/resolveBoardReactiveCounter\(s,\{/);
 assert.match(engine,/reactionCounter:true,family:'counter'/);
 assert.match(combat,/tacticalReactiveDamage\(technique\.damage,combo\)/);
 assert.match(combat,/combo\?\.reactive&&combo\.avoidedAll\?\[\]:spatialTargetIds/);
 assert.match(combat,/export function resolveBoardReactiveCounter\(s/);
 assert.match(ui,/events\.flatMap\(tacticalComboReplayEvents\)/);
});

test('offensive and defensive controls work during busy playback; fallback never traps the round',async()=>{
 const ui=await read('src/compact-demo.js');
 const first=ui.indexOf("if(state.clash){if('comboStrike'in d)"),busy=ui.indexOf('if(state.busy)return;',first);
 assert.ok(first>0&&busy>first);
 assert.match(ui,/state\.clash\?\.skip\?\.\(\)/);
 assert.match(ui,/for\(let attempts=0;attempts<26;attempts\+\+\)/);
 assert.match(ui,/const step=session\.next\(\)/);
 assert.match(ui,/state\.busy=false;state\.clash=null;state\.event=null;state\.snapshot=null/);
});

test('KOF action still consists of physically choreographed contact frames without giant portrait',async()=>{
 const cinema=await read('src/tactical-cinematic.js');
 assert.match(cinema,/if\(event\.comboReplay\)\{/);
 assert.match(cinema,/if\(event\.reactionCounter\)\{/);
 assert.match(cinema,/\['brace','deflect','release','impact','recover'\]/);
 assert.match(cinema,/event\.comboBeat>1/);
 assert.doesNotMatch(cinema,/<img class="cutin-art"/);
});
