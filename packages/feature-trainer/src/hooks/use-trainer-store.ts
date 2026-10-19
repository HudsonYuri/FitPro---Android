import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistentStorage } from '@fitpro/platform-storage';
import type { SwapMap } from '../engine/swaps';

type TrainerState = {
  swaps: SwapMap;
  swapExercise: (slotId: string, exerciseId: string) => void;
  resetSwaps: () => void;
};

export const useTrainerStore = create<TrainerState>()(
  persist(
    (set) => ({
      swaps: {},
      swapExercise: (slotId, exerciseId) => set((state) => ({ swaps: { ...state.swaps, [slotId]: exerciseId } })),
      resetSwaps: () => set({ swaps: {} }),
    }),
    { name: 'trainer', storage: persistentStorage, partialize: (state) => ({ swaps: state.swaps }) },
  ),
);
