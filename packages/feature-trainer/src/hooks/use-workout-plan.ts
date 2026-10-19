import { useMemo } from 'react';
import type { Exercise, UserProfile, WorkoutPlan } from '@fitpro/core-types';
import { buildPlan } from '../engine/plan';
import { applySwaps } from '../engine/swaps';
import { useTrainerStore } from './use-trainer-store';

/** Plano da semana gerado a partir do perfil, com as trocas do usuário aplicadas. */
export const useWorkoutPlan = (profile: UserProfile, catalog: readonly Exercise[]): WorkoutPlan => {
  const swaps = useTrainerStore((state) => state.swaps);
  const basePlan = useMemo(() => buildPlan(profile, catalog), [profile, catalog]);
  return useMemo(() => applySwaps(basePlan, swaps), [basePlan, swaps]);
};
