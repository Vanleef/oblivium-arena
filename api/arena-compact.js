import {CompactArenaService} from '../server/compact-arena-service.js';
import {AccountService} from '../server/account-service.js';
import {createStore,storageConfigured} from '../server/store-factory.js';

export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 res.setHeader('Content-Type','application/json; charset=utf-8');
 res.setHeader('X-Content-Type-Options','nosniff');
 const send=(code,value)=>res.status(code).json(value);
 const configured=storageConfigured();
 if(req.method==='GET')return send(200,{configured,mode:'compact-6x6',message:configured?'Arena compacta disponível':'Online aguarda conexão do banco.'});
 if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return send(405,{error:'Método indisponível.'});}
 if(!configured)return send(503,{error:'Online aguarda conexão do banco.',code:'DATABASE_NOT_CONFIGURED'});
 let parsedOrigin;
 try{parsedOrigin=req.headers.origin?new URL(req.headers.origin):null;}catch{return send(403,{error:'Origem inválida.'});}
 const protocol=req.headers['x-forwarded-proto']?.split(',')[0]?.trim()||(req.headers.host?.startsWith('localhost')?'http':'https');
 if(!parsedOrigin||parsedOrigin.host!==req.headers.host||parsedOrigin.protocol!==protocol+':')return send(403,{error:'Origem inválida.'});
 if(!req.headers['content-type']?.startsWith('application/json'))return send(415,{error:'Formato inválido.'});
 let body;
 try{body=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch{return send(400,{error:'Pedido inválido.'});}
 if(!body||typeof body!=='object'||Array.isArray(body))return send(400,{error:'Pedido inválido.'});
 if(JSON.stringify(body).length>20000)return send(413,{error:'Pedido muito grande.'});
 const allowed=['profile','queue','cancel','turn','response','reward','surrender','ack'];
 if(!allowed.includes(body.op||'profile'))return send(400,{error:'Operação indisponível.'});
 const cookies=req.headers.cookie||'';
 const token=cookies.match(/(?:^|;\s*)pma_compact_arena=([a-f0-9]{64})(?:;|$)/)?.[1];
 const session=cookies.match(/(?:^|;\s*)pma_session=([a-f0-9]{64})(?:;|$)/)?.[1];
 try{
  const store=createStore();
  const account=session?await new AccountService(store).current(session):null;
  if(!account)return send(401,{error:'Entre na sua conta para acessar a Arena.',code:'LOGIN_REQUIRED'});
  if(body.op==='queue'&&(!Array.isArray(body.team)||body.team.some(id=>!account.profile?.ownedIds?.includes(id))))
   return send(403,{error:'Sua formação contém almas ainda não recrutadas.',code:'CHARACTER_LOCKED'});
  const response=await new CompactArenaService(store).request(token,body,account.user);
  res.setHeader('Set-Cookie','pma_compact_arena='+response.token+'; Path=/api/arena-compact; HttpOnly; Secure; SameSite=Strict; Max-Age=31536000');
  delete response.token;
  return send(200,response);
 }catch(error){
  return send(error.status||503,{error:error.status?error.message:'Arena compacta indisponível. Tente novamente.',code:error.status?'INVALID_REQUEST':'SERVICE_UNAVAILABLE'});
 }
}
