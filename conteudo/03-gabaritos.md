# Gabaritos e condução

## Como consultar este volume

Edição 1.0.0. Consulte após registrar uma tentativa. Este volume contém as soluções dos exercícios e o roteiro para quem acompanha o treino. Uma referência correta pode ser diferente da sua solução; compare invariantes, evidências e consequências. Os exemplos são fictícios.

A aplicação é deliberadamente pequena. As garantias aqui discutidas se referem ao contrato do caderno e ao banco local. A evolução de arquitetura considera outros limites, sem atribuir ao laboratório funcionalidades que ele não implementa.

## Histórico: o que aprofundar

Peça uma entrega e uma falha. Ouça o relato inicial sem interromper a cada detalhe. Depois use os mesmos aprofundamentos para respostas comparáveis: qual era seu papel? Que decisão você tomou? Que alternativa existia? O que sustenta o resultado? O que faria diferente?

Uma resposta superficial costuma descrever a tecnologia e o resultado da equipe sem conectar contribuição e decisão. Uma resposta consistente delimita responsabilidade, explica uma escolha e aponta evidência. Uma resposta mais ampla também trata consequências, limites da medição e aprendizado transferido para outro contexto.

Exemplo fictício insuficiente: "Eu era responsável por toda a arquitetura, usamos filas e deu certo". Exemplo fictício mais informativo: "Eu propus separar o envio de notificações da confirmação do pedido. O requisito permitia atraso de até cinco minutos. Mantivemos o pedido e a tarefa de envio no mesmo commit, e acompanhei a idade da tarefa mais antiga. A fila não eliminou duplicações; precisamos de uma chave no consumidor e de um plano de reconciliação".

Para pleno, procure autonomia em uma tarefa delimitada e verificação da solução. Para sênior, aprofunde limites entre componentes, operação e influência sobre decisões. Não exija uma empresa famosa, uma equipe grande ou um cargo formal de liderança.

## Investigação: do sintoma à evidência

Comece definindo impacto, período, distribuição da latência e mudanças recentes. Uma hipótese de banco, outra de dependência externa e outra de aplicação ou fila de conexões são pontos de partida plausíveis. Diga que medida distingue essas hipóteses. Não conceda a causa antes de a pessoa pedir evidência.

No laboratório, a quantidade de consultas cresce com a página: uma para pedidos e uma para os itens de cada pedido. Com 50 pedidos, são 51 consultas. A versão lenta usa Promise.all; o pool limita a oito conexões e o número de consultas continua crescendo. Paralelizar não remove o trabalho nem o custo de adquirir conexões.

A referência busca os pedidos autorizados e, quando há resultados, lê os itens de todos os ids em lote. Agrupa por pedido e mantém a ordem da consulta original. São duas consultas em uma página não vazia e uma em uma página vazia. Não é obrigatório usar exatamente esse desenho: uma consulta com agregação também pode ser defensável se preservar o contrato e for verificada.

Uma conclusão consistente inclui: contagem antes/depois, equivalência das respostas completas, empresa, ordem, múltiplos itens e vazio. O teste de integração cobre esses comportamentos. O benchmark usa uma página de 50 pedidos, compara todas as respostas e registra p50 e p95 com metodologia explícita. O capítulo de medições contém valores realmente capturados.

### Extensão para sênior: índice

A consulta filtra por tenant_id e status e ordena por created_at e id, ambos decrescentes. Um índice em (tenant_id, status, created_at DESC, id DESC) pode atender filtro, ordenação e LIMIT. A evidência relevante está no plano antes/depois, no trabalho de leitura, nos buffers e no volume de linhas examinado. As unidades de custo estimado do plano não são milissegundos.

Discuta custo de manutenção em escrita, armazenamento e distribuição dos dados. Um ambiente pequeno pode escolher um plano diferente. O script mede esta extensão separadamente da correção de N+1, para não atribuir dois efeitos à mesma mudança. Consulte evidencias/planos.json e a documentação oficial de EXPLAIN.

### Respostas para comparar

Exemplo fictício precipitado: "Vou aumentar o pool e adicionar cache". Falta evidência de onde o tempo é consumido e de como validar consistência ou capacidade.

