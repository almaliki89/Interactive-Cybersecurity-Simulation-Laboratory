# OMEGA Simulation Engine — Fidelity & Educational Abstraction Specification

This document details the fidelity model of the OMEGA simulation engines, explicitly noting educational abstractions and design tradeoffs compared to real-world operating systems and enterprise protocols.

---

## 1. Active Directory & Kerberos Model

### Implemented Simulation Behaviors
- **Enterprise Hierarchy**: Forest (`NEXORA.LOCAL`), Organizational Units (`OU=Finance`, `OU=HR`, `OU=IT`, `OU=Servers`, `OU=Domain Controllers`), and Security Groups.
- **Security Identifiers (SIDs)**: Standard SID formats (`S-1-5-21-...`, Well-Known SIDs `S-1-5-32-544`, `S-1-5-11`).
- **Kerberos AS-REQ / AS-REP**: Password verification against account verifiers, TGT issuance with deterministic virtual-time expiration and renewal windows.
- **TGS-REQ / TGS-REP**: Service Principal Name (SPN) resolution (e.g. `cifs/FILE01.NEXORA.LOCAL`), PAC group generation, and workstation ticket caching.
- **Secure Channel & Domain Trust**: Workstation-to-DC secure channel health verification; simulates domain trust and unjoined workstation rejections.

### Educational Simplifications (Labeled)
- **Token Format**: Tickets use structured JSON payloads with HMAC token representations instead of raw ASN.1 DER binary Kerberos wire structures.
- **Clock Skew**: Evaluated against the deterministic `SimulationClock` virtual time instead of physical host UTC timestamps.
- **Pass-the-Ticket / Injection**: Designed for educational demonstration of ticket presentation and caching behaviors without requiring full binary ticket extraction.

---

## 2. DNS Engine Model

### Implemented Simulation Behaviors
- **Authoritative Resolution**: A-records, SRV records for domain controllers (`_kerberos._tcp.dc._msdcs.NEXORA.LOCAL`), and CNAME aliases.
- **Network Path Dependency**: Physical link checks and perimeter firewall port 53 (UDP/TCP) evaluation before query fulfillment.
- **Client Cache**: Workstation resolver caching with TTL tracking.

### Educational Simplifications (Labeled)
- In-memory routing table rather than recursive root-hints root zone traversal.
- EDNS0 and DNSSEC validation are simplified to boolean integrity indicators.

---

## 3. TCP & Network Model

### Implemented Simulation Behaviors
- **3-Way Handshake**: Strict state progression (`CLOSED` → `SYN_SENT` → `SYN_RECEIVED` → `ESTABLISHED` → `FIN_WAIT` / `CLOSED`).
- **Packet Lifecycle**: Visual packet travel with virtual-time latency, link status checks, and switch port learning (MAC address table).
- **VLAN Isolation**: 802.1Q tagged frame routing through `CORE-SW01` and perimeter firewall.

### Educational Simplifications (Labeled)
- Sliding window flow control and Congestion Avoidance (CUBIC/BBR) are abstracted to deterministic per-connection throughput metrics.
- TCP sequence numbers are simulated for handshake validation rather than full raw socket byte-stream buffering.

---

## 4. SMB & File System (NTFS ACL) Model

### Implemented Simulation Behaviors
- **UNC Path Navigation**: UNC shares (`\\FILE01\Finance`, `\\FILE01\HR`) resolved via DNS, SMB service availability (`LanmanServer`), and firewall port 445.
- **NTFS DACL / ACE Evaluation**: Discretionary Access Control Lists evaluating `DENY` before `ALLOW` ACEs, matching user and group SIDs from the Kerberos PAC.
- **Virtual File System**: Hierarchical file and folder creation, deletion, recycling, and restoration in a deterministic virtual disk structure.

### Educational Simplifications (Labeled)
- Filesystem storage is held in deterministic in-memory structures rather than raw disk blocks or VHDs.
- SMB protocol negotiation is modeled at the RPC/SMB2 command level rather than binary SMB framing.

---

## 5. Group Policy & RSOP Model

### Implemented Simulation Behaviors
- **LSDOU Precedence Order**: Local → Site → Domain → OU policy resolution.
- **Enforcement Rules**: `Enforced` (No Override) and `Block Inheritance` toggles accurately altering effective policy trees.
- **Security Filtering & WMI Filters**: SID-based security filtering and WMI query matching.
- **Consequence Bridges**: Dynamic policy consequences updating Windows Registry keys, stopping/starting Windows services, and injecting firewall packet filters.

### Educational Simplifications (Labeled)
- Policy refresh cycles are triggered on-demand or on virtual clock triggers rather than Windows background 90-minute random offsets.
- Client Side Extensions (CSE) model the primary security-relevant policies (Screen Lock, Service Status, Firewall, SMB, Script execution).
