import type { FC } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { radii, sizes, spacing, useTheme, type ColorTokens } from '@fitpro/core-theme';
import { assertNever } from '../utils/assert-never';
import { Text } from './Text';
import { Touchable } from './Touchable';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
};

const variantColors = (colors: ColorTokens, variant: ButtonVariant): { background: string; border: string } => {
  switch (variant) {
    case 'primary':
      return { background: colors.primary, border: colors.primary };
    case 'secondary':
      return { background: colors.surfaceRaised, border: colors.border };
    case 'ghost':
      return { background: 'transparent', border: 'transparent' };
    case 'danger':
      return { background: colors.dangerSoft, border: colors.danger };
    default:
      return assertNever(variant);
  }
};

export const Button: FC<ButtonProps> = ({ label, onPress, variant = 'primary', disabled = false, loading = false, accessibilityHint }) => {
  const { colors } = useTheme();
  const { background, border } = variantColors(colors, variant);
  const isInactive = disabled || loading;

  return (
    <Touchable
      onPress={onPress}
      disabled={isInactive}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      style={[styles.base, { backgroundColor: background, borderColor: border }, isInactive && styles.inactive]}
    >
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} />
      ) : (
        <Text
          variant="label"
          tone={variant === 'primary' ? 'onPrimary' : variant === 'danger' ? 'danger' : 'default'}
          style={variant === 'primary' && styles.primaryLabel}
        >
          {label}
        </Text>
      )}
    </Touchable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: sizes.touchTarget + spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  primaryLabel: { fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  inactive: { opacity: 0.5 },
});
