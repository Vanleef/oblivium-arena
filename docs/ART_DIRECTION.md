# Direção de arte de PMA

## Linguagem visual

- Anime japonês 2D de ação sobrenatural, com line art expressiva, silhuetas claras, cel shading e efeitos desenhados à mão.
- Fantasia sombria legível e vibrante; evitar pintura realista, acabamento fotográfico ou 3D.
- As cores indicam os reinos, mas identidade vem também de rosto, idade, porte, cabelo, roupa, postura e formas dos efeitos.
- Retratos mostram a identidade específica do personagem. Passivas e habilidades podem mostrar o efeito ou símbolo sem repetir o retrato.
- Cada imagem deve continuar reconhecível em miniaturas de 25 a 64 px.
- Sem letras, logotipos, personagens de franquias conhecidas, gore ou texto embutido.

## Conjuntos já produzidos

Cada personagem jogável inicial tem seis imagens quadradas: retrato, passiva e quatro técnicas. As imagens estão em WebP individuais; as folhas 3×2 originais ficam em `art/source/`.

| Personagem | Identidade | Motivos de habilidade | Arquivos |
| --- | --- | --- | --- |
| O Escudo Vivo | Mulher de 38 anos, pele escura, cabelo prateado curto, porte largo e armadura assimétrica de vidro azul | Chama protegida, muralha de vitral, amparo individual, três escudos conectados e domo dourado | `art/characters/o-escudo-vivo/` |
| A Brasa Eterna | Homem de 24 anos, corpo esguio, cabelo cacheado preto raspado nas laterais e trança vermelha | Carvão aceso, faísca de impacto, coluna vertical de fogo, marca no chão e manto de cinzas | `art/characters/a-brasa-eterna/` |
| O Passo Interrompido | Pessoa andrógina de 21 anos, olhos de cores diferentes, corte assimétrico e casaco longo marfim e violeta | Prisma em órbita, chão aberto, pegadas fora de fase, espelho estilhaçado e desvio espacial | `art/characters/o-passo-interrompido/` |
| O Açougueiro, A Viúva Escarlate, O Colecionador de Cabeças, Gêmeos do Cutelo, O Carrasco sem Rosto e A Mãe Rubra | Seis silhuetas de Sangria: açougueiro robusto, duelista elegante, arquivista alto, dupla de gêmeos, executor faceless e matriarca compacta | Lâmina, fios, máscaras, correntes, selo, tecido protetor e outras composições de Sangria sem gore | `art/characters/<id>/` |
| O Soberano Quebrado, A Juíza de Ferro, O Trono Vazio, O Príncipe das Correntes, A Regente de Cinzas e O Herdeiro Cativo | Seis identidades de Coroa, incluindo um trono vivo e cinco personagens com idades, corpos, roupas e silhuetas diferentes | Peso, ordem, grilhões, decreto e coroação com ângulos e formas próprios para cada personagem | `art/characters/<id>/` |
| O Sussurro, A Máscara Dupla, O Tecelão de Mentiras, A Boca de Vidro, O Falso Profeta e O Corretor de Memórias | Seis silhuetas de Mentira: conspirador de trança longa, ilusionista de máscaras, marionete de seis braços, soprador de vidro, falso oráculo e arquivista de mão mecânica | Véus, reflexos falsos, fios de marionete, refração, ecos plantados e cartões de memória em composições próprias | `art/characters/<id>/` |
| O Incendiário, O Ódio Encarnado, O Filho da Cinza, A Pira Errante e O Coração em Fúria | Cinco silhuetas inéditas de Chama para completar o Elo ao lado de A Brasa Eterna: incendiário de mão larga, espírito de placas vulcânicas, jovem sob poncho de cinzas, braseiro ambulante e guerreiro com núcleo em forma de coração | Faíscas, colunas de brasa, marcas punitivas e mantos de cinza compostos de modos próprios para cada identidade | `art/characters/<id>/` |
| O Devorador, A Mão que Toma, O Estômago sem Fundo, A Senhora do Último Pão, O Credor e A Balança Vazia | Humanoide de boca sombria, ladra com mão espectral, vaso ambulante com vazio estelar, padeira idosa, cobrador de monocle e espírito de balança | Motes de Essência, sombras vorazes, fios de dívida, mãos de cobrança e proteção em forma de mesa, luz ou balança | `art/characters/<id>/` |
| O Apodrecido, A Praga Andante, O Corrupto, A Rainha dos Fungos, O Médico de Vermes e O Jardim Morto | Seis formas diferentes de decadência: homem-árvore, nuvem ambulante, nobre de espinhos, rainha fúngica, médico com terrários e estufa de pernas | Mofo, esporos, raízes e proteção orgânica em quadros próprios, sem gore | `art/characters/<id>/` |
| O que Observou, A Porta Fechada, O Surdo, A Testemunha Cega, O Quarto Vazio e O Vigia Ausente | Astrônomo idoso, carpinteira com portal portátil, homem dos abafadores, testemunha de olhos cobertos, cômodo assombrado e capa vazia com lanterna flutuante | Recortes de luz, ecos interrompidos, portas, espaços negativos e apagamento sonoro para cada identidade | `art/characters/<id>/` |

Cada personagem jogável listado tem seis imagens individuais em WebP; são 264 imagens para os 44 conjuntos completos. O chefe O Fim (The End) tem retrato próprio em `art/characters/o-fim/portrait.webp`: uma figura mascarada e não humana, com coroa de ferro queimado. A linguagem de anime conecta a coleção, enquanto as silhuetas, paletas e elementos de cada personagem continuam distintas.

Os recortes seguem os nomes `portrait.webp`, `passive.webp`, `skill-impulso.webp`, `skill-tecnica.webp`, `skill-voto.webp` e `skill-despertar.webp`. `skill-despertar.webp` é sempre a técnica defensiva e deve comunicar proteção, evasão, restauração ou redirecionamento.

## Regras para novas artes

1. Defina antes a idade, o corpo, o rosto, o cabelo, a roupa e a silhueta do personagem. Compare esses itens com os designs existentes para evitar que pareçam variações do mesmo modelo.
2. Faça um retrato só para a identidade do personagem. Não repita o rosto em todos os ícones de habilidade.
3. Crie uma imagem por técnica, orientada pelo efeito mecânico e pelo nome. Varie enquadramento, geometria, escala e ponto de vista entre os quadros.
4. Mantenha line art e cel shading consistentes entre a coleção; varie as cores e formas internas para refletir o reino e a habilidade.
5. Confira o recorte quadrado em tamanho pequeno antes de integrar a folha. Evite repetir círculos, chamas, escudos ou explosões quando não forem a mecânica específica daquela habilidade.