Exemplo fictício consistente: "Primeiro compararei o número de consultas com o tamanho da página. Se crescer por pedido, vou verificar a leitura de itens e testar uma busca em lote. Vou comparar conteúdo, ordem e isolamento e, depois, medir sob condições iguais. Se a duração continuar alta, seguirei o plano SQL e a fila de conexões".

Uma resposta forte reconhece que o benchmark local não representa tráfego de produção e define uma verificação posterior com carga, percentis e taxa de erro adequados ao cenário.

## Arquitetura: duas alternativas defensáveis

As condições do exercício são 500 empresas, 50.000 pedidos por dia e pico de 100 criações por segundo, três engenheiros e oito semanas. O pico não é o volume médio. Pergunte sobre duração do pico, distribuição entre empresas e produtos quentes. As metas fictícias de 99,9% e p95 de 300 ms precisam ser medidas; não decorrem do uso de uma tecnologia.

Invariantes: produto da empresa correta, preço autoritativo, estoque não negativo e uma operação por chave semântica. A confirmação torna pedido e reserva duráveis. A notificação pode atrasar e não deve desfazer um pedido confirmado apenas porque seu provedor falhou.

### Alternativa A: núcleo transacional com tarefa durável no banco

Uma API e PostgreSQL concentram o estado autoritativo. Na mesma transação ficam reserva, pedido, itens, registro de repetição e uma tarefa de notificação em uma tabela de saída. Um worker da mesma aplicação lê tarefas pendentes, envia e registra o resultado. O componente é operacionalmente pequeno e mantém a fronteira de commit explícita.

Fluxo: validar identidade e entrada; resolver a chave; consultar catálogo no escopo da empresa; reservar com condição atômica; gravar pedido, itens e tarefa; confirmar; responder. O worker processa depois. O laboratório implementa o núcleo de pedido e estoque; a tabela de saída e o worker são parte da proposta arquitetural.

Se a API cair após o commit e antes da resposta, a repetição retorna o pedido persistido. Se o provedor ficar indisponível, a tarefa permanece pendente e as tentativas têm limite, espaçamento e visibilidade. Se o envio funcionar mas o worker cair antes de registrar sucesso, pode haver repetição: uma chave estável no provedor ou consumidor ajuda, mas uma integração sem deduplicação não permite prometer ausência absoluta de mensagens duplicadas.

Custos: retenção e limpeza de tarefas, contenção no banco, agendamento do worker, gestão de tarefas que falham repetidamente e monitoração. Use lotes limitados e uma política explícita para tarefas em processamento que ficam abandonadas. A entrega inicial pode escolher esse caminho para reduzir componentes operados pela equipe.

### Alternativa B: núcleo transacional, outbox e broker

O mesmo commit grava o pedido e um evento na outbox. Um publicador transfere eventos a um broker; consumidores independentes enviam notificações e tratam repetições. A confirmação do broker e a marcação de publicação também podem falhar entre si, portanto o publicador pode repetir eventos e os consumidores precisam lidar com duplicação.

Essa solução permite escalar consumidores e integrar outras funções sem acoplar cada uma à API. Em troca, introduz operação do broker, filas de erro, evolução de eventos, ordenação, retenção, observabilidade distribuída e reconciliação. O custo de componentes gerenciados deve entrar na decisão.

Estoque continua autoritativo no núcleo transacional. Fazer toda a criação assíncrona seria outra decisão e alteraria o contrato: uma resposta de recebimento não equivaleria a pedido confirmado. Se sugerir esse modelo, declare estados, rejeição posterior, prazo e experiência do cliente.

### Escolha de referência e evolução

Para a equipe e o prazo do enunciado, a alternativa A é uma escolha inicial defensável. Preserve os limites de domínio e uma estrutura de evento para facilitar evolução. A alternativa B ganha força quando a fila no banco vira uma carga demonstrada ou múltiplos consumidores precisam de isolamento e escala independentes. A justificativa deve usar evidência, capacidade operacional e custo.

Observe taxa de criação, conflitos de estoque, latência por etapa, taxa de erro, idade da tarefa mais antiga, número de tentativas e reconciliações. Defina responsáveis por responder a alertas. Um produto muito concorrido exige analisar contenção no estoque, não apenas número de instâncias da API.

