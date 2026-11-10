import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {once} from 'node:events';
import {boardCells,findPath} from '../src/tactical-board.js';

test('local HTTP server supports two authenticated compact PvP sessions',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'oblivium-compact-dev-'));
 const child=spawn(process.execPath,['scripts/serve.mjs'],{
  cwd:new URL('..',import.meta.url),
  env:{...process.env,PORT:'0',PMA_LOCAL_DATA_PATH:join(directory,'accounts.json'),
   UPSTASH_REDIS_REST_URL:'',UPSTASH_REDIS_REST_TOKEN:'',PMA_DB_KV_REST_API_URL:'',PMA_DB_KV_REST_API_TOKEN:'',VERCEL:''},
  stdio:['ignore','pipe','pipe']
 });
 let stderr='';
 child.stderr.setEncoding('utf8');
 child.stderr.on('data',data=>{stderr+=data;});
 try{
  const [chunk]=await Promise.race([
   once(child.stdout,'data'),
   once(child,'exit').then(([code])=>{throw Error('Development server exited: '+code+' '+stderr);}),
   new Promise((_,reject)=>setTimeout(()=>reject(Error('Development server did not start')),10000).unref())
  ]);
  const port=String(chunk).match(/localhost:(\d+)/)?.[1];
  assert.ok(port,'server must report its actual listening port');
  const response=await fetch('http://localhost:'+port+'/api/arena-compact');
  assert.equal(response.status,200);
  const data=await response.json();
  assert.equal(data.configured,true);
  assert.equal(data.mode,'compact-6x6');
  const origin='http://localhost:'+port;
  const anonymous=await fetch(origin+'/api/arena-compact',{method:'POST',
   headers:{origin,'content-type':'application/json'},body:JSON.stringify({op:'profile'})});
  assert.equal(anonymous.status,401);
  const post=async(path,body,cookies='')=>{
   const result=await fetch(origin+path,{method:'POST',
    headers:{origin,'content-type':'application/json',...(cookies?{cookie:cookies}:{})},
    body:JSON.stringify(body)});
   const payload=await result.json();
   assert.equal(result.status,200,JSON.stringify(payload));
   return {payload,cookies:result.headers.getSetCookie().map(value=>value.split(';')[0])};
  };
  const register=async(handle)=>{
   const result=await post('/api/account',{op:'register',handle,email:handle+'@example.test',password:'test-password-only'});
   const session=result.cookies.find(cookie=>cookie.startsWith('pma_session='));
   assert.ok(session);
   return {session,team:result.payload.profile.team};
  };
  const a=await register('TestAlice'),b=await register('TestBob');
  const queue=async(client)=>{
   const result=await post('/api/arena-compact',{op:'queue',team:client.team},client.session);
   const token=result.cookies.find(cookie=>cookie.startsWith('pma_compact_arena='));
   assert.ok(token);
   client.cookies=client.session+'; '+token;
   return result.payload;
  };
  assert.equal((await queue(a)).queued,true);
  const joined=await queue(b);
  assert.ok(joined.match);
  const aView=(await post('/api/arena-compact',{op:'profile'},a.cookies)).payload;
  assert.equal(aView.match.id,joined.match.id);
  for(const view of [aView,joined]){
   const decks=view.match.battle.tactical.decks.sides;
   assert.deepEqual(Object.values(decks).map(side=>Object.keys(side).length).sort(),[0,3]);
   assert.equal(view.match.battle.tactical.width,6);
  }
  const movement=(view,excluded)=>{
   const battle=view.match.battle,side=Object.keys(battle.tactical.decks.sides.player).length?'player':'enemy';
   const unit=(side==='player'?battle.allies:battle.enemies)[0];
   for(const destination of boardCells(battle)){
    if(excluded&&destination.x===excluded.x&&destination.y===excluded.y)continue;
    const path=findPath(battle,unit.id,destination,1);
    if(path)return {action:{type:'move',actorId:unit.id,path},destination};
   }
   assert.fail('No legal adjacent movement for '+side);
  };
  const aMove=movement(aView),bMove=movement(joined,aMove.destination);
  const version=joined.match.version;
  await post('/api/arena-compact',{op:'turn',version,round:1,actions:[aMove.action]},a.cookies);
  const pending=(await post('/api/arena-compact',{op:'profile'},b.cookies)).payload;
  assert.deepEqual(pending.match.battle.tactical.plans,{});
  assert.deepEqual(pending.match.battle.tactical.positions[aMove.action.actorId],aView.match.battle.tactical.positions[aMove.action.actorId]);
  const resolved=(await post('/api/arena-compact',{op:'turn',version,round:1,actions:[bMove.action]},b.cookies)).payload;
  assert.equal(resolved.match.battle.round,2);
  assert.deepEqual(resolved.match.battle.tactical.positions[aMove.action.actorId],aMove.destination);
  assert.deepEqual(resolved.match.battle.tactical.positions[bMove.action.actorId],bMove.destination);
  assert.ok(resolved.match.battle.tactical.events.some(event=>event.type==='reveal'));
  const reconnected=(await post('/api/arena-compact',{op:'profile'},a.cookies)).payload;
  assert.equal(reconnected.match.battle.round,2);
  assert.deepEqual(reconnected.match.battle.tactical.positions,resolved.match.battle.tactical.positions);
  const surrendered=(await post('/api/arena-compact',{op:'surrender'},a.cookies)).payload;
  assert.equal(surrendered.match.settled,true);
  assert.equal(surrendered.profile.losses,1);
  const winner=(await post('/api/arena-compact',{op:'profile'},b.cookies)).payload;
  assert.equal(winner.profile.wins,1);
 }finally{
  if(child.exitCode===null){child.kill();await once(child,'exit');}
  await rm(directory,{recursive:true,force:true});
 }
});
