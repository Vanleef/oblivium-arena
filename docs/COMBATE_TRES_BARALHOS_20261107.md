# Oblivium Arena — três baralhos e Confronto de Vontades (07/11/2026)

## Escopo e regras atuais

Combate 3v3 com baralhos independentes por personagem: deck, mão, compra, descarte e exaustão privados. **Cada jogador planeja as ações dos três personagens ao mesmo tempo que o adversário** em partidas ranqueadas. Cada personagem compra 2 cartas por rodada, usa um deck de 8 a 10 cartas e tem uma carta de Movimento Padrão temporária garantida, fora do deck. A mão base comporta até 6 cartas do deck.

O **Ataque Básico (5 dano físico, sem recarga ou custo)** também fica permanentemente disponível fora do deck; ocupa a ação principal. O Movimento Padrão só terá deslocamento real quando o grid tático do projeto mais recente for integrado.

A composição do trio tem um editor para adicionar/remover cartas e persistir um baralho por personagem, com 8–10 instâncias e até três cópias por técnica quando o kit possui três ou mais técnicas. O servidor valida a composição enviada e nunca aceita cartas de personagens externos ao trio. No ranqueado, os aprimoramentos da campanha são proibidos para evitar vantagens indevidas.

## Planejamento simultâneo e segurança

Em duelos ranqueados com \`cardMode\`:
1. Cada lado prepara secretamente até uma habilidade por personagem, com alvo, carta exata, pagamento de Essências e manifestação de Vontade.
2. O primeiro envio fica armazenado no servidor sem executar habilidades, sem gastar a carta na mão adversária e sem revelar o plano ao outro jogador.
3. O segundo envio faz o servidor ordenar as ações alternando a iniciativa por rodada: jogador 1 / jogador 2 / jogador 1 / jogador 2. A resolução é autoritativa.
4. Antes de uma habilidade ofensiva com dano atingir um alvo válido, o defensor pode gastar sua **única resposta por equipe a cada rodada** (se disponível).
5. A manifestação do atacante foi selecionada na fase de planejamento e permanece confidencial até a resposta. O estado público remove os planos, a ordem de resolução, a ordem de compra e as mãos inimigas. A resposta tem prazo de 25 segundos; se esgotar, o golpe é aceito sem gastar direito de resposta.
6. Depois de ambas as equipes resolverem a rodada, efeitos persistentes são atualizados, a mão regular descartada (salvo Preservar), e novas cartas e Movimentos Padrão são gerados.

## Confronto de Vontades

- **Miragem distorce e engana a Luz.**
- **Luz revela, dissipa e atravessa a Sombra.**
- **Sombra oculta e engole a Miragem.**
- **Triângulo conceitual:** Miragem > Luz > Sombra > Miragem.
- Vitória da defesa: o efeito e o dano são anulados no alvo protegido.
- Empate: dano e efeito normais.
- Vitória do ataque: dano de impacto ×1,4 antes da mitigação e efeitos mantidos.
- Em habilidades de área, uma resposta protege apenas o alvo de confronto; os outros seguem normalmente.
- No cliente, a resposta é uma janela com três escolhas ou **Aceitar o golpe**. No servidor, a manifestação do atacante não pode ser vista pelo defensor antes de escolher.

### Compatibilidade

O duelo antigo sem \`cardMode\` continua alternado por compatibilidade com os testes legados. As partidas ranqueadas novas usam \`cardMode\` e simultaneidade. Campanhas novas usam decks e mãos, mas continuam com resolução de PvE anterior enquanto a arena espacial é integrada.

## Arquivos alterados ou criados

- \`src/card-combat.js\` — baralhos, movimentos temporários, ataque básico, melhorias, confrontos e limite de respostas.
- \`src/ranked-loadouts.js\` — equipar e validar builds do PvP.
- \`src/deck-builder-view.js\`, \`src/card-hand-view.js\`, \`card-combat.css\` — editor do trio, mãos, posturas secretas e janela de resposta responsivos.
- \`src/combat.js\` — execução de cartas, planejamento simultâneo autoritativo e confronto antes do impacto.
- \`src/combat-ai.js\` — IA limita técnicas à própria mão e pode usar Ataque Básico.
- \`src/main.js\`, \`src/battle-view.js\` — seleção e filas, montagem do trio, feedback de confronto e envio de respostas.
- \`server/arena-service.js\`, \`server/campaign-service.js\` — validação no servidor, sigilo, respostas, timeout e compatibilidade de campanhas.
- \`tests/card-combat.test.js\`, \`tests/duel-simultaneous.test.js\`, \`tests/ranked-loadouts.test.js\` — cenários automatizados.

## Verificações realizadas

- Análise sintática de todos os JS modificados por avaliação isolada com o mecanismo V8.
- Testes executados em runtime isolado para compra, descarte, exaustão, aprimoramento, custos ranqueados e confronto.
- Teste isolado de funções reais de planejamento, resolução de resposta com efeitos substituídos: bloqueio, normal e crítico.
- Teste isolado do estado público que confirma não revelar planos, manifestação do atacante nem cartas da mão inimiga.
- **Não foi possível executar aqui o comando completo \`npm test\` ou \`npm run build\` no repositório real**, tampouco validar navegador/mobile. O Vercel apresentou bloqueio de builds por limite.

## Pendências — manter PR como draft

1. **Reintegrar a versão mais recente do tabuleiro espacial compacto** (não presente na \`main\` acessível), implementar seleção de casas, movimento e alcance reais. A carta Movimento Padrão ainda é apenas representada.
2. Completar efeitos de movimento alternativo, cartas reativas e resposta na campanha contra IA.
3. Habilitar desbloqueios por conclusão de Reino, evolução dos tiers Prata/Ouro/Prismático e o catálogo de cartas da campanha.
4. Executar testes reais \`npm test\`, build completo, sessões PvP concorrentes e QA mobile/desktop, corrigindo discrepâncias.
5. Verificar narração, VFX, área atingida e clareza dos impactos no campo espacial e ajustar balanceamento.

**Não realizar merge ou deploy da branch como versão estável antes de fechar as pendências críticas.**
