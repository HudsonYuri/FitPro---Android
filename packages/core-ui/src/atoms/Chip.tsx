import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { radii, sizes, spacing, useTheme } from '@fitpro/core-theme';
import { Text } from './Text';
import { Touchable } from './Touchable';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export const Chip: FC<ChipProps> = ({ label, selected = false, onPress }) => {
  const { colors } = useTheme();
  const colorStyle = {
    backgroundColor: selected ? colors.primarySoft : colors.surface,
    borderColor: selected ? colors.primary : colors.border,
  };

  if (!onPress) {
    return (
      <View style={[styles.base, styles.static, colorStyle]}>
        <Text variant="caption">{label}</Text>
      </View>
    );
  }
  return (
    <Touchable
      onPress={onPress}
      accessibilityRole="togglebutton"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={[styles.base, colorStyle]}
    >
      <Text variant="label">{label}</Text>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: sizes.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  static: { minHeight: 0, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
});
