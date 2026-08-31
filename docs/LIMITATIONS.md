# SENTINEL-ID Engineering Limitations & Roadmap

## Transparent Limitations & Edge Cases

---

### 1. Document Lighting & Physical Glare
- **Limitation:** Extreme glare or reflection on physical laminated passport pages can cause localized false positives in Error Level Analysis (ELA) or OCR confidence drops.
- **Mitigation:** The system includes a Document Quality Assessment stage requesting re-capture if specular reflection exceeds 30%.

---

### 2. Micro-Print & Holographic Features
- **Limitation:** Standard flatbed scanners and webcams (without specialized UV/Infrared illumination) cannot capture physical optical variable ink (OVI) or laser-etched holograms.
- **Mitigation:** The platform is designed as an evidence-fusion decision support system, flagging suspicious documents for manual Secondary Physical Inspection with UV lamps.

---

### 3. ePassport Contactless Chip Integration
- **Limitation:** Standard web browser clients cannot directly read NFC smart card chips without external PC/SC reader hardware.
- **Mitigation:** Architecture includes an extensible `EPassportVerificationProvider` interface that reports `CHIP VALIDATION NOT PERFORMED` when hardware is absent, rather than falsifying results.
