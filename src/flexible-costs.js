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
 const slot=flexible[c.id];
 // A fixed secondary pip becomes flexible for the second technique across the
 // roster. Total pips stay constant, so the added choice does not reduce cost.
 return {...c,abilities:c.abilities.map((a,index)=>{
  if(a.id===slot)return flexibleSkill(a);
  if(index===1&&a.costs?.essence&&!a.costs.random)return flexibleSkill(a);
  return a;
 })};
}
