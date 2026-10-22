# Símbolos dos reinos e ícone dark do jogo

O ícone do jogo é um molde triangular único de cantos suavizados. As cores dos mundos preenchem o triângulo com transições contínuas: verde-água no topo, vermelho embaixo à esquerda e violeta embaixo à direita. O desenho usa somente a paleta dos reinos, sem as formas dos brasões. P permanece no topo, M embaixo à esquerda e A embaixo à direita, com a mesma fonte e o mesmo degradê de ouro envelhecido e bronze escuro. O exterior do triângulo é transparente no SVG e nos PNGs usados pelo cabeçalho e pelos ícones de instalação.

## Verificação

- Os emblemas dos mundos mantêm o fundo transparente e incluem contorno preto nos motivos principais.
- O ícone tem um triângulo preenchido; a área externa permanece transparente nos PNGs de 192 × 192 e 512 × 512.
- As três cores se misturam dentro do molde triangular; P, M e A mantêm suas posições e o dourado escuro.
- Os PNGs foram decodificados e os arquivos aparecem nos caminhos usados pelo cabeçalho, favicon, manifesto e cartões dos reinos.
- `node --test --test-skip-pattern='o trio inicial tem retrato|os sessenta e sete personagens seguintes'`: 134 aprovados. Dois testes do acervo antigo foram omitidos porque as imagens pré-existentes correspondentes não estão nesta cópia parcial.
