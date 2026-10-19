import type { FC, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, useTheme } from '@fitpro/core-theme';

export type ScreenProps = {
  children: ReactNode;
  /** Telas sem header nativo precisam respeitar a área segura do topo. */
  withTopInset?: boolean;
  scroll?: boolean;
  footer?: ReactNode;
};

export const Screen: FC<ScreenProps> = ({ children, withTopInset = false, scroll = true, footer }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const content = [styles.content, withTopInset && { paddingTop: insets.top + spacing.md }];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {scroll ? (
        <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={content}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, content]}>{children}</View>
      )}
      {footer && (
        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + spacing.md, borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          {footer}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md },
  footer: { paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
});
