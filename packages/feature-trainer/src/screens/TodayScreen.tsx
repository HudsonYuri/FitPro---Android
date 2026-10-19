import type { FC, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  GOAL_LABEL,
  MUSCLE_LABEL,
  SPLIT_LABEL,
  type Exercise,
  type UserProfile,
  type WorkoutItem,
} from '@fitpro/core-types';
import { spacing } from '@fitpro/core-theme';
import { Button, Card, Chip, Notice, Screen, StateView, Text } from '@fitpro/core-ui';
import { SessionItems } from '../components/SessionItems';
import { WeekStrip } from '../components/WeekStrip';
import { estimateSessionMinutes } from '../engine/plan';
import { nextSession } from '../engine/swaps';
import { useExerciseIndex } from '../hooks/use-exercise-index';
import { useWorkoutPlan } from '../hooks/use-workout-plan';

export type TodayScreenProps = {
  profile: UserProfile;
  catalog: readonly Exercise[];
  completedWorkouts: number;
  /** Dias (0 = domingo) da semana atual com treino concluído. */
  trainedWeekdays: readonly number[];
  disclaimer: string;
  /** Conteúdo de outras features no topo (ex.: retomar treino interrompido). */
  header?: ReactNode;
  onOpenItem: (item: WorkoutItem) => void;
  onSwapItem: (item: WorkoutItem) => void;
  onStartWorkout: (sessionId: string) => void;
};

export const TodayScreen: FC<TodayScreenProps> = ({
  profile,
  catalog,
  completedWorkouts,
  trainedWeekdays,
  disclaimer,
  header,
  onOpenItem,
  onSwapItem,
  onStartWorkout,
}) => {
  const plan = useWorkoutPlan(profile, catalog);
  const exerciseById = useExerciseIndex(catalog);
  const session = nextSession(plan, completedWorkouts);

  if (!session || session.items.length === 0) {
    return (
      <StateView
        kind="empty"
        title="Sem exercícios compatíveis"
        message="Não encontramos exercícios para seu equipamento e nível. Revise o perfil."
      />
    );
  }

  const muscles = [...new Set(session.items.map((item) => item.target))];

  return (
    <Screen footer={<Button label="Começar treino" onPress={() => onStartWorkout(session.id)} />}>
      {profile.needsMedicalClearance && (
        <Notice
          tone="danger"
          title="Liberação médica recomendada"
          message="Seu questionário indicou risco. Procure um médico antes de começar."
        />
      )}
      {header}
      <Card>
        <WeekStrip trainedDays={trainedWeekdays} today={new Date().getDay()} goalPerWeek={profile.daysPerWeek} />
      </Card>
      <Card style={styles.hero}>
        <Text variant="caption" tone="primary">
          {SPLIT_LABEL[plan.split].toUpperCase()} · {GOAL_LABEL[profile.goal].toUpperCase()}
        </Text>
        <Text variant="display" accessibilityRole="header">
          {session.title}
        </Text>
        <Text tone="muted" tabular>
          {session.items.length} exercícios · cerca de {estimateSessionMinutes(session)} min
        </Text>
        <View style={styles.chips}>
          {muscles.map((muscle) => (
            <Chip key={muscle} label={MUSCLE_LABEL[muscle]} />
          ))}
        </View>
      </Card>
      <SessionItems session={session} exerciseById={exerciseById} onOpenItem={onOpenItem} onSwapItem={onSwapItem} />
      <Text variant="caption" tone="muted">
        {disclaimer}
      </Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
