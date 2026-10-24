import test from 'node:test';
import assert from 'node:assert/strict';

test('a interface mantém campanha, roguelike e Arena atrás do cadastro ou login, com Tutorial e Codex públicos',async t=>{
 const old={window:globalThis.window,fetch:globalThis.fetch,document:globalThis.document,localStorage:globalThis.localStorage};
 t.after(()=>{for(const [key,value]of Object.entries(old))if(value===undefined)delete globalThis[key];else globalThis[key]=value;});
 const handlers={},app={innerHTML:'',addEventListener(type,fn){handlers[type]=fn;},querySelector(){return null;}};
 globalThis.window={};globalThis.fetch=async()=>({ok:true,json:async()=>({configured:true})});globalThis.document={querySelector:()=>app,body:{dataset:{}},activeElement:null};globalThis.localStorage={getItem:()=>null,setItem(){}};
 await import(`../src/main.js?auth-gate-${Date.now()}`);await new Promise(resolve=>setImmediate(resolve));
 assert.match(app.innerHTML,/Entrar/);assert.match(app.innerHTML,/Criar conta/);assert.match(app.innerHTML,/data-auth-form/);assert.doesNotMatch(app.innerHTML,/A Grande Rota|Arena ranqueada|data-start-run/);
 const button={dataset:{authMode:'register'},closest(){return this;}};handlers.click({target:button});assert.match(app.innerHTML,/Criar conta/);assert.match(app.innerHTML,/name="handle"/);
 const codex={dataset:{publicView:'codex'},closest(){return this;}};handlers.click({target:codex});assert.match(app.innerHTML,/Codex/);assert.match(app.innerHTML,/O Fim/);assert.match(app.innerHTML,/ALMA DO PMA/);assert.doesNotMatch(app.innerHTML,/data-auth-form|data-start-run/);
 const tutorial={dataset:{publicView:'tutorial'},closest(){return this;}};handlers.click({target:tutorial});assert.match(app.innerHTML,/Tutorial do jogo/);assert.match(app.innerHTML,/1 \/ 6/);assert.match(app.innerHTML,/data-tutorial="1"/);assert.doesNotMatch(app.innerHTML,/data-auth-form|data-start-run/);
 const next={dataset:{tutorial:'1'},closest(){return this;}};handlers.click({target:next});assert.match(app.innerHTML,/2 \/ 6/);
 const login={dataset:{publicView:'login'},closest(){return this;}};handlers.click({target:login});assert.match(app.innerHTML,/data-auth-form/);
});
