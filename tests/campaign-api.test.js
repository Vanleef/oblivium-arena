import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import accountHandler from '../api/account.js';
import campaignHandler from '../api/campaign.js';

const storageKeys=['UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','PMA_DB_KV_REST_API_URL','PMA_DB_KV_REST_API_TOKEN','PMA_LOCAL_DATA_PATH','VERCEL'];
const origin='https://pma.example.test';

function call(handler,{method='POST',body,session,originHeader=origin,contentType='application/json'}={}){
 return (async()=>{
  let status=200,data;const headers={};
  const res={setHeader(name,value){headers[name.toLowerCase()]=value;},status(code){status=code;return this;},json(value){data=value;return value;}};
  const request={method,headers:{host:'pma.example.test','x-forwarded-proto':'https','content-type':contentType,...(originHeader?{origin:originHeader}:{}),...(session?{cookie:`pma_session=${session}`}:{})},body};
  await handler(request,res);return{status,data,headers};
 })();
}

test('API de campanha exige origem e sessão, mantém contas isoladas e ignora progresso forjado',async t=>{
 const saved=Object.fromEntries(storageKeys.map(key=>[key,process.env[key]])),directory=await mkdtemp(join(tmpdir(),'pma-campaign-api-'));
 for(const key of storageKeys)delete process.env[key];process.env.PMA_LOCAL_DATA_PATH=join(directory,'accounts.json');
 t.after(async()=>{for(const [key,value]of Object.entries(saved))if(value===undefined)delete process.env[key];else process.env[key]=value;await rm(directory,{recursive:true,force:true});});

 assert.equal((await call(campaignHandler,{body:{op:'sync'},originHeader:'http://pma.example.test'})).status,403);
 assert.equal((await call(campaignHandler,{body:{op:'sync'}})).status,401);
 assert.equal((await call(campaignHandler,{method:'GET'})).status,405);
 assert.equal((await call(campaignHandler,{body:{op:'sync',padding:'x'.repeat(16000)}})).status,413);

 const register=async(email,handle)=>call(accountHandler,{body:{op:'register',email,handle,password:'senha-longa-para-teste-2026'}});
 const first=await register('pma-campaign-one@example.test','RotaUm');assert.equal(first.status,200);
 const firstSession=first.headers['set-cookie'].find(value=>value.startsWith('pma_session=')).match(/pma_session=([a-f0-9]{64})/)[1];
 const started=await call(campaignHandler,{session:firstSession,body:{op:'start',eloId:'sangria',variantId:'hunt',difficulty:0}});
 assert.equal(started.status,200);assert.equal(started.data.profile.run.serverOwned,true);
 const forged=await call(accountHandler,{session:firstSession,body:{op:'save',profile:{...started.data.profile,xp:500000,fragments:500000,ownedIds:[...started.data.profile.ownedIds,'o-fim'],completedElos:['sangria'],run:null}}});
 assert.equal(forged.status,200);assert.equal(forged.data.profile.xp,0);assert.equal(forged.data.profile.fragments,0);assert.deepEqual(forged.data.profile.completedElos,[]);assert.ok(forged.data.profile.run.serverOwned);

 const second=await register('pma-campaign-two@example.test','RotaDois');assert.equal(second.status,200);
 const secondSession=second.headers['set-cookie'].find(value=>value.startsWith('pma_session=')).match(/pma_session=([a-f0-9]{64})/)[1];
 const secondRun=await call(campaignHandler,{session:secondSession,body:{op:'settle'}});
 assert.equal(secondRun.status,400);
 const current=await call(accountHandler,{method:'GET',session:firstSession});assert.equal(current.data.profile.run.serverOwned,true);assert.equal(current.data.profile.xp,0);
});
