import {kingdomById} from './kingdoms.js';

const whole=value=>Number.isSafeInteger(value)&&value>=0?value:0;
export function conquestProgress(value={}){
 const completedKingdoms=[...new Set(Array.isArray(value.completedKingdoms)?value.completedKingdoms:[])].filter(id=>Object.hasOwn(kingdomById,id)).sort();
 const spentSpins=whole(value.spentSpins);
 return {completedKingdoms,spentSpins,spins:Math.max(0,completedKingdoms.length*2-spentSpins)};
}
export function syncConquestCampaign(profile,previous={}){
 const ids=Object.entries(profile.eloProgress||{}).filter(([,p])=>p.clearedDifficulties?.length>0).map(([id])=>id);
 const saved=conquestProgress(profile.conquestAugments);
 const local=conquestProgress(previous);
 const progress=conquestProgress({
  completedKingdoms:[...ids,...(profile.completedElos||[])],
  spentSpins:Math.max(saved.spentSpins,local.spentSpins)
 });
 profile.conquestAugments=progress;
 return progress;
}
