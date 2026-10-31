# Protocolo de piloto com cinco candidatos

## Objetivo e estado

Edição 1.1.0. Este protocolo prepara uma avaliação de uso e aprendizado; não descreve resultados já obtidos. O piloto com pessoas reais está pendente. As provas de software e as medições do laboratório são verificações técnicas separadas.

Convide cinco voluntários que conheçam APIs, SQL e testes, incluindo pessoas que se identifiquem com os escopos pleno e sênior. O responsável pelo piloto faz os convites e combina participação e compartilhamento de registros. O kit não envia mensagens nem coleta dados de participantes automaticamente.

Use identificadores P01 a P05 nos registros compartilhados. Explique finalidade, tarefas e possibilidade de desistir. Combine o que será registrado e quem pode consultar; gravação é opcional e depende de acordo. Mantenha relatos profissionais e respostas pessoais fora do repositório público.

O roteiro comum e os exemplos de calibração devem ser lidos por quem observa, não por quem fará a primeira tentativa. Registre exposição prévia a soluções, nível, modalidade, ferramentas, pausas e ajuda. Se a pessoa já conhece um caso, use a variação e identifique a troca; não apresente uma repetição decorada como transferência.

## Hipóteses e medidas

| Hipótese | Tarefa inicial | Verificação após uso e transferência |
| --- | --- | --- |
| Histórias ficam mais específicas | Relato de dois minutos sem roteiro | Repetir após a sessão e contar contribuição, decisão, evidência e aprendizado; usar outro episódio depois |
| Investigação fica mais orientada a evidência | Três primeiras ações no caso de lentidão | Observar ordem das ações, hipóteses e medida discriminante; aplicar a variação de dependência externa |
| Feedback ajuda a escolher a próxima prática | Review inicial e autoavaliação | Comparar com evidências do observador; aplicar outro cenário de repetição e registrar o que mudou |

As metas abaixo são critérios exploratórios escolhidos para esta rodada, não parâmetros de eficácia já demonstrada. Cinco participantes permitem encontrar problemas de uso; não sustentam inferência estatística sobre aprovação em entrevistas.

## Critérios definidos antes da rodada

Para história, observe quatro elementos: contribuição individual, decisão com alternativa, resultado com evidência ou limite e reflexão aplicada. Para investigação: sintoma delimitado, mais de uma hipótese, medida que distingue hipóteses e verificação da mudança. Para review: condição de reprodução, efeito no contrato, verificação proposta e comentário respeitoso com prioridade.

Marque cada elemento como explícito, ausente numa oportunidade adequada ou não observado por falta de oportunidade. Guarde o trecho que sustenta a marcação. Compare os mesmos elementos antes e depois e use a variação para buscar transferência. Não crie um total de eficácia a partir dessas marcações.

As condições precisam ser equivalentes para uma comparação útil. Se a ajuda, a modalidade ou o nível mudar, descreva a mudança junto com o resultado. Uma resposta hipotética não deve ser comparada como experiência real. O piloto procura problemas de uso e evidências de aprendizagem; sem grupo de comparação, não atribui causalidade nem taxa de aprovação ao kit.

## Sequência por participante

1. Antes do kit: registre familiaridade com a stack, faça um relato de dois minutos e peça as três primeiras ações de investigação. Separe 15 minutos para esta linha de base.
2. Instalação: observe o participante seguindo o README sem ajuda. Registre tempo até o primeiro npm test verde, ponto de parada e mensagem de erro. Depois de 15 minutos de bloqueio, ofereça ajuda e registre exatamente qual foi.
3. Estudo: entregue os cinco encontros sugeridos no guia. O participante anota pistas consultadas e tempo aproximado de cada sessão.
4. Simulado: faça review prévio de 30 minutos e simulado de 90 minutos, com debrief de 15 minutos. Quem observa registra ações e trechos, não impressões gerais.
5. Transferência: após pelo menos um dia, use outra história, a variação de lentidão e a situação alternativa de repetição. Compare raciocínio e necessidade de ajuda, sem exigir as mesmas palavras do gabarito.
6. Retorno: peça uma instrução que funcionou, um bloqueio, uma rubrica ambígua e o próximo exercício que a pessoa escolheu.

