import { memo, useCallback, type FC, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import type { WorkoutLog } from '@fitpro/core-types';
import { durations, spacing } from '@fitpro/core-theme';
import { Card, StateView, Text } from '@fitpro/core-ui';
import { sessionVolumeKg } from '../model/stats';

const MAX_STAGGERED_ITEMS = 8;
const MS_PER_MINUTE = 60_000;

const formatDateTime = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });

type SessionHistoryListCardProps = { log: WorkoutLog; index: number };

const SessionHistoryListCardBase: FC<SessionHistoryListCardProps> = ({ log, index }) => {
  const minutes = Math.max(1, Math.round((log.finishedAt - log.startedAt) / MS_PER_MINUTE));
  const exercises = new Set(log.sets.map((set) => set.exerciseId)).size;
  const volume = sessionVolumeKg(log).toLocaleString('pt-BR');
  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, MAX_STAGGERED_ITEMS) * durations.stagger).duration(durations.normal)}
      exiting={FadeOut.duration(durations.fast)}
    >
      <Card style={styles.card}>
        <Text variant="label">{log.sessionTitle}</Text>
        <Text variant="caption" tone="muted" tabular>
          {formatDateTime(log.finishedAt)} · {minutes} min · {exercises} exercícios · {log.sets.length} séries · {volume} kg
        </Text>
      </Card>
    </Animated.View>
  );
};

export const SessionHistoryListCard = memo(SessionHistoryListCardBase);

export const SessionHistoryListEmpty: FC = () => {
  return <StateView kind="empty" title="Nenhum treino ainda" message="Seus treinos concluídos aparecem aqui." />;
};

const SessionHistoryListSeparator: FC = () => {
  return <View style={styles.separator} />;
};

const keyExtractor = (log: WorkoutLog): string => log.id;

export type SessionHistoryListProps = { logs: readonly WorkoutLog[]; header: ReactElement };

export const SessionHistoryList: FC<SessionHistoryListProps> = ({ logs, header }) => {
  const renderItem = useCallback<ListRenderItem<WorkoutLog>>(
    ({ item, index }) => <SessionHistoryListCard log={item} index={index} />,
    [],
  );
  return (
    <FlashList
      data={logs}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={header}
      ListEmptyComponent={SessionHistoryListEmpty}
      ItemSeparatorComponent={SessionHistoryListSeparator}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    />
  );
};

const styles = StyleSheet.create({
  content: { padding: spacing.md },
  card: { gap: spacing.xs },
  separator: { height: spacing.sm },
});
