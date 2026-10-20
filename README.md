# Three Realms: Soul Arena

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
- Combate tático por turnos com técnicas, Essência compartilhada, alvo selecionável, dano, escudo, cura, controle e passivas de Elo.
- Trilhas com rotas ramificadas, combates normais e de elite, eventos, aprimoramentos, reparos, tesouros, mini-boss e Guardião final.
- Correntes da Alma como estabilidade da trilha; três derrotas encerram a tentativa.
- Confronto final contra Veynar após atravessar os 17 Elos.
- Salvamento de equipe e progresso em localStorage.

Inferno, Paraíso e Limbo convergem numa arena onde trios de almas decidem o destino dos três reinos.

## Direção visual

Interface escura com sinais vetoriais e cores próprias para cada Elo. O protótipo não usa retratos, cenas, marcas ou assets da obra que inspirou a versão anterior.

## Estado

Este é o primeiro slice jogável. Os 100 conceitos e seus nomes já estão no Codex; o balanceamento, a arte final e a campanha narrativa completa ainda podem ser expandidos.
