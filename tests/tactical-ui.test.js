import test from 'node:test';
import assert from 'node:assert/strict';

test('mão do trio usa encaixes, movimento de uma casa e confirmação simples',async()=>{
 const rootHandlers={},documentHandlers={},root={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[],addEventListener(type,handler){(rootHandlers[type]??=[]).push(handler);}};
 const saved={document:globalThis.document,Image:globalThis.Image,matchMedia:globalThis.matchMedia,requestAnimationFrame:globalThis.requestAnimationFrame};
 globalThis.document={getElementById:()=>root,addEventListener(type,handler){(documentHandlers[type]??=[]).push(handler);}};
 globalThis.Image=class {};globalThis.matchMedia=()=>({matches:true});globalThis.requestAnimationFrame=fn=>fn();
 const click=dataset=>rootHandlers.click.forEach(handler=>handler({target:{closest:()=>({dataset,disabled:false})}}));
 const until=async predicate=>{for(let i=0;i<150;i++){if(predicate())return;await new Promise(resolve=>setTimeout(resolve,40));}assert.fail('A interface não chegou ao estado esperado.');};
 try{
  await import('../src/tactical-demo.js?card-hand-flow');await until(()=>root.innerHTML.includes('aria-label="Mão do trio"'));
  assert.equal((root.innerHTML.match(/data-cell=/g)||[]).length,25);assert.equal((root.innerHTML.match(/data-card-slot=/g)||[]).length,6);
  assert.ok(root.innerHTML.indexOf('data-hand-group="o-acougueiro"')<root.innerHTML.indexOf('data-hand-group="a-viuva-escarlate"'));assert.ok(root.innerHTML.indexOf('data-hand-group="a-viuva-escarlate"')<root.innerHTML.indexOf('data-hand-group="o-escudo-vivo"'));
  assert.ok(root.innerHTML.indexOf('class="card-program"')<root.innerHTML.indexOf('class="hand-scroll"'));
  assert.doesNotMatch(root.innerHTML,/class="movement-guide"|class="private-insight"|Como seu trio pode combinar|Segure para confirmar|Próximo personagem/);assert.match(root.innerHTML,/essence-received/);
  click({handActor:'o-acougueiro',mode:'move'});assert.match(root.innerHTML,/movement-mode/);assert.match(root.innerHTML,/1 casa/);assert.doesNotMatch(root.innerHTML,/move-cell-label|route-step|dois passos/);
  click({cell:'1,1'});assert.match(root.innerHTML,/Mover · B2/);assert.equal((root.innerHTML.match(/class="card-socket filled/g)||[]).length,1);
  click({handActor:'o-acougueiro',mode:'move'});click({cell:'2,1'});assert.equal((root.innerHTML.match(/class="card-socket filled/g)||[]).length,2);
  click({slotSwap:'o-acougueiro'});assert.match(root.innerHTML,/needs-review/);assert.match(root.innerHTML,/class="confirm-cards"[^>]*disabled/);
  click({slotSwap:'o-acougueiro'});assert.doesNotMatch(root.innerHTML,/needs-review/);assert.doesNotMatch(root.innerHTML,/class="confirm-cards"[^>]*disabled/);
  click({slotRemove:'1'});click({slotRemove:'0'});assert.equal((root.innerHTML.match(/class="card-socket filled/g)||[]).length,0);
  click({handActor:'o-acougueiro',mode:'despertar'});assert.match(root.innerHTML,/Passo entre Lâminas/);
  assert.doesNotMatch(root.innerHTML,/data-hand-actor="o-acougueiro" data-mode="despertar"/);
  click({command:'commit'});await until(()=>root.innerHTML.includes('playback-action'));await until(()=>root.innerHTML.includes('Rodada 2')&&root.innerHTML.includes('aria-label="Mão do trio"'));
  assert.doesNotMatch(root.innerHTML,/data-hand-actor="o-acougueiro" data-mode="despertar"/);assert.doesNotMatch(root.innerHTML,/Não foi possível planejar/);
  const formation={'player-choice-0':'o-eco-de-nilo','player-choice-1':'a-viuva-escarlate','player-choice-2':'o-escudo-vivo','enemy-choice-0':'o-passo-interrompido','enemy-choice-1':'o-odio-encarnado','enemy-choice-2':'a-arquiteta-verde','seed-choice':'1','map-choice':'open','environment-choice':'none'};
  globalThis.document.getElementById=id=>id==='tactical-app'?root:{value:formation[id]};click({command:'restart'});await until(()=>root.innerHTML.includes('aria-label="Mão do trio"'));
  assert.match(root.innerHTML,/data-hand-actor="o-eco-de-nilo" data-mode="tecnica-9"/);
  formation['player-choice-0']='nilo';click({command:'restart'});await until(()=>root.innerHTML.includes('aria-label="Mão do trio"'));click({handActor:'nilo',mode:'voto'});assert.match(root.innerHTML,/Resíduo disponível/);
 }finally{for(const [key,value]of Object.entries(saved)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
