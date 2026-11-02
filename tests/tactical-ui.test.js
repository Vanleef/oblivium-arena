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
  assert.equal((root.innerHTML.match(/data-cell=/g)||[]).length,25);assert.match(root.innerHTML,/Seu plano · privado/);
  click({cell:'1,1'});click({cell:'1,1'});assert.match(root.innerHTML,/Mover · B2/);
  click({mode:'impulso'});click({cell:'2,1'});assert.match(root.innerHTML,/2ª passagem · iniciativa 1/);assert.match(root.innerHTML,/parte de B2/);assert.match(root.innerHTML,/Reposicionamento/);assert.match(root.innerHTML,/Posição e proteção podem alterar/);
  click({cell:'2,1'});assert.match(root.innerHTML,/2\/6 ações/);
  click({edit:'0'});click({command:'remove-edit'});assert.match(root.innerHTML,/1\/6 ações/);
  click({command:'undo-plan'});assert.match(root.innerHTML,/2\/6 ações/);
  const button={dataset:{command:'commit-hold'},disabled:false,classList:{add(){},remove(){}}};
  rootHandlers.pointerdown({button:0,clientX:0,clientY:0,target:{closest:()=>button}});
  documentHandlers.pointerup();await new Promise(resolve=>setTimeout(resolve,720));assert.match(root.innerHTML,/Planejamento privado · rodada 1/);
  rootHandlers.pointerdown({button:0,clientX:0,clientY:0,target:{closest:()=>button}});
  await until(()=>root.innerHTML.includes('Planejamento privado · rodada 2'));
  assert.match(root.innerHTML,/0\/6 ações/);assert.match(root.innerHTML,/resolution-feedback/);assert.doesNotMatch(root.innerHTML,/Não foi possível planejar/);
 }finally{for(const [key,value]of Object.entries(saved)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
