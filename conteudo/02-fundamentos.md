# Banco de fundamentos

Cada pergunta tem intenção, aprofundamento, sinais observáveis e expectativas para os dois níveis. As expectativas são guias de prática, não respostas obrigatórias. Distribuição: quatro perguntas em cada uma das seis áreas, totalizando 24.

Este banco é material de estudo e já apresenta sinais esperados. Para uma primeira tentativa sem ajuda, responda à pergunta antes de ler intenção e sinais. O entrevistador usa as perguntas centrais do roteiro; o simulado não percorre todo este banco.

## HTTP e segurança

### T01. O cliente recebeu timeout ao criar um pedido. Ele pode repetir?

**Intenção:** distinguir resultado desconhecido de operação não executada. **Aprofundamento:** e se o commit ocorreu antes da queda da conexão? **Sinais:** contrato de repetição, mesma chave e confirmação de estado. **Pleno:** explica como evitar um segundo débito e testa o retry. **Sênior:** discute janela de retenção da chave, concorrência, conteúdo diferente e limites de garantias entre sistemas.

### T02. Um produto existe, mas pertence a outra empresa. Como responder?

**Intenção:** observar autorização contextual. **Aprofundamento:** em quais consultas o escopo precisa aparecer? **Sinais:** identidade confiável, filtro por empresa, resposta sem expor dados alheios. **Pleno:** aplica o escopo ao acesso ao produto e verifica outro tenant. **Sênior:** revisa fronteiras, cache, caminhos alternativos e defesa em profundidade, sem supor que autenticação resolve autorização.

### T03. O cliente envia preço e total. O que o servidor deve aceitar?

**Intenção:** identificar a origem autoritativa dos valores. **Aprofundamento:** como tratar um preço exibido que mudou? **Sinais:** cálculo por catálogo, política de preço, centavos inteiros e validação. **Pleno:** ignora valores não autoritativos e testa adulteração. **Sênior:** explicita cotação, expiração, versão de preço e experiência de conflito quando o negócio exige preservar uma oferta.

### T04. Como escolher entre 400, 401, 404, 409 e 500?

**Intenção:** construir um contrato útil sem expor detalhes internos. **Aprofundamento:** qual erro o cliente pode repetir e em que condições? **Sinais:** separação entre entrada, identidade, existência, conflito e falha interna. **Pleno:** mantém códigos e mensagens consistentes e testa o contrato. **Sênior:** considera observabilidade, compatibilidade, exposição de informação e política de repetição, sem usar o status isoladamente como diagnóstico.

## SQL e acesso a dados

### T05. Um endpoint faz uma consulta rápida por item. Onde pode estar o custo?

**Intenção:** reconhecer trabalho acumulado. **Aprofundamento:** o que muda com 1, 20 e 50 pedidos? **Sinais:** número de viagens, pool, latência e leitura em lote. **Pleno:** identifica o padrão e preserva os resultados ao corrigi-lo. **Sênior:** relaciona o custo à concorrência, dimensiona o lote e verifica regressões sem apenas aumentar conexões.

### T06. Como decidir se um índice composto ajuda esta listagem?

**Intenção:** relacionar consulta e plano. **Aprofundamento:** qual a ordem de colunas diante de filtro e ordenação? **Sinais:** seletividade, igualdade, ordenação, LIMIT, planos antes/depois e custo de escrita. **Pleno:** propõe um índice compatível e verifica seu uso. **Sênior:** considera distribuição dos dados, tamanho, manutenção, buffers e mudanças de plano, distinguindo custo estimado de milissegundos.

### T07. Como paginar quando vários pedidos têm a mesma data?

**Intenção:** perceber ordenação determinística. **Aprofundamento:** o que acontece se um pedido for criado entre duas páginas? **Sinais:** desempate por id, cursor composto e contrato de consistência. **Pleno:** evita ordenar apenas pela data e define limites. **Sênior:** discute inserções concorrentes, visibilidade e custos de offset versus cursor. O laboratório só entrega a primeira página; esta pergunta trata de uma evolução.

