// Deliberate, visual-identity-first palettes shared by board telegraphs and Canvas VFX.
// Color order is [highlight, dominant, shadow], all validated as hex before use.
// Specific art identities override canonical kingdom hues. No combat data is modified.
const IDENTITY=Object.freeze({
 'o-acougueiro':['#ffd0b4','#c5354c','#501522'],
 'a-viuva-escarlate':['#ffd3db','#b62857','#4e1239'],
 'o-escudo-vivo':['#fff3cd','#d7b56f','#4b526a'],
 'o-passo-interrompido':['#efe2ff','#a88bf0','#36356d'],
 'o-odio-encarnado':['#ffce86','#e65c31','#512026'],
 'a-arquiteta-verde':['#d7ffcc','#76be84','#285b51'],
 nilo:['#ece7ff','#9885dc','#3d426a'],
 naomi:['#e7dcff','#ad79d5','#443e76'],
 kael:['#fff1c1','#d4a062','#5e3744'],
 diana:['#e0efff','#80a7d8','#344971'],
 'o-colecionador-de-cabecas':['#ffe5c7','#b84c4d','#452831'],
 'gemeos-do-cutelo':['#fcd9b5','#c44d48','#533039'],
 'o-carrasco-sem-rosto':['#fce9de','#a63e47','#382c35'],
 'a-mae-rubra':['#ffe1ce','#bd3d59','#4a2335'],
 'o-principe-das-correntes':['#f4d7b2','#9c6e69','#453241'],
 'o-tecelao-de-mentiras':['#edddff','#aa79b6','#43345a'],
 'a-boca-de-vidro':['#effdff','#94bacc','#425267'],
 'o-falso-profeta':['#ffeecb','#c6a179','#5e2943'],
 'o-corretor-de-memorias':['#f0e7fd','#a49cc0','#49455d'],
 'o-incendiario':['#fff0b2','#ee783f','#5c242b'],
 'a-brasa-eterna':['#ffe9aa','#dc693d','#542930'],
 'o-filho-da-cinza':['#ffe4b4','#cc6650','#44303b'],
 'a-pira-errante':['#ffdfb4','#c85749','#4d2b3e'],
 'o-coracao-em-furia':['#ffc7ab','#d84e40','#5b252a'],
 'o-devorador':['#e8d4bd','#ab655d','#412d33'],
 'a-mao-que-toma':['#ffe0c4','#ad6c6d','#3d293f'],
 'o-estomago-sem-fundo':['#f8d7c5','#a55b65','#342c3a'],
 'o-apodrecido':['#e2ebb7','#95aa65','#43513e'],
 'a-praga-andante':['#f0dcf3','#a66bb1','#53253f'],
 'a-rainha-dos-fungos':['#fff0d7','#b47caf','#49334f'],
 'o-medico-de-vermes':['#e6d7b4','#9e9a6f','#574937'],
 'o-jardim-morto':['#d8e0ab','#849b66','#34433a'],
 'a-porta-fechada':['#e6d8e4','#9f8199','#4a3b55']
});
const KINGDOM=Object.freeze({
 blood:['#ffe1ce','#cb4e62','#5e223a'],
 ember:['#fff0bf','#e57946','#572534'],
 flesh:['#f4ccba','#af6864','#543841'],
 rot:['#dce7b6','#90a765','#45513d'],
 hunger:['#f1d9b6','#ad7568','#47323b'],
 void:['#e5dcff','#9172c9','#3b305c'],
 mirror:['#e8e0f2','#a48aa7','#43435c'],
 silence:['#ded7e9','#968ca9','#424157'],
 guard:['#fff4ce','#d1b877','#526278'],
 creation:['#e6ffcf','#8bbe83','#3e6857'],
 union:['#fff1d1','#cbb98b','#635575'],
 truth:['#f1f7ff','#99bcdf','#557398'],
 justice:['#fff4cc','#d4b786','#756274'],
 healing:['#e4ffdc','#79cba9','#396d68'],
 hope:['#fff7d8','#d8c39a','#797a8f'],
 limbo:['#e9e2ff','#a58cdd','#4e447a']
});
const WORLDS=Object.freeze({
 Inferno:['#ffe3c7','#cd5447','#602734'],
 'Paraíso':['#fff4cc','#d6bd84','#63758a'],
 Limbo:['#eadfff','#a58ad9','#53446c']
});
const HEX=/^#[0-9a-fA-F]{6}$/;
const validPalette=palette=>Array.isArray(palette)&&palette.length===3&&palette.every(color=>typeof color==='string'&&HEX.test(color));
const normalized=palette=>palette.map(color=>color.toLowerCase());

// Allow future form art to specify literal validated VFX colors; never interpolate
// untrusted saved-game text into CSS or Canvas styles.
export function tacticalActorPalette(actor,{realmFallback=false}={}){
 if(!actor)return null;
 const explicit=actor.visualPalette||actor.effectPalette;
 if(validPalette(explicit))return normalized(explicit);
 const id=actor.sourceId||actor.id;
 // Nilo's absorption actually changes body and dominant colors.
 const form=String(actor.bodyForm||actor.activeForm||'').toLowerCase();
 if(id==='nilo'){
  if(/cinza|furi|infernal|ruina|demon/.test(form))
   return ['#ffe0a9','#db573b','#5b273a'];
  if(/graca|purific|celest/.test(form))
   return ['#fffbe4','#d1c4a0','#6b729c'];
  if(/ruptura|vazio|abismo/.test(form))
   return ['#e9dbff','#9865c9','#372a65'];
 }
 const personal=IDENTITY[id];
 if(personal)return [...personal];
 const kingdom=KINGDOM[actor.color]||KINGDOM[actor.kingdomColor];
 if(kingdom)return [...kingdom];
 return realmFallback?[...(WORLDS[actor.realm]||WORLDS.Limbo)]:null;
}

// A field can still use canonical material tones if it has no owning soul.
// The returned colors stay consistent across area borders, projectiles, and hits.
export function tacticalVfxPalette(actor,fallback,options={}){
 return tacticalActorPalette(actor,options)||(validPalette(fallback)?normalized(fallback):[...WORLDS.Limbo]);
}

export function tacticalPaletteVariables(palette){
 if(!validPalette(palette))return '';
 return '--actor-vfx-light:'+palette[0]+';--actor-vfx-main:'+palette[1]+';--actor-vfx-shadow:'+palette[2]+';';
}
