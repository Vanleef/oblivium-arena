import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {once} from 'node:events';

test('HTTP local: cadastro, campanha, reconexão e Arena entre duas contas',async t=>{
 const probe=createServer();probe.listen(0,'127.0.0.1');await once(probe,'listening');const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
 const directory=await mkdtemp(join(tmpdir(),'oblivium-http-'));
 const env={...process.env,PORT:String(port),PMA_LOCAL_DATA_PATH:join(directory,'data.json'),VERCEL:''};
 for(const key of ['UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','PMA_DB_KV_REST_API_URL','PMA_DB_KV_REST_API_TOKEN'])delete env[key];
 const server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:process.cwd(),env,stdio:['ignore','pipe','pipe']});
 t.after(async()=>{server.kill();await once(server,'exit').catch(()=>{});await rm(directory,{recursive:true,force:true});});
 await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw Error('Servidor encerrou antes de iniciar');})]);
 const base=`http://localhost:${port}`;
 async function request(path,body,cookies=''){
  const response=await fetch(base+path,{method:body?'POST':'GET',headers:{...(body?{'content-type':'application/json',origin:base}:{}),...(cookies?{cookie:cookies}:{})},...(body?{body:JSON.stringify(body)}:{})});
  return {status:response.status,data:await response.json(),cookies:response.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ')};
 }
 const first=await request('/api/account',{op:'register',email:'one@example.test',handle:'LocalUm',password:'senha-local-segura'});
 const second=await request('/api/account',{op:'register',email:'two@example.test',handle:'LocalDois',password:'senha-local-segura'});
 assert.equal(first.status,200);assert.equal(second.status,200);
 let run=await request('/api/campaign',{op:'start',eloId:'oblivio',variantId:'hunt',difficulty:0},first.cookies);
 assert.equal(run.status,200);const node=run.data.profile.run.availableNodeIds[0];
 run=await request('/api/campaign',{op:'select-node',nodeId:node},first.cookies);assert.equal(run.data.battle.phase,'influence');
 run=await request('/api/campaign',{op:'influence',eventId:run.data.battle.influenceDraft.options[0]},first.cookies);assert.equal(run.data.battle.phase,'player');
 run=await request('/api/campaign',{op:'turn',round:run.data.battle.round,actions:[]},first.cookies);assert.equal(run.status,200);
 const restored=await request('/api/account',null,first.cookies);assert.equal(restored.data.battle.round,run.data.battle.round);
 const queued=await request('/api/arena',{op:'queue',team:first.data.profile.team},first.cookies);assert.equal(queued.status,200);
 const joined=await request('/api/arena',{op:'queue',team:second.data.profile.team},second.cookies);assert.equal(joined.status,200);assert.ok(joined.data.match);
 const updatedCookies=first.cookies+'; '+queued.cookies;
 const firstMatch=await request('/api/arena',{op:'profile'},updatedCookies);assert.equal(firstMatch.data.match.id,joined.data.match.id);
 let views=[firstMatch,joined],cookies=[updatedCookies,second.cookies];
 for(let i=0;i<2;i++){
  const active=views.findIndex(view=>view.data.match.battle.phase==='influence');assert.notEqual(active,-1);
  const match=views[active].data.match;
  const selected=await request('/api/arena',{op:'influence',version:match.version,eventId:match.battle.influenceDraft.options[0]},cookies[active]);assert.equal(selected.status,200);
  views=await Promise.all(cookies.map(cookie=>request('/api/arena',{op:'profile'},cookie)));
 }
 const active=views.findIndex(view=>view.data.match.battle.phase==='player');assert.notEqual(active,-1);
 const played=await request('/api/arena',{op:'turn',version:views[active].data.match.version,actions:[]},cookies[active]);assert.equal(played.status,200);
 const surrendered=await request('/api/arena',{op:'surrender'},cookies[0]);assert.equal(surrendered.status,200);assert.equal(surrendered.data.profile.losses,1);
 const winner=await request('/api/arena',{op:'profile'},cookies[1]);assert.equal(winner.data.profile.wins,1);assert.equal(winner.data.match.settled,true);
});
