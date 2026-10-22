import { seededRandom, shuffled } from './progression.js';
import { elos } from './data.js';
const event=(id,title,lore,eloIds,effect,description)=>({id,title,lore,eloIds,effect,description});
export const worldInfluences=[
 event('remessa','A remessa dos condenados','Mentiras alimentam uma nova onda de violência entre os vivos.',['mentira','sangria'],{maxHp:12},'+12 de Vida máxima'),
 event('incendios','Cidades em cinzas','Incêndios atravessam a madrugada. O calor alcança o outro lado.',['chama'],{damage:4},'+4 de dano direto'),
 event('escassez','Mesas vazias','A fome dos vivos ecoa nas profundezas.',['fome','carne'],{damage:3},'+3 de dano direto'),
 event('socorro','Uma vida por outra','Equipes de resgate recusam abandonar os feridos.',['cura','protecao'],{heal:4,shield:8},'+4 de cura direta e 8 de Defesa'),
 event('testemunhas','Vozes que resistem','Testemunhas enfrentam os poderosos para revelar a verdade.',['verdade','justica'],{damage:3,shield:6},'+3 de dano direto e 6 de Defesa'),
 event('reconstrucao','Depois da queda','Comunidades reconstroem aquilo que parecia perdido.',['criacao','esperanca','uniao'],{maxHp:10,shield:6},'+10 de Vida máxima e 6 de Defesa'),
 event('esquecidos','Nomes apagados','Os vivos deixam de lembrar aqueles que partiram.',['silencio','vazio','correntes-quebradas'],{damage:3,shield:8},'+3 de dano direto e 8 de Defesa'),
 event('imperio','O preço do poder','Governantes celebram enquanto suas cidades adoecem.',['coroa','podridao'],{maxHp:14},'+14 de Vida máxima'),
 event('luto','Vigília dos vivos','Milhares acendem uma luz por quem morreu.',[],{shield:8},'Todos os personagens vivos recebem 8 de Defesa'),
 event('clamor','O clamor atravessa','Um grito coletivo rompe a fronteira entre os mundos.',[],{damage:2},'Todos os personagens vivos recebem +2 de dano direto'),
 event('abrigo','Último abrigo','Estranhos abrem suas portas durante uma noite de medo.',[],{maxHp:8},'Todos os personagens vivos recebem +8 de Vida máxima'),
 {...event('promessa','Promessa de retorno','Uma promessa mantém acesa a vontade de sobreviver.',[],{heal:3},'Personagens com técnicas de cura recebem +3 de cura direta'),type:'healer'},
 {...event('barricadas','Barricadas na madrugada','Os vivos erguem barreiras para proteger quem ainda resiste.',[],{shield:12},'Personagens com técnicas de Defesa recebem 12 de Defesa'),type:'guardian'},
 {...event('contagio','O contágio invisível','Uma doença silenciosa atravessa as fronteiras dos vivos.',[],{maxHp:10},'Personagens com técnicas de aflição recebem +10 de Vida máxima'),type:'afflicter'}
];
const units=s=>[...s.allies,...s.enemies];
const techniques=u=>u.abilities.flatMap(a=>[a,...(a.forms||[])]);
const matchesType=(e,u)=>!e.type||techniques(u).some(a=>e.type==='healer'?a.heal||a.perChargeHeal:e.type==='guardian'?a.shield||a.reduce:a.dot||a.reactive?.damage);
export const influenceTargets=(e,list)=>list.filter(u=>u.hp>0&&matchesType(e,u)&&(!e.eloIds.length||e.eloIds.includes(u.eloId)));
export const influenceScope=e=>e.eloIds.length?e.eloIds.map(id=>elos.find(e=>e.id===id)?.name||id).join(' · '):e.type==='healer'?'Técnicas de cura':e.type==='guardian'?'Técnicas de Defesa':e.type==='afflicter'?'Técnicas de aflição':'Todos os Elos';
export function influenceOffers(s,seed=1){
 const available=worldInfluences.filter(e=>influenceTargets(e,units(s)).length&&!s.worldEvents?.some(p=>p.id===e.id));
 const relevant=worldInfluences.filter(e=>influenceTargets(e,units(s)).length);
 const pool=available.length>=3?available:relevant.length>=3?relevant:worldInfluences.filter(e=>!e.eloIds.length&&!e.type);
 const rng=seededRandom(seed);return shuffled(pool,rng).slice(0,3);
}
export function applyInfluence(s,id,side){
 const e=worldInfluences.find(e=>e.id===id);if(!e)throw new Error('Evento desconhecido');
 for(const u of influenceTargets(e,units(s))){
  u.persistentMaxHp??=u.maxHp;
  if(e.effect.maxHp){const ratio=u.hp/u.maxHp;u.maxHp+=e.effect.maxHp;u.hp=Math.max(1,Math.round(u.maxHp*ratio));}
  u.shield=Math.min(80,u.shield+(e.effect.shield||0));u.worldDamage=(u.worldDamage||0)+(e.effect.damage||0);u.worldHeal=(u.worldHeal||0)+(e.effect.heal||0);
 }
 (s.worldEvents||=[]).push({id,side,title:e.title});
}
export function persistentCombatHp(u){return u.hp<=0?0:Math.max(1,Math.round(u.hp*(u.persistentMaxHp||u.maxHp)/u.maxHp));}
export function beginInfluences(s,seed=1){s.worldSeed=Number(seed)||1;s.worldEvents=[];s.eventDeaths=units(s).filter(u=>u.hp<=0).map(u=>u.id);s.influenceQueue=[{side:'player',reason:'O mundo dos vivos se agita'},{side:'enemy',reason:'Escolha da oposição'}];s.influenceResume=s.phase;openInfluence(s);}
function openInfluence(s){
 const next=s.influenceQueue.shift();if(!next){s.influenceDraft=null;s.phase=s.influenceResume;return;}
 const options=influenceOffers(s,s.worldSeed+37*s.worldEvents.length+101*s.eventDeaths.length);
 // The AI chooses from public rosters only, before consulting a human choice.
 s.influenceDraft={...next,options:options.map(e=>e.id)};s.phase='influence';
 if(next.side==='enemy'&&!s.humanSides){
  const score=e=>influenceTargets(e,s.enemies).length*2-influenceTargets(e,s.allies).length;
  const choice=[...options].sort((a,b)=>score(b)-score(a))[0];applyInfluence(s,choice.id,'enemy');openInfluence(s);
 }
}
export function chooseInfluence(s,id){if(s.phase!=='influence'||!s.influenceDraft?.options.includes(id))return false;applyInfluence(s,id,s.influenceDraft.side);openInfluence(s);return true;}
export function checkDeathInfluences(s){
 if(s.worldSeed===undefined)return false;
 const fallen=units(s).filter(u=>u.hp<=0&&!s.eventDeaths.includes(u.id));if(!fallen.length)return false;
 s.eventDeaths.push(...fallen.map(u=>u.id));s.influenceResume=s.phase;s.influenceQueue=fallen.map(u=>({side:u.side,reason:`${u.name} caiu`,fallenId:u.id}));openInfluence(s);return s.phase==='influence';
}
