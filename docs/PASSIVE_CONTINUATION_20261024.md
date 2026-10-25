# Continuação das passivas e artes — 24/10/2026

## Continuação — Carne e Vazio

Oito personagens receberam passivas próprias e os 12 integrantes de Carne e Vazio agora têm gatilhos explícitos, com texto em inglês. A contagem auditada sobe de 64 para **71 de 100**; **29** ainda aguardam revisão. O Usurpador já era contado na etapa anterior por sua recuperação personalizada por tipo de dano; a troca por um gatilho de Marca torna a regra mais específica sem inflar a contagem.

| Personagem | Novo gatilho e recompensa, uma vez por rodada |
| --- | --- |
| O Usurpador | Ferir alguém que já tem a Marca da Posse rouba 1 Essência disponível e recupera 4 de Vida. |
| O Profanador | Com 50 de Vida ou menos, atingir um alvo já Exposto com dano perfurante concede 1 carga e 3 de Defesa. |
| A Marionetista | Ferir alguém que já tem sua Marca Nervosa deixa a vítima Enfraquecida por 1 turno. |
| A Suturadora | Limpar uma condição e restaurar ao menos 10 de Vida de outro aliado também lhe concede 5 de Defesa e gera 1 Graça. |
| O Anulador | Remover uma vantagem ativa drena 1 Graça disponível do inimigo e concede 1 carga. |
| O Arauto | Ferir um alvo já Atordoado concede 1 carga e gera 1 Ruptura. |
| O Desolador | Com 50 de Vida ou menos, uma técnica ofensiva que gasta carga recupera 5 de Vida e gera 1 Essência aleatória. |
| A Escriba | Consumir sua Marca da Página concede 1 carga e gera 1 Cinza. |

As regras exigem dano real, Marca própria, limpeza e cura efetivas, remoção de bônus ativa ou gasto real de carga conforme cada gatilho. A auditoria confirma 12 assinaturas diferentes entre os dois Elos.

## Continuação — O Fim

O Fim preserva a silhueta aprovada da forma original, agora sem coroa, e transforma de fato o corpo nas manifestações. Tirano é a única forma com coroa: uma diadema de guerra baixa, larga e assimétrica; o corpo vira um colosso curvado de punhos enormes, com um único fragmento de marfim. O Predador mantém seu visual rasteiro, furtivo e móvel, sem coroa. A Ruína flutua sem coroa, sem manto e sem placas simétricas, com torso fragmentado, quatro braços e fios violetas. Rosto-vazio, olhos rubros discretos, elos dourados e poucos detalhes de marfim mantêm o parentesco com O Fim.

Os papéis mecânicos seguem distintos: Tirano (Berserker · Cinza) quebra Defesa e ganha força conforme perde Vida; Predador (Executor · Ruptura) marca, persegue e drena; Ruína (Interditor · Graça) prende, interrompe e sela apoio. Os efeitos de entrada permanecem diferentes. O seletor do Codex expõe arquétipo e afinidade por forma; filtros e busca encontram as manifestações pelos nomes, arquétipos ou Essências.

Os oito retratos e cenas novos do Tirano e da Ruína e seus hashes estão em `ART_O_FIM_TRANSFORMED_20261025.json`; os dois arquivos da forma original sem coroa estão em `ART_O_FIM_CROWNLESS_ORIGINAL_20261025.json`. As silhuetas e os kits estão em `O_FIM_FORMS_REVISION_20261025.md`. O conjunto do Predador permanece inalterado.

Verificação: build com 938 arquivos; auditoria de 100 personagens e 675 referências (626 caminhos presentes, nenhum ausente); commit `6471ab162d189a1123b430ef2024923e23157636` na `main` e deploy de produção `READY`. O Codex público confirma a forma original e Fim Inalcançável sem coroa; Tirano com sua nova diadema; Predador com a arte preservada; Ruína sem coroa, com quatro braços espectrais. A suíte não foi reexecutada após este ajuste visual; a revisão anterior teve 304 testes aprovados.

## Continuação — Podridão, Silêncio e O Sussurro

Oito passivas de Podridão e Silêncio ganharam gatilhos próprios. Com as duas regras já específicas de cada Elo, os 12 personagens destes dois Elos estão cobertos. O total da revisão passa de 56 para **64 de 100** passivas com gatilho específico ou recuperação ligada ao tipo de dano; **36** continuam na fila. Cada gatilho limita a recompensa a uma vez por rodada, exceto Oportunismo, que é uma vez por combate.

| Personagem | Regra revisada |
| --- | --- |
| A Pestilência | Recupera 3 de Vida e gera Cinza quando dois inimigos vivos ainda têm Veneno próprio no início do turno. |
| O Corrupto | Só recebe Defesa e rouba Essência se a técnica realmente remover um bônus, uma redução ou um Contra-ataque. |
| O Inoculador | Exige limpeza de condição prejudicial e cura efetiva de ao menos 10 em outro aliado. |
| O Definhador | Ferir alvo com Decadência própria cura o aliado vivo com menor porcentagem de Vida; área não duplica o efeito. |
| O Espectador | Ganha carga e Defesa quando seu Contra-ataque realmente anula uma técnica inimiga. |
| O Silenciador | Precisa causar dano espiritual efetivo a um alvo já Enfraquecido para selar apoio. |
| A Cúmplice | O Contra-ataque precisa proteger outro aliado e anular uma ação para gerar Graça e Defesa ao protegido. |
| O Desertor | Uma vez por combate, dano físico efetivo a um alvo já Exposto cura e tenta roubar Ruptura. |

