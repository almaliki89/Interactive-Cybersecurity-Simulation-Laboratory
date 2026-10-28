import { create } from 'zustand';
import { SecurityAlert, AlertStatus } from '../simulations/soc/logic/detection';
import { EnrichedTelemetryEvent } from '../simulations/soc/logic/enrichment';
import { SecurityIncident } from '../simulations/soc/logic/incidents';

export type SocWorkstationTab = 'QUEUE' | 'INVESTIGATION' | 'EXPLORER' | 'TIMELINE' | 'DECISION' | 'WAR_ROOM_3D' | 'PLAYBOOK_STUDIO';

interface SocStoreState {
  // Navigation
  activeTab: SocWorkstationTab;
  setActiveTab: (tab: SocWorkstationTab) => void;

  // Selections
  selectedAlertId: string | null;
  setSelectedAlertId: (id: string | null) => void;
  
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;

  selectedIncidentId: string | null;
  setSelectedIncidentId: (id: string | null) => void;

  // View States
  isRawDrawerOpen: boolean;
  setRawDrawerOpen: (open: boolean) => void;

  // Transient Analyst State (Simulating persistence for the session)
  alertStatuses: Record<string, AlertStatus>;
  updateAlertStatus: (alertId: string, status: AlertStatus) => void;

  // Filtering
  filters: {
    severity: string[];
    sourceWorld: string[];
    category: string[];
    outcome: string[];
    user: string[];
  };
  setFilter: (key: keyof SocStoreState['filters'], values: string[]) => void;
  resetFilters: () => void;
}

export const useSocStore = create<SocStoreState>((set) => ({
  activeTab: 'QUEUE',
  setActiveTab: (activeTab) => set({ activeTab }),

  selectedAlertId: null,
  setSelectedAlertId: (id) => set({ 
    selectedAlertId: id,
    // Auto-switch to investigation when selecting an alert if in queue
    activeTab: id ? 'INVESTIGATION' : 'QUEUE'
  }),

  selectedEventId: null,
  setSelectedEventId: (id) => set({ selectedEventId: id }),

  selectedIncidentId: null,
  setSelectedIncidentId: (id) => set({ selectedIncidentId: id }),

  isRawDrawerOpen: false,
  setRawDrawerOpen: (isRawDrawerOpen) => set({ isRawDrawerOpen }),

  alertStatuses: {},
  updateAlertStatus: (alertId, status) => set((state) => ({
    alertStatuses: { ...state.alertStatuses, [alertId]: status }
  })),

  filters: {
    severity: [],
    sourceWorld: [],
    category: [],
    outcome: [],
    user: [],
  },
  setFilter: (key, values) => set((state) => ({
    filters: { ...state.filters, [key]: values }
  })),
  resetFilters: () => set({
    filters: {
      severity: [],
      sourceWorld: [],
      category: [],
      outcome: [],
      user: [],
    }
  }),
}));
