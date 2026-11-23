# ZORG — Interactive Cybersecurity Simulation Laboratory

A deterministic, event-driven cybersecurity learning platform. It simulates enterprise infrastructure, protocol behavior, and defensive/offensive security concepts across multiple cyber domains. All cyber exercises are educational simulations and operate on synthetic lab state.

---

## 🌟 Key Features

- **Enterprise Digital Twin (NEXORA Live Twin)**:
  - 3D WebGL data center and workstation visualization with 2D schematic fallback.
  - Physical cabling, switchport VLAN assignments, PDU power loads, and ambient temperature monitoring.
- **Enterprise Reality Engine**:
  - **Active Directory & Kerberos**: simulated authentication exchanges, tickets, SPN resolution, and group evaluation.
  - **Group Policy Management Console (GPMC)**: LSDOU inheritance, Enforced, Block Inheritance, WMI filtering, and simulated Windows consequences.
  - **Virtual Windows Desktop**: simulated Shell, File Explorer, NTFS access checks, SMB shares, Services Console, Task Manager, and Event Viewer.
  - **Network & Perimeter Firewall**: first-match rule evaluation, CIDR boundary verification, loopback isolation, and port-specific filtering.
- **Specialized Workstations**:
  - **SOC Workstation**: incident triage, SIEM alert analysis, correlation, and MITRE ATT&CK mapping.
  - **Digital Forensics Lab**: memory/disk artifact analysis, timeline reconstruction, and hash verification.
  - **Threat Hunting**: hypothesis validation, event-query construction, and defensive technique detection.
  - **DevSecOps Pipeline**: SAST, DAST, SCA dependency scanning, and secret detection.
  - **Cloud & Kubernetes Security**: RBAC auditing, NetworkPolicy enforcement, container isolation, and admission controller validation.
- **Simulation Engine & Clock**:
  - Authoritative virtual clock with speed scaling, seeking, pause/resume, and causal event tracing.
- **Bilingual Interface**:
  - Native Arabic (RTL) and English (LTR) with directional layout persistence.

---

## 🏗️ Architecture

Refer to the technical specifications in `docs/`:
- [`docs/SIMULATION_ENGINE.md`](docs/SIMULATION_ENGINE.md): runtime, event loop, clock, and packet-engine architecture.
- [`docs/SIMULATION_FIDELITY.md`](docs/SIMULATION_FIDELITY.md): protocol fidelity and labeled educational simplifications.
- [`docs/THREAT_HUNTING_V16.md`](docs/THREAT_HUNTING_V16.md): threat-hunting scenarios and evaluation logic.
- [`docs/UI_VISUAL_QA_PHASE4B.md`](docs/UI_VISUAL_QA_PHASE4B.md): responsive layout and RTL standards.
- [`security_spec.md`](security_spec.md): Firestore security boundaries and operational requirements.

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.1+ recommended)
- [Node.js](https://nodejs.org/) (v20+)

### Installation

```bash
git clone https://github.com/almaliki89/Interactive-Cybersecurity-Simulation-Laboratory.git
cd Interactive-Cybersecurity-Simulation-Laboratory
bun install --frozen-lockfile
```

### Running locally

```bash
bun run dev
```

Visit `http://localhost:3000`.

---

## 🧪 Testing & Verification

```bash
bun run lint
bun run test
bun run build
bun run test:e2e
```

The CI workflow runs TypeScript checks, unit tests, production build, and Playwright visual/E2E tests.

---

## 🛡️ Security Model

- Cyber exercises run against synthetic simulation state; they do not execute actions against real third-party systems.
- Client-side validators and local progress checks improve the learning experience but are not tamper-proof evidence or accredited certification.
- Verified users can read only their own Firestore profile and learning-progress document.
- Browser clients cannot create or modify cloud progress records. A future trusted server-side evaluator is required for authoritative achievement records.
- Telemetry is append-only, write-only to clients, and restricted to a bounded schema.
- See [`security_spec.md`](security_spec.md) for the trust boundary and deployment checklist.
