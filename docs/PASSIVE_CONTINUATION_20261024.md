# Continuação das passivas e artes — 24/10/2026

## Passivas

Doze passivas genéricas de Sangria, Coroa e Mentira foram substituídas. Os 18 personagens desses três Elos agora têm gatilhos com assinaturas mecânicas distintas. O elenco soma 49 passivas com gatilhos específicos ou recuperação ligada ao tipo de dano; as outras 51 continuam na fila de revisão. Os 100 personagens foram preservados.

| Personagem | Identidade da passiva |
| --- | --- |
| O Colecionador | Um abate concede carga e Defesa, uma vez por rodada. |
| Gêmeos do Cutelo | Ferir alvo Exposto com Sangramento dos Gêmeos recupera Vida e gera Ruptura. |
| O Carrasco | Ferir vítima já Atordoada recupera Vida e remove um Coringa disponível da oposição. |
| A Mãe Rubra | Cura efetiva de outro aliado também o protege e recupera parte da Vida da usuária. |
| O Soberano | Assumir Coroa Soberana concede uma proteção adicional. |
| A Magistrada | Ferir alvo Exposto concede Defesa e remove Graça disponível da oposição. |
| O Príncipe | Ferir vítima que já carrega sua Marca concede Defesa. |
| A Déspota | Apoio que efetivamente concede Defesa gera Cinza. |
| O Sussurro | Ferir vítima com seu Veneno converte Éter restante em Coringa. |
| O Intrigante | Ferir vítima que já carrega sua Marca enfraquece sua resposta. |
| A Serpe | Dano perfurante efetivo contra alvo Exposto recupera Vida. |
| O Impostor | Recuperação pessoal efetiva por técnica concede Defesa e gera Graça. |

As doze descrições receberam tradução editorial em inglês. Coringa continua sendo Wildcard. Custos, limites, beneficiados e condições estão nos dados e nas descrições usadas pelo jogo.

## Correções no motor

- O primeiro acerto que exige dano efetivo aguarda perda de Vida; absorção integral pela Defesa não consome essa passiva.
- As passivas de morte da Viúva e da Brasa observam vítimas preparadas por elas, inclusive quando o golpe final vem de um aliado, de aflição, de contra-ataque ou de uma reação.
- A morte é notificada uma única vez. Aflições posteriores não continuam ferindo uma alma já derrotada.
- Passivas de consumo verificam a condição consumida. Marcas alheias, autocura, sobrecura, defesa pessoal e dano totalmente absorvido são cobertos por testes negativos.
- O limite por rodada e a autoria das Marcas persistem após serialização, inclusive para o lado adversário.
- A previsão da IA usa o limite real de Defesa proporcional à Vida máxima.

## Artes e contagem

A contagem de 131 presentes e 494 ausentes do anexo vinha de um checkout parcial. A conferência da main encontrou todos os 625 caminhos então referenciados. Após a nova arte de Apertar o Grilhão, são 626 caminhos ativos, todos presentes. A revisão estilística continua por personagem.

O Príncipe recebeu sete imagens anime próprias: retrato, passiva, quatro técnicas e a continuação Apertar o Grilhão. A mão da continuação foi corrigida para preservar as mãos descobertas. Prompts, versões, dimensões e hashes constam de `ART_PRINCIPE_20261024.json`.

A Déspota recebeu seis cenas completas com sua nova identidade de matriarca de cinza. Rosto, idade, corpo volumoso, olhos distintos, tranças e acessórios permanecem coerentes em todas as cenas. Ordem Absoluta mostra os três beneficiados e mantém a identidade do Príncipe e do Suserano. Prompts e hashes estão em `ART_DESPOTA_20261024.json`.

A diretriz de diversidade corporal e facial está em `CHARACTER_VISUAL_IDENTITIES.md`. A geração usa o recurso integrado image_gen; os arquivos destinados ao jogo são exportados completos para WebP 512 × 512.

## Verificação

A simulação cobriu 300 confrontos, 100 personagens, 31.996 etapas e 437 técnicas. Cinco confrontos alcançaram o limite de 100 rodadas. A dificuldade de elites e chefes continua exigindo playtests de builds humanas; a simulação entre heurísticas não encerra a avaliação de equilíbrio.

Verificação final: 263 testes aprovados, nenhuma falha; build de produção gerado. As sete artes do Príncipe e seis da Déspota têm hashes, unicidade e referências verificadas.
