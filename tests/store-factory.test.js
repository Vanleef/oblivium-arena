import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore,storageConfigured} from '../server/store-factory.js';

test('o armazenamento reconhece as variáveis REST injetadas pela integração Vercel KV',()=>{
 const names=['UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','PMA_DB_KV_REST_API_URL','PMA_DB_KV_REST_API_TOKEN','PMA_DB_KV_REST_API_READ_ONLY_TOKEN','PMA_LOCAL_DATA_PATH','VERCEL'];
 const saved=Object.fromEntries(names.map(name=>[name,process.env[name]]));
 try{
  for(const name of names)delete process.env[name];
  process.env.VERCEL='1';
  assert.equal(storageConfigured(),false);
  process.env.PMA_DB_KV_REST_API_URL='https://redis.example.test';
  process.env.PMA_DB_KV_REST_API_READ_ONLY_TOKEN='read-only';
  assert.equal(storageConfigured(),false,'o token somente de leitura não pode habilitar contas');
  process.env.PMA_DB_KV_REST_API_TOKEN='write-token';
  assert.equal(storageConfigured(),true);
  const store=createStore();
  assert.equal(store.url,'https://redis.example.test');
  assert.equal(store.token,'write-token');
  process.env.UPSTASH_REDIS_REST_URL='https://upstash.example.test';
  process.env.UPSTASH_REDIS_REST_TOKEN='upstash-token';
  assert.equal(createStore().url,'https://upstash.example.test','as variáveis explícitas mantêm precedência');
 }finally{
  for(const [name,value]of Object.entries(saved))if(value===undefined)delete process.env[name];else process.env[name]=value;
 }
});
