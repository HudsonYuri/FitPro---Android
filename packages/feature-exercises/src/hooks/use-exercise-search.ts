import { useDeferredValue, useMemo, useState } from 'react';
import type { Exercise, ExerciseEquipment, MuscleGroup } from '@fitpro/core-types';

const normalize = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export type ExerciseFilters = {
  query: string;
  muscle: MuscleGroup | undefined;
  equipment: ExerciseEquipment | undefined;
};

export const filterExercises = (catalog: readonly Exercise[], filters: ExerciseFilters): Exercise[] => {
  const query = normalize(filters.query);
  return catalog.filter(
    (exercise) =>
      (!filters.muscle || exercise.target === filters.muscle) &&
      (!filters.equipment || exercise.equipment === filters.equipment) &&
      (!query || normalize(exercise.name).includes(query) || normalize(exercise.originalName).includes(query)),
  );
};

const toggle = <T>(current: T | undefined, value: T): T | undefined => (current === value ? undefined : value);

export const useExerciseSearch = (catalog: readonly Exercise[]) => {
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroup | undefined>(undefined);
  const [equipment, setEquipment] = useState<ExerciseEquipment | undefined>(undefined);
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(
    () => filterExercises(catalog, { query: deferredQuery, muscle, equipment }),
    [catalog, deferredQuery, muscle, equipment],
  );

  return {
    query,
    setQuery,
    muscle,
    toggleMuscle: (value: MuscleGroup) => setMuscle((current) => toggle(current, value)),
    equipment,
    toggleEquipment: (value: ExerciseEquipment) => setEquipment((current) => toggle(current, value)),
    results,
  };
};
