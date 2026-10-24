import test from 'node:test';
import assert from 'node:assert/strict';
import {AccountService} from '../server/account-service.js';

class MemoryStore{
 constructor(){this.values=new Map();}
 async transaction(work){const reads=new Map(),writes=new Map(),tx={get:async key=>{if(writes.has(key))return writes.get(key);if(!reads.has(key))reads.set(key,this.values.has(key)?structuredClone(this.values.get(key)):null);return structuredClone(reads.get(key));},set:async(key,value)=>{if(!reads.has(key))reads.set(key,this.values.has(key)?structuredClone(this.values.get(key)):null);writes.set(key,structuredClone(value));},delete:async key=>{if(!reads.has(key))reads.set(key,this.values.has(key)?structuredClone(this.values.get(key)):null);writes.set(key,null);}};const result=await work(tx);for(const [key,value]of writes)value===null?this.values.delete(key):this.values.set(key,value);return result;}
}

test('cadastro, login, nick exclusivo, retratos liberados e salvamento de campanha usam conta persistente',async()=>{
 let now=100;const service=new AccountService(new MemoryStore(),{now:()=>now});
 const first=await service.register({email:'alma@example.test',handle:'Andarilho',password:'correntes-longas-2026'});
 assert.equal(first.user.handle,'Andarilho');assert.ok(first.profile.team.length===3);assert.equal((await service.current(first.session)).user.id,first.user.id);
 await assert.rejects(service.register({email:'outro@example.test',handle:'andarilho',password:'correntes-longas-2026'}),/dados/);
 await assert.rejects(service.login({email:'alma@example.test',password:'incorreta'}),/inválidos/);
 const login=await service.login({email:'ALMA@example.test',password:'correntes-longas-2026'});assert.equal(login.user.id,first.user.id);assert.notEqual(login.session,first.session);assert.equal(await service.current(first.session),null);
 await assert.rejects(service.update(login.session,{avatarId:'o-fim'}),/não foi desbloqueado/);
 const saved=await service.update(login.session,{handle:'Andarilho_1',avatarId:'o-escudo-vivo',bio:'No limiar.',profile:{...login.profile,xp:400,completedElos:['sangria'],ownedIds:['o-escudo-vivo','a-brasa-eterna','o-passo-interrompido','o-restaurador'],unlockedAvatars:['soul','o-escudo-vivo','a-brasa-eterna','o-passo-interrompido','o-restaurador']}});
 assert.equal(saved.profile.xp,400);assert.equal(saved.user.handle,'Andarilho_1');assert.equal(saved.user.avatarId,'o-escudo-vivo');assert.equal(saved.user.bio,'No limiar.');
 assert.equal((await service.current(login.session)).profile.completedElos[0],'sangria');await service.logout(login.session);assert.equal(await service.current(login.session),null);now++;
});

test('cadastro valida o email, nick e comprimento mínimo da senha',async()=>{
 const service=new AccountService(new MemoryStore());
 await assert.rejects(service.register({email:'not-email',handle:'Alma',password:'correntes-longas'}),/e-mail/);
 await assert.rejects(service.register({email:'alma@example.test',handle:'x',password:'correntes-longas'}),/nick/);
 await assert.rejects(service.register({email:'alma@example.test',handle:'Alma',password:'curta'}),/10 a 256/);
});
