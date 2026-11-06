export const combatScenes=Object.freeze([
 {id:'limbo',floorZoom:295,floorFocus:66,name:'Limbo · Ruínas Suspensas',realm:'Limbo',art:'/art/arenas/limbo-ruins.webp'},
 {id:'inferno',floorZoom:235,floorFocus:70,name:'Inferno · Catedral das Cinzas',realm:'Inferno',art:'/art/arenas/inferno-cathedral.webp'},
 {id:'paraiso',floorZoom:238,floorFocus:68,name:'Paraíso · Pátio do Julgamento',realm:'Paraíso',art:'/art/arenas/paraiso-courtyard.webp'},
 {id:'inferno-ossuary',floorZoom:235,floorFocus:65,name:'Inferno · Claustro dos Condenados',realm:'Inferno',art:'/art/arenas/inferno-ossuary-20261105.webp'},
 {id:'paraiso-gardens',floorZoom:265,floorFocus:68,name:'Paraíso · Jardins do Veredito',realm:'Paraíso',art:'/art/arenas/paraiso-gardens-20261105.webp'},
 {id:'limbo-aqueronte',floorZoom:245,floorFocus:65,name:'Limbo · Margem do Aqueronte',realm:'Limbo',art:'/art/arenas/limbo-aqueronte-20261105.webp'}
]);
export const combatScene=id=>combatScenes.find(scene=>scene.id===id)||combatScenes[0];

// Vary scenery within the encounter's world without consuming combat RNG.
export function encounterScene(realm,sequence=0,previousId=null){
 const matching=combatScenes.filter(scene=>scene.realm===realm);
 if(!matching.length)return combatScene(previousId).id;
 const alternate=matching.filter(scene=>scene.id!==previousId),pool=alternate.length?alternate:matching;
 const index=Number.isSafeInteger(sequence)?Math.abs(sequence)%pool.length:0;
 return pool[index].id;
}
