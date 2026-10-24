// Redis REST + optimistic multi-key CAS. Production never falls back to memory.
const commitScript=`for i,k in ipairs(KEYS) do
 local current=redis.call('GET',k) or ''
 if current~=ARGV[(i-1)*3+1] then return 0 end
end
for i,k in ipairs(KEYS) do
 local value=ARGV[(i-1)*3+2]
 if value~='__NO_WRITE__' then
  if value=='__DELETE__' then redis.call('DEL',k)
  else local ttl=tonumber(ARGV[(i-1)*3+3]);if ttl and ttl>0 then redis.call('SET',k,value,'EX',ttl) else redis.call('SET',k,value) end end
 end
end
return 1`;
export class RedisStore{
 constructor(url,token){this.url=url;this.token=token;}
 async command(command){const response=await fetch(this.url,{method:'POST',headers:{Authorization:`Bearer ${this.token}`,'Content-Type':'application/json'},body:JSON.stringify(command),signal:AbortSignal.timeout(6000)});if(!response.ok)throw new Error('storage unavailable');const data=await response.json();if(data.error)throw new Error('storage command failed');return data.result;}
 async transaction(work){
  for(let attempt=0;attempt<6;attempt++){
   const reads=new Map(),writes=new Map();
   const read=async key=>{if(!reads.has(key))reads.set(key,await this.command(['GET',`pma:v1:${key}`]));return reads.get(key);};
   const tx={get:async key=>{if(writes.has(key))return writes.get(key).value;const raw=await read(key);return raw?JSON.parse(raw):null;},set:async(key,value,ttl=0)=>{await read(key);writes.set(key,{value,ttl});},delete:async key=>{await read(key);writes.set(key,{value:null,ttl:1});}};
   const result=await work(tx);if(!writes.size)return result;
   const keys=[...reads.keys()],args=keys.flatMap(key=>{const write=writes.get(key);return [reads.get(key)||'',!write?'__NO_WRITE__':write.value===null?'__DELETE__':JSON.stringify(write.value),String(write?.ttl??0)];});
   if(await this.command(['EVAL',commitScript,keys.length,...keys.map(key=>`pma:v1:${key}`),...args]))return result;
  }
  throw new Error('busy');
 }
}

