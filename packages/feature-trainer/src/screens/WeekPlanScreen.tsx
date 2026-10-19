import { useState, type FC } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SPLIT_LABEL, type Exercise, type UserProfile, type WorkoutItem } from '@fitpro/core-types';
import { spacing } from '@fitpro/core-theme';
import { Button, Chip, Screen, Text } from '@fitpro/core-ui';
import { SessionItems } from '../components/SessionItems';
import { estimateSessionMinutes } from '../engine/plan';
import { useExerciseIndex } from '../hooks/use-exercise-index';
import { useTrainerStore } from '../hooks/use-trainer-store';
import { useWorkoutPlan } from '../hooks/use-workout-plan';

export type WeekPlanScreenProps = {
  profile: UserProfile;
  catalog: readonly Exercise[];
  onOpenItem: (item: WorkoutItem) => void;
  onSwapItem: (item: WorkoutItem) => void;
  onStartWorkout: (sessionId: string) => void;
};

export const WeekPlanScreen: FC<WeekPlanScreenProps> = ({ profile, catalog, onOpenItem, onSwapItem, onStartWorkout }) => {
  const plan = useWorkoutPlan(profile, catalog);
  const exerciseById = useExerciseIndex(catalog);
  const hasSwaps = useTrainerStore((state) => Object.keys(state.swaps).length > 0);
  const resetSwaps = useTrainerStore((state) => state.resetSwaps);
  const [selectedId, setSelectedId] = useState(plan.sessions[0]?.id);
  const session = plan.sessions.find((candidate) => candidate.id === selectedId) ?? plan.sessions[0];

  return (
    <Screen footer={session && <Button label={`Começar ${session.title}`} onPress={() => onStartWorkout(session.id)} />}>
      <Text variant="caption" tone="muted">
        Divisão {SPLIT_LABEL[plan.split]} · {profile.daysPerWeek} dias por semana
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {plan.sessions.map((candidate, index) => (
          <Chip
            key={candidate.id}
            label={`Dia ${index + 1} · ${candidate.title}`}
            selected={candidate.id === session?.id}
            onPress={() => setSelectedId(candidate.id)}
          />
        ))}
      </ScrollView>
      {session && (
        <View style={styles.session}>
          <Text tone="muted">
            {session.items.length} exercícios · cerca de {estimateSessionMinutes(session)} min
          </Text>
          <SessionItems session={session} exerciseById={exerciseById} onOpenItem={onOpenItem} onSwapItem={onSwapItem} />
        </View>
      )}
      {hasSwaps && <Button label="Desfazer minhas trocas" variant="ghost" onPress={resetSwaps} />}
    </Screen>
  );
};

const styles = StyleSheet.create({
  chips: { gap: spacing.sm },
  session: { gap: spacing.md },
});
