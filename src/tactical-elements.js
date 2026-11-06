import {boardCells,cellKey,obstacle,onBoard} from './tactical-board.js';

export const elements=Object.freeze({
 water:{label:'Água',surface:'Poça de água',hint:'Reduz dano de Fogo em 25%. Ar e Eletricidade causam 25% a mais e atordoam.'},
 oil:{label:'Óleo',surface:'Poça de óleo',hint:'Fogo causa 50% a mais e incendeia a poça.'},
 fire:{label:'Fogo',surface:'Chamas',hint:'Fogo causa 25% a menos. Água causa 25% a mais e apaga as chamas.'},
 air:{label:'Ar',surface:'Corrente de ar',hint:'Reduz dano de Ar em 25%.'},
 electric:{label:'Eletricidade',surface:'Piso eletrificado',hint:'Aumenta dano elétrico recebido em 25%.'}
});

const innate={
 'a-viuva-escarlate':{impulso:'water'},
 'o-odio-encarnado':{voto:'fire'},
 'a-arquiteta-verde':{impulso:'oil'},
 'o-passo-interrompido':{voto:'air'},
 'o-escudo-vivo':{voto:'electric'},
 naomi:{impulso:'fire'},
 'a-pira-errante':{impulso:'fire'},
 'a-brasa-eterna':{impulso:'fire'}
};
export function techniqueElement(actor,ability){
 const element=ability?.element===undefined?innate[actor?.sourceId||actor?.id]?.[ability?.id]:ability.element;
 return Object.hasOwn(elements,element)?element:null;
}

export function surfaceAt(s,point){
 const surface=point&&s.tactical?.surfaces?.[cellKey(point)];
 return surface?.until>s.round?surface:null;
}

const damageFactors={
 water:{fire:.75,air:1.25,electric:1.25},
 oil:{fire:1.5},
 fire:{fire:.75,water:1.25},
 air:{air:.75},
 electric:{electric:1.25}
};
export function surfaceDamageFactor(s,targetId,element){
 const surface=surfaceAt(s,s.tactical?.positions?.[targetId]);
 return damageFactors[surface?.element]?.[element]??1;
}

export function applyElementalArea(s,element,cells,targets){
 const surfaces=s.tactical.surfaces,stuns=[],changes={};
 for(const unit of targets){
  if(unit.hp<=0||unit.invulnerable)continue;
  const current=surfaceAt(s,s.tactical.positions[unit.id])?.element;
  if(current==='water'&&['air','electric'].includes(element)){
   unit.stunned=Math.max(unit.stunned,1);
   (unit.boardFresh??={}).stunned=s.round;
   stuns.push(unit.id);
  }
 }
 for(const point of cells){
  const key=cellKey(point),current=surfaceAt(s,point)?.element;
  if(current==='water'&&element==='fire'||current==='fire'&&element==='water'){
   delete surfaces[key];changes[key]='steam';
  }else{
   surfaces[key]={element,until:s.round+2};
   if(current==='oil'&&element==='fire')changes[key]='ignite';
   if(current==='water'&&element==='electric')changes[key]='conduct';
  }
 }
 return {stuns,changes};
}

export function pruneSurfaces(s){
 for(const [key,{until}] of Object.entries(s.tactical.surfaces)){
  const [x,y]=key.split(',').map(Number);
  if(until<=s.round||!onBoard({x,y},s))delete s.tactical.surfaces[key];
 }
}

const weather=[
 {id:'storm',title:'Tempestade',description:'Raios atordoam um combatente de cada lado. O piso atingido fica eletrificado por 5 rodadas.'},
 {id:'wind',title:'Vendaval',description:'Nesta rodada, mova-se até uma casa adicional em linha reta, com o caminho livre.'},
 {id:'rain',title:'Chuva',description:'A chuva apaga chamas e deixa poças por 2 rodadas.'}
];
// Public forecast: the four-round cadence is known, but future strikes remain hidden.
export function tacticalFieldForecast(s){
 const round=Number.isInteger(s?.round)&&s.round>=1?s.round:1;
 const nextRound=round+4-round%4;
 const weather=s?.tactical?.weather;
 return {nextRound,roundsRemaining:nextRound-round,active:weather?.round===round?{id:weather.id,title:weather.title,description:weather.description}:null};
}

export function applyFieldEvent(s){
 if(s.round%4)return null;
 const source=weather[(s.round/4-1)%weather.length];
 const event=s.tactical.compact&&source.id==='wind'?{...source,description:'Nesta rodada, cada movimento continua com 1 casa e concede +5 de Escudo ao personagem que se mover.'}:source;
 s.tactical.weather={...event,round:s.round};
 const free=boardCells(s).filter(p=>!obstacle(s,p)),cells=[],strikes=[];
 if(event.id==='storm'){
  for(const units of [s.allies,s.enemies]){
   const living=units.filter(u=>u.hp>0);
   const unit=living[(s.round/4-1)%living.length];
   if(!unit)continue;
   unit.stunned=Math.max(unit.stunned,1);
   const point=s.tactical.positions[unit.id];
   strikes.push(point);cells.push(point);
  }
 }
 if(event.id!=='wind'){
  const chosen=new Set(cells.map(cellKey));
  const open=free.filter(p=>!chosen.has(cellKey(p))&&![...s.allies,...s.enemies].some(u=>u.hp>0&&cellKey(s.tactical.positions[u.id])===cellKey(p)));
  cells.push(...open.filter((_,index)=>(index+s.round)%9===0).slice(0,5));
  if(event.id==='storm')for(const point of cells)s.tactical.surfaces[cellKey(point)]={element:'electric',until:s.round+5};
  else {
   for(const point of free)if(surfaceAt(s,point)?.element==='fire')delete s.tactical.surfaces[cellKey(point)];
   applyElementalArea(s,'water',cells,[]);
  }
 }
 return {...event,cells,strikes};
}
