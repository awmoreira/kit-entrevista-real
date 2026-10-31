# Guia de preparação

## Uma entrevista sobre trabalho real

Você já construiu software. O desafio de uma entrevista é tornar visível como você pensa, decide e colabora em um intervalo curto. Este kit organiza esse treino em cinco blocos: histórico, investigação, arquitetura, review e comportamento. Ao final você terá registros que pode revisar, e não apenas uma impressão de como foi a conversa.

Prepare seis histórias, uma nota de investigação, uma decisão arquitetural, comentários de review e um plano de melhoria. Use acontecimentos reais da sua trajetória. Os exemplos deste material são fictícios e servem para mostrar a estrutura do raciocínio.

O público é de backend pleno e sênior. Você precisa compreender funções assíncronas em TypeScript, requisições HTTP, SELECT e UPDATE em SQL e a ideia de testes automatizados. Se algum desses fundamentos ainda estiver em formação, separe tempo para estudá-lo antes do simulado.

## Como usar os quatro volumes

Este guia organiza o estudo. O caderno traz enunciados e perguntas. O volume de gabaritos explica caminhos, critérios e defeitos. As fichas guardam suas evidências e seu próximo passo. Todos os volumes estão disponíveis em Markdown e PDF na mesma edição 1.0.0.

No estudo guiado, tente primeiro, registre sua decisão e use uma pista por vez. Depois compare com o gabarito e identifique o que mudou no seu entendimento. No simulado, combine a consulta permitida antes de começar, registre as respostas e abra o gabarito ao terminar cada sessão completa. Quem acompanha o treino pode usar o roteiro do facilitador.

O gabarito é público. Sua separação é pedagógica: serve para preservar uma tentativa útil. Você pode estudar sozinho, explicar em voz alta para um colega ou gravar um áudio local para ouvir depois. Não é preciso enviar respostas ou cadastrar uma conta.

## Preparação do ambiente

Para ler e preencher fichas basta um leitor de PDF ou editor de Markdown. Para executar o laboratório instale Node.js 24 e Docker com Compose v2. No Windows, use WSL2 com integração do Docker Desktop e mantenha o projeto no sistema de arquivos do Linux. No macOS e Linux, use o terminal normal.

Baixe o ZIP completo da release, extraia a pasta e abra um terminal nela. A primeira instalação requer internet para dependências e imagem do PostgreSQL. Depois disso os exercícios usam serviços locais.

```sh
node --version
docker compose version
npm ci
npm run lab:setup
npm test
npm run lab:start
```

O Node deve indicar versão 24. O PostgreSQL ocupa a porta local 55437; a API usa 3337. Se uma porta já estiver ocupada, encerre o serviço que você iniciou nessa porta ou utilize outra máquina de prática. O README do repositório detalha diagnóstico de instalação e alteração explícita da porta do banco.

O comando de preparação cria somente o banco dedicado do kit e reinicia o schema kit_lab. Os testes usam kit_test; a medição usa kit_bench. O comando lab:reset devolve os dados do laboratório ao início sem apagar suas fichas. Nenhuma variável DATABASE_URL de outro projeto é lida.

Copie as fichas para a pasta minhas-respostas. Ela é ignorada pelo Git. Guarde seus registros ali e faça cópias conforme sua preferência. Dados de clientes e código de empregadores devem ser substituídos por descrições que você pode compartilhar.

## Trilha de cinco sessões

### Sessão 1: transformar experiência em evidência

Reserve 45 a 60 minutos. Liste seis episódios reais: construção, falha, decisão difícil, conflito, feedback e aprendizado. Escolha dois e escreva versões de até 250 palavras. Explique cada um em dois minutos, sem ler. Marque onde você usou generalidades como "a gente melhorou bastante" e acrescente uma ação ou resultado verificável.

Saída: seis histórias mapeadas e duas narrativas treinadas. Critério: outra pessoa consegue distinguir sua contribuição, a decisão tomada e o que você aprendeu.

### Sessão 2: investigar antes de corrigir

Reserve 60 a 75 minutos. Leia o caso do endpoint no caderno. Antes de executar comandos, escreva três hipóteses e o que confirmaria ou enfraqueceria cada uma. Rode a listagem com limites 1, 20 e 50. Observe a contagem de consultas. Só depois consulte o primeiro conjunto de pistas e faça uma proposta de alteração.