### T08. Como retornar pedidos sem misturar itens entre empresas?

**Intenção:** verificar junções, escopo e cardinalidade. **Aprofundamento:** o que ocorre com pedido sem itens ou página vazia? **Sinais:** conjunto autorizado de pedidos, agrupamento correto e ordem preservada. **Pleno:** escreve uma consulta ou lote correto e testa vazio e múltiplos itens. **Sênior:** considera integridade referencial, escopo de chaves e como uma mudança de modelo pode invalidar pressupostos de segurança.

## Assincronismo em Node.js

### T09. Promise.all resolve um problema de N+1?

**Intenção:** separar paralelismo de redução de trabalho. **Aprofundamento:** e quando há 500 requisições disputando um pool de oito conexões? **Sinais:** consultas continuam existindo, fila e sobrecarga. **Pleno:** explica o limite do pool e compara lote com paralelismo. **Sênior:** discute controle de concorrência, pressão sobre dependências e comportamento da cauda de latência.

### T10. Uma operação CPU-intensiva pode deixar a API lenta?

**Intenção:** compreender o event loop. **Aprofundamento:** que medidas distinguem CPU de espera por I/O? **Sinais:** atraso do loop, uso de CPU, perfil e filas. **Pleno:** localiza o trabalho síncrono e propõe mitigação. **Sênior:** considera limites de carga, isolamento do trabalho, workers e custo operacional antes de introduzir novos componentes.

### T11. O handler dispara uma promessa e retorna sem aguardar. Qual o risco?

**Intenção:** observar ciclo de vida e falhas. **Aprofundamento:** e se o processo terminar antes da promessa? **Sinais:** trabalho perdido, rejeição, confirmação prematura e recuperação. **Pleno:** aguarda trabalho necessário ou torna a tarefa durável. **Sênior:** delimita garantia de entrega, idempotência e reconciliação entre commit e processamento posterior.

### T12. Como lidar com timeout e cancelamento de dependências?

**Intenção:** administrar recursos e resultado incerto. **Aprofundamento:** o timeout cancelou a operação remota ou só nossa espera? **Sinais:** orçamento de tempo, cancelamento suportado, limites e classificação de retry. **Pleno:** configura timeout e trata erros sem repetir indefinidamente. **Sênior:** acompanha propagação do prazo, amplificação de tentativas e recuperação de operações cujo resultado ficou desconhecido.

## Transações e concorrência

### T13. O que deve ser atômico ao criar o pedido?

**Intenção:** definir uma invariante de negócio. **Aprofundamento:** o que sobra se a gravação do item falhar após reservar estoque? **Sinais:** estoque, pedido, itens e registro de repetição no mesmo limite transacional. **Pleno:** usa BEGIN, COMMIT e ROLLBACK no mesmo client. **Sênior:** considera duração da transação, contenção, isolamento e recuperação de falhas durante o commit.

### T14. Duas compras leem a última unidade. Como proteger a reserva?

**Intenção:** raciocinar sobre interleaving. **Aprofundamento:** você consegue desenhar a sequência e criar um teste controlado? **Sinais:** leitura seguida de escrita é vulnerável; atualização condicional ou lock apropriado. **Pleno:** demonstra uma compra aceita e outra recusada. **Sênior:** discute contenção, múltiplos produtos, ordem de locks e invariantes reforçadas no banco.

### T15. Uma chave idempotente basta para garantir efeito único?

**Intenção:** avaliar o protocolo completo. **Aprofundamento:** mesma chave com conteúdo diferente ou empresa diferente? **Sinais:** escopo, fingerprint, resposta persistida e exclusão concorrente. **Pleno:** retorna o mesmo pedido e detecta conflito de conteúdo. **Sênior:** considera retenção, falhas intermediárias, colisões de lock, efeitos externos e limites de "exatamente uma vez".

### T16. Como decidir o que fazer após deadlock ou falha de serialização?

