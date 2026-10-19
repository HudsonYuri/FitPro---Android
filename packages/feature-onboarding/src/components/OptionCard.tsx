import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { radii, spacing, useTheme } from '@fitpro/core-theme';
import { Text, Touchable } from '@fitpro/core-ui';

export type OptionCardProps = {
  label: string;
  description?: string;
  selected: boolean;
  /** `radio` para escolha única, `checkbox` para múltipla. */
  kind?: 'radio' | 'checkbox';
  onPress: () => void;
};

export const OptionCard: FC<OptionCardProps> = ({ label, description, selected, kind = 'radio', onPress }) => {
  const { colors } = useTheme();
  return (
    <Touchable
      onPress={onPress}
      accessibilityRole={kind}
      accessibilityLabel={description ? `${label}. ${description}` : label}
      accessibilityState={{ checked: selected }}
      style={[
        styles.base,
        {
          backgroundColor: selected ? colors.primarySoft : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    >
      <View style={styles.text}>
        <Text variant="label">{label}</Text>
        {description && (
          <Text variant="caption" tone="muted">
            {description}
          </Text>
        )}
      </View>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  text: { gap: spacing.xs },
});
