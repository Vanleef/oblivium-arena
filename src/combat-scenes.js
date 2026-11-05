export const combatScenes=Object.freeze([
 {id:'limbo',name:'Limbo · Ruínas Suspensas',realm:'Limbo',art:'/art/arenas/limbo-ruins.webp'},
 {id:'inferno',name:'Inferno · Catedral das Cinzas',realm:'Inferno',art:'/art/arenas/inferno-cathedral.webp'},
 {id:'paraiso',name:'Paraíso · Pátio do Julgamento',realm:'Paraíso',art:'/art/arenas/paraiso-courtyard.webp'}
]);
export const combatScene=id=>combatScenes.find(scene=>scene.id===id)||combatScenes[0];
