import { create } from 'zustand';
import {
  DevSecOpsMasterState,
  createDefaultDevSecOpsMasterState
} from '../simulations/devsecops/logic/masterState';

interface DevSecOpsStoreState {
  masterState: DevSecOpsMasterState;
  setMasterState: (updater: (state: DevSecOpsMasterState) => void) => void;
  resetMasterState: () => void;
}

export const useDevSecOpsStore = create<DevSecOpsStoreState>((set) => ({
  masterState: createDefaultDevSecOpsMasterState(),
  setMasterState: (updater) =>
    set((prev) => {
      // Create a deep copy or copy of the state structure
      const newState = {
        ...prev.masterState,
        sastFindings: prev.masterState.sastFindings.map((f) => ({ ...f })),
        dependencies: prev.masterState.dependencies.map((d) => ({ ...d })),
        secretMatches: prev.masterState.secretMatches.map((s) => ({ ...s })),
        terraformResources: prev.masterState.terraformResources.map((r) => ({ ...r })),
        containerImages: prev.masterState.containerImages.map((c) => ({ ...c })),
        sbomComponents: prev.masterState.sbomComponents.map((sb) => ({ ...sb })),
        slsaAttestation: {
          ...prev.masterState.slsaAttestation,
          materials: prev.masterState.slsaAttestation.materials.map((m) => ({ ...m }))
        },
        signatures: prev.masterState.signatures.map((sig) => ({ ...sig })),
        pipelineConfig: { ...prev.masterState.pipelineConfig },
        pipelineJobs: prev.masterState.pipelineJobs.map((j) => ({ ...j })),
        driftFindings: prev.masterState.driftFindings.map((d) => ({ ...d })),
        complianceState: {
          ...prev.masterState.complianceState,
          failedControls: [...prev.masterState.complianceState.failedControls]
        },
        artifactState: { ...prev.masterState.artifactState },
        antiCheatFlags: prev.masterState.antiCheatFlags ? { ...prev.masterState.antiCheatFlags } : undefined
      };
      updater(newState);
      return { masterState: newState };
    }),
  resetMasterState: () => set({ masterState: createDefaultDevSecOpsMasterState() })
}));
