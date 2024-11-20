import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserSettings {
  displayName: string;
  email: string;
  timezone: string;
}

interface UserSettingsStore extends UserSettings {
  updateSettings: (settings: Partial<UserSettings>) => void;
}

export const useUserSettings = create<UserSettingsStore>()(
  persist(
    (set) => ({
      displayName: '',
      email: '',
      timezone: 'UTC',
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
    }),
    {
      name: 'user-settings',
    }
  )
);