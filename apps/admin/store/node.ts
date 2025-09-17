import { filterNodeList, queryNodeTag } from '@/services/admin/server';
import { create } from 'zustand';

interface NodeState {
  // Data
  nodes: API.Node[];
  tags: string[];

  // Actions
  fetchNodes: () => Promise<void>;
  fetchTags: () => Promise<void>;

  // Getters
  getNodeById: (nodeId: number) => API.Node | undefined;
  isProtocolUsedInNodes: (serverId: number, protocolType: string) => boolean;
  isServerReferencedByNodes: (serverId: number) => boolean;
  getNodesByTag: (tag: string) => API.Node[];
  getNodesWithoutTags: () => API.Node[];
  getNodeTags: () => string[];
  getAllAvailableTags: () => string[];
}

export const useNodeStore = create<NodeState>((set, get) => ({
  // Initial state
  nodes: [],
  tags: [],

  // Actions
  fetchNodes: async () => {
    try {
      const { data } = await filterNodeList({ page: 1, size: 999999999 });
      set({ nodes: data?.data?.list || [] });
    } catch (error) {
      // Handle error silently
    }
  },

  fetchTags: async () => {
    try {
      const { data } = await queryNodeTag();
      set({ tags: data?.data?.tags || [] });
    } catch (error) {
      // Handle error silently
    }
  },

  // Getters
  getNodeById: (nodeId: number) => {
    return get().nodes.find((n) => n.id === nodeId);
  },

  isProtocolUsedInNodes: (serverId: number, protocolType: string) => {
    return get().nodes.some(
      (node) => node.server_id === serverId && node.protocol === protocolType,
    );
  },

  isServerReferencedByNodes: (serverId: number) => {
    return get().nodes.some((node) => node.server_id === serverId);
  },

  getNodesByTag: (tag: string) => {
    return get().nodes.filter((node) => (node.tags || []).includes(tag));
  },

  getNodesWithoutTags: () => {
    return get().nodes.filter((node) => (node.tags || []).length === 0);
  },

  getNodeTags: () => {
    return Array.from(
      new Set(
        get()
          .nodes.flatMap((node) => (Array.isArray(node.tags) ? node.tags : []))
          .filter(Boolean),
      ),
    ) as string[];
  },

  getAllAvailableTags: () => {
    const nodeExtractedTags = get().getNodeTags();
    const allApiTags = get().tags;
    return Array.from(new Set([...allApiTags, ...nodeExtractedTags])).filter(Boolean);
  },
}));

export const useNode = () => {
  const store = useNodeStore();

  // Auto-fetch nodes and tags
  if (store.nodes.length === 0) {
    store.fetchNodes();
  }
  if (store.tags.length === 0) {
    store.fetchTags();
  }

  return {
    nodes: store.nodes,
    tags: store.tags,
    fetchNodes: store.fetchNodes,
    fetchTags: store.fetchTags,
    getNodeById: store.getNodeById,
    isProtocolUsedInNodes: store.isProtocolUsedInNodes,
    isServerReferencedByNodes: store.isServerReferencedByNodes,
    getNodesByTag: store.getNodesByTag,
    getNodesWithoutTags: store.getNodesWithoutTags,
    getNodeTags: store.getNodeTags,
    getAllAvailableTags: store.getAllAvailableTags,
  };
};

export default useNodeStore;
