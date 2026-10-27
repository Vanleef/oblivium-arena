# Direção de arte de PMA

## Linha vigente: anime 2.5D (26/10/2026)

O usuário aprovou a prancha de A Porta que Flutua e pediu que todo o jogo siga essa linha. Use art/source/a-porta-que-flutua-anime-first-20261026-sheet.webp como referência visual principal. O acabamento pictórico digital descrito em ART_STYLE_DIRECTION_20261025.md é histórico e não define a nova linha.

- Anime-forward 2.5D com rostos expressivos e formas estilizadas.
- Contornos desenhados firmes, sombras em planos angulares de cel shading e silhuetas legíveis em miniatura.
- Materiais e cenários com textura e profundidade pictórica, sem transformar rostos e corpos em retratos naturalistas.
- Contraste dramático e cor de acordo com o mundo, Elo, identidade e ação do personagem.
- Evitar fotorealismo, CGI liso ou brilhante, aparência fotográfica e pincelada a óleo que torne a imagem naturalista.
- Variar câmera, distância, ângulo, movimento e foco entre as seis cenas; mostrar ação, reação ou consequência de modo claro.
- Manter anatomia, mãos, articulações, empunhadura e contato de armas coerentes. Preservar idade, rosto, cabelo, roupa, acessórios, lateralidade e marcas permanentes.
- Retrato, passiva e quatro habilidades permanecem seis sprites WebP de 512 × 512. Para folhas 3 × 2, arquivar também a fonte original de 1536 × 1024 e registrar qualquer correção.
- Fazer a contagem de inimigos e aliados corresponder exatamente ao kit. Defesas pessoais mostram apenas o usuário; apoios mostram somente os beneficiários corretos.
- Não alterar custo, alvo, efeito, duração, recarga, regra de combate ou lore para justificar uma cena.
- Aplicar a direção a personagens, formas alternativas, cenários e qualquer outra arte do jogo. A migração só conta como concluída depois da inspeção visual de cada arte ativa.

## Migração em andamento

## Regra infernal e cobertura atualizada — 27/10/2026

- Personagens do Inferno precisam parecer demônios ou entidades infernais à primeira vista. Traços humanos preservam identidade, não uma aparência humana comum. Cada personagem recebe sinais próprios do Reino e do kit; não repetir um único modelo demoníaco. Esta regra inclui Oblívio.
- Títulos precisam ser concisos e combinar com o Reino e o conceito. Aristides, de Oblívio, passa a ser **Aristides, O Regulador**; “O Justo” sugeria santidade incompatível com a leitura desejada para o Inferno.
- A auditoria anime-first anterior registrava 19/100 conjuntos e 114/600 sprites. Com Aristides, são 20/100 conjuntos e 120/600 sprites. Restam 80 conjuntos base para refazer e revisar.
- O kit de Aristides inclui seis sprites base e uma arte própria para a forma alternativa `balance` / **Prato Ascendente**. Sem chifres nem balanças na arte: usar energia infernal dourada e signos.
- O emblema principal, a variante violeta, os sete arquivos de marca e seis ícones de aplicação foram atualizados. As artes de Reino e do portal, demais formas alternativas e o restante da interface continuam na auditoria.
- O catálogo tem 55 personagens do Inferno. O Regulador inicia esta rodada de reformulação infernal; os outros 54 precisam de inspeção visual e redesign quando a arte não transmitir essa leitura.
- Em qualquer arte de habilidade, alvos são ghouls ou personagens identificáveis do elenco (protagonistas, coadjuvantes ou inimigos); nunca soldados genéricos de armadura. Respeitar a quantidade exata de alvos.
- Progresso infernal e progresso anime-first são contagens diferentes: um conjunto só conclui ambos quando os seis sprites e suas formas ativas forem inspecionados sob as duas regras.


Há 100 conjuntos base de personagem (600 sprites base). Os conjuntos revisados sob a linha anterior não contam como migrados até passarem por essa direção e por revisão visual. As formas alternativas e outras artes do jogo também precisam entrar na auditoria.

Manifesto da primeira integração: ART_ANIME_FIRST_REWORK_20261026_02.json.
Registro histórico da direção anterior: ART_STYLE_DIRECTION_20261025.md.

## Histórico de conjuntos produzidos sob direções anteriores

Cada personagem jogável inicial tem seis imagens quadradas: retrato, passiva e quatro técnicas. As imagens estão em WebP individuais; as folhas 3×2 originais ficam em `art/source/`.