As passivas restantes de Podridão e Silêncio também foram conferidas: consumo de Decadência respeita sua condição; Colônia Viva e Abrigo dos Cúmplices verificam a reserva no começo do turno; Hospitalidade Negada verifica aflições persistentes. O teste negativo cobre alvos mortos, aflições de outro autor, efeitos expirados, dano absorvido, cura bloqueada, sobrecura, Contra-ataques incompatíveis e origem morta.

O Sussurro recebe seis cenas anime próprias de um espírito anfíbio baixo e largo: cabeça calva achatada, olhos jade estreitos, pele verde-petróleo com sardas cobre, mãos palmadas e bolsa vocal translúcida. O casaco ameixa, colete marfim, faixa azul-marinho, tubo de latão e leque de ferro acompanham todo o conjunto. As cenas variam entre canal sob chuva, casa de contas, telhado com varais, mercado, ponte e aqueduto. A biografia acompanha essa identidade em português e inglês. Os caminhos finais e os prompts completos estão em `ART_SUSSURRO_ANFIBIO_20261024.json`; as imagens foram exportadas completas para WebP 512 × 512, sem recorte.

O conjunto intermediário com trança curta e uniforme escuro permanece preservado em `anime-review-20261024` e no inventário `ART_SUSSURRO_20261024.json`. O conjunto ativo usa `anime-amphibian-20261024`, com os traços descritos acima e as cenas coerentes com o leque de ferro e a conversão de Éter.

A revisão mantém quatro espaços de técnica, os valores-base de dano e a defesa pessoal com recarga 4. As afinidades derivadas do kit passam de Graça para Cinza no Inoculador e de Ruptura para Graça na Cúmplice, acompanhando suas novas passivas; a quantidade total exigida por técnica não mudou. Coringa continua traduzido como Wildcard.

O motor conta condições realmente limpas e bônus realmente removidos. Uma preparação de Contra-ataque mais fraca preserva o valor, o filtro e a autoria da resposta mais forte; a morte da origem não transfere sua passiva ao protegido. A previsão da IA respeita a exigência de Defesa para ativar um Contra-ataque. A última aplicação letal de uma aflição notifica o abate antes de expirar, preservando a recompensa da Brasa.

A simulação atual resolveu 300 confrontos, 32.424 etapas, 434 técnicas e 43 alternativas. Normais: 51 vitórias, 47 derrotas e 2 limites; elites na Ruptura III: 5 vitórias, 94 derrotas e 1 limite; chefes na Ruptura VI: 1 vitória, 98 derrotas e 1 limite. Os quatro limites de 100 rodadas não receberam vencedor. Isso verifica integridade e execução; as Rupturas altas ainda exigem playtests com builds e decisões humanas. Relatório: `PASSIVES_PODRIDAO_SILENCIO_SIM_20261024.json`.

Verificação deste lote: **293 testes aprovados**, nenhuma falha; build de produção concluído; 626 caminhos ativos de arte presentes, nenhum ausente. A identidade e os seis arquivos finais do Sussurro têm referências, unicidade, dimensões e hashes conferidos.

Conferência em produção: deploy `dd49eb6421471491d32d3943fbc75451619eb550`, READY. A biografia foi conferida em português e inglês; Coringa aparece como Wildcard. As seis imagens do conjunto final carregaram e o rosto permanece inteiro no cartão. As 12 regras de Podridão e Silêncio foram verificadas em inglês. Evidência: `qa/sussurro-amphibian-codex-20261024.jpg`.

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

Conferência em produção: deploy funcional `2246c349567865a3f1baa89c6c95a77299993c04` e ajuste de enquadramento `82febbe7604b4e4f3495c9dfc678347aeaa5ce7a`, ambos READY. O Codex mostrou as seis artes carregadas, a biografia em português e inglês e as 12 passivas de Chama/Fome em inglês. O retrato do Herdeiro usa corte superior para preservar olhos e fratura facial; 11 testes de apresentação passaram novamente e o build foi refeito. Evidência final: `qa/heir-codex-20261024.jpg`.

## Lote anterior — Sangria, Coroa e Mentira

Doze passivas genéricas de Sangria, Coroa e Mentira foram substituídas. Os 18 personagens desses três Elos agora têm gatilhos com assinaturas mecânicas distintas. O elenco soma 49 passivas com gatilhos específicos ou recuperação ligada ao tipo de dano; as outras 51 continuam na fila de revisão. Os 100 personagens foram preservados.

| Personagem | Identidade da passiva |
| --- | --- |
| O Colecionador | Um abate concede carga e Defesa, uma vez por rodada. |
| Gêmeos do Cutelo | Ferir alvo Exposto com Sangramento dos Gêmeos recupera Vida e gera Ruptura. |
| O Carrasco | Ferir vítima já Atordoada recupera Vida e remove 1 Essência disponível da oposição. |
| A Mãe Rubra | Cura efetiva de outro aliado também o protege e recupera parte da Vida da usuária. |
| O Soberano | Assumir Coroa Soberana concede uma proteção adicional. |
| A Magistrada | Ferir alvo Exposto concede Defesa e remove Graça disponível da oposição. |
| O Príncipe | Ferir vítima que já carrega sua Marca concede Defesa. |
| A Déspota | Apoio que efetivamente concede Defesa gera Cinza. |
| O Sussurro | Ferir vítima com seu Veneno converte o Éter restante em 1 Essência aleatória de outro tipo. |
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