Entregue em etapas: primeiro contrato e núcleo transacional; depois processamento durável, repetição e falhas; por fim carga, alertas e recuperação. Um rollback de aplicação precisa manter compatibilidade com dados e migrações já gravados. Não apague pedidos válidos para reverter uma versão.

### O que observar na discussão

Uma resposta insuficiente lista tecnologias sem delimitar confirmação ou perda de trabalho. Uma resposta consistente define invariantes, compara opções e explica recuperação. Uma resposta forte também identifica produtos quentes, custo operacional e critérios de evolução. Monólito, worker e broker não recebem pontos por si; o que conta é a relação entre escolha e requisito.

## Code review: cinco defeitos comprovados

Os testes iniciais verificam caminho normal, validação básica, existência, estoque sequencial e identidade. Não cobrem isolamento do produto na criação, preço adulterado, duas compras sincronizadas, falha intermediária ou repetição. Eles passam na proposta porque esses cenários não foram exercitados.

O comando npm run verify:bugs executa cada cenário isoladamente em PostgreSQL real. Confere que a proposta produziu exatamente o resultado defeituoso previsto, que a comparação com o contrato falhou e que a referência passou. Um erro de conexão ou preparação interrompe a execução. O relatório está em evidencias/provas-bugs.json.

### B01. Produto de outra empresa

**Condição:** Aurora tenta criar pedido para prod-brisa. **Reprodução:** npm run verify:bugs -- B01. **Proposta:** retorna 201, cria um pedido e reduz o estoque de Brisa de 10 para 9. **Contrato:** 404, nenhum novo pedido e estoque de Brisa em 10.

**Causa e correção:** a busca usa somente o id do produto. A referência exige também tenant_id obtido da identidade local. O id global não autoriza acesso. No recorte, a titularidade do produto é imutável pela API.

**Comentário fictício:** "Bloqueante: a identidade Aurora consegue criar um pedido de prod-brisa, pois a consulta não inclui a empresa. Isso debita estoque de outra conta. Podemos filtrar pela empresa da identidade e testar a tentativa cruzada com resposta 404 e estoque preservado?"

**Aprofundamento sênior:** examine cache, caminhos alternativos de leitura e integridade de vínculos entre empresa, produto e pedido. Políticas de acesso no banco podem oferecer outra camada, sem substituir a revisão do contrato.

### B02. Preço enviado pelo cliente

**Condição:** cliente envia priceCents=1 para duas unidades de prod-aurora. **Reprodução:** npm run verify:bugs -- B02. **Proposta:** preço unitário 1 e total 2. **Contrato:** preço unitário 1500 e total 3000, conforme catálogo.

**Causa e correção:** o campo legado substitui o preço autoritativo. A referência o ignora e calcula o total com o catálogo em centavos inteiros. A API limita quantidade e os valores do catálogo para manter o cálculo dentro do intervalo usado.

**Comentário fictício:** "Bloqueante: um corpo com priceCents=1 reduz o total de duas unidades a dois centavos. O contrato usa preço do catálogo. Podemos calcular no servidor e acrescentar um caso com preço adulterado?"

**Aprofundamento sênior:** discuta se o negócio exige cotação com validade, descontos autorizados ou confirmação de mudança de preço. Essas regras precisariam de contrato próprio; não são implementadas no laboratório.

### B03. Corrida pelo estoque

**Condição:** estoque em 1 e duas compras de uma unidade com chaves diferentes. **Reprodução:** npm run verify:bugs -- B03. Uma barreira permite que ambas atinjam o ponto entre leitura e escrita; não usamos sleep para tentar provocar a corrida.

**Proposta:** duas compras aceitas, dois pedidos e estoque -1. **Contrato:** uma compra aceita, uma recusada e estoque 0.

**Causa e correção:** ler disponibilidade e depois atualizar sem condição não protege o intervalo. A referência usa UPDATE com available >= quantidade e verifica uma linha atualizada, dentro da transação. No PostgreSQL em READ COMMITTED, a atualização concorrente reavalia a condição sobre a versão atual da linha. Outra solução pode usar lock e leitura apropriados na mesma transação.

**Comentário fictício:** "Bloqueante: duas compras podem ler a última unidade antes do débito e ambas concluir. A reprodução sincronizada deixa estoque -1. Podemos reservar com uma atualização condicional e verificar que só uma transação obtém a unidade?"

