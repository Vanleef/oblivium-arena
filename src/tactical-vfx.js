// Shared effect families; these are not character-specific skill artwork.
const rows=Object.freeze({strike:0,slash:0,pierce:0,burst:0,projectile:0,bind:1,affliction:1,support:2,guard:3,counter:3});
export const tacticalVfxAtlas=Object.freeze({src:'/art/animations/tactical-vfx-20261102/impact-families.webp',columns:6,rows:4});
export function tacticalVfxRow(family){return rows[family]??null;}
export function tacticalVfxMarkup(family){
 const row=tacticalVfxRow(family);
 return row===null?'':`<span class="cell-vfx" aria-hidden="true" style="--vfx-row:${row*100/3}%"></span>`;
}

export function tacticalExchangeVfxMarkup(family){
 if(tacticalVfxRow(family)===null)return '';
 return `<span class="exchange-impact" data-family="${family}" aria-hidden="true"><i></i><i></i><i></i></span>`;
}
