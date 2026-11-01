> **Registro histórico.** Nomes, títulos, contagens, regras e direções visuais deste relatório refletem sua etapa de produção. Para o estado vigente, consulte [o índice canônico](PROJECT_CANON.md), [o catálogo atual](CHARACTER_CATALOG.md) e [a direção de arte](ART_DIRECTION.md). IDs e caminhos antigos permanecem por compatibilidade.

# Oblivium Arena — O Véu / identidade anime

Reformulação de identidade da interface, preservando o catálogo de personagens, suas artes de retrato, passiva e habilidades. Nenhum arquivo de `art/characters/` ou de definição dos kits é substituído nesta entrega. Bônus de eventos e Legados são modificadores de partida, não reformulações das habilidades-base.

## Direção

Arquitetura monumental de um além distópico, portais partidos, correntes, esmaltes escuros e luz espiritual. O cenário é pintura de fundo anime; os emblemas finais têm contornos definidos e cel shading. O Inferno usa brasa e ferro escuro; o Paraíso, marfim, jade e ouro; o Limbo, prata e ametista. A trilha mantém o brasão como fundo dos nós, sem voltar a um mapa geográfico.

17 brasões vetoriais inéditos em `src/crests.js`, cada um com desenho central próprio e moldura da família do seu reino. Ícones vetoriais da interface em `src/ui-icons.js`; glifos dos aprimoramentos em `src/augment-cards.js`, compartilhados com os nove tipos de nós.

Os eventos, Ecos e Legados usam a mesma família de cartas: ícone central, raridade, efeito com números destacados, destinatários e duração. A referência de apresentação é ARAM Mayhem; nenhuma ilustração, moldura, ícone ou texto da Riot é usada como asset do Oblivium Arena.

## Arquivos finais de arte gerada

Todos foram produzidos com a ferramenta integrada de geração de imagens, sem CLI/API alternativa. Versões otimizada WebP conservam a composição; emblemas preservam transparência. Os PNGs do ícone vêm do emblema anime final.

| Arquivo | Uso |
| --- | --- |
| `art/interface/veil-gate.webp` | cenário do portal e menu principal |
| `art/interface/inferno.webp` | seleção e panorama do Inferno |
| `art/interface/paraiso.webp` | seleção e panorama do Paraíso |
| `art/interface/limbo.webp` | seleção e panorama do Limbo |
| `art/interface/brand.webp` | emblema principal da marca |
| `art/interface/realm-inferno.webp` | insígnia do Inferno |
| `art/interface/realm-paraiso.webp` | insígnia do Paraíso |
| `art/interface/realm-limbo.webp` | insígnia do Limbo |
| `icon-192.png`, `icon-512.png` | ícone instalável anime |
| `icon.svg` | compatibilidade com URLs anteriores; contém o mesmo desenho aprovado |

## Prompts finais

### Portal

Use case: stylized-concept. Production background illustration for original dark dystopian anime tactical roguelite Oblivium Arena. Original panoramic landscape 3:2 environment, no UI, no typography, no people or characters. A monumental broken circular gate suspended above a drowned brutalist necropolis, enormous suspended chains, central thin molten ivory fissure, restrained bronze and oxidized teal accents, distant ash embers. Strong sophisticated anime background painting, clean expressive shapes, detailed cinematic painted cel shading, absolutely not photorealism. Gate on right half, left half mostly atmospheric charcoal fog for HTML heading. Dark rich values, readable focal hierarchy, solemn mystery. Entirely original architecture and art. No skull wallpaper, no gore, no existing franchise assets.

### Cenários dos mundos

Prefixo comum: Use case: stylized-concept. Asset type: production environment art for original dark dystopian anime tactical roguelite Oblivium Arena.

- Inferno: INFERNO, the realm of consequences and oppression. A colossal black iron citadel arranged above an abyss, immense angular cages suspended over deep crimson molten ravines, rivers of subdued ember light, terrifying scale and architectural symmetry, copper metal and ash in charcoal atmosphere. The buildings are material manifestations of violence and tyranny, no literal torture, no creatures.
- Paraíso: PARAISO, a solemn afterlife sanctuary of memory, justice and rebuilding rather than cheerful heaven. Ivory monumental arches, dark weathered marble, floating cloisters, an enormous fractured pale disc suspended above tranquil mist, abandoned elevated gardens with muted jade leaves, subtle warm gold veins, solemn melancholic luminous sanctuary emerging from deep blue shadows. No religious crosses, no gods, no characters.
- Limbo: LIMBO, the realm of unfinished journeys and broken bonds. Impossible ruined staircases floating inside a vast midnight-violet void, fragments of black stone doorways linked by enormous snapped silver chains, quiet pools reflecting pale lavender starlight, intricate original surreal architecture, a thin violet horizon, exquisite lonely mysterious atmosphere. No clocks or faces, no people.

