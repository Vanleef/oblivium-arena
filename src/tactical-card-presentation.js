export function tacticalHandFanStyle(index,count){
 const distance=index-(count-1)/2;
 return `--hand-angle:${Math.max(-8,Math.min(8,distance*2.5))}deg;--hand-drop:${Math.min(8,Math.abs(distance)*2)}px;`;
}

export function tacticalCardArtMarkup(ability,escape,placeholder='✦'){
 return ability?.art
  ?'<span class="hand-card-art"><img src="'+escape(ability.art)+'" alt="" loading="lazy" decoding="async"></span>'
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