**Aprofundamento sênior:** um CHECK de estoque não negativo é uma defesa útil no banco. O schema didático o omite para tornar o estado incorreto visível; a referência protege a reserva. Em um modelo com vários produtos, discuta ordem de locks e rollback de reservas parciais.

### B04. Persistência parcial

**Condição:** uma falha SQL ocorre depois de debitar o estoque e antes de inserir o pedido. **Reprodução:** npm run verify:bugs -- B04. O hook interno executa SELECT 1/0 e confere SQLSTATE 22012, para saber que a falha controlada foi realmente alcançada.

**Proposta:** resposta 500, nenhum pedido novo e estoque 9. **Contrato:** resposta 500, nenhum pedido novo e estoque 10.

**Causa e correção:** cada pool.query da proposta pode confirmar sua própria operação. A referência obtém um client e mantém reserva, pedido, item e chave no mesmo BEGIN/COMMIT, com ROLLBACK no erro e liberação da conexão no finally. BEGIN em uma conexão e UPDATE em outra não formariam a mesma transação.

**Comentário fictício:** "Bloqueante: se a gravação do pedido falhar após o débito, o cliente recebe erro mas perde estoque. Podemos colocar as escritas na mesma transação e verificar que uma falha SQL intermediária deixa estoque e pedidos inalterados?"

**Aprofundamento sênior:** considere falha durante commit, término do processo e resultado desconhecido para o cliente. Rollback não desfaz um efeito já enviado a um provedor externo.

### B05. Repetição cria outro pedido

**Condição:** mesma empresa, corpo e idempotency-key são enviados duas vezes. **Reprodução:** npm run verify:bugs -- B05. **Proposta:** dois ids, dois pedidos e estoque 8. **Contrato:** mesmo id, um pedido e estoque 9.

**Causa e correção:** a proposta recebe a chave e não a utiliza. A referência serializa por empresa/chave com advisory lock transacional, compara o fingerprint de produto e quantidade e persiste a resposta no mesmo commit. A chave primária também é composta por empresa e chave. O preço legado não entra no fingerprint porque não altera o conteúdo autoritativo do pedido.

**Comentário fictício:** "Bloqueante: repetir a mesma chave após um timeout cria outro pedido e debita estoque novamente. Podemos persistir a resposta por empresa/chave junto com o pedido, detectar conteúdo diferente e testar repetições sequenciais e concorrentes?"

**Aprofundamento sênior:** colisões do hash de lock podem serializar chaves diferentes sem misturar suas respostas, pois a tabela usa a chave completa. A retenção é ilimitada neste recorte. Um produto real precisa definir retenção e comportamento de repetições após expiração. O registro não garante efeito único em sistemas externos por si só.

## Como conduzir o simulado

Prepare ambiente e fichas antes; confirme que os 30 minutos de review prévio ocorreram. Explique que as perguntas são sobre o raciocínio, que pedir informação é esperado e que as notas servem para orientar treino. Combine consulta e ferramentas.

Use os tempos do caderno: 15, 20, 20, 20 e 15 minutos. Anote ações e trechos específicos. Em investigação e arquitetura, pergunte "Que evidência faria você mudar de hipótese?" e "O que acontece se esta etapa falhar?". No review, peça que a pessoa escolha o comentário de maior impacto e o explique.

Não revele um bug porque a pessoa ficou em silêncio por alguns segundos. Ofereça a pista combinada e registre seu uso. Se faltar tempo, marque a competência como não observada quando não houver evidência suficiente. Não transforme velocidade, eloquência ou quantidade de tecnologias citadas em substituto do critério.

Após os 90 minutos, use mais 15 minutos para o debrief. Comece pedindo a autoavaliação. Compartilhe uma evidência forte e uma oportunidade por eixo. Identifiquem até duas ações práticas. Se houver divergência de avaliação, comparem evidências e a âncora usada antes de discutir números.

## Rubricas: eixo técnico

As âncoras abaixo precisam ser acompanhadas de uma evidência. O escopo esperado para pleno é um problema delimitado resolvido com autonomia; para sênior inclui consequências entre componentes e operação. Um pleno pode demonstrar nível 4 dentro de seu escopo. NO significa ausência de observação suficiente.

