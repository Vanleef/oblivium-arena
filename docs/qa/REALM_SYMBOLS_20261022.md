# Símbolos dos reinos e ícone dark do jogo

Os três emblemas dos mundos formam o ícone do jogo em uma composição triangular: Paraíso no topo com a letra P, Inferno embaixo à esquerda com M e Limbo embaixo à direita com A. As letras ficam centradas sobre os brasões; conexões douradas tracejadas e discretas unem os vértices. O desenho reaproveita os vetores próprios de cada reino, preserva suas cores e contornos pretos e não adiciona placas ou fundo. O SVG e os PNGs transparentes aparecem no cabeçalho e nos ícones de instalação.

## Verificação

- Os emblemas dos mundos mantêm o fundo transparente e incluem contorno preto nos motivos principais.
- O ícone SVG não tem placa ou fundo; os PNGs exportados têm transparência e 192 × 192 e 512 × 512.
- Os três brasões e as letras P, M e A aparecem nos vértices e no centro de cada símbolo, respectivamente.
- Os PNGs foram decodificados e os arquivos aparecem nos caminhos usados pelo cabeçalho, favicon, manifesto e cartões dos reinos.
- `node --test --test-skip-pattern='o trio inicial tem retrato|os sessenta e sete personagens seguintes'`: 134 aprovados. Dois testes do acervo antigo foram omitidos porque as imagens pré-existentes correspondentes não estão nesta cópia parcial.
