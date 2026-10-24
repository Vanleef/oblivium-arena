const approved = '/art/characters/o-fim/approved-elo-union-20261023';
const formsArt = '/art/characters/o-fim/body-forms-20261023';
const slots = ['fenda','decreto','coroa'];
const shiftTo = form => slots.map(slot=>({slot,form}));
const skill = (id,name,description,effects={},art=`${formsArt}/skill-${id}.webp`) => ({id,name,description,target:'enemy',costs:{affinity:1},cooldown:0,kind:'strike',classes:['Espiritual','Instantânea'],art,...effects});
// Manifestations of different observers' fears, never a canonical true body.
export const FINAL_BOSS = Object.freeze({
 id:'the-end',name:'O Fim',nameEn:'The End',title:'Rei do Inferno',role:'Rei do Inferno',
 realm:'Inferno',elo:'Vazio',eloId:'vazio',color:'void',symbol:'◍',affinity:'cinza',maxHp:100,
 portrait:`${approved}/portrait.webp`,baseFormName:'Forma original',
 lore:'O Fim não tem rosto nem forma fixos. Assume sempre a forma do maior medo de quem o olha: cada observador encara uma manifestação única, mesmo quando várias almas o veem ao mesmo tempo.',
 artNote:'A forma original conserva a manifestação aprovada: um soberano de rosto vazio, coroa, vínculos partidos e marfim tomado por raízes. Tirano, Predador e Ruína são outras manifestações do medo. Nenhuma aparência é sua forma verdadeira.',
 mechanic:'Três manifestações do medo',
 combo:'Na forma original, escolha uma manifestação: ela substitui as três primeiras técnicas e o retrato. A troca consome sua ação. Fim Inalcançável recupera 10 de Vida e restaura a forma original. As recargas pertencem às posições e continuam entre formas.',
 bodyForms:Object.freeze([
  {key:'tyrant',name:'Tirano',portrait:`${formsArt}/portrait-tyrant.webp`,when:Object.fromEntries(slots.map(s=>[s,'tyrant'])),description:'Controle por marcas, interrupção e guarda. Medo de ser subjugado.'},
  {key:'predator',name:'Predador',portrait:`${formsArt}/portrait-predator.webp`,when:Object.fromEntries(slots.map(s=>[s,'predator'])),description:'Perseguição, drenagem de Vida e consumo de recursos. Medo de ser caçado.'},
  {key:'ruin',name:'Ruína',portrait:`${formsArt}/portrait-ruin.webp`,when:Object.fromEntries(slots.map(s=>[s,'ruin'])),description:'Aflições, interdição de apoio e dano coletivo. Medo de perder a própria continuidade.'}
 ])
});
export function createFinalBossAbilities(){
 const kits={
  tyrant:[
   skill('fenda','Fenda do Véu','Causa 25 de dano perfurante e marca o alvo por 3 turnos.',{damage:25,damageType:'piercing',mark:'fim',classes:['Perfurante','Instantânea']},`${approved}/skill-fenda.webp`),
   skill('decreto','Decreto do Fim','Causa 20 de dano. Contra sua marca do Fim, causa +15 de dano, Atordoa por 1 turno e consome a marca.',{damage:20,costs:{affinity:1,essence:1},combo:{condition:'mark:fim',bonusDamage:15,stun:1,consume:true},cooldown:2,kind:'control'},`${approved}/skill-decreto.webp`),
   skill('coroa','Coroa que Não Cai','Concede 20 de Defesa ao trio.',{target:'team',shield:20,costs:{affinity:1,essence:1},cooldown:2,kind:'guard',classes:['Estratégica','Instantânea']},`${approved}/skill-coroa.webp`)
  ],
  predator:[
   skill('rastro','Rastro Faminto','Causa 15 de dano físico, rouba 50% do dano causado como Vida e marca o alvo por 3 turnos.',{damage:15,damageType:'physical',lifesteal:.5,mark:'caca-fim',classes:['Física','Instantânea']}),
   skill('ceifar','Ceifar o Vínculo','Causa 25 de dano perfurante e rouba 50% do dano causado como Vida. Contra sua marca de caça, causa +10 de dano e consome a marca.',{damage:25,damageType:'piercing',lifesteal:.5,costs:{affinity:1,essence:1},combo:{condition:'mark:caca-fim',bonusDamage:10,consume:true},cooldown:1,classes:['Perfurante','Instantânea']}),
   skill('fome','Fome dos Reinos','Causa 15 de dano espiritual a cada inimigo e drena 1 recurso da reserva inimiga, uma vez por uso.',{damage:15,damageType:'energy',target:'all-enemies',drain:1,costs:{affinity:2,essence:1},cooldown:2})
  ],
  ruin:[
   skill('cinza','Cinza de Ninguém','Causa 10 de dano de aflição e aplica Decadência: 4 de dano por 3 turnos.',{damage:10,damageType:'affliction',dot:{tag:'decadencia',damage:4,turns:3},classes:['Aflição','Persistente']}),
   skill('nome','Nome Extinto','Causa 15 de dano espiritual, deixa o alvo Exposto e sela suas habilidades de apoio por 1 turno.',{damage:15,damageType:'energy',expose:1,sealSupport:1,costs:{affinity:1,essence:1},cooldown:2,kind:'control'}),
   skill('fronteira','Última Fronteira','Causa 20 de dano de aflição a cada inimigo; causa +5 contra alvos com aflições.',{damage:20,damageType:'affliction',target:'all-enemies',combo:{condition:'afflicted',bonusDamage:5},costs:{affinity:2,essence:1},cooldown:2,classes:['Aflição','Instantânea']})
  ]
 };
 return [
  ...FINAL_BOSS.bodyForms.map((f,i)=>skill(slots[i],`Assumir ${f.name}`,`Assume ${f.name}, recebe 8 de Defesa e substitui as três primeiras técnicas e o retrato. ${f.description} Permanece assim até usar Fim Inalcançável.`,{target:'self',shield:8,kind:'support',classes:['Transformação','Instantânea'],assumeForm:f.key,shift:shiftTo(f.key),forms:FINAL_BOSS.bodyForms.map(form=>({...kits[form.key][i],id:slots[i],formKey:form.key}))},f.portrait)),
  skill('despertar','Fim Inalcançável','Fica Invulnerável a novas habilidades inimigas por 1 turno, recupera 10 de Vida e retorna à forma original. Aflições já ativas continuam. Não reinicia recargas.',{target:'self',heal:10,invulnerable:1,defense:true,kind:'defense',costs:{essence:1},cooldown:4,shift:shiftTo('base'),classes:['Estratégica','Instantânea']},`${approved}/skill-despertar.webp`)
 ];
}
export function createFinalBoss(){return {...FINAL_BOSS,art:{portrait:FINAL_BOSS.portrait},abilities:createFinalBossAbilities()};}
