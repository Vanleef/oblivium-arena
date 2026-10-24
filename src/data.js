const inferno = [
  {
    id: "sangria", name: "Sangria", realm: "Inferno", theme: "Sangue, lâminas e carnificina", strength: "Máxima",
    symbol: "✦", color: "blood", forms: ["O Açougueiro", "A Viúva Escarlate", "O Colecionador de Cabeças", "Gêmeos do Cutelo", "O Carrasco sem Rosto", "A Mãe Rubra"],
    moves: ["Corte Rubro", "Marca do Açougue", "Rasgo Escarlate", "Maré de Sangue"], passive: "Ferida Aberta",
    flavor: "A violência extrema alimenta este Elo. Cada golpe deixa uma marca que torna o próximo mais perigoso."
  },
  {
    id: "coroa", name: "Coroa", realm: "Inferno", theme: "Tirania, correntes e domínio", strength: "Máxima",
    symbol: "♜", color: "crown", forms: ["O Soberano Quebrado", "A Juíza de Ferro", "O Trono Vazio", "O Príncipe das Correntes", "A Regente de Cinzas", "O Herdeiro Cativo"],
    moves: ["Ordem de Ferro", "Grilhões do Trono", "Decreto de Submissão", "Coroação Tirânica"], passive: "Peso da Autoridade",
    flavor: "O domínio cresce com cada ato de opressão. Correntes invisíveis pesam sobre quem resiste."
  },
  {
    id: "mentira", name: "Mentira", realm: "Inferno", theme: "Traição, ilusão e veneno", strength: "Alta",
    symbol: "◇", color: "mirror", forms: ["O Sussurro", "A Máscara Dupla", "O Tecelão de Mentiras", "A Boca de Vidro", "O Falso Profeta", "O Corretor de Memórias"],
    moves: ["Véu Duplo", "Espelho Falso", "Voz Plantada", "Grande Engodo"], passive: "Rosto Oculto",
    flavor: "Um reflexo nunca mostra a intenção inteira. Veneno e engano abrem brechas na defesa."
  },
  {
    id: "chama", name: "Chama", realm: "Inferno", theme: "Ódio, vingança e fogo negro", strength: "Alta",
    symbol: "♨", color: "ember", forms: ["O Incendiário", "A Brasa Eterna", "O Ódio Encarnado", "O Filho da Cinza", "A Pira Errante", "O Coração em Fúria"],
    moves: ["Faísca de Ódio", "Brasa Ascendente", "Fogo Punitivo", "Manto de Cinzas"], passive: "Combustão",
    flavor: "Raiva alimenta a chama escura. A força vem depressa e sempre cobra um preço."
  },
  {
    id: "fome", name: "Fome", realm: "Inferno", theme: "Ganância, consumo e corrosão", strength: "Alta",
    symbol: "◉", color: "hunger", forms: ["O Devorador", "A Mão que Toma", "O Estômago sem Fundo", "A Senhora do Último Pão", "O Credor", "A Balança Vazia"],
    moves: ["Mordida Voraz", "Dívida de Carne", "Mão de Cobrança", "Banquete sem Fim"], passive: "Dívida de Essência",
    flavor: "A exploração transforma tudo em recurso. O que é roubado fortalece quem toma."
  },
  {
    id: "podridao", name: "Podridão", realm: "Inferno", theme: "Corrupção, decadência e praga", strength: "Média-alta",
    symbol: "✹", color: "rot", forms: ["O Apodrecido", "A Praga Andante", "O Corrupto", "A Rainha dos Fungos", "O Médico de Vermes", "O Jardim Morto"],
    moves: ["Toque Mofado", "Nuvem de Praga", "Raiz Apodrecida", "Epidemia Negra"], passive: "Esporos Persistentes",
    flavor: "A decadência se espalha devagar e não poupa quem acredita estar distante."
  },
  {
    id: "silencio", name: "Silêncio", realm: "Inferno", theme: "Omissão, abandono e vazio", strength: "Média-alta",
    symbol: "◌", color: "silence", forms: ["O que Observou", "A Porta Fechada", "O Surdo", "A Testemunha Cega", "O Quarto Vazio", "O Vigia Ausente"],
    moves: ["Olhar Omitido", "Vácuo Mudo", "Porta Fechada", "Apagamento de Voz"], passive: "Ninguém Responde",
    flavor: "A omissão pesa como uma sentença. O silêncio interrompe planos e reduz o ímpeto inimigo."
  },
  {
    id: "carne", name: "Carne", realm: "Inferno", theme: "Abuso, desejo corrupto e deformação", strength: "Média",
    symbol: "⌘", color: "flesh", forms: ["O que Possui", "A Pele Alheia", "O Desejo Quebrado", "A Marionetista de Nervos", "O Espelho Carnal", "A Costureira"],
    moves: ["Laço de Tendão", "Pele Tomada", "Pulso Convulso", "Forma Deformada"], passive: "Corpo Mutável",
    flavor: "Este Elo corrompe a forma e rouba o controle. Sua força exige proximidade e cautela."
  },
  {
    id: "vazio", name: "Vazio", realm: "Inferno", theme: "Niilismo, desespero e apagamento", strength: "Especial",
    symbol: "◍", color: "void", forms: ["O que Apaga", "A Ausência", "O Fim Silencioso", "O Menino sem Sombra", "A Última Página", "O Lugar de Ninguém"],
    moves: ["Estilhaço Nulo", "Frio Abissal", "Fenda de Ausência", "Extinção Branca"], passive: "Nada Permanece",
    flavor: "O desespero contagioso apaga certezas. Este Elo é raro, instável e temido pelos outros."
  }
];

