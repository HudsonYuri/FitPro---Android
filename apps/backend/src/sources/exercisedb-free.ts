import { UpstreamError, isRecord, stringArray, wait, type ExerciseSource, type NormalizedExercise } from '../types.ts';

const BASE_URL = 'https://oss.exercisedb.dev/api/v1/exercises';
const PAGE_SIZE = 25;
/** A API gratuita responde 429 rápido: uma página a cada poucos segundos é o ritmo seguro. */
const DELAY_BETWEEN_PAGES_MS = 2500;
const MAX_ATTEMPTS = 8;
const BASE_BACKOFF_MS = 15_000;
const MAX_PAGES = 200;

/** As instruções vêm como "Step:1 Faça…"; o app já numera os passos. */
const STEP_PREFIX = /^step\s*:?\s*\d+\s*[:.)-]?\s*/i;

const fetchPage = async (cursor: string | undefined): Promise<unknown> => {
  const url = new URL(BASE_URL);
  url.searchParams.set('limit', String(PAGE_SIZE));
  // A API pagina por `after` (o valor vem em `meta.nextCursor`); `cursor` é ignorado.
  if (cursor) url.searchParams.set('after', cursor);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const response = await fetch(url);
    if (response.status === 429) {
      const retryAfterMs = Number(response.headers.get('retry-after') ?? 0) * 1000;
      const backoffMs = Math.max(retryAfterMs, BASE_BACKOFF_MS * 2 ** Math.min(attempt, 3));
      console.warn(`[exercisedb-free] 429, nova tentativa em ${Math.round(backoffMs / 1000)}s`);
      await wait(backoffMs);
      continue;
    }
    if (!response.ok) throw new UpstreamError(response.status, `ExerciseDB gratuita respondeu ${response.status}`);
    return response.json();
  }
  throw new UpstreamError(429, 'ExerciseDB gratuita continua limitando as requisições');
};

const normalize = (item: unknown): NormalizedExercise | undefined => {
  if (!isRecord(item) || typeof item.exerciseId !== 'string' || typeof item.name !== 'string') return undefined;
  if (typeof item.gifUrl !== 'string') return undefined;
  const [target] = stringArray(item.targetMuscles);
  const [equipment] = stringArray(item.equipments);
  if (!target || !equipment) return undefined;
  return {
    id: item.exerciseId,
    name: item.name,
    bodyPart: stringArray(item.bodyParts)[0] ?? '',
    target,
    equipment,
    gifUrl: item.gifUrl,
    // Alvos extras entram como secundários: o app só usa um músculo-alvo por exercício.
    secondaryMuscles: [...stringArray(item.targetMuscles).slice(1), ...stringArray(item.secondaryMuscles)],
    instructions: stringArray(item.instructions).map((step) => step.replace(STEP_PREFIX, '').trim()),
  };
};

/**
 * Percorre todas as páginas (cerca de 1.500 exercícios) respeitando o limite da API.
 * O cursor da API volta ao início depois do último item e `hasNextPage` continua
 * `true`, então a parada é pelo total informado ou pelo primeiro ID repetido.
 */
const crawlCatalog = async (): Promise<NormalizedExercise[]> => {
  const byId = new Map<string, NormalizedExercise>();
  let cursor: string | undefined;
  for (let page = 0; page < MAX_PAGES; page++) {
    const body = await fetchPage(cursor);
    if (!isRecord(body) || body.success !== true || !Array.isArray(body.data) || !isRecord(body.meta)) {
      throw new UpstreamError(502, 'Resposta inesperada da ExerciseDB gratuita');
    }
    const sizeBefore = byId.size;
    let seenBefore = 0;
    for (const item of body.data) {
      const exercise = normalize(item);
      if (!exercise) continue;
      if (byId.has(exercise.id)) seenBefore += 1;
      else byId.set(exercise.id, exercise);
    }
    const total = typeof body.meta.total === 'number' ? body.meta.total : Number.POSITIVE_INFINITY;
    console.log(`[exercisedb-free] página ${page + 1}: ${byId.size} exercícios`);
    const wrappedAround = seenBefore > 0 || byId.size === sizeBefore;
    const reachedTotal = page + 1 >= Math.ceil(total / PAGE_SIZE);
    if (wrappedAround || reachedTotal) break;
    if (body.meta.hasNextPage !== true || typeof body.meta.nextCursor !== 'string') break;
    cursor = body.meta.nextCursor;
    await wait(DELAY_BETWEEN_PAGES_MS);
  }
  return [...byId.values()];
};

export const createFreeSource = (): ExerciseSource => ({
  name: 'exercisedb-free',
  fetchCatalog: crawlCatalog,
});
