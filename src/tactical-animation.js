const sequences={
 move:['ready','anticipate','compress','launch','airborne','landing','settle','ready'],
 strike:['ready','anticipate','windup','release','impact','followthrough','recover','ready'],
 slash:['ready','anticipate','windup','release','impact','followthrough','recover','ready'],
 pierce:['ready','anticipate','compress','thrust','impact','withdraw','recover','ready'],
 projectile:['ready','gather','windup','release','travel','impact','recover','ready'],
 burst:['ready','anticipate','gather','windup','release','impact','recover','ready'],
 bind:['ready','anticipate','gather','release','spread','impact','hold','ready'],
 affliction:['ready','gather','inhale','release','spread','impact','recover','ready'],
 guard:['ready','anticipate','brace','guard','impact','hold','recover','ready'],
 counter:['ready','anticipate','brace','guard','deflect','counter','recover','ready'],
 support:['ready','anticipate','gather','release','impact','transfer','settle','ready']
};

export function tacticalAnimationFamily(ability,type='skill'){
 if(type==='move')return 'move';
 if(!ability)return 'strike';
 if(ability.counter)return 'counter';
 if(ability.defense||ability.invulnerable||ability.reduce)return 'guard';
 if(ability.heal||ability.regen||ability.shield&&['ally','friendly','team','self'].includes(ability.target)||['ally','friendly','team'].includes(ability.target))return 'support';
 if(ability.damageType==='affliction')return 'affliction';
 if(ability.dot||ability.dots||ability.mark||ability.stun||ability.sealAttack||ability.weaken)return 'bind';
 if(ability.target==='all-enemies'||ability.targetLimit>1)return 'burst';
 if(ability.damageType==='piercing')return 'pierce';
 if(ability.damageType==='energy')return 'projectile';
 if(ability.damageType==='physical'&&ability.damage)return 'slash';
 return 'strike';
}

export function tacticalAnimationFrames(ability,type='skill'){
 const family=tacticalAnimationFamily(ability,type);
 return sequences[family].map((pose,index)=>({family,pose,index,count:sequences[family].length}));
}

const actionArtPoses=new Set(['release','impact','followthrough','transfer','counter']);
export function tacticalImpactActive(event){
 return event?.type==='skill'&&!event.skipped&&['impact','counter'].includes(event.pose);
}
export function tacticalFrameArt(ability,pose,portrait=''){
 return ability?.art&&actionArtPoses.has(pose)?ability.art:portrait;
}
