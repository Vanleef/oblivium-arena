import {getRelevantBuffChoices} from './rules.js';

export function createTacticalRun(){return {encounter:1,buffs:[],memories:[],teamHealth:{},globalEffects:{}};}

export function offerTacticalRewards(run,battle,seed=1){
 if(battle.phase!=='victory'||battle.tactical.stage!=='finished')return [];
 run.teamHealth=Object.fromEntries(battle.allies.map(unit=>[unit.id,unit.hp]));
 return getRelevantBuffChoices(battle.allies.map(unit=>unit.sourceId||unit.id),run.buffs,seed,3);
}

export function chooseTacticalReward(run,choices,id){
 if(!choices.some(choice=>choice.id===id)||run.buffs.includes(id))return false;
 run.buffs.push(id);return true;
}

export function advanceTacticalRun(run,battle){
 if(battle.phase!=='victory'||battle.tactical.stage!=='finished')return null;
 run.encounter++;
 const ids=side=>battle[side==='player'?'allies':'enemies'].map(unit=>unit.sourceId||unit.id);
 return {player:ids('player'),enemy:ids('enemy'),seed:(battle.rngState||battle.round)+run.encounter,buffs:[...run.buffs],memories:[...run.memories],globalEffects:{...run.globalEffects},teamHealth:{...run.teamHealth}};
}