Saída: uma nota com sintoma, evidências, hipótese principal, intervenção e verificação. Critério: sua conclusão deriva das observações e inclui uma explicação de como confirmar o resultado.

### Sessão 3: decidir arquitetura com restrições

Reserve 60 a 75 minutos. Leia o cenário de crescimento, faça perguntas de esclarecimento e desenhe o caminho do pedido. Mostre onde o estoque muda e o que ocorre se a notificação falhar. Compare duas soluções antes de escolher. Registre uma consequência operacional que sua opção introduz.

Saída: decisão arquitetural de uma página. Critério: o desenho atende invariantes e a justificativa se relaciona a volume, equipe, disponibilidade e recuperação de falhas.

### Sessão 4: revisar o PR como um colega

Reserve 60 a 75 minutos. Leia o contexto do PR, seu diff e os testes iniciais. Use 30 minutos para a primeira revisão. Selecione os comentários de maior impacto. Para cada um, descreva uma condição que ativa o problema e um resultado incorreto observável. Após a tentativa, execute a verificação dos bugs e compare com a referência.

Saída: comentários priorizados e ao menos uma reprodução. Critério: um autor consegue entender o risco e agir a partir do comentário. As sugestões de estilo ficam identificadas como opcionais.

### Sessão 5: praticar colaboração sob tensão

Reserve 45 a 60 minutos. Escolha quatro perguntas comportamentais do caderno, responda com episódios reais e peça aprofundamentos. Explique o que você ouviu, como agiu e qual foi o efeito. Reescreva uma resposta que atribui todos os problemas a terceiros. Preserve o desacordo técnico, tornando visível sua tentativa de resolver a situação.

Saída: respostas específicas e um plano com duas ações de prática. Critério: você reconhece restrições e responsabilidades, inclusive quando a decisão final não foi sua.

## Seis histórias profissionais

Uma história útil contém contexto suficiente para entender o problema, sua responsabilidade, a ação que você tomou, as alternativas consideradas, o resultado e a reflexão. Você pode usar a sequência contexto, ação, resultado e aprendizado sem pronunciar os nomes das etapas.

| História | O que procurar na sua trajetória | Aprofundamento útil |
| --- | --- | --- |
| Construção | Uma entrega com objetivo e restrições claros | Que parte você fez e como verificou valor? |
| Falha | Um erro ou incidente com consequências | Como detectou, mitigou e mudou o processo? |
| Decisão difícil | Duas opções com custos diferentes | O que fez você escolher e o que sacrificou? |
| Conflito | Divergência com outra pessoa ou área | O que você entendeu da preocupação dela? |
| Feedback | Uma observação que mudou sua atuação | Que mudança concreta ocorreu depois? |
| Aprendizado | Uma lacuna que você precisou enfrentar | Como sabe que o aprendizado transferiu para o trabalho? |

Não é necessário ter liderado um grande incidente ou trabalhado em uma empresa conhecida. Um problema local bem explicado mostra raciocínio. Quando não tiver números confiáveis, descreva evidências qualitativas e seus limites. Separe contribuição individual de resultado da equipe. Uma estimativa deve aparecer como estimativa.

### Exemplo fictício: resposta pouco específica

"A API era lenta. Eu coloquei cache e melhorou muito. O time gostou."

Faltam o efeito no usuário, a investigação, as alternativas, o papel da pessoa e a forma de medir. Um aprofundamento justo seria: "Qual evidência levou você ao cache e como verificou a mudança?"

### Exemplo fictício: resposta com evidências

"Eu mantinha a listagem de pedidos de um SaaS. Sob um conjunto fixo de 50 pedidos, cada resposta disparava 51 consultas. Meu papel foi reproduzir o comportamento e propor a leitura de itens em lote. Comparei as respostas completas e contei duas consultas após a mudança. Os tempos locais também caíram, mas não tratamos isso como prova de capacidade em produção. Adiamos cache porque o custo principal estava nas viagens ao banco. Hoje eu acrescentaria uma verificação de contagem de consultas à integração para perceber a regressão mais cedo."

O exemplo delimita a evidência e reconhece o próximo passo. A precisão vale mais que a grandiosidade do resultado.

## Raciocínio técnico em voz alta

Comece reformulando o problema: qual usuário está afetado, desde quando e em que condições? Diferencie fato, hipótese e decisão. Uma frase útil é: "Ainda não sei a causa. Esta medida distingue um problema na consulta de um problema na dependência externa".

