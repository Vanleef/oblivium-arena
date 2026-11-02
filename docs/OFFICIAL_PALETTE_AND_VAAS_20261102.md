# Paleta oficial e atlas de Vaas — 02/11/2026

A interface acompanha o logo OA aprovado: carvão neutro, ouro e marfim. `official-theme.css`, carregado por último nas duas entradas, centraliza as cores e adapta login, navegação, Codex, expedições, perfil, cartas e controles táticos. O manifesto e a barra do navegador usam o mesmo carvão.

| Papel | Cor |
| --- | --- |
| Fundo | `#101113` |
| Painel | `#1c1d20` |
| Painel elevado | `#252629` |
| Ouro | `#e8bd69` |
| Ouro claro | `#ffe5a1` |
| Marfim | `#f6f0e3` |
| Texto secundário | `#b6b0a5` |

Contrastes calculados: marfim/painel 14,84:1; texto secundário/painel elevado 7,02:1; ouro/painel 9,56:1; texto escuro/extremo mais escuro do botão dourado 6,75:1. As cores semânticas dos Mundos, equipes, dano, cura e Essências permanecem independentes da marca.

## Vaas

Atlas em `art/animations/tactical-pilot-20261101/vaas.webp`: 1254×1254, 6×6 células de 209 pixels, 36 poses com transparência. Linhas: repouso, movimento, Verdade Plantada, Véu de Veneno, O Rosto que Falta e Última Máscara. Sem espada. A identidade segue o retrato canônico: cabelo preto, meia-máscara marfim, olho âmbar e sobretudo escuro com forro verde-acinzentado.

Gerado com a ferramenta interna de imagens, a partir do retrato canônico. Brief final: 36 poses compactas em grade 6×6, grandes margens transparentes, gestos próximos ao corpo, sem efeitos nem armas, vista de três quartos para a direita, anime 2.5D pictórico. A primeira tentativa foi recusada por sobreposição. A segunda foi empacotada com base dos pés estável e limpeza de resíduos quase transparentes, sem redimensionar as figuras. VFX permanecem separados e compartilhados; o atlas base não representa quatro efeitos exclusivos.

Vaas está selecionável no piloto. Cobertura: 14/150 atlas base, 56/689 recortes de técnicas/formas; um atlas exclusivo de habilidade (Fio de Memória). Corrigida a seleção do quadro de recuperação de aflição, que pulava o quinto desenho.

Verificação visual em navegador: login, Codex, arena e seleção de Vaas com suas quatro ações. Os testes táticos verificam os seis recortes por ação e as sequências de combate.
