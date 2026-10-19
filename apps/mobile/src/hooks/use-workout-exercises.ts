import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { assertNever, type Exercise, type ScreenState, type UserProfile, type WorkoutSession } from '@fitpro/core-types';
import { suggestProgression, useWorkoutPlan, warmupSets, type ProgressionSuggestion } from '@fitpro/feature-trainer';
import type { WorkoutExercise } from '@fitpro/feature-workout';
import { listExerciseHistory, type ExerciseSession } from '@fitpro/platform-storage';

const loadFromSuggestion = (suggestion: ProgressionSuggestion, history: readonly ExerciseSession[]): number | undefined => {
  switch (suggestion.kind) {
    case 'aumentar':
    case 'reduzir':
      return suggestion.toKg;
    case 'manter':
      return history[0] ? Math.max(...history[0].sets.map((set) => set.loadKg)) : undefined;
    case 'sem_historico':
      return undefined;
    default:
      return assertNever(suggestion);
  }
};

type UseWorkoutExercisesArgs = { sessionId: string; profile: UserProfile; catalog: readonly Exercise[] };

/** Junta a sessão do plano (trainer) com o histórico (storage) para sugerir a carga de cada exercício. */
export const useWorkoutExercises = ({
  sessionId,
  profile,
  catalog,
}: UseWorkoutExercisesArgs): ScreenState<{ session: WorkoutSession; exercises: WorkoutExercise[] }> => {
  const plan = useWorkoutPlan(profile, catalog);
  const session = plan.sessions.find((candidate) => candidate.id === sessionId);
  const exerciseIds = session?.items.map((item) => item.prescription.exerciseId) ?? [];

  const histories = useQuery({
    queryKey: ['exercise-history', ...exerciseIds],
    queryFn: () => Promise.all(exerciseIds.map(listExerciseHistory)),
    enabled: session !== undefined,
  });

  return useMemo(() => {
    if (!session) return { status: 'error', message: 'Sessão não encontrada no plano.', retry: () => undefined };
    if (histories.error) {
      return { status: 'error', message: histories.error.message, retry: () => void histories.refetch() };
    }
    if (!histories.data) return { status: 'loading' };

    const exercises = session.items.flatMap((item, index): WorkoutExercise[] => {
      const exercise = catalog.find((candidate) => candidate.id === item.prescription.exerciseId);
      if (!exercise) return [];
      const history = histories.data[index] ?? [];
      const suggestion = suggestProgression({ exercise, prescription: item.prescription, history });
      const suggestedLoadKg = loadFromSuggestion(suggestion, history);
      return [
        {
          exercise,
          prescription: item.prescription,
          progressionMessage: suggestion.message,
          suggestedLoadKg,
          warmup: warmupSets({ exercise, role: item.role, workingLoadKg: suggestedLoadKg }),
          previousSets: history[0]?.sets.map(({ loadKg, reps }) => ({ loadKg, reps })) ?? [],
        },
      ];
    });
    return { status: 'ready', data: { session, exercises } };
  }, [session, histories, catalog]);
};