### Investigação

1: escolhe uma solução sem relacioná-la ao sintoma. 2: levanta uma hipótese plausível, mas não define como distingui-la. 3: prioriza hipóteses e usa evidência para decidir. 4: também controla variáveis, reconhece limites e planeja verificação em outro contexto. Evidência típica: nota do endpoint.

### Correção e segurança dos dados

1: deixa uma invariante central sem tratamento. 2: identifica parte da regra, mas não cobre uma fronteira relevante. 3: preserva empresa, preço e resultado e propõe verificação. 4: também analisa caminhos alternativos e defesa em profundidade. Evidência típica: review B01/B02 e contrato da criação.

### Arquitetura e consequências

1: lista componentes sem relacioná-los aos requisitos. 2: propõe fluxo plausível com lacunas em estado ou falha. 3: compara alternativas, define confirmação e justifica a escolha. 4: também estima consequências operacionais e explicita critérios de evolução. Evidência típica: decisão de uma página.

### Confiabilidade e concorrência

1: presume que a sequência normal garante consistência. 2: percebe uma corrida ou falha, mas deixa recuperação indefinida. 3: delimita atomicidade, repetição e reserva e explica falhas. 4: também trata resultado incerto, contenção e limites entre sistemas. Evidência típica: B03 a B05 e cenários de arquitetura.

### Verificação e qualidade do review

1: opina sem condição verificável. 2: sugere testes genéricos ou cobre só o caminho normal. 3: demonstra condição, efeito e teste relevante. 4: também distingue regressão específica, erro de ambiente e limites da prova. Evidência típica: reprodução e comentários priorizados.

## Rubricas: eixo de colaboração

### Clareza do raciocínio

1: a explicação não permite entender a decisão mesmo após aprofundamento. 2: explica a opção com lacunas de contexto. 3: conecta contexto, decisão e consequência. 4: também ajusta a explicação à dúvida do interlocutor e resume incertezas. Observe compreensão, não sotaque ou carisma.

### Esclarecimento de ambiguidades

1: assume um requisito decisivo sem explicitá-lo. 2: faz perguntas sem mostrar como afetam a decisão. 3: identifica a incerteza e busca a informação necessária. 4: também escolhe um caminho reversível e explicita como validar a premissa quando a informação falta.

### Colaboração no review

1: ataca a pessoa ou usa autoridade em lugar de justificativa. 2: aponta problema sem impacto ou próximo passo claros. 3: comenta o código com respeito, condição e prioridade. 4: também ouve a explicação, ajusta o comentário e ajuda a resolver o impasse. Discordância fundamentada é compatível com nível alto.

### Responsabilidade e aprendizado

1: não reconhece sua contribuição ou responsabilidade após aprofundamento. 2: reconhece a situação, mas não demonstra mudança. 3: descreve ação, consequência e aprendizado aplicado. 4: também verifica a mudança e melhora um mecanismo compartilhado. Não exija exposição de assuntos confidenciais.

### Feedback e discordância

1: descreve imposição ou evasão sem tratar o problema. 2: conversa, mas o acordo ou efeito fica indefinido. 3: usa fatos, considera outra perspectiva e acompanha a decisão. 4: também explicita limites de risco, responsáveis e condições para rever o acordo.

## Síntese sem corte de aprovação

Avalie cada competência uma vez, usando as evidências dos vários blocos. Não some a mesma competência novamente por pergunta respondida. Só calcule a média do eixo quando suas cinco competências tiverem evidência. Se ambos estiverem completos, resumo = 0,5 x média técnica + 0,5 x média de colaboração. Arredonde apenas na apresentação, a uma casa decimal.

Exemplo: técnico 3, 3, 2, 3, 4 produz média 3,0; colaboração 3, 3, 3, 2, 4 também 3,0. O resumo é 3,0 e o plano pode priorizar arquitetura e responsabilidade. Se arquitetura for NO, registre o eixo técnico como incompleto e planeje nova observação. Não substitua NO por zero nem invente evidência.

A convenção 50/50 não é um instrumento validado de seleção. Mantenha os dois eixos, as evidências e o plano de prática visíveis. O estado da validação técnica e do piloto é informado na release.
