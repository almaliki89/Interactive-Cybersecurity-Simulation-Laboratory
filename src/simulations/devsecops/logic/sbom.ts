/**
 * OMEGA V15 — Software Bill of Materials (SBOM) & SLSA Provenance Engine
 * Generates CycloneDX / SPDX SBOM graphs and verifies SLSA Supply Chain Attestations.
 */

import { SbomComponent, SlsaAttestation } from './types';

export function getSampleSbomComponents(): SbomComponent[] {
  return [
    {
      id: 'sbom-react',
      name: 'react',
      version: '19.0.1',
      purl: 'pkg:npm/react@19.0.1',
      type: 'framework',
      license: 'MIT',
      supplier: 'Meta Open Source',
      hashes: [{ algo: 'SHA-256', digest: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d' }],
    },
    {
      id: 'sbom-express',
      name: 'express',
      version: '4.21.2',
      purl: 'pkg:npm/express@4.21.2',
      type: 'library',
      license: 'MIT',
      supplier: 'OpenJS Foundation',
      hashes: [{ algo: 'SHA-256', digest: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d' }],
    },
    {
      id: 'sbom-distroless',
      name: 'gcr.io/distroless/static-debian12',
      version: 'nonroot',
      purl: 'pkg:oci/distroless-static@sha256:881f...',
      type: 'container',
      license: 'Apache-2.0',
      supplier: 'Google Container Registry',
      hashes: [{ algo: 'SHA-256', digest: '881f3a2b1c0d9e8f7a6b5c4d3e2f1a0b' }],
    },
  ];
}

export function getInitialSlsaAttestation(): SlsaAttestation {
  return {
    slsaLevel: 3,
    builderId: 'https://github.com/actions/runner',
    buildType: 'https://slsa.dev/provenance/v1',
    materials: [
      { uri: 'git+https://github.com/nexora/enterprise-platform', digest: 'sha256:7f9a28b6...' },
    ],
    isSignedRekorLog: true,
    verified: true,
  };
}
