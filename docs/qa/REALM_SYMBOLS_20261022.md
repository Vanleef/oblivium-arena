# Símbolos dos reinos e ícone dark do jogo

Os três emblemas dos mundos usam símbolos vetoriais transparentes com contorno preto para destacar suas silhuetas sem adicionar molduras. Inferno usa uma chama serrilhada; Paraíso, linhas abertas e fluidas com um foco de luz; Limbo, elos interrompidos. O ícone do jogo condensa a arte do portal em três placas de metal escurecido, com bordas douradas gastas, marcas gravadas, núcleo escuro e uma fenda vertical de luz. A abertura superior sugere o véu rompido; a inscrição P.M.A. funciona como marca do criador. O desenho preserva a silhueta simples, e mantém o SVG e os PNGs sem fundo; ele também substitui a marca no cabeçalho e os ícones de instalação.

## Verificação

- Os emblemas dos mundos mantêm o fundo transparente e incluem contorno preto nos motivos principais.
- O ícone SVG não tem placa ou fundo; os PNGs exportados têm transparência e 192 × 192 e 512 × 512.
- A inscrição P.M.A. está fora da silhueta principal para preservar a leitura do portal em tamanhos pequenos.
- Os PNGs foram decodificados e os arquivos aparecem nos caminhos usados pelo cabeçalho, favicon, manifesto e cartões dos reinos.
- `node --test --test-skip-pattern='o trio inicial tem retrato|os sessenta e sete personagens seguintes'`: 134 aprovados. Dois testes do acervo antigo foram omitidos porque as imagens pré-existentes correspondentes não estão nesta cópia parcial.
