import type { FC } from 'react';
import type { Exercise, WorkoutItem, WorkoutSession } from '@fitpro/core-types';
import { PlanItemCard } from './PlanItemCard';

export type SessionItemsProps = {
  session: WorkoutSession;
  exerciseById: ReadonlyMap<string, Exercise>;
  onOpenItem: (item: WorkoutItem) => void;
  onSwapItem: (item: WorkoutItem) => void;
};

/** Uma sessão tem no máximo ~9 itens: um map simples basta, sem virtualização. */
export const SessionItems: FC<SessionItemsProps> = ({ session, exerciseById, onOpenItem, onSwapItem }) => {
  return (
    <>
      {session.items.map((item, index) => {
        const exercise = exerciseById.get(item.prescription.exerciseId);
        if (!exercise) return null;
        return (
          <PlanItemCard
            key={item.slotId}
            item={item}
            exercise={exercise}
            index={index}
            onOpen={onOpenItem}
            onSwap={onSwapItem}
          />
        );
      })}
    </>
  );
};
