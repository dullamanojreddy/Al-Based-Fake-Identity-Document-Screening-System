# SENTINEL-ID Forensic Datasets & Synthetic Generation Pipeline

## Privacy & Synthetic Data Policy
SENTINEL-ID operates under a strict **Zero-Real-PII Policy** during development and demonstration. No real government identity document numbers, real names, or real citizen biometric data are stored or committed to version control.

---

## Synthetic Data Generation Pipeline
To safely test and validate defensive document screening models, the platform uses controlled synthetic generators:
1. **Synthetic Passports & Visas:** Fictional citizen profiles, valid algorithmic ICAO 9303 checksums, and vector guilloche security patterns.
2. **Controlled Manipulations:**
   - **Photo Splicing:** Controlled insertion of alternate portraits with measured boundary gradients and compression discrepancies.
   - **Date of Birth Modification:** Controlled alteration of visual numbers while preserving original MRZ checksums.
   - **Forged Consular Stamps:** Digital rubber stamp cloning simulations without microscopic ink capillary absorption.
   - **EXIF Metadata Injections:** Controlled software header stamping (Photoshop, GIMP, Canva).

---

## 10 Reference Demo Scenarios
1. **Case 01:** Valid Passport (India) - 100% genuine, 4% risk (Low Review Priority)
2. **Case 02:** Expired Passport (US) - Expired validity date, 45% risk (Review Recommended)
3. **Case 03:** Altered DOB (UK) - Visual 1994 vs MRZ 1982, 78% risk (Enhanced Review Recommended)
4. **Case 04:** Altered Passport Number (Australia) - MRZ checksum failure, 74% risk
5. **Case 05:** Photo Replacement (Nepal) - Spliced photo, 92% ELA anomaly, 92% risk
6. **Case 06:** MRZ Mismatch (Germany) - Visual name mismatch against MRZ, 68% risk
7. **Case 07:** Face Mismatch (Canada) - Impersonator face mismatch (22%), 84% risk
8. **Case 08:** Blacklisted Fugitive (Austria) - Interpol Red Notice match, 99% risk (Critical)
9. **Case 09:** Suspicious Visa Stamp (France) - Cloned consular seal, 72% risk
10. **Case 10:** Multiple Combined Anomalies (Brazil) - Spliced photo + altered date + forged stamp, 98% risk
