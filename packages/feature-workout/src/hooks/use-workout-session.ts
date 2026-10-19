import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import type { WorkoutLog } from '@fitpro/core-types';
import { saveWorkoutLog } from '@fitpro/platform-storage';
import { appendRow, countDone, countWorking, initialRows, restoreDraft, toSetLogs, volumeKg } from '../model/set-rows';
import type { SetRow, WorkoutExercise } from '../model/types';
import { ensureRestNotificationPermission } from '../notifications/rest-notification';
import { useRestTimer } from './use-rest-timer';
import { useWorkoutDraft } from './use-workout-draft';
import { useWorkoutPreferences } from './use-workout-preferences';

const CLOCK_TICK_MS = 1000;

const newWorkoutId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const useElapsedSeconds = (startedAt: number): number => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
    return () => clearInterval(interval);
  }, []);
  return Math.max(0, Math.floor((now - startedAt) / 1000));
};

export type UseWorkoutSessionArgs = {
  sessionId: string;
  sessionTitle: string;
  exercises: readonly WorkoutExercise[];
  onFinished: (log: WorkoutLog) => void;
};

export const useWorkoutSession = ({ sessionId, sessionTitle, exercises, onFinished }: UseWorkoutSessionArgs) => {
  const saveDraft = useWorkoutDraft((state) => state.saveDraft);
  const clearDraft = useWorkoutDraft((state) => state.clearDraft);
  const [resumed] = useState(() => restoreDraft(useWorkoutDraft.getState().draft, sessionId, exercises));
  const startedAt = useRef(resumed?.startedAt ?? Date.now()).current;
  const elapsedSeconds = useElapsedSeconds(startedAt);
  const restAlerts = useWorkoutPreferences((state) => state.restAlerts);
  const [canNotify, setCanNotify] = useState(false);
  const restTimer = useRestTimer({ notify: restAlerts && canNotify });
  const [exerciseIndex, setExerciseIndex] = useState(resumed?.exerciseIndex ?? 0);
  const [rowsByExercise, setRowsByExercise] = useState<SetRow[][]>(
    () => resumed?.rows.map((rows) => [...rows]) ?? exercises.map(initialRows),
  );
  const [isSaving, setIsSaving] = useState(false);
  const isFinished = useRef(false);

  useEffect(() => {
    if (!restAlerts) return;
    ensureRestNotificationPermission()
      .then(setCanNotify)
      .catch(() => setCanNotify(false));
  }, [restAlerts]);

  // Salva o progresso a cada mudança; um treino finalizado não volta a virar rascunho.
  useEffect(() => {
    if (isFinished.current) return;
    saveDraft({
      sessionId,
      sessionTitle,
      startedAt,
      exerciseIndex,
      exerciseIds: exercises.map((item) => item.exercise.id),
      rows: rowsByExercise,
    });
  }, [rowsByExercise, exerciseIndex, sessionId, sessionTitle, startedAt, exercises, saveDraft]);

  const current = exercises[exerciseIndex];
  const currentRows = rowsByExercise[exerciseIndex] ?? [];

  const updateCurrentRows = (change: (rows: SetRow[]) => SetRow[]): void =>
    setRowsByExercise((all) => all.map((rows, index) => (index === exerciseIndex ? change(rows) : rows)));

  const updateRow = (rowIndex: number, patch: Partial<Pick<SetRow, 'loadKg' | 'reps'>>): void =>
    updateCurrentRows((rows) => rows.map((row, index) => (index === rowIndex ? { ...row, ...patch } : row)));

  const toggleRow = (rowIndex: number): void => {
    const row = currentRows[rowIndex];
    if (!row || !current) return;
    const nowDone = !row.done;
    updateCurrentRows((rows) => rows.map((item, index) => (index === rowIndex ? { ...item, done: nowDone } : item)));
    if (!nowDone) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Aquecimento não pede descanso completo: segue direto para a próxima.
    if (restAlerts && row.kind === 'valida') restTimer.start(current.prescription.restSeconds, current.exercise.name);
  };

  const addSet = (): void => updateCurrentRows(appendRow);

  const markAllDone = (): void => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateCurrentRows((rows) => rows.map((row) => ({ ...row, done: true })));
  };

  const finish = async (): Promise<void> => {
    setIsSaving(true);
    const log: WorkoutLog = {
      id: newWorkoutId(),
      sessionId,
      sessionTitle,
      startedAt,
      finishedAt: Date.now(),
      sets: toSetLogs(exercises, rowsByExercise),
    };
    try {
      await saveWorkoutLog(log);
      isFinished.current = true;
      restTimer.skip();
      clearDraft();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onFinished(log);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    current,
    currentRows,
    exerciseIndex,
    totalExercises: exercises.length,
    wasResumed: resumed !== undefined,
    isExerciseDone: (index: number) => (rowsByExercise[index] ?? []).every((row) => row.done),
    isLastExercise: exerciseIndex >= exercises.length - 1,
    goToExercise: (index: number) => {
      if (exercises[index]) setExerciseIndex(index);
    },
    updateRow,
    toggleRow,
    addSet,
    markAllDone,
    stats: {
      elapsedSeconds,
      doneSets: countDone(rowsByExercise),
      totalSets: countWorking(rowsByExercise),
      volumeKg: volumeKg(rowsByExercise),
    },
    restTimer,
    finish,
    isSaving,
  };
};
