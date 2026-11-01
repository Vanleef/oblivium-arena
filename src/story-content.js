import { characterById, worldLeaders } from './data.js';
import { getLanguage } from './i18n.js';

const worlds={
 inferno:{
  title:['A dívida que não termina','The Debt That Will Not End'],
  opening:['Os atos dos vivos alimentam Inferno. Desde o sono de Niith, O Fim, a paz se prolonga e certas mortes não encontram conclusão. Uma fenda atravessa os nove reinos.','The living feed Inferno through their actions. Since Niith, the End, fell asleep, peace has stretched on and some deaths cannot reach their end. A rift now runs through the nine realms.'],
  route:['Siga as marcas da violência, do excesso e da traição até a fronteira de Oblívio.','Follow the marks of violence, excess, and betrayal to the border of Oblivion.'],
  finale:['Na última fronteira, a manifestação de {leader} enfrenta o trio. Vencê-la não mata o lorde: sua forma cede e sua presença recua para o sono.','At the final border, {leader}’s manifestation faces the trio. Victory does not kill the lord: its form yields, and its presence returns to sleep.'],
  finalStep:['Confronto com o Lorde do Inferno','Confront the Lord of Hell']
 },
 paraiso:{
  title:['A luz que ainda espera','The Light That Still Waits'],
  opening:['Os atos de cuidado dos vivos sustentam Paraíso. As fissuras alcançaram as esferas celestes, e as almas que aguardavam amparo começam a perder o caminho.','Acts of care by the living sustain Paradise. The rifts have reached the celestial spheres, and souls waiting for refuge are beginning to lose their way.'],
  route:['Atravesse as esferas de virtude e reencontre a Guarda que mantém o caminho aberto.','Cross the spheres of virtue and find the Guardian who keeps the way open.'],
  finale:['Na última esfera, a manifestação de {leader} põe à prova a travessia. Vencê-la não mata a guardiã: sua forma cede e sua presença recua para o sono.','At the final sphere, {leader}’s manifestation tests the journey. Victory does not kill the guardian: her form yields, and her presence returns to sleep.'],
  finalStep:['Confronto com a Guardiã do Paraíso','Confront the Guardian of Paradise']
 },
 limbo:{
  title:['A passagem entre fins','The Passage Between Endings'],
  opening:['As ações dos vivos alimentam os três mundos, mas as almas sem conclusão se acumulam no Limbo. Nilo e os vestígios das escolhas antigas acompanham a rota.','The living feed all three worlds, but souls without an ending gather in Limbo. Nilo and the traces of old choices follow the route.'],
  route:['Atravesse o limiar, o rio e a sombra até descobrir o caminho que o Limbo tenta preservar.','Cross the threshold, river, and shadow to discover the path Limbo is trying to preserve.'],
  finale:['No Umbral, a manifestação de {leader} revela o último caminho. Vencê-la não mata o lorde: sua forma cede e sua presença recua para o sono.','At the Umbral, {leader}’s manifestation reveals the final path. Victory does not kill the lord: its form yields, and its presence returns to sleep.'],
  finalStep:['Confronto com o Lorde do Limbo','Confront the Lord of Limbo']
 }
};

