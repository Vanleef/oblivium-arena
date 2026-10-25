const originalCrownless = '/art/characters/o-fim/original-crownless-20261025';
const formsArt = '/art/characters/o-fim/body-forms-distinct-20261024';
const transformedArt = '/art/characters/o-fim/body-forms-ivory-20261025';
const slots = ['fenda','decreto','coroa'];
const shiftTo = form => slots.map(slot=>({slot,form}));
const skill = (id,name,description,effects={},art=`${formsArt}/skill-${id}.webp`) => ({id,name,description,target:'enemy',costs:{affinity:1},cooldown:0,kind:'strike',classes:['Espiritual','Instantânea'],art,...effects});
// Manifestations of different observers' fears, never a canonical true body.
export const FINAL_BOSS = Object.freeze({
 id:'the-end',name:'O Fim',nameEn:'The End',title:'Rei do Inferno',role:'Rei do Inferno',
 realm:'Inferno',elo:'Vazio',eloId:'vazio',color:'void',symbol:'◍',affinity:'essence',maxHp:100,
 portrait:`${originalCrownless}/portrait.webp`,baseFormName:'Forma original',
 lore:'O Fim não tem rosto nem forma fixos. Assume sempre a forma do maior medo de quem o olha: cada observador encara uma manifestação única, mesmo quando várias almas o veem ao mesmo tempo.',
 artNote:'A forma original conserva a silhueta aprovada: um soberano esguio de rosto vazio, aros dourados e mantos escuros com marfim enraizado, agora sem coroa. Tirano é a única forma com coroa: uma diadema de guerra baixa, larga e assimétrica. Ele vira um colosso curvado de punhos enormes com placas e fragmentos de marfim localizados no ombro, antebraço e mãos; Predador segue uma fera rasteira e móvel; Ruína flutua sem coroa, com torso fragmentado, quatro braços espectrais, fios de contenção e fragmentos brancos no tórax e nos braços. Cada forma guarda apenas poucos sinais de O Fim. Nenhuma aparência é sua forma verdadeira.',
 mechanic:'Três manifestações do medo',
 baseArchetype:'transformation',archetype:'transformation',archetypes:['transformation'],baseArchetypes:['transformation'],
 combo:'Na forma original, escolha uma manifestação. Cada uma muda retrato, técnicas, arquétipo, Essência e efeito de entrada. Tirano esmaga guardas e ganha força conforme perde Vida com Cinza; Predador caça com Ruptura; Ruína prende e interrompe com magia espectral e Graça. Fim Inalcançável restaura 10 de Vida e a forma original. As recargas pertencem às posições e continuam entre formas.',
 bodyForms:Object.freeze([
  {key:'tyrant',resource:'cinza',archetype:'berserker',name:'Tirano',portrait:`${transformedArt}/portrait-tyrant.webp`,when:Object.fromEntries(slots.map(s=>[s,'tyrant'])),description:'Berserker · afinidade Cinza. Colosso curvado, punhos maciços e diadema de guerra. Golpes pesados quebram Defesa e ganham força conforme perde Vida. Medo de ser subjugado.'},
  {key:'predator',resource:'ruptura',archetype:'burst',name:'Predador',portrait:`${formsArt}/portrait-predator.webp`,when:Object.fromEntries(slots.map(s=>[s,'predator'])),description:'Executor · afinidade Ruptura. Persegue uma presa, recupera Vida e escolhe entre drená-la ou consumir sua marca. Medo de ser caçado.'},
  {key:'ruin',resource:'graca',archetype:'control',name:'Ruína',portrait:`${transformedArt}/portrait-ruin.webp`,when:Object.fromEntries(slots.map(s=>[s,'ruin'])),description:'Interditor · afinidade Graça. Sem coroa, flutua com torso fragmentado e quatro braços espectrais. Tece fios que prendem e interrompem. Medo de perder a própria continuidade.'}
 ])
});
export function createFinalBossAbilities(){
 const kits={
  tyrant:[
   skill('fenda','Punho de Cinza','Causa 20 de dano físico e prepara 1 carga.',{damage:20,damageType:'physical',gainCharge:1,classes:['Física','Instantânea']},`${transformedArt}/skill-tyrant-punch.webp`),
   skill('decreto','Quebra do Trono','Causa 20 de dano físico e remove 15 de Defesa do alvo antes do dano.',{damage:20,damageType:'physical',stripShield:15,costs:{affinity:1,random:1},cooldown:1,classes:['Física','Instantânea']},`${transformedArt}/skill-tyrant-break.webp`),
   skill('coroa','Queda Implacável','Causa 20 de dano físico, mais 10 por carga consumida e até 10 de dano conforme a Vida perdida.',{damage:20,damageType:'physical',perChargeDamage:10,spendCharge:true,missingHpDamage:{cap:10,step:25,amount:5},costs:{affinity:2,random:1},cooldown:2,classes:['Física','Instantânea']},`${transformedArt}/skill-tyrant-finisher.webp`)
  ],
  predator:[
   skill('rastro','Rastro Faminto','Causa 15 de dano físico, rouba 50% do dano causado como Vida e marca o alvo por 3 turnos.',{damage:15,damageType:'physical',lifesteal:.5,mark:'caca-fim',classes:['Física','Instantânea']},`${formsArt}/skill-rastro.webp`),
   skill('ceifar','Ceifar o Vínculo','Causa 25 de dano perfurante e rouba 50% do dano causado como Vida. Contra sua marca de caça, causa +10 de dano e consome a marca.',{damage:25,damageType:'piercing',lifesteal:.5,costs:{affinity:1,random:1},combo:{condition:'mark:caca-fim',bonusDamage:10,consume:true},cooldown:1,classes:['Perfurante','Instantânea']},`${formsArt}/skill-ceifar.webp`),
   skill('fome','Fome dos Reinos','Causa 20 de dano de aflição a um inimigo e drena 1 Essência da reserva inimiga. Contra sua marca de caça, causa +15 de dano e a consome.',{damage:20,damageType:'affliction',drain:1,combo:{condition:'mark:caca-fim',bonusDamage:15,consume:true},costs:{affinity:2,random:1},cooldown:2,classes:['Aflição','Instantânea']},`${formsArt}/skill-fome.webp`)
  ],
  ruin:[
   skill('cinza','Fio Espectral','Causa 10 de dano espiritual e marca o alvo com um fio espectral por 2 turnos.',{damage:10,damageType:'energy',mark:'fio-ruina',markTurns:2,classes:['Espiritual','Instantânea']},`${transformedArt}/skill-ruin-thread.webp`),
   skill('nome','Laço dos Ausentes','Causa 15 de dano espiritual. Contra sua marca, causa +10 de dano, Atordoa por 1 turno e consome o fio.',{damage:15,damageType:'energy',costs:{affinity:1,random:1},combo:{condition:'mark:fio-ruina',bonusDamage:10,stun:1,consume:true},cooldown:2,kind:'control',classes:['Espiritual','Instantânea']},`${transformedArt}/skill-ruin-bind.webp`),
   skill('fronteira','Círculo de Interdição','Causa 10 de dano espiritual a todos os inimigos, Enfraquece e sela apoio por 1 turno.',{damage:10,damageType:'energy',target:'all-enemies',weaken:1,sealSupport:1,costs:{affinity:2,random:1},cooldown:2,kind:'control',classes:['Espiritual','Instantânea']},`${transformedArt}/skill-ruin-circle.webp`)
  ]
 };
 const entryEffects={tyrant:{shield:10},predator:{boost:8},ruin:{generateEssence:{resource:'graca',amount:1}}};
 const entryDescriptions={tyrant:'Recebe 10 de Defesa ao entrar nesta forma.',predator:'Prepara +8 de dano para o próximo golpe ao entrar nesta forma.',ruin:'Gera 1 Graça ao entrar nesta forma.'};
 return [
  ...FINAL_BOSS.bodyForms.map((f,i)=>skill(slots[i],`Assumir ${f.name}`,`Assume ${f.name}, substitui as três primeiras técnicas e o retrato. ${entryDescriptions[f.key]} ${f.description} Permanece assim até usar Fim Inalcançável.`,{target:'self',...entryEffects[f.key],kind:'support',classes:['Transformação','Instantânea'],assumeForm:f.key,shift:shiftTo(f.key),forms:FINAL_BOSS.bodyForms.map(form=>({...kits[form.key][i],id:slots[i],formKey:form.key}))},f.portrait)),
  skill('despertar','Fim Inalcançável','Fica Invulnerável a novas habilidades inimigas por 1 turno, recupera 10 de Vida e retorna à forma original. Aflições já ativas continuam. Não reinicia recargas.',{target:'self',heal:10,invulnerable:1,defense:true,kind:'defense',costs:{random:1},cooldown:4,shift:shiftTo('base'),classes:['Estratégica','Instantânea']},`${originalCrownless}/skill-despertar.webp`)
 ];
}
export function createFinalBoss(){return {...FINAL_BOSS,art:{portrait:FINAL_BOSS.portrait},abilities:createFinalBossAbilities()};}
