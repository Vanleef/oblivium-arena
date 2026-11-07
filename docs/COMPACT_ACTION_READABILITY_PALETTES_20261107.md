# Legibilidade das áreas e identidade cromática — combate compacto (07/11/2026)

## Problema corrigido

Os diagramas de footprint 7×7 nos comandos estavam comprimidos em **16–24px**, especialmente ilegíveis em celulares. As áreas de impacto sobre o tabuleiro dependiam de bordas finas e fundos translúcidos similares ao cenário, sem indicar claramente o centro da ação ou o local de origem do golpe.

## Implementação

- As opções de **Habilidades** mostram o nome da técnica, seu ícone e o mesmo diagrama derivado de `patternCells`; nenhuma área de ataque é inventada pelo front-end.
- O diagrama permanece com 7×7 células, mas agora mede **50×50px no desktop, 40×40px no mobile e 37×37px nas telas mais estreitas** (a geometria da prévia não foi alterada).
- A legenda **Origem / Área** fica visível no painel, não apenas em tooltip, e o botão da técnica selecionada tem borda mais forte.
- A área resolvida na arena recebeu preenchimento mais sólido, contorno grosso, brilho interior, **marcador do centro** e **anel de origem**. Os elementos não interceptam cliques.
- Prévia e impacto têm tratamentos diferentes; o modo de movimento reduzido mantém áreas estáticas e legíveis.
- Atributos de acessibilidade das células descrevem quando pertencem à área, ao centro ou à origem. Planejamento simultâneo e alvos válidos são preservados.

## Identidade cromática do personagem

Adicionado `src/tactical-visual-palette.js`, usado simultaneamente pela camada Canvas, pela área de ataque, pelos mini-diagramas e pela apresentação de especiais.

Prioridades:

1. Paleta explícita de VFX validada, quando o personagem/formação a fornecer.
2. Identidade específica de personagens já dirigidos artisticamente.
3. Cores modificadas pela transformação ativa (ex.: absorção de Nilo).
4. Identidade de cor do Reino do personagem.
5. Somente em situações sem identidade, fallback do tom da técnica/mundo.

Os valores são exclusivamente trios hexadecimais validados para serem utilizados nas variáveis CSS. **Nenhuma imagem é analisada automaticamente**: as cores foram definidas artisticamente, com ajuste individual em identidades prioritárias, e o restante usa a paleta de seu Reino.

## Arquivos

- `src/compact-demo.js`: nome das habilidades, legenda e classes de área e personagem;
- `compact-planning.css`: ampliação de footprints, contrastes e responsividade;
- `src/tactical-visual-palette.js`: paletas centralizadas e validadores;
- `src/tactical-effects-layer.js`: cor dominante na emissão, impacto, partículas, projéteis e proteção;
- `src/tactical-cinematic.js`: vinheta estilo jogo de luta e legenda com a cor do personagem;
- `tests/tactical-visual-palette.test.js`, `tests/tactical-compact-ui.test.js`, `tests/tactical-effects-layer.test.js`: testes de regressão.

## Validação pendente

Verificação JavaScript isolada: **31 testes/verificações passaram**, incluindo a execução das unidades de paleta e efeitos e checagem de sintaxe de dois módulos de UI. Isso não substitui o runner Node, revisão visual e teste de comportamento em aparelho.

Comandos de revisão recomendados:

```sh
node --test tests/tactical-visual-palette.test.js tests/tactical-effects-layer.test.js tests/tactical-compact-ui.test.js tests/tactical-area-diagram.test.js
npm run test:compact
npm run smoke:compact
npm run build
npm test
```

Revisar três resoluções: desktop (≥1024px), mobile (~390px) e celular estreito (~320px). Conferir: nome de todas as técnicas, leitura das células do diagrama, área afetada real, posição de origem, elemento de cura/defesa e paleta predominante de cada personagem. O PR permanece **draft**, sem integrar na `main`.
