import { applyArchetypeForm } from "./archetypes.js";

const folder=id=>id==='o-devorador'?'/art/characters/o-devorador/dark-pictorial-rework-20261030':id==='a-pele-alheia'?'/art/characters/a-pele-alheia/painterly-rework-20261026-animal':id==='a-mascara-dupla'?'/art/characters/a-mascara-dupla/hybrid-rework-20261025':['a-brasa-eterna','o-odio-encarnado'].includes(id)?`/art/characters/${id}/painterly-rework-20261025`:`/art/characters/${id}/body-forms-20261023`;
const slots=['impulso','tecnica','voto'];
const shift=form=>slots.map(slot=>({slot,form}));
const back=shift('base');
const form=(id,key,name,description,effects={})=>({id,formKey:key,name,description,cost:1,costs:{affinity:1},target:'enemy',damageType:'physical',damage:0,cooldown:0,kind:'strike',...effects});
// Only characters whose mechanics actually change their body receive these portraits.
export function withBodyForms(c){
 const base=folder(c.id);
 const formBase=c.id==='a-pele-alheia'?'/art/characters/a-pele-alheia/dark-pictorial-forms-20261031':base;
 if(c.id==='o-devorador'){
  const threshold=c.abilities.find(a=>a.id==='impulso')?.formRule?.at??40;
  const basePortrait=base.endsWith('/painterly-rework-20261025')||base.endsWith('/dark-pictorial-rework-20261030')?`${base}/portrait.webp`:`${base}/portrait-base.webp`;
  return {...c,art:{...c.art,portrait:basePortrait},baseFormName:'Corpo Saciado',mechanic:'Fome que consome o próprio corpo',bodyForms:[{key:'starved',resource:c.affinity,name:'Fome sem Corpo',portrait:`${base}/portrait-starved.webp`,when:{impulso:'starved'},description:`A forma surge automaticamente quando a Vida chega a ${threshold} ou menos. O peito se abre num vazio e Mordida da Alma passa a drenar a vítima.`}]};
 }
 if(c.id==='a-mascara-dupla'){
  const abilities=c.abilities.map(a=>a.id==='impulso'?{...a,forms:a.forms.map(f=>({...f,art:`${base}/skill-impulso-other.webp`}))}:a);
  return {...c,abilities,art:{...c.art,portrait:`${base}/portrait-base.webp`},baseFormName:'Máscara de Confiança',mechanic:'Duas máscaras, duas respostas',bodyForms:[{key:'betrayal',resource:c.affinity,name:'Máscara da Traição',portrait:`${base}/portrait-betrayal.webp`,when:{impulso:'other'},description:'Rosto Emprestado revela a segunda face por até 2 turnos. Gesto de Outro Rosto interrompe e contra-ataca; ao expirar, a máscara retorna.'}]};
 }
 if(c.id==='o-odio-encarnado')return {...c,baseFormName:'Fúria contida',bodyForms:[{key:'rage',resource:'ruptura',name:'Ódio Solto',portrait:`${base}/portrait-rage.webp`,when:{impulso:'rage',voto:'eruption'},description:'Transformação por 2 turnos. Ressentimento sem Freio encerra a forma e restaura o retrato.'}]};
 if(c.id==='o-soberano-quebrado')return {...c,art:{...c.art,portrait:`${base}/portrait-base.webp`},baseFormName:'Coroa Fraturada',mechanic:'Forma de domínio',bodyForms:[{key:'edict',resource:'essence',name:'Coroa Soberana',portrait:`${base}/portrait-edict.webp`,when:{impulso:'edict',tecnica:'edict',voto:'edict'},description:'O decreto assume as três técnicas por 2 turnos: marcar a linha, enfraquecê-la em área e erguer Defesa para o trio.'}]};
 if(c.id==='a-brasa-eterna')return {...c,art:{...c.art,portrait:`${base}/${base.endsWith('/painterly-rework-20261025')?'portrait':'portrait-base'}.webp`},baseFormName:'Brasa Velada',mechanic:'Forma de sufocamento',bodyForms:[{key:'smother',resource:'ruptura',name:'Fornalha Sepulcral',portrait:`${base}/portrait-smother.webp`,when:{impulso:'smother',tecnica:'smother',voto:'smother'},description:'Com Queimadura preparada, muda as três técnicas por 2 turnos: labareda focada, cinzas em área e consumo da condição.'}]};
 if(c.id==='o-eco-sem-dono')return {...c,art:{...c.art,portrait:`${base}/portrait-base.webp`},baseFormName:'Eco Encarnado',mechanic:'Forma de ressonância',bodyForms:[{key:'stolen',resource:'coringa',name:'Ressonância Roubada',portrait:`${base}/portrait-stolen.webp`,when:{impulso:'stolen',tecnica:'stolen',voto:'stolen'},description:'Anular uma técnica física abre por 2 turnos um kit inteiro de resposta: golpe que gera carga, amparo coletivo e descarga em área.'}]};
 if(c.id==='a-sombra-inconstante')return {...c,baseFormName:'Sombra errante',bodyForms:[{key:'shelter',resource:'graca',name:'Contorno de Abrigo',portrait:`${base}/portrait-shelter.webp`,when:{impulso:'feign',tecnica:'resume'},description:'Troca a ofensiva inicial por recuperação e contra-ataque até Retomar a Sombra.'}]};
 if(c.id!=='a-pele-alheia')return c;
 const pred=[
  form('impulso','skin','Garras Predatórias','Causa 15 de dano perfurante e remove 15 de Defesa antes do dano.',{damage:15,damageType:'piercing',stripShield:15,}),
  form('tecnica','shed','Descartar o Molde','Recupera 15 de Vida e limpa aflições e condições prejudiciais. Após usar, restaura Garras Cambiantes e as formas Quimera Predatória e Quimera Couraçada.',{target:'self',heal:15,cleanse:true,shift:back,kind:'support',}),
  form('voto','skin','Instinto de Revide','Causa 25 de dano físico e prepara um contra-ataque pessoal de 10 de dano por 1 turno.',{damage:25,counter:10,cost:2,costs:{affinity:1,random:1},cooldown:2})
 ];
 const shell=[
  form('impulso','shell','Mergulho Alado','Causa 20 de dano físico e concede 5 de Defesa ao usuário.',{damage:20,shield:5}),
  form('tecnica','shell','Recolher as Asas','Recupera 10 de Vida e restaura a forma humanoide e suas três técnicas.',{target:'self',heal:10,shift:back,kind:'support',}),
  form('voto','shell','Espinhos Alados','Concede 15 de Defesa e anula a próxima habilidade inimiga recebida, contra-atacando com 20 de dano. Dura 1 turno.',{target:'self',shield:15,counter:20,cost:2,costs:{affinity:1,random:1},cooldown:2,kind:'guard',})
 ];
 const abilities=c.abilities.map(a=>({...a}));
 Object.assign(abilities[1],{shield:15,assumeForm:'skin',shift:[{slot:'impulso',form:'skin'},{slot:'tecnica',form:'shed'},{slot:'voto',form:'skin'}],description:'Recebe 15 de Defesa, limpa aflições e condições prejudiciais e assume a Quimera Terrestre: quadrúpede alongado, peito baixo, quatro patas e cauda longa, sem asas ou tronco humano. Troca as três primeiras técnicas e o retrato até usar Descartar o Molde ou Corpo Substituto.'});
 Object.assign(abilities[2],{name:'Quimera Couraçada',counter:0,boost:0,shield:20,assumeForm:'shell',shift:shift('shell'),description:'Recebe 20 de Defesa e assume a Quimera Alada: corpo reptiliano estreito, asas membranosas no lugar dos membros dianteiros, duas patas traseiras e cauda longa. Troca as três primeiras técnicas e o retrato até descamar ou usar Corpo Substituto.'});
 for(let i=0;i<3;i++)abilities[i].forms=[pred[i],shell[i]].map(a=>({...a,art:`${formBase}/skill-${a.id}-${a.formKey}.webp`}));
 Object.assign(abilities[3],{shift:back,description:abilities[3].description+' Retorna à forma original.'});
 const hint='Alterne entre a forma humanoide original, a Quimera Terrestre (quadrúpede alongado, sem asas) e a Quimera Alada (asas membranosas no lugar dos membros dianteiros). As duas quimeras têm anatomias próprias e três técnicas cada; descartar o molde ou usar Corpo Substituto restaura a forma humana.';
 return {...c,abilities,baseFormName:'Forma humanoide',mechanic:'Metamorfose de feras infernais',combo:hint,roleHint:hint,bodyForms:[
  {key:'skin',resource:'ruptura',name:'Quimera Terrestre',portrait:`${formBase}/portrait-skin.webp`,when:{impulso:'skin',tecnica:'shed',voto:'skin'},description:'Fera baixa e alongada, sustentada por quatro patas musculosas e cauda longa. Não conserva tronco humano nem asas; rompe a guarda, prepara o revide e descarta o molde para recuperar Vida.'},
  {key:'shell',resource:'essence',name:'Quimera Alada',portrait:`${formBase}/portrait-shell.webp`,when:Object.fromEntries(slots.map(s=>[s,'shell'])),description:'Predador voador de corpo estreito, asas membranosas usadas como membros dianteiros, duas patas traseiras e cauda longa. Sustenta a guarda, anula um golpe e contra-ataca.'}
 ]};
}
// Codex previews are presentation only; they never alter a roster or battle instance.
export function previewBodyForm(c,key){
 const body=c.bodyForms?.find(f=>f.key===key);
 if(!body)return applyArchetypeForm({...c,bodyForm:'base',bodyResource:c.affinity,bodyFormName:c.baseFormName||'Forma original'},c.baseArchetype||c.archetype);
 const preview={...c,bodyForm:body.key,bodyResource:body.resource,bodyFormName:body.name,art:{...c.art,portrait:body.portrait},abilities:c.abilities.map(a=>{
  const variant=a.forms?.find(f=>f.formKey===body.when[a.id]);
  return variant?{...variant,forms:a.forms,_formRoot:a}:a;
 })};
 return applyArchetypeForm(preview,body.archetype||c.baseArchetype||c.archetype);
}
