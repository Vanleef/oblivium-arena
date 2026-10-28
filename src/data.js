import {withFlexibleCosts} from './flexible-costs.js';
import { attachCharacterArt } from './character-art.js';
import { buildCharacterKit, describeAbility } from "./kits.js";
import { protagonistCharacters, supportingCharacters, antagonistCharacters } from "./protagonists.js";
import { withBodyForms } from "./body-forms.js";
import { characterRevisions, revisedArtFor, reviseKitIdentity } from "./character-identity.js";
import { revisePassive } from "./passive-revisions.js";
import { assignCharacterArchetypes } from "./archetypes.js";
import { attachArenaKitAssignment } from "./arena-kit-assignments.js";
import { kingdomCatalog, kingdomById as kingdomDefinitionsById, defaultKingdomByTrack, legacyToKingdom, kingdomOverrides, characterTitleOverrides, englishCharacterTitleOverrides } from "./kingdoms.js";
const inferno = [
  {
    id: "sangria", name: "Sangria", realm: "Inferno", theme: "Sangue, lâminas e carnificina", strength: "Máxima",
    symbol: "✦", color: "blood", forms: ["O Açougueiro", "A Viúva Escarlate", "O Colecionador de Cabeças", "Gêmeos do Cutelo", "O Carrasco sem Rosto", "A Mãe Rubra"],
    moves: ["Corte Rubro", "Marca do Açougue", "Rasgo Escarlate", "Maré de Sangue"], passive: "Ferida Aberta",
    flavor: "A violência extrema alimenta cada golpe e deixa uma marca que torna o próximo mais perigoso."
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
    flavor: "A exploração transforma tudo em Essência. O que é roubado fortalece quem toma."
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
    flavor: "A corrupção distorce a forma e rouba o controle. Sua força exige proximidade e cautela."
  },
  {
    id: "vazio", name: "Vazio", realm: "Inferno", theme: "Niilismo, desespero e apagamento", strength: "Especial",
    symbol: "◍", color: "void", forms: ["O que Apaga", "A Ausência", "O Fim Silencioso", "O Menino sem Sombra", "A Última Página", "O Lugar de Ninguém"],
    moves: ["Estilhaço Nulo", "Frio Abissal", "Fenda de Ausência", "Extinção Branca"], passive: "Nada Permanece",
    flavor: "O desespero contagioso apaga certezas. Esta força é rara, instável e temida pelos outros."
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

// The `essence` key remains stable for saved teams; it now labels the Éter type inside the broader Essência pool.
export const resources = [
  { id: "essence", name: "Éter", shortName: "Éter", icon: "◈", color: "essence" },
  { id: "cinza", name: "Cinza", shortName: "Cinza", icon: "✹", color: "inferno" },
  { id: "graca", name: "Graça", shortName: "Graça", icon: "✧", color: "paraiso" },
  { id: "ruptura", name: "Ruptura", shortName: "Ruptura", icon: "⟲", color: "limbo" }
];

export const resourceById = {...Object.fromEntries(resources.map((resource) => [resource.id, resource])),random:{id:"random",name:"Coringa",shortName:"Coringa",icon:"✥",color:"random"}};
// Kept for legacy saves and the old world-level reward rules. Character affinities are kit-based.
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
  "a-porta-que-flutua", "o-nome-esquecido", "o-relogio-afogado", "a-asa-invertida", "o-andarilho-de-vidro", "a-sombra-inconstante", "a-ponte-rasgada", "a-alma-em-suspenso",
  "o-que-cria", "o-cultivador", "a-arquiteta-verde", "o-eco-sem-dono",
  "a-que-une", "o-vinculo", "os-tres-irmaos", "o-primeiro-canto",
  "a-luz-nua", "o-espelho", "a-cartografa-da-clareza", "o-elo-dourado", "a-semente", "a-linha-partida",
  "a-chama-que-nao-apaga", "o-que-levanta", "a-voz", "o-portador-da-aurora",
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


function slug(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const characterFormArt = {
  "o-soberano-quebrado": {
    impulso: { edict: "/art/characters/o-soberano-quebrado/anime-first-rework-20261028/skill-impulso-edict.webp" },
    tecnica: { edict: "/art/characters/o-soberano-quebrado/anime-first-rework-20261028/skill-tecnica-edict.webp" },
    voto: { edict: "/art/characters/o-soberano-quebrado/anime-first-rework-20261028/skill-voto-edict.webp" }
  },
  "o-que-observou": {
    voto: { witness: "/art/characters/o-que-observou/painterly-rework-20261025/skill-voto-witness.webp" }
  },
  "o-surdo": {
    impulso: { echo: "/art/characters/o-surdo/painterly-rework-20261025/skill-impulso-echo.webp" }
  },
  "a-praga-andante": {
    tecnica: { fever: "/art/characters/a-praga-andante/painterly-rework-20261025/skill-tecnica-fever.webp" }
  },
  "a-rainha-dos-fungos": {
    tecnica: { bloom: "/art/characters/a-rainha-dos-fungos/painterly-rework-20261025/skill-tecnica-bloom.webp" },
    voto: { cloud: "/art/characters/a-rainha-dos-fungos/painterly-rework-20261025/skill-voto-cloud.webp" }
  },
  "o-devorador": {
    impulso: { starved: "/art/characters/o-devorador/painterly-rework-20261025/skill-impulso-starved.webp" }
  },
  "o-tecelao-de-mentiras": {
    tecnica: { unweave: "/art/characters/o-tecelao-de-mentiras/style-reference-rework-20261025/skill-tecnica-unweave.webp" }
  },
  "o-falso-profeta": {
    tecnica: { confess: "/art/characters/o-falso-profeta/painterly-rework-20261026/skill-tecnica-confess.webp" }
  },
  "o-vigia-ausente": {
    voto: { ambush: "/art/characters/o-vigia-ausente/painterly-rework-20261025/skill-voto-ambush.webp" }
  }
};

function artForCharacter(name) {
  if (starterArt[name]) return starterArt[name];
  const id = slug(name);
  if (!illustratedCharacterIds.has(id)) return null;
  const base = `/art/characters/${id}`;
  return {
    portrait: `${base}/portrait.webp`,
    passive: `${base}/passive.webp`,
    forms: characterFormArt[id],
    abilities: {
      impulso: `${base}/skill-impulso.webp`,
      tecnica: `${base}/skill-tecnica.webp`,
      voto: `${base}/skill-voto.webp`,
      despertar: `${base}/skill-despertar.webp`
    }
  };
}

function characterFrom(elo, name, index) {
  const id = slug(name), revision = characterRevisions[id];
  const affinity = "essence"; // Temporary compatibility fallback; archetypes assign the actual type below.
  const art = revisedArtFor(id, artForCharacter(name));
  const kit = revisePassive(reviseKitIdentity(buildCharacterKit(elo.id, index, art), revision), id);
  const starter = ["O Escudo Vivo", "A Brasa Eterna", "O Passo Interrompido"].includes(name);
  return {
    id,
    name:revision?.name || name,
    ...(revision?.name ? {previousName:name} : {}),
    aliases:[...new Set([...(revision?.aliases || []), name])],
    realm: elo.realm, elo: elo.name, eloId: elo.id, legacyEloId: elo.id,
    title: kit.role, ...kit,
    identityTitle:revision?.title || null,
    englishName:revision?.englishName || null,
    englishIdentityTitle:revision?.englishTitle || null,
    indexInElo: index,
    color: elo.color, symbol: elo.symbol, affinity,
    art: art ? { portrait: art.portrait, passive: art.passive } : null,
    maxHp: 100, starter, unlockedByDefault: starter,
    flavor: revision?.lore || elo.flavor, lore:revision?.lore || null, risk: elo.realm === "Limbo"
  };
}
export const legacyElos = [...inferno, ...paradise, ...limbo];
const reactiveKits={
 "o-escudo-vivo":{tecnica:{trigger:"damaged",damage:14,turns:1}},
 "a-mao-que-cura":{tecnica:{trigger:"damaged",healSource:12,turns:1}},
 "a-pele-alheia":{tecnica:{trigger:"damaged",damage:16,turns:1}},
 "o-primeiro-canto":{tecnica:{trigger:"damaged",heal:8,turns:1}},
 "o-que-ficou":{tecnica:{trigger:"damaged",shieldSource:12,turns:1}},
 "o-que-observou":{tecnica:{trigger:"attack",exposeAttacker:true,turns:1}},
 "o-relogio-afogado":{tecnica:{trigger:"idle",heal:10,turns:1}},
 "a-linha-partida":{tecnica:{trigger:"damaged",damage:12,turns:1}}
};

const rawCharacters = [
  ...legacyElos.flatMap((elo) => elo.forms.map((name, index) => attachArenaKitAssignment(assignCharacterArchetypes(addReactiveKit(withFlexibleCosts(withBodyForms(characterFrom(elo, name, index)))))))),
  ...protagonistCharacters.map((character) => attachArenaKitAssignment(assignCharacterArchetypes(withFlexibleCosts(character)))),
  ...supportingCharacters.map((character) => attachArenaKitAssignment(assignCharacterArchetypes(withFlexibleCosts(character)))),
  ...antagonistCharacters.map((character) => attachArenaKitAssignment(assignCharacterArchetypes(withFlexibleCosts(character))))
];
export const characters = rawCharacters.map(character => {
  const legacyEloId = character.legacyEloId || character.eloId;
  const kingdomId = kingdomOverrides[character.id] || defaultKingdomByTrack[legacyEloId]
    || (character.realm === "Limbo" ? "vestibulo" : character.realm === "Paraíso" ? "estelar" : "flagelo");
  const kingdom = kingdomDefinitionsById[kingdomId];
  if (!kingdom) throw new Error(`Reino ausente para ${character.id}: ${kingdomId}`);
  const identityTitle = character.identityTitle || characterTitleOverrides[character.id]
    || (character.storyCharacter && !character.name.includes(",") ? character.role : null);
  const englishIdentityTitle = character.englishIdentityTitle || englishCharacterTitleOverrides[character.id]
    || (character.storyCharacter && identityTitle ? character.englishRole : null);
  const synergyKingdomIds = [...new Set([
    kingdomId,
    ...(character.synergyEloIds || []).map(id => legacyToKingdom[id]).filter(Boolean)
  ])];
  return attachCharacterArt({
    ...character,
    legacyEloId,
    legacyEloName: character.elo,
    kingdomId,
    kingdom: kingdom.name,
    englishKingdom: kingdom.englishName,
    realm: kingdom.realm,
    flavor: character.lore || (character.storyCharacter ? character.flavor : kingdom.theme),
    elo: kingdom.name,
    englishElo: kingdom.englishName,
    color: kingdom.color,
    symbol: kingdom.symbol,
    title: identityTitle || character.role || character.title,
    identityTitle,
    englishIdentityTitle,
    synergyKingdomIds,
    risk: kingdom.realm === "Limbo"
  });
});
export const elos = kingdomCatalog.map(kingdom => ({
  ...kingdom,
  forms: characters.filter(character => character.kingdomId === kingdom.id).map(character => character.name),
  legacyEloIds: [...new Set(characters.filter(character => character.kingdomId === kingdom.id).map(character => character.legacyEloId))]
}));
export const kingdoms = elos;
export const kingdomById = Object.fromEntries(elos.map(kingdom => [kingdom.id, kingdom]));
export function getElo(eloId) {
  return kingdomById[eloId] || legacyElos.find(elo => elo.id === eloId) || elos[0];
}
export const realms = [
  {
    id: "inferno", name: "Inferno", title: "Os Nove Reinos do Inferno",
    description: "Nove reinos que dão forma às consequências da violência, do excesso e da traição.", color: "inferno",
    elos: elos.filter(kingdom => kingdom.realm === "Inferno"),
    kingdoms: elos.filter(kingdom => kingdom.realm === "Inferno")
  },
  {
    id: "paraiso", name: "Paraíso", title: "As Nove Esferas do Paraíso",
    description: "Nove esferas que guardam virtudes, sabedoria, esperança e amparo.", color: "paraiso",
    elos: elos.filter(kingdom => kingdom.realm === "Paraíso"),
    kingdoms: elos.filter(kingdom => kingdom.realm === "Paraíso")
  },
  {
    id: "limbo", name: "Limbo", title: "Os Quatro Reinos do Limbo",
    description: "Quatro passagens entre mundos, onde as almas aguardam, atravessam ou se transformam.", color: "limbo",
    elos: elos.filter(kingdom => kingdom.realm === "Limbo"),
    kingdoms: elos.filter(kingdom => kingdom.realm === "Limbo")
  }
];
for (const track of legacyElos) track.forms = characters.filter(character => character.legacyEloId === track.id).map(character => character.name);
function addReactiveKit(character){const kit=reactiveKits[character.id];if(!kit)return character;return {...character,abilities:character.abilities.map(a=>{const reactive=kit[a.id];if(!reactive||a.reactive)return a;const next={...a,reactive};return {...next,description:describeAbility(next)};})};}
// Expose current display names after deriving permanent IDs from the original roster.
for (const elo of elos) elo.forms = characters.filter(c => c.eloId === elo.id).map(c => c.name);
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
    { id: "upgrade", label: "Poder", icon: "⬆", desc: "Escolha um Eco para esta trilha.", col: 1 },
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
    { id: "upgrade", label: "Poder", icon: "⬆", desc: "Escolha um Eco para esta trilha.", col: 2 }
  ],
  [{ id: "boss", label: "Conselho do Reino", icon: "✹", desc: "Vença o trio e recrute uma das almas derrotadas.", col: 1 }]
];

export function generateTrail(eloId, seed = 0, variant = "hunt", options = {}) {
  const numericSeed = Math.abs(Math.trunc(Number(seed) || 0));
  const rows = routeStages.map((stage, rowIndex) => stage.map((template, nodeIndex) => {
    const rotation = stage.length === 3 ? (numericSeed + rowIndex * 2) % 3 : 0;
    let content = stage[(nodeIndex + rotation) % stage.length];
    if (variant === "pilgrimage" && rowIndex === 2) content = [routeStages[3][1], routeStages[1][1], routeStages[2][0]][nodeIndex];
    if (variant === "eclipse" && rowIndex === 2) content = routeStages[2][0];
    if (variant === "eclipse" && rowIndex === 4) content = nodeIndex === 1 ? routeStages[4][0] : routeStages[4][1];
    return {
      ...content,
      col: template.col,
      row: rowIndex,
      type: content.id,
      id: `${eloId}-r${rowIndex}-c${template.col}-${content.id}-${nodeIndex}`,
      nextIds: []
    };
  }));
  if(options.includeNiloChoice&&["vestibulo","correntes-quebradas"].includes(eloId)){
    const rowIndex=5,content={id:"nilo-choice",label:"Fenda da Alma",icon:"◉",desc:"Decida se Nilo expurga a corrupção ou a incorpora por completo.",col:1};
    rows[rowIndex]=[{...content,row:rowIndex,type:content.id,id:`${eloId}-r${rowIndex}-c1-nilo-choice-0`,nextIds:[]}];
  }
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
  {
    "id": "edge",
    "title": "Fio Ressonante",
    "text": "Todo o trio causa +12% de dano nesta trilha.",
    "lore": "Uma linha dourada une golpes que jamais foram feitos juntos.",
    "glyph": "blade",
    "category": "offense",
    "icon": "✧",
    "effect": {
      "damage": 0.12
    },
    "context": "Uma linha dourada une golpes que jamais foram feitos juntos."
  },
  {
    "id": "ward",
    "title": "Escudo de Partida",
    "text": "O trio começa cada combate com 12 de Defesa.",
    "lore": "A primeira queda encontra uma guarda já erguida.",
    "glyph": "shield",
    "category": "defense",
    "icon": "⬡",
    "effect": {
      "shield": 12
    },
    "context": "A primeira queda encontra uma guarda já erguida."
  },
  {
    "id": "essence",
    "title": "Núcleo de Éter",
    "text": "Comece cada combate com 1 de Éter extra.",
    "lore": "Uma centelha quieta espera pela escolha certa.",
    "glyph": "soul",
    "category": "essence",
    "icon": "◈",
    "effect": {
      "essence": 1
    },
    "context": "Uma centelha quieta espera pela escolha certa."
  },
  {
    "id": "cinzas",
    "title": "Cinzas da Travessia",
    "text": "Comece cada combate com 1 Cinza extra.",
    "lore": "O que restou da última chama ainda serve ao próximo passo.",
    "glyph": "ember",
    "category": "essence",
    "icon": "✹",
    "effect": {
      "cinza": 1
    },
    "context": "O que restou da última chama ainda serve ao próximo passo."
  },
  {
    "id": "graca",
    "title": "Graça Remanescente",
    "text": "Comece cada combate com 1 Graça extra.",
    "lore": "Uma mão invisível ampara quem permanece no caminho.",
    "glyph": "lotus",
    "category": "essence",
    "icon": "☼",
    "effect": {
      "graca": 1
    },
    "context": "Uma mão invisível ampara quem permanece no caminho."
  },
  {
    "id": "ruptura",
    "title": "Fenda Contida",
    "text": "Comece cada combate com 1 Ruptura extra.",
    "lore": "A rachadura pulsa antes que o campo se abra.",
    "glyph": "shatter",
    "category": "essence",
    "icon": "⟲",
    "effect": {
      "ruptura": 1
    },
    "context": "A rachadura pulsa antes que o campo se abra."
  },
  {
    "id": "coringa",
    "title": "Estilhaço Volátil",
    "text": "Comece cada combate com 1 Essência aleatória extra.",
    "lore": "Uma centelha sem nome toma a forma de que você precisar.",
    "glyph": "wild",
    "category": "essence",
    "icon": "✥",
    "effect": {
      "randomEssence": 1
    },
    "context": "Uma centelha sem nome toma a forma de que você precisar."
  },
  {
    "id": "mend",
    "title": "Fio de Vida",
    "text": "Aumenta em 10 a Vida máxima de cada aliado na trilha.",
    "lore": "Um fio vermelho costura o espaço que a batalha abriu.",
    "glyph": "heart",
    "category": "defense",
    "icon": "✚",
    "effect": {
      "maxHp": 10
    },
    "context": "Um fio vermelho costura o espaço que a batalha abriu."
  },
  {
    "id": "echo",
    "title": "Eco do Trio",
    "text": "A Ressonância concede mais 5% de bônus.",
    "lore": "As vozes distintas encontram um mesmo compasso.",
    "glyph": "chorus",
    "category": "identity",
    "icon": "∞",
    "effect": {
      "resonance": 0.05
    },
    "context": "As vozes distintas encontram um mesmo compasso."
  },
  {
    "id": "fracture",
    "title": "Fissura Vigiada",
    "text": "As habilidades de Limbo causam 4 a menos de dano ao usuário.",
    "lore": "A fenda aprende a se fechar antes de alcançar quem a abriu.",
    "glyph": "rift",
    "category": "defense",
    "icon": "⌛",
    "effect": {
      "risk": -4
    },
    "context": "A fenda aprende a se fechar antes de alcançar quem a abriu."
  },
  {
    "id": "cinderchoir",
    "title": "Coro das Brasas",
    "text": "Aflições aplicadas recebem +1 de dano por turno.",
    "lore": "Cada ferida conserva um fragmento do calor de Inferno.",
    "glyph": "flame",
    "category": "identity",
    "icon": "♨",
    "effect": {
      "afflictionPower": 1
    },
    "context": "Cada ferida conserva um fragmento do calor de Inferno."
  },
  {
    "id": "quietedict",
    "title": "Édito sem Voz",
    "text": "Técnicas de controle causam +2 de dano direto.",
    "lore": "A ordem que não precisa ser pronunciada ainda interrompe o golpe.",
    "glyph": "lock",
    "category": "offense",
    "icon": "⊘",
    "effect": {
      "controlPower": 2
    },
    "context": "A ordem que não precisa ser pronunciada ainda interrompe o golpe."
  },
  {
    "id": "reprisal",
    "title": "Memória do Punho",
    "text": "Contra-ataques causam +2 de dano.",
    "lore": "A guarda devolve apenas o necessário para ser lembrada.",
    "glyph": "counter",
    "category": "defense",
    "icon": "↶",
    "effect": {
      "counterPower": 2
    },
    "context": "A guarda devolve apenas o necessário para ser lembrada."
  },
  {
    "id": "care",
    "title": "Mãos que Ficam",
    "text": "Habilidades de cura restauram +2 de Vida.",
    "lore": "O gesto de cuidado sobrevive à distância entre dois combates.",
    "glyph": "lantern",
    "category": "defense",
    "icon": "♠",
    "effect": {
      "healPower": 2
    },
    "context": "O gesto de cuidado sobrevive à distância entre dois combates."
  },
  {
    "id": "irontrace",
    "title": "Vestígio de Ferro",
    "text": "Cada aliado recebe 1 de Armadura.",
    "lore": "O impacto de ontem endurece a superfície de hoje.",
    "glyph": "scale",
    "category": "defense",
    "icon": "▱",
    "effect": {
      "armor": 1
    },
    "context": "O impacto de ontem endurece a superfície de hoje."
  },
  {
    "id": "formmantle",
    "title": "Manto das Possibilidades",
    "text": "Mudar de Forma concede +4 de Defesa.",
    "lore": "Cada corpo novo carrega a lembrança de como resistir.",
    "glyph": "mirror",
    "category": "forms",
    "icon": "♣",
    "effect": {
      "shiftShield": 4
    },
    "context": "Cada corpo novo carrega a lembrança de como resistir."
  },
  {
    "id": "spoils",
    "title": "Espólio da Queda",
    "text": "O primeiro abate de cada rodada gera 1 Ruptura.",
    "lore": "A última força de quem cai pode abrir a próxima brecha.",
    "glyph": "fang",
    "category": "essence",
    "icon": "↯",
    "effect": {
      "essenceOnKill": 1
    },
    "context": "A última força de quem cai pode abrir a próxima brecha."
  },
  {
    "id": "formseed",
    "title": "Semente de Outra Pele",
    "text": "A primeira mudança de Forma de cada rodada gera 1 Essência de afinidade.",
    "lore": "Uma nova pele guarda a centelha do corpo que a sonhou.",
    "glyph": "seed",
    "category": "forms",
    "icon": "❋",
    "effect": {
      "formEssence": 1
    },
    "context": "Uma nova pele guarda a centelha do corpo que a sonhou."
  },
  {
    "id": "supportchorus",
    "title": "Refrão de Apoio",
    "text": "O primeiro apoio de cada rodada gera 1 Graça.",
    "lore": "O auxílio volta como força para quem o ofereceu.",
    "glyph": "eye",
    "category": "essence",
    "icon": "♫",
    "effect": {
      "supportEssence": 1
    },
    "context": "O auxílio volta como força para quem o ofereceu."
  },
  {
    "id": "lastwatch",
    "title": "Vigília dos Caídos",
    "text": "Derrubar uma alma concede 4 de Defesa ao usuário.",
    "lore": "A guarda deixada por um inimigo cobre o próximo passo.",
    "glyph": "candle",
    "category": "defense",
    "icon": "◇",
    "effect": {
      "killShield": 4
    },
    "context": "A guarda deixada por um inimigo cobre o próximo passo."
  },
  {
    "id": "soulstep",
    "title": "Passo Guardado",
    "text": "Cada aliado começa o combate com 1 carga.",
    "lore": "O primeiro movimento encontra uma resposta já preparada.",
    "glyph": "footsteps",
    "category": "forms",
    "icon": "♥",
    "effect": {
      "startingCharge": 1
    },
    "context": "O primeiro movimento encontra uma resposta já preparada."
  },
  {
    "id": "markedchoir",
    "title": "Sentença em Conjunto",
    "text": "Ataques contra alvos com sua Marca causam +2 de dano.",
    "lore": "Uma marca vista por todos ainda pertence a quem a escreveu.",
    "glyph": "mark",
    "category": "identity",
    "icon": "◎",
    "effect": {
      "markedPower": 2
    },
    "context": "Uma marca vista por todos ainda pertence a quem a escreveu."
  },
  {
    "id": "lifeline",
    "title": "Linha de Retorno",
    "text": "Usar apoio concede 3 de Defesa ao usuário.",
    "lore": "Quem estende a mão encontra um lugar para se apoiar.",
    "glyph": "bond",
    "category": "defense",
    "icon": "♦",
    "effect": {
      "supportShield": 3
    },
    "context": "Quem estende a mão encontra um lugar para se apoiar."
  },
  {
    "id": "last-light",
    "title": "Última Brasa",
    "category": "offense",
    "text": "Aliados com metade da Vida ou menos causam +4 de dano.",
    "context": "Quando a chama quase apaga, sua luz alcança mais longe.",
    "icon": "◉",
    "effect": {
      "woundedPower": 4
    },
    "lore": "Quando a chama quase apaga, sua luz alcança mais longe.",
    "glyph": "crown"
  },
  {
    "id": "soul-thorns",
    "title": "Espinhos da Alma",
    "category": "defense",
    "text": "Contra-ataques causam +4 de dano.",
    "context": "As correntes se fecham sobre quem tenta rompê-las à força.",
    "icon": "⚜",
    "effect": {
      "counterPower": 4
    },
    "lore": "As correntes se fecham sobre quem tenta rompê-las à força.",
    "glyph": "dawn"
  },
  {
    "id": "kind-hand",
    "title": "Mão Compassiva",
    "category": "utility",
    "text": "Habilidades de cura restauram +4 de Vida.",
    "context": "Uma mão segura a sua antes que a dor se torne silêncio.",
    "icon": "❧",
    "effect": {
      "healPower": 4
    },
    "lore": "Uma mão segura a sua antes que a dor se torne silêncio.",
    "glyph": "blood"
  },
  {
    "id": "silver-guard",
    "title": "Guarda de Prata",
    "category": "defense",
    "text": "Habilidades que concedem Defesa concedem +5 de Defesa.",
    "context": "Um voto antigo endurece cada proteção erguida pelo trio.",
    "icon": "♢",
    "effect": {
      "shieldPower": 5
    },
    "lore": "Um voto antigo endurece cada proteção erguida pelo trio.",
    "glyph": "veil"
  },
  {
    "id": "quiet-wall",
    "title": "Parede Silenciosa",
    "category": "defense",
    "text": "Cada aliado recebe 2 de Armadura.",
    "context": "O golpe chega ao outro lado de um silêncio impossível.",
    "icon": "◖",
    "effect": {
      "armor": 2
    },
    "lore": "O golpe chega ao outro lado de um silêncio impossível.",
    "glyph": "echo"
  },
  {
    "id": "open-vein",
    "title": "Ferida Exposta",
    "category": "offense",
    "text": "Causa +8 de dano contra alvos com 40% da Vida ou menos.",
    "context": "A cicatriz revela o ponto em que a alma ainda pode ceder.",
    "icon": "⊗",
    "effect": {
      "executePower": 8
    },
    "lore": "A cicatriz revela o ponto em que a alma ainda pode ceder.",
    "glyph": "shelter"
  },
  {
    "id": "soul-feast",
    "title": "Banquete de Almas",
    "category": "defense",
    "text": "Recupera 8% do dano causado como Vida para quem atacou.",
    "context": "Cada golpe arranca do vazio um pouco de fôlego para o trio.",
    "icon": "♧",
    "effect": {
      "lifesteal": 0.08
    },
    "lore": "Cada golpe arranca do vazio um pouco de fôlego para o trio.",
    "glyph": "spore"
  },
  {
    "id": "death-bell",
    "title": "Sino dos Caídos",
    "category": "essence",
    "text": "O primeiro abate de cada rodada gera 1 Ruptura.",
    "context": "O sino toca uma vez por alma que enfim encontra descanso.",
    "icon": "♬",
    "effect": {
      "essenceOnKill": 1
    },
    "lore": "O sino toca uma vez por alma que enfim encontra descanso.",
    "glyph": "charge"
  },
  {
    "id": "breathing-loom",
    "title": "Tear que Respira",
    "category": "essence",
    "text": "O primeiro apoio de cada rodada gera 1 Graça.",
    "context": "Um tear invisível recompõe as forças entre um golpe e outro.",
    "icon": "⎊",
    "effect": {
      "supportEssence": 1
    },
    "lore": "Um tear invisível recompõe as forças entre um golpe e outro.",
    "glyph": "metamorph"
  },
  {
    "id": "woven-affinity",
    "title": "Trama de Afinidade",
    "category": "essence",
    "text": "A primeira mudança de Forma de cada rodada gera 1 Essência de afinidade.",
    "context": "Os fios de cada reino se cruzam sem perder a própria cor.",
    "icon": "⬟",
    "effect": {
      "formEssence": 1
    },
    "lore": "Os fios de cada reino se cruzam sem perder a própria cor.",
    "glyph": "eclipse"
  },
  {
    "id": "first-breath",
    "title": "Primeiro Fôlego",
    "category": "offense",
    "text": "O primeiro golpe de cada aliado em cada combate causa +8 de dano.",
    "context": "O primeiro passo no além ecoa como uma promessa de retorno.",
    "icon": "◒",
    "effect": {
      "firstStrike": 8
    },
    "lore": "O primeiro passo no além ecoa como uma promessa de retorno.",
    "glyph": "compass"
  },
  {
    "id": "victory-pulse",
    "title": "Pulso da Vitória",
    "category": "defense",
    "text": "Derrubar uma alma concede 6 de Defesa ao usuário.",
    "context": "Uma vitória reacende as correntes de quem ainda permanece.",
    "icon": "⌘",
    "effect": {
      "killShield": 6
    },
    "lore": "Uma vitória reacende as correntes de quem ainda permanece.",
    "glyph": "scar"
  },
  {
    "id": "opening-weakness",
    "title": "Selo de Abertura",
    "category": "offense",
    "text": "Técnicas de controle causam +3 de dano direto.",
    "context": "O selo antecipa o primeiro movimento da oposição.",
    "icon": "⌽",
    "effect": {
      "controlPower": 3
    },
    "lore": "O selo antecipa o primeiro movimento da oposição.",
    "glyph": "fortress"
  },
  {
    "id": "deep-root",
    "title": "Raiz Profunda",
    "category": "defense",
    "text": "Comece cada combate com 6 de Defesa e 1 de Armadura.",
    "context": "Raízes atravessam a pedra para amparar os vivos por baixo.",
    "icon": "❖",
    "effect": {
      "shield": 6,
      "armor": 1
    },
    "lore": "Raízes atravessam a pedra para amparar os vivos por baixo.",
    "glyph": "sunrise"
  },
  {
    "id": "grave-echo",
    "title": "Eco do Túmulo",
    "category": "defense",
    "text": "Cada aliado recebe +5 de Vida máxima; o primeiro abate de cada rodada gera 1 Ruptura.",
    "context": "Até os túmulos devolvem uma parte do que receberam.",
    "icon": "⛬",
    "effect": {
      "maxHp": 5,
      "essenceOnKill": 1
    },
    "lore": "Até os túmulos devolvem uma parte do que receberam.",
    "glyph": "key"
  },
  {
    "id": "double-current",
    "title": "Corrente Dupla",
    "category": "essence",
    "text": "Comece cada combate com 1 Éter e 1 Essência aleatória extras.",
    "context": "Dois rios espirituais correm lado a lado sem se misturar.",
    "icon": "☯",
    "effect": {
      "essence": 1,
      "randomEssence": 1
    },
    "lore": "Dois rios espirituais correm lado a lado sem se misturar.",
    "glyph": "chain"
  },
  {
    "id": "chainbreaker",
    "title": "Quebra-Corrente",
    "category": "identity",
    "text": "As habilidades de Limbo causam 6 a menos de dano ao usuário.",
    "context": "Uma corrente partida também pode abrir caminho para escapar.",
    "icon": "⛓",
    "effect": {
      "risk": -6
    },
    "lore": "Uma corrente partida também pode abrir caminho para escapar.",
    "glyph": "hourglass"
  },
  {
    "id": "suture",
    "title": "Sutura do Além",
    "category": "defense",
    "text": "A partir da segunda rodada, cada aliado recupera 2 de Vida por rodada.",
    "context": "A própria trilha fecha uma ferida enquanto ninguém olha.",
    "icon": "⤴",
    "effect": {
      "regeneration": 2
    },
    "lore": "A própria trilha fecha uma ferida enquanto ninguém olha.",
    "glyph": "rune"
  },
  {
    "id": "last-vow",
    "title": "Voto Derradeiro",
    "category": "defense",
    "text": "Usar a defesa pessoal restaura 6 de Vida.",
    "context": "Alguém jurou ficar até o fim — e a promessa ainda pesa.",
    "icon": "⚑",
    "effect": {
      "defenseHeal": 6
    },
    "lore": "Alguém jurou ficar até o fim — e a promessa ainda pesa.",
    "glyph": "lastword"
  },
  {
    "id": "hollow-edge",
    "title": "Lâmina Oca",
    "category": "offense",
    "text": "Técnicas de dano perfurante causam +3 de dano.",
    "context": "A lâmina não rompe a guarda; atravessa o espaço que ela deixa.",
    "icon": "◌",
    "effect": {
      "piercingPower": 3
    },
    "lore": "A lâmina não rompe a guarda; atravessa o espaço que ela deixa.",
    "glyph": "lance"
  },
  {
    "id": "rallying-cry",
    "title": "Chamado da Aurora",
    "category": "utility",
    "text": "A partir da segunda rodada, cada aliado recupera 1 de Vida; o primeiro apoio de cada rodada gera 1 Graça.",
    "context": "Uma voz chama os que ficaram para trás de volta à luta.",
    "icon": "♩",
    "effect": {
      "regeneration": 1,
      "supportEssence": 1
    },
    "lore": "Uma voz chama os que ficaram para trás de volta à luta.",
    "glyph": "shard"
  },
  {
    "id": "ashen-bargain",
    "title": "Pacto das Cinzas",
    "category": "offense",
    "text": "O trio causa +15% de dano; técnicas com custo de Vida cobram +3 de Vida.",
    "context": "A chama empresta poder sem esconder o preço da dívida.",
    "icon": "♟",
    "effect": {
      "damage": 0.15,
      "risk": 3
    },
    "lore": "A chama empresta poder sem esconder o preço da dívida.",
    "glyph": "anvil"
  },
  {
    "id": "hunted-mark",
    "title": "Marca da Caçada",
    "category": "offense",
    "text": "O primeiro golpe de cada aliado causa +4 de dano; alvos com 40% da Vida ou menos recebem +5 de dano.",
    "context": "Uma marca escura reúne o trio sobre a mesma presa.",
    "icon": "➶",
    "effect": {
      "firstStrike": 4,
      "executePower": 5
    },
    "lore": "Uma marca escura reúne o trio sobre a mesma presa.",
    "glyph": "well"
  },
  {
    "id": "shared-ward",
    "title": "Vigília Partilhada",
    "category": "defense",
    "text": "Habilidades que concedem Defesa concedem +4; usar apoio concede 2 de Defesa ao usuário.",
    "context": "Ninguém segura a vigília sozinho por muito tempo.",
    "icon": "♙",
    "effect": {
      "shieldPower": 4,
      "supportShield": 2
    },
    "lore": "Ninguém segura a vigília sozinho por muito tempo.",
    "glyph": "citadel"
  },
  {
    "id": "eclipse-step",
    "title": "Passo do Eclipse",
    "category": "offense",
    "text": "Técnicas de controle causam +5 de dano direto.",
    "context": "O instante entre luz e sombra torna o golpe inevitável.",
    "icon": "◐",
    "effect": {
      "controlPower": 5
    },
    "lore": "O instante entre luz e sombra torna o golpe inevitável.",
    "glyph": "return"
  },
  {
    "id": "ashen-regrowth",
    "title": "Rebrota nas Cinzas",
    "category": "defense",
    "text": "Cada aliado recebe +5 de Vida máxima; habilidades de cura restauram +4 de Vida.",
    "context": "Uma raiz verde rompe o solo onde tudo parecia consumido.",
    "icon": "⚘",
    "effect": {
      "maxHp": 5,
      "healPower": 4
    },
    "lore": "Uma raiz verde rompe o solo onde tudo parecia consumido.",
    "glyph": "split"
  }
];

