import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('the tactical page loads responsive overrides after the legacy styles',async()=>{
 const html=await read('tactical.html');
 const base=html.indexOf('/compact-planning.css?');
 const responsive=html.indexOf('/compact-responsive.css?v=responsive-screen-20261107');
 assert.ok(base>0,'original combat stylesheet is present');
 assert.ok(responsive>base,'responsive overrides must load last');
 assert.match(html,/name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/);
});

test('desktop and tablets keep adjacent actions without squeezing board or hiding lower commands',async()=>{
 const css=await read('compact-responsive.css');
 assert.match(css,/\.combat-shell\.compact-battle \.arena-field\{[\s\S]*?grid-template-columns:minmax\(0,var\(--compact-side-width\)\) minmax\(0,1fr\)/);
 assert.match(css,/--compact-side-width:clamp\(238px,21cqw,276px\)/);
 assert.match(css,/@media\(max-width:1159px\)\{[\s\S]*?--compact-side-width:clamp\(208px,29cqw,260px\)/);
 assert.match(css,/\.compact-command-panel\{[\s\S]*?max-height:none;[\s\S]*?overflow:visible/);
 assert.match(css,/\.compact-board-stack>\.compact-board\{[\s\S]*?aspect-ratio:1/);
 assert.match(css,/\.compact-quick-buttons>\.compact-icon-btn\{[\s\S]*?aspect-ratio:auto/);
});

test('narrow phones prioritize the board and put an entirely visible command panel underneath',async()=>{
 const css=await read('compact-responsive.css');
 const start=css.indexOf('@media(max-width:600px)');
 const end=css.indexOf('@media(max-width:380px)');
 assert.ok(start>0&&end>start);
 const phone=css.slice(start,end);
 assert.match(phone,/\.arena-field\{[\s\S]*?grid-template-columns:minmax\(0,1fr\);[\s\S]*?grid-template-rows:auto auto/);
 assert.match(phone,/\.compact-board-stack\{[\s\S]*?grid-column:1;grid-row:1/);
 assert.match(phone,/\.compact-command-panel\{[\s\S]*?grid-column:1;grid-row:2/);
 assert.match(phone,/\.compact-command-panel\{[\s\S]*?max-height:none;[\s\S]*?overflow:visible/);
 assert.match(phone,/\.compact-command-panel \.compact-quick-buttons\{[\s\S]*?repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(phone,/\.compact-setup \.setup-fields,[\s\S]*?\.chest-options\{[\s\S]*?grid-template-columns:minmax\(0,1fr\)/);
 assert.match(phone,/\.compact-command-panel \.compact-quick-footer>button\{[\s\S]*?min-height:42px/);
});

test('very narrow portrait and short landscape screens keep forms, HUD and actions accessible',async()=>{
 const css=await read('compact-responsive.css');
 assert.match(css,/@media\(max-width:380px\)\{/);
 assert.match(css,/\.compact-command-panel \.compact-quick-buttons\{[\s\S]*?grid-template-columns:minmax\(0,1fr\)/);
 assert.match(css,/@media\(max-height:520px\) and \(orientation:landscape\)\{/);
 assert.match(css,/\.compact-command-panel\{height:auto;max-height:none;overflow:visible\}/);
 assert.match(css,/\.compact-hud\{height:auto;max-height:none;overflow:visible\}/);
 assert.match(css,/button:focus-visible/);
 assert.match(css,/\.compact-setup select\{[\s\S]*?min-height:38px/);
});

test('all combat screen sections remain in the responsive DOM, without card/canvas substitutes',async()=>{
 const markup=await read('src/compact-demo.js');
 const css=await read('compact-responsive.css');
 for(const section of ['actions','abilities','items','planning']){
  assert.match(markup,new RegExp('data-panel-section="'+section+'"'),section);
 }
 for(const className of ['combat-header','compact-hud','compact-board-stack','compact-command-panel','compact-playback-tools','compact-setup','compact-result','compact-log','chest-options']){
  assert.ok(css.includes('.'+className),className+' must participate in responsive styling');
 }
 assert.match(markup,/role="group" aria-label="Arena tática em grade 6 por 6"/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});

test('screen-width layout contract never creates negative space or an unreadably thin board',()=>{
 // These arithmetic checks mirror CSS clamp breakpoints; a browser visual check is still required.
 for(const viewport of [320,360,375,390,430,600,601,680,720,760,820,1024,1199,1280,1440]){
  const outer=Math.min(viewport,1320);
  const shellPadding=Math.max(4,Math.min(14,viewport*.011));
  const stagePadding=Math.max(8,Math.min(15,viewport*.01));
  const usable=outer-shellPadding*2-stagePadding*2;
  if(viewport<=600){
   assert.ok(usable>=290,viewport+'px portrait should retain a legible square board');
  }else{
   const side=viewport<=1159?Math.min(260,Math.max(208,usable*.29)):Math.min(276,Math.max(238,usable*.21));
   const gap=viewport<=1159?Math.min(11,Math.max(6,viewport*.01)):Math.min(14,Math.max(8,viewport*.01));
   const board=Math.min(735,usable-side-gap);
   assert.ok(board>=320,viewport+'px tablet/desktop leaves room for a square tactical board');
  }
 }
});

test('responsive screen preserves sprite headroom, iPhone safe areas and reduced-motion controls',async()=>{
 const css=await read('compact-responsive.css');
 assert.match(css,/safe-area-inset-left/);
 assert.match(css,/safe-area-inset-right/);
 assert.match(css,/padding:clamp\(24px,3\.8vw,53px\) 0 0/);
 assert.match(css,/padding:clamp\(27px,7vw,43px\) 0 0/);
 assert.match(css,/body\{overflow-x:hidden;overflow-x:clip\}/);
 assert.match(css,/\.compact-result button\{[\s\S]*?max-width:100%/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
