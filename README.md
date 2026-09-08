# TRACE-X: AI-Powered Email Forensics & SOC Threat Intelligence Platform

> **Smart India Hackathon (SIH 2026) Prototype — Problem Statement SIH26106**  
> *Deterministic Forensic Telemetry • RFC 5322 MIME Parsing • Cryptographic Chain-of-Custody • Hybrid Risk Scoring*

---

## 1. Executive Summary & Problem Overview

Modern threat actors routinely bypass simple content filters using executive impersonation (BEC), lookalike domains (homoglyphs), diverted Reply-To addresses, and Tor/bulletproof proxy relay chains. 

**TRACE-X** transforms raw, suspicious emails into structured, court-admissible forensic dossiers. Rather than operating as an unverifiable black-box AI classifier or hallucinating chatbot, TRACE-X implements a **defense-in-depth, explainable SOC forensic engine**:

1. **Exact-Byte Evidence Ingestion** — True raw-byte SHA-256/SHA-1/MD5 calculation upon upload; zero synthetic hashes.
2. **Hop-by-Hop SMTP Relay Forensics** — Parses `Received` header chains bottom-up, geolocates intermediate relay nodes, and flags Tor exit nodes & bulletproof proxies.
3. **Authentication Verification** — Verifies SPF, DKIM, and DMARC alignment status and records policy actions (`reject`, `quarantine`, `none`).
4. **Header Anomaly & Homoglyph Detection** — Identifies visual deception (e.g. `paypaI` with Latin capital `I`), executive display name spoofing, and diverted `Reply-To` / `Return-Path` mismatches.
5. **Multi-Source Threat Intelligence** — Integrated lookups (VirusTotal v3, AbuseIPDB v2, PhishTank, URLhaus, and authoritative ICANN RDAP) with automatic local caching.
6. **Campaign Attribution & Cluster Correlation** — Discovers shared adversary infrastructure across distinct incidents (`CMP-FIN-2026-04`, `CMP-M365-2026-11`).
7. **Tamper-Evident Audit Ledger** — Cryptographic SHA-256 hash-chain guaranteeing evidence integrity and immutability for judicial compliance.
8. **Forensic Reporting Engine** — Instant generation of court-ready PDF investigative dossiers, structured IOC CSV exports, and machine-readable JSON dossiers.

---

## 2. Core Security Invariants & Compliance Guarantees

* **Zero Fake Hashes**: Every evidence hash (SHA-256, SHA-1, MD5) is computed directly from raw uploaded file bytes (`hashlib.sha256(raw_bytes)`).
* **Safe Attachment Handling**: Attachments are inspected exclusively for metadata, MIME type, size, and cryptographic hash. **No attachment is ever executed or opened.**
* **Zero Client-Side Secret Leakage**: All threat intelligence API keys are loaded server-side through backend environment variables (`.env`). No `VITE_*` keys or secrets exist in the frontend bundle.
* **Safe Offline Fallbacks**: In LIVE mode, if a threat intelligence provider is unreachable or unconfigured, the system reports `"Provider unavailable"` or queries community cache rather than fabricating artificial verdicts.
* **Tamper-Evident Hash Chain**: Each audit block cryptographically binds the previous block's SHA-256 hash:
  $$\text{Hash}_n = \text{SHA256}(\text{Hash}_{n-1} + \text{Timestamp} + \text{Analyst} + \text{Action} + \text{Resource} + \text{Status})$$

---

## 3. Architecture & Tech Stack

