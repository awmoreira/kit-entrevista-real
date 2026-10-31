# Roteiro comum do entrevistador

## Finalidade e preparação

Edição 1.1.0. Este roteiro conduz um simulado de preparação. O kit não é um processo de contratação validado. Combine o nível de referência, as ferramentas e a modalidade antes de começar. O arquivo de revisão crítica descreve as lacunas encontradas na edição anterior e as correções desta edição.

Use a mesma sequência e as perguntas centrais abaixo em tentativas comparáveis. Os aprofundamentos podem esclarecer uma resposta, mas registre a pergunta, a informação entregue e a pista usada. Ofereça uma nova oportunidade quando faltar evidência. Não complete a resposta pela pessoa.

Antes dos 90 minutos: ambiente funcionando ou modalidade documental escolhida; 30 minutos de review prévio; fichas copiadas; acordo sobre consulta e IA; leitura apenas do guia e dos enunciados pelo candidato. Separe o gabarito e este roteiro. A preparação e o debrief ficam fora dos 90 minutos.

Na modalidade documental, a pessoa trabalha com o diff, o contrato e os cartões deste roteiro, sem Docker. Ela explica testes, SQL ou pseudocódigo. Registre a modalidade; não atribua deficiência técnica por instalação ou máquina indisponível. Compare tentativas realizadas sob condições equivalentes. Uma pausa combinada ou falha do ambiente para o cronômetro; registre o tempo de atividade e a pausa separadamente.

## Abertura

Diga: "Vamos observar seu raciocínio, decisões e colaboração em cinco blocos. Você pode pedir contexto, explicitar uma hipótese e mudar de ideia. As perguntas têm critérios de prática; não existe nota de aprovação. Vamos registrar evidências e escolher próximos exercícios. Documentação e ferramentas seguem o acordo que fizemos."

Confirme se a pessoa já consultou as soluções. Se sim, use as variações do piloto ou trate a sessão como estudo comentado, sem apresentá-la como primeira tentativa sem ajuda. Transparência não reduz a nota de colaboração.

## Sequência de 90 minutos

### 00:00 a 00:15: histórico

Dois minutos de relato: "Conte uma entrega que você conhece profundamente e delimite sua contribuição". Use até oito minutos para papel, decisão, alternativa, resultado e evidência. Nos cinco minutos finais, peça uma falha ou feedback: "O que você fez depois e como verificou a mudança?"

Se a pessoa não viveu o episódio pedido, aceite um projeto pessoal, acadêmico ou outra situação equivalente. Se ainda não houver episódio, identifique isso e use uma situação hipotética para explorar raciocínio. Registre que a resposta hipotética não comprova experiência passada. Não peça que invente uma história.

### 00:15 a 00:35: investigação

Primeiros três minutos: "O que significa o sintoma e o que você precisa saber antes de agir?". Depois peça hipóteses e uma medida que as diferencie. Entregue os cartões na ordem das solicitações, registrando cada entrega. Nos cinco minutos finais, peça conclusão provisória, alteração proposta e verificação. Implementação completa não é exigida no bloco.

Perguntas centrais: "Que evidência enfraqueceria sua hipótese?" e "Como você confirmaria que a mudança preservou o resultado?". Não dê o nome do padrão de consultas antes de a pessoa investigar. Se ela pedir dados que não existem no exercício, responda "Não temos essa medição; como você a obteria?", sem fabricar valores.

### 00:35 a 00:55: arquitetura

Use três minutos para esclarecer requisitos; oito para o fluxo e a confirmação; seis para alternativas, falhas e operação; três para síntese. Pergunte: "O que precisa mudar no mesmo commit?", "O que ocorre se a API cair depois do commit?" e "Como recuperar notificações após duas horas de falha?".

Os números do enunciado são restrições fictícias. Peça que a pessoa relacione escolha, equipe e prazo. Para sênior, aprofunde contenção em produto popular, custo e critério de evolução. Para pleno, aprofunde consistência do fluxo delimitado e verificação. Não exija broker, cache ou um fornecedor específico.

### 00:55 a 01:15: review

Peça a síntese do review prévio em cinco minutos. Use dez para os comentários de maior impacto e uma reprodução. Nos cinco finais, responda como autor: "Os testes passaram; por que isso precisa mudar?". Observe se a pessoa explica a condição e a consequência sem atacar o autor.

Perguntas centrais: "Qual comentário você prioriza e por quê?" e "Como demonstraria esse problema?". Os cinco defeitos estão no gabarito, mas contar todos em 20 minutos não é requisito de uma nota. Uma observação adicional real é válida quando vem com reprodução e relação com o contrato. Não pontue preferência como erro.

### 01:15 a 01:30: comportamento

Use C01, sobre discordância, e C03, sobre feedback, como perguntas centrais. Aprofunde ação, perspectiva da outra pessoa, consequência e mudança. Reserve os cinco minutos finais para a situação fictícia de duplicação de pedidos sob pressão de prazo. Outras perguntas do banco podem substituir essas numa nova rodada, registrando a mudança.

