import { z } from 'zod';
import { EXERCISE_EQUIPMENTS, LEVELS, MOVEMENT_PATTERNS, MUSCLE_GROUPS } from '@fitpro/core-types';

/** Formato bruto de um exercício da ExerciseDB (via backend proxy). */
export const externalExerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  bodyPart: z.string(),
  target: z.string(),
  equipment: z.string(),
  gifUrl: z.url(),
  secondaryMuscles: z.array(z.string()).default([]),
  instructions: z.array(z.string()).default([]),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

export type ExternalExercise = z.infer<typeof externalExerciseSchema>;

/** Formato interno, usado para revalidar o cache local. */
export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  originalName: z.string(),
  gifUrl: z.string(),
  target: z.enum(MUSCLE_GROUPS),
  secondary: z.array(z.enum(MUSCLE_GROUPS)),
  equipment: z.enum(EXERCISE_EQUIPMENTS),
  mechanics: z.enum(['composto', 'isolado']),
  // Cache de versões antigas não tem `pattern`: é descartado e o catálogo é recarregado.
  pattern: z.enum(MOVEMENT_PATTERNS),
  difficulty: z.enum(LEVELS),
  instructions: z.array(z.string()),
  commonMistakes: z.array(z.string()),
});
