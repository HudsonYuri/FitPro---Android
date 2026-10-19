import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistentStorage } from '@fitpro/platform-storage';

type WorkoutPreferences = {
  /** Inicia o timer e vibra ao fim do descanso ao marcar uma série. */
  restAlerts: boolean;
  setRestAlerts: (enabled: boolean) => void;
};

export const useWorkoutPreferences = create<WorkoutPreferences>()(
  persist(
    (set) => ({
      restAlerts: true,
      setRestAlerts: (restAlerts) => set({ restAlerts }),
    }),
    { name: 'workout-preferences', storage: persistentStorage, partialize: (state) => ({ restAlerts: state.restAlerts }) },
  ),
);
