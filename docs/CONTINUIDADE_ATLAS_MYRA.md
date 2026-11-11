# Continuidade do atlas da Myra

Atualizado em 11/11/2026. Este handoff substitui a colagem do histórico completo e do prompt mestre.

## Projeto

- Repositório: `Vanleef/oblivium-arena`
- Branch: `fix/compact-card-readability-20261110`
- Último checkpoint de código conferido: `522f7cdcc13e20f56273156bb383d53659228fec`
- Não alterar `main`.

## Estado

- Myra é o nome usado pelo usuário. Preservar o ID canônico `a-rainha-dos-fungos`; não renomear.
- Retrato, passiva, quatro artes de habilidade, paleta e VFX já estão registrados.
- O atlas de Mire/`a-praga-andante` é separado e não deve ser reutilizado.
- Myra segue em 0/6 animações de atlas; a cobertura registrada é 44/150.
- A folha da Biblioteca `Rainha fúngica em 36 poses.png` tem grade 6×6 (1254×1254), mas não serve como atlas de runtime: há muito ruído de baixa opacidade, franjas vermelhas/amarelas e raízes invadindo células vizinhas. Uma edição guiada em 11/11 também manteve halo vermelho. Manter como referência visual; não integrar. Myra segue 0/6 e nenhum arquivo do jogo foi alterado.

## Próximos passos

1. Produzir atlas 6×6 transparente, com bordas limpas e seis linhas: idle, movimento, impulso, técnica Bloom, voto Cloud e despertar.
2. Preservar a personagem: mulher adulta, pele lavanda, cabelo preto curto, vestido marfim, manto de cogumelos violeta e cajado de raiz com âmbar. Poderes físicos de raízes, fungos e esporos; anatomia e silhueta legíveis; sem halo, tecnologia, pose para câmera ou olhar para câmera.
3. Só então conectar o arquivo a `a-rainha-dos-fungos`, mantendo Mire intacta; atualizar auditoria e testes existentes. A contagem passa de 44 para 45 quando o atlas for integrado.
4. Validar build e animação em campo compacto antes de publicar o branch.

## Limite de chat e continuidade

O projeto não pode alterar os limites do ChatGPT. Para reduzir o contexto repetido, comece o próximo chat só com:

> Continue o atlas da Myra no branch `fix/compact-card-readability-20261110`. Leia `docs/CONTINUIDADE_ATLAS_MYRA.md` e prossiga pelos próximos passos. Não cole o histórico nem o prompt mestre.

Se o aviso de conversa cheia aparecer após uma única mensagem curta em um chat novo, isso não é resolvido encurtando este handoff: consulte `status.openai.com` e tente a mesma mensagem numa janela privada. Se persistir, envie ao suporte o horário, modelo e URL/ID da conversa.
