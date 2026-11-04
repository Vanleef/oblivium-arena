import { expandKit } from "./kit-expansion.js";
// PMA identities use several distinct Arena structures, rather than a shared finisher template.
const slots=['impulso','tecnica','voto'];
const attack=(name,damage,cost=2,extra={})=>({name,damage,cost,target:'enemy',damageType:'physical',...extra});
const support=(name,extra,cost=1)=>attack(name,0,cost,{target:'self',...extra});
const shift=(slot,form,turns=1,extra={})=>({slot:slots[slot],form,turns,...extra});
const back=(...indices)=>indices.map(i=>shift(i,'base',0));
const dot=(tag,damage,turns)=>({tag,damage,turns});

export function evolveKit(elo,index,source){
 const spec={...source,skills:source.skills.map(a=>({...a}))},s=spec.skills;
 const form=(slot,key,a)=>{s[slot].forms=[...(s[slot].forms||[]),{...a,formKey:key}];};
 const after=(slot,changes,note)=>{s[slot].shift=changes;s[slot].evolutionNote=note;};
 const counter=(slot,changes,note)=>{s[slot].counterShift=changes;s[slot].evolutionNote=note;};
 const identity=(hint,family)=>{spec.combo=hint;spec.mechanic=family;};
 switch(`${elo}:${index}`){
 case 'sangria:0':
  form(0,'reopen',attack('Reabrir a Ferida',20,2,{combo:{condition:'bleed',bonusDamage:10,consume:true},shift:back(0)}));
  after(0,[shift(0,'reopen',2,{bindTarget:true})],'Vira Reabrir a Ferida por 2 turnos, somente contra a mesma vítima.');
  identity('Abra Sangramento e escolha entre reabrir a mesma ferida ou consumi-la na Sentença.','Execução encadeada');break;
 case 'sangria:1':
  form(0,'revenge',attack('Fio Reverso',25,2,{damageType:'piercing',lifesteal:.5,shift:back(0)}));
  counter(1,[shift(0,'revenge',2,{bindTarget:true})],'Se o contra-ataque ativar, Fio Escarlate vira Fio Reverso contra o agressor por 2 turnos.');
  identity('Atraia uma agressão ao véu para abrir uma cobrança de Vida contra quem o atacou.','Resposta ao agressor');break;
 case 'sangria:2':
  s[2].maxUses=2;s[2].depletedForm='empty';s[2].evolutionNote='Pode ser usada 2 vezes por combate; depois vira Caça sem Troféus.';
  form(2,'empty',attack('Caça sem Troféus',15,1,{perChargeDamage:3,spendCharge:true}));
  identity('Acumule troféus e escolha quando gastar as duas grandes execuções disponíveis no combate.','Munição limitada');break;
 case 'coroa:0':
  form(0,'edict',attack('Decreto sobre Todos',10,2,{target:'all-enemies',damageType:'energy',mark:'decreto'}));
  form(1,'edict',attack('Cadeia de Juramento',10,2,{target:'all-enemies',damageType:'energy',weaken:1}));
  form(2,'edict',support('Trono Incontestável',{target:'team',shield:12,boost:5},2));
  after(2,[shift(0,'edict',2),shift(1,'edict',2),shift(2,'edict',2)],'Durante 2 turnos, as três primeiras técnicas assumem o kit de domínio coletivo; depois, voltam sem reiniciar recargas.');
  identity('Assuma a forma de domínio para espalhar decretos, enfraquecer a linha e erguer um trono para o trio.','Forma de domínio');break;
 case 'coroa:3':
  form(0,'drag',attack('Apertar o Grilhão',15,1,{gainCharge:1,weaken:1,shift:back(0)}));
  after(0,[shift(0,'drag',1,{bindTarget:true})],'No próximo turno, vira Apertar o Grilhão contra a mesma vítima.');
  identity('Prenda uma vítima e escolha entre apertar o mesmo grilhão ou gastar as cargas no cárcere.','Perseguição');break;
 case 'mentira:1':
  form(0,'other',attack('Gesto de Outro Rosto',10,2,{counter:15,damageType:'energy',shift:back(0)}));
  s[2].convertEssence={from:'any',to:'random',amount:1};
  after(0,[shift(0,'other',2)],'Vira Gesto de Outro Rosto por 2 turnos: um ataque que prepara um contra-ataque pessoal.');
  identity('Empreste um rosto para marcar, mude a resposta e revele a traição quando o adversário baixar a guarda.','Alternância de intenções');break;
 case 'mentira:2':
  form(1,'unweave',support('Desatar a Trama',{target:'team',heal:8,cleanse:true,shift:back(1)},2));
  after(0,[shift(1,'unweave',1)],'No próximo turno, Rede de Falsidades vira Desatar a Trama.');
  identity('Prenda o adversário na trama e escolha entre continuar o controle ou desatar a rede para limpar o trio.','Controle ou amparo');break;
 case 'chama:1':
  form(0,'smother',attack('Labareda Sufocante',20,2,{damageType:'energy',dot:dot('queimadura',6,2),shift:back(0)}));
  form(1,'smother',attack('Cinzas de Sufoco',10,2,{target:'all-enemies',damageType:'energy',dot:dot('queimadura',4,2),cooldown:2}));
  form(2,'smother',attack('Fornalha Sepulcral',25,2,{damageType:'energy',combo:{condition:'burn',bonusDamage:10,consume:true},cooldown:2}));
  after(1,[shift(0,'smother',2,{condition:'burn',bindTarget:true}),shift(1,'smother',2,{condition:'burn'}),shift(2,'smother',2,{condition:'burn'})],'Se o alvo já tinha Queimadura, assuma por 2 turnos o kit de sufocamento: labareda, cinza coletiva e fornalha.');
  identity('Mantenha a Queimadura e assuma o corpo de sufocamento: pressão em área, controle do calor e uma fornalha que consome a condição.','Forma de sufocamento');break;
 case 'chama:2':
  form(0,'rage',attack('Punho do Ódio Solto',30,1,{selfDamage:10}));
  form(2,'eruption',attack('Ressentimento sem Freio',30,2,{damageType:'energy',selfDamage:10,combo:{condition:'selfWounded',bonusDamage:10},shift:back(0,2),cooldown:2}));
  after(1,[shift(0,'rage',2),shift(2,'eruption',2)],'Libera duas técnicas mais arriscadas por 2 turnos. Ressentimento sem Freio encerra a transformação.');
  identity('Alimente o ódio para transformar seus ataques por 2 turnos; o desfecho encerra a fúria e cobra Vida.','Transformação de risco');break;
 case 'chama:3':
  form(0,'rebirth',attack('Ressurgir do Carvão',25,2,{damageType:'energy',cleanse:true,perChargeDamage:3,spendCharge:true}));
  s[0].formRule={type:'charge',at:3,form:'rebirth'};s[0].evolutionNote='Com 3 cargas, vira Ressurgir do Carvão até as cargas serem gastas.';
  identity('Guarde calor até renascer; decida se gasta as reservas para atacar ou recuperar o corpo.','Limiar de cargas');break;
 case 'fome:0':
  form(0,'starved',attack('Fome sem Corpo',15,2,{damageType:'affliction',lifesteal:.6,drain:1,cooldown:1}));
  s[0].formRule={type:'health',at:50,form:'starved'};s[0].evolutionNote='Com 50 de Vida ou menos, vira Fome sem Corpo. Recuperar Vida acima de 50 restaura Mordida da Alma.';
  identity('A fome muda com sua Vida: ferido, você atravessa a Defesa e drena Essência; recuperado, volta a morder.','Forma por Vida');break;
 case 'fome:1':
  form(1,'open',support('Abrir o Cofre',{heal:20,perChargeHeal:5,spendCharge:true,shift:back(1)},2));
  after(1,[shift(1,'open',2)],'Vira Abrir o Cofre por 2 turnos; gastar as reservas restaura esta técnica.');
  identity('Guarde o que roubou e escolha se as cargas vão para o Confisco ou para abrir uma reserva vital.','Reserva conversível');break;
 case 'podridao:1':
  form(1,'fever',attack('Febre de Retorno',15,2,{damageType:'affliction',combo:{condition:'poison',bonusDamage:10},shift:back(1),cooldown:1}));
  after(1,[shift(1,'fever',2)],'Vira Febre de Retorno por 2 turnos: concentre o contágio em uma vítima.');
  identity('Espalhe Veneno e transforme o contágio coletivo em uma cobrança concentrada.','Propagação e foco');break;
 case 'podridao:3':
  form(1,'bloom',support('Florescer para os Vivos',{target:'team',heal:8,shield:8,perChargeHeal:4,spendCharge:true,shift:back(1,2)},2));
  form(2,'cloud',attack('Esporos da Última Colheita',15,3,{target:'all-enemies',damageType:'affliction',perChargeDamage:3,spendCharge:true,shift:back(1,2),cooldown:2}));
  after(0,[shift(1,'bloom',2),shift(2,'cloud',2)],'Abre Florescer para os Vivos e Esporos da Última Colheita por 2 turnos. Usar uma das duas encerra ambas.');
  identity('Semeie uma colônia e escolha sua colheita: proteger os vivos ou espalhar esporos ofensivos.','Desfechos exclusivos');break;
 case 'silencio:0':
  form(2,'witness',attack('Resposta da Testemunha',30,2,{damageType:'energy',perChargeDamage:5,spendCharge:true,shift:back(2),cooldown:2}));
  counter(1,[shift(2,'witness',2,{bindTarget:true})],'Se o contra-ataque ativar, Peso do Testemunho vira Resposta da Testemunha contra o agressor por 2 turnos.');
  identity('Registre o acontecimento e provoque uma resposta: a agressão ao contra-ataque revela um desfecho próprio.','Testemunho reativo');break;
 case 'silencio:2':
  form(0,'echo',attack('Som que Não Retorna',20,2,{damageType:'affliction',weaken:1,shift:back(0)}));
  after(1,[shift(0,'echo',1,{bindTarget:true})],'No próximo turno, Impacto Abafado vira Som que Não Retorna contra o alvo interrompido.');
  identity('Prolongue o Enfraquecimento e escolha entre a onda de combo ou interromper para abrir um golpe de aflição.','Interrupção e continuação');break;
 case 'carne:1':
  form(0,'skin',attack('Lâmina da Pele Nova',15,1,{damageType:'piercing',stripShield:15}));
  form(1,'shed',support('Descartar a Forma',{heal:15,cleanse:true,shift:back(0,1)},1));
  after(1,[shift(0,'skin',0),shift(1,'shed',0)],'Assume a pele nova até usar Descartar a Forma. Troca Lâmina de Epiderme e esta técnica.');
  identity('Assuma uma pele que atravessa redução de dano; descarte-a para recuperar Vida e voltar à forma anterior.','Postura reversível');break;
 case 'carne:3':
  form(1,'hold',attack('Manter o Comando',15,2,{stun:1,requiredMark:'nervo',requiresLink:true,shift:back(1),cooldown:3}));
  after(1,[shift(1,'hold',1,{condition:'mark:nervo',bindTarget:true})],'Se ativar o combo, vira Manter o Comando no próximo turno, apenas contra a mesma vítima. Atordoamento ou Invulnerável quebra a ligação.');
  identity('Conecte os nervos e escolha entre sustentar o controle por mais uma ação ou romper os fios no desfecho.','Controle com ligação');break;
 case 'carne:5':
  form(1,'remove',support('Retirar a Sutura',{target:'ally',heal:10,shield:15,shift:back(1)},1));
  after(1,[shift(1,'remove',1)],'No próximo turno, vira Retirar a Sutura: amparo sem nova limpeza.');
  identity('Alterne o cuidado da sutura e sua retirada, preservando a opção de abrir os pontos do inimigo marcado.','Ciclo de cuidado');break;
 case 'vazio:0':
  form(0,'erase',attack('Ausência Definitiva',25,2,{damageType:'affliction',combo:{condition:'mark:apagamento',bonusDamage:5,consume:true},requiredMark:'apagamento',shift:back(0)}));
  after(0,[shift(0,'erase',2,{bindTarget:true})],'Vira Ausência Definitiva por 2 turnos, apenas contra o alvo da marca.');
  identity('Apague as vantagens e escolha qual técnica consumirá a presença marcada do adversário.','Apagamento dirigido');break;
 case 'vazio:2':
  s[2].maxUses=2;s[2].depletedForm='residual';s[2].evolutionNote='Pode ser usada 2 vezes por combate; depois vira Silêncio Residual.';
  form(2,'residual',attack('Silêncio Residual',20,1,{damageType:'piercing',combo:{condition:'wounded',bonusDamage:5}}));
  identity('Guarde suas duas sentenças mais fortes para os feridos; depois delas, o silêncio muda de forma.','Sentenças limitadas');break;
 case 'protecao:0':
  form(0,'advance',attack('Avanço da Égide',20,2,{damageType:'piercing',shield:5,combo:{condition:'selfShielded',bonusDamage:5},shift:back(0)}));
  after(0,[shift(0,'advance',2)],'Vira Avanço da Égide por 2 turnos; usá-lo restaura Golpe do Bastião.');
  identity('Erga a própria guarda e escolha entre o avanço curto e a Resposta da Égide mais forte.','Guarda em avanço');break;
 case 'cura:1':
  form(2,'pure',support('Reserva Imaculada',{target:'team',heal:15,perChargeHeal:5,spendCharge:true,cleanse:true},3));
  s[2].formRule={type:'charge',at:2,form:'pure'};s[2].evolutionNote='Com pelo menos 2 cargas, vira Reserva Imaculada: mais cura e limpeza coletiva, com custo maior.';
  identity('Prepare Vida até a reserva se tornar uma restauração coletiva mais cara, capaz de limpar o trio.','Aprimoramento por reserva');break;
 case 'justica:0':
  form(1,'verdict',attack('Reparação do Veredito',15,1,{damageType:'energy',heal:10,shift:back(1)}));
  after(1,[shift(1,'verdict',1)],'No próximo turno, vira Reparação do Veredito: dano que restaura Vida ao usuário.');
  identity('Ofereça amparo e depois converta a misericórdia em um veredito que devolve Vida ao usuário.','Amparo e cobrança');break;
 case 'justica:2':
  form(0,'balance',attack('Prato Ascendente',15,2,{damageType:'energy',shield:10,mark:'peso',gainCharge:1,shift:back(0)}));
  after(2,[shift(0,'balance',2)],'Pesar os Atos vira Prato Ascendente por 2 turnos, preparando uma nova decisão com Defesa.');
  identity('Pese, julgue e recupere o equilíbrio: a decisão abre uma preparação diferente para o próximo ciclo.','Ciclo de julgamento');break;
 case 'esperanca:0':
  form(0,'dawn',attack('Chama do Recomeço',20,2,{damageType:'energy',dot:dot('queimadura',5,2),heal:5,shift:back(0)}));
  after(1,[shift(0,'dawn',2)],'Fagulha do Amanhã vira Chama do Recomeço por 2 turnos.');
  identity('Recupere o fôlego para reacender um ataque diferente ou guarde as cargas para a aurora.','Recomeço ofensivo');break;
 case 'esperanca:2':
  form(0,'chorus',attack('Coro de Muitas Vozes',10,2,{target:'all-enemies',damageType:'energy',mark:'voz'}));
  form(1,'solo',support('Encerrar o Hino',{target:'self',heal:15,shift:back(0,1)}));
  after(1,[shift(0,'chorus',0),shift(1,'solo',0)],'Abre Coro de Muitas Vozes até usar Encerrar o Hino.');
  identity('Inicie um hino para marcar vários inimigos com o coro ou encerre-o para recuperar sua própria voz.','Postura de coro');break;
 case 'verdade:2':
  form(0,'returned',attack('Estilhaço Devolvido',25,2,{damageType:'piercing',purge:true,shift:back(0)}));
  counter(1,[shift(0,'returned',2,{bindTarget:true})],'Se o contra-ataque ativar, Imagem Verdadeira vira Estilhaço Devolvido contra o agressor por 2 turnos.');
  identity('Mostre uma abertura e devolva a intenção: uma agressão ao espelho libera o estilhaço contra seu autor.','Reflexo preparado');break;
 case 'verdade:3':
  form(1,'shortcut',support('Atalho da Clareza',{target:'ally',heal:15,cleanse:true,boost:5,shift:back(1)},2));
  after(0,[shift(1,'shortcut',1)],'No próximo turno, Caminho Seguro vira Atalho da Clareza: amparo concentrado em um aliado.');
  identity('Trace uma abertura e use o atalho para recuperar um aliado, ou preserve a rota para convergir no ataque.','Rota de apoio');break;
 case 'uniao:3':
  form(0,'second',support('Segunda Voz',{target:'ally',heal:15,gainCharge:1,shift:[shift(0,'third',2)]},1));
  form(0,'third',attack('Terceira Voz',20,2,{perChargeDamage:5,spendCharge:true,shift:back(0)}));
  after(0,[shift(0,'second',2)],'Vira Segunda Voz por 2 turnos; ela abre Terceira Voz por mais 2 turnos.');
  identity('Alterne três vozes no mesmo espaço: ataque, amparo e desfecho, sem perder as outras opções do trio.','Cadeia de três técnicas');break;
 case 'criacao:0':
  form(0,'construct',attack('Forma que Rompe',25,2,{damageType:'piercing',perChargeDamage:3,spendCharge:true,shift:back(0)}));
  after(1,[shift(0,'construct',2)],'Fragmento Nascente vira Forma que Rompe por 2 turnos.');
  identity('Crie amparo para abrir uma forma perfurante; escolha entre ela e a Obra Convergente para gastar as cargas.','Construção alternativa');break;
 case 'criacao:1':
  form(0,'fruit',support('Fruto do Porvir',{heal:20,shield:10,spendCharge:true},2));
  s[0].formRule={type:'charge',at:3,form:'fruit'};s[0].evolutionNote='Com 3 cargas, vira Fruto do Porvir: gaste a reserva em cuidado pessoal ou use outra técnica.';
  identity('A semente amadurece com as cargas: colha amparo para si ou conserve a marca para germinar no inimigo.','Amadurecimento');break;
 case 'correntes-quebradas:0':
  form(0,'next',attack('Passo Seguinte',20,2,{damageType:'piercing',gainCharge:1,shift:[shift(0,'previous',1,{bindTarget:true})]}));
  form(0,'previous',attack('Passo Anterior',15,1,{damageType:'energy',weaken:2,shift:back(0)}));
  after(0,[shift(0,'next',2,{bindTarget:true})],'Vira Passo Seguinte contra a mesma vítima por 2 turnos; ele abre Passo Anterior por 1 turno.');
  identity('Percorra uma sequência de três passos contra a mesma vítima ou gaste suas cargas no Golpe Descontínuo.','Sequência temporal');break;
 case 'correntes-quebradas:1':
  form(0,'mend',support('Reatar a Linha',{target:'ally',shield:15,cleanse:true,shift:back(0)},1));
  after(0,[shift(0,'mend',1)],'No próximo turno, vira Reatar a Linha: transforme a ruptura em proteção para um aliado.');
  identity('Abra uma extremidade no inimigo e escolha entre reatar o fio para proteger ou puxar seu fim para atacar.','Ruptura e reparação');break;
 case 'correntes-quebradas:2':
  form(0,'stolen',attack('Eco sem Origem',10,1,{damageType:'energy',gainCharge:1}));
  form(1,'stolen',support('Voz Devolvida',{target:'team',shield:10,cleanse:true},2));
  form(2,'stolen',attack('Ressonância Roubada',15,3,{target:'all-enemies',damageType:'energy',perChargeDamage:5,spendCharge:true,shift:back(2),cooldown:2}));
  s[2].convertEssence={from:'ruptura',to:'random',amount:1};
  counter(1,[shift(0,'stolen',2),shift(1,'stolen',2),shift(2,'stolen',2)],'Se o contra-ataque ativar, assuma por 2 turnos o corpo ecoante: golpe, amparo e ressonância coletiva.');
  identity('Colete ecos e devolva uma agressão para mudar o trio inteiro de postura: golpe leve, limpeza coletiva e ressonância que gasta cargas.','Forma de ressonância');break;
 case 'correntes-quebradas:5':
  form(2,'release',attack('Retomar o Instante',35,3,{damageType:'energy',perChargeDamage:5,spendCharge:true,selfDamage:5,shift:back(2),cooldown:2}));
  after(1,[shift(2,'release',1,{bindTarget:true})],'No próximo turno, Devolver os Segundos vira Retomar o Instante contra o alvo interrompido.');
  identity('Acumule segundos e pare um alvo para abrir uma janela curta de descarga concentrada.','Janela de execução');break;
 }
 return expandKit(elo,index,spec);
}

