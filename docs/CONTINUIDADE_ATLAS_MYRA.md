# Continuidade do atlas da Myra

Atualizado em 11/11/2026. Este handoff substitui a colagem do histórico completo e do prompt mestre.

## Projeto

- Repositório: `Vanleef/oblivium-arena`
- Branch: `fix/compact-card-readability-20261110`
- Atlases conectados: Myra, Elias, Voss, Iris, Hollow, Efialtes/O Desertor, Andriscus/O Usurpador, Quill/A Metamorfa Desire/Tarquínio, O Profanador e Liora/A Marionetista.
- Base deste checkpoint: `5a39528075c45868dca37b036f3890da912230af`. Não alterar `main`.

## Estado

- Myra mantém o nome usado pelo usuário e o ID canônico `a-rainha-dos-fungos`; o atlas de Mire (`a-praga-andante`) permanece independente.
- Quill tem três folhas ligadas ao combate: forma humanoide, Quimera Terrestre quadrúpede e Quimera Alada com asas como membros dianteiros.
- Os recortes de Quill incluem Impulso, Técnica, Voto e Despertar para o corpo ativo; seis variações de habilidade usam mapeamentos de linha próprios.
- Desire tem atlas 6×6 próprio no combate: repouso, movimento e os quatro slots de ação, com efeitos compactos sem alvos duplicados.
- Liora tem atlas 6×7; a técnica especial `hold` usa a sétima linha dedicada.
- Cobertura: 54/150 atlas base e 239/689 técnicas/formas; há 24 mapeamentos específicos em `docs/TACTICAL_ANIMATION_COVERAGE.md`.

## Próximos passos

1. Próximo atlas pendente: Echo (`o-espelho-carnal`).
2. Continue pelo elenco sem aguardar aprovação entre kits: localizar as artes atuais, gerar atlases de forma/kit necessários e ligar tudo ao combate.
3. Preserve IDs canônicos, anatomia coerente e a direção de arte pictórica 2.5D do projeto.

## Limite de chat e continuidade

O projeto não pode alterar os limites do ChatGPT. Para reduzir contexto repetido, comece o próximo chat só com:

> Continue o atlas da Myra no branch `fix/compact-card-readability-20261110`. Leia `docs/CONTINUIDADE_ATLAS_MYRA.md` e prossiga pelos próximos passos. Não cole o histórico nem o prompt mestre.

Se uma conversa nova atingir o limite após uma mensagem curta, registre horário, modelo e URL/ID ao relatar o problema ao suporte.
