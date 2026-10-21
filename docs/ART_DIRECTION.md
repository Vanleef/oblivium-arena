# Direção de arte de PMA

## Linha visual

- Fantasia sombria sobrenatural com energia de anime de ação original.
- Pintura digital com textura de pincel, contornos nítidos e luz cinematográfica.
- Base azul-ardósia, carvão e marfim envelhecido; a identidade do Elo acrescenta o acento de reino.
- Formas legíveis em miniaturas de 25 a 64 px: um rosto ou símbolo central e poucos elementos de apoio.
- Sem letras, logotipos, interface, personagens de franquias conhecidas ou gore.
- Retratos mostram o personagem do peito para cima; passivas e técnicas mostram um único símbolo ou efeito sem texto.

## Folha de produção

Cada personagem recebe seis imagens quadradas na mesma linguagem: retrato, passiva e quatro técnicas. A quarta técnica é defensiva no sistema de combate e deve ser representada por escudo, barreira, proteção, evasão ou restauração. As técnicas devem refletir o Elo, mas não repetir a composição de outro personagem.

As primeiras três folhas servem como referência visual e já foram recortadas em WebP individuais:

| Personagem | Reino | Pasta | Cobertura |
| --- | --- | --- | --- |
| O Escudo Vivo | Paraíso | `art/characters/o-escudo-vivo/` | retrato, passiva, 4 técnicas |
| A Brasa Eterna | Inferno | `art/characters/a-brasa-eterna/` | retrato, passiva, 4 técnicas |
| O Passo Interrompido | Limbo | `art/characters/o-passo-interrompido/` | retrato, passiva, 4 técnicas |

O chefe final O Fim tem um retrato próprio em `art/characters/o-fim/portrait.webp`, seguindo a mesma paleta e acabamento. Ele é um NPC, por isso não recebe o conjunto de seis imagens de personagem jogável.

As folhas integrais ficam em `art/source/` para manter a referência original. Recortes seguem os nomes `portrait.webp`, `passive.webp`, `skill-impulso.webp`, `skill-tecnica.webp`, `skill-voto.webp` e `skill-despertar.webp`.

## Prompt-base para novas folhas

> Crie uma folha de seis ilustrações quadradas para o jogo original PMA: Post Mortem Arena. Use uma grade exata de 3 colunas por 2 linhas, com separadores pretos finos e cada quadro como ilustração independente sem texto. Mantenha fantasia sombria pintada à mão, linguagem de anime sobrenatural de ação, contornos nítidos, textura de pincel, iluminação cinematográfica e a mesma paleta azul-ardósia, carvão e marfim envelhecido. Use o primeiro quadro como retrato do personagem [descrição]; segundo quadro como a passiva [símbolo/efeito]; depois mostre nesta ordem suas quatro técnicas [descrições]. A sexta técnica deve ter leitura defensiva. Cada quadro deve funcionar sozinho quando recortado em quadrado e continuar legível como ícone pequeno. Sem letras, marcas, personagens conhecidos ou gore.

Antes de adicionar uma nova folha ao jogo, confira a continuidade de paleta e silhueta com os três arquivos de referência já presentes em `art/source/`.
