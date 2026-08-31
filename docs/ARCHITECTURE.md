# SENTINEL-ID Architecture & Engineering Design

## System Overview
SENTINEL-ID is architected as an event-driven, multimodal decision-support platform designed for high-throughput border security checkpoints (Airports, Integrated Check Posts - ICPs, Land Borders).

---

## High-Level Architecture Diagram
```
                             ┌─────────────────────────────────────┐
                             │       SENTINEL-ID Officer UI        │
                             │  React 19 + TypeScript + Vite SOC   │
                             └──────────────────┬──────────────────┘
                                                │ REST / SSE
                                                ▼
                             ┌─────────────────────────────────────┐
                             │       API Server / Gateway          │
                             │        (FastAPI / Express)          │
                             └──────────────────┬──────────────────┘
                                                │
             ┌──────────────────────────────────┼──────────────────────────────────┐
             │                                  │                                  │
             ▼                                  ▼                                  ▼
    ┌─────────────────┐                ┌─────────────────┐                ┌─────────────────┐
    │  Screening      │                │  Authentication │                │  Hash-Chained   │
    │  Orchestrator   │                │  & RBAC Engine  │                │  Audit Ledger   │
    └────────┬────────┘                └─────────────────┘                └─────────────────┘
             │
   ┌─────────┼──────────────────────────┬──────────────────────────┬──────────────┐
   │         │                          │                          │              │
   ▼         ▼                          ▼                          ▼              ▼
┌──────┐ ┌──────┐ ┌──────────────────────────┐ ┌────────┐ ┌──────────────┐ ┌────────────┐
│ OCR  │ │ MRZ  │ │ Multi-Signal Tamper      │ │ Face   │ │ Metadata &   │ │ Watchlist  │
│Engine│ │Engine│ │ Forensics (ELA/Splicing) │ │Verify  │ │ Copy-Move    │ │ Adapter    │
└──────┘ └──────┘ └──────────────────────────┘ └────────┘ └──────────────┘ └────────────┘
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

## 4 Core Pipeline Modules

### 1. Module 1: Optical Character Recognition (OCR) Engine
- **Preprocessing Pipeline:** Image quality assessment -> Orientation correction -> Perspective warping -> Document boundary extraction -> Text ROI localization -> OCR extraction.
- **Field Normalization:** Maps visual characters into normalized ISO schema (Full Name, Passport Number, Nationality, DOB, Expiry Date, Sex, Authority).
- **Confidence Scoring:** Outputs per-field confidence rating (0-100%) and bounding box coordinates for anomaly visualization.

### 2. Module 2: Document Validation & MRZ Engine
- **ICAO Doc 9303 Compliance:** Parses TD1, TD2, TD3, and Machine Readable Visa (MRV) formats.
- **7-3-1 Check Digit Algorithm:** Verifies check digits using `sum(val * [7, 3, 1]) % 10` for document number, birth date, expiry date, optional data, and composite hash.
- **VIZ ↔ MRZ Cross-Validation:** Flags mismatches between visual printed text and decoded MRZ data.

### 3. Module 3: Multi-Signal Document Tampering Forensics
- **Error Level Analysis (ELA):** Analyzes JPEG compression error residuals to detect spliced and overlaid photos.
- **Edge Discontinuity & Noise Residuals:** Analyzes high-frequency gradients around photo and text boxes.
- **Font & Baseline Analysis:** Detects modified numbers, inconsistent font weights, and character vertical offsets.
- **Stamp & Seal Integrity:** Checks circular symmetry, edge continuity, and paper ink bleed.
- **Metadata Inspection:** Flags photo manipulation software signatures (Photoshop, GIMP, Canva, CorelDraw).

### 4. Module 4: 1:1 Facial Biometrics & Anti-Spoofing
- **1:1 Verification:** Compares document portrait against live traveler camera capture with 68 facial nodal landmarks.
- **Cosine Similarity:** Computes biometric match score against calibrated threshold.
- **Anti-Spoofing:** Identifies screen replay attacks (moiré patterns), printed paper photos, and passive 3D liveness.

---

## Cryptographic Audit Ledger
Every event is cryptographically anchored using SHA-256 hash chaining:
$$\text{Block Hash} = \text{SHA-256}(\text{Previous Hash} + \text{Canonical Event JSON} + \text{Timestamp})$$
Provides instantaneous tamper detection across all audit logs.
