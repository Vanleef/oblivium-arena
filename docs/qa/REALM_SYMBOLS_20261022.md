# Símbolos dos reinos e ícone dark do jogo

O ícone do jogo é um selo ritual em V, com P no braço superior esquerdo, M no superior direito e A na ponta inferior. Os braços curvos têm contornos e gravações em ouro envelhecido, com tons discretos dos três mundos no interior. Filamentos cruzados e arcos abertos completam a composição. As letras serifadas recebem o mesmo degradê de ouro e bronze individualmente. O centro e o exterior são transparentes; SVG e PNGs aparecem no cabeçalho e nos ícones de instalação.

Referência de linguagem visual: [selos de Elden Ring](https://www.eurogamer.de/elden-ring-alle-heiligen-siegel-finden-ausruesten-kaufen-und-verbessern?page=2), com traços vetoriais próprios para a composição de PMA.

## Verificação

- Os emblemas dos mundos mantêm o fundo transparente e incluem contorno preto nos motivos principais.
- O ícone tem silhueta em V; as áreas abertas e externas são transparentes nos PNGs de 192 × 192 e 512 × 512.
- A ordem visual é P à esquerda, M à direita e A abaixo, com ouro envelhecido e cores dos mundos nas hastes.
- Os PNGs foram decodificados e os arquivos aparecem nos caminhos usados pelo cabeçalho, favicon, manifesto e cartões dos reinos.
- `node --test --test-skip-pattern='o trio inicial tem retrato|os sessenta e sete personagens seguintes'`: 134 aprovados. Dois testes do acervo antigo foram omitidos porque as imagens pré-existentes correspondentes não estão nesta cópia parcial.
