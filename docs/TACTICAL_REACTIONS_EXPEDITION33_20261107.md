> **Mecânica substituída (07/11/2026):** os desafios de reflexo por golpe descritos aqui são históricos. A mecânica ativa de acerto/erro dos especiais é o [Confronto de Vontades — três intenções](TACTICAL_WILL_DUEL_RPS_20261107.md). O sistema continua usando as animações cinematográficas de golpes deste desenvolvimento, mas a interação atual consiste em uma única escolha estratégica, sem barra de timing.

# Combate reativo inspirado em Clair Obscur: Expedition 33
Oblivium Arena · 07/11/2026 · Complemento ao sistema de especiais estilo KOF

## Direção

A apresentação dos **especiais** mantém a energia visual e os contatos em sequência que o projeto já adotou. A **interação entre os contatos** agora segue princípios de Clair Obscur: Expedition 33: leitura do corpo inimigo, antecipações, fintas, esquiva mais segura, aparo de janela curta e contra-ataque por domínio integral do combo.

Referências sobre comportamento, não recursos audiovisuais a copiar:
- [Expedition 33 — apresentação oficial do combate](https://www.expedition33.com/post/your-first-look-at-gameplay-from-clair-obscur-expedition-33)
- [Xbox Wire — guia de esquiva, aparo e sequências](https://news.xbox.com/en-us/2025/04/23/tips-to-get-started-clair-obscur-expedition-33/)

**Nenhum personagem, cenário, ícone ou efeito autoral do jogo de referência foi reproduzido.** A tipografia, os VFX materiais, as paletas e o tabuleiro são próprios de Oblivium.

## Defesa ativa: três respostas distintas

Cada técnica ofensiva elegível inicia uma sequência de **3 golpes**, ou **4** nas técnicas `voto` / `despertar`. O tempo de cada golpe é determinístico de acordo com o personagem e técnica, entre **850 e 1160 ms**, com o impacto em um momento variável: não é mais o mesmo marcador central três vezes.

- **Esquivar (botão / Espaço / D):** janela ±205 ms em relação ao impacto, evita por completo o contato individual bem defendido.
- **Aparar (botão / E / Enter):** janela ±90 ms, evita o contato individual e conta para o domínio do combo. **Aparar todos os golpes** dá um contra-ataque físico.
- **Saltar (botão / Espaço / W):** para certas varreduras baixas explicitamente sinalizadas, janela ±170 ms. Nesse golpe, esquivar/aparar não funciona. Aparos limpos anteriores + salto no último golpe também podem gerar contra-ataque.

O jogador **escolhe uma ação por contato**; resposta precoce ou tardia não pode ser corrigida apertando novamente no mesmo golpe. A zona de resposta é anunciada pela movimentação do ator, rastro de release e pulso no alvo; o HUD informa se o golpe é estocada, finta, golpe normal ou varredura. O antigo metrônomo de ritmo não é o único canal visual.

O **contra-ataque** é um evento de combate próprio, depois do cast e antes da próxima ação. O valor é limitado a **5–12 de dano**, é absorvido por escudo/defesa de maneira convencional, usa a cor e efeito do defensor e não consome uma terceira ação. O contato de contra-ataque aparece **apenas uma vez** na animação e nos números.

## Ofensiva ativa

Em um combo aliado, o usuário escolhe **ATACAR** no momento específico em que o golpe conecta (botão / Espaço / Enter), janela ±135 ms. Acertos precisos ampliam o peso daquele contato **em 30%** antes de somar os três/quatro pesos da habilidade. O erro deixa esse contato sem bônus.

NPCs podem esquivar um contato em uma fração dos confrontos, de maneira determinística e limitada, para evitar que toda técnica ofensiva perfeita resulte sistematicamente em dano menor. IA não utiliza contra-ataque perfeito grátis: isso fica reservado à habilidade do jogador humano nesta implementação.

## Dano real, escudos e estados

`src/tactical-reactions.js` resolve os julgamentos temporais e consolida decisões de ataque e defesa. `src/tactical-combat.js` coleta as respostas **depois** de ambos os planos simultâneos serem revelados, mas **antes** de `execute`. `src/combat.js` aplica `tacticalReactiveDamage` ao dano direto antes da defesa, escudos, passivas, morte e resultados da ação.

O dano é dividido entre contatos proporcionais à resposta real; um contato esquivado tem **0** dano visual e o contato que não foi esquivado carrega sua parte efetivamente calculada. A habilidade em si é executada uma única vez: recursos, cooldowns, estados, morte e procs não são multiplicados pelo número de quadros.

Se **todos os contatos forem evitados**, o ataque ainda consome seu recurso/cooldown, mas nenhum alvo é atingido: não há aplicação de estados, deslocamentos ou efeitos de contato no defensor. Uma varredura pode ainda alterar o terreno.

## Plataformas e controles

- **Web:** Espaço/Enter para atacar, Espaço/D para esquivar, E/Enter para aparar, W para saltar e Escape para “Sem interação”.
- **Mobile:** botões grandes e claros para o tipo certo de resposta, com alinhamento ao centro, alto contraste, respeito à área segura do aparelho e modo paisagem.
- **Preferência de redução de movimento:** retorna reação neutra para não impor um desafio puramente visual.
- **IA local:** respostas produzidas sem consultar o plano adversário, sem aleatoriedade não auditável e sem usar dados de eventos futuros.

## Escopo de código e testes

- Criado: `src/tactical-reactions.js`
- Integrado: `src/combat.js`, `src/tactical-combat.js`, `src/compact-demo.js`, `src/tactical-combo.js`, `src/tactical-cinematic.js`, `compact-combo.css`, `tactical.html`
- Regressões: `tests/tactical-reactions.test.js`, `tests/tactical-combo.test.js`, `tests/tactical-combo-round.test.js`, `tests/tactical-combo-ui.test.js`, `tests/tactical-cinematic.test.js`

A verificação isolada incluiu julgamentos da janela de esquiva/aparo/salto, resolução de dano, integração dos scripts e uma simulação de rodada com um **aparo completo que produziu evento de contra-ataque e perda real de PV**. Não substitui uma suíte Node inteira, testes em navegador com timers reais nem testes de responsividade em múltiplos aparelhos.

## Limites conhecidos

1. O código atual é multiplayer **local contra IA**. PVP online requer respostas validadas no servidor, compensação de latência e sincronização de contatos. Não declarar parry/contra-ataque em PVP como implementado.
2. Alguns personagens ainda usam poses compartilhadas e interpolações sobre retratos; o sistema define timing e partículas, mas não cria, por si só, atlases artesanais exclusivos para todas as habilidades.
3. O ganho de recursos por aparo, técnicas exclusivas de contra-ataque e avisos mais complexos no estilo Gradient Counter **não** estão nesta entrega; não anunciar essas mecânicas como concluídas.

## Roteiro de QA recomendado

```sh
node --test tests/tactical-reactions.test.js tests/tactical-combo.test.js tests/tactical-combo-round.test.js tests/tactical-combo-ui.test.js tests/tactical-cinematic.test.js
npm run test:compact
npm run smoke:compact
npm run build
```

Cenários: 320/390/760/1280px, tablets, orientação paisagem, redução de movimento, ataque aliado 3 acertos, esquiva de somente um dos contatos, aparo de todos os contatos, golpe de varredura+salto, reação fora do tempo, ator morrendo pelo contra-ataque, ataque sem alvo válido e inimigo atordoado durante a resolução.
