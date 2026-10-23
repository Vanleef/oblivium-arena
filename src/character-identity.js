// Presentation revisions use permanent character IDs, never a new name-derived ID.
const fullArt = new Set(['a-senhora-do-ultimo-pao','o-surdo','o-quarto-vazio']);
const eloArt = new Set(['o-estomago-sem-fundo','o-equilibrio','o-menino-sem-sombra']);
const entityArt = new Set(['a-balanca-vazia','a-muralha','o-lugar-de-ninguem']);
const spiritArt = new Set(['a-pira-errante','o-jardim-morto','a-luz-que-restaura']);
const diverseArt = new Set(['o-devorador','o-ultimo-guardiao','o-eco-sem-dono']);
const spiritSlots = {
  'o-espelho-carnal':['tecnica'],
  'a-pele-alheia':['despertar'],
  'a-ultima-pagina':['voto','despertar'],
  'o-que-apaga':['impulso','voto','despertar']
};
const entitySlots = {
  'o-filho-da-cinza':['passive','tecnica','despertar'],
  'a-jardineira-das-feridas':['passive','impulso'],
  'a-guardia-das-promessas':['tecnica']
};
const personalDefenseArt = new Set(['a-mao-que-toma','o-vigia-ausente','o-desejo-quebrado','o-que-ficou']);
export const characterRevisions = {
  'o-devorador': {
    role: 'Fera da Avidez',
    lore: 'Uma fera quadrúpede de Fome, cuja voracidade não conhece saciedade. Corrói a guarda das vítimas com saliva espiritual e incorpora a essência que devora; quando ferida, sua fome ultrapassa a matéria e alcança as reservas alheias.',
    terms: {'Mandíbula do Vazio': 'Couraça Voraz'}
  },
  'o-ultimo-guardiao': {
    role: 'Sentinela Ancestral',
    lore: 'Um espírito quadrúpede abrigado em uma carapaça de pedra viva. Permanece no limiar de Proteção para que outras almas atravessem em segurança. Seu chifre marca a ameaça, e as placas de seu corpo projetam amparo antes de devolver a agressão.',
    terms: {'Lança da Guarda': 'Investida Vigilante', 'Alvorecer do Guardião': 'Revide Radiante'}
  },
  'o-eco-sem-dono': {
    role: 'Ressonância Errante',
    lore: 'Vozes que perderam sua origem no Limbo persistem numa espiral de névoa e anéis partidos. Sem rosto ou corpo humano, a aparição recolhe vibrações e devolve o que a atinge. Cada coro a desfaz um pouco, a menos que encontre uma ressonância alheia para sustentar-se.',
    terms: {}
  },
  "o-acougueiro": {
    "lore": "Executor de Sangria: seu cutelo reconhece a essência de uma vítima ferida. Cada ferida alimenta seu faro e torna a próxima investida mais implacável.",
    "terms": {
      "Separar Tendões": "Talho Imobilizante"
    }
  },
  "a-juiza-de-ferro": {
    "name": "A Magistrada",
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
    "name": "O Herdeiro",
    "role": "Tirano Herdeiro",
    "lore": "Nascido das dinastias de Coroa, carrega os grilhões que usará para subjugar os próximos. A dor fortalece sua vontade de dominar, em vez de torná-lo um libertador.",
    "terms": {
      "Vontade Cativa": "Ambição Acorrentada",
      "Aguentar o Decreto": "Resistência do Pretendente",
      "Sucessão Rompida": "Tomada do Trono",
      "Brecha na Cela": "Guarda Dinástica"
    },
    "roleHint": "Use a Vida perdida para fortalecer o punho; recupere-se ou gaste as cargas na tomada do trono."
  },
  "o-estomago-sem-fundo": {
    "name": "O Insaciável",
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
    "aliases": [
      "O Abismo",
      "O Abismo Voraz",
      "O Estômago sem Fundo"
    ]
  },
  "a-senhora-do-ultimo-pao": {
    "name": "A Matriarca",
    "role": "Soberana da Privação",
    "lore": "Acumula o sustento que falta aos outros. Só alimenta os seus para conservar a dependência; cada ração concedida sustenta o poder do Elo da Fome.",
    "terms": {
      "Última Migalha": "Lucro da Privação",
      "Dividir o Último Pão": "Ração dos Submissos",
      "Dívida da Mesa Vazia": "Tributo da Fome",
      "Mesa Inviolável": "Celeiro Lacrado"
    },
    "roleHint": "Drene recursos com a marca da privação, sustente seus aliados dependentes e cobre o tributo do alvo marcado."
  },
  "a-balanca-vazia": {
    "name": "A Usurária",
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
    "aliases": [
      "A Balança Vazia",
      "A Usurária da Penúria"
    ]
  },
  "o-que-observou": {
    "name": "O Espectador",
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
    "name": "A Carcereira",
    "lore": "Decide quem ficará do lado de fora. Concede abrigo aos cúmplices enquanto transforma o desamparo alheio em um cárcere sem resposta.",
    "terms": {
      "Lado de Dentro": "Abrigo dos Cúmplices",
      "Tranca do Refúgio": "Guarida Seletiva",
      "Porta Fora do Mundo": "Limiar Interdito"
    }
  },
  "o-surdo": {
    "name": "O Silenciador",
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
    "name": "A Cúmplice",
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
    "name": "O Anfitrião",
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
    "name": "O Usurpador",
    "lore": "Manifesta a posse abusiva do Elo da Carne. Sua ligação espiritual impõe comandos e toma a vitalidade de quem foi marcado.",
    "terms": {
      "Usufruto Vital": "Espoliação Vital"
    }
  },
  "a-costureira": {
    "name": "A Suturadora",
    "lore": "Enxerga corpos e decisões como pontos que pode apertar ou desfazer. Repara seus aliados para conservar o controle e abre as costuras da vítima marcada.",
    "terms": {
      "Linha da Reparação": "Fio do Controle",
      "Sutura Perfeita": "Sutura de Domínio",
      "Retirar a Sutura": "Reforçar os Pontos"
    },
    "roleHint": "Use o fio para marcar e ferir; sustente seus aliados com suturas e desfaça os pontos da vítima no desfecho."
  },
  "o-fim-silencioso": {
    "name": "O Arauto",
    "lore": "Uma manifestação do Vazio que anuncia a perda de toda continuidade. Sua lâmina interrompe a vontade antes de extinguir a presença da vítima.",
    "terms": {
      "Aviso do Fim": "Presságio de Extinção"
    }
  },
  "o-que-pesa": {
    "name": "O Ponderador",
    "lore": "Encara a consequência antes de julgar. Acumula o peso dos atos para deter o excesso com uma decisão proporcional, sem recorrer à opressão de Coroa."
  },
  "o-julgador-gentil": {
    "name": "O Juiz",
    "lore": "A clemência não enfraquece sua autoridade: define quando reparar e quando deter uma agressão. Sua justiça preserva a medida que os tiranos abandonaram.",
    "terms": {
      "Gentileza Firme": "Clemência Inabalável",
      "Advertência Serena": "Advertência do Juiz"
    }
  },
  "o-que-levanta": {
    "name": "O Inquebrantável",
    "lore": "Representa a perseverança de Esperança. Retorna ao combate e ergue um companheiro sem prometer que a travessia será indolor."
  },
  "a-voz": {
    "name": "A Voz",
    "lore": "O canto dá forma à coragem que uma alma empresta à outra. A voz sustenta o trio e se multiplica quando a perseverança se torna coletiva."
  },
  "o-olho-desarmado": {
    "name": "O Vidente",
    "lore": "Revela a intenção por trás do gesto, sem confundir clareza com crueldade. Usa esse conhecimento para conter o agressor e amparar quem ficou exposto.",
    "terms": {
      "Cuidar sem Defesa": "Amparo da Clareza",
      "Ponto Cego Sereno": "Véu da Serenidade"
    }
  },
  "a-que-une": {
    "name": "A Tecelã",
    "lore": "Tece alianças que preservam a vontade de cada alma. Seus fios unem sem tomar o controle, distinguindo a União da manipulação de Carne e Mentira."
  },
  "o-que-cria": {
    "name": "O Artífice",
    "lore": "Dá forma à matéria espiritual para preservar novas possibilidades. Cada construção pode amparar uma alma ou abrir espaço contra quem destrói."
  },
  "a-porta-que-flutua": {
    "name": "A Errante",
    "role": "Viajante do Limiar",
    "lore": "Sua passagem permanece suspensa entre destinos que se romperam. Encontra atalhos transitórios nas fraturas do Limbo, empresta uma saída a outra alma e perde parte da própria estabilidade quando fecha uma dessas rotas.",
    "terms": {
      "Travessia Segura": "Atalho Suspenso"
    },
    "roleHint": "Abra uma passagem, use o atalho para amparar um aliado e retorne; fechar a rota no inimigo também cobra sua Vida.",
    "aliases": [
      "A Guardiã",
      "A Guardiã do Limiar",
      "A Porta que Flutua"
    ]
  },
  "o-relogio-afogado": {
    "name": "O Cronista",
    "lore": "Carrega os instantes que não chegaram ao fim. Os mecanismos afogados são instrumentos de sua ruptura temporal, enquanto ele reúne e devolve segundos perdidos."
  },
  "a-ponte-rasgada": {
    "name": "A Peregrina",
    "lore": "Caminha entre encontros que nunca se completaram. Reconstrói uma passagem por um instante e rompe o apoio de quem bloqueia a travessia."
  },
  "a-regente-de-cinzas": {
    "name": "A Déspota",
    "role": "Comandante Tirânica",
    "lore": "Sua autoridade nasce da submissão imposta. Usa o ferro em brasa como punição exemplar e mantém seus executores de pé para prolongar o domínio de Coroa.",
    "terms": {
      "Ordem em Cinzas": "Ferro do Jugo",
      "Comando da Regente": "Ordem Absoluta",
      "Purgar a Rebelião": "Esmagar a Resistência",
      "Manto da Regência": "Privilégio Soberano"
    },
    "roleHint": "Queime a resistência com o ferro do jugo, fortaleça seus executores e castigue quem já carrega a Queimadura.",
    "aliases": [
      "A Regente de Cinzas"
    ]
  },
  "a-mao-que-toma": {
    "name": "A Saqueadora",
    "role": "Acumuladora de Espólios",
    "lore": "Converte a privação alheia em riqueza própria. Seus espólios espirituais compram proteção e vigor; o roubo só termina quando não resta mais nada a tomar.",
    "terms": {
      "Guardar o que Roubou": "Entesourar",
      "Mão Fora de Alcance": "Espólio Intocável"
    },
    "roleHint": "Roube recursos e acumule espólios; gaste as reservas para recuperar Vida ou reforçar o confisco.",
    "aliases": [
      "A Mão que Toma"
    ]
  },
  "o-medico-de-vermes": {
    "name": "O Inoculador",
    "role": "Cultivador de Parasitas",
    "lore": "Trata almas como hospedeiros de suas colônias. Mantém os cúmplices vivos para perpetuar a infestação e extrai vitalidade dos contaminados, espalhando a corrupção de Podridão.",
    "terms": {
      "Cuidado Decomposto": "Simbiose Corrupta",
      "Sutura de Vermes": "Hospedeiro Renovado"
    },
    "roleHint": "Inocule Veneno para drenar o inimigo; conserve seus hospedeiros aliados com limpeza e regeneração.",
    "aliases": [
      "O Médico de Vermes"
    ]
  },
  "o-vigia-ausente": {
    "name": "O Desertor",
    "role": "Predador da Omissão",
    "lore": "Abandonou deliberadamente quem deveria guardar. Agora espera que uma alma fique sem auxílio para atacar pela retaguarda; sua lanterna só se acende quando o socorro já foi negado.",
    "terms": {
      "Vigília Tardia": "Oportunismo",
      "Vigia na Sombra": "Espera Cúmplice",
      "Chegar Depois": "Cobrar o Abandono",
      "Chegada pela Retaguarda": "Golpe da Retaguarda"
    },
    "roleHint": "Explore a guarda abandonada; anular uma agressão abre um golpe de retaguarda contra o responsável.",
    "aliases": [
      "O Vigia Ausente"
    ]
  },
  "o-desejo-quebrado": {
    "name": "O Profanador",
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
    "aliases": [
      "O Desejo Quebrado"
    ]
  },
  "o-menino-sem-sombra": {
    "name": "O Desolador",
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
    "aliases": [
      "O Menino sem Sombra"
    ]
  },
  "o-que-ficou": {
    "name": "O Abnegado",
    "role": "Protetor Sacrificial",
    "lore": "Escolhe permanecer quando recuar seria mais seguro. Sua força vem do amparo que oferece: cede parte do próprio fôlego para manter outra alma protegida e sustenta a linha enquanto alguém precisar atravessar.",
    "terms": {
      "Lugar ao Meu Lado": "Amparo Abnegado",
      "Eu Ainda Estou Aqui": "Permanecer de Pé"
    },
    "roleHint": "Ceda parte da sua Vida para amparar um aliado e sustente-se na resposta ofensiva, mais forte quando ferido.",
    "aliases": [
      "O que Ficou"
    ]
  },
  "o-equilibrio": {
    "name": "O Árbitro",
    "role": "Árbitro da Reparação",
    "lore": "Um constructo espiritual que mede o dano antes de intervir. Sua vara de medida delimita a reparação e interrompe o excesso; sua autoridade serve ao equilíbrio de Justiça, sem exigir submissão.",
    "terms": {
      "Prato da Misericórdia": "Amparo Equânime",
      "Reparação do Veredito": "Resposta Equânime",
      "Equação da Justiça": "Veredito Proporcional",
      "Balança Imóvel": "Posição Inviolável"
    },
    "roleHint": "Exponha o excesso, ofereça amparo e abra a resposta equânime; o veredito perfurante pune a abertura revelada.",
    "aliases": [
      "O Equilíbrio"
    ]
  },
  "o-trono-vazio": {
    "name": "O Suserano",
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
    "aliases": [
      "O Trono Vazio"
    ]
  },
  "o-filho-da-cinza": {
    "name": "O Ressentido",
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
    "aliases": [
      "O Filho da Cinza"
    ]
  },
  "o-lugar-de-ninguem": {
    "name": "O Obliterador",
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
    "aliases": [
      "O Lugar de Ninguém"
    ]
  },
  "a-muralha": {
    "name": "A Muralha",
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
    "name": "A Boticária",
    "role": "Herborista Espiritual",
    "lore": "Conhece o que cada alma precisa para recuperar o fôlego. Extrai remédios de raízes e flores espirituais para tratar feridas; seus espinhos contêm a agressão enquanto a convalescença devolve vigor ao grupo.",
    "terms": {
      "Jardim da Convalescença": "Remédio Perene",
      "Raiz que Cuida": "Raiz Contundente",
      "Flores de Convalescença": "Infusão Restauradora",
      "Espinhos da Proteção": "Espinhos Sedativos"
    },
    "roleHint": "Prepare as raízes para acumular reservas; use a infusão para recuperar o trio ou os espinhos para enfraquecer um agressor.",
    "aliases": [
      "A Jardineira das Feridas"
    ]
  },
  "a-luz-nua": {
    "name": "A Lúcida",
    "role": "Desveladora de Enganos",
    "lore": "Reconhece a forma verdadeira sob as vantagens fabricadas. Sua claridade desmonta disfarces e revela o ponto que uma mentira tentava esconder; age para restituir clareza, sem fazer da revelação um ato de crueldade.",
    "terms": {
      "Toque da Luz Nua": "Foco da Clareza",
      "Despir a Guarda": "Desvelar a Guarda"
    },
    "roleHint": "Revele uma marca, remova a guarda e as vantagens do alvo; o clarão concentra dano no inimigo que você marcou.",
    "aliases": [
      "A Luz Nua"
    ]
  },
  "a-cartografa-da-clareza": {
    "name": "A Cartógrafa",
    "role": "Guia da Clareza",
    "lore": "Traça o caminho que permanece quando os desvios falsos são retirados. Suas cartas não criam territórios: revelam passagens, intenções e pontos vulneráveis, permitindo que outras almas avancem sem engano.",
    "terms": {},
    "roleHint": "Trace a abertura e revele o atalho de amparo; reúna as cargas para concentrar a convergência no inimigo.",
    "aliases": [
      "A Cartógrafa da Clareza"
    ]
  },
  "a-guardia-das-promessas": {
    "name": "A Juramentada",
    "role": "Fiadora de Alianças",
    "lore": "Dá força a compromissos assumidos livremente entre almas. Se um companheiro é ferido sob sua palavra, ela responde renovando o amparo; o juramento une vontades, sem tomar a liberdade de nenhuma delas.",
    "terms": {
      "Juramento Gravado": "Selo do Juramento",
      "Guardar a Palavra": "Honrar o Pacto",
      "Cumprir a Palavra": "Renovar o Pacto",
      "Cobrança do Juramento": "Resposta do Juramento"
    },
    "roleHint": "Honre o pacto com um aliado; se ele perder Vida durante a resposta inimiga, abra a renovação do amparo.",
    "aliases": [
      "A Guardiã das Promessas"
    ]
  },
  "a-pira-errante": {
    "name": "A Vingadora",
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
    "aliases": [
      "A Pira Errante"
    ]
  },
  "o-jardim-morto": {
    "name": "O Definhador",
    "role": "Semeador da Ruína",
    "lore": "Espalha raízes que roubam vigor e corrompem a matéria espiritual. Seus cúmplices se abrigam na trama necrosada, enquanto cada agressão alimenta uma resposta corrosiva; sua vontade é fazer Podridão avançar sobre o que ainda resiste.",
    "terms": {
      "Raiz sob a Pele": "Seiva Corrosiva",
      "Solo Contaminado": "Trama Necrosada",
      "Jardim do Fim": "Definhar",
      "Entre Raízes Mortas": "Casca Inviolável"
    },
    "roleHint": "Aplique Decadência, envolva o trio na trama e devolva parte da agressão em aflição; o definhar coletivo enfraquece inimigos contaminados.",
    "aliases": [
      "O Jardim Morto"
    ]
  },
  "a-luz-que-restaura": {
    "name": "A Sanadora",
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
    "aliases": [
      "A Luz que Restaura"
    ]
  },
  "o-espelho-carnal": {
    "name": "O Simulacro",
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
    "aliases": [
      "O Espelho Carnal"
    ]
  },
  "a-pele-alheia": {
    "name": "A Metamorfa",
    "role": "Usurpadora de Formas",
    "lore": "Faz da própria pele um instrumento de invasão. Incorpora formas que tomou de outras almas, alterna proteção e lâmina e descarta cada molde assim que ele deixa de servir à sua vontade de dominar.",
    "terms": {
      "Pele que Aprende": "Adaptação Predatória",
      "Lâmina de Epiderme": "Gume Mutável",
      "Lâmina da Pele Nova": "Gume Transfigurado",
      "Camada Substituta": "Pele Usurpada",
      "Descartar a Forma": "Descartar o Molde",
      "Forma de Retaliação": "Instinto de Revide",
      "Troca de Pele": "Corpo Substituto"
    },
    "roleHint": "Assuma a pele usurpada para trocar a lâmina e a técnica; descarte o molde para recuperar Vida e retomar a forma anterior.",
    "aliases": [
      "A Pele Alheia"
    ]
  },
  "a-ultima-pagina": {
    "name": "A Escriba",
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
    "aliases": [
      "A Última Página"
    ]
  },
  "o-que-apaga": {
    "name": "O Anulador",
    "role": "Anulador de Vantagens",
    "lore": "Remove o que permite a uma alma sustentar a própria resistência. Dissolve guarda e vantagens, deixa uma marca sobre o que restou e concentra a anulação final nesse vestígio, ampliando o apagamento de Vazio.",
    "terms": {
      "Nada se Sustenta": "Vantagem Negada",
      "Traço Apagado": "Marca da Anulação",
      "Ausência Definitiva": "Anulação Definitiva",
      "Branco sobre a Guarda": "Dissolver a Guarda"
    },
    "roleHint": "Marque e remova vantagens; a preparação abre uma anulação exclusiva contra a mesma vítima, enquanto a segunda técnica dissolve Defesa.",
    "aliases": [
      "O que Apaga"
    ]
  },
  "a-alma-em-suspenso": {
    "name": "O Ancorado",
    "role": "Âncora Vital",
    "lore": "Uma alma retida num instante que não terminou. Reúne fôlego nas fraturas do Limbo e o prende a outra presença, cedendo parte da própria integridade; ao soltar a âncora, converte a reserva acumulada em ruptura.",
    "terms": {
      "Fôlego no Limiar": "Âncora Persistente",
      "Prender o Último Fôlego": "Ancorar o Fôlego"
    },
    "roleHint": "Acumule três cargas para emprestar fôlego a um aliado ou gaste a reserva na ruptura; ancorar e soltar a âncora também cobra sua Vida.",
    "aliases": [
      "A Alma em Suspenso"
    ]
  },
  "a-praga-andante": {
    "name": "A Praga Andante",
    "role": "Vetor Espiritual",
    "lore": "Escolhe cada caminho pela quantidade de almas que pode contaminar. O contágio espalhado alimenta sua própria vitalidade e retorna concentrado à vítima já envenenada, propagando Podridão por onde passa.",
    "terms": {},
    "roleHint": "Espalhe Veneno e concentre o contágio na forma de retorno; a crise pestilenta interrompe uma vítima já contaminada.",
    "aliases": []
  }
};

export function revisedArtFor(id, art) {
  if (!art) return art;
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
