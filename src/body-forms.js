const folder=id=>`/art/characters/${id}/body-forms-20261023`;
const slots=['impulso','tecnica','voto'];
const shift=form=>slots.map(slot=>({slot,form}));
const back=shift('base');
const form=(id,key,name,description,effects={})=>({id,formKey:key,name,description,cost:1,costs:{affinity:1},target:'enemy',damageType:'physical',damage:0,cooldown:0,kind:'strike',classes:['Física','Instantânea'],...effects});
// Only characters whose mechanics actually change their body receive these portraits.
export function withBodyForms(c){
 const base=folder(c.id);
 if(c.id==='o-odio-encarnado')return {...c,baseFormName:'Fúria contida',bodyForms:[{key:'rage',name:'Ódio Solto',portrait:`${base}/portrait-rage.webp`,when:{impulso:'rage',voto:'eruption'},description:'Transformação por 2 turnos. Ressentimento sem Freio encerra a forma e restaura o retrato.'}]};
 if(c.id==='a-sombra-inconstante')return {...c,baseFormName:'Sombra errante',bodyForms:[{key:'shelter',name:'Contorno de Abrigo',portrait:`${base}/portrait-shelter.webp`,when:{impulso:'feign',tecnica:'resume'},description:'Troca a ofensiva inicial por recuperação e contra-ataque até Retomar a Sombra.'}]};
 if(c.id!=='a-pele-alheia')return c;
 const pred=[
  form('impulso','skin','Gume Transfigurado','Causa 15 de dano perfurante e remove 15 de Defesa antes do dano.',{damage:15,damageType:'piercing',stripShield:15,classes:['Perfurante','Instantânea']}),
  form('tecnica','shed','Descartar o Molde','Recupera 15 de Vida e limpa aflições e condições prejudiciais. Após usar, restaura Gume Mutável. Após usar, restaura Pele Usurpada e Carapaça Usurpada. Não reinicia recargas.',{target:'self',heal:15,cleanse:true,shift:back,kind:'support',classes:['Estratégica','Instantânea']}),
  form('voto','skin','Instinto Usurpado','Causa 25 de dano físico e prepara um contra-ataque pessoal de 10 de dano por 1 turno.',{damage:25,counter:10,cost:2,costs:{affinity:1,essence:1},cooldown:2})
 ];
 const shell=[
  form('impulso','shell','Impacto da Carapaça','Causa 20 de dano físico e concede 5 de Defesa ao usuário.',{damage:20,shield:5}),
  form('tecnica','shell','Descamar a Armadura','Recupera 10 de Vida e restaura a forma original e suas três técnicas. Não reinicia recargas.',{target:'self',heal:10,shift:back,kind:'support',classes:['Estratégica','Instantânea']}),
  form('voto','shell','Espinhos Usurpados','Concede 15 de Defesa e anula a próxima habilidade inimiga recebida, contra-atacando com 20 de dano. Dura 1 turno.',{target:'self',shield:15,counter:20,cost:2,costs:{affinity:1,essence:1},cooldown:2,kind:'guard',classes:['Estratégica','Instantânea']})
 ];
 const abilities=c.abilities.map(a=>({...a}));
 Object.assign(abilities[1],{shield:15,assumeForm:'skin',shift:[{slot:'impulso',form:'skin'},{slot:'tecnica',form:'shed'},{slot:'voto',form:'skin'}],description:'Recebe 15 de Defesa, limpa aflições e condições prejudiciais e assume a Pele Usurpada. Troca as três primeiras técnicas e o retrato até usar Descartar o Molde ou Corpo Substituto.'});
 Object.assign(abilities[2],{name:'Carapaça Usurpada',counter:0,boost:0,shield:20,assumeForm:'shell',shift:shift('shell'),description:'Recebe 20 de Defesa e assume a Carapaça Usurpada. Troca as três primeiras técnicas e o retrato até descamar ou usar Corpo Substituto.'});
 for(let i=0;i<3;i++)abilities[i].forms=[pred[i],shell[i]].map(a=>({...a,art:`${base}/skill-${a.id}-${a.formKey}.webp`}));
 Object.assign(abilities[3],{shift:back,description:abilities[3].description+' Retorna à forma original sem reiniciar recargas.'});
 const hint='Alterne entre a forma original, a Pele Usurpada ofensiva e a Carapaça Usurpada defensiva. Cada corpo tem três técnicas e um retrato próprios; descartar o molde ou usar Corpo Substituto restaura a forma original.';
 return {...c,abilities,baseFormName:'Forma original',mechanic:'Metamorfose de três corpos',combo:hint,roleHint:hint,bodyForms:[
  {key:'skin',name:'Pele Usurpada',portrait:`${base}/portrait-skin.webp`,when:{impulso:'skin',tecnica:'shed',voto:'skin'},description:'Lâmina perfurante, revide e descarte para recuperar Vida.'},
  {key:'shell',name:'Carapaça Usurpada',portrait:`${base}/portrait-shell.webp`,when:Object.fromEntries(slots.map(s=>[s,'shell'])),description:'Guarda, contra-ataque e impacto protegido.'}
 ]};
}
// Codex previews are presentation only; they never alter a roster or battle instance.
export function previewBodyForm(c,key){
 const body=c.bodyForms?.find(f=>f.key===key);
 if(!body)return {...c,bodyForm:'base',bodyFormName:c.baseFormName||'Forma original'};
 return {...c,bodyForm:body.key,bodyFormName:body.name,art:{...c.art,portrait:body.portrait},abilities:c.abilities.map(a=>{
  const variant=a.forms?.find(f=>f.formKey===body.when[a.id]);
  return variant?{...variant,forms:a.forms,_formRoot:a}:a;
 })};
}