const paradise = [
  {
    id: "protecao", name: "Proteção", realm: "Paraíso", theme: "Sacrifício, defesa e amparo", strength: "Elevada",
    symbol: "⬡", color: "guard", forms: ["O Escudo Vivo", "A Muralha", "O que Ficou", "O Último Guardião", "A Sentinela Azul"],
    moves: ["Muralha de Luz", "Voto de Amparo", "Escudo Compartilhado", "Fortaleza Dourada"], passive: "Ficarei Aqui",
    flavor: "Quem escolhe proteger fortalece a corrente de todos. A defesa abre espaço para a resposta."
  },
  {
    id: "cura", name: "Cura", realm: "Paraíso", theme: "Restauração, compaixão e cuidado", strength: "Elevada",
    symbol: "✚", color: "healing", forms: ["A Mão que Cura", "O Restaurador", "A Luz que Restaura", "A Jardineira das Feridas", "O Pulso Sereno"],
    moves: ["Toque Restaurador", "Pulso Sereno", "Luz Recomposta", "Círculo de Renovação"], passive: "A Dor é Vista",
    flavor: "A compaixão age sem apagar o sofrimento. Cada restauração devolve fôlego ao trio."
  },
  {
    id: "justica", name: "Justiça", realm: "Paraíso", theme: "Equilíbrio, julgamento e ordem", strength: "Elevada",
    symbol: "⚖", color: "justice", forms: ["O Equilíbrio", "A Lâmina Justa", "O que Pesa", "A Testemunha Íntegra", "O Julgador Gentil"],
    moves: ["Balança Clara", "Veredito Equânime", "Lâmina de Princípio", "Sentença do Alvorecer"], passive: "Medida Justa",
    flavor: "A justiça verdadeira pondera as consequências. A força responde ao excesso, não ao medo."
  },
  {
    id: "esperanca", name: "Esperança", realm: "Paraíso", theme: "Perseverança, fé e inspiração", strength: "Elevada",
    symbol: "☼", color: "hope", forms: ["A Chama que Não Apaga", "O que Levanta", "A Voz", "O Portador da Aurora", "A Mensageira do Amanhã"],
    moves: ["Brasa da Aurora", "Voz que Levanta", "Passo Perseverante", "Chama Imorredoura"], passive: "Ainda Há Amanhã",
    flavor: "A esperança não promete facilidade. Ela mantém o trio de pé quando o caminho fecha."
  },
  {
    id: "verdade", name: "Verdade", realm: "Paraíso", theme: "Honestidade, revelação e clareza", strength: "Elevada",
    symbol: "✧", color: "truth", forms: ["O que Revela", "A Luz Nua", "O Espelho", "A Cartógrafa da Clareza", "O Olho Desarmado"],
    moves: ["Reflexo Limpo", "Luz sem Véu", "Palavra Íntegra", "Revelação Plena"], passive: "Nada a Esconder",
    flavor: "A clareza revela pontos fracos e rompe ilusões sem transformar a verdade em crueldade."
  },
  {
    id: "uniao", name: "União", realm: "Paraíso", theme: "Aliança, lealdade e comunidade", strength: "Elevada",
    symbol: "∞", color: "union", forms: ["O Elo Dourado", "A que Une", "O Vínculo", "Os Três Irmãos", "A Guardiã das Promessas"],
    moves: ["Laço Dourado", "Promessa Partilhada", "Roda de Aliança", "Círculo Inquebrável"], passive: "Ninguém Luta Só",
    flavor: "A lealdade faz da equipe uma única corrente. O vínculo converte cooperação em poder."
  },
  {
    id: "criacao", name: "Criação", realm: "Paraíso", theme: "Inovação, vida e preservação", strength: "Elevada",
    symbol: "❋", color: "creation", forms: ["O que Cria", "A Semente", "O Cultivador", "A Arquiteta Verde", "O Primeiro Canto"],
    moves: ["Semente Viva", "Ramo Ascendente", "Forma Nascente", "Jardim de Luz"], passive: "Vida que Prossegue",
    flavor: "Criar é preservar possibilidades. A vida encontra novas formas mesmo entre ruínas."
  }
];

