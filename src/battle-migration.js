// Repair the duplicated fourth skill in battles created before expanded kits
// reserved `despertar` for the defensive skill. Safe to run more than once.
export function migrateBattleSkillIds(battle){
 if(!battle)return false;
 const repaired=new Set();
 for(const unit of [...(battle.allies||[]),...(battle.enemies||[])]){
  const book=unit.skillBook||unit.abilities||[];
  if(!unit.storyCharacter||!book.some(a=>a.id==='despertar'&&a.defense)||!book.some(a=>a.id==='despertar'&&!a.defense))continue;
  repaired.add(unit.id);
  for(const list of [unit.skillBook,unit.abilities])for(const ability of list||[]){
   if(ability.id==='despertar'&&!ability.defense)ability.id='tecnica-4';
   if(ability._formRoot?.id==='despertar'&&!ability._formRoot.defense)ability._formRoot.id='tecnica-4';
  }
 }
 // Before this repair, the first matching `despertar` was always the fourth
 // non-defensive skill. Preserve already queued actions with that meaning.
 for(const list of [battle.queue,battle.intents,battle.resolution])for(const action of list||[])
  if(repaired.has(action.actorId)&&action.abilityId==='despertar')action.abilityId='tecnica-4';
 return repaired.size>0;
}