```
TRACE-X/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/  # FastAPI REST routes (auth, analyze, cases, intelligence, campaigns, audit, reports, settings)
│   │   ├── core/              # Config, NIST PBKDF2 hashing, PyJWT tokens, RBAC dependencies
│   │   ├── integrations/      # VirusTotal, AbuseIPDB, PhishTank, URLhaus, RDAP, Gemini LLM adapters
│   │   ├── models/            # Pydantic schemas aligned with forensic specifications
│   │   └── services/          # Evidence hashing, MIME parser, header analyzer, auth analyzer, risk engine,
│   │                          # audit ledger, campaign engine, explainability copilot, PDF/CSV reports
│   └── tests/                 # 25 automated pytest suites (100% green)
├── frontend/
│   ├── src/
│   │   ├── components/        # AppLayout, ForensicGraph, navigation, metric cards
│   │   ├── pages/             # Dashboard, AnalyzeEmail, Investigation, ThreatIntel, Campaigns, Cases, Reports, Settings, Audit, Login
│   │   └── services/          # Typed API client with JWT token management & offline fallbacks
│   └── package.json           # React 19 + TypeScript + Vite + Tailwind CSS
├── synthetic_phish.eml        # Realistic synthetic phishing email for SIH demonstration
└── README.md                  # System documentation & SIH demo script
```

---

## 4. Quickstart Guide (Localhost Windows Setup)

### Prerequisites
* Python 3.10+ (Installed on system PATH)
* Node.js v18+ & npm
* Windows PowerShell or cmd.exe

---

### Step 1: Start Backend (FastAPI)

Open a terminal in the project directory:

```powershell
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Launch FastAPI development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

* **Backend Health Check**: Open browser to `http://127.0.0.1:8000/api/v1/health`
* **Swagger API Documentation**: Open `http://127.0.0.1:8000/docs`

---

### Step 2: Start Frontend (React + Vite)

Open a second terminal window:

```powershell
cd frontend

# Install packages
cmd.exe /c "npm install"

# Start Vite dev server
cmd.exe /c "npm run dev"
```

* **SOC Web Console**: Open `http://localhost:5173`

---

### Step 3: Run Test Suites

To verify all system features and cryptographic engines:

```powershell
# Backend automated tests (25/25 Pytests)
cd backend
.venv\Scripts\pytest -v

# Frontend TypeScript check & bundle build
cd ..\frontend
cmd.exe /c "npm run build"
```

---

## 5. Pre-Seeded Test Credentials

TRACE-X includes role-based access control (RBAC) with pre-seeded NIST PBKDF2 credentials. Quick-Auth buttons are available directly on the login screen for instant hackathon evaluation:

| Role | Username / Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **SOC Lead Analyst** | `analyst@tracex.local` | `Analyst@123` | Triage, Header Forensics, AI Assistant, Dossier Export |
| **SOC Administrator** | `admin@tracex.local` | `Admin@123` | Full Access, Settings, System Weights, Chain Audit |

---

## 6. Endpoints Reference

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/api/v1/health` | Service status, timestamp, and active version |
| **Auth** | `POST` | `/api/v1/auth/login` | Issues signed JWT bearer tokens |
| **Auth** | `GET` | `/api/v1/auth/me` | Authenticated analyst profile and role |
| **Analysis** | `POST` | `/api/v1/analyze` | Multipart `.eml` upload with full forensic extraction |
| **Analysis** | `POST` | `/api/v1/analyze/raw` | Analyzes raw RFC 5322 pasted email text |
| **Cases** | `GET` | `/api/v1/cases` | Lists active investigation dossiers |
| **Cases** | `GET` | `/api/v1/cases/{id}` | Retrieves single detailed case dossier |
| **AI Copilot**| `POST`| `/api/v1/cases/{id}/chat` | Interactive forensic Q&A grounded in case data |
| **Intel** | `POST` | `/api/v1/intelligence/lookup`| Reputation lookups for IPs, Domains, and URLs |
| **Intel** | `GET` | `/api/v1/intelligence/providers`| Real-time connectivity and status of threat feeds |
| **Campaigns**| `GET` | `/api/v1/campaigns` | Cross-incident correlated clusters |
| **Audit** | `GET` | `/api/v1/audit` | Retrieves append-only tamper-evident hash ledger |
| **Audit** | `POST` | `/api/v1/audit/verify` | Re-calculates SHA-256 chain from genesis block |
| **Reports** | `GET` | `/api/v1/reports/{id}/pdf` | Downloads court-ready forensic PDF document |
| **Reports** | `GET` | `/api/v1/reports/{id}/csv` | Exports verified Indicators of Compromise (IOCs) |
| **Reports** | `GET` | `/api/v1/reports/{id}/json`| Exports complete structured machine-readable JSON |
| **Settings**| `GET` | `/api/v1/settings` | Server settings, provider states, risk weightings |
| **Settings**| `POST`| `/api/v1/settings/weights` | Updates deterministic scoring weights (Admin only) |

---

## 7. SIH Judge Live Demonstration Script

Follow this step-by-step walkthrough during the hackathon evaluation:

### Step 1: Login & SOC Telemetry Sync
1. Navigate to `http://localhost:5173`.
2. Click **"Lead Analyst"** on the Quick-Auth panel (or sign in with `analyst@tracex.local` / `Analyst@123`).
3. Point out the top header: **`BACKEND: ONLINE`** with real-time heartbeat synchronization.

