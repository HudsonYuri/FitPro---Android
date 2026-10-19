import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { radii, spacing, useTheme } from '@fitpro/core-theme';
import { Text } from '../atoms/Text';

export type NoticeProps = {
  title: string;
  message: string;
  tone?: 'info' | 'warning' | 'danger';
};

export const Notice: FC<NoticeProps> = ({ title, message, tone = 'info' }) => {
  const { colors } = useTheme();
  const palette = {
    info: { background: colors.primarySoft, border: colors.primary },
    warning: { background: colors.warningSoft, border: colors.warning },
    danger: { background: colors.dangerSoft, border: colors.danger },
  }[tone];

  return (
    <View
      accessibilityRole={tone === 'info' ? 'text' : 'alert'}
      style={[styles.base, { backgroundColor: palette.background, borderColor: palette.border }]}
    >
      <Text variant="label">{title}</Text>
      <Text variant="body" tone="muted">
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: { padding: spacing.md, gap: spacing.xs, borderRadius: radii.md, borderWidth: StyleSheet.hairlineWidth },
});
