import { getSubscribeList } from '@/services/admin/subscribe';
import { create } from 'zustand';

interface SubscribeState {
  // Data
  subscribes: API.SubscribeItem[];

  // Loading states
  loading: boolean;

  // Actions
  fetchSubscribes: () => Promise<void>;

  // Getters
  getSubscribeName: (subscribeId?: number) => string;
  getSubscribeById: (subscribeId: number) => API.SubscribeItem | undefined;
}

export const useSubscribeStore = create<SubscribeState>((set, get) => ({
  // Initial state
  subscribes: [],
  loading: false,

  // Actions
  fetchSubscribes: async () => {
    if (get().loading) return;

    set({ loading: true });
    try {
      const { data } = await getSubscribeList({ page: 1, size: 999999999 });
      set({ subscribes: data?.data?.list || [] });
    } catch (error) {
      // Handle error silently
    } finally {
      set({ loading: false });
    }
  },

  // Getters
  getSubscribeName: (subscribeId?: number) => {
    if (!subscribeId) return 'Unknown';
    const subscribe = get().subscribes.find((s) => s.id === subscribeId);
    return subscribe?.name ?? `Subscribe ${subscribeId}`;
  },

  getSubscribeById: (subscribeId: number) => {
    return get().subscribes.find((s) => s.id === subscribeId);
  },
}));

export const useSubscribe = () => {
  const store = useSubscribeStore();

  // Auto-fetch subscribes
  if (store.subscribes.length === 0 && !store.loading) {
    store.fetchSubscribes();
  }

  return {
    subscribes: store.subscribes,
    loading: store.loading,
    fetchSubscribes: store.fetchSubscribes,
    getSubscribeName: store.getSubscribeName,
    getSubscribeById: store.getSubscribeById,
  };
};

export default useSubscribeStore;
