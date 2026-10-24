const approved = '/art/characters/o-fim/approved-elo-union-20261023';
const formsArt = '/art/characters/o-fim/body-forms-distinct-20261024';
const slots = ['fenda','decreto','coroa'];
const shiftTo = form => slots.map(slot=>({slot,form}));
const skill = (id,name,description,effects={},art=`${formsArt}/skill-${id}.webp`) => ({id,name,description,target:'enemy',costs:{affinity:1},cooldown:0,kind:'strike',classes:['Espiritual','Instantânea'],art,...effects});
// Manifestations of different observers' fears, never a canonical true body.
export const FINAL_BOSS = Object.freeze({
 id:'the-end',name:'O Fim',nameEn:'The End',title:'Rei do Inferno',role:'Rei do Inferno',
 realm:'Inferno',elo:'Vazio',eloId:'vazio',color:'void',symbol:'◍',affinity:'essence',maxHp:100,
 portrait:`${approved}/portrait.webp`,baseFormName:'Forma original',
 lore:'O Fim não tem rosto nem forma fixos. Assume sempre a forma do maior medo de quem o olha: cada observador encara uma manifestação única, mesmo quando várias almas o veem ao mesmo tempo.',
 artNote:'A forma original conserva a manifestação aprovada: um soberano esguio de rosto vazio, coroa, vínculos partidos e marfim tomado por raízes. Tirano se torna um bastião-cárcere; Predador, uma fera rasteira de seis membros; Ruína, um arco de catedral partido e suspenso. Nenhuma aparência é sua forma verdadeira.',
 mechanic:'Três manifestações do medo',
 baseArchetype:'transformation',archetype:'transformation',archetypes:['transformation'],baseArchetypes:['transformation'],
 combo:'Na forma original, escolha uma manifestação. Cada uma muda retrato, técnicas, arquétipo, Essência e efeito de entrada. Tirano controla e protege com Cinza; Predador persegue e executa com Ruptura; Ruína desgasta e interdita com Graça. Fim Inalcançável restaura 10 de Vida e a forma original. As recargas pertencem às posições e continuam entre formas.',
 bodyForms:Object.freeze([
  {key:'tyrant',resource:'cinza',archetype:'control',name:'Tirano',portrait:`${formsArt}/portrait-tyrant.webp`,when:Object.fromEntries(slots.map(s=>[s,'tyrant'])),description:'Interditor · afinidade Cinza. Marca e interrompe um alvo, depois protege o trio. Medo de ser subjugado.'},
  {key:'predator',resource:'ruptura',archetype:'burst',name:'Predador',portrait:`${formsArt}/portrait-predator.webp`,when:Object.fromEntries(slots.map(s=>[s,'predator'])),description:'Executor · afinidade Ruptura. Persegue uma presa, recupera Vida e escolhe entre drená-la ou consumir sua marca. Medo de ser caçado.'},
  {key:'ruin',resource:'graca',archetype:'status',name:'Ruína',portrait:`${formsArt}/portrait-ruin.webp`,when:Object.fromEntries(slots.map(s=>[s,'ruin'])),description:'Especialista em Aflições · afinidade Graça. Aplica Decadência, sela apoio e corrói a linha inimiga. Medo de perder a própria continuidade.'}
 ])
});
export function createFinalBossAbilities(){
 const kits={
  tyrant:[
   skill('fenda','Fenda do Véu','Rasga a guarda e marca um inimigo por 3 turnos.',{damage:20,damageType:'piercing',mark:'fim',classes:['Perfurante','Instantânea']},`${formsArt}/skill-fenda.webp`),
   skill('decreto','Decreto do Fim','Causa 20 de dano. Contra sua marca do Fim, causa +15 de dano, Atordoa por 1 turno e consome a marca.',{damage:20,costs:{affinity:1,random:1},combo:{condition:'mark:fim',bonusDamage:15,stun:1,consume:true},cooldown:2,kind:'control'},`${formsArt}/skill-decreto.webp`),
   skill('coroa','Coroa que Não Cai','Concede 20 de Defesa destrutível ao trio.',{target:'team',shield:20,costs:{affinity:1,random:1},cooldown:2,kind:'guard',classes:['Estratégica','Instantânea']},`${formsArt}/skill-coroa.webp`)
  ],
  predator:[
   skill('rastro','Rastro Faminto','Causa 15 de dano físico, rouba 50% do dano causado como Vida e marca o alvo por 3 turnos.',{damage:15,damageType:'physical',lifesteal:.5,mark:'caca-fim',classes:['Física','Instantânea']},`${formsArt}/skill-rastro.webp`),
   skill('ceifar','Ceifar o Vínculo','Causa 25 de dano perfurante e rouba 50% do dano causado como Vida. Contra sua marca de caça, causa +10 de dano e consome a marca.',{damage:25,damageType:'piercing',lifesteal:.5,costs:{affinity:1,random:1},combo:{condition:'mark:caca-fim',bonusDamage:10,consume:true},cooldown:1,classes:['Perfurante','Instantânea']},`${formsArt}/skill-ceifar.webp`),
   skill('fome','Fome dos Reinos','Causa 20 de dano de aflição a um inimigo e drena 1 Essência da reserva inimiga. Contra sua marca de caça, causa +15 de dano e a consome.',{damage:20,damageType:'affliction',drain:1,combo:{condition:'mark:caca-fim',bonusDamage:15,consume:true},costs:{affinity:2,random:1},cooldown:2,classes:['Aflição','Instantânea']},`${formsArt}/skill-fome.webp`)
  ],
  ruin:[
   skill('cinza','Cinza de Ninguém','Causa 10 de dano de aflição e aplica Decadência: 4 de dano por 3 turnos.',{damage:10,damageType:'affliction',dot:{tag:'decadencia',damage:4,turns:3},classes:['Aflição','Persistente']},`${formsArt}/skill-cinza.webp`),
   skill('nome','Nome Extinto','Causa 15 de dano espiritual, deixa o alvo Exposto e sela suas habilidades de apoio por 1 turno.',{damage:15,damageType:'energy',expose:1,sealSupport:1,costs:{affinity:1,random:1},cooldown:2,kind:'control'},`${formsArt}/skill-nome.webp`),
   skill('fronteira','Última Fronteira','Causa 20 de dano de aflição a cada inimigo; causa +5 contra alvos com aflições.',{damage:20,damageType:'affliction',target:'all-enemies',combo:{condition:'afflicted',bonusDamage:5},costs:{affinity:2,random:1},cooldown:2,classes:['Aflição','Instantânea']},`${formsArt}/skill-fronteira.webp`)
  ]
 };
 const entryEffects={tyrant:{shield:10},predator:{boost:8},ruin:{generateEssence:{resource:'graca',amount:1}}};
 const entryDescriptions={tyrant:'Recebe 10 de Defesa ao entrar nesta forma.',predator:'Prepara +8 de dano para o próximo golpe ao entrar nesta forma.',ruin:'Gera 1 Graça ao entrar nesta forma.'};
 return [
  ...FINAL_BOSS.bodyForms.map((f,i)=>skill(slots[i],`Assumir ${f.name}`,`Assume ${f.name}, substitui as três primeiras técnicas e o retrato. ${entryDescriptions[f.key]} ${f.description} Permanece assim até usar Fim Inalcançável.`,{target:'self',...entryEffects[f.key],kind:'support',classes:['Transformação','Instantânea'],assumeForm:f.key,shift:shiftTo(f.key),forms:FINAL_BOSS.bodyForms.map(form=>({...kits[form.key][i],id:slots[i],formKey:form.key}))},f.portrait)),
  skill('despertar','Fim Inalcançável','Fica Invulnerável a novas habilidades inimigas por 1 turno, recupera 10 de Vida e retorna à forma original. Aflições já ativas continuam. Não reinicia recargas.',{target:'self',heal:10,invulnerable:1,defense:true,kind:'defense',costs:{random:1},cooldown:4,shift:shiftTo('base'),classes:['Estratégica','Instantânea']},`${approved}/skill-despertar.webp`)
 ];
}
export function createFinalBoss(){return {...FINAL_BOSS,art:{portrait:FINAL_BOSS.portrait},abilities:createFinalBossAbilities()};}
