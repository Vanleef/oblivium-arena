# Continuidade do atlas da Myra

Atualizado em 11/11/2026. Este handoff substitui a colagem do histórico completo e do prompt mestre.

## Projeto

- Repositório: `Vanleef/oblivium-arena`
- Branch: `fix/compact-card-readability-20261110`
- Atlases conectados: Myra, Elias, Voss, Iris, Hollow, Efialtes/O Desertor, Andriscus/O Usurpador, Quill/A Metamorfa Desire/Tarquínio, O Profanador Liora/A Marionetista Echo/O Simulacro e Sable/A Suturadora.
- Base deste checkpoint: `839cca818e8f5db54b975aaf2ac46f6fcf511a47`. Não alterar `main`.

## Estado

- Myra mantém o nome usado pelo usuário e o ID canônico `a-rainha-dos-fungos`; o atlas de Mire (`a-praga-andante`) permanece independente.
- Quill tem três folhas ligadas ao combate: forma humanoide, Quimera Terrestre quadrúpede e Quimera Alada com asas como membros dianteiros.
- Os recortes de Quill incluem Impulso, Técnica, Voto e Despertar para o corpo ativo; seis variações de habilidade usam mapeamentos de linha próprios.
- Desire tem atlas 6×6 próprio no combate: repouso, movimento e os quatro slots de ação, com efeitos compactos sem alvos duplicados.
- Liora tem atlas 6×7; a técnica especial `hold` usa a sétima linha dedicada.
- Echo usa atlas 6×6 para repouso, movimento e quatro ações, com efeitos de espelho carnal presos ao próprio corpo.
- Sable tem atlas 6×7; a forma especial `tecnica:remove` usa a sétima linha para Reforçar os Pontos.
- Cobertura: 56/150 atlas base e 248/689 técnicas/formas; há 25 mapeamentos específicos em `docs/TACTICAL_ANIMATION_COVERAGE.md`.

## Próximos passos

1. Próximo atlas pendente: Noctis (`o-que-apaga`).
2. Continue pelo elenco sem aguardar aprovação entre kits: localizar as artes atuais, gerar atlases de forma/kit necessários e ligar tudo ao combate.
3. Preserve IDs canônicos, anatomia coerente e a direção de arte pictórica 2.5D do projeto.

## Limite de chat e continuidade

O projeto não pode alterar os limites do ChatGPT. Para reduzir contexto repetido, comece o próximo chat só com:

> Continue o atlas da Myra no branch `fix/compact-card-readability-20261110`. Leia `docs/CONTINUIDADE_ATLAS_MYRA.md` e prossiga pelos próximos passos. Não cole o histórico nem o prompt mestre.

Se uma conversa nova atingir o limite após uma mensagem curta, registre horário, modelo e URL/ID ao relatar o problema ao suporte.
