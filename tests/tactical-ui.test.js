import test from 'node:test';
import assert from 'node:assert/strict';

test('planejamento privado explica a segunda passagem, permite editar e executa com confirmação mantida',async()=>{
 const rootHandlers={},documentHandlers={},root={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,handler){rootHandlers[type]=handler;}};
 const saved={document:globalThis.document,Image:globalThis.Image,matchMedia:globalThis.matchMedia,requestAnimationFrame:globalThis.requestAnimationFrame};
 globalThis.document={getElementById:()=>root,addEventListener(type,handler){documentHandlers[type]=handler;}};
 globalThis.Image=class {};globalThis.matchMedia=()=>({matches:true});globalThis.requestAnimationFrame=fn=>fn();
 const click=dataset=>rootHandlers.click({target:{closest:()=>({dataset,disabled:false})}});
 const until=async predicate=>{for(let i=0;i<120;i++){if(predicate())return;await new Promise(resolve=>setTimeout(resolve,40));}assert.fail('A interface não chegou ao estado esperado.');};
 try{
  await import('../src/tactical-demo.js?private-planning-flow');await until(()=>root.innerHTML.includes('Planejamento privado'));
  assert.equal((root.innerHTML.match(/data-cell=/g)||[]).length,25);assert.doesNotMatch(root.innerHTML,/acting-cell/);assert.match(root.innerHTML,/Seu plano · privado/);assert.match(root.innerHTML,/Ação selecionada/);assert.match(root.innerHTML,/Velocidade das animações/);assert.ok(root.innerHTML.indexOf('class="movement-guide"')>root.innerHTML.indexOf('class="combat-dock"'));
  const speedButtons=[1,2,3].map(n=>({dataset:{speed:String(n)},setAttribute(key,value){this[key]=value;}}));root.querySelectorAll=selector=>selector==='[data-speed]'?speedButtons:[];click({speed:'3'});assert.equal(speedButtons[2]['aria-pressed'],'true');assert.equal(speedButtons[0]['aria-pressed'],'false');
  click({command:'compact-replay'});
  click({cell:'1,1'});click({cell:'1,1'});assert.match(root.innerHTML,/Mover · B2/);assert.match(root.innerHTML,/class="compact-replay" aria-pressed="true"/);
  click({mode:'impulso'});click({cell:'2,1'});assert.match(root.innerHTML,/2ª passagem · iniciativa 1/);assert.match(root.innerHTML,/parte de B2/);assert.match(root.innerHTML,/Reposicionamento/);assert.match(root.innerHTML,/Posição e proteção podem alterar/);
  click({cell:'2,1'});assert.match(root.innerHTML,/2\/6 ações/);
  click({edit:'0'});click({command:'remove-edit'});assert.match(root.innerHTML,/1\/6 ações/);
  click({command:'undo-plan'});assert.match(root.innerHTML,/2\/6 ações/);assert.doesNotMatch(root.innerHTML,/needs-review/);
  click({command:'clear-plan'});click({cell:'1,1'});click({cell:'1,1'});click({cell:'2,1'});click({cell:'2,1'});assert.match(root.innerHTML,/2\/6 ações/);
  click({edit:'0'});click({cell:'0,0'});click({cell:'0,0'});
  assert.match(root.innerHTML,/Mover · A1/);assert.match(root.innerHTML,/Revisar 2ª ação/);assert.match(root.innerHTML,/Ação atualizada. Revise os espaços/);assert.match(root.innerHTML,/<button class="round-commit"[^>]*disabled/);
  click({edit:'1'});click({cell:'1,0'});click({cell:'1,0'});assert.doesNotMatch(root.innerHTML,/needs-review/);assert.match(root.innerHTML,/Mover · B1/);
  click({command:'undo-plan'});assert.match(root.innerHTML,/Revisar 2ª ação/);click({command:'undo-plan'});assert.doesNotMatch(root.innerHTML,/needs-review/);
  click({edit:'0'});click({command:'remove-edit'});assert.match(root.innerHTML,/plan-slot occupied\s+needs-review/);assert.match(root.innerHTML,/class="slot-reason"/);assert.match(root.innerHTML,/Revisar 1ª ação/);
  click({command:'undo-plan'});assert.doesNotMatch(root.innerHTML,/needs-review/);
  const button={dataset:{command:'commit-hold'},disabled:false,classList:{add(){},remove(){}}};
  rootHandlers.pointerdown({button:0,clientX:0,clientY:0,target:{closest:()=>button}});
  documentHandlers.pointerup();await new Promise(resolve=>setTimeout(resolve,720));assert.match(root.innerHTML,/Planejamento privado · rodada 1/);
  rootHandlers.pointerdown({button:0,clientX:0,clientY:0,target:{closest:()=>button}});
  await until(()=>root.innerHTML.includes('ações em reprodução'));
  assert.match(root.innerHTML,/2 ações em reprodução/);assert.match(root.innerHTML,/Seu trio · Riven/);assert.equal((root.innerHTML.match(/acting-cell/g)||[]).length,1);assert.match(root.innerHTML,/class="plan-details" open/);assert.match(root.innerHTML,/plan-slot occupied\s+executing/);assert.match(root.innerHTML,/aria-current="step"/);assert.match(root.innerHTML,/plan-slot occupied\s+waiting/);assert.doesNotMatch(root.innerHTML,/class="plan-error"/);
  await until(()=>root.innerHTML.includes('playback-action opponent'));
  assert.match(root.innerHTML,/Oponente ·/);assert.doesNotMatch(root.innerHTML,/class="selected-plan"/);
  await until(()=>/plan-slot occupied\s+completed/.test(root.innerHTML));
  assert.match(root.innerHTML,/Concluída 1ª ação/);assert.match(root.innerHTML,/2 ações em reprodução/);
  await until(()=>root.innerHTML.includes('Planejamento privado · rodada 2'));
  assert.doesNotMatch(root.innerHTML,/ações em reprodução|plan-slot occupied/);
  assert.match(root.innerHTML,/0\/6 ações/);assert.match(root.innerHTML,/resolution-feedback/);assert.doesNotMatch(root.innerHTML,/Não foi possível planejar/);
  const formation={'player-choice-0':'o-acougueiro','player-choice-1':'a-viuva-escarlate','player-choice-2':'o-escudo-vivo','enemy-choice-0':'o-passo-interrompido','enemy-choice-1':'o-odio-encarnado','enemy-choice-2':'a-arquiteta-verde','seed-choice':'1','map-choice':'open','environment-choice':'limbo'};
  globalThis.document.getElementById=id=>id==='tactical-app'?root:{value:formation[id]};
  click({command:'restart'});await until(()=>root.innerHTML.includes('Planejamento privado · rodada 1'));
  assert.match(root.innerHTML,/environment-rule limbo/);assert.match(root.innerHTML,/Mesma regra para os dois lados/);assert.match(root.innerHTML,/value="limbo" selected/);assert.equal((root.innerHTML.match(/class="cell environment-cell/g)||[]).length,1);
  formation['player-choice-0']='o-eco-de-nilo';click({command:'restart'});assert.match(root.innerHTML,/Preparando confronto · rodada 1/);assert.doesNotMatch(root.innerHTML,/Resolvendo ·|EXECUTANDO/);await until(()=>root.innerHTML.includes('Planejamento privado · rodada 1'));
  assert.match(root.innerHTML,/arena-skills expanded-kit/);assert.equal((root.innerHTML.match(/data-mode=/g)||[]).length,11);assert.match(root.innerHTML,/data-mode="tecnica-9"/);assert.match(root.innerHTML,/136 jogáveis · 150 adversários/);
  formation['player-choice-0']='nilo-cinza-final';click({command:'restart'});await until(()=>root.innerHTML.includes('Planejamento privado · rodada 1'));
  assert.match(root.innerHTML,/Requer Colapso I/);click({mode:'voto'});click({mode:'voto'});assert.match(root.innerHTML,/1\/6 ações/);assert.doesNotMatch(root.innerHTML,/title="Requer Colapso I/);
  formation['player-choice-0']='nilo';click({command:'restart'});await until(()=>root.innerHTML.includes('Planejamento privado · rodada 1'));click({mode:'voto'});assert.match(root.innerHTML,/Resíduo disponível/);assert.match(root.innerHTML,/data-spend-kind="residue"/);


 }finally{for(const [key,value]of Object.entries(saved)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
