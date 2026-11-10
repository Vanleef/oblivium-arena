import {tacticalReplayFrames} from './tactical-cinematic.js';
import {tacticalCompactFrameDuration} from './tactical-animation.js';

export function onlineReplayFrames(event){
 if(!event?.before?.positions||!event?.after?.positions)return [];
 const actor=[...(event.before.allies||[]),...(event.before.enemies||[])].find(unit=>unit.id===event.actorId);
 const ability=actor?.abilities?.find(item=>item.id===event.abilityId);
 if(event.type!=='skill'||!actor||event.skipped){
  return [{snapshot:event.before,pose:null,duration:200},{snapshot:event.after,pose:null,duration:350}];
 }
 let contacted=false;
 const frames=tacticalReplayFrames(actor,ability,{...event,compactReplay:true});
 return frames.map((frame,index)=>{
  if(['impact','counter'].includes(frame.pose)||index===frames.length-1)contacted=true;
  const pose={...event,...frame};
  return {snapshot:contacted?event.after:event.before,pose,duration:tacticalCompactFrameDuration(pose)};
 });
}

export function onlineReplayBattle(battle,snapshot){
 return {...battle,allies:snapshot.allies,enemies:snapshot.enemies,round:snapshot.round,
  tactical:{...battle.tactical,positions:snapshot.positions,facings:snapshot.facings,
   surfaces:snapshot.surfaces,scene:snapshot.scene,width:snapshot.width,height:snapshot.height,
   fortress:snapshot.fortress,obstacles:snapshot.obstacles,objectives:{}}};
}
