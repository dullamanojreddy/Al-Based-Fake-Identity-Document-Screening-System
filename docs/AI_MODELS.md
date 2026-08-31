# SENTINEL-ID AI Models & Forensic Specification

## Model Registry & Traceability
Every AI prediction records the active model version and weights hash for forensic reproducibility in legal and immigration proceedings.

---

## 1. OCR Engine
- **Framework:** Multimodal Vision AI Pipeline (Google Gemini 2.5 Flash Vision + Tesseract OCR fallback)
- **Input:** Document Image (RGB, 300+ DPI recommended)
- **Output:** Normalized visual fields with bounding boxes and per-field confidence scores (0.00 - 1.00).

---

## 2. ICAO Doc 9303 MRZ Engine
- **Algorithm:** Deterministic 7-3-1 Weight Modulo-10 Checksum Algorithm
- **Formats:** TD1 (3 lines x 30 chars), TD2 (2 lines x 36 chars), TD3 (2 lines x 44 chars), MRV-A & MRV-B.
- **Output:** Checksum validation status and VIZ ↔ MRZ parity discrepancies.

---

## 3. Multi-Signal Tampering Forensics Engine
- **Error Level Analysis (ELA):** JPEG compression error variance scaled at factor 20-30x to highlight photo splicing and text overlay.
- **Edge Discontinuity & Noise Residuals:** Analyzes boundary halos around portrait photos.
- **Font Morphology & Baseline Checker:** Detects character scraping, serif discrepancies, and vertical offsets.
- **Stamp & Seal Integrity:** Structural similarity and ink capillary bleed absorption analysis.
- **EXIF Metadata Analyzer:** Detects software markers (Photoshop, GIMP, Canva, CorelDraw, PicsArt).

---

## 4. 1:1 Facial Biometrics & Anti-Spoofing
- **Landmarks:** 68 facial nodal coordinates (interpupillary, nasal bridge, jawline contour).
- **Metric:** Cosine similarity match score (0 - 100%).
- **Calibrated Threshold:** $\ge 80\%$ (Verified Match), $< 50\%$ (Suspect Impersonation).
- **Anti-Spoofing:** Moiré pattern detector (screen replay), specular reflection (printed photos), passive 3D liveness.

---

## 5. Evidence Fusion & Risk Engine
- **Formula:**
  $$\text{Risk Score} = \min\left(100, \sum w_i \cdot \text{Anomaly}_i\right)$$
- **Tiers:**
  - `0 - 25`: **LOW REVIEW PRIORITY** (Automated e-Gate Clearance)
  - `26 - 65`: **REVIEW RECOMMENDED** (Secondary Physical Inspection)
  - `66 - 100`: **ENHANCED REVIEW RECOMMENDED** (Detain & Alert)
