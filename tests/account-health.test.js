import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/account.js';

test('a verificação de disponibilidade confirma leitura no Redis sem criar conta',async t=>{
 const old={url:process.env.PMA_DB_KV_REST_API_URL,token:process.env.PMA_DB_KV_REST_API_TOKEN,fetch:globalThis.fetch};
 t.after(()=>{if(old.url===undefined)delete process.env.PMA_DB_KV_REST_API_URL;else process.env.PMA_DB_KV_REST_API_URL=old.url;if(old.token===undefined)delete process.env.PMA_DB_KV_REST_API_TOKEN;else process.env.PMA_DB_KV_REST_API_TOKEN=old.token;globalThis.fetch=old.fetch;});
 process.env.PMA_DB_KV_REST_API_URL='https://redis.example.test';process.env.PMA_DB_KV_REST_API_TOKEN='test-token';
 let command;globalThis.fetch=async(_url,options)=>{command=JSON.parse(options.body);return{ok:true,json:async()=>({result:null})};};
 let status,data;const res={setHeader(){},status(code){status=code;return this;},json(value){data=value;return value;}};
 await handler({method:'GET',url:'/api/account?health=1',query:{health:'1'},headers:{}},res);
 assert.equal(status,200);assert.deepEqual(data,{configured:true,storage:'ready'});assert.deepEqual(command,['GET','pma:v1:__healthcheck']);
});
