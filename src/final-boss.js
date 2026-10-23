const base = '/art/characters/o-fim/fear-revision-20261023';

// The illustration suggests his presence; it is never a canonical face or body.
export const FINAL_BOSS = Object.freeze({
  id: 'the-end', name: 'O Fim', nameEn: 'The End', title: 'Rei do Inferno',
  portrait: `${base}/portrait.webp`,
  lore: 'O Fim não tem rosto nem forma fixos. Assume sempre a forma do maior medo de quem o olha: cada observador encara uma manifestação única, mesmo quando várias almas o veem ao mesmo tempo.',
  artNote: 'Nenhuma aparência é sua forma verdadeira. Seu terror pertence a quem o encara.',
  abilities: Object.freeze(Object.fromEntries(['fenda','decreto','coroa','despertar'].map(id => [id, `${base}/skill-${id}.webp`])))
});
