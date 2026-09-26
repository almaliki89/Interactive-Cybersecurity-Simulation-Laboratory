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

      // Automatic Invalidation on State Changes
      const oldState = prev.masterState;
      const pipelineConfigChanged = JSON.stringify(newState.pipelineConfig) !== JSON.stringify(oldState.pipelineConfig);
      const sastChanged = JSON.stringify(newState.sastFindings) !== JSON.stringify(oldState.sastFindings);
      const scaChanged = JSON.stringify(newState.dependencies) !== JSON.stringify(oldState.dependencies);
      const secretsChanged = JSON.stringify(newState.secretMatches) !== JSON.stringify(oldState.secretMatches);
      const iacChanged = JSON.stringify(newState.terraformResources) !== JSON.stringify(oldState.terraformResources);
      const containerChanged = JSON.stringify(newState.containerImages) !== JSON.stringify(oldState.containerImages);

      if (pipelineConfigChanged || sastChanged || scaChanged || secretsChanged || iacChanged || containerChanged) {
        newState.testedPipelinePassed = false;
      }

      const slsaChanged = JSON.stringify(newState.slsaAttestation) !== JSON.stringify(oldState.slsaAttestation);
      if (slsaChanged) {
        newState.testedProvenancePassed = false;
      }

      const artifactStateChanged = JSON.stringify(newState.artifactState) !== JSON.stringify(oldState.artifactState);
      const signaturesChanged = JSON.stringify(newState.signatures) !== JSON.stringify(oldState.signatures);
      if (artifactStateChanged || signaturesChanged) {
        newState.testedArtifactIntegrityPassed = false;
      }

      return { masterState: newState };
    }),
  resetMasterState: () => set({ masterState: createDefaultDevSecOpsMasterState() })
}));
