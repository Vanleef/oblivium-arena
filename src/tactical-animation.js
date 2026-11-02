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
// A multi-target action can damage one target while another is protected.
// Use the replay snapshots to animate only units that actually lost HP or shield.
export function tacticalDamagedTargets(event){
 if(!tacticalImpactActive(event)||!(event.totalDamage>0))return [];
 const candidates=event.affectedTargetIds||event.targets||[];
 if(!event.before||!event.after)return candidates;
 const units=s=>[...(s.allies||[]),...(s.enemies||[])];
 const before=new Map(units(event.before).map(u=>[u.id,u]));
 const after=new Map(units(event.after).map(u=>[u.id,u]));
 return candidates.filter(id=>{
  const a=before.get(id),b=after.get(id);
  return a&&b&&((b.hp??0)<(a.hp??0)||(b.shield??0)<(a.shield??0));
 });
}
// Keep the impact visible for the full target-reaction animation before
// playback advances and removes the affected-cell classes.
export function tacticalFrameDuration(event){
 if(event?.type==='move'&&event.pose==='airborne')return 280;
 if(event?.type==='move'&&event.pose==='landing')return 160;
 if(event?.type==='skill'&&!event.skipped){
  if(tacticalImpactActive(event))return 560;
  if(['travel','spread'].includes(event.pose))return 340;
  if(event.pose==='windup'||event.pose==='brace')return 180;
  if(event.index===0||['anticipate','gather','inhale','compress'].includes(event.pose))return 120;
  if(event.pose==='release')return 100;
 }
 return 65;
}
export function tacticalFrameArt(ability,pose,portrait=''){
 return ability?.art&&actionArtPoses.has(pose)?ability.art:portrait;
}

