import test from 'node:test';
import assert from 'node:assert/strict';
import { AccountService } from '../server/account-service.js';
import { CampaignService } from '../server/campaign-service.js';
import { createBattle, getCombatPlan } from '../src/combat.js';

class MemoryStore {
 constructor(){this.values=new Map();}
 async transaction(work){
  const reads=new Map(),writes=new Map();
  const tx={
   get:async key=>{if(writes.has(key))return structuredClone(writes.get(key));if(!reads.has(key))reads.set(key,this.values.has(key)?structuredClone(this.values.get(key)):null);return structuredClone(reads.get(key));},
   set:async(key,value)=>{if(!reads.has(key))reads.set(key,this.values.has(key)?structuredClone(this.values.get(key)):null);writes.set(key,structuredClone(value));},
   delete:async key=>{if(!reads.has(key))reads.set(key,this.values.has(key)?structuredClone(this.values.get(key)):null);writes.set(key,null);}
  };
  const result=await work(tx);for(const [key,value]of writes)value===null?this.values.delete(key):this.values.set(key,value);return result;
 }
}

async function fixture(){
 const accounts=new AccountService(new MemoryStore()),created=await accounts.register({email:'campaign@example.test',handle:'Guardiao',password:'correntes-longas-2026'});
 return {accounts,campaign:new CampaignService(accounts),session:created.session};
}

test('servidor cria trilhas com semente própria e controla progressão e recompensas',async()=>{
 const {accounts,campaign,session}=await fixture();
 const started=await campaign.request(session,{op:'start',eloId:'oblivio',variantId:'hunt',difficulty:0});
 assert.equal(started.profile.run.serverOwned,true);assert.ok(Number.isInteger(started.profile.run.seed));assert.equal(started.profile.xp,0);
 const before=started.profile.run.seed;
 await accounts.update(session,{profile:{...started.profile,run:null,seed:1,ownedIds:[...started.profile.ownedIds,'o-fim'],completedElos:['sangria'],xp:1000000,fragments:1000000}});
 let saved=(await accounts.current(session)).profile;
 assert.equal(saved.run.seed,before);assert.equal(saved.ownedIds.includes('o-fim'),false);assert.deepEqual(saved.completedElos,[]);assert.equal(saved.xp,0);assert.equal(saved.fragments,0);
 await assert.rejects(campaign.request(session,{op:'select-node',nodeId:'forged-node'}),{status:400});
});

test('marca de trilha enviada no perfil não substitui a autorização privada da conta',async()=>{
 const {accounts,campaign,session}=await fixture();
 await accounts.mutateAccount(session,account=>{account.profile.run={serverOwned:true,serverRunId:'forged',eloId:'oblivio',map:[],team:[],availableNodeIds:[]};});
 const synced=await campaign.request(session,{op:'sync'});
 assert.equal(synced.profile.run,null);
 await assert.rejects(campaign.request(session,{op:'turn',actions:[],payment:{}}),{status:400});
});

test('combates de campanha usam o estado persistido no servidor e impedem vitória ou custo falso',async()=>{
 const {accounts,campaign,session}=await fixture();
 const started=await campaign.request(session,{op:'start',eloId:'oblivio',variantId:'hunt',difficulty:0});
 const node=started.profile.run.map[0][0];
 const encounter=await campaign.request(session,{op:'select-node',nodeId:node.id});
 assert.equal(encounter.battle.phase,'influence');assert.ok(encounter.battle.influenceDraft.options.length);
 await assert.rejects(campaign.request(session,{op:'settle'}),{status:409});
 const influence=await campaign.request(session,{op:'influence',eventId:encounter.battle.influenceDraft.options[0]});
 assert.equal(influence.battle.phase,'player');
 const forged={...influence.profile.run,battle:{...influence.battle,phase:'victory'}};
 await accounts.update(session,{profile:{...influence.profile,run:forged,xp:999999,completedElos:['sangria']}});
 const current=await accounts.current(session),stored=current.profile;
 assert.equal(current.battle.phase,'player');assert.equal(stored.xp,0);assert.deepEqual(stored.completedElos,[]);
 await assert.rejects(campaign.request(session,{op:'turn',round:influence.battle.round,actions:[{actorId:'a-brasa-eterna',abilityId:'missing',targetId:'oponente-0-0'}],payment:{}}),{status:400});
 await assert.rejects(campaign.request(session,{op:'settle'}),{status:409});
});

