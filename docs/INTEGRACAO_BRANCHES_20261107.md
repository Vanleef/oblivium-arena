# Integração das linhas ativas — 07/11/2026

## Origem comprovada

- Base visual e mecânica principal: `art/oblivium-arena-anime-first-20261027` @ `906696363116749664d787b2d72fc20a9986415c` (PR #3).
- Base estável: `main` @ `7749a3ef7df6920123b4d173c8a6e9a432b24d39`.
- Combate competitivo: `feature/tres-baralhos-confronto-20261107` @ `06f694e5a52b7caeece131c75d8fcd55252da05c` (PR #6).

## Estratégia de integração

A implementação do PR #3 foi preservada por conter a arena compacta 6×6, planejamento simultâneo local, animações físicas e atlas recentes, paleta por personagem, elementos de terreno, três baralhos independentes, reações, mobilidade desbloqueável e UI responsiva. Não substituir `src/combat.js`, `src/main.js` ou o resolvedor tático do PR #3 pelas versões anteriores do PR #6.

Esta integração adota os cinco recursos gráficos oficiais da `main` (favicon 32/64, ícone 192/512 e Apple Touch Icon), sem substituir a estrutura visual mais recente do PR #3. O fluxo de autenticação corrigido e seu teste de regressão já estavam presentes na linha do PR #3.

O Confronto de Vontades utiliza a nomenclatura canônica **Miragem > Luz > Sombra > Miragem**. No modo com cartas, vitória do atacante = 150% de dano, empate = 100% e vitória da defesa = bloqueio do alvo protegido. A modalidade legada conserva 50% no empate para compatibilidade com o laboratório histórico. Tendências da IA mantêm a mesma distribuição anterior.


## PvP compacto 6×6 conectado (branch de integração)

O protocolo online foi adaptado ao motor compacto do PR #3, sem sobrescrever o motor clássico do PR #6:

- Motor/segurança: server/compact-pvp.js, cursor serializável para retomar uma rodada e ocultação do plano, das cartas adversárias e das intenções de especiais.
- Matchmaking: server/compact-arena-service.js, com fila e classificação próprias, confirmação simultânea, prazo de respostas, rendição e reconexão.
- HTTP: api/arena-compact.js, autenticado com a sessão existente e restrição por personagens recrutados.
- Interface: /tactical.html?online, com editor de três decks de 8–10 cartas, arena 6×6, mão contextual, Confronto de Vontades, recompensas e atalhos.
- Build: compact-online.css copiado para dist e Vercel configurado para a nova função. O modo IA em /tactical.html permanece separado.

A regra canônica do Confronto continua Miragem > Luz > Sombra > Miragem, com 150% de dano no acerto decisivo, 100% no empate com cartas e bloqueio do alvo protegido na vitória defensiva.

O PR #6 **não foi fundido arquivo a arquivo** porque altera o mesmo motor com geometria 5×5 incompatível; as funcionalidades essenciais de servidor foram reimplementadas com a arquitetura 6×6 atual. A main não foi alterada.

## Pendências para release

1. A revisão online opcional de eventos usa snapshots públicos e quadros de habilidade, mas ainda não possui fila automática, animação interpolada de movimento nem a coreografia e VFX completos do modo IA.
2. Falta QA em dois navegadores reais, incl. latência, reconexão, orientação e responsividade de celular.
3. Cartas especiais desbloqueadas pela campanha ficam restritas ao modo local até que a conclusão dos Reinos possa ser comprovada pelo servidor.
4. A suíte integral do PR #3 mantém falhas legadas que precisam de correção e auditoria separada.
5. Revisar e reconciliar as diferenças exclusivas do PR #6 antes de fechar a convergência e preparar merge na main.

Para protocolo, casos de teste e operações da API, consulte COMPACT_PVP_ONLINE_20261107.md.

**Estado: PR #7 draft; código versionado em branch própria, não publicado na main.**

## Verificação local de continuidade — 07/11/2026

Após atualização não destrutiva das referências, os HEADs de main e dos PRs #3, #6 e #7 permaneciam nos commits indicados acima e em `7fb81647b8bdbe72ce9c5ab43f26ba3c9cd77afe` para o PR #7. A branch de integração contém os 32 commits posteriores ao HEAD do PR #3 e o histórico da main; o PR #6 tem 117 commits exclusivos em relação à integração, que devem ser revisados por funcionalidade, sem copiar o motor 5×5.

No HEAD do PR #7, o CI remoto registrou `compact` aprovado e `full-regression-diagnostic` reprovado. Uma execução local do diagnóstico completo com Node 26.13.0 indicou 534 testes aprovados e 132 falhas; a classificação das falhas e a comparação por nome com a base ainda estão pendentes. Não se deve interpretar essa contagem como prova de que todas as falhas sejam obsoletas.

A auditoria local de animação confirmou 43 atlas base em 150 entradas e 183 clipes mapeados em 689 técnicas/formas. Isso não comprova qualidade visual nem cobertura integral das animações.

## Comparação do diagnóstico integral

Na integração em `89e6ae6`, o `node --test` com Node 26.13.0 no Windows executou 680 testes: 548 passaram e 132 falharam em 31 arquivos. Os mesmos 31 arquivos foram executados separadamente no PR #3 `9066963`: 122 passaram e 132 falharam. Os nomes das 132 falhas coincidiram com os da execução integral da integração. Isso é uma comparação desse conjunto de testes, não uma prova de ausência de regressões em outros cenários ou versões de Node.

As maiores concentrações foram `skill-forms.test.js` (25), `reactive-kits.test.js` (19), `app-smoke.test.js` e `rules.test.js` (11 cada), `progression.test.js` (10), `i18n.test.js` e `passive-revisions.test.js` (6 cada), além de `resource-payment.test.js` e `trail-presentation.test.js` (5 cada). Há diferenças de catálogo visíveis, como um teste que ainda espera 100 personagens com mecânicas quando existem 150, mas também existem falhas de efeitos, recursos, progressão e interface que exigem investigação individual. Não é seguro classificá-las todas como expectativas obsoletas.

Na amostra de progressão, vários testes usam `elos[0]` como primeiro Reino e esperam `eloProgress.sangria`; a rota atual é ordenada por `campaignKingdoms`, e a migração designa Sangria ao Reino Flagelo. Portanto, esses pressupostos não descrevem diretamente a estrutura atual. Isso não comprova, por si só, que a migração de todos os salvamentos antigos esteja correta.

O teste de integração de autenticação falhou na execução integral e no PR #3, mas passou na repetição isolada da integração: usava esperas fixas para operações assíncronas. Após trocar essas esperas por observação da inicialização, dos salvamentos concluídos, da saída e da restauração, a mesma seleção de 254 testes registrou 123 aprovados e 131 falhas, cujos nomes coincidem com os 131 restantes no PR #3. Essa correção elimina uma fonte de intermitência do teste; não resolve as demais falhas nem substitui QA em navegadores.

Uma nova execução integral após essa correção registrou 549 aprovados e 131 falhas entre 680 testes; os nomes das falhas continuaram coincidindo com os 131 casos restantes reproduzidos no PR #3.
