# Oblivium Arena — três baralhos e Confronto de Vontades (07/11/2026)

## Modelo aprovado

Cada combatente 3v3 possui um baralho, mão, compra, descarte e pilha de exaustão independentes. O jogador seleciona uma alma e vê somente a mão correspondente. Custos de Essências continuam **compartilhados pela equipe**. A base de teste utiliza 8 cartas equipadas por alma (limite configurável até 10), compra 2 por rodada, mão máxima de 6 cartas do deck e uma carta temporária de Movimento Padrão por rodada.

Movimento Padrão **não entra no baralho**, não acumula e renasce no próximo turno. Uma carta de movimento pode ser uma variante equipável, caso o tabuleiro passe a oferecer um executor de movimento. O ataque básico permanente também deve ser extradeck, sem recarga, ocupando a ação principal.

O baralho inicial de cada personagem contém duplicatas de suas técnicas registradas, até 8 cartas. Baralhos personalizados podem ser passados por \`cardLoadouts\`, com 8–10 instâncias e até 3 melhorias por carta. Cada instância recebe ID único. Um personagem não pode jogar habilidades que não estejam na própria mão. A carta só sai da mão **na confirmação da fila**, nunca durante a inspeção ou mudança de plano.

## Efeitos e raridade

- **Prata:** +5 dano, Preservar (a carta permanece na mão).
- **Ouro:** Sangramento por 2 rodadas (5/rodada), alteração para dano de Fogo + Queimadura.
- **Prismático:** Predestinada (garante a carta na mão inicial) ou Exaurir (vai para pilha de exaustão após uso).
- Outras opções de terreno, custo, mobilidade e encadeamento devem ser adicionadas com validação do motor espacial, evitando oferecer efeitos fictícios.

Na campanha, conquistas por reino deverão liberar **novas cartas, novas modificações e tiers**, sem gerar vantagem permanente obrigatória no PvP competitivo. O PvP deve operar com um catálogo equilibrado por temporada ou regras de equiparação.

## Confronto de Vontades

Três manifestações cíclicas: **Fenda vence Vínculo, Vínculo vence Égide, Égide vence Fenda**. Ambas as escolhas precisam ser secretas até a revelação. Cada equipe recebe **1 resposta por rodada**, ampliável apenas por aprimoramentos específicos.

1. O atacante prepara uma habilidade especial e uma manifestação secreta.
2. Se uma unidade inimiga está na área, o adversário pode aceitar o golpe ou gastar 1 resposta. Apenas **uma tentativa por habilidade**.
3. Resposta vence: anula dano e efeitos no alvo protegido; em áreas com vários alvos, os demais não são automaticamente protegidos.
4. Empate: habilidade é aplicada normalmente.
5. Ataque vence: habilidade recebe crítico de 1,4× no dano, e seus efeitos normalmente previstos continuam.
6. Cartas reativas podem adicionar resposta, aprimorar defesa ou causar retaliação, mas não devem oferecer vitórias automáticas baratas.

Na rede, o servidor deve custodiar a manifestação do atacante e **nunca enviá-la ao defensor antes da escolha**. Resposta precisa de fase própria, timeout e persistência; clientes não podem escolher o resultado da disputa.

## Implementação nesta branch

- \`src/card-combat.js\`: decks e mãos serializáveis, compra, descarte, exaustão, efeito Preservar/Predestinada, Movimento Padrão garantido, gastos de resposta e regra pura Fenda/Vínculo/Égide.
- \`src/combat.js\`: opção \`cardMode\`, compra por rodada, exigência de carta para enfileirar, consumo apenas no commit e aplicação de aprimoramentos ao resolver.
- \`src/combat-ai.js\`: IA limita suas técnicas às cartas da própria mão.
- \`src/card-hand-view.js\`, \`src/battle-view.js\`, \`src/main.js\`, \`card-combat.css\`: mãos independentes com troca de personagem e visual responsivo.
- \`server/campaign-service.js\` e \`server/arena-service.js\`: modo de cartas habilitado em novas partidas; o PvP oculta mãos inimigas e ordem de compra no estado público.
- \`tests/card-combat.test.js\`: testes unitários para embaralhamento, cartas temporárias, cartas aprimoradas e o confronto.

## Limitações desta fase — não declarar conclusão antes dos itens abaixo

**O \`main\` disponível não possui a arena espacial compacta citada nos chats recentes**. Por isso a carta Movimento Padrão aparece na mão, mas seu botão está informativo até existir um executor de deslocamento por casa, com seleção e visualização de área.

O duelo humano atual no repositório continua sendo por **turnos alternados**, não o planejamento simultâneo desejado. O ciclo Fenda/Vínculo/Égide está implementado como **regra pura testável**, mas ainda precisa de janela interativa, escolha secreta e aplicação do resultado a danos/status nas etapas de resolução, com controle de timeout e autorização no servidor.

**Ainda não existe editor completo de decks / coleção / loja de aprimoramentos** para o PvP e a campanha. O suporte a loadouts personalizados existe no núcleo, porém depende da interface de equipar cartas e das recompensas de campanha.

A branch foi criada para preservar o jogo que está na \`main\`. Antes de integrar, rodar \`npm test\` e \`npm run build\`, validar no navegador e no mobile e realizar partidas reais de PvP.

## Próximas etapas de integração

1. Recuperar ou integrar o tabuleiro tático atual (movimento real, seleção de casas, áreas de habilidade).
2. Acrescentar editor de baralho (8–10 cartas por personagem), salvar e validar os loadouts no servidor; ataque básico extradeck.
3. Criar estado de **planejamento simultâneo** nos dois clientes com commit separado e revelação simultânea na resolução.
4. Criar estado de **resposta** no servidor (confidencialidade, limite, seleção dos três signos, timeout), vinculado à habilidade e ao alvo e sem duplicação de efeitos.
5. Acrescentar cartas reativas e progressão por conclusão dos reinos, testes de balanceamento 3v3 e avaliações de usabilidade no celular.
