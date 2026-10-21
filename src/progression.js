import { elos, realms, characters, characterById, generateTrail, buffs } from './data.js';

export function seededRandom(seed=1) { let value=(Number(seed)||1)>>>0;return ()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;}; }
export function shuffled(items,rng=Math.random) { const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out; }
const roster=id=>characters.filter(c=>c.eloId===id);
export function normalizeCampaign(profile) {
  profile.eloProgress ||= {};
  profile.globalUpgrades ||= [];
  for(const elo of elos) {
    const legacy=!profile.campaignVersion&&profile.completedElos?.includes(elo.id);
    const p=profile.eloProgress[elo.id] ||= {};
    p.clearedDifficulties=[...new Set(p.clearedDifficulties|| (legacy?[0]:[]))].filter(n=>Number.isInteger(n)&&n>=0).sort((a,b)=>a-b);
    p.variants ||= [];p.wins ||= legacy?1:0;p.combats ||= 0;p.elites ||= 0;p.events ||= 0;
  }
  profile.completedElos=elos.filter(e=>profile.eloProgress[e.id].clearedDifficulties.length).map(e=>e.id);
  profile.campaignVersion=2;
  return profile;
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
  const all=roster(elo.id),split=Math.ceil(all.length/2),preferred=variantId==='hunt'?all.slice(0,split):variantId==='pilgrimage'?all.slice(split):all;
  const missing=preferred.filter(c=>!profile.ownedIds.includes(c.id));
  return missing.length?missing:all.filter(c=>!profile.ownedIds.includes(c.id)).length?all.filter(c=>!profile.ownedIds.includes(c.id)):preferred;
}
export function difficultyModifiers(level=0) {
  const d=Math.max(0,Math.trunc(level));
  return {level:d,hp:1+d*.18,damage:1+d*.09,shield:d*5,armor:d>=2?Math.floor(d/2):0,regen:d>=2?Math.min(12,d):0,affliction:d>=3?Math.floor(d/3):0};
}
export function difficultyName(d) { return d===0?'Véu intacto':`Ruptura ${d}`; }
export function modifierLabels(d) { const m=difficultyModifiers(d);return d?[`Vida +${Math.round((m.hp-1)*100)}%`,`Dano +${Math.round((m.damage-1)*100)}%`,`Defesa inicial +${m.shield}`,...(m.armor?[`Armadura ${m.armor}`]:[]),...(m.regen?[`Regeneração ${m.regen}`]:[]),...(m.affliction?[`Aflição +${m.affliction}`]:[])]:['Sem modificadores']; }
const legacyCaps={shield:80,lifesteal:.6,restBonus:.6,startingCharge:3};
function clampLegacy(effect) {const out={...effect};for(const [key,cap]of Object.entries(legacyCaps))if(out[key]!=null)out[key]=Math.min(cap,out[key]);return out;}
export function aggregateGlobal(profile) { return clampLegacy((profile.globalUpgrades||[]).reduce((acc,p)=>{for(const [key,value]of Object.entries(p.effect||{}))acc[key]=(acc[key]||0)+value;return acc;},{})); }
export function runMaxHp(profile,run,id) { return (characterById[id]?.maxHp||100)+(aggregateGlobal(profile).maxHp||0)+(run?.buffs||[]).reduce((n,id)=>n+(buffs.find(b=>b.id===id)?.effect.maxHp||0),0); }
export function createExpedition(profile,elo,variantId='hunt',difficulty=maxDifficulty(profile,elo.id),seed=Date.now()) {
  if(profile.pendingGlobalReward)throw Error('Escolha seu Legado antes de iniciar outra trilha.');
  if(!eloAccess(profile,elo).unlocked)throw Error('Elo bloqueado.');
  const variant=trailVariants(profile,elo).find(v=>v.id===variantId);
  if(!variant||variant.locked)throw Error('Trilha bloqueada.');
  if(!Number.isInteger(difficulty)||difficulty<0||difficulty>maxDifficulty(profile,elo.id))throw Error('Dificuldade bloqueada.');
  const rng=seededRandom(seed),candidates=shuffled(recruitCandidates(profile,elo,variantId),rng),bossIds=candidates.slice(0,3).map(c=>c.id);
  for(const c of shuffled(roster(elo.id),rng))if(bossIds.length<3&&!bossIds.includes(c.id))bossIds.push(c.id);
  const map=generateTrail(elo.id,seed,variantId),g=aggregateGlobal(profile),maxStability=3+(g.stability||0);
  const run={eloId:elo.id,variantId,variantTitle:variant.title,difficulty,seed,map,bossIds,team:[...profile.team],stage:0,stability:maxStability,maxStability,buffs:[],encounter:0,tried:0,rewardedNodeIds:[],teamHealth:{},availableNodeIds:map[0].map(n=>n.id),revealedNodeIds:map[0].map(n=>n.id),clearedNodeIds:[],currentNodeId:null};
  run.teamHealth=Object.fromEntries(run.team.map(id=>[id,runMaxHp(profile,run,id)]));return run;
}
export function recordEncounter(profile,run,node) {
  run.rewardedNodeIds ||= [];
  if(run.rewardedNodeIds.includes(node.id))return false;
  run.rewardedNodeIds.push(node.id);
  const p=profile.eloProgress[run.eloId];p.combats++;if(['elite','mini'].includes(node.type))p.elites++;
  return true;
}
// Three categories guarantee an offensive, defensive and exploration choice.
const powers=[
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
  ['essence','Farol da Alma','◈','exploration',d=>({essence:1+Math.floor(d/3)}),e=>`+${e.essence} Essência no início de cada combate.`],
  ['cinders','Pacto da Brasa','✹','exploration',d=>({cinza:1+Math.floor(d/3)}),e=>`+${e.cinza} Cinza no início de cada combate.`],
  ['grace','Fragmento do Alto','✧','exploration',d=>({graca:1+Math.floor(d/3)}),e=>`+${e.graca} Graça no início de cada combate.`],
  ['rupture','Nó Impossível','⟲','exploration',d=>({ruptura:1+Math.floor(d/3)}),e=>`+${e.ruptura} Ruptura no início de cada combate.`],
  ['shelter','Santuário Errante','☽','exploration',d=>({restBonus:Math.min(.6,.1+.03*d)}),e=>`Descansos e eventos curam +${Math.round(e.restBonus*100)}% da Vida máxima.`],
  ['spoils','Memória das Ruínas','◇','exploration',d=>({fragments:2+d}),e=>`+${e.fragments} fragmentos por vitória.`],
  ['chains','Corrente Ancestral','∞','exploration',d=>({stability:1+Math.floor(d/5)}),e=>`Novas trilhas começam com +${e.stability} Corrente da Alma.`],
  ['preparation','Instante Guardado','⌛','exploration',d=>({startingCharge:Math.min(3,1+Math.floor(d/4))}),e=>`Aliados começam cada combate com ${e.startingCharge} carga(s).`]
];
export function globalChoices(profile,eloId,difficulty,seed=1) {
  const rng=seededRandom(seed),owned=new Set(profile.globalUpgrades.map(p=>p.kind)),current=aggregateGlobal(profile);
  return ['offense','defense','exploration'].map(category=>{
    const candidates=powers.filter(p=>p[3]===category&&Object.keys(p[4](difficulty)).every(key=>legacyCaps[key]==null||(current[key]||0)<legacyCaps[key]-1e-9)),fresh=candidates.filter(p=>!owned.has(p[0]));
    const [kind,title,icon,,effectFn,textFn]=shuffled(fresh.length?fresh:candidates,rng)[0],effect=effectFn(difficulty);
    for(const key of Object.keys(effect))if(legacyCaps[key]!=null)effect[key]=Math.min(effect[key],legacyCaps[key]-(current[key]||0));
    return {id:`${eloId}:${difficulty}:${kind}`,kind,title,icon,category,effect,text:textFn(effect),difficulty};
  });
}
export function completeExpedition(profile,run) {
  if(run.completionApplied)return null;
  if(run.stage<run.map.length||!run.clearedNodeIds.includes(run.map.at(-1)[0].id))throw Error('A trilha ainda não foi concluída.');
  run.completionApplied=true;
  const p=profile.eloProgress[run.eloId],first=!p.clearedDifficulties.includes(run.difficulty),eligible=(run.bossIds||[]).filter(id=>characterById[id]?.eloId===run.eloId&&!profile.ownedIds.includes(id)),rng=seededRandom(run.seed+p.wins);
  const recruitId=shuffled(eligible,rng)[0]||null;
  if(recruitId)profile.ownedIds.push(recruitId);
  p.wins++;p.variants=[...new Set([...p.variants,run.variantId])];p.clearedDifficulties=[...new Set([...p.clearedDifficulties,run.difficulty])].sort((a,b)=>a-b);
  profile.completedElos=[...new Set([...profile.completedElos,run.eloId])];
  profile.xp+=250+run.difficulty*60;profile.fragments+=24+run.difficulty*6;
  const completion={eloId:run.eloId,difficulty:run.difficulty,recruitId,first};
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
  return [...groups.values()].map(group=>{const template=powers.find(p=>p[0]===group.kind),effect=clampLegacy(group.effect);return {...group,effect,text:template?template[5](effect):group.text};});
}
