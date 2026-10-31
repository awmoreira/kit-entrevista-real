# Kit Entrevista Real 1.1.0

Kit gratuito em português para praticar entrevistas de backend pleno e sênior. Autoria: Allan Winckler.

## Revisão crítica desta edição

A edição 1.1.0 corrige dez lacunas documentadas na revisão do kit. Acrescenta teste da solução do candidato, um avaliador de concorrência compatível com lock de linha, roteiro comum de entrevista, cartões e exemplos para calibrar as dez competências. Esclarece NO, ajuda, modalidade e expectativas de pleno/sênior. A release 1.0.0 foi preservada.

O percurso do candidato é validado em pacote extraído: versão inicial vermelha, solução válida verde, arquivo original restaurado. A integração contínua verifica esse fluxo e a API por HTTP real. Os relatórios têm fingerprints das fontes e os ativos ficam separados por edição.

## Conteúdo

- Quatro PDFs: guia de preparação, caderno de exercícios, gabaritos e condução, fichas de prática e piloto.
- Fontes Markdown e laboratório com Node.js 24, TypeScript, Fastify, PostgreSQL 17 e Vitest.
- Cinco bugs com reprodução específica falhando na proposta e passando na referência.
- Investigação de N+1 com respostas equivalentes e redução de 51 para 2 consultas por página de 50 pedidos.
- Arquitetura com duas alternativas, 24 perguntas de fundamentos, 12 comportamentais e simulado de 90 minutos.

Consulte no repositório docs/revisao-critica-1.1.0.md para achados, correções, evidências e limites da revisão.

## Baixar e verificar

O ZIP reúne código, materiais, quatro PDFs e evidências. MANIFEST.json relaciona arquivos, tamanhos e SHA-256. SHA256SUMS.txt contém hashes dos ativos da release. Compare o hash do arquivo baixado antes de extraí-lo; no macOS use shasum -a 256 e no Linux/WSL use sha256sum.

O README extraído explica instalação e prática. Os PDFs também podem ser baixados individualmente. Não é necessário cadastro.

## Estado da validação

Exercícios verificados com PostgreSQL real; provas, benchmark, relatório dos PDFs e registro técnico acompanham o pacote. Tempos do benchmark se referem ao ambiente e à carga registrados; não são metas de produção. O piloto pedagógico com cinco candidatos está pendente. Rubricas autorais, sem corte de aprovação ou validação preditiva para contratação.

Código: MIT. Materiais educacionais: CC BY-NC 4.0, com atribuição e restrição de uso comercial.
