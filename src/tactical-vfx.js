// Shared effect families; these are not character-specific skill artwork.
const rows=Object.freeze({strike:0,slash:0,pierce:0,burst:0,projectile:0,bind:1,affliction:1,support:2,guard:3,counter:3});
export const tacticalVfxAtlas=Object.freeze({src:'/art/animations/tactical-vfx-20261102/impact-families.webp',columns:6,rows:4});
export function tacticalVfxRow(family){return rows[family]??null;}
export function tacticalVfxMarkup(family){
 const row=tacticalVfxRow(family);
 return row===null?'':`<span class="cell-vfx" aria-hidden="true" style="--vfx-row:${row*100/3}%"></span>`;
}

export function tacticalExchangeVfxMarkup(family,realm,source,point){
 if(tacticalVfxRow(family)===null)return '';
 const world=realm==='Inferno'?'inferno':realm==='Paraíso'?'paraiso':'limbo';
 const dx=source&&point?point.x-source.x:0,dy=source&&point?point.y-source.y:0;
 const angle=Math.round(Math.atan2(dy*.55,dx)*180/Math.PI)||0;
 const fragments=Array.from({length:5},(_,index)=>{
  const spread=(index-2)*24,recoil=index%2?24:34;
  return `<b style="--spread:${spread}deg;--recoil:${recoil}px;--delay:${index*12}ms"></b>`;
 }).join('');
 return `<span class="exchange-impact" data-family="${family}" data-world="${world}" aria-hidden="true" style="--impact-angle:${angle}deg"><i></i><i></i><i></i><span class="impact-fragments">${fragments}</span></span>`;
}
