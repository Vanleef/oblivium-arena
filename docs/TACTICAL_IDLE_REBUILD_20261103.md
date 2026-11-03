# Reconstrução dos ciclos de idle — 03/11/2026

O idle dos 25 atlas-base passa a usar 48 quadros pré-renderizados a partir de uma pose registrada por personagem. Uma malha de triângulos mantém a identidade do desenho e anima respiração e movimento secundário de tecido/cabelo; os pontos inferiores das pernas permanecem fixos. Os quadros são gerados uma vez por modelo e reutilizados nas atualizações da interface. A reprodução tem cerca de 25–30 quadros por segundo nos ciclos atuais de 1,6–1,92 s.

Esta revisão substitui a alternância das seis poses de idle e as deformações CSS anteriores. A aparência é derivada da arte-base existente: não se trata de 48 novas ilustrações manuais. Movimento, golpes, formas e projéteis continuam com as sequências existentes; personagens sem atlas-base não recebem um atlas inventado.

A geração dos quadros ocorre em tarefas curtas, fora do orçamento contínuo de reprodução. O desenho original fica visível enquanto a folha é composta. A mesma folha é compartilhada por cópias aliadas/rivais do personagem. Ao começar uma ação, o personagem usa novamente seu atlas de ação. A opção de movimento reduzido preserva uma pose estática.

Foi experimentada uma folha raster de 16 quadros para Lira pelo gerador integrado de imagens. A folha não foi integrada: alguns desenhos mudavam o ângulo da cabeça e não cumpriam a continuidade desejada. Prompt: redesenhar um ciclo de respiração de Lira em 16 células 4×4, transparência real, câmera fixa em três quartos voltada à direita, pés registrados, mesma escala e anatomia, cabelo/tecido com movimento secundário, estilo anime 2.5D pictórico, paleta preto/vermelho e ausência de texto/tecnologia. Candidata de revisão: generated_images/exec-24cb0653-bb08-4b9c-a56b-4438a36903cf.png (não consumida pelo jogo).

Código: src/tactical-idle-rig.js e src/tactical-continuous-idle.js.
Validação automatizada: nove testes específicos aprovados, cobrindo recortes, 48 células distintas, continuidade da malha, ausência de inversões e apoio dos pés. A conferência de navegador acompanha a prévia deste commit.

