import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { durations, radii, sizes, useTheme } from '@fitpro/core-theme';

export type ProgressBarProps = {
  /** Valor entre 0 e 1. */
  progress: number;
  accessibilityLabel: string;
};

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export const ProgressBar: FC<ProgressBarProps> = ({ progress, accessibilityLabel }) => {
  const { colors } = useTheme();
  const ratio = clamp01(progress);
  const fillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${ratio * 100}%`, { duration: durations.normal }),
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
      style={[styles.track, { backgroundColor: colors.border }]}
    >
      <Animated.View style={[styles.fill, { backgroundColor: colors.primary }, fillStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: { height: sizes.progressBar, borderRadius: radii.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radii.pill },
});
