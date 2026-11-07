// Objective emblems: symmetric, world-gated and never an out-of-band button.
// Cards improved here are battle-local; the ranked loadout and campaign save are untouched.
import {GRID_WIDTH,GRID_HEIGHT,insideGrid,gridDistance} from "./tactical-grid.js";

export const OBJECTIVE_TIERS=Object.freeze(["silver","gold","prismatic"]);
export const OBJECTIVE_LABELS=Object.freeze({silver:"Prata",gold:"Ouro",prismatic:"Prismático"});
export const OBJECTIVE_INTERVAL=4;
const rotateCell=cell=>({x:GRID_WIDTH-1-cell.x,y:GRID_HEIGHT-1-cell.y});
const key=cell=>cell.x+":"+cell.y;
export function campaignObjectiveTier(profile={}){
 const ids=new Set(profile.completedElos||[]);
 for(const [id,progress] of Object.entries(profile.eloProgress||{})){
  if((progress?.wins||0)>0||progress?.clearedDifficulties?.length)ids.add(id);
 }
 return ids.size>=12?"prismatic":ids.size>=5?"gold":"silver";
}
export function eligibleObjectivePairs(battle){
 if(!battle.grid)return [];
 const player=battle.allies.filter(u=>u.hp>0&&u.position);
 const enemy=battle.enemies.filter(u=>u.hp>0&&u.position);
 if(!player.length||!enemy.length)return [];
 const occupied=new Set([...player,...enemy].map(u=>key(u.position)));
 const pairs=[];
 for(let y=0;y<GRID_HEIGHT;y++)for(let x=0;x<GRID_WIDTH;x++){
  const point={x,y},other=rotateCell(point);
  if(key(point)===key(other)||occupied.has(key(point))||occupied.has(key(other)))continue;
  if(Math.min(...player.map(u=>gridDistance(u.position,point)))<3)continue;
  if(Math.min(...enemy.map(u=>gridDistance(u.position,other)))<3)continue;
  pairs.push({player:point,enemy:other});
 }
 return pairs;
}
export function spawnGridObjectives(battle,rng=Math.random){
 if(!battle.grid||!Number.isInteger(battle.round)||!(battle.round===1||(battle.round-1)%OBJECTIVE_INTERVAL===0))return [];
 if(!Array.isArray(battle.gridObjectives))battle.gridObjectives=[];
 const pairs=eligibleObjectivePairs(battle);
 if(!pairs.length)return battle.gridObjectives;
 const tier=OBJECTIVE_TIERS.includes(battle.objectiveTier)?battle.objectiveTier:"silver";
 const index=Math.min(pairs.length-1,Math.max(0,Math.floor(rng()*pairs.length)));
 const chosen=pairs[index];
 battle.gridObjectives=[{side:"player",...chosen.player,tier,round:battle.round},{side:"enemy",...chosen.enemy,tier,round:battle.round}];
 return battle.gridObjectives;
}
function cardUpgradeFor(unit,tier){
 const attack=unit?.abilities?.some(a=>a.damage>0);
 return attack?
  tier==="prismatic"?["damage","fire","retain"]:tier==="gold"?["damage","bleed"]:["damage"]:
  tier==="prismatic"?["vigor","vigor","retain"]:tier==="gold"?["vigor","retain"]:["vigor"];
}
export function applyObjectiveCardReward(battle,actor,tier){
 const deck=battle.cardCombat?.decks?.[actor.id];
 if(!deck)return null;
 const cards=[...deck.hand,...deck.draw,...deck.discard,...deck.exhaust].filter(c=>c.kind==="ability"&&Array.isArray(c.upgrades)&&c.upgrades.length<3);
 if(!cards.length)return null;
 const eligible=cards.map(card=>({card,ability:actor.abilities.find(a=>a.id===card.abilityId)})).filter(({ability})=>Boolean(ability));
 if(!eligible.length)return null;
 const offensive=eligible.filter(({ability})=>ability.damage>0);
 const choices=offensive.length?offensive:eligible;
 choices.sort((a,b)=>a.card.upgrades.length-b.card.upgrades.length||a.card.id.localeCompare(b.card.id));
 const {card,ability}=choices[0],raw=cardUpgradeFor(ability,tier);
 const bonus=raw.slice(0,3-card.upgrades.length);
 card.upgrades.push(...bonus);
 return {actorId:actor.id,actorName:actor.name,cardId:card.id,abilityId:card.abilityId,abilityName:ability.name,upgrades:bonus,tier};
}
export function collectGridObjectives(battle,moves=[]){
 if(!battle.grid||!battle.gridObjectives?.length)return [];
 const claimed=[],remaining=[];
 for(const objective of battle.gridObjectives){
  const move=moves.find(m=>m.side===objective.side&&m.to.x===objective.x&&m.to.y===objective.y);
  const actor=(objective.side==="player"?battle.allies:battle.enemies).find(u=>u.id===move?.actorId&&u.hp>0);
  if(!actor){remaining.push(objective);continue;}
  const reward=applyObjectiveCardReward(battle,actor,objective.tier);
  claimed.push({...objective,actorId:actor.id,actorName:actor.name,reward});
 }
 battle.gridObjectives=remaining;
 return claimed;
}
