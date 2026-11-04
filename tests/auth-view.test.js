import test from 'node:test';
import assert from 'node:assert/strict';

test('a interface mantém campanha, roguelike e Arena atrás do cadastro ou login, com Tutorial e Codex públicos',async t=>{
 const old={window:globalThis.window,fetch:globalThis.fetch,document:globalThis.document,localStorage:globalThis.localStorage};
 t.after(()=>{for(const [key,value]of Object.entries(old))if(value===undefined)delete globalThis[key];else globalThis[key]=value;});
 const handlers={},app={innerHTML:'',addEventListener(type,fn){handlers[type]=fn;},querySelector(){return null;}};let savedLanguage=null;
 globalThis.window={};globalThis.fetch=async()=>({ok:true,json:async()=>({configured:true})});globalThis.document={querySelector:()=>app,body:{dataset:{},},documentElement:{lang:'pt-BR'},activeElement:null};globalThis.localStorage={getItem:key=>key==='pma-language'?savedLanguage:null,setItem:(key,value)=>{if(key==='pma-language')savedLanguage=value;}};
 await import(`../src/main.js?auth-gate-${Date.now()}`);await new Promise(resolve=>setImmediate(resolve));
 assert.match(app.innerHTML,/Entrar/);assert.match(app.innerHTML,/Criar conta/);assert.match(app.innerHTML,/data-auth-form/);assert.doesNotMatch(app.innerHTML,/A Grande Rota|Arena ranqueada|data-start-run/);
 const button={dataset:{authMode:'register'},closest(){return this;}};handlers.click({target:button});assert.match(app.innerHTML,/Criar conta/);assert.match(app.innerHTML,/name="handle"/);
 const codex={dataset:{publicView:'codex'},closest(){return this;}};handlers.click({target:codex});assert.match(app.innerHTML,/Codex/);assert.match(app.innerHTML,/O Fim/);assert.match(app.innerHTML,/ALMA DE OBLIVIUM ARENA/);assert.doesNotMatch(app.innerHTML,/data-auth-form|data-start-run/);
 const tutorial={dataset:{publicView:'tutorial'},closest(){return this;}};handlers.click({target:tutorial});assert.match(app.innerHTML,/Tutorial do jogo/);assert.match(app.innerHTML,/1 \/ 6/);assert.match(app.innerHTML,/data-tutorial="1"/);assert.doesNotMatch(app.innerHTML,/data-auth-form|data-start-run/);
 const next={dataset:{tutorial:'1'},closest(){return this;}};handlers.click({target:next});assert.match(app.innerHTML,/2 \/ 6/);
 const login={dataset:{publicView:'login'},closest(){return this;}};handlers.click({target:login});assert.match(app.innerHTML,/data-auth-form/);
 const english={dataset:{language:'en'},closest(){return this;}};handlers.click({target:english});assert.equal(savedLanguage,'en');assert.equal(document.documentElement.lang,'en');assert.match(app.innerHTML,/CREATE ACCOUNT/);assert.match(app.innerHTML,/aria-label="Language"/);assert.match(app.innerHTML,/Unique handle/);assert.match(app.innerHTML,/3–20 characters · letters, numbers, and _/);assert.match(app.innerHTML,/placeholder="Your Arena handle"/);assert.match(app.innerHTML,/placeholder="you@example.com"/);assert.match(app.innerHTML,/placeholder="At least 10 characters"/);assert.match(app.innerHTML,/<b>OBLIVIUM<\/b><small>ARENA<\/small>/);
 const englishLogin={dataset:{authMode:"login"},closest(){return this;}};handlers.click({target:englishLogin});assert.match(app.innerHTML,/placeholder="Your password"/);assert.match(app.innerHTML,/Sign in/);
 handlers.click({target:codex});assert.match(app.innerHTML,/150 SOULS · 22 KINGDOMS · 3 WORLDS/);assert.match(app.innerHTML,/Kingdom Codex|Codex/);
 const portuguese={dataset:{language:'pt-BR'},closest(){return this;}};handlers.click({target:portuguese});assert.equal(savedLanguage,'pt-BR');assert.equal(document.documentElement.lang,'pt-BR');assert.match(app.innerHTML,/O Fim/);
});
