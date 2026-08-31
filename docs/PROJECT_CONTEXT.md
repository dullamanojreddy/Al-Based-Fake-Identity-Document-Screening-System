# SENTINEL-ID Project Context

## Project Overview
**SENTINEL-ID** is an AI-Powered Identity & Travel Document Screening Platform developed for the **Ministry of Home Affairs (Sashastra Seema Bal - SSB, Police II Division)** for **Smart India Hackathon 2026 (Problem Statement ID: SIH26188)**.

The platform provides border security personnel with a decision-support command interface combining:
1. **Multi-Signal Document Classification & Structural Gate:** Gating non-identity files (college notes, memos, invoices, assignments, general PDFs, random images) **before** executing identity pipelines.
2. **Safe Optical Character Recognition (OCR) & Label Association:** Extracts fields only with affirmative label evidence and bounding box coordinates, eliminating hallucinated fields.
3. **ICAO Doc 9303 Machine Readable Zone (MRZ) Engine:** Universal parser & 7-3-1 modulo-10 check digit verification across TD1, TD2, TD3, MRV-A, and MRV-B formats.
4. **Multi-Signal Document Tampering Forensics:** Error Level Analysis (ELA) compression heatmaps, splicing boundary detection, font baseline misalignment, stamp & seal forgery, and EXIF metadata inspection.
5. **1:1 Facial Biometric Verification:** Cosine facial nodal geometry comparison with anti-spoofing presentation attack detection and live webcam capture.
6. **Verification Provider Abstraction:** Local demonstration provider with clearly marked authorized government gateway integration stubs (CIPA, SLTD, IVFRT).
7. **Explainable Evidence Fusion & Weighted Risk Engine:** Traceable findings linked directly to document bounding boxes.
8. **Cryptographically Tamper-Evident SHA-256 Hash-Chained Audit Ledger:** Immutable audit trail with live chain integrity validation.
9. **Official MHA Forensic Screening Report Generation:** Dossier generation with PDF and JSON export.

---

## Core System Principle
> **"IDENTIFY FIRST → VALIDATE SECOND → ANALYZE THIRD → DECIDE LAST"**
> 
> *The system is conservative: When uncertain or when an arbitrary non-identity file is uploaded, it returns `UNSUPPORTED_DOCUMENT` rather than hallucinating identity fields.*

---

## Pipeline Architecture
```text
UPLOAD FILE (Image / PDF)
          │
          ▼
1. FILE VALIDATION & HASHING
   - MIME type, extension, file size validation
   - SHA-256 Hashing for cryptographic audit ledger
          │
          ▼
2. MULTI-SIGNAL DOCUMENT CLASSIFICATION & STRUCTURAL GATE
   - Scan for ICAO Doc 9303 MRZ presence and formatting (TD1, TD2, TD3)
   - Scan for sovereign issuing headers and official credential tokens
   - Negative Evidence Scan (Academic notes, invoices, assignments, code, memos)
   - Compute `document_type_confidence` and `document_type_evidence[]`
          │
   ┌──────┴────────────────────────────────────────────────┐
   │                                                       │
   ▼                                                       ▼
[UNSUPPORTED / UNKNOWN DOCUMENT]             [SUPPORTED CREDENTIAL]
(Confidence >= 90%, isSupported = false)     (Passport, Visa, National ID, DL, Permit)
   │                                                       │
   ▼                                                       ▼
SAFE TERMINATION:                            EXECUTE TYPE-SPECIFIC PIPELINE:
- `status: "UNSUPPORTED_DOCUMENT"`           - OCR & Label-Associated Field Extraction
- `findings: []` (Empty)                     - MRZ Parser & 7-3-1 Modulo-10 Checksums
- `risk_score: null`                         - Field Consistency (Visual DOB vs MRZ DOB)
- `biometrics: null`                         - ELA Forensic Compression & Splicing Scan
- UI displays:                               - 1:1 Face Verification (if passenger presented)
  • Actual uploaded document preview         - Verification Provider (Local Demo / Govt stub)
  • Unsupported Document Card with reasons   - Composite Evidence Fusion & Risk Engine
  • Supported credential list                - Officer Workbench with Traceable Bounding Boxes
```

---

## Separation of Verification Concepts
To ensure scientific integrity and eliminate false claims:
1. **Document Type Detection:** Does this look like a supported identity/travel document?
2. **Document Structural Validation:** Does the document contain the expected fields, layout, and machine-readable structure?
3. **Document Consistency Validation:** Do different representations of the same information agree (e.g. Visual DOB vs MRZ DOB)?
4. **Forensic Tampering Analysis:** Are there image-level indicators of digital alteration (ELA, splicing, clone stamps)?
5. **Identity Verification:** Does the presented passenger match the document photograph?
6. **External Authority Verification:** Does an authorized government database confirm this document?
   - *Note: The current standalone prototype does NOT connect to live government databases. It exposes a clean `VerificationProvider` abstraction (`LocalDemoVerificationProvider` and `GovernmentVerificationProvider` stub marked as `NOT AVAILABLE`), preventing any fake government verification claims.*

