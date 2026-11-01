# Oblivium Arena — índice canônico do projeto

Este documento descreve o cânone e os dados da revisão de desenvolvimento (`art/oblivium-arena-anime-first-20261027`, PR #3). A branch `main` pode conter uma versão jogável anterior; sua presença na documentação não significa que o PR foi integrado ou publicado.

Gerado por `npm run docs:generate`. Nomes e títulos: `src/roster-identity-overrides.js`; elenco: `src/data.js`; Reinos: `src/kingdoms.js`; campanha: `src/progression.js` e `src/story-content.js`. IDs e aliases históricos preservam salvamentos e caminhos de arte.

## Referências vigentes

| Assunto | Documento |
| --- | --- |
| Premissa e regras da IP | [IP.md](IP.md) |
| Cosmologia, líderes e Nilo | [COSMOLOGY_AND_NILO.md](COSMOLOGY_AND_NILO.md) |
| História e capítulos dos Mundos | [STORY.md](STORY.md) |
| Mundos, Reinos, trilhas e recompensas | [WORLD_CATALOG.md](WORLD_CATALOG.md) |
| Nomes, títulos, aliases e lore de todo o elenco | [CHARACTER_CATALOG.md](CHARACTER_CATALOG.md) |
| Dados estruturados do catálogo | [CHARACTER_CATALOG.json](CHARACTER_CATALOG.json) |
| Progressão e recrutamento | [CAMPAIGN.md](CAMPAIGN.md) |
| Kits completos | [COMBAT_KITS.md](COMBAT_KITS.md) |
| Formas e continuações | [SKILL_FORMS.md](SKILL_FORMS.md) |
| Direção visual | [ART_DIRECTION.md](ART_DIRECTION.md) |
| Identidades físicas e figurinos | [CHARACTER_VISUAL_IDENTITIES.md](CHARACTER_VISUAL_IDENTITIES.md) |
| Estado da migração visual | [ART_REVISION_STATUS.md](ART_REVISION_STATUS.md) |

## Convenções

- Marca: **Oblivium Arena**. PMA e Post Mortem Arena são nomes históricos; IDs, arquivos e variáveis com esse prefixo podem continuar por compatibilidade.
- Hierarquia: **Mundo → Reino → trilha**. Há três Mundos e 22 Reinos, com três trilhas por Reino.
- Líderes: **Niith — O Fim; Seraph — O Prólogo; Zalmoxis — A Abnegação**. Nomes anteriores são aliases, não novos personagens.
- Elenco: **150 entradas**, incluindo 100 originais e 50 entradas narrativas. Versões da mesma pessoa não são indivíduos novos na cosmologia.
- Essências: **Éter, Cinza, Graça e Ruptura**. Coringa significa qualquer Essência.
- Identidade persistente: o ID técnico não muda quando o nome ou o título é revisado.
- Relatórios datados e revisões antigas são histórico. Suas contagens e propostas não substituem estas referências. Registros JSON de produção preservam seus prompts, nomes de época e caminhos originais.

## Elenco por Mundo

| Mundo | Reinos | Entradas |
| --- | ---: | ---: |
| Inferno | 9 | 79 |
| Paraíso | 9 | 47 |
| Limbo | 4 | 24 |

## Manutenção

Execute `npm run docs:generate` após alterar identidades, localização, história ou desbloqueios. O comando atualiza catálogo, história, mapa de recompensas, formas e kits. Textos autorais da cosmologia, campanha e direção de arte exigem revisão editorial quando a regra correspondente mudar. Não usar uma substituição global para renomear IDs, caminhos de arte ou chaves de salvamento.
