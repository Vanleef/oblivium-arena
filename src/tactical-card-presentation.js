import {tacticalCardVariants} from './tactical-decks.js';
import {conquestTechnique} from './conquest-techniques.js';
import {conquestAugmentedAbility} from './conquest-augments.js';
const damageTypes={physical:'físico',energy:'de energia',piercing:'perfurante',affliction:'de aflição',fire:'de Fogo',water:'de Água',air:'de Ar',light:'de Luz',shadow:'de Sombra'};
export function tacticalHandFanStyle(index,count){
 const distance=index-(count-1)/2;
 return `--hand-angle:${Math.max(-8,Math.min(8,distance*2.5))}deg;--hand-drop:${Math.min(8,Math.abs(distance)*2)}px;`;
}

export function tacticalCardArtMarkup(ability,escape,placeholder='✦'){
 return ability?.art
  ?'<span class="hand-card-art" data-art-missing="false"><img src="'+escape(ability.art)+'" alt="" loading="lazy" decoding="async"></span>'
  :'<span class="hand-card-art hand-card-art-placeholder" aria-hidden="true">'+escape(placeholder)+'</span>';
}

export function restoreTacticalHand(root,selector,attribute,id,scrollLeft,focus){
 const hand=root.querySelector(selector);
 if(!hand)return;
 hand.scrollLeft=scrollLeft;
 if(focus){
  const card=Array.from(hand.querySelectorAll('button')).find(button=>button.dataset[attribute]===id);
  card?.focus({preventScroll:true});
 }
}

// Describe the effective compact technique, without changing its resolution.
export function tacticalCardPresentation(battle,actor,card){
 const variant=tacticalCardVariants.find(item=>item.id===card?.variantId);
 const traits=[],upgrade=card?.upgrade||{};
 if(upgrade.opening)traits.push('Inicial');
 if(upgrade.retain)traits.push('Preservar');
 if(upgrade.exhaust)traits.push('Exaurir');
 if(upgrade.damageBonus)traits.push('Inscrição: +'+upgrade.damageBonus+' dano');
 if(upgrade.damageType)traits.push('Dano '+(damageTypes[upgrade.damageType]||upgrade.damageType));
 const base=actor?.abilities?.find(ability=>ability.id===card?.abilityId);
 const ability=base?conquestAugmentedAbility(battle,actor,conquestTechnique(base)):null;
 let description=ability?.description||'';
 if(card?.kind==='mobility')description=variant?.description||'Percorra até 2 casas com esta carta de mobilidade.';
 else if(card?.kind==='reaction')description=variant?.description||'Gaste durante um Confronto de Vontades para responder ao especial.';
 else if(ability){
  const original=ability.damage||0,total=original+(upgrade.damageBonus||0);
  if(total>0){
   const type=damageTypes[upgrade.damageType||ability.damageType]||ability.damageType||'';
   const lead='Causa '+total+' de dano'+(type?' '+type:'')+'.';
   description=original>0?description.replace(/^Causa [\d.]+ de dano[^.]*\./,lead):lead+' '+description;
  }
  if(upgrade.weaken&&!ability.weaken)description+=' Aplica Enfraquecido.';
  if(upgrade.expose&&!ability.expose)description+=' Aplica Exposto.';
 }
 description=description.replace(/(\d+) rodada\(s\)/g,(_,n)=>n+' '+(n==='1'?'rodada':'rodadas')).replace(/\s+/g,' ').trim();
 return {name:ability?.name||card?.name||'Técnica',ability,description:description||'Consulte o efeito da técnica.',traits};
}

export function tacticalCardTraitsMarkup(traits,escape){
 return traits.length?'<span class="hand-card-traits">'+traits.map(trait=>'<span>'+escape(trait)+'</span>').join('')+'</span>':'';
}

// Use the actual skill artwork first; utility cards inherit their owner's portrait.
export function tacticalUtilityArtMarkup(actor,kind,escape){
 const glyph=kind==='reaction'?'↶':kind==='basic'?'✦':'➜';
 return tacticalCardArtMarkup({art:actor?.art?.portrait},escape,glyph)
  .replace('</span>','<i class="hand-card-kind-mark" aria-hidden="true">'+glyph+'</i></span>');
}

export function handleTacticalCardArtError(event){
 const image=event.target;
 if(!image?.matches?.('.hand-card-art img'))return;
 image.hidden=true;
 image.parentElement.dataset.artMissing='true';
}
