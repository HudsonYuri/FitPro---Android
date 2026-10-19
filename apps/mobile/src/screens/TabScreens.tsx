import { useCallback, useMemo, type FC } from 'react';
import type { WorkoutItem } from '@fitpro/core-types';
import { ExerciseCatalogScreen } from '@fitpro/feature-exercises';
import { DISCLAIMER, ProfileScreen, useProfileStore } from '@fitpro/feature-onboarding';
import { ProgressScreen, trainedWeekdays, useWorkoutLogs } from '@fitpro/feature-progress';
import { TodayScreen, WeekPlanScreen } from '@fitpro/feature-trainer';
import { RestAlertsToggle, ResumeWorkoutCard } from '@fitpro/feature-workout';
import { StateView } from '@fitpro/core-ui';
import { useExerciseName } from '../hooks/use-exercise-name';
import type { TabScreenProps } from '../navigation/types';
import { PlanGate } from './PlanGate';

const usePlanItemActions = (navigation: TabScreenProps<'Hoje' | 'Treinos'>['navigation']) => ({
  onOpenItem: useCallback(
    (item: WorkoutItem) =>
      navigation.navigate('ExerciseDetail', { exerciseId: item.prescription.exerciseId, slotId: item.slotId }),
    [navigation],
  ),
  onSwapItem: useCallback(
    (item: WorkoutItem) =>
      navigation.navigate('SwapExercise', { slotId: item.slotId, exerciseId: item.prescription.exerciseId }),
    [navigation],
  ),
  onStartWorkout: useCallback((sessionId: string) => navigation.navigate('Workout', { sessionId }), [navigation]),
});

export const TodayTab: FC<TabScreenProps<'Hoje'>> = ({ navigation }) => {
  const actions = usePlanItemActions(navigation);
  const logs = useWorkoutLogs();
  const completedWorkouts = logs.status === 'ready' ? logs.data.length : 0;
  const weekdays = useMemo(() => (logs.status === 'ready' ? trainedWeekdays(logs.data, Date.now()) : []), [logs]);
  return (
    <PlanGate>
      {({ profile, catalog }) => (
        <TodayScreen
          profile={profile}
          catalog={catalog}
          completedWorkouts={completedWorkouts}
          trainedWeekdays={weekdays}
          header={<ResumeWorkoutCard onResume={actions.onStartWorkout} />}
          disclaimer={DISCLAIMER}
          {...actions}
        />
      )}
    </PlanGate>
  );
};

export const PlanTab: FC<TabScreenProps<'Treinos'>> = ({ navigation }) => {
  const actions = usePlanItemActions(navigation);
  return <PlanGate>{({ profile, catalog }) => <WeekPlanScreen profile={profile} catalog={catalog} {...actions} />}</PlanGate>;
};

export const ExercisesTab: FC<TabScreenProps<'Exercicios'>> = ({ navigation }) => {
  const openExercise = useCallback(
    (exerciseId: string) => navigation.navigate('ExerciseDetail', { exerciseId }),
    [navigation],
  );
  return <ExerciseCatalogScreen onOpenExercise={openExercise} />;
};

export const ProgressTab: FC<TabScreenProps<'Progresso'>> = () => {
  const exerciseName = useExerciseName();
  return <ProgressScreen exerciseName={exerciseName} />;
};

export const ProfileTab: FC<TabScreenProps<'Perfil'>> = ({ navigation }) => {
  const profile = useProfileStore((state) => state.profile);
  if (!profile) return <StateView kind="loading" />;
  return (
    <ProfileScreen
      profile={profile}
      onEdit={() => navigation.navigate('EditProfile')}
      settings={<RestAlertsToggle />}
    />
  );
};
