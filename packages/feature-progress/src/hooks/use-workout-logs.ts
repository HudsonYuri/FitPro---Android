import { useQuery } from '@tanstack/react-query';
import type { ScreenState, WorkoutLog } from '@fitpro/core-types';
import { listWorkoutLogs } from '@fitpro/platform-storage';

/** Invalide esta chave depois de salvar um treino. */
export const workoutLogsQueryKey = ['workout-logs'] as const;

export const useWorkoutLogs = (): ScreenState<WorkoutLog[]> => {
  const query = useQuery({ queryKey: workoutLogsQueryKey, queryFn: listWorkoutLogs });
  if (query.data) return { status: 'ready', data: query.data };
  if (query.error) return { status: 'error', message: query.error.message, retry: () => void query.refetch() };
  return { status: 'loading' };
};
