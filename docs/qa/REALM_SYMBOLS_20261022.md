# Símbolos dos reinos e ícone dark do jogo

Os três emblemas dos mundos usam símbolos vetoriais transparentes com contorno preto para destacar suas silhuetas sem adicionar molduras. Inferno usa uma chama serrilhada; Paraíso, linhas abertas e fluidas com um foco de luz; Limbo, elos interrompidos. O ícone do jogo agora é uma sombra assimétrica de eclipse atravessada por uma única fenda curva de luz, como o véu se abrindo. A forma evita molduras circulares, ponteiros e detalhes gravados; o nome P.M.A. permanece no wordmark da interface. O SVG e os PNGs continuam sem fundo e substituem a marca no cabeçalho e os ícones de instalação.

## Verificação

- Os emblemas dos mundos mantêm o fundo transparente e incluem contorno preto nos motivos principais.
- O ícone SVG não tem placa ou fundo; os PNGs exportados têm transparência e 192 × 192 e 512 × 512.
- O símbolo tem uma única silhueta e uma única fenda, sem anel, ponteiro ou marcas radiais que possam sugerir um relógio.
- Os PNGs foram decodificados e os arquivos aparecem nos caminhos usados pelo cabeçalho, favicon, manifesto e cartões dos reinos.
- `node --test --test-skip-pattern='o trio inicial tem retrato|os sessenta e sete personagens seguintes'`: 134 aprovados. Dois testes do acervo antigo foram omitidos porque as imagens pré-existentes correspondentes não estão nesta cópia parcial.
