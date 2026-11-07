import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('combat page loads touch-sized clash HUD after the responsive tactical styles',async()=>{
 const html=await read('tactical.html');
 assert.ok(html.indexOf('compact-combo.css?v=kof-rhythm-20261107')>html.indexOf('compact-responsive.css'));
 const css=await read('compact-combo.css');
 assert.match(css,/\.compact-rhythm-clash\{/);
 assert.match(css,/position:fixed;z-index:950/);
 assert.match(css,/safe-area-inset-bottom/);
 assert.match(css,/\.compact-rhythm-actions>button\{[\s\S]*?min-height:53px/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/@media\(max-width:360px\)/);
 assert.match(css,/@media\(max-height:460px\) and \(orientation:landscape\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test('touch, click, keyboard and neutral-skip interaction are connected before busy lock',async()=>{
 const js=await read('src/compact-demo.js');
 const first=js.indexOf("if(state.clash){if('comboStrike'in d)");
 const busy=js.indexOf('if(state.busy)return;',first);
 assert.ok(first>0&&busy>first);
 assert.match(js,/data-combo-strike/);
 assert.match(js,/data-combo-skip/);
 assert.match(js,/event\.code==='Space'\|\|event\.code==='Enter'/);
 assert.match(js,/event\.key==='Escape'/);
 assert.match(js,/value\.skip=\(\)=>complete\(true\)/);
 assert.match(js,/neutral\?\{attackHits:0,defenseHits:0\}/);
 assert.match(js,/const offset=\(performance\.now\(\)-value\.startedAt\)\/ms/);
 assert.match(js,/tacticalComboBeats/);
});

test('interactive rhythm is integrated before each authoritative compact skill resolution',async()=>{
 const js=await read('src/compact-demo.js'),combat=await read('src/tactical-combat.js');
 const generic=await read('src/combat.js');
 assert.match(js,/const session=startCompactRoundResolution\(state\.battle\)/);
 assert.match(js,/const contest=pending\?\.comboEligible\?await interactiveCombo\(pending\):\{\}/);
 assert.match(js,/const next=session\.next\(contest\)/);
 assert.match(combat,/export function startCompactRoundResolution\(s\)/);
 assert.match(combat,/const combo=awaiting\?\.comboEligible\?tacticalComboResult\(responses\):null/);
 assert.match(combat,/comboEligible:tacticalComboEligible\(actor,ability,targets\)/);
 assert.match(generic,/damage:tacticalComboDamage\(technique\.damage,combo\)/);
 assert.match(generic,/const result=apply\(s,actor,executed,/);
 assert.match(js,/for\(const event of events\.flatMap\(tacticalComboReplayEvents\)\)/);
 assert.match(js,/const before=\{allies:current\.allies,enemies:current\.enemies/);
});

test('each hit drives the actual sprite and area/material VFX, not a giant cut-in',async()=>{
 const ui=await read('src/compact-demo.js'),cinematic=await read('src/tactical-cinematic.js');
 assert.match(ui,/state\.event=\{\.\.\.state\.event,pose:'release'\}/);
 assert.match(ui,/emit\(state\.event,ref\.actor,ref\.ability,'release'/);
 assert.match(ui,/if\(accurate&&role==='defense'\)/);
 assert.match(ui,/compact-combo-counter/);
 assert.match(cinematic,/if\(event\.comboReplay\)\{/);
 assert.match(cinematic,/\['release','impact'\]/);
 assert.match(cinematic,/event\.comboBeat>1/);
 assert.doesNotMatch(cinematic,/<img class="cutin-art"/);
});

test('a rendering failure does not permanently lock the tactical round in resolving stage',async()=>{
 const ui=await read('src/compact-demo.js');
 assert.match(ui,/for\(let attempts=0;attempts<26;attempts\+\+\)/);
 assert.match(ui,/const step=session\.next\(\)/);
 assert.match(ui,/state\.busy=false;state\.clash=null;state\.event=null;state\.snapshot=null/);
});
