# Oblivium Arena

Protótipo original de combate tático 3v3 e progressão roguelite. Almas despertam no conflito entre Inferno, Paraíso e Limbo, formam Trios e atravessam trilhas de poder.

## Executar

Requer Node.js 20 ou superior. O protótipo não usa dependências externas.

    npm run dev

Abra http://localhost:4173. Para validar as regras e o elenco:

    npm test

Para contar as artes referenciadas que ainda faltam no checkout:

    npm run audit:art

Use `npm run audit:art -- --list-missing` para listar todos os caminhos ausentes.

Para conferir visualmente início, bifurcações e conselho em larguras de 320 a 1200px, abra `/tests/fixtures/trail.html` na prévia. O cenário é isolado e não lê nem modifica o progresso salvo do jogo.

## O que já funciona

- Catálogo jogável com 100 personagens, 400 técnicas principais e 66 técnicas alternativas: 54 Inferno, 35 Paraíso e 11 Limbo.
- Trio local salvo no navegador, busca e recrutamento por conclusão de Elo.
- Ressonância Completa, Parcial e Caótica, incluindo interações com Correntes Quebradas.
- Combate tático por turnos: uma ação por personagem, seleção de alvo, fila reordenável e confirmação antes da resposta adversária. Desde a abertura, cada lado recebe uma Essência aleatória por alma viva. Nas rodadas seguintes, ambos recebem uma por personagem vivo entre quatro tipos — Éter, Cinza, Graça e Ruptura. Coringa é custo flexível: escolha cada unidade necessária entre esses quatro tipos. Com 5 unidades disponíveis, é possível escolher cinco pips para trocar por 1 de um tipo específico. A troca converte a variância em certeza com custo líquido de 4 pips; não cria Essência.
- Quatro técnicas por personagem com custos, recargas, aflições, marcas, cargas, Defesa destrutível e contra-ataques. A quarta técnica concede Invulnerável por 1 turno e tem recarga de 4 turnos.
- Oito personagens têm formas corporais com retratos distintos; o estado de forma acompanha transformações, limites de Vida e expiração de técnicas.
- 50 Legados permanentes divididos entre ofensiva, defesa e travessia. Cada Legado tem glifo próprio, efeito escalonado e contexto narrativo.
- O Codex apresenta arquétipo principal, variações de kit, afinidade e formas corporais; cada forma ativa mostra seu retrato e suas técnicas.
- Mapas de sete andares com conexões reais entre rotas, combates normais e de elite, eventos, poderes, descanso, tesouro, mercador, mini-boss e Guardião final.
- Vida do trio persiste entre encontros; descanso, evento e mercador permitem recuperar a formação. Vitórias de elite recompensam um poder da trilha.
- Correntes da Alma como estabilidade da trilha; três derrotas encerram a tentativa.
- Confronto final contra O Fim (The End), Rei do Inferno, após atravessar os 17 Elos.
- Salvamento de equipe e progresso em localStorage.

Oblivium Arena — três reinos, um trio de almas e o destino do além em jogo.

## Direção visual

Anime japonês 2D de fantasia sobrenatural, com line art forte, sombras em cel shading e efeitos desenhados para cada técnica. Os personagens têm rostos, corpos, roupas e silhuetas próprios; passivas e habilidades usam composições distintas ligadas ao efeito de cada golpe. A direção está registrada em `docs/ART_DIRECTION.md`.

## Estado

Este é um protótipo jogável com 100 kits implementados; oito personagens têm mais de uma forma, com três kits transformáveis completos adicionados nesta reformulação. A revisão de arte do restante do elenco e o ajuste fino por dificuldade seguem em expansão.


## Catálogo e auditoria de kits

`docs/COMBAT_KITS.md` contém os 100 kits e as descrições usadas pelo jogo. Para atualizar o catálogo após editar os dados:

    node scripts/generate-kit-catalog.mjs

`tests/kits-audit.test.js` executa as 76 continuações de combo com preparações do próprio personagem, verifica que marcas e cargas têm uso e cobre durações, anulações e benefícios em área. O balanceamento entre equipes e Rupturas continua sujeito a partidas de avaliação.

O elenco de 100 kits é distribuído por 13 arquétipos combináveis, com 66 técnicas alternativas. Armadilhas, selos seletivos, regeneração e conversão de Essência acrescentam decisões sem mudar os quatro espaços. As estruturas estão documentadas em `docs/COMBAT_KITS.md` e verificadas em `tests/skill-forms.test.js`.

`node scripts/simulate-combat.mjs` reproduz 300 partidas completas com sementes fixas e tipos de Essência normais. `node scripts/simulate-combat.mjs --difficulty-ladder` compara 200 partidas por nível em encontros de elite do mesmo Elo e com as mesmas sementes. `docs/COMBAT_QA.md` registra resultados e limites das avaliações. A IA compara ações do trio, proteção dos alvos e utilidade do apoio antes de reservar Essência; a partir de Ruptura II prioriza ameaças visíveis e em Ruptura III+ estima a pressão sobre seus aliados. Não consulta a fila do jogador nem sorteios futuros. Efeitos ativos podem ser consultados ao inspecionar uma alma, incluindo origem e gatilho das reações.

`node scripts/simulate-combat.mjs --difficulty-sample` executa uma amostra menor nas Rupturas IV–VI para Sangria, Cura, Vazio e Correntes Quebradas, com e sem Legados variados por partida.

## Contas e campanha online

`npm run dev` starts the game and local account API on port 4173. Local users and campaign progress persist in the ignored `.pma-dev-data.json` file. For a hosted deployment, connect the Vercel KV/Upstash integration or configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. The server also accepts the integration variables `PMA_DB_KV_REST_API_URL` and `PMA_DB_KV_REST_API_TOKEN`; it never uses the read-only token for account writes and has no hosted filesystem or in-memory fallback.

## Build de produção

`npm run build` valida JavaScript e imports e gera `dist/` com os arquivos públicos. A Vercel usa esse diretório para o site e compila as APIs em `api/` como funções, com seus módulos de `src/` e `server/`.