| Personagem | Identidade | Motivos de habilidade | Arquivos |
| --- | --- | --- | --- |
| O Escudo Vivo | Mulher de 38 anos, pele escura, cabelo prateado curto, porte largo e armadura assimétrica de vidro azul | Chama protegida, muralha de vitral, amparo individual, três escudos conectados e domo dourado | `art/characters/o-escudo-vivo/` |
| A Brasa Eterna | Homem de 24 anos, corpo esguio, cabelo cacheado preto raspado nas laterais e trança vermelha | Carvão aceso, faísca de impacto, coluna vertical de fogo, marca no chão e manto de cinzas | `art/characters/a-brasa-eterna/` |
| O Passo Interrompido | Pessoa andrógina de 21 anos, olhos de cores diferentes, corte assimétrico e casaco longo marfim e violeta | Prisma em órbita, chão aberto, pegadas fora de fase, espelho estilhaçado e desvio espacial | `art/characters/o-passo-interrompido/` |
| O Açougueiro, A Viúva Escarlate, O Colecionador de Cabeças, Gêmeos do Cutelo, O Carrasco sem Rosto e A Mãe Rubra | Seis silhuetas de Sangria: criatura humanoide composta de carne e musculatura robusta, duelista elegante, arquivista alto, dupla de gêmeos, executor faceless e matriarca compacta | Lâmina, fios, máscaras, correntes, selo, tecido protetor e outras composições de Sangria sem gore | `art/characters/<id>/` |
| O Soberano Quebrado, A Juíza de Ferro, O Trono Vazio, O Príncipe das Correntes, A Regente de Cinzas e O Herdeiro Cativo | Seis identidades de Coroa, incluindo uma soberana espectral ligada a um trono desocupado e cinco personagens com idades, corpos, roupas e silhuetas diferentes | Peso, ordem, grilhões, decreto e coroação com ângulos e formas próprios para cada personagem | `art/characters/<id>/` |
| O Sussurro, A Máscara Dupla, O Tecelão de Mentiras, A Boca de Vidro, O Falso Profeta e O Corretor de Memórias | Seis silhuetas de Mentira: conspirador de trança longa, ilusionista de máscaras, marionete de seis braços, soprador de vidro, falso oráculo e arquivista de mão mecânica | Véus, reflexos falsos, fios de marionete, refração, ecos plantados e cartões de memória em composições próprias | `art/characters/<id>/` |
| O Incendiário, O Ódio Encarnado, O Filho da Cinza, A Pira Errante e O Coração em Fúria | Cinco silhuetas inéditas de Chama para completar o Elo ao lado de A Brasa Eterna: incendiário de mão larga, espírito de placas vulcânicas, jovem sob poncho de cinzas, braseiro ambulante e guerreiro com núcleo em forma de coração | Faíscas, colunas de brasa, marcas punitivas e mantos de cinza compostos de modos próprios para cada identidade | `art/characters/<id>/` |
| O Devorador, A Mão que Toma, O Estômago sem Fundo, A Senhora do Último Pão, O Credor e A Balança Vazia | Humanoide de boca sombria, ladra com mão espectral, vaso ambulante com vazio estelar, padeira idosa, cobrador de monocle e espírito de balança | Motes de Essência, sombras vorazes, fios de dívida, mãos de cobrança e proteção em forma de mesa, luz ou balança | `art/characters/<id>/` |
| O Apodrecido, A Praga Andante, O Corrupto, A Rainha dos Fungos, O Médico de Vermes e O Jardim Morto | Seis formas diferentes de decadência: homem-árvore, nuvem ambulante, nobre de espinhos, rainha fúngica, médico com terrários e estufa de pernas | Mofo, esporos, raízes e proteção orgânica em quadros próprios, sem gore | `art/characters/<id>/` |
| O que Observou, A Porta Fechada, O Surdo, A Testemunha Cega, O Quarto Vazio e O Vigia Ausente | Astrônomo idoso, carpinteira com portal portátil, homem dos abafadores, testemunha de olhos cobertos, cômodo assombrado e capa vazia com lanterna flutuante | Recortes de luz, ecos interrompidos, portas, espaços negativos e apagamento sonoro para cada identidade | `art/characters/<id>/` |
| O que Possui, A Pele Alheia, O Desejo Quebrado, A Marionetista de Nervos, O Espelho Carnal e A Costureira | Homem seguido por sombra própria, mulher de casaco mutável, dançarino de fragmento flutuante, manipuladora de fios, espírito de argila refletiva e costureira idosa | Silhuetas falsas, tecidos, fios de fibra e reflexos abstratos, sem imagens gráficas | `art/characters/<id>/` |
| O que Apaga, A Ausência, O Fim Silencioso, O Menino sem Sombra, A Última Página e O Lugar de Ninguém | Apagador de superfícies, vazio antropomórfico, duelista de prata, garoto de casaco amarelo, encadernadora e encruzilhada viva | Fragmentos nulos, frio, fendas no espaço e apagamento branco representados por imagem própria em cada técnica | `art/characters/<id>/` |
| A Muralha, O que Ficou, O Último Guardião e A Sentinela Azul | Arquitetura viva de vitral, homem de capa de chuva e guarda-chuva, ancião vigia com cajado-lanterna e sentinela de pele escura com manto de arraia | Abrigo de pedra, guarda sob a chuva, vigília de lanternas e correntes de vento azul, cada técnica com cenário e composição próprios | `art/characters/<id>/` |
| A Mão que Cura, O Restaurador, A Luz que Restaura, A Jardineira das Feridas e O Pulso Sereno | Cirurgiã com dedos de porcelana articulados, artesão idoso de kintsugi, espírito-mariposa não humano, botânica alta de manto vegetal e músico de pele escura com handpan | Diagnóstico atento, reparo dourado, asas restauradoras, cultivo medicinal e ondas sonoras; cada técnica usa enquadramento e efeito próprios | `art/characters/<id>/` |
| O Equilíbrio, A Lâmina Justa, O que Pesa, A Testemunha Íntegra e O Julgador Gentil | Balança autômata com pássaros, duelista veterana de espada única, guardião humanoide de gravidade com pêndulo de ferro, anciã testemunha com lente âmbar e jovem magistrado com malho de madeira | Contrapeso, luz refletida, peso no terreno, revelação sem distorção e conciliação; imagens específicas para cada técnica | `art/characters/<id>/` |

