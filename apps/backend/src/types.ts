/**
 * Formato único que o backend entrega ao app, venha de qual fonte vier.
 * O app valida com Zod e converte para o tipo interno `Exercise`.
 */
export type NormalizedExercise = {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
  secondaryMuscles: string[];
  instructions: string[];
};

export type ExerciseSource = {
  name: 'exercisedb-free' | 'rapidapi';
  fetchCatalog: () => Promise<NormalizedExercise[]>;
  /** Só a RapidAPI exige a chave para servir imagens; a fonte gratuita entrega URLs públicas. */
  fetchGif?: (exerciseId: string) => Promise<{ body: Buffer; contentType: string }>;
};

export class UpstreamError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const stringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

export const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
