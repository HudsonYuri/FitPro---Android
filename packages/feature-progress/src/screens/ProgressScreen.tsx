import { useMemo, useState, type FC } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { assertNever, type WorkoutLog } from '@fitpro/core-types';
import { spacing, useTheme } from '@fitpro/core-theme';
import { Card, Chip, StateView, Text } from '@fitpro/core-ui';
import { LoadChart } from '../components/LoadChart';
import { SessionHistoryList } from '../components/SessionHistoryList';
import { useWorkoutLogs } from '../hooks/use-workout-logs';
import { bestOneRepMax } from '../model/records';
import { loadHistory, trainedExerciseIds, trainingStreak } from '../model/stats';

const CHART_EXERCISE_OPTIONS = 8;

export type ProgressScreenProps = {
  /** Resolve o nome traduzido de um exercício a partir do ID salvo no histórico. */
  exerciseName: (exerciseId: string) => string;
};

const ProgressHeader: FC<{ logs: readonly WorkoutLog[]; exerciseName: (id: string) => string }> = ({ logs, exerciseName }) => {
  const exerciseIds = useMemo(() => trainedExerciseIds(logs).slice(0, CHART_EXERCISE_OPTIONS), [logs]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const chartId = selectedId ?? exerciseIds[0];
  const points = useMemo(() => (chartId ? loadHistory(logs, chartId) : []), [logs, chartId]);
  const streak = trainingStreak(logs, Date.now());
  const oneRepMax = chartId ? bestOneRepMax(logs, chartId) : undefined;

  return (
    <View style={styles.header}>
      <View style={styles.stats}>
        <Card style={styles.stat}>
          <Text variant="display" tabular>
            {streak}
          </Text>
          <Text variant="caption" tone="muted">
            {streak === 1 ? 'dia seguido' : 'dias seguidos'}
          </Text>
        </Card>
        <Card style={styles.stat}>
          <Text variant="display" tabular>
            {logs.length}
          </Text>
          <Text variant="caption" tone="muted">
            treinos concluídos
          </Text>
        </Card>
      </View>

      {chartId && (
        <Card style={styles.chartCard}>
          <Text variant="heading" accessibilityRole="header">
            Evolução de carga
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {exerciseIds.map((id) => (
              <Chip key={id} label={exerciseName(id)} selected={id === chartId} onPress={() => setSelectedId(id)} />
            ))}
          </ScrollView>
          <LoadChart points={points} />
          {oneRepMax !== undefined && oneRepMax > 0 && (
            <Text tone="muted" tabular>
              1RM estimado: <Text variant="label">{oneRepMax.toLocaleString('pt-BR')} kg</Text>
            </Text>
          )}
        </Card>
      )}

      {logs.length > 0 && (
        <Text variant="heading" accessibilityRole="header">
          Histórico
        </Text>
      )}
    </View>
  );
};

export const ProgressScreen: FC<ProgressScreenProps> = ({ exerciseName }) => {
  const { colors } = useTheme();
  const state = useWorkoutLogs();

  const content = (() => {
    switch (state.status) {
      case 'loading':
        return <StateView kind="loading" />;
      case 'error':
        return <StateView kind="error" message={state.message} onRetry={state.retry} />;
      case 'ready':
        return (
          <SessionHistoryList logs={state.data} header={<ProgressHeader logs={state.data} exerciseName={exerciseName} />} />
        );
      default:
        return assertNever(state);
    }
  })();

  return <View style={[styles.root, { backgroundColor: colors.background }]}>{content}</View>;
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { gap: spacing.md, paddingBottom: spacing.md },
  stats: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1, gap: spacing.xs },
  chartCard: { gap: spacing.md },
  chips: { gap: spacing.sm },
});
