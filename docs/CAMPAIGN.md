# Oblivium Arena — campanha e progressão

> Cânone da revisão de desenvolvimento (PR #3). A versão jogável em `main` pode estar numa etapa anterior. Consulte [PROJECT_CANON.md](PROJECT_CANON.md).

Referência da revisão atual. O roteiro e a distribuição exata de personagens são gerados em [STORY.md](STORY.md), [WORLD_CATALOG.md](WORLD_CATALOG.md) e [CHARACTER_CATALOG.md](CHARACTER_CATALOG.md).

## Travessia dos Mundos

Cada Mundo tem uma campanha narrativa que atravessa seus Reinos em ordem e termina diante da manifestação de seu líder. A conclusão de um Reino libera o seguinte na mesma dificuldade. Há cinco dificuldades: Véu intacto e Rupturas I–IV. Uma vitória libera a dificuldade seguinte naquele Reino.

Cada Reino oferece três trilhas: **Caçada**, focada em confrontos e elites; **Ecos**, focada em eventos e relíquias; e **Eclipse**, com elite e guardião extra, liberada após a primeira vitória. As três opções cumprem a faixa de duas a quatro trilhas por Reino.

O trio é fixado ao partir. Vida, Correntes, Ecos, escolhas e nós concluídos acompanham a travessia. Derrotas consomem estabilidade; perder todas as Correntes encerra a tentativa. Descanso, eventos e mercador oferecem recuperação. Os mapas possuem rotas conectadas e revelam apenas as passagens pertinentes ao avanço.

## Recrutamento e líderes

Os desbloqueios são distribuídos por Reino e dificuldade, em vez de sortear sempre um único personagem do conselho. A vitória concede os personagens previstos para aquela combinação ainda não possuídos. Repetir a mesma combinação não duplica almas. Os três personagens iniciais estão disponíveis desde o começo.

Os 147 personagens que não são líderes ficam cobertos entre iniciais e recompensas programadas. O catálogo mostra a localização de cada um. Algumas versões de Nilo também têm condições narrativas de absorção, preservadas separadamente da distribuição geral.

**Niith — O Fim**, **Seraph — O Prólogo** e **Zalmoxis — A Abnegação** só são recrutados após concluir todos os Reinos do respectivo Mundo e vencer a manifestação final na **Ruptura IV**. Uma vitória em dificuldade menor não concede o líder. Derrotá-los não os mata.

## Legados e dificuldade

Na primeira vitória por par Reino/dificuldade, escolha um entre três Legados permanentes. A oferta e a escolha são persistidas; uma recompensa pendente deve ser resgatada antes da próxima trilha. Repetir a dificuldade pode recuperar desbloqueios previstos, mas não concede outro Legado pela mesma primeira vitória. Ecos e Memórias da travessia têm escopo próprio e não substituem Legados.

Modificadores de Vida, dano, Defesa, armadura, regeneração e aflições escalam conforme a dificuldade. Os valores vigentes são definidos em `src/progression.js`; não usar tabelas de relatórios históricos como regra atual.

## Essência e Nilo

Cada lado recebe uma Essência aleatória por personagem vivo desde a abertura. Os quatro tipos são Éter, Cinza, Graça e Ruptura, com sorteio uniforme; o saldo acumula. Coringa é pago com qualquer um desses tipos. A conversão 5→1 reduz o total em quatro unidades e permite escolher o tipo recebido.

No Vestíbulo, a absorção de Nilo acompanha Cinza, Graça e Ruptura. Ações qualificadas somam 5; os marcos 30/70/100 abrem Prefácio, Epílogo e Final. Uma barra em 100 fixa o caminho na travessia. Equilibrar as três em 70 antes disso abre Sael — O Eco das Quatro Essências. Sem barra em 70, a Fenda da Alma permite aceitar o Expurgo e liberar Nilo Purificado, enfraquecido e com custos Coringa; recusar preserva a forma atual. As barras reiniciam na próxima travessia.

## Persistência e interface

O servidor valida a campanha online e suas recompensas; o modo local usa o armazenamento de desenvolvimento e o navegador conforme o fluxo. Não assumir sincronização entre dispositivos quando o banco hospedado não estiver configurado.

Técnicas indisponíveis podem ser inspecionadas por toque ou teclado. A resolução bloqueia comandos; a revisão retém Tab e Escape volta ao planejamento. Efeitos respeitam os retratos reais e a preferência por movimento reduzido. O conselho aparece ao revelar o nó correspondente.
