import type { Exercise, Prescription } from '@fitpro/core-types';

export type PerformedSet = { loadKg: number; reps: number };

/** Uma sessão passada do exercício. O histórico é ordenado do mais recente para o mais antigo. */
export type ExercisePerformance = { finishedAt: number; sets: readonly PerformedSet[] };

export type ProgressionSuggestion =
  | { kind: 'sem_historico'; message: string }
  | { kind: 'aumentar'; fromKg: number; toKg: number; percent: number; message: string }
  | { kind: 'manter'; message: string }
  | { kind: 'reduzir'; fromKg: number; toKg: number; message: string };

const SESSIONS_TO_PROGRESS = 2;
const FAILURES_TO_REDUCE = 3;
const SMALL_INCREMENT = 0.025;
const LARGE_INCREMENT = 0.05;
const DELOAD = 0.1;
const PLATE_STEP_KG = 0.5;
const LOWER_BODY = new Set<Exercise['target']>(['quadriceps', 'posterior', 'gluteos']);

export const formatKg = (kg: number): string => `${kg.toLocaleString('pt-BR')} kg`;

const roundToPlate =(kg: number): number => Math.round(kg / PLATE_STEP_KG) * PLATE_STEP_KG;

const workingLoad = (performance: ExercisePerformance): number =>
  Math.max(0, ...performance.sets.map((set) => set.loadKg));

const hitTopOfRange = (performance: ExercisePerformance, prescription: Prescription): boolean =>
  performance.sets.length >= prescription.sets && performance.sets.every((set) => set.reps >= prescription.repsRange[1]);

const failedRange = (performance: ExercisePerformance, prescription: Prescription): boolean =>
  performance.sets.length < prescription.sets || performance.sets.some((set) => set.reps < prescription.repsRange[0]);

const countLeading = <T>(items: readonly T[], predicate: (item: T) => boolean): number => {
  const firstMiss = items.findIndex((item) => !predicate(item));
  return firstMiss === -1 ? items.length : firstMiss;
};

/** Incremento de 5% para compostos e membros inferiores; 2,5% para o resto. */
export const incrementFor = (exercise: Exercise): number =>
  exercise.mechanics === 'composto' || LOWER_BODY.has(exercise.target) ? LARGE_INCREMENT : SMALL_INCREMENT;

export type SuggestProgressionArgs = {
  exercise: Exercise;
  prescription: Prescription;
  history: readonly ExercisePerformance[];
};

export const suggestProgression = ({ exercise, prescription, history }: SuggestProgressionArgs): ProgressionSuggestion => {
  const [latest] = history;
  if (!latest) {
    return { kind: 'sem_historico', message: 'Primeira vez: escolha uma carga em que sobrem 2–3 repetições.' };
  }

  const currentKg = workingLoad(latest);
  const sessionsAtTop = countLeading(history, (performance) => hitTopOfRange(performance, prescription));
  const sessionsFailed = countLeading(history, (performance) => failedRange(performance, prescription));

  if (sessionsAtTop >= SESSIONS_TO_PROGRESS) {
    if (currentKg === 0) {
      return { kind: 'manter', message: 'Você domina a faixa com o peso do corpo: tente uma variação mais difícil.' };
    }
    const percent = incrementFor(exercise);
    const toKg = Math.max(roundToPlate(currentKg * (1 + percent)), currentKg + PLATE_STEP_KG);
    return {
      kind: 'aumentar',
      fromKg: currentKg,
      toKg,
      percent,
      message: `Topo da faixa em ${SESSIONS_TO_PROGRESS} sessões seguidas: suba para ${formatKg(toKg)}.`,
    };
  }

  if (sessionsFailed >= FAILURES_TO_REDUCE && currentKg > 0) {
    const toKg = roundToPlate(currentKg * (1 - DELOAD));
    return {
      kind: 'reduzir',
      fromKg: currentKg,
      toKg,
      message: `Abaixo da faixa em ${sessionsFailed} sessões seguidas: reduza para ${formatKg(toKg)} e reconstrua.`,
    };
  }

  if (sessionsFailed >= SESSIONS_TO_PROGRESS) {
    return { kind: 'manter', message: 'Mantenha a carga e foque na técnica até completar a faixa.' };
  }

  return { kind: 'manter', message: `Mantenha ${formatKg(currentKg)} e busque o topo da faixa em todas as séries.` };
};