test('servidor valida custo Coringa e a identidade da forma antes de consumir o turno',async()=>{
 const {campaign,session}=await fixture();
 const started=await campaign.request(session,{op:'start',eloId:'oblivio',variantId:'hunt',difficulty:0}),node=started.profile.run.map[0][0];
 let battle=(await campaign.request(session,{op:'select-node',nodeId:node.id})).battle;
 await campaign.request(session,{op:'influence',eventId:battle.influenceDraft.options[0]});
 const state=(await accountsCurrent(campaign,session));battle=state.battle;
 const actor=battle.allies.find(unit=>unit.hp>0),ability=actor.abilities.find(item=>item.costs?.random>0);
 if(!ability)return;
 const target=ability.target==='self'?actor:battle.enemies.find(unit=>unit.hp>0);
 await assert.rejects(campaign.request(session,{op:'turn',round:battle.round,actions:[{actorId:actor.id,abilityId:ability.id,targetId:target.id}],payment:{essence:999}}),{status:400});
 const refreshed=await accountsCurrent(campaign,session);assert.equal(refreshed.battle.phase,'player');
});

test('campanha valida e aplica a troca 5:1 no estado autoritativo antes do turno',async()=>{
 const {accounts,campaign,session}=await fixture();
 const started=await campaign.request(session,{op:'start',eloId:'oblivio',variantId:'hunt',difficulty:0}),node=started.profile.run.map[0][0];
 let battle=(await campaign.request(session,{op:'select-node',nodeId:node.id})).battle;
 await campaign.request(session,{op:'influence',eventId:battle.influenceDraft.options[0]});
 await accounts.mutateAccount(session,account=>{account.profile.run.battle.resources={essence:2,cinza:1,graca:1,ruptura:1};});
 battle=(await accountsCurrent(campaign,session)).battle;
 const exchange={target:'ruptura',payment:{essence:2,cinza:1,graca:1,ruptura:1}},turn={op:'turn',round:battle.round,actions:[],payment:{},exchanges:[exchange]};
 await assert.rejects(campaign.request(session,{...turn,exchanges:[{...exchange,payment:{essence:2,cinza:1,graca:1,ruptura:0}}]}),{status:400});
 assert.deepEqual((await accountsCurrent(campaign,session)).battle.resources,{essence:2,cinza:1,graca:1,ruptura:1});
 const result=await campaign.request(session,turn);assert.ok(result.battle.log.some(line=>line.includes('5 Essências foram trocadas por 1 Ruptura')));
});

test('turnos e sorteios continuam no servidor após serializar o combate entre requisições',async()=>{
 const {campaign,session}=await fixture();
 const started=await campaign.request(session,{op:'start',eloId:'oblivio',variantId:'hunt',difficulty:0}),node=started.profile.run.map[0][0];
 let battle=(await campaign.request(session,{op:'select-node',nodeId:node.id})).battle;
 await campaign.request(session,{op:'influence',eventId:battle.influenceDraft.options[0]});
 const staleRound=battle.round;
 let result=await campaign.request(session,{op:'turn',round:staleRound,actions:[],payment:{essence:0,cinza:0,graca:0,ruptura:0}});
 assert.ok(result.events.length>0);assert.equal(result.battle.phase,'player');assert.equal(result.battle.round,staleRound+1);
 const nextRound=result.battle.round;
 await assert.rejects(campaign.request(session,{op:'turn',round:staleRound,actions:[],payment:{essence:0,cinza:0,graca:0,ruptura:0}}),{status:409});
 assert.equal((await accountsCurrent(campaign,session)).battle.round,nextRound);
 result=await campaign.request(session,{op:'turn',round:nextRound,actions:[],payment:{essence:0,cinza:0,graca:0,ruptura:0}});
 assert.ok(['player','influence','victory','defeat'].includes(result.battle.phase));
});

