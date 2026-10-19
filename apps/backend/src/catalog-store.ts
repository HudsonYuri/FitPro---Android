import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { isRecord, stringArray, type ExerciseSource, type NormalizedExercise } from './types.ts';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** O arquivo é nosso, mas pode ser de uma versão antiga do backend: confere campo a campo. */
const toNormalized = (item: unknown): NormalizedExercise | undefined => {
  if (!isRecord(item)) return undefined;
  const { id, name, bodyPart, target, equipment, gifUrl } = item;
  if (typeof id !== 'string' || typeof name !== 'string' || typeof target !== 'string') return undefined;
  if (typeof equipment !== 'string' || typeof gifUrl !== 'string') return undefined;
  return {
    id,
    name,
    bodyPart: typeof bodyPart === 'string' ? bodyPart : '',
    target,
    equipment,
    gifUrl,
    secondaryMuscles: stringArray(item.secondaryMuscles),
    instructions: stringArray(item.instructions),
  };
};

type Snapshot = { source: ExerciseSource['name']; fetchedAt: number; exercises: NormalizedExercise[] };

export type CatalogState =
  | { status: 'ready'; exercises: NormalizedExercise[] }
  | { status: 'preparing' }
  | { status: 'failed'; message: string };

/**
 * Guarda o catálogo em disco: baixar tudo da API gratuita leva alguns minutos
 * por causa do limite de requisições, então isso não pode acontecer a cada restart.
 * Serve o último catálogo enquanto atualiza em segundo plano.
 */
export const createCatalogStore = (source: ExerciseSource, cacheFile: string) => {
  let snapshot: Snapshot | undefined;
  let refreshing: Promise<void> | undefined;
  let lastError: string | undefined;

  const loadFromDisk = async (): Promise<void> => {
    try {
      const parsed: unknown = JSON.parse(await readFile(cacheFile, 'utf8'));
      if (isRecord(parsed) && parsed.source === source.name && Array.isArray(parsed.exercises)) {
        snapshot = {
          source: source.name,
          fetchedAt: typeof parsed.fetchedAt === 'number' ? parsed.fetchedAt : 0,
          exercises: parsed.exercises.flatMap((item) => toNormalized(item) ?? []),
        };
        console.log(`[catalog] ${snapshot.exercises.length} exercícios carregados de ${cacheFile}`);
      }
    } catch {
      // Sem cache ainda: o primeiro refresh cria o arquivo.
    }
  };

  const refresh = (): Promise<void> => {
    refreshing ??= (async () => {
      try {
        console.log(`[catalog] atualizando a partir de ${source.name}…`);
        const exercises = await source.fetchCatalog();
        if (exercises.length === 0) throw new Error('A fonte devolveu um catálogo vazio');
        snapshot = { source: source.name, fetchedAt: Date.now(), exercises };
        lastError = undefined;
        await mkdir(dirname(cacheFile), { recursive: true });
        await writeFile(cacheFile, JSON.stringify(snapshot));
        console.log(`[catalog] ${exercises.length} exercícios salvos em ${cacheFile}`);
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        console.error('[catalog] falha ao atualizar:', lastError);
      } finally {
        refreshing = undefined;
      }
    })();
    return refreshing;
  };

  const isStale = (): boolean => !snapshot || Date.now() - snapshot.fetchedAt > SEVEN_DAYS_MS;

  return {
    /** Carrega o disco e, se preciso, começa a baixar sem bloquear o servidor. */
    start: async (): Promise<void> => {
      await loadFromDisk();
      if (isStale()) void refresh();
    },
    get: (): CatalogState => {
      if (snapshot) {
        if (isStale() && !refreshing) void refresh();
        return { status: 'ready', exercises: snapshot.exercises };
      }
      if (refreshing) return { status: 'preparing' };
      if (lastError) {
        void refresh();
        return { status: 'failed', message: lastError };
      }
      void refresh();
      return { status: 'preparing' };
    },
  };
};
