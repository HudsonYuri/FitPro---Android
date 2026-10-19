import { useEffect, type FC } from 'react';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { durations, radii, useTheme } from '@fitpro/core-theme';

export type SkeletonProps = {
  width: DimensionValue;
  height: DimensionValue;
  style?: StyleProp<ViewStyle>;
};

const PULSE_MIN_OPACITY = 0.4;

export const Skeleton: FC<SkeletonProps> = ({ width, height, style }) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withRepeat(withTiming(PULSE_MIN_OPACITY, { duration: durations.slow * 2 }), -1, true);
  }, [opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height, borderRadius: radii.md, backgroundColor: colors.skeleton }, animatedStyle, style]}
    />
  );
};
