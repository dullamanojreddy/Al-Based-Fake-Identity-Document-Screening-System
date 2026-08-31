# SENTINEL-ID Project Context

## Project Overview
**SENTINEL-ID** is an AI-Powered Identity & Travel Document Screening Platform developed for the **Ministry of Home Affairs (Sashastra Seema Bal - SSB, Police II Division)** for **Smart India Hackathon 2026 (Problem Statement ID: SIH26188)**.

The platform provides border security personnel with a decision-support command interface combining:
1. Optical Character Recognition (OCR) with confidence scoring & field mapping
2. ICAO Doc 9303 Machine Readable Zone (MRZ) parser & 7-3-1 check digit validation
3. Multi-signal document tampering forensics (Error Level Analysis - ELA heatmaps, Splicing detection, Font baseline misalignment, Stamp & seal forgery, EXIF metadata inspection)
4. 1:1 facial biometric matching with anti-spoofing / presentation attack detection
5. Prototype Interpol & National SSB Watchlist adapter
6. Explainable evidence fusion & weighted risk engine
7. Cryptographically tamper-evident SHA-256 hash-chained audit ledger
8. Official MHA forensic screening report generation (PDF & JSON export)

---

## SIH Problem
- **Problem ID:** SIH26188
- **Organization:** Ministry of Home Affairs
- **Department:** Sashastra Seema Bal (SSB), Police II Division
- **Category:** Software
- **Theme:** Blockchain & Cybersecurity
- **Project Type:** AI + Computer Vision + Document Forensics + Cybersecurity + Biometric Identity Verification

---

## Current Goal
Implement the complete, production-quality, end-to-end **SENTINEL-ID** prototype supporting all 4 SIH modules, 10 synthetic demonstration scenarios, multi-layer forensic image inspection, cryptographic audit verification, and full documentation.

---

## Technology Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Framer Motion
- **Backend:** Node.js, Express, TypeScript, Multer, Helmet, Winston, Google Gemini 2.5 Flash Vision Multimodal API
- **Forensic Engines:** HTML5 Canvas Error Level Analysis (ELA), 7-3-1 Weight Modulo-10 ICAO MRZ Engine, Cosine Biometric Similarity, Cryptographic SHA-256 Hash Chaining
- **Database / Storage:** In-Memory & Local Storage State Cache with REST API Sync

---

## Architecture
```
                          ┌──────────────────────────┐
                          │   SENTINEL-ID React UI   │
                          │   TypeScript + Vite SOC  │
                          └─────────────┬────────────┘
                                        │
                                        │ REST / Events
                                        ▼
                          ┌──────────────────────────┐
                          │    FastAPI / Express     │
                          │    API Server Engine     │
                          └─────────────┬────────────┘
                                        │
             ┌──────────────────────────┼─────────────────────────┐
             │                          │                         │
             ▼                          ▼                         ▼
    ┌────────────────┐         ┌────────────────┐        ┌────────────────┐
    │ Screening      │         │ Authentication │        │ Hash-Chained   │
    │ Orchestrator   │         │ / RBAC         │        │ Audit Ledger   │
    └────────┬───────┘         └────────────────┘        └────────────────┘
             │
   ┌─────────┼──────────────────────────┬─────────────────────────┬────────────┐
   │         │                          │                         │            │
   ▼         ▼                          ▼                         ▼            ▼
┌──────┐ ┌──────┐ ┌──────────────────────────┐ ┌────────┐ ┌─────────────┐ ┌──────────┐
│ OCR  │ │ MRZ  │ │ Multi-Signal Tamper      │ │ Face   │ │ Metadata &  │ │ Watchlist│
│Engine│ │Engine│ │ Forensics (ELA/Splicing) │ │Verify  │ │ Copy-Move   │ │ Adapter  │
└──────┘ └──────┘ └──────────────────────────┘ └────────┘ └─────────────┘ └──────────┘
             │
             ▼
      ┌──────────────┐
      │ Evidence     │
      │ Fusion       │
      └───────┬──────┘
              ▼
      ┌──────────────┐
      │ Risk Engine  │
      └───────┬──────┘
              ▼
      ┌──────────────┐
      │ State / DB   │
      └──────────────┘
```

