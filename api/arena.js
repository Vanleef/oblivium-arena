import { ArenaService } from '../server/arena-service.js';
import { AccountService } from '../server/account-service.js';
import {createStore,storageConfigured} from '../server/store-factory.js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('X-Content-Type-Options','nosniff');
 const send=(code,value)=>res.status(code).json(value);
 const configured=storageConfigured();
 if(req.method==='GET')return send(200,{configured,mode:'ranked',message:configured?'Arena disponível':'Online aguarda conexão do banco.'});
 if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return send(405,{error:'Método indisponível.'});}
 if(!configured)return send(503,{error:'Online aguarda conexão do banco.',code:'DATABASE_NOT_CONFIGURED'});
 const origin=req.headers.origin;let originHost;try{originHost=origin?new URL(origin).host:null;}catch{return send(403,{error:'Origem inválida.'});}
 if(!originHost||originHost!==req.headers.host)return send(403,{error:'Origem inválida.'});
 if(!req.headers['content-type']?.startsWith('application/json'))return send(415,{error:'Formato inválido.'});
 try{
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body;if(!body||JSON.stringify(body).length>16000)return send(413,{error:'Pedido muito grande.'});
  const allowed=['profile','queue','cancel','turn','influence','surrender','ack'];if(!allowed.includes(body.op||'profile'))return send(400,{error:'Operação indisponível.'});
  const cookies=req.headers.cookie||'',token=cookies.match(/(?:^|;\s*)pma_arena=([a-f0-9]{64})(?:;|$)/)?.[1],session=cookies.match(/(?:^|;\s*)pma_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  const store=createStore(),account=session?await new AccountService(store).current(session):null;
  if(['queue','turn','influence','surrender'].includes(body.op)&&!account)return send(401,{error:'Entre na sua conta para acessar a Arena.',code:'LOGIN_REQUIRED'});
  const service=new ArenaService(store);const result=await service.request(token,body,account?.user);
  res.setHeader('Set-Cookie',`pma_arena=${result.token}; Path=/api/arena; HttpOnly; Secure; SameSite=Strict; Max-Age=31536000`);delete result.token;return send(200,result);
 }catch(error){return send(error.status||503,{error:error.status?error.message:'Arena indisponível. Tente novamente.',code:error.status?'INVALID_REQUEST':'SERVICE_UNAVAILABLE'});}
}

