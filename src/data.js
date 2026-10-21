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
  const thirdKind = ["guard", "support", "control", "strike", "burst"][index % 5];
  const thirdDescriptions = {
    guard: "Ergue uma proteção para o trio.",
    support: "Recupera Vida do aliado mais ferido e reforça sua guarda.",
    control: "Atinge e enfraquece um inimigo por uma ação.",
    strike: "Golpe tático de dano direto contra um inimigo.",
    burst: "Golpe decisivo: causa dano extra e pode interromper o alvo."
  };
  const teamGuard = role.name === "Guardião" || role.name === "Apoio" || index % 3 === 0;
  const fourthCooldown = 2;
  const abilities = [
    {
      id: "impulso", name: moves[0] + " · " + epithet, kind: "strike", cost: 0, costs: {},
      damage: 18 + (index % 3), target: "enemy", description: "Ataque básico; gera 1 de Essência.", art: art?.abilities.impulso
    },
    {
      id: "tecnica", name: moves[1] + " de " + epithet, kind: tacticalKind, cost: 1, costs: { affinity: 1 },
      damage: 24 + (index % 4), target: "enemy", cooldown: tacticalKind === "control" ? 1 : 0,
      expose: tacticalKind === "strike" ? 1 : 0, burn: elo.id === "chama" ? 2 : 0,
      description: `${role.hint}; custa 1 ${affinityName}${tacticalKind === "control" ? " e aplica Enfraquecido" : " e expõe o alvo"}${elo.id === "chama" ? " e causa Queimadura" : ""}.`, art: art?.abilities.tecnica
    },
    {
      id: "voto", name: moves[2] + " · " + epithet, kind: thirdKind, cost: 2, costs: { essence: 1, affinity: 1 },
      damage: thirdKind === "burst" ? 28 + (index % 5) : 17 + (index % 3), heal: 20,
      shield: thirdKind === "guard" || thirdKind === "support" ? 16 + (index % 5) : 0,
      target: ["guard", "support"].includes(thirdKind) ? "team" : "enemy", cooldown: 1,
      description: `${thirdDescriptions[thirdKind]} Custa 1 Essência + 1 ${affinityName}; recarga de 1 turno.`, art: art?.abilities.voto
    },
    {
      id: "despertar", name: moves[3] + " de " + epithet, kind: "guard", cost: 2, costs: { affinity: 2 },
      damage: 0, shield: 20 + (index % 5), target: teamGuard ? "team" : "self", taunt: teamGuard ? 1 : 0, cooldown: fourthCooldown,
      description: `Técnica defensiva: ${teamGuard ? "protege o trio e atrai ataques" : "protege o usuário"}. Custa 2 ${affinityName}; recarga de ${fourthCooldown} turnos.`, art: art?.abilities.despertar
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
  [{ id: "normal", label: "Patrulha", icon: "⚔", desc: "O primeiro trio bloqueia a travessia.", col: 1 }],
  [
    { id: "normal", label: "Combate", icon: "⚔", desc: "Um trio patrulha a trilha.", col: 0 },
    { id: "event", label: "Encontro", icon: "✦", desc: "Uma alma pede ajuda.", col: 1 },
    { id: "normal", label: "Combate", icon: "⚔", desc: "Uma patrulha guarda o desvio.", col: 2 }
  ],
  [
    { id: "elite", label: "Elite", icon: "◆", desc: "Guardiões reforçados; melhor recompensa.", col: 0 },
    { id: "treasure", label: "Tesouro", icon: "◇", desc: "Um Eco e fragmentos antigos.", col: 1 },
    { id: "repair", label: "Descanso", icon: "⟲", desc: "Recupere Vida antes do próximo confronto.", col: 2 }
  ],
  [
    { id: "event", label: "Encontro", icon: "✦", desc: "Decida como responder à travessia.", col: 0 },
    { id: "upgrade", label: "Poder", icon: "⬆", desc: "Escolha um Eco permanente.", col: 1 },
    { id: "shop", label: "Mercador", icon: "◈", desc: "Troque fragmentos por cura ou um Eco.", col: 2 }
  ],
  [
    { id: "elite", label: "Elite", icon: "◆", desc: "Um trio de guardas reforçados.", col: 0 },
    { id: "mini", label: "Mini-Boss", icon: "♜", desc: "Um guardião menor protege o caminho.", col: 1 },
    { id: "elite", label: "Elite", icon: "◆", desc: "Um trio de guardas reforçados.", col: 2 }
  ],
  [
    { id: "repair", label: "Descanso", icon: "⟲", desc: "Repare as Correntes da Alma.", col: 0 },
    { id: "treasure", label: "Tesouro", icon: "◇", desc: "Um Eco e fragmentos antigos.", col: 1 },
    { id: "upgrade", label: "Poder", icon: "⬆", desc: "Escolha um Eco permanente.", col: 2 }
  ],
  [{ id: "boss", label: "Guardião do Elo", icon: "✹", desc: "O Guardião e dois subordinados.", col: 1 }]
];

export function generateTrail(eloId, seed = 0) {
  const numericSeed = Math.abs(Math.trunc(Number(seed) || 0));
  const rows = routeStages.map((stage, rowIndex) => stage.map((template, nodeIndex) => {
    const rotation = stage.length === 3 ? (numericSeed + rowIndex * 2) % 3 : 0;
    const content = stage[(nodeIndex + rotation) % stage.length];
    return {
      ...content,
      col: template.col,
      row: rowIndex,
      type: content.id,
      id: `${eloId}-r${rowIndex}-c${template.col}-${content.id}-${nodeIndex}`,
      nextIds: []
    };
  }));
  for (let rowIndex = 0; rowIndex < rows.length - 1; rowIndex += 1) {
    const nextRow = rows[rowIndex + 1];
    for (const node of rows[rowIndex]) {
      const connected = nextRow.length === 1
        ? nextRow
        : rows[rowIndex].length === 1
          ? nextRow
          : nextRow.filter((candidate) => Math.abs(candidate.col - node.col) <= 1);
      node.nextIds = connected.map((candidate) => candidate.id);
    }
  }
  return rows;
}

export const buffs = [
  { id: "edge", title: "Fio Ressonante", text: "Todo o trio causa +12% de dano nesta trilha.", icon: "✧", effect: { damage: 0.12 } },
  { id: "ward", title: "Escudo de Partida", text: "O trio começa cada combate com 12 de escudo.", icon: "⬡", effect: { shield: 12 } },
  { id: "essence", title: "Núcleo de Essência", text: "Comece cada combate com 1 de Essência extra.", icon: "◈", effect: { essence: 1 } },
  { id: "cinzas", title: "Cinzas da Travessia", text: "Comece cada combate com 1 Cinza extra.", icon: "✹", effect: { cinza: 1 } },
  { id: "graca", title: "Graça Remanescente", text: "Comece cada combate com 1 Graça extra.", icon: "✧", effect: { graca: 1 } },
  { id: "ruptura", title: "Fenda Contida", text: "Comece cada combate com 1 Ruptura extra.", icon: "⟲", effect: { ruptura: 1 } },
  { id: "mend", title: "Fio de Vida", text: "Aumenta em 10 a Vida máxima de cada aliado na trilha.", icon: "✚", effect: { maxHp: 10 } },
  { id: "echo", title: "Eco do Trio", text: "A Ressonância concede mais 5% de bônus.", icon: "∞", effect: { resonance: 0.05 } },
  { id: "fracture", title: "Fissura Vigiada", text: "As habilidades de Limbo causam menos dano ao usuário.", icon: "⟲", effect: { risk: -4 } }
];

