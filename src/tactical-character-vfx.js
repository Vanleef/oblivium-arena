// Identity-specific, procedural choreography for the illustrated compact arena.
// These are physical contact motifs, not additional buffs, damage or combat rules.
// Every result depends only on an executed technique and the visible actor identity.
export const tacticalCharacterMotifs=Object.freeze({
 'o-acougueiro':'cleaver',       // Heavy blade, tearing contact
 'a-viuva-escarlate':'crimson',  // Blood cloth/cords closing over the victim
 'o-escudo-vivo':'bastion',      // Interlocking shield slabs
 'o-passo-interrompido':'stutter',// Misaligned successive positions
 'o-odio-encarnado':'rage',      // Crushing fist and cinders
 'a-arquiteta-verde':'architect',// Load-bearing roots and living arch
 'nilo':'memory'                // Memory knots on taut ritual thread
});
const slotWeight=Object.freeze({impulso:.85,tecnica:1,voto:1.15,despertar:1.3});
export function tacticalCharacterChoreography(actor,event){
 if(!actor||event?.type!=='skill'||event.skipped)return null;
 const kind=tacticalCharacterMotifs[actor.sourceId||actor.id];
 const slot=event.abilityId;
 if(!kind||!Object.hasOwn(slotWeight,slot))return null;
 // Upgraded forms alter the silhouette's weight, not game outcomes.
 const form=event.formKey&&event.formKey!=='base' ? 0.1 : 0;
 return {kind,slot,weight:slotWeight[slot]+form};
}
