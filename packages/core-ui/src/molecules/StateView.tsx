import type { FC } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { spacing, useTheme } from '@fitpro/core-theme';
import { Button } from '../atoms/Button';
import { Text } from '../atoms/Text';

export type StateViewProps =
  | { kind: 'loading'; message?: string }
  | { kind: 'error'; message: string; onRetry: () => void }
  | { kind: 'empty'; title: string; message: string };

/** Estados de tela de carregamento, erro e vazio, num formato único. */
export const StateView: FC<StateViewProps> = (props) => {
  const { colors } = useTheme();
  return (
    <View style={styles.base}>
      {props.kind === 'loading' && (
        <>
          <ActivityIndicator color={colors.primary} />
          {props.message && <Text tone="muted">{props.message}</Text>}
        </>
      )}
      {props.kind === 'error' && (
        <>
          <Text variant="heading">Algo deu errado</Text>
          <Text tone="muted" style={styles.center}>
            {props.message}
          </Text>
          <Button label="Tentar novamente" onPress={props.onRetry} variant="secondary" />
        </>
      )}
      {props.kind === 'empty' && (
        <>
          <Text variant="heading">{props.title}</Text>
          <Text tone="muted" style={styles.center}>
            {props.message}
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  base: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  center: { textAlign: 'center' },
});
