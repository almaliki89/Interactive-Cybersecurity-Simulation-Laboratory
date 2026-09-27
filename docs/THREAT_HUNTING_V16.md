# OMEGA V16 — Threat Hunting, Detection Engineering & Threat Intelligence World

## 1. Executive Summary

OMEGA V16 establishes a production-grade, deterministic **Threat Hunting, Detection Engineering, and Threat Intelligence** simulation world. It models the end-to-end workflow of an elite enterprise threat hunter:

$$\text{Hypothesis} \longrightarrow \text{Data Collection} \longrightarrow \text{Telemetry Exploration} \longrightarrow \text{Query Engine} \longrightarrow \text{Behavioral Correlation} \longrightarrow \text{Threat Intel} \longrightarrow \text{Findings} \longrightarrow \text{Detection Engineering} \longrightarrow \text{Tuning} \longrightarrow \text{Handoff (SOC \& Forensics)}$$

---

## 2. Architecture & Telemetry Pipeline

Threat Hunting directly consumes real normalized events across all OMEGA domains:
- **Windows Security** (Events 4624, 4625, 4688, 4728, 1102)
- **Active Directory & Kerberos** (AS-REQ, TGS-REQ, Pre-auth failure)
- **Network Telemetry** (Packet blocks, TCP connection beacons, ACL matches)
- **Cloud Infrastructure** (STS AssumeRole, S3 GetObject, IAM role escalation)
- **Kubernetes & Containers** (HostPath mounts, privileged pods, sudo escalation)
- **DevSecOps** (Unverified commits, tainted packages, CI runner integrity violations)

```
                       ┌────────────────────────────┐
                       │     SimulationRuntime      │
                       └─────────────┬──────────────┘
                                     │
                                     ▼
                       ┌────────────────────────────┐
                       │    Universal Normalizer    │
                       │   (normalizeRuntimeEvent)  │
                       └─────────────┬──────────────┘
                                     │
                                     ▼
                       ┌────────────────────────────┐
                       │     Hunt Data Layer        │
                       │ (Preserves rawEventId, etc)│
                       └─────────────┬──────────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          ▼                          ▼                          ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ Safe Query Engine│       │Correlation Engine│       │ Threat Intel     │
│ (AST Evaluation) │       │ (Entity Pivoting)│       │  (IOC/IOA Match) │
└─────────┬────────┘       └─────────┬────────┘       └─────────┬────────┘
          │                          │                          │
          └──────────────────────────┼──────────────────────────┘
                                     │
                                     ▼
                       ┌────────────────────────────┐
                       │   Findings Documentation   │
                       │(Confidence Breakdown Score)│
                       └─────────────┬──────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
         ┌─────────────────────┐           ┌─────────────────────┐
         │ Detection Rule Engine│          │  Forensics Handoff  │
         │ (Tuning & Validation)│          │ (Canonical EVD-...) │
         └──────────┬──────────┘           └─────────────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │     SOC Handoff     │
         │   (Incident Queue)  │
         └─────────────────────┘
```

---

## 3. Safe Query Language (HQL)

The query engine parses and evaluates hunting expressions without `eval()` or arbitrary execution:
- **Field Equality / Inequality**: `sourceWorld = WINDOWS`, `outcome != SUCCESS`
- **List Membership**: `severity IN (threat, critical)`
- **Substring Match**: `host CONTAINS "FIN"`, `resource CONTAINS "Vault"`
- **Numeric Range**: `virtualTime BETWEEN 50 AND 120`
- **Compound Logic**: `AND`, `OR`, `NOT`, and parenthesized sub-clauses `( ... )`

---

## 4. Behavioral Correlation & Entity Pivoting

Correlates events sharing common identifiers within a deterministic virtual time window (default 600s):
- **Entities Supported**: User, Host, Source IP, Process, Resource, Repository, Artifact, Container.
- **Entity Pivot**: Clicking any entity queries and isolates all interconnected cross-world telemetry.
- **Graph Visualization**: Derives `AUTHENTICATED_TO`, `SPAWNED_ON`, `CONNECTED_TO`, `ACCESSED`, `COMMITTED_TO` edges.

---

## 5. Threat Intelligence Knowledge Layer

- **Deterministic Indicator Catalog**: IP C2 nodes, Dropper endpoints, Process names, SHA-256 malware checksums, Behavioral IOAs (e.g. `AUTH_BURST_THEN_SUCCESS`, `CONTAINER_HOSTPATH_PRIVILEGED`).
- **Threat Actor Profiles**: SILVER_JACKAL (APT-NEX-01) and CLOUD_DRIFTER with MITRE ATT&CK TTP mappings.
- **Automated Telemetry Matcher**: Evaluates real telemetry against known indicators and returns matched events.

---

## 6. Detection Engineering & Tuning

- **Rule Logic**: Single Event, Threshold over Time Window, and Sequence detection.
- **Benign Traffic Noise**: Background IT admin testing and health check events provide realistic test data.
- **Tuning Metrics**: True Positives, False Positives, Precision, Recall.
- **"What Changed" Delta**: Dynamically computes and explains the reduction in noise when exclusions and thresholds are adjusted.
- **Publish to SOC**: Validated rules transition to `PUBLISHED` status and become active in the SOC SIEM catalog.

---

## 7. Canonical Handoffs

- **SOC Handoff**: Converts finding into `SocHandoffPackage` retaining `rawEventId`, `eventIds`, priority (`P1_CRITICAL` to `P4_LOW`), and threat summary.
- **Forensics Handoff**: Converts supporting telemetry into canonical forensic evidence items via `createForensicEvidenceFromTelemetry`, assigning persistent IDs `EVD-${sourceWorld}-${rawEventId}` with verified SHA-256 hashes.

---

## 8. Master Threat Hunting Challenge (HUNT-MASTER)

A multi-world campaign requiring:
1. Validating the full-chain APT hypothesis.
2. Executing multi-source telemetry queries.
3. Recording validated findings with $\ge 4$ supporting events preserving canonical `rawEventId`.
4. Tuning a production detection rule achieving 0 false positives.
5. Dispatching the incident to SOC.
6. Preserving evidence in Forensics with canonical `EVD-...` identifiers.
