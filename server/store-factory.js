import {RedisStore} from './redis-store.js';
import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';

let fileQueue=Promise.resolve();
export function storageConfigured(){return Boolean(process.env.UPSTASH_REDIS_REST_URL&&process.env.UPSTASH_REDIS_REST_TOKEN)||Boolean(process.env.PMA_LOCAL_DATA_PATH&&process.env.VERCEL!=='1');}
export function createStore(){
 if(process.env.UPSTASH_REDIS_REST_URL&&process.env.UPSTASH_REDIS_REST_TOKEN)return new RedisStore(process.env.UPSTASH_REDIS_REST_URL,process.env.UPSTASH_REDIS_REST_TOKEN);
 if(process.env.PMA_LOCAL_DATA_PATH&&process.env.VERCEL!=='1')return new FileStore(process.env.PMA_LOCAL_DATA_PATH);
 throw Error('storage unavailable');
}
class FileStore{
 constructor(path){this.path=path;}
 async transaction(work){const result=fileQueue.then(async()=>{let data={};try{data=JSON.parse(await readFile(this.path,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
  const writes=new Map(),tx={get:async key=>structuredClone(writes.has(key)?writes.get(key):data[key]??null),set:async(key,value)=>writes.set(key,structuredClone(value)),delete:async key=>writes.set(key,null)};
  const value=await work(tx);for(const [key,item]of writes)item===null?delete data[key]:data[key]=item;
  if(writes.size){await mkdir(dirname(this.path),{recursive:true});const temp=`${this.path}.tmp`;await writeFile(temp,JSON.stringify(data),{mode:0o600});await rename(temp,this.path);}
  return value;
 });fileQueue=result.catch(()=>{});return result;}
}