---

## Automated Test Suite (15/15 Passed - 100.0%)
Automated tests in `src/utils/test_screening_suite.ts` verify all supported and negative edge cases:

| # | Test Scenario | Expected Outcome | Actual Outcome | Status |
|---|---|---|---|---|
| 01 | Valid synthetic passport | Supported Passport (Confidence >= 90%) | Type: passport, Supported: true, Conf: 98.6% | ✅ PASS |
| 02 | Synthetic tampered passport | Classified as Passport & Flags Tampering | Type: passport, Risk: 40%, Findings: 1 | ✅ PASS |
| 03 | Passport with DOB mismatch | DOB Mismatch Discrepancy Finding Triggered | Mismatch Detected: true, Finding: true | ✅ PASS |
| 04 | Passport with invalid MRZ checksum | MRZ Checksum Failure Finding Triggered | All Checksums Valid: false, Status: CHECKSUM_INVALID | ✅ PASS |
| 05 | Expired passport | Expired Travel Credential Finding Triggered | Findings: Expired Travel Credential | ✅ PASS |
| 06 | Face mismatch | Biometric Face Match Below Threshold Triggered | Risk Score: 35%, Bio Finding: true | ✅ PASS |
| 07 | Valid synthetic visa | Visa classification (Supported = true) | Detected: visa, Supported: true | ✅ PASS |
| 08 | Valid synthetic ID | National ID classification (Supported = true) | Detected: national_id, Supported: true | ✅ PASS |
| 09 | Valid synthetic driving licence | Driving Licence classification (Supported = true) | Detected: driving_license, Supported: true | ✅ PASS |
| 10 | College document | UNSUPPORTED_DOCUMENT (Gated & Rejected) | Supported: false, Type: unsupported_document, Conf: 96.8% | ✅ PASS |
| 11 | Random PDF | UNSUPPORTED_DOCUMENT (Gated & Rejected) | Supported: false, Type: unsupported_document | ✅ PASS |
| 12 | Random image | UNSUPPORTED_DOCUMENT (Gated & Rejected) | Supported: false, Type: unsupported_document | ✅ PASS |
| 13 | Document with word "passport" | UNSUPPORTED_DOCUMENT (Gated & Rejected) | Supported: false, Type: unsupported_document | ✅ PASS |
| 14 | Document with multiple dates | Zero Arbitrary DOB extraction (dob = undefined) | DOB Extracted: None (Protected) | ✅ PASS |
| 15 | Random MRZ-like noise | MRZ Rejected (mrz = null) | Parsed MRZ: Rejected (null) | ✅ PASS |

---

## Repository Structure
```
sentinel-id/
├── docs/
│   ├── PROJECT_CONTEXT.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── SECURITY.md
├── server/
│   └── src/
│       ├── app.ts
│       ├── index.ts
│       └── modules/
│           ├── auth/
│           └── screening/
│               ├── classifier.service.ts
│               ├── extractor.service.ts
│               └── screening.service.ts
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
│   │   ├── MissionControlDashboard.tsx
│   │   ├── ModelRegistryView.tsx
│   │   ├── MRZVerificationCard.tsx
│   │   ├── NewScreeningWorkstation.tsx
│   │   ├── OfficerReviewPanel.tsx
│   │   ├── OfficialDossierModal.tsx
│   │   ├── RiskScoreCard.tsx
│   │   ├── ScreeningDetailView.tsx
│   │   ├── ScreeningWorkbench.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SystemAnalyticsView.tsx
│   │   ├── SystemSettingsView.tsx
│   │   ├── TamperDetectionCard.tsx
│   │   ├── WatchlistAlertCard.tsx
│   │   └── WatchlistDatabaseView.tsx
│   ├── data/
│   │   └── sampleScreenings.ts
│   ├── utils/
│   │   ├── auditLedger.ts
│   │   ├── biometricsEngine.ts
│   │   ├── documentClassifier.ts
│   │   ├── fieldExtractor.ts
│   │   ├── forensicsEngine.ts
│   │   ├── mrzValidator.ts
│   │   ├── riskEngine.ts
│   │   ├── test_screening_suite.ts
│   │   └── verificationProvider.ts
│   ├── types.ts
│   ├── App.tsx
│   └── main.tsx
└── README.md
```

---

## Technical Specifications
- **Build Status:** Both Frontend (`vite build`) and Backend (`tsc`) compile with **0 errors**.
- **Automated Tests:** 15/15 scenarios passing via `npx tsx src/utils/test_screening_suite.ts`.
- **SIH Problem Statement:** SIH26188 (Ministry of Home Affairs, Sashastra Seema Bal - SSB, Police II Division).

---
**Last Updated:** 2026-08-31T23:12:00+05:30
