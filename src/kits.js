import { evolveKit } from "./kit-evolutions.js";
// Kits autorais: cada entrada define preparação, resposta e desfecho do personagem.
const A = (name, damage, cost = 1, extra = {}) => ({ name, damage, cost, target: "enemy", damageType: "physical", ...extra });
const S = (name, extra, cost = 1) => A(name, 0, cost, { target: "ally", ...extra });
const D = (tag, damage = 5, turns = 2) => ({ tag, damage, turns });
const F = (name, damage, condition, bonusDamage = 10, extra = {}) => A(name, damage, 2, { combo: { condition, bonusDamage }, cooldown: 1, ...extra });
const P = (name, type, amount = 4, condition = "afflicted", extra = {}) => ({ name, type, amount, condition, ...extra });
const K = (role, combo, passive, skills, defense) => ({ role, combo, passive, skills, defense });
const T = (name, trigger, effect, description, extra = {}) => ({ name, type: "triggered", trigger, effect, description, ...extra });

const rosters = {
  sangria: [
    K("Executor", "Abra um sangramento e consuma a ferida no golpe final.", P("Faro de Sangue", "hunter", 5, "bleed"), [A("Incisão de Abate",15,1,{dot:D("sangramento")}), A("Separar Tendões",10,2,{stun:1,cooldown:2}), F("Sentença do Cutelo",28,"bleed",12,{combo:{condition:"bleed",bonusDamage:12,consume:true}})], "Passo entre Lâminas"),
    K("Duelista", "O fio escarlate expõe a vítima; a viúva rouba Vida quando cobra sua promessa.", P("Luto Faminto", "leech", 4), [A("Fio Escarlate",15,1,{mark:"fio",expose:1}), S("Véu da Viúva",{target:"self",counter:20},2), F("Beijo da Última Noite",25,"mark:fio",15,{lifesteal:.5})], "Véu de Sangue"),
    K("Caçador", "Acumule troféus com ataques e gaste as cargas para uma execução concentrada.", P("Primeiro Troféu", "firstHit", 5), [A("Laço de Caça",15,1,{gainCharge:1}), A("Cobrança do Caçador",20,1,{stripShield:15}), A("Galeria de Troféus",20,2,{perChargeDamage:8,spendCharge:true,cooldown:2})], "Sombra do Colecionador"),
    K("Ruptor", "Dois cortes alternam pressão e exposição; a execução ganha força contra uma abertura.", P("Ritmo dos Gêmeos", "hunter", 4,"exposed"), [A("Cutelo da Esquerda",15,1,{expose:1}), A("Cutelo da Direita",15,1,{dot:D("sangramento",4,2)}), F("Encontro das Lâminas",25,"exposed",15,{cost:3,target:"all-enemies",damage:15,combo:{condition:"exposed",bonusDamage:10},cooldown:2})], "Dança Cruzada"),
    K("Sentenciador", "Marque a sentença e interrompa a resistência antes de executar um alvo ferido.", P("Sem Apelação", "hunter", 5,"stunned"), [A("Sentença sem Nome",10,1,{mark:"sentenca",weaken:1}), F("Queda da Guilhotina",25,"mark:sentenca",10,{combo:{condition:"mark:sentenca",bonusDamage:10,stun:1},cooldown:2}), F("Última Respiração",25,"wounded",15)], "Capuz do Esquecimento"),
    K("Sustentação", "Converta feridas em proteção e sacrifique a própria Vida para alimentar o trio.", P("Sangue que Acolhe", "support", 5), [A("Cordão Rubro",15,1,{lifesteal:.5}), S("Partilha da Mãe",{heal:20,shield:10,selfDamage:5}), A("Berço de Sangue",10,2,{target:"all-enemies",dot:D("sangramento",4,2),cooldown:2})], "Casulo Rubro")
  ],
  coroa: [
    K("Dominador", "Um decreto marca a vítima; o domínio transforma a marca em interrupção.", P("Autoridade Estilhaçada", "hunter",4,"marked"), [A("Decreto do Rei Caído",15,1,{mark:"decreto"}), F("Ajoelhar",15,"mark:decreto",10,{combo:{condition:"mark:decreto",bonusDamage:10,stun:1},cooldown:2}), S("Coroa sobre Ruínas",{target:"self",shield:25,boost:5},2)], "Trono Interior"),
    K("Controladora", "A acusação revela excessos; a sentença pune quem permanece exposto.", P("Peso da Lei", "hunter",5,"exposed"), [A("Acusação de Ferro",15,1,{expose:1}), A("Audiência Suspensa",10,2,{stun:1,stripShield:10,cooldown:2}), F("Veredito Irrecorrível",30,"exposed",10,{damageType:"piercing"})], "Sala Inviolável"),
    K("Estrategista", "Prepare um contra-ataque e use o vácuo da autoridade para proteger os aliados.", P("Presença sem Corpo", "ward",4), [A("Vontade do Assento Vazio",20,1,{damageType:"energy"}), S("Edicto de Interdição",{target:"ally",counter:20},2), S("Domínio sem Rei",{target:"team",shield:15,boost:5},2)], "Palácio Inatingível"),
    K("Carcereiro", "A corrente prende a vítima; cada elo preparado aumenta a pressão do cárcere.", P("Grilhão Herdado", "hunter",4,"marked"), [A("Primeiro Grilhão",10,1,{mark:"grilhao",gainCharge:1}), A("Arrasto do Príncipe",15,1,{weaken:1}), A("Cárcere Dinástico",15,2,{perChargeDamage:8,spendCharge:true,stun:1,cooldown:2})], "Corrente Exterior"),
    K("Comandante", "Fortaleça o trio enquanto cinzas corrosivas preparam uma ordem de execução.", P("Lealdade pelo Medo", "support",4), [A("Ordem em Cinzas",15,1,{dot:D("queimadura",4,2)}), S("Comando da Regente",{target:"team",boost:5,shield:10},2), F("Purgar a Rebelião",25,"burn",15,{stripShield:15})], "Manto da Regência"),
    K("Rebelde", "Resista com pouca Vida e converta o peso da prisão em uma ruptura ofensiva.", P("Vontade Cativa", "comeback",6), [A("Punho Acorrentado",20,1,{gainCharge:1}), S("Aguentar o Decreto",{target:"self",heal:15,reduce:10}), A("Sucessão Rompida",25,2,{perChargeDamage:8,spendCharge:true,selfDamage:5,cooldown:1})], "Brecha na Cela")
  ],
  mentira: [
    K("Sabotador", "Uma palavra venenosa prepara o próximo sussurro para roubar Essência.", P("Segredo em Circulação", "hunter",4,"poison"), [A("Palavra Envenenada",10,1,{dot:D("veneno",5,3),damageType:"energy"}), F("Segredo Cobrado",20,"poison",10,{steal:1}), S("Aviso Falso",{target:"ally",counter:15},2)], "Voz sem Origem"),
    K("Ilusionista", "Alterne entre marcar um alvo e desarmar sua tentativa de resposta.", P("Segundo Rosto", "leech",3), [A("Rosto Emprestado",15,1,{mark:"mascara",damageType:"energy"}), S("O Outro Rosto",{target:"self",counter:25},2), F("Traição Revelada",20,"mark:mascara",15,{steal:1,combo:{condition:"mark:mascara",bonusDamage:15,consume:true},cooldown:2})], "Troca de Máscara"),
    K("Manipulador", "Tecidos de engano enfraquecem o grupo; o nó central pune um alvo preso à trama.", P("Trama Paciente", "hunter",4,"marked"), [A("Fio de Engano",10,1,{mark:"trama",weaken:1}), A("Rede de Falsidades",10,2,{target:"all-enemies",weaken:1,cooldown:2}), F("Nó da Contradição",25,"mark:trama",10,{combo:{condition:"mark:trama",bonusDamage:10,stun:1},cooldown:2})], "Fora da Trama"),
    K("Atiradora", "Estilhaços passam pela redução de dano; a exposição amplifica o discurso final.", P("Verdade Fraturada", "hunter",4,"exposed"), [A("Sílaba Cortante",20,1,{damageType:"piercing"}), A("Confissão Rachada",10,1,{expose:1,drain:1,cooldown:1}), F("Discurso em Estilhaços",20,"exposed",10,{cost:3,target:"all-enemies",damageType:"piercing",cooldown:2})], "Reflexo da Boca"),
    K("Corruptor", "Uma promessa marca o adversário; a falsa bênção mantém o usuário enquanto o culto cresce.", P("Fé Desviada", "renew",3), [A("Promessa do Profeta",15,1,{mark:"profecia",damageType:"energy"}), S("Bênção Falsa",{target:"self",heal:20,gainCharge:1}), F("Milagre Fabricado",25,"mark:profecia",10,{perChargeDamage:5,spendCharge:true,cooldown:2})], "Imagem Sagrada"),
    K("Ladrão de Memórias", "Apague a guarda; depois, cobre a lembrança marcada com dano e rouba Essência.", P("Arquivo Roubado", "firstHit",5), [A("Lembrança Hipotecada",10,1,{mark:"memoria",steal:1,cooldown:1}), A("Esquecer a Defesa",15,1,{stripShield:25,purge:true}), F("Liquidação do Passado",25,"mark:memoria",15,{damageType:"energy"})], "Memória Substituta")
  ],
  chama: [
    K("Incendiário", "Espalhe queimaduras e consuma a combustão para uma explosão concentrada.", P("Pavio Aceso", "hunter",4,"burn"), [A("Pavio de Ódio",15,1,{dot:D("queimadura",5,2),damageType:"energy"}), A("Fagulhas em Cadeia",10,2,{target:"all-enemies",dot:D("queimadura",4,2),cooldown:2}), F("Detonação Negra",25,"burn",15,{combo:{condition:"burn",bonusDamage:15,consume:true},damageType:"energy"})], "Corpo de Fumaça"),
    K("Controladora de Chamas", "Mantenha a chama no alvo e interrompa sua ação enquanto a brasa se fortalece.", P("Calor Persistente", "hunter",5,"burn"), [A("Brasa que Permanece",15,1,{dot:D("queimadura",5,3),damageType:"energy"}), F("Sufoco das Cinzas",10,"burn",5,{combo:{condition:"burn",bonusDamage:5,stun:1},weaken:1,cooldown:2}), A("Fornalha Interior",25,2,{damageType:"energy",gainCharge:1,perChargeDamage:5,cooldown:1})], "Manto de Cinzas"),
    K("Berserker", "Ferir a si próprio aumenta a pressão; a fúria atinge o auge quando a Vida baixa.", P("Raiva sem Freio", "comeback",7), [A("Punho de Rancor",25,1,{selfDamage:5}), S("Alimentar o Ódio",{target:"self",boost:10,shield:10,selfDamage:5}), F("Explosão do Ressentimento",27,"selfWounded",10,{selfDamage:5,damageType:"energy"})], "Fúria Intocável"),
    K("Sobrevivente", "Guarde calor com golpes pequenos e use as cinzas para recuperar o corpo.", P("Debaixo das Cinzas", "renew",4), [A("Carvão Oculto",15,1,{gainCharge:1,damageType:"energy"}), S("Recompor-se da Cinza",{target:"self",heal:15,perChargeHeal:7,spendCharge:true}), A("Renascer em Chamas",25,2,{dot:D("queimadura",5,2),cleanse:true,cooldown:2})], "Dissolução em Cinzas"),
    K("Cerco", "Prepare uma pira lenta, espalhe o fogo e elimine a guarda do alvo em combustão.", P("Lenha da Travessia", "ward",3), [A("Lenha Espiritual",10,1,{dot:D("queimadura",6,3)}), S("Círculo da Pira",{target:"self",counter:20,shield:10},2), F("Marcha da Fogueira",15,"burn",10,{cost:3,target:"all-enemies",stripShield:15,cooldown:2})], "Passo entre Brasas"),
    K("Ruptor", "Cada pulsação carrega o coração; o descontrole converte as cargas em dano.", P("Pulso Irado", "retaliate",3), [A("Batida Escaldante",15,1,{gainCharge:1}), A("Sangue em Ebulição",20,1,{selfDamage:5,boost:5}), A("Coração em Erupção",20,2,{perChargeDamage:10,spendCharge:true,selfDamage:8,cooldown:2})], "Pulso Intangível")
  ],
  fome: [
    K("Predador", "Drene Vida e finalize inimigos feridos para sustentar a própria presença.", P("Fome Crescente", "leech",4), [A("Mordida da Alma",15,1,{lifesteal:.5}), A("Saliva Corrosiva",10,1,{stripShield:20,expose:1}), F("Engolir a Essência",25,"wounded",15,{lifesteal:.5})], "Mandíbula do Vazio"),
    K("Usurpadora", "A mão rouba Essência enquanto a cobrança destrói as defesas do adversário.", P("Posse Insaciável", "firstHit",4), [A("Dedos da Cobiça",10,1,{steal:1,cooldown:1}), S("Guardar o que Roubou",{target:"self",shield:20,gainCharge:1}), A("Confisco da Alma",20,2,{stripShield:30,perChargeDamage:7,spendCharge:true,cooldown:1})], "Mão Fora de Alcance"),
    K("Devorador de Defesa", "Devore a guarda e transforme cada refeição em cargas para o abismo.", P("Digestão Lenta", "renew",3), [A("Corrosão Faminta",15,1,{stripShield:20,gainCharge:1}), S("Reserva do Estômago",{target:"self",heal:20,reduce:5}), A("Fundo que Não Existe",20,2,{damageType:"affliction",perChargeDamage:8,spendCharge:true,cooldown:2})], "Refúgio no Abismo"),
    K("Apoio da Escassez", "Reparta o pouco que resta e puna quem carrega a marca da privação.", P("Última Migalha", "support",5), [A("Marca da Privação",10,1,{mark:"privacao",drain:1,cooldown:1}), S("Dividir o Último Pão",{target:"team",heal:12},2), F("Dívida da Mesa Vazia",25,"mark:privacao",10,{lifesteal:.5})], "Mesa Inviolável"),
    K("Cobrador", "A dívida amadurece em marcas e Essência; a cobrança final exige pagamento.", P("Juros da Alma", "hunter",5,"marked"), [A("Assinar a Dívida",10,1,{mark:"divida",markTurns:4}), F("Juros Acumulados",20,"mark:divida",10,{steal:1}), F("Execução do Contrato",25,"mark:divida",15,{combo:{condition:"mark:divida",bonusDamage:15,consume:true},damageType:"piercing"})], "Cláusula de Ausência"),
    K("Drenagem", "Esvazie a Essência inimiga e equilibre a própria Vida com o peso do alvo.", P("Peso da Carência", "comeback",5), [A("Prato da Falta",15,1,{drain:1,cooldown:1}), S("Contrapeso Vital",{heal:20,cleanse:true},2), F("Fome em Equilíbrio",25,"wounded",10,{target:"all-enemies",damage:15,cooldown:2})], "Peso Zero")
  ],
  podridao: [
    K("Aflição", "A decadência enfraquece a guarda e prepara a decomposição do alvo.", P("Carne em Ruína", "hunter",4,"decay"), [A("Contato da Ruína",10,1,{dot:D("decadencia",5,3)}), A("Tecido Cedido",15,1,{weaken:1,stripShield:15}), F("Decomposição Completa",25,"decay",15,{damageType:"affliction"})], "Casca Morta"),
    K("Propagadora", "Contamine o trio inimigo e concentre a febre em quem já está doente.", P("Hospedeira da Praga", "leech",3), [A("Febre Andante",10,1,{dot:D("veneno",6,2)}), A("Contágio do Caminho",5,2,{target:"all-enemies",dot:D("veneno",4,3),cooldown:2}), F("Crise Pestilenta",20,"poison",15,{combo:{condition:"poison",bonusDamage:15,stun:1},cooldown:3})], "Névoa Contaminada"),
    K("Sabotador", "Corrompa a proteção e transforme a abertura numa cobrança de aflição.", P("Lucro da Ruína", "hunter",4,"shielded"), [A("Acordo Podre",15,1,{mark:"corrupcao",stripShield:20}), A("Quebrar a Confiança",15,1,{purge:true,expose:1}), F("Preço da Corrupção",25,"mark:corrupcao",10,{damageType:"affliction",steal:1})], "Privilégio Oculto"),
    K("Rainha de Esporos", "Cultive esporos e use as cargas para restaurar ou sufocar a vítima.", P("Colônia Viva", "ward",4), [A("Semear Esporos",10,1,{dot:D("decadencia",5,2),gainCharge:1}), S("Micélio de Amparo",{target:"team",shield:12,perChargeHeal:4,spendCharge:true},2), A("Florir da Colônia",20,2,{perChargeDamage:7,spendCharge:true,damageType:"affliction",cooldown:1})], "Coroa de Esporos"),
    K("Cirurgião Sombrio", "Infecte o inimigo para ampliar a drenagem; a sutura cura e limpa um aliado.", P("Cuidado Decomposto", "support",4), [A("Incisão Parasitária",10,1,{dot:D("veneno",5,3),lifesteal:.5}), S("Sutura de Vermes",{heal:20,cleanse:true},2), F("Drenagem da Colônia",25,"poison",10,{lifesteal:.7})], "Corpo entre Vermes"),
    K("Cerco Vivo", "Raízes degradam a oposição; o jardim amplia o dano contra alvos doentes e enfraquece a ofensiva inimiga.", P("Raiz sob a Pele", "retaliate",3), [A("Raiz Necrosada",15,1,{dot:D("decadencia",4,3)}), S("Solo Contaminado",{target:"team",shield:15},2), F("Jardim do Fim",15,"decay",10,{cost:3,target:"all-enemies",weaken:1,cooldown:2})], "Entre Raízes Mortas")
  ],
  silencio: [
    K("Observador", "Registre a falha, acumule testemunhos e prepare uma resposta precisa.", P("Olhos que Não Piscam", "ward",3), [A("Registrar a Falha",10,1,{mark:"testemunho",gainCharge:1}), S("Recusar Interferência",{target:"self",counter:20},2), F("Peso do Testemunho",25,"mark:testemunho",10,{perChargeDamage:5,spendCharge:true,damageType:"energy"})], "Fora do Acontecimento"),
    K("Carcereira", "Feche o caminho de um alvo e use a exclusão para proteger um aliado.", P("Lado de Dentro", "support",4), [A("Batida sem Resposta",15,1,{mark:"porta",weaken:1}), S("Tranca do Refúgio",{shield:25,reduce:5}), F("Não Há Saída",15,"mark:porta",10,{combo:{condition:"mark:porta",bonusDamage:10,stun:1},cooldown:2})], "Porta Fora do Mundo"),
    K("Interrupção", "Desarme a ofensiva e castigue o adversário que permanece enfraquecido.", P("Ruído Abafado", "comeback",5), [A("Impacto Abafado",15,1,{weaken:2}), A("Cessar do Som",10,2,{stun:1,cooldown:2}), F("Onda Inaudível",25,"weakened",15,{damageType:"energy"})], "Silêncio Absoluto"),
    K("Testemunha", "Revele a presença do inimigo e prepare uma resposta contra a próxima agressão.", P("Visão sem Olhos", "hunter",5,"exposed"), [A("Presença Denunciada",10,1,{expose:1,purge:true}), S("Memória do Golpe",{target:"ally",counter:20},2), F("Testemunho Final",30,"exposed",10,{damageType:"piercing"})], "Campo sem Testemunha"),
    K("Isolamento", "A ausência drena o trio inimigo; um alvo isolado se torna presa de aflição.", P("Vazio Habitado", "renew",3), [A("Ausência Pesada",15,1,{mark:"isolado",damageType:"energy"}), A("Ninguém Vem",10,2,{target:"all-enemies",drain:1,cooldown:2}), F("Quarto sem Retorno",25,"mark:isolado",10,{damageType:"affliction",weaken:1})], "Quarto Inacessível"),
    K("Emboscada", "Prepare a sentinela ausente e cobre o descuido de quem tiver sua guarda removida.", P("Vigília Tardia", "firstHit",6), [A("Passagem Desguarnecida",15,1,{stripShield:20,expose:1}), S("Vigia na Sombra",{target:"self",counter:25},2), F("Chegar Depois",25,"exposed",15)], "Posto Vazio")
  ],
  carne: [
    K("Possessor", "Inscreva a posse e use a ligação para interromper a vítima ou drenar sua Vida.", P("Vontade Parasita", "leech",4), [A("Selo da Posse",10,1,{mark:"posse",damageType:"energy"}), F("Nervos Tomados",15,"mark:posse",10,{combo:{condition:"mark:posse",bonusDamage:10,stun:1},cooldown:2}), F("Usufruto Vital",25,"mark:posse",10,{lifesteal:.6})], "Desligar o Corpo"),
    K("Metamorfa", "Recomponha a pele e castigue quem ataca uma forma que já não é a verdadeira.", P("Pele que Aprende", "ward",4), [A("Lâmina de Epiderme",20,1,{stripShield:10}), S("Camada Substituta",{target:"self",shield:25,cleanse:true},2), S("Forma de Retaliação",{target:"self",counter:25,boost:5},2)], "Troca de Pele"),
    K("Ruptor Vital", "O desejo cobra Vida para gerar cargas; a descarga rompe a proteção inimiga.", P("Falta Incurável", "comeback",6), [A("Pulso do Desejo",20,1,{selfDamage:5,gainCharge:1}), A("Aproximação Dolorosa",15,1,{expose:1,drain:1,cooldown:1}), A("Desejo Desfeito",25,2,{damageType:"piercing",perChargeDamage:8,spendCharge:true,cooldown:2})], "Forma Inalcançável"),
    K("Controladora", "Conecte fios ao alvo e transforme essa ligação em uma interrupção ou execução.", P("Tensão dos Fios", "hunter",4,"marked"), [A("Fio Nervoso",15,1,{mark:"nervo"}), F("Puxar a Vontade",10,"mark:nervo",5,{combo:{condition:"mark:nervo",bonusDamage:5,stun:1},cooldown:2}), F("Romper o Comando",25,"mark:nervo",15,{combo:{condition:"mark:nervo",bonusDamage:15,consume:true},damageType:"affliction"})], "Fios Fora de Fase"),
    K("Refletor", "Faça a agressão retornar e ataque a imagem vulnerável que o espelho revelou.", P("Dor Refletida", "retaliate",4), [A("Reflexo de Carne",15,1,{expose:1,damageType:"energy"}), S("Imagem de Resposta",{target:"ally",counter:20},2), F("Rachar o Reflexo",25,"exposed",10,{stripShield:20})], "Atrás do Espelho"),
    K("Cirurgiã", "Costure aliados para sustentá-los ou use o fio marcado para abrir a vítima.", P("Linha da Reparação", "support",5), [A("Ponto de Corte",15,1,{mark:"costura",dot:D("sangramento",4,2)}), S("Sutura Perfeita",{heal:25,cleanse:true},2), F("Desfazer os Pontos",25,"mark:costura",15,{combo:{condition:"mark:costura",bonusDamage:15,consume:true}})], "Costura de Ausência")
  ],
  vazio: [
    K("Anulador", "Apague proteções antes de extinguir a marca deixada na alma do alvo.", P("Nada se Sustenta", "hunter",4,"marked"), [A("Traço Apagado",15,1,{purge:true,mark:"apagamento"}), A("Branco sobre a Guarda",20,1,{stripShield:30}), F("Extinguir o Traço",30,"mark:apagamento",10,{damageType:"affliction"})], "Fora da Existência"),
    K("Evasão", "O adversário perde Essência tentando preencher a ausência; a falta vira dano.", P("Falta de Substância", "ward",4), [A("Toque Ausente",15,1,{drain:1,cooldown:1}), S("Ataque a Ninguém",{target:"self",counter:20},2), A("Ausência Contagiosa",15,2,{target:"all-enemies",weaken:1,damageType:"energy",cooldown:2})], "Não Estar"),
    K("Finalizador", "Reduza a resistência em silêncio e concentre a sentença em um inimigo ferido.", P("Último Instante", "hunter",6,"wounded"), [A("Aviso do Fim",15,1,{weaken:1}), A("Cessar da Vontade",10,2,{stun:1,purge:true,cooldown:2}), F("Sem Últimas Palavras",28,"wounded",12,{damageType:"piercing"})], "Instante sem Tempo"),
    K("Sombra Frágil", "Guarde fragmentos da própria sombra e lance uma investida que cobra Vida.", P("Medo sem Forma", "comeback",6), [A("Brincadeira sem Sombra",15,1,{gainCharge:1,damageType:"energy"}), S("Refúgio na Falta",{target:"self",heal:15,reduce:10}), A("Sol que Não Encontra",20,2,{perChargeDamage:9,spendCharge:true,selfDamage:5,damageType:"affliction",cooldown:2})], "Infância Invisível"),
    K("Encerramento", "Escreva a conclusão no alvo e remova suas vantagens antes de fechar o livro.", P("Parágrafo Final", "firstHit",5), [A("Nome na Última Folha",10,1,{mark:"pagina",expose:1}), A("Rasura do Destino",15,1,{purge:true,drain:1,cooldown:1}), F("Fechar a História",25,"mark:pagina",15,{combo:{condition:"mark:pagina",bonusDamage:15,consume:true},damageType:"energy"})], "Margem em Branco"),
    K("Desolação", "O território corrói todos; a ruína do alvo escolhido alimenta a sobrevivência.", P("Habitar o Nada", "renew",3), [A("Chão de Ninguém",5,2,{target:"all-enemies",dot:D("decadencia",5,2),cooldown:1}), A("Endereço Inexistente",15,1,{mark:"lugar",weaken:1}), F("Engolido pelo Lugar",25,"mark:lugar",10,{lifesteal:.5,damageType:"affliction"})], "Território Impossível")
  ],
  protecao: [
    K("Protetor", "Proteja um aliado e use a própria guarda como base para o contra-golpe.", P("Ficarei Aqui", "ward",5), [A("Golpe do Bastião",15,1,{shield:10,target:"enemy"}), S("Voto de Amparo",{shield:25,reduce:5}), F("Resposta da Égide",25,"selfShielded",15,{damageType:"piercing"})], "Fortaleza de Luz"),
    K("Fortificação", "Erga a muralha para o trio e carregue força para romper a linha adversária.", P("Pedra sobre Pedra", "ward",4), [A("Impacto do Baluarte",15,1,{gainCharge:1}), S("Muralha Partilhada",{target:"team",shield:18},2), A("Avanço do Bastão",20,2,{perChargeDamage:8,spendCharge:true,expose:1,cooldown:1})], "Além do Baluarte"),
    K("Sacrifício", "Permaneça ao lado dos feridos e transforme a resistência em um retorno decisivo.", P("Presença que Sustenta", "support",5), [A("Não Recuar",20,1,{reduce:5,target:"enemy"}), S("Lugar ao Meu Lado",{heal:15,shield:20,selfDamage:5},2), F("Eu Ainda Estou Aqui",25,"selfWounded",15,{lifesteal:.3})], "Promessa Inquebrável"),
    K("Contra-ataque", "Defenda o aliado ameaçado com um contra-ataque e interrompa o inimigo marcado pela vigília.", P("Última Vigília", "retaliate",4), [A("Lança da Guarda",20,1,{mark:"vigiado"}), S("Sentinela de Resposta",{counter:25,shield:10},2), F("Alvorecer do Guardião",25,"mark:vigiado",10,{combo:{condition:"mark:vigiado",bonusDamage:10,stun:1},cooldown:2})], "Guarda Inviolável"),
    K("Guarda Tática", "Revele um agressor, proteja o trio e ataque por dentro de suas defesas.", P("Olhar de Vigília", "hunter",4,"exposed"), [A("Sinal Azul",15,1,{expose:1}), S("Linha de Proteção",{target:"team",reduce:5,shield:10},2), F("Lança do Horizonte",25,"exposed",15,{damageType:"piercing"})], "Vigília Intangível")
  ],
  cura: [
    K("Curadora", "Cure e limpe um aliado; o golpe contra um inimigo marcado devolve Vida ao usuário.", P("A Dor é Vista", "support",5), [A("Toque da Compaixão",15,1,{mark:"compaixao",damageType:"energy"}), S("Mãos Restauradoras",{heal:25,cleanse:true},2), F("Reequilibrar a Dor",20,"mark:compaixao",10,{lifesteal:.8,damageType:"energy"})], "Luz sem Ferida"),
    K("Restaurador", "Remova aflições para manter o trio ativo e prepare reservas de Vida para a crise.", P("Recomposição Contínua", "renew",4), [A("Pulso de Retorno",15,1,{gainCharge:1,damageType:"energy"}), S("Restituir a Forma",{heal:20,shield:10,cleanse:true},2), S("Reserva Restauradora",{target:"team",heal:10,perChargeHeal:5,spendCharge:true},2)], "Forma Preservada"),
    K("Luz Vital", "A luz expõe a oposição e usa a clareza para recuperar aliados feridos.", P("Claridade que Ampara", "support",4), [A("Raio Restaurador",15,1,{damageType:"energy",expose:1}), S("Reconstruir o Fôlego",{heal:25,boost:5},2), F("Aurora Reparadora",25,"exposed",10,{damageType:"energy",lifesteal:.5})], "Clarão Imaculado"),
    K("Cultivo Vital", "Cultive cargas com raízes e use-as numa cura coletiva ou numa floração ofensiva.", P("Jardim da Convalescença", "renew",3), [A("Raiz que Cuida",15,1,{gainCharge:1,damageType:"energy"}), S("Flores de Convalescença",{target:"team",heal:10,perChargeHeal:6,spendCharge:true},2), A("Espinhos da Proteção",20,2,{perChargeDamage:7,spendCharge:true,weaken:1,cooldown:1})], "Pétalas de Refúgio"),
    K("Acalmador", "Reduza o ímpeto inimigo e mantenha um aliado estável até o próximo pulso.", P("Ritmo Sereno", "ward",3), [A("Pulsação Desarmante",10,1,{weaken:2,damageType:"energy"}), S("Respirar Novamente",{heal:20,reduce:10},2), F("Quietude Profunda",20,"weakened",10,{combo:{condition:"weakened",bonusDamage:10,stun:1},cooldown:2})], "Pausa do Coração")
  ],
  justica: [
    K("Equilíbrio", "Exponha o excesso e mantenha o trio protegido enquanto prepara a medida final.", P("Medida Justa", "hunter",4,"exposed"), [A("Peso do Excesso",15,1,{expose:1}), S("Prato da Misericórdia",{heal:20,shield:15},2), F("Equação da Justiça",25,"exposed",15,{damageType:"piercing"})], "Balança Imóvel"),
    K("Duelista Justa", "A lâmina marca o ofensor; o golpe seguinte atravessa a guarda sem perder a medida.", P("Fio do Princípio", "firstHit",5), [A("Corte de Princípio",20,1,{mark:"ofensa"}), S("Parada Equânime",{target:"self",counter:25},2), F("Sentença da Lâmina",25,"mark:ofensa",15,{damageType:"piercing"})], "Passo Equânime"),
    K("Ponderador", "Colete o peso dos atos e transforme as cargas numa decisão que interrompe.", P("Paciência da Balança", "ward",4), [A("Pesar os Atos",10,1,{gainCharge:1,mark:"peso"}), A("Reduzir o Excesso",15,1,{weaken:1}), F("Decisão Ponderada",20,"mark:peso",5,{perChargeDamage:6,spendCharge:true,combo:{condition:"mark:peso",bonusDamage:5,stun:1,consume:true},cooldown:3})], "Entre os Pratos"),
    K("Reveladora", "O testemunho remove vantagens e permite que o trio ataque uma abertura real.", P("Voz sem Distorção", "hunter",4,"marked"), [A("Registrar a Verdade",10,1,{mark:"registro",expose:1}), A("Prova Irrefutável",20,1,{purge:true,damageType:"energy"}), F("Testemunho Íntegro",20,"mark:registro",10,{target:"all-enemies",damageType:"energy",cooldown:2})], "Testemunho Protegido"),
    K("Julgador de Amparo", "Enfraqueça sem excesso, recupere o aliado e interrompa quem insiste na agressão.", P("Gentileza Firme", "support",5), [A("Advertência Serena",10,1,{weaken:2}), S("Reparação Justa",{heal:25,cleanse:true},2), F("Limite da Clemência",20,"weakened",10,{combo:{condition:"weakened",bonusDamage:10,stun:1},cooldown:2})], "Trégua Inviolável")
  ],
  esperanca: [
    K("Perseverança", "Mantenha a chama acesa e responda com mais força quando a própria Vida baixar.", P("Ainda Há Amanhã", "comeback",6), [A("Fagulha do Amanhã",15,1,{dot:D("queimadura",4,2),gainCharge:1}), S("Não se Apagar",{target:"self",heal:20,boost:5}), A("Aurora Imorredoura",25,2,{perChargeDamage:7,spendCharge:true,damageType:"energy",cooldown:1})], "Chama Intocável"),
    K("Resiliência", "Sustente quem caiu em risco e transforme a própria resistência em resposta.", P("Levantar Outra Vez", "renew",4), [A("Passo de Retorno",15,1,{shield:10}), S("Erguer o Companheiro",{heal:25,boost:5},2), F("Enquanto Eu Respirar",30,"selfWounded",10)], "Instante de Superação"),
    K("Inspiradora", "A voz fortalece o trio; a mensagem marca quem tentaria calá-la.", P("Coro de Coragem", "support",4), [A("Palavra de Coragem",15,1,{mark:"voz",damageType:"energy"}), S("Hino da Perseverança",{target:"team",boost:5,shield:10},2), F("Não Seremos Calados",20,"mark:voz",10,{target:"all-enemies",damageType:"energy",cooldown:2})], "Nota Inalcançável"),
    K("Portador", "Acumule claridade, limpe o caminho e libere a aurora numa ofensiva concentrada.", P("Primeiro Horizonte", "firstHit",5), [A("Lança da Primeira Luz",15,1,{gainCharge:1,damageType:"energy"}), S("Carregar a Aurora",{target:"ally",heal:15,cleanse:true,boost:5},2), A("Abrir o Horizonte",20,2,{perChargeDamage:9,spendCharge:true,damageType:"piercing",cooldown:2})], "Além do Horizonte"),
    K("Mensageira", "Marque o destino e dê ao aliado o fôlego necessário para completar a travessia.", P("Promessa de Chegada", "support",5), [A("Sinal do Amanhã",15,1,{mark:"amanha",expose:1}), S("Mensagem de Alento",{heal:20,shield:15},2), F("O Amanhã Chegou",25,"mark:amanha",15,{damageType:"energy"})], "Passagem da Mensagem")
  ],
  verdade: [
    K("Revelador", "Remova vantagens ocultas e use a exposição para um golpe que ignora redução.", P("Nada a Esconder", "hunter",5,"exposed"), [A("Luz sem Mentira",15,1,{purge:true,expose:1,damageType:"energy"}), S("Clareza Partilhada",{target:"team",cleanse:true},2), F("Verdade Incisiva",30,"exposed",10,{damageType:"piercing"})], "Transparência Absoluta"),
    K("Claridade", "A luz marca o adversário e rompe a defesa antes do clarão definitivo.", P("Sem Disfarce", "firstHit",4), [A("Toque da Luz Nua",15,1,{mark:"luz",damageType:"energy"}), A("Despir a Guarda",15,1,{stripShield:20,purge:true}), F("Clarão sem Véu",25,"mark:luz",15,{damageType:"energy"})], "Feixe Inatingível"),
    K("Espelhamento", "Revele a abertura e faça a próxima agressão retornar ao próprio agressor.", P("Reflexo Honesto", "retaliate",4), [A("Imagem Verdadeira",15,1,{expose:1,damageType:"energy"}), S("Devolver a Intenção",{counter:25},2), F("Fratura da Ilusão",25,"exposed",10,{purge:true,damageType:"piercing"})], "Dentro do Reflexo"),
    K("Cartógrafa", "Trace rotas no adversário e use os pontos de referência para orientar a ofensiva.", P("Rota sem Engano", "hunter",4,"marked"), [A("Traçar a Abertura",10,1,{mark:"rota",gainCharge:1,expose:1}), S("Caminho Seguro",{target:"team",shield:12,boost:5},2), A("Convergência das Rotas",20,2,{perChargeDamage:8,spendCharge:true,damageType:"energy",cooldown:1})], "Fora das Coordenadas"),
    K("Percepção", "Enfraqueça a agressão sem depender de força; a abertura real permite desarmá-la.", P("Ver sem Ferir", "support",4), [A("Olhar Desarmante",10,1,{weaken:1,expose:1,damageType:"energy"}), S("Cuidar sem Defesa",{heal:20,cleanse:true},2), F("Intenção Desvendada",20,"exposed",10,{combo:{condition:"exposed",bonusDamage:10,stun:1},cooldown:2})], "Ponto Cego Sereno")
  ],
  uniao: [
    K("Vínculo Ofensivo", "Marque o elo adversário e fortaleça os aliados antes de fechar a corrente.", P("Força Compartilhada", "support",4), [A("Laço do Elo",15,1,{mark:"elo"}), S("Promessa de Combate",{target:"team",boost:5,shield:10},2), F("Corrente Dourada",25,"mark:elo",15,{damageType:"energy"})], "Elo Inquebrável"),
    K("Vínculo Vital", "Uma união cuidadosa recupera e limpa o aliado enquanto a ligação drena o inimigo.", P("Cuidar em Conjunto", "support",5), [A("Fio de Encontro",15,1,{lifesteal:.5,damageType:"energy"}), S("Reunir os Fragmentos",{heal:20,cleanse:true,shield:10},2), S("Fôlego Coletivo",{target:"team",heal:15,boost:5},2)], "Entrelaçar de Luz"),
    K("Guarda de Aliança", "O vínculo prepara uma defesa reativa e transforma a exposição em pressão.", P("Pacto de Permanência", "ward",4), [A("Selo do Pacto",15,1,{expose:1}), S("Responder pelo Outro",{counter:20,shield:15},2), F("Resposta da Aliança",25,"exposed",10,{lifesteal:.3})], "Laço Intangível"),
    K("Trio em Harmonia", "As três cadências acumulam cargas para uma resposta coletiva.", P("Passo de Irmandade", "firstHit",5), [A("Primeira Cadência",15,1,{gainCharge:1}), S("Segunda Cadência",{target:"team",shield:12,gainCharge:1},2), A("Terceira Cadência",15,3,{target:"all-enemies",perChargeDamage:5,spendCharge:true,cooldown:2})], "Passo em Uníssono"),
    K("Guardiã de Pactos", "Proteja uma promessa e cobre o inimigo marcado sem abandonar o cuidado.", P("Promessa Cumprida", "support",5), [A("Juramento Gravado",15,1,{mark:"promessa",damageType:"energy"}), S("Guardar a Palavra",{shield:25,heal:10},2), F("Cobrança do Juramento",25,"mark:promessa",10,{combo:{condition:"mark:promessa",bonusDamage:10,stun:1},cooldown:2})], "Pacto Inviolável")
  ],
  criacao: [
    K("Artífice", "Crie formas de ataque e proteção para acumular cargas e concluir a obra ofensiva.", P("Ideia Persistente", "ward",4), [A("Fragmento Nascente",15,1,{gainCharge:1,damageType:"energy"}), S("Forma de Amparo",{shield:20,gainCharge:1}), A("Obra Convergente",20,2,{perChargeDamage:9,spendCharge:true,damageType:"energy",cooldown:2})], "Forma Impossível"),
    K("Germinação", "Semeie o futuro no alvo: use as cargas para amparar um aliado ou consuma a marca para romper a guarda.", P("Potência Latente", "renew",3), [A("Semente da Ruptura",10,1,{mark:"semente",gainCharge:1,damageType:"energy"}), S("Abrigo do Broto",{heal:15,shield:10,perChargeHeal:5,spendCharge:true},2), F("Germinar por Dentro",25,"mark:semente",15,{damageType:"affliction",combo:{condition:"mark:semente",bonusDamage:15,consume:true}})], "Casulo de Origem"),
    K("Cultivador", "Cultive reservas com raízes e escolha entre uma colheita de cura ou dano.", P("Ciclo da Colheita", "support",4), [A("Arar a Alma",15,1,{gainCharge:1,weaken:1}), S("Colheita de Fôlego",{target:"team",heal:10,perChargeHeal:6,spendCharge:true},2), A("Ramos da Resposta",20,2,{perChargeDamage:8,spendCharge:true,stripShield:15,cooldown:1})], "Abrigo das Raízes"),
    K("Arquiteta", "A estrutura protege o trio; pontos de apoio preparam um desabamento controlado.", P("Fundação Viva", "ward",5), [A("Pilar Ascendente",15,1,{mark:"pilar",expose:1}), S("Abóbada Verde",{target:"team",shield:18},2), F("Convergência dos Pilares",25,"mark:pilar",10,{combo:{condition:"mark:pilar",bonusDamage:10,stun:1},cooldown:2})], "Geometria Intocável"),
    K("Cantor da Origem", "A nota primordial acumula harmonia; o refrão sustenta o trio ou rompe a oposição.", P("Eco de Nascimento", "support",4), [A("Nota Primordial",15,1,{gainCharge:1,damageType:"energy"}), S("Refrão da Vida",{target:"team",heal:12,boost:5},2), A("Canto que Abre o Mundo",15,3,{target:"all-enemies",perChargeDamage:5,spendCharge:true,damageType:"energy",cooldown:2})], "Pausa Anterior ao Som")
  ],
  "correntes-quebradas": [
    K("Duelista Temporal", "Marque uma descontinuidade e converta o passo preparado em interrupção.", P("Passo que Retorna", "firstHit",5), [A("Fissura do Passo",15,1,{mark:"passo",gainCharge:1,damageType:"piercing"}), F("Entre Dois Instantes",15,"mark:passo",10,{combo:{condition:"mark:passo",bonusDamage:10,stun:1},cooldown:2}), A("Golpe Descontínuo",25,2,{perChargeDamage:8,spendCharge:true,selfDamage:5,damageType:"piercing",cooldown:1})], "Passo Fora do Tempo"),
    K("Ruptura de Vínculos", "Corte a proteção e amarre a falha do inimigo a uma linha que ainda não terminou.", P("Tensão da Ruptura", "hunter",4,"marked"), [A("Extremidade Solta",15,1,{mark:"linha",stripShield:15}), S("Nó de Emergência",{heal:20,shield:10,selfDamage:5}), F("Puxar o Fim da Linha",25,"mark:linha",15,{damageType:"affliction",selfDamage:5})], "Linha Inalcançável"),
    K("Eco Errante", "Acumule ecos e devolva a intenção agressiva antes de liberar a ressonância.", P("Ressonância sem Dono", "retaliate",3), [A("Eco Residual",15,1,{gainCharge:1,damageType:"energy"}), S("Devolver a Voz",{counter:20},2), A("Coro sem Origem",15,3,{target:"all-enemies",perChargeDamage:5,spendCharge:true,selfDamage:5,damageType:"energy",cooldown:2})], "Eco Intangível"),
    K("Travessia", "Uma abertura marca o destino; atravesse a defesa e preserve quem precisa passar.", P("Limite Suspenso", "support",4), [A("Abertura Impossível",15,1,{mark:"passagem",expose:1,damageType:"energy"}), S("Travessia Segura",{shield:25,cleanse:true},2), F("Fechar a Passagem",25,"mark:passagem",10,{damageType:"piercing",selfDamage:5})], "Do Outro Lado"),
    K("Esquecimento", "Apague vantagens e faça o adversário perder Essência junto ao nome marcado.", P("Nome que se Dissolve", "renew",3), [A("Sílaba Perdida",10,1,{mark:"nome",drain:1,cooldown:1}), A("Esquecer a Forma",15,1,{purge:true,weaken:1,damageType:"energy"}), F("Ninguém Responde",25,"mark:nome",15,{damageType:"affliction",selfDamage:5})], "Nome Fora da Memória"),
    K("Tempo Submerso", "Atrase a resposta inimiga e gaste os segundos acumulados em dano concentrado.", P("Tempo em Reserva", "ward",3), [A("Segundo Afogado",15,1,{gainCharge:1,weaken:1,damageType:"energy"}), A("Ponteiro Imóvel",10,2,{stun:1,cooldown:2}), A("Devolver os Segundos",20,2,{perChargeDamage:10,spendCharge:true,selfDamage:8,damageType:"energy",cooldown:2})], "Instante Submerso"),
    K("Inversão", "Desarme a ofensiva e use a abertura para uma queda que desafia o peso do mundo.", P("Queda Ascendente", "hunter",5,"weakened"), [A("Pena ao Contrário",10,1,{weaken:2}), S("Voo Reverso",{target:"self",counter:20,boost:5},2), F("Cair para o Alto",25,"weakened",15,{damageType:"piercing",selfDamage:5})], "Asa Fora do Plano"),
    K("Vidro Errante", "Marque o caminho em estilhaços e gaste a própria integridade para atravessar a guarda.", P("Luz nas Fissuras", "comeback",6), [A("Pegada de Vidro",15,1,{mark:"vidro",dot:D("sangramento",4,2)}), S("Reflexo do Andarilho",{target:"self",counter:25},2), F("Travessia Estilhaçada",25,"mark:vidro",15,{damageType:"piercing",selfDamage:8})], "Passo Transparente"),
    K("Sombra Mutável", "Roube impulso na penumbra e alterne drenagem com golpes na vítima marcada.", P("Fome da Penumbra", "leech",4), [A("Sombra Atrás da Alma",10,1,{mark:"sombra",steal:1,cooldown:1}), S("Mudar de Contorno",{target:"self",heal:15,cleanse:true,boost:5}), F("A Sombra se Fecha",25,"mark:sombra",15,{damageType:"affliction",selfDamage:5})], "Contorno Imaterial"),
    K("Ruptor de Passagens", "Derrube a Defesa e exponha o inimigo; a travessia final atinge toda a linha.", P("Vão Persistente", "hunter",4,"exposed"), [A("Romper o Apoio",15,1,{stripShield:20,expose:1}), S("Ponte de Emergência",{target:"team",shield:15,selfDamage:5},2), F("Queda da Travessia",15,"exposed",10,{cost:3,target:"all-enemies",damageType:"piercing",selfDamage:5,cooldown:2})], "Entre as Margens"),
    K("Suspensão Vital", "Preserve a forma por um instante, carregue o limiar e solte a alma em uma descarga.", P("Fôlego no Limiar", "renew",4), [A("Pulso Suspenso",15,1,{gainCharge:1,damageType:"energy"}), S("Prender o Último Fôlego",{heal:20,shield:15,selfDamage:5},2), A("Soltar a Âncora",20,2,{perChargeDamage:9,spendCharge:true,damageType:"affliction",selfDamage:5,cooldown:2})], "Suspensão Absoluta")
  ]
};

