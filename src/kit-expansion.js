// Further PMA kit identities: reactions, support cycles and finite scaling.
const ids=['impulso','tecnica','voto'];
const A=(name,damage,cost=2,extra={})=>({name,damage,cost,target:'enemy',damageType:'physical',...extra});
const S=(name,extra,cost=1)=>A(name,0,cost,{target:'self',...extra});
const T=(i,form,turns=1,extra={})=>({slot:ids[i],form,turns,...extra});
const B=(...is)=>is.map(i=>T(i,'base',0));
const R=(trigger,extra)=>({trigger,turns:1,...extra});
const G=(amount,max)=>({amount,max,resetOnStun:true});
export function expandKit(elo,index,spec){
 if(spec.mechanic)return spec;
 const s=spec.skills;
 const set=(i,extra)=>Object.assign(s[i],extra);
 const form=(i,key,a)=>{s[i].forms=[...(s[i].forms||[]),{...a,formKey:key}];};
 const after=(i,shift,note)=>set(i,{shift,evolutionNote:note});
 const identity=(mechanic,combo)=>{spec.mechanic=mechanic;spec.combo=combo;};
 switch(`${elo}:${index}`){
 case 'sangria:3':
  form(1,'cross',A('Corte em Contratempo',15,2,{damageType:'piercing',dot:{tag:'sangramento',damage:4,turns:2},combo:{condition:'exposed',bonusDamage:5},shift:B(1)}));
  after(0,[T(1,'cross',1,{bindTarget:true})],'No próximo turno, Cutelo da Direita vira Corte em Contratempo contra a mesma vítima.');
  identity('Cadência cruzada','Use um corte para abrir o outro; escolha entre a continuação concentrada e o encontro das duas lâminas.');break;
 case 'sangria:4':
  set(0,{damage:5,weaken:0,reactive:R('support',{damage:10})});
  identity('Sentença contra apoio','Marque uma sentença que pune apoio; interrompa a vítima ou guarde a execução para quando ela estiver ferida.');break;
 case 'sangria:5':
  set(1,{heal:15,regen:{heal:4,turns:2},cooldown:1});
  identity('Cuidado com sacrifício','Troque sua Vida por guarda e recuperação futura de um aliado; sustente-se drenando o inimigo.');break;
 case 'coroa:1':
  set(0,{cost:2,sealSupport:1,cooldown:2});
  identity('Interdição de apoio','A acusação expõe e sela o apoio; a audiência interrompe e o veredito atravessa a redução de dano.');break;
 case 'coroa:2':
  set(0,{damage:15,cost:2,sealAttack:1,cooldown:1});
  set(1,{counterEffect:{drainEssence:{resource:'essence',amount:1},expose:1}});
  identity('Autoridade sem corpo','Interdite a ofensiva sem impedir o apoio; alterne o domínio com proteção coletiva e contra-ataques.');break;
 case 'coroa:4':
  set(1,{regen:{heal:2,turns:2}});
  identity('Comando persistente','Mantenha o trio com um comando que deixa recuperação futura; use as cinzas para preparar a purga.');break;
 case 'coroa:5':
  set(0,{damage:15,missingHpDamage:{step:25,amount:3,cap:9}});
  identity('Resistência cativa','O punho ganha força com a Vida perdida; escolha entre recuperar-se ou conservar o risco para a sucessão.');break;
 case 'mentira:0':
  set(0,{damage:5,dot:{tag:'veneno',damage:5,turns:2},reactive:R('attack',{damage:8})});
  identity('Segredo provocador','Envenene um segredo que pune a próxima ofensiva da vítima e depois cobra Essência.');break;
 case 'mentira:3':
  set(0,{damage:15,escalating:G(3,9)});
  identity('Discurso crescente','Repetir a sílaba aumenta seu dano até um limite; ser Atordoada quebra o ritmo do discurso.');break;
 case 'mentira:4':
  set(1,{heal:15,regen:{heal:3,turns:2},cost:2,generateEssence:{resource:'random',amount:1}});
  form(1,'confess',S('Confissão do Falso Santo',{heal:25,cleanse:true,perChargeHeal:3,spendCharge:true,shift:B(1)},2));
  after(1,[T(1,'confess',2)],'Vira Confissão do Falso Santo por 2 turnos: gaste as cargas em cuidado ou preserve-as para o milagre.');
  identity('Fé ou confissão','Cultive cargas com a falsa bênção e escolha entre confessar para recuperar-se ou fabricar um milagre ofensivo.');break;
 case 'mentira:5':
  set(1,{damage:10,cost:2,stripShield:15,sealSupport:1,cooldown:2});
  identity('Confisco de lembranças','Hipoteque uma memória e apague as opções de apoio da vítima antes de liquidar o passado.');break;
 case 'chama:0':
  set(0,{damage:10,reactive:R('idle',{damage:8}),cooldown:1});
  identity('Pavio que exige resposta','O pavio pune quem não usa uma técnica; a vítima precisa agir enquanto você prepara a detonação.');break;
 case 'chama:4':
  form(0,'reply',A('Lenha da Retaliação',20,2,{damageType:'energy',dot:{tag:'queimadura',damage:4,turns:2},shift:B(0)}));
  set(1,{reactive:R('damaged',{shift:[T(0,'reply',2,{bindTarget:true})]})});
  identity('Defesa em duas camadas','O círculo anula uma agressão; se outra ferir a pira, abre Lenha da Retaliação contra o agressor.');break;
 case 'chama:5':
  set(1,{damage:15,missingHpDamage:{step:20,amount:2,cap:10}});
  identity('Pressão do coração','A ebulição cresce com a Vida perdida, prepara o próximo golpe e disputa espaço com a descarga de cargas.');break;
 case 'fome:2':
  set(0,{damage:10,shieldFromStripped:.5});
  identity('Digestão de Defesa','Converta a Defesa removida em guarda própria, acumule refeições e escolha entre reserva vital e abismo.');break;
 case 'fome:3':
  set(1,{heal:8,regen:{heal:3,turns:2}});
  identity('Ração repartida','Divida uma cura menor agora que continua nos dois turnos seguintes, enquanto a privação prepara a cobrança.');break;
 case 'fome:4':
  set(0,{reactive:R('skill',{damage:10}),cooldown:1});
  identity('Dívida por ação','Assine uma dívida que cobra a próxima técnica usada pela vítima; escolha entre juros e execução do contrato.');break;
 case 'fome:5':
  set(1,{heal:15,missingHpHeal:{step:20,amount:3,cap:12}});
  identity('Contrapeso da carência','O contrapeso recupera mais Vida quanto mais ferido estiver o aliado; a fome coletiva ainda exige alvos feridos.');break;
 case 'podridao:0':
  set(0,{damage:5,dot:{tag:'decadencia',damage:4,turns:3},healingBlock:.5});
  identity('Ruína da recuperação','A decadência reduz a cura recebida; escolha entre degradar a guarda e concluir a decomposição.');break;
 case 'podridao:2':
  set(1,{damage:10,cost:2,wardFromDamage:.5});
  identity('Vantagem parasitária','Quebre a confiança para converter parte do dano real em Defesa própria; cobre a corrupção marcada em aflição.');break;
 case 'podridao:4':
  set(1,{heal:15,regen:{heal:6,turns:2},cooldown:1});
  identity('Sutura viva','A sutura limpa agora e restaura Vida nos próximos turnos; a colônia inimiga alimenta outra forma de recuperação.');break;
 case 'podridao:5':
  set(1,{shield:12,reactive:R('damaged',{damage:5})});
  identity('Jardim de retaliação','O solo protege cada aliado e pune a primeira agressão que atravessar sua guarda; as raízes mantêm a decadência.');break;
 case 'silencio:1':
  set(0,{damage:10,weaken:0,sealSupport:1,cooldown:1});
  identity('Tranca seletiva','Feche o apoio da vítima sem impedir sua ofensiva; marque a porta para interrompê-la no momento certo.');break;
 case 'silencio:3':
  set(1,{cost:1,counterFilter:['energy','affliction'],counterEffect:{stealEssence:{amount:1}}});
  identity('Vigília espiritual','A memória responde a técnicas espirituais ou de aflição, devolve dano e rouba 1 Essência; revele a presença para preparar o testemunho perfurante.');break;
 case 'silencio:4':
  set(0,{damage:10,reactive:R('support',{damage:8,drain:1})});
  identity('Isolamento oportunista','A presença vazia pune o próximo apoio da vítima com dano e perda de Essência; a ausência coletiva drena o restante.');break;
 case 'silencio:5':
  form(2,'ambush',A('Chegada pela Retaguarda',25,2,{ignoreCounters:true,combo:{condition:'exposed',bonusDamage:15},shift:B(2),cooldown:2}));
  set(1,{counterFilter:['physical','piercing'],counterEffect:{expose:1},counterShift:[T(2,'ambush',2,{bindTarget:true})],evolutionNote:'Ao anular uma técnica física ou perfurante, expõe o agressor e Chegar Depois vira Chegada pela Retaguarda contra ele por 2 turnos.'});
  identity('Emboscada após defesa','Anule uma agressão física para expor o agressor e abrir uma chegada que ignora contra-ataques, ou cobre diretamente a abertura exposta.');break;
 case 'carne:0':
  set(0,{cost:2,sealAttack:1,cooldown:2});
  identity('Posse da ofensiva','A posse sela ataques por uma ação, mas permite apoio; decida entre interromper a vítima marcada ou drenar sua Vida.');break;
 case 'carne:2':
  set(0,{damage:15,missingHpDamage:{step:25,amount:4,cap:12}});
  identity('Desejo de risco','Sacrifique Vida para carregar o desejo; o pulso fica mais forte conforme o corpo se aproxima do limite.');break;
 case 'carne:4':
  set(1,{counter:0,cost:1,heal:10,shield:10,reactive:R('damaged',{damage:8})});
  identity('Imagem que sente','A imagem ampara um aliado e devolve parte da próxima agressão que o ferir, sem anular a técnica recebida.');break;
 case 'vazio:1':
  set(0,{damage:10,reactive:R('idle',{damage:5,drain:1})});
  identity('Ausência que cobra espera','Drene Essência e deixe a ausência cobrar mais se a vítima não usar uma técnica em sua vez.');break;
 case 'vazio:3':
  form(1,'hide',S('Esconder-se do Sol',{heal:20,reduce:5,regen:{heal:3,turns:2}},2));
  set(1,{formRule:{type:'health',at:50,form:'hide'},evolutionNote:'Com 50 de Vida ou menos, vira Esconder-se do Sol, com custo e recuperação maiores.'});
  identity('Refúgio por necessidade','O refúgio muda quando a Vida baixa; escolha entre usá-lo e gastar a sombra acumulada numa ofensiva arriscada.');break;
 case 'vazio:4':
  set(1,{damage:5,cost:2,drain:0,sealAttack:1,cooldown:2});
  identity('Rasura de ações','Escreva um nome e raspe a próxima ofensiva da vítima; a conclusão ainda consome a marca da página.');break;
 case 'vazio:5':
  set(0,{dot:{tag:'decadencia',damage:4,turns:2},reactive:R('idle',{damage:5})});
  identity('Território que exige movimento','O chão corrói e pune a inatividade de cada inimigo; escolha quem receberá o endereço marcado.');break;
 case 'protecao:1':
  set(1,{reactive:R('damaged',{shieldSource:8}),cooldown:2});
  set(2,{perChargeDamage:6,shieldToDamage:{ratio:.25,cap:15,consume:true}});
  identity('Muralha que converge','Atravessar a guarda de seus aliados reforça sua própria muralha; o avanço gasta cargas e Defesa para romper a linha.');break;
 case 'protecao:2':
  set(1,{heal:10,shield:15,regen:{heal:5,turns:2}});
  identity('Permanência vital','Deixe recuperação futura com o aliado e sustente a própria resistência até o retorno ofensivo com pouca Vida.');break;
 case 'protecao:3':
  set(1,{counter:30,counterFilter:['physical','piercing'],counterRequiresShield:true,counterEffect:{generateEssence:{resource:'graca',amount:1}}});
  identity('Guarda contra lâminas','Com Defesa destrutível ainda presente, anula uma técnica física ou perfurante, devolve 30 de dano e gera 1 Graça.');break;
 case 'protecao:4':
  set(1,{target:'ally',shield:15,reduceCooldown:1,cooldown:3});
  identity('Proteção de tempo','Concentre a linha em um aliado para protegê-lo e reduzir a recarga de suas técnicas não defensivas.');break;
 case 'cura:0':
  set(1,{cleanseBonusShield:4});
  identity('Cuidado que recompõe','Limpar condições prejudiciais também produz Defesa; use a compaixão marcada para recuperar sua própria Vida.');break;
 case 'cura:2':
  set(1,{heal:20,missingHpHeal:{step:25,amount:3,cap:9}});
  identity('Luz dos feridos','Reconstruir o fôlego recupera mais Vida em alvos feridos e ainda prepara seu dano no turno seguinte.');break;
 case 'cura:3':
  set(0,{damage:13,escalating:G(2,8)});
  identity('Cultivo que amadurece','Repetir a raiz fortalece seus ataques de preparação; Atordoamento interrompe o cultivo e as cargas escolhem cura ou espinhos.');break;
 case 'cura:4':
  set(0,{reactive:R('attack',{healSource:8}),cooldown:1});
  identity('Serenidade provocada','Desarme a agressão: se a vítima ainda atacar, o usuário recupera Vida; a quietude continua sendo o controle mais forte.');break;
 case 'justica:1':
  set(0,{damage:15,escalating:G(2,8)});
  identity('Disciplina da lâmina','O corte ganha precisão ao ser repetido, até um limite; Atordoamento quebra a disciplina, sem apagar sua marca de ofensa.');break;
 case 'justica:3':
  set(1,{damage:15,cost:2,purgeBonusDamage:4,ignoreCounters:true,cooldown:1});
  identity('Prova contra vantagens','A prova pune bônus de dano, redução e contra-ataque ativos antes de removê-los; o registro prepara o testemunho coletivo.');break;
 case 'justica:4':
  set(1,{heal:20,reduceCooldown:1,cooldown:3});
  identity('Reparação de tempo','Repare Vida e condições enquanto reduz recargas não defensivas; conserve o Enfraquecimento para o limite da clemência.');break;
 case 'esperanca:1':
  set(1,{reactive:R('damaged',{healSource:5})});
  identity('Alento recíproco','Erga um aliado e recupere seu próprio fôlego se ele perder Vida por uma nova habilidade durante a resposta adversária.');break;
 case 'esperanca:3':
  set(1,{cost:3,reduceCooldown:1,cooldown:3});
  identity('Aurora que adianta','A aurora limpa, fortalece e reduz recargas não defensivas de um aliado; as cargas ainda alimentam o horizonte perfurante.');break;
 case 'esperanca:4':
  form(0,'delivered',A('Mensagem Recebida',15,2,{damageType:'energy',siphonToAlly:.5,shift:B(0)}));
  after(1,[T(0,'delivered',2)],'Sinal do Amanhã vira Mensagem Recebida por 2 turnos: dano que recupera o aliado proporcionalmente mais ferido.');
  identity('Entrega que retorna','Envie alento para abrir uma resposta que converte dano em recuperação do aliado mais ferido.');break;
 case 'verdade:0':
  set(0,{damage:10,cost:2,ignoreCounters:true,cooldown:1});
  identity('Revelação incontestável','A luz remove vantagens e expõe mesmo diante de um contra-ataque; Invulnerável ainda impede o alvo.');break;
 case 'verdade:1':
  set(1,{damage:10,cost:2,purgeBonusDamage:3,ignoreCounters:true,cooldown:1});
  identity('Vantagens despidas','A guarda e os bônus do adversário tornam o golpe de despir mais forte; o clarão continua ligado à marca da luz.');break;
 case 'verdade:4':
  set(0,{damage:5,reactive:R('attack',{damage:5})});
  identity('Intenção observada','A leitura enfraquece, expõe e pune a próxima ofensiva da vítima; escolha entre cuidar de um aliado e desarmar o alvo.');break;
 case 'uniao:0':
  set(0,{damage:10,siphonToAlly:.5});
  identity('Vínculo que distribui Vida','O laço ofensivo converte parte do dano real em recuperação do aliado mais ferido, além de marcar a corrente final.');break;
 case 'uniao:1':
  set(1,{heal:15,regen:{heal:4,turns:2}});
  identity('União duradoura','Reconstrua os fragmentos com limpeza, guarda e recuperação futura; escolha o amparo concentrado ou o fôlego coletivo.');break;
 case 'uniao:2':
  set(1,{reactive:R('damaged',{healBoth:6})});
  identity('Pacto de retorno','Uma agressão é anulada pelo pacto; se outra ferir o aliado, ele e o usuário recuperam Vida, sem duplicar se forem a mesma alma.');break;
 case 'uniao:4':
  form(1,'fulfill',S('Cumprir a Palavra',{target:'ally',heal:25,cleanse:true,shift:B(1)},2));
  set(1,{reactive:R('damaged',{shift:[T(1,'fulfill',2)]})});
  identity('Promessa provada','Se uma nova habilidade ferir quem você protegeu, o cuidado muda para Cumprir a Palavra por 2 turnos.');break;
 case 'criacao:2':
  set(0,{damage:10,siphonToAlly:.4});
  identity('Cultivo partilhado','Arar a alma já recupera o aliado mais ferido; acumule reservas para escolher a colheita coletiva ou os ramos ofensivos.');break;
 case 'criacao:3':
  form(0,'beam',S('Viga de Apoio',{target:'ally',shield:15,regen:{heal:3,turns:2},shift:B(0)},1));
  form(2,'collapse',A('Colapsar a Abóbada',20,3,{target:'all-enemies',shieldToDamage:{ratio:.25,cap:10,consume:true},shift:B(0,2),cooldown:2}));
  after(1,[T(0,'beam',2),T(2,'collapse',2)],'Abre Viga de Apoio e Colapsar a Abóbada por 2 turnos. O colapso encerra as duas variações e gasta sua Defesa.');
  identity('Arquitetura de escolhas','Erga a abóbada para abrir amparo concentrado ou um colapso coletivo que consome sua guarda.');break;
 case 'criacao:4':
  set(0,{cost:2,generateEssence:{resource:'graca',amount:1}});
  set(1,{cost:3,heal:8,reduceCooldown:1,cooldown:3});
  identity('Cadência que adianta','O refrão encurta as recargas não defensivas do trio; escolha quando pagar seu custo e quando gastar as cargas no canto.');break;
 case 'correntes-quebradas:3':
  form(0,'return',S('Passagem de Retorno',{target:'ally',heal:10,shield:10,shift:B(0)},1));
  after(1,[T(0,'return',1)],'No próximo turno, Abertura Impossível vira Passagem de Retorno para amparar um aliado.');
  identity('Travessia de volta','Proteja quem atravessa para abrir um retorno de amparo; escolha essa volta ou feche a passagem no inimigo marcado.');break;
 case 'correntes-quebradas:4':
  set(0,{damage:5,reactive:R('support',{drain:1,damage:5}),convertEssence:{from:'any',to:'random',amount:1}});
  identity('Nome que cobra amparo','O nome perdido drena agora e deixa uma cobrança para o próximo apoio da vítima; apagar a forma prepara o desfecho de aflição.');break;
 case 'correntes-quebradas:6':
  form(0,'weight',A('Peso da Asa',15,2,{damageType:'energy',sealAttack:1,shift:B(0),cooldown:2}));
  set(1,{counterFilter:['physical','piercing'],counterShift:[T(0,'weight',2,{bindTarget:true})],evolutionNote:'Ao anular uma técnica física ou perfurante, Pena ao Contrário vira Peso da Asa contra o agressor por 2 turnos.'});
  identity('Inversão de impulso','Devolva uma agressão física para abrir um golpe que sela a ofensiva do agressor; o Enfraquecimento ainda prepara a queda.');break;
 case 'correntes-quebradas:7':
  set(0,{damage:10,escalating:G(2,6)});
  identity('Trilha de estilhaços','Cada pegada reforça a próxima até um limite; Atordoamento rompe a sequência, enquanto a travessia final ainda cobra sua integridade.');break;
 case 'correntes-quebradas:8':
  form(0,'feign',S('Fingir Presença',{heal:10,counter:10},1));
  form(1,'resume',S('Retomar a Sombra',{heal:10,cleanse:true,shift:B(0,1)},1));
  after(1,[T(0,'feign',0),T(1,'resume',0)],'Assume uma postura de abrigo: troca o primeiro golpe por Fingir Presença até usar Retomar a Sombra.');
  identity('Sombra que se recolhe','Entre num contorno de abrigo para recuperar-se e contra-atacar, depois retome a sombra para voltar a marcar e drenar.');break;
 case 'correntes-quebradas:9':
  set(1,{reactive:R('damaged',{exposeAttacker:1})});
  identity('Ponte de contragolpe','Quem atravessa a proteção da ponte revela uma abertura; aproveite-a na travessia coletiva antes que desapareça.');break;
 case 'correntes-quebradas:10':
  form(0,'lend',S('Fôlego Emprestado',{target:'ally',heal:25,regen:{heal:4,turns:2},spendCharge:true},2));
  set(0,{formRule:{type:'charge',at:3,form:'lend'},evolutionNote:'Com 3 cargas, vira Fôlego Emprestado: gaste a reserva para recuperar um aliado ou use a descarga ofensiva.'});
  identity('Suspensão partilhada','Acumule o limiar para emprestar fôlego a um aliado ou solte a âncora num desfecho de aflição.');break;
 }
 return spec;
}

