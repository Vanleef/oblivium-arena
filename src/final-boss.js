const base = '/art/characters/o-fim/approved-elo-union-20261023';

// The illustration suggests his presence; it is never a canonical face or body.
export const FINAL_BOSS = Object.freeze({
  id: 'the-end', name: 'O Fim', nameEn: 'The End', title: 'Rei do Inferno',
  realm: 'Inferno', affinity: 'cinza',
  portrait: `${base}/portrait.webp`,
  lore: 'O Fim não tem rosto nem forma fixos. Assume sempre a forma do maior medo de quem o olha: cada observador encara uma manifestação única, mesmo quando várias almas o veem ao mesmo tempo.',
  artNote: 'Nesta manifestação, um soberano de rosto vazio reúne traços dos Elos na coroa, nos vínculos partidos, nas cinzas e no marfim tomado por raízes. Sua presença é contida e ameaçadora. Nenhuma aparência é sua forma verdadeira.',
  abilities: Object.freeze(Object.fromEntries(['fenda','decreto','coroa','despertar'].map(id => [id, `${base}/skill-${id}.webp`])))
});

// One kit definition feeds both the encounter and the Codex.
export function createFinalBossAbilities() {
  return [
    { id: 'fenda', name: 'Fenda do Véu', kind: 'strike', costs: { affinity: 1 }, damage: 25, damageType: 'piercing', mark: 'fim', target: 'enemy', description: 'Causa 25 de dano perfurante e marca o alvo por 3 turnos.' },
    { id: 'decreto', name: 'Decreto do Fim', kind: 'control', costs: { affinity: 1, essence: 1 }, damage: 25, combo: { condition: 'mark:fim', bonusDamage: 15, stun: 1 }, cooldown: 2, target: 'enemy', description: 'Causa 25 de dano; contra a marca do Fim, +15 de dano e Atordoa por 1 turno.' },
    { id: 'coroa', name: 'Coroa que Não Cai', kind: 'guard', costs: { essence: 1, affinity: 1 }, shield: 20, target: 'team', cooldown: 1, description: 'Concede 20 de Defesa ao trio.' },
    { id: 'despertar', name: 'Fim Inalcançável', kind: 'defense', costs: { essence: 1 }, invulnerable: 1, defense: true, target: 'self', cooldown: 4, description: 'Fica Invulnerável por 1 turno. Recarga de 4 turnos.' }
  ].map(ability => ({...ability, art: FINAL_BOSS.abilities[ability.id]}));
}

