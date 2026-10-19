import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { radii, spacing, useTheme } from '@fitpro/core-theme';
import { Text } from '@fitpro/core-ui';
import { formatClock } from '../hooks/use-rest-timer';

export type WorkoutStatsBarProps = {
  elapsedSeconds: number;
  doneSets: number;
  totalSets: number;
  volumeKg: number;
};

const Stat: FC<{ value: string; label: string }> = ({ value, label }) => {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text variant="heading" tabular>
        {value}
      </Text>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </View>
  );
};

export const WorkoutStatsBar: FC<WorkoutStatsBarProps> = ({ elapsedSeconds, doneSets, totalSets, volumeKg }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Stat value={formatClock(elapsedSeconds)} label="Duração" />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Stat value={`${doneSets}/${totalSets}`} label="Séries" />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Stat value={`${volumeKg.toLocaleString('pt-BR')} kg`} label="Volume" />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  stat: { flex: 1, alignItems: 'center', gap: spacing.xs },
  divider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch' },
});