Não avalie concordância com o entrevistador, extroversão ou velocidade da fala. A discordância fundamentada e o reconhecimento de incerteza são compatíveis com boa colaboração.

## Cartões de evidência da investigação

### Cartão A: escopo disponível

O relato de suporte é fictício. O laboratório tem duas empresas, 20.000 pedidos históricos sintéticos e uma listagem de pedidos confirmados. O relato fala em piora ao aumentar o tamanho da página. Não há medição de tráfego real de produção, incidente de implantação nem SLO de produção observado. Se perguntarem por esses dados, reconheça sua ausência e explore como coletá-los.

### Cartão B: trabalho por requisição

Entregue quando a pessoa pedir contagem de consultas ou comparar tamanhos de página. Os números abaixo são observados no laboratório e conferidos por npm run bench, em evidencias/benchmark.json, campo investigationCards. Eles não são tempos de produção.

| Limite pedido | Pedidos retornados | Consultas SQL |
| --- | --- | --- |
| 1 | 1 | 2 |
| 20 | 20 | 21 |
| 50 | 50 | 51 |

Pergunte: "O que essa relação sugere, e o que ela ainda não prova?". Se precisar de duração, consulte o capítulo de medições e exponha ambiente e limitações junto com os números. Não converta o benchmark em promessa de capacidade.

### Cartão C: acesso ao código

Entregue quando a pessoa pedir o caminho da requisição. A listagem consulta pedidos com filtro de empresa, ordenação e limite; depois usa Promise.all para consultar os itens de cada pedido. O pool tem oito conexões. O código está em src/list-orders.ts. Pare de fornecer informação e peça a próxima hipótese ou verificação.

Pistas oferecidas por iniciativa do entrevistador devem ser identificadas como ajuda. Pedir um dado relevante é parte da investigação e não gera desconto automático. Diferencie solicitar evidência de receber uma sugestão de solução.

## Mapa de oportunidades para as dez competências

| Competência | Oportunidade principal | Evidência a registrar |
| --- | --- | --- |
| Investigação | Hipóteses e cartões do endpoint | Hipótese, medida e atualização da conclusão |
| Correção e segurança dos dados | Contrato e review | Regra de empresa/preço e condição de violação |
| Arquitetura e consequências | Fluxo, escolha e alternativa | Relação entre requisito, opção e custo |
| Confiabilidade e concorrência | Falha após commit, estoque e retry | Invariante, limite transacional e recuperação |
| Verificação e qualidade do review | Reprodução e teste proposto | Condição, efeito, assert e alcance da prova |
| Clareza do raciocínio | Síntese de qualquer bloco | Explicação compreendida e ajuste após dúvida |
| Esclarecimento de ambiguidades | Requisitos e dados ausentes | Pergunta decisiva e premissa explícita |
| Colaboração no review | Resposta ao autor que resiste | Comentário sobre código, respeito e prioridade |
| Responsabilidade e aprendizado | História, falha ou revisão de hipótese | Ação própria, consequência e mudança verificável |
| Feedback e discordância | C01, C03 e situação fictícia | Perspectivas, acordo e acompanhamento |

Uma mesma fala pode ter uma dimensão técnica e outra de colaboração. Avalie aspectos diferentes: a exatidão da reprodução em verificação e o tratamento dado ao autor em colaboração. Não dê uma segunda nota técnica só porque a fala foi convincente.

## Aplicação das notas e de NO

Registre trecho ou ação, contexto, ajuda e âncora usada. Nota 1 requer evidência de uma abordagem insuficiente após oportunidade compreensível. NO significa que a competência não recebeu oportunidade suficiente, por tempo, impedimento técnico ou pergunta inadequada. Não significa zero, não saber uma resposta ou ter um desempenho ruim observado.

"Não sei" pode ser uma evidência técnica insuficiente numa pergunta relevante; honestidade não é uma falha de colaboração. Um episódio inexistente não demonstra falta de responsabilidade: busque outra oportunidade. Um comportamento explicitamente nocivo não vira NO apenas por ser desagradável avaliar.

Use o nível acordado para definir escopo e autonomia. As notas 1 a 4 descrevem qualidade dentro desse escopo; 4 não significa automaticamente sênior. Não compare médias de rodadas com níveis, ferramentas, ajuda ou modalidades diferentes como se fossem uma medida de evolução isolada.

Registre um risco central demonstrado mesmo se a média for alta. Boa colaboração não torna seguro um pedido que acessa dados de outra empresa. Isso orienta a próxima prática, sem introduzir corte de contratação.

## Debrief de 15 minutos fora do simulado

Peça primeiro a autoavaliação. Compartilhe uma evidência forte e uma lacuna por eixo. Antes de discutir números, compare âncoras e oportunidade oferecida. Escolha até duas ações observáveis e uma competência NO para explorar depois. Não conclua senioridade ou empregabilidade a partir desta sessão.

Para preparar entrevistadores, use os exemplos de calibração deste volume antes da sessão e compare avaliações independentes. Essa preparação não substitui o piloto com pessoas reais, que continua pendente.
