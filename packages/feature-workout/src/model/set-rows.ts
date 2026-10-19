import type { SetLog } from '@fitpro/core-types';
import type { SetRow, WorkoutDraft, WorkoutExercise } from './types';

const DEFAULT_LOAD_KG = 10;

/** Aquecimento primeiro; depois as séries válidas com a carga sugerida (ou a do treino anterior). */
export const initialRows = (item: WorkoutExercise): SetRow[] => [
  ...item.warmup.map((set): SetRow => ({ kind: 'aquecimento', loadKg: set.loadKg, reps: set.reps, done: false })),
  ...Array.from({ length: item.prescription.sets }, (_, index): SetRow => ({
    kind: 'valida',
    loadKg: item.suggestedLoadKg ?? item.previousSets[index]?.loadKg ?? DEFAULT_LOAD_KG,
    reps: item.prescription.repsRange[1],
    done: false,
  })),
];

export const appendRow = (rows: readonly SetRow[]): SetRow[] => {
  const last = rows.at(-1);
  return [...rows, { kind: 'valida', loadKg: last?.loadKg ?? DEFAULT_LOAD_KG, reps: last?.reps ?? 0, done: false }];
};

const workingRows = (rowsByExercise: readonly (readonly SetRow[])[]): SetRow[] =>
  rowsByExercise.flat().filter((row) => row.kind === 'valida');

export const countDone = (rowsByExercise: readonly (readonly SetRow[])[]): number =>
  workingRows(rowsByExercise).filter((row) => row.done).length;

export const countWorking = (rowsByExercise: readonly (readonly SetRow[])[]): number =>
  workingRows(rowsByExercise).length;

export const volumeKg = (rowsByExercise: readonly (readonly SetRow[])[]): number =>
  workingRows(rowsByExercise).reduce((total, row) => (row.done ? total + row.loadKg * row.reps : total), 0);

/** Só séries válidas marcadas como feitas viram registro. */
export const toSetLogs = (exercises: readonly WorkoutExercise[], rowsByExercise: readonly (readonly SetRow[])[]): SetLog[] =>
  exercises.flatMap((item, exerciseIndex) =>
    (rowsByExercise[exerciseIndex] ?? [])
      .filter((row) => row.kind === 'valida' && row.done)
      .map((row, setIndex) => ({ exerciseId: item.exercise.id, setIndex, loadKg: row.loadKg, reps: row.reps })),
  );

/**
 * Retoma o rascunho só se for a mesma sessão com os mesmos exercícios;
 * se o plano mudou (troca de exercício, perfil novo), começa do zero.
 */
export const restoreDraft = (
  draft: WorkoutDraft | undefined,
  sessionId: string,
  exercises: readonly WorkoutExercise[],
): WorkoutDraft | undefined => {
  if (!draft || draft.sessionId !== sessionId) return undefined;
  const sameExercises =
    draft.exerciseIds.length === exercises.length &&
    exercises.every((item, index) => draft.exerciseIds[index] === item.exercise.id);
  return sameExercises ? draft : undefined;
};

/** Aceita "62,5" e "62.5"; entrada inválida mantém o valor anterior. */
export const parseDecimal = (text: string, fallback: number): number => {
  const value = Number(text.replace(',', '.'));
  return Number.isFinite(value) && value >= 0 ? value : fallback;
};
