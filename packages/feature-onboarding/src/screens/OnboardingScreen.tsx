import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import type { UserProfile } from '@fitpro/core-types';
import { durations, spacing } from '@fitpro/core-theme';
import { Button, ProgressBar, Screen, Text } from '@fitpro/core-ui';
import { OnboardingStepContent } from '../components/OnboardingStepContent';
import { useOnboardingFlow } from '../hooks/use-onboarding-flow';

export type OnboardingScreenProps = {
  /** Presente quando o usuário está editando um perfil existente. */
  initialProfile?: UserProfile | undefined;
  onComplete: () => void;
};

export const OnboardingScreen: FC<OnboardingScreenProps> = ({ initialProfile, onComplete }) => {
  const flow = useOnboardingFlow({ initialProfile, onComplete });

  return (
    <Screen
      withTopInset={!initialProfile}
      footer={
        <View style={styles.actions}>
          {!flow.isFirstStep && (
            <View style={styles.action}>
              <Button label="Voltar" variant="secondary" onPress={flow.goBack} />
            </View>
          )}
          <View style={styles.action}>
            <Button
              label={flow.isLastStep ? 'Montar meu treino' : 'Continuar'}
              onPress={flow.advance}
              disabled={!flow.canAdvance}
            />
          </View>
        </View>
      }
    >
      <View style={styles.progress}>
        <Text variant="caption" tone="muted">
          Etapa {flow.stepNumber} de {flow.totalSteps}
        </Text>
        <ProgressBar
          progress={flow.stepNumber / flow.totalSteps}
          accessibilityLabel={`Etapa ${flow.stepNumber} de ${flow.totalSteps}`}
        />
      </View>
      <Animated.View
        key={flow.step}
        entering={FadeIn.duration(durations.normal)}
        exiting={FadeOut.duration(durations.fast)}
        style={styles.step}
      >
        <OnboardingStepContent
          step={flow.step}
          draft={flow.draft}
          update={flow.update}
          showMedicalWarning={flow.showMedicalWarning}
        />
      </Animated.View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  progress: { gap: spacing.sm },
  step: { gap: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
