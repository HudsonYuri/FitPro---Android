import type { WorkoutLog } from '@fitpro/core-types';

const DAY_MS = 24 * 60 * 60 * 1000;

const dayKey = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const startOfDay = (timestamp: number): number => {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

/**
 * Dias seguidos com treino, terminando hoje ou ontem
 * (não zera a sequência só porque o treino de hoje ainda não aconteceu).
 */
export const trainingStreak = (logs: readonly WorkoutLog[], now: number): number => {
  const trainedDays = new Set(logs.map((log) => dayKey(log.finishedAt)));
  const today = startOfDay(now);
  let cursor = trainedDays.has(dayKey(today)) ? today : today - DAY_MS;
  let streak = 0;
  while (trainedDays.has(dayKey(cursor))) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
};

/** Dias da semana atual (0 = domingo) em que houve treino. */
export const trainedWeekdays = (logs: readonly WorkoutLog[], now: number): number[] => {
  const weekStart = startOfDay(now) - new Date(now).getDay() * DAY_MS;
  const weekEnd = weekStart + 7 * DAY_MS;
  const days = logs
    .filter((log) => log.finishedAt >= weekStart && log.finishedAt < weekEnd)
    .map((log) => new Date(log.finishedAt).getDay());
  return [...new Set(days)].sort((a, b) => a - b);
};

export type LoadPoint ={ finishedAt: number; maxLoadKg: number };

/** Maior carga por treino para um exercício, do mais antigo para o mais recente. */
export const loadHistory = (logs: readonly WorkoutLog[], exerciseId: string): LoadPoint[] =>
  logs
    .flatMap((log) => {
      const loads = log.sets.filter((set) => set.exerciseId === exerciseId).map((set) => set.loadKg);
      return loads.length ? [{ finishedAt: log.finishedAt, maxLoadKg: Math.max(...loads) }] : [];
    })
    .sort((a, b) => a.finishedAt - b.finishedAt);

/** Exercícios com registro, do mais treinado para o menos. */
export const trainedExerciseIds = (logs: readonly WorkoutLog[]): string[] => {
  const counts = new Map<string, number>();
  for (const set of logs.flatMap((log) => log.sets)) {
    counts.set(set.exerciseId, (counts.get(set.exerciseId) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
};

export const sessionVolumeKg = (log: WorkoutLog): number =>
  log.sets.reduce((total, set) => total + set.loadKg * set.reps, 0);
