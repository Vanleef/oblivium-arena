// Display-only revisions: IDs and combat kits remain stable for existing saves.
const names = {
  'o-soberano-quebrado': 'Astíages', 'a-juiza-de-ferro': 'Feretime',
  'o-trono-vazio': 'Pérdicas', 'o-principe-das-correntes': 'Demétrio',
  'o-filho-da-cinza': 'Mitrídates', 'a-senhora-do-ultimo-pao': 'Helena',
  'a-marionetista-de-nervos': 'Aristágoras', 'a-ausencia': 'Nabonido',
  'o-escudo-vivo': 'Temístocles', 'o-que-ficou': 'Cinegiro',
  'a-jardineira-das-feridas': 'Dioscórides', 'o-pulso-sereno': 'Asclepíades',
  'o-portador-da-aurora': 'Aureliano', 'a-mensageira-do-amanha': 'Febe',
  'o-que-revela': 'Hecateu', 'o-espelho': 'Parrásio',
  'o-cultivador': 'Paládio', 'a-arquiteta-verde': 'Amani',
  'a-linha-partida': 'Empédocles', 'o-eco-sem-dono': 'Cassiodoro'
};
const titles = {
  'a-mae-rubra': ['A Matriarca', 'The Matriarch'],
  'a-senhora-do-ultimo-pao': ['A Acumuladora', 'The Hoarder'],
  'o-eco-sem-dono': ['O Eco Perdido', 'The Lost Echo']
};
const loreEdits = {
  'o-acougueiro': [['Balthasar Gérard', 'Baltasar'], ['alimenta Sangria', 'alimenta Flagelo']],
  'a-viuva-escarlate': [['oferece a Sangria', 'alimenta Flagelo']],
  'o-colecionador-de-cabecas': [['alimenta Sangria', 'alimenta Flagelo']],
  'gemeos-do-cutelo': [['de Sangria', 'de Flagelo']],
  'o-carrasco-sem-rosto': [['Sangria reconhece', 'Flagelo reconhece']],
  'a-mae-rubra': [['Sangria continua a caçada', 'a caçada continua em Flagelo']],
  'o-soberano-quebrado': [['que oferece a Coroa', 'que exerce em Magma']],
  'o-trono-vazio': [['de Coroa', 'em Magma']],
  'o-principe-das-correntes': [['de Coroa', 'de Magma']],
  'a-regente-de-cinzas': [['de Coroa', 'em Magma']],
  'o-herdeiro-cativo': [['de Coroa', 'de Magma']],
  'o-que-pesa': [['à opressão de Coroa', 'à opressão']]
};
export function reviseRosterCharacter(character) {
  const name = names[character.id];
  const title = titles[character.id];
  const edits = loreEdits[character.id];
  if (!name && !title && !edits) return character;
  let lore = character.lore;
  for (const [before, after] of edits || []) lore = lore?.replace(before, after);
  return {
    ...character,
    ...(name ? { name, englishName: name } : {}),
    ...(title ? { identityTitle: title[0], englishIdentityTitle: title[1] } : {}),
    ...(edits ? { lore } : {}),
    aliases: [...new Set([...(character.aliases || []), ...(name ? [character.name, character.englishName] : []), ...(title ? [character.identityTitle] : [])].filter(Boolean))]
  };
}