## Variação A: lentidão em dependência externa

Dados fictícios fornecidos para a conversa, não capturados do laboratório: a listagem faz duas consultas e retorna os mesmos 50 pedidos. O tempo do banco fica entre 8 e 12 ms, mas uma chamada de enriquecimento remota pode durar 900 ms. Aumentar o limite de 20 para 50 não altera a quantidade de consultas. Não há evidência inicial sobre a fila de conexões HTTP.

Pergunte pelas próximas medidas. Referência para o observador: procurar duração por etapa e correlação da chamada remota, delimitar necessidade e contrato do enriquecimento, considerar timeout e degradação permitida. Concluir "N+1" apesar da nova evidência indica memorização do caso. Não exija cache ou remoção da dependência sem confirmar a regra do produto.

## Variação B: repetição com conteúdo diferente

Situação fictícia: um cliente reutiliza a chave compra-77 para alterar a quantidade de 1 para 2 depois de um timeout. O servidor devolve silenciosamente o primeiro pedido. Pergunte qual contrato seria consistente e como testar duas repetições concorrentes.

Referência: definir chave como identificação de uma intenção, comparar produto e quantidade, retornar conflito quando a mesma chave representa outro conteúdo e manter a operação anterior. Investigar o motivo do cliente e apresentar o resultado claramente. Separar o escopo por empresa e considerar resposta persistida e falhas durante commit.

## Variação C: segunda história

Escolha um episódio diferente do ensaiado. Peça contexto, ação, resultado e aprendizado sem mostrar a ficha. Observe se a contribuição individual e os limites da evidência continuam claros. Uma narrativa mais fluente sobre o mesmo episódio, sozinha, não demonstra transferência.

## Registro e critérios de revisão

| Participante | Primeiro teste verde e ajuda | Relato inicial/final | Investigação e variação | Rubrica ambígua | Próxima ação |
| --- | --- | --- | --- | --- | --- |
| P01 | a preencher | a preencher | a preencher | a preencher | a preencher |
| P02 | a preencher | a preencher | a preencher | a preencher | a preencher |
| P03 | a preencher | a preencher | a preencher | a preencher | a preencher |
| P04 | a preencher | a preencher | a preencher | a preencher | a preencher |
| P05 | a preencher | a preencher | a preencher | a preencher | a preencher |

Meta exploratória de instalação: quatro de cinco participantes chegam ao primeiro teste verde em até 15 minutos após terem Node e Docker funcionais. Registre também bloqueios anteriores, sem atribuí-los ao conteúdo. Meta de compreensão: quatro de cinco encontram exercício e gabarito sem ajuda, distinguem teste inicial de test:candidate e explicam NO. Meta de transferência: em cada necessidade, pelo menos três participantes demonstram em outro caso um elemento definido acima que estava ausente na tentativa inicial, sob condições comparáveis. Relate participantes sem oportunidade comparável separadamente, com o denominador efetivamente observado.

Peça a dois observadores que avaliem independentemente uma mesma tentativa autorizada. Uma diferença de mais de um nível em uma competência exige rever a âncora e os exemplos. Discuta a evidência antes de buscar consenso. Não transforme a concordância de duas pessoas em validação psicométrica.

## Decisão após a rodada

Agrupe problemas em instalação, instrução, exercício e rubrica. Priorize bloqueios de conclusão e explicações que induzem uma conclusão errada. Registre mudanças, repita as tarefas afetadas e publique apenas resultados agregados autorizados. Atualize o estado do piloto no registro da edição, mantendo o que foi efetivamente observado separado das hipóteses.
