import { useMemo } from 'react';
import type { Exercise } from '@fitpro/core-types';

export const useExerciseIndex = (catalog: readonly Exercise[]): ReadonlyMap<string, Exercise> =>
  useMemo(() => new Map(catalog.map((exercise) => [exercise.id, exercise])), [catalog]);
