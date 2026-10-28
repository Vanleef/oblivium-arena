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
const englishNames = {
  'o-soberano-quebrado': 'Astyages', 'a-juiza-de-ferro': 'Pheretime',
  'o-trono-vazio': 'Perdiccas', 'o-principe-das-correntes': 'Demetrius',
  'o-filho-da-cinza': 'Mithridates', 'a-marionetista-de-nervos': 'Aristagoras',
  'a-ausencia': 'Nabonidus', 'o-escudo-vivo': 'Themistocles',
  'o-que-ficou': 'Cynaegirus', 'a-jardineira-das-feridas': 'Dioscorides',
  'o-pulso-sereno': 'Asclepiades', 'o-portador-da-aurora': 'Aurelian',
  'a-mensageira-do-amanha': 'Phoebe', 'o-que-revela': 'Hecataeus',
  'o-espelho': 'Parrhasius', 'o-cultivador': 'Palladius',
  'a-linha-partida': 'Empedocles'
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
  'o-que-pesa': [['à opressão de Coroa', 'à opressão']],
  'o-sussurro': [['nos canais de Mentira', 'nos canais de Malebolge']],
  'a-mascara-dupla': [['que Mentira permite fabricar', 'que o engano permite fabricar']],
  'o-corretor-de-memorias': [['que Mentira tornou convenientes', 'que a falsificação tornou convenientes']],
  'o-incendiario': [['Alimenta Chama ao', 'Alimenta o rancor ao']],
  'a-brasa-eterna': [['ódio de Chama', 'ódio ardente']],
  'o-odio-encarnado': [['fortalece Chama', 'alimenta sua fúria']],
  'o-filho-da-cinza': [['vingança de Chama', 'vingança em fogo']],
  'a-pira-errante': [['vingança de Chama', 'vingança em fogo']],
  'o-coracao-em-furia': [['Alimenta Chama pelo', 'Alimenta a própria fúria pelo']],
  'o-estomago-sem-fundo': [['cobrança de Fome', 'cobrança voraz']],
  'o-credor': [['Fome prospera', 'A dependência prospera']],
  'o-apodrecido': [['influência de Podridão', 'influência da decadência']],
  'a-praga-andante': [['propagando Podridão', 'espalhando a praga']],
  'o-corrupto': [['alimenta Podridão', 'alimenta a corrupção']],
  'a-rainha-dos-fungos': [['espalhar Podridão', 'espalhar a infestação']],
  'o-medico-de-vermes': [['corrupção de Podridão', 'corrupção espiritual']],
  'o-jardim-morto': [['fazer Podridão avançar', 'fazer a decadência avançar']],
  'o-surdo': [['omissão de Silêncio', 'omissão e abandono']],
  'o-desejo-quebrado': [['abuso que alimenta Carne', 'abuso que impõe']],
  'a-marionetista-de-nervos': [['abuso que fortalece Carne', 'abuso que prolonga seu domínio']],
  'o-espelho-carnal': [['abuso que fortalecem Carne', 'abuso que prolongam seu domínio']],
  'o-que-apaga': [['apagamento de Vazio', 'apagamento absoluto']],
  'a-ultima-pagina': [['força para Vazio', 'força para Blasfêmia']],
  'o-lugar-de-ninguem': [['expandindo Vazio', 'expandindo Blasfêmia']],
  'o-ultimo-guardiao': [['limiar de Proteção', 'limiar da defesa']],
  'a-sentinela-azul': [['mantém Proteção atenta', 'mantém sua guarda atenta']],
  'a-luz-que-restaura': [['cuidado de Cura', 'cuidado que restaura']],
  'o-pulso-sereno': [['Cura se manifesta', 'A compaixão se manifesta']],
  'o-equilibrio': [['proporção da Justiça', 'proporção justa']],
  'a-lamina-justa': [['Sua força em Justiça', 'Sua força']],
  'a-testemunha-integra': [['dá a Justiça uma voz', 'dá à justiça uma voz']],
  'a-chama-que-nao-apaga': [['fortalece Esperança', 'mantém viva a esperança']],
  'o-que-levanta': [['perseverança de Esperança', 'perseverança']],
  'o-que-revela': [['Em Verdade, sua presença', 'Com clareza, sua presença']],
  'a-luz-nua': [['sem fazer da revelação um ato de crueldade', 'sem crueldade']],
  'o-espelho': [['em Verdade conserva', 'com clareza conserva']],
  'o-elo-dourado': [['União se fortalece', 'A união se fortalece']],
  'a-que-une': [['distinguindo a União da manipulação de Carne e Mentira', 'distinguindo laços consentidos da manipulação e do controle']],
  'o-vinculo': [['a força de União nasce', 'a força do vínculo nasce']],
  'os-tres-irmaos': [['em uma cadência que só existe', 'numa cadência que só existe'], ['em presença de União', 'em cooperação']],
  'a-semente': [['nas ruínas de Criação', 'em meio às ruínas'], ['à Criação um lugar', 'à vida um lugar']],
  'o-cultivador': [['Criação cresce', 'A vida cresce']],
  'a-arquiteta-verde': [['dá a Criação um lugar', 'dá à vida um lugar']],
  'o-primeiro-canto': [['matéria espiritual de Criação', 'matéria espiritual viva']],
  'o-fim-silencioso': [['manifestação do Vazio', 'manifestação da Blasfêmia']],
  'silas': [['resistir à Carne', 'resistir ao abuso']],
  'hans': [['conhece a Podridão', 'conhece a decadência']]
};
export function reviseRosterCharacter(character) {
  const name = names[character.id];
  const title = titles[character.id];
  const englishName = englishNames[character.id];
  const edits = loreEdits[character.id];
  if (!name && !title && !englishName && !edits) return character;
  let lore = character.lore;
  for (const [before, after] of edits || []) lore = lore?.replace(before, after);
  return {
    ...character,
    ...(name ? { name } : {}),
    ...(englishName ? { englishName } : {}),
    ...(title ? { identityTitle: title[0], englishIdentityTitle: title[1] } : {}),
    ...(edits ? { lore } : {}),
    aliases: [...new Set([...(character.aliases || []), ...(name ? [character.name, character.englishName] : []), ...(title ? [character.identityTitle] : [])].filter(Boolean))]
  };
}
