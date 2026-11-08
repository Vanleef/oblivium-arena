# PvP compacto 6×6 — protocolo de integração (07/11/2026)

## Entradas

- Treino IA: /tactical.html
- PvP autenticado: /tactical.html?online
- API: POST /api/arena-compact (JSON, sessão válida e cookie HttpOnly de Arena).

O servidor local `npm run dev` também encaminha `/api/arena-compact` para a API, usando o armazenamento local configurado para desenvolvimento.

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

O cliente consulta periodicamente a partida e preserva os controles quando o estado recebido não mudou. Ações do jogador têm prioridade sobre uma consulta pendente; respostas antigas dessa consulta são ignoradas. Falhas temporárias de consulta são exibidas e removidas quando a conexão é restabelecida.

## Sistema e sigilo

Cada equipe possui 3 baralhos independentes de 8–10 cartas. A compra inicial é de 3 cartas; nas rodadas seguintes, 2 cartas até o limite de 6. Movimento básico e Ataque Básico permanecem acessíveis sem compra; cartas de habilidade precisam estar na mão do personagem correto.

Na implementação atual, cartas não utilizadas são descartadas ao fim da rodada, exceto as marcadas com Preservar. Isso explica uma nova mão de duas cartas quando nenhuma carta foi preservada; a compatibilidade dessa regra com a intenção de produto deve ser revisada antes de alterá-la.

Miragem distorce Luz; Luz dissipa Sombra; Sombra engole Miragem. A intenção ofensiva é selada durante o planejamento. O defensor escolhe uma intenção ou aceita o golpe quando o especial será executado. Vitória ofensiva: 150% do dano; empate: 100%; vitória defensiva: bloqueio do alvo protegido. A carta defensiva ou resposta padrão é consumida apenas se escolhida.

Após a resolução, a lista de acontecimentos apresenta as duas intenções e o resultado confirmado pelo servidor; ela permanece acessível no resultado final. Aceitar o golpe não cria um confronto revelado. Essa lista não substitui o replay cinematográfico, ainda pendente.

Em uma defesa vencedora contra uma área elemental, o personagem protegido não recebe os efeitos de contato, mas os demais alvos efetivamente atingidos ainda recebem as interações elementais válidas. Se não houver alvo atingido, a técnica bloqueada não cria superfície de contato.

O servidor mantém um cursor serializável da ordem de execução, garantindo que a rodada seja retomável entre requisições. A projeção enviada ao cliente omite cursor, plano secreto, cartas adversárias, ordem futura de compra e localização de Casas Objetivo rivais.

Os aprimoramentos conquistados por Casa Objetivo são privados da equipe que os coletou. O ranqueado não aceita melhorias arbitrárias inseridas no JSON dos baralhos; as recompensas são do próprio combate.

O perfil autenticado é vinculado ao identificador da conta, não herdado do cookie de uma conta anteriormente usada no mesmo navegador. Isso vale também para a Arena clássica, que compartilha o vínculo de conta com o modo compacto. Associações de conta já existentes são preservadas; eventuais associações indevidas criadas anteriormente precisam de diagnóstico e correção de dados separados.

## Arquivos e testes

- server/compact-pvp.js e server/compact-arena-service.js: motor de protocolo, segurança e matchmaking.
- api/arena-compact.js: autenticação, validação de origem e operações.
- src/compact-online.js, src/compact-online-client.js e compact-online.css: interface.
- tests/tactical-pvp-core.test.js, tests/compact-pvp.test.js, tests/compact-arena-service.test.js, tests/compact-online-ui.test.js: regressões.
- GitHub Actions: node --test para protocolos, QA de importação de interface, suíte compacta, simulações e build.

O recurso está em draft. A interface usa os sprites/atlas existentes, mas ainda requer integração de replay cinematográfico e validação de sessões reais em mobile/desktop antes de ser considerada pronta para produção. As variantes raras desbloqueadas por campanha ainda precisam de verificação servidor-autoritativa.
