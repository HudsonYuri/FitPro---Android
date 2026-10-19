import type { FC } from 'react';
import { Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { durations, pressScale, sizes, useTheme } from '@fitpro/core-theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type TouchableProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
};

/**
 * Feedback de toque nativo por plataforma: ripple no Android,
 * escala 0.96 no iOS (desligada com "reduzir movimento").
 */
export const Touchable: FC<TouchableProps> = ({ style, onPressIn, onPressOut, children, ...rest }) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const shouldScale = Platform.OS === 'ios' && !reduceMotion;

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      android_ripple={{ color: colors.ripple, foreground: true }}
      onPressIn={(event) => {
        if (shouldScale) scale.value = withTiming(pressScale, { duration: durations.fast });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        if (shouldScale) scale.value = withTiming(1, { duration: durations.fast });
        onPressOut?.(event);
      }}
      style={[{ minHeight: sizes.touchTarget, overflow: 'hidden' }, style, shouldScale && animatedStyle]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
};