Evite narrar cada tecla. Explique pontos de decisão. Ao ler um plano SQL, diga o que você procura; ao propor um índice, diga qual consulta e ordenação ele atende; ao usar uma transação, delimite o que deve ser atômico. Se receber uma informação que contraria sua hipótese, atualize a hipótese explicitamente.

Um pleno deve resolver um problema delimitado com autonomia, validar sua alteração e comunicar dependências. Um sênior também deve explorar consequências entre componentes, riscos operacionais e estratégias de evolução. Essas expectativas se referem ao exercício e não classificam uma carreira inteira.

## Comentários de review que permitem agir

Uma estrutura prática: prioridade, condição, consequência e proposta de verificação. Por exemplo fictício: "Bloqueante: duas compras podem observar a última unidade antes de atualizar. Nesse caso o estoque pode ficar negativo. Podemos usar uma reserva atômica condicionada à disponibilidade e acrescentar um teste com duas transações sincronizadas?"

Discuta o código e seu efeito. Quando o requisito estiver ambíguo, formule uma pergunta com a hipótese explícita. Diferencie erro demonstrado, risco ainda não reproduzido e preferência. Você pode reconhecer um acerto e explicar por que ele ajuda. Não é preciso reescrever todo o PR para fazer uma boa revisão.

## Simulado de 90 minutos

Prepare o ambiente antes. Faça 30 minutos de revisão prévia do PR. Combine o uso de documentação e ferramentas, escolha uma pessoa para marcar o tempo e use a ficha do simulado. A sequência é: histórico 15 minutos; investigação 20; arquitetura 20; review 20; comportamento 15.

Durante o simulado, reserve o fim de cada bloco para resumir o que foi descoberto e o que continua incerto. Quem acompanha registra evidências e usa aprofundamentos padronizados. Se estudar sozinho, escreva a síntese antes de consultar o gabarito.

Documentação pode ser consultada no modo de estudo. No simulado, combine previamente se haverá consulta e uso de IA. Se usar uma ferramenta, registre onde ela ajudou e verifique suas conclusões. O laboratório não exige IA, chaves de API ou assinaturas.

## Como interpretar a ficha

O eixo técnico observa investigação, correção de dados, arquitetura, confiabilidade e verificação. O eixo de colaboração observa clareza, esclarecimento de ambiguidades, review respeitoso, responsabilidade e tratamento de discordância. Os dois têm o mesmo peso editorial. Colaboração aparece em todos os blocos.

Use 1 quando a evidência mostrar uma abordagem que ainda deixa o problema central sem tratamento; 2 para uma abordagem parcialmente consistente; 3 para uma abordagem consistente e verificada; 4 para uma abordagem consistente que também antecipa consequências relevantes. As âncoras específicas estão no gabarito.

NO significa que faltou uma oportunidade ou observação. Não equivale a zero. Calcule a média de um eixo somente quando suas cinco competências tiverem evidência. Se ambos estiverem completos, o resumo 50/50 é a média das duas médias. Preserve sempre os resultados separados. Nenhum total define aprovação.

## Plano de melhoria

Escolha duas ações com base nas evidências. "Melhorar arquitetura" é amplo demais. "Na próxima decisão, escrever dois modos de falha e um mecanismo de recuperação antes de escolher a solução" permite verificar avanço. Defina um próximo exercício, o que você fará diferente e como reconhecerá a mudança.

Repita com uma variação, não apenas decorando o mesmo caso. O protocolo de piloto fornece três variações para observar transferência. O número de bugs encontrados e a rapidez da fala não são medidas suficientes de qualidade.

## Referências de estudo

- [OPM: entrevistas estruturadas](https://www.opm.gov/policy-data-oversight/assessment-and-selection/structured-interviews/).
- [Google: comentários de review](https://google.github.io/eng-practices/review/reviewer/comments.html).
- [PostgreSQL 17: EXPLAIN](https://www.postgresql.org/docs/17/using-explain.html).
- [node-postgres: transações no mesmo client](https://node-postgres.com/features/transactions).

Este é um instrumento autoral de prática. A verificação dos exercícios e o estado do piloto são descritos no registro de validação da edição. Resultados de aprendizado dependem do uso e ainda precisam ser observados com participantes reais.
