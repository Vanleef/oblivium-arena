const sequences={
 move:['ready','anticipate','compress','launch','airborne','landing','settle','ready'],
 strike:['ready','anticipate','windup','release','impact','followthrough','recover','ready'],
 burst:['ready','anticipate','gather','windup','release','impact','recover','ready'],
 bind:['ready','anticipate','gather','release','impact','hold','release-hold','ready'],
 guard:['ready','anticipate','brace','guard','impact','hold','recover','ready'],
 support:['ready','anticipate','gather','release','impact','transfer','settle','ready']
};

export function tacticalAnimationFamily(ability,type='skill'){
 if(type==='move')return 'move';
 if(!ability)return 'strike';
 if(ability.defense||ability.invulnerable||ability.counter||ability.reduce)return 'guard';
 if(ability.heal||ability.regen||['ally','friendly','team','self'].includes(ability.target))return 'support';
 if(ability.dot||ability.dots||ability.mark||ability.stun||ability.sealAttack||ability.weaken)return 'bind';
 if(ability.target==='all-enemies'||ability.targetLimit>1)return 'burst';
 return 'strike';
}

export function tacticalAnimationFrames(ability,type='skill'){
 const family=tacticalAnimationFamily(ability,type);
 return sequences[family].map((pose,index)=>({family,pose,index,count:sequences[family].length}));
}

const actionArtPoses=new Set(['release','impact','followthrough','transfer']);
export function tacticalFrameArt(ability,pose,portrait=''){return ability?.art&&actionArtPoses.has(pose)?ability.art:portrait;}
