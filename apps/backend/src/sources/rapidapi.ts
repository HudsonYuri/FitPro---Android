import { UpstreamError, isRecord, stringArray, type ExerciseSource, type NormalizedExercise } from '../types.ts';

export type RapidApiConfig = { apiKey: string; host: string; publicBaseUrl: string };

const GIF_CACHE_LIMIT = 600;
const GIF_RESOLUTION = 180;
const LIMIT_PER_TARGET = 60;

/** Alvos da ExerciseDB (RapidAPI) que o app usa. */
const TARGETS = [
  'pectorals',
  'lats',
  'upper back',
  'traps',
  'spine',
  'delts',
  'biceps',
  'triceps',
  'quads',
  'hamstrings',
  'glutes',
  'abductors',
  'calves',
  'abs',
] as const;

const gifCache = new Map<string, { body: Buffer; contentType: string }>();

const headers = (config: RapidApiConfig): Record<string, string> => ({
  'x-rapidapi-key': config.apiKey,
  'x-rapidapi-host': config.host,
});

const normalize = (config: RapidApiConfig, item: unknown): NormalizedExercise | undefined => {
  if (!isRecord(item) || typeof item.id !== 'string' || typeof item.name !== 'string') return undefined;
  if (typeof item.target !== 'string' || typeof item.equipment !== 'string') return undefined;
  return {
    id: item.id,
    name: item.name,
    bodyPart: typeof item.bodyPart === 'string' ? item.bodyPart : '',
    target: item.target,
    equipment: item.equipment,
    // As imagens da RapidAPI exigem a chave no header: o app recebe a rota /gifs deste backend.
    gifUrl: `${config.publicBaseUrl}/gifs/${encodeURIComponent(item.id)}`,
    secondaryMuscles: stringArray(item.secondaryMuscles),
    instructions: stringArray(item.instructions),
  };
};

export const createRapidApiSource = (config: RapidApiConfig): ExerciseSource => ({
  name: 'rapidapi',

  /** Sequencial de propósito: o plano gratuito da RapidAPI limita requisições por segundo. */
  fetchCatalog: async () => {
    const catalog: NormalizedExercise[] = [];
    for (const target of TARGETS) {
      const path = `/exercises/target/${encodeURIComponent(target)}?limit=${LIMIT_PER_TARGET}&offset=0`;
      const response = await fetch(`https://${config.host}${path}`, { headers: headers(config) });
      if (!response.ok) throw new UpstreamError(response.status, `RapidAPI respondeu ${response.status} em ${path}`);
      const page: unknown = await response.json();
      if (Array.isArray(page)) catalog.push(...page.flatMap((item) => normalize(config, item) ?? []));
    }
    return catalog;
  },

  fetchGif: async (exerciseId) => {
    const cached = gifCache.get(exerciseId);
    if (cached) return cached;
    const url = `https://${config.host}/image?exerciseId=${encodeURIComponent(exerciseId)}&resolution=${GIF_RESOLUTION}`;
    const response = await fetch(url, { headers: headers(config) });
    if (!response.ok) throw new UpstreamError(response.status, `GIF ${exerciseId} indisponível`);
    const gif = {
      body: Buffer.from(await response.arrayBuffer()),
      contentType: response.headers.get('content-type') ?? 'image/gif',
    };
    if (gifCache.size >= GIF_CACHE_LIMIT) {
      const oldest = gifCache.keys().next().value;
      if (oldest !== undefined) gifCache.delete(oldest);
    }
    gifCache.set(exerciseId, gif);
    return gif;
  },
});
