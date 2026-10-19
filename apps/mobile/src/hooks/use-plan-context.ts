import type { Exercise, ScreenState, UserProfile } from '@fitpro/core-types';
import { useExerciseCatalog } from '@fitpro/feature-exercises';
import { useProfileStore } from '@fitpro/feature-onboarding';

export type PlanContext = { profile: UserProfile; catalog: Exercise[] };

/** Junta perfil (onboarding) e catálogo (exercises) para as telas do personal. */
export const usePlanContext = (): ScreenState<PlanContext> => {
  const profile = useProfileStore((state) => state.profile);
  const catalog = useExerciseCatalog();

  if (catalog.status !== 'ready') return catalog;
  if (!profile) return { status: 'error', message: 'Perfil não encontrado.', retry: () => undefined };
  return { status: 'ready', data: { profile, catalog: catalog.data } };
};
