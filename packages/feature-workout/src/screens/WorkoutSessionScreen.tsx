import type { FC } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { MUSCLE_LABEL, type WorkoutLog } from '@fitpro/core-types';
import { sizes, spacing } from '@fitpro/core-theme';
import { Button, Card, Chip, ExerciseFigure, Notice, Screen, StateView, Text } from '@fitpro/core-ui';
import { RestTimerCard } from '../components/RestTimerCard';
import { SetTable } from '../components/SetTable';
import { WorkoutStatsBar } from '../components/WorkoutStatsBar';
import { useWorkoutSession } from '../hooks/use-workout-session';
import type { WorkoutExercise } from '../model/types';

export type WorkoutSessionScreenProps = {
  sessionId: string;
  sessionTitle: string;
  exercises: readonly WorkoutExercise[];
  onFinished: (log: WorkoutLog) => void;
};

export const WorkoutSessionScreen: FC<WorkoutSessionScreenProps> = ({ sessionId, sessionTitle, exercises, onFinished }) => {
  useKeepAwake();
  const session = useWorkoutSession({ sessionId, sessionTitle, exercises, onFinished });
  const { current, restTimer } = session;

  if (!current) {
    return <StateView kind="empty" title="Treino vazio" message="Não há exercícios nesta sessão." />;
  }

  const { exercise, prescription } = current;
  const [minReps, maxReps] = prescription.repsRange;
  const showNext = session.isExerciseDone(session.exerciseIndex) && !session.isLastExercise;

  return (
    <Screen
      footer={
        <>
          {restTimer.state.status === 'resting' && (
            <RestTimerCard
              remainingSeconds={restTimer.remainingSeconds}
              totalSeconds={restTimer.state.totalSeconds}
              onSkip={restTimer.skip}
            />
          )}
          {showNext && (
            <Button
              label="Próximo exercício"
              variant="secondary"
              onPress={() => session.goToExercise(session.exerciseIndex + 1)}
            />
          )}
          <Button
            label="Finalizar treino"
            onPress={() => void session.finish()}
            loading={session.isSaving}
            disabled={session.stats.doneSets === 0}
            accessibilityHint="Salva as séries marcadas como feitas"
          />
        </>
      }
    >
      <WorkoutStatsBar {...session.stats} />

      {session.wasResumed && (
        <Notice title="Treino retomado" message="Continuamos de onde você parou, com as séries já marcadas." />
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pager}>
        {exercises.map((item, index) => (
          <Chip
            key={item.exercise.id}
            label={`${session.isExerciseDone(index) ? '✓ ' : ''}${index + 1}. ${item.exercise.name}`}
            selected={index === session.exerciseIndex}
            onPress={() => session.goToExercise(index)}
          />
        ))}
      </ScrollView>

      <Card style={styles.exercise}>
        <ExerciseFigure
          pattern={exercise.pattern}
          equipment={exercise.equipment}
          height={sizes.gifCompact}
          accessibilityLabel={`Bonequinho demonstrando ${exercise.name}`}
        />
        <View style={styles.header}>
          <Text variant="caption" tone="primary">
            {MUSCLE_LABEL[exercise.target].toUpperCase()}
          </Text>
          <Text variant="title" accessibilityRole="header">
            {exercise.name}
          </Text>
          <Text tone="muted" tabular>
            {prescription.sets} × {minReps}–{maxReps} reps · descanso {prescription.restSeconds}s · RPE {prescription.rpe}
          </Text>
        </View>
        <SetTable
          rows={session.currentRows}
          previousSets={current.previousSets}
          onChangeRow={session.updateRow}
          onToggleRow={session.toggleRow}
          onAddSet={session.addSet}
          onMarkAll={session.markAllDone}
        />
      </Card>

      <Notice title="Sugestão do personal" message={current.progressionMessage} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  pager: { gap: spacing.sm },
  exercise: { gap: spacing.md },
  header: { gap: spacing.xs },
});
