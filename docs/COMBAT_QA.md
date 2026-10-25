# Avaliação automática de combates

Reprodução: `node scripts/simulate-combat.mjs`. São 300 partidas com sementes fixas, envolvendo os 100 personagens como integrantes do trio do jogador. As composições e os tipos de Essência variam por semente; a distribuição segue as regras normais, sem reservas artificiais ou Legados.

As ações do jogador de teste usam a mesma heurística da IA. Isso verifica a resolução completa e encontra interações problemáticas; não representa desempenho humano ou uma prova de equilíbrio entre personagens. Os três lotes combinam encontros e Rupturas diferentes. Para isolar a curva, o modo --difficulty-ladder repete 200 elites do Elo Sangria por nível, com as mesmas sementes, equipes e composição inimiga.

| Encontro | Ruptura | Partidas | Vitórias | Derrotas | Limite de turnos | Média de turnos |
| --- | --- | --- | --- | --- | --- | --- |
| normal | 0 | 100 | 58 | 39 | 3 | 26.1 |
| elite | 3 | 100 | 7 | 92 | 1 | 20.4 |
| boss | 6 | 100 | 1 | 98 | 1 | 17.1 |

Foram resolvidas 34868 etapas, com 429 técnicas distintas, 37 alternativas e 2494 trocas de Essência usadas pelo simulador. Cada etapa valida Vida e Defesa inteiras e dentro dos limites, saldo de Essência não negativo, quatro espaços de técnica, defesa pessoal com recarga 4 e resolução limitada. O plano da IA reserva apenas Essência disponível e uma ação por alma. Partidas que atingem 100 turnos são registradas como limite, sem declarar um vencedor.

## Geração e troca de Essência

Desde a abertura, cada lado recebe 1 Essência aleatória por personagem vivo. Os quatro tipos — Éter, Cinza, Graça e Ruptura — têm a mesma chance. O jogador e a IA podem trocar 5 unidades disponíveis por 1 do tipo escolhido. Com quatro tipos, quatro sorteios produzem em média uma unidade de cada tipo; a troca reduz o saldo em quatro e transforma essa variância em certeza, sem criar Essência.

A tabela abaixo preserva simulações feitas antes da correção do modelo de Essência e não mede a distribuição atual entre os quatro tipos. Os resultados de Ruptura I–VI refletem 200 partidas por nível sem Legados e antes da revisão da Essência inicial; não são uma previsão de taxa de vitória humana nem uma medição atual. A simulação comparativa atual, com a geração simétrica e um cenário de Legados por progressão, pode ser reproduzida com `node scripts/simulate-combat.mjs --difficulty-ladder`:

| Ruptura | Vitórias antigas | Derrotas | Limites | Média de turnos | Trocas médias por partida |
| --- | ---: | ---: | ---: | ---: | ---: |
| 0 | 38/200 (19%) | 161 | 1 | 18,6 | 6,98 |
| 1 | 14/200 (7%) | 186 | 0 | 15,9 | 6,19 |
| 2 | 6/200 (3%) | 194 | 0 | 14,6 | 5,86 |
| 3 | 1/200 (0,5%) | 199 | 0 | 12,7 | 5,05 |
| 4 | 1/200 (0,5%) | 199 | 0 | 11,8 | 4,70 |
| 5 | 0/200 (0%) | 200 | 0 | 11,3 | 4,45 |
| 6 | 0/200 (0%) | 200 | 0 | 10,7 | 4,17 |

Essas taxas são históricas, anteriores à abertura simétrica e ao ajuste da escala. A medição atual usa as mesmas sementes para os dois cenários; em cada partida, o cenário de progressão escolhe aleatoriamente um dos três Legados oferecidos por cada Ruptura anterior. Não é uma previsão de taxa humana:

| Ruptura | Sem Legados (vitórias/200) | Com Legados (vitórias/100) | Turnos médios sem / com Legados |
| --- | ---: | ---: | ---: |
| 0 | 61 (30,5%) | 32 (32%) | 18,9 / 20,2 |
| 1 | 41 (20,5%) | 22 (22%) | 17,7 / 19,6 |
| 2 | 15 (7,5%) | 5 (5%) | 15,4 / 16,0 |
| 3 | 11 (5,5%) | 9 (9%) | 15,0 / 16,9 |
| 4 | 3 (1,5%) | 1 (1%) | 13,7 / 15,2 |
| 5 | 0 (0%) | 1 (1%) | 13,0 / 14,6 |
| 6 | 0 (0%) | 0 (0%) | 12,5 / 14,1 |

