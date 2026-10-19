import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { durations, spacing } from '@fitpro/core-theme';
import { Button, Card, Text } from '@fitpro/core-ui';
import { useWorkoutDraft } from '../hooks/use-workout-draft';
import { countDone, countWorking } from '../model/set-rows';

export type ResumeWorkoutCardProps = {
  onResume: (sessionId: string) => void;
};

/** Aparece no Hoje quando há um treino interrompido (app fechado no meio). */
export const ResumeWorkoutCard: FC<ResumeWorkoutCardProps> = ({ onResume }) => {
  const draft = useWorkoutDraft((state) => state.draft);
  const clearDraft = useWorkoutDraft((state) => state.clearDraft);
  if (!draft) return null;

  return (
    <Animated.View entering={FadeInDown.duration(durations.normal)} exiting={FadeOut.duration(durations.fast)}>
      <Card style={styles.card}>
        <Text variant="caption" tone="primary">
          TREINO EM ANDAMENTO
        </Text>
        <Text variant="heading">{draft.sessionTitle}</Text>
        <Text tone="muted" tabular>
          {countDone(draft.rows)} de {countWorking(draft.rows)} séries feitas
        </Text>
        <View style={styles.actions}>
          <View style={styles.action}>
            <Button label="Descartar" variant="ghost" onPress={clearDraft} />
          </View>
          <View style={styles.action}>
            <Button label="Continuar" onPress={() => onResume(draft.sessionId)} />
          </View>
        </View>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
