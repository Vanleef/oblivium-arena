import { elos, realms, characters, characterById, generateTrail, buffs, worldLeaders, starters } from './data.js';
import { defaultKingdomByTrack } from './kingdoms.js';

export function seededRandom(seed=1) { let value=(Number(seed)||1)>>>0;return ()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;}; }
export function shuffled(items,rng=Math.random) { const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out; }
const roster=id=>characters.filter(c=>c.kingdomId===id||c.legacyEloId===id);
const leadersByRosterId=new Map(Object.values(worldLeaders).map(leader=>[leader.rosterId,leader]));
export function isWorldCampaignComplete(profile,realmId){
  const world=realms.find(realm=>realm.id===realmId);
  return Boolean(world?.elos.length&&world.elos.every(kingdom=>{
    const progress=profile.eloProgress?.[kingdom.id];
    return Number(progress?.wins)>0||(progress?.clearedDifficulties||[]).length>0;
  }));
}
export function leaderUnlockStatus(profile,characterId){
  const leader=leadersByRosterId.get(characterId);
  if(!leader)return null;
  const world=realms.find(realm=>realm.id===leader.realmId);
  return {unlocked:isWorldCampaignComplete(profile,leader.realmId),realmId:leader.realmId,worldName:world?.name||leader.realmId};
}
const recruitEligible=(profile,character)=>{
  if(!character||character.npcOnly)return false;
  const leaderGate=leaderUnlockStatus(profile,character.id);
  if(leaderGate&&!leaderGate.unlocked)return false;
  if(character.protagonistFamily==="nilo"&&character.id!=="nilo")return (profile.ownedIds||[]).includes(character.id);
  return true;
};
export function normalizeCampaign(profile) {
  profile.ownedIds ||= [];
  profile.unlockedAvatars ||= ["soul",...profile.ownedIds];
  profile.eloProgress ||= {};
  profile.globalUpgrades ||= [];
  if(profile.run){
    const activeId=profile.run.eloId;
    if(activeId&&!elos.some(kingdom=>kingdom.id===activeId)&&defaultKingdomByTrack[activeId]){
      profile.run.legacyEloId=activeId;
      profile.run.eloId=defaultKingdomByTrack[activeId];
      if(!profile.run.battle)delete profile.run.bossIds;
    }
    if(profile.run.niloAbsorption===undefined)profile.run.niloAbsorption=["vestibulo","correntes-quebradas"].includes(profile.run.eloId)||profile.run.legacyEloId==="correntes-quebradas"?{cinza:0,graca:0,ruptura:0}:null;
    profile.run.niloUnlockedIds||=[];
    profile.run.niloPath||=null;
    profile.run.niloPurificationChoiceResolved||=false;
  }
  if(!['purged','embraced'].includes(profile.niloPath))profile.niloPath=(profile.ownedIds||[]).includes('o-eco-de-nilo')?'embraced':(profile.ownedIds||[]).includes('nilo-o-epilogo')?'purged':null;
  if(profile.kingdomProgressVersion!==1){
    const previous=profile.eloProgress||{},completed=new Set(profile.completedElos||[]);
    for(const kingdom of elos){
      const sourceIds=[...new Set(characters.filter(character=>character.kingdomId===kingdom.id).map(character=>character.legacyEloId).filter(Boolean))];
      const sourceProgress=sourceIds.map(id=>previous[id]).filter(Boolean);
      const inheritedClear=sourceIds.some(id=>completed.has(id));
      const current=previous[kingdom.id]||{};
      const clearedDifficulties=[...new Set([...(current.clearedDifficulties||[]),...sourceProgress.flatMap(p=>p.clearedDifficulties||[]),...(inheritedClear?[0]:[])])].filter(n=>Number.isInteger(n)&&n>=0).sort((a,b)=>a-b);
      const variants=[...new Set([...(current.variants||[]),...sourceProgress.flatMap(p=>p.variants||[])])];
      profile.eloProgress[kingdom.id]={
        ...current,
        clearedDifficulties,
        variants,
        wins:Math.max(0,...[current,...sourceProgress].map(p=>Number(p.wins)||0),inheritedClear?1:0),
        combats:Math.max(0,...[current,...sourceProgress].map(p=>Number(p.combats)||0)),
        elites:Math.max(0,...[current,...sourceProgress].map(p=>Number(p.elites)||0)),
        events:Math.max(0,...[current,...sourceProgress].map(p=>Number(p.events)||0))
      };
    }
    profile.kingdomProgressVersion=1;
  }
  for(const kingdom of elos) {
    const p=profile.eloProgress[kingdom.id] ||= {};
    p.clearedDifficulties=[...new Set(p.clearedDifficulties||[])].filter(n=>Number.isInteger(n)&&n>=0).sort((a,b)=>a-b);
    p.variants ||= [];p.wins ||= 0;p.combats ||= 0;p.elites ||= 0;p.events ||= 0;
  }
  profile.completedElos=elos.filter(kingdom=>profile.eloProgress[kingdom.id].clearedDifficulties.length).map(kingdom=>kingdom.id);
  for(const leader of Object.values(worldLeaders)){
    const cleared=isWorldCampaignComplete(profile,leader.realmId);
    if(cleared&&!profile.ownedIds.includes(leader.rosterId))profile.ownedIds.push(leader.rosterId);
    if(!cleared)profile.ownedIds=profile.ownedIds.filter(id=>id!==leader.rosterId);
  }
  profile.ownedIds=[...new Set(profile.ownedIds)];
  profile.unlockedAvatars=[...new Set(["soul",...profile.ownedIds])];
  if(Array.isArray(profile.team)){
    const currentTeam=profile.team.filter(id=>profile.ownedIds.includes(id));
    const fill=starters.map(character=>character.id).filter(id=>profile.ownedIds.includes(id)&&!currentTeam.includes(id));
    profile.team=[...currentTeam,...fill].slice(0,3);
  }
  profile.campaignVersion=3;
  return profile;
}
export function canChooseNiloPath(profile,run=profile?.run) {
  const node=run?.map?.flat?.().find(item=>item.id===run.currentNodeId),bars=run?.niloAbsorption||{};
  const noThreshold=["cinza","graca","ruptura"].every(key=>(bars[key]||0)<70);
  return Boolean(run&&(run.eloId==="vestibulo"||run.legacyEloId==="correntes-quebradas")&&!run.niloPath&&!run.niloPurificationChoiceResolved&&noThreshold&&profile?.ownedIds?.includes("nilo")&&node?.type==="nilo-choice");
}
export function resolveNiloPathChoice(profile,choice,run=profile?.run) {
  if(!canChooseNiloPath(profile,run))return null;
  if(!["purged","purified","decline","embraced"].includes(choice))return null;
  run.niloPurificationChoiceResolved=true;
  if(choice==="decline"||choice==="embraced")return {choice,id:null};
  const id="nilo-o-epilogo";
  profile.niloPath="purged";
  profile.ownedIds=[...new Set([...(profile.ownedIds||[]),id])];
  profile.unlockedAvatars=[...new Set([...(profile.unlockedAvatars||["soul"]),id])];
  return {choice:"purified",id};
}
const niloMilestones={
 cinza:{30:"nilo-o-prefacio",70:"nilo-cinza-epilogo",100:"nilo-cinza-final"},
 graca:{30:"nilo-graca-prefacio",70:"nilo-graca-epilogo",100:"nilo-graca-final"},
 ruptura:{30:"nilo-ruptura-prefacio",70:"nilo-ruptura-epilogo",100:"nilo-ruptura-final"}
};
function unlockNiloForm(profile,run,id){
 profile.ownedIds=[...new Set([...(profile.ownedIds||[]),id])];
 profile.unlockedAvatars=[...new Set([...(profile.unlockedAvatars||["soul"]),id])];
 run.niloUnlockedIds=[...new Set([...(run.niloUnlockedIds||[]),id])];
}
export function syncNiloAbsorption(profile,run,bars=run?.niloAbsorption){
 if(!run||(run.eloId!=="vestibulo"&&run.legacyEloId!=="correntes-quebradas")||run.niloPath||!bars)return [];
 const current={cinza:Math.max(0,Math.min(100,Number(bars.cinza)||0)),graca:Math.max(0,Math.min(100,Number(bars.graca)||0)),ruptura:Math.max(0,Math.min(100,Number(bars.ruptura)||0))};
 run.niloAbsorption=current;const unlocked=[];
 for(const [path,thresholds]of Object.entries(niloMilestones))for(const [threshold,id]of Object.entries(thresholds))if(current[path]>=Number(threshold)&&!(run.niloUnlockedIds||[]).includes(id)){unlockNiloForm(profile,run,id);unlocked.push(id);}
 if(["cinza","graca","ruptura"].every(key=>current[key]>=70)){
  run.niloPath="embraced";run.niloAbsorption=null;unlockNiloForm(profile,run,"o-eco-de-nilo");unlocked.push("o-eco-de-nilo");return unlocked;
 }
 const finalPath=Object.keys(niloMilestones).find(key=>current[key]>=100);
 if(finalPath){
  run.niloPath=finalPath;run.niloAbsorption={cinza:finalPath==="cinza"?100:0,graca:finalPath==="graca"?100:0,ruptura:finalPath==="ruptura"?100:0};
  const id=niloMilestones[finalPath][100];if(!(run.niloUnlockedIds||[]).includes(id)){unlockNiloForm(profile,run,id);unlocked.push(id);}
 }
 return unlocked;
}
export function maxDifficulty(profile,id) { const cleared=profile.eloProgress[id]?.clearedDifficulties||[];let next=0;while(cleared.includes(next))next++;return next; }
export function eloAccess(profile,elo) {
  const realm=realms.find(r=>r.name===elo.realm),index=realm.elos.findIndex(e=>e.id===elo.id),previous=realm.elos[index-1];
  if(!previous)return {unlocked:true,requirements:[]};
  const p=profile.eloProgress[previous.id],total=key=>realm.elos.reduce((n,e)=>n+(profile.eloProgress[e.id]?.[key]||0),0);
  const requirements=[{label:`Vencer ${previous.name}`,current:p.clearedDifficulties.length?1:0,total:1}];
  if(index%3===1)requirements.push({label:'Derrotar elites neste mundo',current:total('elites'),total:index});
  else if(index%3===2)requirements.push({label:'Resolver encontros neste mundo',current:total('events'),total:Math.ceil(index/2)});
  else requirements.push({label:`Vencer trilhas distintas de ${previous.name}`,current:p.variants.length,total:2});
  if(index>=6)requirements.push({label:`Vencer ${previous.name} em Ruptura I`,current:p.clearedDifficulties.includes(1)?1:0,total:1});
  return {unlocked:Boolean(profile.eloProgress[elo.id]?.wins)||requirements.every(r=>r.current>=r.total),requirements};
}
export function trailVariants(profile,elo) {
  const n=elo.name;
  return [
    {id:'hunt',title:`Caçada de ${n}`,icon:'⚔',text:'Confrontos e elites',pool:0},
    {id:'pilgrimage',title:`Ecos de ${n}`,icon:'◈',text:'Eventos e relíquias',pool:1},
    {id:'eclipse',title:`Eclipse de ${n}`,icon:'☽',text:'Elite e guardião extra',pool:2,locked:!(profile.eloProgress[elo.id]?.wins>0)}
  ];
}
export function recruitCandidates(profile,elo,variantId) {
  const owned=new Set(profile.ownedIds||[]);
  const all=roster(elo.id).filter(c=>recruitEligible(profile,c)),split=Math.ceil(all.length/2),preferred=variantId==='hunt'?all.slice(0,split):variantId==='pilgrimage'?all.slice(split):all;
  const missing=preferred.filter(c=>!owned.has(c.id));
  return missing.length?missing:all.filter(c=>!owned.has(c.id)).length?all.filter(c=>!owned.has(c.id)):preferred;
}
export function difficultyModifiers(level=0) {
  const d=Math.max(0,Math.trunc(level));
  return {level:d,hp:1+d*.12,damage:1+d*.05,shield:d*3,armor:d>=3?Math.floor(d/4):0,regen:d>=2?Math.min(5,d):0,affliction:d>=4?Math.floor(d/4):0};
}
export function difficultyName(d) { return d===0?'Véu intacto':`Ruptura ${d}`; }
export function modifierLabels(d) { const m=difficultyModifiers(d);return d?[`Vida +${Math.round((m.hp-1)*100)}%`,`Dano +${Math.round((m.damage-1)*100)}%`,`Defesa inicial +${m.shield}`,...(m.armor?[`Armadura ${m.armor}`]:[]),...(m.regen?[`Regeneração ${m.regen}`]:[]),...(m.affliction?[`Aflição +${m.affliction}`]:[])]:['Sem modificadores']; }
const legacyCaps={shield:80,lifesteal:.6,restBonus:.6,startingCharge:3};
function clampLegacy(effect) {const out={...effect};for(const [key,cap]of Object.entries(legacyCaps))if(out[key]!=null)out[key]=Math.min(cap,out[key]);return out;}
export function aggregateGlobal(profile) { return clampLegacy((profile.globalUpgrades||[]).reduce((acc,p)=>{for(const [key,value]of Object.entries(p.effect||{}))acc[key]=(acc[key]||0)+value;return acc;},{})); }
export function runMaxHp(profile,run,id) { return (characterById[id]?.maxHp||100)+(aggregateGlobal(profile).maxHp||0)+(run?.buffs||[]).reduce((n,id)=>n+(buffs.find(b=>b.id===id)?.effect.maxHp||0),0); }
export const runMemoryCatalog=Object.freeze({
 inferno:{title:'Brasa que recorda',icon:'♨',glyph:'ember',text:'Aflições aplicadas causam +1 de dano por turno por Eco; máximo +3.',lore:'O trio atravessou as chamas junto. Cada ferida deixa uma brasa para a próxima luta.',effect:{afflictionPower:1}},
 paraiso:{title:'Cuidado que permanece',icon:'✧',glyph:'lotus',text:'Curas concedidas restauram +1 de Vida por Eco; máximo +3.',lore:'A mão que amparou uma alma continua presente quando a trilha se fecha.',effect:{healPower:1}},
 limbo:{title:'Ruptura que responde',icon:'⟲',glyph:'shatter',text:'Técnicas de controle causam +1 de dano por Eco; máximo +3.',lore:'A fronteira se lembra de quem tentou contê-la e devolve um pouco de controle.',effect:{controlPower:1}},
 accord:{title:'Ressonância lembrada',icon:'∞',glyph:'chorus',text:'A Ressonância aumenta em 2% por Eco; máximo +6%.',lore:'Almas do mesmo Reino aprenderam a ouvir o ritmo umas das outras.',effect:{resonance:.02}},
 essence:{title:'Reserva dos ausentes',icon:'◈',glyph:'soul',text:'Comece cada combate com +1 Éter por Eco; máximo +2.',lore:'A memória de quem partiu preserva uma centelha para o próximo encontro.',effect:{essence:1}}
});
function memoryForTeam(teamIds){
 const party=teamIds.map(id=>characterById[id]).filter(Boolean),byRealm=new Map(),byElo=new Map();
 for(const c of party){byRealm.set(c.realm,(byRealm.get(c.realm)||0)+1);byElo.set(c.eloId,(byElo.get(c.eloId)||0)+1);}
 const realm=[...byRealm].sort((a,b)=>b[1]-a[1])[0];
 if(realm?.[1]>=2)return realm[0]==='Inferno'?'inferno':realm[0]==='Paraíso'?'paraiso':'limbo';
 if([...byElo.values()].some(count=>count>=2))return 'accord';
 return 'essence';
}
export function recordRunMemory(run,teamIds,node){
 const type=node?.type||node?.id;if(!['elite','mini','boss'].includes(type))return null;
 run.memories||=[];run.memoryNodeIds||=[];if(run.memoryNodeIds.includes(node.id))return null;run.memoryNodeIds.push(node.id);
 const id=memoryForTeam(teamIds||run.team||[]),template=runMemoryCatalog[id],existing=run.memories.find(memory=>memory.id===id);
 if(existing)existing.stacks=Math.min(3,(existing.stacks||1)+1);
 else run.memories.push({id,...template,stacks:1,sourceNodeId:node.id});
 return run.memories.find(memory=>memory.id===id);
}
export function aggregateRunMemories(run){
 const effect={};for(const memory of run?.memories||[]){const stacks=Math.min(3,Math.max(1,memory.stacks||1));for(const [key,value]of Object.entries(memory.effect||{})){const next=(effect[key]||0)+value*stacks;effect[key]=key==='resonance'?Math.min(.06,next):key==='essence'?Math.min(2,next):Math.min(3,next);}}
 return effect;
}
export function selectBossRoster(teamIds,candidateIds,seed=1){
 const party=teamIds.map(id=>characterById[id]).filter(Boolean),pool=[...new Set(candidateIds)].map(id=>characterById[id]).filter(Boolean);
 if(pool.length<=3)return pool.map(c=>c.id);
 const has= (c,pred)=>c.abilities.slice(0,3).some(pred);
 const teamTypes=new Set(party.flatMap(c=>c.abilities.slice(0,3).filter(a=>a.damage).map(a=>a.damageType||'physical')));
 const lacksCare=!party.some(c=>has(c,a=>a.heal||a.cleanse||a.regen)||c.passive?.type==='support'||c.passive?.type==='leech');
 const lacksControl=!party.some(c=>has(c,a=>a.stun||a.weaken||a.sealAttack||a.sealSupport));
 const narrowDamage=teamTypes.size<=1;
 const rng=seededRandom(seed),ordered=shuffled(pool,rng);
 const challengeScore=c=>{
  const kit=c.abilities.slice(0,3);
  return (lacksCare&&kit.some(a=>a.healingBlock||a.damage>=22)?2:0)
   +(lacksControl&&kit.some(a=>a.stun||a.weaken||a.sealAttack||a.sealSupport)?2:0)
   +(narrowDamage&&kit.some(a=>a.counter||a.reduce||a.armorBreak||a.stripShield)?2:0)
   +(kit.some(a=>a.target==='all-enemies')?.5:0);
 };
 const ranked=[...ordered].sort((a,b)=>challengeScore(b)-challengeScore(a));
 // One seat adapts to the team's biggest gap; the other two stay varied and readable.
 const topScore=challengeScore(ranked[0]),challengers=ranked.filter(c=>challengeScore(c)===topScore);
 const adaptive=challengers[Math.floor(rng()*challengers.length)];
 const rest=shuffled(ordered.filter(c=>c.id!==adaptive.id),rng).slice(0,2);
 return [adaptive,...rest].map(c=>c.id);
}
export function createExpedition(profile,elo,variantId='hunt',difficulty=maxDifficulty(profile,elo.id),seed=Date.now(),options={}) {
  if(profile.pendingGlobalReward)throw Error('Escolha seu Legado antes de iniciar outra trilha.');
  if(!eloAccess(profile,elo).unlocked)throw Error('Reino bloqueado.');
  const variant=trailVariants(profile,elo).find(v=>v.id===variantId);
  if(!variant||variant.locked)throw Error('Trilha bloqueada.');
  if(!Number.isInteger(difficulty)||difficulty<0||difficulty>maxDifficulty(profile,elo.id))throw Error('Dificuldade bloqueada.');
  const rng=seededRandom(seed),candidates=shuffled(recruitCandidates(profile,elo,variantId),rng),recruitable=candidates.filter(c=>!profile.ownedIds.includes(c.id)),nonTeamRoster=shuffled(roster(elo.id).filter(c=>!profile.team.includes(c.id)&&recruitEligible(profile,c)),rng),bossPool=[...new Set([...(nonTeamRoster.length>=3?nonTeamRoster:shuffled(roster(elo.id).filter(c=>recruitEligible(profile,c)),rng)).map(c=>c.id),...recruitable.map(c=>c.id)])],variantSeed=[...variantId].reduce((hash,char)=>(Math.imul(hash,31)+char.charCodeAt(0))>>>0,seed>>>0),bossIds=selectBossRoster(profile.team,bossPool,variantSeed);
  if(recruitable.length&&!bossIds.some(id=>recruitable.some(c=>c.id===id)))bossIds[2]=recruitable[Math.floor(rng()*recruitable.length)].id;
  const map=generateTrail(elo.id,seed,variantId,{includeNiloChoice:elo.id==="vestibulo"&&(profile.ownedIds||[]).includes("nilo")}),g=aggregateGlobal(profile),maxStability=3+(g.stability||0);
  const run={eloId:elo.id,variantId,variantTitle:variant.title,difficulty,seed,map,bossIds,team:[...profile.team],stage:0,stability:maxStability,maxStability,buffs:[],memories:[],memoryNodeIds:[],guided:Boolean(options.guided),encounter:0,tried:0,rewardedNodeIds:[],niloAbsorption:elo.id==="vestibulo"?{cinza:0,graca:0,ruptura:0}:null,niloPath:null,niloUnlockedIds:[],niloPurificationChoiceResolved:false,teamHealth:{},availableNodeIds:map[0].map(n=>n.id),revealedNodeIds:map[0].map(n=>n.id),clearedNodeIds:[],currentNodeId:null};
  run.teamHealth=Object.fromEntries(run.team.map(id=>[id,runMaxHp(profile,run,id)]));return run;
}
export function recordEncounter(profile,run,node) {
  run.rewardedNodeIds ||= [];
  if(run.rewardedNodeIds.includes(node.id))return false;
  run.rewardedNodeIds.push(node.id);
  const p=profile.eloProgress[run.eloId];p.combats++;if(['elite','mini'].includes(node.type))p.elites++;recordRunMemory(run,run.team,node);
  return true;
}
// Three categories guarantee an offensive, defensive and exploration choice.
const powers=[
  ['wounded','Vontade Indomável','✹','offense',d=>({woundedPower:3+Math.floor(d/2)}),e=>`+${e.woundedPower} dano direto enquanto o aliado tiver até 50% da Vida.`],
  ['marked','Sentença Gravada','◎','offense',d=>({markedPower:3+Math.floor(d/2)}),e=>`+${e.markedPower} dano direto contra alvos com uma marca do próprio aliado.`],
  ['afflicted','Ferida sobre Ferida','♨','offense',d=>({afflictedPower:2+Math.floor(d/2)}),e=>`+${e.afflictedPower} dano direto contra alvos com aflições ativas.`],
  ['control','Voz de Interdição','⊘','offense',d=>({controlPower:2+Math.floor(d/2)}),e=>`Técnicas de controle causam +${e.controlPower} dano direto.`],
  ['evolved','Segunda Natureza','↻','offense',d=>({evolvedPower:3+Math.floor(d/2)}),e=>`Formas alternativas de habilidades causam +${e.evolvedPower} dano direto.`],
  ['execution','Instante Final','↯','offense',d=>({executePower:3+Math.floor(d/2)}),e=>`+${e.executePower} dano direto contra alvos com até 40% da Vida.`],
  ['resolve','Apoio que Sustenta','⬡','defense',d=>({supportShield:3+Math.floor(d/2)}),e=>`Usar apoio concede ${e.supportShield} Defesa ao próprio usuário; uma vez por habilidade.`],
  ['escape','Retorno à Luz','✧','defense',d=>({defenseHeal:3+Math.floor(d/2)}),e=>`A defesa pessoal também recupera ${e.defenseHeal} Vida do usuário.`],
  ['inheritance','Guarda dos Caídos','◇','defense',d=>({killShield:4+Math.floor(d/2)}),e=>`Derrubar uma alma com uma técnica ofensiva concede ${e.killShield} Defesa; uma vez por habilidade.`],
  ['metamorph','Manto da Mudança','↻','defense',d=>({shiftShield:4+Math.floor(d/2)}),e=>`Mudar a própria forma por uma técnica concede ${e.shiftShield} Defesa; uma vez por habilidade.`],
  ['reprisal','O Golpe Devolvido','↶','defense',d=>({counterPower:2+Math.floor(d/2)}),e=>`Contra-ataques preparados por habilidades causam +${e.counterPower} dano.`],
  ['charge','Reserva do Amanhã','✦','exploration',d=>({chargePower:1+Math.floor(d/4)}),e=>`Técnicas diretas causam +${e.chargePower} dano por carga armazenada.`],
  ['solidarity','Promessa Compartilhada','∞','exploration',d=>({supportCharge:1}),e=>`Usar apoio concede ${e.supportCharge} carga ao usuário; uma vez por habilidade, máximo de 3.`],
  ['laststand','Ainda de Pé','✹','offense',d=>({lastStandPower:4+Math.floor(d/2)}),e=>`A última alma viva da equipe causa +${e.lastStandPower} dano direto.`],
  ['vitality','Carne do Amanhã','✚','defense',d=>({maxHp:8+3*d}),e=>`+${e.maxHp} Vida máxima por aliado.`],
  ['bulwark','Último Baluarte','⬡','defense',d=>({shield:8+3*d}),e=>`+${e.shield} Defesa no início de cada combate.`],
  ['renewal','Pulso Persistente','♡','defense',d=>({regeneration:1+Math.floor(d/3)}),e=>`Recupere ${e.regeneration} Vida por aliado a partir do turno 2.`],
  ['restoration','Mãos da Aurora','✧','defense',d=>({healPower:2+d}),e=>`Habilidades de cura recuperam +${e.healPower} Vida.`],
  ['bastion','Geometria da Guarda','◇','defense',d=>({shieldPower:3+d}),e=>`Habilidades concedem +${e.shieldPower} Defesa.`],
  ['armor','Vestígio de Aço','▱','defense',d=>({armor:1+Math.floor(d/3)}),e=>`Reduza dano físico e espiritual recebido em ${e.armor}.`],
  ['physical','Ferro da Travessia','⚔','offense',d=>({physicalPower:2+d}),e=>`Técnicas físicas causam +${e.physicalPower} dano.`],
  ['spiritual','Voz do Véu','✦','offense',d=>({spiritualPower:2+d}),e=>`Técnicas espirituais causam +${e.spiritualPower} dano.`],
  ['piercing','Agulha do Vazio','↯','offense',d=>({piercingPower:2+d}),e=>`Técnicas perfurantes causam +${e.piercingPower} dano.`],
  ['affliction','Cinza que Persiste','♨','offense',d=>({afflictionPower:1+Math.floor(d/2)}),e=>`Aflições aplicadas causam +${e.afflictionPower} dano por turno.`],
  ['opener','Primeira Fenda','✹','offense',d=>({firstStrike:4+2*d}),e=>`O primeiro ataque de cada aliado causa +${e.firstStrike} dano.`],
  ['vampirism','Dívida Vital','◉','offense',d=>({lifesteal:Math.min(.3,.04+.01*d)}),e=>`Restaure ${Math.round(e.lifesteal*100)}% do dano direto causado.`],
  ['essence','Farol da Alma','◈','exploration',d=>({essence:1+Math.floor(d/3)}),e=>`+${e.essence} Éter no início de cada combate.`],
  ['cinders','Pacto da Brasa','✹','exploration',d=>({cinza:1+Math.floor(d/3)}),e=>`+${e.cinza} Cinza no início de cada combate.`],
  ['grace','Fragmento do Alto','✧','exploration',d=>({graca:1+Math.floor(d/3)}),e=>`+${e.graca} Graça no início de cada combate.`],
  ['rupture','Nó Impossível','⟲','exploration',d=>({ruptura:1+Math.floor(d/3)}),e=>`+${e.ruptura} Ruptura no início de cada combate.`],
  ['wild','Semente Volátil','✥','exploration',d=>({randomEssence:1+Math.floor(d/3)}),e=>`+${e.randomEssence} Essência aleatória no início de cada combate.`],
  ['shelter','Santuário Errante','☽','exploration',d=>({restBonus:Math.min(.6,.1+.03*d)}),e=>`Descansos e eventos curam +${Math.round(e.restBonus*100)}% da Vida máxima.`],
  ['spoils','Memória das Ruínas','◇','exploration',d=>({fragments:2+d}),e=>`+${e.fragments} fragmentos por vitória.`],
  ['chains','Corrente Ancestral','∞','exploration',d=>({stability:1+Math.floor(d/5)}),e=>`Novas trilhas começam com +${e.stability} Corrente da Alma.`],
  ['preparation','Instante Guardado','⌛','exploration',d=>({startingCharge:Math.min(3,1+Math.floor(d/4))}),e=>`Aliados começam cada combate com ${e.startingCharge} carga(s).`],
  ['crosscut','Corte Cruzado','⌘','offense',d=>({markedPower:2+Math.floor(d/2),piercingPower:1+Math.floor(d/3)}),e=>`+${e.markedPower} dano contra alvos marcados pelo aliado; técnicas perfurantes causam +${e.piercingPower}.`],
  ['hotvein','Veia em Brasa','♨','offense',d=>({afflictionPower:1+Math.floor(d/3),lifesteal:Math.min(.24,.04+.01*d)}),e=>`Aflições aplicadas causam +${e.afflictionPower} por turno; restaure ${Math.round(e.lifesteal*100)}% do dano direto.`],
  ['lastword','Palavra Final','◉','offense',d=>({executePower:2+Math.floor(d/2),firstStrike:2+d}),e=>`+${e.executePower} dano contra alvos feridos; o primeiro ataque de cada aliado causa +${e.firstStrike}.`],
  ['huntfire','Caça ao Grito','♜','offense',d=>({controlPower:1+Math.floor(d/3),woundedPower:2+Math.floor(d/2)}),e=>`Técnicas de controle causam +${e.controlPower}; aliados feridos causam +${e.woundedPower}.`],
  ['stonebreaker','Pedra Trincada','⌁','offense',d=>({physicalPower:1+Math.floor(d/3),shieldedPower:2+Math.floor(d/2)}),e=>`Técnicas físicas causam +${e.physicalPower}; com Defesa, aliados causam +${e.shieldedPower}.`],
  ['oathsteel','Juramento de Aço','⛨','defense',d=>({armor:1+Math.floor(d/5),counterPower:1+Math.floor(d/2)}),e=>`Armadura +${e.armor}; contra-ataques preparados causam +${e.counterPower}.`],
  ['stillwater','Poço Silencioso','◡','defense',d=>({defenseHeal:2+Math.floor(d/3),regeneration:1+Math.floor(d/4)}),e=>`A defesa pessoal cura +${e.defenseHeal}; regenere ${e.regeneration} Vida por turno a partir do segundo.`],
  ['fortress','Fortaleza Recordada','▥','defense',d=>({maxHp:5+2*d,shield:5+2*d}),e=>`Cada aliado recebe +${e.maxHp} Vida máxima e ${e.shield} Defesa no início do combate.`],
  ['chorusguard','Coro de Vigília','♬','defense',d=>({supportShield:2+Math.floor(d/2),shieldPower:1+Math.floor(d/3)}),e=>`Usar apoio concede ${e.supportShield} Defesa ao usuário; habilidades dão +${e.shieldPower} Defesa.`],
  ['returning','Voto dos que Restam','⤴','defense',d=>({killShield:3+Math.floor(d/2),defenseHeal:1+Math.floor(d/3)}),e=>`Derrubar uma alma concede ${e.killShield} Defesa; sua defesa pessoal cura +${e.defenseHeal} Vida.`],
  ['crossroads','Encruzilhada Aberta','⤢','exploration',d=>({essence:1,rupture:1}),e=>`Comece cada combate com +${e.essence} Éter e +${e.rupture} Ruptura.`],
  ['longstep','Passo Antes da Queda','⇢','exploration',d=>({startingCharge:Math.min(2,1+Math.floor(d/4)),supportCharge:1}),e=>`Comece com ${e.startingCharge} carga e receba 1 carga ao usar apoio, até o limite de 3.`],
  ['keepsake','Bolso dos Ausentes','▰','exploration',d=>({stability:1+Math.floor(d/5),fragments:2+2*d}),e=>`Trilhas começam com +${e.stability} Corrente da Alma; vitórias rendem +${e.fragments} fragmentos.`],
  ['turnstile','Maré de Retorno','◷','exploration',d=>({restBonus:Math.min(.4,.08+.03*d),stability:1}),e=>`Descansos e eventos curam +${Math.round(e.restBonus*100)}% da Vida máxima; receba +${e.stability} Corrente.`],
  ['soulforge','Forja de Éter','⚒','exploration',d=>({essence:1+Math.floor(d/4),maxHp:4+Math.floor(d/2)}),e=>`Combates começam com +${e.essence} Éter; cada aliado recebe +${e.maxHp} Vida máxima.`],
  ['nilo-echo','Eco Receptivo','◍','exploration',d=>({randomEssence:1}),e=>`Comece cada combate com +${e.randomEssence} Essência aleatória.`],
  ['naomi-root','Raiz que Permanece','❋','defense',d=>({maxHp:5+2*d,regeneration:1+Math.floor(d/3)}),e=>`Cada aliado recebe +${e.maxHp} Vida máxima; regenere ${e.regeneration} Vida por turno a partir do segundo.`],
  ['kael-iron','Dívida de Ferro','⛨','offense',d=>({woundedPower:2+Math.floor(d/2),counterPower:1+Math.floor(d/2)}),e=>`+${e.woundedPower} dano com até metade da Vida; Contra-ataques causam +${e.counterPower} dano.`],
  ['vaas-masks','Máscaras Sobrepostas','◇','offense',d=>({markedPower:2+Math.floor(d/2),controlPower:1+Math.floor(d/3)}),e=>`+${e.markedPower} dano contra alvos com Marca própria; técnicas de controle causam +${e.controlPower} dano.`],
  ['diana-vigil','Vigília de Graça','✚','defense',d=>({healPower:1+d,supportShield:2+Math.floor(d/2)}),e=>`Curas restauram +${e.healPower} Vida; usar apoio concede ${e.supportShield} Defesa ao usuário.`]
];
const upgradeVisuals={
 wounded:{glyph:'scar',lore:'As marcas deixadas por cada queda viram vontade para continuar lutando.'},
 marked:{glyph:'mark',lore:'Uma sentença escrita na alma aponta o próximo golpe.'},
 afflicted:{glyph:'spore',lore:'O que apodrece por dentro ainda pode alimentar uma vingança.'},
 control:{glyph:'lock',lore:'Uma voz interrompida abre passagem para a ofensiva.'},
 evolved:{glyph:'metamorph',lore:'A mesma técnica assume outra forma quando o véu se rompe.'},
 execution:{glyph:'fang',lore:'O último fôlego da vítima denuncia o instante de concluir.'},
 resolve:{glyph:'shield',lore:'Quem sustenta os outros aprende a suportar o próprio peso.'},
 escape:{glyph:'dawn',lore:'Uma abertura na escuridão oferece mais um instante de vida.'},
 inheritance:{glyph:'candle',lore:'A guarda de quem caiu permanece com quem segue em frente.'},
 metamorph:{glyph:'mirror',lore:'Um reflexo imperfeito revela uma possibilidade diferente.'},
 reprisal:{glyph:'counter',lore:'Toda agressão encontra a memória de quem resistiu.'},
 charge:{glyph:'charge',lore:'A Essência poupada hoje sustenta a técnica de amanhã.'},
 solidarity:{glyph:'bond',lore:'Um auxílio dividido retorna como força para quem o ofereceu.'},
 laststand:{glyph:'eclipse',lore:'Quando resta uma só alma, sua presença ocupa todo o campo.'},
 vitality:{glyph:'heart',lore:'O corpo aprende a guardar espaço para uma luta mais longa.'},
 bulwark:{glyph:'crown',lore:'Uma última barreira impede que a trilha decida cedo demais.'},
 renewal:{glyph:'seed',lore:'Uma pequena recuperação insiste em crescer depois do primeiro turno.'},
 restoration:{glyph:'lantern',lore:'A luz emprestada de uma cura também alcança quem a recebe.'},
 bastion:{glyph:'fortress',lore:'A proteção se torna uma arquitetura construída por cada gesto.'},
 armor:{glyph:'scale',lore:'Cada camada redistribui o peso dos golpes recebidos.'},
 physical:{glyph:'blade',lore:'A matéria espiritual aprende a cortar com mais precisão.'},
 spiritual:{glyph:'echo',lore:'Uma voz do outro lado atravessa a distância entre as almas.'},
 piercing:{glyph:'rift',lore:'A fenda encontra um caminho onde a guarda parecia inteira.'},
 affliction:{glyph:'flame',lore:'A brasa continua trabalhando depois que a mão se afasta.'},
 opener:{glyph:'sunrise',lore:'O primeiro movimento decide o ritmo da travessia.'},
 vampirism:{glyph:'blood',lore:'Parte da força tomada retorna para manter o predador de pé.'},
 essence:{glyph:'soul',lore:'Uma reserva de Éter aguarda o primeiro chamado.'},
 cinders:{glyph:'ember',lore:'O resto de uma fogueira ainda acende uma técnica.'},
 grace:{glyph:'lotus',lore:'A serenidade do alto deixa uma reserva para quem ainda luta.'},
 rupture:{glyph:'shatter',lore:'Uma ruptura aberta entrega Essência antes que o caminho feche.'},
 wild:{glyph:'wild',lore:'Uma centelha sem afinidade assume o tipo que a próxima escolha exigir.'},
 shelter:{glyph:'shelter',lore:'Um abrigo que muda de lugar preserva o trio entre encontros.'},
 spoils:{glyph:'key',lore:'Os vestígios de cada vitória guardam Essência para o caminho.'},
 chains:{glyph:'chain',lore:'Uma corrente antiga mantém a expedição ligada à próxima etapa.'},
 preparation:{glyph:'hourglass',lore:'O instante guardado chega antes do primeiro choque.'},
 crosscut:{glyph:'rune',lore:'Duas marcas se cruzam e tornam a guarda um mapa de fraquezas.'},
 hotvein:{glyph:'lastword',lore:'A chama corre junto ao sangue e não deixa a ferida esfriar.'},
 lastword:{glyph:'lance',lore:'Um golpe preparado atravessa a abertura antes que ela desapareça.'},
 huntfire:{glyph:'shard',lore:'O grito de uma presa ferida chama a caçada para perto.'},
 stonebreaker:{glyph:'whetstone',lore:'Uma pedra partida afia a lâmina contra a proteção restante.'},
 oathsteel:{glyph:'anvil',lore:'O juramento endurece o corpo e devolve a força recebida.'},
 stillwater:{glyph:'well',lore:'A água escura conserva o fôlego até o momento de se erguer.'},
 fortress:{glyph:'citadel',lore:'Os nomes dos que resistiram tornam-se paredes para o trio.'},
 chorusguard:{glyph:'chorus',lore:'Várias vozes sustentam a mesma guarda sem perder o próprio tom.'},
 returning:{glyph:'return',lore:'Cada queda inimiga devolve proteção a quem permanece.'},
 crossroads:{glyph:'split',lore:'Dois tipos de Essência se encontram antes da primeira escolha.'},
 longstep:{glyph:'footsteps',lore:'Um passo antecipado deixa carga para a resposta seguinte.'},
 keepsake:{glyph:'purse',lore:'Pequenos vestígios dos ausentes sustentam a trilha e seu custo.'},
 turnstile:{glyph:'tideclock',lore:'A corrente do Limbo abre um breve caminho de volta.'},
 soulforge:{glyph:'forge',lore:'A essência recebida toma forma e reforça quem a carrega.'},
 'nilo-echo':{glyph:'echo',lore:'O corpo de Nilo devolve uma centelha do que absorveu sem escolher.'},
 'naomi-root':{glyph:'seed',lore:'A raiz de Naomi guarda espaço para cada pessoa que ainda precisa de abrigo.'},
 'kael-iron':{glyph:'anvil',lore:'A culpa vira metal, mas nenhum golpe apaga o que Kael precisa reparar.'},
 'vaas-masks':{glyph:'mirror',lore:'Uma máscara reflete a outra até que a abertura revele quem está olhando.'},
 'diana-vigil':{glyph:'lantern',lore:'A luz de Diana continua acesa enquanto alguém ainda pede ajuda.'}
};
export const globalUpgradeCatalog=Object.freeze(powers.map(([kind,title,,category])=>Object.freeze({kind,title,category,...upgradeVisuals[kind]})));
export function globalChoices(profile,eloId,difficulty,seed=1) {
  const rng=seededRandom(seed),owned=new Set(profile.globalUpgrades.map(p=>p.kind)),current=aggregateGlobal(profile);
  return ['offense','defense','exploration'].map(category=>{
    const candidates=powers.filter(p=>p[3]===category&&Object.keys(p[4](difficulty)).every(key=>legacyCaps[key]==null||(current[key]||0)<legacyCaps[key]-1e-9)),fresh=candidates.filter(p=>!owned.has(p[0]));
    const [kind,title,icon,,effectFn,textFn]=shuffled(fresh.length?fresh:candidates,rng)[0],effect=effectFn(difficulty);
    for(const key of Object.keys(effect))if(legacyCaps[key]!=null)effect[key]=Math.min(effect[key],legacyCaps[key]-(current[key]||0));
    const visual=upgradeVisuals[kind]||{};
    return {id:`${eloId}:${difficulty}:${kind}`,kind,title,icon,category,effect,text:textFn(effect),glyph:visual.glyph||'compass',lore:visual.lore||'Um legado gravado na memória da travessia.',difficulty,tier:difficulty>=4?'prismatic':difficulty>=1?'gold':'silver'};
  });
}
export function completeExpedition(profile,run) {
  if(run.completionApplied)return null;
  if(run.stage<run.map.length||!run.clearedNodeIds.includes(run.map.at(-1)[0].id))throw Error('A trilha ainda não foi concluída.');
  run.completionApplied=true;
  const p=profile.eloProgress[run.eloId],first=!p.clearedDifficulties.includes(run.difficulty);
  p.wins++;p.variants=[...new Set([...p.variants,run.variantId])];p.clearedDifficulties=[...new Set([...p.clearedDifficulties,run.difficulty])].sort((a,b)=>a-b);
  profile.completedElos=[...new Set([...profile.completedElos,run.eloId])];
  const unlockedLeaders=[];
  for(const leader of Object.values(worldLeaders)){
    if(isWorldCampaignComplete(profile,leader.realmId)&&!profile.ownedIds.includes(leader.rosterId)){
      profile.ownedIds.push(leader.rosterId);
      unlockedLeaders.push(leader.rosterId);
    }
  }
  if(unlockedLeaders.length)profile.unlockedAvatars=[...new Set([...(profile.unlockedAvatars||["soul"]),...unlockedLeaders])];
  const eligible=(run.bossIds||[]).filter(id=>characterById[id]?.kingdomId===run.eloId&&recruitEligible(profile,characterById[id])&&!profile.ownedIds.includes(id)),rng=seededRandom(run.seed+p.wins);
  const recruitId=shuffled(eligible,rng)[0]||null;
  if(recruitId)profile.ownedIds.push(recruitId);
  profile.xp+=250+run.difficulty*60;profile.fragments+=24+run.difficulty*6;
  const completion={eloId:run.eloId,difficulty:run.difficulty,recruitId,unlockedLeaders,first,memories:(run.memories||[]).map(memory=>({...memory}))};
  profile.completionNotice=completion;
  if(first)profile.pendingGlobalReward={...completion,choices:globalChoices(profile,run.eloId,run.difficulty,run.seed)};
  return completion;
}
export function claimGlobalUpgrade(profile,id) {
  const choice=profile.pendingGlobalReward?.choices.find(c=>c.id===id);
  if(!choice)return false;
  if(!profile.globalUpgrades.some(p=>p.id===choice.id))profile.globalUpgrades.push(choice);
  profile.pendingGlobalReward=null;return choice;
}

export function legacyCollection(profile) {
  const groups=new Map();
  for(const power of profile.globalUpgrades||[]){
    const group=groups.get(power.kind)||{...power,count:0,effect:{}};
    group.count++;group.difficulty=Math.max(group.difficulty,power.difficulty);for(const [key,value]of Object.entries(power.effect))group.effect[key]=(group.effect[key]||0)+value;
    groups.set(power.kind,group);
  }
  return [...groups.values()].map(group=>{const template=powers.find(p=>p[0]===group.kind),effect=clampLegacy(group.effect),visual=upgradeVisuals[group.kind]||{};return {...group,effect,text:template?template[5](effect):group.text,glyph:visual.glyph||'compass',lore:visual.lore||'Um legado gravado na memória da travessia.'};});
}

