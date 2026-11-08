import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import accountHandler from '../api/account.js';
import campaignHandler from '../api/campaign.js';

test('cadastro, saída, login e restauração mantêm usuário após sincronizar campanha',async t=>{
 const keys=['window','document','localStorage','fetch','FormData'],old=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 const envKeys=['UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','PMA_DB_KV_REST_API_URL','PMA_DB_KV_REST_API_TOKEN','PMA_LOCAL_DATA_PATH','VERCEL'],env=Object.fromEntries(envKeys.map(k=>[k,process.env[k]]));
 const dir=await mkdtemp(join(tmpdir(),'oblivium-auth-'));for(const k of envKeys)delete process.env[k];process.env.PMA_LOCAL_DATA_PATH=join(dir,'accounts.json');
 t.after(async()=>{for(const [k,v] of Object.entries(old))if(v===undefined)delete globalThis[k];else globalThis[k]=v;for(const [k,v] of Object.entries(env))if(v===undefined)delete process.env[k];else process.env[k]=v;await rm(dir,{recursive:true,force:true});});
 const handlers={},app={innerHTML:'',addEventListener(type,fn){handlers[type]=fn;},querySelector(){return null;}};let cookie='',saves=[];
 globalThis.window={};globalThis.document={querySelector:()=>app,body:{dataset:{}},documentElement:{lang:'pt-BR'},activeElement:null};
 globalThis.localStorage={getItem:()=>null,setItem:()=>{}};globalThis.FormData=class{constructor(form){this.data=form.fields;}get(key){return this.data[key]??null;}};
 globalThis.fetch=async(url,options={})=>{let status=200,data,headers={};const body=options.body?JSON.parse(options.body):undefined;const res={setHeader(k,v){headers[k.toLowerCase()]=v;},status(code){status=code;return this;},json(v){data=v;return v;}};const handler=url==='/api/account'?accountHandler:campaignHandler;await handler({method:options.method||'GET',url,headers:{host:'pma.example.test',origin:'https://pma.example.test','x-forwarded-proto':'https','content-type':'application/json',cookie},body},res);if(headers['set-cookie'])cookie=headers['set-cookie'].map(v=>v.split(';')[0]).join('; ');if(url==='/api/account'&&body?.op==='save')saves.push(status);return{ok:status>=200&&status<300,status,json:async()=>data};};
 const click=dataset=>handlers.click({target:{dataset,closest(){return this;}}});
 const submit=fields=>handlers.submit({preventDefault(){},target:{fields,matches:s=>s==='[data-auth-form]'}});
 const waitFor=async(predicate,label)=>{const end=Date.now()+15000;while(!predicate()){if(Date.now()>=end)assert.fail('Tempo esgotado: '+label);await new Promise(resolve=>setTimeout(resolve,25));}};
 await import(`../src/main.js?auth-integration=${Date.now()}`);await waitFor(()=>app.innerHTML.includes('data-auth-form')&&!app.innerHTML.includes('Conectando…'),'inicialização da conta');
 click({authMode:'register'});await submit({email:'test@example.test',handle:'AlmaTeste',password:'senha-longa-2026'});
 assert.match(app.innerHTML,/A Grande Rota/);assert.doesNotMatch(app.innerHTML,/data-auth-form/);
 await waitFor(()=>saves.length===1,'salvamento após cadastro');assert.equal(saves[0],200);
 click({action:'logout'});await waitFor(()=>app.innerHTML.includes('data-auth-form'),'saída');assert.match(app.innerHTML,/data-auth-form/);
 await submit({email:'test@example.test',password:'senha-longa-2026'});assert.match(app.innerHTML,/A Grande Rota/);assert.doesNotMatch(app.innerHTML,/data-auth-form/);
 await waitFor(()=>saves.length===2,'salvamento após login');assert.equal(saves[1],200);
 await import(`../src/main.js?auth-restore=${Date.now()}`);await waitFor(()=>app.innerHTML.includes('A Grande Rota')&&!app.innerHTML.includes('data-auth-form'),'restauração da conta');assert.match(app.innerHTML,/A Grande Rota/);assert.doesNotMatch(app.innerHTML,/data-auth-form/);
});
