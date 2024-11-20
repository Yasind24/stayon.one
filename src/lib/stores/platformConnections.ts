import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PlatformConnection {
  id: string;
  platform_id: string;
  platform_username: string;
  connected_at: string;
}

interface PlatformConnectionsStore {
  connections: PlatformConnection[];
  addConnection: (connection: PlatformConnection) => void;
  removeConnection: (platformId: string) => void;
  clearConnections: () => void;
}

export const usePlatformConnections = create<PlatformConnectionsStore>()(
  persist(
    (set) => ({
      connections: [],
      addConnection: (connection) =>
        set((state) => ({
          connections: [
            ...state.connections.filter((c) => c.platform_id !== connection.platform_id),
            connection,
          ],
        })),
      removeConnection: (platformId) =>
        set((state) => ({
          connections: state.connections.filter((c) => c.platform_id !== platformId),
        })),
      clearConnections: () => set({ connections: [] }),
    }),
    {
      name: 'platform-connections',
    }
  )
);