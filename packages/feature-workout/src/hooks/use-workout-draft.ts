import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistentStorage } from '@fitpro/platform-storage';
import type { WorkoutDraft } from '../model/types';

type WorkoutDraftState = {
  draft: WorkoutDraft | undefined;
  saveDraft: (draft: WorkoutDraft) => void;
  clearDraft: () => void;
};

/** MMKV é síncrono: salvar a cada série não pesa e sobrevive ao app ser fechado. */
export const useWorkoutDraft = create<WorkoutDraftState>()(
  persist(
    (set) => ({
      draft: undefined,
      saveDraft: (draft) => set({ draft }),
      clearDraft: () => set({ draft: undefined }),
    }),
    { name: 'workout-draft', storage: persistentStorage, partialize: (state) => ({ draft: state.draft }) },
  ),
);
