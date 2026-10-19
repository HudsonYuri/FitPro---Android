import { useMemo, type FC } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { EXERCISE_EQUIPMENT_LABEL, type Exercise, type UserProfile } from '@fitpro/core-types';
import { durations, sizes, spacing } from '@fitpro/core-theme';
import { ExerciseFigure, Card, Screen, StateView, Text } from '@fitpro/core-ui';
import { suggestAlternatives } from '../engine/selection';
import { useExerciseIndex } from '../hooks/use-exercise-index';
import { useTrainerStore } from '../hooks/use-trainer-store';

export type SwapExerciseScreenProps = {
  slotId: string;
  currentExerciseId: string;
  profile: UserProfile;
  catalog: readonly Exercise[];
  onDone: () => void;
};

export const SwapExerciseScreen: FC<SwapExerciseScreenProps> = ({ slotId, currentExerciseId, profile, catalog, onDone }) => {
  const swapExercise = useTrainerStore((state) => state.swapExercise);
  const current = useExerciseIndex(catalog).get(currentExerciseId);
  const alternatives = useMemo(
    () => (current ? suggestAlternatives(current, catalog, profile) : []),
    [current, catalog, profile],
  );

  if (!current || alternatives.length === 0) {
    return (
      <StateView
        kind="empty"
        title="Sem alternativas"
        message="Não há outro exercício seguro para este músculo com seu equipamento."
      />
    );
  }

  const choose = (exerciseId: string): void => {
    swapExercise(slotId, exerciseId);
    void Haptics.selectionAsync();
    onDone();
  };

  return (
    <Screen>
      <Text tone="muted">Alternativas para {current.name}:</Text>
      {alternatives.map(({ exercise, reason }, index) => (
        <Animated.View key={exercise.id} entering={FadeInDown.delay(index * durations.stagger).duration(durations.normal)}>
          <Card
            onPress={() => choose(exercise.id)}
            accessibilityLabel={`Trocar por ${exercise.name}. ${reason}`}
            style={styles.card}
          >
            <ExerciseFigure
              pattern={exercise.pattern}
              equipment={exercise.equipment}
              height={sizes.gifCompact}
              accessibilityLabel={`Bonequinho demonstrando ${exercise.name}`}
            />
            <View style={styles.text}>
              <Text variant="label">{exercise.name}</Text>
              <Text variant="caption" tone="muted">
                {EXERCISE_EQUIPMENT_LABEL[exercise.equipment]}
              </Text>
              <Text variant="caption">{reason}</Text>
            </View>
          </Card>
        </Animated.View>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  text: { gap: spacing.xs },
});