const kingdomLines={
 flagelo:['A violência deste reino retorna contra quem a praticou. A fenda transforma cada agressão em novo elo.','Violence in this realm turns back on those who wield it. The rift turns every assault into another chain.'],
 magma:['O peso da avareza afunda as passagens. As correntes guardam nomes que alguém tentou comprar.','Greed weighs down every passage. The chains preserve names someone tried to buy.'],
 malebolge:['Dez fossos escondem a mesma fraude. Para avançar, o trio precisa seguir o rastro que os mentirosos deixaram.','Ten pits conceal the same fraud. To move on, the trio must follow the trail the liars left behind.'],
 estige:['O rancor mantém as águas turvas. Cada voz que o trio ouve repete uma ferida ainda aberta.','Resentment clouds the waters. Every voice the trio hears repeats a wound that has not closed.'],
 putrido:['A fome criou raízes no reino morto. A fenda se alimenta do que ainda resta de cada alma.','Hunger has taken root in the dead realm. The rift feeds on what remains of each soul.'],
 tartaro:['Os traidores permanecem presos no frio. No fundo, uma presença aprende a imitar o medo de quem se aproxima.','The traitors remain frozen. Below them, a presence learns to imitate the fear of whoever draws near.'],
 tormenta:['O desejo sem limite desvia a rota a cada passo. O trio precisa distinguir vontade de compulsão.','Unrestrained desire bends the route with every step. The trio must tell will from compulsion.'],
 blasfemia:['A negação ergue túmulos em brasa. A fissura responde a cada voto quebrado.','Denial raises burning tombs. The rift answers every broken vow.'],
 oblivio:['As almas sem batismo guardam lembranças sem luz. A trilha conduz à fronteira onde a presença de Niith pode ser alcançada.','Unbaptized souls keep memories without light. The trail leads to the border where Niith’s presence can be reached.'],
 lua:['As almas que falharam em seus votos ainda encontram acolhimento. A trilha pede que o trio sustente quem vacila.','Those who faltered in their vows still find refuge. The trail asks the trio to support those who stumble.'],
 mercurio:['A ambição terrena deixou marcas até onde a luz chega. A passagem testa o motivo por trás de cada gesto.','Earthly ambition left marks even where the light reaches. The passage tests the motive behind every deed.'],
 venus:['O amor terreno busca outra direção. As correntes se abrem quando o trio age sem possuir aquilo que protege.','Earthly love seeks another direction. The chains open when the trio protects without trying to possess.'],
 sol:['Os sábios deixaram respostas, mas nenhuma explica a fenda inteira. Cada encontro revela uma parte do mapa.','The wise left answers, but none explains the whole rift. Each encounter reveals another part of the map.'],
 marte:['Os guerreiros lutaram por ideais que os sobrevivem. A travessia pergunta quais causas ainda merecem defesa.','Warriors fought for ideals that outlived them. The journey asks which causes still deserve defense.'],
 jupiter:['A justiça depende de escolhas concretas. O reino pesa as decisões do trio antes de abrir a próxima passagem.','Justice depends on concrete choices. The realm weighs the trio’s decisions before opening the next passage.'],
 saturno:['O silêncio dos contemplativos cobre as escadas. A resposta só aparece para quem prossegue sem abandonar o grupo.','The contemplatives’ silence covers the stairways. An answer appears only to those who continue without leaving the group behind.'],
 estelar:['Fé, esperança e caridade sustentam as esferas. A fenda tenta separar as três virtudes.','Faith, hope, and charity sustain the spheres. The rift tries to divide the three virtues.'],
 empireo:['A Guarda do Paraíso protege o limiar final. A presença de Seraph aguarda além da última esfera.','The Guardian of Paradise protects the final threshold. Seraph’s presence waits beyond the last sphere.'],
 vestibulo:['Nenhuma porta confirma se o trio chegou ou partiu. O primeiro rastro de Nilo aponta para as passagens do Limbo.','No door confirms whether the trio has arrived or left. Nilo’s first trace points toward Limbo’s passages.'],
 purgatorio:['A esperança não apaga a culpa; torna possível atravessá-la. Almas em purificação apontam o próximo passo.','Hope does not erase guilt; it makes it possible to move through it. Souls in purification point to the next step.'],
 aqueronte:['O rio carrega lembranças de quem ainda não alcançou o outro lado. Uma presença observa do fim da corrente.','The river carries memories of those who have not reached the other side. A presence watches from the end of the current.'],
 umbral:['A luz e a sombra deixam de ser respostas opostas. O caminho final se revela na fronteira entre elas.','Light and shadow stop being opposite answers. The final path appears at their border.']
};
const pick=pair=>pair[getLanguage()==='en'?1:0];

export function campaignArc(realmId){
 const arc=worlds[realmId]||worlds.inferno;
 const leaderMeta=Object.values(worldLeaders).find(item=>item.realmId===realmId);
 const leader=leaderMeta?characterById[leaderMeta.rosterId]:null;
 const leaderName=leader?(`${leader.name}${leader.identityTitle?`, ${leader.identityTitle}`:''}`):'o lorde';
 return {title:pick(arc.title),opening:pick(arc.opening),route:pick(arc.route),finale:pick(arc.finale).replace('{leader}',leaderName),finalStep:pick(arc.finalStep),leaderId:leader?.id||null,leaderName:leader?.name||'Lorde'};
}

export function campaignChapter(realmId,kingdomId,kingdomName,index=0,total=1){
 const line=kingdomLines[kingdomId]||[
  `A travessia por ${kingdomName} revela outra marca da fissura que liga os três mundos.`,
  `The journey through ${kingdomName} reveals another trace of the rift linking the three worlds.`
 ];
 const n=Math.max(0,index)+1,count=Math.max(1,total);
 return {number:n,total:count,label:getLanguage()==='en'?`REALM ${n} OF ${count} · ${kingdomName.toUpperCase()}`:`REINO ${n} DE ${count} · ${kingdomName.toUpperCase()}`,line:pick(line),arc:campaignArc(realmId),finale:n===count};
}

const dialogue=[
 ['“Se a trilha nos escolheu, que veja o que fazemos com ela.”','“If the trail chose us, let it see what we do with it.”'],
 ['“Não precisamos concordar sobre o destino para proteger quem caminha ao nosso lado.”','“We do not need the same destination to protect those walking beside us.”'],
 ['“Quando o véu se abrir, lembrem-se de quem atravessou com vocês.”','“When the veil opens, remember who crossed it with you.”']
];
export function storyForRun(run){
 const speaker=characterById[run?.team?.[0]]?.name||(getLanguage()==='en'?'The trio':'O trio');
 const chapter=campaignChapter(run?.realmId,run?.eloId,run?.kingdomName||run?.eloId,run?.chapterIndex||0,run?.chapterCount||1);
 const line=run?.worldFinale?chapter.arc.finale:chapter.line;
 const chapterLabel=run?.worldFinale?chapter.arc.finalStep:chapter.label;
 const beat=run?.storyBeat||(run?.worldFinale?chapter.arc.finalStep:chapter.arc.route);
 return {voice:getLanguage()==='en'?'CAMPAIGN NARRATOR':'NARRADOR DA CAMPANHA',line,dialogue:`${speaker}: ${pick(dialogue[(run?.stage||0)%dialogue.length])}`,chapter:chapterLabel,beat};
}
export function storyMarkup(run){
 const story=storyForRun(run);
 return `<aside class="story-panel" aria-label="${getLanguage()==='en'?'Campaign story':'Narrativa da campanha'}"><span class="story-seal" aria-hidden="true">☽</span><div><div class="eyebrow">${story.chapter} · ${story.voice}</div><p>${story.line}</p><small>${story.dialogue}</small><i>${story.beat}</i></div></aside>`;
}
