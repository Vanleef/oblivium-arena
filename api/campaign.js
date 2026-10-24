import { AccountService } from '../server/account-service.js';
import { CampaignService } from '../server/campaign-service.js';
import { createStore, storageConfigured } from '../server/store-factory.js';

export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('X-Content-Type-Options','nosniff');
 const send=(code,value)=>res.status(code).json(value);
 if(req.method!=='POST'){res.setHeader('Allow','POST');return send(405,{error:'Método indisponível.'});}
 if(!storageConfigured())return send(503,{error:'Campanha aguarda conexão do banco.',code:'DATABASE_NOT_CONFIGURED'});
 const origin=req.headers.origin;let parsedOrigin;try{parsedOrigin=origin?new URL(origin):null;}catch{return send(403,{error:'Origem inválida.'});}
 const expectedProtocol=req.headers['x-forwarded-proto']?.split(',')[0]?.trim()||(req.headers.host?.startsWith('localhost')?'http':'https');
 if(!parsedOrigin||parsedOrigin.host!==req.headers.host||parsedOrigin.protocol!==`${expectedProtocol}:`)return send(403,{error:'Origem inválida.'});
 if(!req.headers['content-type']?.startsWith('application/json'))return send(415,{error:'Formato inválido.'});
 try{
  let body;try{body=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch{return send(400,{error:'Pedido inválido.'});}
  if(!body||typeof body!=='object'||Array.isArray(body))return send(400,{error:'Pedido inválido.'});
  if(JSON.stringify(body).length>16000)return send(413,{error:'Pedido muito grande.'});
  const session=(req.headers.cookie||'').match(/(?:^|;\s*)pma_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  const accounts=new AccountService(createStore()),campaign=new CampaignService(accounts);
  return send(200,await campaign.request(session,body));
 }catch(error){return send(error.status||503,{error:error.status?error.message:'Campanha indisponível. Tente novamente.',code:error.status?'INVALID_REQUEST':'SERVICE_UNAVAILABLE'});}
}
