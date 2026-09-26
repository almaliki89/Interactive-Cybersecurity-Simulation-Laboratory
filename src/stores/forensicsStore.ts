import { create } from 'zustand';
import { ForensicEvidence } from '../simulations/forensics/logic/evidence';
import { CustodyRecord } from '../simulations/forensics/logic/custody';

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

  // New: Collection of evidence resolved from deep links or acquisition
  evidence: ForensicEvidence[];
  addEvidence: (ev: ForensicEvidence) => void;
  setEvidence: (evs: ForensicEvidence[]) => void;

  // Chain of Custody records
  custodyRecords: CustodyRecord[];
  addCustodyRecord: (record: CustodyRecord) => void;
  setCustodyRecords: (records: CustodyRecord[]) => void;
  
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

  evidence: [],
  addEvidence: (ev) => set((s) => ({ 
    evidence: s.evidence.find(existing => existing.id === ev.id) 
      ? s.evidence 
      : [...s.evidence, ev] 
  })),
  setEvidence: (evidence) => set({ evidence }),

  custodyRecords: [],
  addCustodyRecord: (record) => set((s) => ({ custodyRecords: [...s.custodyRecords, record] })),
  setCustodyRecords: (custodyRecords) => set({ custodyRecords }),
  
  deepLinkContext: null,
  setDeepLinkContext: (deepLinkContext) => set({ deepLinkContext }),
}));
