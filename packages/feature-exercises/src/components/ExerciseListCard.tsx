import { memo, type FC } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { EXERCISE_EQUIPMENT_LABEL, MUSCLE_LABEL, type Exercise } from '@fitpro/core-types';
import { durations, radii, sizes, spacing, useTheme } from '@fitpro/core-theme';
import { Card, ExerciseFigure, Text } from '@fitpro/core-ui';

const MAX_STAGGERED_ITEMS = 8;

export type ExerciseListCardProps = {
  exercise: Exercise;
  index: number;
  /** Linha de detalhe opcional (ex.: "4 × 6–12"). Padrão: músculo · equipamento. */
  subtitle?: string;
  onPress: (exerciseId: string) => void;
};

const ExerciseListCardBase: FC<ExerciseListCardProps> = ({ exercise, index, subtitle, onPress }) => {
  const { colors } = useTheme();
  const detail = subtitle ?? `${MUSCLE_LABEL[exercise.target]} · ${EXERCISE_EQUIPMENT_LABEL[exercise.equipment]}`;
  const delay = Math.min(index, MAX_STAGGERED_ITEMS) * durations.stagger;

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(durations.normal)} exiting={FadeOut.duration(durations.fast)}>
      <Card
        onPress={() => onPress(exercise.id)}
        accessibilityLabel={`${exercise.name}. ${detail}`}
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
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {detail}
            </Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
};

export const ExerciseListCard = memo(ExerciseListCardBase);

const styles = StyleSheet.create({
  card: { padding: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  thumbnail: { width: sizes.thumbnail, height: sizes.thumbnail, borderRadius: radii.md, overflow: 'hidden' },
  text: { flex: 1, gap: spacing.xs },
});
