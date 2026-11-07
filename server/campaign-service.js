import { randomBytes } from 'node:crypto';
import { elos, characterById, buffs, getElo } from '../src/data.js';
import { affinityForTeam } from '../src/archetypes.js';
import { getRelevantBuffChoices } from '../src/rules.js';
import { beginInfluences, chooseInfluence, persistentCombatHp } from '../src/world-influences.js';
import { applyEssenceExchanges, chooseAction, commitTurn, createBattle, createEnemyTeam, getCombatPlan, resolveNextAction } from '../src/combat.js';
import { advanceTrail, normalizeTrail } from '../src/trail.js';
import { normalizeCampaign, createExpedition, completeExpedition, claimGlobalUpgrade, aggregateGlobal, runMaxHp, recordEncounter, selectBossRoster, maxDifficulty, canChooseNiloPath, resolveNiloPathChoice, syncNiloAbsorption } from '../src/progression.js';

const cloneJson=value=>JSON.parse(JSON.stringify(value));
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const affinityBuff=id=>id==='cinza'?'cinzas':id;
const rewardXp=node=>['boss','mini','elite'].includes(node.type||node.id)?50:25;
const isCombat=node=>['normal','elite','mini','boss'].includes(node.type||node.id);

function restoreBattle(value){
 const battle=cloneJson(value);
 battle.enemyPlanner=getCombatPlan;
 battle.rng=Math.random;
 return battle;
}
function storeBattle(value){return cloneJson(value);}
function runBattleToDecision(battle){
 const events=[];let guard=0;
 while(battle.phase==='resolving'&&guard++<80){
  const result=resolveNextAction(battle);
  if(result.event)events.push(cloneJson(result.event));
  if(battle.phase==='influence'||battle.phase==='victory'||battle.phase==='defeat'||battle.phase==='player')break;
 }
 if(guard>=80&&battle.phase==='resolving')fail('A resolução do combate excedeu o limite.',409);
 return events;
}
function campaignState(profile,extra={}){
 const publicProfile=cloneJson(profile);if(publicProfile.run)delete publicProfile.run.battle;
 return {profile:publicProfile,battle:profile.run?.battle||null,pending:profile.run?.pending||null,...extra};
}
function currentRun(profile,account){
 if(!profile.run||profile.run.serverOwned!==true||!account.campaignRunId||profile.run.serverRunId!==account.campaignRunId)fail('Não há trilha ativa.');
 return profile.run;
}
function currentNode(run){return run.map.flat().find(node=>node.id===run.currentNodeId)||null;}
function healTeam(profile,run,ratio){
 for(const id of run.team){const maxHp=runMaxHp(profile,run,id),hp=run.teamHealth[id]??maxHp;run.teamHealth[id]=Math.min(maxHp,hp+Math.ceil(maxHp*ratio));}
}
function finishNode(profile,run,node,account){
 const progress=advanceTrail(run,node.id);if(!progress.ok)fail('Este caminho já foi resolvido.');
 run.encounter++;run.tried=0;run.pending=null;run.battle=null;
  if(run.stage>=run.map.length){completeExpedition(profile,run);profile.run=null;account.campaignRunId=null;}
 return progress;
}
function setPending(run,type,choices){run.pending={type,...(choices?{choices}: {})};}
function buffChoices(run,offset=0){
 return getRelevantBuffChoices(run.team,run.buffs,(run.seed||1)+run.encounter*991+offset*101);
}
function startBattle(profile,run,node){
 const elo=getElo(run.eloId);if(!elo)fail('Reino inválido.');
 const roster=Object.values(characterById).filter(character=>!character.npcOnly&&(character.kingdomId===elo.id||character.legacyEloId===elo.id||character.eloId===elo.id)).map(character=>character.id),opponents=roster.filter(id=>!(run.team||profile.team).includes(id));
 run.bossIds||=selectBossRoster(run.team||profile.team,opponents.length>=3?opponents:roster,run.seed);
 run.memories||=[];run.memoryNodeIds||=[];
 const nodeType=node.type||node.id,seed=((Number(run.seed)||1)+(Number(run.encounter)||0)*97)>>>0;
 const enemies=createEnemyTeam(elo,run.team,nodeType,run.encounter,{difficulty:run.difficulty||0,bossIds:run.bossIds,campaign:true});
 const battle=createBattle(run.team,enemies,{buffs:run.buffs||[],memories:run.memories||[],teamHealth:run.teamHealth||{},globalEffects:aggregateGlobal(profile),difficulty:run.difficulty||0,rngSeed:seed,campaignRealm:elo.realm,niloAbsorption:run.niloAbsorption});
 beginInfluences(battle,seed);
 run.currentNodeId=node.id;run.battle=storeBattle(battle);
 return campaignState(profile,{battle:run.battle,node});
}
function pickProfile(value){
 if(!value||typeof value!=='object'||Array.isArray(value))fail('Progresso inválido.');
 return normalizeCampaign(value);
}

