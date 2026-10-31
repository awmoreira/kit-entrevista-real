# Exemplos para calibrar as rubricas

## Como usar

Edição 1.1.0. Todos os trechos são fictícios e foram escritos para comparar âncoras. Não são observações de candidatos reais. Duas pessoas podem avaliá-los independentemente, citar a evidência e discutir diferenças. As notas abaixo são referências didáticas com justificativa, não resultados de validação psicométrica.

Considere o escopo acordado. Para pleno, o problema delimitado deve ser resolvido e verificado com autonomia. Para sênior, acrescente consequências entre componentes e operação. Os números indicam qualidade dentro do escopo. Avalie apenas a competência ilustrada; as demais continuam NO quando não houver evidência.

## Investigação

**Trecho A:** "Acho que é banco. Vou aumentar o pool; se melhorar era isso." Referência: 1. Escolhe intervenção sem distinguir hipóteses e usa uma melhora como confirmação suficiente de causa.

**Trecho B:** "Vou comparar trabalho e duração por tamanho de página. Se as consultas crescerem por pedido, examinarei o acesso a itens. Compararei as respostas completas antes de concluir." Referência: 3 para o escopo pleno. Define uma medida discriminante e verificação. Para 4 nesse mesmo escopo, espere também controle de variáveis e limites da conclusão. Para sênior, peça impacto sob concorrência e plano de verificação operacional antes de fechar a nota.

## Correção e segurança dos dados

**Trecho A:** "O usuário já está logado, então qualquer id de produto é válido." Referência: 1. Confunde identidade com autorização e deixa a invariante de empresa sem tratamento.

**Trecho B:** "A consulta precisa da empresa da identidade. Vou tentar comprar um produto de Brisa como Aurora e verificar resposta, estoque e pedidos." Referência: 3 no escopo delimitado. Relaciona regra e verificação de efeitos. Mencionar uma tecnologia de segurança sem conectar caminhos de acesso não basta para 4.

## Arquitetura e consequências

**Trecho A:** "Usaremos uma fila para confirmar os pedidos. O cliente recebe sucesso na hora; depois vemos se tem estoque." Referência: 2 se a proposta foi compreendida. Há um fluxo possível, mas a confirmação contraria o contrato e os estados não estão definidos. Se a pessoa esclarecer que o retorno significa apenas recebimento e negociar a mudança do contrato, reavalie a evidência.

**Trecho B:** "Pedido e reserva ficam no mesmo commit. Notificação fica pendente de forma durável. Começo com worker no banco pela equipe pequena e evoluo se a idade da tarefa e a contenção justificarem. A marcação após envio pode falhar, então trato repetição." Referência: 4 no exercício, pois liga escolha, prazo, recuperação e critério de evolução. Não concede nível sênior por si só.

## Confiabilidade e concorrência

**Trecho A:** "Eu verifico o estoque e depois atualizo. Node executa uma coisa por vez, então não há corrida." Referência: 1. Confunde execução JavaScript com interleaving de I/O e múltiplas conexões.

**Trecho B:** "Leio a linha com FOR UPDATE na mesma transação, verifico disponibilidade e gravo o pedido antes do commit. A segunda transação verá a quantidade atual. Também comparo atualização condicional e duração do lock." Referência: 3, ou 4 quando a evidência inclui consequência e verificação no escopo acordado. Lock de linha é uma alternativa válida; o avaliador não pode exigir que ambas as leituras avancem simultaneamente.

## Verificação e qualidade do review

**Trecho A:** "Isso pode dar problema; coloquem mais testes." Referência: 2. Percebe risco, mas não fornece condição, efeito ou assert que o autor consiga verificar.

**Trecho B:** "Vou reservar a última unidade com duas transações que realmente disputem a linha. Espero um sucesso, uma recusa e estoque zero. Se o teste falhar por conexão, isso não prova o bug." Referência: 4 nesse recorte, pois demonstra invariante e distingue falha de produto e de ambiente. Não precisa reproduzir o código do gabarito.

