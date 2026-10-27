// Presentation revisions use permanent character IDs, never a new name-derived ID.
const fullArt = new Set(['a-senhora-do-ultimo-pao','o-surdo','o-quarto-vazio']);
const eloArt = new Set(['o-estomago-sem-fundo','o-equilibrio','o-menino-sem-sombra']);
const entityArt = new Set(['a-balanca-vazia','a-muralha','o-lugar-de-ninguem']);
const spiritArt = new Set(['a-pira-errante','o-jardim-morto','a-luz-que-restaura']);
const diverseArt = new Set(['o-devorador','o-ultimo-guardiao','o-eco-sem-dono']);
const continuationArt = new Set(['a-semente','a-linha-partida']);
const chamaArt = new Set(['o-odio-encarnado','o-coracao-em-furia']);
const painterlyChamaArt = new Set(['a-brasa-eterna','o-odio-encarnado']);
const painterlyRework20261026Art = new Set(['o-falso-profeta','o-corretor-de-memorias']);
const animeFirstRework20261026Art = new Set(['o-falso-profeta','o-corretor-de-memorias','a-pira-errante']);
const hybridInfernoRework20261027Art = new Set(['o-que-pesa','o-incendiario']);
const painterlyFomeArt = new Set(['o-devorador','a-mao-que-toma','o-estomago-sem-fundo','a-senhora-do-ultimo-pao','o-credor','a-balanca-vazia']);
const painterlySilencioArt = new Set(['o-que-observou','a-porta-fechada','o-surdo','a-testemunha-cega','o-quarto-vazio','o-vigia-ausente']);
const painterlyCarneArt = new Map([['o-que-possui','painterly-rework-20261025'],['a-pele-alheia','painterly-rework-20261026-animal'],['o-desejo-quebrado','painterly-rework-20261026'],['a-marionetista-de-nervos','painterly-rework-20261026'],['o-espelho-carnal','painterly-rework-20261026'],['a-costureira','painterly-rework-20261026']]);
const painterlyPodridaoArt = new Set(['a-praga-andante','o-corrupto','a-rainha-dos-fungos']);
const painterlyBatchArt = new Set([
  'o-acougueiro','a-viuva-escarlate','o-colecionador-de-cabecas','gemeos-do-cutelo',
  'o-carrasco-sem-rosto','a-mae-rubra','o-soberano-quebrado','a-juiza-de-ferro',
  'o-trono-vazio','o-principe-das-correntes','a-regente-de-cinzas','o-herdeiro-cativo',
  'o-sussurro','a-mascara-dupla','o-tecelao-de-mentiras','a-boca-de-vidro'
]);
const chamaCompletionForms = {'a-brasa-eterna':'smother','o-filho-da-cinza':'rebirth','a-pira-errante':'reply'};
const spiritSlots = {
  'o-espelho-carnal':['tecnica'],
  'a-pele-alheia':['despertar'],
  'a-ultima-pagina':['voto','despertar'],
  'o-que-apaga':['impulso','voto','despertar']
};
const entitySlots = {
  'o-filho-da-cinza':['passive','tecnica','despertar'],
  'a-guardia-das-promessas':['tecnica']
};
const personalDefenseArt = new Set(['a-mao-que-toma','o-vigia-ausente','o-desejo-quebrado','o-que-ficou']);
export const characterRevisions = {
  "a-viuva-escarlate": {
    "name": "Mavia",
    "title": "A Viúva",
    "englishName": "Mavia",
    "englishTitle": "The Widow",
    "aliases": ["A Viúva Escarlate","A Viúva"],
    "lore": "Conserva no véu escarlate a lembrança de cada agressão que recebeu. Atrai a lâmina alheia para perto e transforma a resposta em uma cobrança de vitalidade. Seu luto se prolonga na violência que oferece a Sangria."
  },
  "o-colecionador-de-cabecas": {
    "name": "Verres",
    "title": "O Colecionador",
    "englishName": "Verres",
    "englishTitle": "The Collector",
    "aliases": ["O Colecionador de Cabeças","O Colecionador"],
    "lore": "Retém a assinatura espiritual de cada vítima como um troféu. Persegue quem já deixou uma abertura e reúne os vestígios da caçada para uma execução preparada com cuidado. Seu acervo cresce com a carnificina que alimenta Sangria."
  },
  "gemeos-do-cutelo": {
    "name": "Cleobis e Biton",
    "title": "Gêmeos do Cutelo",
    "englishName": "Cleobis and Biton",
    "englishTitle": "The Cleaver Twins",
    "aliases": ["Gêmeos do Cutelo"],
    "lore": "Gêmeos fraternos de Sangria, semelhantes no olhar e no desenho do rosto apesar das diferenças de pele e cabelo, dividem o ritmo de uma mesma caçada. O corte de um abre caminho para a lâmina do outro, até que os golpes se encontrem sobre a vítima. Sua cumplicidade cruel transforma cada aproximação em ameaça dupla."
  },
  "o-carrasco-sem-rosto": {
    "name": "Sanson",
    "title": "O Carrasco",
    "englishName": "Sanson",
    "englishTitle": "The Executioner",
    "aliases": ["O Carrasco sem Rosto","O Carrasco"],
    "lore": "A sentença que impõe transforma qualquer auxílio oferecido à vítima em mais um motivo para puni-la. Oculta a própria identidade enquanto escolhe quando interromper a resistência e quando concluir a execução. Sangria reconhece seus atos pela lâmina que desce."
  },
  "a-mae-rubra": {
    "name": "Julia Maesa",
    "title": "A Mãe Rubra",
    "englishName": "Julia Maesa",
    "englishTitle": "The Red Mother",
    "aliases": ["A Mãe Rubra"],
    "lore": "Estende um cordão de essência roubada para manter seus predadores em movimento; para ela, proteção é posse. Cede vitalidade para sustentar os lacaios que escolheu e recupera o custo drenando outra alma. Sob seu domínio, Sangria continua a caçada."
  },
  "o-soberano-quebrado": {
    "name": "Astyages",
    "title": "O Soberano",
    "englishName": "Astyages",
    "englishTitle": "The Sovereign",
    "aliases": ["O Soberano Quebrado","O Soberano"],
    "lore": "Carrega uma autoridade fraturada que exige ser reconhecida a cada encontro. Ao assumir a coroa, espalha decretos e escolhe quem deverá se ajoelhar. Cada vontade subjugada recompõe uma parte do domínio que oferece a Coroa."
  },
  "o-principe-das-correntes": {
    "name": "Demetrius",
    "title": "O Príncipe",
    "englishName": "Demetrius",
    "englishTitle": "The Prince",
    "aliases": ["O Príncipe das Correntes","O Príncipe"],
    "lore": "Recebeu os grilhões de uma dinastia e os transformou em instrumento de ascensão. Prende uma alma, aperta o mesmo vínculo e reúne a força necessária para fechar o cárcere. Para ele, a herança de Coroa só tem valor enquanto alguém permanece submetido."
  },
  "o-sussurro": {
    "name": "Hárpago",
    "title": "O Sussurro",
    "englishName": "Harpagus",
    "englishTitle": "The Whisper",
    "aliases": ["O Sussurro"],
    "lore": "Este espírito anfíbio de corpo baixo e largo negocia segredos nos canais de Mentira. A bolsa vocal sob sua mandíbula mistura a palavra ao veneno; o leque de ferro cobra o que a vítima ainda conserva. Sob as pálpebras pesadas, seus olhos de jade acompanham a confiança que acabou de corromper."
  },
  "a-mascara-dupla": {
    "name": "Zópiro",
    "title": "A Máscara Dupla",
    "englishName": "Zopyrus",
    "englishTitle": "The Double Mask",
    "aliases": ["A Máscara Dupla"],
    "lore": "Oferece um rosto à confiança e reserva o outro para a traição. Cada máscara muda a resposta que prepara, enquanto a vítima acredita ter aprendido suas intenções. Vive das certezas que Mentira permite fabricar por um instante."
  },
  "o-tecelao-de-mentiras": {
    "name": "Bagoas",
    "title": "O Intrigante",
    "englishName": "Bagoas",
    "englishTitle": "The Schemer",
    "aliases": ["O Tecelão de Mentiras","O Intrigante"],
    "lore": "Organiza versões incompatíveis de um mesmo acontecimento em uma trama de fios espirituais. Prende quem tenta escapar das contradições e desata os vínculos que debilitam seus cúmplices apenas quando ainda podem servir à intriga. Não age por lealdade: conserva sempre uma ponta da trama fora de vista para voltar a prendê-los."
  },
  "o-falso-profeta": {
    "name": "Joanna Southcott",
    "title": "O Falso Profeta",
    "englishName": "Joanna Southcott",
    "englishTitle": "The False Prophet",
    "aliases": ["O Falso Profeta","O Impostor"],
    "lore": "Apresenta como revelação aquilo que preparou para obter obediência. Acumula força com bênçãos fabricadas e transforma a expectativa dos outros em um milagre ofensivo. Quando a farsa ameaça ruir, a confissão lhe devolve fôlego para recomeçar."
  },
  "o-corretor-de-memorias": {
    "name": "Annius",
    "title": "O Falsário",
    "englishName": "Annius",
    "englishTitle": "The Forger",
    "aliases": ["O Corretor de Memórias","O Falsário"],
    "lore": "Adultera lembranças e negocia as versões que sobreviveram à falsificação. Hipoteca um passado, retira dele os amparos que sustentavam a vítima e cobra a memória que deixou marcada. Seus arquivos guardam as histórias que Mentira tornou convenientes."
  },
  "o-incendiario": {
    "name": "Heróstrato",
    "title": "O Incendiário",
    "englishName": "Herostratus",
    "englishTitle": "The Arsonist",
    "aliases": ["O Incendiário"],
    "lore": "Prepara o pavio antes de deixar a raiva tomar o lugar. Sua chama pune a hesitação e espalha fagulhas até que encontre o momento de detonar. Alimenta Chama ao transformar cada espera em uma ameaça de vingança."
  },
  "a-brasa-eterna": {
    "name": "Perpetua",
    "title": "A Brasa Eterna",
    "englishName": "Perpetua",
    "englishTitle": "The Eternal Ember",
    "aliases": ["A Brasa Eterna"],
    "lore": "Conserva o calor de uma ofensa muito depois de sua origem desaparecer. A queimadura persiste sob as cinzas, sufoca a resistência e se reúne em uma fornalha quando o rancor encontra saída. Sua constância dá ao ódio de Chama tempo para consumir."
  },
  "o-odio-encarnado": {
    "name": "Fritigerno",
    "title": "O Furor",
    "englishName": "Fritigern",
    "englishTitle": "The Fury",
    "aliases": ["O Ódio Encarnado","O Furor"],
    "lore": "Dá passagem a uma fúria que muda a violência de seus próprios golpes. Quanto mais a alimenta, mais difícil se torna sustentar a forma que a contém. O desfecho devolve a pressão sobre sua integridade, espalhando o ódio que fortalece Chama."
  },
  "o-credor": {
    "name": "Florus",
    "title": "O Credor",
    "englishName": "Florus",
    "englishTitle": "The Creditor",
    "aliases": ["O Credor"],
    "lore": "Converte a necessidade de outra alma em um contrato que nunca deixa de cobrar. Cada técnica da vítima pode produzir novos juros, até que a dívida se torne uma execução anunciada. Fome prospera nos vínculos de dependência que ele preserva."
  },
  "o-apodrecido": {
    "name": "Zósimo",
    "title": "O Apodrecido",
    "englishName": "Zosimus",
    "englishTitle": "The Rotted One",
    "aliases": ["O Apodrecido"],
    "lore": "Desfruta a ruína que provoca e escolhe matéria espiritual já fragilizada para aprofundar sua decadência. Seu contato impede a recuperação, faz a guarda ceder e mantém a vítima se desfazendo sob a influência de Podridão."
  },
  "o-corrupto": {
    "name": "Hárpalo",
    "title": "O Corrupto",
    "englishName": "Harpalus",
    "englishTitle": "The Corrupted One",
    "aliases": ["O Corrupto"],
    "lore": "Oferece acordos cuja confiança já nasceu comprometida. Marca a outra parte e converte a quebra do pacto em proteção para si, prolongando a vantagem obtida sobre quem acreditou nele. A ruína de cada compromisso alimenta Podridão."
  },
  "a-rainha-dos-fungos": {
    "name": "Beatrix Potter",
    "title": "A Rainha dos Fungos",
    "englishName": "Beatrix Potter",
    "englishTitle": "The Fungus Queen",
    "aliases": ["A Rainha dos Fungos"],
    "lore": "Faz de cada alma alcançada um possível abrigo para sua colônia. Conserva os próprios hospedeiros sob o micélio e reúne esporos para uma colheita que pode sustentar seus cúmplices ou contaminar os adversários. A vida que cultiva existe para espalhar Podridão."
  },
  "a-marionetista-de-nervos": {
    "name": "Aristagoras",
    "title": "A Marionetista",
    "englishName": "Aristagoras",
    "englishTitle": "The Puppeteer",
    "aliases": ["A Marionetista de Nervos","A Marionetista"],
    "lore": "Prende fios espirituais às respostas do corpo alheio. Sustenta o comando enquanto a vítima tenta recuperar os próprios movimentos e escolhe o instante de romper a ligação em dor. Cada gesto imposto prolonga o abuso que fortalece Carne."
  },
  "a-ausencia": {
    "name": "Nabonidus",
    "title": "A Ausência",
    "englishName": "Nabonidus",
    "englishTitle": "The Absence",
    "aliases": ["A Ausência"],
    "lore": "Deixa uma lacuna onde uma alma esperava encontrar apoio, vigor ou continuidade. Sua passagem consome as reservas da vítima e prolonga a perda quando ela hesita em agir. O vazio que abre se espalha até a própria presença tornar-se impossível de alcançar."
  },
  "o-escudo-vivo": {
    "name": "Themistocles",
    "title": "O Escudo Vivo",
    "englishName": "Themistocles",
    "englishTitle": "The Living Shield",
    "aliases": ["O Escudo Vivo"],
    "lore": "Escolheu permanecer entre a ameaça e quem precisa atravessar. Reúne a própria guarda antes de avançar e transforma a resistência acumulada em uma resposta da égide. Seu amparo mantém aberta uma linha de defesa para quem ainda precisa atravessar."
  },
  "a-sentinela-azul": {
    "name": "Sittas",
    "title": "A Sentinela",
    "englishName": "Sittas",
    "englishTitle": "The Sentinel",
    "aliases": ["A Sentinela Azul","A Sentinela"],
    "lore": "Reconhece o instante em que um companheiro precisa de espaço para agir. Concentra a linha de proteção nessa alma, devolve ritmo às suas técnicas e aponta a abertura que a equipe poderá aproveitar. Sua vigília mantém Proteção atenta ao próximo movimento."
  },
  "a-mao-que-cura": {
    "name": "Trotula",
    "title": "A Compassiva",
    "englishName": "Trotula",
    "englishTitle": "The Compassionate One",
    "aliases": ["A Mão que Cura","A Compassiva"],
    "lore": "Percebe a dor que uma alma tenta ocultar e a alcança com cuidado. Remove as aflições que interrompem a recuperação e recompõe uma guarda ao redor do que ainda está frágil. A compaixão que oferece também lhe permite recuperar o próprio fôlego."
  },
  "o-restaurador": {
    "name": "Avicena",
    "title": "O Restaurador",
    "englishName": "Avicenna",
    "englishTitle": "The Restorer",
    "aliases": ["O Restaurador"],
    "lore": "Reúne aos poucos a vitalidade dispersa pelo sofrimento. Conserva essa reserva até poder devolvê-la em uma restauração que alcança seus companheiros e desfaz as aflições que os prendem. Cada retorno sustenta a continuidade da vida."
  },
  "o-pulso-sereno": {
    "name": "Asclepiades",
    "title": "O Sereno",
    "englishName": "Asclepiades",
    "englishTitle": "The Serene One",
    "aliases": ["O Pulso Sereno","O Sereno"],
    "lore": "Escuta o descompasso que antecede uma agressão e responde com um ritmo capaz de contê-la. Sua quietude enfraquece a violência, devolve fôlego e interrompe o impulso que ameaça romper o cuidado. Cura se manifesta nele como presença paciente."
  },
  "a-lamina-justa": {
    "name": "Viriato",
    "title": "A Íntegra",
    "englishName": "Viriathus",
    "englishTitle": "The Upright One",
    "aliases": ["A Lâmina Justa","A Íntegra"],
    "lore": "Submete a própria lâmina à disciplina do princípio que escolheu seguir. Cada corte reafirma a medida do anterior, até encontrar a precisão necessária para deter o agressor. Sua força em Justiça depende da constância com que sustenta essa decisão."
  },
  "a-testemunha-integra": {
    "name": "Maqrizi",
    "title": "A Testemunha",
    "englishName": "Maqrizi",
    "englishTitle": "The Witness",
    "aliases": ["A Testemunha Íntegra","A Testemunha"],
    "lore": "Conserva o registro que o poder gostaria de fazer desaparecer. Expõe a vantagem construída sobre o abuso e reúne a prova necessária para que outras almas possam responder. Seu testemunho dá a Justiça uma voz que permanece íntegra sob pressão."
  },
  "a-chama-que-nao-apaga": {
    "name": "Telesilla",
    "title": "A Perseverante",
    "englishName": "Telesilla",
    "englishTitle": "The Persevering One",
    "aliases": ["A Chama que Não Apaga","A Perseverante"],
    "lore": "Cuida da última fagulha quando tudo ao redor parece encerrado. Recupera o fôlego, reacende a própria força e guarda calor suficiente para abrir uma nova aurora. Cada tentativa de continuar fortalece Esperança."
  },
  "o-portador-da-aurora": {
    "name": "Aurelian",
    "title": "O Alvorecer",
    "englishName": "Aurelian",
    "englishTitle": "The Dawn",
    "aliases": ["O Portador da Aurora","O Alvorecer"],
    "lore": "Carrega a possibilidade de um horizonte além do confronto presente. Sua luz restitui clareza, vigor e tempo de reação a um aliado antes de se concentrar contra a ameaça. A esperança que concede permite ao trio avançar mais um passo."
  },
  "a-mensageira-do-amanha": {
    "name": "Phoebe",
    "title": "A Mensageira",
    "englishName": "Phoebe",
    "englishTitle": "The Messenger",
    "aliases": ["A Mensageira do Amanhã","A Mensageira"],
    "lore": "Atravessa o combate com uma promessa de chegada. Entrega alento a um companheiro e prepara uma resposta que pode devolver fôlego à alma mais ferida. Sua mensagem só se completa quando alguém encontra forças para continuar."
  },
  "o-que-revela": {
    "name": "Hecataeus",
    "title": "O Revelador",
    "englishName": "Hecataeus",
    "englishTitle": "The Revealer",
    "aliases": ["O que Revela","O Revelador"],
    "lore": "Dirige a luz ao detalhe que uma vantagem fabricada tentou esconder. Retira o amparo do engano e deixa a intenção exposta para que o trio possa agir com clareza. Em Verdade, sua presença torna visível aquilo que sustentava a ameaça."
  },
  "o-espelho": {
    "name": "Parrhasius",
    "title": "O Espelho",
    "englishName": "Parrhasius",
    "englishTitle": "The Mirror",
    "aliases": ["O Espelho"],
    "lore": "Devolve à agressão a imagem de sua própria intenção. Mostra uma abertura, acolhe o risco da resposta e prepara o estilhaço que retornará ao autor do golpe. A superfície que manifesta em Verdade conserva o que de fato lhe foi apresentado."
  },
  "o-elo-dourado": {
    "name": "Damon",
    "title": "O Fraterno",
    "englishName": "Damon",
    "englishTitle": "The Brother",
    "aliases": ["O Elo Dourado","O Fraterno"],
    "lore": "Firma um laço que leva aos companheiros parte do vigor conquistado em combate. Sua ofensiva abre uma corrente de cooperação, fazendo a resposta de um alcançar a alma que mais precisa de amparo. União se fortalece na reciprocidade que ele mantém."
  },
  "os-tres-irmaos": {
    "name": "Hannibal, Hasdrubal e Mago",
    "title": "Os Três Irmãos",
    "englishName": "Hannibal, Hasdrubal, and Mago",
    "englishTitle": "The Three Brothers",
    "aliases": ["Os Três Irmãos"],
    "lore": "Três almas conservaram a própria voz dentro de um mesmo compromisso. Alternam ataque, amparo e desfecho em uma cadência que só existe porque cada uma cede espaço à seguinte. Sua irmandade transforma a cooperação em presença de União."
  },
  "o-cultivador": {
    "name": "Palladius",
    "title": "O Cultivador",
    "englishName": "Palladius",
    "englishTitle": "The Cultivator",
    "aliases": ["O Cultivador"],
    "lore": "Prepara a matéria espiritual para que a vida encontre onde continuar. Cada sulco já devolve fôlego a uma alma, enquanto as reservas reunidas aguardam a escolha entre uma colheita de amparo e os ramos que conterão a ameaça. Criação cresce com o cuidado que ele repete."
  },
  "a-arquiteta-verde": {
    "name": "Amanishakheto",
    "title": "A Arquiteta",
    "englishName": "Amanishakheto",
    "englishTitle": "The Architect",
    "aliases": ["A Arquiteta Verde","A Arquiteta"],
    "lore": "Ergue estruturas vivas capazes de sustentar novas possibilidades. Distribui o peso entre pilares e abóbadas, escolhendo quando conservar o abrigo e quando fazer a própria obra convergir contra o agressor. Cada construção dá a Criação um lugar para permanecer."
  },
  "o-passo-interrompido": {
    "name": "Zeno",
    "title": "O Descontínuo",
    "englishName": "Zeno",
    "englishTitle": "The Discontinuous One",
    "aliases": ["O Passo Interrompido","O Descontínuo"],
    "lore": "Já não atravessa os instantes na ordem em que os outros os percebem. Segue a mesma vítima por passos que se adiantam, retornam e deixam uma fissura onde a continuidade falhou. Cada travessia exige reunir de novo a própria presença no Limbo."
  },
  "o-nome-esquecido": {
    "name": "Geta",
    "title": "O Esquecido",
    "englishName": "Geta",
    "englishTitle": "The Forgotten One",
    "aliases": ["O Nome Esquecido","O Esquecido"],
    "lore": "Restaram-lhe sílabas de um nome que nenhuma lembrança consegue completar. Sua passagem faz outras almas perderem referências e dispersa a essência de que ainda dispunham. No Limbo, tenta sustentar o próprio contorno entre recordações que continuam cedendo."
  },
  "a-asa-invertida": {
    "name": "Firnas",
    "title": "A Inversa",
    "englishName": "Firnas",
    "englishTitle": "The Inverted One",
    "aliases": ["A Asa Invertida","A Inversa"],
    "lore": "Encontra impulso nas direções em que outras presenças apenas cairiam. Inverte a trajetória de uma agressão e usa a abertura para devolver o desequilíbrio ao responsável. Sua relação instável com a gravidade acompanha as fraturas do Limbo."
  },
  "o-andarilho-de-vidro": {
    "name": "Scylax",
    "title": "O Andarilho",
    "englishName": "Scylax",
    "englishTitle": "The Glass Walker",
    "aliases": ["O Andarilho de Vidro","O Andarilho"],
    "lore": "Cada travessia deixa uma pegada de vidro espiritual, frágil o bastante para se romper e nítida o bastante para orientar o passo seguinte. A sequência fortalece seu avanço, mas uma interrupção desfaz o caminho que vinha reunindo. Continua andando entre os instantes partidos do Limbo."
  },
  "a-sombra-inconstante": {
    "name": "Peregrinus",
    "title": "A Oscilante",
    "englishName": "Peregrinus",
    "englishTitle": "The Oscillating One",
    "aliases": ["A Sombra Inconstante","A Oscilante"],
    "lore": "Seu contorno oscila entre a presença que persegue e o abrigo em que tenta se recompor. Muda de estado para responder à ameaça, depois retorna à penumbra onde pode marcar e drenar. No Limbo, até a sombra precisa negociar o tempo de sua permanência."
  },
  "a-boca-de-vidro": {
    "name": "Aspasia",
    "title": "A Serpe",
    "englishName": "Aspasia",
    "englishTitle": "The Serpent",
    "aliases": ["A Boca de Vidro","A Serpe"],
    "role": "Predadora de Reflexos",
    "roleHint": "Repetir o sibilo aumenta seu dano até o limite; Atordoamento quebra a sequência.",
    "lore": "Uma entidade serpentina de vidro espiritual que se esconde nas contradições dos próprios reflexos. Seus sibilos atravessam a guarda, expõem a vítima e desfazem reservas alheias. Sussurra promessas de saídas que nunca existiram, conduzindo suas vítimas até uma abertura na própria defesa.",
    "terms": {
      "Sílaba Cortante": "Sibilo Cortante",
      "Confissão Rachada": "Reflexo Traiçoeiro",
      "Discurso em Estilhaços": "Coro de Estilhaços",
      "Reflexo da Boca": "Reflexo Desviado"
    },
  },
  "a-semente": {
    "name": "Columella",
    "title": "A Semente",
    "englishName": "Columella",
    "englishTitle": "The Seed",
    "aliases": ["A Semente"],
    "role": "Germinação Espiritual",
    "lore": "Uma vida vegetal que preserva possibilidades nas ruínas de Criação. Amadurece essência em seu núcleo, abriga outras almas entre folhas vivas e faz florescer a marca espiritual que deixou no agressor. Cultiva novos caminhos onde outras almas só encontravam ruínas.",
    "terms": {
      "Semente da Ruptura": "Marca Germinal",
      "Germinar por Dentro": "Florescer da Marca"
    },
    "aliases": []
  },
  "a-linha-partida": {
    "name": "Empedocles",
    "title": "A Cindida",
    "englishName": "Empedocles",
    "englishTitle": "The Shattered One",
    "aliases": ["A Linha Partida","A Cindida"],
    "role": "Alma Fragmentada",
    "lore": "Uma alma do Limbo cujos fragmentos já não ocupam o mesmo instante. Três fios instáveis conservam sua continuidade: ela os projeta para romper a guarda inimiga ou os reata em torno de um aliado, cedendo parte da própria integridade. Cada ajuda deixa seus fragmentos mais distantes, mas ela insiste em reatar o que ainda pode alcançar.",
    "terms": {},
  },
  "o-primeiro-canto": {
    "name": "Terpander",
    "title": "O Ressonante",
    "englishName": "Terpander",
    "englishTitle": "The Resonant One",
    "aliases": ["O Primeiro Canto","O Cantor","O Ressonante"],
    "lore": "Sua voz dá ritmo à matéria espiritual de Criação, apressando o despertar de novas possibilidades. O canto ampara o trio e reúne uma cadência que pode ser liberada contra quem ameaça a vida nascente.",
    "terms": {},
  },
  "o-coracao-em-furia": {
    "name": "Cambyses",
    "title": "O Colérico",
    "englishName": "Cambyses",
    "englishTitle": "The Wrathful One",
    "aliases": ["O Coração em Fúria","O Colérico"],
    "lore": "Transforma cada afronta em pressão ardente. A raiva acelera o pulso e fortalece sua próxima descarga, mas cobra a própria integridade quando ele força o corpo além do limite. Alimenta Chama pelo ódio que insiste em devolver.",
    "terms": {},
  },
  "o-vinculo": {
    "name": "John Rabe",
    "title": "O Altruísta",
    "englishName": "John Rabe",
    "englishTitle": "The Altruist",
    "aliases": ["O Vínculo","O Companheiro","O Leal","O Altruísta"],
    "lore": "Escolhe permanecer ao lado de outra alma sem tomar sua liberdade. Seu pacto ampara, responde à agressão e partilha a recuperação entre os envolvidos: a força de União nasce da lealdade consentida.",
    "terms": {},
  },
  'o-devorador': {
    role: 'Fera da Avidez',
    lore: 'Uma fera quadrúpede de Fome, cuja voracidade não conhece saciedade. Corrói a guarda das vítimas com saliva espiritual e incorpora a essência que devora; quando ferida, sua fome ultrapassa a matéria e alcança as reservas alheias.',
    terms: {'Mandíbula do Vazio': 'Couraça Voraz'}
  },
  "o-ultimo-guardiao": {
    "name": "Belisarius",
    "title": "O Guardião",
    "englishName": "Belisarius",
    "englishTitle": "The Guardian",
    "aliases": ["O Último Guardião","O Guardião"],
    "role": "Sentinela Ancestral",
    "lore": "Um espírito quadrúpede abrigado em uma carapaça de pedra viva. Permanece no limiar de Proteção para que outras almas atravessem em segurança. Seu chifre marca a ameaça, e as placas de seu corpo projetam amparo antes de devolver a agressão.",
    "terms": {
      "Lança da Guarda": "Investida Vigilante",
      "Alvorecer do Guardião": "Revide Radiante"
    },
  },
  "o-eco-sem-dono": {
    "name": "Cassiodorus",
    "title": "O Eco",
    "englishName": "Cassiodorus",
    "englishTitle": "The Echo",
    "aliases": ["O Eco sem Dono","O Eco"],
    "role": "Ressonância Errante",
    "lore": "Vozes que perderam sua origem no Limbo persistem numa espiral de névoa e anéis partidos. Sem rosto ou corpo humano, a aparição recolhe vibrações e devolve o que a atinge. Cada coro a desfaz um pouco, a menos que encontre uma ressonância alheia para sustentar-se.",
    "terms": {},
  },
  "o-acougueiro": {
    "name": "Baltasar",
    "title": "O Açougueiro",
    "englishName": "Balthasar",
    "englishTitle": "The Butcher",
    "aliases": ["O Açougueiro"],
    "lore": "Uma criatura de carne brutalmente robusta, Balthasar Gérard fareja o sangue de vítimas feridas e transforma a próxima investida em uma sequência mais implacável. Cada golpe aprofunda a caçada que alimenta Sangria.",
    "terms": {
      "Separar Tendões": "Talho Imobilizante"
    }
  },
  "a-juiza-de-ferro": {
    "name": "Pheretime",
    "title": "A Magistrada",
    "englishName": "Pheretime",
    "englishTitle": "The Magistrate",
    "aliases": ["A Magistrada","A Juíza de Ferro"],
    "role": "Magistrada Tirânica",
    "lore": "A toga do Inferno transforma autoridade em obediência. Não pesa culpa nem repara injustiças: expõe, interdita e condena quem desafia seu domínio.",
    "terms": {
      "Peso da Lei": "Lei do Mais Forte",
      "Acusação de Ferro": "Acusação Imposta",
      "Audiência Suspensa": "Interdição da Defesa",
      "Veredito Irrecorrível": "Sentença de Submissão",
      "Sala Inviolável": "Toga Inviolável"
    },
    "roleHint": "Imponha uma acusação para expor e selar o apoio; interrompa a resistência antes da sentença perfurante."
  },
  "o-herdeiro-cativo": {
    "name": "Arminius",
    "title": "O Herdeiro",
    "englishName": "Arminius",
    "englishTitle": "The Heir",
    "aliases": ["O Herdeiro","O Herdeiro Cativo"],
    "role": "Tirano Herdeiro",
    "lore": "Uma alma dinástica habita esta efígie de porcelana viva, de pescoço longo e olhos rubros. O antebraço esquerdo de correntes sustenta as fraturas que armazenam sua ambição. Conserva os grilhões para subjugar os próximos; cada lasca perdida reforça sua pretensão ao trono de Coroa.",
    "terms": {
      "Vontade Cativa": "Ambição Acorrentada",
      "Aguentar o Decreto": "Resistência do Pretendente",
      "Sucessão Rompida": "Tomada do Trono",
      "Brecha na Cela": "Guarda Dinástica"
    },
    "roleHint": "Use a Vida perdida para fortalecer o punho; recupere-se ou gaste as cargas na tomada do trono."
  },
  "o-estomago-sem-fundo": {
    "name": "Apicius",
    "title": "O Insaciável",
    "englishName": "Apicius",
    "englishTitle": "The Insatiable One",
    "aliases": ["O Abismo","O Abismo Voraz","O Estômago sem Fundo","O Insaciável"],
    "role": "Predador de Reservas",
    "lore": "Devora a proteção que outros acumularam e incorpora os despojos ao próprio corpo. Nada o satisfaz: até a guarda de uma alma se torna alimento para a próxima cobrança de Fome.",
    "terms": {
      "Digestão Lenta": "Assimilação",
      "Corrosão Faminta": "Consumir a Guarda",
      "Reserva do Estômago": "Reserva Consumida",
      "Fundo que Não Existe": "Fome Devorante",
      "Refúgio no Abismo": "Corpo Recolhido"
    },
    "roleHint": "Consuma a Defesa inimiga para formar sua própria guarda; reúna reservas e gaste-as na fome de aflição.",
  },
  "a-senhora-do-ultimo-pao": {
    "name": "Helena de Adiabene",
    "title": "A Matriarca",
    "englishName": "Helena of Adiabene",
    "englishTitle": "The Matriarch",
    "aliases": ["A Matriarca","A Senhora do Último Pão"],
    "role": "Soberana da Privação",
    "lore": "Acumula o sustento que falta aos outros. Só alimenta os seus para conservar a dependência; cada ração concedida reforça o domínio sobre quem depende dela.",
    "terms": {
      "Última Migalha": "Lucro da Privação",
      "Dividir o Último Pão": "Ração dos Submissos",
      "Dívida da Mesa Vazia": "Tributo da Fome",
      "Mesa Inviolável": "Celeiro Lacrado"
    },
    "roleHint": "Drene Essência com a marca da privação, sustente seus aliados dependentes e cobre o tributo do alvo marcado."
  },
  "a-balanca-vazia": {
    "name": "Faustilla",
    "title": "A Usurária",
    "englishName": "Faustilla",
    "englishTitle": "The Usurer",
    "aliases": ["A Balança Vazia","A Usurária da Penúria","A Usurária"],
    "role": "Credora Predatória",
    "lore": "Oferece sustento como quem calcula uma cobrança futura. O auxílio cresce onde a falta é maior, mas serve apenas para preservar dependentes; quando a penúria se aprofunda, ela amplia a própria ofensiva.",
    "terms": {
      "Peso da Carência": "Lucro da Carência",
      "Prato da Falta": "Cobrança da Penúria",
      "Contrapeso Vital": "Adiantamento Vital",
      "Fome em Equilíbrio": "Confisco Coletivo",
      "Peso Zero": "Penhor Inalcançável"
    },
    "roleHint": "Drene a reserva inimiga e sustente um aliado ferido; o confisco pune inimigos já enfraquecidos pela perda de Vida.",
  },
  "o-que-observou": {
    "name": "Procopius",
    "title": "O Espectador",
    "englishName": "Procopius",
    "englishTitle": "The Onlooker",
    "aliases": ["O Espectador","O que Observou"],
    "role": "Observador da Omissão",
    "lore": "Presenciou o sofrimento e escolheu permanecer à margem. Guarda as falhas dos outros como armas, sem jamais responder aos pedidos de socorro.",
    "terms": {
      "Olhos que Não Piscam": "Indiferença Vigilante",
      "Registrar a Falha": "Memória da Omissão",
      "Peso do Testemunho": "Peso da Indiferença",
      "Resposta da Testemunha": "Retaliação do Espectador"
    },
    "roleHint": "Registre a vítima, recuse a interferência e transforme as cargas de observação em retaliação espiritual."
  },
  "a-porta-fechada": {
    "name": "Sejanus",
    "title": "A Carcereira",
    "englishName": "Sejanus",
    "englishTitle": "The Jailer",
    "aliases": ["A Carcereira","A Porta Fechada"],
    "lore": "Decide quem ficará do lado de fora. Concede abrigo aos cúmplices enquanto transforma o desamparo alheio em um cárcere sem resposta.",
    "terms": {
      "Lado de Dentro": "Abrigo dos Cúmplices",
      "Tranca do Refúgio": "Guarida Seletiva",
      "Porta Fora do Mundo": "Limiar Interdito"
    }
  },
  "o-surdo": {
    "name": "Li Si",
    "title": "O Silenciador",
    "englishName": "Li Si",
    "englishTitle": "The Silencer",
    "aliases": ["O Silenciador","O Surdo"],
    "role": "Supressor de Vozes",
    "lore": "Não lhe falta a capacidade de ouvir: ele escolhe extinguir a resposta. Sua presença sufoca clamores e interrompe quem tenta romper a omissão de Silêncio.",
    "terms": {
      "Ruído Abafado": "Clamor Sufocado",
      "Cessar do Som": "Interditar a Voz",
      "Onda Inaudível": "Decreto do Silêncio",
      "Som que Não Retorna": "Clamor sem Retorno"
    },
    "roleHint": "Enfraqueça a voz inimiga, interrompa sua ação e escolha entre prolongar a aflição ou liberar o decreto."
  },
  "a-testemunha-cega": {
    "name": "Josefo",
    "title": "A Cúmplice",
    "englishName": "Josephus",
    "englishTitle": "The Accomplice",
    "aliases": ["A Cúmplice","A Testemunha Cega"],
    "role": "Cúmplice do Silêncio",
    "lore": "Conhece o que aconteceu e retém o testemunho quando ele faria diferença. Só revela uma abertura quando isso favorece sua própria sobrevivência.",
    "terms": {
      "Visão sem Olhos": "Cumplicidade Velada",
      "Presença Denunciada": "Segredo Exposto",
      "Memória do Golpe": "Resposta Preparada",
      "Testemunho Final": "Acusação Oportunista",
      "Campo sem Testemunha": "Depoimento Retido"
    }
  },
  "o-quarto-vazio": {
    "name": "Macarius",
    "title": "O Anfitrião",
    "englishName": "Macarius",
    "englishTitle": "The Host",
    "aliases": ["O Anfitrião","O Quarto Vazio"],
    "role": "Entidade do Isolamento",
    "lore": "Um hospedeiro espectral que oferece uma entrada e nega qualquer acolhimento. Sua presença projeta corredores vazios onde nenhum pedido de socorro encontra resposta.",
    "terms": {
      "Vazio Habitado": "Hospitalidade Negada",
      "Ausência Pesada": "Convite ao Isolamento",
      "Quarto sem Retorno": "Estadia sem Retorno",
      "Quarto Inacessível": "Porta do Desamparo"
    }
  },
  "o-que-possui": {
    "name": "Andriscus",
    "title": "O Usurpador",
    "englishName": "Andriscus",
    "englishTitle": "The Usurper",
    "aliases": ["O Usurpador","O que Possui"],
    "lore": "Manifesta a posse abusiva sobre outro corpo. Sua ligação espiritual impõe comandos e toma a vitalidade de quem foi marcado.",
    "terms": {
      "Usufruto Vital": "Espoliação Vital"
    }
  },
  "a-costureira": {
    "name": "Sushruta",
    "title": "A Suturadora",
    "englishName": "Sushruta",
    "englishTitle": "The Stitcher",
    "aliases": ["A Suturadora","A Costureira"],
    "lore": "Enxerga corpos e decisões como pontos que pode apertar ou desfazer. Repara seus aliados para conservar o controle e abre as costuras da vítima marcada.",
    "terms": {
      "Linha da Reparação": "Fio do Controle",
      "Sutura Perfeita": "Sutura de Domínio",
      "Retirar a Sutura": "Reforçar os Pontos"
    },
    "roleHint": "Use o fio para marcar e ferir; sustente seus aliados com suturas e desfaça os pontos da vítima no desfecho."
  },
  "o-fim-silencioso": {
    "name": "Tiglate",
    "title": "O Arauto",
    "englishName": "Tiglath",
    "englishTitle": "The Herald",
    "aliases": ["O Arauto","O Fim Silencioso"],
    "lore": "Uma manifestação do Vazio que anuncia a perda de toda continuidade. Sua lâmina interrompe a vontade antes de extinguir a presença da vítima.",
    "terms": {
      "Aviso do Fim": "Presságio de Extinção"
    }
  },
  "o-que-pesa": {
    "name": "Aristides",
    "title": "O Regulador",
    "englishName": "Aristides",
    "englishTitle": "The Regulator",
    "aliases": ["O Ponderador","O que Pesa"],
    "lore": "Encara a consequência antes de julgar. Acumula o peso dos atos para deter o excesso com uma decisão proporcional, sem recorrer à opressão de Coroa."
  },
  "o-julgador-gentil": {
    "name": "Ashoka",
    "title": "O Juiz",
    "englishName": "Ashoka",
    "englishTitle": "The Judge",
    "aliases": ["O Juiz","O Julgador Gentil"],
    "lore": "A clemência não enfraquece sua autoridade: define quando reparar e quando deter uma agressão. Sua justiça preserva a medida que os tiranos abandonaram.",
    "terms": {
      "Gentileza Firme": "Clemência Inabalável",
      "Advertência Serena": "Advertência do Juiz"
    }
  },
  "o-que-levanta": {
    "name": "Sundiata",
    "title": "O Tenaz",
    "englishName": "Sundiata",
    "englishTitle": "The Steadfast",
    "aliases": ["O Inquebrantável","O que Levanta"],
    "lore": "Representa a perseverança de Esperança. Retorna ao combate e ergue um companheiro sem prometer que a travessia será indolor."
  },
  "a-voz": {
    "name": "Arion",
    "title": "A Voz",
    "englishName": "Arion",
    "englishTitle": "The Voice",
    "aliases": ["A Voz"],
    "lore": "O canto transforma em coragem a confiança que uma alma empresta à outra. Seu apoio sustenta o trio e se amplia quando a perseverança se torna coletiva."
  },
  "o-olho-desarmado": {
    "name": "Haytham",
    "title": "O Vidente",
    "englishName": "Haytham",
    "englishTitle": "The Seer",
    "aliases": ["O Vidente","O Olho Desarmado"],
    "lore": "Revela a intenção por trás do gesto, sem confundir clareza com crueldade. Usa esse conhecimento para conter o agressor e amparar quem ficou exposto.",
    "terms": {
      "Cuidar sem Defesa": "Amparo da Clareza",
      "Ponto Cego Sereno": "Véu da Serenidade"
    }
  },
  "a-que-une": {
    "name": "Berenice",
    "title": "A Tecelã",
    "englishName": "Berenice",
    "englishTitle": "The Weaver",
    "aliases": ["A Tecelã","A que Une"],
    "lore": "Tece alianças que preservam a vontade de cada alma. Seus fios unem sem tomar o controle, distinguindo a União da manipulação de Carne e Mentira."
  },
  "o-que-cria": {
    "name": "Sóstrato",
    "title": "O Artífice",
    "englishName": "Sostratus",
    "englishTitle": "The Artificer",
    "aliases": ["O Artífice","O que Cria"],
    "lore": "Dá forma à matéria espiritual para preservar novas possibilidades. Cada construção pode amparar uma alma ou abrir espaço contra quem destrói."
  },
  "a-porta-que-flutua": {
    "name": "Battuta",
    "title": "A Errante",
    "englishName": "Battuta",
    "englishTitle": "The Wanderer",
    "aliases": ["A Guardiã","A Guardiã do Limiar","A Porta que Flutua","A Errante"],
    "role": "Viajante do Limiar",
    "lore": "Sua passagem permanece suspensa entre destinos que se romperam. Encontra atalhos transitórios nas fraturas do Limbo, empresta uma saída a outra alma e perde parte da própria estabilidade quando fecha uma dessas rotas.",
    "terms": {
      "Travessia Segura": "Atalho Suspenso"
    },
    "roleHint": "Abra uma passagem, use o atalho para amparar um aliado e retorne; fechar a rota no inimigo também cobra sua Vida.",
  },
  "o-relogio-afogado": {
    "name": "Hiparco",
    "title": "O Cronista",
    "englishName": "Hipparchus",
    "englishTitle": "The Chronicler",
    "aliases": ["O Cronista","O Relógio Afogado"],
    "lore": "Carrega os instantes que não chegaram ao fim. Os mecanismos afogados são instrumentos de sua ruptura temporal, enquanto ele reúne e devolve segundos perdidos."
  },
  "a-ponte-rasgada": {
    "name": "Sinan",
    "title": "A Peregrina",
    "englishName": "Sinan",
    "englishTitle": "The Pilgrim",
    "aliases": ["A Peregrina","A Ponte Rasgada"],
    "lore": "Caminha entre encontros que nunca se completaram. Reconstrói uma passagem por um instante e rompe o apoio de quem bloqueia a travessia."
  },
  "a-regente-de-cinzas": {
    "name": "Amanirenas",
    "title": "A Déspota",
    "englishName": "Amanirenas",
    "englishTitle": "The Despot",
    "aliases": ["A Regente de Cinzas","A Déspota"],
    "role": "Comandante Tirânica",
    "lore": "Matriarca colossal forjada nas cinzas de uma dinastia, traz no rosto envelhecido as marcas do império que ajudou a erguer. Sua autoridade nasce da submissão imposta. Usa o ferro em brasa como punição exemplar e mantém seus executores de pé para prolongar o domínio de Coroa.",
    "terms": {
      "Ordem em Cinzas": "Ferro do Jugo",
      "Comando da Regente": "Ordem Absoluta",
      "Purgar a Rebelião": "Esmagar a Resistência",
      "Manto da Regência": "Privilégio Soberano"
    },
    "roleHint": "Queime a resistência com o ferro do jugo, fortaleça seus executores e castigue quem já carrega a Queimadura.",
  },
  "a-mao-que-toma": {
    "name": "Brennus",
    "title": "A Saqueadora",
    "englishName": "Brennus",
    "englishTitle": "The Plunderer",
    "aliases": ["A Mão que Toma","A Saqueadora"],
    "role": "Acumuladora de Espólios",
    "lore": "Converte a privação alheia em riqueza própria. Seus espólios espirituais compram proteção e vigor; o roubo só termina quando não resta mais nada a tomar.",
    "terms": {
      "Guardar o que Roubou": "Entesourar",
      "Mão Fora de Alcance": "Espólio Intocável"
    },
    "roleHint": "Roube Essência e acumule espólios; gaste as reservas para recuperar Vida ou reforçar o confisco.",
  },
  "o-medico-de-vermes": {
    "name": "Zahrawi",
    "title": "O Inoculador",
    "englishName": "Zahrawi",
    "englishTitle": "The Inoculator",
    "aliases": ["O Médico de Vermes","O Inoculador"],
    "role": "Cultivador de Parasitas",
    "lore": "Trata almas como hospedeiros de suas colônias. Mantém os cúmplices vivos para perpetuar a infestação e extrai vitalidade dos contaminados, espalhando a corrupção de Podridão.",
    "terms": {
      "Cuidado Decomposto": "Simbiose Corrupta",
      "Sutura de Vermes": "Hospedeiro Renovado"
    },
    "roleHint": "Inocule Veneno para drenar o inimigo; conserve seus hospedeiros aliados com limpeza e regeneração.",
  },
  "o-vigia-ausente": {
    "name": "Efialtes",
    "title": "O Desertor",
    "englishName": "Ephialtes",
    "englishTitle": "The Deserter",
    "aliases": ["O Vigia Ausente","O Desertor"],
    "role": "Predador da Omissão",
    "lore": "Abandonou deliberadamente quem deveria guardar. Agora espera que uma alma fique sem auxílio para atacar pela retaguarda; sua lanterna só se acende quando o socorro já foi negado.",
    "terms": {
      "Vigília Tardia": "Oportunismo",
      "Vigia na Sombra": "Espera Cúmplice",
      "Chegar Depois": "Cobrar o Abandono",
      "Chegada pela Retaguarda": "Golpe da Retaguarda"
    },
    "roleHint": "Explore a guarda abandonada; anular uma agressão abre um golpe de retaguarda contra o responsável.",
  },
  "o-desejo-quebrado": {
    "name": "Tarquínio",
    "title": "O Profanador",
    "englishName": "Tarquinius",
    "englishTitle": "The Defiler",
    "aliases": ["O Desejo Quebrado","O Profanador"],
    "role": "Violador de Limites",
    "lore": "Enxerga a integridade de outra alma como algo que pode consumir e deformar. Força o próprio corpo além do limite para invadir o espaço alheio e impor o abuso que alimenta Carne.",
    "terms": {
      "Falta Incurável": "Avidez Profana",
      "Pulso do Desejo": "Ímpeto Profano",
      "Aproximação Dolorosa": "Contato Invasivo",
      "Desejo Desfeito": "Violação da Forma",
      "Forma Inalcançável": "Forma Intangível"
    },
    "roleHint": "Converta sua Vida perdida em pressão ofensiva; invada a guarda alheia e consuma as cargas no golpe perfurante.",
  },
  "o-menino-sem-sombra": {
    "name": "Hatshepsut",
    "title": "O Desolador",
    "englishName": "Hatshepsut",
    "englishTitle": "The Desolator",
    "aliases": ["O Menino sem Sombra","O Desolador"],
    "role": "Flagelo da Desolação",
    "lore": "Uma entidade adulta que escolhe extinguir toda possibilidade de continuidade. O que toca perde contorno e propósito; recompõe a própria presença com os vestígios das certezas que destruiu.",
    "terms": {
      "Medo sem Forma": "Ruína Crescente",
      "Brincadeira sem Sombra": "Toque da Desolação",
      "Refúgio na Falta": "Recompor o Vazio",
      "Esconder-se do Sol": "Recolher a Presença",
      "Sol que Não Encontra": "Extinguir a Presença",
      "Infância Invisível": "Presença Nula"
    },
    "roleHint": "Acumule vestígios de ruína e consuma-os para extinguir a presença inimiga; com pouca Vida, a recomposição assume outra forma.",
  },
  "o-que-ficou": {
    "name": "Cynaegirus",
    "title": "O Abnegado",
    "englishName": "Cynaegirus",
    "englishTitle": "The Selfless One",
    "aliases": ["O que Ficou","O Abnegado"],
    "role": "Protetor Sacrificial",
    "lore": "Escolhe permanecer quando recuar seria mais seguro. Sua força vem do amparo que oferece: cede parte do próprio fôlego para manter outra alma protegida e sustenta a linha enquanto alguém precisar atravessar.",
    "terms": {
      "Lugar ao Meu Lado": "Amparo Abnegado",
      "Eu Ainda Estou Aqui": "Permanecer de Pé"
    },
    "roleHint": "Ceda parte da sua Vida para amparar um aliado e sustente-se na resposta ofensiva, mais forte quando ferido.",
  },
  "o-equilibrio": {
    "name": "Zaleucus",
    "title": "O Árbitro",
    "englishName": "Zaleucus",
    "englishTitle": "The Arbiter",
    "aliases": ["O Equilíbrio","O Árbitro"],
    "role": "Árbitro da Reparação",
    "lore": "Um constructo espiritual que mede o dano antes de intervir. Sua vara de medida delimita a reparação e interrompe o excesso; sua autoridade aplica a proporção da Justiça sem exigir submissão.",
    "terms": {
      "Prato da Misericórdia": "Amparo Equânime",
      "Reparação do Veredito": "Resposta Equânime",
      "Equação da Justiça": "Veredito Proporcional",
      "Balança Imóvel": "Posição Inviolável"
    },
    "roleHint": "Exponha o excesso, ofereça amparo e abra a resposta equânime; o veredito perfurante pune a abertura revelada.",
  },
  "o-trono-vazio": {
    "name": "Perdiccas",
    "title": "O Suserano",
    "englishName": "Perdiccas",
    "englishTitle": "The Overlord",
    "aliases": ["O Trono Vazio","O Suserano"],
    "role": "Suserano da Interdição",
    "lore": "Transforma obediência em poder mesmo longe do trono. Seus decretos retiram dos outros o direito de reagir, e a guarda de seus vassalos prolonga o domínio de Coroa.",
    "terms": {
      "Presença sem Corpo": "Autoridade Delegada",
      "Vontade do Assento Vazio": "Decreto de Submissão",
      "Edicto de Interdição": "Interdição Soberana",
      "Domínio sem Rei": "Guarda dos Vassalos",
      "Palácio Inatingível": "Suserania Inviolável"
    },
    "roleHint": "Sele a ofensiva inimiga, imponha uma resposta em favor de um aliado e fortaleça a guarda dos seus vassalos.",
  },
  "o-filho-da-cinza": {
    "name": "Mithridates",
    "title": "O Ressentido",
    "englishName": "Mithridates",
    "englishTitle": "The Resentful One",
    "aliases": ["O Filho da Cinza","O Ressentido"],
    "role": "Portador do Rancor",
    "lore": "Conserva cada afronta como uma brasa que se recusa a deixar morrer. Reúne as cinzas para recompor a própria força e devolver o rancor em fogo, alimentando a vingança de Chama.",
    "terms": {
      "Debaixo das Cinzas": "Rancor Latente",
      "Carvão Oculto": "Brasa do Ressentimento",
      "Ressurgir do Carvão": "Rancor Reaceso",
      "Recompor-se da Cinza": "Nutrir o Rancor",
      "Renascer em Chamas": "Revide Incandescente"
    },
    "roleHint": "Acumule rancor até reacender a primeira técnica; escolha entre consumir as reservas para recuperar Vida ou devolver a chama.",
  },
  "o-lugar-de-ninguem": {
    "name": "Timur",
    "title": "O Obliterador",
    "englishName": "Timur",
    "englishTitle": "The Obliterator",
    "aliases": ["O Lugar de Ninguém","O Obliterador"],
    "role": "Anulador de Territórios",
    "lore": "Sua presença desfaz os lugares que poderiam sustentar outra alma. Apaga as referências do caminho, reduz a vontade de quem ainda resiste e incorpora o que resta ao próprio contorno, expandindo Vazio.",
    "terms": {
      "Habitar o Nada": "Sustento do Apagamento",
      "Chão de Ninguém": "Apagar o Terreno",
      "Endereço Inexistente": "Coordenada Nula",
      "Engolido pelo Lugar": "Eliminar o Vestígio",
      "Território Impossível": "Contorno Inexistente"
    },
    "roleHint": "Apague o terreno para punir a inatividade; marque uma coordenada, enfraqueça a vítima e consuma seu vestígio para recuperar Vida.",
  },
  "a-muralha": {
    "name": "Zenobia",
    "title": "A Muralha",
    "englishName": "Zenobia",
    "englishTitle": "The Rampart",
    "aliases": ["A Muralha"],
    "role": "Sentinela de Pedra",
    "lore": "Um constructo de forma humana que escolheu tornar-se abrigo. Cada agressão que atravessa a guarda de seus companheiros reforça suas placas; avança apenas para abrir espaço a quem precisa proteger.",
    "terms": {
      "Avanço do Bastão": "Investida do Baluarte",
      "Além do Baluarte": "Baluarte Inviolável"
    },
    "roleHint": "Fortifique o trio e acumule cargas; a investida consome sua Defesa para expor um inimigo, enquanto o dano aos aliados pode recompor sua guarda.",
    "aliases": []
  },
  "a-jardineira-das-feridas": {
    "name": "Dioscorides",
    "title": "A Boticária",
    "englishName": "Dioscorides",
    "englishTitle": "The Apothecary",
    "aliases": ["A Jardineira das Feridas","A Boticária"],
    "role": "Herborista Espiritual",
    "lore": "Conhece o que cada alma precisa para recuperar o fôlego. Extrai remédios de raízes e flores espirituais para tratar feridas; seus espinhos contêm a agressão enquanto a convalescença devolve vigor ao grupo.",
    "terms": {
      "Jardim da Convalescença": "Remédio Perene",
      "Raiz que Cuida": "Raiz Contundente",
      "Flores de Convalescença": "Infusão Restauradora",
      "Espinhos da Proteção": "Espinhos Sedativos"
    },
    "roleHint": "Prepare as raízes para acumular reservas; use a infusão para recuperar o trio ou os espinhos para enfraquecer um agressor.",
  },
  "a-luz-nua": {
    "name": "Crates",
    "title": "A Lúcida",
    "englishName": "Crates",
    "englishTitle": "The Lucid One",
    "aliases": ["A Luz Nua","A Lúcida"],
    "role": "Desveladora de Enganos",
    "lore": "Reconhece a forma verdadeira sob as vantagens fabricadas. Sua claridade desmonta disfarces e revela o ponto que uma mentira tentava esconder; age para restituir clareza, sem fazer da revelação um ato de crueldade.",
    "terms": {
      "Toque da Luz Nua": "Foco da Clareza",
      "Despir a Guarda": "Desvelar a Guarda"
    },
    "roleHint": "Revele uma marca, remova a guarda e as vantagens do alvo; o clarão concentra dano no inimigo que você marcou.",
  },
  "a-cartografa-da-clareza": {
    "name": "Idrisi",
    "title": "A Cartógrafa",
    "englishName": "Idrisi",
    "englishTitle": "The Cartographer",
    "aliases": ["A Cartógrafa da Clareza","A Cartógrafa"],
    "role": "Guia da Clareza",
    "lore": "Traça o caminho que permanece quando os desvios falsos são retirados. Suas cartas não criam territórios: revelam passagens, intenções e pontos vulneráveis, permitindo que outras almas avancem sem engano.",
    "terms": {},
    "roleHint": "Trace a abertura e revele o atalho de amparo; reúna as cargas para concentrar a convergência no inimigo.",
  },
  "a-guardia-das-promessas": {
    "name": "Regulus",
    "title": "A Juramentada",
    "englishName": "Regulus",
    "englishTitle": "The Oathsworn",
    "aliases": ["A Guardiã das Promessas","A Juramentada"],
    "role": "Fiadora de Alianças",
    "lore": "Dá força a compromissos assumidos livremente entre almas. Se um companheiro é ferido sob sua palavra, ela responde renovando o amparo; o juramento une vontades, sem tomar a liberdade de nenhuma delas.",
    "terms": {
      "Juramento Gravado": "Selo do Juramento",
      "Guardar a Palavra": "Honrar o Pacto",
      "Cumprir a Palavra": "Renovar o Pacto",
      "Cobrança do Juramento": "Resposta do Juramento"
    },
    "roleHint": "Honre o pacto com um aliado; se ele perder Vida durante a resposta inimiga, abra a renovação do amparo.",
  },
  "a-pira-errante": {
    "name": "Tomyris",
    "title": "A Vingadora",
    "englishName": "Tomyris",
    "englishTitle": "The Avenger",
    "aliases": ["A Pira Errante","A Vingadora"],
    "role": "Vingança Incandescente",
    "lore": "Transforma qualquer resistência em motivo para ampliar a punição. Conserva uma brasa de cada afronta na lanterna que carrega e alimenta um cerco de fogo até que a vingança de Chama consuma quem a desafia.",
    "terms": {
      "Lenha da Travessia": "Rancor Encouraçado",
      "Lenha Espiritual": "Brasa Punitiva",
      "Lenha da Retaliação": "Revanche Ardente",
      "Círculo da Pira": "Guarda Vingativa",
      "Marcha da Fogueira": "Cerco Incandescente"
    },
    "roleHint": "Aplique Queimadura e erga a guarda vingativa; se uma nova agressão atravessar sua proteção, abra a revanche contra o inimigo.",
  },
  "o-jardim-morto": {
    "name": "Teofrasto",
    "title": "O Definhador",
    "englishName": "Theophrastus",
    "englishTitle": "The Witherer",
    "aliases": ["O Jardim Morto","O Definhador"],
    "role": "Semeador da Ruína",
    "lore": "Espalha raízes que roubam vigor e corrompem a matéria espiritual. Seus cúmplices se abrigam na trama necrosada, enquanto cada agressão alimenta uma resposta corrosiva; sua vontade é fazer Podridão avançar sobre o que ainda resiste.",
    "terms": {
      "Raiz sob a Pele": "Seiva Corrosiva",
      "Solo Contaminado": "Trama Necrosada",
      "Jardim do Fim": "Definhar",
      "Entre Raízes Mortas": "Casca Inviolável"
    },
    "roleHint": "Aplique Decadência, envolva o trio na trama e devolva parte da agressão em aflição; o definhar coletivo enfraquece inimigos contaminados.",
  },
  "a-luz-que-restaura": {
    "name": "Hildegard",
    "title": "A Sanadora",
    "englishName": "Hildegard",
    "englishTitle": "The Healer",
    "aliases": ["A Luz que Restaura","A Sanadora"],
    "role": "Restauradora de Essência",
    "lore": "Reconstitui os fios de vitalidade que o sofrimento rompeu. Sua presença devolve vigor às almas feridas, e a mesma corrente luminosa abre espaço contra quem ameaça interromper o cuidado de Cura.",
    "terms": {
      "Claridade que Ampara": "Amparo Recíproco",
      "Raio Restaurador": "Clarão Incisivo",
      "Reconstruir o Fôlego": "Restituir Vigor",
      "Aurora Reparadora": "Fluxo Vital",
      "Clarão Imaculado": "Forma Luminosa"
    },
    "roleHint": "Exponha o agressor, restitua o vigor de um aliado ferido e use o fluxo vital para atacar e recuperar sua própria Vida.",
  },
  "o-espelho-carnal": {
    "name": "Zeuxis",
    "title": "O Simulacro",
    "englishName": "Zeuxis",
    "englishTitle": "The Simulacrum",
    "aliases": ["O Espelho Carnal","O Simulacro"],
    "role": "Espelhamento Imposto",
    "lore": "Implanta cópias da própria matéria em corpos alheios para converter dor em agressão de retorno. Seu auxílio conserva o corpo como instrumento de domínio, prolongando a imposição e o abuso que fortalecem Carne.",
    "terms": {
      "Dor Refletida": "Eco da Dor",
      "Reflexo de Carne": "Molde Vulnerável",
      "Imagem de Resposta": "Vínculo Parasita",
      "Rachar o Reflexo": "Romper o Molde",
      "Atrás do Espelho": "Duplicata Intangível"
    },
    "roleHint": "Exponha o inimigo e sustente um aliado com o vínculo parasita; a dor recebida provoca uma resposta de aflição.",
  },
  "a-pele-alheia": {
    "name": "Ovid",
    "title": "A Metamorfa",
    "englishName": "Ovid",
    "englishTitle": "The Shapeshifter",
    "aliases": ["A Pele Alheia","A Metamorfa"],
    "role": "Quimera de Carne",
    "lore": "Seu corpo infernal é um bestiário vivo: ela se converte em feras demoníacas de lobo, serpente, ave de rapina e javali couraçado. Troca garras, presas, penas e placas no meio do combate para caçar, romper a guarda e subjugar quem resiste.",
    "terms": {
      "Pele que Aprende": "Instinto Bestial",
      "Lâmina de Epiderme": "Garras Cambiantes",
      "Lâmina da Pele Nova": "Garras Predatórias",
      "Camada Substituta": "Quimera Predatória",
      "Descartar a Forma": "Descartar o Molde",
      "Forma de Retaliação": "Instinto de Revide",
      "Troca de Pele": "Corpo Substituto"
    },
    "roleHint": "Alterne entre o corpo humanoide, a quimera predatória de lobo-serpente-ave e a quimera couraçada de javali-pangolim-besouro. Ataque na forma predatória, sustente a defesa na couraçada e descarte o molde para recuperar Vida.",
  },
  "a-ultima-pagina": {
    "name": "Enheduanna",
    "title": "A Escriba",
    "englishName": "Enheduanna",
    "englishTitle": "The Scribe",
    "aliases": ["A Última Página","A Escriba"],
    "role": "Escriba da Extinção",
    "lore": "Inscreve nomes em fragmentos espirituais para reduzir as possibilidades de uma alma. Rasura a vontade de reagir e encerra o vestígio que marcou, transformando cada continuidade perdida em força para Vazio.",
    "terms": {
      "Parágrafo Final": "Traço Terminal",
      "Nome na Última Folha": "Inscrever o Fim",
      "Rasura do Destino": "Rasura Terminal",
      "Fechar a História": "Encerrar o Vestígio",
      "Margem em Branco": "Folha Nula"
    },
    "roleHint": "Inscreva e exponha uma vítima, interrompa sua ofensiva e consuma a marca ao encerrar seu vestígio.",
  },
  "o-que-apaga": {
    "name": "Akhenaten",
    "title": "O Anulador",
    "englishName": "Akhenaten",
    "englishTitle": "The Nullifier",
    "aliases": ["O que Apaga","O Anulador"],
    "role": "Anulador de Vantagens",
    "lore": "Remove o que permite a uma alma sustentar a própria resistência. Dissolve guarda e vantagens, deixa uma marca sobre o que restou e concentra a anulação final nesse vestígio, ampliando o apagamento de Vazio.",
    "terms": {
      "Nada se Sustenta": "Vantagem Negada",
      "Traço Apagado": "Marca da Anulação",
      "Ausência Definitiva": "Anulação Definitiva",
      "Branco sobre a Guarda": "Dissolver a Guarda"
    },
    "roleHint": "Marque e remova vantagens; a preparação abre uma anulação exclusiva contra a mesma vítima, enquanto a segunda técnica dissolve Defesa.",
  },
  "a-alma-em-suspenso": {
    "name": "Simeão",
    "title": "O Eremita",
    "englishName": "Simeon",
    "englishTitle": "The Hermit",
    "aliases": ["A Alma em Suspenso","O Ancorado"],
    "role": "Âncora Vital",
    "lore": "Uma alma retida num instante que não terminou. Reúne fôlego nas fraturas do Limbo e o prende a outra presença, cedendo parte da própria integridade; ao soltar a âncora, converte a reserva acumulada em ruptura.",
    "terms": {
      "Fôlego no Limiar": "Âncora Persistente",
      "Prender o Último Fôlego": "Ancorar o Fôlego"
    },
    "roleHint": "Acumule três cargas para emprestar fôlego a um aliado ou gaste a reserva na ruptura; ancorar e soltar a âncora também cobra sua Vida.",
  },
  "a-praga-andante": {
    "name": "Mary Mallon",
    "title": "A Pestilência",
    "englishName": "Mary Mallon",
    "englishTitle": "The Pestilence",
    "aliases": ["A Praga Andante","A Pestilência"],
    "role": "Vetor Espiritual",
    "lore": "Escolhe cada caminho pela quantidade de almas que pode contaminar. O contágio espalhado alimenta sua própria vitalidade e retorna concentrado à vítima já envenenada, propagando Podridão por onde passa.",
    "terms": {},
    "roleHint": "Espalhe Veneno e concentre o contágio na forma de retorno; a crise pestilenta interrompe uma vítima já contaminada.",
  },
  "o-devorador": {
    "name": "Vitellius",
    "title": "O Devorador",
    "englishName": "Vitellius",
    "englishTitle": "The Devourer",
    "aliases": ["O Devorador"],
  },

};

