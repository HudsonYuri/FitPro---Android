import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Exercise, ScreenState } from '@fitpro/core-types';
import { readExerciseCache, writeExerciseCache } from '@fitpro/platform-storage';
import { fetchExerciseCatalog } from '../api/client';
import { parseCachedCatalog, parseExternalCatalog } from '../api/to-exercise';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const exerciseCatalogQueryKey = ['exercise-catalog'] as const;

/**
 * Catálogo que vem dentro do app (scripts/update-catalog-snapshot.mjs). Carregado com
 * `require` sob demanda: é grande e só é lido quando não há rede nem cache.
 */
const loadBundledCatalog = (): Exercise[] => {
  const snapshot: unknown = require('../data/catalog-snapshot.json');
  return parseExternalCatalog(snapshot).exercises;
};

/**
 * Rede primeiro; se falhar (sem backend, offline, cota), usa o último catálogo
 * salvo no SQLite e, por fim, o que vem dentro do app. Assim um APK instalado
 * sozinho no celular funciona sem o backend rodando.
 */
const loadCatalog = async (): Promise<Exercise[]> => {
  try {
    const fresh = await fetchExerciseCatalog();
    if (fresh.length > 0) await writeExerciseCache(fresh);
    return fresh;
  } catch (error) {
    const cached = parseCachedCatalog(await readExerciseCache());
    if (cached.length > 0) return cached;
    const bundled = loadBundledCatalog();
    if (bundled.length > 0) return bundled;
    throw error;
  }
};

export const useExerciseCatalog = (): ScreenState<Exercise[]> => {
  const query = useQuery({
    queryKey: exerciseCatalogQueryKey,
    queryFn: loadCatalog,
    staleTime: ONE_DAY_MS,
    gcTime: Number.POSITIVE_INFINITY,
  });

  if (query.data) return { status: 'ready', data: query.data };
  if (query.error) {
    return { status: 'error', message: query.error.message, retry: () => void query.refetch() };
  }
  return { status: 'loading' };
};

export const useExercise = (exerciseId: string): ScreenState<Exercise> => {
  const catalog = useExerciseCatalog();
  return useMemo((): ScreenState<Exercise> => {
    if (catalog.status !== 'ready') return catalog;
    const exercise = catalog.data.find((item) => item.id === exerciseId);
    return exercise
      ? { status: 'ready', data: exercise }
      : { status: 'error', message: 'Exercício não encontrado no catálogo.', retry: () => undefined };
  }, [catalog, exerciseId]);
};
