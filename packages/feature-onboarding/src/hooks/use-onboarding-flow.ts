import { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { UserProfile } from '@fitpro/core-types';
import {
  STEPS,
  draftFromProfile,
  emptyDraft,
  isStepComplete,
  needsMedicalClearance,
  toProfile,
  type OnboardingDraft,
  type OnboardingStep,
} from '../model/steps';
import { useProfileStore } from './use-profile-store';

export type UseOnboardingFlowArgs = {
  initialProfile: UserProfile | undefined;
  onComplete: () => void;
};

export const useOnboardingFlow = ({ initialProfile, onComplete }: UseOnboardingFlowArgs) => {
  const saveProfile = useProfileStore((state) => state.saveProfile);
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(() =>
    initialProfile ? draftFromProfile(initialProfile) : emptyDraft(),
  );

  const step: OnboardingStep = STEPS[stepIndex] ?? 'goal';
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === STEPS.length - 1;

  const goBack = (): void => setStepIndex((index) => Math.max(0, index - 1));

  // Botão/gesto voltar do Android volta uma etapa antes de sair do fluxo.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stepIndex === 0) return false;
      goBack();
      return true;
    });
    return () => subscription.remove();
  }, [stepIndex]);

  const update = (patch: Partial<OnboardingDraft>): void => {
    void Haptics.selectionAsync();
    setDraft((current) => ({ ...current, ...patch }));
  };

  const advance = (): void => {
    if (!isLastStep) {
      setStepIndex((index) => index + 1);
      return;
    }
    const profile = toProfile(draft);
    if (!profile) return;
    saveProfile(profile);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };

  return {
    step,
    stepNumber: stepIndex + 1,
    totalSteps: STEPS.length,
    draft,
    update,
    canAdvance: isStepComplete(step, draft),
    isFirstStep,
    isLastStep,
    showMedicalWarning: needsMedicalClearance(draft),
    advance,
    goBack,
  };
};
