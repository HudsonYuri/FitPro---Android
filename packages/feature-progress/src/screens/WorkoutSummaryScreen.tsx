import { useMemo, type FC } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { assertNever, type WorkoutLog } from '@fitpro/core-types';
import { durations, radii, spacing, useTheme } from '@fitpro/core-theme';
import { Button, Card, Screen, StateView, Text } from '@fitpro/core-ui';
import { useWorkoutLogs } from '../hooks/use-workout-logs';
import { personalRecords, type PersonalRecord } from '../model/records';
import { sessionVolumeKg } from '../model/stats';

const MS_PER_MINUTE = 60_000;

const formatKg = (kg: number): string => `${kg.toLocaleString('pt-BR')} kg`;

const SummaryStat: FC<{ value: string; label: string }> = ({ value, label }) => {
  return (
    <Card style={styles.stat}>
      <Text variant="title" tabular>
        {value}
      </Text>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </Card>
  );
};

const RecordCard: FC<{ record: PersonalRecord; name: string; index: number }> = ({ record, name, index }) => {
  const { colors } = useTheme();
  const gain = record.oneRepMaxKg - record.previousBestKg;
  return (
    <Animated.View entering={FadeInDown.delay((index + 2) * durations.stagger * 2).duration(durations.normal)}>
      <View
        style={[styles.record, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}
        accessible
        accessibilityLabel={`Novo recorde em ${name}: 1RM estimado de ${formatKg(record.oneRepMaxKg)}, ${formatKg(gain)} acima do anterior.`}
      >
        <Text variant="heading">🏆 {name}</Text>
        <Text tabular>
          {formatKg(record.loadKg)} × {record.reps} · 1RM estimado {formatKg(record.oneRepMaxKg)}
        </Text>
        <Text variant="caption" tone="primary" tabular>
          +{formatKg(gain)} em relação ao seu melhor
        </Text>
      </View>
    </Animated.View>
  );
};

type SummaryContentProps = { log: WorkoutLog; previousLogs: readonly WorkoutLog[]; exerciseName: (id: string) => string };

const SummaryContent: FC<SummaryContentProps> = ({ log, previousLogs, exerciseName }) => {
  const records = useMemo(() => personalRecords(log, previousLogs), [log, previousLogs]);
  const minutes = Math.max(1, Math.round((log.finishedAt - log.startedAt) / MS_PER_MINUTE));

  return (
    <>
      <Animated.View entering={ZoomIn.duration(durations.slow)} style={styles.hero}>
        <Text variant="display" accessibilityRole="header">
          Treino concluído!
        </Text>
        <Text tone="muted">{log.sessionTitle}</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(durations.stagger * 2).duration(durations.normal)} style={styles.stats}>
        <SummaryStat value={`${minutes} min`} label="Duração" />
        <SummaryStat value={String(log.sets.length)} label="Séries" />
        <SummaryStat value={formatKg(sessionVolumeKg(log))} label="Volume" />
      </Animated.View>
      {records.length > 0 ? (
        <View style={styles.records}>
          <Text variant="heading" accessibilityRole="header">
            {records.length === 1 ? 'Novo recorde pessoal' : `${records.length} recordes pessoais`}
          </Text>
          {records.map((record, index) => (
            <RecordCard key={record.exerciseId} record={record} name={exerciseName(record.exerciseId)} index={index} />
          ))}
        </View>
      ) : (
        <Text tone="muted">Sem recordes hoje. Constância é o que gera os próximos.</Text>
      )}
    </>
  );
};

export type WorkoutSummaryScreenProps = {
  workoutId: string;
  exerciseName: (exerciseId: string) => string;
  onDone: () => void;
};

export const WorkoutSummaryScreen: FC<WorkoutSummaryScreenProps> = ({ workoutId, exerciseName, onDone }) => {
  const state = useWorkoutLogs();
  switch (state.status) {
    case 'loading':
      return <StateView kind="loading" />;
    case 'error':
      return <StateView kind="error" message={state.message} onRetry={state.retry} />;
    case 'ready': {
      const log = state.data.find((candidate) => candidate.id === workoutId);
      if (!log) return <StateView kind="empty" title="Treino não encontrado" message="Ele pode ter sido removido." />;
      const previousLogs = state.data.filter((candidate) => candidate.finishedAt < log.finishedAt);
      return (
        <Screen footer={<Button label="Concluir" onPress={onDone} />}>
          <SummaryContent log={log} previousLogs={previousLogs} exerciseName={exerciseName} />
        </Screen>
      );
    }
    default:
      return assertNever(state);
  }
};

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.lg },
  stats: { flexDirection: 'row', gap: spacing.sm },
  stat: { flex: 1, alignItems: 'center', gap: spacing.xs },
  records: { gap: spacing.sm },
  record: { gap: spacing.xs, padding: spacing.md, borderRadius: radii.lg, borderWidth: 1 },
});
