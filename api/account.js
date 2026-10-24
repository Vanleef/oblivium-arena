import { AccountService } from '../server/account-service.js';
import {createStore,storageConfigured} from '../server/store-factory.js';
const cookie=(name,value,maxAge,path='/api')=>`${name}=${value}; Path=${path}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('X-Content-Type-Options','nosniff');
 const send=(code,value)=>res.status(code).json(value),configured=storageConfigured();
 if(!configured)return send(503,{error:'Cadastro e progresso aguardam conexão do banco.',code:'DATABASE_NOT_CONFIGURED'});
 const service=new AccountService(createStore());
 const session=(req.headers.cookie||'').match(/(?:^|;\s*)pma_session=([a-f0-9]{64})(?:;|$)/)?.[1];
 if(req.method==='GET'){try{const health=req.query?.health==='1'||new URL(req.url||'/api/account','http://localhost').searchParams.get('health')==='1';if(health){await service.store.transaction(tx=>tx.get('__healthcheck'));return send(200,{configured:true,storage:'ready'});}return send(200,{configured:true,...(await service.current(session)||{})});}catch{return send(503,{configured:true,error:'Conta indisponível.'});}}
 if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return send(405,{error:'Método indisponível.'});}
 const origin=req.headers.origin;let host;try{host=origin?new URL(origin).host:null;}catch{return send(403,{error:'Origem inválida.'});}
 if(!host||host!==req.headers.host)return send(403,{error:'Origem inválida.'});if(!req.headers['content-type']?.startsWith('application/json'))return send(415,{error:'Formato inválido.'});
 try{
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body;if(!body||JSON.stringify(body).length>130000)return send(413,{error:'Pedido muito grande.'});
  if(body.op==='register'||body.op==='login'){
   await service.limitAuth(req.headers['x-forwarded-for']||req.headers['x-real-ip']||'local');
   const result=body.op==='register'?await service.register(body):await service.login(body);
   res.setHeader('Set-Cookie',[cookie('pma_session',result.session,2592000),cookie('pma_arena',result.arenaToken,2592000,'/api/arena')]);return send(200,{user:result.user,profile:result.profile});
  }
  if(body.op==='logout'){await service.logout(session);res.setHeader('Set-Cookie',[cookie('pma_session','',0),cookie('pma_arena','',0,'/api/arena')]);return send(200,{ok:true});}
  if(body.op==='save')return send(200,await service.update(session,body));
  return send(400,{error:'Operação indisponível.'});
 }catch(error){return send(error.status||503,{error:error.status?error.message:'Conta indisponível. Tente novamente.',code:error.status?'INVALID_REQUEST':'SERVICE_UNAVAILABLE'});}
}