### Step 2: Ingest Synthetic Phishing Email
1. Click **"Analyze New Email"** in the sidebar or top banner.
2. Drag and drop the included test email: `synthetic_phish.eml` (or click "Load High-Risk Sample").
3. Point out the immediate raw evidence computation:
   - File Name: `synthetic_phish.eml`
   - **True Raw SHA-256**: `144b60e659b85c8e...` computed on the fly.
4. Click **"Run Deep Forensic Analysis"**.

### Step 3: Inspect Multi-Layer Forensic Telemetry
1. **Header Forensics & Relay Hops**:
   - Inspect the 3 SMTP hops reconstructed in reverse chronological order.
   - Note the flagged initial ingress hop: Tor Exit Node (`185.220.101.42`) via bulletproof host (`vps-bulletproof-mow.ru`).
2. **Authentication Telemetry**:
   - Point out `SPF: FAIL`, `DKIM: FAIL`, and `DMARC: FAIL (p=reject)`.
3. **Header Divergence & Homoglyph Deception**:
   - From header: `ceo-office@paypaI-billing-service.net` (uses capital `I` lookalike).
   - Diverted Reply-To: `financial-exec-settlement@proton.me`.
   - Bounce Return-Path: `bounce-gateway@relay-server-91.ru`.
4. **Investigation Graph**:
   - Click the **"Investigation Graph"** tab to see the node graph linking the sender, Tor egress IP, lookalike domain, and target recipient.

### Step 4: Ask TRACE-X AI Assistant (Interactive Copilot)
1. On the right panel, click the quick prompt: **"Why high risk?"**.
2. TRACE-X replies with deterministic evidence points (Tor first-hop, DMARC rejection, homoglyph domain, and $248,500 BEC wire request).
3. Type a custom question: *"What should accounting do immediately?"* and press Enter.

### Step 5: Export Evidence & Court Dossier
1. Click **"Generate Forensic Dossier (PDF)"** on the case header (or navigate to **Reports**).
2. Click **"Download PDF"** — open the generated PDF to show:
   - Court-ready header and investigation summary
   - Evidence SHA-256 checksum and chain-of-custody verification
   - Detailed IOC tables and technical indicators
3. Click **"IOC CSV"** and **"JSON Dossier"** to show multi-format enterprise export.

### Step 6: Verify Cryptographic Audit Ledger
1. Click **"Audit Log"** in the sidebar navigation.
2. Explain the append-only SHA-256 hash-chain where each block cryptographically seals the previous block's hash.
3. Click **"Verify Ledger Integrity"** — the engine re-calculates all hashes from the genesis block and displays:
   - `CHAIN VERIFIED (0 Tampering Detected)`
   - Genesis Root and Latest Sealed Hash.

### Step 7: Inspect Adversary Campaign Correlation
1. Click **"Threat Campaigns"** in the sidebar.
2. Highlight linked cluster **`CMP-FIN-2026-04` (Lazarus / FIN7 Proxy Cluster)** showing how TRACE-X correlates multiple employee emails back to the same bulletproof infrastructure.

---

## 8. License & Attribution
Developed for the **Smart India Hackathon (SIH 2026)** under Problem Statement **SIH26106**.  
Engineered with zero third-party cloud runtime dependencies required for local evaluation.
