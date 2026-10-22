# Símbolos sem moldura dos reinos e do jogo

Os três emblemas dos mundos agora usam símbolos vetoriais transparentes, sem placa, aro ou ornamento de fundo. Inferno usa uma chama serrilhada; Paraíso, linhas abertas e fluidas com um foco de luz; Limbo, elos interrompidos. O ícone do jogo reúne os três motivos em torno de uma centelha central e também substitui a marca no cabeçalho, o favicon e os PNGs de instalação.

## Verificação

- Os três SVGs dos mundos têm duas formas cada e não incluem retângulo, círculo, texto ou placa.
- O ícone SVG não tem fundo opaco; os PNGs exportados têm 192 × 192 e 512 × 512, RGBA e transparência.
- Os PNGs foram decodificados e os arquivos aparecem nos caminhos usados pelo cabeçalho, favicon, manifesto e cartões dos reinos.
- `node --test --test-skip-pattern='o trio inicial tem retrato|os sessenta e sete personagens seguintes'`: 134 aprovados. Dois testes do acervo antigo foram omitidos porque as imagens pré-existentes correspondentes não estão nesta cópia parcial.