import { randomBytes, randomUUID, createHash, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { characters, starters, elos } from '../src/data.js';
const scrypt=promisify(scryptCallback),hash=value=>createHash('sha256').update(value).digest('hex');
const cleanHandle=value=>String(value||'').trim().normalize('NFKC');
const key=(kind,value)=>`account:${kind}:${hash(value)}`;
const starterProfile=()=>({version:1,ownedIds:starters.map(c=>c.id),team:starters.map(c=>c.id),completedElos:[],xp:0,fragments:0,run:null,unlockedAvatars:['soul',...starters.map(c=>c.id)],avatarId:'soul',bio:''});
const profileFields=['version','ownedIds','team','completedElos','xp','fragments','run','unlockedAvatars','avatarId','bio','tutorialComplete','eloProgress','campaignVersion','globalUpgrades','pendingGlobalReward','completionNotice'];
function cleanProfile(input,current={}){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Object.assign(Error('Progresso inválido.'),{status:400});
 let serialized;try{serialized=JSON.stringify(input);}catch{throw Object.assign(Error('Progresso inválido.'),{status:400});}
 if(serialized.length>120000)throw Object.assign(Error('Progresso muito grande.'),{status:413});
 const out=Object.fromEntries(profileFields.filter(field=>input[field]!==undefined).map(field=>[field,input[field]]));
 const knownIds=new Set(characters.map(c=>c.id)),knownElos=new Set(elos.map(e=>e.id));
 out.ownedIds=[...new Set([...starters.map(c=>c.id),...(Array.isArray(input.ownedIds)?input.ownedIds.filter(id=>typeof id==='string'&&knownIds.has(id)):current.ownedIds||[])])].slice(0,characters.length);
 const owned=new Set(out.ownedIds),requestedTeam=Array.isArray(input.team)?[...new Set(input.team.filter(id=>typeof id==='string'&&owned.has(id)))].slice(0,3):[];
 const previousTeam=Array.isArray(current.team)?current.team.filter(id=>owned.has(id)).slice(0,3):[];
 out.team=requestedTeam.length===3?requestedTeam:previousTeam.length===3?previousTeam:starters.map(c=>c.id);
 out.completedElos=[...new Set((Array.isArray(input.completedElos)?input.completedElos:current.completedElos||[]).filter(id=>typeof id==='string'&&knownElos.has(id)))];
 out.xp=clampCounter(input.xp??current.xp);out.fragments=clampCounter(input.fragments??current.fragments);
 out.bio=String(input.bio??current.bio??'').trim().slice(0,160);out.tutorialComplete=Boolean(input.tutorialComplete??current.tutorialComplete);
 out.unlockedAvatars=['soul',...out.ownedIds];if(!out.unlockedAvatars.includes(input.avatarId??current.avatarId))out.avatarId='soul';else out.avatarId=input.avatarId??current.avatarId;
 out.eloProgress=input.eloProgress&&typeof input.eloProgress==='object'&&!Array.isArray(input.eloProgress)?Object.fromEntries(Object.entries(input.eloProgress).filter(([id,value])=>knownElos.has(id)&&value&&typeof value==='object'&&!Array.isArray(value))):current.eloProgress||{};
 out.globalUpgrades=Array.isArray(input.globalUpgrades)?input.globalUpgrades.slice(0,100):current.globalUpgrades||[];
 out.run=input.run===null||input.run&&typeof input.run==='object'&&!Array.isArray(input.run)?input.run:current.run??null;
 for(const field of ['campaignVersion','pendingGlobalReward','completionNotice','version'])if(input[field]===undefined&&current[field]!==undefined)out[field]=current[field];
 return out;
}
function clampCounter(value){const n=Number(value);return Number.isFinite(n)?Math.min(1000000000,Math.max(0,Math.trunc(n))):0;}
const publicUser=account=>({id:account.id,handle:account.handle,avatarId:account.avatarId||'soul',bio:account.bio||'',createdAt:account.createdAt});
export class AccountService{
 constructor(store,{now=Date.now}={}){this.store=store;this.now=now;}
 async limitAuth(source,identifier=''){
  const bucket=Math.floor(this.now()/60000),scopes=[{name:'source',value:String(source||'unknown').slice(0,200),limit:12}];
  const normalized=String(identifier||'').trim().normalize('NFKC').toLowerCase();if(normalized)scopes.push({name:'identity',value:normalized,limit:8});
  const keys=scopes.map(scope=>`account:auth-rate:${scope.name}:${hash(scope.value)}:${bucket}`);
  await this.store.transaction(async tx=>{const counts=[];for(let i=0;i<keys.length;i++){const count=(await tx.get(keys[i])||0)+1;if(count>scopes[i].limit)throw Object.assign(Error('Muitas tentativas. Aguarde um minuto.'),{status:429});counts.push(count);}for(let i=0;i<keys.length;i++)await tx.set(keys[i],counts[i],120);});
 }
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
  const result=await this.store.transaction(async tx=>{const id=await tx.get(key('email',email));return id?tx.get(`account:id:${id}`):null;});
  const candidate=Buffer.from(await scrypt(password,result?.salt||'pma-login-dummy-salt',64)),stored=result?Buffer.from(result.passwordHash,'hex'):Buffer.alloc(64);
  const valid=candidate.length===stored.length&&timingSafeEqual(candidate,stored);
  if(!result||!valid)throw Object.assign(Error('E-mail ou senha inválidos.'),{status:401});const session=randomBytes(32).toString('hex');result.sessionHash=hash(session);
  await this.store.transaction(async tx=>{await tx.set(`account:id:${result.id}`,result);await tx.set(key('session',session),result.id,60*60*24*30);});
  return {session,arenaToken:result.arenaToken,user:publicUser(result),profile:result.profile};
 }
 async current(session){if(!/^[a-f0-9]{64}$/.test(session||''))return null;return this.store.transaction(async tx=>{const id=await tx.get(key('session',session));if(!id)return null;const account=await tx.get(`account:id:${id}`);return account?.sessionHash===hash(session)?{user:publicUser(account),profile:account.profile}:null;});}
 async update(session,{profile,handle,avatarId,bio}){
  if(!/^[a-f0-9]{64}$/.test(session||''))throw Object.assign(Error('Entre novamente para salvar.'),{status:401});
  return this.store.transaction(async tx=>{const id=await tx.get(key('session',session)),account=id?await tx.get(`account:id:${id}`):null;if(!account||account.sessionHash!==hash(session))throw Object.assign(Error('Entre novamente para salvar.'),{status:401});
   if(profile)account.profile=cleanProfile(profile,account.profile);
   if(handle!==undefined){handle=cleanHandle(handle);if(!/^[\p{L}\p{N}_]{3,20}$/u.test(handle))throw Object.assign(Error('O nick deve ter de 3 a 20 letras, números ou _.'),{status:400});const owner=await tx.get(key('handle',handle.toLowerCase()));if(owner&&owner!==id)throw Object.assign(Error('Esse nick já está em uso.'),{status:409});if(handle.toLowerCase()!==account.handle.toLowerCase()){await tx.delete(key('handle',account.handle.toLowerCase()));await tx.set(key('handle',handle.toLowerCase()),id);}account.handle=handle;}
   if(avatarId!==undefined){const unlocked=account.profile?.unlockedAvatars||starterProfile().unlockedAvatars;if(!unlocked.includes(avatarId))throw Object.assign(Error('Esse retrato ainda não foi desbloqueado.'),{status:403});account.avatarId=avatarId;}
   if(bio!==undefined)account.bio=String(bio).trim().slice(0,160);
   await tx.set(`account:id:${id}`,account);return {user:publicUser(account),profile:account.profile};
  });
 }
 async logout(session){if(session)await this.store.transaction(tx=>tx.delete(key('session',session)));}
}
