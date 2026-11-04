import { eloSigil } from "./crests.js";
import { getAbilityResourceCosts } from "./engine.js";
import { resourceById } from "./data.js";
export function esc(value) {return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);}
export function portraitMarkup(c,className){return c.art?.portrait ? `<img class="${className}" src="${esc(c.art.portrait)}" alt="" loading="lazy">` : `<span class="${className} portrait-fallback color-${esc(c.color)}" aria-hidden="true">${c.npcOnly&&c.symbol?esc(c.symbol):eloSigil(c.eloId)}</span>`;}
export function costMarkup(actor,ability){const entries=Object.entries(getAbilityResourceCosts(actor,ability));if(!entries.length)return '<span class="cost-label">LIVRE</span>';const title=entries.map(([id,n])=>`${n} ${id==="random"?"Coringa":resourceById[id]?.name||id}${id==="random"&&n>1?"s":""}`).join(" + ");return `<span class="skill-cost" aria-label="Custo: ${esc(title)}" title="${esc(title)}">${entries.flatMap(([id,n])=>Array.from({length:n},()=>`<i class="cost-pip pip-${esc(id)}" aria-hidden="true"></i>`)).join("")}</span>`;}


