# Avaliação automática de combates

Reprodução: `node scripts/simulate-combat.mjs`. São 300 partidas com sementes fixas, envolvendo os 100 personagens como integrantes do trio do jogador. As composições e os recursos variam por semente; a energia segue as regras normais, sem reservas artificiais ou Legados.

As ações do jogador de teste usam a mesma heurística da IA. Isso verifica a resolução completa e encontra interações problemáticas; não representa desempenho humano ou uma prova de equilíbrio entre personagens. Os lotes de dificuldade usam encontros diferentes e não são uma comparação controlada de dificuldade.

| Encontro | Ruptura | Partidas | Vitórias | Derrotas | Limite de turnos | Média de turnos |
| --- | --- | --- | --- | --- | --- | --- |
| normal | 0 | 100 | 80 | 17 | 3 | 22.3 |
| elite | 3 | 100 | 8 | 88 | 4 | 26.4 |
| boss | 6 | 100 | 0 | 97 | 3 | 18.4 |

Foram resolvidas 30227 etapas, com 424 técnicas distintas e 35 alternativas usadas. Cada etapa valida Vida e Defesa inteiras e dentro dos limites, energia não negativa, quatro espaços de técnica, defesa pessoal com recarga 4 e resolução limitada. O plano da IA reserva apenas recursos existentes e uma ação por alma. Partidas que atingem 100 turnos são registradas como limite, sem declarar um vencedor.

## Planejamento e apresentação

- A oposição decide no início da própria vez, depois da resolução do trio do jogador. A IA compara utilidade e custo entre as almas antes de reservar energia. Prevê dano com as mesmas funções de cálculo do motor, considera proteção e contra-ataques visíveis, distribui alvos após eliminações previstas e evita cura ou defesa pessoal sem utilidade.
- A previsão é conservadora e usa apenas o estado atual: não consulta a fila do jogador nem sorteios futuros. Não é uma busca exaustiva por todas as sequências possíveis.
- A inspeção de personagem mostra os efeitos ativos com origem, gatilho e valores. O campo continua com quatro ícones por personagem.
- Reações de cura e proteção informam origem e beneficiários; a regeneração tem uma etapa de apresentação no início do turno.
