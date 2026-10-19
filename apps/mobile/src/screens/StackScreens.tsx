import type { FC } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ExerciseDetailScreen } from '@fitpro/feature-exercises';
import { OnboardingScreen, useProfileStore } from '@fitpro/feature-onboarding';
import { WorkoutSummaryScreen, workoutLogsQueryKey } from '@fitpro/feature-progress';
import { SwapExerciseScreen, useTrainerStore, useWorkoutPlan } from '@fitpro/feature-trainer';
import { WorkoutSessionScreen } from '@fitpro/feature-workout';
import { assertNever, type WorkoutLog } from '@fitpro/core-types';
import { StateView } from '@fitpro/core-ui';
import { useExerciseName } from '../hooks/use-exercise-name';
import { useWorkoutExercises } from '../hooks/use-workout-exercises';
import type { RootScreenProps } from '../navigation/types';
import type { PlanContext } from '../hooks/use-plan-context';
import { PlanGate } from './PlanGate';

export const OnboardingRoute: FC<RootScreenProps<'Onboarding'>> = ({ navigation }) => {
  return <OnboardingScreen onComplete={() => navigation.replace('Tabs', { screen: 'Hoje' })} />;
};

export const EditProfileRoute: FC<RootScreenProps<'EditProfile'>> = ({ navigation }) => {
  const profile = useProfileStore((state) => state.profile);
  const resetSwaps = useTrainerStore((state) => state.resetSwaps);
  return (
    <OnboardingScreen
      initialProfile={profile}
      onComplete={() => {
        // O plano é regerado a partir do novo perfil; trocas antigas podem não valer mais.
        resetSwaps();
        navigation.goBack();
      }}
    />
  );
};

export const ExerciseDetailRoute: FC<RootScreenProps<'ExerciseDetail'>> = ({ navigation, route }) => {
  const { exerciseId, slotId } = route.params;
  if (!slotId) return <ExerciseDetailScreen exerciseId={exerciseId} />;
  return (
    <PlanGate>
      {(context) => (
        <PlannedExerciseDetail
          {...context}
          exerciseId={exerciseId}
          slotId={slotId}
          onSwap={() => navigation.navigate('SwapExercise', { slotId, exerciseId })}
        />
      )}
    </PlanGate>
  );
};

type PlannedExerciseDetailProps = PlanContext & { exerciseId: string; slotId: string; onSwap: () => void };

/** Detalhe de um exercício do plano: mostra o motivo da escolha e permite trocar. */
const PlannedExerciseDetail: FC<PlannedExerciseDetailProps> = ({ profile, catalog, exerciseId, slotId, onSwap }) => {
  const plan = useWorkoutPlan(profile, catalog);
  const reason = plan.sessions.flatMap((session) => session.items).find((item) => item.slotId === slotId)?.reason;
  return <ExerciseDetailScreen exerciseId={exerciseId} onSwap={onSwap} {...(reason !== undefined && { reason })} />;
};

export const SwapExerciseRoute: FC<RootScreenProps<'SwapExercise'>> = ({ navigation, route }) => {
  const { slotId, exerciseId } = route.params;
  return (
    <PlanGate>
      {({ profile, catalog }) => (
        <SwapExerciseScreen
          slotId={slotId}
          currentExerciseId={exerciseId}
          profile={profile}
          catalog={catalog}
          onDone={() => navigation.popTo('Tabs', { screen: 'Hoje' })}
        />
      )}
    </PlanGate>
  );
};

export const WorkoutRoute: FC<RootScreenProps<'Workout'>> = ({ navigation, route }) => {
  const queryClient = useQueryClient();
  return (
    <PlanGate>
      {({ profile, catalog }) => (
        <WorkoutForSession
          sessionId={route.params.sessionId}
          profile={profile}
          catalog={catalog}
          onFinished={async (log) => {
            // Recarrega o histórico antes do resumo, que compara este treino com os anteriores.
            await queryClient.invalidateQueries({ queryKey: workoutLogsQueryKey });
            navigation.replace('WorkoutSummary', { workoutId: log.id });
          }}
        />
      )}
    </PlanGate>
  );
};

type WorkoutForSessionProps = Parameters<typeof useWorkoutExercises>[0] & { onFinished: (log: WorkoutLog) => void };

const WorkoutForSession: FC<WorkoutForSessionProps> = ({ onFinished, ...args }) => {
  const state = useWorkoutExercises(args);
  switch (state.status) {
    case 'loading':
      return <StateView kind="loading" message="Preparando o treino" />;
    case 'error':
      return <StateView kind="error" message={state.message} onRetry={state.retry} />;
    case 'ready':
      return (
        <WorkoutSessionScreen
          sessionId={state.data.session.id}
          sessionTitle={state.data.session.title}
          exercises={state.data.exercises}
          onFinished={(log) => void onFinished(log)}
        />
      );
    default:
      return assertNever(state);
  }
};

export const WorkoutSummaryRoute: FC<RootScreenProps<'WorkoutSummary'>> = ({ navigation, route }) => {
  const exerciseName = useExerciseName();
  return (
    <WorkoutSummaryScreen
      workoutId={route.params.workoutId}
      exerciseName={exerciseName}
      onDone={() => navigation.popTo('Tabs', { screen: 'Progresso' })}
    />
  );
};
