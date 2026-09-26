import { create } from 'zustand';

export type ForensicsLabId = 
  | 'map' 
  | 'intake' 
  | 'preservation' 
  | 'custody' 
  | 'disk' 
  | 'memory' 
  | 'windows' 
  | 'linux' 
  | 'logs' 
  | 'browser' 
  | 'network' 
  | 'timeline' 
  | 'rootcause' 
  | 'containment' 
  | 'recovery' 
  | 'lessons' 
  | 'master';

interface ForensicsStoreState {
  activeTab: ForensicsLabId;
  setActiveTab: (tab: ForensicsLabId) => void;
  
  selectedEvidenceId: string | null;
  setSelectedEvidenceId: (id: string | null) => void;
  
  deepLinkContext: {
    alertId?: string;
    eventId?: string;
    eventIds?: string[];
    type?: string;
  } | null;
  setDeepLinkContext: (context: ForensicsStoreState['deepLinkContext']) => void;
}

export const useForensicsStore = create<ForensicsStoreState>((set) => ({
  activeTab: 'map',
  setActiveTab: (activeTab) => set({ activeTab }),
  
  selectedEvidenceId: null,
  setSelectedEvidenceId: (id) => set({ selectedEvidenceId: id }),
  
  deepLinkContext: null,
  setDeepLinkContext: (deepLinkContext) => set({ deepLinkContext }),
}));
