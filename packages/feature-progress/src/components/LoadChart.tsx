import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { durations, radii, sizes, spacing, useTheme } from '@fitpro/core-theme';
import { Text } from '@fitpro/core-ui';
import type { LoadPoint } from '../model/stats';

const MAX_BARS = 10;
const MIN_BAR_RATIO = 0.08;

const formatDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

export type LoadChartProps = { points: readonly LoadPoint[] };

/** Colunas com a carga máxima dos últimos treinos de um exercício. */
export const LoadChart: FC<LoadChartProps> = ({ points }) => {
  const { colors } = useTheme();
  const recent = points.slice(-MAX_BARS);
  const peak = Math.max(1, ...recent.map((point) => point.maxLoadKg));
  const first = recent[0];
  const last = recent.at(-1);
  const summary =
    first && last
      ? `Carga máxima foi de ${first.maxLoadKg} kg para ${last.maxLoadKg} kg em ${recent.length} treinos.`
      : 'Sem registros.';

  return (
    <View accessible accessibilityLabel={`Gráfico de evolução de carga. ${summary}`} style={styles.root}>
      <View style={styles.bars}>
        {recent.map((point, index) => (
          <Animated.View
            key={point.finishedAt}
            entering={FadeInDown.delay(index * durations.stagger).duration(durations.normal)}
            style={styles.column}
          >
            <Text variant="caption" tabular numberOfLines={1}>
              {point.maxLoadKg.toLocaleString('pt-BR')}
            </Text>
            <View
              style={[
                styles.bar,
                {
                  height: `${Math.max(MIN_BAR_RATIO, point.maxLoadKg / peak) * 100}%`,
                  backgroundColor: index === recent.length - 1 ? colors.primary : colors.primarySoft,
                  borderColor: colors.primary,
                },
              ]}
            />
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {formatDate(point.finishedAt)}
            </Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { height: sizes.chartHeight + spacing.xxl },
  bars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
  column: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.xs },
  bar: { width: '100%', maxHeight: sizes.chartHeight, borderRadius: radii.sm, borderWidth: StyleSheet.hairlineWidth },
});
