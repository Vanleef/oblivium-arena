# PMA: Post Mortem Arena

Protótipo original de combate tático 3v3 e progressão roguelite. Almas despertam no conflito entre Inferno, Paraíso e Limbo, formam Trios e atravessam trilhas de poder.

## Executar

Requer Node.js 20 ou superior. O protótipo não usa dependências externas.

    npm run dev

Abra http://localhost:4173. Para validar as regras e o elenco:

    npm test

Para conferir visualmente início, bifurcações e conselho em larguras de 320 a 1200px, abra `/tests/fixtures/trail.html` na prévia. O cenário é isolado e não lê nem modifica o progresso salvo do jogo.

## O que já funciona

- Catálogo jogável com 100 personagens, 400 técnicas principais e 56 técnicas alternativas: 54 Inferno, 35 Paraíso e 11 Limbo.
- Trio local salvo no navegador, busca e recrutamento por conclusão de Elo.
- Ressonância Completa, Parcial e Caótica, incluindo interações com Correntes Quebradas.
- Combate tático por turnos com uma ação por personagem, seleção de alvo, fila reordenável e confirmação antes da resposta adversária. Essência compartilhada e afinidades de Cinza, Graça e Ruptura; aliados vivos geram Essência para o trio.
- Dificuldade crescente do Véu intacto às Rupturas I–VI, com recompensas proporcionais e inimigos que ganham Vida, dano, Defesa e regeneração; a IA avalia os kits e foca ameaças visíveis.
- Quatro técnicas por personagem com custos, recargas, aflições, marcas, cargas, Defesa destrutível e contra-ataques. A quarta técnica concede Invulnerável por 1 turno e tem recarga de 4 turnos.
- Retrato, passiva e quatro artes de habilidade para 74 personagens: o trio inicial e 71 personagens de Sangria, Coroa, Mentira, Chama, Fome, Podridão, Silêncio, Carne, Vazio, Proteção, Cura e Justiça; O Fim tem retrato próprio.
- Mapas de sete andares com conexões reais entre rotas, combates normais e de elite, eventos, aprimoramentos, descanso, tesouro, mercador, mini-boss e Guardião final.
- Catálogo com 35 aprimoramentos de combate, cada um com símbolo, categoria e contexto próprios; as ofertas evitam repetir categorias quando possível.
- Legados permanentes de campanha com efeitos cumulativos limitados e melhorias que escalam conforme a Ruptura.
- Vida do trio persiste entre encontros; descanso, evento e mercador permitem recuperar a formação. Vitórias de elite recompensam um aprimoramento da trilha.
- Escudos limitados a metade da Vida máxima por unidade para evitar acúmulo ilimitado e confrontos travados.
- Correntes da Alma como estabilidade da trilha; três derrotas encerram a tentativa.
- Confronto final contra O Fim (The End), Rei do Inferno, após atravessar os 17 Elos.
- Salvamento de equipe e progresso em localStorage.

PMA: Post Mortem Arena — três reinos, um trio de almas e o destino do além em jogo.

## Direção visual

Anime japonês 2D de fantasia sobrenatural, com line art forte, sombras em cel shading e efeitos desenhados para cada técnica. Os personagens têm rostos, corpos, roupas e silhuetas próprios; passivas e habilidades usam composições distintas ligadas ao efeito de cada golpe. A direção está registrada em `docs/ART_DIRECTION.md`.

## Estado

Este é um protótipo jogável com 100 kits implementados; 74 já têm conjuntos completos de seis imagens e O Fim tem retrato próprio. A cobertura visual dos outros 26 personagens e a campanha narrativa completa seguem em expansão.

## Catálogo e auditoria de kits

`docs/COMBAT_KITS.md` contém os 100 kits e as descrições usadas pelo jogo. Para atualizar o catálogo após editar os dados:

    node scripts/generate-kit-catalog.mjs

`tests/kits-audit.test.js` executa as 76 continuações de combo com preparações do próprio personagem, verifica que marcas e cargas têm uso e cobre durações, anulações e benefícios em área. O balanceamento entre equipes e Rupturas continua sujeito a partidas de avaliação.

O elenco de 100 kits recebeu estruturas de preparação, transformação, reação, crescimento e apoio, com 56 técnicas alternativas. Armadilhas, selos seletivos, regeneração e conversão de Essência acrescentam decisões sem mudar os quatro espaços. As estruturas estão documentadas em `docs/SKILL_FORMS.md` e verificadas em `tests/skill-forms.test.js`.

`node scripts/simulate-combat.mjs` reproduz 300 partidas completas com sementes fixas e recursos normais. `docs/COMBAT_QA.md` registra cobertura e limites dessa avaliação. A IA compara ações do trio, proteção dos alvos e utilidade do apoio antes de reservar Essência; não usa a fila do jogador nem sorteios futuros. Efeitos ativos podem ser consultados ao inspecionar uma alma, incluindo origem e gatilho das reações.

## Contas e campanha online

`npm run dev` inicia o jogo e a API local de contas na porta 4173. Usuários locais e progresso da campanha ficam em `.pma-dev-data.json`, arquivo ignorado pelo Git. Para uma implantação hospedada, conecte a integração Vercel KV/Upstash ou configure `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`. O servidor também aceita `PMA_DB_KV_REST_API_URL` e `PMA_DB_KV_REST_API_TOKEN`; não usa o token somente leitura para gravações de conta e não tem fallback para filesystem hospedado ou memória.
