# Continuação das passivas e artes — 24/10/2026

## Continuação — Herdeiro, Chama e Fome

Mais sete passivas foram substituídas, completando as identidades mecânicas dos 12 personagens de Chama e Fome. O total passa de 49 para **56 de 100** passivas com gatilhos específicos ou recuperação por tipo de dano; **44** permanecem na fila. Custos e quatro espaços de técnica foram preservados.

| Personagem | Novo gatilho e recompensa, uma vez por rodada |
| --- | --- |
| Incendiário | Consumir Queimadura gera 1 Éter e concede 3 de Defesa. |
| Ressentido | Nutrir o Rancor precisa gastar carga e restaurar ao menos 15 de Vida real para gerar 1 Cinza. |
| Vingadora | Perder Vida para agressor com Queimadura dela devolve 4 de aflição e concede 3 de Defesa. |
| Colérico | Técnica ofensiva que gasta 2 ou mais cargas recupera 6 de Vida após o próprio custo de Vida. |
| Insaciável | Remover efetivamente ao menos 10 de Defesa por técnica recupera 4 de Vida. |
| Matriarca | Restaurar ao menos 6 de Vida de outro aliado rouba 1 Essência disponível, sem multiplicar pela cura do trio. |
| Credor | Consumir a própria Dívida rouba 1 Essência disponível e recupera 2 de Vida. |

O motor distingue Defesa removida de Defesa que absorve dano, registra cargas efetivamente gastas e verifica a autoria e a duração da Queimadura no agressor. Contra-ataques que anulam a técnica impedem as recompensas de remoção e gasto de cargas. As sete regras têm texto editorial em inglês.

O Herdeiro recebe seis cenas anime de uma efígie dinástica de porcelana viva: rosto adunco, olhos rubros, pescoço longo, corpo estreito, crista de cerâmica e antebraço esquerdo de correntes. Biografia em português e inglês acompanha a identidade; o kit e a defesa pessoal foram preservados. Prompts, correções e hashes estão em `ART_HERDEIRO_20261024.json`.

Nova simulação: 300 confrontos, 100 personagens, 32.263 etapas e 436 técnicas usadas. Normais: 47 vitórias / 50 derrotas / 3 limites; elites na Ruptura III: 3 / 96 / 1; chefes na Ruptura VI: 1 / 97 / 2. Os seis limites de 100 rodadas continuam registrados sem vencedor. Isso valida resolução e integridade do estado; a curva das Rupturas altas continua pendente de avaliação com builds e decisões humanas.

Verificação deste lote: **273 testes aprovados**, nenhuma falha; build de produção concluído; 626 caminhos ativos de arte presentes, nenhum ausente. Relatório reproduzível de simulação: `PASSIVES_CHAMA_FOME_SIM_20261024.json`.

## Lote anterior — Sangria, Coroa e Mentira

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

Conferência em produção: Codex público em português e inglês, busca pelos nomes localizados, biografia e passivas novas de Príncipe e Déspota. As seis imagens da Déspota carregaram no navegador. Evidência: `qa/despot-codex-20261024.jpg`.
