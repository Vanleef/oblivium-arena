# Fortalezas e objetivos privados — 5 de novembro de 2026

Invadir a fortaleza adversária oferece três penalidades: Enfraquecido na equipe, Exposto na equipe ou selo ofensivo em um adversário escolhido. Os efeitos duram uma rodada, respeitando o controle de duração do combate. Uma nova invasão pelo mesmo personagem exige voltar à fortaleza de origem. Invasão e baixas não concedem aprimoramentos.

Cada equipe começa com uma casa objetivo privada. Recolhê-la oferece três melhorias permanentes neste combate, vinculadas ao coletor e a uma habilidade nomeada dele. Podem melhorar dano, cura, Escudo, aflição, contra-ataque ou efeitos do ataque básico ao acertar. Não incluem recursos, cura instantânea ou bônus para o trio. Giros continuam usando a moeda por conclusão de reinos e preservam o tier da oferta.

A distância considera passos ortogonais ou diagonais entre casas ativas. O primeiro objetivo nasce a pelo menos cinco casas de todos os personagens vivos da equipe; os seguintes, a pelo menos três. A distância é `ceil(base × maior extensão ativa / 8)`, com piso de uma casa quando o campo encolhe. Nunca nasce sobre personagem ou obstáculo e precisa ter rota terrestre até a equipe. Se não houver casa legal, a geração aguarda uma casa disponível.

Ao recolher, uma nova casa aparece para a mesma equipe. Objetivos existentes mantêm sua posição mesmo se um rival a atravessar, pois o rival não pode recolhê-la. Casas removidas pela contração são sorteadas novamente. Deslocamentos por habilidade podem recolher o objetivo para seu ocupante.

O tier é compartilhado pelas duas casas ativas e respeita a progressão: Prata desde o início, Ouro a partir de três reinos concluídos, Prismático a partir de oito. A sequência compartilhada avança quando as duas equipes completam mais uma coleta. A equipe que coleta primeiro continua no mesmo tier; quando a sequência avança, os dois pulsos passam ao tier compartilhado. Uma oferta já recolhida mantém seu tier.

A interface desenha apenas a casa aliada. `tacticalView` remove a casa adversária e a semente dos objetivos. Instantâneos destinados à reprodução do jogador omitem o objetivo rival. Isso é separação de informação no laboratório local com IA, não um servidor competitivo autoritativo.

Melhorias identificam personagem, habilidade e tier. Coletas repetidas acrescentam instâncias distintas, sujeitas aos limites de balanceamento dos valores e gatilhos por rodada. Não passam a aliados após a morte do portador e não acompanham o personagem ao encontro seguinte.

O multiplicador visual é `1 + 0,28 × (1 − 0,68ⁿ)`: a primeira melhoria aumenta o modelo em 8,96%, e cada incremento seguinte é menor. A figura usa 70% da largura lógica da casa inicialmente, chegando no máximo a 89,6%. As proporções são preservadas; a altura da figura em pé não é comprimida à altura aparente do piso em perspectiva. HUD, chão, efeitos e área mecânica não crescem. Movimento reduzido desativa a transição.

A IA pontua aproximação e coleta de seu próprio objetivo, usando sua visão filtrada. Testes cobrem sementes variadas, distâncias, contração, sigilo, tiers compartilhados, coleta dos dois lados, escopo de habilidade/personagem, empilhamento, seleção de penalidade com alvo validado, rejeição de escolha repetida e crescimento limitado. Todo o catálogo e suas formas têm pelo menos três ofertas compatíveis em cada tier.
