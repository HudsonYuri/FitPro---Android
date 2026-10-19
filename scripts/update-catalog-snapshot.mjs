// Copia o catálogo baixado pelo backend para dentro do app, como reserva offline.
// Uso: rode o backend uma vez (ele cria apps/backend/.cache/catalog.json) e depois
//   node scripts/update-catalog-snapshot.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('..', import.meta.url);
const source = fileURLToPath(new URL('apps/backend/.cache/catalog.json', root));
const target = fileURLToPath(new URL('packages/feature-exercises/src/data/catalog-snapshot.json', root));

const snapshot = JSON.parse(readFileSync(source, 'utf8'));
if (!Array.isArray(snapshot.exercises) || snapshot.exercises.length === 0) {
  throw new Error(`Catálogo vazio em ${source}. Rode o backend até ele terminar o download.`);
}
writeFileSync(target, JSON.stringify(snapshot.exercises));
console.log(`${snapshot.exercises.length} exercícios copiados para ${target}`);