// Replaces repeated one-line bonuses with distinct, bounded triggers across every Elo.
// Triggered passives proc at most once per round unless the design says otherwise.
const passiveRevisions = {
  sangria: {
    2: T("Primeiro Troféu", "kill", { gainCharge: 1, shield: 4 }, "Ao eliminar um inimigo, ganha 1 carga e 4 de Defesa. Ativa uma vez por rodada."),
    3: T("Ritmo dos Gêmeos", "hit", { heal: 3, generateEssence: { resource: "ruptura", amount: 1 } }, "Ao causar dano a um inimigo Exposto com Sangramento aplicado pelos Gêmeos, recupera 3 de Vida e gera 1 Ruptura. Ativa uma vez por rodada.", { requiresExposed: true, requiresOwnDot: "sangramento" }),
    4: T("Sem Apelação", "hit", { drainEssence: { resource: "random", amount: 1 }, heal: 3 }, "Ao causar dano a um inimigo já Atordoado, recupera 3 de Vida e remove 1 Essência disponível da reserva adversária, se houver. Ativa uma vez por rodada.", { requiresStunned: true }),
    5: T("Sangue que Acolhe", "support", { shieldTarget: 4, healSource: 3 }, "Quando um apoio restaura ao menos 10 de Vida de outro aliado, concede 4 de Defesa a ele e recupera 3 de Vida. Ativa uma vez por rodada; a defesa pessoal não ativa a passiva.", { minimumHeal: 10, requiresOtherAlly: true, nonDefensive: true }),
    0: T("Faro de Sangue", "consume", { generateEssence: { resource: "ruptura", amount: 1 } }, "Ao consumir Sangramento de um inimigo, gera 1 Ruptura para a equipe. Ativa uma vez por rodada.", { condition: "bleed" }),
    1: T("Luto Faminto", "kill", { heal: 8, generateEssence: { resource: "random", amount: 1 } }, "Quando um inimigo marcado pela Viúva cai, ela recupera 8 de Vida e a equipe recebe 1 Essência aleatória. Ativa uma vez por rodada.", { requiresOwnMark: true, watchDeaths: true })
  },
  coroa: {
    0: T("Autoridade Estilhaçada", "formChange", { shield: 6 }, "Ao assumir a Forma Coroa Soberana, recebe 6 de Defesa. Ativa uma vez por rodada; voltar à Forma original não ativa a passiva.", { ifForm: "edict" }),
    1: T("Lei do Mais Forte", "hit", { drainEssence: { resource: "graca", amount: 1 }, shield: 2 }, "Ao causar dano a um inimigo Exposto, recebe 2 de Defesa e remove 1 Graça da reserva adversária, se houver. Ativa uma vez por rodada.", { requiresExposed: true }),
    3: T("Grilhão Herdado", "hit", { shield: 4 }, "Ao causar dano a um inimigo que já tem uma Marca do Príncipe, recebe 4 de Defesa. Ativa uma vez por rodada; aplicar a primeira Marca não ativa a passiva.", { requiresOwnMark: true }),
    4: T("Lealdade pelo Medo", "support", { generateEssence: { resource: "cinza", amount: 1 } }, "Quando um apoio concede ao menos 5 de Defesa a uma alma, gera 1 Cinza. Ativa uma vez por rodada; a defesa pessoal não ativa a passiva.", { minimumShield: 5, nonDefensive: true }),
    2: T("Autoridade Delegada", "turnStart", { shield: 4 }, "No início do turno, recebe 4 de Defesa se não atacou na rodada anterior ou perdeu Vida para uma habilidade. A defesa pessoal não conta como ataque.", { ifNoOffenseOrDamaged: true }),
    5: T("Ambição Acorrentada", "turnStart", { gainCharge: 1, selfDamage: 3 }, "Com 50 de Vida ou menos, ganha 1 carga no início do turno, mas perde 3 de Vida sem poder ser derrotado por esse custo.", { hpAtMost: 50 })
  },
  mentira: {
    0: T("Segredo em Circulação", "hit", { convertEssence: { from: "essence", to: "random", amount: 1 } }, "Ao causar dano a um inimigo com seu Veneno, converte 1 Éter disponível em uma Essência aleatória diferente. Ativa uma vez por rodada; exige 1 Éter restante após pagar a técnica.", { requiresOwnDot: "veneno", ifResource: "essence", resourceMinimum: 1 }),
    2: T("Trama Paciente", "hit", { weakenTarget: 1 }, "Ao causar dano a um inimigo que já tem uma Marca do Intrigante, deixa-o Enfraquecido por 1 turno. Ativa uma vez por rodada; aplicar a primeira Marca não ativa a passiva.", { requiresOwnMark: true }),
    3: T("Verdade Fraturada", "hit", { heal: 4 }, "Ao causar dano perfurante a um inimigo Exposto, recupera 4 de Vida. Ativa uma vez por rodada; dano absorvido inteiramente pela Defesa não ativa a passiva.", { requiresExposed: true, damageTypes: ["piercing"] }),
    4: T("Fé Desviada", "support", { shield: 3, generateEssence: { resource: "graca", amount: 1 } }, "Quando uma técnica própria restaura ao menos 10 de sua Vida, recebe 3 de Defesa e gera 1 Graça. Ativa uma vez por rodada; a defesa pessoal não ativa a passiva.", { minimumHeal: 10, requiresSelf: true, nonDefensive: true }),
    1: T("Segundo Rosto", "formChange", { generateEssence: { resourceFromForm: true, amount: 1 } }, "Ao assumir ou deixar uma Forma, gera 1 Essência do tipo da nova Forma; ao voltar ao corpo original, usa sua afinidade. Ativa uma vez por rodada."),
    5: T("Arquivo Roubado", "essenceSpent", { stealEssence: { amount: 1 } }, "Uma vez por rodada, ao pagar Éter por uma técnica, rouba 1 Essência da reserva adversária, se houver.", { spendResource: "essence" })
  },
  chama: {
    0: T("Pavio Aceso", "consume", { generateEssence: { resource: "essence", amount: 1 }, shield: 3 }, "Ao consumir Queimadura de um inimigo, gera 1 Éter e recebe 3 de Defesa. Ativa uma vez por rodada.", { condition: "burn" }),
    3: T("Rancor Latente", "support", { generateEssence: { resource: "cinza", amount: 1 } }, "Quando Nutrir o Rancor consome ao menos 1 carga e restaura ao menos 15 de sua Vida, gera 1 Cinza. Ativa uma vez por rodada; a defesa pessoal não ativa a passiva.", { requiresSelf: true, minimumHeal: 15, minimumChargesSpent: 1, nonDefensive: true }),
    4: T("Rancor Encouraçado", "damaged", { damageAttacker: 4, shield: 3 }, "Ao perder Vida para uma habilidade de um inimigo com Queimadura aplicada pela Vingadora, devolve 4 de dano de aflição e recebe 3 de Defesa. Ativa uma vez por rodada.", { requiresLifeLoss: true, requiresAttackerOwnDot: "queimadura" }),
    5: T("Pulso Irado", "chargeSpent", { heal: 6 }, "Após uma técnica ofensiva consumir ao menos 2 cargas, recupera 6 de Vida, depois do custo de Vida da técnica. Ativa uma vez por rodada; técnicas anuladas não ativam a passiva.", { minimumChargesSpent: 2, offensive: true }),
    1: T("Calor Persistente", "kill", { heal: 4, generateEssence: { resource: "ruptura", amount: 1 } }, "Quando um inimigo com sua Queimadura cai, recupera 4 de Vida e gera 1 Ruptura. Ativa uma vez por rodada.", { requiresOwnDot: "queimadura", watchDeaths: true }),
    2: T("Raiva sem Freio", "turnStart", { selfDamage: 3 }, "Enquanto Ódio Solto estiver ativo, perde 3 de Vida no início do turno sem poder ser derrotado por esse custo. Técnicas transformadas que exigem Éter custam 1 a menos.", { ifForm: "rage", costDiscount: { form: "rage", resource: "essence", amount: 1 } })
  },
  fome: {
    2: T("Assimilação", "stripShield", { heal: 4 }, "Ao remover ao menos 10 de Defesa com uma técnica, recupera 4 de Vida. Ativa uma vez por rodada; absorver dano na Defesa não conta como removê-la.", { minimumStripped: 10 }),
    3: T("Lucro da Privação", "support", { stealEssence: { amount: 1 } }, "Quando um apoio restaura ao menos 6 de Vida de outro aliado, rouba 1 Essência da reserva adversária, se houver. Ativa uma vez por rodada, mesmo ao curar o trio; a defesa pessoal não ativa a passiva.", { minimumHeal: 6, requiresOtherAlly: true, nonDefensive: true }),
    4: T("Juros da Alma", "consume", { stealEssence: { amount: 1 }, heal: 2 }, "Ao consumir sua Marca de Dívida, rouba 1 Essência da reserva adversária, se houver, e recupera 2 de Vida. Ativa uma vez por rodada; Marcas de outro Credor não contam.", { condition: "mark:divida" }),
    1: T("Posse Insaciável", "firstHit", { stealEssence: { amount: 1 } }, "Na primeira habilidade ofensiva que causa dano no combate, rouba 1 Essência da reserva adversária, se houver.", { oncePerBattle: true }),
    5: T("Lucro da Carência", "attack", { drainEssence: { resource: "random", amount: 1 }, weakenTarget: 1 }, "Ao atacar um inimigo que guarda ao menos 2 Essências, remove 1 Essência disponível e reduz em 10 o dano causado por ele na próxima ação. Ativa uma vez por rodada.", { enemyResource: "random", enemyResourceMinimum: 2 })
  },
  podridao: {
    1: T("Hospedeira da Praga", "turnStart", { heal: 3, generateEssence: { resource: "cinza", amount: 1 } }, "Se ao menos 2 inimigos vivos ainda tiverem Veneno aplicado pela Pestilência no início do turno, recupera 3 de Vida e gera 1 Cinza. Ativa uma vez por rodada.", { ownDotPopulation: { tag: "veneno", minimum: 2 } }),
    2: T("Lucro da Ruína", "purge", { stealEssence: { amount: 1 }, shield: 4 }, "Quando uma técnica remove bônus de dano, redução de dano ou Contra-ataque de um inimigo, rouba 1 Essência disponível e recebe 4 de Defesa. Ativa uma vez por rodada; atingir um alvo sem esses bônus não ativa a passiva.", { minimumPurged: 1 }),
    4: T("Simbiose Corrupta", "support", { healSource: 4, generateEssence: { resource: "cinza", amount: 1 } }, "Quando um apoio remove ao menos 1 condição prejudicial e restaura ao menos 10 de Vida de outro aliado, recupera 4 de Vida e gera 1 Cinza. Ativa uma vez por rodada; autocura e defesa pessoal não ativam a passiva.", { minimumCleansed: 1, minimumHeal: 10, requiresOtherAlly: true, nonDefensive: true }),
    5: T("Seiva Corrosiva", "hit", { healWeakestAlly: 4 }, "Ao causar dano a um inimigo que já tem Decadência aplicada pelo Definhador, restaura 4 de Vida ao aliado vivo com menor porcentagem de Vida, incluindo o usuário. Ativa uma vez por rodada, mesmo em área.", { requiresOwnDot: "decadencia" }),
    0: T("Carne em Ruína", "consume", { generateEssence: { resource: "cinza", amount: 1 } }, "Ao consumir Decadência de um inimigo, gera 1 Cinza para a equipe. Ativa uma vez por rodada.", { condition: "decay" }),
    3: T("Colônia Viva", "turnStart", { gainCharge: 1 }, "Se a equipe tiver ao menos 2 Cinzas no início do turno, ganha 1 carga. Ativa uma vez por rodada.", { ifResource: "cinza", resourceMinimum: 2 })
  },
  silencio: {
    0: T("Indiferença Vigilante", "counter", { gainCharge: 1, shield: 3 }, "Quando um Contra-ataque preparado pelo Espectador anula uma técnica inimiga, ganha 1 carga e 3 de Defesa. Ativa uma vez por rodada; preparar a resposta sem ativá-la não concede a recompensa."),
    2: T("Clamor Sufocado", "hit", { sealSupportTarget: 1 }, "Ao causar dano espiritual a um inimigo já Enfraquecido, sela suas técnicas de apoio por 1 turno. Ativa uma vez por rodada; aplicar Enfraquecido no mesmo golpe não basta.", { requiresWeakened: true, damageTypes: ["energy"] }),
    3: T("Cumplicidade Velada", "counter", { generateEssence: { resource: "graca", amount: 1 }, shieldTarget: 4 }, "Quando um Contra-ataque preparado pela Cúmplice em outro aliado anula uma técnica inimiga, gera 1 Graça e concede 4 de Defesa ao protegido. Ativa uma vez por rodada; proteger a si própria não ativa a passiva.", { requiresOtherAlly: true }),
    5: T("Oportunismo", "hit", { stealEssence: { resource: "ruptura", amount: 1 }, heal: 6 }, "Uma vez por combate, ao causar dano físico a um inimigo já Exposto, recupera 6 de Vida e rouba 1 Ruptura da reserva adversária, se houver. Dano inteiramente absorvido e a primeira aplicação de Exposto não ativam a passiva.", { oncePerBattle: true, requiresExposed: true, damageTypes: ["physical"] }),
    1: T("Abrigo dos Cúmplices", "turnStart", { drainEssence: { resource: "essence", amount: 1 }, shield: 3 }, "Se a oposição tiver ao menos 2 Éteres no início do turno, remove 1 e recebe 3 de Defesa. Ativa uma vez por rodada.", { enemyResource: "essence", enemyResourceMinimum: 2 }),
    4: T("Hospitalidade Negada", "turnStart", { generateEssence: { resource: "cinza", amount: 1 } }, "Se algum inimigo tiver uma aflição no início do turno, gera 1 Cinza para a equipe. Ativa uma vez por rodada.", { ifEnemyAfflicted: true })
  },
  carne: {
    0: T("Vínculo de Usurpação", "hit", { stealEssence: { amount: 1 }, heal: 4 }, "Ao causar dano a um inimigo que já tem sua Marca da Posse, rouba 1 Essência disponível da reserva adversária e recupera 4 de Vida. Ativa uma vez por rodada.", { requiresOwnMark: true }),
    1: T("Adaptação Predatória", "formChange", { generateEssence: { resourceFromForm: true, amount: 1 } }, "Cada troca de Forma gera 1 Essência correspondente ao novo corpo; voltar ao original usa a afinidade da Metamorfa. Ativa uma vez por rodada."),
    2: T("Avidez Profana", "hit", { gainCharge: 1, shield: 3 }, "Ao causar dano perfurante a um alvo já Exposto enquanto tem 50 de Vida ou menos, ganha 1 carga e 3 de Defesa. Ativa uma vez por rodada.", { requiresExposed: true, damageTypes: ["piercing"], hpAtMost: 50 }),
    3: T("Laço Enrijecido", "hit", { weakenTarget: 1 }, "Ao causar dano a um inimigo que já tem sua Marca Nervosa, deixa-o Enfraquecido por 1 turno. Ativa uma vez por rodada; aplicar a primeira marca não ativa a passiva.", { requiresOwnMark: true }),
    4: T("Eco da Dor", "damaged", { damageAttacker: 5, generateEssence: { resource: "random", amount: 1 } }, "Ao perder Vida para uma habilidade espiritual, devolve 5 de dano de aflição ao agressor e gera 1 Essência aleatória. Ativa uma vez por rodada.", { damageTypes: ["energy"], requiresLifeLoss: true }),
    5: T("Sutura que Ancora", "support", { shieldTarget: 5, generateEssence: { resource: "graca", amount: 1 } }, "Quando uma técnica própria limpa ao menos 1 condição prejudicial e restaura ao menos 10 de Vida de outro aliado, concede a ele 5 de Defesa e gera 1 Graça. Ativa uma vez por rodada; autocura não ativa a passiva.", { minimumHeal: 10, minimumCleansed: 1, requiresOtherAlly: true, nonDefensive: true })
  },
  vazio: {
    0: T("Prova da Negação", "purge", { drainEssence: { resource: "graca", amount: 1 }, gainCharge: 1 }, "Quando uma técnica remove ao menos 1 bônus, redução de dano ou Contra-ataque de um inimigo, drena 1 Graça disponível da reserva adversária e ganha 1 carga. Ativa uma vez por rodada.", { minimumPurged: 1 }),
    1: T("Falta de Substância", "damaged", { generateEssence: { resource: "random", amount: 1 } }, "Ao perder Vida para uma habilidade física, gera 1 Essência aleatória. Ativa uma vez por rodada.", { damageTypes: ["physical"], requiresLifeLoss: true }),
    2: T("Cobrança do Último Instante", "hit", { gainCharge: 1, generateEssence: { resource: "ruptura", amount: 1 } }, "Ao causar dano a um inimigo já Atordoado, ganha 1 carga e gera 1 Ruptura. Ativa uma vez por rodada.", { requiresStunned: true }),
    3: T("Resíduo de Penumbra", "chargeSpent", { heal: 5, generateEssence: { resource: "random", amount: 1 } }, "Se tiver 50 de Vida ou menos, uma técnica ofensiva que consome ao menos 1 carga recupera 5 de Vida e gera 1 Essência aleatória. Ativa uma vez por rodada.", { hpAtMost: 50, minimumChargesSpent: 1, offensive: true }),
    4: T("Círculo de Apagamento", "consume", { gainCharge: 1, generateEssence: { resource: "cinza", amount: 1 } }, "Ao consumir sua Marca da Página, ganha 1 carga e gera 1 Cinza. Ativa uma vez por rodada.", { condition: "mark:pagina" }),
    5: T("Sustento do Apagamento", "turnStart", { convertEssence: { from: "cinza", to: "random", amount: 1 }, heal: 4 }, "Se tiver ao menos 2 Cinzas no início do turno, converte 1 em uma Essência aleatória diferente e recupera 4 de Vida. Ativa uma vez por rodada.", { ifResource: "cinza", resourceMinimum: 2 })
  },
  protecao: {
    1: T("Pedra sobre Pedra", "turnStart", { shield: 6 }, "Recebe 6 de Defesa no início do turno somente se perdeu Vida para uma habilidade na rodada anterior." , { ifDamagedLastTurn: true }),
    3: T("Última Vigília", "damaged", { gainCharge: 1 }, "Se ainda tiver Defesa após receber uma habilidade física ou perfurante, ganha 1 carga. Ativa uma vez por rodada.", { damageTypes: ["physical", "piercing"], requiresRemainingShield: true })
  },
  cura: {
    1: T("Recomposição Contínua", "essenceSpent", { heal: 4 }, "Uma vez por rodada, ao pagar Graça por uma técnica, recupera 4 de Vida.", { spendResource: "graca" }),
    3: T("Remédio Perene", "support", { generateEssence: { resource: "graca", amount: 1 } }, "Quando um apoio restaura ao menos 10 de Vida de uma alma, gera 1 Graça. Ativa uma vez por rodada.", { minimumHeal: 10 })
  },
  justica: {
    2: T("Paciência da Balança", "turnStart", { gainCharge: 1 }, "Se tiver ao menos 2 Éteres no início do turno, ganha 1 carga. Ativa uma vez por rodada.", { ifResource: "essence", resourceMinimum: 2 }),
    4: T("Clemência Inabalável", "support", { shieldTarget: 5 }, "Quando uma técnica de apoio restaura ao menos 10 de Vida de um aliado, concede mais 5 de Defesa a ele. Ativa uma vez por rodada.", { minimumHeal: 10 })
  },
  esperanca: {
    0: T("Ainda Há Amanhã", "turnStart", { spendEssence: { resource: "ruptura", amount: 1 }, heal: 7 }, "Com 50 de Vida ou menos e pelo menos 1 Ruptura disponível, consome 1 Ruptura e recupera 7 de Vida no início do turno.", { hpAtMost: 50, resourceMinimum: 1, ifResource: "ruptura" }),
    1: T("Levantar Outra Vez", "kill", { healTeam: 4 }, "Quando elimina um inimigo, recupera 4 de Vida para cada aliado vivo. Ativa uma vez por rodada.")
  },
  verdade: {
    0: T("Nada a Esconder", "attack", { drainEssence: { resource: "essence", amount: 1 } }, "Ao atingir um inimigo Exposto que guarda Éter, remove 1 Éter da reserva adversária. Ativa uma vez por rodada.", { requiresExposed: true, enemyResource: "essence", enemyResourceMinimum: 1 }),
    1: T("Sem Disfarce", "firstHit", { generateEssence: { resource: "graca", amount: 1 } }, "Na primeira habilidade ofensiva que causa dano no combate, gera 1 Graça para a equipe.", { oncePerBattle: true })
  },
  uniao: {
    1: T("Cuidar em Conjunto", "support", { healSource: 5 }, "Quando um apoio restaura ao menos 10 de Vida de um aliado, a Tecelã recupera 5 de Vida. Ativa uma vez por rodada.", { minimumHeal: 10 }),
    3: T("Passo de Irmandade", "turnStart", { shieldTeam: 1 }, "Enquanto os três irmãos estiverem vivos, cada um concede 1 de Defesa destrutível a todo o trio no início do turno.", { requireThreeAllies: true })
  },
  criacao: {
    0: T("Ideia Persistente", "essenceSpent", { convertEssence: { from: "cinza", to: "essence", amount: 1 } }, "Uma vez por rodada, ao pagar Coringa por uma técnica, pode converter 1 Cinza disponível em Éter.", { spendResource: "random" }),
    1: T("Potência Latente", "turnStart", { spendEssence: { resource: "random", amount: 1 }, generateEssence: { resource: "ruptura", amount: 1 }, gainCharge: 1 }, "Com ao menos 2 Essências, consome 1 Essência disponível no início do turno para gerar 1 Ruptura e ganhar 1 carga.", { ifResource: "random", resourceMinimum: 2 })
  },
  "correntes-quebradas": {
    0: T("Passo que Retorna", "essenceSpent", { generateEssence: { resource: "random", amount: 1 } }, "Uma vez por rodada, ao pagar Ruptura por uma técnica, gera 1 Essência aleatória.", { spendResource: "ruptura" }),
    5: T("Tempo em Reserva", "turnStart", { convertEssence: { from: "cinza", to: "essence", amount: 1 }, gainCharge: 1 }, "Se tiver ao menos 2 Cinzas no início do turno, converte 1 em Éter e ganha 1 carga. Ativa uma vez por rodada.", { ifResource: "cinza", resourceMinimum: 2 })
  }
};
for (const [elo, revisions] of Object.entries(passiveRevisions)) {
  for (const [index, passive] of Object.entries(revisions)) rosters[elo][Number(index)].passive = passive;
}
rosters.fome[0].passive = P("Fome Crescente", "leech", 4, "afflicted", {
  healByDamageType: { physical: 4, piercing: 6, energy: 2 },
  description: "Dano perfurante restaura 6 de Vida; dano físico restaura 4 e espiritual 2. Aflição não alimenta a Fome."
});
rosters["correntes-quebradas"][7].passive = P("Fome da Penumbra", "leech", 4, "afflicted", {
  healByDamageType: { physical: 2, energy: 4, affliction: 6 },
  description: "Dano de aflição restaura 6 de Vida, espiritual 4 e físico 2. Golpes perfurantes não restauram Vida."
});

