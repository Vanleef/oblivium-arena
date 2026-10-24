import test from 'node:test';
import assert from 'node:assert/strict';
import {AccountService} from '../server/account-service.js';

class MemoryStore{
 constructor(){this.values=new Map();}
 async transaction(work){const reads=new Map(),writes=new Map(),tx={get:async key=>{if(writes.has(key))return writes.get(key);if(!reads.has(key))reads.set(key,this.values.has(key)?structuredClone(this.values.get(key)):null);return structuredClone(reads.get(key));},set:async(key,value)=>{if(!reads.has(key))reads.set(key,this.values.has(key)?structuredClone(this.values.get(key)):null);writes.set(key,structuredClone(value));},delete:async key=>{if(!reads.has(key))reads.set(key,this.values.has(key)?structuredClone(this.values.get(key)):null);writes.set(key,null);}};const result=await work(tx);for(const [key,value]of writes)value===null?this.values.delete(key):this.values.set(key,value);return result;}
}

test('cadastro, login, nick exclusivo, retratos liberados e salvamento de perfil usam conta persistente',async()=>{
 let now=100;const service=new AccountService(new MemoryStore(),{now:()=>now});
 const first=await service.register({email:'alma@example.test',handle:'Andarilho',password:'correntes-longas-2026'});
 assert.equal(first.user.handle,'Andarilho');assert.ok(first.profile.team.length===3);assert.equal((await service.current(first.session)).user.id,first.user.id);
 await assert.rejects(service.register({email:'outro@example.test',handle:'andarilho',password:'correntes-longas-2026'}),/dados/);
 await assert.rejects(service.login({email:'alma@example.test',password:'incorreta'}),/inválidos/);
 const login=await service.login({email:'ALMA@example.test',password:'correntes-longas-2026'});assert.equal(login.user.id,first.user.id);assert.notEqual(login.session,first.session);assert.equal(await service.current(first.session),null);
 await assert.rejects(service.update(login.session,{avatarId:'o-fim'}),/não foi desbloqueado/);
 const saved=await service.update(login.session,{handle:'Andarilho_1',avatarId:'o-escudo-vivo',bio:'No limiar.',profile:{...login.profile,xp:400,completedElos:['sangria'],ownedIds:['o-escudo-vivo','a-brasa-eterna','o-passo-interrompido','o-restaurador'],unlockedAvatars:['soul','o-escudo-vivo','a-brasa-eterna','o-passo-interrompido','o-restaurador']}});
 assert.equal(saved.profile.xp,0);assert.deepEqual(saved.profile.completedElos,[]);assert.equal(saved.user.handle,'Andarilho_1');assert.equal(saved.user.avatarId,'o-escudo-vivo');assert.equal(saved.user.bio,'No limiar.');
 assert.deepEqual((await service.current(login.session)).profile.completedElos,[]);await service.logout(login.session);assert.equal(await service.current(login.session),null);now++;
});

test('cadastro valida o email, nick e comprimento mínimo da senha',async()=>{
 const service=new AccountService(new MemoryStore());
 await assert.rejects(service.register({email:'not-email',handle:'Alma',password:'correntes-longas'}),/e-mail/);
 await assert.rejects(service.register({email:'alma@example.test',handle:'x',password:'correntes-longas'}),/nick/);
 await assert.rejects(service.register({email:'alma@example.test',handle:'Alma',password:'curta'}),/10 a 256/);
});

test('limite de autenticação combina origem e identidade e normaliza nicks Unicode',async()=>{
 const service=new AccountService(new MemoryStore(),{now:()=>120000});
 for(let i=0;i<8;i++)await service.limitAuth(`ip-${i}`,'Pessoa@example.test');
 await assert.rejects(service.limitAuth('ip-nova','pessoa@example.test'),{status:429});
 const registered=await service.register({email:'nome@example.test',handle:'Ａlma',password:'correntes-longas-2026'});
 assert.equal(registered.user.handle,'Alma');
 await assert.rejects(service.register({email:'outro@example.test',handle:'Alma',password:'correntes-longas-2026'}),{status:409});
});

test('salvamento de perfil ignora progresso enviado pelo cliente e deriva retratos da coleção do servidor',async()=>{
 const service=new AccountService(new MemoryStore()),created=await service.register({email:'progresso@example.test',handle:'Guardiao',password:'correntes-longas-2026'});
 const result=await service.update(created.session,{profile:{...created.profile,ownedIds:[...created.profile.ownedIds,'personagem-inexistente'],completedElos:['sangria','elo-falso'],xp:99999999999,fragments:-15,unlockedAvatars:['o-fim'],avatarId:'o-fim'}});
 assert.equal(result.profile.ownedIds.includes('personagem-inexistente'),false);assert.deepEqual(result.profile.completedElos,[]);assert.equal(result.profile.xp,0);assert.equal(result.profile.fragments,0);assert.deepEqual(result.profile.unlockedAvatars,['soul',...created.profile.ownedIds]);assert.equal(result.profile.avatarId,'soul');
});
