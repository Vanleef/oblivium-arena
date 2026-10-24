import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/account.js';

test('a conta exige origem com esquema e host exatos e rejeita JSON inválido como 400',async t=>{
 const names=['UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN'];const saved=Object.fromEntries(names.map(name=>[name,process.env[name]]));process.env.UPSTASH_REDIS_REST_URL='https://redis.example.test';process.env.UPSTASH_REDIS_REST_TOKEN='test-token';
 t.after(()=>{for(const [name,value]of Object.entries(saved))if(value===undefined)delete process.env[name];else process.env[name]=value;});
 const call=async(headers,body)=>{let status,data;const res={setHeader(){},status(code){status=code;return this;},json(value){data=value;return value;}};await handler({method:'POST',headers,body},res);return{status,data};};
 const base={host:'pma.example.test','content-type':'application/json'};
 assert.equal((await call({...base,origin:'http://pma.example.test'},{})).status,403);
 const malformed=await call({...base,origin:'https://pma.example.test','x-forwarded-proto':'https'},'{broken');
 assert.equal(malformed.status,400);assert.equal(malformed.data.error,'Pedido inválido.');
});