A curva revisada concede espaço de reação e mais turnos nos níveis altos, mas a heurística ainda quase não vence Ruptura IV–VI, mesmo variando a escolha de Legados entre partidas. A revisão de dano, Ressonância, passivas e bônus de Elo manteve a curva difícil; este controlador perdeu 98,5% das elites de Sangria em Ruptura IV e não venceu as 200 elites de Ruptura VI sem Legados. Isso alerta para testar builds e equipes humanas, mas não mede a taxa real de jogadores. A troca de Essência segue 5:1 e não precisou ser alterada.

Uma segunda amostra usa 25 partidas por Ruptura nos Elos Sangria, Cura, Vazio e Correntes Quebradas, com as mesmas sementes nos cenários. Em cada dificuldade IV–VI, o conjunto totaliza 100 partidas por cenário:

| Ruptura | Sem Legados | Com Legados variados |
| --- | ---: | ---: |
| 4 | 0/100 | 1/100 |
| 5 | 0/100 | 1/100 |
| 6 | 0/100 | 1/100 |

O Elo Cura prolonga mais os combates de elite, com médias entre 24 e 38 turnos nesta amostra. Composição e caminho de Legados alteram o resultado; a amostra sem Legados não venceu em IV–VI, e a versão com Legados teve uma vitória por nível nesse intervalo.

## Passivas, formas e sinergia

34 passivas foram substituídas por gatilhos próprios, em geral limitados a uma ativação por rodada; outras três passaram a recuperar Vida por tipo de dano. O motor agora trata os eventos de começo de turno, consumo de condição, baixa, apoio, perda de Vida, gasto de Essência e mudança de Forma. Os dois lados recebem seus sorteios antes de qualquer passiva poder drenar ou converter a reserva; a prioridade alterna entre os lados a cada rodada.

Os arquétipos de Essência distinguem geração, conversão, gasto e manipulação da reserva adversária. Há 15 arquétipos catalogados, cada um com ícone e contexto, e todos têm pelo menos cinco personagens. O Codex e a ficha de combate mostram a identidade ativa da Forma. Oito personagens com mais de uma Forma mudam o papel principal ao transformar.

Quatro contra-ataques usam respostas diferentes: filtro espiritual/aflição com roubo, filtro físico/perfurante com Exposição, uma resposta condicionada a Defesa destrutível que gera Graça e uma resposta que drena Éter e expõe. Quatro sinergias pequenas acompanham aliados vivos: combos ganham +1 por parceiro adicional do mesmo Elo, até +2; Inferno reforça aflições aplicadas em até 2; Paraíso reforça curas em até 2; Limbo concede ao trio até 2 de Defesa no início da rodada.

As execuções de maior pico foram moderadas: O Furor perde 5 de dano base e 5 de bônus condicional na forma máxima; O Açougueiro e O Carrasco perdem 5 combinados; O Arauto perde 5 combinados. Ressonância agora concede 15% no trio completo, 8% na dupla, 11% na dupla com Limbo e 6% para uma equipe de Limbo sem dupla de Elo.

## Planejamento e apresentação

- A oposição decide no início da própria vez, depois da resolução do trio do jogador. A IA compara utilidade e custo entre as almas antes de reservar Essência, e pode trocar 5 unidades por 1 tipo específico se isso habilitar uma ação que não pode pagar com o saldo direto. Prevê dano com as mesmas funções de cálculo do motor, considera proteção e contra-ataques visíveis, distribui alvos após eliminações previstas e evita cura ou defesa pessoal sem utilidade. Em Ruptura II+, concentra fogo na ameaça mais perigosa; em Ruptura III+, também pesa mitigação para aliados e pressão de dano ao decidir usar defesa pessoal.
- A previsão é conservadora e usa apenas o estado atual: não consulta a fila do jogador nem sorteios futuros. Não é uma busca exaustiva por todas as sequências possíveis.
- A inspeção de personagem mostra os efeitos ativos com origem, gatilho e valores. O campo continua com quatro ícones por personagem.
- Reações de cura e proteção informam origem e beneficiários; a regeneração tem uma etapa de apresentação no início do turno.
