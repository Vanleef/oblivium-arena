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
- Combate tático por turnos com Essência compartilhada e afinidades de Cinza, Graça e Ruptura; aliados vivos geram recursos para o trio.
- Quatro técnicas por personagem: ataque básico gratuito, técnicas com custos de afinidade e uma quarta técnica defensiva.
- Retrato, passiva e quatro artes de habilidade para 56 personagens: o trio inicial e 53 personagens de Sangria, Coroa, Mentira, Chama, Fome, Podridão, Silêncio, Carne e Vazio; O Fim tem retrato próprio.
- Trilhas com rotas ramificadas, combates normais e de elite, eventos, aprimoramentos, reparos, tesouros, mini-boss e Guardião final.
- Correntes da Alma como estabilidade da trilha; três derrotas encerram a tentativa.
- Confronto final contra O Fim (The End), Rei do Inferno, após atravessar os 17 Elos.
- Salvamento de equipe e progresso em localStorage.

PMA: Post Mortem Arena — três reinos, um trio de almas e o destino do além em jogo.

## Direção visual

Anime japonês 2D de fantasia sobrenatural, com line art forte, sombras em cel shading e efeitos desenhados para cada técnica. Os personagens têm rostos, corpos, roupas e silhuetas próprios; passivas e habilidades usam composições distintas ligadas ao efeito de cada golpe. A direção está registrada em `docs/ART_DIRECTION.md`.

## Estado

Este é o primeiro slice jogável. O elenco contém 100 personagens planejados; 56 já têm conjuntos completos de seis imagens e O Fim tem retrato próprio. A cobertura visual dos outros 44 personagens, o balanceamento e a campanha narrativa completa seguem em expansão.
