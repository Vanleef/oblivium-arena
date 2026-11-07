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
