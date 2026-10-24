import test from 'node:test';
import assert from 'node:assert/strict';
import {RedisStore} from '../server/redis-store.js';

test('Redis mantém contas sem expiração e só aplica TTL quando solicitado',async t=>{
 const original=globalThis.fetch;let evalCommand;
 t.after(()=>{globalThis.fetch=original;});
 globalThis.fetch=async(_url,options)=>{const command=JSON.parse(options.body);if(command[0]==='GET')return{ok:true,json:async()=>({result:null})};evalCommand=command;return{ok:true,json:async()=>({result:1})};};
 const store=new RedisStore('https://redis.example.test','token');
 await store.transaction(async tx=>{await tx.set('account:id',{handle:'Alma'});await tx.set('queue',[],600);});
 assert.equal(evalCommand[0],'EVAL');assert.match(evalCommand[1],/if ttl and ttl>0 then/);assert.ok(evalCommand.includes('0'),'account data has no expiry');assert.ok(evalCommand.includes('600'),'ephemeral queue data keeps an explicit TTL');
});
