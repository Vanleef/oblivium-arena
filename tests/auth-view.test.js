import test from 'node:test';
import assert from 'node:assert/strict';

test('a interface mantém campanha, roguelike e Arena atrás do cadastro ou login',async t=>{
 const old={window:globalThis.window,fetch:globalThis.fetch,document:globalThis.document,localStorage:globalThis.localStorage};
 t.after(()=>{for(const [key,value]of Object.entries(old))if(value===undefined)delete globalThis[key];else globalThis[key]=value;});
 const handlers={},app={innerHTML:'',addEventListener(type,fn){handlers[type]=fn;},querySelector(){return null;}};
 globalThis.window={};globalThis.fetch=async()=>({ok:true,json:async()=>({configured:true})});globalThis.document={querySelector:()=>app,body:{dataset:{}},activeElement:null};globalThis.localStorage={getItem:()=>null,setItem(){}};
 await import(`../src/main.js?auth-gate-${Date.now()}`);await new Promise(resolve=>setImmediate(resolve));
 assert.match(app.innerHTML,/Volte à trilha/);assert.match(app.innerHTML,/Criar conta/);assert.match(app.innerHTML,/data-auth-form/);assert.doesNotMatch(app.innerHTML,/A Grande Rota|Arena ranqueada|data-start-run/);
 const button={dataset:{authMode:'register'},closest(){return this;}};handlers.click({target:button});assert.match(app.innerHTML,/Crie sua conta/);assert.match(app.innerHTML,/name="handle"/);
});
