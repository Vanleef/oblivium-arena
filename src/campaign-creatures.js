const creatures={
 Inferno:{id:'feralha-do-estige',name:'Feralha do Estige',symbol:'♨',element:'fire',attack:'Mordida em Brasa'},
 'Paraíso':{id:'cervo-de-marmore',name:'Cervo de Mármore',symbol:'✦',element:'electric',attack:'Galhada do Julgamento'},
 Limbo:{id:'vulto-do-aqueronte',name:'Vulto do Aqueronte',symbol:'◷',element:'water',attack:'Arrasto da Corrente'}
};

export function campaignCreature(realm,variant=0){
 const creature=creatures[realm]||creatures.Limbo;
 return {...creature,id:creature.id+'-'+variant,realm,npcOnly:true,maxHp:65,abilities:[
  {id:'creature-strike',name:creature.attack,target:'enemy',element:creature.element,damage:14,damageType:'physical',cooldown:1,costs:{essence:1}},
  {id:'creature-ward',name:'Recolher-se',target:'self',shield:10,cooldown:2,costs:{essence:1}}
 ]};
}
