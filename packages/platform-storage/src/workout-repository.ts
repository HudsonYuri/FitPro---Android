import type { SetLog, WorkoutLog } from '@fitpro/core-types';
import { getDatabase } from './database';

type WorkoutRow = {
  id: string;
  session_id: string;
  session_title: string;
  started_at: number;
  finished_at: number;
};

type SetRow = {
  workout_id: string;
  exercise_id: string;
  set_index: number;
  load_kg: number;
  reps: number;
};

const groupBy = <T>(rows: readonly T[], keyOf: (row: T) => string): Map<string, T[]> => {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const key = keyOf(row);
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  return groups;
};

const toSetLog = (row: SetRow): SetLog => ({
  exerciseId: row.exercise_id,
  setIndex: row.set_index,
  loadKg: row.load_kg,
  reps: row.reps,
});

export const saveWorkoutLog = async (log: WorkoutLog): Promise<void> => {
  const db = getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO workout_logs (id, session_id, session_title, started_at, finished_at) VALUES (?, ?, ?, ?, ?)',
      log.id,
      log.sessionId,
      log.sessionTitle,
      log.startedAt,
      log.finishedAt,
    );
    for (const set of log.sets) {
      await db.runAsync(
        'INSERT INTO set_logs (workout_id, exercise_id, set_index, load_kg, reps) VALUES (?, ?, ?, ?, ?)',
        log.id,
        set.exerciseId,
        set.setIndex,
        set.loadKg,
        set.reps,
      );
    }
  });
};

/** Todos os treinos registrados, do mais recente para o mais antigo. */
export const listWorkoutLogs = async (): Promise<WorkoutLog[]> => {
  const db = getDatabase();
  const [workouts, sets] = await Promise.all([
    db.getAllAsync<WorkoutRow>('SELECT * FROM workout_logs ORDER BY finished_at DESC'),
    db.getAllAsync<SetRow>('SELECT * FROM set_logs ORDER BY set_index ASC'),
  ]);
  const setsByWorkout = groupBy(sets, (row) => row.workout_id);
  return workouts.map((row) => ({
    id: row.id,
    sessionId: row.session_id,
    sessionTitle: row.session_title,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    sets: (setsByWorkout.get(row.id) ?? []).map(toSetLog),
  }));
};

export type ExerciseSession = { finishedAt: number; sets: SetLog[] };

/** Histórico de um exercício agrupado por treino, do mais recente para o mais antigo. */
export const listExerciseHistory = async (exerciseId: string): Promise<ExerciseSession[]> => {
  const rows = await getDatabase().getAllAsync<SetRow & { finished_at: number }>(
    `SELECT s.*, w.finished_at FROM set_logs s
     JOIN workout_logs w ON w.id = s.workout_id
     WHERE s.exercise_id = ?
     ORDER BY w.finished_at DESC, s.set_index ASC`,
    exerciseId,
  );
  const byWorkout = groupBy(rows, (row) => row.workout_id);
  return [...byWorkout.values()].flatMap((group) => {
    const [first] = group;
    return first ? [{ finishedAt: first.finished_at, sets: group.map(toSetLog) }] : [];
  });
};