Cada personagem jogável listado tem seis imagens individuais em WebP; são 444 imagens para os 74 conjuntos completos. O chefe O Fim (The End) tem retrato próprio em `art/characters/o-fim/portrait.webp`: uma figura mascarada e não humana, com coroa de ferro queimado. Parte da coleção permanece em acabamento anime 2D de lotes antigos; isso é legado visual, não critério de conclusão. Silhuetas, paletas e elementos continuam distintos.

Os recortes seguem os nomes `portrait.webp`, `passive.webp`, `skill-impulso.webp`, `skill-tecnica.webp`, `skill-voto.webp` e `skill-despertar.webp`. `skill-despertar.webp` é sempre a técnica defensiva e deve comunicar proteção, evasão, restauração ou redirecionamento.

## Regras para novas artes

1. Defina antes a idade, o corpo, o rosto, o cabelo, a roupa e a silhueta do personagem. Compare esses itens com os designs existentes para evitar que pareçam variações do mesmo modelo.
2. Faça um retrato só para a identidade do personagem. Não repita o rosto em todos os ícones de habilidade.
3. Crie uma imagem por técnica, orientada pelo efeito mecânico e pelo nome. Varie enquadramento, geometria, escala e ponto de vista entre os quadros.
4. Mantenha a nova combinação de volume pintado e desenho 2D consistente entre a coleção; varie cores e formas internas para refletir o mundo e a habilidade.
5. Confira o recorte quadrado em tamanho pequeno antes de integrar a folha. Evite repetir círculos, chamas, escudos ou explosões quando não forem a mecânica específica daquela habilidade.


## Revisão de seis conjuntos — 21/10/2026

Mensageira: cartas, origamis e evasão; O que Revela: monóculo transparente e prismas; Olho Desarmado: leitura de vestígios, impacto de palma e esquiva baixa; Guardiã: cordas de juramento e capa tecida defensiva; O que Pesa: pêndulo e gravidade; Trono Vazio: soberana espectral, correntes e intangibilidade. Cada conjunto contém retrato, passiva e quatro cenas distintas. A defesa da Guardiã foi corrigida por geração de imagem para mostrar a lança desviada pela capa.


## Âncoras visuais e lore infernal — 25/10/2026

As imagens aprovadas pelo usuário para a linha de arte são os retratos de O Fim, O Revelador e O Vidente. Toda arte de personagem deve ser comparada a essas três referências; um rótulo “híbrido” ou um caminho atualizado não substitui inspeção visual. Os seres do Inferno são quase todos vis e movidos pela maldade; não criar personagens bondosos nesse domínio. Alguns podem discordar de O Fim sem serem bondosos. Aplicar a regra conforme a origem e a lore canônicas.