## Clareza do raciocínio

**Trecho A:** "É óbvio, só usar atomicidade e consistência." Após um pedido de explicação, a pessoa não delimita o que precisa mudar junto. Referência: 1 para clareza dessa explicação; nenhuma conclusão sobre estilo pessoal.

**Trecho B:** "Se eu debitar o estoque e a gravação do pedido falhar, o cliente recebe erro mas a unidade desaparece. Quero que ambos confirmem ou nenhum confirme." Referência: 3. Torna a decisão compreensível. Vocabulário simples pode demonstrar o mesmo raciocínio que termos formais.

## Esclarecimento de ambiguidades

**Trecho A:** "Vou garantir que a notificação nunca se repete." Não perguntou se o provedor aceita chave e não explicitou a premissa. Referência: 1: prometeu uma garantia decisiva sem contexto.

**Trecho B:** "O cliente precisa receber a notificação antes da confirmação? O provedor deduplica? Se não soubermos, registrarei a incerteza e definirei recuperação e um teste da integração." Referência: 4. Identifica perguntas que mudam o fluxo e decide como tratar informação indisponível.

## Colaboração no review

**Trecho A:** "Só alguém sem experiência escreveria isso." Mesmo que tenha identificado um bug real, referência: 1 para colaboração. O achado técnico recebe sua própria avaliação, sem ser apagado pelo tom.

**Trecho B:** "Bloqueante porque repetir a requisição pode debitar outra unidade. Podemos testar a mesma chave duas vezes? Se houver um mecanismo fora deste trecho, você consegue me mostrar?" Referência: 4 para colaboração. Explica impacto, pede ação e abre espaço para contexto. Se o diagnóstico estiver errado, a nota técnica pode ser baixa apesar desse bom tratamento.

## Responsabilidade e aprendizado

**Trecho A:** "A equipe errou. Eu avisei e não tinha mais o que fazer." Não descreve sua ação ou aprendizado após aprofundamento. Referência: 2 se reconhece o contexto mas não demonstra mudança; não assuma culpa que a evidência não estabelece.

**Trecho B:** "Eu deixei a premissa sem registro. Ajudei a reparar os dados, acrescentei a verificação e conferi no mês seguinte se o mesmo caminho estava protegido." Referência: 4 no episódio relatado, por ação própria, reparação e acompanhamento. Verifique a especificidade do caso em vez de tomar um discurso ensaiado como comprovação automática.

## Feedback e discordância

**Trecho A:** "Para não criar conflito, concordei e parei de falar do risco." Referência: 2: há adaptação, mas falta tratar o problema e acompanhar a decisão.

**Trecho B:** "Expliquei a condição de duplicação, ouvi a restrição de prazo e propus reduzir o escopo. Registramos quem decidia e que sinal exigiria parar a entrega. Depois acompanhei a correção." Referência: 4. Considera perspectivas, responsabilidade e condição para revisão. Escalar um risco relevante pode ser parte de colaborar.

## Três casos que não devem receber uma média

Caso 1: a conexão do banco falhou e consumiu o bloco de investigação. Se não houve alternativa documental ou pergunta equivalente, investigação é NO; ofereça nova oportunidade.

Caso 2: a pessoa respondeu "Não sei como proteger a reserva" e não apresentou abordagem após uma pergunta clara. Há evidência de lacuna técnica; NO esconderia essa observação. A honestidade não reduz colaboração.

Caso 3: você viu apenas um bom comentário de review. Pode avaliar os aspectos demonstrados, mas não inventar evidência das outras oito competências para completar o cálculo. Um risco central pode ser registrado mesmo sem média.

## Exercício de calibração entre observadores

Escolha três pares acima. Cada observador registra nota, trecho, oportunidade, ajuda e âncora antes de conversar. Discutam diferenças de mais de um nível e ambiguidades do próprio critério. Depois usem um caso novo do banco. O resultado esperado é um acordo sobre o uso da rubrica e uma lista de pontos a observar no piloto, não uma certificação de precisão das notas.
