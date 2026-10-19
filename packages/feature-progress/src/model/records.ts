import type { SetLog, WorkoutLog } from '@fitpro/core-types';

const ROUND_STEP_KG = 0.5;

const roundToHalf = (kg: number): number => Math.round(kg / ROUND_STEP_KG) * ROUND_STEP_KG;

/** 1RM estimado pela fórmula de Epley: carga × (1 + reps / 30). */
export const estimateOneRepMax = (loadKg: number, reps: number): number => {
  if (loadKg <= 0 || reps <= 0) return 0;
  return reps === 1 ? loadKg : roundToHalf(loadKg * (1 + reps / 30));
};

const bestSet = (sets: readonly SetLog[]): { set: SetLog; oneRepMaxKg: number } | undefined =>
  sets.reduce<{ set: SetLog; oneRepMaxKg: number } | undefined>((best, set) => {
    const oneRepMaxKg = estimateOneRepMax(set.loadKg, set.reps);
    return !best || oneRepMaxKg > best.oneRepMaxKg ? { set, oneRepMaxKg } : best;
  }, undefined);

export const bestOneRepMax = (logs: readonly WorkoutLog[], exerciseId: string): number | undefined =>
  bestSet(logs.flatMap((log) => log.sets.filter((set) => set.exerciseId === exerciseId)))?.oneRepMaxKg;

export type PersonalRecord = {
  exerciseId: string;
  oneRepMaxKg: number;
  previousBestKg: number;
  loadKg: number;
  reps: number;
};

/**
 * Recordes do treino: exercícios em que o melhor 1RM estimado superou o histórico.
 * A primeira vez num exercício não conta como recorde (não há o que superar).
 */
export const personalRecords = (log: WorkoutLog, previousLogs: readonly WorkoutLog[]): PersonalRecord[] => {
  const exerciseIds = [...new Set(log.sets.map((set) => set.exerciseId))];
  return exerciseIds.flatMap((exerciseId) => {
    const best = bestSet(log.sets.filter((set) => set.exerciseId === exerciseId));
    const previousBestKg = bestOneRepMax(previousLogs, exerciseId);
    if (!best || previousBestKg === undefined || best.oneRepMaxKg <= previousBestKg || best.oneRepMaxKg === 0) return [];
    return [{ exerciseId, oneRepMaxKg: best.oneRepMaxKg, previousBestKg, loadKg: best.set.loadKg, reps: best.set.reps }];
  });
};
