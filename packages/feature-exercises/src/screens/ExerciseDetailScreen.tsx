import type { FC } from 'react';
import { assertNever } from '@fitpro/core-types';
import { Button, Notice, Screen, StateView } from '@fitpro/core-ui';
import { ExerciseDetail } from '../components/ExerciseDetail';
import { useExercise } from '../hooks/use-exercise-catalog';

export type ExerciseDetailScreenProps = {
  exerciseId: string;
  /** Motivo da recomendação, quando o exercício veio do plano. */
  reason?: string;
  /** Presente só quando o exercício faz parte do plano e pode ser trocado. */
  onSwap?: () => void;
};

export const ExerciseDetailScreen: FC<ExerciseDetailScreenProps> = ({ exerciseId, reason, onSwap }) => {
  const state = useExercise(exerciseId);

  switch (state.status) {
    case 'loading':
      return <StateView kind="loading" message="Carregando exercício" />;
    case 'error':
      return <StateView kind="error" message={state.message} onRetry={state.retry} />;
    case 'ready':
      return (
        <Screen footer={onSwap && <Button label="Trocar exercício" variant="secondary" onPress={onSwap} />}>
          <ExerciseDetail exercise={state.data}>
            {reason && <Notice title="Por que este exercício" message={reason} />}
          </ExerciseDetail>
        </Screen>
      );
    default:
      return assertNever(state);
  }
};
