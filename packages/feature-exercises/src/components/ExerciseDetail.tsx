import type { FC, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { EXERCISE_EQUIPMENT_LABEL, LEVEL_LABEL, MUSCLE_LABEL, type Exercise } from '@fitpro/core-types';
import { durations, sizes, spacing } from '@fitpro/core-theme';
import { Card, Chip, ExerciseFigure, Text } from '@fitpro/core-ui';

/** Os dados vêm da ExerciseDB (que pede crédito); as animações são desenhadas pelo app. */
export const EXERCISE_DATA_CREDIT = 'Dados dos exercícios: ExerciseDB (AscendAPI). Ilustrações: FitPro.';

export const describeMovement = (exercise: Exercise): string =>
  `Bonequinho demonstrando ${exercise.name}, trabalhando ${MUSCLE_LABEL[exercise.target].toLowerCase()}.`;

export type ExerciseDetailProps = {
  exercise: Exercise;
  /** Conteúdo extra abaixo dos chips (ex.: motivo da recomendação). */
  children?: ReactNode;
};

export const ExerciseDetail: FC<ExerciseDetailProps> = ({ exercise, children }) => {
  return (
    <View style={styles.root}>
      <ExerciseFigure
        pattern={exercise.pattern}
        equipment={exercise.equipment}
        height={sizes.gifHero}
        accessibilityLabel={describeMovement(exercise)}
      />

      <View style={styles.section}>
        <Text variant="title" accessibilityRole="header">
          {exercise.name}
        </Text>
        <Text tone="muted">
          {EXERCISE_EQUIPMENT_LABEL[exercise.equipment]} · {LEVEL_LABEL[exercise.difficulty]}
        </Text>
      </View>

      <View style={styles.chips} accessibilityLabel="Músculos trabalhados">
        <Chip label={MUSCLE_LABEL[exercise.target]} selected />
        {exercise.secondary.map((muscle) => (
          <Chip key={muscle} label={MUSCLE_LABEL[muscle]} />
        ))}
      </View>

      {children}

      <Animated.View entering={FadeInDown.duration(durations.normal)}>
        <Card style={styles.section}>
          <Text variant="heading" accessibilityRole="header">
            Como executar
          </Text>
          {exercise.instructions.map((step, index) => (
            <View key={step} style={styles.step}>
              <Text variant="label" tone="primary" tabular>
                {index + 1}.
              </Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(durations.stagger * 2).duration(durations.normal)}>
        <Card style={styles.section}>
          <Text variant="heading" accessibilityRole="header">
            Erros comuns
          </Text>
          {exercise.commonMistakes.map((mistake) => (
            <View key={mistake} style={styles.step}>
              <Text tone="danger">✕</Text>
              <Text style={styles.stepText}>{mistake}</Text>
            </View>
          ))}
        </Card>
      </Animated.View>

      <Text variant="caption" tone="muted">
        {EXERCISE_DATA_CREDIT}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  section: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  step: { flexDirection: 'row', gap: spacing.sm },
  stepText: { flex: 1 },
});