export class CampaignService{
 constructor(accounts,{now=Date.now}={}){this.accounts=accounts;this.now=now;}
 async request(session,body){
  if(!body||typeof body.op!=='string')fail('Operação inválida.');
  const allowed=new Set(['sync','start','select-node','turn','influence','settle','event','buff','shop','abandon','claim','clear-notice']);
  if(!allowed.has(body.op))fail('Operação indisponível.');
  return this.accounts.mutateAccount(session,async account=>{
   const bucket=Math.floor(this.now()/60000);account.campaignRate||={};
   const count=(account.campaignRate.bucket===bucket?account.campaignRate.count:0)+1;
   if(count>180)fail('Muitas ações seguidas. Aguarde um minuto.',429);
   account.campaignRate={bucket,count};
   const profile=pickProfile(account.profile);account.profile=profile;
   let extra={};
   switch(body.op){
    case 'sync':
     if(profile.run&&(!account.campaignRunId||profile.run.serverRunId!==account.campaignRunId))profile.run=null;
     break;
    case 'start':{
     if(profile.run&&(!account.campaignRunId||profile.run.serverRunId!==account.campaignRunId))profile.run=null;
     if(profile.run)fail('Conclua ou abandone a trilha atual.');
     if(profile.team?.length!==3||new Set(profile.team).size!==3||profile.team.some(id=>!profile.ownedIds.includes(id)))fail('Escolha três almas recrutadas.');
     const elo=elos.find(item=>item.id===body.eloId);if(!elo)fail('Reino inválido.');
     const seed=randomBytes(4).readUInt32BE(0)||1;
     account.campaignRunId=randomBytes(24).toString('hex');
     profile.run=createExpedition(profile,elo,String(body.variantId||'hunt'),body.difficulty===undefined?maxDifficulty(profile,elo.id):Number(body.difficulty),seed,{guided:Boolean(body.guided)});
     profile.run.serverOwned=true;profile.run.serverRunId=account.campaignRunId;profile.run.battle=null;profile.run.pending=null;profile.completionNotice=null;
     break;
    }
    case 'select-node':{
     const run=currentRun(profile,account);if(run.battle)fail('O confronto atual ainda não foi resolvido.',409);if(run.pending)fail('Resolva a escolha pendente.');
     normalizeTrail(run);const node=run.map.flat().find(item=>item.id===body.nodeId);
     if(!node||!run.availableNodeIds.includes(node.id)||run.clearedNodeIds.includes(node.id))fail('Este caminho não está disponível.');
     run.currentNodeId=node.id;
     if(isCombat(node)){extra=startBattle(profile,run,node);break;}
     if(node.type==='repair'){
      healTeam(profile,run,.4+(aggregateGlobal(profile).restBonus||0));run.stability=Math.min(run.maxStability,run.stability+1);finishNode(profile,run,node,account);
     }else if(node.type==='treasure'){
      const affinity=affinityForTeam(run.team,characterById);
      profile.fragments+=12;const id=affinityBuff(affinity);if(id&&buffs.some(buff=>buff.id===id)&&!run.buffs.includes(id))run.buffs.push(id);finishNode(profile,run,node,account);
     }else if(node.type==='event')setPending(run,'event');
     else if(node.type==='nilo-choice'){
      if(!canChooseNiloPath(profile,run)){finishNode(profile,run,node,account);extra={completed:profile.run===null};break;}
      setPending(run,'nilo-choice');
     }else if(node.type==='shop')setPending(run,'shop',buffChoices(run,1));
     else if(node.type==='upgrade'||node.type==='reward')setPending(run,node.type,buffChoices(run,2));
     else fail('Este encontro não pode ser resolvido.');
     break;
    }
    case 'turn':{
     const run=currentRun(profile,account);if(!run.battle)fail('Nenhum combate está ativo.');
     if(!Array.isArray(body.actions)||body.actions.length>3)fail('Fila inválida.');
     const battle=restoreBattle(run.battle);if(battle.phase!=='player')fail('Aguarde a decisão atual do combate.',409);
     if(!Number.isSafeInteger(body.round)||body.round!==battle.round)fail('O turno mudou. A campanha foi atualizada.',409);
     const exchanges=applyEssenceExchanges(battle,'player',body.exchanges||[]);if(!exchanges.ok)fail(exchanges.reason||'Troca de Essência inválida.');
     const actors=new Set();for(const ref of body.actions){if(actors.has(ref?.actorId))fail('Cada alma pode agir uma vez por turno.');actors.add(ref?.actorId);const result=chooseAction(battle,ref?.actorId,ref?.abilityId,ref?.targetId,{residueSpend:ref?.residueSpend,fractureSpend:ref?.fractureSpend});if(!result.ok)fail(result.reason||'Ação inválida.');}
     const committed=commitTurn(battle,body.payment);if(!committed.ok)fail(committed.reason||'Pagamento inválido.');
     const events=runBattleToDecision(battle);syncNiloAbsorption(profile,run,battle.niloAbsorption);run.battle=storeBattle(battle);extra={battle:run.battle,events};
     break;
    }
    case 'influence':{
     const run=currentRun(profile,account);if(!run.battle)fail('Nenhum combate está ativo.');
     const battle=restoreBattle(run.battle),before=storeBattle(battle);
     if(battle.influenceDraft?.side!=='player')fail('Aguarde a influência da oposição.');
     if(!chooseInfluence(battle,String(body.eventId||'')))fail('Esta influência não está disponível.');
     const events=[{mode:'influence',title:'Eco do mundo',summary:'A influência escolhida foi aplicada.'},...runBattleToDecision(battle)];
     run.battle=storeBattle(battle);extra={battle:run.battle,events,previous:before};
     break;
    }
    case 'settle':{
     const run=currentRun(profile,account);if(!run.battle)fail('Nenhum combate está ativo.');
     const battle=restoreBattle(run.battle);if(!['victory','defeat'].includes(battle.phase))fail('O combate ainda não terminou.',409);syncNiloAbsorption(profile,run,battle.niloAbsorption);
     const node=currentNode(run);if(!node)fail('Nó de trilha inválido.');
     if(battle.phase==='victory'){
      run.teamHealth=Object.fromEntries(battle.allies.map(ally=>[ally.id,persistentCombatHp(ally)]));
      if(!recordEncounter(profile,run,node))fail('Esta vitória já foi registrada.',409);
      profile.xp+=rewardXp(node);const rewardNode=['elite','mini'].includes(node.type||node.id);
      profile.fragments+=(rewardNode?18:6)+(aggregateGlobal(profile).fragments||0);
      run.battle=null;
      if(rewardNode){setPending(run,'reward',buffChoices(run,3));extra={battle:null,pending:run.pending};break;}
      finishNode(profile,run,node,account);extra={battle:null,completed:profile.run===null};
     }else{
      run.teamHealth=Object.fromEntries(battle.allies.map(ally=>[ally.id,Math.max(35,persistentCombatHp(ally)||Math.round((ally.persistentMaxHp||ally.maxHp)*.35))]));
      run.stability--;run.battle=null;run.currentNodeId=null;
      if(run.stability<=0){profile.run=null;account.campaignRunId=null;extra={battle:null,reset:true};}
      else{run.tried++;extra={battle:null,defeat:true};}
     }
     break;
    }
    case 'event':{
     const run=currentRun(profile,account),pending=run.pending;
     if(pending?.type==='nilo-choice'){
      const node=currentNode(run);if(!node||node.type!=='nilo-choice')fail('Decisão de Nilo inválida.');
      if(!resolveNiloPathChoice(profile,body.choice,run))fail('Escolha inválida ou indisponível.');
      profile.eloProgress[run.eloId].events++;finishNode(profile,run,node,account);break;
     }
     if(pending?.type!=='event')fail('Não há evento pendente.');
     if(!['repair','echo'].includes(body.choice))fail('Escolha inválida.');profile.eloProgress[run.eloId].events++;
     const node=currentNode(run);if(!node||node.type!=='event')fail('Evento inválido.');
     if(body.choice==='repair'){healTeam(profile,run,.25+(aggregateGlobal(profile).restBonus||0));run.stability=Math.min(run.maxStability,run.stability+1);}
     else{profile.fragments+=8;const affinity=affinityForTeam(run.team,characterById),id=affinityBuff(affinity);if(id&&buffs.some(buff=>buff.id===id)&&!run.buffs.includes(id))run.buffs.push(id);}
     finishNode(profile,run,node,account);break;
    }
    case 'buff':{
     const run=currentRun(profile,account),pending=run.pending;if(!pending||!['reward','upgrade'].includes(pending.type))fail('Não há Eco pendente.');
     const id=String(body.buffId||'');if(!pending.choices?.some(buff=>buff.id===id)||run.buffs.includes(id))fail('Esse Eco não está disponível.');
     run.buffs.push(id);const node=currentNode(run);if(!node)fail('Nó de trilha inválido.');finishNode(profile,run,node,account);break;
    }
    case 'shop':{
     const run=currentRun(profile,account),pending=run.pending;if(pending?.type!=='shop')fail('Não há mercador ativo.');
     const action=String(body.action||''),node=currentNode(run);if(!node||node.type!=='shop')fail('Mercador inválido.');
     if(action==='heal'&&profile.fragments>=12){profile.fragments-=12;healTeam(profile,run,.35);}
     else if(action==='buff'&&profile.fragments>=22&&pending.choices?.some(buff=>buff.id===body.buffId)&&!run.buffs.includes(body.buffId)){profile.fragments-=22;run.buffs.push(body.buffId);}
     else if(action!=='leave')fail('Fragmentos insuficientes ou Eco indisponível.');
     finishNode(profile,run,node,account);break;
    }
    case 'abandon':profile.run=null;account.campaignRunId=null;break;
    case 'claim':{
     const result=claimGlobalUpgrade(profile,String(body.id||''));if(!result)fail('Este Legado não está disponível.');extra={claimed:result};break;
    }
    case 'clear-notice':if(!profile.pendingGlobalReward)profile.completionNotice=null;break;
   }
   return campaignState(profile,{...extra,pending:profile.run?.pending||null});
  });
 }
}
