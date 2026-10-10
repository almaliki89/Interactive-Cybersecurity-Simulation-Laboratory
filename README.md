# OMEGA — Interactive Cybersecurity Simulation Laboratory

A production-grade, deterministic, and event-driven cybersecurity simulation platform. OMEGA simulates enterprise infrastructure, protocol behaviors, and offensive/defensive scenarios across 10 macro domains and 60 cyber worlds with complete cause-and-effect fidelity.

---

## 🌟 Key Features

- **Enterprise Digital Twin (NEXORA Live Twin)**:
  - 3D WebGL data center and workstation visualization with 2D schematic fallback.
  - Physical cabling, switchport VLAN assignments, PDU power loads, and ambient temperature monitoring.
- **Enterprise Reality Engine**:
  - **Active Directory & Kerberos**: AS-REQ/REP pre-authentication, TGT and TGS-REQ ticket granting, SPN resolution, and PAC group evaluation.
  - **Group Policy Management Console (GPMC)**: LSDOU inheritance resolution, Enforced (No Override), Block Inheritance, WMI filtering, and dynamic consequence bridges to the Windows Registry, services, and firewall.
  - **Virtual Windows Desktop**: Simulated Windows Shell, File Explorer with NTFS DACL/ACE evaluation and SMB UNC shares (`\\FILE01\Finance`), Services Console (`LanmanServer`, `KDC`, `NTDS`), Task Manager, and Event Viewer.
  - **Network & Perimeter Firewall**: First-match rule evaluation, CIDR boundary verification, loopback isolation, and port-specific filtering.
- **Specialized Workstations**:
  - **SOC Workstation**: Incident triage, SIEM alert analysis, rule correlation, and MITRE ATT&CK mapping.
  - **Digital Forensics Lab**: Memory dump analysis, disk image forensics, artifact timeline reconstruction, and hash verification.
  - **Threat Hunting**: Hypothesis validation, event log query construction, and adversarial technique detection.
  - **DevSecOps Pipeline**: SAST, DAST, SCA dependency scanning, and secret detection.
  - **Cloud & Kubernetes Security**: RBAC auditing, NetworkPolicy enforcement, container isolation, and admission controller validation.
- **Simulation Engine & Clock**:
  - Authoritative virtual clock with speed scaling (0.25x to 4.0x), seeking, pause/resume, and causal event tracing.
- **Bilingual Interface**:
  - Native Arabic (RTL) and English (LTR) with directional layout persistence.

---

## 🏗️ Architecture

Refer to technical specifications in the `docs/` directory:
- [`docs/SIMULATION_ENGINE.md`](docs/SIMULATION_ENGINE.md): Core runtime, event loop, clock, and packet engine architecture.
- [`docs/SIMULATION_FIDELITY.md`](docs/SIMULATION_FIDELITY.md): Protocol fidelity model and labeled educational simplifications.
- [`docs/THREAT_HUNTING_V16.md`](docs/THREAT_HUNTING_V16.md): Threat hunting engine scenarios and evaluation logic.
- [`docs/UI_VISUAL_QA_PHASE4B.md`](docs/UI_VISUAL_QA_PHASE4B.md): Cross-device responsive layout standards and RTL guidelines.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+) or [Bun](https://bun.sh/) (v1.1+)

### Installation

```bash
# Clone the repository
git clone https://github.com/almaliki89/Interactive-Cybersecurity-Simulation-Laboratory.git
cd Interactive-Cybersecurity-Simulation-Laboratory

# Install dependencies (using Bun or npm)
bun install
# or: npm install
```

### Running Locally

```bash
# Start the development server on port 3000
bun run dev
# or: npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🧪 Testing & Verification

The repository enforces strict deterministic testing across unit, integration, and browser end-to-end (E2E) suites.

```bash
# Run TypeScript type check
bun run lint
# or: npm run lint

# Run all unit and integration tests (Vitest)
bun run test
# or: npm test

# Build application for production
bun run build
# or: npm run build

# Run Playwright E2E browser test suites
bun run test:e2e
# or: npm run test:e2e
```

### E2E Test Suites (`tests/e2e/`)
- `windows-desktop-filesystem.spec.ts`: Windows login, File Explorer UNC shares, NTFS access controls, Services console lifecycle, and Recycle Bin operations.
- `group-policy-reality.spec.ts`: GPO hierarchy, inheritance blocking, SMB firewall rule injection, and RSOP calculation.
- `active-directory-kerberos.spec.ts`: Kerberos pre-auth, TGT issuance, TGS ticket validation, SPN lookup, and DC offline failure recovery.
- `visual-qa.spec.ts`: Responsive layouts (1440px desktop to 360px mobile) and Arabic RTL rendering integrity.

---

## 🛡️ Security Model

- Deterministic security verification without reliance on system time (`Date.now()`) or non-deterministic math.
- Hardened authentication with strict password checking, account lockout logic, and explicit educational bypass isolation.
- Perimeter and host firewall evaluation enforcing strict CIDR bounds, protocol matching, and explicit deny precedence.
