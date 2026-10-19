import type { WorkoutPlan, WorkoutSession } from '@fitpro/core-types';

/** slotId → exerciseId escolhido pelo usuário em "Trocar exercício". */
export type SwapMap = Readonly<Record<string, string>>;

export const applySwaps = (plan: WorkoutPlan, swaps: SwapMap): WorkoutPlan => ({
  ...plan,
  sessions: plan.sessions.map((session) => ({
    ...session,
    items: session.items.map((item) => {
      const swappedId = swaps[item.slotId];
      if (!swappedId || swappedId === item.prescription.exerciseId) return item;
      return {
        ...item,
        prescription: { ...item.prescription, exerciseId: swappedId },
        reason: 'Trocado por você, mantendo o mesmo músculo-alvo e a mesma prescrição.',
      };
    }),
  })),
});

/** O treino de hoje segue a rotação: a próxima sessão depois da última concluída. */
export const nextSession = (plan: WorkoutPlan, completedWorkouts: number): WorkoutSession | undefined =>
  plan.sessions[completedWorkouts % Math.max(1, plan.sessions.length)];