---

## Repository Structure
```
sentinel-id/
├── docs/
│   ├── PROJECT_CONTEXT.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   ├── AI_MODELS.md
│   ├── DATASETS.md
│   ├── SECURITY.md
│   ├── SIH_DEMO.md
│   └── LIMITATIONS.md
├── server/
│   └── src/
│       ├── app.ts
│       ├── index.ts
│       ├── middleware/
│       └── modules/
│           ├── auth/
│           └── screening/
├── src/
│   ├── components/
│   │   ├── AuditLedgerView.tsx
│   │   ├── BiometricVerificationCard.tsx
│   │   ├── ExtractedFieldsTable.tsx
│   │   ├── ForensicFindingsPanel.tsx
│   │   ├── ForensicImageViewer.tsx
│   │   ├── Header.tsx
│   │   ├── IntelligenceDashboard.tsx
│   │   ├── LiveWebcamModal.tsx
│   │   ├── Login.tsx
│   │   ├── ModelRegistryView.tsx
│   │   ├── MRZVerificationCard.tsx
│   │   ├── OfficerReviewPanel.tsx
│   │   ├── OfficialDossierModal.tsx
│   │   ├── RiskScoreCard.tsx
│   │   ├── ScreeningWorkbench.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SystemSettingsView.tsx
│   │   ├── TamperDetectionCard.tsx
│   │   ├── WatchlistAlertCard.tsx
│   │   └── WatchlistDatabaseView.tsx
│   ├── data/
│   │   └── sampleScreenings.ts
│   ├── utils/
│   │   ├── auditLedger.ts
│   │   ├── biometricsEngine.ts
│   │   ├── forensicsEngine.ts
│   │   ├── mrzValidator.ts
│   │   └── riskEngine.ts
│   ├── types.ts
│   ├── App.tsx
│   └── main.tsx
└── README.md
```

---

## Implemented Features
- [x] Full RBAC & Officer authentication with checkpoint selection
- [x] 10 Synthetic SIH demo cases covering all common border fraud vectors
- [x] Multi-layer interactive forensic canvas viewer (Original, OCR Overlay, ELA Heatmap, Noise Gradient, Region Masks)
- [x] ICAO Doc 9303 TD1, TD2, TD3 MRZ engine with 7-3-1 weight check digit verification
- [x] VIZ ↔ MRZ cross-validation discrepancy detector
- [x] Error Level Analysis (ELA) compression variance calculator
- [x] Splicing boundary, font baseline misalignment, forged stamp, and EXIF software trace detectors
- [x] 1:1 Facial biometrics with anti-spoofing and live webcam support
- [x] Explainable Evidence Fusion and Risk Engine (`LOW REVIEW PRIORITY`, `REVIEW RECOMMENDED`, `ENHANCED REVIEW RECOMMENDED`)
- [x] Cryptographic SHA-256 Hash-Chained Audit Ledger with live chain verification and tamper simulation
- [x] Official MHA / SSB Forensic Screening Dossier generation with PDF and JSON export
- [x] Model Registry tracking version hashes and threshold configurations

---

## Technical Decisions
1. **Decision Support Philosophy:** The system calculates explainable risk scores and presents evidence; the final entry/detention decision always remains with the authorized officer.
2. **Independent Signal Verification:** Anomaly detection does not rely on a single classifier. If an altered DOB is present, both the OCR ↔ MRZ mismatch engine and the forensic font/compression analyzer flag it independently.
3. **Cryptographic Hash Chain:** Implements a verifiable blockchain-style SHA-256 hash chain (`current_hash = SHA256(previous_hash + event_json + timestamp)`) providing cryptographic immutability without requiring third-party blockchain bloat.
4. **Privacy-Preserving Synthetic Demo Data:** Uses zero real-world PII in demo datasets, preventing privacy violations during hackathon evaluation.

---

## Current Demo State
- Ready for full jury presentation with 10 synthetic test cases.
- All frontend and backend builds compile with 0 errors.

---
**Last Updated:** 2026-08-31T22:15:00+05:30
