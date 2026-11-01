import test from 'node:test';
import assert from 'node:assert/strict';

test('interface permite selecionar, mover, reordenar, remover e resolver até a próxima rodada',async()=>{
 const handlers={},fields={};const root={innerHTML:'',addEventListener(type,handler){handlers[type]=handler;}};
 const previousDocument=globalThis.document;
 globalThis.document={getElementById:id=>id==='tactical-app'?root:(fields[id]||={value:''})};
 const click=dataset=>handlers.click({target:{closest:()=>({dataset,disabled:false})}});
 const ready=()=>new Promise(resolve=>setTimeout(resolve,5));
 try{
  await import('../src/tactical-demo.js?ui-flow-test');await ready();
  assert.match(root.innerHTML,/Arena tática/);assert.equal((root.innerHTML.match(/data-cell=/g)||[]).length,25);assert.match(root.innerHTML,/Revelar e resolver rodada/);
  click({cell:'2,0'});assert.match(root.innerHTML,/Adicionar movimento · C1/);click({command:'add'});assert.match(root.innerHTML,/Mover até C1/);assert.match(root.innerHTML,/1 \/ 6/);
  click({actor:'a-viuva-escarlate'});click({cell:'1,2'});click({command:'add'});assert.match(root.innerHTML,/Mover até B3/);assert.match(root.innerHTML,/2 \/ 6/);
  click({order:'1',direction:'-1'});assert.ok(root.innerHTML.indexOf('Mover até B3')<root.innerHTML.indexOf('Mover até C1'));
  click({remove:'0'});assert.match(root.innerHTML,/1 \/ 6/);assert.doesNotMatch(root.innerHTML,/Mover até B3/);
  click({command:'payment'});assert.equal((root.innerHTML.match(/data-payment=/g)||[]).length,4);click({command:'payment'});assert.doesNotMatch(root.innerHTML,/data-payment=/);
  click({command:'confirm'});await ready();assert.match(root.innerHTML,/<small>RODADA<\/small><b>2<\/b>/);assert.match(root.innerHTML,/0 \/ 6/);assert.match(root.innerHTML,/Encerramento da rodada/);assert.match(root.innerHTML,/As campanhas e a Arena online mantêm o combate atual/);
  assert.doesNotMatch(root.innerHTML,/Não foi possível planejar/);
 }finally{globalThis.document=previousDocument;}
});