async function accountsCurrent(campaign,session){
 const result=await campaign.accounts.current(session);return {profile:result.profile,battle:result.battle||null};
}

test('reconectar à campanha antiga restaura IDs dos kits ampliados',async()=>{
 const {accounts,campaign,session}=await fixture();
 const started=await campaign.request(session,{op:'start',eloId:'oblivio',variantId:'hunt',difficulty:0});
 const id='nilo-ruptura-prefacio';
 const battle=createBattle([id],[{id:'dummy',name:'Alvo',realm:'Inferno',maxHp:1000,abilities:[]}]);
 for(const list of [battle.allies[0].skillBook,battle.allies[0].abilities]){list[3].id='despertar';if(list[3]._formRoot)list[3]._formRoot.id='despertar';}
 await accounts.mutateAccount(session,account=>{account.profile.run.battle=JSON.parse(JSON.stringify(battle));});
 const restored=await accounts.current(session);
 assert.equal(restored.battle.allies[0].abilities[3].id,'tecnica-4');
 assert.equal(restored.battle.allies[0].abilities.at(-1).id,'despertar');
 const synced=await campaign.request(session,{op:'sync'});
 assert.equal(synced.battle.allies[0].abilities[3].id,'tecnica-4');
 assert.equal((await accounts.current(session)).battle.allies[0].abilities.at(-1).id,'despertar');
 assert.equal(synced.profile.run.seed,started.profile.run.seed);
});

test('uma expedição chega ao chefe, concede recompensas e persiste a conclusão',async()=>{
 const {accounts,session}=await fixture();let now=1000000;
 const campaign=new CampaignService(accounts,{now:()=>now});
 const call=async(body)=>{now+=1000;return campaign.request(session,body);};
 // Fixture de progresso avançado acelera o percurso; não avalia balanceamento.
 await accounts.mutateAccount(session,account=>{account.profile.globalUpgrades=[{id:'fixture',effect:{maxHp:300,physicalPower:100,spiritualPower:100,piercingPower:100,essence:5,cinza:5,graca:5,ruptura:5}}];});
 let result=await call({op:'start',eloId:'oblivio',variantId:'hunt',difficulty:0}),steps=0;
 while(result.profile.run&&steps++<150){
  const run=result.profile.run,battle=result.battle;
  if(battle){
   if(battle.phase==='influence')result=await call({op:'influence',eventId:battle.influenceDraft.options[0]});
   else if(battle.phase==='player'){
    const plan=getCombatPlan(battle,'player'),actions=plan.filter(item=>item.actorId).map(({actorId,abilityId,targetId})=>({actorId,abilityId,targetId})),exchanges=plan.filter(item=>item.type==='essence-exchange').map(({target,payment})=>({target,payment}));
    result=await call({op:'turn',round:battle.round,actions,exchanges});
   }else if(['victory','defeat'].includes(battle.phase))result=await call({op:'settle'});
   else assert.fail(`fase inesperada: ${battle.phase}`);
  }else if(run.pending){
   const pending=run.pending;
   if(['reward','upgrade'].includes(pending.type))result=await call({op:'buff',buffId:pending.choices[0].id});
   else if(pending.type==='event')result=await call({op:'event',choice:'repair'});
   else if(pending.type==='shop')result=await call({op:'shop',action:'leave'});
   else assert.fail(`escolha inesperada: ${pending.type}`);
  }else result=await call({op:'select-node',nodeId:run.availableNodeIds[0]});
 }
 assert.ok(steps<150,'a expedição deve chegar ao fim');
 assert.equal(result.profile.run,null);assert.ok(result.profile.completedElos.includes('oblivio'));
 assert.ok(result.profile.xp>0);assert.ok(result.profile.eloProgress.oblivio.wins>0);
 const saved=await accounts.current(session);assert.ok(saved.profile.completedElos.includes('oblivio'));assert.equal(saved.profile.xp,result.profile.xp);
});
