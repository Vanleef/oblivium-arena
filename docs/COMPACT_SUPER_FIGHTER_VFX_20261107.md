# Especiais de combate compacto — apresentação de jogo de luta (07/11/2026)

## Direção implementada

As ilustrações gigantes de vinheta foram **removidas do replay compacto**. A habilidade especial recebe uma curta apresentação gráfica inspirada na linguagem dos jogos de luta clássicos (sem reutilizar personagens, imagens ou assets de outras franquias):

1. **Início do especial:** o plano de fundo escurece enquanto faixas de velocidade e cores do mundo (Inferno, Paraíso, Limbo) ocupam brevemente o cenário.
2. **Personagem em foco:** o lutador permanece como **sprite real dentro do tabuleiro**, com brilho e compressão corporal de preparação; nenhuma pintura gigantesca o substitui.
3. **Legenda discreta:** nome do personagem e habilidade identificam o especial sem cobrir toda a tela.
4. **Liberação e contato:** flash breve, arco físico de golpe, impacto com estilhaços e onda de choque curta. A área atingida continua seguindo o replay validado pelo motor.
5. **Recuperação:** o combate volta ao campo normal sem alterar tamanho da grade, posições lógicas ou planos simultâneos.

O destaque dramático é reservado a `voto`, `despertar` e eventos decisivos (eliminação ou transformação). Técnicas comuns não geram uma vinheta completa, mas **também receberam impactos físicos mais fortes**, sobretudo golpes `strike`, `slash`, `pierce` e `counter`.

## Partículas e física

- Para melee: contato físico direcionado ao alvo, arco espesso de movimento, núcleo de impacto claro, ondas concêntricas curtas e fragmentos materiais que acompanham a direção do golpe.
- O peso visual acompanha a quantidade de dano/escudo **já resolvida**, sem acrescentar dano nem antecipar a ação adversária.
- Projéteis: brasas grossas, fragmentos de pedra/vidro e laços rituais com nós, em vez de feixes finos genéricos.
- Cura e bloqueio: pistas visuais distintas para não serem confundidas com agressão.
- Máximo de 36 partículas de contato compartilhadas por grupo de alvos; rastro de viagem limitado a oito fragmentos por efeito; resolução adaptativa por tamanho de tela.
- Em preferência por movimento reduzido, são suprimidos flashes móveis e rastros; indicadores essenciais continuam legíveis.

## Integração

- `src/tactical-cinematic.js` — ativação e marcação da nova apresentação.
- `src/compact-demo.js` — animação no sprite real, timing e sons de ativação; `thrust` melee também gera efeito de liberação.
- `src/tactical-effects-layer.js` — partículas de contato, arcos de melee e projéteis materiais.
- `src/audio.js` — curta indicação sonora de especial, respeitando o mute global.
- `compact-planning.css` — faixas de velocidade por mundo, flash, sprite focado e recuo sem reflow da grade.
- Testes em `tests/tactical-cinematic.test.js`, `tests/tactical-effects-layer.test.js` e `tests/tactical-compact-ui.test.js`.

## Verificação restante antes de merge

A verificação isolada executou **29 testes e asserções** das peças cinematográficas e da camada de VFX sem falhas; a sintaxe dos módulos alterados também foi analisada. Isso **não equivale** à execução do checkout inteiro. Executar localmente:

```sh
node --test tests/tactical-cinematic.test.js tests/tactical-effects-layer.test.js tests/tactical-compact-ui.test.js
npm run test:compact
npm run smoke:compact
npm run audit:animation
npm run build
npm test
```

Inspecionar em navegador desktop e celular: leitura do sprite durante a vinheta, força dos golpes melee, finalização dos efeitos e limites em telas estreitas. A `main` deve continuar intocada até a validação integral.

## Continuação — impacto, recoil e mobile (07/11/2026)

- `src/tactical-impact-presentation.js`: perfis visuais determinísticos calculados **somente após a resolução do ataque**, por família de golpe, dano realmente sofrido, especial, eliminação e transformação. Hitstop é adaptado a 1×/2×/3× e desativado em movimento reduzido.
- `TacticalEffectsLayer.freeze()`: congela o relógio do Canvas durante o hitstop e compensa a idade dos efeitos ao retornar, sem alterar ações, Vida, posição ou custos. O CSS pausa simultaneamente o recoil corporal e os indicadores.
- Reações físicas dedicadas: `strike` comprime o corpo, `slash` inclina e desloca lateralmente, `pierce` retrai e estende, `counter` rebate, `block` contém o impacto. Os vetores derivam das posições resolvidas pelo motor.
- Fragmentos de contato adaptados à matéria de cada técnica: sangue, lajes, raízes, podridão, fios rituais, brasas, gelo e Graça. O terreno mantém formas distintas durante o contato.
- Orçamentos responsivos: 10 partículas em área muito estreita, 14 em telas pequenas, 22 em espaço intermediário e até 36 no desktop; projéteis também reduzem fragmentos quando o tabuleiro é estreito.
- Preferência por movimento reduzido: deslocamentos e hitstop removidos, mas valores de dano/cura/escudo permanecem visíveis por pelo menos **180 ms**, permitindo leitura.
- Sete personagens piloto possuem gestos diferentes para `impulso`, `tecnica`, `voto` e `despertar` (28 combinações procedurais) e consideram forma corporal alternativa. Isso **não substitui atlas quadro a quadro específicos** para cada técnica de todos os personagens.
- Novos testes: `tests/tactical-impact-presentation.test.js` e ampliações em `tests/tactical-effects-layer.test.js`, `tests/tactical-character-vfx.test.js`, `tests/tactical-compact-ui.test.js`.

**Estado de validação:** análises estáticas e testes isolados executados; a aprovação integral da suíte Node, gameplay em navegador e revisão visual em aparelho físico permanecem pendentes antes de promover a `main`.


## Refinamento de legibilidade e sincronização — 07/11/2026

- **Hit-stop sincronizado:** o perfil `tacticalImpactProfile(event,{speed})` calcula o valor final em milissegundos uma única vez. A pausa do replay e o congelamento do Canvas recebem exatamente esse valor, sem aplicar uma segunda divisão por `state.speed`.
- **Tremor de câmera responsivo:** `data-impact-shake` na arena classifica `physical`, `special` e `heavy`; a animação curta movimenta em conjunto o backdrop e a camada visual do tabuleiro, não altera a posição lógica das células e reduz o deslocamento em celular. Em preferência por movimento reduzido, a animação é desabilitada.
- **Respostas positivas distintas:** cura, escudo concedido e ataques sem contato resolvido não geram vibração de golpe; mantêm os próprios feedbacks claros de restauração/proteção.
- **Assinaturas de área por família:** `strike` indica núcleo contundente, `slash` mostra faixa diagonal, `pierce` indica avanço concentrado, e `counter` destaca a defesa/reversão. As marcas são internas às casas do efeito e não substituem o alcance calculado pelo motor.
- **Reinicialização robusta:** `TacticalEffectsLayer.clear()` também zera `freezeStart`/`freezeUntil`; novos combates não herdarem um congelamento anterior.
- Casos automatizados acrescentados em `tests/tactical-impact-presentation.test.js`, `tests/tactical-compact-ui.test.js` e `tests/tactical-effects-layer.test.js`. As verificações isoladas passaram; execução integral do CI ainda está pendente e o PR segue draft.

