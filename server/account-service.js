import { randomBytes, randomUUID, createHash, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { characters, starters } from '../src/data.js';
const scrypt=promisify(scryptCallback),hash=value=>createHash('sha256').update(value).digest('hex');
const cleanHandle=value=>String(value||'').trim();
const key=(kind,value)=>`account:${kind}:${hash(value)}`;
const starterProfile=()=>({version:1,ownedIds:starters.map(c=>c.id),team:starters.map(c=>c.id),completedElos:[],xp:0,fragments:0,run:null,unlockedAvatars:['soul',...starters.map(c=>c.id)],avatarId:'soul',bio:''});
const publicUser=account=>({id:account.id,handle:account.handle,avatarId:account.avatarId||'soul',bio:account.bio||'',createdAt:account.createdAt});
export class AccountService{
 constructor(store,{now=Date.now}={}){this.store=store;this.now=now;}
 async limitAuth(source){const bucket=Math.floor(this.now()/60000),rateKey=`account:auth-rate:${hash(String(source||'unknown').slice(0,200))}:${bucket}`;await this.store.transaction(async tx=>{const count=(await tx.get(rateKey)||0)+1;if(count>12)throw Object.assign(Error('Muitas tentativas. Aguarde um minuto.'),{status:429});await tx.set(rateKey,count,120);});}
 async register({email,handle,password}){
  email=String(email||'').trim().toLowerCase();handle=cleanHandle(handle);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw Object.assign(Error('Informe um e-mail válido.'),{status:400});
  if(!/^[\p{L}\p{N}_]{3,20}$/u.test(handle))throw Object.assign(Error('O nick deve ter de 3 a 20 letras, números ou _.'),{status:400});
  if(typeof password!=='string'||password.length<10||password.length>256)throw Object.assign(Error('Use uma senha de 10 a 256 caracteres.'),{status:400});
  const salt=randomBytes(16).toString('hex'),passwordHash=(await scrypt(password,salt,64)).toString('hex'),id=randomUUID(),session=randomBytes(32).toString('hex');
  const account={id,email,handle,salt,passwordHash,sessionHash:hash(session),arenaToken:randomBytes(32).toString('hex'),createdAt:this.now(),profile:starterProfile(),avatarId:'soul',bio:''};
  await this.store.transaction(async tx=>{if(await tx.get(key('email',email)))throw Object.assign(Error('Não foi possível criar a conta com esses dados.'),{status:409});if(await tx.get(key('handle',handle.toLowerCase())))throw Object.assign(Error('Não foi possível criar a conta com esses dados.'),{status:409});await tx.set(key('email',email),id);await tx.set(key('handle',handle.toLowerCase()),id);await tx.set(`account:id:${id}`,account);await tx.set(key('session',session),id,60*60*24*30);});
  return {session,arenaToken:account.arenaToken,user:publicUser(account),profile:account.profile};
 }
 async login({email,password}){
  email=String(email||'').trim().toLowerCase();if(typeof password!=='string'||password.length>256)throw Object.assign(Error('E-mail ou senha inválidos.'),{status:401});
  const result=await this.store.transaction(async tx=>{const id=await tx.get(key('email',email)),account=id?await tx.get(`account:id:${id}`):null;if(!account)return null;const candidate=Buffer.from(await scrypt(password,account.salt,64)),stored=Buffer.from(account.passwordHash,'hex');if(candidate.length!==stored.length||!timingSafeEqual(candidate,stored))return null;return account;});
  if(!result)throw Object.assign(Error('E-mail ou senha inválidos.'),{status:401});const session=randomBytes(32).toString('hex');result.sessionHash=hash(session);
  await this.store.transaction(async tx=>{await tx.set(`account:id:${result.id}`,result);await tx.set(key('session',session),result.id,60*60*24*30);});
  return {session,arenaToken:result.arenaToken,user:publicUser(result),profile:result.profile};
 }
 async current(session){if(!/^[a-f0-9]{64}$/.test(session||''))return null;return this.store.transaction(async tx=>{const id=await tx.get(key('session',session));if(!id)return null;const account=await tx.get(`account:id:${id}`);return account?.sessionHash===hash(session)?{user:publicUser(account),profile:account.profile}:null;});}
 async update(session,{profile,handle,avatarId,bio}){
  if(!/^[a-f0-9]{64}$/.test(session||''))throw Object.assign(Error('Entre novamente para salvar.'),{status:401});
  return this.store.transaction(async tx=>{const id=await tx.get(key('session',session)),account=id?await tx.get(`account:id:${id}`):null;if(!account||account.sessionHash!==hash(session))throw Object.assign(Error('Entre novamente para salvar.'),{status:401});
   if(profile){if(JSON.stringify(profile).length>120000)throw Object.assign(Error('Progresso muito grande.'),{status:413});account.profile=profile;}
   if(handle!==undefined){handle=cleanHandle(handle);if(!/^[\p{L}\p{N}_]{3,20}$/u.test(handle))throw Object.assign(Error('O nick deve ter de 3 a 20 letras, números ou _.'),{status:400});const owner=await tx.get(key('handle',handle.toLowerCase()));if(owner&&owner!==id)throw Object.assign(Error('Esse nick já está em uso.'),{status:409});if(handle.toLowerCase()!==account.handle.toLowerCase()){await tx.delete(key('handle',account.handle.toLowerCase()));await tx.set(key('handle',handle.toLowerCase()),id);}account.handle=handle;}
   if(avatarId!==undefined){const unlocked=account.profile?.unlockedAvatars||starterProfile().unlockedAvatars;if(!unlocked.includes(avatarId))throw Object.assign(Error('Esse retrato ainda não foi desbloqueado.'),{status:403});account.avatarId=avatarId;}
   if(bio!==undefined)account.bio=String(bio).trim().slice(0,160);
   await tx.set(`account:id:${id}`,account);return {user:publicUser(account),profile:account.profile};
  });
 }
 async logout(session){if(session)await this.store.transaction(tx=>tx.delete(key('session',session)));}
}
