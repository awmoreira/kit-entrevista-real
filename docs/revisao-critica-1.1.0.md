# Revisão crítica da edição 1.0.0 e correções da 1.1.0

Revisão documental e técnica feita por Codex sob as perspectivas de candidato e entrevistador. Não houve participante real nem entrevista externa; o piloto continua pendente. Os exemplos de calibração são autorais e fictícios.

## Achados e alterações

| ID | Prioridade e lacuna demonstrada | Correção na edição 1.1 |
| --- | --- | --- |
| R01 | Alta: candidato não tinha um comando que avaliasse sua solução; a suíte sempre usava a referência e verify:bugs exigia o defeito original | Cópia editável candidato.ts, modo HTTP candidato e test:candidate apontando para essa cópia; verificação vermelho/verde em arquivo extraído |
| R02 | Alta: a barreira após a leitura rejeitava uma solução válida que bloqueasse a linha antes de ler | Disputa sincronizada por lock real e observação de pg_stat_activity; teste de alternativa com FOR UPDATE e reprodução do falso negativo antigo |
| R03 | Alta: perguntas e informações entregues podiam variar entre entrevistadores, sem cobertura explícita das competências | Roteiro comum de 90 minutos, cartões com dados disponíveis, mapa das dez competências e regra de registro de ajuda |
| R04 | Média: âncoras genéricas deixavam ambíguos NO, honestidade, escopo pleno/sênior e separação dos dois eixos | Vinte trechos fictícios comentados, exemplos de NO, notas por escopo e registro de risco central independente da média |
| R05 | Média: README e exemplo de história antecipavam a solução do endpoint; todas as pistas apareciam no próprio enunciado | Entrada por papel, evidências em seção sinalizada, história fictícia de outro domínio e pistas num apêndice |
| R06 | Média: o benchmark podia continuar sendo aceito após alterações no laboratório; prova dos bugs cobria só três arquivos no hash | Fingerprints das fontes, schema, fixtures e scripts relevantes; hashes dos planos e conferência dos cartões pela captura real |
| R07 | Média: relatórios tinham versão fixa 1.0.0 e dist podia misturar ZIPs de edições | Versão lida do manifesto, ativos em dist/1.1.0 e comparação exata dos checks exigidos |
| R08 | Média: CI gerava o ZIP mas não percorria sua instalação e uso; HTTP de verificação não tinha prazo | CI extrai o pacote, valida hashes, testa correção do candidato e HTTP; modo de banco preparado e prazos de execução |
| R09 | Média: o piloto pedia evidência nova sem definir previamente o que contava ou como tratar mudança de condições | Elementos observáveis por tarefa, exposição prévia, modalidade, ajuda e denominador comparável documentados |
| R10 | Média: faltava procedimento de reinspeção; links relativos de novos capítulos apontariam para caminhos errados e main mutável nos PDFs | Comando de informação para revisão sem aprovação automática, fingerprint com versão/dependências e links resolvidos pelo arquivo e pela tag da edição |

## Como os achados foram verificados

- R01: o teste do candidato inicial falha em asserts de B01 a B05; uma implementação válida passa no mesmo comando. A troca ocorre somente na cópia temporária e é revertida antes da conferência final.
- R02: [testes do avaliador](../tests/referencia.test.ts) reproduzem a rejeição da barreira antiga e aceitam uma [solução com lock de linha](../tests/fixtures/row-lock.ts). A proposta continua reproduzindo estoque negativo sob o novo agendamento.
- R03 a R05: [roteiro](../conteudo/03-conducao.md), [calibração](../conteudo/03-calibracao.md), [guia](../conteudo/01-guia.md) e [pistas](../conteudo/02-pistas.md) foram conferidos quanto a ordem, tempo, oportunidade e exposição de soluções.
- R06 a R08: [checks da edição](../evidencias/checks.json), [provas](../evidencias/provas-bugs.json), [benchmark](../evidencias/benchmark.json) e [cópia limpa](../evidencias/copia-limpa.json) registram as verificações atuais. Falha de ambiente não é aceita como prova de defeito.
- R09: o [protocolo de piloto](../conteudo/04-piloto.md) define coleta e limites de interpretação antes da rodada. Seu uso com participantes reais ainda não foi realizado.
- R10: a [verificação dos PDFs](../evidencias/pdf-verificacao.json) e a [revisão visual](../evidencias/revisao-visual.json) identificam fontes, edição e páginas inspecionadas.

## Decisões preservadas e limites

Os cinco defeitos intencionais ficam na proposta original para manter o exercício. As correções de referência continuam disponíveis no gabarito. O schema didático omite o CHECK de estoque não negativo para tornar a corrida visível; isso já era explicado como recorte, e não como recomendação de schema de produção. As identidades e credenciais locais são fixtures públicas.

A revisão não encontrou motivo para substituir a convenção 50/50 por outra proporção arbitrária. Tornou explícitos seu propósito de treino, as evidências e os limites de uma média. Também não tratou um framework, broker ou estilo de comunicação preferido como requisito universal.

Esta revisão melhora consistência e verificabilidade, mas não demonstra eficácia pedagógica, confiabilidade entre entrevistadores ou previsão de contratação. Isso depende da aplicação do protocolo e de evidências futuras. A edição 1.0.0 permanece publicada para preservar o histórico; a 1.1.0 é a edição atualizada.

## Referências usadas na revisão

- [OPM: guia de entrevistas estruturadas](https://www.opm.gov/policy-data-oversight/assessment-and-selection/structured-interviews/guide/): perguntas, aprofundamentos, escalas e piloto.
- [PostgreSQL 17: locks de linha](https://www.postgresql.org/docs/17/explicit-locking.html): o bloqueio de uma leitura FOR UPDATE pode ser comportamento correto, não falha da solução.
- [Google: comentários de review](https://google.github.io/eng-practices/review/reviewer/comments.html): justificativa, respeito e prioridade dos comentários.