Sufixo comum: Wide landscape illustration, clear central landmark in upper right and charcoal negative space across lower left, designed to work cropped as a 3:2 world-selection panel and as ambient interface art. Strong stylized anime background painting, rich cel-painted detail, expressive shapes, restrained highlights, premium dark fantasy game art. Not photorealism. No interface, no labels, no writing, no existing franchise assets. Every architectural motif original.

### Emblemas — desenho e edição anime

Conceitos individuais: marca anterior, portal circular de três segmentos (jade/brasa/ametista) com abertura de alma ao centro (substituída pela Mariposa do Véu em 23/10/2026); Inferno, coroa solar de ferro negro com fenda carmesim; Paraíso, arco de marfim com semente estelar e ramos protetores; Limbo, elos de prata rompidos envolvendo uma porta de ametista.

Após gerar esses conceitos como imagens separadas, cada um foi redesenhado usando este prompt final, com sua própria imagem como referência de edição:

Use case: style-transfer. Redraw this exact original Oblivium Arena game insignia as unmistakable 2D ANIME GAME ART. Preserve its core silhouette, symbolism and colors, and actual transparent background. Strong clean dark ink contours, bold simplified shapes, crisp flat cel shading with only two or three clearly separated values per material, graphic sharp-edged highlights and stylized supernatural energy. Remove ALL realistic surface grain, realistic metal scratches, photographic texture, painterly noise, smooth 3D rendering and photorealistic lighting. The result must look hand-drawn for a high-quality anime tactical game interface, not a photographed or 3D rendered physical object. Reduce tiny filigree, give large readable negative spaces, compact iconic composition at small sizes. Preserve original dark dystopian identity. No typography, no added characters, no backdrop. Center entire symbol, transparent safe margin.

## Expansão de jogo

51 eventos: 16 Prata, 22 Ouro e 13 Prismáticos; cobertura dos 17 Elos e das famílias cura, barreiras, aflições, marcas, apoio, controle, contra-ataques, cargas e formas alternativas. Cada oferta contém três eventos da mesma raridade. A abertura dos dois humanos usa o mesmo tier; as escolhas seguintes progridem pelo número de oportunidades daquele lado. Os eventos continuam a afetar ambos os trios.

34 Legados permanentes. Bônus novos passam pelo mesmo módulo de regras usado pelos eventos. O sistema não altera custos nem a defesa pessoal Invulnerável por um turno com recarga de quatro.

A API online continua dependendo de um Redis conectado. Esta reformulação não declara o ranqueamento global ativo.


## Marca aprovada — Mariposa do Véu (23/10/2026)

A segunda versão refinada escolhida por Eduardo é a referência única da marca. As asas superiores são violeta e obsidiana com marcas de marfim; as inferiores, carmesim; os contornos, dourados. As variações de tamanho são exportações do mesmo desenho, sem usar a proposta compacta alternativa.

- `art/interface/brand-moth.webp`: emblema principal transparente, 768 px, também usado como marca discreta no resultado de combate. `brand.webp` mantém compatibilidade com o arquivo anterior.
- `art/interface/brand-moth-192.webp` e `brand-moth-384.webp`: imagens responsivas do cabeçalho.
- `favicon-32.png`, `favicon-64.png`: ícone da aba; `apple-touch-icon.png`: atalho Apple de 180 px.
- `icon-192.png`, `icon-512.png`: ícones do aplicativo instalado, com manifest atualizado e versão de cache.

A imagem aprovada foi criada pela ferramenta integrada de geração de imagens. O preparo para a interface apenas remove margem transparente excedente e exporta os tamanhos com transparência e proporções preservadas.


Em 27/10/2026, a mariposa principal e sua variante violeta foram redesenhadas na linha anime 2.5D. Os arquivos de 192, 384 e 768 px mantêm o mesmo emblema e fundo transparente; `brand.webp` permanece por compatibilidade.


### Fundo transparente da marca

O emblema ativo `art/interface/moth-violet-20261027/brand-moth-192.webp` preserva canal alpha. Componentes de marca devem manter fundo transparente e não acrescentar placas, molduras ou halos opacos ao redor do recorte.
