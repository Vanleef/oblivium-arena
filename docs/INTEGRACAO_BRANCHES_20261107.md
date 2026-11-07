# Integração das linhas ativas — 07/11/2026

## Origem comprovada

- Base visual e mecânica principal: `art/oblivium-arena-anime-first-20261027` @ `906696363116749664d787b2d72fc20a9986415c` (PR #3).
- Base estável: `main` @ `7749a3ef7df6920123b4d173c8a6e9a432b24d39`.
- Combate competitivo: `feature/tres-baralhos-confronto-20261107` @ `06f694e5a52b7caeece131c75d8fcd55252da05c` (PR #6).

## Estratégia de integração

A implementação do PR #3 foi preservada por conter a arena compacta 6×6, planejamento simultâneo local, animações físicas e atlas recentes, paleta por personagem, elementos de terreno, três baralhos independentes, reações, mobilidade desbloqueável e UI responsiva. Não substituir `src/combat.js`, `src/main.js` ou o resolvedor tático do PR #3 pelas versões anteriores do PR #6.

Esta integração adota os cinco recursos gráficos oficiais da `main` (favicon 32/64, ícone 192/512 e Apple Touch Icon), sem substituir a estrutura visual mais recente do PR #3. O fluxo de autenticação corrigido e seu teste de regressão já estavam presentes na linha do PR #3.

O Confronto de Vontades utiliza a nomenclatura canônica **Miragem > Luz > Sombra > Miragem**. No modo com cartas, vitória do atacante = 150% de dano, empate = 100% e vitória da defesa = bloqueio do alvo protegido. A modalidade legada conserva 50% no empate para compatibilidade com o laboratório histórico. Tendências da IA mantêm a mesma distribuição anterior.

## Não integrado ainda — tarefa explícita

O PR #6 possui **PvP online autoritativo 5×5**, dupla confirmação, sigilo do deck no servidor, Confronto de Vontades com timeout e histórico sequencial de efeitos já resolvidos. O PR #3 contém **PvE local 6×6**, mais novo na camada visual, mas não substitui o servidor PvP do PR #6. Não há integração segura via cópia total: o mesmo módulo `src/combat.js` foi alterado de forma incompatível pelas duas frentes.

### Migração necessária antes de fechar as duas linhas

1. Manter a arena 6×6 de PR #3 como experiência principal e definir grid canônico compartilhado no backend PvP.
2. Adaptar o protocolo autoritativo do PR #6 para cartas `tactical-decks.js`, duas ações por personagem e novas cartas reativas/mobilidade de PR #3.
3. Validar sigilo por equipe, troca de Essências, resposta com timeout, repetição de movimentos, colisões e histórico de eventos.
4. Executar testes Node completos, build, sessões PvP com dois clientes e QA real no mobile/desktop.
5. Só então fechar PR #3/#6 e propor merge à `main`; nunca marcar como integrado no produto antes da conclusão.

## Situação

A branch de integração mantém o histórico de PR #3 e `main` e aplica correções de nomes e marca oficiais. **PR #6 ainda não foi fundido**; essa separação é intencional para evitar regressões e perda de animações.
