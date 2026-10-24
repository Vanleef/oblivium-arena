import { esc, portraitMarkup } from './view-utils.js';
export const augmentTiers={silver:{name:'Prata',label:'ECO',pips:1},gold:{name:'Ouro',label:'RESSONÂNCIA',pips:2},prismatic:{name:'Prismático',label:'RUPTURA',pips:3}};
const glyphs={
 blade:'M19 8 40 29 33 36 12 15ZM29 32 20 41M15 36 25 46M17 43 12 48M36 25 47 14 50 7 43 10 32 21',
 flame:'M33 5C38 18 20 20 24 32 27 25 34 24 37 18 49 31 48 48 33 53 16 57 9 43 16 30 13 42 24 47 28 44 16 27 36 22 33 5ZM33 34C25 43 31 49 36 46 41 43 37 38 33 34Z',
 heart:'M32 51 12 31C-1 13 20 4 32 18 44 4 65 13 52 31ZM20 30H27L31 24 35 37 39 30H45',
 shield:'M32 6 52 15V30C52 42 42 51 32 57 22 51 12 42 12 30V15ZM32 16V45M23 24 32 16 41 24',
 eye:'M5 32Q32 6 59 32 32 58 5 32ZM41 32A9 9 0 1 1 23 32 9 9 0 1 1 41 32M32 6V13M32 51V58M10 12 15 18M49 46 54 52',
 crown:'M10 43 6 17 23 28 32 8 41 28 58 17 54 43ZM13 50H51M23 36H41',
 dawn:'M7 44H57M16 40A16 16 0 0 1 48 40M32 4V15M9 16 17 24M55 16 47 24M4 31 14 33M60 31 50 33M15 51H49M24 57H40',
 blood:'M32 5C32 5 12 27 12 39A20 20 0 0 0 52 39C52 27 32 5 32 5ZM23 31Q16 43 28 46M32 20V27',
 fang:'M12 8 32 18 52 8 48 35 38 51 32 57 26 51 16 35ZM20 20 25 37 32 29 39 37 44 20M26 48H38',
 veil:'M12 53 17 15 32 6 47 15 52 53 41 46 32 55 23 46ZM22 26 28 30M42 26 36 30M26 41Q32 36 38 41',
 candle:'M26 26H38V51H26ZM24 55H40M32 5C43 18 37 23 32 22 27 23 21 18 32 5ZM19 31 13 27M45 31 51 27',
 echo:'M17 21 32 11V53L17 43H8V21ZM41 20Q57 32 41 44M47 11Q69 32 47 53',
 shelter:'M6 29 32 7 58 29M13 26V54H51V26M25 54V36H39V54M28 20H36',
 spore:'M32 22A10 10 0 1 0 32 42 10 10 0 1 0 32 22M32 5V19M32 45V59M5 32H19M45 32H59M12 12 22 22M42 42 52 52M12 52 22 42M42 22 52 12M29 29 35 35',
 mark:'M32 6 51 17V39L32 58 13 39V17ZM32 18V38M32 45V48M23 11H41',
 lock:'M16 27H48V54H16ZM22 27V18A10 10 0 0 1 42 18V27M32 36V45M8 16H13M51 16H56',
 seed:'M32 55V28M32 38C10 38 10 16 10 16 30 14 32 27 32 38ZM32 28C32 9 54 8 54 8 56 28 32 28 32 28M20 54H44',
 counter:'M17 31A19 19 0 1 1 32 51M17 31 6 22M17 31 24 19M34 17 29 32H41L32 46',
 bond:'M22 19 16 13A10 10 0 0 0 2 27L17 42A10 10 0 0 0 31 28M42 45 48 51A10 10 0 0 0 62 37L47 22A10 10 0 0 0 33 36M22 32H42',
 charge:'M36 4 15 35H29L25 60 50 25H35ZM8 14 15 18M49 48 56 52',
 metamorph:'M17 16A22 22 0 0 1 51 27M51 27 53 13M51 27 38 23M47 48A22 22 0 0 1 13 37M13 37 11 51M13 37 26 41M32 21 42 32 32 43 22 32Z',
 rift:'M33 4 21 20 30 28 17 43 30 59 44 40 35 32 47 17ZM10 14 15 20M50 46 55 52M8 43 14 39M49 12 55 8',
 eclipse:'M43 8A25 25 0 1 0 56 43 21 21 0 0 1 43 8ZM47 22V34M41 28H53',
 compass:'M32 5 39 25 59 32 39 39 32 59 25 39 5 32 25 25ZM32 23 41 32 32 41 23 32Z'
};
export function augmentGlyph(name='compass'){return `<svg class="augment-glyph" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${glyphs[name]||glyphs.compass}"/></svg>`;}
export function effectGlyph(effect={}){return effect.evolvedPower||effect.shiftShield?'metamorph':effect.counterPower?'counter':effect.markedPower?'mark':effect.affliction||effect.afflictionPower||effect.afflictedPower?'spore':effect.charge||effect.chargePower||effect.startingCharge||effect.supportCharge?'charge':effect.heal||effect.healPower||effect.defenseHeal?'heart':effect.regeneration?'seed':effect.shield||effect.shieldPower||effect.armor||effect.supportShield||effect.killShield?'shield':effect.maxHp?'blood':effect.damage||effect.physicalPower||effect.firstStrike||effect.woundedPower||effect.executePower?'blade':effect.spiritualPower?'echo':effect.piercingPower?'rift':'compass';}
export const highlightEffect=text=>esc(text).replace(/\+?\d+(?:[.,]\d+)?%?/g,n=>`<em>${n}</em>`);
const categories={offense:'Ofensiva',defense:'Defesa',utility:'Convergência',exploration:'Travessia'};
export function renderAugmentCard({id,title,text,lore='',tier='silver',category='utility',scope='',glyph='compass',attribute='world-event',className='',cta='ESCOLHER',duration='NESTE COMBATE',recipients=null,index=0}){
 tier=augmentTiers[tier]?tier:'silver';const rarity=augmentTiers[tier];
 attribute=['world-event','global-upgrade','choose-buff'].includes(attribute)?attribute:'world-event';className=className.replace(/[^a-zA-Z0-9_ -]/g,'');index=Math.max(0,Math.min(2,Number(index)||0));
 const counts=recipients?`<div class="augment-recipients"><span>SEU TRIO <b>${recipients.allies.length}</b></span><span>OPOSIÇÃO <b>${recipients.enemies.length}</b></span><div class="augment-portraits">${[...recipients.allies,...recipients.enemies].slice(0,6).map(u=>`<span title="${esc(u.name)}">${portraitMarkup(u,'augment-portrait')}</span>`).join('')}</div></div>`:'';
 return `<button class="augment-card tier-${tier} ${className}" data-${attribute}="${esc(id)}" style="--card-index:${index}"><div class="augment-topline"><span class="augment-rarity"><i aria-hidden="true">${'◆'.repeat(rarity.pips)}</i>${rarity.name}</span><small>${categories[category]||'Convergência'}</small></div><div class="augment-art"><span class="augment-halo"></span><span class="augment-medallion">${augmentGlyph(glyph)}</span><i class="augment-orbit" aria-hidden="true"></i></div><div class="augment-copy">${scope?`<small class="augment-scope">${esc(scope)}</small>`:''}<h2>${esc(title)}</h2><p class="augment-effect">${highlightEffect(text)}</p>${lore?`<p class="augment-lore">${esc(lore)}</p>`:''}</div>${counts}<span class="augment-select"><span>${esc(cta)}</span><b aria-hidden="true">↗</b></span><small class="augment-duration">${esc(duration)}</small></button>`;
}