const conditionLabels = {
  bleed: "o alvo está com Sangramento", burn: "o alvo está com Queimadura", poison: "o alvo está com Veneno", decay: "o alvo está com Decadência",
  afflicted: "o alvo tem uma aflição", exposed: "o alvo está Exposto", stunned: "o alvo está Atordoado", weakened: "o alvo está Enfraquecido",
  marked: "o alvo tem uma marca sua", wounded: "o alvo tem 50 de Vida ou menos", selfWounded: "o usuário tem 50 de Vida ou menos", selfShielded: "o usuário tem Defesa", shielded: "o alvo tem Defesa"
};
export function conditionLabel(condition) { return condition?.startsWith("mark:") ? "o alvo tem a marca desta preparação" : conditionLabels[condition] || condition; }
const dotLabels = { sangramento:"Sangramento", queimadura:"Queimadura", veneno:"Veneno", decadencia:"Decadência" };
export function describeAbility(a) {
  const parts = [];
  const victim = a.target === "all-enemies" ? "a todos os inimigos" : "a um inimigo";
  if(a.damage) parts.push(`Causa ${a.damage} de dano ${a.damageType === "affliction" ? "de aflição" : a.damageType === "piercing" ? "perfurante" : a.damageType === "energy" ? "espiritual" : "físico"} ${victim}.`);
  if(a.mark) parts.push(a.markDescription || `Marca o alvo por ${a.markTurns || 3} turnos.`);
  if(a.echoLink) parts.push(`Sincroniza a Essência do usuário com a do alvo por ${a.echoLink.turns || 2} turnos; a Vida perdida pelo usuário repercute no alvo como aflição.`);
  if(a.requiresEchoLink) parts.push("Exige uma ressonância ativa com o alvo.");
  for(const dot of (a.dots||[a.dot].filter(Boolean)))parts.push(`${dotLabels[dot.tag]}: ${dot.damage} de dano de aflição por ${dot.turns} turnos.`);
  if(a.bonusIfDotTags)parts.push(`Causa +${a.bonusDamage||0} se o alvo tiver Sangramento ou Queimadura.`);
  if(a.bonusIfAnyStatus)parts.push(`Causa +${a.bonusIfAnyStatus} se o alvo tiver qualquer status.`);
  if(a.bonusIfOwnMark)parts.push(`Causa +${a.bonusDamage||0} se o alvo tiver a Marca Infernal de Nilo.`);
  if(a.damageIfPurged)parts.push(`Se remover pelo menos um buff, causa +${a.damageIfPurged} de dano.`);
  if(a.executeIfHpAtMost)parts.push(`Executa o alvo se ele terminar com ${a.executeIfHpAtMost} de Vida ou menos.`);
  if(a.spendResidueMax)parts.push(`Pode gastar até ${a.spendResidueMax} Resíduos; cada um aumenta o contra-ataque em ${a.residueCounterBonus||a.residueBonusDamage||0}.`);
  if(a.spendFracturesMax)parts.push(`Pode gastar até ${a.spendFracturesMax} Fraturas; cada uma aumenta o dano em ${a.fractureBonusDamage||0}.`);
  if(a.stealth)parts.push(`Nilo fica em Furtividade por ${a.stealth} turno.`);
  if(a.stealthBonus)parts.push(`Se Nilo estiver em Furtividade, causa +${a.stealthBonus} de dano.`);
  if(a.requiresAshExpansion)parts.push("Exige Expansão de Cinza ativa.");
  if(a.requiresAnyCollapse)parts.push("Exige um Estado de Colapso ativo.");
  if(a.activateAshExpansion)parts.push(`Ativa Expansão de Cinza por ${a.activateAshExpansion} turnos; dano +7 e custo de 5 de Vida por skill de dano.`);
  if(a.activateCollapse===1)parts.push("Abre Colapso I por 3 turnos: +6 de dano e custa 4 de Vida por skill de dano.");
  if(a.activateCollapse===2)parts.push("Abre Colapso II por 2 turnos: +10 de dano e custa 7 de Vida por skill de dano.");
  if(a.closeCollapse)parts.push("Encerra o Colapso ativo imediatamente.");
  if(a.setPillar)parts.push("Transforma o aliado em Pilar; Nilo pode manter até 2.");
  if(a.pillarJudgment)parts.push(`Se o alvo feriu um Pilar neste combate, causa +${a.pillarJudgment.bonusDamage} e o Enfraquece.`);
  if(a.requiresGraceForm)parts.push("Exige Forma de Graça ativa.");
  if(a.activateGraceForm)parts.push(`Ativa Forma de Graça por ${a.activateGraceForm} turnos.`);
  if(a.requiresPillar)parts.push("Só pode ser usado em um Pilar de Nilo.");
  if(a.requiresInterventionCharge)parts.push("Gasta 1 Carga de Intervenção.");
  if(a.markTurns&&a.mark)parts.push(`A marca permanece por ${a.markTurns} turnos.`);
  if(a.reactive?.damage)parts.push(`Se o alvo usar uma skill enquanto marcado, sofre ${a.reactive.damage} de aflição.`);
  if(a.cleanseOneAffliction)parts.push("Remove 1 aflição do usuário.");
  if(a.silenceMarkedHealing)parts.push("Inimigos com uma Marca de Nilo não recuperam Vida no próximo turno.");
  if(a.clearEchoLink)parts.push("Remove o Vínculo de Ressonância após o ataque.");
  if(a.stun) parts.push(`Atordoa por ${a.stun} turno.`);
  if(a.weaken) parts.push(`Enfraquece por ${a.weaken} turno${a.weaken > 1 ? "s" : ""} do alvo: −10 de dano causado.`);
  if(a.expose) parts.push("Expõe até o fim do próximo turno deste lado: +10 de dano recebido, exceto aflição.");
  if(a.heal) parts.push(`Restaura ${a.heal} de Vida${a.damage ? " ao usuário" : a.target === "team" ? " a cada aliado" : ""}.`);
  if(a.shield) parts.push(`Concede ${a.shield} de Defesa destrutível${a.damage ? " ao usuário" : a.target === "team" ? " ao trio" : ""}.`);
  if(a.reduce) parts.push(`Reduz em ${a.reduce} o dano recebido por 1 turno${a.damage ? " pelo usuário" : ""}.`);
  if(a.boost) parts.push(`Aumenta em ${a.boost} o dano${a.damage ? " do usuário" : ""} até o fim do próximo turno do beneficiado.`);
  if(a.counter){parts.push(`Anula a próxima habilidade inimiga ${a.counterFilter?a.counterFilter.map(t=>({physical:"física",piercing:"perfurante",energy:"espiritual",affliction:"de aflição"})[t]).join(" ou ")+" ":""}recebida e contra-ataca com ${a.counter} de dano. Dura 1 turno.`);if(a.counterRequiresShield)parts.push("Só ativa se o beneficiado ainda tiver Defesa destrutível.");if(a.counterEffect?.stealEssence)parts.push(`Ao ativar, rouba até ${a.counterEffect.stealEssence.amount||1} Essência da reserva adversária.`);if(a.counterEffect?.drainEssence)parts.push(`Ao ativar, remove até ${a.counterEffect.drainEssence.amount||1} Essência da reserva adversária.`);if(a.counterEffect?.generateEssence)parts.push(`Ao ativar, gera ${a.counterEffect.generateEssence.amount||1} ${({essence:"Éter",cinza:"Cinza",ruptura:"Ruptura",graca:"Graça",random:"Essência aleatória"})[a.counterEffect.generateEssence.resource]||"Essência"}.`);if(a.counterEffect?.expose)parts.push("Ao ativar, expõe o agressor até o fim do próximo turno.");if(a.counterEffect?.mark)parts.push("Ao ativar, marca o agressor por 2 turnos.");}
  if(a.regen) parts.push(`Regeneração: restaura ${a.regen.heal} de Vida no início dos próximos ${a.regen.turns} turnos${a.target==="team"?" de cada aliado":" do beneficiado"}.`);
  if(a.sealSupport) parts.push(`Sela técnicas de apoio por ${a.sealSupport} turno do alvo. A defesa pessoal continua disponível.`);
  if(a.sealAttack) parts.push(`Sela técnicas ofensivas por ${a.sealAttack} turno do alvo.`);
  if(a.healingBlock) parts.push(`Reduz a cura recebida em ${Math.round(a.healingBlock*100)}% até o fim do próximo turno deste lado.`);
  if(a.reduceCooldown) parts.push(`Reduz em ${a.reduceCooldown} turno as recargas não defensivas do beneficiado.`);
  if(a.ignoreCounters) parts.push("Não pode ser anulado por Contra-ataque.");
  if(a.escalating) parts.push(`Cada uso não anulado dá +${a.escalating.amount} de dano a esta técnica (máx. +${a.escalating.max}). Atordoamento zera esse bônus.`);
  if(a.missingHpDamage) parts.push(`A cada ${a.missingHpDamage.step} de Vida perdida pelo usuário: +${a.missingHpDamage.amount} de dano (máx. +${a.missingHpDamage.cap}).`);
  if(a.missingHpHeal) parts.push(`A cada ${a.missingHpHeal.step} de Vida faltante do beneficiado: +${a.missingHpHeal.amount} de cura (máx. +${a.missingHpHeal.cap}).`);
  if(a.shieldToDamage) parts.push(`Acrescenta ${Math.round(a.shieldToDamage.ratio*100)}% da Defesa do usuário ao dano (máx. +${a.shieldToDamage.cap})${a.shieldToDamage.consume?" e consome toda a sua Defesa":""}.`);
  if(a.shieldFromStripped) parts.push(`Converte ${Math.round(a.shieldFromStripped*100)}% da Defesa removida em Defesa própria (máx. 15).`);
  if(a.wardFromDamage) parts.push(`Converte ${Math.round(a.wardFromDamage*100)}% do dano real causado em Defesa própria (máx. 20 por uso).`);
  if(a.siphonToAlly) parts.push(`Restaura ao aliado proporcionalmente mais ferido ${Math.round(a.siphonToAlly*100)}% do dano real causado (máx. 15 por uso).`);
  if(a.cleanseBonusShield) parts.push(`Cada condição removida concede ${a.cleanseBonusShield} de Defesa ao beneficiado (máx. 15).`);
  if(a.purgeBonusDamage) parts.push(`Antes da remoção, cada bônus de dano, redução ou contra-ataque ativo no alvo acrescenta ${a.purgeBonusDamage} ao dano (máx. +12).`);
  if(a.reactive){const r=a.reactive,trigger={attack:"Se o alvo usar uma técnica ofensiva em sua próxima vez",support:"Se o alvo usar uma técnica de apoio em sua próxima vez",skill:"Se o alvo usar uma técnica em sua próxima vez",idle:"Se o alvo não usar nenhuma técnica em sua próxima vez",damaged:"Na próxima resposta adversária, se uma nova habilidade tirar Vida do beneficiado"}[r.trigger];const effects=[r.damage?`causa ${r.damage} de dano de aflição ${r.trigger==="damaged"?"ao agressor":"ao próprio alvo"}`:"",r.drain?`remove ${r.drain} ${r.drain===1?"unidade":"unidades"} de Essência da reserva adversária`:"",r.healSource?`restaura ${r.healSource} de Vida ao usuário`:"",r.healBoth?`restaura ${r.healBoth} de Vida ao usuário e ao beneficiado, uma vez por alma`:"",r.shieldSource?`concede ${r.shieldSource} de Defesa ao usuário`:"",r.exposeAttacker?"expõe o agressor até o fim do próximo turno do usuário":"",r.shift?"abre uma técnica alternativa para o usuário por 2 turnos":""].filter(Boolean);parts.push(`${trigger}: ${effects.join(" e ")}. Ativa uma vez.`);}
  if(a.cleanse) parts.push(`Remove aflições e condições prejudiciais${a.damage ? " do usuário" : ""}.`);
  if(a.purge) parts.push("Remove bônus de dano, redução e contra-ataque do alvo.");
  if(a.stripShield) parts.push(`Remove ${a.stripShield} de Defesa antes do dano.`);
  if(a.drain) parts.push(`Remove ${a.drain} ${a.drain===1?"unidade":"unidades"} de Essência da reserva inimiga${a.target === "all-enemies" ? " uma única vez" : ""}.`);
  if(a.steal) parts.push(`Rouba ${a.steal} ${a.steal===1?"unidade":"unidades"} de Essência da reserva inimiga.`);
  if(a.lifesteal) parts.push(`Restaura ao usuário ${Math.round(a.lifesteal*100)}% do dano causado.`);
  if(a.gainCharge) parts.push(`Ganha ${a.gainCharge} carga (máx. 3).`);
  const essenceNames={essence:'Éter',cinza:'Cinza',graca:'Graça',ruptura:'Ruptura',random:'Essência aleatória'};
  if(a.generateEssence)parts.push(`Gera ${a.generateEssence.amount||1} ${essenceNames[a.generateEssence.resource]||'Essência'} para a reserva da equipe.`);
  if(a.convertEssence){const source=a.convertEssence.from==='any'?'um tipo disponível':essenceNames[a.convertEssence.from]||'Essência';const target=a.convertEssence.to==='random'?'uma Essência aleatória de outro tipo':essenceNames[a.convertEssence.to]||'outro tipo de Essência';parts.push(`Converte ${a.convertEssence.amount||1} ${source} em ${target} na reserva da equipe.`);}
  if(a.perChargeDamage&&!a.resonantWound) parts.push(`${a.spendCharge ? "Consome as cargas:" : "Por carga:"} +${a.perChargeDamage} de dano por carga.`);
  if(a.perChargeHeal) parts.push(`Consome as cargas: +${a.perChargeHeal} de cura por carga${a.target === "team" ? " a cada aliado" : ""}.`);
  if(a.spendCharge&&!a.perChargeDamage&&!a.perChargeHeal) parts.push("Consome todas as cargas.");
  if(a.requiredMark) parts.push("Exige a marca desta preparação no alvo.");
  if(a.combo) parts.push(`Se ${conditionLabel(a.combo.condition)}: +${a.combo.bonusDamage || 0} dano${a.combo.stun ? " e Atordoa por 1 turno" : ""}${a.combo.consume ? "; consome a preparação" : ""}.`);
  if(a.resonantWound) parts.push(`O usuário perde ${a.selfDamage} de Vida, mais ${a.perChargeDamage||0} por carga consumida; a dissonância repercute no alvo ressonante.`);
  else if(a.selfDamage) parts.push(`O usuário perde ${a.selfDamage} de Vida (não o derrota).`);
  if(a.invulnerable) parts.push("O usuário fica Invulnerável a novas habilidades inimigas por 1 turno. Aflições já ativas continuam.");
  return parts.join(" ");
}
function describePassive(p) {
  if(p.description)return p.description;
  if(p.healByDamageType){const labels={physical:"físico",piercing:"perfurante",energy:"espiritual",affliction:"de aflição"};return `Após causar dano, recupera Vida conforme o tipo: ${Object.entries(p.healByDamageType).map(([type,amount])=>`${labels[type]} ${amount}`).join(", ")}.`;}
  const descriptions = {
    hunter:`Suas habilidades causam +${p.amount} de dano se ${conditionLabel(p.condition)}.`,
    leech:`Após causar dano com uma habilidade, restaura ${p.amount} de Vida.`,
    ward:`No início do seu turno, recebe ${p.amount} de Defesa destrutível.`,
    renew:`No início do seu turno, restaura ${p.amount} de Vida.`,
    support:`Após usar uma habilidade de apoio, o usuário restaura ${p.amount} de Vida.`,
    firstHit:`Sua primeira habilidade ofensiva do combate causa +${p.amount} de dano.`,
    comeback:`Com 50 de Vida ou menos, suas habilidades causam +${p.amount} de dano.`,
    retaliate:`Ao perder Vida por uma habilidade inimiga, causa ${p.amount} de dano de aflição ao agressor.`
  };
  return descriptions[p.type]||"Efeito passivo específico do personagem.";
}
export function buildCharacterKit(eloId, index, art) {
  const original = rosters[eloId]?.[index];
  const spec = original && evolveKit(eloId,index,original);
  if(!spec) throw new Error(`Kit ausente: ${eloId}/${index}`);
  const ids=["impulso","tecnica","voto","despertar"];
  const raw=[...spec.skills,A(spec.defense,0,1,{target:"self",costs:{random:1},invulnerable:1,cooldown:4,defense:true})];
  const compile=(a,i)=>{
    const costs=a.costs || (a.cost===0 ? {} : a.cost===1 ? {affinity:1} : a.cost===2 ? {affinity:1,essence:1} : {affinity:2,essence:1});
    const kind=a.defense ? "defense" : a.damage ? a.stun || a.weaken || a.mark ? "control" : "strike" : a.shield || a.counter || a.reduce ? "guard" : "support";
    const next=a.evolutionNote||a.shift?.map(t=>t.form==="base"?`Após usar, restaura ${raw[ids.indexOf(t.slot)].name}.`:`Abre ${raw[ids.indexOf(t.slot)].forms.find(f=>f.formKey===t.form)?.name}${t.turns?` por ${t.turns} turno(s)`:""}.`).join(" ")||"";
    return {...a,id:ids[i],costs,cooldown:a.cooldown||0,kind,classes:[a.damage ? a.damageType==="physical" ? "Física" : a.damageType==="piercing" ? "Perfurante" : a.damageType==="affliction" ? "Aflição" : "Espiritual" : "Estratégica",a.dot ? "Persistente" : "Instantânea"],description:[describeAbility(a),next].filter(Boolean).join(" "),art:art?.forms?.[ids[i]]?.[a.formKey] || art?.abilities[ids[i]],...(a.forms?{forms:a.forms.map(f=>compile(f,i))}:{})};
  };
  const abilities=raw.map(compile);
  return {role:spec.role,roleHint:spec.combo,combo:spec.combo,mechanic:spec.mechanic,passive:{...spec.passive,description:describePassive(spec.passive),art:art?.passive},abilities};
}
export const kitCount=Object.values(rosters).reduce((sum,list)=>sum+list.length,0);

export function allSkillForms(character){return character.abilities.flatMap(a=>[a,...(a.forms||[])]);}