const limbo = [{
  id: "correntes-quebradas", name: "Correntes Quebradas", shortName: "Quebradas", realm: "Limbo", theme: "Instabilidade, risco e ruptura", strength: "Imprevisível",
  symbol: "⟲", color: "limbo", forms: ["O Passo Interrompido", "A Linha Partida", "O Eco sem Dono", "A Porta que Flutua", "O Nome Esquecido", "O Relógio Afogado", "A Asa Invertida", "O Andarilho de Vidro", "A Sombra Inconstante", "A Ponte Rasgada", "A Alma em Suspenso"],
  moves: ["Fissura Inesperada", "Passo Fora do Tempo", "Ruptura de Eco", "Retorno Impossível"], passive: "Ressonância Errática",
  flavor: "As almas deste reino carregam correntes instáveis. Toda ruptura pode virar poder, com risco real para quem a invoca."
}];

export const resources = [
  { id: "essence", name: "Essência", shortName: "Essência", icon: "◈", color: "essence" },
  { id: "cinza", name: "Cinza", shortName: "Cinza", icon: "✹", color: "inferno" },
  { id: "graca", name: "Graça", shortName: "Graça", icon: "✧", color: "paraiso" },
  { id: "ruptura", name: "Ruptura", shortName: "Ruptura", icon: "⟲", color: "limbo" }
];

export const difficulties = [
  { id: "story", name: "Travessia", mark: "◇", description: "Para conhecer o combate. A oposição usa ataques básicos e causa menos dano.", enemyHealth: 0.9, enemyDamage: 0.88, startingEssence: 0, startingAffinity: 0, aiLevel: 0, rewardMultiplier: 0.75 },
  { id: "veteran", name: "Veterano", mark: "⚔", description: "Desafio equilibrado. A IA escolhe alvos vulneráveis e técnicas eficientes.", enemyHealth: 1, enemyDamage: 1, startingEssence: 1, startingAffinity: 1, aiLevel: 1, rewardMultiplier: 1 },
  { id: "doomed", name: "Difícil", mark: "⛨", description: "A oposição protege aliados, cura feridos e coordena ataques para derrubar um alvo.", enemyHealth: 1.1, enemyDamage: 1.08, startingEssence: 1, startingAffinity: 1, aiLevel: 2, rewardMultiplier: 1.25 },
  { id: "agony", name: "Agonia", mark: "☠", description: "IA especialista, recursos iniciais extras e Guardiões mais resistentes e letais.", enemyHealth: 1.16, enemyDamage: 1.1, startingEssence: 2, startingAffinity: 1, aiLevel: 3, rewardMultiplier: 1.5 }
];

export const resourceById = Object.fromEntries(resources.map((resource) => [resource.id, resource]));
export const realmResource = { Inferno: "cinza", "Paraíso": "graca", Limbo: "ruptura" };

