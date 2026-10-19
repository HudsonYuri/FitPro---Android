import type { FC, ReactElement } from 'react';
import { assertNever } from '@fitpro/core-types';
import { StateView } from '@fitpro/core-ui';
import { usePlanContext, type PlanContext } from '../hooks/use-plan-context';

type PlanGateProps = { children: (context: PlanContext) => ReactElement };

/** Resolve os estados de carregamento/erro uma vez para todas as telas do plano. */
export const PlanGate: FC<PlanGateProps> = ({ children }) => {
  const state = usePlanContext();
  switch (state.status) {
    case 'loading':
      return <StateView kind="loading" message="Montando seu treino" />;
    case 'error':
      return <StateView kind="error" message={state.message} onRetry={state.retry} />;
    case 'ready':
      return children(state.data);
    default:
      return assertNever(state);
  }
};
