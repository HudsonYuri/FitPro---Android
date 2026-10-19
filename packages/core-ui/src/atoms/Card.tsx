import type { FC, ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { radii, spacing, useTheme } from '@fitpro/core-theme';
import { Touchable } from './Touchable';

export type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

export const Card: FC<CardProps> = ({ children, onPress, accessibilityLabel, accessibilityHint, style }) => {
  const { colors } = useTheme();
  const surface = [styles.base, { backgroundColor: colors.surface, borderColor: colors.border }, style];

  if (!onPress) {
    return <View style={surface}>{children}</View>;
  }
  return (
    <Touchable onPress={onPress} accessibilityLabel={accessibilityLabel} accessibilityHint={accessibilityHint} style={surface}>
      {children}
    </Touchable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
});
