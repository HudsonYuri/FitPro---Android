import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@fitpro/core-types';
import { persistentStorage } from '@fitpro/platform-storage';

type ProfileState = {
  profile: UserProfile | undefined;
  saveProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: undefined,
      saveProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: undefined }),
    }),
    { name: 'profile', storage: persistentStorage, version: 1, partialize: (state) => ({ profile: state.profile }) },
  ),
);
