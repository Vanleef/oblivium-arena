# Símbolos dos reinos e ícone dark do jogo

Os três emblemas dos mundos usam símbolos vetoriais transparentes com contorno preto para destacar suas silhuetas sem adicionar molduras. Inferno usa uma chama serrilhada; Paraíso, linhas abertas e fluidas com um foco de luz; Limbo, elos interrompidos. O ícone do jogo agora usa uma abordagem de pincel e nanquim anime: um eclipse de bordas irregulares atravessado por três rastros dos mundos. O SVG e os PNGs mantêm o fundo transparente; o símbolo também substitui a marca no cabeçalho e os ícones de instalação.

## Verificação

- Os emblemas dos mundos mantêm o fundo transparente e incluem contorno preto nos motivos principais.
- O ícone SVG não tem placa ou fundo; os PNGs exportados têm transparência e 192 × 192 e 512 × 512.
- Os PNGs foram decodificados e os arquivos aparecem nos caminhos usados pelo cabeçalho, favicon, manifesto e cartões dos reinos.
- `node --test --test-skip-pattern='o trio inicial tem retrato|os sessenta e sete personagens seguintes'`: 134 aprovados. Dois testes do acervo antigo foram omitidos porque as imagens pré-existentes correspondentes não estão nesta cópia parcial.
