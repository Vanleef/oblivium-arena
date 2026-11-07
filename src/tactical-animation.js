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

export function tacticalImpactActive(event){
 return ['skill','guard'].includes(event?.type)&&!event.skipped&&['impact','counter'].includes(event.pose);
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
 if(event?.type==='move'){
  return ({ready:85,anticipate:125,compress:110,launch:95,airborne:310,landing:150,settle:115})[event.pose]||120;
 }
 if(event?.type==='skill'&&!event.skipped){
  const exchange=event.presentation==='exchange';
  if(tacticalImpactActive(event))return exchange?340:430;
  if(['travel','spread'].includes(event.pose))return exchange?280:310;
  if(['windup','brace','guard'].includes(event.pose))return exchange?120:190;
  if(['anticipate','gather','inhale','compress'].includes(event.pose))return exchange?95:135;
  if(['release','thrust'].includes(event.pose))return 115;
  if(['recover','settle','withdraw','transfer','hold','followthrough'].includes(event.pose))return exchange?105:150;
 }
 if(event?.type==='guard')return event.pose==='impact'?295:105;
 return event?.presentation==='exchange'?85:95;
}
// Impact readouts use 420ms animations, with 36ms staggering per additional
// line at a target. Do not advance the board while the hit or heal is still visible.
export function tacticalCompactFrameDuration(event,feedbackStack=1){
 const base=Math.min(330,tacticalFrameDuration(event));
 if(event?.skipped||!['impact','counter'].includes(event?.pose))return base;
 const stack=Math.max(1,Math.floor(Number.isFinite(feedbackStack)?feedbackStack:1));
 return Math.max(base,460,Math.min(620,460+(stack-1)*36));
}

export function tacticalFrameArt(ability,pose,portrait=''){
 // Character cut-ins and ability illustrations belong to the card/VFX layer.
 // The board token keeps its registered character portrait for every pose.
 return portrait;
}


