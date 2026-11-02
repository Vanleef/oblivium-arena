import {tacticalRoster} from './tactical-kits.js';
import {getRelevantBuffChoices} from './rules.js';

export const tacticalRoutes=Object.freeze([
 {id:'recovery',title:'Jardim de Cinzas',kind:'Recuperação',text:'Recupere 18 de Vida de cada sobrevivente antes do próximo confronto.',story:'Entre as ruínas, raízes pálidas guardam o calor das almas.'},
 {id:'risk',title:'Portão do Julgamento',kind:'Risco',text:'Rivais começam com 18 de Escudo extra. Na vitória, escolha entre até 4 aprimoramentos.',story:'Uma sentinela oferece passagem a quem aceitar seu julgamento.'},
 {id:'discovery',title:'Véu Errante',kind:'Descoberta',text:'Enfrente outro trio, determinado pela trilha e pela semente. A Vida é mantida.',story:'O caminho se dobra e revela presenças além da névoa.'}
]);
export function createTacticalRun(){return {encounter:1,buffs:[],memories:[],teamHealth:{},globalEffects:{},history:[],route:null,rewardCount:3};}

export function offerTacticalRewards(run,battle,seed=1){
 if(battle.phase!=='victory'||battle.tactical.stage!=='finished')return [];
 run.teamHealth=Object.fromEntries(battle.allies.map(unit=>[unit.id,unit.hp]));
 return getRelevantBuffChoices(battle.allies.map(unit=>unit.sourceId||unit.id),run.buffs,seed,run.rewardCount||3);
}

export function chooseTacticalReward(run,choices,id){
 if(!choices.some(choice=>choice.id===id)||run.buffs.includes(id))return false;
 run.buffs.push(id);return true;
}

export function advanceTacticalRun(run,battle,routeId=null){
 if(battle.phase!=='victory'||battle.tactical.stage!=='finished')return null;
 if(routeId&&!tacticalRoutes.some(r=>r.id===routeId))return null;
 const route=tacticalRoutes.find(r=>r.id===routeId);
 run.teamHealth=Object.fromEntries(battle.allies.map(u=>[u.id,u.hp>0&&routeId==='recovery'?Math.min(u.maxHp,u.hp+18):u.hp]));
 run.encounter++;run.route=route?.id||null;run.rewardCount=routeId==='risk'?4:3;
 if(route)(run.history??=[]).push({encounter:run.encounter,route:route.id,title:route.title});
 const ids=side=>battle[side==='player'?'allies':'enemies'].map(unit=>unit.sourceId||unit.id);
 const offset=((battle.rngState||battle.round)>>>0)+run.encounter*3;
 let opponents=routeId==='discovery'?Array.from({length:3},(_,i)=>tacticalRoster[(offset+i)%tacticalRoster.length]):ids('enemy');
 if(routeId==='discovery'&&opponents.every((id,i)=>id===ids('enemy')[i]))opponents=Array.from({length:3},(_,i)=>tacticalRoster[(offset+i+1)%tacticalRoster.length]);
 return {player:ids('player'),enemy:opponents,routeEnemyShield:routeId==='risk'?18:0,seed:(battle.rngState||battle.round)+run.encounter,buffs:[...run.buffs],memories:[...run.memories],globalEffects:{...run.globalEffects},teamHealth:{...run.teamHealth}};
}
