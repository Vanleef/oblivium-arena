// Presentation revisions use permanent character IDs, never a new name-derived ID.
const fullArt = new Set(['a-senhora-do-ultimo-pao','o-surdo','o-quarto-vazio']);
const eloArt = new Set(['o-estomago-sem-fundo','o-equilibrio','o-menino-sem-sombra']);
const personalDefenseArt = new Set(['a-mao-que-toma','o-vigia-ausente','o-desejo-quebrado','o-que-ficou']);
export const characterRevisions = {
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
    "role": "Usurária Espiritual",
    "lore": "Mede o valor de uma alma pelo que ainda pode extrair dela. Seu amparo é investimento; sua balança jamais devolve o que toma.",
    "terms": {
      "Peso da Carência": "Lucro da Carência",
      "Prato da Falta": "Cobrança da Penúria",
      "Contrapeso Vital": "Reserva do Penhor",
      "Fome em Equilíbrio": "Confisco Coletivo",
      "Peso Zero": "Penhor Inalcançável"
    }
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
  }
};

export function revisedArtFor(id, art) {
  if (!art) return art;
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
