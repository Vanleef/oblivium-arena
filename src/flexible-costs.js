// Flexible costs appear on ordinary techniques as well as the shared fourth defense.
const flexible={
 'o-colecionador-de-cabecas':'voto','a-mao-que-cura':'tecnica',
 'o-restaurador':'impulso','o-que-levanta':'tecnica','a-voz':'impulso',
 'o-primeiro-canto':'tecnica','a-costureira':'tecnica',
 'a-porta-que-flutua':'tecnica','o-nome-esquecido':'voto',
 'a-mao-que-toma':'tecnica','o-falso-profeta':'tecnica','o-que-cria':'tecnica'
};
function flexibleSkill(a){
 const costs={...a.costs};
 const key=costs.essence?'essence':costs.affinity?'affinity':Object.keys(costs)[0];
 if(key){costs[key]--;if(!costs[key])delete costs[key];costs.random=(costs.random||0)+1;}
 return {...a,costs,...(a.forms?{forms:a.forms.map(flexibleSkill)}:{})};
}
export function withFlexibleCosts(c){
 const slot=flexible[c.id];return slot?{...c,abilities:c.abilities.map(a=>a.id===slot?flexibleSkill(a):a)}:c;
}
