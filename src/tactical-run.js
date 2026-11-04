import {campaignCreature} from './campaign-creatures.js';
import {tacticalRoster} from './tactical-kits.js';
import {getRelevantBuffChoices} from './rules.js';

export const tacticalRoutes=Object.freeze([
 {id:'recovery',title:'Jardim de Cinzas',kind:'Recuperação',text:'Recupere 18 de Vida de cada sobrevivente antes do próximo confronto.',story:'Entre as ruínas, raízes pálidas guardam o calor das almas.'},
 {id:'risk',title:'Portão do Julgamento',kind:'Risco',text:'Rivais começam com 18 de Escudo extra. Em Conquista, criaturas podem elevar a formação a 5 oponentes.',story:'Uma sentinela oferece passagem a quem aceitar seu julgamento.'},
 {id:'discovery',title:'Véu Errante',kind:'Descoberta',text:'Enfrente outro trio, determinado pela trilha e pela semente. A Vida é mantida.',story:'O caminho se dobra e revela presenças além da névoa.'}
]);
const conquestRewards=[
 {id:'shield',title:'Muralha da Travessia',text:'Comece cada confronto seguinte com 12 de Escudo em cada sobrevivente.'},
 {id:'heal',title:'Fonte das Almas',text:'Restaure até 14 de Vida de cada sobrevivente ao entrar em um confronto.'},
 {id:'purify',title:'Pele de Mármore',text:'Comece os próximos confrontos com 3 de Armadura adicional.'},
 {id:'leap',title:'Passagem dos Vultos',text:'Nos próximos confrontos, os sobreviventes podem saltar em L.'}
];
export function createTacticalRun(){return {encounter:1,buffs:[],memories:[],teamHealth:{},globalEffects:{},history:[],route:null,rewardCount:3,fortressRewards:[]};}

export function offerTacticalRewards(run,battle,seed=1){
 if(battle.phase!=='victory'||battle.tactical.stage!=='finished')return [];
 run.teamHealth=Object.fromEntries(battle.allies.map(unit=>[unit.id,unit.hp]));
 if(battle.tactical.fortress)return conquestRewards.filter(choice=>!(run.fortressRewards||[]).includes(choice.id)).slice(0,run.rewardCount||3).map(choice=>({...choice,fortress:true}));
 return getRelevantBuffChoices(battle.allies.map(unit=>unit.sourceId||unit.id),run.buffs,seed,run.rewardCount||3);
}

export function chooseTacticalReward(run,choices,id){
 const choice=choices.find(choice=>choice.id===id);
 if(!choice)return false;
 const rewards=choice.fortress?(run.fortressRewards??=[]):run.buffs;
 if(rewards.includes(id))return false;
 rewards.push(id);return true;
}

export function advanceTacticalRun(run,battle,routeId=null){
 if(battle.phase!=='victory'||battle.tactical.stage!=='finished')return null;
 if(routeId&&!tacticalRoutes.some(r=>r.id===routeId))return null;
 const route=tacticalRoutes.find(r=>r.id===routeId);
 run.teamHealth=Object.fromEntries(battle.allies.map(u=>[u.id,u.hp>0&&routeId==='recovery'?Math.min(u.maxHp,u.hp+18):u.hp]));
 run.encounter++;run.route=route?.id||null;run.rewardCount=routeId==='risk'?4:3;
 if(route)(run.history??=[]).push({encounter:run.encounter,route:route.id,title:route.title});
 const ids=side=>battle[side==='player'?'allies':'enemies'].filter(unit=>!unit.npcOnly).map(unit=>unit.sourceId||unit.id);
 const offset=((battle.rngState||battle.round)>>>0)+run.encounter*3;
 let opponents=routeId==='discovery'?Array.from({length:3},(_,i)=>tacticalRoster[(offset+i)%tacticalRoster.length]):ids('enemy');
 if(routeId==='discovery'&&opponents.every((id,i)=>id===ids('enemy')[i]))opponents=Array.from({length:3},(_,i)=>tacticalRoster[(offset+i+1)%tacticalRoster.length]);
 const creatures=battle.tactical.fortress&&routeId==='risk'
  ?Array.from({length:run.encounter>=4?2:1},(_,i)=>campaignCreature(battle.enemies[0].realm,i)):[];
 return {campaign:Boolean(battle.tactical.fortress),creatures,fortressRewards:[...(run.fortressRewards||[])],environment:battle.tactical.environment?.id||null,player:ids('player'),enemy:opponents,routeEnemyShield:routeId==='risk'?18:0,seed:(battle.rngState||battle.round)+run.encounter,buffs:[...run.buffs],memories:[...run.memories],globalEffects:{...run.globalEffects},teamHealth:{...run.teamHealth}};
}
