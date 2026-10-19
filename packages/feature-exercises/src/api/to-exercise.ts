import type { Exercise } from '@fitpro/core-types';
import { inferDifficulty, inferMechanics, isStrengthExercise, mapEquipment, mapSecondary, mapTarget } from './mapping';
import { inferMovementPattern } from './movement';
import { externalExerciseSchema, exerciseSchema, type ExternalExercise } from './schema';
import { translateExercise } from './translations';

/** Converte um exercício externo já validado. Retorna undefined se ele não serve ao treino de força. */
export const toExercise = (external: ExternalExercise): Exercise | undefined => {
  if (!isStrengthExercise(external.name)) return undefined;
  const target = mapTarget(external.target);
  if (!target) return undefined;
  const equipment = mapEquipment(external.equipment);
  const text = translateExercise(external.name, external.instructions, target);
  return {
    id: external.id,
    name: text.name,
    originalName: external.name,
    gifUrl: external.gifUrl,
    target,
    secondary: mapSecondary(external.secondaryMuscles, target),
    equipment,
    mechanics: inferMechanics(external.name, external.secondaryMuscles.length),
    pattern: inferMovementPattern(external.name, target),
    difficulty: inferDifficulty(external, equipment),
    instructions: text.instructions,
    commonMistakes: text.commonMistakes,
  };
};

export type ParseResult = { exercises: Exercise[]; rejected: number };

/** Valida item a item: um registro inválido não derruba o catálogo inteiro. */
export const parseExternalCatalog = (payload: unknown): ParseResult => {
  if (!Array.isArray(payload)) {
    throw new Error('Resposta inesperada da API de exercícios.');
  }
  const exercises: Exercise[] = [];
  let rejected = 0;
  const seenIds = new Set<string>();
  for (const item of payload) {
    const parsed = externalExerciseSchema.safeParse(item);
    const exercise = parsed.success ? toExercise(parsed.data) : undefined;
    if (!exercise) {
      rejected += 1;
      continue;
    }
    if (seenIds.has(exercise.id)) continue;
    seenIds.add(exercise.id);
    exercises.push(exercise);
  }
  return { exercises, rejected };
};

/** Revalida o cache local; entradas de versões antigas do app são descartadas. */
export const parseCachedCatalog = (rows: readonly unknown[]): Exercise[] =>
  rows.flatMap((row) => {
    const parsed = exerciseSchema.safeParse(row);
    return parsed.success ? [parsed.data] : [];
  });