const starterArt = {
  "O Escudo Vivo": {
    portrait: "/art/characters/o-escudo-vivo/portrait.webp",
    passive: "/art/characters/o-escudo-vivo/passive.webp",
    abilities: {
      impulso: "/art/characters/o-escudo-vivo/skill-impulso.webp",
      tecnica: "/art/characters/o-escudo-vivo/skill-tecnica.webp",
      voto: "/art/characters/o-escudo-vivo/skill-voto.webp",
      despertar: "/art/characters/o-escudo-vivo/skill-despertar.webp"
    }
  },
  "A Brasa Eterna": {
    portrait: "/art/characters/a-brasa-eterna/portrait.webp",
    passive: "/art/characters/a-brasa-eterna/passive.webp",
    abilities: {
      impulso: "/art/characters/a-brasa-eterna/skill-impulso.webp",
      tecnica: "/art/characters/a-brasa-eterna/skill-tecnica.webp",
      voto: "/art/characters/a-brasa-eterna/skill-voto.webp",
      despertar: "/art/characters/a-brasa-eterna/skill-despertar.webp"
    }
  },
  "O Passo Interrompido": {
    portrait: "/art/characters/o-passo-interrompido/portrait.webp",
    passive: "/art/characters/o-passo-interrompido/passive.webp",
    abilities: {
      impulso: "/art/characters/o-passo-interrompido/skill-impulso.webp",
      tecnica: "/art/characters/o-passo-interrompido/skill-tecnica.webp",
      voto: "/art/characters/o-passo-interrompido/skill-voto.webp",
      despertar: "/art/characters/o-passo-interrompido/skill-despertar.webp"
    }
  }
};

const illustratedCharacterIds = new Set([
  "o-acougueiro", "a-viuva-escarlate", "o-colecionador-de-cabecas", "gemeos-do-cutelo",
  "o-carrasco-sem-rosto", "a-mae-rubra", "o-soberano-quebrado", "a-juiza-de-ferro",
  "o-trono-vazio", "o-principe-das-correntes", "a-regente-de-cinzas", "o-herdeiro-cativo",
  "o-sussurro", "a-mascara-dupla", "o-tecelao-de-mentiras", "a-boca-de-vidro",
  "o-falso-profeta", "o-corretor-de-memorias", "o-incendiario", "o-odio-encarnado",
  "o-filho-da-cinza", "a-pira-errante", "o-coracao-em-furia", "o-devorador", "a-mao-que-toma",
  "o-estomago-sem-fundo", "a-senhora-do-ultimo-pao", "o-credor", "a-balanca-vazia",
  "o-apodrecido", "a-praga-andante", "o-corrupto", "a-rainha-dos-fungos", "o-medico-de-vermes",
  "o-jardim-morto", "o-que-observou", "a-porta-fechada", "o-surdo", "a-testemunha-cega",
  "o-quarto-vazio", "o-vigia-ausente", "o-que-possui", "a-pele-alheia", "o-desejo-quebrado",
  "a-marionetista-de-nervos", "o-espelho-carnal", "a-costureira", "o-que-apaga", "a-ausencia",
  "o-fim-silencioso", "o-menino-sem-sombra", "a-ultima-pagina", "o-lugar-de-ninguem",
  "a-muralha", "o-que-ficou", "o-ultimo-guardiao", "a-sentinela-azul",
  "a-mao-que-cura", "o-restaurador", "a-luz-que-restaura", "a-jardineira-das-feridas", "o-pulso-sereno",
  "o-equilibrio", "a-lamina-justa", "o-que-pesa", "a-testemunha-integra", "o-julgador-gentil",
  "a-mensageira-do-amanha", "o-que-revela", "o-olho-desarmado", "a-guardia-das-promessas"
]);

const roleCycle = [
  { name: "Vanguarda", kind: "strike", hint: "abre caminho com dano direto" },
  { name: "Controlador", kind: "control", hint: "desorganiza o turno inimigo" },
  { name: "Guardião", kind: "guard", hint: "segura a linha quando o trio vacila" },
  { name: "Apoio", kind: "support", hint: "mantém o grupo em combate" },
  { name: "Duelista", kind: "strike", hint: "pressiona um alvo com precisão" },
  { name: "Ruptor", kind: "burst", hint: "concentra poder num golpe decisivo" }
];

