import {conquestTechnique} from './conquest-techniques.js';
import {boardCells,boardTracks,canStep,cellKey,distance,obstacle,occupied,onBoard,sameCell} from './tactical-board.js';
import {augmentTiers,conquestProgress} from './conquest-augments.js';
const sides=['player','enemy'];
const team=(s,side)=>(side==='player'?s.allies:s.enemies).filter(u=>u.hp>0);
const hash=text=>[...String(text)].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,2166136261);
export const objectiveGrowth=count=>1+.28*(1-Math.pow(.68,Math.max(0,Number.isFinite(count)?count:0)));
export function objectiveMinimumDistance(s,initial=false){
 // One step per action needs an approachable objective even on the expanded 6×6 field.
 if(s.tactical.compact)return initial?3:2;
 const tracks=boardTracks(s),span=Math.max(tracks.columns.length-1,tracks.rows.length-1);
 return Math.max(1,Math.ceil((initial?5:3)*span/8));
}
function reachableCells(s,side){
 const pending=team(s,side).map(u=>s.tactical.positions[u.id]),seen=new Set(pending.map(cellKey));
 // Characters can move later; terrain must permit a route from the team.
 const cells=boardCells(s);
 while(pending.length){const from=pending.shift();for(const to of cells){
  if(seen.has(cellKey(to))||!canStep(s,null,from,to,{through:true}))continue;
  seen.add(cellKey(to));pending.push(to);
 }}return seen;
}
function waveTier(s){
 const progress=conquestProgress(s.tactical.fortress.progress),wave=Math.min(...sides.map(side=>s.tactical.objectiveClaims[side]));
 const roll=hash([s.tactical.objectiveSeed,wave,'tier'].join(':'))%100;
 return progress.completedKingdoms.length>=8&&roll<18?'prismatic':progress.completedKingdoms.length>=3&&roll<55?'gold':'silver';
}
export function refreshConquestObjectives(s){
 if(!s.tactical.fortress)return;
 s.tactical.objectives??={};s.tactical.objectiveClaims??={player:0,enemy:0};s.tactical.objectiveSeed??=s.rngState||1;
 const tier=waveTier(s);
 for(const side of sides){
  const existing=s.tactical.objectives[side];
  if(existing&&onBoard(existing.position,s)&&!obstacle(s,existing.position)){existing.tier=tier;continue;}
  const living=team(s,side);if(!living.length){delete s.tactical.objectives[side];continue;}
  const sequence=s.tactical.objectiveClaims[side],minimum=objectiveMinimumDistance(s,sequence===0),reachable=reachableCells(s,side);
  const available=boardCells(s).filter(p=>!occupied(s,p)&&!obstacle(s,p)&&reachable.has(cellKey(p))&&living.every(u=>distance(p,s.tactical.positions[u.id],s)>=minimum));
  const seed=[s.tactical.objectiveSeed,side,sequence,s.round].join(':');
  available.sort((a,b)=>hash(seed+cellKey(a))-hash(seed+cellKey(b))||a.y-b.y||a.x-b.x);
  if(available[0])s.tactical.objectives[side]={id:'objective:'+side+':'+sequence,side,tier,position:available[0],minimumDistance:minimum};
  // Defer if every legal tile is unavailable, instead of violating the distance.
  else delete s.tactical.objectives[side];
 }
}
export function collectConquestObjective(s,side,actorId,to){
 const objective=s.tactical.objectives?.[side];
 if(!objective||!sameCell(to,objective.position)||!team(s,side).some(u=>u.id===actorId))return null;
 delete s.tactical.objectives[side];s.tactical.objectiveClaims[side]++;
 return {id:objective.id,side,actorId,fortress:true,objective:true,source:'objective',tier:objective.tier,tierName:augmentTiers[objective.tier].label,rerolls:0};
}
export function fortressPenaltyOptions(){return [
 {id:'siege-weaken',title:'Abalar a Equipe',category:'Equipe adversária',text:'Aplica Enfraquecido à equipe adversária por 1 rodada.',effect:{type:'fortress-penalty',scope:'team',status:'weakened'}},
 {id:'siege-expose',title:'Romper a Guarda',category:'Equipe adversária',text:'Aplica Exposto à equipe adversária por 1 rodada.',effect:{type:'fortress-penalty',scope:'team',status:'exposed'}},
 {id:'siege-seal',title:'Selar a Ofensiva',category:'Um adversário',text:'Selecione um adversário: sela suas técnicas ofensivas por 1 rodada.',effect:{type:'fortress-penalty',scope:'single',status:'sealAttack'}}
];}
export function applyFortressPenalty(s,side,effect,targetId,earnedRound=s.round){
 if(!sides.includes(side)||!['weakened','exposed','sealAttack'].includes(effect?.status))return {ok:false,reason:'Penalidade inválida.'};
 const appliedRound=Number.isSafeInteger(earnedRound)?Math.min(s.round,Math.max(1,earnedRound)):s.round;
 const rivals=team(s,side==='player'?'enemy':'player'),targets=effect.scope==='team'?rivals:rivals.filter(u=>u.id===targetId);
 if(!targets.length)return {ok:false,reason:'Selecione um adversário vivo.'};
 for(const unit of targets){unit[effect.status]=Math.max(unit[effect.status]||0,1);unit.boardFresh??={};unit.boardFresh[effect.status]=Math.max(unit.boardFresh[effect.status]||0,appliedRound);}
 return {ok:true,targetIds:targets.map(u=>u.id)};
}

// Only public unit information is consulted, never an opponent's sealed order.
export function chooseFortressPenalty(s,side,options=fortressPenaltyOptions()){
 const rivals=team(s,side==='player'?'enemy':'player'),own=team(s,side);
 const offense=unit=>Math.max(0,...unit.abilities.filter(a=>!['self','ally','friendly','team'].includes(a.target)&&(unit.cooldowns[a.id]||0)<=1).map(a=>{
  const skill=conquestTechnique(a);return (skill.damage||0)+(skill.stun?8:0)+(skill.combo?.bonusDamage||0)+(skill.perChargeDamage||0)*Math.min(3,unit.charge||0);
 }));
 let best=null;
 for(const option of options){
  const {scope,status}=option.effect,groups=scope==='single'?rivals.map(unit=>[unit]):[rivals];
  for(const targets of groups){
   const score=targets.reduce((total,unit)=>{
    if(unit[status])return total;
    const threat=offense(unit);
    if(status==='weakened')return total+Math.min(10,threat);
    if(status==='sealAttack')return total+threat*.65;
    const reachable=own.some(ally=>distance(s.tactical.positions[ally.id],s.tactical.positions[unit.id],s)<=3);
    return total+(reachable?10:3);
   },0);
   if(!best||score>best.score)best={option,targetId:scope==='single'?targets[0]?.id:undefined,score};
  }
 }return best;
}
