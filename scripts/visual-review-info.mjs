import { readFile } from 'node:fs/promises';
import { version, visualFingerprint } from './edition.mjs';
const report = JSON.parse(await readFile('evidencias/pdf-verificacao.json', 'utf8'));
console.log(JSON.stringify({ version, sourcesSha256: await visualFingerprint(),
  expectedPages: report.automaticChecks.reduce((n,r) => n+r.pages, 0),
  approved: false, reviewer: '', pagesInspected: 0,
  instruction: 'Inspecione as páginas antes de preencher e aprovar o registro de revisão visual.' }, null, 2));