export function revisedArtFor(id, art) {
  if (!art) return art;
  if (hybridInfernoRework20261027Art.has(id)) {
    const base = `/art/characters/${id}/hybrid-rework-20261027`;
    const forms = {...(art.forms || {})};
    if (id === "o-que-pesa") {
      forms.impulso = {...(forms.impulso || {}),balance:`${base}/skill-impulso-balance.webp`};
    }
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`])),
      ...(Object.keys(forms).length ? {forms} : {})};
  }
  if (animeFirstRework20261026Art.has(id)) {
    const base = `/art/characters/${id}/anime-first-rework-20261026`;
    const forms = {...(art.forms || {})};
    if (id === 'o-falso-profeta') forms.tecnica = {...forms.tecnica,confess:`${base}/skill-tecnica-confess.webp`};
    if (id === 'a-pira-errante') forms.impulso = {...forms.impulso,reply:`${base}/skill-impulso-reply.webp`};
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`])),
      ...(Object.keys(forms).length ? {forms} : {})};
  }
  if (id === 'a-pira-errante') {
    const base = `/art/characters/${id}/painterly-rework-20261026`;
    const forms = {...(art.forms || {})};
    forms.impulso = {...forms.impulso,reply:`${base}/skill-impulso-reply.webp`};
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`])),forms};
  }
  if (['o-falso-profeta','o-corretor-de-memorias'].includes(id)) {
    const base = `/art/characters/${id}`;
    const forms = {...(art.forms || {})};
    if (id === 'o-falso-profeta') forms.tecnica = {...forms.tecnica,confess:`${base}/skill-tecnica-confess.webp`};
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`])),
      ...(Object.keys(forms).length ? {forms} : {})};
  }
  if (painterlyRework20261026Art.has(id)) {
    const base = `/art/characters/${id}/painterly-rework-20261026`;
    const forms = {...(art.forms || {})};
    if (id === 'o-falso-profeta') forms.tecnica = {...forms.tecnica,confess:`${base}/skill-tecnica-confess.webp`};
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`])),
      ...(Object.keys(forms).length ? {forms} : {})};
  }
  if (painterlyBatchArt.has(id)) {
    const base = `/art/characters/${id}`;
    const forms = {...(art.forms || {})};
    if (id === 'o-principe-das-correntes') {
      forms.impulso = {...forms.impulso,drag:`${base}/skill-tecnica.webp`};
    }
    if (id === 'o-falso-profeta') {
      forms.tecnica = {...forms.tecnica,confess:`${base}/skill-tecnica-confess.webp`};
    }
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`])),
      ...(Object.keys(forms).length ? {forms} : {})};
  }
  const painterlyCarneFolder = painterlyCarneArt.get(id);
  if (painterlyCarneFolder) {
    const base = `/art/characters/${id}/${painterlyCarneFolder}`;
    const forms = {...(art.forms || {})};
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`])),
      ...(Object.keys(forms).length ? {forms} : {})};
  }
  if (painterlySilencioArt.has(id)) {
    const base = `/art/characters/${id}/painterly-rework-20261025`;
    const forms = {...(art.forms || {})};
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`])),
      ...(Object.keys(forms).length ? {forms} : {})};
  }
  if (painterlyPodridaoArt.has(id)) {
    const base = `/art/characters/${id}/painterly-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (painterlyFomeArt.has(id)) {
    const base = `/art/characters/${id}/painterly-rework-20261025`;
    const forms = {...(art.forms || {})};
    if (id === 'o-devorador') {
      forms.impulso = {...forms.impulso,starved:`${base}/skill-impulso-starved.webp`};
    }
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`])),
      ...(Object.keys(forms).length ? {forms} : {})};
  }
  if (painterlyChamaArt.has(id)) {
    const base = `/art/characters/${id}/painterly-rework-20261025`;
    const forms = {...(art.forms || {})};
    if (id === 'a-brasa-eterna') {
      forms.impulso = {...forms.impulso,smother:`${base}/skill-impulso-smother.webp`};
    }
    if (id === 'o-odio-encarnado') {
      forms.impulso = {...forms.impulso,rage:`${base}/skill-impulso-rage.webp`};
      forms.voto = {...forms.voto,eruption:`${base}/skill-voto-eruption.webp`};
    }
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`])),
      ...(Object.keys(forms).length ? {forms} : {})};
  }
  if (id === 'o-acougueiro') {
    const base = `/art/characters/${id}/style-reference-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (id === 'a-viuva-escarlate') {
    const base = `/art/characters/${id}/style-reference-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (id === 'o-colecionador-de-cabecas') {
    const base = `/art/characters/${id}/style-reference-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (['gemeos-do-cutelo','o-carrasco-sem-rosto','a-mae-rubra'].includes(id)) {
    const base = `/art/characters/${id}/style-reference-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (id === 'o-soberano-quebrado') {
    const base = `/art/characters/${id}/style-reference-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (['a-juiza-de-ferro','o-trono-vazio'].includes(id)) {
    const base = `/art/characters/${id}/painterly-rework-20261026`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (id === 'o-fim-silencioso') {
    const base = `/art/characters/${id}/style-reference-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (id === 'a-ausencia') {
    const base = `/art/characters/${id}/style-reference-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (id === 'o-que-apaga') {
    const base = `/art/characters/${id}/style-reference-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (id === 'o-escudo-vivo') {
    const base = `/art/characters/${id}/style-reference-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (id === 'o-apodrecido') {
    const base = `/art/characters/${id}/style-reference-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (id === 'a-asa-invertida') {
    const base = `/art/characters/${id}/hybrid-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (id === 'o-olho-desarmado') {
    const base = `/art/characters/${id}/hybrid-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (id === 'o-que-revela') {
    const base = `/art/characters/${id}/hybrid-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (id === 'a-jardineira-das-feridas') {
    const base = `/art/characters/${id}/style-reference-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (id === 'a-mascara-dupla') {
    const base = `/art/characters/${id}/style-reference-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (id === 'o-sussurro') {
    const base = `/art/characters/${id}/style-reference-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (['o-tecelao-de-mentiras','a-boca-de-vidro'].includes(id)) {
    const base = `/art/characters/${id}/style-reference-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (id === 'o-herdeiro-cativo') {
    const base = `/art/characters/${id}/style-reference-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (id === 'a-regente-de-cinzas') {
    const base = `/art/characters/${id}/style-reference-rework-20261025`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (id === 'o-principe-das-correntes') {
    const base = `/art/characters/${id}/painterly-rework-20261026`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`])),
      forms:{...art.forms,impulso:{...art.forms?.impulso,drag:`${base}/skill-impulso-drag.webp`}}};
  }
  const completedForm = chamaCompletionForms[id];
  if (completedForm) {
    const base = `/art/characters/${id}/chama-completion-20261023`;
    art = {...art,forms:{...art.forms,impulso:{...art.forms?.impulso,
      [completedForm]:`${base}/skill-impulso-${completedForm}.webp`}}};
    if (id === 'a-brasa-eterna') return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
    if (id === 'o-filho-da-cinza') art = {...art,portrait:`${base}/portrait.webp`,
      abilities:{...art.abilities,impulso:`${base}/skill-impulso.webp`,voto:`${base}/skill-voto.webp`}};
  }
  if (chamaArt.has(id)) {
    const base = `/art/characters/${id}/chama-revision-20261023`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`])),
      ...(id === 'o-odio-encarnado' ? {forms:{...art.forms,
        impulso:{...art.forms?.impulso,rage:`${base}/skill-impulso-rage.webp`},
        voto:{...art.forms?.voto,eruption:`${base}/skill-voto-eruption.webp`}
      }} : {})};
  }
  if (continuationArt.has(id)) {
    const base = `/art/characters/${id}/continuation-revision-20261023`;
    const form = id === 'a-semente' ? 'fruit' : id === 'a-linha-partida' ? 'mend' : null;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`])),
      ...(form ? {forms:{...art.forms,impulso:{...art.forms?.impulso,[form]:`${base}/skill-impulso-${form}.webp`}}} : {})};
  }
  if (diverseArt.has(id)) {
    const base = `/art/characters/${id}/form-revision-20261023`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (spiritArt.has(id)) {
    const base = `/art/characters/${id}/spirit-revision-20261023`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (spiritSlots[id]) {
    const base = `/art/characters/${id}/spirit-revision-20261023`;
    return {...art,abilities:{...art.abilities,...Object.fromEntries(spiritSlots[id].map(slot=>[slot,`${base}/skill-${slot}.webp`]))}};
  }
  if (entitySlots[id]) {
    const base = `/art/characters/${id}/entity-revision-20261023`, slots = entitySlots[id];
    return {...art,...(slots.includes('passive') ? {passive:`${base}/passive.webp`} : {}),
      abilities:{...art.abilities,...Object.fromEntries(slots.filter(slot=>slot!=='passive').map(slot=>[slot,`${base}/skill-${slot}.webp`]))}};
  }
  if (entityArt.has(id)) {
    const base = `/art/characters/${id}/entity-revision-20261023`;
    return {...art,portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`,
      abilities:Object.fromEntries(Object.keys(art.abilities).map(slot=>[slot,`${base}/skill-${slot}.webp`]))};
  }
  if (personalDefenseArt.has(id)) return {...art, abilities:{...art.abilities,
    despertar:`/art/characters/${id}/elo-revision-20261023/skill-despertar.webp`
  }};
  if (!fullArt.has(id) && !eloArt.has(id) && id !== 'o-acougueiro') return art;
  const base = `/art/characters/${id}/${eloArt.has(id) ? 'elo-revision-20261023' : 'revision-20261023'}`;
  const full = fullArt.has(id) || eloArt.has(id);
  const abilities = Object.fromEntries(Object.keys(art.abilities).map(slot => [slot,
    full || slot !== 'despertar' ? `${base}/skill-${slot}.webp` : art.abilities[slot]
  ]));
  return {...art, abilities, ...(full ? {portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`} : {})};
}

export function reviseKitIdentity(kit, revision) {
  if (!revision) return kit;
  const terms = Object.entries(revision.terms || {}).sort((a,b) => b[0].length-a[0].length);
  const text = value => typeof value === 'string' ? terms.reduce((out,[from,to]) => out.split(from).join(to),value) : value;
  const ability = a => ({...a,name:text(a.name),description:text(a.description),
    ...(a.evolutionNote ? {evolutionNote:text(a.evolutionNote)} : {}),
    ...(a.forms ? {forms:a.forms.map(ability)} : {})});
  return {...kit,role:revision.role || kit.role,
    roleHint:revision.roleHint || text(kit.roleHint),combo:revision.roleHint || text(kit.combo),
    passive:{...kit.passive,name:text(kit.passive.name),description:text(kit.passive.description)},
    abilities:kit.abilities.map(ability)};
}


