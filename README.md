# PMA: Post Mortem Arena

Protótipo original de combate tático 3v3 e progressão roguelite. Almas despertam no conflito entre Inferno, Paraíso e Limbo, formam Trios e atravessam trilhas de poder.

## Executar

Requer Node.js 20 ou superior. O protótipo não usa dependências externas.

    npm run dev

Abra http://localhost:4173. Para validar as regras e o elenco:

    npm test

## O que já funciona

- Catálogo original com 100 personagens planejados: 54 Inferno, 35 Paraíso e 11 Limbo.
- Trio local salvo no navegador, busca e recrutamento por conclusão de Elo.
- Ressonância Completa, Parcial e Caótica, incluindo interações com Correntes Quebradas.
- Combate tático por turnos com três ações do trio por rodada, alvo selecionável, intenções inimigas anunciadas e recursos compartilhados de Essência, Cinza, Graça e Ruptura.
- Quatro técnicas por personagem com custos, recargas e efeitos táticos: Enfraquecido, Exposto, Queimadura, Escudo, Provocação e Atordoado. Atordoamento interrompe uma intenção anunciada.
- Retrato, passiva e quatro artes de habilidade para 74 personagens: o trio inicial e 71 personagens de Sangria, Coroa, Mentira, Chama, Fome, Podridão, Silêncio, Carne, Vazio, Proteção, Cura e Justiça; O Fim tem retrato próprio.
- Mapas de sete andares com conexões reais entre rotas, combates normais e de elite, eventos, poderes, descanso, tesouro, mercador, mini-boss e Guardião final.
- Vida do trio persiste entre encontros; descanso, evento e mercador permitem recuperar a formação. Vitórias de elite recompensam um poder da trilha.
- Correntes da Alma como estabilidade da trilha; três derrotas encerram a tentativa.
- Confronto final contra O Fim (The End), Rei do Inferno, após atravessar os 17 Elos.
- Salvamento de equipe e progresso em localStorage.

PMA: Post Mortem Arena — três reinos, um trio de almas e o destino do além em jogo.

## Direção visual

Anime japonês 2D de fantasia sobrenatural, com line art forte, sombras em cel shading e efeitos desenhados para cada técnica. Os personagens têm rostos, corpos, roupas e silhuetas próprios; passivas e habilidades usam composições distintas ligadas ao efeito de cada golpe. A direção está registrada em `docs/ART_DIRECTION.md`.

## Estado

Este é o primeiro slice jogável. O elenco contém 100 personagens planejados; 74 já têm conjuntos completos de seis imagens e O Fim tem retrato próprio. A cobertura visual dos outros 26 personagens, o balanceamento e a campanha narrativa completa seguem em expansão.

