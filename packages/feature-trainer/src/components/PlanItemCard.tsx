import { memo, type FC } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import type { Exercise, WorkoutItem } from '@fitpro/core-types';
import { durations, radii, sizes, spacing, useTheme } from '@fitpro/core-theme';
import { Button, Card, ExerciseFigure, Text } from '@fitpro/core-ui';

export const formatPrescription = (item: WorkoutItem): string => {
  const [min, max] = item.prescription.repsRange;
  return `${item.prescription.sets} × ${min}–${max} reps · descanso ${item.prescription.restSeconds}s`;
};

export type PlanItemCardProps = {
  item: WorkoutItem;
  exercise: Exercise;
  index: number;
  onOpen: (item: WorkoutItem) => void;
  onSwap: (item: WorkoutItem) => void;
};

const PlanItemCardBase: FC<PlanItemCardProps> = ({ item, exercise, index, onOpen, onSwap }) => {
  const { colors } = useTheme();
  const prescription = formatPrescription(item);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * durations.stagger).duration(durations.normal)}
      exiting={FadeOut.duration(durations.fast)}
      layout={LinearTransition.duration(durations.normal)}
    >
      <Card
        onPress={() => onOpen(item)}
        accessibilityLabel={`${exercise.name}. ${prescription}. ${item.reason}`}
        accessibilityHint="Abre o detalhe com a demonstração"
        style={styles.card}
      >
        <View style={styles.row}>
          <View style={styles.thumbnail}>
            <ExerciseFigure
              pattern={exercise.pattern}
              equipment={exercise.equipment}
              height={sizes.thumbnail}
              animated={false}
              accessibilityLabel={`Ilustração: ${exercise.name}`}
            />
          </View>
          <View style={styles.text}>
            <Text variant="label" numberOfLines={2}>
              {exercise.name}
            </Text>
            <Text variant="caption" tone="muted" tabular>
              {prescription}
            </Text>
          </View>
        </View>
        <Text variant="caption" tone="muted">
          {item.reason}
        </Text>
        <Button label="Trocar exercício" variant="ghost" onPress={() => onSwap(item)} />
      </Card>
    </Animated.View>
  );
};

export const PlanItemCard = memo(PlanItemCardBase);

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  thumbnail: { width: sizes.thumbnail, height: sizes.thumbnail, borderRadius: radii.md, overflow: 'hidden' },
  text: { flex: 1, gap: spacing.xs },
});
