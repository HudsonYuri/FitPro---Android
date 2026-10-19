import type { FC } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { sizes, spacing, useTheme } from '@fitpro/core-theme';
import { Text } from '@fitpro/core-ui';
import { useWorkoutPreferences } from '../hooks/use-workout-preferences';

/** Preferência exibida no Perfil: liga/desliga o timer automático de descanso. */
export const RestAlertsToggle: FC = () => {
  const { colors } = useTheme();
  const restAlerts = useWorkoutPreferences((state) => state.restAlerts);
  const setRestAlerts = useWorkoutPreferences((state) => state.setRestAlerts);
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text variant="label">Alertas de descanso</Text>
        <Text variant="caption" tone="muted">
          Inicia o timer ao marcar uma série e vibra quando o descanso acaba.
        </Text>
      </View>
      <Switch
        value={restAlerts}
        onValueChange={setRestAlerts}
        accessibilityLabel="Alertas de descanso"
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor={colors.surface}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: sizes.touchTarget },
  text: { flex: 1, gap: spacing.xs },
});
