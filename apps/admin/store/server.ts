import { filterServerList } from '@/services/admin/server';
import { create } from 'zustand';

interface ServerState {
  // Data
  servers: API.Server[];

  // Actions
  fetchServers: () => Promise<void>;

  // Getters
  getServerById: (serverId: number) => API.Server | undefined;
  getServerName: (serverId?: number) => string;
  getServerAddress: (serverId?: number) => string;
  getServerEnabledProtocols: (serverId: number) => API.Protocol[];
  getProtocolPort: (serverId?: number, protocol?: string) => string;
  getAvailableProtocols: (serverId?: number) => Array<{ protocol: string; port: number }>;
}

export const useServerStore = create<ServerState>((set, get) => ({
  // Initial state
  servers: [],

  // Actions
  fetchServers: async () => {
    try {
      const { data } = await filterServerList({ page: 1, size: 999999999 });
      set({ servers: data?.data?.list || [] });
    } catch (error) {
      // Handle error silently
    }
  },

  // Getters
  getServerById: (serverId: number) => {
    return get().servers.find((s) => s.id === serverId);
  },

  getServerName: (serverId?: number) => {
    if (!serverId) return '—';
    const server = get().servers.find((s) => s.id === serverId);
    return server?.name ?? `#${serverId}`;
  },

  getServerAddress: (serverId?: number) => {
    if (!serverId) return '—';
    const server = get().servers.find((s) => s.id === serverId);
    return server?.address ?? '—';
  },

  getServerEnabledProtocols: (serverId: number) => {
    const server = get().servers.find((s) => s.id === serverId);
    return server?.protocols?.filter((p) => p.enable !== false) || [];
  },

  getProtocolPort: (serverId?: number, protocol?: string) => {
    if (!serverId || !protocol) return '—';
    const enabledProtocols = get().getServerEnabledProtocols(serverId);
    const protocolConfig = enabledProtocols.find((p) => p.type === protocol);
    return protocolConfig?.port ? String(protocolConfig.port) : '—';
  },

  getAvailableProtocols: (serverId?: number) => {
    if (!serverId) return [];
    return get()
      .getServerEnabledProtocols(serverId)
      .map((p) => ({
        protocol: p.type,
        port: p.port,
      }));
  },
}));

export const useServer = () => {
  const store = useServerStore();

  // Auto-fetch servers
  if (store.servers.length === 0) {
    store.fetchServers();
  }

  return {
    servers: store.servers,
    fetchServers: store.fetchServers,
    getServerById: store.getServerById,
    getServerName: store.getServerName,
    getServerAddress: store.getServerAddress,
    getServerEnabledProtocols: store.getServerEnabledProtocols,
    getProtocolPort: store.getProtocolPort,
    getAvailableProtocols: store.getAvailableProtocols,
  };
};

export default useServerStore;
