import {describeAbility} from './kits.js';

// Repair the duplicated fourth skill in battles created before expanded kits
// reserved `despertar` for the defensive skill. Safe to run more than once.
export function migrateBattleSkillIds(battle){
 if(!battle)return false;
 const repaired=new Set();let changed=false;
 for(const unit of [...(battle.allies||[]),...(battle.enemies||[])]){
  const book=unit.skillBook||unit.abilities||[];
  if(unit.storyCharacter&&book.some(a=>a.id==='despertar'&&a.defense)&&book.some(a=>a.id==='despertar'&&!a.defense)){
   repaired.add(unit.id);changed=true;
   for(const list of [unit.skillBook,unit.abilities])for(const ability of list||[]){
    if(ability.id==='despertar'&&!ability.defense)ability.id='tecnica-4';
    if(ability._formRoot?.id==='despertar'&&!ability._formRoot.defense)ability._formRoot.id='tecnica-4';
   }
  }
  if((unit.sourceId||unit.id)==='vaas-o-sem-rosto'&&book.some(a=>a.id==='impulso'&&!a.mark)){
   changed=true;
   for(const list of [unit.skillBook,unit.abilities])for(const ability of list||[]){
    if(ability.id!=='impulso'||ability.mark)continue;
    ability.mark='identidade';ability.markTurns=3;ability.description=describeAbility(ability);
    if(ability._formRoot){ability._formRoot.mark='identidade';ability._formRoot.markTurns=3;ability._formRoot.description=describeAbility(ability._formRoot);}
   }
  }
 }
 // Before this repair, the first matching `despertar` was always the fourth
 // non-defensive skill. Preserve already queued actions with that meaning.
 for(const list of [battle.queue,battle.intents,battle.resolution])for(const action of list||[])
  if(repaired.has(action.actorId)&&action.abilityId==='despertar')action.abilityId='tecnica-4';
 return changed;
}
