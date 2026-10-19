import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { radii, sizes, spacing, useTheme } from '@fitpro/core-theme';
import { Text } from '@fitpro/core-ui';

const WEEKDAY_INITIALS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const;
const WEEKDAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'] as const;

export type WeekStripProps = {
  /** Dias (0 = domingo) da semana atual com treino concluído. */
  trainedDays: readonly number[];
  today: number;
  goalPerWeek: number;
};

export const WeekStrip: FC<WeekStripProps> = ({ trainedDays, today, goalPerWeek }) => {
  const { colors } = useTheme();
  const summary = `${trainedDays.length} de ${goalPerWeek} treinos nesta semana`;

  return (
    <View style={styles.root} accessible accessibilityLabel={summary}>
      <View style={styles.header}>
        <Text variant="label">Dias da semana</Text>
        <Text variant="caption" tone="muted" tabular>
          {trainedDays.length}/{goalPerWeek}
        </Text>
      </View>
      <View style={styles.days}>
        {WEEKDAY_INITIALS.map((initial, day) => {
          const trained = trainedDays.includes(day);
          const isToday = day === today;
          return (
            <View key={WEEKDAY_NAMES[day]} style={styles.day}>
              <Text variant="caption" tone={isToday ? 'primary' : 'muted'}>
                {initial}
              </Text>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: trained ? colors.primary : colors.surfaceRaised,
                    borderColor: isToday ? colors.primary : colors.border,
                  },
                ]}
              >
                {trained && (
                  <Text variant="label" tone="onPrimary">
                    ✓
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: spacing.xs },
  dot: {
    width: sizes.weekDay,
    height: sizes.weekDay,
    borderRadius: radii.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
