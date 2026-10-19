import { useCallback } from 'react';
import { useExerciseCatalog } from '@fitpro/feature-exercises';

/** Nome traduzido a partir do ID salvo no histórico; cai no ID se o catálogo não carregou. */
export const useExerciseName = (): ((exerciseId: string) => string) => {
  const catalog = useExerciseCatalog();
  return useCallback(
    (exerciseId: string) =>
      (catalog.status === 'ready' && catalog.data.find((exercise) => exercise.id === exerciseId)?.name) || exerciseId,
    [catalog],
  );
};
