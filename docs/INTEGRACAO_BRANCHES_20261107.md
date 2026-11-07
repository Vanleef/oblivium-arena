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

1. O playback online de habilidades e VFX ainda não tem a coreografia cinematográfica completa do modo IA.
2. Falta QA em dois navegadores reais, incl. latência, reconexão, orientação e responsividade de celular.
3. Cartas especiais desbloqueadas pela campanha ficam restritas ao modo local até que a conclusão dos Reinos possa ser comprovada pelo servidor.
4. A suíte integral do PR #3 mantém falhas legadas que precisam de correção e auditoria separada.
5. Revisar e reconciliar as diferenças exclusivas do PR #6 antes de fechar a convergência e preparar merge na main.

Para protocolo, casos de teste e operações da API, consulte COMPACT_PVP_ONLINE_20261107.md.

**Estado: PR #7 draft; código versionado em branch própria, não publicado na main.**
