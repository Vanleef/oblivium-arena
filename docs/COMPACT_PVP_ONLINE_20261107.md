# PvP compacto 6×6 — protocolo de integração (07/11/2026)

## Entradas

- Treino IA: /tactical.html
- PvP autenticado: /tactical.html?online
- API: POST /api/arena-compact (JSON, sessão válida e cookie HttpOnly de Arena).

| Operação | Entradas | Resultado |
|---|---|---|
| profile | nenhum | Estado privado, ranking e partida |
| queue | team (3 IDs), decks por personagem | Busca adversário compatível |
| cancel | nenhum | Cancela busca |
| turn | round, version, actions | Confirma até 6 ações secretas, 2 por personagem |
| response | version, sign, cardId opcional | Responde a especial pendente |
| reward | version, offerId, optionId, cardId opcional | Escolhe recompensa da própria equipe |
| surrender | nenhum | Rendição e resultado |
| ack | nenhum | Arquiva partida concluída |

A segunda confirmação pode usar uma versão anterior se a rodada enviada continuar correta e a equipe ainda não tiver confirmado. Todo o restante usa versão estrita para rejeitar alterações concorrentes.

## Sistema e sigilo

Cada equipe possui 3 baralhos independentes de 8–10 cartas. A compra inicial é de 3 cartas; nas rodadas seguintes, 2 cartas até o limite de 6. Movimento básico e Ataque Básico permanecem acessíveis sem compra; cartas de habilidade precisam estar na mão do personagem correto.

Miragem distorce Luz; Luz dissipa Sombra; Sombra engole Miragem. A intenção ofensiva é selada durante o planejamento. O defensor escolhe uma intenção ou aceita o golpe quando o especial será executado. Vitória ofensiva: 150% do dano; empate: 100%; vitória defensiva: bloqueio do alvo protegido. A carta defensiva ou resposta padrão é consumida apenas se escolhida.

O servidor mantém um cursor serializável da ordem de execução, garantindo que a rodada seja retomável entre requisições. A projeção enviada ao cliente omite cursor, plano secreto, cartas adversárias, ordem futura de compra e localização de Casas Objetivo rivais.

Os aprimoramentos conquistados por Casa Objetivo são privados da equipe que os coletou. O ranqueado não aceita melhorias arbitrárias inseridas no JSON dos baralhos; as recompensas são do próprio combate.

O perfil autenticado é vinculado ao identificador da conta, não herdado do cookie compacto de uma conta anteriormente usada no mesmo navegador. Associações de conta já existentes são preservadas; eventuais associações indevidas criadas anteriormente precisam de diagnóstico e correção de dados separados.

## Arquivos e testes

- server/compact-pvp.js e server/compact-arena-service.js: motor de protocolo, segurança e matchmaking.
- api/arena-compact.js: autenticação, validação de origem e operações.
- src/compact-online.js, src/compact-online-client.js e compact-online.css: interface.
- tests/tactical-pvp-core.test.js, tests/compact-pvp.test.js, tests/compact-arena-service.test.js, tests/compact-online-ui.test.js: regressões.
- GitHub Actions: node --test para protocolos, QA de importação de interface, suíte compacta, simulações e build.

O recurso está em draft. A interface usa os sprites/atlas existentes, mas ainda requer integração de replay cinematográfico e validação de sessões reais em mobile/desktop antes de ser considerada pronta para produção. As variantes raras desbloqueadas por campanha ainda precisam de verificação servidor-autoritativa.
