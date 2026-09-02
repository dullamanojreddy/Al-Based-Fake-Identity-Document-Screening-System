# 🛡️ FIDSS — Fake Identity & Document Screening System

> **AI-assisted forensic document screening for identity verification, document tampering detection, biometric verification, and explainable security investigation.**

[![SIH 2026](https://img.shields.io/badge/SIH_2026-Problem_Statement_26188-blue.svg)](https://www.sih.gov.in/)
[![Theme](https://img.shields.io/badge/Theme-Blockchain_%26_Cybersecurity-orange.svg)](#)
[![Category](https://img.shields.io/badge/Category-Software-green.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](#license)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [The Existing Problem](#-the-existing-problem)
- [Our Solution](#-our-solution)
- [Core Philosophy](#-core-philosophy)
- [Key Features](#-key-features)
- [Novelty](#-novelty)
- [Real-World Impact](#-real-world-impact)
- [System Architecture](#-system-architecture)
- [End-to-End Workflow](#-end-to-end-workflow)
- [Technology Stack](#-technology-stack)
- [Core Modules](#-core-modules)
  - [OCR Pipeline](#-ocr-pipeline)
  - [MRZ Validation & ICAO 9303](#-mrz-validation--icao-9303)
  - [MRZ Check Digits (7-3-1 Modulo-10)](#-mrz-check-digits)
  - [OCR ↔ MRZ Cross Validation](#-ocr--mrz-cross-validation)
  - [Tampering Detection](#-tampering-detection)
  - [Copy-Move Detection (ORB & RANSAC)](#-copy-move-detection)
  - [Face Verification (SCRFD + ArcFace)](#-face-verification)
  - [Watchlist Matching](#-watchlist)
  - [Duplicate Identity Detection](#-duplicate-identity-detection)
  - [Evidence Fusion & Screening Levels](#-evidence-fusion)
  - [Explainability Engine](#-explainability)
  - [Audit Hash Chain (SHA-256)](#-audit-hash-chain)
- [Fault Tolerance & Safety](#-fault-tolerance)
- [Scalability](#-scalability)
- [Cost Effectiveness](#-cost-effectiveness)
- [Security Architecture](#-security-architecture)
- [Database Architecture](#-database-architecture)
- [API Architecture](#-api-architecture)
- [Frontend Architecture](#-frontend)
- [Backend Architecture](#-backend)
- [Project Structure](#-project-structure)
- [AI Project Memory](#-ai-project-memory)
- [Installation & Setup](#-installation)
  - [Backend Setup](#-backend-setup)
  - [Database Setup](#-database-setup)
  - [Frontend Setup](#-frontend-setup)
  - [Docker Deployment](#-docker-deployment)
- [Environment Variables](#-environment-variables)
- [Running the Project](#-running-the-project)
- [Testing Suite](#-testing)
- [Demo Workflow](#-demo-workflow)
- [Sample Scenarios](#-sample-scenarios)
- [Historical Relevance](#-historical-relevance)
- [Existing Solution vs FIDSS](#-existing-solution-vs-fidss)
- [Why FIDSS Is Better](#-why-fidss-is-better)
- [Limitations & Non-Claims](#-limitations)
- [Human-in-the-Loop & Responsible Deployment](#-human-in-the-loop)
- [Roadmap & Future Enhancements](#-roadmap)
- [Team Roles](#-team-responsibilities)
- [Contribution & Development Rules](#-contribution-guidelines)
- [Final Takeaway](#-final-takeaway)
- [License](#-license)

---

## 🚨 Overview

**FIDSS (Fake Identity & Document Screening System)** is an AI-assisted forensic screening platform engineered to help security, border-screening, and immigration personnel rapidly identify fraudulent, altered, expired, duplicated, or suspicious travel and identity documents.

The system combines:
- **Optical Character Recognition (OCR)**
- **Machine Readable Zone (MRZ) analysis**
- **ICAO 9303-based standards compliance**
- **Deterministic MRZ check-digit verification (7-3-1 weighted modulo-10)**
- **Visual-to-MRZ document consistency cross-checking**
- **Multi-layer image forensics (Copy-Move, ELA, Noise, Compression, Photo Integrity, Stamp Analysis)**
- **Feature detection & geometric verification (ORB + RANSAC)**
- **1:1 Facial biometrics & anti-spoofing (SCRFD + ArcFace)**
- **Local synthetic watchlist cross-referencing**
- **Duplicate identity correlation**
- **Unified Evidence Fusion engine**
- **Explainable visual & textual screening recommendations**
- **Cryptographically verifiable SHA-256 audit hash chain**

```
Document ──► Automated Analysis ──► Multi-Signal Evidence ──► Evidence Fusion ──► Explainable Recommendation ──► Human Officer Review
```

> **Design Principle:** FIDSS is deliberately built as a **decision-support and evidence-generation platform**. It does not replace human officers with a black-box AI verdict; rather, it empowers officers with structured, explainable, and tamper-evident forensic intelligence.

---

## 🎯 Problem Statement

### Smart Identity and Document Verification for Border Security
*(Smart India Hackathon 2026 — Problem Statement ID: 26188)*

Border checkpoints process millions of identity documents annually. Officers frequently rely on visual inspection and fragmented lookups under severe time pressure. 

Key challenges include:
1. **Surging passenger volumes** causing inspection bottlenecks.
2. **Sophisticated digital forgeries** (spliced photos, cloned stamps, micro-altered text) imperceptible to the naked eye.
3. **Identity impersonation** using genuine credentials belonging to lookalikes.
4. **Multi-identity aliases** and duplicate credentials generated across jurisdictions.
5. **Subtle forensic inconsistencies** between visual text and machine-readable data.

FIDSS addresses these challenges by automating first-level forensic screening within seconds, surfacing pinpoint evidence while preserving officer authority for final decisions.

---

## 🔎 The Existing Problem

```
[Person] ──► [Identity Document] ──► [Visual Inspection] ──► [Manual Field Check] ──► [Slow Lookup] ──► [Subjective Judgment]
```

### Limitations of Current Workflows:
- Heavy cognitive fatigue on border personnel.
- Inability to compute mathematical checksums mentally under speed requirements.
- High vulnerability to synthetic media, font splicing, and digital touch-ups.
- Lack of cross-validation between visual inspection zones (VIZ) and MRZ.
- Inadequate explainability ("Why was this passenger rejected?").
- Fragile audit logs vulnerable to post-incident tampering.

---

## 💡 Our Solution

FIDSS transforms manual inspection into an automated, multi-signal evidence generation pipeline:

```
Automated Evidence Generation ──► Multi-Signal Validation ──► Evidence Fusion ──► Explainable Recommendation ──► Human Decision
```

The system avoids the single "fake document classifier" trap. Instead, it fuses deterministic mathematical rules, computer vision heuristics, deep biometric embeddings, and identity correlation.

---

## 🧠 Core Philosophy

1. **Evidence over assumptions:** Every flagged document must present verifiable rationale (What, Where, Why).
2. **Multiple signals over one model:** Authenticity is never decided by a single neural network confidence score.
3. **Deterministic validation where possible:** Standards-based checks (ICAO 9303, Modulo-10) are calculated with absolute mathematical certainty.
4. **Human-in-the-loop:** The AI generates evidence; the trained human officer retains sovereign decision authority.
5. **Auditable security:** All screening events are cryptographically sealed in an immutable hash chain.

---

## ✨ Key Features

| Feature | Category | Purpose |
|---|---|---|
| **OCR Pipeline** | Text Extraction | Multimodal vision/PaddleOCR to extract visual text fields and bounding boxes |
| **MRZ Parser** | Standards | Parse TD1, TD2, TD3 machine-readable travel document zones |
| **ICAO 9303 Engine** | Validation | Full compliance check for passport & visa specifications |
| **7-3-1 Modulo-10 Check Digits** | Deterministic Math | Verify document number, DOB, expiry, and composite check digits |
| **OCR ↔ MRZ Cross-Check** | Consistency | Detect discrepancies between printed text and encoded MRZ strings |
| **Copy-Move Detection** | Forensics | Detect cloned stamps, replicated signatures, and duplicated visual regions |
| **ORB + RANSAC** | Computer Vision | Distinctive keypoint extraction and homography filtering |
| **Noise & ELA Analysis** | Forensics | Uncover local JPEG quantization variance and statistical pixel noise |
| **Photo Integrity Analysis** | Forensics | Splicing edge detection, boundary halos, and portrait substrate analysis |
| **Stamp & Seal Forensics** | Forensics | Evaluate ink absorption, circular geometry, and Fourier frequency patterns |
| **Face Biometrics (SCRFD + ArcFace)** | Biometrics | 1:1 face match between document portrait and live traveler capture |
| **Anti-Spoofing Gate** | Biometrics | Reject screen replays, printed photos, and synthetic masks |
| **Watchlist Matching** | Intelligence | Cross-reference against local synthetic alert databases |
| **Duplicate Identity Detection** | Intelligence | Identify recycled attributes across previously screened records |
| **Evidence Fusion Engine** | Intelligence | Weight and combine independent signals into an overall risk tier |
| **Explainability View** | UX / Audit | Visual bounding box overlays showing exact anomaly locations |
| **Audit Hash Chain** | Cybersecurity | SHA-256 chained audit ledger to prevent historical tampering |

---

## 🌟 Novelty

FIDSS does not claim novelty from using OCR or face recognition in isolation. The novelty lies in its **system-level architecture, evidence fusion, and cryptographic auditability**:

```
Traditional Black-Box Approach:
  Upload ──► Model ──► "Authenticity: 87%" (Unexplainable, unreliable)

FIDSS Forensic Architecture:
  Upload ──► [OCR Engine]            ──► Extracted DOB: 01/01/2005
         ──► [MRZ Parser]            ──► Encoded DOB: 01/01/2000 (MISMATCH)
         ──► [Modulo-10 Engine]      ──► Composite Check: FAILED
         ──► [Noise / ELA Engine]    ──► Boundary Anomaly: DETECTED (Region [x,y,w,h])
         ──► [ArcFace 1:1 Match]     ──► Cosine Similarity: 0.38 (MISMATCH)
         ──► [Evidence Fusion]       ──► Recommendation: RED / DETAIN (Explainable)
```

1. **Explainable Forensic Evidence:** Visual bounding boxes pinpoint exact altered coordinates.
2. **MRZ as a First-Class Forensic Signal:** Independent mathematical verification independent of visual OCR.
3. **Tamper-Evident Audit Ledger:** Cryptographically linked event records that expose any unauthorized log tampering.

---

## 🌍 Real-World Impact

- **⚡ Screening Speed:** Sub-3-second end-to-end evaluation.
- **🎯 Consistency:** Eliminates human fatigue and subjective variance.
- **🛡️ Multi-Vector Detection:** Catches digital edits, impostors, expired documents, and checksum errors simultaneously.
- **📈 Officer Productivity:** Flags anomalies automatically so officers focus on high-risk investigations.
- **⚖️ Legal & Investigative Support:** Generates structured, court-admissible forensic dossiers with full provenance.

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             FRONTEND (React)                             │
│  Screening Console  │  Officer Review  │  Analytics Dashboard  │  Audit  │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ REST APIs + Server-Sent Events (SSE)
┌────────────────────────────────────▼─────────────────────────────────────┐
│                           BACKEND ORCHESTRATION                          │
│                     FastAPI / Python  &  Node.js API                     │
│                                                                          │
│   Auth / RBAC  ──►  Secure Upload  ──►  Decode & Quality Preprocessing  │
│                                                                          │
│   ┌─────────────────────┬──────────────────────┬─────────────────────┐   │
│   │     OCR Module      │      MRZ Module      │  Forensics Module   │   │
│   │  PaddleOCR / Vision │  ICAO 9303 / 7-3-1   │  ORB/RANSAC/ELA/CV  │   │
│   └──────────┬──────────┴──────────┬───────────┴──────────┬──────────┘   │
│              │                     │                      │              │
│   ┌──────────▼─────────────────────▼──────────────────────▼──────────┐   │
│   │                      1:1 Face Biometrics                         │   │
│   │            SCRFD Detection + ArcFace Cosine Embeddings           │   │
│   └────────────────────────────────┬─────────────────────────────────┘   │
│                                    │                                     │
│   ┌────────────────────────────────▼─────────────────────────────────┐   │
│   │               Watchlist & Duplicate Identity Engine              │   │
│   └────────────────────────────────┬─────────────────────────────────┘   │
│                                    │                                     │
│   ┌────────────────────────────────▼─────────────────────────────────┐   │
│   │                     Evidence Fusion Engine                       │   │
│   │       Normalized Signals ──► Risk Scoring ──► Recommendation      │   │
│   └────────────────────────────────┬─────────────────────────────────┘   │
│                                    │                                     │
│   ┌────────────────────────────────▼─────────────────────────────────┐   │
│   │            SHA-256 Cryptographic Audit Hash Chain                │   │
│   └────────────────────────────────┬─────────────────────────────────┘   │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼─────────────────────────────────────┐
│                       PERSISTENCE & REPOSITORIES                         │
│                    MySQL 8 / SQLAlchemy / Alembic                        │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 End-to-End Workflow

```
 1. Document Upload & Ingestion
    │
 2. Auth & RBAC Token Verification
    │
 3. Image Decoding & Format Sanitization
    │
 4. Orientation & Deskew Alignment
    │
 5. Perspective Correction & Quality Assessment (Blur / Glare Gate)
    │
 6. Visual Zone OCR Text Detection & Bounding Box Extraction
    │
 7. Field Normalization (Names, Document Numbers, Dates)
    │
 8. MRZ Region Detection & Extraction
    │
 9. MRZ Parsing (TD1 / TD2 / TD3 Layouts)
    │
10. ICAO 9303 Check-Digit Calculation (7-3-1 Weight Modulo-10)
    │
11. OCR ↔ MRZ Cross-Check Validation
    │
12. Multi-Vector Tampering Analysis (ELA, Copy-Move, Edge Gradients)
    │
13. Photo Region Extraction & Substrate Integrity Check
    │
14. Consular Stamp & Seal Geometry Forensics
    │
15. SCRFD Face Detection on Document Portrait & Live Capture
    │
16. ArcFace Feature Extraction & Cosine Similarity Biometric Match
    │
17. Synthetic Watchlist Query
    │
18. Duplicate Identity Detection (Recycled Attributes)
    │
19. Evidence Normalization into Unified Schema
    │
20. Evidence Fusion & Risk Level Recommendation
    │
21. Interactive Officer Review & Annotation
    │
22. SHA-256 Hash Chain Ledger Append & Tamper Verification
```

---

## 🧰 Technology Stack

### **Frontend**
- **Framework:** React 19, TypeScript, Vite
- **UI & Styling:** Tailwind CSS, Lucide Icons, Glassmorphic Design System
- **Visualizations:** Recharts, HTML5 Canvas Forensics (ELA overlays, Bounding Box coordinates)
- **State Management:** Reactive Hooks, Context API

### **Backend & APIs**
- **Python Backend:** FastAPI, Pydantic, SQLAlchemy, Alembic, Uvicorn
- **Node.js Gateway:** Express, TypeScript, Multer, Helmet, Winston
- **Protocol:** REST API + Server-Sent Events (SSE) for real-time screening stream

### **AI, Forensics & Biometrics**
- **OCR Engine:** PaddleOCR (PP-OCRv4 CPU-optimized) & Multimodal Vision APIs
- **Document Standards:** Deterministic ICAO 9303 MRZ Engine (TD1, TD2, TD3)
- **Computer Vision:** OpenCV, ORB (Oriented FAST and Rotated BRIEF), RANSAC, ELA
- **Face Biometrics:** SCRFD (Face Detection) + ArcFace (Feature Embeddings & 1:1 Verification)

### **Database & Security**
- **Database:** MySQL 8+ / PostgreSQL
- **Security:** Role-Based Access Control (RBAC), JWT Authentication, SHA-256 Ledger

---

## 🔤 Core Modules

### 🔤 OCR Pipeline

```
Raw Image ──► Decode ──► Deskew & Crop ──► Text Detection ──► Text Recognition ──► Semantic Field Mapping
```

Each extracted field generates a structured JSON object containing confidence and coordinates:
```json
{
  "field_name": "document_number",
  "value": "P1234567",
  "confidence": 0.97,
  "bbox": [120, 80, 300, 110],
  "normalized_value": "P1234567",
  "source": "ocr"
}
```

---

### 🌐 MRZ Validation & ICAO 9303

The Machine Readable Zone encodes critical data in standardized lines:
```
P<INDSURNAME<<GIVEN<NAME<<<<<<<<<<<<<<<<<<<<
A1234567<8IND0001012M3001019<<<<<<<<<<<<<<04
```

FIDSS parses:
- **TD1:** 3 lines × 30 characters (National ID cards)
- **TD2:** 2 lines × 36 characters (Visas, ID cards)
- **TD3:** 2 lines × 44 characters (Standard Passports)

---

### 🔢 MRZ Check Digits

FIDSS enforces the **7-3-1 weighted Modulo-10 algorithm**:
$$\text{Checksum} = \left( \sum_{i=1}^{n} \text{Value}(c_i) \times w_i \right) \pmod{10}$$
where weights $w = [7, 3, 1, 7, 3, 1, \dots]$.

Character values: `0-9` $\to$ `0-9`, `A-Z` $\to$ `10-35`, `<` $\to$ `0`.

```
Calculated Check Digit: 8
MRZ Encoded Check Digit: 3
Result ──► CHECK DIGIT VALIDATION FAILED
```

---

### 🔁 OCR ↔ MRZ Cross Validation

The visual zone and machine-readable zone are cross-checked field by field:

| Visual Field (OCR) | MRZ Field | Result | Action |
|---|---|---|---|
| DOB: `01/01/2005` | DOB: `000101` (2000) | ❌ **MISMATCH** | Flag HIGH Severity Evidence |
| Doc: `P1234568` | Doc: `P1234567` | ❌ **MISMATCH** | Flag CRITICAL Severity Evidence |
| Name: `RAHUL SHARMA` | Name: `SHARMA<<RAHUL` | ✅ **MATCH** | Normal |

---

### 🕵️ Tampering Detection

FIDSS interrogates document images across multiple independent forensic layers:

```
                  ┌────────────────────────────────────────┐
                  │        IMAGE FORENSICS SUITE           │
                  ├────────────────────────────────────────┤
                  │ 1. Error Level Analysis (Quantization) │
                  │ 2. Copy-Move Forgery Detection (ORB)   │
                  │ 3. Noise Variance Inconsistency        │
                  │ 4. Photo Splicing Edge Discontinuity   │
                  │ 5. Stamp Ink Bleed & Circular Fourier  │
                  └────────────────────────────────────────┘
```

---

### 📋 Copy-Move Detection

Copy-move forgery occurs when a section (stamp, seal, signature) is cloned from one region to another.

```
Original Image                  Tampered Image
┌─────────────────────────┐     ┌─────────────────────────┐
│                         │     │ [STAMP-1]               │
│               [STAMP]   │ ──► │                         │
│                         │     │               [STAMP-2] │
└─────────────────────────┘     └─────────────────────────┘
```

#### Detection Pipeline:
1. **ORB (Oriented FAST and Rotated BRIEF):** Detects keypoints and computes binary descriptors.
2. **Ratio Test (Lowe's Test):** Rejects ambiguous feature matches ($\text{dist}_1 / \text{dist}_2 < \tau$).
3. **RANSAC (Random Sample Consensus):** Computes homography matrices to identify spatial clustering of copied regions.

---

### 👤 Face Verification

Uses **SCRFD** for multi-angle face detection and **ArcFace** for 512-dimensional facial feature representation:

```
[Document Portrait]  ──► SCRFD ──► Crop ──► ArcFace ──► [Embedding A]
                                                              │ Cosine Distance
[Live Webcam Feed]   ──► SCRFD ──► Crop ──► ArcFace ──► [Embedding B]
```

#### Outcome Categories:
- `MATCH`: Cosine similarity $\ge 0.75$
- `MISMATCH`: Cosine similarity $< 0.50$
- `INCONCLUSIVE`: Image blur, extreme angle, or occlusion flagged by Quality Gate
- `NO_FACE` / `MULTIPLE_FACES`: Document lacks photo or contains multiple faces

---

### 🚨 Watchlist

Matches extracted credentials against synthetic intelligence databases:
- Interpol Stolen & Lost Travel Documents (SLTD) synthetic entries
- High-risk fugitive red-notice records
- Consular revoked passport lists

---

### ♻️ Duplicate Identity Detection

Detects identity recycling across historical screening records:
$$\text{Identity Similarity} = f(\text{Normalized Name}, \text{Normalized DOB}, \text{Document Number})$$
Flags instances where the same photo appears under different names or vice versa.

---

### 🧠 Evidence Fusion

Individual findings are normalized into structured evidence items and evaluated through the fusion engine:

```
┌────────────────────┐
│   OCR Discrepancy  │ ──► Severity: HIGH
└────────────────────┘
┌────────────────────┐
│ MRZ Checksum Error │ ──► Severity: CRITICAL
└────────────────────┘
┌────────────────────┐
│ Copy-Move Anomaly  │ ──► Severity: HIGH
└────────────────────┘
┌────────────────────┐
│ Face Verification  │ ──► Severity: LOW (Match)
└────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│               EVIDENCE FUSION ENGINE                   │
│   Composite Risk Calculation & Rule Matrix Mapping     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
          Recommendation: RED / ENHANCED_REVIEW
```

#### Screening Levels:
- 🟢 **CLEAR (0–25% Risk):** Standard automated clearance.
- 🟡 **REVIEW_RECOMMENDED (26–65% Risk):** Secondary inspection required.
- 🔴 **ENHANCED_REVIEW_RECOMMENDED / DETAIN (66–100% Risk):** High-priority tactical alert.
- ⚪ **INCONCLUSIVE:** Quality check failure (rescan document).

---

### 🔎 Explainability

Every screening decision generates an evidence manifest detailing **What**, **Where**, **Why**, and **Which Module**:

```json
{
  "finding_id": "FND-001",
  "category": "MRZ_CONSISTENCY",
  "severity": "HIGH",
  "source": "MRZ Cross Validation",
  "description": "Visual Date of Birth (01/01/2005) does not match MRZ Date of Birth (01/01/2000).",
  "document_region": {
    "x": 140,
    "y": 510,
    "width": 320,
    "height": 45
  },
  "confidence": 0.99
}
```

---

### 🔐 Audit Hash Chain

Screening events are sealed in a cryptographic hash chain:
$$\text{Hash}_n = \text{SHA-256}\left( \text{Hash}_{n-1} \parallel \text{Timestamp} \parallel \text{CanonicalEventData} \right)$$

```
[Event 1] ──► Hash_A ──► [Event 2 + Hash_A] ──► Hash_B ──► [Event 3 + Hash_B] ──► Hash_C
```

If an adversary attempts to modify historical record `Event 2`, `Hash_B` alters, invalidating `Event 3` and triggering an immediate **AUDIT INTEGRITY VIOLATION**.

---

## 🛡️ Fault Tolerance

FIDSS follows a safe-failure architecture:
- **Quality Gates:** Degraded images trigger `INCONCLUSIVE` rather than false `FRAUD` flags.
- **Service Isolation:** If the Face module is temporarily offline, OCR, MRZ, and Forensics continue screening, surfacing an `UNAVAILABLE_SERVICE` indicator.
- **Fail-Safe Watchlist:** If the watchlist database is unreachable, the system enters manual officer review mode.

---

## 📈 Scalability

- **Application Tier:** Stateless backend services deployable behind NGINX / Cloud load balancers.
- **Worker Queue:** Compute-heavy forensic workloads (ORB, ELA, ArcFace) can run via Celery / Redis worker pools.
- **Document Rules Engine:** JSON-configured rule definitions allow adding new passport or visa schemas without modifying application code.

---

## 💰 Cost Effectiveness

- **CPU Optimized:** PaddleOCR and ArcFace run on standard multi-core CPUs without requiring expensive cloud GPUs.
- **Open-Source Stack:** Built entirely on Python, FastAPI, React, OpenCV, MySQL, and TypeScript.
- **Local On-Premises Ready:** Zero mandatory recurring API subscriptions.

---

## 🔒 Security Architecture

```
[User Request] ──► HTTPS / TLS 1.3 ──► JWT / RBAC Middleware ──► File Sanitizer ──► Memory Processing ──► SHA-256 Audit Log
```

- **Role-Based Access Control (RBAC):** Officer, Supervisor, Forensic Examiner, System Admin.
- **File Upload Protection:** Magic byte inspection, memory-only decompression, strict size and MIME type gates.
- **Data Minimization:** PII masking options for audit logs.

---

## 🗄️ Database Architecture

Core entities managed via SQLAlchemy & MySQL 8:

```
users ───────────────► roles
  │
screenings ──────────► documents ──► document_fields
  │                       │
  ├─► ocr_results         ├─► mrz_results
  ├─► tamper_results      ├─► tamper_regions
  ├─► photo_integrity     ├─► stamp_results
  ├─► face_verifications  ├─► watchlist_matches
  ├─► duplicate_identity  ├─► evidence_items
  ├─► officer_reviews     └─► officer_notes
  └─► audit_logs (SHA-256 Chained)
```

---

## 🌐 API Architecture

```
/api/v1
├── /auth
│   ├── POST /login
│   ├── POST /logout
│   └── GET  /me
├── /screenings
│   ├── POST /                (Submit document for full screening)
│   ├── GET  /                (List historical screenings)
│   └── GET  /{id}            (Get complete screening dossier)
├── /ocr
│   └── GET  /{screening_id}
├── /mrz
│   └── GET  /{screening_id}
├── /tampering
│   └── GET  /{screening_id}
├── /face
│   └── POST /verify
├── /watchlist
│   └── GET  /matches
├── /evidence
│   └── GET  /{screening_id}
├── /reviews
│   └── POST /{screening_id}  (Submit human officer decision)
└── /audit
    ├── GET  /logs
    └── POST /verify          (Cryptographic chain verification)
```

---

## 🖥️ Frontend

The frontend terminal is optimized for mission-critical security environments:
- **Interactive Workstation:** Real-time upload, webcam passenger capture, and scanning progression.
- **Forensic Inspector:** Interactive image canvas displaying ELA heatmaps, ORB match vectors, and OCR bounding boxes.
- **Dossier Generator:** One-click generation of official MHA/SSB forensic PDF screening dossiers.
- **Audit Console:** Real-time cryptographic ledger explorer with one-click verification.

---

## ⚙️ Backend

Separation of concerns across 5 clean layers:
```
Controller (API Route) ──► Service Orchestrator ──► Forensic Domain Logic ──► Repository ──► Database
```

---

## 📁 Project Structure

```
FIDSS/
├── README.md                           # Master Project Documentation
├── LICENSE                             # Open-source License
├── .env.example                        # Template environment variables
├── docker-compose.yml                  # Full stack Docker orchestration
├── Dockerfile                          # Frontend / Fullstack container
├── nginx.conf                          # Production web server config
│
├── docs/                               # Architectural Documentation
│   ├── PROJECT_CONTEXT.md              # Persistent AI memory & roadmap
│   ├── ARCHITECTURE.md                 # Deep architectural specifications
│   ├── API.md                          # REST API endpoint definitions
│   └── SECURITY.md                     # Threat model & cryptographic spec
│
├── src/                                # Frontend React Application
│   ├── components/                     # UI components & workstations
│   │   ├── NewScreeningWorkstation.tsx # Primary document ingestion terminal
│   │   ├── ScreeningDetailView.tsx     # Deep forensic evidence inspector
│   │   └── ...                         # Dashboards, headers, audit views
│   ├── utils/                          # Forensic & validation utilities
│   │   ├── mrzValidator.ts             # 7-3-1 ICAO 9303 checksum engine
│   │   ├── forensicsEngine.ts          # ELA & edge gradient forensics
│   │   ├── biometricsEngine.ts         # Facial landmark & anti-spoofing
│   │   ├── riskEngine.ts               # Evidence fusion scoring
│   │   ├── auditLedger.ts              # SHA-256 cryptographic chain
│   │   └── universalDocumentScanner.ts # Document profile mapping
│   ├── types.ts                        # TypeScript interface definitions
│   └── documentProfiles/               # JSON document layout specifications
│
├── server/                             # Backend API & Processing Server
│   ├── src/                            # TypeScript/Node.js API gateway
│   │   ├── modules/screening/          # Screening orchestration services
│   │   └── server.ts                   # Gateway initialization
│   ├── package.json
│   └── tsconfig.json
│
├── python/                             # Python Forensic Microservices
│   ├── Dockerfile
│   └── requirements.txt
│
└── tests/                              # Automated test suites
    └── screening_scenarios.test.ts     # 15+ scenario verification suite
```

---

## 🧠 AI Project Memory

FIDSS maintains persistent project context in [`docs/PROJECT_CONTEXT.md`](file:///c:/Users/D%20Manoj%20Reddy/Desktop/Al-Based-Fake-Identity-Document-Screening-System/docs/PROJECT_CONTEXT.md) so AI engineering agents retain architectural decisions, completed features, schema states, and roadmap priorities across sessions.

---

## 📦 Installation

### Prerequisites
- **Node.js:** v20+
- **Python:** v3.10+
- **MySQL:** v8.0+ or PostgreSQL
- **Git**

---

### 🐍 Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/dullamanojreddy/Al-Based-Fake-Identity-Document-Screening-System.git
cd Al-Based-Fake-Identity-Document-Screening-System

# 2. Setup Server Gateway
cd server
npm install
npm run dev
```

For Python forensic microservices:
```bash
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

---

### 🗄️ Database Setup

```sql
CREATE DATABASE fidss CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Configure connection credentials in `.env`.

---

### ⚛️ Frontend Setup

```bash
# From workspace root
npm install
npm run dev
```

Open the terminal in your browser at `http://localhost:3000` (or the URL displayed in your Vite output).

---

### 🐳 Docker Deployment

To launch the complete containerized stack in one command:
```bash
docker compose up --build
```

---

## 🔐 Environment Variables

Create `.env` based on `.env.example`:

```env
APP_ENV=development
PORT=3000
BACKEND_PORT=5000
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/fidss
SECRET_KEY=generate-a-secure-random-secret-key-here
UPLOAD_DIR=./data/uploads
OCR_DEVICE=cpu
FACE_DEVICE=cpu
WATCHLIST_MODE=synthetic
AUDIT_HASH_ALGORITHM=sha256
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## ▶️ Running the Project

| Component | Directory | Command | Port |
|---|---|---|---|
| **Frontend Terminal** | `/` (Root) | `npm run dev` | `http://localhost:3000` |
| **Backend API Gateway** | `/server` | `npm run dev` | `http://localhost:5000` |
| **Docker Compose** | `/` (Root) | `docker compose up` | `http://localhost:3000` |

---

## 🧪 Testing

FIDSS includes comprehensive unit, integration, and scenario tests:

```bash
# Run unit & scenario test suites
npm test
```

### Key Automated Checks:
1. **MRZ Modulo-10 Check:** Validates 7-3-1 weights against known ICAO test vectors.
2. **Field Cross-Validation:** Confirms mismatch triggers when DOB/Passport numbers diverge.
3. **Audit Ledger Tamper Test:** Modifies a historical block in memory and confirms immediate cryptographic failure.

---

## 🎬 Demo Workflow

```
Step  1 ──► Open FIDSS Operator Console
Step  2 ──► Upload a genuine passport specimen
Step  3 ──► Inspect real-time OCR extraction & layout detection
Step  4 ──► Verify ICAO 9303 MRZ parsing & valid 7-3-1 check digits
Step  5 ──► Review Clean ELA & noise forensics (No anomalies)
Step  6 ──► Perform 1:1 biometric comparison with traveler capture
Step  7 ──► Confirm Overall Status: 🟢 CLEAR
Step  8 ──► Upload a tampered specimen (modified DOB / spliced photo)
Step  9 ──► Observe flagged signals: MRZ Checksum Failure + ELA Heatmap Anomaly
Step 10 ──► Review Overall Status: 🔴 ENHANCED_REVIEW_RECOMMENDED (Risk: 88%)
Step 11 ──► Officer submits review annotation: "DETAINED FOR SECONDARY"
Step 12 ──► Open Audit Ledger Explorer
Step 13 ──► Trigger demo tamper test (simulates unauthorized DB edit)
Step 14 ──► System immediately reports: ❌ AUDIT INTEGRITY VIOLATION
Step 15 ──► Export official MHA/SSB forensic PDF screening dossier
```

---

## 🧪 Sample Scenarios

| # | Scenario | Input Characteristics | System Finding | Risk Level |
|---|---|---|---|---|
| **1** | **Clean Passport** | Valid ICAO MRZ, genuine photo, no watchlist hit | All checks pass | 🟢 **CLEAR (4%)** |
| **2** | **Altered Date of Birth** | Visual DOB: `01/01/2005` vs MRZ: `01/01/2000` | OCR ↔ MRZ mismatch | 🔴 **DETAIN (78%)** |
| **3** | **Modified Document Number** | Visual number altered, check digit fails | Check digit error | 🔴 **DETAIN (85%)** |
| **4** | **Spliced Portrait Photo** | Replacement photo pasted onto substrate | ELA & edge gradient anomaly | 🔴 **DETAIN (92%)** |
| **5** | **Cloned Consular Stamp** | Stamp region copied from another visa page | ORB/RANSAC Copy-Move hit | 🔴 **DETAIN (72%)** |
| **6** | **Lookalike Impostor** | Genuine passport presented by different individual | ArcFace similarity = 0.31 | 🔴 **DETAIN (89%)** |
| **7** | **Degraded / Blurry Image** | Out-of-focus camera capture | Quality Gate rejection | ⚪ **INCONCLUSIVE** |
| **8** | **Watchlist Hit** | Passport number listed on synthetic red notice | SLTD match | 🔴 **CRITICAL (99%)** |

---

## 🌎 Historical Relevance

Document fraud and identity impersonation are persistent national and border security threats. Historical inquiries—including the 9/11 Commission Staff Report on Terrorist Travel—documented how manipulated travel credentials, forged consular stamps, and identity alterations were weaponized.

> **Responsible Position:** FIDSS does not make exaggerated claims regarding historical events. Rather, it specifically addresses the **technical vulnerabilities identified in historical security reviews** by providing automated, explainable forensic intelligence at the moment of inspection.

---

## 🧩 Existing Solution vs FIDSS

| Feature / Dimension | Conventional Manual Checkpoint | Typical AI Classifier | FIDSS Platform |
|---|---|---|---|
| **Inspection Mechanism** | Visual scrutiny by officer | Single black-box CNN | Multi-signal hybrid pipeline |
| **MRZ Verification** | Manual reading / basic scan | OCR only | Deterministic ICAO 9303 7-3-1 Modulo-10 |
| **Cross-Validation** | Mental comparison | Rare | Automated VIZ ↔ MRZ consistency engine |
| **Image Forensics** | UV/White light lamp | None or basic binary score | ELA, Copy-Move, Edge, Stamp Forensics |
| **Biometric Match** | Visual look at photo | Standalone face scanner | 1:1 SCRFD + ArcFace + Anti-Spoofing |
| **Explainability** | Officer subjective notes | Single probability percentage | Visual coordinates & structured findings |
| **Audit Logging** | Standard database records | Standard server logs | SHA-256 cryptographically chained ledger |
| **Human Authority** | Full | Often bypassed | Human-in-the-Loop decision support |

---

## ⚡ Why FIDSS Is Better

```
Before FIDSS:
  Officer ──► Manually reads fields ──► Mental arithmetic ──► Guesses tampering ──► Decides under pressure

With FIDSS:
  FIDSS ──► Extracts text ──► Computes checksums ──► Analyzes pixels ──► Performs biometrics ──► Fuses Evidence
    │
    ▼
  Officer ──► Reviews highlighted evidence & coordinates ──► Makes confident, informed decision
```

---

## ⚖️ Limitations & Non-Claims

### Realities of Screening Systems:
- **OCR Quality:** Optical character recognition depends on lighting, focus, resolution, and document condition.
- **Biometric Variances:** Extreme pose angles, severe lighting shadows, and medical facial trauma can affect similarity scores.
- **Forensic Boundaries:** Extreme high-end state-sponsored physical reprints without digital artifacts require physical substrate laboratory testing.

### Explicit Non-Claims:
1. ❌ We do **not** claim AI can replace the legal decision of a border official.
2. ❌ We do **not** claim a single model proves fraud.
3. ❌ We do **not** claim the prototype synthetic watchlist is a live government network.
4. ❌ We do **not** call our hash-chain an independent blockchain network unless an external distributed anchor is active.

---

## 👮 Human-in-the-Loop

FIDSS is strictly an **AI Decision-Support System**. 
- The software produces: **Evidence + Spatial Localization + Confidence + Recommendation**
- The authorized human officer provides: **Legal Evaluation + Tactful Investigation + Final Adjudication**

---

## 🚀 Roadmap

```mermaid
gantt
    title FIDSS Development & Evolution Roadmap
    dateFormat  YYYY-MM
    section Phase 1: Foundation
    Core Architecture & React Terminal       :done, p1, 2026-01, 2026-02
    Auth, RBAC & Document Layout Engine      :done, p2, 2026-02, 2026-03
    section Phase 2: Core Screening
    ICAO 9303 7-3-1 Checksum Engine          :done, p3, 2026-03, 2026-04
    OCR ↔ MRZ Cross-Validation               :done, p4, 2026-04, 2026-05
    section Phase 3: Forensics & Biometrics
    ELA & Copy-Move ORB Forensics            :done, p5, 2026-05, 2026-06
    1:1 Face Biometrics & Anti-Spoofing      :done, p6, 2026-06, 2026-07
    section Phase 4: Intelligence & Security
    Evidence Fusion Engine                   :done, p7, 2026-07, 2026-08
    SHA-256 Cryptographic Audit Ledger       :done, p8, 2026-08, 2026-09
    section Phase 5: Production Scale
    External Blockchain Anchoring            :active, p9, 2026-09, 2026-11
    Checkpoint Hardware Scanner Integration  :p10, 2026-11, 2027-01
```

---

## 👥 Team Responsibilities

| Role | Core Responsibilities |
|---|---|
| **Forensics & Vision Lead** | Tampering detection, ELA canvas, Copy-Move ORB/RANSAC, Stamp analysis |
| **Standards & Validation Lead** | ICAO 9303 compliance, 7-3-1 Modulo-10 checksums, OCR ↔ MRZ cross-check |
| **Biometrics Lead** | 1:1 Face verification, SCRFD detection, ArcFace embedding, Anti-spoofing |
| **Backend & Security Lead** | API orchestration, Evidence Fusion, SHA-256 audit ledger, MySQL persistence |
| **Frontend & UX Lead** | Mission-critical terminal UI, evidence bounding box overlays, PDF dossiers |

---

## 🤝 Contribution Guidelines

1. Review [README.md](file:///c:/Users/D%20Manoj%20Reddy/Desktop/Al-Based-Fake-Identity-Document-Screening-System/README.md) and [`docs/PROJECT_CONTEXT.md`](file:///c:/Users/D%20Manoj%20Reddy/Desktop/Al-Based-Fake-Identity-Document-Screening-System/docs/PROJECT_CONTEXT.md) before submitting changes.
2. Maintain clean separation between controllers, services, and domain logic.
3. Never embed document-specific validation rules inside API routes.
4. Add automated test cases for any new MRZ or forensic rule added.
5. Ensure all commits pass existing unit and scenario test suites.

---

## 🏁 Final Takeaway

FIDSS is not just:
> *"AI detects fake documents."*

It is a disciplined forensic workflow:
$$\text{DOCUMENT} \longrightarrow \text{UNDERSTAND} \longrightarrow \text{VALIDATE} \longrightarrow \text{COMPARE} \longrightarrow \text{ANALYZE} \longrightarrow \text{CORRELATE} \longrightarrow \text{EXPLAIN} \longrightarrow \text{AUDIT}$$

By integrating **deterministic document standards**, **computer vision forensics**, **biometric verification**, **explainable evidence fusion**, and **cryptographic auditability**, FIDSS provides a resilient foundation for border security and identity verification operations.

---

## ⭐ Project Metadata

- **Event:** Smart India Hackathon (SIH 2026)
- **Problem Statement ID:** 26188 (SIH26188)
- **Theme:** Blockchain & Cybersecurity
- **Category:** Software
- **Core Motto:** *Verify Evidence. Detect Anomalies. Protect Identity.*

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](file:///c:/Users/D%20Manoj%20Reddy/Desktop/Al-Based-Fake-Identity-Document-Screening-System/LICENSE) file for details.