function slug(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function artForCharacter(name) {
  if (starterArt[name]) return starterArt[name];
  const id = slug(name);
  if (!illustratedCharacterIds.has(id)) return null;
  const base = `/art/characters/${id}`;
  return {
    portrait: `${base}/portrait.webp`,
    passive: `${base}/passive.webp`,
    abilities: {
      impulso: `${base}/skill-impulso.webp`,
      tecnica: `${base}/skill-tecnica.webp`,
      voto: `${base}/skill-voto.webp`,
      despertar: `${base}/skill-despertar.webp`
    }
  };
}

function characterFrom(elo, name, index) {
  const role = roleCycle[index % roleCycle.length];
  const epithet = name.replace(/^(O|A|Os|As)\s+/i, "").split(" ").slice(0, 2).join(" ");
  const starterNames = ["O Escudo Vivo", "A Brasa Eterna", "O Passo Interrompido"];
  const starter = starterNames.includes(name);
  const moves = elo.moves;
  const risky = elo.realm === "Limbo" || (elo.realm === "Inferno" && ["Chama", "Sangria", "Vazio"].includes(elo.name));
  const eloArticle = ["Vazio", "Silêncio"].includes(elo.name) ? "do Elo do " : "do Elo da ";
  const affinity = realmResource[elo.realm];
  const affinityName = resourceById[affinity].shortName;
  const art = artForCharacter(name);
  const tacticalKind = index % 2 ? "control" : "strike";
  const thirdKind = ["guard", "support", "control", "strike"][index % 4];
  const thirdDescriptions = {
    guard: "Ergue uma proteção para o trio.",
    support: "Recupera Vida do aliado mais ferido e reforça sua guarda.",
    control: "Atinge e enfraquece um inimigo por uma ação.",
    strike: "Golpe tático de dano direto contra um inimigo."
  };
  const teamGuard = role.name === "Guardião" || role.name === "Apoio" || index % 3 === 0;
  const abilities = [
    {
      id: "impulso", name: moves[0] + " · " + epithet, kind: "strike", cost: 0, costs: {},
      damage: 18 + (index % 3), target: "enemy", description: "Ataque básico; gera 1 de Essência.", art: art?.abilities.impulso
    },
    {
      id: "tecnica", name: moves[1] + " de " + epithet, kind: tacticalKind, cost: 1, costs: { affinity: 1 },
      damage: 24 + (index % 4), target: "enemy", description: `${role.hint}; custa 1 ${affinityName}.`, art: art?.abilities.tecnica
    },
    {
      id: "voto", name: moves[2] + " · " + epithet, kind: thirdKind, cost: 2, costs: { essence: 1, affinity: 1 },
      damage: 17 + (index % 3), shield: 16 + (index % 5), target: "team",
      description: `${thirdDescriptions[thirdKind]} Custa 1 Essência + 1 ${affinityName}.`, art: art?.abilities.voto
    },
    {
      id: "despertar", name: moves[3] + " de " + epithet, kind: "guard", cost: 2, costs: { affinity: 2 },
      damage: 0, shield: 20 + (index % 5), target: teamGuard ? "team" : "self",
      description: `Técnica defensiva: ${teamGuard ? "protege o trio" : "protege o usuário"}. Custa 2 ${affinityName}.`, art: art?.abilities.despertar
    }
  ];
  return {
    id: slug(name),
    name,
    realm: elo.realm,
    elo: elo.name,
    eloId: elo.id,
    title: role.name + " " + eloArticle + elo.name,
    role: role.name,
    roleHint: role.hint,
    indexInElo: index,
    color: elo.color,
    symbol: elo.symbol,
    affinity,
    art: art ? { portrait: art.portrait, passive: art.passive } : null,
    maxHp: 100,
    starter,
    unlockedByDefault: starter,
    passive: {
      name: elo.passive,
      art: art?.passive,
      description: elo.realm === "Limbo"
        ? "Uma vez por combate, seu primeiro golpe especial causa dano extra e a Corrente Quebrada também fere o próprio usuário."
        : elo.realm === "Paraíso"
          ? "Na primeira vez que um aliado cai abaixo de 40 de Vida, concede 10 de escudo ao trio."
          : "Seu primeiro golpe certeiro no combate gera 1 de Essência para a equipe."
    },
    abilities,
    flavor: elo.flavor,
    risk: risky
  };
}

export const elos = [...inferno, ...paradise, ...limbo];
export function getElo(eloId) {
  return elos.find((elo) => elo.id === eloId) || elos[0];
}
export const realms = [
  {
    id: "inferno", name: "Inferno", title: "Os Nove Elos da Maldade",
    description: "Reinos alimentados pelos atos de maldade praticados entre os vivos.", color: "inferno",
    elos: inferno
  },
  {
    id: "paraiso", name: "Paraíso", title: "Os Sete Elos da Bondade",
    description: "Reinos fortalecidos por atos de bondade, cuidado e coragem.", color: "paraiso",
    elos: paradise
  },
  {
    id: "limbo", name: "Limbo", title: "O Elo Quebrado",
    description: "Um território instável entre os reinos, atravessado por Correntes Quebradas.", color: "limbo",
    elos: limbo
  }
];

export const characters = elos.flatMap((elo) => elo.forms.map((name, index) => characterFrom(elo, name, index)));
export const characterById = Object.fromEntries(characters.map((character) => [character.id, character]));
export const starters = characters.filter((character) => character.starter);
export const rosterCounts = {
  Inferno: characters.filter((character) => character.realm === "Inferno").length,
  Paraíso: characters.filter((character) => character.realm === "Paraíso").length,
  Limbo: characters.filter((character) => character.realm === "Limbo").length
};

export const routeStages = [
  [
    { id: "normal", label: "Combate", icon: "⚔", desc: "Um trio patrulha a trilha." },
    { id: "event", label: "Encontro", icon: "✦", desc: "Uma alma pede ajuda." }
  ],
  [
    { id: "normal", label: "Combate", icon: "⚔", desc: "Um trio patrulha a trilha." },
    { id: "upgrade", label: "Aprimoramento", icon: "⬆", desc: "Escolha 1 entre 3 ecos." },
    { id: "treasure", label: "Tesouro", icon: "◇", desc: "Essência e fragmentos antigos." }
  ],
  [
    { id: "elite", label: "Elite", icon: "◆", desc: "Um trio de guardas reforçados." },
    { id: "repair", label: "Reparo", icon: "⟲", desc: "Restaure uma Corrente da Alma." }
  ],
  [
    { id: "event", label: "Encontro", icon: "✦", desc: "Decida como responder à travessia." },
    { id: "upgrade", label: "Aprimoramento", icon: "⬆", desc: "Escolha 1 entre 3 ecos." },
    { id: "mini", label: "Mini-Boss", icon: "♜", desc: "Um guardião menor impede a passagem." }
  ],
  [
    { id: "treasure", label: "Tesouro", icon: "◇", desc: "Uma reserva esquecida entre os reinos." },
    { id: "repair", label: "Reparo", icon: "⟲", desc: "Restaure uma Corrente da Alma." },
    { id: "elite", label: "Elite", icon: "◆", desc: "Um trio de guardas reforçados." }
  ],
  [
    { id: "boss", label: "Guardião do Elo", icon: "✹", desc: "O Guardião e dois subordinados." }
  ]
];

export const buffs = [
  { id: "edge", title: "Fio Ressonante", category: "Ataque", text: "Todo o trio causa +10% de dano nesta trilha.", context: "Uma lâmina antiga vibra quando as almas lutam em uníssono.", icon: "⚒", effect: { damage: 0.1 } },
  { id: "ward", title: "Escudo de Partida", category: "Defesa", text: "O trio começa cada combate com 10 de escudo.", context: "Uma muralha esquecida ainda guarda quem atravessa o véu.", icon: "⛨", effect: { shield: 10 } },
  { id: "essence", title: "Núcleo de Essência", category: "Recursos", text: "Comece cada combate com 1 de Essência extra.", context: "O núcleo pulsa com o último fôlego de uma estrela morta.", icon: "◈", effect: { essence: 1 } },
  { id: "cinzas", title: "Cinzas da Travessia", category: "Recursos", text: "Se houver alguém do Inferno no trio, comece com 1 Cinza extra.", context: "O fogo que consumiu um reino ainda pode aquecer uma mão.", icon: "♨", effect: { cinza: 1 } },
  { id: "graca", title: "Graça Remanescente", category: "Recursos", text: "Se houver alguém do Paraíso no trio, comece com 1 Graça extra.", context: "Uma promessa cumprida deixou luz presa entre as pedras.", icon: "☼", effect: { graca: 1 } },
  { id: "ruptura", title: "Fenda Contida", category: "Limbo", text: "Se houver alguém do Limbo no trio, comece com 1 Ruptura extra.", context: "A rachadura não fecha; aprende a obedecer por um instante.", icon: "⟲", effect: { ruptura: 1 } },
  { id: "mend", title: "Fio de Vida", category: "Defesa", text: "Aumenta em 8 a Vida máxima de cada aliado na trilha.", context: "Um fio dourado costura as feridas sem apagar suas marcas.", icon: "✚", effect: { maxHp: 8 } },
  { id: "echo", title: "Eco do Trio", category: "Sinergia", text: "Com Ressonância, aumenta em 5% o bônus de potência.", context: "Três vozes respondem uma à outra no fundo do abismo.", icon: "∞", effect: { resonance: 0.05 } },
  { id: "fracture", title: "Fissura Vigiada", category: "Limbo", text: "No Limbo, reduz em 4 a cobrança de Vida das técnicas arriscadas.", context: "Uma sentinela observa a ruptura e segura a corrente por você.", icon: "⌛", effect: { risk: -4 } },
  { id: "last-light", title: "Última Brasa", category: "Ataque", text: "Aliados abaixo de 40 de Vida causam +12% de dano.", context: "Quando a chama quase apaga, sua luz alcança mais longe.", icon: "◉", effect: { desperation: 0.12 } },
  { id: "soul-thorns", title: "Espinhos da Alma", category: "Defesa", text: "Devolve 4 de dano ao inimigo que ferir um aliado.", context: "As correntes se fecham sobre quem tenta rompê-las à força.", icon: "⚜", effect: { thorns: 4 } },
  { id: "kind-hand", title: "Mão Compassiva", category: "Apoio", text: "Técnicas de apoio recuperam 8 de Vida adicional.", context: "Uma mão segura a sua antes que a dor se torne silêncio.", icon: "❧", effect: { healing: 8 } },
  { id: "silver-guard", title: "Guarda de Prata", category: "Defesa", text: "Técnicas de guarda e apoio concedem 5 de escudo adicional.", context: "Um voto antigo endurece cada proteção erguida pelo trio.", icon: "♢", effect: { shieldPower: 5 } },
  { id: "quiet-wall", title: "Parede Silenciosa", category: "Defesa", text: "O trio recebe 8% menos dano dos inimigos.", context: "O golpe chega ao outro lado de um silêncio impossível.", icon: "◖", effect: { damageReduction: 0.08 } },
  { id: "open-vein", title: "Ferida Exposta", category: "Ataque", text: "Causa 8 de dano adicional a inimigos abaixo de 35% de Vida.", context: "A cicatriz revela o ponto em que a alma ainda pode ceder.", icon: "⊗", effect: { execution: 8 } },
  { id: "soul-feast", title: "Banquete de Almas", category: "Sustento", text: "Recupera 8% do dano causado como Vida para quem atacou.", context: "Cada golpe arranca do vazio um pouco de fôlego para o trio.", icon: "♧", effect: { lifesteal: 0.08 } },
  { id: "death-bell", title: "Sino dos Caídos", category: "Recursos", text: "Derrubar um inimigo concede 1 de Essência.", context: "O sino toca uma vez por alma que enfim encontra descanso.", icon: "♬", effect: { killEssence: 1 } },
  { id: "breathing-loom", title: "Tear que Respira", category: "Recursos", text: "O trio recebe +1 de Essência a cada nova rodada.", context: "Um tear invisível recompõe as forças entre um golpe e outro.", icon: "⎊", effect: { essencePerRound: 1 } },
  { id: "woven-affinity", title: "Trama de Afinidade", category: "Recursos", text: "Cada aliado vivo gera +1 de sua afinidade por rodada.", context: "Os fios de cada reino se cruzam sem perder a própria cor.", icon: "⬟", effect: { affinityPerRound: 1 } },
  { id: "first-breath", title: "Primeiro Fôlego", category: "Ataque", text: "O primeiro golpe de cada aliado em cada combate causa +8 de dano.", context: "O primeiro passo no além ecoa como uma promessa de retorno.", icon: "◒", effect: { firstStrike: 8 } },
  { id: "victory-pulse", title: "Pulso da Vitória", category: "Sustento", text: "Derrubar um inimigo concede 6 de escudo a cada aliado vivo.", context: "Uma vitória reacende as correntes de quem ainda permanece.", icon: "⌘", effect: { killShield: 6 } },
  { id: "opening-weakness", title: "Selo de Abertura", category: "Controle", text: "Todos os inimigos começam o combate enfraquecidos.", context: "O selo antecipa o primeiro movimento da oposição.", icon: "⌽", effect: { openingWeakness: 1 } },
  { id: "deep-root", title: "Raiz Profunda", category: "Defesa", text: "Comece com 6 de escudo e receba 4% menos dano.", context: "Raízes atravessam a pedra para amparar os vivos por baixo.", icon: "❖", effect: { shield: 6, damageReduction: 0.04 } },
  { id: "grave-echo", title: "Eco do Túmulo", category: "Sustento", text: "Cada aliado recebe +5 de Vida máxima e derrubar alguém concede Essência.", context: "Até os túmulos devolvem uma parte do que receberam.", icon: "⛬", effect: { maxHp: 5, killEssence: 1 } },
  { id: "double-current", title: "Corrente Dupla", category: "Recursos", text: "Comece com +1 de Essência e +1 de cada afinidade presente no trio.", context: "Dois rios espirituais correm lado a lado sem se misturar.", icon: "☯", effect: { essence: 1, allAffinity: 1 } },
  { id: "chainbreaker", title: "Quebra-Corrente", category: "Limbo", text: "No Limbo, reduz em 6 a cobrança de Vida das técnicas arriscadas.", context: "Uma corrente partida também pode abrir caminho para escapar.", icon: "⛓", effect: { risk: -6 } },
  { id: "suture", title: "Sutura do Além", category: "Sustento", text: "No início de cada rodada, cura 4 de Vida do aliado mais ferido.", context: "A própria trilha fecha uma ferida enquanto ninguém olha.", icon: "⤴", effect: { roundHeal: 4 } },
  { id: "last-vow", title: "Voto Derradeiro", category: "Sustento", text: "Uma vez por combate, impede que um aliado caia e o mantém com 18 de Vida.", context: "Alguém jurou ficar até o fim — e a promessa ainda pesa.", icon: "⚑", effect: { revive: 1 } },
  { id: "hollow-edge", title: "Lâmina Oca", category: "Ataque", text: "15% do dano do trio atravessa escudos inimigos.", context: "A lâmina não rompe a guarda; atravessa o espaço que ela deixa.", icon: "◌", effect: { pierce: 0.15 } },
  { id: "rallying-cry", title: "Chamado da Aurora", category: "Apoio", text: "A cada rodada, cura 2 de Vida e concede 1 de Essência ao trio.", context: "Uma voz chama os que ficaram para trás de volta à luta.", icon: "♩", effect: { roundHeal: 2, essencePerRound: 1 } },
  { id: "ashen-bargain", title: "Pacto das Cinzas", category: "Risco", text: "Causa +15% de dano, mas o trio recebe 6% mais dano.", context: "A chama empresta poder sem esconder o preço da dívida.", icon: "♟", effect: { damage: 0.15, damageReduction: -0.06 } },
  { id: "hunted-mark", title: "Marca da Caçada", category: "Ataque", text: "O primeiro golpe de cada aliado causa +4 de dano; finalizações causam +5.", context: "Uma marca escura reúne o trio sobre a mesma presa.", icon: "➶", effect: { firstStrike: 4, execution: 5 } },
  { id: "shared-ward", title: "Vigília Partilhada", category: "Defesa", text: "Concede 4 de escudo adicional e reduz dano recebido em 3%.", context: "Ninguém segura a vigília sozinho por muito tempo.", icon: "♙", effect: { shieldPower: 4, damageReduction: 0.03 } },
  { id: "eclipse-step", title: "Passo do Eclipse", category: "Controle", text: "Técnicas de controle causam +5 de dano.", context: "O instante entre luz e sombra torna o golpe inevitável.", icon: "◐", effect: { controlBonus: 5 } },
  { id: "ashen-regrowth", title: "Rebrota nas Cinzas", category: "Sustento", text: "Cada aliado recebe +5 de Vida máxima e apoio cura +4 de Vida.", context: "Uma raiz verde rompe o solo onde tudo parecia consumido.", icon: "⚘", effect: { maxHp: 5, healing: 4 } }
];

