import type { FC } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { durations, spacing } from '@fitpro/core-theme';
import { Button, Card, ProgressBar, Text } from '@fitpro/core-ui';
import { formatClock } from '../hooks/use-rest-timer';

export type RestTimerCardProps = {
  remainingSeconds: number;
  totalSeconds: number;
  onSkip: () => void;
};

export const RestTimerCard: FC<RestTimerCardProps> = ({ remainingSeconds, totalSeconds, onSkip }) => {
  return (
    <Animated.View entering={FadeInDown.duration(durations.normal)} exiting={FadeOut.duration(durations.fast)}>
      <Card style={styles.card}>
        <Text variant="caption" tone="muted">
          Descanso
        </Text>
        <Text
          variant="display"
          tabular
          accessibilityRole="timer"
          accessibilityLiveRegion="polite"
          accessibilityLabel={`Descanso: ${remainingSeconds} segundos restantes`}
        >
          {formatClock(remainingSeconds)}
        </Text>
        <ProgressBar
          progress={totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 1}
          accessibilityLabel="Progresso do descanso"
        />
        <Button label="Pular descanso" variant="ghost" onPress={onSkip} />
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: { alignItems: 'stretch', gap: spacing.sm },
});