**Intenção:** tratar falhas transitórias sem duplicar negócio. **Aprofundamento:** em que limite repetir e quando desistir? **Sinais:** transação abortada, rollback, retry limitado e observabilidade. **Pleno:** diferencia erro transitório de entrada inválida. **Sênior:** analisa ordem de locks, orçamento de tentativas, jitter e impacto de repetir uma transação que inclui efeitos fora do banco.

## Testes e verificação

### T17. Todos os testes passaram. O que isso permite concluir?

**Intenção:** interpretar o alcance da evidência. **Aprofundamento:** que contratos não aparecem nos casos existentes? **Sinais:** cobertura de cenários e incertezas, sem confundir quantidade de testes com completude. **Pleno:** propõe casos de falha e fronteira. **Sênior:** prioriza invariantes e combina testes com observação operacional e revisão de contrato.

### T18. Como testar concorrência sem depender de um sleep?

**Intenção:** tornar a falha reproduzível sem impor uma implementação. **Aprofundamento:** onde coordenar as operações e quais resultados observar? **Sinais:** conexões reais, espera de lock observável, estado final e prazo de segurança. **Pleno:** controla a disputa e verifica a invariante. **Sênior:** demonstra que o agendamento aceita exclusão por lock e distingue teste de interleaving de teste de carga; uma barreira dentro da região protegida pode rejeitar a solução correta.

### T19. Quando um mock de banco deixa de ser evidência suficiente?

**Intenção:** reconhecer semântica do sistema real. **Aprofundamento:** ele reproduz locks, isolamento, constraints e rollback? **Sinais:** integração com PostgreSQL e teste de regras puras em unidade. **Pleno:** usa banco real para transações e concorrência. **Sênior:** equilibra velocidade, isolamento, custo de manutenção e falhas que só aparecem entre componentes.

### T20. Como comprovar que uma otimização preservou comportamento?

**Intenção:** unir correção e desempenho. **Aprofundamento:** incluiu ordenação, empresas, múltiplos itens e resultado vazio? **Sinais:** comparação de respostas completas e medida do trabalho eliminado. **Pleno:** verifica resultados antes/depois e conta consultas. **Sênior:** considera cardinalidade, memória, tamanho do lote e regressões sob carga representativa.

## Observabilidade e investigação

### T21. p50 ficou estável e p95 piorou. O que você investigaria?

**Intenção:** perceber a distribuição da experiência. **Aprofundamento:** quais dimensões você separaria sem criar cardinalidade descontrolada? **Sinais:** cauda, tamanho de requisição, tenant, fila, dependência e período. **Pleno:** não resume tudo a uma média. **Sênior:** relaciona saturação e concorrência, verifica amostragem e escolhe uma próxima medida que distingue hipóteses.

### T22. Como seguir uma requisição entre API, banco e notificação?

**Intenção:** correlacionar evidências. **Aprofundamento:** o que vai em log, métrica e trace? **Sinais:** identificador de correlação, spans, duração, status e contexto mínimo. **Pleno:** conecta início, operações e resultado sem registrar dados sensíveis. **Sênior:** considera propagação assíncrona, amostragem, cardinalidade e custo do volume de telemetria.

### T23. O banco está usando CPU. Isso confirma que ele causou a lentidão?

**Intenção:** distinguir correlação e causa. **Aprofundamento:** que outra evidência você buscaria? **Sinais:** carga, consultas, locks, I/O, plano e linha do tempo. **Pleno:** evita uma conclusão a partir de um único gráfico. **Sênior:** compara hipóteses, mudanças recentes, sinais de saturação e intervenções controladas com critério de sucesso.

### T24. Como verificar uma mudança após sua publicação?

**Intenção:** conectar entrega e operação. **Aprofundamento:** qual sinal dispara rollback e o que acontece com os dados gravados? **Sinais:** baseline, erro, latência, correção, implantação gradual e compatibilidade. **Pleno:** acompanha métricas e prepara reversão da aplicação. **Sênior:** considera migrações compatíveis, reconciliação, indicadores de negócio e a diferença entre reverter código e desfazer operações válidas.
