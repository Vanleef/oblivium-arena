// Presentation revisions use permanent character IDs, never a new name-derived ID.
const fullArt = new Set(['a-senhora-do-ultimo-pao','o-surdo','o-quarto-vazio']);
export const characterRevisions = {
  'o-acougueiro': {
    lore: 'Executor de Sangria: seu cutelo reconhece a essência de uma vítima ferida. Cada ferida alimenta seu faro e torna a próxima investida mais implacável.',
    terms: {'Separar Tendões':'Talho Imobilizante'}
  },
  'a-juiza-de-ferro': {
    name:'A Magistrada do Jugo', role:'Magistrada Tirânica',
    lore:'A toga do Inferno transforma autoridade em obediência. Não pesa culpa nem repara injustiças: expõe, interdita e condena quem desafia seu domínio.',
    terms:{'Peso da Lei':'Lei do Mais Forte','Acusação de Ferro':'Acusação Imposta','Audiência Suspensa':'Interdição da Defesa','Veredito Irrecorrível':'Sentença de Submissão','Sala Inviolável':'Toga Inviolável'},
    roleHint:'Imponha uma acusação para expor e selar o apoio; interrompa a resistência antes da sentença perfurante.'
  },
  'o-herdeiro-cativo': {
    name:'O Herdeiro do Jugo',role:'Tirano Herdeiro',
    lore:'Nascido das dinastias de Coroa, carrega os grilhões que usará para subjugar os próximos. A dor fortalece sua vontade de dominar, em vez de torná-lo um libertador.',
    terms:{'Vontade Cativa':'Ambição Acorrentada','Aguentar o Decreto':'Resistência do Pretendente','Sucessão Rompida':'Tomada do Trono','Brecha na Cela':'Guarda Dinástica'},
    roleHint:'Use a Vida perdida para fortalecer o punho; recupere-se ou gaste as cargas na tomada do trono.'
  },
  'o-estomago-sem-fundo': {
    name:'O Abismo Voraz',
    lore:'Uma entidade de Fome que abriga um vazio insaciável. Devora a proteção alheia e conserva cada fragmento para prolongar a própria existência.',
    terms:{'Reserva do Estômago':'Reserva Devorada','Fundo que Não Existe':'Fauce do Abismo'}
  },
  'a-senhora-do-ultimo-pao': {
    name:'A Matriarca da Escassez',role:'Soberana da Privação',
    lore:'Acumula o sustento que falta aos outros. Só alimenta os seus para conservar a dependência; cada ração concedida sustenta o poder do Elo da Fome.',
    terms:{'Última Migalha':'Lucro da Privação','Dividir o Último Pão':'Ração dos Submissos','Dívida da Mesa Vazia':'Tributo da Fome','Mesa Inviolável':'Celeiro Lacrado'},
    roleHint:'Drene recursos com a marca da privação, sustente seus aliados dependentes e cobre o tributo do alvo marcado.'
  },
  'a-balanca-vazia': {
    name:'A Usurária da Penúria',role:'Usurária Espiritual',
    lore:'Mede o valor de uma alma pelo que ainda pode extrair dela. Seu amparo é investimento; sua balança jamais devolve o que toma.',
    terms:{'Peso da Carência':'Lucro da Carência','Prato da Falta':'Cobrança da Penúria','Contrapeso Vital':'Reserva do Penhor','Fome em Equilíbrio':'Confisco Coletivo','Peso Zero':'Penhor Inalcançável'}
  },
  'o-que-observou': {
    name:'O Espectador Impassível',role:'Observador da Omissão',
    lore:'Presenciou o sofrimento e escolheu permanecer à margem. Guarda as falhas dos outros como armas, sem jamais responder aos pedidos de socorro.',
    terms:{'Olhos que Não Piscam':'Indiferença Vigilante','Registrar a Falha':'Memória da Omissão','Peso do Testemunho':'Peso da Indiferença','Resposta da Testemunha':'Retaliação do Espectador'},
    roleHint:'Registre a vítima, recuse a interferência e transforme as cargas de observação em retaliação espiritual.'
  },
  'a-porta-fechada': {
    name:'A Guardiã do Abandono',
    lore:'Decide quem ficará do lado de fora. Concede abrigo aos cúmplices enquanto transforma o desamparo alheio em um cárcere sem resposta.',
    terms:{'Lado de Dentro':'Abrigo dos Cúmplices','Tranca do Refúgio':'Guarida Seletiva','Porta Fora do Mundo':'Limiar Interdito'}
  },
  'o-surdo': {
    name:'O Silenciador',role:'Supressor de Vozes',
    lore:'Não lhe falta a capacidade de ouvir: ele escolhe extinguir a resposta. Sua presença sufoca clamores e interrompe quem tenta romper a omissão de Silêncio.',
    terms:{'Ruído Abafado':'Clamor Sufocado','Cessar do Som':'Interditar a Voz','Onda Inaudível':'Decreto do Silêncio','Som que Não Retorna':'Clamor sem Retorno'},
    roleHint:'Enfraqueça a voz inimiga, interrompa sua ação e escolha entre prolongar a aflição ou liberar o decreto.'
  },
  'a-testemunha-cega': {
    name:'A Testemunha Omissa',role:'Cúmplice do Silêncio',
    lore:'Conhece o que aconteceu e retém o testemunho quando ele faria diferença. Só revela uma abertura quando isso favorece sua própria sobrevivência.',
    terms:{'Visão sem Olhos':'Cumplicidade Velada','Presença Denunciada':'Segredo Exposto','Memória do Golpe':'Resposta Preparada','Testemunho Final':'Acusação Oportunista','Campo sem Testemunha':'Depoimento Retido'}
  },
  'o-quarto-vazio': {
    name:'O Anfitrião do Desamparo',role:'Entidade do Isolamento',
    lore:'Um hospedeiro espectral que oferece uma entrada e nega qualquer acolhimento. Sua presença projeta corredores vazios onde nenhum pedido de socorro encontra resposta.',
    terms:{'Vazio Habitado':'Hospitalidade Negada','Ausência Pesada':'Convite ao Isolamento','Quarto sem Retorno':'Estadia sem Retorno','Quarto Inacessível':'Porta do Desamparo'}
  },
  'o-que-possui': {
    name:'O Usurpador de Corpos',
    lore:'Manifesta a posse abusiva do Elo da Carne. Sua ligação espiritual impõe comandos e toma a vitalidade de quem foi marcado.',
    terms:{'Usufruto Vital':'Espoliação Vital'}
  },
  'a-costureira': {
    name:'A Suturadora de Vontades',
    lore:'Enxerga corpos e decisões como pontos que pode apertar ou desfazer. Repara seus aliados para conservar o controle e abre as costuras da vítima marcada.',
    terms:{'Linha da Reparação':'Fio do Controle','Sutura Perfeita':'Sutura de Domínio','Retirar a Sutura':'Reforçar os Pontos'},
    roleHint:'Use o fio para marcar e ferir; sustente seus aliados com suturas e desfaça os pontos da vítima no desfecho.'
  },
  'o-fim-silencioso': {
    name:'O Arauto da Extinção',
    lore:'Uma manifestação do Vazio que anuncia a perda de toda continuidade. Sua lâmina interrompe a vontade antes de extinguir a presença da vítima.',
    terms:{'Aviso do Fim':'Presságio de Extinção'}
  },
  'o-que-pesa': {
    name:'O Ponderador das Almas',
    lore:'Encara a consequência antes de julgar. Acumula o peso dos atos para deter o excesso com uma decisão proporcional, sem recorrer à opressão de Coroa.'
  },
  'o-julgador-gentil': {
    name:'O Juiz da Clemência',
    lore:'A clemência não enfraquece sua autoridade: define quando reparar e quando deter uma agressão. Sua justiça preserva a medida que os tiranos abandonaram.',
    terms:{'Gentileza Firme':'Clemência Inabalável','Advertência Serena':'Advertência do Juiz'}
  },
  'o-que-levanta': {
    name:'O Inquebrantável',
    lore:'Representa a perseverança de Esperança. Retorna ao combate e ergue um companheiro sem prometer que a travessia será indolor.'
  },
  'a-voz': {
    name:'A Voz do Alento',
    lore:'O canto dá forma à coragem que uma alma empresta à outra. A voz sustenta o trio e se multiplica quando a perseverança se torna coletiva.'
  },
  'o-olho-desarmado': {
    name:'O Vidente da Intenção',
    lore:'Revela a intenção por trás do gesto, sem confundir clareza com crueldade. Usa esse conhecimento para conter o agressor e amparar quem ficou exposto.',
    terms:{'Cuidar sem Defesa':'Amparo da Clareza','Ponto Cego Sereno':'Véu da Serenidade'}
  },
  'a-que-une': {
    name:'A Tecelã dos Vínculos',
    lore:'Tece alianças que preservam a vontade de cada alma. Seus fios unem sem tomar o controle, distinguindo a União da manipulação de Carne e Mentira.'
  },
  'o-que-cria': {
    name:'O Artífice da Gênese',
    lore:'Dá forma à matéria espiritual para preservar novas possibilidades. Cada construção pode amparar uma alma ou abrir espaço contra quem destrói.'
  },
  'a-porta-que-flutua': {
    name:'A Guardiã do Limiar',
    lore:'Uma viajante suspensa entre destinos interrompidos. Portais flutuam atrás de seus passos, ligando por um instante as margens que perderam o contato.'
  },
  'o-relogio-afogado': {
    name:'O Cronista Submerso',
    lore:'Carrega os instantes que não chegaram ao fim. Os mecanismos afogados são instrumentos de sua ruptura temporal, enquanto ele reúne e devolve segundos perdidos.'
  },
  'a-ponte-rasgada': {
    name:'A Peregrina das Margens',
    lore:'Caminha entre encontros que nunca se completaram. Reconstrói uma passagem por um instante e rompe o apoio de quem bloqueia a travessia.'
  }
};

export function revisedArtFor(id, art) {
  if (!art) return art;
  if (!fullArt.has(id) && id !== 'o-acougueiro') return art;
  const base = `/art/characters/${id}/revision-20261023`;
  const abilities = Object.fromEntries(Object.keys(art.abilities).map(slot => [slot,
    fullArt.has(id) || slot !== 'despertar' ? `${base}/skill-${slot}.webp` : art.abilities[slot]
  ]));
  return {...art, abilities, ...(fullArt.has(id) ? {portrait:`${base}/portrait.webp`,passive:`${base}/passive.webp`} : {})};
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
